/* =====================================================
   PRIME WEB — FOOTER PREMIUM
   Revelação por scroll e ano de copyright automático.
   Self-contained — segue o mesmo padrão dos demais módulos.
   ===================================================== */

(function () {
  "use strict";

  const footer = document.querySelector(".site-footer");
  if (!footer) return;

  /* ano de copyright sempre atualizado */
  const yearEl = footer.querySelector("[data-current-year]");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  /* revelação suave dos blocos do footer */
  const revealEls = footer.querySelectorAll(".reveal-up");
  if (!revealEls.length) return;

  if (!("IntersectionObserver" in window)) {
    revealEls.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  revealEls.forEach((el) => observer.observe(el));
})();
