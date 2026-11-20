import {before, after, beforeEach, test} from 'node:test';
import {readFile} from 'node:fs/promises';
import {initializeTestEnvironment, assertSucceeds, assertFails} from '@firebase/rules-unit-testing';
import {Bytes, doc, getDoc, setDoc, deleteDoc, collection, getDocs, limit, query, serverTimestamp} from 'firebase/firestore';

let env;
before(async () => { env = await initializeTestEnvironment({projectId:'demo-unsent',firestore:{rules:await readFile('firestore.rules','utf8')}}); });
beforeEach(async () => env.clearFirestore());
after(async () => env?.cleanup());
const path = 'users/alice/letters/095b8111-64f5-4734-b279-37787c4ca014';
const letters = 'users/alice/letters';
const db = name => name ? env.authenticatedContext(name).firestore() : env.unauthenticatedContext().firestore();
const record = () => ({v:1, cipher:Bytes.fromUint8Array(new Uint8Array(32)), iv:Bytes.fromUint8Array(new Uint8Array(12)), createdAt:serverTimestamp()});

test('owner can create, read, page and delete an immutable sealed letter', async () => {
  const alice = db('alice'), ref = doc(alice,path);
  await assertSucceeds(setDoc(ref,record()));
  await assertSucceeds(getDoc(ref));
  await assertSucceeds(getDocs(query(collection(alice,letters),limit(25))));
  await assertFails(getDocs(collection(alice,letters)));
  await assertFails(setDoc(ref,record()));
  await assertSucceeds(deleteDoc(ref));
});
test('guests and a second account cannot create, read, list or delete', async () => {
  const alice = db('alice');
  await setDoc(doc(alice,path),record());
  for (const who of [null,'bob']) {
    const other = db(who);
    await assertFails(setDoc(doc(other,path.replace('014','015')),record()));
    await assertFails(getDoc(doc(other,path)));
    await assertFails(getDocs(query(collection(other,letters),limit(1))));
    await assertFails(deleteDoc(doc(other,path)));
  }
});
test('wrong field, payload, timestamp and document ID are denied', async () => {
  const alice = db('alice');
  for (const changes of [{text:'letter'},{v:2},{iv:'bad'},{createdAt:new Date(0)},{cipher:Bytes.fromUint8Array(new Uint8Array(262145))}])
    await assertFails(setDoc(doc(alice,path),{...record(),...changes}));
  await assertFails(setDoc(doc(alice,letters+'/wrong-id'),record()));
});
test('closed account loses access and cannot reset the marker or quotas', async () => {
  const alice = db('alice');
  await setDoc(doc(alice,path),record());
  await env.withSecurityRulesDisabled(async ctx => setDoc(doc(ctx.firestore(),'closed/alice'),{pending:true}));
  await assertFails(getDoc(doc(alice,path)));
  await assertFails(setDoc(doc(alice,path.replace('014','015')),record()));
  await assertFails(deleteDoc(doc(alice,'closed/alice')));
  await assertFails(setDoc(doc(alice,'users/alice/usage/today'),{count:0}));
});
