// ============================================================
// Juriscorp S.C. — Validación del contador anónimo de contactos
// ============================================================
//
// QUÉ SE CUENTA. Cuántas veces se pulsa WhatsApp, teléfono o correo, cuántas
// consultas se envían y cuántas visitas ENTRAN al sitio, agrupado por día,
// página y tipo de origen (un buscador, un asistente de IA, directo...).
//
// QUÉ NO SE GUARDA NUNCA. Ni dirección IP, ni navegador, ni identificador, ni
// hora exacta, ni texto libre. Cada columna admite sólo valores de una lista
// cerrada, también el origen, que se clasifica (ver KNOWN_SOURCES): un utm o
// un dominio que no esté en la lista se guarda como "otros", nunca tal cual.
// La base de datos repite las mismas listas en sus CHECK.
//
// Lógica pura (sin Deno ni Supabase) para probarla con Node
// (tests/track-validation.test.mjs) y reutilizarla en el simulador local.
// ============================================================

export const EVENT_TYPES = [
  "landing",        // una visita que entra al sitio desde fuera (o directa)
  "whatsapp_click",
  "phone_click",
  "email_click",
  "form_submit",    // consulta enviada con éxito por el formulario
] as const;

// Dónde estaba el botón que se pulsó.
export const PLACEMENTS = [
  "none",     // para "landing"
  "float",    // botón flotante de WhatsApp
  "contact",  // bloque de contacto
  "cta",      // llamada a la acción de una página de servicio
  "success",  // mensaje tras enviar el formulario
  "form",     // envío del formulario
  "footer",
  "other",
] as const;

export const LANGS = ["es", "en"] as const;

// Páginas públicas que llevan el contador. Debe coincidir con las páginas del
// sitio (scripts/verificar-sitio.mjs lo comprueba). Un valor fuera de la lista
// se rechaza: evita que la tabla se llene de rutas inventadas.
export const TRACKED_PAGES = [
  "/",
  "/residencia-en-panama",
  "/permisos-de-trabajo",
  "/relocalizacion-legal",
  "/contratos-empresas-inmuebles",
  "/derecho-administrativo",
  "/derecho-tributario",
  "/constitucional-contencioso-administrativo",
  "/privacidad",
  "/en/",
  "/en/panama-residency",
  "/en/work-permits",
  "/en/legal-relocation",
  "/en/contracts-companies-real-estate",
  "/en/administrative-law",
  "/en/tax-law",
  "/en/constitutional-administrative-litigation",
  "/en/privacy",
] as const;

// ORIGEN: LISTA CERRADA. El navegador manda el dominio de procedencia o el
// utm_source, pero aquí se clasifica y SÓLO se guarda uno de estos nombres.
// Cualquier otro dominio o etiqueta se guarda como "otros".
//
// Por qué cerrada y no "cualquier dominio": un dominio o un utm_source pueden
// ser personales (alice.github.io, ?utm_source=maria-perez-6673) o funcionar
// como identificador de una persona concreta. Con una lista cerrada eso no
// puede llegar a la tabla. El coste es no ver qué sitio desconocido envía
// tráfico; si aparece uno que interese (un directorio jurídico, p. ej.), se
// añade aquí, en la migración (CHECK de source) y en js/admin-analytics.js.
//
// El orden importa: gemini.google.com es un asistente de IA, no "google".
const SOURCE_RULES: Array<[RegExp, string]> = [
  [/^(chatgpt\.com|chat\.openai\.com|openai\.com|chatgpt)$/, "chatgpt.com"],
  [/^(perplexity\.ai|perplexity)$/, "perplexity.ai"],
  [/^(claude\.ai|claude)$/, "claude.ai"],
  [/^(gemini\.google\.com|bard\.google\.com|gemini)$/, "gemini.google.com"],
  [/^(copilot\.microsoft\.com|copilot\.com|copilot)$/, "copilot.microsoft.com"],
  [/^meta\.ai$/, "meta.ai"],
  [/^(grok\.com|x\.ai|grok)$/, "grok.com"],
  [/^(chat\.deepseek\.com|deepseek\.com|deepseek)$/, "deepseek.com"],
  [/^(chat\.mistral\.ai|mistral\.ai|mistral)$/, "mistral.ai"],
  [/(^|\.)google\.[a-z.]+$|^google$/, "google"],
  [/(^|\.)bing\.com$|^bing$/, "bing.com"],
  [/(^|\.)duckduckgo\.com$|^duckduckgo$/, "duckduckgo.com"],
  [/(^|\.)yahoo\.com$|^yahoo$/, "yahoo.com"],
  [/(^|\.)ecosia\.org$|^ecosia$/, "ecosia.org"],
  [/(^|\.)brave\.com$|^brave$/, "brave.com"],
  [/(^|\.)(facebook\.com|fb\.com|fb\.me)$|^(facebook|fb)$/, "facebook.com"],
  [/(^|\.)instagram\.com$|^(instagram|ig)$/, "instagram.com"],
  [/(^|\.)(linkedin\.com|lnkd\.in)$|^linkedin$/, "linkedin.com"],
  [/^(t\.co|x\.com|twitter\.com|mobile\.twitter\.com)$|^(twitter|x)$/, "x.com"],
  [/(^|\.)(youtube\.com|youtu\.be)$|^youtube$/, "youtube.com"],
  [/(^|\.)tiktok\.com$|^tiktok$/, "tiktok.com"],
  [/(^|\.)(whatsapp\.com|wa\.me)$|^whatsapp$/, "whatsapp"],
];

// Valores sin dominio externo.
export const SPECIAL_SOURCES = ["directo", "interno", "otros"] as const;

// Todos los valores que pueden acabar en la columna source. La migración 004
// repite esta lista en su CHECK (tests/track-validation.test.mjs lo comprueba).
export const KNOWN_SOURCES: readonly string[] = [
  ...new Set(SOURCE_RULES.map(([, name]) => name)),
  ...SPECIAL_SOURCES,
];

// Forma que debe tener lo que manda el navegador ANTES de clasificarlo: un
// nombre de dominio o una etiqueta corta. Lo que no la tiene se rechaza.
const HOST_RE = /^[a-z0-9](?:[a-z0-9.-]{0,98}[a-z0-9])?$/;

export function classifySource(raw: string): string {
  if (raw === "directo" || raw === "interno") return raw;
  for (const [pattern, name] of SOURCE_RULES) {
    if (pattern.test(raw)) return name;
  }
  return "otros";
}

export type TrackEvent = {
  event_type: string;
  page_path: string;
  placement: string;
  lang: string;
  source: string;
};

export type TrackResult = { ok: true; event: TrackEvent } | { ok: false; reason: string };

// /derecho-tributario.html -> /derecho-tributario ; /en/index.html -> /en/
export function normalizePath(path: string): string {
  let p = path.trim().toLowerCase();
  if (p.endsWith(".html")) p = p.slice(0, -5);
  if (p.endsWith("/index")) p = p.slice(0, -5);
  if (p === "/en") p = "/en/";
  if (p.length > 1 && p.endsWith("/") && p !== "/en/") p = p.slice(0, -1);
  return p;
}

export function normalizeSource(value: string): string {
  return value.trim().toLowerCase().replace(/^www\./, "");
}

function pick(input: Record<string, unknown>, key: string, max: number): string | null {
  const value = input[key];
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed && trimmed.length <= max ? trimmed : null;
}

export function validateTrackEvent(body: unknown): TrackResult {
  if (!body || typeof body !== "object") return { ok: false, reason: "body" };
  const input = body as Record<string, unknown>;

  const eventType = pick(input, "event", 32);
  const pageRaw = pick(input, "page", 120);
  const placement = pick(input, "placement", 16) ?? "other";
  const lang = pick(input, "lang", 4);
  const sourceRaw = pick(input, "source", 100);

  if (!eventType || !(EVENT_TYPES as readonly string[]).includes(eventType)) return { ok: false, reason: "event" };
  if (!pageRaw) return { ok: false, reason: "page" };
  const page = normalizePath(pageRaw);
  if (!(TRACKED_PAGES as readonly string[]).includes(page)) return { ok: false, reason: "page" };
  if (!(PLACEMENTS as readonly string[]).includes(placement)) return { ok: false, reason: "placement" };
  if (!lang || !(LANGS as readonly string[]).includes(lang)) return { ok: false, reason: "lang" };
  if (!sourceRaw) return { ok: false, reason: "source" };
  const normalized = normalizeSource(sourceRaw);
  if (!HOST_RE.test(normalized)) return { ok: false, reason: "source" };
  const source = classifySource(normalized);
  // Una entrada al sitio siempre viene "de fuera": "interno" no es un origen.
  if (eventType === "landing" && source === "interno") return { ok: false, reason: "source" };

  return {
    ok: true,
    event: {
      event_type: eventType,
      page_path: page,
      placement: eventType === "landing" ? "none" : placement,
      lang,
      source,
    },
  };
}
