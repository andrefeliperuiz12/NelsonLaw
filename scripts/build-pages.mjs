// ============================================================
// Generador de las páginas de servicio — Juriscorp S.C.
// ============================================================
// Uso:   node scripts/build-pages.mjs
//
// POR QUÉ EXISTE. Son 7 páginas de servicio en dos idiomas que comparten
// navegación, pie, hreflang, datos estructurados y estructura. Escritas a mano,
// cada cambio de navegación había que repetirlo 14 veces y las dos versiones
// de idioma terminaban diciendo cosas distintas.
//
// NO ES UN PASO DE BUILD. Netlify sigue publicando HTML plano: este script se
// ejecuta en local y su salida (los .html) se versiona. Si editas un .html de
// servicio a mano, el siguiente `node scripts/build-pages.mjs` lo pisará.
// Edita el contenido en scripts/pages/content.es.mjs y content.en.mjs.
//
// También regenera sitemap.xml, para que las URL y sus alternativas de idioma
// salgan de la misma lista que las páginas.
//
// Las portadas (index.html, en/index.html), privacidad y 404 siguen siendo
// HTML escrito a mano.
// ============================================================

import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { SITE, PAGE_ORDER, STATIC_PAGES } from './pages/site.mjs';
import es from './pages/content.es.mjs';
import en from './pages/content.en.mjs';
import { LLMS } from './pages/llms.mjs';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const LANGS = { es, en };
const LASTMOD = process.env.LASTMOD || new Date().toISOString().slice(0, 10);

// --- utilidades ---------------------------------------------------------

function attr(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// Texto plano para JSON-LD: el contenido lleva <em>, <strong> y <a>.
function plain(html) {
  return html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}

function url(lang, slug) {
  const prefix = lang === 'en' ? '/en/' : '/';
  return SITE.origin + prefix + slug;
}

function path(lang, slug) {
  return (lang === 'en' ? '/en/' : '/') + slug;
}

function home(lang) {
  return lang === 'en' ? '/en/' : '/';
}

function contactHref(lang, area) {
  const anchor = lang === 'en' ? '#contact' : '#contacto';
  return `${home(lang)}?area=${area}${anchor}`;
}

function whatsappHref(text) {
  return `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(text)}`;
}

function indent(html, spaces) {
  const pad = ' '.repeat(spaces);
  return html
    .split('\n')
    .map((line) => (line.trim() ? pad + line : line))
    .join('\n');
}

// --- bloques ------------------------------------------------------------

function head(lang, page, t) {
  const esUrl = url('es', SITE.slugs[page.key].es);
  const enUrl = url('en', SITE.slugs[page.key].en);
  const self = url(lang, page.slug);

  const graph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: t.ui.home, item: SITE.origin + home(lang) },
          { '@type': 'ListItem', position: 2, name: plain(page.breadcrumb), item: self },
        ],
      },
      {
        '@type': 'Service',
        name: plain(page.schemaName),
        serviceType: plain(page.breadcrumb),
        url: self,
        inLanguage: lang,
        provider: { '@id': SITE.origin + '/#organizacion' },
        areaServed: { '@type': 'Country', name: 'Panamá' },
        audience: { '@type': 'Audience', audienceType: plain(page.audience.value) },
        description: page.description,
      },
      {
        '@type': 'FAQPage',
        mainEntity: page.faq.map((item) => ({
          '@type': 'Question',
          name: plain(item.q),
          acceptedAnswer: { '@type': 'Answer', text: plain(item.a.join(' ')) },
        })),
      },
    ],
  };

  return `<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />

  <!-- GENERADO por scripts/build-pages.mjs. No editar a mano: el contenido
       está en scripts/pages/content.${lang}.mjs. -->

  <title>${attr(page.title)}</title>
  <meta name="description" content="${attr(page.description)}" />
  <link rel="canonical" href="${self}" />

  <link rel="alternate" hreflang="es" href="${esUrl}" />
  <link rel="alternate" hreflang="en" href="${enUrl}" />
  <link rel="alternate" hreflang="x-default" href="${esUrl}" />
  <meta name="robots" content="index, follow" />
  <meta name="author" content="Juriscorp S.C." />

  <link rel="icon" type="image/png" sizes="32x32" href="/assets/img/favicon-32.png" />
  <link rel="icon" type="image/png" sizes="16x16" href="/assets/img/favicon-32.png" />
  <link rel="apple-touch-icon" sizes="180x180" href="/assets/img/favicon-180.png" />

  <meta property="og:type" content="article" />
  <meta property="og:site_name" content="Juriscorp S.C." />
  <meta property="og:url" content="${self}" />
  <meta property="og:title" content="${attr(page.title)}" />
  <meta property="og:description" content="${attr(page.description)}" />
  <meta property="og:image" content="${SITE.origin}/assets/img/square-logo-og.png" />
  <meta property="og:image:width" content="600" />
  <meta property="og:image:height" content="600" />
  <meta property="og:locale" content="${t.ui.ogLocale}" />
  <meta name="twitter:card" content="summary" />

  <!-- Fonts: auto-alojadas. No enlazar fonts.googleapis.com. Ver css/fonts.css. -->
  <link rel="stylesheet" href="/css/fonts.css" />
  <link rel="stylesheet" href="/css/main.css" />
  <link rel="stylesheet" href="/css/area.css" />

  <!-- Las preguntas de FAQPage son las mismas que se ven al final de la
       página: ambas salen del mismo dato. -->
  <script type="application/ld+json">
${indent(JSON.stringify(graph, null, 2), 2)}
  </script>
</head>`;
}

function nav(lang, page, t) {
  const other = lang === 'es' ? 'en' : 'es';
  const otherHref = path(other, SITE.slugs[page.key][other]);
  const lbl = lang === 'es' ? ['ES', 'EN'] : ['EN', 'ES'];
  return `  <nav class="navbar" id="navbar" aria-label="${attr(t.ui.navLabel)}">
    <a href="${home(lang)}" class="nav-logo">
      <img src="/assets/img/logo-juris-360.png" alt="Juriscorp S.C. — Law Firm" class="nav-logo-img" width="360"
        height="120" decoding="async" />
    </a>
    <ul class="nav-links">
${t.ui.nav.map((item) => `      <li><a href="${home(lang)}${item.hash}">${item.label}</a></li>`).join('\n')}
      <li><a href="${contactHref(lang, page.area)}" class="nav-cta">${t.ui.navCta}</a></li>
      <li>
        <a href="${otherHref}" class="nav-lang" hreflang="${other}" lang="${other}">
          <span class="nav-lang-current">${lbl[0]}</span><span class="nav-lang-sep">/</span>${lbl[1]}
        </a>
      </li>
    </ul>
  </nav>`;
}

function hero(lang, page, t) {
  const note = page.heroNote ? `\n        <p class="area-hero-note">${page.heroNote}</p>` : '';
  return `  <header class="area-hero">
    <div class="area-hero-inner">
      <div>
        <nav class="area-breadcrumb" aria-label="${attr(t.ui.breadcrumbLabel)}">
          <a href="${home(lang)}">${t.ui.home}</a><span>/</span>${page.breadcrumb}
        </nav>

        <div class="area-eyebrow">
          <span class="area-eyebrow-num" aria-hidden="true">${page.num}</span>
          <span class="area-eyebrow-label">${page.eyebrow}</span>
        </div>

        <h1>${page.h1}</h1>

        <p class="area-lead">
          ${page.lead}
        </p>${note}
      </div>

      <aside class="area-credential" aria-label="${attr(page.audience.label)}">
        <div class="area-credential-label">${page.audience.label}</div>
        <div class="area-credential-value">${page.audience.value}</div>
        <p class="area-credential-note">
          ${page.audience.note}
        </p>
      </aside>
    </div>
  </header>`;
}

function sectionHead(block) {
  const intro = block.intro ? `\n        <p>\n          ${block.intro}\n        </p>` : '';
  return `      <div class="area-section-head">
        <div class="area-section-tag">${block.tag}</div>
        <h2>${block.title}</h2>${intro}
      </div>`;
}

function notice(block) {
  if (!block) return '';
  return `
      <div class="area-notice">
        <span class="area-notice-title">${block.title}</span>
        <p>
          ${block.text}
        </p>
      </div>`;
}

function scope(page) {
  const items = page.scope.items
    .map((item, i) => {
      const id = item.id ? ` id="${item.id}"` : '';
      return `        <article class="area-service"${id}>
          <div class="area-service-num">${String(i + 1).padStart(2, '0')}</div>
          <h3>${item.title}</h3>
          <p>
            ${item.text}
          </p>
        </article>`;
    })
    .join('\n\n');
  return `  <section class="area-section" aria-labelledby="alcance">
    <div class="area-inner">
${sectionHead(page.scope).replace('<h2>', '<h2 id="alcance">')}

      <div class="area-services">
${items}
      </div>
${notice(page.scope.excluded)}
    </div>
  </section>`;
}

function cards(items) {
  return items
    .map(
      (item) => `        <div class="area-institution">
          <div class="area-institution-acronym">${item.mark}</div>
          <h3>${item.title}</h3>
          <p>
            ${item.text}
          </p>
        </div>`
    )
    .join('\n\n');
}

function workSection(page, t) {
  const steps = (page.process.steps || t.defaultSteps).map((s, i) => ({ mark: String(i + 1), ...s }));
  const institutions = page.institutions
    ? `

      <div class="area-subhead">
        <h3>${page.institutions.title}</h3>
        ${page.institutions.intro ? `<p>${page.institutions.intro}</p>` : ''}
      </div>
      <div class="area-institutions">
${cards(page.institutions.items)}
      </div>`
    : '';
  return `  <section class="area-section area-section-alt" aria-labelledby="forma-de-trabajo">
    <div class="area-inner">
${sectionHead(page.process).replace('<h2>', '<h2 id="forma-de-trabajo">')}

      <div class="area-institutions area-steps">
${cards(steps)}
      </div>
${notice(page.process.presence)}${institutions}
    </div>
  </section>`;
}

function documents(page) {
  const items = page.documents.items.map((d) => `        <li>${d}</li>`).join('\n');
  return `  <section class="area-section" aria-labelledby="documentacion">
    <div class="area-inner">
${sectionHead(page.documents).replace('<h2>', '<h2 id="documentacion">')}

      <ul class="area-checklist">
${items}
      </ul>
${notice(page.documents.note)}
    </div>
  </section>`;
}

function faq(page, t) {
  const items = page.faq
    .map(
      (item) => `        <details>
          <summary>${item.q}</summary>
          <div class="area-faq-answer">
${item.a.map((p) => `            <p>\n              ${p}\n            </p>`).join('\n')}
          </div>
        </details>`
    )
    .join('\n\n');
  return `  <section class="area-section area-section-alt" aria-labelledby="preguntas">
    <div class="area-inner">
      <div class="area-section-head">
        <div class="area-section-tag">${t.ui.faqTag}</div>
        <h2 id="preguntas">${t.ui.faqTitle}</h2>
      </div>

      <div class="area-faq">
${items}
      </div>
    </div>
  </section>`;
}

function cta(lang, page, t) {
  return `  <section class="area-cta">
    <div class="area-cta-inner">
      <h2>${page.cta.title}</h2>
      <p>
        ${page.cta.text}
      </p>
      <div class="area-cta-actions">
        <a href="${contactHref(lang, page.area)}" class="area-btn area-btn-primary">${page.cta.button}</a>
        <a href="${whatsappHref(page.cta.whatsapp)}"
          class="area-btn area-btn-ghost" target="_blank" rel="noopener noreferrer">WhatsApp</a>
      </div>
      <p class="area-cta-note">${t.ui.ctaNote}</p>
    </div>
  </section>`;
}

function siblings(lang, page, t) {
  const others = PAGE_ORDER.filter((key) => key !== page.key)
    .map((key) => {
      const p = t.pages[key];
      return `        <a href="${path(lang, p.slug)}" class="area-sibling">
          <span class="area-sibling-num">${p.num}</span>
          <span class="area-sibling-name">${p.cardName}</span>
          <span class="area-sibling-desc">
            ${p.cardDesc}
          </span>
        </a>`;
    })
    .join('\n');
  return `  <section class="area-siblings" aria-label="${attr(t.ui.siblingsTitle)}">
    <div class="area-siblings-inner">
      <div class="area-siblings-title">${t.ui.siblingsTitle}</div>
      <div class="area-siblings-grid area-siblings-grid--many">
${others}
      </div>

      <p class="area-disclaimer">
        ${t.ui.disclaimer}
      </p>
    </div>
  </section>`;
}

export function footer(lang, t) {
  const links = t.ui.footerLinks
    .map((item) => `        <li><a href="${item.href}">${item.label}</a></li>`)
    .join('\n');
  return `  <footer>
    <div class="footer-inner">
      <div class="footer-brand">
        <img src="/assets/img/square-logo-120.png" alt="Juriscorp S.C." class="footer-logo" width="120" height="120"
          loading="lazy" decoding="async" />
        <div class="footer-brand-text">
          Juriscorp S.C.
          <span>${t.ui.footerTagline}</span>
        </div>
      </div>
      <ul class="footer-links">
${links}
      </ul>
      <div class="footer-copy">
        &copy; 2026 Juriscorp S.C. ${t.ui.rights}
      </div>
    </div>
  </footer>`;
}

function render(lang, key) {
  const t = LANGS[lang];
  const page = { key, ...t.pages[key] };
  return `<!DOCTYPE html>
<html lang="${lang}">

${head(lang, page, t)}

<body>

${nav(lang, page, t)}

${hero(lang, page, t)}

${scope(page)}

${workSection(page, t)}

${documents(page)}

${faq(page, t)}

${cta(lang, page, t)}

${siblings(lang, page, t)}

${footer(lang, t)}

  <script src="/js/config.js" defer></script>
  <script src="/js/track.js" defer></script>

</body>

</html>
`;
}

// --- sitemap ------------------------------------------------------------

function sitemap() {
  const entries = [];
  const all = [
    ...STATIC_PAGES,
    ...PAGE_ORDER.map((key) => ({ key, ...SITE.slugs[key], changefreq: 'monthly', priority: '0.9' })),
  ];
  for (const page of all) {
    const es = page.es === '' ? SITE.origin + '/' : url('es', page.es);
    const en = page.en === '' ? SITE.origin + '/en/' : url('en', page.en);
    for (const loc of [es, en]) {
      entries.push(`  <url>
    <loc>${loc}</loc>
    <xhtml:link rel="alternate" hreflang="es" href="${es}" />
    <xhtml:link rel="alternate" hreflang="en" href="${en}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${es}" />
    <lastmod>${LASTMOD}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`);
    }
  }
  return `<?xml version="1.0" encoding="UTF-8"?>
<!--
  GENERADO por scripts/build-pages.mjs. No editar a mano: las URL salen de
  scripts/pages/site.mjs.

  Cada entrada declara sus alternativas de idioma. Google exige RECIPROCIDAD:
  si la página española apunta a la inglesa, la inglesa tiene que apuntar de
  vuelta, y cada una debe declararse a sí misma.

  Las URL van SIN .html porque Netlify tiene pretty_urls activado (ver
  netlify.toml) y es la forma a la que apuntan los enlaces internos y los
  canonical.
-->
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xhtml="http://www.w3.org/1999/xhtml">

${entries.join('\n\n')}

</urlset>
`;
}

// --- llms.txt -----------------------------------------------------------

function llmsServices(lang) {
  const t = LANGS[lang];
  return PAGE_ORDER.map((key) => {
    const p = t.pages[key];
    return `- [${p.cardName}](${url(lang, p.slug)}): ${p.description}`;
  }).join('\n');
}

function llmsBlock(lang) {
  const l = LLMS[lang];
  const contact = {
    phone: SITE.phoneDisplay,
    email: SITE.email,
    formUrl: SITE.origin + (lang === 'en' ? '/en/#contact' : '/#contacto'),
  };
  const bullets = (items) => items.map((i) => `- ${i}`).join('\n');
  return { l, contact, bullets };
}

// Un solo /llms.txt con los dos idiomas. Los títulos de sección van como H2
// (también los ingleses) porque los lectores de llms.txt suelen buscar listas
// de enlaces bajo H2.
function llmsTxt() {
  const es = llmsBlock('es');
  const en = llmsBlock('en');
  const optional = [
    ...LLMS.es.optional({
      privacyUrl: url('es', 'privacidad'),
      sitemapUrl: SITE.origin + '/sitemap.xml',
    }),
    ...LLMS.en.optional({
      privacyUrl: url('en', 'privacy'),
      sitemapUrl: SITE.origin + '/sitemap.xml',
    }),
  ];

  return `# ${es.l.title}

> ${es.l.summary}

${es.bullets(es.l.notes)}

## ${es.l.servicesTitle}

${llmsServices('es')}

## ${es.l.excludedTitle}

${es.bullets(es.l.excluded)}

## ${es.l.contactTitle}

${es.l.contactLine(es.contact)}

## English

> ${en.l.summary}

${en.bullets(en.l.notes)}

## ${en.l.servicesTitle}

${llmsServices('en')}

## ${en.l.excludedTitle}

${en.bullets(en.l.excluded)}

## ${en.l.contactTitle}

${en.l.contactLine(en.contact)}

## ${es.l.optionalTitle} / ${en.l.optionalTitle}

${optional.map((o) => `- ${o}`).join('\n')}
`;
}

// --- escritura ----------------------------------------------------------

for (const lang of Object.keys(LANGS)) {
  for (const key of PAGE_ORDER) {
    const slug = SITE.slugs[key][lang];
    const file = join(ROOT, lang === 'en' ? 'en' : '', slug + '.html');
    writeFileSync(file, render(lang, key));
    console.log('escrito', file.replace(ROOT, ''));
  }
}
writeFileSync(join(ROOT, 'sitemap.xml'), sitemap());
console.log('escrito sitemap.xml');
writeFileSync(join(ROOT, 'llms.txt'), llmsTxt());
console.log('escrito llms.txt');
