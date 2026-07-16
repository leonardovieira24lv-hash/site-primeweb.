/* =====================================================
   PRIME WEB — SCROLL
   Estado do header ao rolar + leve parallax/fade do Hero.
   ===================================================== */

(function () {
  "use strict";

  const header = document.getElementById("header");
  const heroContent = document.querySelector(".hero__content");
  const heroScroll = document.querySelector(".hero__scroll");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const SCROLL_THRESHOLD = 12;
  let ticking = false;
  let lastY = window.scrollY || 0;

  function applyScrollEffects() {
    const y = window.scrollY || window.pageYOffset || 0;

    // header glass ao rolar
    if (header) {
      header.classList.toggle("is-scrolled", y > SCROLL_THRESHOLD);
    }

    // parallax + fade sutil do conteúdo do hero
    if (heroContent && !reduceMotion) {
      const vh = window.innerHeight || 800;
      const progress = Math.min(y / (vh * 0.8), 1);
      heroContent.style.transform = `translateY(${progress * 40}px)`;
      heroContent.style.opacity = String(1 - progress * 0.85);
    }

    // indicador de scroll desaparece assim que o usuário rola
    if (heroScroll) {
      const fade = Math.max(0, 1 - y / 160);
      heroScroll.style.opacity = String(fade);
    }

    lastY = y;
    ticking = false;
  }

  function onScroll() {
    if (!ticking) {
      window.requestAnimationFrame(applyScrollEffects);
      ticking = true;
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });

  // estado inicial correto mesmo se a página carregar já rolada
  applyScrollEffects();
})();
