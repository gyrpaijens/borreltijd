// ─────────────────────────────────────────────────────────────────────────────
//  De poppetjes op de verhoging
//
//  Een poppetje toevoegen in 2 stappen:
//   1. Zet een vierkante foto (liefst 256×256 px, gezicht in het midden) in
//      src/assets/faces/ met de naam face_18.jpg (18 = het volgende nummer).
//   2. Voeg onderaan PEOPLE een regel toe met datzelfde nummer bij `face`.
//
//  Verwijderen kan ook: haal de regel weg. De rijen passen zich automatisch aan.
//
//  face      nummer van de foto (face_NN.jpg)
//  skin      huidskleur van nek, handen en achterkant van het hoofd (hex)
//  hair      haarkleur, of null voor kaal
//  longHair  true = lang haar achter het hoofd
//  shirt     kleur van shirt en armen (hex)
//  move      dansstijl: 0, 1 of 2
//  drink     true = glas in de hand
// ─────────────────────────────────────────────────────────────────────────────
export const PEOPLE = [
  { face: 1, skin: '#ab8580', hair: '#b9b6b2', shirt: '#3a2420', move: 0 },
  { face: 2, skin: '#8f6a63', hair: null, shirt: '#16181d', move: 1 },
  { face: 3, skin: '#99716c', hair: '#8a7a62', shirt: '#2a2d33', move: 2 },
  { face: 4, skin: '#7a5a5b', hair: '#c4c2bf', shirt: '#1e5bd8', move: 0, drink: true },
  { face: 5, skin: '#8b6c6d', hair: '#4a3020', shirt: '#2c1f18', move: 1 },
  { face: 6, skin: '#7c656a', hair: '#2a2018', shirt: '#4a4a40', move: 2 },
  { face: 7, skin: '#7c5d5a', hair: null, shirt: '#3c3f38', move: 0 },
  { face: 8, skin: '#775757', hair: '#8a6a40', shirt: '#e6d6bd', move: 1, drink: true },
  { face: 9, skin: '#957e7d', hair: '#1e1814', shirt: '#18191c', move: 2 },
  { face: 10, skin: '#583c40', hair: '#5a3a22', longHair: true, shirt: '#2c2a28', move: 0 },
  { face: 11, skin: '#4e393c', hair: '#15100e', longHair: true, shirt: '#d8d8dc', move: 1 },
  { face: 12, skin: '#b08e8d', hair: '#1e1814', shirt: '#1f4a4a', move: 2 },
  { face: 13, skin: '#7f5d60', hair: '#8a8580', shirt: '#d0624c', move: 0 },
  { face: 14, skin: '#6d4a4f', hair: '#a88a55', shirt: '#e4e4ea', move: 1 },
  { face: 15, skin: '#a87970', hair: '#211b1b', shirt: '#111318', move: 2, drink: true },

  // Nieuw — de foto's face_16.jpg en face_17.jpg zijn plaatshouders: overschrijf ze met echte foto's.
  { face: 16, skin: '#c08a70', hair: '#3a2a1e', shirt: '#2f5d8a', move: 0 },
  { face: 17, skin: '#9a6b55', hair: null, shirt: '#8a2f3f', move: 1, drink: true },
];

// Alle foto's in src/assets/faces/ worden automatisch meegenomen door Vite.
const faceFiles = import.meta.glob('./assets/faces/face_*.jpg', {
  eager: true,
  query: '?url',
  import: 'default',
});

export function faceUrl(n) {
  const key = `./assets/faces/face_${String(n).padStart(2, '0')}.jpg`;
  const url = faceFiles[key];
  if (!url) {
    console.warn(`BorrelTĳd: foto ${key} ontbreekt; face_01.jpg wordt gebruikt.`);
    return faceFiles['./assets/faces/face_01.jpg'];
  }
  return url;
}
