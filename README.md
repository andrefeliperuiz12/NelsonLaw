# Juriscorp S.C. — Sitio Web Legal

## Descripción

Sitio web institucional para el abogado Nelson Ruiz Pinilla, basado en Ciudad de Panamá. Incluye landing pública de captación de leads, formulario seguro con Cloudflare Turnstile, panel administrativo interno (CRM ligero), y notificaciones por email.

## Stack Tecnológico

| Componente | Tecnología |
|---|---|
| Frontend | HTML / CSS / JavaScript (vanilla) |
| Backend | Supabase (PostgreSQL + Auth + Edge Functions) |
| Anti-spam | Cloudflare Turnstile |
| Email | Resend API |
| Hosting | Netlify / Cloudflare Pages |

## Estructura del Proyecto

```
NelsonLaw/
├── index.html                    # Landing pública
├── admin/
│   ├── index.html                # Login del panel
│   └── dashboard.html            # Panel CRM interno
├── css/
│   ├── main.css                  # Estilos de la landing
│   └── admin.css                 # Estilos del panel
├── js/
│   ├── main.js                   # Lógica landing
│   ├── admin-auth.js             # Autenticación
│   └── admin-dashboard.js        # Lógica del CRM
├── assets/img/                   # Imágenes
├── supabase/
│   ├── migrations/               # Schema SQL
│   └── functions/submit-lead/    # Edge Function
├── robots.txt
├── sitemap.xml
├── .env.example
└── README.md
```

## Setup — Paso a Paso

### 1. Crear proyecto en Supabase

1. Ir a [supabase.com](https://supabase.com) → New Project
2. Anotar: `Project URL`, `anon key`, `service_role key`
3. En SQL Editor, ejecutar el contenido de `supabase/migrations/001_create_leads.sql`

### 2. Crear usuarios administrativos

En Supabase Dashboard → Authentication → Users → Add User:
- Email del abogado + contraseña
- Email del hijo + contraseña

### 3. Configurar Cloudflare Turnstile

1. Ir a [dash.cloudflare.com](https://dash.cloudflare.com) → Turnstile
2. Add Site → obtener `Site Key` y `Secret Key`
3. En `index.html`, reemplazar `YOUR_TURNSTILE_SITE_KEY` con el Site Key

### 4. Configurar Resend

1. Ir a [resend.com](https://resend.com) → API Keys → Create
2. Verificar dominio (si tienes dominio propio)
3. Anotar el API Key

### 5. Deploy de la Edge Function

```bash
# La CLI de Supabase ya está declarada en devDependencies.
# Supabase NO soporta instalarla globalmente con npm; se invoca con npx.
npm install

# Login (abre el navegador y pide un código de verificación)
npx supabase login

# Link al proyecto (pide la contraseña de la base de datos)
npx supabase link --project-ref azraryuqcqibppexuiwi

# Configurar secretos. Los valores van SIN comillas y sin espacios alrededor
# del "=". Ver .env.example para la descripción de cada uno.
npx supabase secrets set CLOUDFLARE_TURNSTILE_SECRET=...
npx supabase secrets set RESEND_API_KEY=...
npx supabase secrets set NOTIFICATION_EMAIL=...
npx supabase secrets set SITE_URL=https://juriscorppanama.com

# Remitente de las notificaciones. El dominio debe estar VERIFICADO en Resend.
# Un subdominio verificado NO cubre el dominio raíz: send.juriscorppanama.com
# y juriscorppanama.com son dominios distintos para Resend.
npx supabase secrets set RESEND_FROM=...

# SIN el prefijo SUPABASE_: está reservado por la plataforma y la CLI rechaza
# cualquier secreto que lo lleve. Por eso la función lee SERVICE_ROLE_KEY.
npx supabase secrets set SERVICE_ROLE_KEY=...

# Deploy. Lee supabase/config.toml, que fija verify_jwt = false para esta
# función: es un endpoint público y el gateway debe dejar pasar peticiones
# sin autenticar. No lo cambies sin leer el comentario de ese archivo.
npx supabase functions deploy submit-lead
```

> **Antes del primer deploy tras un cambio de esquema:** aplica las migraciones
> pendientes en el SQL Editor de Supabase. La función escribe en columnas que
> deben existir previamente, o fallará al registrar el estado de notificación.

### 6. Configurar el frontend

En `index.html`, actualizar el bloque `NELSON_CONFIG`:
```javascript
window.NELSON_CONFIG = {
  EDGE_FUNCTION_URL: 'https://azraryuqcqibppexuiwi.supabase.co/functions/v1/submit-lead',
  TURNSTILE_SITE_KEY: 'YOUR_SITE_KEY',
  WHATSAPP_NUMBER: '50766730357',
};
```

En `admin/index.html` y `admin/dashboard.html`, actualizar `ADMIN_CONFIG`:
```javascript
window.ADMIN_CONFIG = {
  SUPABASE_URL: 'https://azraryuqcqibppexuiwi.supabase.co',
  SUPABASE_ANON_KEY: 'sb_publishable_bap-iRt1yLp0kGJjXv3d9Q_n6dz6BDz',
};
```

### 7. Deploy del sitio

**Opción A: Netlify**
1. Crear repositorio en GitHub
2. Push del código
3. Netlify → New Site → Import from Git
4. Build command: (vacío, es HTML estático)
5. Publish directory: `.` (raíz)

**Opción B: Cloudflare Pages**
1. Cloudflare Dashboard → Pages → Create
2. Connect to Git → seleccionar repositorio
3. Framework preset: None
4. Build output directory: `.`

### 8. Configurar dominio

1. En el servicio de hosting, agregar custom domain: `juriscorppanama.com`
2. Actualizar DNS del dominio para apuntar al hosting

## Variables de Entorno

Ver `.env.example` para la lista completa. Nunca commitear valores reales.

## Seguridad

Ver `SECURITY_CHECKLIST.md` para el checklist completo de seguridad.

## SEO

Ver `SEO_CHECKLIST.md` para el checklist SEO implementado.

## Operación Diaria

Ver `OPERATIONS_GUIDE.md` para la guía de uso del panel.
