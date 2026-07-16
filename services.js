/* =====================================================
   PRIME WEB — SERVIÇOS (CATÁLOGO DE SOLUÇÕES)
   Slider horizontal controlado via JS puro:
   setas, indicadores, swipe/drag e teclado.
   Também cuida da revelação por scroll dos slides.
   ===================================================== */

(function () {
  "use strict";

  const section = document.getElementById("servicos");
  const viewport = document.getElementById("servicesViewport");
  const track = document.getElementById("servicesTrack");
  const prevBtn = document.getElementById("servicesPrev");
  const nextBtn = document.getElementById("servicesNext");
  const dotsWrap = document.getElementById("servicesDots");

  if (!section || !viewport || !track) return;

  const slides = Array.from(track.querySelectorAll(".service-slide"));
  const dots = dotsWrap ? Array.from(dotsWrap.querySelectorAll(".services__dot")) : [];
  const total = slides.length;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const state = {
    index: 0,
    viewportWidth: viewport.getBoundingClientRect().width,
    isDragging: false,   // swipe horizontal confirmado e em andamento
    isPending: false,    // ponteiro pressionado, intenção ainda não decidida
    isTouch: false,      // gesto atual veio de touch (vs. mouse)
    startX: 0,
    startY: 0,
    lastX: 0,
    startTime: 0,
    startTranslate: 0,
    currentDrag: 0,
    sectionInView: false,
  };

  // distância mínima (px) para decidir a direção do gesto (mouse/caneta)
  const DIRECTION_LOCK = 10;
  // distância mínima (px) bem maior, exigida só para gestos touch,
  // para não competir com o primeiro impulso de um scroll vertical
  const TOUCH_DIRECTION_LOCK = 18;
  // um movimento horizontal só "vence" o vertical se for claramente mais forte
  const DIRECTION_RATIO = 1.2;
  // em touch a barra é bem mais alta: o scroll vertical tem prioridade quase total,
  // só perdendo quando a intenção horizontal é inequívoca
  const TOUCH_DIRECTION_RATIO = 2.4;
  // proporção da largura do viewport necessária para trocar de slide
  const SWIPE_THRESHOLD_RATIO = 0.22;
  // swipe rápido (flick) troca de slide mesmo com pouca distância
  const FLICK_VELOCITY = 0.55; // px/ms

  /* =====================================================
     NAVEGAÇÃO PRINCIPAL
     ===================================================== */
  function applyTransform(px, withTransition, duration) {
    track.style.transition = withTransition && !reduceMotion
      ? `transform ${duration || 620}ms cubic-bezier(.16,.8,.3,1)`
      : "none";
    track.style.transform = `translateX(${px}px)`;
  }

  function goTo(index, withTransition) {
    const prevIndex = state.index;
    state.index = ((index % total) + total) % total; // wrap-around
    const px = -state.index * state.viewportWidth;
    const steps = Math.max(1, Math.abs(state.index - prevIndex));
    // pequenas viagens são mais rápidas e "estaladas"; viagens maiores ganham
    // um pouco mais de tempo para não parecerem abruptas
    const duration = withTransition === false ? 0 : Math.min(760, 520 + steps * 60);
    applyTransform(px, withTransition !== false, duration);
    updateUI();
  }

  function next() { goTo(state.index + 1, true); }
  function prev() { goTo(state.index - 1, true); }

  function updateUI() {
    slides.forEach((slide, i) => {
      const isActive = i === state.index;
      slide.setAttribute("aria-hidden", isActive ? "false" : "true");
      slide
        .querySelectorAll("a, button")
        .forEach((el) => el.setAttribute("tabindex", isActive ? "0" : "-1"));
    });

    dots.forEach((dot, i) => {
      dot.classList.toggle("is-active", i === state.index);
      dot.setAttribute("aria-selected", i === state.index ? "true" : "false");
    });
  }

  if (prevBtn) prevBtn.addEventListener("click", prev);
  if (nextBtn) nextBtn.addEventListener("click", next);

  dots.forEach((dot, i) => {
    dot.addEventListener("click", () => goTo(i, true));
  });

  /* =====================================================
     TECLADO — setas esquerda/direita quando a seção está visível
     ===================================================== */
  document.addEventListener("keydown", (e) => {
    if (!state.sectionInView) return;
    const tag = (document.activeElement && document.activeElement.tagName) || "";
    if (tag === "INPUT" || tag === "TEXTAREA") return;

    if (e.key === "ArrowRight") { next(); }
    else if (e.key === "ArrowLeft") { prev(); }
  });

  /* =====================================================
     SWIPE / DRAG — pointer events (mouse, touch e caneta)
     ===================================================== */
  function resetGesture() {
    state.isDragging = false;
    state.isPending = false;
    viewport.classList.remove("is-dragging");
  }

  function onPointerDown(e) {
    // apenas o botão principal do mouse inicia o gesto
    if (e.pointerType === "mouse" && e.button !== 0) return;

    state.isPending = true;
    state.isDragging = false;
    state.isTouch = e.pointerType === "touch" || e.pointerType === "pen";
    state.startX = e.clientX;
    state.startY = e.clientY;
    state.lastX = e.clientX;
    state.startTime = e.timeStamp;
    state.startTranslate = -state.index * state.viewportWidth;
    state.currentDrag = state.startTranslate;
    state.pointerId = e.pointerId;
    // a captura só acontece quando a intenção horizontal for confirmada,
    // para não competir com o scroll vertical nativo do celular
  }

  function onPointerMove(e) {
    if (!state.isPending && !state.isDragging) return;

    const dx = e.clientX - state.startX;
    const dy = e.clientY - state.startY;

    if (state.isPending && !state.isDragging) {
      const adx = Math.abs(dx);
      const ady = Math.abs(dy);
      const lock = state.isTouch ? TOUCH_DIRECTION_LOCK : DIRECTION_LOCK;
      const ratio = state.isTouch ? TOUCH_DIRECTION_RATIO : DIRECTION_RATIO;

      // ignora tremores/movimentos mínimos (toques, cliques, jitter)
      if (adx < lock && ady < lock) return;

      // mouse: qualquer arraste horizontal claro já é suficiente
      // touch/pen: só assume o controle quando a intenção horizontal é muito
      // clara, priorizando sempre o scroll vertical nativo em qualquer ambiguidade
      const horizontalWins = state.isTouch
        ? adx > ady * ratio && adx >= lock
        : adx >= ady * ratio;

      if (!horizontalWins) {
        // ainda ambíguo: aguarda mais uma amostra antes de decidir por vertical,
        // exceto quando o vertical já é claramente dominante — aí libera de vez
        if (ady > adx * 1.5 && ady >= DIRECTION_LOCK) {
          state.isPending = false;
        }
        return;
      }

      state.isDragging = true;
      state.isPending = false;
      viewport.classList.add("is-dragging");
      if (viewport.setPointerCapture && e.pointerId !== undefined) {
        try { viewport.setPointerCapture(e.pointerId); } catch (err) { /* noop */ }
      }
    }

    if (!state.isDragging) return;

    // com o swipe horizontal confirmado, evita que a página role junto
    if (e.cancelable) e.preventDefault();

    state.lastX = e.clientX;

    // resistência sutil ao arrastar além das bordas
    let dampedDelta = dx;
    if ((state.index === 0 && dx > 0) || (state.index === total - 1 && dx < 0)) {
      dampedDelta = dx * 0.35;
    }

    state.currentDrag = state.startTranslate + dampedDelta;
    applyTransform(state.currentDrag, false);
  }

  function onPointerUp(e) {
    if (!state.isDragging) {
      resetGesture();
      return;
    }

    const endX = e.clientX !== undefined ? e.clientX : state.lastX;
    const delta = endX - state.startX;
    const elapsed = Math.max(1, (e.timeStamp || 0) - state.startTime);
    const velocity = Math.abs(delta) / elapsed;

    resetGesture();

    const distanceThreshold = state.viewportWidth * SWIPE_THRESHOLD_RATIO;
    const isFlick = velocity >= FLICK_VELOCITY && Math.abs(delta) >= DIRECTION_LOCK * 2;

    if (delta <= -distanceThreshold || (isFlick && delta < 0)) {
      next();
    } else if (delta >= distanceThreshold || (isFlick && delta > 0)) {
      prev();
    } else {
      goTo(state.index, true);
    }
  }

  viewport.addEventListener("pointerdown", onPointerDown);
  viewport.addEventListener("pointermove", onPointerMove);
  viewport.addEventListener("pointerup", onPointerUp);
  viewport.addEventListener("pointercancel", resetGesture);
  viewport.addEventListener("pointerleave", (e) => {
    if (state.isDragging) onPointerUp(e);
    else resetGesture();
  });

  // evita que o navegador tente arrastar imagens/elementos nativamente
  viewport.addEventListener("dragstart", (e) => e.preventDefault());

  /* =====================================================
     RESIZE — recalcula largura e realinha sem transição
     ===================================================== */
  let resizeTimer = null;
  window.addEventListener("resize", () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      state.viewportWidth = viewport.getBoundingClientRect().width;
      goTo(state.index, false);
    }, 150);
  });

  /* =====================================================
     REVELAÇÃO POR SCROLL
     ===================================================== */
  if ("IntersectionObserver" in window) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          state.sectionInView = entry.isIntersecting;
          if (entry.isIntersecting) {
            section.classList.add("is-inview");
          }
        });
      },
      { threshold: 0.15 }
    );
    sectionObserver.observe(section);

    const slideObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-inview");
            entry.target.querySelectorAll(".reveal-up").forEach((el) => el.classList.add("is-visible"));
            slideObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.32 }
    );
    slides.forEach((slide) => slideObserver.observe(slide));

    const introWrap = section.querySelector(".services__intro");
    const introEls = section.querySelectorAll(".services__intro .reveal-up");
    if (introEls.length && introWrap) {
      const introObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              introEls.forEach((el) => el.classList.add("is-visible"));
              introObserver.disconnect();
            }
          });
        },
        { threshold: 0.4 }
      );
      introObserver.observe(introWrap);
    }
  } else {
    // fallback sem IntersectionObserver: revela tudo de imediato
    section.classList.add("is-inview");
    slides.forEach((slide) => {
      slide.classList.add("is-inview");
      slide.querySelectorAll(".reveal-up").forEach((el) => el.classList.add("is-visible"));
    });
    section.querySelectorAll(".reveal-up").forEach((el) => el.classList.add("is-visible"));
  }

  /* =====================================================
     TILT PREMIUM SUTIL NO VISUAL DO SLIDE ATIVO
     ===================================================== */
  if (!reduceMotion && window.matchMedia("(hover: hover)").matches) {
    track.style.perspective = "1400px";

    slides.forEach((slide) => {
      const visual = slide.querySelector(".service-slide__visual");
      if (!visual) return;

      visual.style.transformStyle = "preserve-3d";

      visual.addEventListener("mousemove", (e) => {
        const rect = visual.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;
        visual.style.transform = `rotateX(${py * -4}deg) rotateY(${px * 5}deg)`;
      });

      visual.addEventListener("mouseleave", () => {
        visual.style.transform = "";
      });
    });
  }

  /* =====================================================
     ESTADO INICIAL
     ===================================================== */
  goTo(0, false);
})();
