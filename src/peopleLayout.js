// Plaatst de poppetjes in twee rijen op de verhoging (voorste rij laag, achterste rij hoog).
// Het aantal poppetjes bepaalt het aantal per rij: voorste rij = helft naar boven afgerond.
// Poppetje 1 staat voor, 2 achter, 3 voor, enzovoort (afwisselend), zodat de rijen mooi gemengd zijn.

export const ROWS = {
  // y/z = positie op de verhoging, spread = halve breedte van de rij (verhoging is 7,4 breed),
  // turn = hoeveel de poppetjes naar het midden draaien.
  front: { y: 0.3, z: -0.95, spread: 3.01, turn: 0.055 },
  back: { y: 0.6, z: -2, spread: 2.52, turn: 0.05 },
};

function makeRow(count, { y, z, spread, turn }) {
  const mid = (count - 1) / 2;
  return Array.from({ length: count }, (_, i) => ({
    pos: [count > 1 ? -spread + (i * 2 * spread) / (count - 1) : 0, y, z],
    rotY: (mid - i) * turn,
  }));
}

/** [{ p: persoon, slot: { pos, rotY } }] voor de 3D-scène */
export function placePeople(people) {
  const front = makeRow(Math.ceil(people.length / 2), ROWS.front);
  const back = makeRow(Math.floor(people.length / 2), ROWS.back);
  return people.map((p, i) => ({ p, slot: i % 2 === 0 ? front[i / 2] : back[(i - 1) / 2] }));
}
