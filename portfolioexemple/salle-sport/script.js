/**
 * Iron District — script.js
 * Vanilla JS pur. Pas de framework.
 *
 * Fonctionnalités :
 * - Navigation sticky avec changement d'état au scroll
 * - Menu mobile (dialog natif)
 * - Scroll-spy pour mettre en évidence le lien actif
 * - Scroll reveal : fade + translateY via IntersectionObserver
 * - Diviseurs animés via IntersectionObserver
 * - Compteurs animés (0 → valeur cible en 2s) via IntersectionObserver
 * - Fermeture du menu mobile au clic sur un lien
 * - Scroll smooth vers les ancres
 */

(function () {
  'use strict';

  /* ==========================================================
     UTILITAIRES
     ========================================================== */

  /**
   * Easing quadratique pour les compteurs.
   * @param {number} t — progression normalisée [0, 1]
   * @returns {number}
   */
  function easeOutQuad(t) {
    return t * (2 - t);
  }

  /**
   * Anime un nombre de 0 vers une valeur cible en un temps donné.
   * @param {HTMLElement} el — élément DOM dont le textContent sera mis à jour
   * @param {number} target — valeur cible
   * @param {number} duration — durée en ms
   */
  function animateCounter(el, target, duration) {
    var startTime = null;

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var elapsed = timestamp - startTime;
      var progress = Math.min(elapsed / duration, 1);
      var eased = easeOutQuad(progress);
      var current = Math.round(eased * target);
      el.textContent = current;

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = target;
      }
    }

    requestAnimationFrame(step);
  }

  /* ==========================================================
     1. NAVIGATION STICKY
     ========================================================== */

  var nav = document.getElementById('site-nav');

  function updateNav() {
    if (!nav) return;
    if (window.scrollY > 40) {
      nav.classList.add('is-scrolled');
    } else {
      nav.classList.remove('is-scrolled');
    }
  }

  window.addEventListener('scroll', updateNav, { passive: true });
  updateNav();

  /* ==========================================================
     2. MENU MOBILE
     ========================================================== */

  var burger = document.querySelector('.nav-burger');
  var mobileDialog = document.getElementById('nav-mobile');
  var mobileClose = document.querySelector('.nav-mobile-close');
  var mobileLinks = document.querySelectorAll('.nav-mobile-link');
  var mobileCta = document.querySelector('.nav-mobile-cta');

  /**
   * Ouvre le menu mobile.
   */
  function openMobileMenu() {
    if (!mobileDialog) return;
    mobileDialog.showModal();
    document.documentElement.style.overflow = 'hidden';
    if (burger) {
      burger.setAttribute('aria-expanded', 'true');
    }
  }

  /**
   * Ferme le menu mobile.
   */
  function closeMobileMenu() {
    if (!mobileDialog) return;
    mobileDialog.close();
    document.documentElement.style.overflow = '';
    if (burger) {
      burger.setAttribute('aria-expanded', 'false');
    }
  }

  if (burger) {
    burger.addEventListener('click', openMobileMenu);
  }

  if (mobileClose) {
    mobileClose.addEventListener('click', closeMobileMenu);
  }

  /* Fermer au clic sur un lien du menu mobile */
  mobileLinks.forEach(function (link) {
    link.addEventListener('click', closeMobileMenu);
  });

  if (mobileCta) {
    mobileCta.addEventListener('click', closeMobileMenu);
  }

  /* Fermer au clic sur le backdrop du dialog */
  if (mobileDialog) {
    mobileDialog.addEventListener('click', function (e) {
      if (e.target === mobileDialog) {
        closeMobileMenu();
      }
    });
  }

  /* ==========================================================
     3. SCROLL-SPY — lien actif dans la navigation
     ========================================================== */

  var navLinks = document.querySelectorAll('.nav-link');
  var sections = [];

  navLinks.forEach(function (link) {
    var href = link.getAttribute('href');
    if (href && href.startsWith('#')) {
      var targetId = href.slice(1);
      var section = document.getElementById(targetId);
      if (section) {
        sections.push({ link: link, section: section });
      }
    }
  });

  function updateActiveLink() {
    var scrollPos = window.scrollY + 120; /* offset nav height */

    sections.forEach(function (item) {
      var top = item.section.offsetTop;
      var bottom = top + item.section.offsetHeight;

      if (scrollPos >= top && scrollPos < bottom) {
        navLinks.forEach(function (l) { l.classList.remove('is-active'); });
        item.link.classList.add('is-active');
      }
    });
  }

  window.addEventListener('scroll', updateActiveLink, { passive: true });
  updateActiveLink();

  /* ==========================================================
     4. SCROLL REVEAL — IntersectionObserver
     ========================================================== */

  var revealItems = document.querySelectorAll('.reveal-item');

  if ('IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -60px 0px'
      }
    );

    revealItems.forEach(function (item) {
      revealObserver.observe(item);
    });
  } else {
    /* Fallback navigateurs sans IntersectionObserver */
    revealItems.forEach(function (item) {
      item.classList.add('is-revealed');
    });
  }

  /* ==========================================================
     5. DIVISEURS ANIMES — expansion horizontale au scroll
     ========================================================== */

  var dividers = document.querySelectorAll('.section-divider');

  if ('IntersectionObserver' in window) {
    var dividerObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            dividerObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    dividers.forEach(function (divider) {
      dividerObserver.observe(divider);
    });
  } else {
    dividers.forEach(function (divider) {
      divider.classList.add('is-visible');
    });
  }

  /* ==========================================================
     6. COMPTEURS ANIMES — IntersectionObserver
     ========================================================== */

  var counterEls = document.querySelectorAll('.counter-number, .hero-stat-number');
  var triggered = new WeakSet();

  if ('IntersectionObserver' in window) {
    var counterObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting && !triggered.has(entry.target)) {
            triggered.add(entry.target);
            var target = parseInt(entry.target.getAttribute('data-target'), 10);
            if (!isNaN(target)) {
              animateCounter(entry.target, target, 2000);
            }
            counterObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    counterEls.forEach(function (el) {
      var target = el.getAttribute('data-target');
      if (target) {
        el.textContent = '0';
        counterObserver.observe(el);
      }
    });
  } else {
    /* Fallback : afficher directement la valeur cible */
    counterEls.forEach(function (el) {
      var target = el.getAttribute('data-target');
      if (target) {
        el.textContent = target;
      }
    });
  }

  /* ==========================================================
     7. SMOOTH SCROLL — ancres internes
     ========================================================== */

  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var href = anchor.getAttribute('href');
      if (!href || href === '#') return;

      var target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();

      var navHeight = nav ? nav.offsetHeight : 72;
      var targetTop = target.getBoundingClientRect().top + window.scrollY - navHeight;

      window.scrollTo({
        top: targetTop,
        behavior: 'smooth'
      });
    });
  });

  /* ==========================================================
     8. FORMULAIRE — feedback visuel basique
     ========================================================== */

  var contactForm = document.querySelector('.contact-form');

  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();

      var submitBtn = contactForm.querySelector('[type="submit"]');
      if (!submitBtn) return;

      var originalText = submitBtn.textContent;
      submitBtn.textContent = 'Message envoyé !';
      submitBtn.disabled = true;
      submitBtn.style.background = '#27AE60';
      submitBtn.style.borderColor = '#27AE60';

      setTimeout(function () {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        submitBtn.style.background = '';
        submitBtn.style.borderColor = '';
        contactForm.reset();
      }, 3000);
    });
  }

  /* ==========================================================
     9. PLANNING — highlight ligne au hover (mobile touch)
     ========================================================== */

  var planningRows = document.querySelectorAll('.planning-row');

  planningRows.forEach(function (row) {
    row.addEventListener('touchstart', function () {
      planningRows.forEach(function (r) { r.classList.remove('is-touch-hover'); });
      row.classList.add('is-touch-hover');
    }, { passive: true });
  });

})();
