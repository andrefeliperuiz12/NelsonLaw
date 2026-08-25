#!/usr/bin/env node
/**
 * Optimización de imágenes — Juriscorp S.C.
 * ==========================================
 *
 * POR QUÉ EXISTE. Las imágenes originales estaban muy por encima del tamaño al
 * que se muestran. El caso extremo: Square_LOGO.png, 1254x1254 y 874 KB, se
 * pinta a 60x60 en el pie. El navegador descargaba 874 KB para mostrar un sello
 * del tamaño de una moneda.
 *
 * QUÉ HACE. Genera derivados a los tamaños que la maqueta usa de verdad,
 * deducidos del CSS:
 *
 *   - .hero (linea 166 de main.css): grid-template-columns 1fr 1fr, es decir,
 *     la foto ocupa 50vw en escritorio. Bajo el breakpoint de 900px pasa a
 *     100vw con altura limitada. De ahí los anchos 640/960/1280.
 *   - .nav-logo-img: se pinta a 180x60 -> se genera a 360x120 para pantallas
 *     de doble densidad.
 *   - .footer-logo: se pinta a 50x50 -> 120x120.
 *
 * FORMATOS. La fotografía va en WebP con respaldo JPEG, porque ahí la ganancia
 * es grande (622 KB -> 29 KB). Los logotipos van sólo en PNG con paleta
 * indexada: se midió el WebP y era IGUAL o PEOR (nav: PNG 7.6 KB vs WebP
 * 8.3 KB). En imágenes de pocos colores planos, la cuantización a paleta gana.
 *
 * IDEMPOTENTE. Se puede volver a ejecutar sin miedo: siempre parte de los
 * originales de assets/img/ y sobrescribe los derivados.
 *
 * USO:  node scripts/optimizar-imagenes.js
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ORIGEN = 'assets/img';
const DESTINO = 'assets/img';

// Calidades. Las fotografías toleran más compresión que un logotipo, donde
// cualquier artefacto alrededor del texto se nota de inmediato.
const CALIDAD_FOTO = 80;
const CALIDAD_LOGO = 92;

/** Tareas declaradas. Cada una parte de un original y produce varios derivados. */
const TAREAS = [
  {
    origen: 'nelson-ruiz.jpg',
    nota: 'Foto del hero — elemento LCP. Se sirve con srcset.',
    salidas: [
      { nombre: 'nelson-ruiz-640.webp', ancho: 640, formato: 'webp', calidad: CALIDAD_FOTO },
      { nombre: 'nelson-ruiz-960.webp', ancho: 960, formato: 'webp', calidad: CALIDAD_FOTO },
      // 1280 y no 1440: el original mide 1439px de ancho y ampliar no aporta
      // nada. 1280 cubre un portátil de 1440px lógicos con densidad doble
      // (720 CSS px x 2 = 1440 px de dispositivo) con pérdida imperceptible.
      { nombre: 'nelson-ruiz-1280.webp', ancho: 1280, formato: 'webp', calidad: CALIDAD_FOTO },
      // Respaldo para navegadores sin WebP. Uno solo: son una minoría ínfima
      // y no merece la pena multiplicar variantes para ellos.
      { nombre: 'nelson-ruiz-960.jpg', ancho: 960, formato: 'jpeg', calidad: CALIDAD_FOTO },
    ],
  },
  {
    origen: 'Logo_JURIS.png',
    nota: 'Logotipo de la barra de navegación — se pinta a 180x48.',
    salidas: [
      // Sin variante WebP: medido, el PNG con paleta indexada da 7.6 KB y el
      // WebP 8.3 KB. En logotipos de pocos colores la cuantización a paleta
      // gana. No añadas WebP aquí sin volver a medir.
      { nombre: 'logo-juris-360.png', ancho: 360, formato: 'png' },
    ],
  },
  {
    origen: 'Square_LOGO.png',
    nota: 'Sello cuadrado — pie de página (60x60) e imagen para redes sociales.',
    salidas: [
      { nombre: 'square-logo-120.png', ancho: 120, formato: 'png' },
      // og:image / twitter:image. Se queda en PNG a propósito: los rastreadores
      // de redes sociales y de mensajería tienen soporte irregular de WebP, y
      // esta imagen no la descarga ningún visitante, sólo los rastreadores.
      // 600x600 supera de sobra el mínimo que exigen (200x200).
      { nombre: 'square-logo-og.png', ancho: 600, formato: 'png' },
    ],
  },
  {
    origen: 'Favicon_Chet.png',
    nota: 'Favicon y icono de pantalla de inicio.',
    salidas: [
      { nombre: 'favicon-32.png', ancho: 32, formato: 'png' },
      { nombre: 'favicon-180.png', ancho: 180, formato: 'png' },
    ],
  },
];

const kb = (bytes) => (bytes / 1024).toFixed(1).padStart(7) + ' KB';

async function procesar(tarea) {
  const rutaOrigen = path.join(ORIGEN, tarea.origen);
  if (!fs.existsSync(rutaOrigen)) {
    console.error(`  FALTA el original: ${rutaOrigen}`);
    return { fallo: true, antes: 0, despues: 0 };
  }

  const meta = await sharp(rutaOrigen).metadata();
  const antes = fs.statSync(rutaOrigen).size;

  console.log(`\n  ${tarea.origen}  (${meta.width}x${meta.height}, ${kb(antes).trim()})`);
  console.log(`  ${tarea.nota}`);

  let despues = 0;
  for (const s of tarea.salidas) {
    if (s.ancho > meta.width) {
      console.error(`    OMITIDA ${s.nombre}: ${s.ancho}px supera el original (${meta.width}px). No se amplía.`);
      continue;
    }

    let img = sharp(rutaOrigen).resize({ width: s.ancho, withoutEnlargement: true });

    if (s.formato === 'webp') img = img.webp({ quality: s.calidad, effort: 6 });
    else if (s.formato === 'jpeg') img = img.jpeg({ quality: s.calidad, mozjpeg: true });
    // palette: cuantiza a paleta indexada. En logotipos con pocos colores
    // reduce muchísimo sin diferencia visible.
    else if (s.formato === 'png') img = img.png({ compressionLevel: 9, palette: true });

    const rutaSalida = path.join(DESTINO, s.nombre);
    await img.toFile(rutaSalida);

    const bytes = fs.statSync(rutaSalida).size;
    despues += bytes;
    console.log(`    ${s.nombre.padEnd(28)} ${String(s.ancho).padStart(4)}px  ${kb(bytes)}`);
  }

  return { fallo: false, antes, despues };
}

(async () => {
  console.log('  Optimizando imágenes...');
  let totalAntes = 0, totalDespues = 0, fallos = 0;

  for (const t of TAREAS) {
    const r = await procesar(t);
    if (r.fallo) { fallos++; continue; }
    totalAntes += r.antes;
    totalDespues += r.despues;
  }

  console.log('\n  ' + '='.repeat(56));
  console.log(`  Originales : ${kb(totalAntes)}`);
  console.log(`  Derivados  : ${kb(totalDespues)}  (todas las variantes juntas)`);
  console.log('  ' + '='.repeat(56));

  if (fallos) process.exit(1);
})();
