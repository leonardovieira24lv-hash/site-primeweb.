/* =====================================================
   PRIME WEB — CURSOR PERSONALIZADO
   Dot + ring com interpolação (lerp) para movimento suave.
   Desativado automaticamente em dispositivos touch.
   ===================================================== */

(function () {
  "use strict";

  const isTouch = window.matchMedia("(hover: none), (pointer: coarse)").matches;
  if (isTouch) return;

  const dot = document.getElementById("cursorDot");
  const ring = document.getElementById("cursorRing");
  if (!dot || !ring) return;

  const state = {
    mouseX: window.innerWidth / 2,
    mouseY: window.innerHeight / 2,
    dotX: window.innerWidth / 2,
    dotY: window.innerHeight / 2,
    ringX: window.innerWidth / 2,
    ringY: window.innerHeight / 2,
    active: false,
  };

  window.PrimeCursor = state;

  function onMove(e) {
    state.mouseX = e.clientX;
    state.mouseY = e.clientY;
    if (!state.active) {
      state.active = true;
      document.body.classList.add("cursor-active");
    }
  }

  window.addEventListener("mousemove", onMove, { passive: true });
  window.addEventListener("mouseleave", () => {
    document.body.classList.remove("cursor-active");
  });

  const HOVER_SELECTOR = "a, button, .btn, [data-cursor-hover]";

  document.addEventListener("mouseover", (e) => {
    if (e.target.closest && e.target.closest(HOVER_SELECTOR)) {
      document.body.classList.add("cursor-hover");
    }
  });

  document.addEventListener("mouseout", (e) => {
    if (e.target.closest && e.target.closest(HOVER_SELECTOR)) {
      document.body.classList.remove("cursor-hover");
    }
  });

  function loop() {
    // dot: resposta quase imediata
    state.dotX += (state.mouseX - state.dotX) * 0.32;
    state.dotY += (state.mouseY - state.dotY) * 0.32;

    // ring: leve atraso, sensação "premium"
    state.ringX += (state.mouseX - state.ringX) * 0.14;
    state.ringY += (state.mouseY - state.ringY) * 0.14;

    dot.style.transform = `translate(${state.dotX}px, ${state.dotY}px) translate(-50%, -50%)`;
    ring.style.transform = `translate(${state.ringX}px, ${state.ringY}px) translate(-50%, -50%)`;

    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);
})();
