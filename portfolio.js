/* =====================================================
   PRIME WEB — PORTFÓLIO PREMIUM
   Revelação editorial por scroll, parallax sutil no canvas
   de cada estudo de caso e tilt premium no hover.
   Self-contained — segue o mesmo padrão de services.js.
   ===================================================== */

(function () {
  "use strict";

  const section = document.getElementById("trabalhos");
  if (!section) return;

  const intro = section.querySelector(".portfolio__intro");
  const cases = Array.from(section.querySelectorAll(".portfolio-case"));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const canHover = window.matchMedia("(hover: hover)").matches;

  /* =====================================================
     REVELAÇÃO DO CABEÇALHO DA SEÇÃO
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
     REVELAÇÃO DE CADA ESTUDO DE CASO
     ===================================================== */
  if ("IntersectionObserver" in window) {
    const caseObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-inview");
            entry.target
              .querySelectorAll(".reveal-up")
              .forEach((el) => el.classList.add("is-visible"));
            caseObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.28 }
    );
    cases.forEach((item) => caseObserver.observe(item));
  } else {
    cases.forEach((item) => {
      item.classList.add("is-inview");
      item.querySelectorAll(".reveal-up").forEach((el) => el.classList.add("is-visible"));
    });
  }

  /* =====================================================
     PARALLAX SUTIL — canvas de cada frame se move levemente
     conforme a posição de scroll dentro do viewport.
     ===================================================== */
  if (!reduceMotion) {
    const frames = cases
      .map((item) => ({
        item,
        canvas: item.querySelector(".portfolio-case__canvas"),
      }))
      .filter((entry) => entry.canvas);

    let ticking = false;

    function updateParallax() {
      const viewportH = window.innerHeight || document.documentElement.clientHeight;

      frames.forEach(({ item, canvas }) => {
        const rect = item.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > viewportH) return;

        const center = rect.top + rect.height / 2;
        const offset = (center - viewportH / 2) / viewportH; // aprox. -0.5 a 0.5
        const translate = offset * -10; // deslocamento sutil — reduzido para não colidir com o padding do palco (mockup exibido por inteiro, sem cover)
        canvas.style.transform = `translateY(${translate}px)`;
      });

      ticking = false;
    }

    function onScroll() {
      if (!ticking) {
        window.requestAnimationFrame(updateParallax);
        ticking = true;
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    updateParallax();
  }

  /* =====================================================
     TILT PREMIUM SUTIL NO FRAME (apenas com mouse/hover real)
     ===================================================== */
  if (!reduceMotion && canHover) {
    cases.forEach((item) => {
      const frame = item.querySelector(".portfolio-case__frame");
      if (!frame) return;

      frame.style.perspective = "1400px";

      frame.addEventListener("mousemove", (e) => {
        const rect = frame.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;
        frame.style.transform = `scale(1) rotateX(${py * -3.4}deg) rotateY(${px * 4.2}deg)`;
      });

      frame.addEventListener("mouseleave", () => {
        frame.style.transform = "";
      });
    });
  }
})();
