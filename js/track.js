// ============================================================
// Juriscorp S.C. — Contador anónimo de contactos
// ============================================================
// Para saber de dónde vienen los clientes sin rastrear a nadie.
//
// QUÉ ENVÍA. Un evento por cada visita que ENTRA al sitio y por cada clic en
// WhatsApp, teléfono o correo, más el envío correcto del formulario (lo avisa
// js/main.js). Cada evento lleva sólo: tipo, página, ubicación del botón,
// idioma y el DOMINIO desde el que se llegó (p. ej. "chatgpt.com"), o
// "directo" / "interno". La función NO guarda ese dominio tal cual: lo
// clasifica en una lista cerrada y el resto queda como "otros".
//
// QUÉ NO HACE. No usa cookies ni localStorage/sessionStorage para escribir
// nada en el navegador del visitante, no genera identificadores, no envía la
// URL completa de origen (sólo el dominio) y no lee nada de los formularios.
// La Edge Function no guarda IP ni hora: sólo suma 1 a un contador del día.
// Ver supabase/functions/track-event.
//
// EXCLUSIÓN DEL EQUIPO. El panel /admin/ marca su propio navegador con
// "juriscorp_no_contar" en localStorage al iniciar sesión, para que las visitas
// del despacho no inflen las cifras. Aquí sólo se LEE esa marca; nunca se
// escribe en el navegador de un visitante.
//
// Si algo falla, falla en silencio: medir nunca puede romper la página.
// ============================================================

(function () {
  'use strict';

  var config = window.NELSON_CONFIG || {};
  var endpoint = config.TRACK_URL;

  // Se expone siempre, aunque no se mida, para que main.js no tenga que
  // comprobar nada antes de llamarlo.
  var api = { formSubmit: function () {} };
  window.JuriscorpTrack = api;

  if (!endpoint) return;
  if (navigator.webdriver) return; // navegadores automatizados y rastreadores

  try {
    if (window.localStorage && window.localStorage.getItem('juriscorp_no_contar') === '1') return;
  } catch (e) {
    // Almacenamiento bloqueado (modo privado estricto): se cuenta igual.
  }

  var lang = (document.documentElement.lang || 'es').toLowerCase().indexOf('en') === 0 ? 'en' : 'es';
  var page = location.pathname;
  var HOST_RE = /^[a-z0-9](?:[a-z0-9.-]{0,98}[a-z0-9])?$/;

  // Origen de la visita:
  //   1. utm_source, si el enlace lo traía (ChatGPT añade utm_source=chatgpt.com);
  //   2. el dominio del referrer si es externo;
  //   3. "interno" si se llegó desde otra página del sitio;
  //   4. "directo" si no hay origen (enlace escrito, app que no lo envía…).
  function computeSource() {
    try {
      var utm = new URLSearchParams(location.search).get('utm_source');
      if (utm) {
        var clean = utm.trim().toLowerCase().replace(/^www\./, '');
        // "directo" e "interno" son valores reservados del contador, no orígenes.
        if (HOST_RE.test(clean) && clean !== 'directo' && clean !== 'interno') return clean;
      }
    } catch (e) { /* sin URLSearchParams */ }

    if (!document.referrer) return 'directo';
    try {
      var host = new URL(document.referrer).hostname.toLowerCase().replace(/^www\./, '');
      if (host === location.hostname.toLowerCase().replace(/^www\./, '')) return 'interno';
      return HOST_RE.test(host) ? host : 'directo';
    } catch (e) {
      return 'directo';
    }
  }

  var source = computeSource();

  function send(eventType, placement) {
    try {
      // text/plain y no application/json: así es una petición "simple" sin
      // preflight CORS, y keepalive la deja terminar aunque se abra WhatsApp
      // o se marque un teléfono justo después.
      fetch(endpoint, {
        method: 'POST',
        body: JSON.stringify({ event: eventType, page: page, placement: placement, lang: lang, source: source }),
        headers: { 'Content-Type': 'text/plain' },
        keepalive: true,
        credentials: 'omit',
        referrerPolicy: 'no-referrer',
      }).catch(function () {});
    } catch (e) { /* navegador sin fetch */ }
  }

  // Dónde estaba el botón. Los id existen en las portadas; las páginas de
  // servicio usan clases.
  function placementOf(link) {
    var id = link.id || '';
    if (id === 'whatsapp-float') return 'float';
    if (id === 'post-success-whatsapp') return 'success';
    if (id.indexOf('contact-') === 0) return 'contact';
    if (link.classList.contains('area-btn')) return 'cta';
    if (link.closest('footer')) return 'footer';
    if (link.closest('.legal-contact, .contact-methods')) return 'contact';
    return 'other';
  }

  function eventFor(href) {
    if (/^https:\/\/(api\.)?wa\.me\//i.test(href)) return 'whatsapp_click';
    if (/^tel:/i.test(href)) return 'phone_click';
    if (/^mailto:/i.test(href)) return 'email_click';
    return null;
  }

  // Entrada al sitio: sólo cuenta la primera página de la visita.
  if (source !== 'interno') send('landing', 'none');

  // Fase de captura: el clic se cuenta antes de que el navegador abra
  // WhatsApp, el marcador o el cliente de correo.
  document.addEventListener('click', function (event) {
    var link = event.target && event.target.closest ? event.target.closest('a[href]') : null;
    if (!link) return;
    var type = eventFor(link.getAttribute('href') || '');
    if (type) send(type, placementOf(link));
  }, true);

  api.formSubmit = function () { send('form_submit', 'form'); };
})();
