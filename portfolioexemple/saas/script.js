/* ============================================================
   FLOWSYNC — SCRIPT.JS
   - Navigation glassmorphism au scroll
   - Menu mobile (dialog)
   - Scroll reveal (IntersectionObserver)
   - Compteurs animés (stats hero)
   - Toggle pricing mensuel/annuel
   - FAQ accordion
   ============================================================ */

'use strict';

/* ===== NAVIGATION : fond glassmorphism au scroll ===== */
(function initNavScroll() {
  const header = document.getElementById('site-header');
  if (!header) return;

  function onScroll() {
    if (window.scrollY > 20) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // état initial
})();


/* ===== MENU MOBILE ===== */
(function initMobileMenu() {
  const burger  = document.querySelector('.nav-burger');
  const dialog  = document.getElementById('mobile-menu');
  const closeBtn = dialog ? dialog.querySelector('.mobile-nav-close') : null;
  const mobileLinks = dialog ? dialog.querySelectorAll('.mobile-nav-link, .mobile-nav-actions a') : [];

  if (!burger || !dialog) return;

  function openMenu() {
    dialog.showModal();
    burger.setAttribute('aria-expanded', 'true');
    document.documentElement.style.overflow = 'hidden';
  }

  function closeMenu() {
    dialog.close();
    burger.setAttribute('aria-expanded', 'false');
    document.documentElement.style.overflow = '';
  }

  burger.addEventListener('click', openMenu);

  if (closeBtn) {
    closeBtn.addEventListener('click', closeMenu);
  }

  // Fermeture en cliquant sur le backdrop
  dialog.addEventListener('click', function(e) {
    const rect = dialog.getBoundingClientRect();
    const outside = (
      e.clientX < rect.left ||
      e.clientX > rect.right ||
      e.clientY < rect.top  ||
      e.clientY > rect.bottom
    );
    if (outside) closeMenu();
  });

  // Fermeture quand on clique un lien de navigation
  mobileLinks.forEach(function(link) {
    link.addEventListener('click', closeMenu);
  });

  // Fermeture via Echap (natif sur dialog, mais on remet l'overflow)
  dialog.addEventListener('cancel', function() {
    burger.setAttribute('aria-expanded', 'false');
    document.documentElement.style.overflow = '';
  });
})();


/* ===== SCROLL REVEAL ===== */
(function initScrollReveal() {
  const elements = document.querySelectorAll('.reveal');
  if (!elements.length) return;

  // Pas d'observer si l'utilisateur préfère réduire les animations
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) {
    elements.forEach(function(el) { el.classList.add('visible'); });
    return;
  }

  const observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  elements.forEach(function(el) { observer.observe(el); });
})();


/* ===== COMPTEURS ANIMES (hero stats) ===== */
(function initCounters() {
  const statNumbers = document.querySelectorAll('.stat-number[data-target]');
  if (!statNumbers.length) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function easeOutQuad(t) {
    return t * (2 - t);
  }

  function animateCounter(el) {
    const target = parseInt(el.getAttribute('data-target'), 10);
    const duration = 1800;
    const startTime = performance.now();

    function formatNumber(n) {
      if (n >= 1000) {
        return (n / 1000).toFixed(0) + ' 000';
      }
      return String(n);
    }

    function tick(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutQuad(progress);
      const current = Math.round(eased * target);
      el.textContent = formatNumber(current);
      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        el.textContent = formatNumber(target);
      }
    }

    requestAnimationFrame(tick);
  }

  if (prefersReduced) {
    statNumbers.forEach(function(el) {
      const target = parseInt(el.getAttribute('data-target'), 10);
      if (target >= 1000) {
        el.textContent = (target / 1000).toFixed(0) + ' 000';
      } else {
        el.textContent = String(target);
      }
    });
    return;
  }

  // Observer : déclenche l'animation quand la section hero est visible
  const heroSection = document.getElementById('hero');
  if (!heroSection) return;

  let countersStarted = false;

  const observer = new IntersectionObserver(function(entries) {
    if (entries[0].isIntersecting && !countersStarted) {
      countersStarted = true;
      // Délai de 400ms pour laisser l'animation hero se lancer d'abord
      setTimeout(function() {
        statNumbers.forEach(animateCounter);
      }, 400);
      observer.disconnect();
    }
  }, { threshold: 0.3 });

  observer.observe(heroSection);
})();


/* ===== TOGGLE PRICING MENSUEL / ANNUEL ===== */
(function initPricingToggle() {
  const switchBtn = document.getElementById('pricing-switch');
  if (!switchBtn) return;

  const amounts = document.querySelectorAll('.pricing-amount[data-monthly][data-annual]');
  let isAnnual = false;

  function updatePrices() {
    amounts.forEach(function(el) {
      const monthly = el.getAttribute('data-monthly');
      const annual  = el.getAttribute('data-annual');
      const value   = isAnnual ? annual : monthly;

      // Petit flash de transition
      el.style.opacity = '0';
      setTimeout(function() {
        el.textContent = value;
        el.style.opacity = '1';
      }, 150);
    });
  }

  switchBtn.addEventListener('click', function() {
    isAnnual = !isAnnual;
    switchBtn.setAttribute('aria-checked', String(isAnnual));
    updatePrices();
  });
})();


/* ===== FAQ ACCORDION ===== */
(function initFaqAccordion() {
  const questions = document.querySelectorAll('.faq-question');
  if (!questions.length) return;

  questions.forEach(function(btn) {
    btn.addEventListener('click', function() {
      const expanded  = btn.getAttribute('aria-expanded') === 'true';
      const answerId  = btn.getAttribute('aria-controls');
      const answerEl  = document.getElementById(answerId);
      if (!answerEl) return;

      // Fermer tous les autres
      questions.forEach(function(otherBtn) {
        if (otherBtn === btn) return;
        otherBtn.setAttribute('aria-expanded', 'false');
        const otherId = otherBtn.getAttribute('aria-controls');
        const otherEl = document.getElementById(otherId);
        if (otherEl) otherEl.classList.remove('open');
      });

      // Basculer l'item courant
      const newExpanded = !expanded;
      btn.setAttribute('aria-expanded', String(newExpanded));
      if (newExpanded) {
        answerEl.classList.add('open');
      } else {
        answerEl.classList.remove('open');
      }
    });
  });
})();


/* ===== SCROLL DOUX SUR LES ANCRES (complement CSS scroll-behavior) ===== */
(function initSmoothAnchorScroll() {
  const NAV_HEIGHT = 80;

  document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
    anchor.addEventListener('click', function(e) {
      const href = anchor.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - NAV_HEIGHT;
      window.scrollTo({ top: top, behavior: 'smooth' });
    });
  });
})();
