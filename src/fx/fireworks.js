/* BorrelTijd finale: gesproken PARTY + kleurrijk siervuurwerk. Werkt lokaal in Edge/Chrome. */
(() => {
  const PARTY_SELECTOR = '[data-testid="borreltijd-celebration-takeover"]';
  let active = false;
  let raf = 0;
  let spawnTimer = 0;
  let lastFrame = 0;
  let canvas, ctx, width = 0, height = 0, dpr = 1;
  const rockets = [];
  const sparks = [];
  const palette = ['#ffdf70', '#ff4f81', '#65e7ff', '#a78bfa', '#7dffb2', '#ff9c45', '#ffffff'];


  function resize() {
    if (!canvas) return;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function launch(x = Math.random() * width, targetY = height * (0.13 + Math.random() * 0.38)) {
    const startX = x + (Math.random() - 0.5) * width * 0.12;
    const startY = height + 12;
    const dx = x - startX;
    const dy = targetY - startY;
    const duration = 650 + Math.random() * 450;
    rockets.push({ x: startX, y: startY, px: startX, py: startY, vx: dx / (duration / 16.67), vy: dy / (duration / 16.67), life: duration, age: 0, color: palette[Math.floor(Math.random() * palette.length)], targetY });
  }

  function explode(x, y, baseColor) {
    const color = baseColor || palette[Math.floor(Math.random() * palette.length)];
    const style = Math.floor(Math.random() * 4);
    const count = 48 + Math.floor(Math.random() * 28);
    const rotation = Math.random() * Math.PI * 2;
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2 + rotation;
      let speed = 1.1 + Math.random() * 4.1;
      if (style === 1) speed = (i % 2 ? 1.5 : 3.7) + Math.random() * 1.2; // chrysanthemum
      if (style === 2) speed = (i % 3 === 0 ? 4.8 : 2.2) + Math.random() * 1.1; // peony
      if (style === 3) speed = 2.0 + Math.random() * 1.6; // willow
      const spread = style === 1 ? 0.28 : 1;
      const angle = a + (Math.random() - 0.5) * spread;
      sparks.push({ x, y, px: x, py: y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: 850 + Math.random() * (style === 3 ? 1500 : 700), age: 0, color: Math.random() < 0.18 ? '#ffffff' : color, size: 1.1 + Math.random() * 2.4, gravity: style === 3 ? 0.055 : 0.035, drag: style === 3 ? 0.986 : 0.976, twinkle: Math.random() * 8 });
    }
    // Kleine tweede ring geeft de explosie meer diepte en een sierlijke rand.
    if (Math.random() > 0.28) {
      const ringColor = palette[Math.floor(Math.random() * palette.length)];
      for (let i = 0; i < 18; i++) {
        const a = i / 18 * Math.PI * 2;
        const speed = 2.6 + Math.random() * 0.6;
        sparks.push({ x, y, px: x, py: y, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed, life: 950 + Math.random() * 350, age: 0, color: ringColor, size: 1.4 + Math.random() * 1.5, gravity: 0.025, drag: 0.982, twinkle: Math.random() * 8 });
      }
    }
  }

  function frame(now) {
    if (!active || !ctx) return;
    if (document.hidden) { raf = requestAnimationFrame(frame); return; }
    const dt = Math.min(2.2, (now - (lastFrame || now)) / 16.67 || 1);
    lastFrame = now;
    ctx.clearRect(0, 0, width, height);
    ctx.globalCompositeOperation = 'lighter';

    for (let i = rockets.length - 1; i >= 0; i--) {
      const r = rockets[i]; r.age += 16.67 * dt; r.px = r.x; r.py = r.y;
      r.x += r.vx * dt; r.y += r.vy * dt;
      r.vy += 0.012 * dt;
      ctx.strokeStyle = r.color; ctx.globalAlpha = 0.9; ctx.lineWidth = 2.2;
      ctx.beginPath(); ctx.moveTo(r.px, r.py); ctx.lineTo(r.x, r.y); ctx.stroke();
      ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(r.x, r.y, 2.1, 0, Math.PI * 2); ctx.fill();
      if (r.age >= r.life || r.y <= r.targetY) { explode(r.x, r.y, r.color); rockets.splice(i, 1); }
    }

    for (let i = sparks.length - 1; i >= 0; i--) {
      const p = sparks[i]; p.age += 16.67 * dt; p.px = p.x; p.py = p.y;
      p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= Math.pow(p.drag, dt); p.vy = p.vy * Math.pow(p.drag, dt) + p.gravity * dt;
      const fade = Math.max(0, 1 - p.age / p.life);
      const twinkle = 0.58 + 0.42 * Math.abs(Math.sin(p.age * 0.025 + p.twinkle));
      ctx.globalAlpha = fade * twinkle;
      ctx.strokeStyle = p.color; ctx.lineWidth = p.size;
      ctx.beginPath(); ctx.moveTo(p.px, p.py); ctx.lineTo(p.x, p.y); ctx.stroke();
      ctx.fillStyle = '#ffffff'; ctx.globalAlpha = fade * twinkle * 0.72;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.size * 0.62, 0, Math.PI * 2); ctx.fill();
      if (p.age >= p.life) sparks.splice(i, 1);
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
    raf = requestAnimationFrame(frame);
  }

  function start() {
    if (active) return;
    active = true;
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.setAttribute('aria-hidden', 'true');
      Object.assign(canvas.style, { position: 'fixed', inset: '0', zIndex: '25', pointerEvents: 'none' });
      document.body.appendChild(canvas);
      ctx = canvas.getContext('2d');
      window.addEventListener('resize', resize, { passive: true });
    }
    resize(); lastFrame = 0;
    // Direct bij de start meerdere siervuurwerkboeketten over de hele breedte.
    for (let i = 0; i < 5; i++) window.setTimeout(() => { if (active) launch(width * (0.12 + i * 0.19), height * (0.16 + Math.random() * 0.27)); }, i * 330);
    const schedule = () => {
      if (!active) return;
      launch(width * (0.07 + Math.random() * 0.86), height * (0.12 + Math.random() * 0.4));
      if (Math.random() > 0.72) window.setTimeout(() => { if (active) launch(width * (0.08 + Math.random() * 0.84), height * (0.14 + Math.random() * 0.34)); }, 260 + Math.random() * 420);
      spawnTimer = window.setTimeout(schedule, 1550 + Math.random() * 1100);
    };
    spawnTimer = window.setTimeout(schedule, 650);
    raf = requestAnimationFrame(frame);
  }

  function stop() {
    if (!active) return;
    active = false;
    window.clearTimeout(spawnTimer);
    cancelAnimationFrame(raf);
    rockets.length = 0; sparks.length = 0;
    if (ctx) ctx.clearRect(0, 0, width, height);
  }

  function check() {
    const shouldRun = !!document.querySelector(PARTY_SELECTOR);
    if (shouldRun) start(); else stop();
  }
  const observer = new MutationObserver(check);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  check();
})();
