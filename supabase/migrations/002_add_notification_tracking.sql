-- ============================================================
-- Juriscorp S.C. — Seguimiento del estado de notificación
-- ============================================================
-- Migración 002. NO modifica la 001.
--
-- Contexto: hasta ahora, si Resend rechazaba un correo la Edge Function
-- solo escribía en consola (submit-lead/index.ts:142-149) y devolvía
-- éxito igualmente. No quedaba rastro persistente de qué leads se habían
-- notificado, así que un fallo era invisible e irrecuperable.
--
-- Estas columnas hacen que el estado de notificación viva junto al lead.
--
-- Aplicar ANTES de desplegar la nueva versión de submit-lead.
-- ============================================================

-- 1. Columnas de estado
-- ------------------------------------------------------------
-- Todas con DEFAULT o nullable: seguras sobre las filas existentes,
-- sin reescritura de tabla (Postgres 11+ añade la columna en el catálogo).
-- Las filas previas quedan como notification_sent = FALSE, que es
-- exactamente la verdad: nunca se notificaron.

ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS notification_sent     BOOLEAN     NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS notification_sent_at  TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS notification_error    TEXT,
  ADD COLUMN IF NOT EXISTS notification_attempts INTEGER     NOT NULL DEFAULT 0;

COMMENT ON COLUMN leads.notification_sent IS
  'TRUE si el correo de notificación se envió correctamente a Resend.';
COMMENT ON COLUMN leads.notification_sent_at IS
  'Momento del envío correcto. NULL si nunca se logró enviar.';
COMMENT ON COLUMN leads.notification_error IS
  'Último error de envío, truncado a 500 caracteres. Solo diagnóstico técnico: no debe contener datos personales del lead.';
COMMENT ON COLUMN leads.notification_attempts IS
  'Número de intentos de envío. Lo usa el barrido de reintentos para no agotar la cuota de Resend.';

-- 2. Índice parcial para el barrido de pendientes
-- ------------------------------------------------------------
-- Solo indexa las filas sin notificar. En operación normal esa lista
-- está vacía o casi, así que el índice ocupa prácticamente nada y hace
-- que buscar pendientes sea inmediato sin escanear la tabla entera.

CREATE INDEX IF NOT EXISTS idx_leads_notification_pending
  ON leads (created_at)
  WHERE notification_sent = FALSE;

-- ============================================================
-- Nota sobre RLS
-- ------------------------------------------------------------
-- Las columnas nuevas heredan las políticas de `leads` definidas en 001.
-- La Edge Function actualiza estas columnas con la clave service_role,
-- que tiene BYPASSRLS en Postgres: no necesita una política UPDATE propia
-- (la 001 solo le concede INSERT y DELETE, y aun así el UPDATE funciona).
--
-- Los usuarios `authenticated` del panel pueden leerlas y escribirlas a
-- través de las políticas existentes, que son USING(true). Eso forma parte
-- del hallazgo H-03 del diagnóstico y se aborda por separado.
-- ============================================================

-- ============================================================
-- Verificación tras aplicar
-- ------------------------------------------------------------
--   SELECT column_name, data_type, is_nullable, column_default
--     FROM information_schema.columns
--    WHERE table_name = 'leads'
--      AND column_name LIKE 'notification%'
--    ORDER BY ordinal_position;
--
--   SELECT count(*) FILTER (WHERE notification_sent) AS notificados,
--          count(*) FILTER (WHERE NOT notification_sent) AS pendientes
--     FROM leads;
-- ============================================================
