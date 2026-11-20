// Call only after the writer opts in. Keep keys and decrypted records in memory.
import { initializeApp } from 'firebase/app';
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from 'firebase/app-check';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { Bytes, collection, deleteDoc, doc, documentId, getDocFromServer, getDocsFromServer,
  initializeFirestore, limit, memoryLocalCache, orderBy, query, runTransaction, serverTimestamp, startAfter } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { openLetter, seal } from './encryption.mjs';

export function connectCloud(firebaseConfig, enterpriseSiteKey, region = 'asia-south1') {
  const app = initializeApp(firebaseConfig);
  initializeAppCheck(app, {provider: new ReCaptchaEnterpriseProvider(enterpriseSiteKey), isTokenAutoRefreshEnabled: true});
  const auth = getAuth(app);
  const db = initializeFirestore(app, {localCache: memoryLocalCache()});
  const functions = getFunctions(app, region);
  return {
    auth,
    signIn: () => signInWithPopup(auth, new GoogleAuthProvider()),
    async backUp(key, id, letter) {
      const uid = requireUid(auth);
      const ref = doc(db, 'users', uid, 'letters', id);
      const envelope = await seal(key, uid, id, letter);
      await runTransaction(db, async tx => {
        const previous = await tx.get(ref);
        if (previous.exists()) {
          const saved = await decode(key, uid, previous);
          if (JSON.stringify(saved) !== JSON.stringify(letter)) throw new Error('This sealed letter already has another version');
          return;
        }
        tx.set(ref, {v: 1, iv: Bytes.fromUint8Array(envelope.iv), cipher: Bytes.fromUint8Array(envelope.cipher), createdAt: serverTimestamp()});
      });
    },
    async page(after) {
      const ref = collection(db, 'users', requireUid(auth), 'letters');
      const constraints = [orderBy('createdAt', 'desc'), orderBy(documentId(), 'desc')];
      if (after) constraints.push(startAfter(after));
      const result = await getDocsFromServer(query(ref, ...constraints, limit(25)));
      return {rows: result.docs.map(d => ({id: d.id, createdAt: d.get('createdAt').toMillis()})), cursor: result.docs.at(-1)};
    },
    async read(key, id) {
      const uid = requireUid(auth);
      const snap = await getDocFromServer(doc(db, 'users', uid, 'letters', id));
      return snap.exists() ? decode(key, uid, snap) : null;
    },
    remove: id => deleteDoc(doc(db, 'users', requireUid(auth), 'letters', id)),
    reflect: async input => (await httpsCallable(functions, 'reflect')(input)).data,
    eraseAccount: async () => (await httpsCallable(functions, 'eraseAccount')({})).data
  };
}

function requireUid(auth) {
  if (!auth.currentUser) throw new Error('Sign in to use cloud backup');
  return auth.currentUser.uid;
}

function decode(key, uid, snap) {
  const record = snap.data();
  return openLetter(key, uid, snap.id, {v: record.v, iv: record.iv.toUint8Array(), cipher: record.cipher.toUint8Array()});
}
