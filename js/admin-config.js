// ============================================================
// Configuración del panel de administración — Juriscorp S.C.
// ============================================================
//
// POR QUÉ ESTÁ EN UN FICHERO Y NO EN UN <script> DENTRO DEL HTML.
// Ver el mismo razonamiento en js/config.js: con la CSP en modo enforce, un
// bloque inline necesitaría un hash SHA-256 que cambia con cada edición.
// Además el valor estaba DUPLICADO en admin/index.html y admin/dashboard.html,
// que es la forma clásica de que uno se actualice y el otro no.
//
// Lo cargan las dos páginas de admin. Debe ir ANTES de js/admin-auth.js, que
// lee window.ADMIN_CONFIG para crear el cliente de Supabase.
//
// LA CLAVE DE AQUÍ ES PÚBLICA POR DISEÑO. Es la publicable (sb_publishable_),
// no la de servicio. Cualquiera puede leerla en el HTML del panel, y eso es
// correcto: lo que protege los datos es RLS en la base, no el secreto de esta
// cadena. NUNCA pongas aquí la service_role: ignora RLS por completo y quien
// la tenga puede leer y borrar todos los leads del despacho.

window.ADMIN_CONFIG = {
  SUPABASE_URL: 'https://azraryuqcqibppexuiwi.supabase.co',
  SUPABASE_ANON_KEY: 'sb_publishable_bap-iRt1yLp0kGJjXv3d9Q_n6dz6BDz',
};
