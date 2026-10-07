// ============================================================
// Nelson Ruiz Pinilla — Secure Lead Submission Edge Function
// ============================================================
// Flow: Turnstile verify → Sanitize → Validate → Insert → Email
// ============================================================

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  AREA_LABELS,
  type CleanLead,
  DEADLINE_LABELS,
  type Idioma,
  MENSAJES,
  validateLead,
} from "./validation.ts";

// CORS headers for browser requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Simple in-memory rate limiter (per function instance)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 5; // max requests
const RATE_WINDOW_MS = 60_000; // per minute

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }

  entry.count++;
  return entry.count > RATE_LIMIT;
}

// La validación de campos vive en validation.ts: es lógica pura y así se
// prueba con Node (tests/validation.test.mjs) sin desplegar nada.

// Escapa para interpolar en HTML. Punto de SALIDA, no de entrada.
// El orden importa: & va PRIMERO o volvería a escapar las entidades que
// generan las líneas siguientes. El sanitize() anterior nunca escapaba &,
// así que un nombre con "&" podía producir entidades no intencionadas.
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

// Resultado del envío de notificación.
// La función NO lanza: devuelve el resultado para que el handler lo
// persista en la fila del lead en lugar de perderlo en los logs.
type NotifyResult = { sent: true } | { sent: false; error: string };

// Remitente por defecto. El dominio debe estar VERIFICADO en Resend.
// Un subdominio verificado no cubre el apex: send.juriscorppanama.com y
// juriscorppanama.com son dominios distintos para Resend, y usar el que
// no está verificado devuelve 403 en todos los envíos.
const RESEND_FROM_FALLBACK = "Juriscorp S.C. <notificaciones@send.juriscorppanama.com>";

// Tope de longitud para notification_error: es una columna de diagnóstico,
// no un log. Evita guardar cuerpos de respuesta enteros en la base.
const NOTIFICATION_ERROR_MAX = 500;

function truncateError(message: string): string {
  return message.length > NOTIFICATION_ERROR_MAX
    ? message.substring(0, NOTIFICATION_ERROR_MAX)
    : message;
}

// Una fila etiqueta/valor del correo. El valor llega SIN escapar y se escapa
// aquí, en el punto de salida.
function emailRow(label: string, value: string): string {
  return `
              <tr><td style="padding: 8px 0; color: #c9a84c; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">${label}</td></tr>
              <tr><td style="padding: 0 0 16px; color: #ffffff; font-size: 16px;">${escapeHtml(value)}</td></tr>`;
}

// Texto de la fila "Plazo" del correo: si hay notificación o vencimiento,
// es lo primero que hay que ver para priorizar la respuesta.
function deadlineText(lead: CleanLead): string | null {
  if (!lead.has_deadline) return null;
  const label = DEADLINE_LABELS[lead.has_deadline] || lead.has_deadline;
  return lead.deadline_date ? `${label} (fecha indicada: ${lead.deadline_date})` : label;
}

// Send notification email via Resend.
// Nunca incluye el resumen del caso: ese texto sólo vive en la base de datos.
async function sendNotificationEmail(lead: CleanLead): Promise<NotifyResult> {
  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  const notificationEmail = Deno.env.get("NOTIFICATION_EMAIL");

  if (!resendApiKey || !notificationEmail) {
    const error = "Configuración ausente: falta RESEND_API_KEY o NOTIFICATION_EMAIL en los secretos del proyecto.";
    console.error(error);
    return { sent: false, error };
  }

  const fromAddress = Deno.env.get("RESEND_FROM") || RESEND_FROM_FALLBACK;
  const areaLabel = AREA_LABELS[lead.legal_area] || lead.legal_area;
  const deadline = deadlineText(lead);

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: fromAddress,
        to: [notificationEmail],
        // El asunto NO se escapa a propósito: es una cabecera de correo, no
        // HTML. Escaparlo mostraría "D&#x27;León" literal en la bandeja. Viaja
        // como JSON a la API de Resend, que se encarga de codificarlo.
        subject: `Nuevo Lead: ${lead.full_name} — ${areaLabel}${lead.has_deadline === "si" ? " — CON PLAZO" : ""}`,
        html: `
          <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #0d1b2a; color: #d0dae8; border-radius: 8px;">
            <div style="border-bottom: 2px solid #c9a84c; padding-bottom: 16px; margin-bottom: 24px;">
              <h2 style="color: #c9a84c; margin: 0; font-size: 20px;">Nuevo Lead Recibido</h2>
              <p style="color: #8a9bb0; margin: 4px 0 0; font-size: 13px;">${new Date().toLocaleString("es-PA", { timeZone: "America/Panama" })}</p>
            </div>
            <table style="width: 100%; border-collapse: collapse;">
              ${emailRow("Nombre", lead.full_name)}
              ${lead.phone ? emailRow("Teléfono / WhatsApp", lead.phone) : ""}
              ${lead.email ? emailRow("Email", lead.email) : ""}
              ${emailRow("Servicio", areaLabel)}
              ${lead.client_country ? emailRow("País donde se encuentra", lead.client_country) : ""}
              ${deadline ? emailRow("Notificación o fecha límite", deadline) : ""}
            </table>
            <div style="margin-top: 24px; padding: 16px; background: #162336; border-left: 3px solid #c9a84c; border-radius: 4px;">
              <p style="color: #8a9bb0; margin: 0; font-size: 12px;">El resumen del caso está disponible en el panel de administración por seguridad.</p>
            </div>
            <div style="margin-top: 24px; text-align: center;">
              <a href="${Deno.env.get("SITE_URL") || "https://juriscorppanama.com"}/admin/dashboard.html" 
                 style="display: inline-block; padding: 12px 32px; background: #c9a84c; color: #0d1b2a; text-decoration: none; font-weight: 600; font-size: 13px; text-transform: uppercase; letter-spacing: 2px;">
                Ver en Panel
              </a>
            </div>
          </div>
        `,
      }),
    });

    if (!res.ok) {
      // .text() en lugar de .json(): si Resend devuelve un cuerpo que no es
      // JSON (p.ej. un error de gateway), .json() lanzaría y perderíamos el
      // detalle real del fallo.
      const detail = await res.text().catch(() => "(sin cuerpo de respuesta)");
      const error = truncateError(`Resend HTTP ${res.status}: ${detail}`);
      console.error("Resend error:", error);
      return { sent: false, error };
    }

    return { sent: true };
  } catch (err) {
    // Un fallo de envío nunca debe tumbar el alta del lead: se devuelve
    // como resultado para que el handler lo registre en la fila.
    const error = truncateError(
      `Fallo de red al contactar Resend: ${err instanceof Error ? err.message : String(err)}`
    );
    console.error(error);
    return { sent: false, error };
  }
}

// ============================================================================
// MENSAJES DE USUARIO EN DOS IDIOMAS
// ============================================================================
// El sitio tiene versión en inglés bajo /en/. Un visitante que rellena el
// formulario en inglés no puede recibir un error en español: parece un fallo
// del sitio y se pierde el lead.
//
// EL IDIOMA VIAJA EN LA URL, NO EN EL CUERPO. Es deliberado: el corte por
// exceso de peticiones se responde ANTES de leer el cuerpo de la petición
// (justamente para no gastar recursos en un cliente abusivo), así que en ese
// punto el JSON todavía no se ha parseado. La query string sí está disponible
// desde el primer instante.
//
// Al añadir un mensaje nuevo hay que darlo en los DOS idiomas o el objeto
// deja de ser válido para el tipo Mensajes.
// La tabla vive en validation.ts (MENSAJES), junto a los códigos de error que
// traduce, para que el simulador local responda con los mismos textos.

// Cualquier valor distinto de "en" cae en español, que es el idioma principal
// del despacho. No se usa Accept-Language: lo manda el navegador según su
// configuración, no según la página que la persona está leyendo, y un
// panameño con Windows en inglés recibiría mensajes en inglés en el sitio
// en español.
function resolverIdioma(url: string): Idioma {
  try {
    return new URL(url).searchParams.get("lang") === "en" ? "en" : "es";
  } catch {
    return "es";
  }
}

// Main handler
Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // Only accept POST
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ success: false, error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const idioma = resolverIdioma(req.url);
  const msg = MENSAJES[idioma];

  try {
    // Rate limiting by IP
    const clientIP =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("cf-connecting-ip") ||
      "unknown";

    if (isRateLimited(clientIP)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: msg.rateLimit,
        }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse body
    const body = await req.json();
    const { turnstileToken, consent } = body ?? {};

    // 1. Validate consent
    if (!consent) {
      return new Response(
        JSON.stringify({
          success: false,
          error: msg.consent,
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Verify Turnstile token
    if (!turnstileToken) {
      return new Response(
        JSON.stringify({
          success: false,
          error: msg.turnstileRequired,
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const turnstileSecret = Deno.env.get("CLOUDFLARE_TURNSTILE_SECRET");
    if (!turnstileSecret) {
      console.error("CLOUDFLARE_TURNSTILE_SECRET not configured");
      return new Response(
        JSON.stringify({
          success: false,
          error: msg.serverConfig,
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const turnstileFormData = new FormData();
    turnstileFormData.append("secret", turnstileSecret);
    turnstileFormData.append("response", turnstileToken);
    turnstileFormData.append("remoteip", clientIP);

    const turnstileResult = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      { method: "POST", body: turnstileFormData }
    );
    const turnstileOutcome = await turnstileResult.json();

    if (!turnstileOutcome.success) {
      return new Response(
        JSON.stringify({
          success: false,
          error: msg.turnstileFailed,
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3-5. Validar y normalizar los campos (validation.ts).
    // NO se escapa HTML aquí: el valor se almacena limpio y se escapa en cada
    // punto de salida. Ver normalizeInput() en validation.ts y escapeHtml().
    const validation = validateLead(body);
    if (!validation.ok) {
      return new Response(
        JSON.stringify({ success: false, error: msg[validation.code] }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    const lead = validation.lead;

    // 6. Insert into Supabase using service_role
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Supabase credentials not configured");
      return new Response(
        JSON.stringify({ success: false, error: msg.serverConfig }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // `lead` incluye client_country, has_deadline y deadline_date: columnas
    // que crea la migración 003. Aplicarla ANTES de desplegar esta versión,
    // o cada alta fallará con "column does not exist".
    const { data, error: insertError } = await supabase
      .from("leads")
      .insert({
        ...lead,
        source: "web_form",
        status: "nuevo",
      })
      .select("id")
      .single();

    if (insertError) {
      console.error("DB insert error:", insertError.message);
      return new Response(
        JSON.stringify({
          success: false,
          error: msg.saveFailed,
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 7. Notificar por email.
    //    El lead YA está guardado en este punto. Un fallo aquí se registra
    //    en la propia fila, pero nunca revierte ni bloquea el alta.
    //    La llamada es bloqueante a propósito: necesitamos su resultado
    //    para persistirlo en el paso 8.
    const notifyResult = await sendNotificationEmail(lead);

    // 8. Persistir el estado de la notificación (migración 002).
    //    Sustituye el antiguo fallo silencioso: antes, un rechazo de Resend
    //    solo dejaba una línea en unos logs de retención corta y el lead
    //    quedaba indistinguible de uno notificado con éxito.
    //    Si este UPDATE falla, solo se registra: el lead ya está a salvo y
    //    la respuesta al visitante no cambia.
    if (data?.id) {
      try {
        const { error: notifyUpdateError } = await supabase
          .from("leads")
          .update({
            notification_sent: notifyResult.sent,
            notification_sent_at: notifyResult.sent ? new Date().toISOString() : null,
            notification_error: notifyResult.sent ? null : notifyResult.error,
            notification_attempts: 1,
          })
          .eq("id", data.id);

        if (notifyUpdateError) {
          console.error(
            "No se pudo registrar el estado de notificación:",
            notifyUpdateError.message
          );
        }
      } catch (err) {
        console.error("No se pudo registrar el estado de notificación:", err);
      }
    }

    // 9. Return success ONLY after confirmed DB insertion.
    //    El resultado de la notificación NO condiciona esta respuesta: si el
    //    lead se guardó, el visitante ve éxito. El estado del correo queda
    //    en la fila para el panel y para el barrido de reintentos.
    return new Response(
      JSON.stringify({
        success: true,
        message: "Consulta recibida.",
        leadId: data?.id,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    // Generic error — log details but don't expose to client
    console.error("Unexpected error:", err);
    return new Response(
      JSON.stringify({
        success: false,
        error: msg.unexpected,
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
