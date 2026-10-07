// Datos compartidos por las dos versiones de idioma. Un servicio nuevo se da
// de alta aquí (slug en cada idioma y orden) y en content.es.mjs/content.en.mjs.

export const SITE = {
  origin: 'https://juriscorppanama.com',
  // Número de la firma. Si cambia, cambiarlo también en index.html,
  // en/index.html, 404, privacidad y js/config.js.
  whatsapp: '50766730357',
  // Mismo número, tal como se muestra. Se usa en /llms.txt.
  phoneDisplay: '+507 6673-0357',
  // El dominio propio no recibe correo (sin MX): se publica el de Nelson. Si
  // cambia, actualizarlo también en index.html, en/index.html y privacidad.
  email: 'nelsonhruiz18@gmail.com',
  slugs: {
    residencia: { es: 'residencia-en-panama', en: 'panama-residency' },
    permisos: { es: 'permisos-de-trabajo', en: 'work-permits' },
    relocalizacion: { es: 'relocalizacion-legal', en: 'legal-relocation' },
    contratos: { es: 'contratos-empresas-inmuebles', en: 'contracts-companies-real-estate' },
    administrativo: { es: 'derecho-administrativo', en: 'administrative-law' },
    tributario: { es: 'derecho-tributario', en: 'tax-law' },
    constitucional: { es: 'constitucional-contencioso-administrativo', en: 'constitutional-administrative-litigation' },
  },
};

// Orden de presentación (coincide con la portada).
export const PAGE_ORDER = [
  'residencia',
  'permisos',
  'relocalizacion',
  'contratos',
  'administrativo',
  'tributario',
  'constitucional',
];

// Páginas escritas a mano que también van al sitemap. '' es la portada.
export const STATIC_PAGES = [
  { es: '', en: '', changefreq: 'weekly', priority: '1.0' },
  { es: 'privacidad', en: 'privacy', changefreq: 'yearly', priority: '0.3' },
];
