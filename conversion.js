/* =====================================================
   PRIME WEB — CONVERSÃO
   Banner Premium · CTA Final · FAQ · Contato · WhatsApp
   Self-contained — segue o mesmo padrão dos demais módulos.
   ===================================================== */

(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* =====================================================
     UTIL — reveal genérico via IntersectionObserver
     ===================================================== */
  function revealOnce(el, threshold) {
    if (!el) return;
    if (!("IntersectionObserver" in window)) {
      el.classList.add("is-visible");
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            el.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: threshold || 0.3 }
    );
    obs.observe(el);
  }

  /* =====================================================
     01 — BANNER PREMIUM
     ===================================================== */
  (function initBanner() {
    const section = document.getElementById("banner-promo");
    if (!section) return;

    const frame = section.querySelector(".banner-promo__frame");
    if (frame && "IntersectionObserver" in window) {
      const obs = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              frame.classList.add("is-inview");
              obs.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.25 }
      );
      obs.observe(frame);
    } else if (frame) {
      frame.classList.add("is-inview");
    }

    if (!reduceMotion) {
      const media = section.querySelector(".banner-promo__media img");
      if (media) {
        let ticking = false;
        function update() {
          const rect = section.getBoundingClientRect();
          const vh = window.innerHeight || document.documentElement.clientHeight;
          if (rect.bottom < 0 || rect.top > vh) { ticking = false; return; }
          const progress = (vh - rect.top) / (rect.height + vh);
          const translate = (progress - 0.5) * 30;
          media.style.transform = `translateY(${translate}px) scale(1.08)`;
          ticking = false;
        }
        window.addEventListener("scroll", () => {
          if (!ticking) { window.requestAnimationFrame(update); ticking = true; }
        }, { passive: true });
        window.addEventListener("resize", update);
        update();
      }
    }
  })();

  /* =====================================================
     02 — CTA FINAL
     ===================================================== */
  (function initCtaFinal() {
    const section = document.getElementById("cta-final");
    if (!section) return;

    section.querySelectorAll(".reveal-up").forEach((el) => revealOnce(el, 0.3));

    if (reduceMotion) return;

    const field = section.querySelector(".cta-final__particles");
    if (!field) return;

    const count = 18;
    for (let i = 0; i < count; i++) {
      const p = document.createElement("span");
      p.className = "cta-final__particle";
      const size = 2 + Math.random() * 3;
      p.style.width = `${size}px`;
      p.style.height = `${size}px`;
      p.style.left = `${Math.random() * 100}%`;
      p.style.bottom = `${-10 - Math.random() * 20}%`;
      p.style.animationDuration = `${8 + Math.random() * 9}s`;
      p.style.animationDelay = `${Math.random() * 9}s`;
      field.appendChild(p);
    }
  })();

  /* =====================================================
     03 — FAQ (accordion premium, um item aberto por vez)
     ===================================================== */
  (function initFaq() {
    const section = document.getElementById("faq");
    if (!section) return;

    section.querySelectorAll(".reveal-up").forEach((el) => revealOnce(el, 0.3));

    const items = Array.from(section.querySelectorAll(".faq-item"));

    items.forEach((item, i) => {
      // stagger sutil na revelação de cada pergunta
      window.setTimeout(() => revealOnce(item, 0.15), 0);

      const trigger = item.querySelector(".faq-item__trigger");
      if (!trigger) return;

      trigger.addEventListener("click", () => {
        const isOpen = item.classList.contains("is-open");

        items.forEach((other) => {
          other.classList.remove("is-open");
          const otherTrigger = other.querySelector(".faq-item__trigger");
          if (otherTrigger) otherTrigger.setAttribute("aria-expanded", "false");
        });

        if (!isOpen) {
          item.classList.add("is-open");
          trigger.setAttribute("aria-expanded", "true");
        }
      });
    });
  })();

  /* =====================================================
     04 — CONTATO
     ===================================================== */
  (function initContact() {
    const section = document.getElementById("contato");
    if (!section) return;

    section.querySelectorAll(".reveal-up").forEach((el) => revealOnce(el, 0.25));

    const form = section.querySelector(".contact-form");
    if (!form) return;

    const submitBtn = form.querySelector(".contact-form__submit");
    const label = form.querySelector(".contact-form__submit-label");
    const note = form.querySelector(".contact-form__note");
    const defaultLabel = label ? label.textContent : "";

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (form.classList.contains("is-sending")) return;

      form.classList.add("is-sending");
      if (label) label.textContent = "Enviando...";
      if (note) {
        note.textContent = "";
        note.classList.remove("is-success");
      }

      window.setTimeout(() => {
        form.classList.remove("is-sending");
        if (label) label.textContent = defaultLabel;
        if (note) {
          note.textContent = "Mensagem recebida — entraremos em contato em breve.";
          note.classList.add("is-success");
        }
        form.reset();
      }, 1400);
    });
  })();
})();
