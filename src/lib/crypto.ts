const utf8 = new TextEncoder();
const decoder = new TextDecoder();

const context = (vaultId: string, id: string) => utf8.encode(JSON.stringify(['unsent', 1, vaultId, id]));

export interface SealedEnvelope {
  v: 1;
  iv: Uint8Array;
  cipher: Uint8Array;
}

export function createRecoveryKey(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return btoa(String.fromCharCode(...bytes))
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replace(/=+$/, '');
}

export async function unlockRecoveryKey(code: string): Promise<CryptoKey> {
  if (typeof code !== 'string' || !/^[A-Za-z0-9_-]{43}$/.test(code.trim())) {
    throw new Error('Invalid recovery key format (expected 43-character code)');
  }
  const normalized = code.trim().replaceAll('-', '+').replaceAll('_', '/') + '=';
  const bytes = Uint8Array.from(atob(normalized), (c) => c.charCodeAt(0));
  return crypto.subtle.importKey('raw', bytes, 'AES-GCM', false, ['encrypt', 'decrypt']);
}

export async function generateVaultKey(): Promise<CryptoKey> {
  return crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);
}

export async function exportRawKeyBase64Url(key: CryptoKey): Promise<string> {
  const raw = new Uint8Array(await crypto.subtle.exportKey('raw', key));
  return btoa(String.fromCharCode(...raw))
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replace(/=+$/, '');
}

export async function derivePassphraseKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const baseKey = await crypto.subtle.importKey('raw', utf8.encode(passphrase), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as unknown as BufferSource,
      iterations: 250_000,
      hash: 'SHA-256',
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function sealPayload<T>(key: CryptoKey, vaultId: string, id: string, data: T): Promise<SealedEnvelope> {
  const plaintext = utf8.encode(JSON.stringify(data));
  if (plaintext.byteLength > 262_128) {
    throw new Error('Item exceeds the 256 KB encrypted envelope limit');
  }
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const cipher = new Uint8Array(
    await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: iv as unknown as BufferSource, additionalData: context(vaultId, id) },
      key,
      plaintext
    )
  );
  return { v: 1, iv, cipher };
}

export async function openPayload<T>(key: CryptoKey, vaultId: string, id: string, envelope: SealedEnvelope): Promise<T> {
  if (envelope.v !== 1) throw new Error('Unsupported envelope version');
  const plaintext = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: envelope.iv as unknown as BufferSource,
      additionalData: context(vaultId, id),
    },
    key,
    envelope.cipher as unknown as BufferSource
  );
  return JSON.parse(decoder.decode(plaintext)) as T;
}

export function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

export function base64ToBytes(b64: string): Uint8Array {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}
