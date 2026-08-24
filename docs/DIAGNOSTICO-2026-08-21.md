# Diagnóstico técnico — JURISCORP S.C.

**Repositorio:** `andrefeliperuiz12/NelsonLaw` · **Rama:** `main` · **HEAD:** `87f8500` (Mobile UI1, 2026-05-10)
**Fecha del diagnóstico:** 2026-08-21
**Alcance:** auditoría de solo lectura. No se modificó ningún archivo salvo este informe.

## Vocabulario

| Etiqueta | Significado |
|---|---|
| `[EN CÓDIGO]` | Existe implementado en el repositorio |
| `[SIN VERIFICAR]` | Existe en código, pero no hay evidencia en el repo de que funcione hoy en producción |
| `[ROTO]` | Hay evidencia concreta en el repo de que falla |

---

# FASE 1 — Identidad y estado de Git

| Comprobación | Resultado |
|---|---|
| Toplevel | `C:/Users/andre/OneDrive/Escritorio/NelsonLaw` |
| Remote `origin` | `https://github.com/andrefeliperuiz12/NelsonLaw.git` (fetch y push) |
| Rama actual | `main` |
| Working tree | Limpio — sin cambios sin commitear, sin staged |
| Untracked | Ninguno |
| Stash | Vacío |
| Divergencia `HEAD...origin/main` | `0  0` — perfectamente sincronizado |
| Ramas | Solo `main` local y `origin/main` |

## Respuestas directas

- **¿El remote apunta a `andrefeliperuiz12/NelsonLaw`?** Sí.
- **¿Estoy en `main`?** Sí.
- **¿Existe trabajo local posterior al 10 de mayo de 2026 que NO esté en GitHub?** **No.** El working tree está limpio, no hay stash ni untracked, y el contador ahead/behind es `0 0`. Todo lo que existe localmente está publicado.
- **¿Hay archivos sin trackear que parezcan importantes?** No hay ninguno. (`node_modules/` existe en disco pero está correctamente ignorado.)
- **¿Hay divergencia?** No.

## Historial completo (7 commits)

```
87f8500  2026-05-10 13:43  Mobile UI1
5fb3ea0  2026-05-10 13:36  Mobile UI
1b4467b  2026-05-10 13:14  Google search sitemap, favicon, UI
968cef7  2026-05-10 12:45  UI fixes for mobile and google search TAG
b1f191b  2026-05-10 10:31  Sitemap fixed with new domain
0f5e06b  2026-05-08 08:30  Fix de Cloudflare
8caf22a  2026-04-05 21:03  Initialize project
```

El proyecto lleva **3 meses y 11 días sin commits**.

---

# FASE 2 — Inventario real

33 archivos trackeados. **No falta ninguno** de la estructura esperada.

## Adiciones no previstas

| Archivo | Observación |
|---|---|
| `.vscode/settings.json` | Configuración de editor versionada |
| `package-lock.json` | Coherente con `package.json` |
| `supabase/.gitignore` | Generado por Supabase CLI |
| `supabase/functions/submit-lead/deno.json` | Config de Deno para la Edge Function |
| `assets/img/Favicon_Chet.png`, `NavBar_LOGO.png`, `Nav_logo.png`, `Square_LOGO.png`, `Logo_JURIS.png` | 5 imágenes adicionales sobre lo esperado |

**Nota:** `Nav_logo.png` y `NavBar_LOGO.png` no se referencian desde ningún HTML — son activos huérfanos.

## Magnitud de los archivos clave

| Archivo | Líneas |
|---|---|
| `css/main.css` | **1582** |
| `css/admin.css` | 658 |
| `index.html` | **566** |
| `js/admin-dashboard.js` | 386 |
| `supabase/functions/submit-lead/index.ts` | **367** |
| `js/main.js` | **276** |
| `admin/dashboard.html` | 197 |
| `supabase/migrations/001_create_leads.sql` | 158 |
| `js/admin-auth.js` | 133 |

`css/main.css` supera con creces el umbral de 800 líneas: es el archivo con mayor deuda estructural del proyecto.

---

# FASE 3 — Auditoría de secretos

> Conforme a la regla de manejo de secretos, en este informe **no se reproduce ningún valor**, ni parcial ni de ejemplo. Solo nombres, ubicación y clasificación.

## 1. ¿Está `.env.production` bajo control de versiones?

**Sí. `[ROTO]` — Este es el hallazgo más grave del diagnóstico.**

`.gitignore` ignora `.env` y `.env.local`, pero **no** `.env.production` ni `.env.example`. Ambos están trackeados y contienen valores reales.

## 2. Nombres de variable (sin valores)

**`.env.production`** — 7 variables:

| Línea | Variable | Naturaleza del valor | Clasificación |
|---|---|---|---|
| 1 | `SUPABASE_URL` | URL del proyecto | Pública por diseño |
| 2 | `SUPABASE_ANON_KEY` | Clave publicable (formato nuevo) | **PÚBLICA-POR-DISEÑO** |
| 3 | `SUPABASE_SERVICE_ROLE_KEY` | JWT real de service_role | **PRIVADA-COMPROMETIDA** |
| 4 | `CLOUDFLARE_TURNSTILE_SECRET` | Secret key real de Turnstile | **PRIVADA-COMPROMETIDA** |
| 5 | `RESEND_API_KEY` | API key real de Resend | **PRIVADA-COMPROMETIDA** |
| 6 | `NOTIFICATION_EMAIL` | Correo destino | No es secreto |
| 7 | `SITE_URL` | URL pública | No es secreto |

**`.env.example`** — supuestamente una plantilla, contiene **los mismos secretos reales**:

| Línea | Variable | Clasificación |
|---|---|---|
| 8 | `SITE_URL` | No es secreto |
| 11 | `CLOUDFLARE_TURNSTILE_SITE_KEY` | **PÚBLICA-POR-DISEÑO** (sitekey, va en el HTML) |
| 14 | `WHATSAPP_NUMBER` | No es secreto |
| 22 | `SUPABASE_URL` | Pública |
| 23 | `SUPABASE_ANON_KEY` | **PÚBLICA-POR-DISEÑO** (JWT anon legacy) |
| 24 | `SUPABASE_SERVICE_ROLE_KEY` | **PRIVADA-COMPROMETIDA** |
| 27 | `CLOUDFLARE_TURNSTILE_SECRET` | **PRIVADA-COMPROMETIDA** |
| 30 | `RESEND_API_KEY` | **PRIVADA-COMPROMETIDA** |
| 31 | `NOTIFICATION_EMAIL` | No es secreto |

**Verificación cruzada por hash (sin exponer valores):** `SUPABASE_SERVICE_ROLE_KEY`, `CLOUDFLARE_TURNSTILE_SECRET`, `RESEND_API_KEY` y `SUPABASE_URL` son **idénticos** en ambos archivos. Solo `SUPABASE_ANON_KEY` difiere (`.env.example` usa el JWT legacy, `.env.production` usa el formato publicable nuevo).

## 3. ¿Aparecieron valores reales en el historial?

**Sí, desde el primer commit.** Ambos archivos entraron en `8caf22a` (2026-04-05) ya con valores reales. `.env.production` se modificó de nuevo en `b1f191b` (2026-05-10).

**Ventana de exposición pública: aproximadamente 4 meses y 16 días** (5 abril 2026 → hoy), en un repositorio público. Debe asumirse que las claves fueron indexadas por escáneres automáticos de GitHub, forks, réplicas y cachés de terceros. **Rotar es obligatorio, no opcional.** Reescribir el historial más adelante no revierte esta exposición.

## 4. LISTA DE ROTACIÓN OBLIGATORIA

Ordenada por impacto. Las tres primeras son urgentes.

### R1 — `SUPABASE_SERVICE_ROLE_KEY` · CRÍTICA

- **Por qué:** esta clave **ignora por completo Row Level Security**. Quien la tenga puede leer, modificar y borrar toda la tabla `leads` — nombres, teléfonos, correos y resúmenes de casos legales de potenciales clientes. Es el peor escenario posible en este proyecto. Además, el JWT expuesto tiene una vigencia declarada de décadas: no caduca por sí solo.
- **Dónde se rota:** Supabase Dashboard → Project Settings → API Keys. Si el proyecto aún usa claves legacy (JWT), la opción es *Legacy API keys → Rotate*; lo recomendable es migrar al esquema nuevo de `secret keys` y revocar las legacy.
- **Qué se rompe:** la Edge Function `submit-lead` deja de poder insertar hasta que se actualice su secreto (`supabase secrets set …` + `supabase functions deploy submit-lead`). Ver también el hallazgo **H-05**, que indica que probablemente ya no funciona.

### R2 — `RESEND_API_KEY` · CRÍTICA

- **Por qué:** permite enviar correo **en nombre del dominio de la firma**. El riesgo no es solo cuota: es suplantación de identidad de un bufete de abogados hacia sus propios clientes, y quema de la reputación del dominio.
- **Dónde se rota:** resend.com → API Keys → revocar la existente y crear una nueva con permisos mínimos (solo *sending*).
- **Qué se rompe:** las notificaciones de nuevo lead, hasta actualizar el secreto y redeployar.

### R3 — `CLOUDFLARE_TURNSTILE_SECRET` · ALTA

- **Por qué:** con la secret key un tercero puede validar tokens contra el widget y automatizar envíos, anulando la protección anti-bot del formulario.
- **Dónde se rota:** Cloudflare Dashboard → Turnstile → seleccionar el widget → *Rotate Secret Key*.
- **Qué se rompe:** la verificación server-side falla (todo envío devuelve "Verificación de seguridad fallida") hasta actualizar el secreto y redeployar.

### No requieren rotación (públicas por diseño)

Estas se sirven al navegador y son públicas por naturaleza. Exponerlas **no** es un incidente:

- `SUPABASE_ANON_KEY` / publishable key — su seguridad depende enteramente de RLS. Ver **H-03**.
- `CLOUDFLARE_TURNSTILE_SITE_KEY` — va embebida en `index.html:454`.
- Token `google-site-verification` — `index.html:8`.

> **Consideración no técnica, para tu criterio:** los datos afectados incluyen resúmenes de casos legales de personas identificables. En Panamá, la Ley 81 de 2019 sobre protección de datos personales puede imponer obligaciones de evaluación y notificación ante un incidente de este tipo. No emito opinión legal — lo señalo porque la decisión es de la firma y conviene tomarla con conocimiento del alcance.

---

# FASE 4 — Mapa funcional

## `index.html` — 566 líneas · `[EN CÓDIGO]`

**Secciones y anclas:** `#inicio` (hero), `#servicios` (3 áreas principales + 6 secundarias), `#sobre-mi` (trayectoria), `#clientes` (`#clientes-panama`, `#clientes-extranjeros`), `#contacto` (formulario), footer, botón flotante de WhatsApp.

**Metadatos SEO:** `title`, `description`, `keywords`, `author`, `robots="index, follow"`, `canonical` a `https://juriscorppanama.com/`, Open Graph completo (`og:type/url/title/description/image/locale=es_PA`), Twitter Card `summary_large_image`, verificación de Google Search Console (línea 8).

**Schema.org (líneas 41-76):**
- Tipo: `LegalService`
- Nombre: `Juriscorp S.C.`
- Email: `contacto@juriscorppanama.com` ← **no coincide con el `mailto:` visible**, ver **H-15**
- Teléfono: `+507-6673-0357`
- Dirección: Ciudad de Panamá, PA · `areaServed: Panama`
- `hasOfferCatalog` con 6 servicios · `founder`: Nelson Ruiz Pinilla

**Enlaces salientes:**

| Línea | Destino | Estado |
|---|---|---|
| 79-83 | Google Fonts (`fonts.googleapis.com`, `fonts.gstatic.com`) | OK, con preconnect |
| 89 | `challenges.cloudflare.com/turnstile/v0/api.js` | OK, async defer |
| **366** | `wa.me` (contacto) | **ROTO** — falta el `?` |
| 374 | `mailto:nelsonhruiz18@gmail.com` | Funcional, pero inconsistente |
| 381 | `tel:+50766730357` | OK |
| **492** | `wa.me` (post-éxito) | **ROTO** — número truncado |
| **546** | `wa.me` (botón flotante) | **ROTO** — número truncado |
| 558 | Edge Function en `azraryuqcqibppexuiwi.supabase.co` | Ver **H-05** |

**Claves públicas embebidas:** `TURNSTILE_SITE_KEY` (línea 454 y 559) — sitekey de Turnstile, **PÚBLICA-POR-DISEÑO**, correcto que esté ahí.

**Bloque de configuración (líneas 555-562):** `window.NELSON_CONFIG` con `EDGE_FUNCTION_URL`, `TURNSTILE_SITE_KEY` y `WHATSAPP_NUMBER`. El comentario dice *"replace with real values before deployment"* pero ya contiene valores de producción.

## `css/main.css` — 1582 líneas · `[EN CÓDIGO]`

**Variables (`:root`):** paleta navy/gold coherente — `--navy #0d1b2a`, `--navy-mid #162336`, `--navy-light #1e3050`, `--gold #c9a84c`, `--gold-light #e4c97e`, `--gold-pale #f5e9c8`, `--cream #faf7f0`, `--white`, `--gray #8a9bb0`, `--text-body #d0dae8`, `--error #e74c4c`, `--success #4caf50`. Tipografías: `--font-serif` Cormorant Garamond, `--font-sans` Outfit.

**Breakpoints:** solo **dos** — `max-width: 900px` (línea 1335) y `max-width: 480px` (línea 1500). Orden correcto (desktop-first descendente). Ver **H-24**.

**`!important`:** 4 usos (líneas 136, 139, 143, 144), todos concentrados en el CTA de navegación. Uso acotado, no sistémico.

**Valor inválido:** línea 817, `margin-right: 5;` — ver **H-19**.

## `js/main.js` — 276 líneas · `[EN CÓDIGO]`

- **IIFE con `'use strict'`.** No exporta nada al scope global salvo los tres callbacks de Turnstile.
- **`CONFIG`** (líneas 13-19): valores vacíos por defecto, sobrescritos con `Object.assign` desde `window.NELSON_CONFIG`. `WHATSAPP_NUMBER` tiene un valor hardcodeado que **nunca se usa** (ver **H-23**).
- **URL de envío:** `CONFIG.EDGE_FUNCTION_URL` → `https://azraryuqcqibppexuiwi.supabase.co/functions/v1/submit-lead` (línea 216, `fetch` POST JSON).
- **Funciones:** `initNavigation()`, `initScrollReveal()` (IntersectionObserver), `validateField()`, `validateForm()`, `initForm()`.
- **Manejo de errores:** tres estados — respuesta no-ok muestra `result.error` en un banner; error de red muestra mensaje genérico de conexión; `finally` siempre rehabilita el botón y resetea Turnstile. Correcto.
- **Estados de UI:** `formFields.hidden` / `formSuccess.visible` / `formError.visible`, spinner en el botón.
- **Observación:** el bloque `formError` (`index.html:503`) nunca se activa desde `main.js` — los errores siempre van al banner. Es UI muerta.

## `admin/index.html` + `js/admin-auth.js` · `[EN CÓDIGO]`

- **Flujo:** login con `supabase.auth.signInWithPassword(email, password)`. Si hay sesión previa, redirige directo a `/admin/dashboard.html`.
- **Claves usadas:** `window.ADMIN_CONFIG` con `SUPABASE_URL` y la publishable key (`admin/index.html:60-63`). Ambas públicas por diseño.
- **Protección de `dashboard.html`:** `initDashboardAuth()` comprueba `getSession()` y, si no hay sesión, redirige a `/admin/index.html`. **Esta protección es puramente del lado del cliente** — el HTML del dashboard se sirve a cualquiera. La única barrera real sobre los datos es RLS. Ver **H-10**.
- Expone `window.adminSupabase` y `window.adminSession`, y dispara el evento `adminReady`.
- Carga el SDK desde `cdn.jsdelivr.net` **sin atributo `integrity`** (línea 58). Ver **H-07**.

## `js/admin-dashboard.js` — 386 líneas · `[EN CÓDIGO]`

- **Consultas de lectura:** `.from('leads').select('*').order('created_at', desc)` — **sin límite ni paginación** (línea 56). Y `.from('lead_audit_log').select('*').eq('lead_id', …).limit(20)`.
- **Escrituras:** `.from('leads').update(updates).eq('id', …)` — solo campos `status`, `notes_internal`, `is_archived`, `last_contacted_at`.
- **Auditoría:** sí, inserta en `lead_audit_log` (línea 310), registrando campo, valor anterior y nuevo. Las notas internas se registran de forma opaca (`'(notas actualizadas)'`), lo cual es un acierto de privacidad. Pero `changed_by` lo envía el cliente — ver **H-14**.
- **XSS:** usa `escapeHtml()` vía `textContent` en la tabla y el log; el modal usa `textContent` directo. Correcto.

## `supabase/migrations/001_create_leads.sql` — 158 líneas · `[EN CÓDIGO]`

**Enums:** `lead_status` (7 valores) y `legal_area` (10 valores).

**Tabla `leads`:** `id` UUID PK, `created_at`, `updated_at`, `full_name` (CHECK ≥2), `phone` (CHECK ≥7), `email` (CHECK regex o NULL), `legal_area`, `case_summary` (CHECK ≥10), `source`, `status`, `assigned_to` → `auth.users`, `notes_internal`, `last_contacted_at`, `is_archived`.

**Índices:** 5 B-tree (`status`, `created_at DESC`, `legal_area`, `is_archived`, `source`) + 1 GIN full-text español sobre `full_name`.

**Trigger:** `update_leads_updated_at` BEFORE UPDATE → `update_updated_at_column()`.

**Políticas RLS — una por una:**

| Política | Tabla | Rol | Operación | Condición | Evaluación |
|---|---|---|---|---|---|
| `authenticated_select_leads` | `leads` | `authenticated` | SELECT | `USING (true)` | Todo usuario autenticado lee **todos** los leads. Ver **H-03** |
| `authenticated_update_leads` | `leads` | `authenticated` | UPDATE | `USING(true) WITH CHECK(true)` | Todo usuario autenticado modifica **cualquier** lead |
| `service_role_insert_leads` | `leads` | `service_role` | INSERT | `WITH CHECK (true)` | Correcto — solo la Edge Function inserta |
| `service_role_delete_leads` | `leads` | `service_role` | DELETE | `USING (true)` | Correcto — `authenticated` no puede borrar |
| `authenticated_select_audit` | `lead_audit_log` | `authenticated` | SELECT | `USING (true)` | Aceptable |
| `authenticated_insert_audit` | `lead_audit_log` | `authenticated` | INSERT | `WITH CHECK (true)` | Permite falsificar autoría. Ver **H-14** |

`anon` no tiene ninguna política sobre `leads` → sin acceso. Correcto y bien diseñado.

Ausencia de políticas UPDATE/DELETE en `lead_audit_log` → el log es inmutable. **Buena decisión.**

**Vista:** `lead_stats` agrupa por `status` con conteos a 7 y 30 días. **Sin `security_invoker`** — ver **H-04**.

## `supabase/functions/submit-lead/index.ts` — 367 líneas · `[SIN VERIFICAR]`

**Nombres EXACTOS de variables de entorno que lee:**

| Línea | Variable | Nota |
|---|---|---|
| 78 | `RESEND_API_KEY` | Coincide con `.env` |
| 79 | `NOTIFICATION_EMAIL` | Coincide con `.env` |
| 132 | `SITE_URL` | Con fallback a `https://juriscorppanama.com` |
| 210 | `CLOUDFLARE_TURNSTILE_SECRET` | Coincide con `.env` |
| 301 | `SUPABASE_URL` | Inyectada automáticamente por la plataforma |
| **302** | **`SERVICE_ROLE_KEY`** | **No coincide con `.env` ni con el README.** Ver **H-05** |

**Orden de validaciones:**
1. Preflight `OPTIONS` → 200
2. Método distinto de POST → 405
3. Rate limit por IP → 429
4. Parseo del body
5. `consent` ausente → 400
6. `turnstileToken` ausente → 400
7. Secreto de Turnstile no configurado → 500
8. Verificación contra `siteverify` de Cloudflare → 400 si falla
9. Campos requeridos ausentes → 400
10. Sanitización (`sanitize()`)
11. Formato: nombre ≥2, teléfono 7-20 dígitos, email regex, `legal_area` contra lista blanca, resumen ≥10 → 400
12. Credenciales de Supabase ausentes → 500
13. INSERT en `leads` → 500 si falla
14. Envío de correo vía Resend (errores capturados, no bloquean)
15. 200 con `leadId`

El orden es correcto: **Turnstile se verifica antes de tocar la base de datos.** Buen diseño.

**Rate limit y sus limitaciones en serverless (líneas 18-33):** `Map` en memoria, 5 peticiones por IP por minuto. Limitaciones reales:
- El estado vive en **una sola instancia**. Supabase escala horizontalmente: peticiones repartidas entre instancias multiplican el límite efectivo.
- Todo *cold start* borra el mapa. Un atacante que espacie peticiones puede no encontrar nunca estado previo.
- El `Map` **nunca purga entradas caducadas** → crece de forma no acotada mientras la instancia viva (fuga de memoria lenta).
- La IP se toma de `x-forwarded-for`, cabecera falsificable si algo delante no la normaliza.

En la práctica es un amortiguador contra ráfagas triviales, no un control de abuso. La defensa efectiva es Turnstile. Ver **H-13**.

## Documentación — resumen y contradicciones

| Archivo | Resumen en una línea |
|---|---|
| `README.md` | Guía de setup en 8 pasos: Supabase, Turnstile, Resend, deploy de la función, config del frontend, hosting y dominio. |
| `SECURITY_CHECKLIST.md` | 30+ ítems de seguridad, **todos marcados como completados**. |
| `SEO_CHECKLIST.md` | Inventario de metadatos, OG, Twitter Cards, Schema.org y archivos SEO, todo marcado como hecho. |
| `OPERATIONS_GUIDE.md` | Manual de uso del panel para el usuario final. Claro y sin contradicciones detectadas. |

**Contradicciones contra el código real:**

| # | Documento | Afirmación | Realidad |
|---|---|---|---|
| C1 | `SECURITY_CHECKLIST.md:39` | "`.env.example` sin valores reales: Template para referencia" | **Falso.** Contiene service_role, Resend key y Turnstile secret reales |
| C2 | `README.md:139` | "Nunca commitear valores reales" | **Contradicho por el propio repo**: dos archivos `.env` con valores reales versionados |
| C3 | `SECURITY_CHECKLIST.md:32` | "Solo usuarios pre-creados: No hay registro público" | `supabase/config.toml` declara `enable_signup = true`. Pendiente de verificar en producción — ver **H-03** |
| C4 | `README.md:80-84` | Lista los secretos a configurar | **Omite `SERVICE_ROLE_KEY`**, que el código exige en `index.ts:302` |
| C5 | `SECURITY_CHECKLIST.md:24` | "Rate limiting: máximo 5 req/IP/min" | Cierto en código, pero no fiable en serverless (**H-13**) |
| C6 | `SEO_CHECKLIST.md:37` | "HTML5 semántico (`<section>`, `<nav>`, `<header>`, `<footer>`, `<main>`)" | `index.html` tiene **0** ocurrencias de `<main>` y **0** de `<header>` |
| C7 | `SEO_CHECKLIST.md:35` | "Un solo `<h1>` (nombre del abogado)" | Hay un solo `h1`, correcto, pero contiene "Juriscorp S.C." — el checklist quedó desactualizado tras el rebranding |
| C8 | `SECURITY_CHECKLIST.md:5-9` | Bloque de RLS marcado como seguro | El diseño de `anon` es correcto, pero `authenticated` tiene acceso total sin control de rol (**H-03**, **H-10**) |

El `SECURITY_CHECKLIST.md` está **al 100% marcado como completado** mientras el repositorio expone credenciales de producción. Ese documento no refleja el estado real y no debe usarse como evidencia de seguridad.

---

# FASE 5 — Verificación de bugs reportados

## B1 — URL de WhatsApp malformada · **CONFIRMADO, y más grave de lo reportado**

Hay **tres** enlaces `wa.me` y **los tres están rotos**, por dos causas distintas.

El número correcto, según Schema.org (`index.html:48`) y el enlace `tel:` (`index.html:381`), es **+507 6673-0357** → `50766730357` (11 dígitos).

| # | Ubicación | Defecto | Efecto |
|---|---|---|---|
| 1 | `index.html:366` | `wa.me/50766730357text=Buenas...` — **falta el `?`** | El número correcto queda concatenado con `text=`. WhatsApp recibe un identificador inválido → error "número no válido" |
| 2 | `index.html:492` | `wa.me/5076673035?text=...` — `?text=` correcto, pero **el número tiene 10 dígitos**: falta el `7` final | Abre un chat con un número inexistente |
| 3 | `index.html:546` | Idéntico al anterior (botón flotante) | Igual |

**Causa raíz del truncamiento:** `index.html:560` define `WHATSAPP_NUMBER: '5076673035'` y `js/main.js:18` repite el mismo valor truncado. Es un dígito perdido que se propagó.

**Matiz importante:** la variante `7text=` que se sospechaba no existe. El defecto real en el caso 1 es la **ausencia del `?`**, no un `7` sustituyéndolo — lo que ocurre es que el `7` final del número correcto queda pegado a `text=` y produce esa apariencia.

**Consecuencia de negocio:** los tres caminos de contacto por WhatsApp del sitio están inoperativos, incluido el botón flotante permanente y el que aparece justo después de enviar el formulario. Es el canal de conversión más inmediato de la firma.

## B2 — `margin-right: 5;` · **CONFIRMADO**

`css/main.css:817`, dentro del bloque `#contacto`:

```css
#contacto {
  background: var(--navy-mid);
  margin-right: 5;   /* ← línea 817 */
}
```

**¿Tiene algún propósito?** **Ninguno.** `5` sin unidad no es un valor válido para `margin-right` (solo `0` puede ir sin unidad). El navegador descarta la declaración por completo, así que hoy no produce ningún efecto visual.

**Debe eliminarse, no corregirse.** Si alguien "arreglara" el valor a `5px`, introduciría un desplazamiento asimétrico en una sección full-width, con riesgo de desbordamiento horizontal en móvil. La ausencia de esta línea es el comportamiento correcto y actual. Es un residuo de edición.

## B3 — `SERVICE_ROLE_KEY` vs `SUPABASE_SERVICE_ROLE_KEY` · **CONFIRMADO**

| Ubicación | Nombre usado |
|---|---|
| `supabase/functions/submit-lead/index.ts:302` | **`SERVICE_ROLE_KEY`** |
| `.env.production:3` | `SUPABASE_SERVICE_ROLE_KEY` |
| `.env.example:24` | `SUPABASE_SERVICE_ROLE_KEY` |
| `README.md:80-84` | **No la menciona en absoluto** |

**Cuál usa realmente el código en ejecución: `SERVICE_ROLE_KEY`** (sin prefijo). Los archivos `.env` y el README describen una variable que el código nunca lee.

**Contexto que explica la discrepancia:** Supabase reserva el prefijo `SUPABASE_` e impide asignar secretos con ese prefijo vía `supabase secrets set`. Usar `SERVICE_ROLE_KEY` es el rodeo habitual — pero exige que alguien haya ejecutado ese `secrets set` manualmente, y el README nunca lo indica.

**Implicación funcional — el punto más importante de este diagnóstico:** si ese secreto nunca se configuró en producción, `index.ts:304` corta la ejecución y devuelve HTTP 500 con *"Error de configuración del servidor."* **Ningún lead se guardaría, y ninguna notificación se enviaría.** El usuario vería el mensaje de error genérico del formulario.

Esto no puede confirmarse desde el repositorio: queda como **`[SIN VERIFICAR]`, con sospecha fundada**. Es la primera comprobación del checklist de FASE 6.

## B4 — Inconsistencia de correo · **CONFIRMADO** — tres direcciones distintas

| Dirección | Ubicaciones | Rol |
|---|---|---|
| `contacto@juriscorppanama.com` | `index.html:49` (Schema.org) | Declarado a Google como email oficial. **No se usa en ningún enlace del sitio** |
| `nelsonhruiz18@gmail.com` | `index.html:374`, `index.html:378` (visible al usuario), `README.md:83` (`NOTIFICATION_EMAIL`) | Es el correo que el visitante ve y al que se envían las notificaciones |
| `notificaciones@juriscorppanama.com` | `supabase/functions/submit-lead/index.ts:107` | Remitente de los correos vía Resend |

**Tres problemas derivados:**
1. **Coherencia de marca:** el sitio de una firma corporativa muestra públicamente una dirección personal de Gmail, mientras declara a Google una dirección corporativa que no funciona en ningún botón.
2. **Riesgo de entregabilidad:** el remitente `notificaciones@juriscorppanama.com` exige que ese dominio esté verificado en Resend (SPF/DKIM). Si no lo está, **todos los correos de notificación fallan silenciosamente** — `index.ts:142-149` solo hace `console.error` y no interrumpe el flujo. Verificable únicamente desde el panel de Resend.
3. **Retención de datos:** las notificaciones con datos de potenciales clientes llegan a una cuenta personal de Gmail, no a un buzón controlado por la firma.

## B5 — Copyright del footer · **CONFIRMADO**

`index.html:535`:

```html
&copy; 2025 Juriscorp S.C. Todos los derechos reservados.
```

**Estático y desfasado.** Estamos en 2026. No existe ningún `getFullYear()` en el repositorio. Es la única ocurrencia de copyright.

## B6 — Defectos adicionales encontrados

Consolidados en la tabla de hallazgos de la FASE 8. Los más relevantes: **H-03** (superficie de RLS), **H-04** (vista sin `security_invoker`), **H-05** (variable de entorno), **H-07** (CDN sin SRI), **H-08** (sin cabeceras de seguridad), **H-12** (sanitización que corrompe datos), **H-16** (soft 404).

---

# FASE 6 — Producción: lo comprobable y lo no comprobable

## Comprobable desde el repositorio

### `_redirects` (14 líneas) · `[EN CÓDIGO]`

```
/admin/*     /admin/:splat  200
/supabase/*  /404.html      404
/css/*       /css/:splat    200
/js/*        /js/:splat     200
/assets/*    /assets/:splat 200
/*           /index.html    200
```

Observaciones:
- Las reglas `/css/*`, `/js/*`, `/assets/*` y `/admin/*` son **redundantes**: Netlify ya sirve archivos estáticos existentes antes de aplicar redirecciones.
- `/supabase/* → /404.html 404` apunta a un archivo que **no existe en el repositorio**. Netlify servirá su 404 genérico (el status 404 sí se respeta).
- **`/* /index.html 200` es el problema real:** cualquier URL inexistente devuelve la home con **HTTP 200**. Ver **H-16**.

### `robots.txt` (6 líneas) · `[EN CÓDIGO]`

```
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /supabase/
Sitemap: https://juriscorppanama.com/sitemap.xml
```
Correcto y coherente con el dominio.

### `sitemap.xml` (13 líneas) · `[EN CÓDIGO]`

Una sola URL: `https://juriscorppanama.com/` · `lastmod` **2026-05-10** · `changefreq weekly` · `priority 1.0` · con extensión `image:image` para el logo.

`lastmod` coincide con el último commit — correcto hoy, pero se mantiene a mano y quedará obsoleto con cada cambio. `changefreq weekly` es una promesa que el sitio no cumple (3 meses sin cambios); Google lo ignora en gran medida, es cosmético.

### `canonical` · `[EN CÓDIGO]`

`index.html:17` → `https://juriscorppanama.com/`. Coherente con `og:url` y con el sitemap.

### Configuración de Netlify versionada

**No existe.** No hay `netlify.toml` ni `_headers` en el repositorio. Consecuencia: **ninguna cabecera de seguridad está versionada** (CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy). Ver **H-08**.

## Checklist accionable — lo que solo tú puedes verificar

> Los tres primeros bloques deciden si el sitio capta leads hoy o no.

### A. ¿Funciona el formulario? (máxima prioridad)

- [ ] **A1.** Supabase Dashboard → Edge Functions → `submit-lead` → *Secrets*. **¿Existe un secreto llamado exactamente `SERVICE_ROLE_KEY`?** Si no existe, el formulario está roto y ningún lead se ha guardado. *(Confirma o descarta H-05.)*
- [ ] **A2.** Supabase → Table Editor → `leads`. **¿Cuántas filas hay y cuál es el `created_at` más reciente?** Es la prueba definitiva: si la fila más reciente es anterior al lanzamiento, nunca ha entrado un lead.
- [ ] **A3.** Supabase → Edge Functions → `submit-lead` → *Logs*. Buscar `"Supabase credentials not configured"` o `"DB insert error"`.
- [ ] **A4.** Verificar que `submit-lead` está **efectivamente desplegada** (no solo presente en el repo) y en qué fecha.
- [ ] **A5.** Enviar una consulta de prueba real desde el sitio en producción y observar la respuesta de red en las DevTools del navegador.

### B. Superficie de seguridad (máxima prioridad)

- [ ] **B1.** Supabase → Authentication → Providers → Email. **¿Está habilitado el registro público (`Enable signup`)?** Si lo está, **cualquier persona puede crear una cuenta y leer todos los leads**. *(Confirma o descarta H-03 — es el escenario más grave después de las claves filtradas.)*
- [ ] **B2.** Supabase → Authentication → Users. **¿Qué usuarios existen?** ¿Solo los administradores esperados, o hay cuentas desconocidas?
- [ ] **B3.** Supabase → Advisors → Security Advisor. Buscar avisos de tipo *"Security Definer View"* sobre `lead_stats`. *(Confirma o descarta H-04.)*
- [ ] **B4.** Ejecutar en el SQL Editor: `SELECT * FROM lead_stats;` **usando el rol `anon`**, para comprobar si la vista filtra datos agregados sin autenticación.
- [ ] **B5.** Supabase → Logs → API/Auth. Revisar accesos anómalos desde el 5 de abril de 2026 (inicio de la exposición de credenciales). **¿Hay consultas a `leads` desde IPs desconocidas?**
- [ ] **B6.** Confirmar en GitHub que el repositorio es efectivamente **público** y revisar la pestaña de forks.

### C. Rotación de credenciales (inmediata)

- [ ] **C1.** Rotar `SUPABASE_SERVICE_ROLE_KEY` *(R1)*.
- [ ] **C2.** Rotar `RESEND_API_KEY` *(R2)*.
- [ ] **C3.** Rotar `CLOUDFLARE_TURNSTILE_SECRET` *(R3)*.
- [ ] **C4.** Tras cada rotación, actualizar el secreto correspondiente en Supabase y **redeployar** `submit-lead`.

### D. Correo y notificaciones

- [ ] **D1.** Resend → Domains. **¿Está `juriscorppanama.com` verificado con SPF y DKIM?** Sin esto, ninguna notificación llega.
- [ ] **D2.** Resend → Logs. ¿Hay envíos registrados? ¿Rebotes?
- [ ] **D3.** Confirmar a qué buzón llega realmente `NOTIFICATION_EMAIL` y si alguien lo revisa.
- [ ] **D4.** Revisar la carpeta de spam del buzón de notificaciones.

### E. Hosting y cabeceras

- [ ] **E1.** Netlify → Site settings. Confirmar que el despliegue está conectado a este repositorio y a la rama `main`.
- [ ] **E2.** Comprobar la fecha del último deploy publicado y si coincide con `87f8500`.
- [ ] **E3.** Inspeccionar las cabeceras de respuesta de `https://juriscorppanama.com` (`curl -I`). **¿Existen CSP, HSTS, X-Frame-Options?** *(Confirma o descarta H-08.)*
- [ ] **E4.** Verificar si hay reglas de redirección o cabeceras configuradas **en la UI de Netlify** que no estén en el repositorio.
- [ ] **E5.** Comprobar que HTTPS y el certificado del dominio están activos y vigentes.
- [ ] **E6.** Visitar una URL inexistente (p. ej. `/no-existe`) y comprobar el código de estado. *(Confirma H-16.)*

### F. Turnstile

- [ ] **F1.** Cloudflare → Turnstile. Confirmar que el widget existe y que **`juriscorppanama.com` está en su lista de dominios permitidos**. Si no lo está, el widget no renderiza y nadie puede enviar el formulario.
- [ ] **F2.** Revisar las analíticas del widget: ¿hay solicitudes de verificación registradas? Es un indicador indirecto de tráfico real en el formulario.

### G. SEO y presencia

- [ ] **G1.** Google Search Console: ¿está el dominio verificado y el sitemap enviado y procesado?
- [ ] **G2.** ¿Cuántas páginas indexadas? ¿Hay avisos de contenido duplicado derivados del soft 404?
- [ ] **G3.** Comprobar el Schema.org con la Prueba de Resultados Enriquecidos de Google.
- [ ] **G4.** Ejecutar Lighthouse sobre la home (rendimiento, accesibilidad, SEO).
- [ ] **G5.** Verificar el perfil de Google Business de la firma y su coherencia con los datos del sitio.

### H. Responsive (requiere dispositivos reales)

- [ ] **H1.** Probar en 320, 375, 768, 1024, 1440 px. **Prestar especial atención al rango 481-900 px** (tablets), donde solo actúa el breakpoint de 900. *(Ver H-24.)*
- [ ] **H2.** Comprobar que no hay desbordamiento horizontal en ningún ancho.
- [ ] **H3.** Verificar el widget de Turnstile en móvil (usa `data-size="flexible"`).
- [ ] **H4.** Probar el panel de administración en tablet y móvil.

---

# FASE 7 — Puntos de extensión

Esta sección es la base de trabajo para las próximas sesiones. Para cada tipo de cambio: archivos en orden, riesgo y qué se puede romper.

## 7.1 — Añadir una sección nueva a la landing

**Cadena de archivos:**
1. `index.html` — insertar `<section id="nueva-seccion">` entre secciones existentes, siguiendo el patrón `section-inner` → `section-tag` → `section-title` → `gold-divider`.
2. `index.html:100-106` — añadir el enlace en `.nav-links` (y en `.footer-links`, líneas 529-533, si procede).
3. `css/main.css` — estilos de la sección + ajustes en los dos bloques `@media` (líneas 1335 y 1500).
4. Añadir la clase `reveal` a los elementos que deban animarse — `js/main.js:62` los recoge automáticamente vía `IntersectionObserver`. **No requiere tocar JS.**

**Riesgo: BAJO.**

**Qué se puede romper:**
- La barra de navegación tiene espacio limitado; un sexto enlace puede desbordar en el rango 768-900 px.
- El scroll suave depende de anclas: un `id` duplicado rompe la navegación en silencio.
- `css/main.css` ya tiene 1582 líneas — añadir sin criterio agrava el problema. **Recomendación: al superar las 1800 líneas, dividir en `css/base.css` + `css/sections.css` + `css/responsive.css`.**

## 7.2 — Añadir un campo nuevo al formulario de contacto

**El cambio de mayor superficie del proyecto. Toca 6 archivos y una migración.** Orden obligatorio: la base de datos primero, el frontend al final.

| # | Archivo | Cambio |
|---|---|---|
| 1 | `supabase/migrations/002_*.sql` (nuevo) | `ALTER TABLE leads ADD COLUMN nuevo_campo TEXT;` — **nullable o con DEFAULT**, nunca `NOT NULL` sin default |
| 2 | `supabase/functions/submit-lead/index.ts:186` | Añadir el campo al destructuring del body |
| 3 | `…index.ts:243-252` | Incluirlo en la validación de requeridos, si aplica |
| 4 | `…index.ts:254-259` | Pasarlo por `sanitize()` |
| 5 | `…index.ts:261-298` | Añadir validación de formato + respuesta 400 propia |
| 6 | `…index.ts:314-326` | Añadirlo al objeto del `.insert()` |
| 7 | `…index.ts:110-138` | Añadir la fila al HTML del email, si debe notificarse |
| 8 | `index.html:396-450` | Añadir el `.form-group` con `<label>`, input, `<span class="field-error">` |
| 9 | `js/main.js:140-177` | Añadir la llamada a `validateField()` en `validateForm()` |
| 10 | `js/main.js:206-214` | Añadir el campo al `payload` |
| 11 | `admin/dashboard.html` | Añadir el elemento al modal de detalle |
| 12 | `js/admin-dashboard.js:154-194` | Rellenarlo en `openLeadModal()` |
| 13 | `js/admin-dashboard.js:116-144` | Añadir columna a la tabla, si debe listarse |
| 14 | `js/admin-dashboard.js:88-114` | Incluirlo en `searchFields` si debe ser buscable |

**Riesgo: ALTO.** Es el flujo crítico de negocio.

**Qué se puede romper:**
- **El orden importa.** Desplegar la Edge Function antes de aplicar la migración provoca fallo de INSERT en **todos** los envíos: el formulario deja de captar leads.
- Un `NOT NULL` sin `DEFAULT` en una tabla con filas existentes **hace fallar la migración entera**.
- Si el campo se añade al `payload` de `main.js` pero no al destructuring de la función, se descarta en silencio — sin error visible.
- `sanitize()` trunca a 2000 caracteres y escapa HTML: no es apto para campos numéricos, fechas ni JSON. Ver **H-12**.
- **Regla de despliegue:** `migración SQL` → `deploy de la Edge Function` → `deploy del frontend`. Nunca al revés.

## 7.3 — Añadir una página nueva

**Cadena:**
1. `nueva-pagina.html` en la raíz (copiar el `<head>` de `index.html`, ajustando `title`, `description`, `canonical`, `og:url`).
2. `sitemap.xml` — nuevo bloque `<url>` con `loc`, `lastmod`, `changefreq`, `priority` **menor** que 1.0.
3. `_redirects` — **crítico**: la regla `/* /index.html 200` (línea 14) es un catch-all. Verificar que la página nueva se sirve antes de llegar a ella. Netlify prioriza archivos reales, pero conviene comprobarlo.
4. `index.html:100-106` y `529-533` — enlaces de navegación y footer.
5. `css/main.css` — estilos propios, si los requiere.
6. `robots.txt` — solo si debe excluirse.

**Riesgo: MEDIO** (por el catch-all de `_redirects`).

**Qué se puede romper:**
- Un `canonical` copiado sin cambiar apuntando a la home hace que Google **ignore la página nueva por completo**. Es el error más común y el más silencioso.
- Los enlaces de navegación son anclas (`#servicios`) relativas a la home: desde otra página **no funcionan** — deben pasar a `/#servicios`.
- Duplicar el bloque Schema.org `LegalService` en varias páginas confunde a Google. Debe permanecer solo en la home.

## 7.4 — Añadir un estado de lead o una columna a `leads`

**Estado nuevo (cadena de 5):**
1. `supabase/migrations/00X_*.sql` — `ALTER TYPE lead_status ADD VALUE 'nuevo_estado';`
2. `js/admin-dashboard.js:28-36` — `STATUS_LABELS`
3. `admin/dashboard.html` — `<option>` en `#modalStatus` y en `#statusFilter`
4. `css/admin.css` — regla `.lead-status-badge.nuevo_estado`
5. `js/admin-dashboard.js:72-85` — `updateStats()`, si merece contador propio

**Advertencia técnica:** `ALTER TYPE … ADD VALUE` **no puede ejecutarse dentro de un bloque de transacción** en Postgres. Debe ir en su propia migración, aislado. Es un fallo frecuente al usar `supabase db push`.

**Columna nueva:** ver 7.2 (pasos 1, 11-14) si no proviene del formulario público.

**Riesgo: MEDIO.**

**Qué se puede romper:**
- Los valores de un enum **no se pueden eliminar ni renombrar** en Postgres sin recrear el tipo y reescribir la tabla. Elegir el nombre con cuidado: es prácticamente permanente.
- Un estado sin entrada en `STATUS_LABELS` se muestra como el literal crudo (`consulta_agendada`) al usuario final.
- Sin regla CSS, el badge se renderiza sin color y parece un error visual.

## 7.5 — Añadir una vista o filtro nuevo al CRM

**Cadena:**
1. `admin/dashboard.html` — control de UI (select, checkbox, input)
2. `js/admin-dashboard.js:88-114` — lógica en `getFilteredLeads()`
3. `js/admin-dashboard.js:341-355` — registrar el listener en `init()`
4. `css/admin.css` — estilos
5. *(Opcional)* `supabase/migrations/` — índice nuevo si el filtro pasa a ser server-side

**Riesgo: BAJO.**

**Qué se puede romper:**
- El filtrado es **íntegramente en cliente**: `loadLeads()` (línea 56) trae todas las filas con `select('*')` sin paginación. `supabase/config.toml` fija `max_rows = 1000`. **Al superar los 1000 leads, el panel empezará a truncar resultados en silencio, sin ningún aviso.** Antes de ese punto hay que migrar a paginación server-side (`.range()`) y mover los filtros a `.eq()` / `.ilike()`.
- El buscador tiene debounce de 300 ms sobre `renderLeads()` — filtros costosos en cliente degradarán la interacción.

## 7.6 — Internacionalización español/inglés

**El cambio de mayor alcance de toda la lista.** Dado que la firma capta clientes extranjeros, tiene valor de negocio real; pero conviene abordarlo **después** de estabilizar el formulario y los secretos.

**Enfoque recomendado — páginas separadas, no i18n en runtime.** Encaja con el stack (sin build, sin framework) y es superior para SEO frente a un cambio de idioma por JavaScript, que Google indexa mal.

**Cadena:**
1. `/en/index.html` — traducción completa, con `<html lang="en">`
2. `index.html:17` y `/en/index.html` — `canonical` propio de cada versión
3. Ambos `<head>` — `<link rel="alternate" hreflang="es" …>` y `hreflang="en"` **cruzados**, más `hreflang="x-default"`
4. `index.html:31` — `og:locale` `es_PA` / `en_US`
5. `index.html:41-76` — el bloque Schema.org solo en la versión canónica principal
6. `sitemap.xml` — ambas URLs, cada una con sus `xhtml:link` alternos
7. `index.html:427-438` — los `value` del `<select>` **deben permanecer en español** (`derecho_administrativo`): son claves del enum SQL. **Solo se traduce el texto visible.**
8. `supabase/functions/submit-lead/index.ts:86-97` — `areaLabels` para el email
9. `…index.ts` — mensajes de error, hoy en español fijo. Requiere detectar idioma (cabecera `Accept-Language` o campo `locale` en el payload)
10. `supabase/migrations/` — considerar una columna `locale` en `leads` para saber en qué idioma responder al cliente
11. `_redirects` — opcionalmente, redirección por idioma del navegador
12. `css/main.css` — el inglés ocupa ~15-20 % menos espacio que el español: revisar botones y titulares

**Riesgo: ALTO** (por superficie y por SEO).

**Qué se puede romper:**
- **El error más caro:** traducir los `value` del `<select>`. La Edge Function los valida contra `VALID_LEGAL_AREAS` (`index.ts:36-47`) y el enum SQL. Un `administrative_law` haría que **todos los envíos en inglés fueran rechazados con 400**.
- `hreflang` mal cruzado o unidireccional hace que Google trate las versiones como contenido duplicado y penalice ambas.
- Duplicar el contenido sin `canonical` correcto es peor que no traducir.
- Mantener dos HTML en paralelo **duplica el coste de cada cambio futuro**. Es una decisión estructural: conviene asumirla conscientemente.

## 7.7 — Contenido editorial / blog para SEO

**Cadena:**
1. `/blog/index.html` — índice de artículos
2. `/blog/<slug>.html` — un archivo por artículo
3. Cada artículo: Schema.org tipo `Article` o `BlogPosting` (**no** `LegalService`), con `author`, `datePublished`, `dateModified`
4. `sitemap.xml` — una entrada por artículo, `priority` 0.6-0.8, `lastmod` real
5. `index.html` — enlace al blog en navegación y footer
6. `css/blog.css` — tipografía de lectura larga (`--font-serif` ya es apropiada)
7. `_redirects` — verificar interacción con el catch-all
8. `robots.txt` — sin cambios, salvo que existan borradores

**Riesgo: BAJO técnicamente, ALTO en sostenibilidad.**

**Qué se puede romper:**
- **El riesgo real no es técnico.** Un blog abandonado tras 3 artículos perjudica la percepción de la firma más que no tenerlo. Antes de construirlo hay que decidir quién escribe y con qué frecuencia.
- Sin generador estático, cada artículo es HTML a mano: el `<head>` se duplica y diverge. **Al tercer o cuarto artículo conviene un script de plantillas** — algo mínimo en Node que ensamble `head` + contenido, sin introducir un framework.
- Contenido legal publicado por un bufete implica responsabilidad profesional: cada artículo debería llevar un descargo explícito de "esto no constituye asesoría legal", como ya hace el footer (`index.html:537-541`).

## 7.8 — Páginas legales (privacidad, aviso legal, términos)

**Prioridad más alta de la que sugiere su aparente trivialidad.** El sitio recopila hoy datos personales — incluidos resúmenes de casos, que son datos sensibles — y **no tiene política de privacidad**. El checkbox de consentimiento (`index.html:464-471`) pide aceptación sin enlazar a ningún documento, y el mensaje de error de la Edge Function (`index.ts:193`) dice literalmente *"Debe aceptar la política de privacidad"* — **un documento que no existe en el repositorio.**

**Cadena:**
1. `/politica-privacidad.html` — base legal, datos recabados, finalidad, plazo de conservación, encargados de tratamiento (**Supabase, Resend, Cloudflare, Netlify**), derechos ARCO y canal para ejercerlos
2. `/aviso-legal.html` — identificación de la firma, registro profesional, jurisdicción
3. `/terminos.html` — condiciones de uso (opcional, pero habitual)
4. `index.html:464-471` — **enlazar la política desde el texto del consentimiento**
5. `index.html:529-533` — enlaces en el footer
6. `sitemap.xml` — las tres URLs, `priority` 0.3
7. `_redirects` — verificar el catch-all
8. `css/main.css` — estilos de página de texto legal
9. *(Recomendado)* `supabase/migrations/` — columna `consent_version` y `consent_at` en `leads`, para poder acreditar **qué versión de la política aceptó cada persona y cuándo**

**Riesgo: BAJO técnicamente.** El contenido debe redactarlo la firma; la estructura de las páginas sí puede prepararse desde aquí.

**Qué se puede romper:**
- Técnicamente casi nada. **El riesgo es de cumplimiento, y es de exposición actual, no futura.**
- El paso 9 no es opcional en la práctica: sin registrar versión y fecha del consentimiento, no hay forma de acreditar qué se aceptó. Añadirlo más tarde deja sin cobertura a todos los leads previos.
- La política debe declarar que los datos se alojan **fuera de Panamá** (Supabase y Resend operan en infraestructura extranjera): es una transferencia internacional de datos con implicaciones bajo la Ley 81 de 2019.

## Resumen de dependencias entre extensiones

```
Rotar secretos  ─────────► (desbloquea todo lo demás con seguridad)
       │
       ├─► Arreglar SERVICE_ROLE_KEY (H-05) ──► formulario operativo
       │              │
       │              └─► 7.2 Campo nuevo en el formulario
       │                        │
       │                        └─► 7.4 Estados / columnas
       │                                  └─► 7.5 Vistas y filtros del CRM
       │
       ├─► 7.8 Páginas legales ──► requerido antes de ampliar la captación
       │
       └─► 7.3 Página nueva ──┬─► 7.6 Internacionalización
                              └─► 7.7 Blog
```

**Orden recomendado:** rotación de secretos → H-05 → 7.8 (legales) → 7.1 (secciones) → 7.6 o 7.7 según prioridad comercial.

---

# FASE 8 — Diagnóstico

## 1. Semáforo por componente

| Componente | Estado | Fundamento |
|---|---|---|
| **Git** | `[EN CÓDIGO]` | Limpio, sincronizado, sin divergencia. Sano — salvo por lo que contiene |
| **Frontend** | `[EN CÓDIGO]` con defectos | Estructura correcta; 3 enlaces WhatsApp rotos, copyright desfasado, CSS inválido |
| **Formulario** | `[SIN VERIFICAR]` — sospecha fundada de `[ROTO]` | Depende íntegramente de **H-05**. Ver checklist A1/A2 |
| **Edge Function** | `[SIN VERIFICAR]` | Código correcto y bien ordenado, pero lee una variable que ningún `.env` ni el README definen |
| **Base de datos** | `[EN CÓDIGO]` | Esquema sólido: constraints, índices, trigger, enums coherentes con el frontend |
| **RLS** | `[EN CÓDIGO]` con riesgo alto | `anon` correctamente bloqueado. `authenticated` sin restricción alguna (**H-03**); vista `lead_stats` sin `security_invoker` (**H-04**) |
| **Auth/Admin** | `[EN CÓDIGO]` con riesgo | Funcional, pero sin control de rol: cualquier usuario del proyecto entra al CRM (**H-10**) |
| **Turnstile** | `[SIN VERIFICAR]` | Integración correcta cliente y servidor. Secret comprometida (**R3**); dominios permitidos sin verificar |
| **Resend** | `[SIN VERIFICAR]` | Código correcto. Requiere dominio verificado; los fallos son silenciosos. API key comprometida (**R2**) |
| **SEO** | `[EN CÓDIGO]` | Metadatos, OG, Schema.org y sitemap sólidos. Lastrado por el soft 404 (**H-16**) y ausencia de `<main>` |
| **Responsive** | `[SIN VERIFICAR]` | Solo 2 breakpoints; el rango de tablets (481-900 px) queda poco cubierto (**H-24**) |
| **Secretos** | **`[ROTO]`** | Tres credenciales privadas de producción expuestas en repositorio público desde 2026-04-05 |

## 2. Tabla de hallazgos

| ID | Sev. | Archivo:línea | Descripción | Acción propuesta | Riesgo de tocarlo |
|---|---|---|---|---|---|
| **H-01** | **Crítica** | `.env.production:1-7` | Secretos reales de producción versionados en repo público desde el commit inicial | Rotar R1-R3, luego sacar del control de versiones y añadir a `.gitignore` | Bajo el cambio; **alto no hacerlo** |
| **H-02** | **Crítica** | `.env.example:22-31` | La "plantilla" contiene los mismos secretos reales | Sustituir por placeholders | Ninguno |
| **H-03** | **Crítica** | `001_create_leads.sql:92-102` + `config.toml` | `authenticated` con `USING(true)` para SELECT y UPDATE. Si el signup público está activo, cualquiera lee todos los leads | Verificar B1; si el signup está abierto, cerrarlo hoy. Después, restringir por rol o allowlist | Medio — puede bloquear al admin si se aplica mal |
| **H-04** | **Alta** | `001_create_leads.sql:150-158` | Vista `lead_stats` sin `security_invoker` → posible bypass de RLS | Verificar B3/B4; recrear con `WITH (security_invoker = on)` | Bajo — la vista no se usa hoy en el dashboard |
| **H-05** | **Alta** | `index.ts:302` | Lee `SERVICE_ROLE_KEY`; los `.env` y el README definen `SUPABASE_SERVICE_ROLE_KEY`. Puede estar impidiendo todo INSERT | Verificar A1/A2 primero. Alinear nombre y documentar en README | Medio — tocar mal esto tumba el formulario |
| **H-06** | **Alta** | `index.html:366,492,546,560`; `main.js:18` | Los 3 enlaces de WhatsApp rotos (falta `?` en uno, dígito truncado en dos) | Corregir número a `50766730357` y añadir el `?`. Idealmente generar los enlaces desde `CONFIG` | Bajo |
| **H-07** | **Alta** | `admin/index.html:58`; `dashboard.html:187` | SDK de Supabase desde CDN sin `integrity` (SRI), en el panel que maneja datos sensibles | Añadir SRI con versión fijada, o auto-hospedar el SDK | Bajo — requiere fijar versión exacta |
| **H-08** | **Alta** | (ausente) | Sin `netlify.toml` ni `_headers`: ninguna cabecera de seguridad versionada | Añadir `_headers` con CSP, HSTS, X-Frame-Options, Referrer-Policy | Medio — una CSP mal formada rompe Turnstile y Google Fonts |
| **H-09** | **Media** | `index.ts:11` | `Access-Control-Allow-Origin: "*"` — cualquier origen puede invocar la función | Restringir al dominio propio | Bajo, pero requiere probar en producción |
| **H-10** | **Media** | `admin-auth.js:92-99` | Sin control de rol: cualquier usuario autenticado del proyecto accede al CRM | Añadir tabla `admin_users` o custom claim, y filtrarlo en RLS | Medio |
| **H-11** | **Media** | `SECURITY_CHECKLIST.md` | Documento al 100% marcado como completo, con afirmaciones falsas (C1, C3) | Reescribir tras cerrar los hallazgos críticos | Ninguno |
| **H-12** | **Media** | `index.ts:50-58` | `sanitize()` escapa HTML **antes de guardar** → corrompe los datos en origen (p. ej. `O'Brien`) | Guardar en crudo; escapar solo al renderizar (el dashboard ya lo hace) | Medio — cambia datos existentes; requiere migración de limpieza |
| **H-13** | **Media** | `index.ts:18-33` | Rate limit en memoria: no compartido entre instancias, se pierde en cold start, nunca purga entradas | Reconocer su límite o migrar a un contador en Postgres | Bajo |
| **H-14** | **Media** | `001:139-142`; `admin-dashboard.js:249` | `changed_by` lo envía el cliente → la auditoría es falsificable | `WITH CHECK (changed_by = auth.uid())` o un trigger que lo fije | Bajo |
| **H-15** | **Media** | `index.html:49,374,378`; `index.ts:107` | Tres correos distintos entre Schema.org, `mailto:` visible y remitente | Unificar en direcciones corporativas | Bajo — pero verificar Resend antes (D1) |
| **H-16** | **Media** | `_redirects:14` | `/* /index.html 200` → toda URL inexistente devuelve 200 (soft 404) | Añadir `404.html` y cambiar la regla a `/* /404.html 404` | Bajo |
| **H-17** | **Media** | `001_create_leads.sql:10,20` | `CREATE TYPE` sin guarda → la migración no es idempotente | Envolver en `DO $$ … EXCEPTION WHEN duplicate_object` | Bajo |
| **H-18** | **Media** | `admin-dashboard.js:56` | `select('*')` sin paginación; `max_rows = 1000` truncará en silencio | Migrar a `.range()` antes de llegar a 1000 leads | Medio |
| **H-19** | **Baja** | `css/main.css:817` | `margin-right: 5;` — declaración inválida, sin efecto | **Eliminar la línea** (no convertir a `5px`) | Ninguno |
| **H-20** | **Baja** | `index.html` (global) | Sin `<main>` ni `<header>`, pese a lo que afirma `SEO_CHECKLIST.md:37` | Envolver el contenido en `<main>`; añadir skip-link | Bajo |
| **H-21** | **Baja** | `config.toml` | `minimum_password_length = 6`, `enable_confirmations = false` | Subir a 12+ y activar confirmación en producción | Bajo |
| **H-22** | **Baja** | `index.html:535` | Copyright `2025` estático, desfasado | Fijar a `2026` o inyectar `getFullYear()` | Ninguno |
| **H-23** | **Baja** | `main.js:18`; `index.html:560` | `WHATSAPP_NUMBER` definido pero nunca usado — los enlaces son estáticos | Generar los enlaces desde `CONFIG` al cargar (resuelve también H-06 de raíz) | Bajo |
| **H-24** | **Baja** | `css/main.css:1335,1500` | Solo 2 breakpoints; el rango 481-900 px queda poco cubierto | Añadir uno intermedio en 768 px tras probar en dispositivos | Bajo |
| **H-25** | **Baja** | `index.ts:339-340` | El comentario dice "non-blocking" pero la llamada está `await`-eada | Corregir el comentario, o usar `EdgeRuntime.waitUntil()` | Bajo |
| **H-26** | **Baja** | `_redirects:8` | Referencia `/404.html`, que no existe | Crear la página (junto con H-16) | Ninguno |
| **H-27** | **Baja** | `package.json:2-4` | `name: "nelsonlaw"` y descripción a nombre personal, sin rebranding a Juriscorp; `author` vacío | Actualizar metadatos | Ninguno |
| **H-28** | **Baja** | `assets/img/` | `Nav_logo.png` y `NavBar_LOGO.png` no se referencian desde ningún HTML | Confirmar y eliminar | Bajo |

**Recuento:** 3 críticas · 5 altas · 10 medias · 10 bajas.

## 3. Las 5 acciones que haría primero

### 1. Rotar las tres credenciales comprometidas (R1, R2, R3)

Primero porque es lo único **irreversible en su daño y creciente con el tiempo**. Cada día que pasa amplía la ventana de exposición, y la clave `service_role` da acceso total a los datos personales de potenciales clientes de un bufete. Nada de lo demás importa si un tercero ya tiene lectura completa de la tabla `leads`. Es una acción de panel, no requiere tocar código, y puede hacerse hoy mismo.

### 2. Verificar si el signup público de Supabase está abierto (checklist B1)

Segundo porque es una **comprobación de dos minutos con consecuencias binarias**. `authenticated` puede leer y modificar todos los leads sin restricción alguna. Si el registro está abierto, cualquiera con la clave publicable —que está en el HTML público— puede crearse una cuenta y entrar al CRM. Es un segundo camino hacia los mismos datos, independiente del anterior, y por eso no puede esperar a después de la rotación.

### 3. Verificar si el formulario funciona (checklist A1 y A2)

Tercero, y no antes, porque los dos anteriores son de contención de daño y este es de diagnóstico. Pero es **la pregunta de negocio más importante del proyecto**: si `SERVICE_ROLE_KEY` nunca se configuró, la firma lleva meses con un sitio publicado que no captó un solo lead, mostrando un error genérico a cada persona que intentó contactar. Mirar el contador de filas de `leads` y su `created_at` más reciente responde la pregunta de inmediato, sin ambigüedad.

### 4. Arreglar los tres enlaces de WhatsApp (H-06)

Cuarto porque es la **mayor recuperación de valor por esfuerzo invertido** de toda la lista: un dígito y un signo de interrogación. WhatsApp es el canal de contacto dominante en Panamá, y ahora mismo los tres puntos de entrada están rotos —incluido el botón flotante presente en toda la página y el que aparece justo tras enviar el formulario, precisamente cuando el interés del cliente es máximo. Si además el formulario resulta estar roto (acción 3), estos enlaces son literalmente el único camino de contacto que queda.

### 5. Sacar los `.env` del control de versiones y publicar la política de privacidad (H-01, H-02, 7.8)

Quinto porque cierra el ciclo abierto por la acción 1: rotar sin sanear el repositorio garantiza que el problema se repita en el siguiente despliegue. Y agrupo aquí la política de privacidad porque ambas cosas responden a la misma obligación: el sitio recoge datos sensibles hoy, pide consentimiento a una política que no existe, y su mensaje de error menciona un documento inexistente. Es la deuda de cumplimiento más visible y la más fácil de subsanar.

> Deliberadamente **no** incluyo aquí reescribir el historial de Git. Es una operación destructiva que rompe todos los clones, y su beneficio es marginal una vez que las claves están rotadas: lo que se filtró ya está fuera. Es una decisión que conviene tomar por separado, con calma y con respaldo.

## 4. Las 3 preguntas cuya respuesta no está en el código

### Pregunta 1 — ¿El sitio ha captado algún lead real desde su publicación?

No hay forma de saberlo desde el repositorio, y determina completamente la prioridad de todo lo demás. Si la tabla `leads` tiene filas recientes, **H-05** es una inconsistencia de documentación y el sistema funciona. Si está vacía o solo tiene pruebas antiguas, el sitio lleva meses sin cumplir su única función de negocio, y eso pasa a ser lo primero por encima de todo salvo la rotación de claves. La respuesta está en el Table Editor de Supabase (checklist A2), y cambia el orden de trabajo de las próximas sesiones.

### Pregunta 2 — ¿Quién debe tener acceso al panel de administración, y cuántas personas son?

El código asume implícitamente que todo usuario autenticado es administrador de confianza. Eso funciona con un único usuario, pero no escala y no distingue entre el abogado titular, un asistente, un pasante o alguien que ya no trabaja en la firma. Necesito saber cuántas personas deben entrar y si habrá niveles de acceso distintos —por ejemplo, si un asistente debe ver los resúmenes de casos o solo los datos de contacto. Sin esa respuesta no puedo diseñar el control de roles de **H-03** y **H-10**: la diferencia entre una allowlist de tres correos y un sistema de roles con permisos por campo es sustancial, y elegir mal implica rehacerlo.

### Pregunta 3 — ¿Qué correo debe ser el oficial de la firma, y está el dominio verificado en Resend?

Hay tres direcciones en circulación y ninguna evidencia de cuál es la correcta. Esto no es solo cosmético: si `juriscorppanama.com` no está verificado con SPF y DKIM en Resend, **todas las notificaciones de nuevo lead están fallando en silencio** desde el primer día —el código captura el error y sigue adelante sin avisar a nadie. En ese escenario podrían existir leads guardados correctamente en la base de datos que nunca llegaron a conocimiento de la firma. Necesito saber qué dirección es la definitiva, si el dominio está verificado, y si alguien revisa activamente ese buzón.

---

*Fin del diagnóstico. Ninguna corrección fue aplicada.*
