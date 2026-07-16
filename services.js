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
    isDragging: false,
    startX: 0,
    startTranslate: 0,
    currentDrag: 0,
    sectionInView: false,
  };

  /* =====================================================
     NAVEGAÇÃO PRINCIPAL
     ===================================================== */
  function applyTransform(px, withTransition) {
    track.style.transition = withTransition && !reduceMotion
      ? "transform 620ms cubic-bezier(.16,.8,.24,1)"
      : "none";
    track.style.transform = `translateX(${px}px)`;
  }

  function goTo(index, withTransition) {
    state.index = ((index % total) + total) % total; // wrap-around
    const px = -state.index * state.viewportWidth;
    applyTransform(px, withTransition !== false);
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
  function onPointerDown(e) {
    state.isDragging = true;
    state.startX = e.clientX;
    state.startTranslate = -state.index * state.viewportWidth;
    state.currentDrag = state.startTranslate;
    viewport.classList.add("is-dragging");
    applyTransform(state.currentDrag, false);
    if (viewport.setPointerCapture && e.pointerId !== undefined) {
      try { viewport.setPointerCapture(e.pointerId); } catch (err) { /* noop */ }
    }
  }

  function onPointerMove(e) {
    if (!state.isDragging) return;
    const delta = e.clientX - state.startX;

    // resistência sutil ao arrastar além das bordas
    let dampedDelta = delta;
    if ((state.index === 0 && delta > 0) || (state.index === total - 1 && delta < 0)) {
      dampedDelta = delta * 0.35;
    }

    state.currentDrag = state.startTranslate + dampedDelta;
    applyTransform(state.currentDrag, false);
  }

  function onPointerUp(e) {
    if (!state.isDragging) return;
    state.isDragging = false;
    viewport.classList.remove("is-dragging");

    const delta = (e.clientX !== undefined ? e.clientX : state.startX) - state.startX;
    const threshold = state.viewportWidth * 0.16;

    if (delta <= -threshold) {
      next();
    } else if (delta >= threshold) {
      prev();
    } else {
      goTo(state.index, true);
    }
  }

  viewport.addEventListener("pointerdown", onPointerDown);
  viewport.addEventListener("pointermove", onPointerMove);
  viewport.addEventListener("pointerup", onPointerUp);
  viewport.addEventListener("pointercancel", onPointerUp);
  viewport.addEventListener("pointerleave", (e) => {
    if (state.isDragging) onPointerUp(e);
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
