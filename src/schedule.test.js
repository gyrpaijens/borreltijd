import test from 'node:test';
import assert from 'node:assert/strict';
import { getBorrelState } from './schedule.js';

// Handige helper: Amsterdamse wandkloktijd → UTC (zomer = UTC+2, winter = UTC+1)
const utc = (iso) => Date.parse(iso);

test('woensdag: telt af naar donderdag 16:30 (winter, UTC+1)', () => {
  const s = getBorrelState(utc('2026-11-18T09:00:00Z')); // wo 10:00 NL
  assert.equal(s.phase, 'pre');
  assert.equal(s.events.party_ms, utc('2026-11-19T15:30:00Z'));
});

test('donderdag vóór 14:00: pre, vandaag 16:30', () => {
  const s = getBorrelState(utc('2026-11-19T11:00:00Z')); // 12:00 NL
  assert.equal(s.phase, 'pre');
  assert.equal(s.events.party_ms, utc('2026-11-19T15:30:00Z'));
});

test('donderdag fases: snacks → airfryer → party', () => {
  assert.equal(getBorrelState(utc('2026-11-19T13:00:00Z')).phase, 'snacks'); // 14:00 NL
  assert.equal(getBorrelState(utc('2026-11-19T15:20:00Z')).phase, 'airfryer'); // 16:20 NL
  assert.equal(getBorrelState(utc('2026-11-19T15:30:00Z')).phase, 'party'); // 16:30 NL
  assert.equal(getBorrelState(utc('2026-11-19T16:59:59Z')).phase, 'party'); // 17:59:59 NL
});

test('de borrel blijft live tot 18:00 (bleef eerder stilzwijgend overgeslagen)', () => {
  const s = getBorrelState(utc('2026-11-19T16:00:00Z')); // 17:00 NL
  assert.equal(s.phase, 'party');
  assert.equal(s.events.party_ms, utc('2026-11-19T15:30:00Z'));
});

test('donderdag na 18:00: "after" tot middernacht, teller wijst naar volgende donderdag', () => {
  const s = getBorrelState(utc('2026-11-19T17:00:00Z')); // 18:00 NL
  assert.equal(s.phase, 'after');
  assert.equal(s.events.party_ms, utc('2026-11-26T15:30:00Z'));
  assert.equal(getBorrelState(utc('2026-11-19T22:59:59Z')).phase, 'after'); // 23:59:59 NL
});

test('vrijdag: gewoon aftellen naar volgende donderdag', () => {
  const s = getBorrelState(utc('2026-11-19T23:00:00Z')); // vr 00:00 NL
  assert.equal(s.phase, 'pre');
  assert.equal(s.events.party_ms, utc('2026-11-26T15:30:00Z'));
});

test('zomertijd (UTC+2): donderdag 16:30 NL = 14:30 UTC', () => {
  const s = getBorrelState(utc('2026-07-01T10:00:00Z')); // wo
  assert.equal(s.events.party_ms, utc('2026-07-02T14:30:00Z'));
});

test('overgang naar wintertijd (zo 25 okt 2026): donderdag erna klopt', () => {
  const s = getBorrelState(utc('2026-10-22T20:00:00Z')); // do 22 okt 22:00 NL (nog zomertijd) → na feest
  assert.equal(s.phase, 'after');
  assert.equal(s.events.party_ms, utc('2026-10-29T15:30:00Z')); // 16:30 NL = UTC+1
});

test('overgang naar zomertijd (zo 29 mrt 2026)', () => {
  const s = getBorrelState(utc('2026-03-26T20:00:00Z')); // do 26 mrt 21:00 NL → na feest
  assert.equal(s.phase, 'after');
  assert.equal(s.events.party_ms, utc('2026-04-02T14:30:00Z')); // 16:30 NL = UTC+2
});

test('jaarwisseling', () => {
  const s = getBorrelState(utc('2026-12-31T12:00:00Z')); // do 31 dec 13:00 NL
  assert.equal(s.phase, 'pre');
  assert.equal(s.events.party_ms, utc('2026-12-31T15:30:00Z'));
  const next = getBorrelState(utc('2026-12-31T18:00:00Z'));
  assert.equal(next.events.party_ms, utc('2027-01-07T15:30:00Z'));
});
