// ============================================================
// Configuración del sitio público — Juriscorp S.C.
// ============================================================
//
// POR QUÉ ESTÁ EN UN FICHERO Y NO EN UN <script> DENTRO DEL HTML.
// Una Content-Security-Policy en modo enforce bloquea todo script inline
// salvo que se le den hashes SHA-256 de cada bloque. Un hash cambia con
// cualquier edición del contenido, incluido un comentario, así que tocar el
// número de WhatsApp habría dejado el formulario sin configuración hasta que
// alguien recordara actualizar también la cabecera. Un fichero externo lo
// cubre `script-src 'self'` sin nada más.
//
// Lo cargan index.html y en/index.html. Debe ir ANTES de js/main.js, que lee
// window.NELSON_CONFIG al arrancar.
//
// Aquí no hay secretos: la clave de sitio de Turnstile es pública por diseño
// —viaja en el HTML para que el widget se dibuje— y la URL de la función es
// un endpoint público protegido por Turnstile y validación en servidor.

window.NELSON_CONFIG = {
  EDGE_FUNCTION_URL: 'https://azraryuqcqibppexuiwi.supabase.co/functions/v1/submit-lead',
  TURNSTILE_SITE_KEY: '0x4AAAAAACzHvF4l30jALx9_',

  // Número de la firma en formato E.164 sin '+'. Los enlaces wa.me del HTML
  // son estáticos y NO se generan desde aquí: si cambia, hay que actualizar
  // también los href de wa.me, el tel: y el Schema.org de cada página.
  WHATSAPP_NUMBER: '50766730357',
};

// El idioma NO se declara aquí. js/main.js lo deduce del atributo lang del
// <html>, que es la única fuente fiable de qué está viendo la persona, y con
// él decide en qué idioma pedir los mensajes a la Edge Function. Fijarlo en
// este fichero obligaría a mantener dos copias y a que divergieran.
