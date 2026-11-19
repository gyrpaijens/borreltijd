import test from 'node:test';
import assert from 'node:assert/strict';
import { placePeople } from './peopleLayout.js';

const people = (n) => Array.from({ length: n }, (_, i) => ({ face: i + 1 }));
const close = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} ≠ ${b}`);

test('15 poppetjes: exact dezelfde plekken als in het origineel', () => {
  const placed = placePeople(people(15));
  placed.forEach(({ slot }, t) => {
    if (t % 2 === 0) {
      const i = t / 2; // voorste rij, 8 stuks
      close(slot.pos[0], -3.01 + i * 0.86);
      assert.deepEqual([slot.pos[1], slot.pos[2]], [0.3, -0.95]);
      close(slot.rotY, (3.5 - i) * 0.055);
    } else {
      const i = (t - 1) / 2; // achterste rij, 7 stuks
      close(slot.pos[0], -2.52 + i * 0.84);
      assert.deepEqual([slot.pos[1], slot.pos[2]], [0.6, -2]);
      close(slot.rotY, (3 - i) * 0.05);
    }
  });
});

test('17 poppetjes: 9 voor + 8 achter, alles binnen de verhoging (±3,7)', () => {
  const placed = placePeople(people(17));
  assert.equal(placed.filter((x) => x.slot.pos[2] === -0.95).length, 9);
  assert.equal(placed.filter((x) => x.slot.pos[2] === -2).length, 8);
  const xs = placed.map((x) => x.slot.pos[0]);
  assert.ok(xs.every((x) => Math.abs(x) <= 3.01 + 1e-9));
  // geen twee poppetjes in dezelfde rij dichter dan 0,7 bij elkaar
  for (const z of [-0.95, -2]) {
    const row = placed.filter((x) => x.slot.pos[2] === z).map((x) => x.slot.pos[0]).sort((a, b) => a - b);
    for (let i = 1; i < row.length; i++) assert.ok(row[i] - row[i - 1] >= 0.7);
  }
});

test('1 en 2 poppetjes crashen niet', () => {
  assert.equal(placePeople(people(1)).length, 1);
  assert.equal(placePeople(people(2)).length, 2);
});
