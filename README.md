# BorrelTĳd — wekelijkse aftel

Aftellen tot **elke donderdag 16:30** (tijdzone Europe/Amsterdam, zomer-/wintertijd wordt automatisch goed berekend).

| Moment                  | Wat er gebeurt                                    |
| ----------------------- | ------------------------------------------------- |
| tot donderdag 14:00     | aftellen (dagen : uren : minuten : seconden)      |
| do 14:00 – 16:20        | snacks vallen in de schaal                        |
| do 16:20 – 16:30        | airfryer gaat open                                |
| do 16:30 – 18:00        | BORRELTĲD: kurk, champagne, vuurwerk, feestmuziek |
| do 18:00 – 24:00        | "Deze ronde is voorbij", teller wijst al naar volgende week |
| vr t/m wo               | aftellen naar de volgende donderdag               |

## Lokaal draaien

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # tests van de tijdlogica
npm run build    # productiebuild in dist/
```

Vereist Node 20.19 of nieuwer.

## Online zetten: GitHub + Vercel

1. Maak een lege repository op GitHub en push dit project:
   ```bash
   git init
   git add .
   git commit -m "BorrelTĳd wekelijkse aftel"
   git branch -M main
   git remote add origin https://github.com/<jouw-account>/borreltijd.git
   git push -u origin main
   ```
2. Ga naar [vercel.com/new](https://vercel.com/new) en importeer de repository.
3. Vercel herkent Vite zelf (Build Command `vite build`, Output Directory `dist`). Gewoon op **Deploy** klikken.

Elke `git push` naar `main` zet daarna automatisch een nieuwe versie online.
Er is geen server of API nodig: de klok loopt op het apparaat van de bezoeker, gerekend in Amsterdamse tijd.

## Structuur

```
index.html                    pagina
src/main.js                   startpunt (volgorde: styling → lasers → vuurwerk → app)
src/schedule.js               ← de wekelijkse donderdag-logica (leesbaar, getest)
src/schedule.test.js          tests (DST, jaarwisseling, fases)
src/people.js                 ← de poppetjes: lijst met kleuren, dansstijl en foto-nummer
src/peopleLayout.js           plaatst de poppetjes in 2 rijen op de verhoging
src/assets/faces/             ← de gezichtsfoto's (face_01.jpg, face_02.jpg, …)
src/fx/lasers.js              laserlichten (canvas)
src/fx/fireworks.js           vuurwerk tijdens de borrel
src/legacy/borreltijd-app.js  de React/three.js-app, zoals aangeleverd (gecompileerd)
src/styles.css                Tailwind-CSS, zoals aangeleverd (gecompileerd)
```

## Poppetjes toevoegen of vervangen

1. **Foto:** zet een foto in `src/assets/faces/`, bijvoorbeeld `face_18.jpg`. Liefst vierkant, gezicht in het midden
   (de oude foto's zijn 256×256, grotere werken ook).
2. **Regel in `src/people.js`:** voeg onderaan `PEOPLE` toe, met hetzelfde nummer bij `face`:
   ```js
   { face: 18, skin: '#b08e8d', hair: '#1e1814', shirt: '#1f4a4a', move: 2, drink: true },
   ```
3. Opslaan, `git push`, Vercel doet de rest. Lokaal zie je het direct met `npm run dev`.

Een bestaand poppetje van gezicht wisselen: overschrijf gewoon het bestand (zelfde naam).
Poppetje weghalen: verwijder de regel. De twee rijen verdelen zich vanzelf (voorste rij = helft naar boven afgerond).
`face_16.jpg` en `face_17.jpg` zijn plaatshouders (smileys) voor de twee nieuwste poppetjes.

## Dag of tijd aanpassen

Pas `BORREL` bovenin `src/schedule.js` aan (bijv. `weekday: 5` voor vrijdag, `party: [17, 0]`).
De losse teksten in de interface ("donderdag", "16:30", "16:20", "18:00") staan in
`src/legacy/borreltijd-app.js`; zoek en vervang die dan ook.

## Let op

`src/legacy/borreltijd-app.js` en `src/styles.css` komen uit één gecompileerd HTML-bestand, dus
zonder originele JSX-bronbestanden. De app werkt 1-op-1 hetzelfde, maar die twee bestanden zijn niet
prettig met de hand te bewerken (de geluiden zitten er nog in als base64). De demo-knoppen ("Toon 16:20", "Toon 16:30", "Live tijd") zitten nog in de interface.
