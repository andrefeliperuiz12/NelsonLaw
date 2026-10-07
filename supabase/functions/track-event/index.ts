// ============================================================
// Juriscorp S.C. — Contador anónimo de contactos (Edge Function)
// ============================================================
// Flujo: validar contra listas cerradas → sumar 1 al contador del día.
//
// PRIVACIDAD, que es la razón de que esta función exista en vez de una
// herramienta de analítica de terceros:
//   - NO lee ni guarda la IP, el navegador ni ningún identificador.
//   - El límite de peticiones es GLOBAL por instancia, no por IP, justamente
//     para no tener que tratar la IP ni siquiera de forma transitoria.
//   - Sólo guarda contadores por día (sin hora), página, ubicación del botón,
//     idioma y dominio de origen. Ver validation.ts.
//
// Despliegue: verify_jwt = false (supabase/config.toml), igual que
// submit-lead: es un endpoint público. Requiere la migración 004.
// Responde siempre 204 salvo error de método: el navegador no lee la
// respuesta y no hay nada útil que decirle a quien manda basura.
// ============================================================

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { validateTrackEvent } from "./validation.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Tope global por instancia. Un sitio con este tráfico no se acerca; sirve
// para que un script que dispare peticiones no infle las cifras sin límite.
const GLOBAL_LIMIT = 120;
const WINDOW_MS = 60_000;
let windowStart = Date.now();
let windowCount = 0;

function overGlobalLimit(): boolean {
  const now = Date.now();
  if (now - windowStart > WINDOW_MS) {
    windowStart = now;
    windowCount = 0;
  }
  windowCount++;
  return windowCount > GLOBAL_LIMIT;
}

// El navegador envía text/plain (petición "simple", sin preflight CORS) para
// que el envío no se pierda al abrir WhatsApp o marcar un teléfono.
const MAX_BODY_BYTES = 1024;

// Sólo cuentan las visitas del sitio publicado. Un script puede falsificar la
// cabecera Origin, así que esto no es una barrera de seguridad: evita que el
// contador se alimente desde otras webs o desde previsualizaciones de Netlify.
// El dominio no es un dato personal.
const ALLOWED_ORIGINS = new Set(["https://juriscorppanama.com"]);

function noContent(): Response {
  return new Response(null, { status: 204, headers: corsHeaders });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return new Response(null, { status: 405, headers: corsHeaders });

  try {
    if (!ALLOWED_ORIGINS.has(req.headers.get("origin") ?? "")) return noContent();
    if (overGlobalLimit()) return noContent();

    // Se descarta lo grande ANTES de leerlo, y se mide en bytes, no en
    // caracteres. Content-Length puede faltar o mentir: se vuelve a medir.
    const declared = Number(req.headers.get("content-length") ?? "0");
    if (declared > MAX_BODY_BYTES) return noContent();
    const text = await req.text();
    if (new TextEncoder().encode(text).length > MAX_BODY_BYTES) return noContent();

    let body: unknown;
    try {
      body = JSON.parse(text);
    } catch {
      return noContent();
    }

    const result = validateTrackEvent(body);
    if (!result.ok) return noContent();

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceKey) {
      console.error("track-event: faltan SUPABASE_URL o SERVICE_ROLE_KEY");
      return noContent();
    }

    const supabase = createClient(supabaseUrl, serviceKey);
    const { error } = await supabase.rpc("record_site_event", {
      p_event_type: result.event.event_type,
      p_page_path: result.event.page_path,
      p_placement: result.event.placement,
      p_lang: result.event.lang,
      p_source: result.event.source,
    });
    if (error) console.error("track-event: no se pudo registrar:", error.message);

    return noContent();
  } catch (err) {
    console.error("track-event: error inesperado:", err instanceof Error ? err.message : String(err));
    return noContent();
  }
});
