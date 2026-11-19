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
src/fx/lasers.js              laserlichten (canvas)
src/fx/fireworks.js           vuurwerk tijdens de borrel
src/legacy/borreltijd-app.js  de React/three.js-app, zoals aangeleverd (gecompileerd)
src/styles.css                Tailwind-CSS, zoals aangeleverd (gecompileerd)
```

## Dag of tijd aanpassen

Pas `BORREL` bovenin `src/schedule.js` aan (bijv. `weekday: 5` voor vrijdag, `party: [17, 0]`).
De losse teksten in de interface ("donderdag", "16:30", "16:20", "18:00") staan in
`src/legacy/borreltijd-app.js`; zoek en vervang die dan ook.

## Let op

`src/legacy/borreltijd-app.js` en `src/styles.css` komen uit één gecompileerd HTML-bestand, dus
zonder originele JSX-bronbestanden. De app werkt 1-op-1 hetzelfde, maar die twee bestanden zijn niet
prettig met de hand te bewerken. De demo-knoppen ("Toon 16:20", "Toon 16:30", "Live tijd") zitten nog in de interface.
