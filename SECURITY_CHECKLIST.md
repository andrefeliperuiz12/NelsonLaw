# Checklist de Seguridad — Nelson Ruiz Pinilla

## Protección de Datos

- [x] **Tabla `leads` no expuesta públicamente**: El rol `anon` no tiene permisos de lectura ni escritura
- [x] **RLS activado**: Row Level Security habilitado en tabla `leads` y `lead_audit_log`
- [x] **INSERT solo vía service_role**: Solo la Edge Function (con clave privada) puede insertar leads
- [x] **SELECT/UPDATE solo para authenticated**: Solo usuarios logueados en el panel pueden ver/modificar leads
- [x] **Frontend público NO consulta leads**: El formulario envía datos a la Edge Function, nunca lee de la tabla

## Validación y Sanitización

- [x] **Validación frontend**: Campos requeridos, formato de email, longitud mínima
- [x] **Validación backend (Edge Function)**: Todos los campos re-validados server-side
- [x] **Sanitización de inputs**: HTML entities escapadas para prevenir XSS
- [x] **Longitud máxima**: Campos truncados a 2000 caracteres
- [x] **Validación de enum**: `legal_area` validada contra lista permitida
- [x] **Constraints en DB**: CHECKs en tabla para longitud mínima y formato de email

## Anti-Spam y Anti-Bot

- [x] **Cloudflare Turnstile integrado**: Widget en formulario
- [x] **Verificación server-side de Turnstile**: Token validado contra API de Cloudflare en la Edge Function
- [x] **Rate limiting**: Máximo 5 requests por IP por minuto en la Edge Function
- [x] **Token single-use**: Turnstile tokens se resetean después de cada envío

## Autenticación

- [x] **Supabase Auth**: Login con email/password para el panel
- [x] **Protección de rutas**: Redirect automático si no autenticado
- [x] **Session management**: Manejo de sesiones vía Supabase SDK
- [x] **Solo usuarios pre-creados**: No hay registro público — usuarios se crean manualmente

## Secretos y Configuración

- [x] **Variables de entorno**: Todas las claves en environment variables de Supabase
- [x] **No hay secretos en frontend**: Solo `anon key` (que es público por diseño) y `site key` de Turnstile
- [x] **service_role key nunca en frontend**: Solo accesible en la Edge Function
- [x] **`.env.example` sin valores reales**: Template para referencia

## Comunicación Segura

- [x] **No datos sensibles en URLs**: No se envía `case_summary` por query string
- [x] **WhatsApp sin datos del caso**: El botón post-éxito no envía información del caso
- [x] **Email sin resumen del caso**: La notificación por email no incluye el `case_summary` (solo visible en el panel)
- [x] **HTTPS**: Forzado por el hosting (Netlify/Cloudflare Pages)

## Logging y Errores

- [x] **Errores logueados server-side**: `console.error` en la Edge Function para debugging
- [x] **No información sensible en logs**: Los mensajes de error no exponen datos del lead
- [x] **Mensajes de error genéricos al usuario**: No se expone la causa técnica del error
- [x] **Auditoría de cambios**: Tabla `lead_audit_log` registra cambios a leads

## Recomendaciones Adicionales

- [ ] **Activar 2FA** para los usuarios del panel en Supabase Auth (cuando esté disponible)
- [ ] **Revisar logs** de la Edge Function periódicamente
- [ ] **Backup de base de datos**: Configurar backups automáticos en Supabase (Plan Pro incluye point-in-time recovery)
- [ ] **Monitorear rate limiting**: Verificar si el límite de 5/min es adecuado
- [ ] **Cifrado del `case_summary`**: Considerar cifrado a nivel aplicación si el caso lo requiere
