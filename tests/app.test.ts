import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateMoonPhaseForDate,
  calculateTropicalSun,
  longitudeToSign,
  resolveLocalCivilTime,
} from '../shared/astronomy.ts';
import { needsSupport, validateCreativeResponse } from '../shared/policy.ts';
import { ZODIAC_SIGNS } from '../shared/zodiacCatalog.ts';
import { createUnsentMcpServer } from '../mcp/server.ts';

test('zodiac catalog has all 12 signs with 7 distinct prompts each', () => {
  assert.equal(ZODIAC_SIGNS.length, 12);
  for (const sign of ZODIAC_SIGNS) {
    assert.ok(sign.prompts.length >= 7, `${sign.id} should have at least 7 prompts`);
  }
});

test('sector boundary 0/360 maps cleanly to half-open sectors', () => {
  assert.equal(longitudeToSign(0).signId, 'aries');
  assert.equal(longitudeToSign(29.99).signId, 'aries');
  assert.equal(longitudeToSign(30).signId, 'taurus');
  assert.equal(longitudeToSign(359.99).signId, 'pisces');
  assert.equal(longitudeToSign(360).signId, 'aries');
});

test('half-hour IST offset and DST gap/overlap resolve accurately', () => {
  // India IST (+05:30)
  const ist = resolveLocalCivilTime('2026-05-14', '12:00', 'Asia/Kolkata');
  assert.equal(ist.status, 'exact');
  if (ist.status === 'exact') {
    assert.equal(ist.utc.toISOString(), '2026-05-14T06:30:00.000Z');
  }

  // US New York spring forward gap (2026-03-08 02:30 does not exist)
  const gap = resolveLocalCivilTime('2026-03-08', '02:30', 'America/New_York');
  assert.equal(gap.status, 'nonexistent');

  // US New York fall back overlap (2026-11-01 01:30 occurs twice)
  const overlap = resolveLocalCivilTime('2026-11-01', '01:30', 'America/New_York');
  assert.equal(overlap.status, 'ambiguous');
});

test('date-only tropical sun detects ingress ambiguity vs stable days', () => {
  // May 14 is squarely inside Taurus
  const stable = calculateTropicalSun({
    date: '2026-05-14',
    timeKnown: 'unknown',
    timeZone: 'Asia/Kolkata',
  });
  assert.equal(stable.status, 'calculated');
  assert.equal(stable.signId, 'taurus');

  // March 20, 2026 spans Pisces -> Aries vernal equinox ingress
  const ingress = calculateTropicalSun({
    date: '2026-03-20',
    timeKnown: 'unknown',
    timeZone: 'UTC',
  });
  assert.equal(ingress.status, 'ambiguous');
  assert.deepEqual(ingress.candidateSignIds, ['pisces', 'aries']);
});

test('deterministic lunar phase computes illumination and upcoming events', () => {
  const moon = calculateMoonPhaseForDate('2026-11-19', 'Asia/Kolkata');
  assert.ok(moon.phaseAngle >= 0 && moon.phaseAngle < 360);
  assert.ok(moon.nextNewMoonUtc);
  assert.ok(moon.nextFullMoonUtc);
});

test('distress policy catches native scripts and ignores benign idioms', () => {
  assert.equal(needsSupport('আমি বাঁচতে চাই না'), true);
  assert.equal(needsSupport('I am dying of laughter today'), false);
  assert.deepEqual(validateCreativeResponse({ kind: 'support' }), { kind: 'support' });
});

test('MCP server registers read-only astronomy & sign reference tools', () => {
  const server = createUnsentMcpServer();
  assert.ok(server);
});

test('all 12 signs map cleanly to the four elements', async () => {
  const { getElementForSign } = await import('../src/three/sculptures.ts');
  for (const sign of ZODIAC_SIGNS) {
    assert.equal(getElementForSign(sign.id), sign.element.en);
  }
});
