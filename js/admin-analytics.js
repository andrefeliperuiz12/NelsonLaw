// ============================================================
// Juriscorp S.C. — Panel: origen de visitas y contactos
// ============================================================
// Lee los contadores anónimos de site_event_counts mediante la función
// site_event_totals() (migración 004), que agrega en el servidor. Aquí no hay
// datos personales: sólo cuántas veces pasó algo, dónde y desde qué dominio.
//
// Todo se pinta con textContent / createElement, nunca con innerHTML: aunque
// la base sólo admite dominios, el panel no debe confiar en ello.
//
// También marca ESTE navegador para que el contador público no cuente las
// visitas del equipo (ver js/track.js).
// ============================================================

(function () {
  'use strict';

  var NO_COUNT_KEY = 'juriscorp_no_contar';

  var EVENT_COLUMNS = [
    { key: 'landing', label: 'Entradas' },
    { key: 'whatsapp_click', label: 'WhatsApp' },
    { key: 'phone_click', label: 'Teléfono' },
    { key: 'email_click', label: 'Correo' },
    { key: 'form_submit', label: 'Formulario' },
  ];

  var PLACEMENT_LABELS = {
    float: 'Botón flotante',
    contact: 'Bloque de contacto',
    cta: 'Botón de la página de servicio',
    success: 'Tras enviar el formulario',
    form: 'Formulario',
    footer: 'Pie de página',
    other: 'Otro enlace',
    none: '—',
  };

  // La base ya guarda el origen CLASIFICADO en una lista cerrada (ver
  // KNOWN_SOURCES en supabase/functions/track-event/validation.ts). Aquí sólo
  // se agrupa y se le pone nombre legible. Si se añade un origen allí, añadirlo
  // también aquí (scripts/verificar-sitio.mjs lo comprueba).
  var GROUPS = [
    {
      label: 'Asistentes de IA',
      sources: ['chatgpt.com', 'perplexity.ai', 'claude.ai', 'gemini.google.com', 'copilot.microsoft.com',
        'meta.ai', 'grok.com', 'deepseek.com', 'mistral.ai'],
    },
    {
      label: 'Buscadores',
      sources: ['google', 'bing.com', 'duckduckgo.com', 'yahoo.com', 'ecosia.org', 'brave.com'],
    },
    {
      label: 'Redes y mensajería',
      sources: ['facebook.com', 'instagram.com', 'linkedin.com', 'x.com', 'youtube.com', 'tiktok.com', 'whatsapp'],
    },
  ];

  var SOURCE_NAMES = {
    'chatgpt.com': 'ChatGPT',
    'perplexity.ai': 'Perplexity',
    'claude.ai': 'Claude',
    'gemini.google.com': 'Gemini',
    'copilot.microsoft.com': 'Copilot',
    'meta.ai': 'Meta AI',
    'grok.com': 'Grok',
    'deepseek.com': 'DeepSeek',
    'mistral.ai': 'Mistral',
    google: 'Google',
    'bing.com': 'Bing',
    'duckduckgo.com': 'DuckDuckGo',
    'yahoo.com': 'Yahoo',
    'ecosia.org': 'Ecosia',
    'brave.com': 'Brave',
    'facebook.com': 'Facebook',
    'instagram.com': 'Instagram',
    'linkedin.com': 'LinkedIn',
    'x.com': 'X / Twitter',
    'youtube.com': 'YouTube',
    'tiktok.com': 'TikTok',
    whatsapp: 'WhatsApp',
  };

  function groupOf(source) {
    if (source === 'directo') return 'Directo o sin origen';
    if (source === 'interno') return 'Tras navegar por el sitio';
    for (var i = 0; i < GROUPS.length; i++) {
      if (GROUPS[i].sources.indexOf(source) !== -1) return GROUPS[i].label;
    }
    return 'Otros sitios';
  }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null) node.textContent = String(text);
    return node;
  }

  function markThisBrowser() {
    var note = document.getElementById('originBrowserNote');
    try {
      window.localStorage.setItem(NO_COUNT_KEY, '1');
      if (note) note.textContent = 'Las visitas desde este navegador no se cuentan.';
    } catch (e) {
      if (note) note.textContent = 'Este navegador no permite guardar la exclusión: sus visitas al sitio sí se cuentan.';
    }
  }

  function setStatus(message) {
    var status = document.getElementById('originStatus');
    if (!status) return;
    status.textContent = message || '';
    status.hidden = !message;
  }

  function totalsByEvent(rows) {
    var totals = {};
    EVENT_COLUMNS.forEach(function (c) { totals[c.key] = 0; });
    rows.forEach(function (r) {
      if (totals[r.event_type] !== undefined) totals[r.event_type] += Number(r.total) || 0;
    });
    return totals;
  }

  function renderTiles(totals) {
    EVENT_COLUMNS.forEach(function (c) {
      var node = document.getElementById('origin-' + c.key);
      if (node) node.textContent = totals[c.key];
    });
  }

  // Tabla por tipo de origen, con el detalle de dominios dentro de cada grupo.
  function renderSources(rows) {
    var body = document.getElementById('originSourcesBody');
    if (!body) return;
    body.textContent = '';

    var groups = {};
    rows.forEach(function (r) {
      var g = groupOf(r.source);
      if (!groups[g]) groups[g] = { counts: {}, sources: {}, sum: 0 };
      var n = Number(r.total) || 0;
      groups[g].counts[r.event_type] = (groups[g].counts[r.event_type] || 0) + n;
      groups[g].sum += n;
      if (r.source !== 'directo' && r.source !== 'interno' && r.source !== 'otros') {
        groups[g].sources[r.source] = (groups[g].sources[r.source] || 0) + n;
      }
    });

    Object.keys(groups)
      .sort(function (a, b) { return groups[b].sum - groups[a].sum; })
      .forEach(function (name) {
        var g = groups[name];
        var tr = el('tr');
        var first = el('td');
        first.appendChild(el('div', 'origin-group', name));
        var detail = Object.keys(g.sources)
          .sort(function (a, b) { return g.sources[b] - g.sources[a]; })
          .slice(0, 6)
          .map(function (s) { return (SOURCE_NAMES[s] || s) + ' (' + g.sources[s] + ')'; })
          .join(' · ');
        if (detail) first.appendChild(el('div', 'origin-detail', detail));
        tr.appendChild(first);
        EVENT_COLUMNS.forEach(function (c) {
          tr.appendChild(el('td', 'origin-num', g.counts[c.key] || 0));
        });
        body.appendChild(tr);
      });
  }

  // Dónde se pulsan los botones de contacto.
  function renderClicks(rows) {
    var body = document.getElementById('originClicksBody');
    if (!body) return;
    body.textContent = '';

    var labels = { whatsapp_click: 'WhatsApp', phone_click: 'Teléfono', email_click: 'Correo' };
    var merged = {};
    rows.forEach(function (r) {
      if (!labels[r.event_type]) return;
      var key = r.event_type + '|' + r.page_path + '|' + r.placement;
      merged[key] = merged[key] || { type: labels[r.event_type], page: r.page_path, placement: r.placement, total: 0 };
      merged[key].total += Number(r.total) || 0;
    });

    var list = Object.keys(merged).map(function (k) { return merged[k]; })
      .sort(function (a, b) { return b.total - a.total; })
      .slice(0, 15);

    if (!list.length) {
      var empty = el('tr');
      var td = el('td', 'origin-empty', 'Sin clics en este periodo.');
      td.colSpan = 4;
      empty.appendChild(td);
      body.appendChild(empty);
      return;
    }

    list.forEach(function (item) {
      var tr = el('tr');
      tr.appendChild(el('td', null, item.type));
      tr.appendChild(el('td', null, item.page));
      tr.appendChild(el('td', null, PLACEMENT_LABELS[item.placement] || item.placement));
      tr.appendChild(el('td', 'origin-num', item.total));
      body.appendChild(tr);
    });
  }

  async function load(supabase) {
    var select = document.getElementById('originPeriod');
    var days = select ? parseInt(select.value, 10) || 30 : 30;
    setStatus('Cargando…');

    var result = await supabase.rpc('site_event_totals', { p_days: days });
    if (result.error) {
      // El caso esperable antes de publicar: la migración 004 no está aplicada.
      setStatus('El contador todavía no está activo en la base de datos (falta la migración 004) o no se pudo leer.');
      renderTiles(totalsByEvent([]));
      renderSources([]);
      renderClicks([]);
      return;
    }

    var rows = result.data || [];
    setStatus(rows.length ? '' : 'Aún no hay datos en este periodo.');
    renderTiles(totalsByEvent(rows));
    renderSources(rows);
    renderClicks(rows);
  }

  function init() {
    var supabase = window.adminSupabase;
    if (!supabase || !document.getElementById('originPanel')) return;

    markThisBrowser();
    load(supabase);

    var select = document.getElementById('originPeriod');
    if (select) select.addEventListener('change', function () { load(supabase); });
  }

  // admin-auth.js publica window.adminSupabase y dispara "adminReady" cuando
  // hay sesión. Si ya ocurrió antes de cargar este archivo, se arranca directo.
  if (window.adminSupabase) init();
  else window.addEventListener('adminReady', init);
})();
