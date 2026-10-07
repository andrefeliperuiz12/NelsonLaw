-- ============================================================
-- Juriscorp S.C. — Contador anónimo de contactos y origen de visitas
-- ============================================================
-- Migración 004. Aditiva: crea objetos nuevos y no toca leads.
--
-- Para saber de dónde vienen los clientes sin rastrear a nadie: se cuentan
-- clics en WhatsApp, teléfono y correo, consultas enviadas y visitas que entran
-- al sitio, agregados POR DÍA. No hay IP, ni navegador, ni identificador, ni
-- hora: una fila es "tantos clics en WhatsApp, tal día, en tal página, de
-- visitas que llegaron desde tal dominio". Ver supabase/functions/track-event.
--
-- ORDEN: aplicar esta migración, desplegar track-event y después el sitio.
-- Si el sitio sale antes, los envíos fallan en silencio y no se cuentan; no
-- rompe nada para el visitante.
-- ============================================================

-- 1. Tabla de contadores
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS site_event_counts (
  day         DATE    NOT NULL,
  event_type  TEXT    NOT NULL CHECK (event_type IN
                ('landing', 'whatsapp_click', 'phone_click', 'email_click', 'form_submit')),
  page_path   TEXT    NOT NULL CHECK (page_path ~ '^/[a-z0-9/-]{0,100}$'),
  placement   TEXT    NOT NULL CHECK (placement IN
                ('none', 'float', 'contact', 'cta', 'success', 'form', 'footer', 'other')),
  lang        TEXT    NOT NULL CHECK (lang IN ('es', 'en')),
  -- Lista CERRADA, igual que KNOWN_SOURCES en track-event/validation.ts: un
  -- dominio o utm que no esté aquí se guarda como 'otros', nunca tal cual
  -- (podría ser personal o servir de identificador).
  source      TEXT    NOT NULL CHECK (source IN (
                'chatgpt.com', 'perplexity.ai', 'claude.ai', 'gemini.google.com',
                'copilot.microsoft.com', 'meta.ai', 'grok.com', 'deepseek.com', 'mistral.ai',
                'google', 'bing.com', 'duckduckgo.com', 'yahoo.com', 'ecosia.org', 'brave.com',
                'facebook.com', 'instagram.com', 'linkedin.com', 'x.com', 'youtube.com',
                'tiktok.com', 'whatsapp', 'directo', 'interno', 'otros')),
  total       INTEGER NOT NULL DEFAULT 0 CHECK (total >= 0),
  PRIMARY KEY (day, event_type, page_path, placement, lang, source)
);

COMMENT ON TABLE site_event_counts IS
  'Contadores diarios anónimos de visitas de entrada y clics de contacto. Sin datos personales.';
COMMENT ON COLUMN site_event_counts.source IS
  'Origen clasificado en una lista cerrada (chatgpt.com, google, facebook.com...), "otros" para el resto, "directo" si no hubo origen o "interno" si se llegó desde otra página del sitio.';

CREATE INDEX IF NOT EXISTS idx_site_event_counts_day ON site_event_counts (day DESC);

-- 2. Acceso
-- ------------------------------------------------------------
-- anon: nada. authenticated (panel): sólo lectura. Escritura únicamente a
-- través de record_site_event(), que sólo puede ejecutar service_role (la
-- Edge Function).

ALTER TABLE site_event_counts ENABLE ROW LEVEL SECURITY;

-- Supabase concede por defecto todos los privilegios sobre tablas nuevas de
-- public a anon y authenticated (incluido TRUNCATE, que la RLS no cubre). Se
-- retiran y se deja sólo la lectura al panel.
REVOKE ALL ON site_event_counts FROM anon, authenticated;
GRANT SELECT ON site_event_counts TO authenticated;

DROP POLICY IF EXISTS "authenticated_select_site_event_counts" ON site_event_counts;
CREATE POLICY "authenticated_select_site_event_counts"
  ON site_event_counts FOR SELECT
  TO authenticated
  USING (true);

-- 3. Sumar un evento
-- ------------------------------------------------------------
-- El día se calcula en hora de Panamá. INSERT … ON CONFLICT hace la suma
-- atómica: dos clics simultáneos no se pisan.

CREATE OR REPLACE FUNCTION record_site_event(
  p_event_type TEXT,
  p_page_path  TEXT,
  p_placement  TEXT,
  p_lang       TEXT,
  p_source     TEXT
) RETURNS VOID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  INSERT INTO site_event_counts (day, event_type, page_path, placement, lang, source, total)
  VALUES ((now() AT TIME ZONE 'America/Panama')::date,
          p_event_type, p_page_path, p_placement, p_lang, p_source, 1)
  ON CONFLICT (day, event_type, page_path, placement, lang, source)
  DO UPDATE SET total = site_event_counts.total + 1;
$$;

REVOKE ALL ON FUNCTION record_site_event(TEXT, TEXT, TEXT, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION record_site_event(TEXT, TEXT, TEXT, TEXT, TEXT) TO service_role;

-- 4. Resumen para el panel
-- ------------------------------------------------------------
-- Agrega en el servidor: el panel no descarga filas sueltas (y no choca con
-- max_rows = 1000). SECURITY INVOKER: respeta la RLS de quien llama, así que
-- sólo devuelve algo a usuarios autenticados.

CREATE OR REPLACE FUNCTION site_event_totals(p_days INTEGER DEFAULT 30)
RETURNS TABLE (event_type TEXT, source TEXT, page_path TEXT, placement TEXT, total BIGINT)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
  SELECT event_type, source, page_path, placement, SUM(total)::BIGINT
    FROM site_event_counts
   WHERE day > (now() AT TIME ZONE 'America/Panama')::date - LEAST(GREATEST(p_days, 1), 366)
   GROUP BY event_type, source, page_path, placement
   ORDER BY SUM(total) DESC
   LIMIT 1000;
$$;

REVOKE ALL ON FUNCTION site_event_totals(INTEGER) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION site_event_totals(INTEGER) TO authenticated;

-- ============================================================
-- Verificación tras aplicar
-- ------------------------------------------------------------
--   SELECT * FROM site_event_counts ORDER BY day DESC LIMIT 20;
--   SELECT * FROM site_event_totals(30);          -- desde el panel
--
-- Reversión:
--   DROP FUNCTION IF EXISTS site_event_totals(INTEGER);
--   DROP FUNCTION IF EXISTS record_site_event(TEXT, TEXT, TEXT, TEXT, TEXT);
--   DROP TABLE IF EXISTS site_event_counts;
-- ============================================================
