// ============================================================
// Nelson Ruiz Pinilla — Secure Lead Submission Edge Function
// ============================================================
// Flow: Turnstile verify → Sanitize → Validate → Insert → Email
// ============================================================

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

// Valid legal areas (must match DB enum)
const VALID_LEGAL_AREAS = [
  "derecho_administrativo",
  "derecho_tributario",
  "derecho_penal",
  "derecho_migratorio",
  "servicios_corporativos",
  "tramites_legales",
  "regularizacion_tierras",
  "asuntos_inmobiliarios",
  "poderes_registro_publico",
  "otro",
];

// Tope de longitud de los campos de texto libre.
const MAX_INPUT_LENGTH = 2000;

// Normaliza la entrada. NO escapa HTML, y eso es deliberado.
//
// El escape va en el punto de SALIDA: escapeHtml() al construir el correo (más
// abajo), y en el panel escapeHtml()/textContent (js/admin-dashboard.js).
//
// Escapar aquí corrompía el dato en origen. Un apellido panameño como D'León
// se almacenaba literalmente como "D&#x27;León" y viajaba así al panel y a
// cualquier exportación futura. Además rompía dos cosas menos visibles:
//   - Un correo válido como o'brien@bufete.com se convertía en
//     o&#x27;brien@... y la validación de más abajo lo rechazaba, perdiendo
//     el lead con un mensaje de "correo inválido" que era falso.
//   - El recorte a 2000 se aplicaba DESPUÉS de escapar, así que podía cortar
//     una entidad por la mitad ("&#x2") y el tope real variaba según cuántas
//     comillas escribiera la persona.
//
// El nombre importa: una función llamada sanitize() que no sanea invita a que
// alguien la dé por segura al interpolarla en HTML.
function normalizeInput(input: string): string {
  return input
    .trim()
    .substring(0, MAX_INPUT_LENGTH);
}

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

// Validate email format
function isValidEmail(email: string): boolean {
  return /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email);
}

// Validate phone (at least 7 digits)
function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, "");
  return digits.length >= 7 && digits.length <= 20;
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

// Send notification email via Resend
async function sendNotificationEmail(lead: {
  full_name: string;
  phone: string;
  email: string | null;
  legal_area: string;
}): Promise<NotifyResult> {
  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  const notificationEmail = Deno.env.get("NOTIFICATION_EMAIL");

  if (!resendApiKey || !notificationEmail) {
    const error = "Configuración ausente: falta RESEND_API_KEY o NOTIFICATION_EMAIL en los secretos del proyecto.";
    console.error(error);
    return { sent: false, error };
  }

  const fromAddress = Deno.env.get("RESEND_FROM") || RESEND_FROM_FALLBACK;

  const areaLabels: Record<string, string> = {
    derecho_administrativo: "Derecho Administrativo",
    derecho_tributario: "Derecho Tributario",
    derecho_penal: "Derecho Penal",
    derecho_migratorio: "Derecho Migratorio",
    servicios_corporativos: "Servicios Corporativos y Comerciales",
    tramites_legales: "Trámites Legales en Panamá",
    regularizacion_tierras: "Regularización de Tierras",
    asuntos_inmobiliarios: "Asuntos Inmobiliarios y Due Diligence",
    poderes_registro_publico: "Poderes, Registro Público y Sociedades",
    otro: "Otra Área",
  };

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
        subject: `Nuevo Lead: ${lead.full_name} — ${areaLabels[lead.legal_area] || lead.legal_area}`,
        html: `
          <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #0d1b2a; color: #d0dae8; border-radius: 8px;">
            <div style="border-bottom: 2px solid #c9a84c; padding-bottom: 16px; margin-bottom: 24px;">
              <h2 style="color: #c9a84c; margin: 0; font-size: 20px;">Nuevo Lead Recibido</h2>
              <p style="color: #8a9bb0; margin: 4px 0 0; font-size: 13px;">${new Date().toLocaleString("es-PA", { timeZone: "America/Panama" })}</p>
            </div>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; color: #c9a84c; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Nombre</td></tr>
              <tr><td style="padding: 0 0 16px; color: #ffffff; font-size: 16px;">${escapeHtml(lead.full_name)}</td></tr>
              <tr><td style="padding: 8px 0; color: #c9a84c; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Teléfono</td></tr>
              <tr><td style="padding: 0 0 16px; color: #ffffff; font-size: 16px;">${escapeHtml(lead.phone)}</td></tr>
              ${lead.email ? `
              <tr><td style="padding: 8px 0; color: #c9a84c; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Email</td></tr>
              <tr><td style="padding: 0 0 16px; color: #ffffff; font-size: 16px;">${escapeHtml(lead.email)}</td></tr>
              ` : ""}
              <tr><td style="padding: 8px 0; color: #c9a84c; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Área Legal</td></tr>
              <tr><td style="padding: 0 0 16px; color: #ffffff; font-size: 16px;">${areaLabels[lead.legal_area] || lead.legal_area}</td></tr>
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
          error: "Demasiadas solicitudes. Por favor espere un momento.",
        }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse body
    const body = await req.json();
    const { turnstileToken, fullName, phone, email, legalArea, caseSummary, consent } = body;

    // 1. Validate consent
    if (!consent) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Debe aceptar la política de privacidad.",
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Verify Turnstile token
    if (!turnstileToken) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Verificación de seguridad requerida. Por favor recargue la página.",
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
          error: "Error de configuración del servidor.",
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
          error: "Verificación de seguridad fallida. Por favor intente de nuevo.",
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. Validate required fields
    if (!fullName || !phone || !legalArea || !caseSummary) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Por favor complete todos los campos requeridos.",
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 4. Normalizar entradas (recorte de espacios y tope de longitud).
    // NO se escapa HTML aquí: el valor se almacena limpio y se escapa en cada
    // punto de salida. Ver normalizeInput() y escapeHtml() arriba.
    const cleanName = normalizeInput(fullName);
    const cleanPhone = normalizeInput(phone);
    const cleanEmail = email ? normalizeInput(email) : null;
    const cleanSummary = normalizeInput(caseSummary);
    const cleanArea = normalizeInput(legalArea);

    // 5. Validate field formats
    if (cleanName.length < 2) {
      return new Response(
        JSON.stringify({ success: false, error: "El nombre debe tener al menos 2 caracteres." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!isValidPhone(cleanPhone)) {
      return new Response(
        JSON.stringify({ success: false, error: "Número de teléfono inválido." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (cleanEmail && !isValidEmail(cleanEmail)) {
      return new Response(
        JSON.stringify({ success: false, error: "Correo electrónico inválido." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!VALID_LEGAL_AREAS.includes(cleanArea)) {
      return new Response(
        JSON.stringify({ success: false, error: "Área legal no válida." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (cleanSummary.length < 10) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "El resumen del caso debe tener al menos 10 caracteres.",
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 6. Insert into Supabase using service_role
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Supabase credentials not configured");
      return new Response(
        JSON.stringify({ success: false, error: "Error de configuración del servidor." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data, error: insertError } = await supabase
      .from("leads")
      .insert({
        full_name: cleanName,
        phone: cleanPhone,
        email: cleanEmail,
        legal_area: cleanArea,
        case_summary: cleanSummary,
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
          error: "No se pudo guardar su consulta. Por favor intente de nuevo.",
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 7. Notificar por email.
    //    El lead YA está guardado en este punto. Un fallo aquí se registra
    //    en la propia fila, pero nunca revierte ni bloquea el alta.
    //    La llamada es bloqueante a propósito: necesitamos su resultado
    //    para persistirlo en el paso 8.
    const notifyResult = await sendNotificationEmail({
      full_name: cleanName,
      phone: cleanPhone,
      email: cleanEmail,
      legal_area: cleanArea,
    });

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
        message: "Su consulta ha sido recibida exitosamente. Le contactaremos a la brevedad.",
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
        error: "Error inesperado. Por favor intente de nuevo más tarde.",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
