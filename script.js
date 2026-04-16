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
  // Each entry: [selector, extraClass]
  // extraClass 'reveal-wrap--sm' uses shorter translateY travel
  const revealTargets = [
    ['.contact__info',          ''],
    ['.contact__form',          ''],
    ['.section p',              ''],
    ['.project-card',           ''],
    ['.cred-card',              ''],
    ['.career__stats',          ''],
    ['.career-item',            ''],
    ['.skill-card',             ''],
    ['.subpage-section',        ''],
    ['.subpage-sidebar__card',  ''],
    ['.subpage-step',           'reveal-wrap--sm'],
  ];

  revealTargets.forEach(([selector, extraClass]) => {
    document.querySelectorAll(selector).forEach(el => {
      // Skip if already wrapped (guard for re-runs)
      if (el.parentElement && el.parentElement.classList.contains('reveal-wrap')) return;

      // Create wrapper, transfer el's position in DOM
      const wrap = document.createElement('div');
      wrap.classList.add('reveal-wrap');
      if (extraClass) wrap.classList.add(extraClass);

      // Compute stagger delay before wrapping
      let delay = 0;
      const parent = el.parentElement;

      if (el.classList.contains('solo')) {
      wrap.classList.add('solo');
      }

      if (parent) {
        // Grid stagger: projects, skills, creds
        if (
          parent.classList.contains('projects__grid') ||
          parent.classList.contains('skills__grid') ||
          parent.classList.contains('creds__grid')
        ) {
          const idx = Array.from(parent.children).indexOf(el);
          delay = idx * 0.1;
        }
        // Subpage step stagger
        if (el.classList.contains('subpage-step')) {
          const idx = Array.from(parent.children).indexOf(el);
          delay = idx * 0.08;
        }
        // Subpage section stagger
        if (el.classList.contains('subpage-section')) {
          const sections = Array.from(parent.querySelectorAll('.subpage-section'));
          delay = sections.indexOf(el) * 0.1;
        }
        // Sidebar card stagger
        if (el.classList.contains('subpage-sidebar__card')) {
          const cards = Array.from(parent.querySelectorAll('.subpage-sidebar__card'));
          delay = cards.indexOf(el) * 0.12;
        }
        // Career item stagger
        if (el.classList.contains('career-item')) {
          const items = Array.from(parent.querySelectorAll('.career-item'));
          delay = items.indexOf(el) * 0.1;
        }
      }

      wrap.style.transitionDelay = delay > 0 ? `${delay}s` : '';

      // Wrap the element
      el.parentNode.insertBefore(wrap, el);
      wrap.appendChild(el);
    });
  });

  // Observe all wrappers
  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08, rootMargin: '0px 0px -30px 0px' }
  );

  document.querySelectorAll('.reveal-wrap').forEach(wrap => observer.observe(wrap));
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

// ── Contact form (with mailto fallback) ────────────────────────────
function initContactForm() {
  const form     = document.getElementById('contactForm');
  const formNote = document.getElementById('formNote');
  const button   = form?.querySelector('button');

  if (!form) return;

  form.addEventListener('submit', async e => {
    e.preventDefault();

    const name    = form.name.value.trim();
    const email   = form.email.value.trim();
    const message = form.message.value.trim();

    if (!name || !email || !message) {
      showNote('Please fill in all fields.', 'error');
      return;
    }

    button.disabled = true;
    showNote('Sending message...', 'pending');

    try {
      const res = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      });

      if (res.ok) {
        showNote('Message sent successfully!', 'success');
        form.reset();
        button.disabled = false;
        return;
      }

      throw new Error('Formspree error');
    } catch (err) {
      // ── Fallback to mailto ────────────────────────────────
      const subject = encodeURIComponent(`Portfolio contact from ${name}`);
      const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`);

      const mailto = `mailto:dustriat@gmail.com?subject=${subject}&body=${body}`;
      window.location.href = mailto;

      showNote('Could not send automatically. Opening email client...', 'error');
      button.disabled = false;
    }
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

// ── Lightbox for step images ─────────────────────────────────────
function initStepImageLightbox() {
  const lightbox      = document.getElementById('lightbox');
  const lightboxImg   = document.getElementById('lightboxImg');
  const lightboxClose = document.getElementById('lightboxClose');

  if (!lightbox || !lightboxImg) return;

  function openLightbox(src, alt) {
    lightboxImg.src = src;
    lightboxImg.alt = alt || '';
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  }

  // Open on step-img click
  document.querySelectorAll('.step-img-wrap').forEach(wrap => {
    wrap.addEventListener('click', () => {
      const img = wrap.querySelector('.step-img');
      if (img) openLightbox(img.src, img.alt);
    });
  });

  // Close via button, backdrop click, or Escape
  lightboxClose && lightboxClose.addEventListener('click', closeLightbox);

  lightbox.addEventListener('click', e => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && lightbox.classList.contains('open')) closeLightbox();
  });
}

// ── Init all ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initReveal();
  initActiveNav();
  initContactForm();
  initSmoothScroll();
  initStepImageLightbox();
});
