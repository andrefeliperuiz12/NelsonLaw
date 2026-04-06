// ============================================================
// Nelson Ruiz Pinilla — Main Frontend JavaScript
// ============================================================
// Handles: Navigation, Turnstile, Form validation & submission,
//          Scroll animations, WhatsApp integration
// ============================================================

(function () {
  'use strict';

  // --- CONFIGURATION ---
  // These will be replaced with actual values during deployment
  const CONFIG = {
    SUPABASE_URL: '', // Set in HTML or during build
    SUPABASE_ANON_KEY: '', // Set in HTML or during build
    EDGE_FUNCTION_URL: '', // Set in HTML or during build
    TURNSTILE_SITE_KEY: '', // Set in HTML or during build
    WHATSAPP_NUMBER: '5076673035',
  };

  // Allow overriding from global config set in HTML
  if (window.NELSON_CONFIG) {
    Object.assign(CONFIG, window.NELSON_CONFIG);
  }

  // --- MOBILE NAVIGATION ---
  function initNavigation() {
    const toggle = document.getElementById('navToggle');
    const links = document.getElementById('navLinks');
    const navbar = document.getElementById('navbar');

    if (toggle && links) {
      toggle.addEventListener('click', function () {
        links.classList.toggle('open');
        // Animate hamburger
        const spans = toggle.querySelectorAll('span');
        toggle.classList.toggle('active');
      });

      // Close menu on link click
      links.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', function () {
          links.classList.remove('open');
          toggle.classList.remove('active');
        });
      });
    }

    // Navbar scroll effect
    if (navbar) {
      window.addEventListener('scroll', function () {
        if (window.scrollY > 50) {
          navbar.classList.add('scrolled');
        } else {
          navbar.classList.remove('scrolled');
        }
      });
    }
  }

  // --- SCROLL REVEAL ANIMATIONS ---
  function initScrollReveal() {
    const reveals = document.querySelectorAll('.reveal');
    if (!reveals.length) return;

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    reveals.forEach(function (el) {
      observer.observe(el);
    });
  }

  // --- TURNSTILE ---
  var turnstileToken = null;

  window.onTurnstileSuccess = function (token) {
    turnstileToken = token;
    // Clear any turnstile error
    var tsError = document.getElementById('turnstileError');
    if (tsError) tsError.style.display = 'none';
  };

  window.onTurnstileExpired = function () {
    turnstileToken = null;
  };

  window.onTurnstileError = function () {
    turnstileToken = null;
  };

  // --- FORM VALIDATION ---
  function validateField(field, rules) {
    var value = field.value.trim();
    var group = field.closest('.form-group');
    var errorEl = group ? group.querySelector('.field-error') : null;

    // Reset
    if (group) group.classList.remove('error');

    if (rules.required && !value) {
      if (group) group.classList.add('error');
      if (errorEl) errorEl.textContent = 'Este campo es requerido.';
      return false;
    }

    if (rules.minLength && value.length < rules.minLength) {
      if (group) group.classList.add('error');
      if (errorEl) errorEl.textContent = 'Mínimo ' + rules.minLength + ' caracteres.';
      return false;
    }

    if (rules.email && value && !/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(value)) {
      if (group) group.classList.add('error');
      if (errorEl) errorEl.textContent = 'Correo electrónico inválido.';
      return false;
    }

    if (rules.phone && value) {
      var digits = value.replace(/\D/g, '');
      if (digits.length < 7) {
        if (group) group.classList.add('error');
        if (errorEl) errorEl.textContent = 'Número de teléfono inválido.';
        return false;
      }
    }

    return true;
  }

  function validateForm() {
    var valid = true;

    var fullName = document.getElementById('fullName');
    var phone = document.getElementById('phone');
    var email = document.getElementById('email');
    var legalArea = document.getElementById('legalArea');
    var caseSummary = document.getElementById('caseSummary');
    var consent = document.getElementById('consent');

    if (!validateField(fullName, { required: true, minLength: 2 })) valid = false;
    if (!validateField(phone, { required: true, phone: true })) valid = false;
    if (!validateField(email, { email: true })) valid = false;
    if (!validateField(legalArea, { required: true })) valid = false;
    if (!validateField(caseSummary, { required: true, minLength: 10 })) valid = false;

    // Consent check
    if (consent && !consent.checked) {
      var consentGroup = consent.closest('.form-consent');
      if (consentGroup) consentGroup.style.outline = '1px solid var(--error)';
      valid = false;
    } else {
      var consentGroup2 = consent ? consent.closest('.form-consent') : null;
      if (consentGroup2) consentGroup2.style.outline = 'none';
    }

    // Turnstile check
    if (!turnstileToken) {
      var tsError = document.getElementById('turnstileError');
      if (tsError) {
        tsError.textContent = 'Por favor complete la verificación de seguridad.';
        tsError.style.display = 'block';
      }
      valid = false;
    }

    return valid;
  }

  // --- FORM SUBMISSION ---
  function initForm() {
    var form = document.getElementById('leadForm');
    if (!form) return;

    form.addEventListener('submit', async function (e) {
      e.preventDefault();

      // Validate
      if (!validateForm()) return;

      var submitBtn = document.getElementById('submitBtn');
      var errorBanner = document.getElementById('formErrorBanner');
      var formFields = document.getElementById('formFields');
      var successMsg = document.getElementById('formSuccess');
      var errorMsg = document.getElementById('formError');

      // Show loading
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.classList.add('loading');
      }
      if (errorBanner) {
        errorBanner.classList.remove('visible');
      }

      try {
        var payload = {
          turnstileToken: turnstileToken,
          fullName: document.getElementById('fullName').value.trim(),
          phone: document.getElementById('phone').value.trim(),
          email: document.getElementById('email').value.trim() || null,
          legalArea: document.getElementById('legalArea').value,
          caseSummary: document.getElementById('caseSummary').value.trim(),
          consent: document.getElementById('consent').checked,
        };

        var response = await fetch(CONFIG.EDGE_FUNCTION_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        var result = await response.json();

        if (response.ok && result.success) {
          // Show success
          if (formFields) formFields.classList.add('hidden');
          if (successMsg) successMsg.classList.add('visible');
          if (errorMsg) errorMsg.classList.remove('visible');
        } else {
          // Show error
          var message = result.error || 'Error al enviar el formulario. Por favor intente de nuevo.';
          if (errorBanner) {
            errorBanner.textContent = message;
            errorBanner.classList.add('visible');
          }
        }
      } catch (err) {
        // Network error
        if (errorBanner) {
          errorBanner.textContent = 'Error de conexión. Por favor verifique su conexión a internet e intente de nuevo.';
          errorBanner.classList.add('visible');
        }
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.classList.remove('loading');
        }
        // Reset turnstile
        if (window.turnstile) {
          window.turnstile.reset();
          turnstileToken = null;
        }
      }
    });

    // Real-time validation on blur
    var fields = form.querySelectorAll('input, select, textarea');
    fields.forEach(function (field) {
      field.addEventListener('blur', function () {
        var rules = {};
        if (field.hasAttribute('required')) rules.required = true;
        if (field.type === 'email') rules.email = true;
        if (field.type === 'tel') rules.phone = true;
        if (field.dataset.minlength) rules.minLength = parseInt(field.dataset.minlength);
        validateField(field, rules);
      });
    });
  }

  // --- INITIALIZE ---
  document.addEventListener('DOMContentLoaded', function () {
    initNavigation();
    initScrollReveal();
    initForm();
  });
})();
