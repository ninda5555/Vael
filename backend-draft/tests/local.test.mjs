import test from 'node:test';
import assert from 'node:assert/strict';
import {createRecoveryKey, unlockRecoveryKey, seal, openLetter} from '../client/encryption.mjs';
import {validRequest, needsSupport, interpretResponse} from '../functions/policy.mjs';

const letter = {recipient:'আমার ভবিষ্যৎ', text:'আজ একটু সাহস পেলাম। कल फिर लिखूँगा।', paper:'moonlit'};
const key = await unlockRecoveryKey(createRecoveryKey());
test('encrypt and reopen without storing recipient or text in metadata', async () => {
  const a = await seal(key, 'a', 'id', letter);
  assert.deepEqual(Object.keys(a), ['v','iv','cipher']);
  assert.deepEqual(await openLetter(key, 'a', 'id', a), letter);
  assert.notDeepEqual((await seal(key, 'a', 'id', letter)).iv, a.iv);
});
test('restore with copied key on another device', async () => {
  const code = createRecoveryKey();
  const a = await seal(await unlockRecoveryKey(code), 'a', 'id', letter);
  assert.deepEqual(await openLetter(await unlockRecoveryKey(code), 'a', 'id', a), letter);
});
test('reject different owner, swapped letter, wrong key and changed ciphertext', async () => {
  const a = await seal(key, 'a', 'id', letter);
  for (const [who,id,k] of [['b','id',key],['a','other',key],['a','id',await unlockRecoveryKey(createRecoveryKey())]])
    await assert.rejects(openLetter(k,who,id,a));
  a.cipher[0] ^= 1;
  await assert.rejects(openLetter(key,'a','id',a));
});
test('reject bad key format, unsupported envelope and oversized backup', async () => {
  await assert.rejects(unlockRecoveryKey('1234'));
  await assert.rejects(openLetter(key,'a','id',{v:2}));
  await assert.rejects(seal(key,'a','id','x'.repeat(262129)));
});
const req = {text:'I miss home.', consent:true, mode:'poem', language:'en'};
test('require explicit consent, allowed options and bounded input', () => {
  assert.ok(validRequest(req));
  for (const change of [{consent:false},{text:'  '},{text:'x'.repeat(6001)},{uid:'b'},{mode:'other'},{language:'none'}])
    assert.ok(!validRequest({...req,...change}));
});
test('recognize sample support signals in each language', () => {
  for (const s of ['I want to die','আমি বাঁচতে চাই না','मैं जीना नहीं चाहता','mujhe jeena nahi hai']) assert.ok(needsSupport(s));
  assert.equal(needsSupport(req.text),false);
});
const answer = data => ({candidates:[{finishReason:'STOP',content:{parts:[{text:JSON.stringify(data)}]}}]});
test('blocked provider and sensitive output return only the support state', () => {
  for (const input of [{promptFeedback:{blockReason:'SAFETY'}},answer({kind:'support', text:'hidden'}),answer({kind:'creative',text:'want to die'})])
    assert.deepEqual(interpretResponse(input),{kind:'support'});
});
test('malformed output is rejected and a normal reflection is returned', () => {
  const ok = {kind:'creative', text:'Home feels close tonight.'};
  assert.deepEqual(interpretResponse(answer(ok)),ok);
  for (const input of [{}, answer({kind:'other'}), answer({kind:'creative',text:''})]) assert.throws(()=>interpretResponse(input));
});
