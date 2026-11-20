import type { AlmanacCheckIn, FeelingCardRecord, LetterRecord, UserPreferences } from '../../shared/types.ts';
import {
  base64ToBytes,
  bytesToBase64,
  createRecoveryKey,
  derivePassphraseKey,
  openPayload,
  sealPayload,
  unlockRecoveryKey,
} from './crypto.ts';

export type VaultItem = LetterRecord | FeelingCardRecord;

interface StoredEncryptedRecord {
  id: string;
  vaultId: string;
  v: 1;
  iv: string;
  cipher: string;
  updatedAt: string;
}

interface VaultKeyConfig {
  id: string;
  mode: 'device' | 'passphrase';
  salt?: string;
  wrappedRecoveryKey?: { iv: string; cipher: string };
  deviceRecoveryKey?: string; // stored only when passphrase lock is OFF for frictionless first-minute journaling
  verifier?: { iv: string; cipher: string };
}

const DB_NAME = 'unsent-vault-v1';
const DB_VERSION = 1;
const STORE_ITEMS = 'items';
const STORE_CHECKINS = 'checkins';
const STORE_META = 'meta';

// In-memory fallback when IndexedDB is restricted
const memoryItems = new Map<string, StoredEncryptedRecord>();
const memoryCheckIns = new Map<string, StoredEncryptedRecord>();
const memoryMeta = new Map<string, unknown>();

function openDb(): Promise<IDBDatabase | null> {
  if (typeof indexedDB === 'undefined') return Promise.resolve(null);
  return new Promise((resolve) => {
    try {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(STORE_ITEMS)) db.createObjectStore(STORE_ITEMS, { keyPath: 'id' });
        if (!db.objectStoreNames.contains(STORE_CHECKINS)) db.createObjectStore(STORE_CHECKINS, { keyPath: 'id' });
        if (!db.objectStoreNames.contains(STORE_META)) db.createObjectStore(STORE_META, { keyPath: 'id' });
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

async function idbGet<T>(storeName: string, key: string): Promise<T | undefined> {
  const db = await openDb();
  if (!db) {
    if (storeName === STORE_ITEMS) return memoryItems.get(key) as T | undefined;
    if (storeName === STORE_CHECKINS) return memoryCheckIns.get(key) as T | undefined;
    return memoryMeta.get(key) as T | undefined;
  }
  return new Promise((resolve) => {
    const tx = db.transaction(storeName, 'readonly');
    const req = tx.objectStore(storeName).get(key);
    req.onsuccess = () => resolve(req.result as T | undefined);
    req.onerror = () => resolve(undefined);
  });
}

async function idbPut<T extends { id: string }>(storeName: string, value: T): Promise<boolean> {
  const db = await openDb();
  if (!db) {
    if (storeName === STORE_ITEMS) memoryItems.set(value.id, value as unknown as StoredEncryptedRecord);
    else if (storeName === STORE_CHECKINS) memoryCheckIns.set(value.id, value as unknown as StoredEncryptedRecord);
    else memoryMeta.set(value.id, value);
    return false;
  }
  return new Promise((resolve) => {
    const tx = db.transaction(storeName, 'readwrite');
    tx.objectStore(storeName).put(value);
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => resolve(false);
  });
}

async function idbDelete(storeName: string, key: string): Promise<void> {
  const db = await openDb();
  if (!db) {
    if (storeName === STORE_ITEMS) memoryItems.delete(key);
    else if (storeName === STORE_CHECKINS) memoryCheckIns.delete(key);
    else memoryMeta.delete(key);
    return;
  }
  await new Promise<void>((resolve) => {
    const tx = db.transaction(storeName, 'readwrite');
    tx.objectStore(storeName).delete(key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => resolve();
  });
}

async function idbGetAll<T>(storeName: string): Promise<T[]> {
  const db = await openDb();
  if (!db) {
    if (storeName === STORE_ITEMS) return Array.from(memoryItems.values()) as unknown as T[];
    if (storeName === STORE_CHECKINS) return Array.from(memoryCheckIns.values()) as unknown as T[];
    return Array.from(memoryMeta.values()) as unknown as T[];
  }
  return new Promise((resolve) => {
    const tx = db.transaction(storeName, 'readonly');
    const req = tx.objectStore(storeName).getAll();
    req.onsuccess = () => resolve((req.result as T[]) || []);
    req.onerror = () => resolve([]);
  });
}

export async function getVaultStatus(vaultId = 'local'): Promise<{
  initialized: boolean;
  locked: boolean;
  mode: 'device' | 'passphrase';
}> {
  const cfg = await idbGet<VaultKeyConfig>(STORE_META, `keycfg:${vaultId}`);
  if (!cfg) return { initialized: false, locked: false, mode: 'device' };
  return {
    initialized: true,
    locked: cfg.mode === 'passphrase',
    mode: cfg.mode,
  };
}

export async function initializeOrLoadDeviceVault(vaultId = 'local'): Promise<{
  key: CryptoKey;
  recoveryCode: string;
  requiresPassphrase: boolean;
}> {
  const existing = await idbGet<VaultKeyConfig>(STORE_META, `keycfg:${vaultId}`);
  if (existing) {
    if (existing.mode === 'passphrase' || !existing.deviceRecoveryKey) {
      throw new Error('VAULT_LOCKED');
    }
    const key = await unlockRecoveryKey(existing.deviceRecoveryKey);
    return { key, recoveryCode: existing.deviceRecoveryKey, requiresPassphrase: false };
  }

  const recoveryCode = createRecoveryKey();
  const key = await unlockRecoveryKey(recoveryCode);
  await idbPut<VaultKeyConfig>(STORE_META, {
    id: `keycfg:${vaultId}`,
    mode: 'device',
    deviceRecoveryKey: recoveryCode,
  });
  return { key, recoveryCode, requiresPassphrase: false };
}

export async function enablePassphraseLock(
  vaultId: string,
  recoveryCode: string,
  passphrase: string
): Promise<void> {
  if (passphrase.length < 6) {
    throw new Error('Choose a passphrase of at least 6 characters.');
  }
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const wrappingKey = await derivePassphraseKey(passphrase, salt);
  const wrapped = await sealPayload(wrappingKey, vaultId, 'recovery-wrap', { recoveryCode });
  const verifier = await sealPayload(wrappingKey, vaultId, 'verifier', { ok: true });

  await idbPut<VaultKeyConfig>(STORE_META, {
    id: `keycfg:${vaultId}`,
    mode: 'passphrase',
    salt: bytesToBase64(salt),
    wrappedRecoveryKey: {
      iv: bytesToBase64(wrapped.iv),
      cipher: bytesToBase64(wrapped.cipher),
    },
    verifier: {
      iv: bytesToBase64(verifier.iv),
      cipher: bytesToBase64(verifier.cipher),
    },
  });
}

export async function unlockVaultWithPassphrase(
  vaultId: string,
  passphrase: string
): Promise<{ key: CryptoKey; recoveryCode: string }> {
  const cfg = await idbGet<VaultKeyConfig>(STORE_META, `keycfg:${vaultId}`);
  if (!cfg || cfg.mode !== 'passphrase' || !cfg.salt || !cfg.wrappedRecoveryKey) {
    throw new Error('Passphrase lock is not configured.');
  }
  const salt = base64ToBytes(cfg.salt);
  const wrappingKey = await derivePassphraseKey(passphrase, salt);
  const unwrapped = await openPayload<{ recoveryCode: string }>(wrappingKey, vaultId, 'recovery-wrap', {
    v: 1,
    iv: base64ToBytes(cfg.wrappedRecoveryKey.iv),
    cipher: base64ToBytes(cfg.wrappedRecoveryKey.cipher),
  });
  const key = await unlockRecoveryKey(unwrapped.recoveryCode);
  return { key, recoveryCode: unwrapped.recoveryCode };
}

export async function disablePassphraseLock(vaultId: string, recoveryCode: string): Promise<void> {
  await idbPut<VaultKeyConfig>(STORE_META, {
    id: `keycfg:${vaultId}`,
    mode: 'device',
    deviceRecoveryKey: recoveryCode,
  });
}

export async function saveEncryptedItem(key: CryptoKey, vaultId: string, item: VaultItem): Promise<boolean> {
  const envelope = await sealPayload(key, vaultId, item.id, item);
  return idbPut<StoredEncryptedRecord>(STORE_ITEMS, {
    id: `${vaultId}:${item.id}`,
    vaultId,
    v: 1,
    iv: bytesToBase64(envelope.iv),
    cipher: bytesToBase64(envelope.cipher),
    updatedAt: item.updatedAt,
  });
}

export async function loadAllEncryptedItems(key: CryptoKey, vaultId: string): Promise<VaultItem[]> {
  const rows = await idbGetAll<StoredEncryptedRecord>(STORE_ITEMS);
  const mine = rows.filter((r) => r.vaultId === vaultId);
  const result: VaultItem[] = [];
  for (const row of mine) {
    try {
      const itemId = row.id.startsWith(`${vaultId}:`) ? row.id.slice(vaultId.length + 1) : row.id;
      const decoded = await openPayload<VaultItem>(key, vaultId, itemId, {
        v: row.v,
        iv: base64ToBytes(row.iv),
        cipher: base64ToBytes(row.cipher),
      });
      result.push(decoded);
    } catch {
      // Skip corrupted or mismatched records without crashing the box
    }
  }
  return result.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function deleteEncryptedItem(vaultId: string, itemId: string): Promise<void> {
  await idbDelete(STORE_ITEMS, `${vaultId}:${itemId}`);
}

export async function saveEncryptedCheckIn(key: CryptoKey, vaultId: string, checkIn: AlmanacCheckIn): Promise<void> {
  const envelope = await sealPayload(key, vaultId, `checkin:${checkIn.date}`, checkIn);
  await idbPut<StoredEncryptedRecord>(STORE_CHECKINS, {
    id: `${vaultId}:${checkIn.date}`,
    vaultId,
    v: 1,
    iv: bytesToBase64(envelope.iv),
    cipher: bytesToBase64(envelope.cipher),
    updatedAt: checkIn.updatedAt,
  });
}

export async function loadAllCheckIns(key: CryptoKey, vaultId: string): Promise<AlmanacCheckIn[]> {
  const rows = await idbGetAll<StoredEncryptedRecord>(STORE_CHECKINS);
  const mine = rows.filter((r) => r.vaultId === vaultId);
  const result: AlmanacCheckIn[] = [];
  for (const row of mine) {
    try {
      const dateStr = row.id.startsWith(`${vaultId}:`) ? row.id.slice(vaultId.length + 1) : row.id;
      const decoded = await openPayload<AlmanacCheckIn>(key, vaultId, `checkin:${dateStr}`, {
        v: row.v,
        iv: base64ToBytes(row.iv),
        cipher: base64ToBytes(row.cipher),
      });
      result.push(decoded);
    } catch {
      // ignore invalid
    }
  }
  return result.sort((a, b) => b.date.localeCompare(a.date));
}

export async function savePreferences(prefs: UserPreferences): Promise<void> {
  await idbPut(STORE_META, { id: 'prefs', value: prefs });
}

export async function loadPreferences(): Promise<UserPreferences | null> {
  const rec = await idbGet<{ id: string; value: UserPreferences }>(STORE_META, 'prefs');
  return rec?.value ?? null;
}

export async function eraseAllLocalVaultData(): Promise<void> {
  memoryItems.clear();
  memoryCheckIns.clear();
  memoryMeta.clear();
  const db = await openDb();
  if (!db) return;
  db.close();
  await new Promise<void>((resolve) => {
    const req = indexedDB.deleteDatabase(DB_NAME);
    req.onsuccess = () => resolve();
    req.onerror = () => resolve();
    req.onblocked = () => resolve();
  });
}

export async function exportEncryptedPortableBackup(
  key: CryptoKey,
  vaultId: string,
  items: VaultItem[],
  checkIns: AlmanacCheckIn[]
): Promise<string> {
  const payload = {
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    items,
    checkIns,
  };
  const envelope = await sealPayload(key, vaultId, 'portable-backup', payload);
  return JSON.stringify(
    {
      format: 'unsent-encrypted-backup-v1',
      vaultId,
      v: envelope.v,
      iv: bytesToBase64(envelope.iv),
      cipher: bytesToBase64(envelope.cipher),
    },
    null,
    2
  );
}

export async function importEncryptedPortableBackup(
  recoveryCode: string,
  jsonText: string
): Promise<{ items: VaultItem[]; checkIns: AlmanacCheckIn[] }> {
  const parsed = JSON.parse(jsonText) as {
    format?: string;
    vaultId?: string;
    v?: 1;
    iv?: string;
    cipher?: string;
  };
  if (parsed.format !== 'unsent-encrypted-backup-v1' || !parsed.iv || !parsed.cipher) {
    throw new Error('Unrecognized backup file format.');
  }
  const key = await unlockRecoveryKey(recoveryCode);
  const vaultId = parsed.vaultId || 'local';
  const payload = await openPayload<{ items: VaultItem[]; checkIns: AlmanacCheckIn[] }>(
    key,
    vaultId,
    'portable-backup',
    {
      v: 1,
      iv: base64ToBytes(parsed.iv),
      cipher: base64ToBytes(parsed.cipher),
    }
  );
  return {
    items: Array.isArray(payload.items) ? payload.items : [],
    checkIns: Array.isArray(payload.checkIns) ? payload.checkIns : [],
  };
}
