/* ============================================================
   ATELIER MANE — script.js
   Fonctions :
   1. Sticky nav avec changement de style au scroll
   2. IntersectionObserver pour scroll-reveal (.reveal)
   3. Menu mobile (dialog)
   4. Fermeture menu mobile au clic sur un lien
   ============================================================ */

(function () {
  'use strict';

  /* ----------------------------------------------------------
     1. STICKY NAVIGATION — changement de style au scroll
  ---------------------------------------------------------- */

  var nav = document.getElementById('nav');

  if (nav) {
    var handleNavScroll = function () {
      if (window.scrollY > 60) {
        nav.classList.add('nav--scrolled');
      } else {
        nav.classList.remove('nav--scrolled');
      }
    };

    window.addEventListener('scroll', handleNavScroll, { passive: true });
    // Appel initial pour l'état correct au chargement
    handleNavScroll();
  }

  /* ----------------------------------------------------------
     2. SCROLL REVEAL — IntersectionObserver
  ---------------------------------------------------------- */

  var revealElements = document.querySelectorAll('.reveal');

  if (revealElements.length > 0 && 'IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            // Arrêter d'observer une fois révélé
            revealObserver.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px'
      }
    );

    revealElements.forEach(function (el) {
      revealObserver.observe(el);
    });
  } else {
    // Fallback : afficher tous les éléments si IntersectionObserver absent
    revealElements.forEach(function (el) {
      el.classList.add('visible');
    });
  }

  /* ----------------------------------------------------------
     3. MENU MOBILE — ouverture et fermeture
  ---------------------------------------------------------- */

  var burger = document.getElementById('burger');
  var navMobile = document.getElementById('nav-mobile');
  var navMobileClose = document.getElementById('nav-mobile-close');

  function openMobileMenu() {
    if (!navMobile) return;
    navMobile.showModal();
    burger.setAttribute('aria-expanded', 'true');
    document.documentElement.style.overflow = 'hidden';
  }

  function closeMobileMenu() {
    if (!navMobile) return;
    navMobile.close();
    burger.setAttribute('aria-expanded', 'false');
    document.documentElement.style.overflow = '';
    burger.focus();
  }

  if (burger && navMobile) {
    burger.addEventListener('click', openMobileMenu);
  }

  if (navMobileClose) {
    navMobileClose.addEventListener('click', closeMobileMenu);
  }

  // Fermeture via touche Échap (natif au <dialog> mais on remet
  // l'overflow et l'aria-expanded à jour)
  if (navMobile) {
    navMobile.addEventListener('close', function () {
      burger.setAttribute('aria-expanded', 'false');
      document.documentElement.style.overflow = '';
    });
  }

  /* ----------------------------------------------------------
     4. LIENS MOBILES — fermeture au clic sur un lien de navigation
  ---------------------------------------------------------- */

  var mobileLinks = document.querySelectorAll('.nav-mobile__link');

  mobileLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      closeMobileMenu();
    });
  });

  /* ----------------------------------------------------------
     5. SMOOTH SCROLL — compensation hauteur nav sticky
  ---------------------------------------------------------- */

  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var targetId = this.getAttribute('href');
      if (targetId === '#') return;

      var target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();

      var navHeight = nav ? nav.offsetHeight : 0;
      var targetTop = target.getBoundingClientRect().top + window.scrollY - navHeight - 8;

      window.scrollTo({
        top: targetTop,
        behavior: 'smooth'
      });
    });
  });

})();
