// ============================================================
// Prueba de navegador — Juriscorp S.C.
// ============================================================
// Requisitos: el servidor local en marcha (node scripts/dev-server.mjs) y
// Chrome o Edge instalado. Sin dependencias: habla con el navegador por el
// protocolo DevTools usando el WebSocket nativo de Node.
//
// Uso:   node tests/e2e-navegador.mjs [carpeta-de-capturas]
//        CHROME="C:/ruta/chrome.exe" BASE=http://127.0.0.1:8137 node tests/e2e-navegador.mjs
//
// El formulario se envía al SIMULADOR del servidor local; nunca a producción.
// ============================================================

import { spawn } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const BASE = process.env.BASE || 'http://127.0.0.1:8137';
const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const SHOTS = process.argv[2] || null;
const PORT = 9333;

const PAGES = [
  '/', '/residencia-en-panama', '/permisos-de-trabajo', '/relocalizacion-legal',
  '/contratos-empresas-inmuebles', '/derecho-administrativo', '/derecho-tributario',
  '/constitucional-contencioso-administrativo', '/privacidad', '/no-existe',
  '/en/', '/en/panama-residency', '/en/work-permits', '/en/legal-relocation',
  '/en/contracts-companies-real-estate', '/en/administrative-law', '/en/tax-law',
  '/en/constitutional-administrative-litigation', '/en/privacy', '/en/no-existe',
];

const results = [];
const check = (ok, name, detail = '') => {
  results.push({ ok, name, detail });
  console.log(`${ok ? '✔' : '✖'} ${name}${detail ? ' — ' + detail : ''}`);
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// --- conexión CDP --------------------------------------------------------

const profile = mkdtempSync(join(tmpdir(), 'juriscorp-e2e-'));
const chrome = spawn(CHROME, [
  '--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`,
  '--no-first-run', '--no-default-browser-check', '--disable-extensions', 'about:blank',
], { stdio: 'ignore' });

async function browserWsUrl() {
  for (let i = 0; i < 50; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/version`);
      return (await res.json()).webSocketDebuggerUrl;
    } catch {
      await sleep(200);
    }
  }
  throw new Error('Chrome no respondió en el puerto de depuración');
}

const ws = new WebSocket(await browserWsUrl());
await new Promise((r) => ws.addEventListener('open', r, { once: true }));
let nextId = 1;
const pending = new Map();
const listeners = [];
ws.addEventListener('message', (event) => {
  const msg = JSON.parse(event.data);
  if (msg.id && pending.has(msg.id)) {
    const { resolve, reject } = pending.get(msg.id);
    pending.delete(msg.id);
    msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result);
  } else if (msg.method) {
    listeners.forEach((fn) => fn(msg));
  }
});
function send(method, params = {}, sessionId) {
  const id = nextId++;
  ws.send(JSON.stringify({ id, method, params, sessionId }));
  return new Promise((resolve, reject) => pending.set(id, { resolve, reject }));
}

const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
const cdp = (method, params) => send(method, params, sessionId);
await cdp('Page.enable');
await cdp('Runtime.enable');

const consoleErrors = [];
listeners.push((msg) => {
  if (msg.sessionId !== sessionId) return;
  if (msg.method === 'Runtime.exceptionThrown') {
    consoleErrors.push(msg.params.exceptionDetails.exception?.description || msg.params.exceptionDetails.text);
  }
  if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') {
    consoleErrors.push(msg.params.args.map((a) => a.value ?? a.description).join(' '));
  }
});

async function evaluate(expression) {
  const { result, exceptionDetails } = await cdp('Runtime.evaluate', {
    expression, awaitPromise: true, returnByValue: true,
  });
  if (exceptionDetails) throw new Error(exceptionDetails.exception?.description || exceptionDetails.text);
  return result.value;
}

async function goto(path) {
  const loaded = new Promise((resolve) => {
    const fn = (msg) => {
      if (msg.sessionId === sessionId && msg.method === 'Page.loadEventFired') {
        listeners.splice(listeners.indexOf(fn), 1);
        resolve();
      }
    };
    listeners.push(fn);
  });
  await cdp('Page.navigate', { url: BASE + path });
  await Promise.race([loaded, sleep(15000)]);
  await sleep(300);
}

async function viewport(width, height, mobile) {
  await cdp('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile });
}

async function screenshot(name) {
  if (!SHOTS) return;
  // Las animaciones de entrada (.reveal, fadeUp) se completan antes de capturar.
  await evaluate(`document.querySelectorAll('.reveal').forEach(e => e.classList.add('visible')); true`);
  await sleep(900);
  const { data } = await cdp('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true });
  writeFileSync(join(SHOTS, name + '.png'), Buffer.from(data, 'base64'));
}

// --- pruebas -------------------------------------------------------------

try {
  if (SHOTS) mkdirSync(SHOTS, { recursive: true });

  // 1. Móvil: sin desbordamiento horizontal ni errores de JavaScript.
  for (const width of [320, 375]) {
    await viewport(width, 800, true);
    for (const path of PAGES) {
      consoleErrors.length = 0;
      await goto(path);
      const overflow = await evaluate(
        `Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - window.innerWidth`
      );
      check(overflow <= 0, `${width}px sin scroll horizontal ${path}`, overflow > 0 ? `${overflow}px de más` : '');
      const jsErrors = consoleErrors.filter((e) => !/turnstile|challenges\.cloudflare/i.test(e));
      check(jsErrors.length === 0, `sin errores JS ${path} (${width}px)`, jsErrors.join(' | '));
    }
  }

  // 2. Capturas para revisión visual.
  if (SHOTS) {
    await viewport(375, 800, true);
    for (const [path, name] of [['/', 'm-es-portada'], ['/en/', 'm-en-portada'], ['/residencia-en-panama', 'm-es-residencia'], ['/en/work-permits', 'm-en-work-permits']]) {
      await goto(path);
      await screenshot(name);
    }
    await viewport(1440, 900, false);
    for (const [path, name] of [['/', 'd-es-portada'], ['/en/', 'd-en-portada'], ['/constitucional-contencioso-administrativo', 'd-es-constitucional'], ['/contratos-empresas-inmuebles', 'd-es-contratos']]) {
      await goto(path);
      await screenshot(name);
    }
  }

  // 3. Menú móvil de la portada.
  await viewport(375, 800, true);
  await goto('/');
  const menu = await evaluate(`(() => {
    const t = document.getElementById('navToggle');
    const l = document.getElementById('navLinks');
    const before = getComputedStyle(l).display;
    t.click();
    return { before, after: getComputedStyle(l).display, expanded: t.getAttribute('aria-expanded') };
  })()`);
  check(menu.before === 'none' && menu.after === 'flex' && menu.expanded === 'true', 'menú móvil se abre y anuncia aria-expanded', JSON.stringify(menu));

  // 4. Formulario en español: preselección, condicionales, validación y envío.
  await viewport(1280, 900, false);
  await goto('/?area=administrativo_tributario#contacto');
  const pre = await evaluate(`({
    area: document.getElementById('legalArea').value,
    deadlineVisible: !document.getElementById('deadlineGroup').hidden,
    dateVisible: !document.getElementById('deadlineDateGroup').hidden,
  })`);
  check(pre.area === 'administrativo_tributario', 'ES: servicio preseleccionado desde ?area=', pre.area);
  check(pre.deadlineVisible && !pre.dateVisible, 'ES: pregunta de plazo visible, fecha oculta', JSON.stringify(pre));

  await goto('/?area=nacionalizacion#contacto');
  check((await evaluate(`document.getElementById('legalArea').value`)) === '', 'ES: ?area= desconocido se ignora');

  await evaluate(`(() => { const s = document.getElementById('legalArea'); s.value = 'contratos_empresas_inmuebles'; s.dispatchEvent(new Event('change')); })()`);
  check(await evaluate(`document.getElementById('deadlineGroup').hidden`), 'ES: sin pregunta de plazo en contratos');

  const emptyErrors = await evaluate(`(() => {
    document.getElementById('submitBtn').click();
    return [...document.querySelectorAll('.form-group.error .field-error')].map(e => e.textContent);
  })()`);
  check(emptyErrors.includes('Indique un WhatsApp o teléfono, o un correo electrónico.'), 'ES: exige correo o WhatsApp', emptyErrors.join(' | '));
  check(await evaluate(`document.getElementById('consentLabel').classList.contains('error')`), 'ES: marca el consentimiento pendiente');

  const before = (await (await fetch(BASE + '/__mock/leads')).json()).length;
  await evaluate(`(() => {
    const set = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('input')); };
    const s = document.getElementById('legalArea'); s.value = 'residencia_migracion'; s.dispatchEvent(new Event('change'));
    set('fullName', 'María Prueba Local');
    set('email', 'maria@example.com');
    set('country', 'Colombia');
    const si = document.querySelector('input[name="deadline"][value="si"]'); si.checked = true; si.dispatchEvent(new Event('change', { bubbles: true }));
    set('deadlineDate', '2026-12-15');
    set('caseSummary', 'Quiero evaluar mi residencia. Prueba automatizada local.');
    document.getElementById('consent').checked = true;
    window.onTurnstileSuccess('token-de-prueba');
    document.getElementById('submitBtn').click();
  })()`);
  await sleep(1200);
  const ok = await evaluate(`({
    success: document.getElementById('formSuccess').classList.contains('visible'),
    fieldsHidden: document.getElementById('formFields').classList.contains('hidden'),
    banner: document.getElementById('formErrorBanner').textContent,
  })`);
  check(ok.success && ok.fieldsHidden, 'ES: envío correcto muestra confirmación', JSON.stringify(ok));
  const leads = await (await fetch(BASE + '/__mock/leads')).json();
  const last = leads[leads.length - 1];
  check(leads.length === before + 1 && last.legal_area === 'residencia_migracion' && last.phone === null
    && last.client_country === 'Colombia' && last.has_deadline === 'si' && last.deadline_date === '2026-12-15',
    'ES: el simulador recibió los datos esperados', JSON.stringify(last));

  // 5. Formulario en inglés: mensajes en inglés y plazo oculto si cambia el servicio.
  await goto('/en/?area=permisos_trabajo#contact');
  const en = await evaluate(`(() => {
    const radio = document.querySelector('input[name="deadline"][value="si"]');
    radio.checked = true; radio.dispatchEvent(new Event('change', { bubbles: true }));
    const dateShown = !document.getElementById('deadlineDateGroup').hidden;
    const s = document.getElementById('legalArea'); s.value = 'relocalizacion_legal'; s.dispatchEvent(new Event('change'));
    document.getElementById('submitBtn').click();
    return {
      dateShown,
      groupHiddenAfter: document.getElementById('deadlineGroup').hidden,
      errors: [...document.querySelectorAll('.form-group.error .field-error')].map(e => e.textContent),
    };
  })()`);
  check(en.dateShown && en.groupHiddenAfter, 'EN: fecha aparece con "Yes" y el bloque se oculta al cambiar de servicio', JSON.stringify(en));
  check(en.errors.includes('Please provide a WhatsApp or phone number, or an email address.'), 'EN: errores en inglés', en.errors.join(' | '));

  // 6. Páginas de servicio: CTA lleva al formulario con el servicio correcto.
  await goto('/en/constitutional-administrative-litigation');
  const cta = await evaluate(`document.querySelector('.area-btn-primary').getAttribute('href')`);
  check(cta === '/en/?area=constitucional_contencioso#contact', 'EN: CTA de servicio preselecciona el área', cta);

  // 7. Contador anónimo (js/track.js → simulador /__mock/track-event).
  const events = async () => (await fetch(BASE + '/__mock/events')).json();
  const since = async (n) => (await events()).slice(n);
  // Pulsa un enlace sin dejar que el navegador abra WhatsApp, el marcador o
  // el correo: el contador escucha en fase de captura y cuenta antes.
  const clickNoNav = (selector) => evaluate(`(() => {
    const a = document.querySelector(${JSON.stringify(selector)});
    if (!a) return false;
    a.addEventListener('click', (e) => e.preventDefault(), { once: true });
    a.click();
    return true;
  })()`);
  const settle = () => sleep(600);

  check((await evaluate('navigator.webdriver')) !== true, 'contador: el navegador de prueba no se marca como automatizado');

  let mark = (await events()).length;
  await goto('/residencia-en-panama?utm_source=chatgpt.com');
  await clickNoNav('.area-btn-ghost');
  await settle();
  let got = await since(mark);
  check(got.some((e) => e.accepted && e.event_type === 'landing' && e.page_path === '/residencia-en-panama' && e.source === 'chatgpt.com' && e.lang === 'es'),
    'contador: entrada desde ChatGPT (utm_source) en página de servicio', JSON.stringify(got));
  check(got.some((e) => e.accepted && e.event_type === 'whatsapp_click' && e.placement === 'cta' && e.source === 'chatgpt.com'),
    'contador: clic de WhatsApp en la CTA atribuido a ChatGPT', JSON.stringify(got));

  mark = (await events()).length;
  await goto('/');
  await clickNoNav('#whatsapp-float');
  await clickNoNav('#contact-phone');
  await clickNoNav('#contact-email');
  await settle();
  got = await since(mark);
  const types = got.filter((e) => e.accepted).map((e) => `${e.event_type}:${e.placement}:${e.source}`);
  for (const expected of ['landing:none:directo', 'whatsapp_click:float:directo', 'phone_click:contact:directo', 'email_click:contact:directo']) {
    check(types.includes(expected), `contador: portada registra ${expected}`, types.join(', '));
  }

  // Navegación interna real: no es una entrada nueva, y el clic queda como "interno".
  mark = (await events()).length;
  const loaded = new Promise((resolve) => {
    const fn = (msg) => {
      if (msg.sessionId === sessionId && msg.method === 'Page.loadEventFired') {
        listeners.splice(listeners.indexOf(fn), 1);
        resolve();
      }
    };
    listeners.push(fn);
  });
  await evaluate(`document.querySelector('footer a[href="/derecho-tributario"]').click()`);
  await Promise.race([loaded, sleep(10000)]);
  await sleep(300);
  await clickNoNav('.area-btn-ghost');
  await settle();
  got = await since(mark);
  check(!got.some((e) => e.event_type === 'landing'), 'contador: navegar dentro del sitio no cuenta otra entrada', JSON.stringify(got));
  check(got.some((e) => e.accepted && e.event_type === 'whatsapp_click' && e.page_path === '/derecho-tributario' && e.source === 'interno'),
    'contador: clic tras navegar internamente queda como "interno"', JSON.stringify(got));

  // Envío del formulario (ya ocurrió en la prueba 4).
  check((await events()).some((e) => e.accepted && e.event_type === 'form_submit' && e.placement === 'form' && e.page_path === '/'),
    'contador: el envío correcto del formulario suma una consulta');

  // Inglés y página de error.
  mark = (await events()).length;
  await goto('/en/work-permits');
  await goto('/no-existe');
  await clickNoNav('a[href^="https://wa.me/"]');
  await settle();
  got = await since(mark);
  check(got.some((e) => e.event_type === 'landing' && e.page_path === '/en/work-permits' && e.lang === 'en'), 'contador: entrada en inglés', JSON.stringify(got));
  check(!got.some((e) => e.page_path === '/no-existe'), 'contador: la página de error no envía nada', JSON.stringify(got));

  // Exclusión del equipo: la marca que pone el panel desactiva el contador.
  await goto('/');
  await evaluate(`localStorage.setItem('juriscorp_no_contar', '1')`);
  mark = (await events()).length;
  await goto('/en/');
  await clickNoNav('#whatsapp-float');
  await settle();
  got = await since(mark);
  check(got.length === 0, 'contador: un navegador del equipo no se cuenta', JSON.stringify(got));
  await evaluate(`localStorage.removeItem('juriscorp_no_contar')`);

  // El contador no escribe nada en el navegador del visitante.
  await goto('/residencia-en-panama?utm_source=perplexity.ai');
  const storage = await evaluate(`({ cookies: document.cookie, local: localStorage.length, session: sessionStorage.length })`);
  check(storage.cookies === '' && storage.local === 0 && storage.session === 0,
    'contador: sin cookies ni almacenamiento en el navegador del visitante', JSON.stringify(storage));

  const rejected = (await events()).filter((e) => !e.accepted);
  check(rejected.length === 0, 'contador: el simulador no rechazó ningún evento del sitio', JSON.stringify(rejected));
} catch (e) {
  check(false, 'ejecución de la prueba', e.stack || String(e));
} finally {
  ws.close();
  chrome.kill();
  await sleep(500);
  try { rmSync(profile, { recursive: true, force: true }); } catch { /* perfil temporal */ }
}

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} comprobaciones superadas.`);
process.exit(failed.length ? 1 : 0);
