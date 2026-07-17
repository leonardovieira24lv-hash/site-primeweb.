/* =====================================================
   PRIME WEB — APP
   Orquestração geral: menu mobile, acessibilidade e
   revelação do conteúdo do Hero após a intro.
   ===================================================== */

(function () {
  "use strict";

  const body = document.body;

  /* =====================================================
     REVELAÇÃO DO HERO APÓS A INTRO
     ===================================================== */
  const revealEls = document.querySelectorAll(".reveal-up");
  const heroScroll = document.querySelector(".hero__scroll");

  function revealHero() {
    revealEls.forEach((el) => el.classList.add("is-visible"));
    if (heroScroll) {
      window.setTimeout(() => {
        heroScroll.style.transition = "opacity 700ms ease";
        heroScroll.style.opacity = "1";
      }, 500);
    }
  }

  document.addEventListener("prime:introComplete", revealHero, { once: true });

  // salvaguarda: se por algum motivo o evento não disparar, revela mesmo assim
  window.setTimeout(() => {
    if (!window.__primeIntroDone) {
      window.__primeIntroDone = true;
      body.classList.remove("is-loading");
      revealHero();
    }
  }, 3200);

  /* =====================================================
     MENU MOBILE
     ===================================================== */
  const burgerBtn = document.getElementById("burgerBtn");
  const mobileMenu = document.getElementById("mobileMenu");

  function openMenu() {
    body.classList.add("menu-open");
    burgerBtn.setAttribute("aria-expanded", "true");
    burgerBtn.setAttribute("aria-label", "Fechar menu");
    mobileMenu.setAttribute("aria-hidden", "false");
  }

  function closeMenu() {
    body.classList.remove("menu-open");
    burgerBtn.setAttribute("aria-expanded", "false");
    burgerBtn.setAttribute("aria-label", "Abrir menu");
    mobileMenu.setAttribute("aria-hidden", "true");
  }

  if (burgerBtn && mobileMenu) {
    burgerBtn.addEventListener("click", () => {
      const isOpen = body.classList.contains("menu-open");
      isOpen ? closeMenu() : openMenu();
    });

    mobileMenu.querySelectorAll(".mobile-menu__link, .mobile-menu__footer .btn").forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && body.classList.contains("menu-open")) {
        closeMenu();
        burgerBtn.focus();
      }
    });

    // fecha o menu automaticamente se a viewport crescer para desktop
    const desktopQuery = window.matchMedia("(min-width: 768px)");
    desktopQuery.addEventListener("change", (e) => {
      if (e.matches) closeMenu();
    });
  }

  /* =====================================================
     ANCORAGEM SUAVE COM OFFSET DE HEADER
     ===================================================== */
  const header = document.getElementById("header");

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const targetId = link.getAttribute("href");
      if (!targetId || targetId === "#") return;

      const target = document.querySelector(targetId);
      if (!target) return; // seção ainda não existe nesta sprint

      e.preventDefault();
      const headerH = header ? header.getBoundingClientRect().height : 0;
      const top = target.getBoundingClientRect().top + window.pageYOffset - headerH;

      window.scrollTo({ top, behavior: "smooth" });
    });
  });
})();
