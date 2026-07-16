/* =====================================================
   PRIME WEB — INTRO
   Sequência: tela preta > desenho da marca > tipografia > fade out.
   Duração alvo: ~2s antes do fade final revelar o Hero.
   Dispara o evento "prime:introComplete" ao terminar.
   ===================================================== */

(function () {
  "use strict";

  const intro = document.getElementById("intro");
  const body = document.body;

  function finish() {
    body.classList.remove("is-loading");
    document.dispatchEvent(new CustomEvent("prime:introComplete"));
  }

  // Usuários que preferem menos movimento: pula direto para o Hero.
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!intro || reduceMotion) {
    if (intro) {
      intro.classList.add("is-hidden");
      intro.setAttribute("aria-hidden", "true");
    }
    finish();
    return;
  }

  const TIMING = {
    draw: 60,     // início do desenho da marca
    type: 700,    // início da tipografia (PRIME WEB)
    hide: 1460,   // início do fade-out da intro
    done: 2120,   // intro totalmente oculta / hero liberado
  };

  window.setTimeout(() => intro.classList.add("is-drawing"), TIMING.draw);
  window.setTimeout(() => intro.classList.add("is-typing"), TIMING.type);

  window.setTimeout(() => {
    intro.classList.add("is-hidden");
    intro.setAttribute("aria-hidden", "true");
  }, TIMING.hide);

  window.setTimeout(finish, TIMING.done);
})();
