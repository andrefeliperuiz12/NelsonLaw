// ============================================================
// Juriscorp S.C. — Validación de consultas del formulario web
// ============================================================
//
// POR QUÉ ESTÁ EN UN MÓDULO APARTE. Es lógica pura, sin Deno ni Supabase, y
// así se puede probar con Node (tests/validation.test.mjs) y reutilizar en el
// simulador local (scripts/dev-server.mjs). Si la validación vive sólo dentro
// del handler, la única forma de probarla es desplegar la función.
//
// Sólo usa sintaxis de TypeScript que Node puede "despojar" de tipos sin
// compilar: nada de enums, namespaces ni parameter properties.
// ============================================================

// Servicios que ofrece el sitio desde la reestructuración de 2026-10.
// Deben coincidir con las <option> del formulario (index.html y en/index.html)
// y con los valores que añade la migración 003.
export const SERVICE_AREAS = [
  "residencia_migracion",
  "permisos_trabajo",
  "relocalizacion_legal",
  "contratos_empresas_inmuebles",
  "administrativo_tributario",
  "constitucional_contencioso",
  "otro",
] as const;

// Valores anteriores a la reestructuración. Se siguen ACEPTANDO durante la
// transición: la función nueva se despliega antes que el sitio nuevo, y en
// ese intervalo el formulario publicado todavía envía estos valores. También
// existen en filas ya guardadas, así que no pueden borrarse del enum.
// Una vez publicado el sitio nuevo puede dejar de aceptarse (ver informe).
export const LEGACY_AREAS = [
  "derecho_administrativo",
  "derecho_tributario",
  "derecho_penal",
  "derecho_migratorio",
  "servicios_corporativos",
  "tramites_legales",
  "regularizacion_tierras",
  "asuntos_inmobiliarios",
  "poderes_registro_publico",
] as const;

export const VALID_LEGAL_AREAS: readonly string[] = [...SERVICE_AREAS, ...LEGACY_AREAS];

export const AREA_LABELS: Record<string, string> = {
  residencia_migracion: "Residencia y migración",
  permisos_trabajo: "Permisos de trabajo",
  relocalizacion_legal: "Relocalización legal",
  contratos_empresas_inmuebles: "Contratos, empresas e inmuebles",
  administrativo_tributario: "Administrativo y tributario",
  constitucional_contencioso: "Constitucional y contencioso-administrativo",
  otro: "Otro asunto",
  // Históricos
  derecho_administrativo: "Derecho Administrativo (anterior)",
  derecho_tributario: "Derecho Tributario (anterior)",
  derecho_penal: "Derecho Penal (anterior)",
  derecho_migratorio: "Derecho Migratorio (anterior)",
  servicios_corporativos: "Servicios Corporativos (anterior)",
  tramites_legales: "Trámites Legales (anterior)",
  regularizacion_tierras: "Regularización de Tierras (anterior)",
  asuntos_inmobiliarios: "Asuntos Inmobiliarios (anterior)",
  poderes_registro_publico: "Poderes y Registro (anterior)",
};

// Respuesta a "¿Tiene una notificación, resolución o fecha límite?".
export const DEADLINE_VALUES = ["si", "no", "no_seguro"] as const;

export const DEADLINE_LABELS: Record<string, string> = {
  si: "Sí",
  no: "No",
  no_seguro: "No está seguro",
};

// Tope de longitud de los campos de texto libre.
export const MAX_INPUT_LENGTH = 2000;
export const MAX_COUNTRY_LENGTH = 100;

// Normaliza la entrada. NO escapa HTML, y eso es deliberado.
//
// El escape va en el punto de SALIDA: escapeHtml() al construir el correo
// (index.ts), y en el panel escapeHtml()/textContent (js/admin-dashboard.js).
//
// Escapar aquí corrompía el dato en origen. Un apellido panameño como D'León
// se almacenaba literalmente como "D&#x27;León" y viajaba así al panel y a
// cualquier exportación futura. Además rompía dos cosas menos visibles:
//   - Un correo válido como o'brien@bufete.com se convertía en
//     o&#x27;brien@... y la validación lo rechazaba, perdiendo el lead con un
//     mensaje de "correo inválido" que era falso.
//   - El recorte a 2000 se aplicaba DESPUÉS de escapar, así que podía cortar
//     una entidad por la mitad ("&#x2") y el tope real variaba según cuántas
//     comillas escribiera la persona.
//
// El nombre importa: una función llamada sanitize() que no sanea invita a que
// alguien la dé por segura al interpolarla en HTML.
//
// El recorte es por puntos de código, no por unidades UTF-16: substring()
// podía partir un emoji por la mitad y dejar un carácter inválido que la base
// de datos rechaza, perdiendo la consulta.
export function normalizeInput(input: string, max: number = MAX_INPUT_LENGTH): string {
  const trimmed = input.trim();
  return trimmed.length <= max ? trimmed : Array.from(trimmed).slice(0, max).join("");
}

export function isValidEmail(email: string): boolean {
  return /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email);
}

// Entre 7 y 20 dígitos, admitiendo +, espacios, guiones y paréntesis.
export function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, "");
  return digits.length >= 7 && digits.length <= 20;
}

// AAAA-MM-DD, fecha real (rechaza 2026-02-31) y año razonable: Postgres
// rechaza el año 0000 y la consulta se perdería con un error 500.
export function isValidIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const year = Number(value.slice(0, 4));
  if (year < 1900 || year > 2100) return false;
  const date = new Date(value + "T00:00:00Z");
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
}

// Códigos de error. index.ts los traduce con su tabla MENSAJES; añadir uno
// aquí obliga a darle texto en los dos idiomas allí.
export type ValidationCode =
  | "requiredFields"
  | "nameTooShort"
  | "contactRequired"
  | "phoneInvalid"
  | "emailInvalid"
  | "areaInvalid"
  | "summaryTooShort"
  | "countryInvalid"
  | "deadlineInvalid";

export type Idioma = "es" | "en";

export type Mensajes = Record<
  | ValidationCode
  | "rateLimit" | "consent" | "turnstileRequired" | "serverConfig"
  | "turnstileFailed" | "saveFailed" | "unexpected",
  string
>;

// Al añadir un mensaje nuevo hay que darlo en los DOS idiomas o el objeto
// deja de ser válido para el tipo Mensajes.
export const MENSAJES: Record<Idioma, Mensajes> = {
  es: {
    rateLimit: "Demasiadas solicitudes. Por favor espere un momento.",
    consent: "Debe aceptar la política de privacidad.",
    turnstileRequired: "Verificación de seguridad requerida. Por favor recargue la página.",
    serverConfig: "Error de configuración del servidor.",
    turnstileFailed: "Verificación de seguridad fallida. Por favor intente de nuevo.",
    requiredFields: "Por favor complete todos los campos requeridos.",
    nameTooShort: "El nombre debe tener al menos 2 caracteres.",
    contactRequired: "Indique un número de WhatsApp o teléfono, o un correo electrónico.",
    phoneInvalid: "Número de teléfono inválido.",
    emailInvalid: "Correo electrónico inválido.",
    areaInvalid: "Servicio no válido.",
    summaryTooShort: "El resumen del caso debe tener al menos 10 caracteres.",
    countryInvalid: "Indique el país donde se encuentra.",
    deadlineInvalid: "La información sobre el plazo no es válida.",
    saveFailed: "No se pudo guardar su consulta. Por favor intente de nuevo.",
    unexpected: "Error inesperado. Por favor intente de nuevo más tarde.",
  },
  en: {
    rateLimit: "Too many requests. Please wait a moment.",
    consent: "You must accept the privacy policy.",
    turnstileRequired: "Security verification required. Please reload the page.",
    serverConfig: "Server configuration error.",
    turnstileFailed: "Security verification failed. Please try again.",
    requiredFields: "Please complete all required fields.",
    nameTooShort: "Name must be at least 2 characters long.",
    contactRequired: "Please provide a WhatsApp or phone number, or an email address.",
    phoneInvalid: "Invalid phone number.",
    emailInvalid: "Invalid email address.",
    areaInvalid: "Invalid service.",
    summaryTooShort: "The case summary must be at least 10 characters long.",
    countryInvalid: "Please tell us which country you are in.",
    deadlineInvalid: "The deadline information is not valid.",
    saveFailed: "We could not save your enquiry. Please try again.",
    unexpected: "Unexpected error. Please try again later.",
  },
};

export type CleanLead = {
  full_name: string;
  phone: string | null;
  email: string | null;
  legal_area: string;
  case_summary: string;
  client_country: string | null;
  has_deadline: string | null;
  deadline_date: string | null;
};

export type ValidationResult =
  | { ok: true; lead: CleanLead }
  | { ok: false; code: ValidationCode };

// Texto opcional: devuelve null si falta o viene vacío, y undefined si llega
// algo que no es texto (un número, un objeto), que se trata como inválido.
function optionalText(value: unknown, max: number): string | null | undefined {
  if (value === undefined || value === null) return null;
  if (typeof value !== "string") return undefined;
  const clean = normalizeInput(value, max);
  return clean === "" ? null : clean;
}

function requiredText(value: unknown, max: number = MAX_INPUT_LENGTH): string | null {
  if (typeof value !== "string") return null;
  const clean = normalizeInput(value, max);
  return clean === "" ? null : clean;
}

// Valida el cuerpo de la petición SIN el consentimiento ni Turnstile, que el
// handler comprueba antes porque no dependen de los campos.
//
// Compatibilidad: el formulario anterior a la reestructuración envía siempre
// teléfono y nunca país ni plazo. Este validador lo acepta tal cual.
export function validateLead(body: unknown): ValidationResult {
  if (!body || typeof body !== "object") return { ok: false, code: "requiredFields" };
  const input = body as Record<string, unknown>;

  const fullName = requiredText(input.fullName);
  const legalArea = requiredText(input.legalArea, 64);
  const caseSummary = requiredText(input.caseSummary);
  if (!fullName || !legalArea || !caseSummary) return { ok: false, code: "requiredFields" };

  const phone = optionalText(input.phone, 40);
  const email = optionalText(input.email, 254);
  const country = optionalText(input.country, MAX_COUNTRY_LENGTH);
  const deadline = optionalText(input.deadline, 16);
  const deadlineDate = optionalText(input.deadlineDate, 10);

  if (fullName.length < 2) return { ok: false, code: "nameTooShort" };
  if (phone === undefined) return { ok: false, code: "phoneInvalid" };
  if (email === undefined) return { ok: false, code: "emailInvalid" };
  if (!phone && !email) return { ok: false, code: "contactRequired" };
  if (phone && !isValidPhone(phone)) return { ok: false, code: "phoneInvalid" };
  if (email && !isValidEmail(email)) return { ok: false, code: "emailInvalid" };
  if (!VALID_LEGAL_AREAS.includes(legalArea)) return { ok: false, code: "areaInvalid" };
  if (caseSummary.length < 10) return { ok: false, code: "summaryTooShort" };
  if (country === undefined || (country !== null && country.length < 2)) {
    return { ok: false, code: "countryInvalid" };
  }
  if (deadline === undefined || (deadline !== null && !(DEADLINE_VALUES as readonly string[]).includes(deadline))) {
    return { ok: false, code: "deadlineInvalid" };
  }
  // La fecha sólo tiene sentido si la persona dijo que hay un plazo. En
  // cualquier otro caso se descarta en silencio en vez de rechazar la
  // consulta: un campo oculto que el navegador recordó no debe costar un lead.
  if (deadlineDate === undefined) return { ok: false, code: "deadlineInvalid" };
  if (deadline === "si" && deadlineDate !== null && !isValidIsoDate(deadlineDate)) {
    return { ok: false, code: "deadlineInvalid" };
  }

  return {
    ok: true,
    lead: {
      full_name: fullName,
      phone,
      email,
      legal_area: legalArea,
      case_summary: caseSummary,
      client_country: country,
      has_deadline: deadline,
      deadline_date: deadline === "si" ? deadlineDate : null,
    },
  };
}
