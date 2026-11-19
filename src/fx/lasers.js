/* BorrelTijd: dynamische RGB-lasers van boven naar beneden */
(() => {
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
  const canvas = document.createElement('canvas');
  canvas.id = 'borreltijd-laserfx';
  canvas.setAttribute('aria-hidden', 'true');
  Object.assign(canvas.style, {
    position: 'fixed', inset: '0', width: '100%', height: '100%',
    pointerEvents: 'none', zIndex: '5', mixBlendMode: 'screen',
    opacity: '.9'
  });
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;

  let w = 0, h = 0, dpr = 1, raf = 0;
  const fixtures = [0.08, 0.36, 0.64, 0.92].map((x, i) => ({
    x, phase: i * 1.7, hue: 255 + i * 17,
    rays: Array.from({length: 13}, (_, j) => ({
      spread: (j / 12 - .5) * .92,
      hue: (255 + i * 17 + j * 5.2) % 360,
      width: .75 + (j % 4) * .38,
      phase: j * .63
    }))
  }));

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth; h = window.innerHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function draw(ms) {
    if (document.hidden) { raf = 0; return; }
    const t = ms * .001;
    ctx.clearRect(0, 0, w, h);
    ctx.globalCompositeOperation = 'lighter';

    fixtures.forEach((f, fi) => {
      const ox = f.x * w;
      const oy = -h * .015;
      const reach = h * 1.32;
      f.rays.forEach((r, ri) => {
        const sway = Math.sin(t * (.35 + fi * .04) + r.phase + f.phase) * .055;
        const a = r.spread + sway;
        const x = ox + Math.sin(a) * reach;
        const y = oy + Math.cos(a) * reach;
        const hue = (r.hue + Math.sin(t * .42 + r.phase) * 18 + 360) % 360;
        const grad = ctx.createLinearGradient(ox, oy, x, y);
        grad.addColorStop(0, `hsla(${hue},100%,83%,.92)`);
        grad.addColorStop(.16, `hsla(${hue},100%,66%,.68)`);
        grad.addColorStop(.72, `hsla(${hue},100%,57%,.24)`);
        grad.addColorStop(1, `hsla(${hue},100%,55%,0)`);
        ctx.beginPath();
        ctx.moveTo(ox, oy);
        ctx.lineTo(x, y);
        ctx.strokeStyle = grad;
        ctx.lineWidth = Math.max(.65, r.width * (w / 1200));
        ctx.shadowColor = `hsl(${hue},100%,66%)`;
        ctx.shadowBlur = 9 + (ri % 4) * 3;
        ctx.stroke();
      });
      // Gloed rond de plafondfixture, met een zachte neerwaartse lichtbundel.
      const glow = ctx.createRadialGradient(ox, 0, 0, ox, h * .12, Math.max(34, w * .055));
      glow.addColorStop(0, `hsla(${f.hue},100%,88%,.28)`);
      glow.addColorStop(.28, `hsla(${f.hue},100%,65%,.12)`);
      glow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = glow;
      ctx.fillRect(ox - w*.07, 0, w*.14, h*.28);
    });

    ctx.shadowBlur = 0;
    ctx.globalCompositeOperation = 'source-over';
    raf = requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize, {passive:true});
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    } else if (!raf) {
      raf = requestAnimationFrame(draw);
    }
  });
  resize();
  raf = requestAnimationFrame(draw);
})();
