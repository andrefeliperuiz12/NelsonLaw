// Pruebas del contador anónimo (supabase/functions/track-event/validation.ts).
// Ejecutar con:  node --test "tests/*.test.mjs"

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { trackValidation } from '../scripts/lib/load-validation.mjs';

const {
  validateTrackEvent, normalizePath, classifySource,
  TRACKED_PAGES, KNOWN_SOURCES, EVENT_TYPES, PLACEMENTS,
} = trackValidation;

const click = { event: 'whatsapp_click', page: '/residencia-en-panama', placement: 'cta', lang: 'es', source: 'chatgpt.com' };

test('acepta un clic de WhatsApp válido', () => {
  assert.deepEqual(validateTrackEvent(click), {
    ok: true,
    event: { event_type: 'whatsapp_click', page_path: '/residencia-en-panama', placement: 'cta', lang: 'es', source: 'chatgpt.com' },
  });
});

test('normaliza la ruta', () => {
  assert.equal(validateTrackEvent({ ...click, page: '/residencia-en-panama.html' }).event.page_path, '/residencia-en-panama');
  assert.equal(validateTrackEvent({ ...click, page: '/en/index.html' }).event.page_path, '/en/');
  assert.equal(normalizePath('/en'), '/en/');
  assert.equal(normalizePath('/index.html'), '/');
});

test('clasifica el origen en la lista cerrada', () => {
  const cases = {
    'chatgpt.com': 'chatgpt.com',
    'chat.openai.com': 'chatgpt.com',
    'WWW.Google.COM': 'google',
    'google.com.pa': 'google',
    'gemini.google.com': 'gemini.google.com', // IA, no buscador
    'perplexity.ai': 'perplexity.ai',
    'l.facebook.com': 'facebook.com',
    'lm.facebook.com': 'facebook.com',
    't.co': 'x.com',
    'lnkd.in': 'linkedin.com',
    'directo': 'directo',
    'interno': 'interno',
  };
  for (const [input, expected] of Object.entries(cases)) {
    assert.equal(validateTrackEvent({ ...click, source: input }).event.source, expected, input);
  }
});

test('un origen desconocido se guarda como "otros", nunca tal cual', () => {
  // Formas válidas de dominio o etiqueta, pero que podrían ser personales o
  // servir de identificador de una persona.
  for (const source of ['maria-perez-66730357', 'alice.github.io', 'juan.perez.com', 'campana-whatsapp-cliente-17', '192.168.1.10']) {
    const r = validateTrackEvent({ ...click, source });
    assert.equal(r.ok, true, source);
    assert.equal(r.event.source, 'otros', source);
  }
});

test('rechaza orígenes sin forma de dominio o etiqueta (no se guarda nada)', () => {
  for (const source of ['maria@example.com', 'https://chatgpt.com/c/123', 'chatgpt.com/?q=abogado', 'Juan Pérez', '+507 6000-0000', '-malo.com', 'x'.repeat(101), '']) {
    assert.equal(validateTrackEvent({ ...click, source }).ok, false, source);
  }
});

test('el resultado de la clasificación pertenece siempre a KNOWN_SOURCES', () => {
  for (const raw of ['chatgpt.com', 'google.de', 'cualquiera.net', 'directo', 'interno', 'ig', 'youtu.be']) {
    assert.ok(KNOWN_SOURCES.includes(classifySource(raw)), raw);
  }
});

test('una entrada al sitio no lleva ubicación y no puede ser "interno"', () => {
  const landing = validateTrackEvent({ event: 'landing', page: '/', placement: 'float', lang: 'es', source: 'directo' });
  assert.equal(landing.event.placement, 'none');
  assert.equal(validateTrackEvent({ event: 'landing', page: '/', lang: 'es', source: 'interno' }).ok, false);
});

test('rechaza cualquier valor fuera de las listas cerradas', () => {
  assert.equal(validateTrackEvent(null).ok, false);
  assert.equal(validateTrackEvent({ ...click, event: 'pageview' }).ok, false);
  assert.equal(validateTrackEvent({ ...click, page: '/admin/dashboard' }).ok, false);
  assert.equal(validateTrackEvent({ ...click, page: '/derecho-penal' }).ok, false);
  assert.equal(validateTrackEvent({ ...click, placement: 'header' }).ok, false);
  assert.equal(validateTrackEvent({ ...click, lang: 'fr' }).ok, false);
});

test('ignora campos extra: sólo se guardan los cinco previstos', () => {
  const r = validateTrackEvent({ ...click, ip: '1.2.3.4', userAgent: 'x', email: 'a@b.co' });
  assert.deepEqual(Object.keys(r.event).sort(), ['event_type', 'lang', 'page_path', 'placement', 'source']);
});

test('la lista de páginas no tiene duplicados', () => {
  assert.equal(new Set(TRACKED_PAGES).size, TRACKED_PAGES.length);
});

// La base de datos debe aceptar EXACTAMENTE lo mismo que la función: si una
// lista se amplía en un sitio y no en el otro, los eventos fallan en silencio
// o la base admite valores que la función nunca debería producir.
test('los CHECK de la migración 004 coinciden con las listas del código', () => {
  const sql = readFileSync(new URL('../supabase/migrations/004_site_event_counts.sql', import.meta.url), 'utf8');
  const checkList = (column) => {
    const m = sql.match(new RegExp(`\\b${column}\\s+TEXT[^]*?CHECK\\s*\\(${column}\\s+IN\\s*\\(([^)]*)\\)\\)`));
    assert.ok(m, `sin CHECK ... IN para ${column}`);
    return [...m[1].matchAll(/'([^']+)'/g)].map((x) => x[1]).sort();
  };
  assert.deepEqual(checkList('source'), [...KNOWN_SOURCES].sort());
  assert.deepEqual(checkList('event_type'), [...EVENT_TYPES].sort());
  assert.deepEqual(checkList('placement'), [...PLACEMENTS].sort());
  for (const page of TRACKED_PAGES) {
    assert.match(page, /^\/[a-z0-9/-]{0,100}$/, `la ruta ${page} no cumple el CHECK de page_path`);
  }
});
