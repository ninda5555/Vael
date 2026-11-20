const utf8 = new TextEncoder();
const context = (uid, id) => utf8.encode(JSON.stringify(['unsent', 1, uid, id]));

export function createRecoveryKey() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return btoa(String.fromCharCode(...bytes)).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '');
}

export async function unlockRecoveryKey(code) {
  if (typeof code !== 'string' || !/^[A-Za-z0-9_-]{43}$/.test(code)) throw new Error('Invalid recovery key');
  const bytes = Uint8Array.from(atob(code.replaceAll('-', '+').replaceAll('_', '/') + '='), c => c.charCodeAt(0));
  return crypto.subtle.importKey('raw', bytes, 'AES-GCM', false, ['encrypt', 'decrypt']);
}

export async function seal(key, uid, id, letter) {
  const plaintext = utf8.encode(JSON.stringify(letter));
  if (plaintext.byteLength > 262128) throw new Error('Letter exceeds the backup size limit');
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const algorithm = {name: 'AES-GCM', iv, additionalData: context(uid, id)};
  const cipher = new Uint8Array(await crypto.subtle.encrypt(algorithm, key, plaintext));
  return { v: 1, iv, cipher };
}

export async function openLetter(key, uid, id, record) {
  if (record.v !== 1) throw new Error('Unsupported envelope');
  const algorithm = {name: 'AES-GCM', iv: record.iv, additionalData: context(uid, id)};
  const plaintext = await crypto.subtle.decrypt(algorithm, key, record.cipher);
  return JSON.parse(new TextDecoder().decode(plaintext));
}
