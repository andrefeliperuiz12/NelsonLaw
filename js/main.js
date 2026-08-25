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
  // WHATSAPP_NUMBER no vive aquí a propósito: los enlaces wa.me son
  // estáticos en el HTML (siguen funcionando sin JavaScript). Esta copia
  // existía sin que nadie la leyera y fue donde se propagó un número
  // truncado — menos copias, menos deriva.
  const CONFIG = {
    SUPABASE_URL: '', // Set in HTML or during build
    SUPABASE_ANON_KEY: '', // Set in HTML or during build
    EDGE_FUNCTION_URL: '', // Set in HTML or during build
    TURNSTILE_SITE_KEY: '', // Set in HTML or during build
  };

  // Allow overriding from global config set in HTML
  if (window.NELSON_CONFIG) {
    Object.assign(CONFIG, window.NELSON_CONFIG);
  }

  // --- IDIOMA ---
  // Se lee del atributo lang del <html>, que es la fuente de verdad de la
  // página que la persona está viendo. NO se usa navigator.language: eso
  // refleja la configuración del navegador, no lo que hay en pantalla, y un
  // panameño con Windows en inglés vería errores en inglés en el sitio en
  // español.
  var LANG = (document.documentElement.lang || 'es').toLowerCase().indexOf('en') === 0 ? 'en' : 'es';

  // Los mensajes de la Edge Function llegan ya traducidos desde el servidor
  // (ver supabase/functions/submit-lead/index.ts). Estos son sólo los que se
  // generan en el navegador: validación en cliente y fallos de red.
  var T = {
    es: {
      required: 'Este campo es requerido.',
      minLength: function (n) { return 'Mínimo ' + n + ' caracteres.'; },
      email: 'Correo electrónico inválido.',
      phone: 'Número de teléfono inválido.',
      turnstile: 'Por favor complete la verificación de seguridad.',
      serverError: function (s) {
        return 'Tuvimos un problema en nuestro servidor y no pudimos registrar ' +
          'su consulta (error ' + s + '). No es un problema de su conexión. ' +
          'Puede intentarlo en unos minutos o escribirnos por WhatsApp al 6673-0357.';
      },
      httpError: function (s) {
        return 'No pudimos enviar el formulario (error ' + s + '). ' +
          'Puede intentarlo de nuevo o escribirnos por WhatsApp al 6673-0357.';
      },
      networkError: 'No pudimos conectar con el servidor. Verifique su ' +
        'conexión a internet e intente de nuevo, o escríbanos por WhatsApp al 6673-0357.'
    },
    en: {
      required: 'This field is required.',
      minLength: function (n) { return 'Minimum ' + n + ' characters.'; },
      email: 'Invalid email address.',
      phone: 'Invalid phone number.',
      turnstile: 'Please complete the security verification.',
      serverError: function (s) {
        return 'We had a problem on our server and could not record your enquiry ' +
          '(error ' + s + '). This is not a problem with your connection. Please ' +
          'try again in a few minutes or message us on WhatsApp at +507 6673-0357.';
      },
      httpError: function (s) {
        return 'We could not submit the form (error ' + s + '). ' +
          'Please try again or message us on WhatsApp at +507 6673-0357.';
      },
      networkError: 'We could not reach the server. Please check your internet ' +
        'connection and try again, or message us on WhatsApp at +507 6673-0357.'
    }
  }[LANG];

  // La Edge Function decide en qué idioma responde a partir de este parámetro.
  // Va en la URL y no en el cuerpo porque el corte por exceso de peticiones se
  // responde antes de que el servidor llegue a leer el cuerpo.
  function edgeUrl() {
    if (!CONFIG.EDGE_FUNCTION_URL) return '';
    return CONFIG.EDGE_FUNCTION_URL +
      (CONFIG.EDGE_FUNCTION_URL.indexOf('?') === -1 ? '?' : '&') +
      'lang=' + LANG;
  }

  // --- BOTONES DE RECARGA ---
  // Sustituye a onclick="location.reload()" en el mensaje de error del
  // formulario. Un atributo onclick= lo bloquea SIEMPRE una CSP en modo
  // enforce, y los hashes no sirven para manejadores de evento: sólo
  // 'unsafe-inline', que vacía de sentido la cabecera. Con delegación queda
  // fuera del HTML y no estorba. Ver el comentario de _headers.
  function initReloadButtons() {
    document.querySelectorAll('[data-reload]').forEach(function (el) {
      el.addEventListener('click', function () {
        location.reload();
      });
    });
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
      if (errorEl) errorEl.textContent = T.required;
      return false;
    }

    if (rules.minLength && value.length < rules.minLength) {
      if (group) group.classList.add('error');
      if (errorEl) errorEl.textContent = T.minLength(rules.minLength);
      return false;
    }

    if (rules.email && value && !/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(value)) {
      if (group) group.classList.add('error');
      if (errorEl) errorEl.textContent = T.email;
      return false;
    }

    if (rules.phone && value) {
      var digits = value.replace(/\D/g, '');
      if (digits.length < 7) {
        if (group) group.classList.add('error');
        if (errorEl) errorEl.textContent = T.phone;
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
        tsError.textContent = T.turnstile;
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

        var response = await fetch(edgeUrl(), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        // El servidor puede responder algo que no sea JSON: un 502 del gateway,
        // una página de error de la infraestructura, un HTML de mantenimiento.
        // Con .json() a secas eso lanza, cae en el catch de red, y el visitante
        // lee "verifique su conexión a internet" — culpando a su wifi de una
        // caída nuestra. En un bufete eso es un cliente que se va y no vuelve.
        var contentType = response.headers.get('content-type') || '';
        var result = null;

        if (contentType.indexOf('application/json') !== -1) {
          try {
            result = await response.json();
          } catch (parseErr) {
            result = null; // decía ser JSON pero no lo era
          }
        }

        if (response.ok && result && result.success) {
          // Show success
          if (formFields) formFields.classList.add('hidden');
          if (successMsg) successMsg.classList.add('visible');
          if (errorMsg) errorMsg.classList.remove('visible');
        } else {
          var message;
          if (result && result.error) {
            // Error de negocio: la Edge Function ya devuelve el mensaje en el
            // idioma de la página y listo para mostrar (validación, rate
            // limit, Turnstile). El idioma se le indica con ?lang= en edgeUrl().
            message = result.error;
          } else if (response.status >= 500) {
            message = T.serverError(response.status);
          } else {
            message = T.httpError(response.status);
          }
          if (errorBanner) {
            errorBanner.textContent = message;
            errorBanner.classList.add('visible');
          }
        }
      } catch (err) {
        // Fallo de red REAL: fetch sólo rechaza si la petición no llegó a
        // completarse (sin conexión, DNS, CORS, conexión cortada). Un error
        // HTTP del servidor NO llega aquí; se maneja arriba.
        if (errorBanner) {
          errorBanner.textContent = T.networkError;
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

  // --- FOOTER YEAR ---
  function initFooterYear() {
    var el = document.getElementById('footerYear');
    if (el) el.textContent = new Date().getFullYear();
  }

  // --- INITIALIZE ---
  document.addEventListener('DOMContentLoaded', function () {
    initNavigation();
    initScrollReveal();
    initForm();
    initFooterYear();
    initReloadButtons();
  });
})();
