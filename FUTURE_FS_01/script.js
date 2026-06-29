'use strict';

const header = document.getElementById('header');
const navToggle = document.getElementById('nav-toggle');
const navMenu = document.getElementById('nav-menu');
const navLinks = document.querySelectorAll('.nav__link');
const contactForm = document.getElementById('contact-form');
const submitBtn = document.getElementById('submit-btn');
const formMessage = document.getElementById('form-message');
const yearEl = document.getElementById('year');

document.addEventListener('DOMContentLoaded', () => {
  initYear();
  initScrollAnimations();
  initSkillBars();
  initNavigation();
  initContactForm();
  initActiveNavHighlight();
  initTypingAnimation();
  initCounterAnimation();
  initCardTilt();
});

function initYear() {
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
}

function handleHeaderScroll() {
  if (window.scrollY > 50) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
}

window.addEventListener('scroll', handleHeaderScroll, { passive: true });
handleHeaderScroll();

function initNavigation() {
  navToggle.addEventListener('click', toggleMobileMenu);

  navLinks.forEach(link => {
    link.addEventListener('click', () => closeMobileMenu());
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMobileMenu();
  });

  document.addEventListener('click', (e) => {
    if (
      navMenu.classList.contains('open') &&
      !navMenu.contains(e.target) &&
      !navToggle.contains(e.target)
    ) {
      closeMobileMenu();
    }
  });
}

function toggleMobileMenu() {
  const isOpen = navMenu.classList.toggle('open');
  navToggle.classList.toggle('active');
  navToggle.setAttribute('aria-expanded', isOpen);
  document.body.style.overflow = isOpen ? 'hidden' : '';
}

function closeMobileMenu() {
  navMenu.classList.remove('open');
  navToggle.classList.remove('active');
  navToggle.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}

navLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    const href = link.getAttribute('href');
    if (href.startsWith('#')) {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        const offsetTop = target.offsetTop - parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-height'), 10);
        window.scrollTo({ top: offsetTop, behavior: 'smooth' });
      }
    }
  });
});

function initActiveNavHighlight() {
  const sections = document.querySelectorAll('section[id]');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }, { root: null, rootMargin: '-40% 0px -55% 0px', threshold: 0 });

  sections.forEach(section => observer.observe(section));
}

function initScrollAnimations() {
  const animatedElements = document.querySelectorAll('.animate-on-scroll');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { root: null, rootMargin: '0px 0px -80px 0px', threshold: 0.08 });

  animatedElements.forEach(el => observer.observe(el));
}

function initSkillBars() {
  const skillBars = document.querySelectorAll('.skill-bar__fill');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const fill = entry.target;
        fill.style.setProperty('--skill-width', `${fill.getAttribute('data-width')}%`);
        fill.classList.add('animated');
        observer.unobserve(fill);
      }
    });
  }, { threshold: 0.5 });

  skillBars.forEach(bar => observer.observe(bar));
}

function initContactForm() {
  if (!contactForm) return;

  const fields = {
    name: {
      element: document.getElementById('name'),
      error: document.getElementById('name-error'),
      validate(value) {
        if (!value.trim()) return 'Name is required.';
        if (value.trim().length < 2) return 'Name must be at least 2 characters.';
        if (!/^[a-zA-Z\s.'-]+$/.test(value.trim())) return 'Name contains invalid characters.';
        return '';
      }
    },
    email: {
      element: document.getElementById('email'),
      error: document.getElementById('email-error'),
      validate(value) {
        if (!value.trim()) return 'Email is required.';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value.trim())) return 'Please enter a valid email address.';
        return '';
      }
    },
    message: {
      element: document.getElementById('message'),
      error: document.getElementById('message-error'),
      validate(value) {
        if (!value.trim()) return 'Message is required.';
        if (value.trim().length < 10) return 'Message must be at least 10 characters.';
        if (value.trim().length > 1000) return 'Message must be under 1000 characters.';
        return '';
      }
    }
  };

  Object.values(fields).forEach(({ element }) => {
    element.addEventListener('input', () => {
      clearFieldError(fields[element.name]);
      hideFormMessage();
    });

    element.addEventListener('blur', () => {
      const error = fields[element.name].validate(element.value);
      if (error) showFieldError(fields[element.name], error);
    });
  });

  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideFormMessage();

    let isValid = true;
    let firstInvalidField = null;

    Object.values(fields).forEach(field => {
      const error = field.validate(field.element.value);
      if (error) {
        showFieldError(field, error);
        isValid = false;
        if (!firstInvalidField) firstInvalidField = field.element;
      } else {
        clearFieldError(field);
      }
    });

    if (!isValid) {
      showFormMessage('Please fix the errors above before submitting.', 'error');
      firstInvalidField?.focus();
      return;
    }

    submitBtn.classList.add('loading');
    submitBtn.disabled = true;

    try {
      await simulateFormSubmission({
        name: fields.name.element.value.trim(),
        email: fields.email.element.value.trim(),
        message: fields.message.element.value.trim()
      });

      showFormMessage('Thank you! Your message was sent successfully. I will get back to you soon.', 'success');
      contactForm.reset();
    } catch {
      showFormMessage('Something went wrong. Please try again or email me at 2023ad0144@svce.ac.in.', 'error');
    } finally {
      submitBtn.classList.remove('loading');
      submitBtn.disabled = false;
    }
  });
}

function showFieldError(field, message) {
  field.element.classList.add('error');
  field.error.textContent = message;
}

function clearFieldError(field) {
  field.element.classList.remove('error');
  field.error.textContent = '';
}

function showFormMessage(text, type) {
  if (!formMessage) return;
  formMessage.textContent = text;
  formMessage.className = `form-message form-message--${type} show`;
}

function hideFormMessage() {
  if (!formMessage) return;
  formMessage.textContent = '';
  formMessage.className = 'form-message';
}

function simulateFormSubmission(data) {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('Form submitted:', data);
      resolve(data);
    }, 1200);
  });
}

function initTypingAnimation() {
  const typingEl = document.getElementById('typing-text');
  const greeting = document.querySelector('.hero__greeting');
  if (!typingEl) return;

  const roles = [
    'Full Stack Web Development Intern',
    'Frontend Developer',
    'Backend Developer',
    'Problem Solver'
  ];

  let roleIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typeSpeed = 80;

  function startTypingLoop() {
    tick();
  }

  if (greeting) {
    const greetingText = greeting.textContent;
    greeting.textContent = '';
    let gIndex = 0;

    function typeGreeting() {
      if (gIndex < greetingText.length) {
        greeting.textContent += greetingText.charAt(gIndex);
        gIndex++;
        setTimeout(typeGreeting, 50);
      } else {
        setTimeout(startTypingLoop, 400);
      }
    }

    setTimeout(typeGreeting, 300);
  } else {
    startTypingLoop();
  }

  function tick() {
    const currentRole = roles[roleIndex];

    if (!isDeleting) {
      typingEl.textContent = currentRole.substring(0, charIndex + 1);
      charIndex++;
      typeSpeed = 65;

      if (charIndex === currentRole.length) {
        isDeleting = true;
        typeSpeed = 2000;
      }
    } else {
      typingEl.textContent = currentRole.substring(0, charIndex - 1);
      charIndex--;
      typeSpeed = 35;

      if (charIndex === 0) {
        isDeleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
        typeSpeed = 500;
      }
    }

    setTimeout(tick, typeSpeed);
  }
}

function initCounterAnimation() {
  const counters = document.querySelectorAll('.about__highlight-number');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(counter => observer.observe(counter));
}

function animateCounter(el) {
  const text = el.textContent.trim();
  const match = text.match(/^(\d+\.?\d*)/);
  if (!match) return;

  const target = parseFloat(match[1]);
  const isDecimal = text.includes('.');
  const suffix = text.slice(match[1].length);
  const duration = 1800;
  const start = performance.now();

  function update(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = eased * target;

    el.textContent = (isDecimal ? current.toFixed(1) : Math.floor(current)) + suffix;

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      el.textContent = text;
    }
  }

  requestAnimationFrame(update);
}

function initCardTilt() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!window.matchMedia('(pointer: fine)').matches) return;

  document.querySelectorAll('.skill-card, .project-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const rotateX = ((e.clientY - rect.top - rect.height / 2) / (rect.height / 2)) * -4;
      const rotateY = ((e.clientX - rect.left - rect.width / 2) / (rect.width / 2)) * 4;
      card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px) scale(1.02)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}
