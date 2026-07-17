/* =====================================================
   PRIME WEB — BRAND INTRO PREMIUM
   -----------------------------------------------------
   Sequência (≈2.9s):
     1. Tela preta + glow suave nas cores oficiais
     2. Partículas nascendo no centro (Canvas API)
     3. Símbolo oficial (PNG) surge com blur + escala + glow
     4. Brilho sutil percorre o símbolo
     5. Crossfade para a logo horizontal oficial (PNG)
     6. Zoom cinematográfico + fade, revelando o Hero

   Contrato mantido para o restante do site:
     - dispara "prime:introComplete" ao final
     - remove body.is-loading
     - respeita prefers-reduced-motion
     - roda apenas uma vez por sessão (sessionStorage)
   ===================================================== */

(function () {
  "use strict";

  const SESSION_KEY = "primewebIntroPlayed";

  const intro       = document.getElementById("intro");
  const glow        = document.getElementById("introGlow");
  const particlesEl = document.getElementById("introParticles");
  const markWrap    = document.getElementById("introMarkWrap");
  const shine       = document.getElementById("introShine");
  const logoImg     = document.getElementById("introLogoImg");

  const body = document.body;

  /* ---------- finalização (contrato com app.js) ---------- */
  function finish() {
    if (window.__primeIntroDone) return; // evita disparo duplicado
    window.__primeIntroDone = true;
    body.classList.remove("is-loading");
    document.dispatchEvent(new CustomEvent("prime:introComplete"));
  }

  function hideIntroInstantly() {
    if (intro) {
      intro.classList.add("is-hidden");
      intro.setAttribute("aria-hidden", "true");
    }
  }

  /* ---------- guarda de execução única por sessão ---------- */
  let alreadyPlayed = false;
  try {
    alreadyPlayed = sessionStorage.getItem(SESSION_KEY) === "1";
  } catch (e) {
    // sessionStorage indisponível (modo privado restrito etc.) — segue normalmente
  }

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasGSAP = typeof window.gsap !== "undefined";

  if (!intro || reduceMotion || alreadyPlayed || !hasGSAP) {
    hideIntroInstantly();
    // Adiado para o próximo tick: garante que app.js (carregado depois)
    // já tenha registrado o listener de "prime:introComplete" antes do
    // evento ser disparado. Sem isso, em um refresh (alreadyPlayed = true)
    // o evento disparava antes de existir alguém ouvindo, e o Hero
    // nunca era revelado.
    window.setTimeout(finish, 0);
    return;
  }

  try {
    sessionStorage.setItem(SESSION_KEY, "1");
  } catch (e) {
    /* silencioso */
  }

  try {

  /* =====================================================
     PARTÍCULAS — Canvas API
     Nascem próximas ao centro e se dissipam suavemente.
     Roda apenas durante a janela em que são visíveis.
     ===================================================== */
  const ctx = particlesEl.getContext("2d");
  let dpr = Math.min(window.devicePixelRatio || 1, 2);
  let pw = 0, ph = 0;
  let particles = [];
  let particleRafId = null;
  let spawnStart = 0;
  const SPAWN_DURATION = 900;   // janela de nascimento (ms)
  const PARTICLE_LIFE = 1500;   // vida total de cada partícula (ms)
  const MAX_PARTICLES = 46;

  function resizeParticles() {
    const rect = intro.getBoundingClientRect();
    pw = rect.width;
    ph = rect.height;
    particlesEl.width = pw * dpr;
    particlesEl.height = ph * dpr;
    particlesEl.style.width = pw + "px";
    particlesEl.style.height = ph + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function spawnParticle(now) {
    const cx = pw / 2;
    const cy = ph / 2;
    const angle = Math.random() * Math.PI * 2;
    const speed = 0.18 + Math.random() * 0.5;
    const dist = Math.random() * 14; // nascem bem próximas ao centro

    particles.push({
      x: cx + Math.cos(angle) * dist,
      y: cy + Math.sin(angle) * dist,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      r: Math.random() * 1.6 + 0.5,
      born: now,
      purple: Math.random() > 0.5,
    });
  }

  function drawParticles(now) {
    ctx.clearRect(0, 0, pw, ph);

    // nasce novas partículas apenas durante a janela de spawn
    if (now - spawnStart < SPAWN_DURATION && particles.length < MAX_PARTICLES) {
      if (Math.random() < 0.62) spawnParticle(now);
    }

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      const age = now - p.born;
      if (age > PARTICLE_LIFE) {
        particles.splice(i, 1);
        continue;
      }

      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.988;
      p.vy *= 0.988;

      const lifeT = age / PARTICLE_LIFE;
      // nasce (fade in rápido), vive, e se dissipa suavemente
      const alpha = lifeT < 0.12
        ? lifeT / 0.12
        : Math.max(0, 1 - (lifeT - 0.12) / 0.88);

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.purple
        ? `rgba(139,92,246,${alpha * 0.85})`
        : `rgba(96,165,250,${alpha * 0.85})`;
      ctx.shadowColor = p.purple ? "rgba(139,92,246,0.8)" : "rgba(96,165,250,0.8)";
      ctx.shadowBlur = 6;
      ctx.fill();
    }
  }

  function particleLoop(ts) {
    drawParticles(ts);
    if (particles.length > 0 || ts - spawnStart < SPAWN_DURATION) {
      particleRafId = requestAnimationFrame(particleLoop);
    } else {
      particleRafId = null;
      ctx.clearRect(0, 0, pw, ph);
    }
  }

  function startParticles() {
    resizeParticles();
    spawnStart = performance.now();
    if (particleRafId) cancelAnimationFrame(particleRafId);
    particleRafId = requestAnimationFrame(particleLoop);
  }

  window.addEventListener("resize", resizeParticles, { passive: true });

  /* =====================================================
     TIMELINE — GSAP
     Duração total-alvo: ~2.9s (dentro da janela 2.8–3.2s pedida)
     ===================================================== */
  const gsap = window.gsap;

  // pequeno respiro do glow enquanto a intro estiver ativa
  const glowBreath = gsap.to(glow, {
    scale: 1.06,
    duration: 1.8,
    ease: "sine.inOut",
    repeat: -1,
    yoyo: true,
    paused: true,
    transformOrigin: "50% 50%",
  });

  const tl = gsap.timeline({
    defaults: { ease: "power2.out" },
    onComplete: () => {
      glowBreath.pause();
      if (particleRafId) {
        cancelAnimationFrame(particleRafId);
        particleRafId = null;
      }
      hideIntroInstantly();
    },
  });

  // 1. tela preta + glow surge suavemente
  tl.to(glow, { opacity: 1, duration: 0.55, ease: "sine.inOut" }, 0)
    .call(() => { startParticles(); glowBreath.play(); }, null, 0.15)
    .to(particlesEl, { opacity: 1, duration: 0.4 }, 0.15);

  // 2. símbolo oficial nasce do glow: blur > nítido, escala, opacidade
  tl.to(markWrap, {
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    duration: 0.95,
    ease: "power3.out",
  }, 0.55);

  // 3. brilho discreto percorrendo o degradê do símbolo
  tl.to(shine, { opacity: 0.9, duration: 0.08 }, 1.42)
    .to(shine, { x: "220%", duration: 0.62, ease: "power2.inOut" }, 1.42)
    .to(shine, { opacity: 0, duration: 0.22 }, 1.9);

  // 4. crossfade: símbolo cede lugar à logo horizontal oficial
  tl.to(markWrap, {
    opacity: 0,
    scale: 0.86,
    filter: "blur(4px)",
    duration: 0.55,
    ease: "power2.inOut",
  }, 1.78)
    .to(particlesEl, { opacity: 0, duration: 0.5 }, 1.78)
    .fromTo(logoImg,
      { opacity: 0, scale: 0.94, filter: "blur(6px)" },
      { opacity: 1, scale: 1, filter: "blur(0px)", duration: 0.7, ease: "power3.out" },
      1.95
    );

  // 5. zoom cinematográfico + fade final — o Hero já está pintado atrás
  tl.to(intro, {
    scale: 1.045,
    duration: 0.62,
    ease: "power1.in",
  }, 2.42)
    .to(intro, {
      opacity: 0,
      duration: 0.55,
      ease: "power1.in",
      onStart: finish, // dispara o reveal do Hero em paralelo ao fade final
    }, 2.48);

  } catch (e) {
    // Fallback definitivo: qualquer falha na intro animada (elemento
    // ausente, GSAP com erro, canvas indisponível etc.) nunca pode
    // prender o usuário na tela de carregamento.
    hideIntroInstantly();
    finish();
  }

})();
