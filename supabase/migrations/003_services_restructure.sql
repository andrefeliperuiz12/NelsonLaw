-- ============================================================
-- Juriscorp S.C. — Reestructuración de servicios del formulario
-- ============================================================
-- Migración 003. NO modifica la 001 ni la 002. Es aditiva: no borra valores,
-- columnas ni filas, y todas las filas existentes siguen siendo válidas.
--
-- Contexto: el sitio reorganiza su oferta en seis servicios y el formulario
-- pide ahora país, si hay una notificación o fecha límite, y acepta correo
-- O WhatsApp (antes el teléfono era obligatorio).
--
-- ORDEN DE PUBLICACIÓN (no alterarlo):
--   1. Aplicar ESTA migración en el SQL Editor de Supabase.
--   2. Desplegar la Edge Function submit-lead nueva (escribe estas columnas).
--   3. Publicar el sitio nuevo (envía los valores nuevos del enum).
-- La función nueva acepta también los valores antiguos, así que el sitio
-- publicado sigue funcionando entre el paso 2 y el 3.
-- ============================================================

-- 1. Servicios nuevos
-- ------------------------------------------------------------
-- ADD VALUE no puede deshacerse con un simple DROP, pero tampoco rompe nada:
-- un valor que nadie usa no afecta a las filas. Los valores antiguos se
-- conservan porque hay leads históricos que los usan.
-- En Postgres 12+ puede ejecutarse dentro de una transacción siempre que el
-- valor nuevo no se USE en esa misma transacción; aquí no se usa.

ALTER TYPE legal_area ADD VALUE IF NOT EXISTS 'residencia_migracion';
ALTER TYPE legal_area ADD VALUE IF NOT EXISTS 'permisos_trabajo';
ALTER TYPE legal_area ADD VALUE IF NOT EXISTS 'relocalizacion_legal';
ALTER TYPE legal_area ADD VALUE IF NOT EXISTS 'contratos_empresas_inmuebles';
ALTER TYPE legal_area ADD VALUE IF NOT EXISTS 'administrativo_tributario';
ALTER TYPE legal_area ADD VALUE IF NOT EXISTS 'constitucional_contencioso';

-- 2. Datos de clasificación de la consulta
-- ------------------------------------------------------------
-- Todas nullable: las filas existentes quedan en NULL, que es la verdad
-- (nunca se preguntó).

ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS client_country TEXT
    CHECK (client_country IS NULL OR length(client_country) BETWEEN 2 AND 100),
  ADD COLUMN IF NOT EXISTS has_deadline TEXT
    CHECK (has_deadline IS NULL OR has_deadline IN ('si', 'no', 'no_seguro')),
  ADD COLUMN IF NOT EXISTS deadline_date DATE;

COMMENT ON COLUMN leads.client_country IS
  'País donde se encuentra quien consulta, tal como lo escribió. Sirve para prever qué puede gestionarse a distancia.';
COMMENT ON COLUMN leads.has_deadline IS
  'Respuesta a "¿Tiene una notificación, resolución o fecha límite?": si | no | no_seguro.';
COMMENT ON COLUMN leads.deadline_date IS
  'Fecha límite indicada por quien consulta, sólo si respondió "si". No es un cómputo de plazo.';

-- 3. Contacto: correo O teléfono
-- ------------------------------------------------------------
-- El CHECK de longitud de phone de la 001 sigue vigente y admite NULL (un
-- CHECK sobre NULL no falla). La restricción nueva impide filas sin ningún
-- medio de contacto. Todas las filas existentes tienen teléfono, así que la
-- validación al crearla no puede fallar.

ALTER TABLE leads ALTER COLUMN phone DROP NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'leads_contact_present'
  ) THEN
    ALTER TABLE leads
      ADD CONSTRAINT leads_contact_present CHECK (phone IS NOT NULL OR email IS NOT NULL);
  END IF;
END $$;

-- ============================================================
-- Verificación tras aplicar
-- ------------------------------------------------------------
--   SELECT unnest(enum_range(NULL::legal_area));
--
--   SELECT column_name, is_nullable, data_type
--     FROM information_schema.columns
--    WHERE table_name = 'leads'
--      AND column_name IN ('phone', 'client_country', 'has_deadline', 'deadline_date');
--
--   SELECT conname FROM pg_constraint WHERE conname = 'leads_contact_present';
--
-- Reversión (sólo si aún no hay filas que usen lo nuevo):
--   ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_contact_present;
--   ALTER TABLE leads ALTER COLUMN phone SET NOT NULL;   -- falla si hay filas sin teléfono
--   ALTER TABLE leads DROP COLUMN IF EXISTS deadline_date,
--                     DROP COLUMN IF EXISTS has_deadline,
--                     DROP COLUMN IF EXISTS client_country;
--   Los valores del enum no se retiran: no estorban y retirarlos exige
--   recrear el tipo.
-- ============================================================
