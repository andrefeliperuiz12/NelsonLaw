// ============================================================
// Texto de /llms.txt — Juriscorp S.C.
// ============================================================
// Lo lee scripts/build-pages.mjs, que añade los enlaces a los servicios a
// partir de las mismas páginas que se publican (así no se desincroniza).
//
// QUÉ ES. /llms.txt es un resumen en Markdown pensado para modelos de lenguaje
// (propuesta de llmstxt.org). No hay confirmación de que ningún proveedor lo
// use para decidir qué cita; es barato y no hace daño. Lo que sí hace es dar a
// quien lo lea una versión corta, sin adornos, de qué hace y qué NO hace el
// despacho, para evitar que lo recomienden para un asunto que no atiende.
//
// REGLAS. Mismas que el resto del sitio: nada que no esté respaldado.
//   - Sin requisitos, montos ni plazos legales concretos.
//   - Sin afirmar atención en inglés: sólo que el sitio existe en inglés.
//   - Sin resultados garantizados ni disponibilidad 24/7.
//   - Las exclusiones deben coincidir con las de las páginas y con las
//     preguntas frecuentes de la portada.
// El correo y el teléfono salen de SITE (site.mjs).
// ============================================================

export const LLMS = {
  es: {
    title: 'Juriscorp S.C.',
    summary:
      'Firma de abogados en Ciudad de Panamá. Asesora a personas y empresas, en Panamá o desde el exterior, en residencia y permisos de trabajo de extranjeros, relocalización legal, contratos, sociedades e inmuebles, y asuntos administrativos, tributarios, constitucionales y contencioso-administrativos. El abogado titular es Nelson Ruiz Pinilla.',
    notes: [
      'Este sitio existe en español (principal) y en inglés, con el mismo alcance. Los procedimientos ante autoridades panameñas se tramitan en español; el idioma de atención se confirma al responder cada consulta.',
      'Todo servicio empieza con una evaluación inicial. Enviar una consulta no formaliza la contratación ni confirma que el despacho acepte el asunto: el encargo se formaliza por escrito.',
      'El contenido es informativo general y no constituye asesoría legal. No incluye requisitos, costos ni plazos oficiales: dependen de cada trámite y deben verificarse con la autoridad competente.',
      'Algunos trámites exigen la comparecencia personal del interesado en Panamá. No se ofrece "residencia sin viajar" ni trámites totalmente virtuales.',
    ],
    servicesTitle: 'Servicios',
    excludedTitle: 'Asuntos que el despacho no atiende actualmente',
    excluded: [
      'Defensa penal.',
      'Litigios laborales y reclamaciones por despido.',
      'Disputas de linderos, litigios de propiedad, titulación de tierras y procesos agrarios.',
      'Asuntos electorales y trámites ante el Tribunal Electoral, el Registro Civil o Cedulación, incluida la naturalización.',
      'Servicio de agente residente, contabilidad, declaraciones de impuestos y planificación fiscal integral.',
      'Búsqueda de vivienda, mudanza, transporte y apertura de cuentas bancarias.',
    ],
    contactTitle: 'Contacto',
    contactLine: (c) =>
      `WhatsApp y teléfono: ${c.phone}. Correo: ${c.email}. Formulario de consulta: ${c.formUrl}`,
    optionalTitle: 'Opcional',
    optional: (c) => [
      `[Política de privacidad](${c.privacyUrl}): qué datos se recogen y cómo se tratan.`,
      `[Mapa del sitio](${c.sitemapUrl}): todas las páginas, con sus versiones en español e inglés.`,
    ],
  },
  en: {
    title: 'Juriscorp S.C. (English)',
    summary:
      'Law firm in Panama City. It advises individuals and companies, in Panama or from abroad, on residency and work permits for foreign nationals, legal relocation, contracts, companies and real estate, and administrative, tax, constitutional and administrative litigation matters. The lead attorney is Nelson Ruiz Pinilla.',
    notes: [
      'This site is available in Spanish (main language) and English, with the same scope. Proceedings before Panamanian authorities are conducted in Spanish; the language of service is confirmed when each enquiry is answered.',
      'Every service starts with an initial assessment. Sending an enquiry does not engage the firm or confirm that it will take the matter: an engagement is formalised in writing.',
      'The content is general information and is not legal advice. It does not state official requirements, costs or deadlines: these depend on each procedure and must be checked with the competent authority.',
      'Some procedures require the person concerned to appear in person in Panama. The firm does not offer "residency without travel" or fully virtual procedures.',
    ],
    servicesTitle: 'Services',
    excludedTitle: 'Matters the firm does not currently handle',
    excluded: [
      'Criminal defence.',
      'Employment litigation and dismissal claims.',
      'Boundary disputes, property litigation, land titling and agrarian proceedings.',
      'Electoral matters and procedures before the Electoral Tribunal, the Civil Registry or Cedulación, including naturalisation.',
      'Registered agent services, bookkeeping, tax return preparation and comprehensive tax planning.',
      'House hunting, removals, transport and opening bank accounts.',
    ],
    contactTitle: 'Contact',
    contactLine: (c) =>
      `WhatsApp and phone: ${c.phone}. Email: ${c.email}. Enquiry form: ${c.formUrl}`,
    optionalTitle: 'Optional',
    optional: (c) => [
      `[Privacy policy](${c.privacyUrl}): what data is collected and how it is handled.`,
      `[Sitemap](${c.sitemapUrl}): all pages, with their Spanish and English versions.`,
    ],
  },
};
