/* ===== SCROLL PROGRESS BAR ===== */
(function () {
  const bar = document.createElement('div');
  bar.className = 'scroll-progress';
  document.body.prepend(bar);

  function updateProgress() {
    const scrollTop  = window.scrollY;
    const docHeight  = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width  = (docHeight > 0 ? (scrollTop / docHeight) * 100 : 0) + '%';
  }

  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();
})();


/* ===== LANGUAGE SWITCH ===== */
let currentLang = 'fr';

function setLang(lang) {
  currentLang = lang;
  document.documentElement.lang = lang;

  document.querySelectorAll('[data-fr][data-en]').forEach(el => {
    el.textContent = el.dataset[lang];
  });

  // Drapeau : si on est en FR → on propose EN (drapeau UK), si EN → on propose FR (drapeau FR)
  const btn   = document.getElementById('lang-toggle');
  const flag  = btn.querySelector('.lang-flag');
  const label = btn.querySelector('.lang-label');
  if (lang === 'fr') {
    flag.textContent  = '🇬🇧';
    label.textContent = 'EN';
    btn.setAttribute('aria-label', 'Switch to English');
  } else {
    flag.textContent  = '🇫🇷';
    label.textContent = 'FR';
    btn.setAttribute('aria-label', 'Passer en français');
  }

  try { localStorage.setItem('portfolio-lang', lang); } catch (e) {}
}

document.getElementById('lang-toggle').addEventListener('click', () => {
  setLang(currentLang === 'fr' ? 'en' : 'fr');
});

try {
  const saved = localStorage.getItem('portfolio-lang');
  if (saved && saved !== 'fr') setLang(saved);
} catch (e) {}


/* ===== TYPING EFFECT ON HERO-SUB ===== */
(function () {
  const el = document.querySelector('.hero-sub');
  if (!el) return;

  const textFr = el.getAttribute('data-fr') || el.textContent.trim();
  const textEn = el.getAttribute('data-en') || textFr;

  function typeText(text) {
    el.textContent = '';
    el.style.borderRight = '2px solid #cc0000';
    el.style.animation = 'blink-caret 0.8s step-end infinite';
    let i = 0;

    (function type() {
      if (i < text.length) {
        el.textContent += text[i++];
        setTimeout(type, 38 + Math.random() * 28);
      } else {
        setTimeout(() => {
          el.style.borderRightColor = 'transparent';
        }, 2000);
      }
    })();
  }

  setTimeout(() => typeText(currentLang === 'fr' ? textFr : textEn), 1000);

  // Re-type on lang switch
  const _origSetLang = setLang;
  setLang = function (lang) {
    _origSetLang(lang);
    typeText(lang === 'fr' ? textFr : textEn);
  };
})();


/* ===== NAVBAR SCROLL ===== */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });


/* ===== ACTIVE NAV LINK ===== */
const navLinks = document.querySelectorAll('.nav-links a');

const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.id;
      navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === '#' + id);
      });
    }
  });
}, { rootMargin: '-40% 0px -55% 0px' });

document.querySelectorAll('section[id]').forEach(s => sectionObserver.observe(s));


/* ===== FADE-IN ON SCROLL ===== */
const fadeEls = document.querySelectorAll(
  '.fade-in, .fade-in-left, .section-title, .profile-photo-wrapper'
);

const fadeObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      fadeObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -32px 0px' });

document.querySelectorAll('.skill-group.fade-in').forEach((el, i) => {
  el.style.transitionDelay = (i * 70) + 'ms';
});
document.querySelectorAll('.tl-item').forEach((el, i) => {
  el.style.transitionDelay = (i * 80) + 'ms';
});
document.querySelectorAll('.edu-item.fade-in').forEach((el, i) => {
  el.style.transitionDelay = (i * 80) + 'ms';
});
document.querySelectorAll('.contact-card.fade-in').forEach((el, i) => {
  el.style.transitionDelay = (i * 60) + 'ms';
});

fadeEls.forEach(el => fadeObserver.observe(el));


/* ===== TIMELINE DRAW ON SCROLL ===== */
(function () {
  const timeline = document.querySelector('.timeline');
  if (!timeline) return;

  const progressLine = document.createElement('div');
  progressLine.className = 'tl-progress-line';
  timeline.prepend(progressLine);

  function updateLine() {
    const rect      = timeline.getBoundingClientRect();
    const top       = rect.top + window.scrollY;
    const scrollMid = window.scrollY + window.innerHeight * 0.55;
    const progress  = Math.min(Math.max((scrollMid - top) / rect.height, 0), 1);
    progressLine.style.height = (progress * (rect.height - 16)) + 'px';
  }

  window.addEventListener('scroll', updateLine, { passive: true });
  updateLine();
})();


/* ===== MOBILE BURGER ===== */
const burger      = document.getElementById('burger');
const navLinkList = document.querySelector('.nav-links');

burger.addEventListener('click', () => {
  const open = navLinkList.classList.toggle('open');
  burger.setAttribute('aria-expanded', String(open));
  burger.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
});

navLinkList.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinkList.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Ouvrir le menu');
  });
});
