// ─────────────────────────────────────────────────────────────────────────────
//  Prestatiemodus voor trage pc's
//
//  In "zuinige" modus (lowPerf) draait alles lichter:
//   - 3D-scène op pixelratio 1, zonder bloom/anti-aliasing, kleinere schaduwen
//   - lasers en vuurwerk op lagere resolutie, lasers op 30 fps
//
//  Automatisch: op zwakke hardware direct, en anders na een korte FPS-meting
//  als de pagina toch hapert.
//
//  Handmatig forceren (wordt onthouden in deze browser):
//    ?kwaliteit=laag   altijd zuinig
//    ?kwaliteit=hoog   altijd volle kwaliteit
//    ?kwaliteit=auto   weer automatisch
// ─────────────────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'borreltijd-kwaliteit';
const listeners = new Set();

function readOverride() {
  let value = null;
  try {
    value = new URLSearchParams(window.location.search).get('kwaliteit');
    if (value === 'auto') localStorage.removeItem(STORAGE_KEY);
    else if (value === 'laag' || value === 'hoog') localStorage.setItem(STORAGE_KEY, value);
    else value = localStorage.getItem(STORAGE_KEY);
  } catch {
    /* geen toegang tot localStorage: negeren */
  }
  return value === 'laag' || value === 'hoog' ? value : null;
}

function weakGpu() {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl');
    if (!gl) return true;
    const info = gl.getExtension('WEBGL_debug_renderer_info');
    const name = info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) : '';
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    // Software-rendering of oudere Intel-onboard-graphics (HD/UHD, niet Iris).
    return /swiftshader|llvmpipe|softpipe|basic render|microsoft basic|intel\(r\) (u)?hd graphics|intel (u)?hd graphics|mali-4|adreno \(tm\) [34]\d\d/i.test(name);
  } catch {
    return false;
  }
}

function weakHardware() {
  const cores = navigator.hardwareConcurrency || 8;
  const memory = navigator.deviceMemory || 8; // alleen Chrome/Edge
  return cores <= 4 || memory <= 4 || weakGpu();
}

const override = readOverride();
let lowPerf = override ? override === 'laag' : weakHardware();

export function isLowPerf() {
  return lowPerf;
}

/** Abonneer op wijzigingen; geeft een afmeld-functie terug (ook bruikbaar met useSyncExternalStore). */
export function onPerfChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function setLowPerf(value) {
  if (lowPerf === value) return;
  lowPerf = value;
  listeners.forEach((fn) => fn(value));
}

// FPS-meting: als de pagina in volle kwaliteit structureel onder ±40 fps blijft,
// schakelen we over naar zuinig. Alleen in automatische modus.
function measureFps() {
  const WARMUP_MS = 3000;
  const MEASURE_MS = 4000;
  let start = 0;
  let frames = 0;
  const tick = (now) => {
    if (lowPerf) return;
    if (document.hidden) {
      // Tab niet zichtbaar: meting opnieuw beginnen zodra hij terugkomt.
      start = 0;
      frames = 0;
      requestAnimationFrame(tick);
      return;
    }
    if (!start) start = now;
    const elapsed = now - start;
    if (elapsed > WARMUP_MS) frames++;
    if (elapsed < WARMUP_MS + MEASURE_MS) {
      requestAnimationFrame(tick);
      return;
    }
    const fps = (frames * 1000) / MEASURE_MS;
    if (fps < 40) {
      console.info(`BorrelTĳd: ${fps.toFixed(0)} fps gemeten, zuinige weergave ingeschakeld.`);
      setLowPerf(true);
    }
  };
  requestAnimationFrame(tick);
}

if (!override && !lowPerf) measureFps();
