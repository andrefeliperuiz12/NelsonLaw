// ============================================================
// Servidor local de revisión — Juriscorp S.C.
// ============================================================
// Uso:   node scripts/dev-server.mjs            (puerto 8137)
//        PORT=9000 node scripts/dev-server.mjs
//
// QUÉ HACE, Y QUÉ NO.
//   - Sirve los archivos del repositorio imitando a Netlify en lo que importa
//     para revisar: URLs sin .html (pretty_urls), /en/404 y /404 reales.
//   - NUNCA contacta producción. Reescribe js/config.js para que el
//     formulario apunte a /__mock/submit-lead, un simulador que aplica la
//     MISMA validación que la Edge Function (validation.ts) y guarda lo
//     recibido sólo en memoria. No hay Supabase, ni correo, ni CRM.
//   - Sustituye la clave de Turnstile por la clave pública de PRUEBA de
//     Cloudflare (1x00000000000000000000AA, siempre aprueba). La de producción
//     está limitada al dominio y fallaría en localhost.
//   - NO sirve el panel /admin/ ni js/admin-config.js: el panel se autentica
//     contra el Supabase de PRODUCCIÓN y leería leads reales.
//   - No aplica _headers ni _redirects: la CSP y las reglas de bloqueo se
//     comprueban en la previsualización de Netlify antes de publicar.
//
// GET /__mock/leads devuelve las consultas simuladas recibidas.
// GET /__mock/events devuelve los eventos del contador anónimo simulado
// (js/track.js → /__mock/track-event, misma validación que track-event).
// ============================================================

import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import validation, { trackValidation } from './lib/load-validation.mjs';

const { validateLead, MENSAJES } = validation;

const ROOT = fileURLToPath(new URL('..', import.meta.url));
// 8137 y no 8080: en la máquina de desarrollo el 8080 ya lo usa otro servicio.
const PORT = Number(process.env.PORT) || 8137;
const TURNSTILE_TEST_KEY = '1x00000000000000000000AA';
const PROD_TURNSTILE_KEY = '0x4AAAAAACzHvF4l30jALx9_';

// Rutas que en producción quedan bloqueadas por _redirects. Aquí también, para
// que la revisión local no dé por buena una fuga.
const BLOCKED_PREFIXES = [
  '/supabase/', '/docs/', '/scripts/', '/tests/', '/assets/site_memory/', '/node_modules/', '/.',
  '/admin', '/js/admin-',
];
const BLOCKED_FILES = new Set([
  '/readme.md', '/operations_guide.md', '/security_checklist.md', '/seo_checklist.md',
  '/package.json', '/package-lock.json', '/netlify.toml', '/_headers', '/_redirects',
]);

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.json': 'application/json',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp',
  '.woff2': 'font/woff2', '.xml': 'application/xml', '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
};

const DEV_CONFIG = `// Configuración de DESARROLLO servida por scripts/dev-server.mjs.
// El js/config.js real no se usa en local: apuntaría a producción.
window.NELSON_CONFIG = {
  EDGE_FUNCTION_URL: '/__mock/submit-lead',
  TRACK_URL: '/__mock/track-event',
  TURNSTILE_SITE_KEY: '${TURNSTILE_TEST_KEY}',
  WHATSAPP_NUMBER: '50766730357',
};
`;

const mockLeads = [];
const mockEvents = [];

async function fileFor(pathname) {
  const clean = normalize(decodeURIComponent(pathname)).replace(/^([\\/])+/, '');
  const full = join(ROOT, clean);
  if (!full.startsWith(ROOT.replace(/[\\/]$/, '') + sep) && full !== ROOT) return null;
  const candidates = pathname.endsWith('/')
    ? [join(full, 'index.html')]
    : [full, full + '.html', join(full, 'index.html')];
  for (const candidate of candidates) {
    try {
      if ((await stat(candidate)).isFile()) return candidate;
    } catch { /* siguiente candidato */ }
  }
  return null;
}

// Se compara la ruta DECODIFICADA y en minúsculas: si no, /%73upabase/ o
// /SUPABASE/ (Windows no distingue mayúsculas) esquivarían el bloqueo.
function isBlocked(pathname) {
  let p;
  try {
    p = decodeURIComponent(pathname).replace(/\\/g, '/').toLowerCase();
  } catch {
    return true;
  }
  return BLOCKED_FILES.has(p) || BLOCKED_PREFIXES.some((prefix) => p.startsWith(prefix));
}

async function sendFile(res, file, status = 200) {
  let body = await readFile(file);
  const type = TYPES[extname(file)] || 'application/octet-stream';
  if (extname(file) === '.html') {
    body = Buffer.from(body.toString('utf8').replaceAll(PROD_TURNSTILE_KEY, TURNSTILE_TEST_KEY));
  }
  res.writeHead(status, { 'Content-Type': type, 'Cache-Control': 'no-store' });
  res.end(body);
}

async function notFound(res, pathname) {
  const page = pathname.startsWith('/en/') ? 'en/404.html' : '404.html';
  await sendFile(res, join(ROOT, page), 404);
}

function json(res, status, payload) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(payload));
}

// Igual que la Edge Function: valida contra listas cerradas y responde 204
// pase lo que pase. Rechazados se anotan aparte para poder depurar.
async function handleMockTrack(req, res) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  let body = null;
  try {
    body = JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch { /* cuerpo inválido */ }
  const result = trackValidation.validateTrackEvent(body);
  mockEvents.push(result.ok ? { accepted: true, ...result.event } : { accepted: false, reason: result.reason });
  res.writeHead(204, { 'Access-Control-Allow-Origin': '*' });
  res.end();
}

async function handleMockSubmit(req, res, url) {
  const msg = MENSAJES[url.searchParams.get('lang') === 'en' ? 'en' : 'es'];
  let body;
  try {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    body = JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    return json(res, 500, { success: false, error: msg.unexpected });
  }
  if (!body.consent) return json(res, 400, { success: false, error: msg.consent });
  if (!body.turnstileToken) return json(res, 400, { success: false, error: msg.turnstileRequired });
  const result = validateLead(body);
  if (!result.ok) return json(res, 400, { success: false, error: msg[result.code] });
  mockLeads.push({ received_at: new Date().toISOString(), ...result.lead });
  console.log('[mock] consulta simulada recibida:', result.lead.legal_area, '| país:', result.lead.client_country);
  return json(res, 200, { success: true, message: 'Consulta recibida (simulada).', leadId: 'mock-' + mockLeads.length });
}

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const { pathname } = url;

    if (pathname === '/__mock/submit-lead' && req.method === 'POST') return handleMockSubmit(req, res, url);
    if (pathname === '/__mock/leads') return json(res, 200, mockLeads);
    if (pathname === '/__mock/track-event' && req.method === 'POST') return handleMockTrack(req, res);
    if (pathname === '/__mock/events') return json(res, 200, mockEvents);
    if (pathname === '/js/config.js') {
      res.writeHead(200, { 'Content-Type': 'text/javascript; charset=utf-8', 'Cache-Control': 'no-store' });
      return res.end(DEV_CONFIG);
    }
    if (isBlocked(pathname)) return notFound(res, pathname);

    const file = await fileFor(pathname);
    if (!file) return notFound(res, pathname);
    return sendFile(res, file);
  } catch (err) {
    console.error(err);
    res.writeHead(500);
    res.end('Error del servidor local');
  }
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE' || err.code === 'EACCES') {
    console.error(`El puerto ${PORT} está ocupado o no está permitido. Pruebe con otro: PORT=9000 node scripts/dev-server.mjs`);
    process.exit(1);
  }
  throw err;
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Juriscorp — revisión local en http://127.0.0.1:${PORT}/`);
  console.log('Formulario conectado al SIMULADOR local. No se envía nada a producción.');
});
