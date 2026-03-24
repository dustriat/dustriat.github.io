/* ============================
   PORTFOLIO — script.js
   ============================ */

// ── Nav: add scrolled class ──────────────────────────────────────
const nav = document.getElementById('nav');

function handleNavScroll() {
  if (window.scrollY > 20) {
    nav.classList.add('scrolled');
  } else {
    nav.classList.remove('scrolled');
  }
}

window.addEventListener('scroll', handleNavScroll, { passive: true });
handleNavScroll();

// ── Mobile hamburger menu ────────────────────────────────────────
const hamburger   = document.getElementById('hamburger');
const mobileMenu  = document.getElementById('mobileMenu');
const mobileLinks = document.querySelectorAll('.mobile-link');
let menuOpen = false;

function toggleMenu(state) {
  menuOpen = typeof state === 'boolean' ? state : !menuOpen;
  mobileMenu.classList.toggle('open', menuOpen);
  hamburger.setAttribute('aria-expanded', menuOpen);

  // Animate hamburger to X
  const spans = hamburger.querySelectorAll('span');
  if (menuOpen) {
    spans[0].style.cssText = 'transform: translateY(7px) rotate(45deg)';
    spans[1].style.cssText = 'opacity: 0';
    spans[2].style.cssText = 'transform: translateY(-7px) rotate(-45deg)';
  } else {
    spans.forEach(s => s.style.cssText = '');
  }
}

hamburger.addEventListener('click', () => toggleMenu());

mobileLinks.forEach(link => {
  link.addEventListener('click', () => toggleMenu(false));
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && menuOpen) toggleMenu(false);
});

// ── Scroll reveal ────────────────────────────────────────────────
function initReveal() {
  const revealTargets = [
    '.contact__left',
    '.contact__form',
    '.about',
    '.projects__intro',
    '.project-card',
    '.cred-card',
    '.career__stats',
    '.career-item',
    '.skill-card',
    // subpage targets
    '.subpage-section',
    '.subpage-sidebar__card',
    '.subpage-step',
  ];

  const elements = document.querySelectorAll(revealTargets.join(','));

  elements.forEach(el => {
    el.classList.add('reveal');

    // Stagger grid children (index page cards)
    if (el.closest('.skills__grid') || el.closest('.projects__cards') || el.closest('.certs__grid')) {
      const siblings = Array.from(el.parentElement.children);
      const idx = siblings.indexOf(el);
      el.dataset.revealDelay = idx * 0.1;
    }
    // Stagger subpage steps within their container
    if (el.classList.contains('subpage-step')) {
      const siblings = Array.from(el.parentElement.children);
      const idx = siblings.indexOf(el);
      el.dataset.revealDelay = idx * 0.08;
    }
    // Stagger subpage sections
    if (el.classList.contains('subpage-section')) {
      const siblings = Array.from(el.parentElement.querySelectorAll('.subpage-section'));
      const idx = Array.from(siblings).indexOf(el);
      el.dataset.revealDelay = idx * 0.1;
    }
    // Stagger sidebar cards
    if (el.classList.contains('subpage-sidebar__card')) {
      const siblings = Array.from(el.parentElement.querySelectorAll('.subpage-sidebar__card'));
      const idx = Array.from(siblings).indexOf(el);
      el.dataset.revealDelay = idx * 0.12;
    }
  });

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const delay = el.dataset.revealDelay || 0;
          // Apply animation-delay at the moment the class is added,
          // so it only affects the entrance animation, not hover transitions.
          el.style.animationDelay = `${delay}s`;
          el.classList.add('visible');
          observer.unobserve(el);
        }
      });
    },
    { threshold: 0.08, rootMargin: '0px 0px -30px 0px' }
  );

  elements.forEach(el => observer.observe(el));
}

// ── Active nav link on scroll ────────────────────────────────────
function initActiveNav() {
  const sections = document.querySelectorAll('section[id], header[id]');
  const navLinks = document.querySelectorAll('.nav__links a');

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach(link => {
            link.classList.toggle(
              'active',
              link.getAttribute('href') === `#${id}`
            );
          });
        }
      });
    },
    { threshold: 0.4 }
  );

  sections.forEach(section => observer.observe(section));
}

// ── Contact form (no backend — mailto fallback) ──────────────────
function initContactForm() {
  const form     = document.getElementById('contactForm');
  const formNote = document.getElementById('formNote');

  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();

    const name    = form.name.value.trim();
    const email   = form.email.value.trim();
    const message = form.message.value.trim();

    if (!name || !email || !message) {
      showNote('Please fill in all fields.', 'error');
      return;
    }

    // Build a mailto link as a graceful fallback
    const subject  = encodeURIComponent(`Portfolio Contact from ${name}`);
    const body     = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`);
    const mailto   = `mailto:dustriat@gmail.com?subject=${subject}&body=${body}`;

    // Try to open mail client
    window.location.href = mailto;

    showNote('Opening your mail client… if nothing opens, email me directly!', 'success');
    form.reset();
  });

  function showNote(msg, type) {
    formNote.textContent = msg;
    formNote.className = `form-note ${type}`;
    setTimeout(() => {
      formNote.textContent = '';
      formNote.className = 'form-note';
    }, 6000);
  }
}

// ── Smooth scroll for all anchor links ──────────────────────────
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const offset = nav ? nav.offsetHeight : 0;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
}

// ── Init all ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initReveal();
  initActiveNav();
  initContactForm();
  initSmoothScroll();
});
