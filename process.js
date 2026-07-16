/* =====================================================
   PRIME WEB — PROCESSO DE TRABALHO
   A espinha dourada é "desenhada" conforme o scroll avança
   pela seção; cada nó acende quando a linha o alcança.
   Self-contained — segue o mesmo padrão de portfolio.js.
   ===================================================== */

(function () {
  "use strict";

  const section = document.getElementById("processo");
  if (!section) return;

  const intro = section.querySelector(".process__intro");
  const timeline = section.querySelector(".process__timeline");
  const spineFill = section.querySelector(".process__spine-fill");
  const steps = Array.from(section.querySelectorAll(".process-step"));
  const nodes = steps.map((step) => step.querySelector(".process-step__node"));

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* =====================================================
     REVELAÇÃO DO CABEÇALHO
     ===================================================== */
  if ("IntersectionObserver" in window && intro) {
    const introEls = intro.querySelectorAll(".reveal-up");
    if (introEls.length) {
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
      introObserver.observe(intro);
    }
  } else if (intro) {
    intro.querySelectorAll(".reveal-up").forEach((el) => el.classList.add("is-visible"));
  }

  /* =====================================================
     REVELAÇÃO DE CADA ETAPA (uma única vez)
     ===================================================== */
  if ("IntersectionObserver" in window) {
    const stepObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target
              .querySelectorAll(".reveal-up")
              .forEach((el) => el.classList.add("is-visible"));
            stepObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.35 }
    );
    steps.forEach((step) => stepObserver.observe(step));
  } else {
    steps.forEach((step) => {
      step.querySelectorAll(".reveal-up").forEach((el) => el.classList.add("is-visible"));
    });
  }

  /* =====================================================
     LINHA DOURADA — desenhada conforme o scroll avança
     pela extensão da timeline, com ativação progressiva
     dos nós de cada etapa.
     ===================================================== */
  if (reduceMotion || !timeline || !spineFill) {
    // sem motion: linha completa e todas as etapas já ativas
    if (spineFill) spineFill.style.transform = "scaleY(1)";
    steps.forEach((step) => step.classList.add("is-active"));
    return;
  }

  let nodeRatios = [];
  let targetProgress = 0;
  let renderedProgress = 0;
  let rafId = null;

  function measure() {
    const timelineRect = timeline.getBoundingClientRect();
    const timelineTop = timelineRect.top + window.scrollY;
    const timelineHeight = timelineRect.height || 1;

    nodeRatios = nodes.map((node) => {
      if (!node) return 0;
      const nodeRect = node.getBoundingClientRect();
      const nodeTop = nodeRect.top + window.scrollY;
      return Math.min(1, Math.max(0, (nodeTop - timelineTop) / timelineHeight));
    });
  }

  function computeTarget() {
    const rect = timeline.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight;
    // progresso 0 -> 1 conforme a timeline atravessa o viewport
    targetProgress = Math.min(1, Math.max(0, (vh - rect.top) / (rect.height + vh)));
  }

  function render() {
    // interpolação suave: a linha "persegue" o progresso real do scroll,
    // criando uma sensação fluida em vez de um acompanhamento 1:1 abrupto
    const diff = targetProgress - renderedProgress;
    if (Math.abs(diff) < 0.0008) {
      renderedProgress = targetProgress;
    } else {
      renderedProgress += diff * 0.16;
    }

    spineFill.style.transform = `scaleY(${renderedProgress})`;

    steps.forEach((step, i) => {
      step.classList.toggle("is-active", renderedProgress >= nodeRatios[i]);
    });

    if (Math.abs(targetProgress - renderedProgress) > 0.0005) {
      rafId = window.requestAnimationFrame(render);
    } else {
      rafId = null;
    }
  }

  function update() {
    computeTarget();
    if (!rafId) rafId = window.requestAnimationFrame(render);
  }

  let ticking = false;
  function onScroll() {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        update();
        ticking = false;
      });
      ticking = true;
    }
  }

  let resizeTimer = null;
  function onResize() {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      measure();
      update();
    }, 150);
  }

  measure();
  computeTarget();
  renderedProgress = targetProgress;
  spineFill.style.transform = `scaleY(${renderedProgress})`;

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onResize);
})();
