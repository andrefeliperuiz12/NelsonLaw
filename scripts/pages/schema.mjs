// ============================================================
// Datos estructurados (JSON-LD) compartidos — Juriscorp S.C.
// ============================================================
// Una sola definición de la firma, del abogado y del sitio, que usan:
//   - las 14 páginas de servicio (scripts/build-pages.mjs), y
//   - las dos portadas, cuyo bloque JSON-LD se regenera con el mismo script
//     (se conservan sus FAQPage, que son las preguntas visibles de cada una).
//
// POR QUÉ SE REPITE EN CADA PÁGINA. Un @id sin definición en el mismo documento
// es una referencia que un rastreador (o un modelo que lee una sola página) no
// puede resolver: veía "provider: #organizacion" sin nombre. Repetir el nodo
// con el MISMO @id no crea dos despachos: es la forma estándar de decir "es la
// misma entidad". Lo que sí duplicaría la firma es cambiar el @id.
//
// REGLAS. Sólo lo que el propietario ha confirmado y el sitio ya dice:
//   - idiomas de atención: español e inglés (confirmado 2026-10-13);
//   - sin perfiles externos: cuando existan (Google Business Profile,
//     LinkedIn, colegios o directorios), añadirlos en SITE.sameAs y saldrán
//     solos en el nodo de la firma y del abogado;
//   - sin horarios, precios, valoraciones ni cifras que no estén en la web.
// ============================================================

import { SITE } from './site.mjs';

export const ORG_ID = SITE.origin + '/#organizacion';
export const PERSON_ID = SITE.origin + '/#nelson-ruiz';
export const SITE_ID = SITE.origin + '/#sitio';

export const LANGUAGES = [
  { '@type': 'Language', name: 'Spanish', alternateName: 'es' },
  { '@type': 'Language', name: 'English', alternateName: 'en' },
];

const TEXT = {
  es: {
    description:
      'Asesoría legal en Panamá, en español e inglés, para personas y empresas, en el país o desde el exterior: residencia y migración, permisos de trabajo, relocalización legal, contratos, empresas e inmuebles, y asuntos administrativos, tributarios, constitucionales y contencioso-administrativos.',
    country: 'Panamá',
    contactType: 'Consultas de nuevos clientes',
    jobTitle: 'Abogado',
    personDescription:
      'Abogado en Panamá con carrera jurídica desde 1993 y titular de Juriscorp S.C. Atiende en español y en inglés.',
    catalog: 'Servicios legales',
    knowsAbout: [
      'Residencia en Panamá',
      'Permisos de trabajo para extranjeros',
      'Relocalización legal a Panamá',
      'Contratos, sociedades e inmuebles en Panamá',
      'Derecho administrativo panameño',
      'Derecho tributario panameño',
      'Derecho constitucional y contencioso-administrativo panameño',
    ],
    formUrl: SITE.origin + '/#contacto',
    privacyUrl: SITE.origin + '/privacidad',
    siteName: 'Juriscorp S.C.',
  },
  en: {
    description:
      'Legal advice in Panama, in English and Spanish, for individuals and companies, in the country or abroad: residency and immigration, work permits, legal relocation, contracts, companies and real estate, and administrative, tax, constitutional and administrative litigation matters.',
    country: 'Panama',
    contactType: 'New client enquiries',
    jobTitle: 'Attorney',
    personDescription:
      'Attorney in Panama with a legal career since 1993 and lead attorney of Juriscorp S.C. Works in English and Spanish.',
    catalog: 'Legal services',
    knowsAbout: [
      'Panama residency',
      'Work permits for foreign nationals',
      'Legal relocation to Panama',
      'Contracts, companies and real estate in Panama',
      'Panamanian administrative law',
      'Panamanian tax law',
      'Panamanian constitutional and administrative litigation',
    ],
    formUrl: SITE.origin + '/en/#contact',
    privacyUrl: SITE.origin + '/en/privacy',
    siteName: 'Juriscorp S.C.',
  },
};

// `services`: [{ name, url, id }] en el idioma de la página, en el orden de la portada.
export function organizationNode(lang, services) {
  const t = TEXT[lang];
  const node = {
    '@type': 'LegalService',
    '@id': ORG_ID,
    name: 'Juriscorp S.C.',
    description: t.description,
    url: SITE.origin + (lang === 'en' ? '/en/' : '/'),
    logo: SITE.origin + '/assets/img/square-logo-og.png',
    image: SITE.origin + '/assets/img/square-logo-og.png',
    telephone: '+507-6673-0357',
    email: SITE.email,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Ancón',
      addressRegion: 'Panamá',
      addressCountry: 'PA',
    },
    areaServed: { '@type': 'Country', name: t.country },
    availableLanguage: LANGUAGES,
    knowsLanguage: ['es', 'en'],
    knowsAbout: t.knowsAbout,
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: t.contactType,
      telephone: '+507-6673-0357',
      email: SITE.email,
      url: t.formUrl,
      availableLanguage: LANGUAGES,
    },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: t.catalog,
      itemListElement: services.map((svc) => ({
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', '@id': svc.id, name: svc.name, url: svc.url },
      })),
    },
    founder: { '@id': PERSON_ID },
    privacyPolicy: t.privacyUrl,
  };
  if (SITE.sameAs?.length) node.sameAs = SITE.sameAs;
  return node;
}

export function personNode(lang) {
  const t = TEXT[lang];
  const node = {
    '@type': 'Person',
    '@id': PERSON_ID,
    name: 'Nelson Ruiz Pinilla',
    jobTitle: t.jobTitle,
    description: t.personDescription,
    image: SITE.origin + '/assets/img/nelson-ruiz-960.jpg',
    url: SITE.origin + (lang === 'en' ? '/en/' : '/') + (lang === 'en' ? '#about' : '#sobre-mi'),
    knowsLanguage: ['es', 'en'],
    knowsAbout: t.knowsAbout,
    worksFor: { '@id': ORG_ID },
    alumniOf: { '@type': 'CollegeOrUniversity', name: 'Universidad de Panamá' },
  };
  if (SITE.personSameAs?.length) node.sameAs = SITE.personSameAs;
  return node;
}

export function websiteNode() {
  return {
    '@type': 'WebSite',
    '@id': SITE_ID,
    url: SITE.origin + '/',
    name: 'Juriscorp S.C.',
    inLanguage: ['es', 'en'],
    publisher: { '@id': ORG_ID },
  };
}
