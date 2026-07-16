/* =====================================================
   PRIME WEB — HERO
   Fundo artístico: partículas em canvas + luz que acompanha
   o mouse + parallax discreto nos orbs de fundo.
   ===================================================== */

(function () {
  "use strict";

  const hero = document.querySelector(".hero");
  const canvas = document.getElementById("heroCanvas");
  const glow = document.getElementById("heroGlow");
  const orbGold = document.querySelector(".hero__orb--gold");
  const orbWhite = document.querySelector(".hero__orb--white");

  if (!hero || !canvas) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ctx = canvas.getContext("2d");

  let width = 0;
  let height = 0;
  let dpr = Math.min(window.devicePixelRatio || 1, 2);

  let particles = [];
  const MAX_LINK_DIST = 150;

  const pointer = {
    x: null,
    y: null,
    targetX: null,
    targetY: null,
    inside: false,
  };

  /* ---------- setup ---------- */
  function resize() {
    const rect = hero.getBoundingClientRect();
    width = rect.width;
    height = rect.height;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    initParticles();
  }

  function initParticles() {
    const density = Math.min(width, 1600) * Math.min(height, 900);
    const count = Math.round(density / 15500);

    particles = new Array(Math.max(24, count)).fill(0).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.18,
      vy: (Math.random() - 0.5) * 0.18,
      r: Math.random() * 1.4 + 0.6,
      gold: Math.random() > 0.82,
    }));
  }

  /* ---------- interação ---------- */
  function onPointerMove(e) {
    const rect = hero.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
      pointer.targetX = x;
      pointer.targetY = y;
      pointer.inside = true;
    } else {
      pointer.inside = false;
    }
  }

  window.addEventListener("mousemove", onPointerMove, { passive: true });
  window.addEventListener("touchmove", (e) => {
    if (e.touches && e.touches[0]) onPointerMove(e.touches[0]);
  }, { passive: true });

  window.addEventListener("mouseleave", () => { pointer.inside = false; });

  /* ---------- glow + parallax (independentes do canvas) ---------- */
  let glowX = width / 2;
  let glowY = height / 2;

  function updateGlowAndParallax() {
    if (pointer.targetX !== null) {
      const tx = pointer.targetX;
      const ty = pointer.targetY;
      glowX += (tx - glowX) * 0.08;
      glowY += (ty - glowY) * 0.08;
    } else {
      glowX += (width / 2 - glowX) * 0.02;
      glowY += (height / 2 - glowY) * 0.02;
    }

    if (glow) {
      glow.style.opacity = pointer.inside ? "0.55" : "0.28";
      glow.style.transform = `translate(${glowX}px, ${glowY}px) translate(-50%, -50%)`;
    }

    if (orbGold && orbWhite && width > 0) {
      const nx = (glowX / width - 0.5); // -0.5 .. 0.5
      const ny = (glowY / height - 0.5);
      orbGold.style.translate = `${nx * -26}px ${ny * -18}px`;
      orbWhite.style.translate = `${nx * 20}px ${ny * 16}px`;
    }
  }

  /* ---------- render do canvas ---------- */
  function drawFrame() {
    ctx.clearRect(0, 0, width, height);

    // atualiza posições
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < -10) p.x = width + 10;
      if (p.x > width + 10) p.x = -10;
      if (p.y < -10) p.y = height + 10;
      if (p.y > height + 10) p.y = -10;

      // leve atração ao ponteiro
      if (pointer.inside && pointer.targetX !== null) {
        const dx = pointer.targetX - p.x;
        const dy = pointer.targetY - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 180 && dist > 0.001) {
          const force = (1 - dist / 180) * 0.02;
          p.x += dx * force;
          p.y += dy * force;
        }
      }
    }

    // conexões (constelação)
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i];
        const b = particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < MAX_LINK_DIST) {
          const alpha = (1 - dist / MAX_LINK_DIST) * 0.16;
          ctx.strokeStyle = `rgba(201,168,105,${alpha})`;
          ctx.lineWidth = 0.6;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    // pontos
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.gold ? "rgba(230,211,166,0.55)" : "rgba(244,244,242,0.35)";
      ctx.fill();
    }
  }

  let rafId = null;
  function loop() {
    updateGlowAndParallax();
    drawFrame();
    rafId = requestAnimationFrame(loop);
  }

  function staticFrame() {
    updateGlowAndParallax();
    drawFrame();
  }

  /* ---------- boot ---------- */
  resize();

  if (reduceMotion) {
    staticFrame();
  } else {
    rafId = requestAnimationFrame(loop);
  }

  let resizeTimer = null;
  window.addEventListener("resize", () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(resize, 150);
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden && rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    } else if (!document.hidden && !reduceMotion && !rafId) {
      rafId = requestAnimationFrame(loop);
    }
  });
})();
