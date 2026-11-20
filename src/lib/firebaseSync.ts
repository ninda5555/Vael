import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, type Auth, type User } from 'firebase/auth';
import {
  Bytes,
  deleteDoc,
  doc,
  getFirestore,
  runTransaction,
  serverTimestamp,
  type Firestore,
} from 'firebase/firestore';
import { base64ToBytes, bytesToBase64, sealPayload } from './crypto.ts';
import type { VaultItem } from './vaultDb.ts';

export interface CloudConnection {
  configured: boolean;
  app?: FirebaseApp;
  auth?: Auth;
  db?: Firestore;
}

let cachedConnection: CloudConnection | null = null;

export function getCloudConnection(): CloudConnection {
  if (cachedConnection) return cachedConnection;

  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
  const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN;
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
  const appId = import.meta.env.VITE_FIREBASE_APP_ID;

  if (!apiKey || !projectId || !appId) {
    cachedConnection = { configured: false };
    return cachedConnection;
  }

  try {
    const app = initializeApp({ apiKey, authDomain, projectId, appId });
    const auth = getAuth(app);
    const db = getFirestore(app);
    cachedConnection = { configured: true, app, auth, db };
    return cachedConnection;
  } catch {
    cachedConnection = { configured: false };
    return cachedConnection;
  }
}

export async function signInWithGoogle(): Promise<User> {
  const conn = getCloudConnection();
  if (!conn.configured || !conn.auth) {
    throw new Error('Firebase web configuration is not set in environment variables.');
  }
  const result = await signInWithPopup(conn.auth, new GoogleAuthProvider());
  return result.user;
}

export async function signOutCloud(): Promise<void> {
  const conn = getCloudConnection();
  if (conn.auth) {
    await signOut(conn.auth);
  }
}

export async function backupItemToCloud(key: CryptoKey, uid: string, item: VaultItem): Promise<void> {
  const conn = getCloudConnection();
  if (!conn.configured || !conn.db) {
    throw new Error('Cloud backup requires Firebase configuration.');
  }
  const envelope = await sealPayload(key, uid, item.id, item);
  const ref = doc(conn.db, 'users', uid, 'letters', item.id);
  await runTransaction(conn.db, async (tx) => {
    const existing = await tx.get(ref);
    if (existing.exists()) {
      return;
    }
    tx.set(ref, {
      v: 1,
      iv: Bytes.fromUint8Array(envelope.iv),
      cipher: Bytes.fromUint8Array(envelope.cipher),
      createdAt: serverTimestamp(),
    });
  });
}

export async function deleteCloudItem(uid: string, itemId: string): Promise<void> {
  const conn = getCloudConnection();
  if (!conn.configured || !conn.db) return;
  await deleteDoc(doc(conn.db, 'users', uid, 'letters', itemId));
}

export function envelopeDebugSummary(iv: Uint8Array, cipher: Uint8Array) {
  return {
    ivLength: iv.byteLength,
    cipherLength: cipher.byteLength,
    ivPreview: bytesToBase64(iv).slice(0, 8),
    roundtripOk: base64ToBytes(bytesToBase64(iv)).byteLength === 12,
  };
}
