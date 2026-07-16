/* =====================================================
   PRIME WEB — POR QUE ESCOLHER A PRIME WEB
   Revelação editorial por scroll, parallax sutil no canvas
   de cada bloco e glow discreto no numeral ao entrar em vista.
   Self-contained — segue o mesmo padrão de portfolio.js.
   ===================================================== */

(function () {
  "use strict";

  const section = document.getElementById("porque");
  if (!section) return;

  const intro = section.querySelector(".why__intro");
  const blocks = Array.from(section.querySelectorAll(".why-block"));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const canHover = window.matchMedia("(hover: hover)").matches;

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
     REVELAÇÃO + GLOW DE CADA BLOCO
     ===================================================== */
  if ("IntersectionObserver" in window) {
    const blockObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-inview", "is-active");
            entry.target
              .querySelectorAll(".reveal-up")
              .forEach((el) => el.classList.add("is-visible"));
            blockObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );
    blocks.forEach((block) => blockObserver.observe(block));
  } else {
    blocks.forEach((block) => {
      block.classList.add("is-inview", "is-active");
      block.querySelectorAll(".reveal-up").forEach((el) => el.classList.add("is-visible"));
    });
  }

  /* =====================================================
     PARALLAX SUTIL — canvas de cada visual se move levemente
     conforme a posição de scroll dentro do viewport.
     ===================================================== */
  if (!reduceMotion) {
    const canvases = blocks
      .map((block) => ({
        block,
        canvas: block.querySelector(".why-block__canvas"),
      }))
      .filter((entry) => entry.canvas);

    let ticking = false;

    function updateParallax() {
      const viewportH = window.innerHeight || document.documentElement.clientHeight;

      canvases.forEach(({ block, canvas }) => {
        const rect = block.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > viewportH) return;

        const center = rect.top + rect.height / 2;
        const offset = (center - viewportH / 2) / viewportH;
        const translate = offset * -22;
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
     HOVER SOFISTICADO — leve tilt no visual (apenas com
     mouse/hover real, sem motion reduzido)
     ===================================================== */
  if (!reduceMotion && canHover) {
    blocks.forEach((block) => {
      const visual = block.querySelector(".why-block__visual");
      if (!visual) return;

      visual.style.perspective = "1400px";
      visual.style.transformStyle = "preserve-3d";

      visual.addEventListener("mousemove", (e) => {
        const rect = visual.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;
        visual.style.transform = `scale(1) rotateX(${py * -3}deg) rotateY(${px * 3.6}deg)`;
      });

      visual.addEventListener("mouseleave", () => {
        visual.style.transform = "";
      });
    });
  }
})();
