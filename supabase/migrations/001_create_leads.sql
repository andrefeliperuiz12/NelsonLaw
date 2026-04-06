-- ============================================================
-- Nelson Ruiz Pinilla — Lead Management Schema
-- ============================================================
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- 1. Enum Types
-- ------------------------------------------------------------

CREATE TYPE lead_status AS ENUM (
  'nuevo',
  'en_revision',
  'contactado',
  'consulta_agendada',
  'cerrado_ganado',
  'cerrado_no_ganado',
  'archivado'
);

CREATE TYPE legal_area AS ENUM (
  'derecho_administrativo',
  'derecho_tributario',
  'derecho_penal',
  'derecho_migratorio',
  'servicios_corporativos',
  'tramites_legales',
  'regularizacion_tierras',
  'asuntos_inmobiliarios',
  'poderes_registro_publico',
  'otro'
);

-- 2. Leads Table
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS leads (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  full_name       TEXT NOT NULL CHECK (length(trim(full_name)) >= 2),
  phone           TEXT NOT NULL CHECK (length(trim(phone)) >= 7),
  email           TEXT CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  legal_area      legal_area NOT NULL,
  case_summary    TEXT NOT NULL CHECK (length(trim(case_summary)) >= 10),
  source          TEXT NOT NULL DEFAULT 'web_form',
  status          lead_status NOT NULL DEFAULT 'nuevo',
  assigned_to     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  notes_internal  TEXT,
  last_contacted_at TIMESTAMPTZ,
  is_archived     BOOLEAN NOT NULL DEFAULT FALSE
);

-- 3. Indices
-- ------------------------------------------------------------

CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX idx_leads_legal_area ON leads(legal_area);
CREATE INDEX idx_leads_is_archived ON leads(is_archived);
CREATE INDEX idx_leads_source ON leads(source);

-- Full-text search index for name search
CREATE INDEX idx_leads_full_name_search
  ON leads USING gin(to_tsvector('spanish', full_name));

-- 4. Auto-update updated_at trigger
-- ------------------------------------------------------------

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 5. Row Level Security (RLS)
-- ------------------------------------------------------------
-- CRITICAL: This is the primary security layer.
-- - anon: NO access at all (public frontend cannot read leads)
-- - authenticated: Can SELECT and UPDATE (admin panel users)
-- - service_role: Can INSERT (Edge Function only)

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Authenticated users (admin panel) can read all leads
CREATE POLICY "authenticated_select_leads"
  ON leads FOR SELECT
  TO authenticated
  USING (true);

-- Authenticated users can update leads (change status, notes, etc.)
CREATE POLICY "authenticated_update_leads"
  ON leads FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Only service_role can insert (via Edge Function)
-- No INSERT policy for 'authenticated' or 'anon' roles
CREATE POLICY "service_role_insert_leads"
  ON leads FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Authenticated users can soft-delete (archive) via UPDATE, 
-- but actual DELETE is restricted to service_role only
CREATE POLICY "service_role_delete_leads"
  ON leads FOR DELETE
  TO service_role
  USING (true);

-- 6. Audit Log Table
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS lead_audit_log (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id       UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  changed_by    UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  changed_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  action        TEXT NOT NULL DEFAULT 'update',
  field_changed TEXT NOT NULL,
  old_value     TEXT,
  new_value     TEXT
);

ALTER TABLE lead_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_select_audit"
  ON lead_audit_log FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "authenticated_insert_audit"
  ON lead_audit_log FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE INDEX idx_audit_lead_id ON lead_audit_log(lead_id);
CREATE INDEX idx_audit_changed_at ON lead_audit_log(changed_at DESC);

-- 7. Helper view for dashboard stats
-- ------------------------------------------------------------

CREATE OR REPLACE VIEW lead_stats AS
SELECT
  status,
  count(*) as total,
  count(*) FILTER (WHERE created_at >= now() - interval '7 days') as last_7_days,
  count(*) FILTER (WHERE created_at >= now() - interval '30 days') as last_30_days
FROM leads
WHERE is_archived = false
GROUP BY status;
