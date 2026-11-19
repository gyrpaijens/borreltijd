// Rooster van BorrelTĳd: elke week op donderdag, in de tijdzone Europe/Amsterdam.
//
// Wil je de dag of tijden aanpassen? Wijzig alleen BORREL hieronder.
// (De vaste teksten "16:30" en "donderdag" in de interface staan in
// src/legacy/borreltijd-app.js en moet je daar ook even aanpassen.)

export const TIME_ZONE = 'Europe/Amsterdam';

export const BORREL = {
  weekday: 4, // 0 = zondag … 4 = donderdag … 6 = zaterdag
  snackStart: [14, 0], // snacks beginnen te vallen
  airfryer: [16, 20], // airfryer gaat open
  party: [16, 30], // champagne! (het aftelmoment)
  end: [18, 0], // einde feest
};

const partsFormat = new Intl.DateTimeFormat('en-GB', {
  timeZone: TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hourCycle: 'h23',
});

/** Wandkloktijd in Amsterdam voor een UTC-timestamp (ms). */
function amsterdamParts(ms) {
  const parts = partsFormat.formatToParts(new Date(ms));
  const get = (type) => Number(parts.find((p) => p.type === type)?.value ?? 0);
  return {
    y: get('year'),
    m: get('month'),
    d: get('day'),
    h: get('hour'),
    min: get('minute'),
    s: get('second'),
  };
}

/** UTC-timestamp (ms) van een Amsterdamse wandkloktijd; houdt rekening met zomertijd. */
function amsterdamToUtc(y, m, d, h = 0, min = 0) {
  const target = Date.UTC(y, m - 1, d, h, min, 0);
  let guess = target;
  for (let i = 0; i < 3; i++) {
    const p = amsterdamParts(guess);
    const offset = Date.UTC(p.y, p.m - 1, p.d, p.h, p.min, p.s) - Math.floor(guess / 1000) * 1000;
    guess = target - offset;
  }
  return guess;
}

/** Tijdstippen van de borrel op een kalenderdag (dag mag buiten 1–31 vallen; wordt genormaliseerd). */
function eventsOnDay(y, m, d) {
  const day = new Date(Date.UTC(y, m - 1, d));
  const [Y, M, D] = [day.getUTCFullYear(), day.getUTCMonth() + 1, day.getUTCDate()];
  const at = ([h, min]) => amsterdamToUtc(Y, M, D, h, min);
  return {
    snack_start_ms: at(BORREL.snackStart),
    airfryer_ms: at(BORREL.airfryer),
    party_ms: at(BORREL.party),
    party_end_ms: at(BORREL.end),
  };
}

/**
 * Staat van de borrel op moment `now` (ms).
 *
 * - Tot het einde van het feest wijzen de events naar de borrel van déze week.
 * - Daarna rollen ze door naar de volgende donderdag. Tot middernacht blijft de
 *   fase "after" ("Deze ronde is voorbij"), daarna telt de klok gewoon verder af.
 */
export function getBorrelState(now = Date.now()) {
  const t = amsterdamParts(now);
  const weekdayToday = new Date(Date.UTC(t.y, t.m - 1, t.d)).getUTCDay();
  let delta = (BORREL.weekday - weekdayToday + 7) % 7;

  let events = eventsOnDay(t.y, t.m, t.d + delta);

  if (delta === 0 && now >= events.party_end_ms) {
    const afterFrom = events.party_end_ms;
    delta = 7;
    events = {
      ...eventsOnDay(t.y, t.m, t.d + delta),
      after_from_ms: afterFrom,
      after_until_ms: amsterdamToUtc(t.y, t.m, t.d + 1, 0, 0), // middernacht
    };
  }

  return {
    now_ms: now,
    timezone: TIME_ZONE,
    phase: getPhase(now, events),
    events,
    target_ms: events.party_ms,
    next_party_ms: events.party_ms,
  };
}

/** Fase op moment `now` voor een gegeven set events: pre | snacks | airfryer | party | after. */
export function getPhase(now, events) {
  if (events.after_from_ms != null && now >= events.after_from_ms && now < events.after_until_ms) {
    return 'after';
  }
  if (now < events.snack_start_ms) return 'pre';
  if (now < events.airfryer_ms) return 'snacks';
  if (now < events.party_ms) return 'airfryer';
  if (now < events.party_end_ms) return 'party';
  return 'after';
}
