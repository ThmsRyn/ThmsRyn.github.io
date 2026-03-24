/**
 * UMAMI PROTOCOL — script.js
 * Fonctions : particules hero · stagger titres · scroll reveal ·
 *             nav hide/show · menu mobile · lignes or IntersectionObserver
 */

'use strict';

/* ── 1. UTILITAIRES ─────────────────────────────────────── */

/**
 * Exécute le callback une fois le DOM prêt.
 * @param {Function} fn
 */
function onReady(fn) {
  if (document.readyState !== 'loading') {
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
}

/**
 * Préfère-t-on les mouvements réduits ?
 * @returns {boolean}
 */
function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/* ── 2. PARTICULES HERO ──────────────────────────────────── */

function initParticules() {
  const conteneur = document.querySelector('.hero__particles');
  if (!conteneur) return;

  // Nombre réduit si prefers-reduced-motion
  const nombre = prefersReducedMotion() ? 8 : 40;

  for (let i = 0; i < nombre; i++) {
    const p = document.createElement('div');
    p.classList.add('hero-particule');

    // Taille aléatoire entre 1px et 3px
    const taille = Math.random() * 2 + 1;
    p.style.width  = taille + 'px';
    p.style.height = taille + 'px';

    // Position aléatoire
    p.style.left = Math.random() * 100 + '%';
    p.style.top  = (30 + Math.random() * 70) + '%';

    // Durée et délai d'animation aléatoires
    const duree = (6 + Math.random() * 8).toFixed(2) + 's';
    const delai = (Math.random() * 6).toFixed(2) + 's';
    const opacite = (0.15 + Math.random() * 0.4).toFixed(2);
    const derive  = -(80 + Math.random() * 120) + 'px';

    p.style.setProperty('--duree',   duree);
    p.style.setProperty('--delai',   delai);
    p.style.setProperty('--opacite', opacite);
    p.style.setProperty('--derive',  derive);

    // Légère variation de couleur sur certaines particules
    if (Math.random() > 0.7) {
      p.style.backgroundColor = 'rgba(248, 245, 238, 0.6)';
    }

    conteneur.appendChild(p);
  }
}

/* ── 3. STAGGER TITRE HERO ───────────────────────────────── */

function initStaggerTitre() {
  const lignes = document.querySelectorAll('.hero__titre-line');
  if (!lignes.length) return;

  if (prefersReducedMotion()) {
    // Afficher directement sans animation
    lignes.forEach(ligne => {
      ligne.style.opacity = '1';
    });
    return;
  }

  let delaiGlobal = 0.4; // délai de départ en secondes

  lignes.forEach((ligne, indexLigne) => {
    const texte = ligne.textContent;
    ligne.textContent = '';

    // Chaque lettre devient un span.char
    texte.split('').forEach((char, indexChar) => {
      const span = document.createElement('span');
      span.classList.add('char');
      span.textContent = char === ' ' ? '\u00A0' : char;

      const delaiChar = delaiGlobal + indexChar * 0.06 + indexLigne * 0.25;
      span.style.setProperty('--char-delai', delaiChar.toFixed(3) + 's');
      span.style.setProperty('--char-duree', '0.7s');

      ligne.appendChild(span);
    });

    // Décalage pour la deuxième ligne
    delaiGlobal += texte.length * 0.06 + 0.1;
  });
}

/* ── 4. SCROLL REVEAL (IntersectionObserver) ─────────────── */

function initScrollReveal() {
  const elements = document.querySelectorAll('.reveal');
  if (!elements.length) return;

  if (prefersReducedMotion()) {
    elements.forEach(el => el.classList.add('visible'));
    return;
  }

  const observateur = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observateur.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px',
    }
  );

  elements.forEach(el => observateur.observe(el));
}

/* ── 5. LIGNES OR — EXTENSION AU SCROLL ─────────────────── */

function initLignesOr() {
  const lignes = document.querySelectorAll('.ligne-or');
  if (!lignes.length) return;

  if (prefersReducedMotion()) {
    lignes.forEach(l => l.classList.add('animee'));
    return;
  }

  const observateur = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animee');
          observateur.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.5,
    }
  );

  lignes.forEach(l => observateur.observe(l));
}

/* ── 6. NAV HIDE / SHOW AU SCROLL ────────────────────────── */

function initNavScroll() {
  const nav = document.getElementById('nav-principal');
  if (!nav) return;

  let scrollPrecedent = 0;
  let ticking = false;
  const SEUIL_MASQUAGE = 120; // pixels avant de commencer à masquer

  function mettreAJourNav() {
    const scrollActuel = window.scrollY;

    // Fond de nav visible après 60px
    if (scrollActuel > 60) {
      nav.classList.add('nav--visible');
    } else {
      nav.classList.remove('nav--visible');
    }

    // Masquer au scroll vers le bas, réafficher au scroll vers le haut
    if (scrollActuel > SEUIL_MASQUAGE) {
      if (scrollActuel > scrollPrecedent) {
        nav.classList.add('nav--masquee');
      } else {
        nav.classList.remove('nav--masquee');
      }
    } else {
      nav.classList.remove('nav--masquee');
    }

    scrollPrecedent = scrollActuel;
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(mettreAJourNav);
      ticking = true;
    }
  }, { passive: true });
}

/* ── 7. MENU MOBILE (dialog natif) ───────────────────────── */

function initMenuMobile() {
  const burger  = document.getElementById('nav-burger');
  const dialog  = document.getElementById('nav-dialog');
  const fermer  = document.getElementById('nav-dialog-close');
  const liens   = dialog ? dialog.querySelectorAll('.nav-dialog__link') : [];

  if (!burger || !dialog) return;

  function ouvrirMenu() {
    dialog.showModal();
    burger.setAttribute('aria-expanded', 'true');
    document.documentElement.style.overflow = 'hidden';
  }

  function fermerMenu() {
    dialog.close();
    burger.setAttribute('aria-expanded', 'false');
    document.documentElement.style.overflow = '';
  }

  burger.addEventListener('click', ouvrirMenu);

  if (fermer) {
    fermer.addEventListener('click', fermerMenu);
  }

  // Fermer quand on clique sur un lien
  liens.forEach(lien => {
    lien.addEventListener('click', fermerMenu);
  });

  // Fermer au clic en dehors du contenu (sur le backdrop)
  dialog.addEventListener('click', (e) => {
    const rect = dialog.getBoundingClientRect();
    const estEndehors =
      e.clientX < rect.left ||
      e.clientX > rect.right ||
      e.clientY < rect.top  ||
      e.clientY > rect.bottom;

    if (estEndehors) {
      fermerMenu();
    }
  });

  // La touche Échap est gérée nativement par <dialog>
  dialog.addEventListener('close', () => {
    burger.setAttribute('aria-expanded', 'false');
    document.documentElement.style.overflow = '';
  });
}

/* ── 8. INTERACTION MENU PLATS ───────────────────────────── */
/**
 * Sur mobile (touch), un tap sur un plat l'ouvre/ferme.
 * Sur desktop, c'est géré par le CSS :hover.
 * On ajoute tabindex pour l'accessibilité clavier.
 */
function initMenuPlats() {
  const plats = document.querySelectorAll('.menu__plat');
  if (!plats.length) return;

  plats.forEach(plat => {
    // Rend chaque plat focusable au clavier
    if (!plat.hasAttribute('tabindex')) {
      plat.setAttribute('tabindex', '0');
    }

    // Gestion tactile : toggle la classe ouverte
    plat.addEventListener('touchstart', () => {
      plats.forEach(autre => {
        if (autre !== plat) autre.classList.remove('plat-ouvert');
      });
      plat.classList.toggle('plat-ouvert');
    }, { passive: true });
  });

  // Sur mobile, .plat-ouvert maintient la description visible
  // La règle CSS :hover gère le desktop, on injecte la règle mobile via JS
  const styleTag = document.createElement('style');
  styleTag.textContent = `.menu__plat.plat-ouvert .menu__plat-description { max-height: 400px; opacity: 1; }`;
  document.head.appendChild(styleTag);
}

/* ── 9. SMOOTH SCROLL INTERNE ────────────────────────────── */

function initSmoothScroll() {
  // Seulement pour les ancres internes
  document.querySelectorAll('a[href^="#"]').forEach(lien => {
    lien.addEventListener('click', (e) => {
      const cible = document.querySelector(lien.getAttribute('href'));
      if (!cible) return;

      e.preventDefault();

      const navHauteur = document.getElementById('nav-principal')?.offsetHeight || 72;
      const positionY  = cible.getBoundingClientRect().top + window.scrollY - navHauteur;

      window.scrollTo({
        top: positionY,
        behavior: prefersReducedMotion() ? 'auto' : 'smooth',
      });
    });
  });
}

/* ── 10. DATE MINIMUM DU FORMULAIRE ──────────────────────── */

function initFormDate() {
  const inputDate = document.getElementById('res-date');
  if (!inputDate) return;

  // Demain en ISO (yyyy-mm-dd)
  const demain = new Date();
  demain.setDate(demain.getDate() + 1);
  const iso = demain.toISOString().split('T')[0];
  inputDate.setAttribute('min', iso);
  inputDate.value = iso;
}

/* ── 11. INITIALISATION ──────────────────────────────────── */

onReady(() => {
  initParticules();
  initStaggerTitre();
  initScrollReveal();
  initLignesOr();
  initNavScroll();
  initMenuMobile();
  initMenuPlats();
  initSmoothScroll();
  initFormDate();
});
