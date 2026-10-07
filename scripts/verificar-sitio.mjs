// ============================================================
// Verificación estática del sitio — Juriscorp S.C.
// ============================================================
// Uso:   node scripts/verificar-sitio.mjs
// Sale con código 1 si encuentra un ERROR. Los AVISOS son para revisión
// humana: términos que pueden ser legítimos (una exclusión explícita como
// "no ofrecemos defensa penal") o no.
//
// Comprueba, sin red ni dependencias:
//   - enlaces internos y anclas (#id) de todas las páginas públicas
//   - canonical y hreflang recíproco entre las dos versiones de idioma
//   - sitemap.xml: cada URL existe y cada página pública está listada
//   - JSON-LD válido
//   - un solo <h1>; longitud de <title> y meta description
//   - las <option> del formulario coinciden con SERVICE_AREAS del backend
//   - términos de servicios retirados o promesas no permitidas
// ============================================================

import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import validation, { trackValidation } from './lib/load-validation.mjs';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const ORIGIN = 'https://juriscorppanama.com';
const errors = [];
const warnings = [];
const err = (m) => errors.push(m);
const warn = (m) => warnings.push(m);

// --- páginas -------------------------------------------------------------

const SKIP_DIRS = new Set(['node_modules', '.git', 'admin', 'scripts', 'tests', 'supabase', 'docs', 'assets']);

function htmlFiles(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      if (!SKIP_DIRS.has(name)) out.push(...htmlFiles(full));
    } else if (name.endsWith('.html')) {
      out.push(full);
    }
  }
  return out;
}

const files = htmlFiles(ROOT);
const rel = (f) => relative(ROOT, f).split(sep).join('/');

// Ruta pública canónica (sin .html, como sirve Netlify con pretty_urls).
function publicPath(file) {
  const r = rel(file);
  if (r === 'index.html') return '/';
  if (r.endsWith('/index.html')) return '/' + r.slice(0, -'index.html'.length);
  return '/' + r.replace(/\.html$/, '');
}

const pages = new Map(); // ruta pública -> { file, html, ids }
for (const file of files) {
  const html = readFileSync(file, 'utf8');
  const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
  pages.set(publicPath(file), { file, html, ids });
}

const isErrorPage = (p) => p === '/404' || p === '/en/404';

function resolvePath(pathname) {
  let p = pathname.replace(/\.html$/, '');
  if (p.endsWith('/index')) p = p.slice(0, -'index'.length);
  if (pages.has(p)) return p;
  if (pages.has(p + '/')) return p + '/';
  return null;
}

function stripComments(html) {
  return html.replace(/<!--[\s\S]*?-->/g, '');
}

// --- enlaces y anclas ----------------------------------------------------

for (const [path, page] of pages) {
  const html = stripComments(page.html);
  for (const m of html.matchAll(/\s(?:href|src)="([^"]+)"/g)) {
    const raw = m[1];
    if (/^(https?:|mailto:|tel:|data:)/.test(raw)) {
      if (raw.startsWith(ORIGIN)) continue; // canonical/og: se revisan aparte
      continue;
    }
    const url = new URL(raw, ORIGIN + path);
    const target = url.pathname;
    if (/\.(css|js|png|jpg|webp|woff2|xml|txt)$/.test(target)) {
      if (!existsSync(join(ROOT, decodeURIComponent(target)))) err(`${path}: recurso inexistente ${raw}`);
      continue;
    }
    const resolved = resolvePath(target);
    if (!resolved) {
      err(`${path}: enlace roto ${raw}`);
      continue;
    }
    if (url.hash) {
      const id = decodeURIComponent(url.hash.slice(1));
      if (!pages.get(resolved).ids.has(id)) err(`${path}: ancla inexistente ${raw}`);
    }
  }
}

// --- canonical, hreflang, h1, title, description, JSON-LD ----------------

function attrOf(html, re) {
  const m = html.match(re);
  return m ? m[1] : null;
}

for (const [path, page] of pages) {
  const { html } = page;
  const h1 = (stripComments(html).match(/<h1[\s>]/g) || []).length;
  if (h1 !== 1) err(`${path}: ${h1} elementos <h1> (debe haber 1)`);

  const title = attrOf(html, /<title>([^<]*)<\/title>/);
  if (!title) err(`${path}: sin <title>`);
  else if (title.replace(/&amp;/g, '&').length > 62) warn(`${path}: <title> de ${title.length} caracteres`);

  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try {
      JSON.parse(m[1]);
    } catch (e) {
      err(`${path}: JSON-LD inválido (${e.message})`);
    }
  }

  if (isErrorPage(path)) continue;

  const desc = attrOf(html, /<meta name="description"\s+content="([^"]*)"/);
  if (!desc) err(`${path}: sin meta description`);
  else if (desc.length > 170) warn(`${path}: description de ${desc.length} caracteres`);

  const canonical = attrOf(html, /<link rel="canonical" href="([^"]+)"/);
  if (canonical !== ORIGIN + path) err(`${path}: canonical ${canonical} no coincide con ${ORIGIN + path}`);

  const alts = Object.fromEntries(
    [...html.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g)].map((m) => [m[1], m[2]])
  );
  for (const lang of ['es', 'en', 'x-default']) {
    if (!alts[lang]) err(`${path}: falta hreflang ${lang}`);
  }
  if (alts[path.startsWith('/en/') ? 'en' : 'es'] !== ORIGIN + path) {
    err(`${path}: el hreflang de su propio idioma no apunta a sí misma`);
  }
  for (const lang of ['es', 'en']) {
    const other = alts[lang] && alts[lang].replace(ORIGIN, '');
    if (!other || other === path) continue;
    const otherPage = pages.get(other);
    if (!otherPage) {
      err(`${path}: hreflang ${lang} apunta a una página inexistente ${other}`);
      continue;
    }
    const back = attrOf(otherPage.html, new RegExp(`hreflang="${path.startsWith('/en/') ? 'en' : 'es'}" href="([^"]+)"`));
    if (back !== ORIGIN + path) err(`${path}: hreflang no recíproco con ${other}`);
  }
}

// --- sitemap -------------------------------------------------------------

const sitemap = readFileSync(join(ROOT, 'sitemap.xml'), 'utf8');
const locs = new Set([...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace(ORIGIN, '')));
for (const loc of locs) if (!resolvePath(loc)) err(`sitemap: URL sin página ${loc}`);
for (const path of pages.keys()) {
  if (!isErrorPage(path) && !locs.has(path)) err(`sitemap: falta ${path}`);
}

// --- formulario vs backend -----------------------------------------------

for (const path of ['/', '/en/']) {
  const html = pages.get(path).html;
  const select = html.match(/<select id="legalArea"[\s\S]*?<\/select>/);
  if (!select) {
    err(`${path}: sin <select id="legalArea">`);
    continue;
  }
  const values = [...select[0].matchAll(/<option value="([^"]*)"/g)].map((m) => m[1]).filter(Boolean);
  const expected = [...validation.SERVICE_AREAS];
  if (values.join() !== expected.join()) {
    err(`${path}: opciones del formulario [${values}] no coinciden con SERVICE_AREAS [${expected}]`);
  }
}

for (const path of pages.keys()) {
  for (const m of stripComments(pages.get(path).html).matchAll(/\?area=([a-z_]+)/g)) {
    if (!validation.SERVICE_AREAS.includes(m[1])) err(`${path}: enlace con ?area=${m[1]} desconocido`);
  }
}

// --- paridad de idiomas --------------------------------------------------

const esCount = [...pages.keys()].filter((p) => !p.startsWith('/en/')).length;
const enCount = [...pages.keys()].filter((p) => p.startsWith('/en/')).length;
if (esCount !== enCount) err(`paridad: ${esCount} páginas en español y ${enCount} en inglés`);

// --- términos ------------------------------------------------------------

// ERROR: no deben aparecer en ningún texto público.
const FORBIDDEN = [
  'derecho-penal', 'criminal-law', 'todas las fases', 'all stages',
  'Regularización de Tierras', 'Land regularisation', 'Poderes y Sociedades',
  'planificación tributaria', 'Asesoría fiscal integral', 'tax planning advice',
  '24/7', '24 horas', 'Maestría especializada en esta materia',
  'en su ausencia', 'in your absence', '100 % virtual', '100% virtual',
  'Abogado Independiente', 'Independent Attorney', 'a la brevedad',
];
// AVISO: pueden ser legítimos (exclusiones o negaciones). Revisar a mano.
const REVIEW = [
  // Son expresiones regulares: '\\b' evita contar "penalties" como "penal".
  'penal\\b', 'criminal', 'naturaliz', 'naturalis', 'nacionaliz', 'linderos', 'boundary',
  'agrari', 'garantiz', 'guarantee', 'sin viajar', 'without travel', 'electoral',
  'agente residente', 'registered agent', 'inglés', 'English', 'última instancia', 'last resort',
];

function visibleText(html) {
  return stripComments(html)
    .replace(/<script(?![^>]*ld\+json)[\s\S]*?<\/script>/g, ' ')
    .replace(/<style[\s\S]*?<\/style>/g, ' ');
}

for (const [path, page] of pages) {
  const text = visibleText(page.html);
  for (const term of FORBIDDEN) {
    if (text.includes(term)) err(`${path}: término retirado "${term}"`);
  }
  for (const term of REVIEW) {
    const re = new RegExp(term, 'gi');
    let m;
    while ((m = re.exec(text))) {
      const ctx = text.slice(Math.max(0, m.index - 60), m.index + 60).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
      warn(`${path}: "${term}" … ${ctx.trim()} …`);
    }
  }
}

// --- contador anónimo (js/track.js) ---------------------------------------

{
  const tracked = [...trackValidation.TRACKED_PAGES].sort();
  const publicPages = [...pages.keys()].filter((p) => !isErrorPage(p)).sort();
  if (tracked.join() !== publicPages.join()) {
    const missing = publicPages.filter((p) => !tracked.includes(p));
    const extra = tracked.filter((p) => !publicPages.includes(p));
    err(`contador: TRACKED_PAGES no coincide con las páginas públicas (faltan [${missing}], sobran [${extra}])`);
  }
  for (const path of publicPages) {
    const html = stripComments(pages.get(path).html);
    const config = html.indexOf('src="/js/config.js"');
    const track = html.indexOf('src="/js/track.js"');
    if (track === -1) err(`${path}: no carga /js/track.js`);
    else if (config === -1 || config > track) err(`${path}: /js/config.js debe cargarse antes que /js/track.js`);
  }
  for (const path of ['/404', '/en/404']) {
    if (pages.has(path) && pages.get(path).html.includes('/js/track.js')) {
      err(`${path}: la página de error no debe contar visitas`);
    }
  }
  // El panel debe saber agrupar y nombrar todos los orígenes posibles.
  const panelJs = readFileSync(join(ROOT, 'js', 'admin-analytics.js'), 'utf8');
  for (const source of trackValidation.KNOWN_SOURCES) {
    if (['directo', 'interno', 'otros'].includes(source)) continue;
    if (!panelJs.includes(`'${source}'`) && !new RegExp(`\\b${source}:`).test(panelJs)) {
      err(`js/admin-analytics.js: el origen "${source}" no está en GROUPS / SOURCE_NAMES`);
    }
  }

  const configJs = readFileSync(join(ROOT, 'js', 'config.js'), 'utf8');
  if (!/TRACK_URL:\s*'https:\/\/[a-z0-9]+\.supabase\.co\/functions\/v1\/track-event'/.test(configJs)) {
    err('js/config.js: TRACK_URL no apunta a la función track-event');
  }
}

// --- robots.txt ----------------------------------------------------------

// Rastreadores de IA que deben poder leer el sitio. No hace falta un bloque
// propio: basta con que el bloque que les aplica (el suyo o, si no tienen, "*")
// no les cierre el sitio.
const AI_AGENTS = [
  'OAI-SearchBot', 'ChatGPT-User', 'GPTBot', 'Claude-SearchBot', 'Claude-User', 'ClaudeBot',
  'PerplexityBot', 'Perplexity-User', 'Google-Extended', 'Applebot-Extended', 'DuckAssistBot',
  'Meta-ExternalAgent', 'Amazonbot',
];
// Rutas que ningún rastreador debe visitar. Un bloque propio de un bot ANULA el
// bloque "*": si los Disallow no se repiten en cada bloque, ese bot los ignora.
const ROBOTS_DISALLOW = ['/admin/', '/supabase/'];

function parseRobots(text) {
  const groups = [];
  let current = null;
  let lastWasAgent = false;
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.replace(/#.*/, '').trim();
    if (!line) continue;
    const [field, ...rest] = line.split(':');
    const key = field.trim().toLowerCase();
    const value = rest.join(':').trim();
    if (key === 'user-agent') {
      if (!current || !lastWasAgent) {
        current = { agents: [], allow: [], disallow: [] };
        groups.push(current);
      }
      current.agents.push(value);
      lastWasAgent = true;
    } else if (current && (key === 'allow' || key === 'disallow')) {
      current[key].push(value);
      lastWasAgent = false;
    } else {
      lastWasAgent = false;
    }
  }
  return groups;
}

const robotsText = readFileSync(join(ROOT, 'robots.txt'), 'utf8');
const robotsGroups = parseRobots(robotsText);
if (!robotsGroups.some((g) => g.agents.includes('*'))) err('robots.txt: falta el bloque User-agent: *');
for (const group of robotsGroups) {
  const name = group.agents.join(', ');
  for (const path of ROBOTS_DISALLOW) {
    if (!group.disallow.includes(path)) err(`robots.txt: el bloque [${name}] no repite Disallow: ${path}`);
  }
  if (group.disallow.includes('/')) err(`robots.txt: el bloque [${name}] bloquea todo el sitio`);
}
for (const agent of AI_AGENTS) {
  const own = robotsGroups.find((g) => g.agents.some((a) => a.toLowerCase() === agent.toLowerCase()));
  const group = own || robotsGroups.find((g) => g.agents.includes('*'));
  if (!group || group.disallow.includes('/')) err(`robots.txt: ${agent} no puede leer el sitio`);
}
if (!new RegExp(`^Sitemap:\\s*${ORIGIN}/sitemap\\.xml\\s*$`, 'mi').test(robotsText)) {
  err('robots.txt: falta la línea Sitemap');
}

// --- llms.txt ------------------------------------------------------------

const llmsText = readFileSync(join(ROOT, 'llms.txt'), 'utf8');
if (!/^# \S/.test(llmsText)) err('llms.txt: debe empezar por un título "# …"');
if (!/^> \S/m.test(llmsText)) err('llms.txt: falta el resumen en cita ("> …")');
const llmsLinks = [...llmsText.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g)].map((m) => m[2]);
const llmsPaths = new Set();
for (const link of llmsLinks) {
  if (!link.startsWith(ORIGIN)) {
    err(`llms.txt: enlace fuera del dominio ${link}`);
    continue;
  }
  const path = link.slice(ORIGIN.length).split('#')[0] || '/';
  llmsPaths.add(path);
  if (path === '/sitemap.xml') continue;
  if (!resolvePath(path)) err(`llms.txt: enlace a una página inexistente ${link}`);
}
// Todas las páginas de servicio (no portada, privacidad ni error) deben estar listadas.
for (const path of pages.keys()) {
  if (isErrorPage(path) || path === '/' || path === '/en/' || /privacidad|privacy/.test(path)) continue;
  if (!llmsPaths.has(path)) err(`llms.txt: falta la página de servicio ${path}`);
}
// Mismo alcance en los dos idiomas.
const llmsEs = [...llmsPaths].filter((p) => !p.startsWith('/en/') && p !== '/sitemap.xml' && !/privacidad/.test(p)).length;
const llmsEn = [...llmsPaths].filter((p) => p.startsWith('/en/') && !/privacy/.test(p)).length;
if (llmsEs !== llmsEn) err(`llms.txt: ${llmsEs} servicios en español y ${llmsEn} en inglés`);
for (const term of FORBIDDEN) {
  if (llmsText.includes(term)) err(`llms.txt: término retirado "${term}"`);
}

// --- resultado -----------------------------------------------------------

console.log(`Páginas públicas revisadas: ${pages.size} (${esCount} ES, ${enCount} EN)`);
console.log(`URLs en sitemap: ${locs.size}`);
if (warnings.length) {
  console.log(`\nAVISOS para revisión humana (${warnings.length}):`);
  for (const w of warnings) console.log('  - ' + w);
}
if (errors.length) {
  console.log(`\nERRORES (${errors.length}):`);
  for (const e of errors) console.log('  ✖ ' + e);
  process.exit(1);
}
console.log('\nSin errores.');
