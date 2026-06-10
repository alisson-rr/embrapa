-- ============================================================
-- RESTAURAÇÃO DO SCHEMA BASE (extraído do db_cluster-27-10-2025)
-- ============================================================
-- Como usar:
--   1. Crie um projeto NOVO no Supabase.
--   2. Abra o SQL Editor desse projeto.
--   3. Cole TODO este arquivo e execute (RUN).
--   4. Depois, execute na ordem os outros arquivos de migração
--      (veja o final deste arquivo).
--
-- Observação: o backup original era um pg_dumpall (cluster dump) com
-- comandos do psql (\restrict, \connect...) e os schemas internos do
-- Supabase, que NÃO podem ser colados no SQL Editor. Os dados das
-- tabelas estavam todos vazios, então aqui restauramos apenas a
-- ESTRUTURA do schema public (tabelas, funções, RLS, índices).
-- ============================================================

-- ------------------------------------------------------------
-- FUNÇÕES
-- ------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.calculate_sustainability_indices(form_id uuid)
RETURNS TABLE(economic_index integer, social_index integer, environmental_index integer, sustainability_index integer)
    LANGUAGE plpgsql
    AS $$
DECLARE
  eco_idx INTEGER := 0;
  soc_idx INTEGER := 0;
  env_idx INTEGER := 0;
  sus_idx INTEGER := 0;
BEGIN
  -- Índice econômico
  SELECT CASE
           WHEN gross_income > 100000 THEN 80
           WHEN gross_income > 50000  THEN 60
           ELSE 40
         END
    INTO eco_idx
  FROM economic_data ed
  WHERE ed.form_id = calculate_sustainability_indices.form_id
  LIMIT 1;

  -- Índice social
  SELECT CASE
           WHEN permanent_employees > 10 THEN 70
           WHEN permanent_employees > 5  THEN 55
           ELSE 40
         END
    INTO soc_idx
  FROM social_data sd
  WHERE sd.form_id = calculate_sustainability_indices.form_id
  LIMIT 1;

  -- Índice ambiental
  SELECT CASE
           WHEN organic_matter_percentage > 3 THEN 60
           WHEN organic_matter_percentage > 2 THEN 40
           ELSE 20
         END
    INTO env_idx
  FROM environmental_data ev
  WHERE ev.form_id = calculate_sustainability_indices.form_id
  LIMIT 1;

  -- Índice geral (média ponderada)
  sus_idx := (eco_idx * 0.33 + soc_idx * 0.33 + env_idx * 0.34)::INTEGER;

  -- Atualiza o formulário
  UPDATE forms
     SET economic_index = eco_idx,
         social_index = soc_idx,
         environmental_index = env_idx,
         sustainability_index = sus_idx,
         status = 'processed',
         updated_at = NOW()
   WHERE id = calculate_sustainability_indices.form_id;

  RETURN QUERY SELECT eco_idx, soc_idx, env_idx, sus_idx;
END;
$$;

-- ------------------------------------------------------------
-- TABELAS
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.forms (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    user_id uuid,
    status character varying(20) DEFAULT 'draft'::character varying,
    sustainability_index integer,
    economic_index integer,
    social_index integer,
    environmental_index integer,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    submitted_at timestamp with time zone
);

CREATE TABLE IF NOT EXISTS public.personal_data (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    form_id uuid NOT NULL,
    name character varying(255) NOT NULL,
    age integer,
    occupation character varying(100),
    education character varying(100),
    years_in_agriculture integer,
    created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.property_data (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    form_id uuid NOT NULL,
    property_name character varying(255),
    municipality character varying(100),
    state character varying(2),
    total_area numeric(10,2),
    production_area numeric(10,2),
    permanent_protection_area numeric(10,2),
    legal_reserve_area numeric(10,2),
    activity_types text[],
    integration_system_type character varying(100),
    livestock_type character varying(100),
    production_system character varying(100),
    system_usage_time integer,
    daily_description text,
    pasture_types text[],
    use_silage boolean,
    silage_hectares numeric(10,2),
    created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.economic_data (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    form_id uuid NOT NULL,
    gross_income numeric(15,2),
    financing_percentage numeric(5,2),
    production_cost numeric(15,2),
    property_value numeric(15,2),
    management_system character varying(100),
    created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.social_data (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    form_id uuid NOT NULL,
    permanent_employees integer,
    highest_education_employee character varying(100),
    highest_salary numeric(10,2),
    lowest_education_employee character varying(100),
    lowest_salary numeric(10,2),
    family_members integer,
    family_members_level character varying(100),
    technical_assistance boolean,
    created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.environmental_data (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    form_id uuid NOT NULL,
    organic_matter_percentage numeric(5,2),
    calcium_quantity numeric(10,2),
    monthly_fuel_consumption numeric(10,2),
    monthly_electricity_expense numeric(10,2),
    created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.cultures_data (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    environmental_data_id uuid NOT NULL,
    culture_name character varying(100),
    area_hectares numeric(10,2),
    nitrogen_fertilizer numeric(10,2),
    phosphate_fertilizer numeric(10,2),
    potassium_fertilizer numeric(10,2),
    limestone numeric(10,2),
    gypsum numeric(10,2),
    urea numeric(10,2),
    created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.pastures_data (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    environmental_data_id uuid NOT NULL,
    pasture_name character varying(100),
    area_hectares numeric(10,2),
    condition character varying(20),
    created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.livestock_data (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    property_data_id uuid NOT NULL,
    cattle_count integer,
    heifer_count integer,
    bull_count integer,
    calf_count integer,
    bull_calf_count integer,
    cattle_weight numeric(10,2),
    heifer_weight numeric(10,2),
    bull_weight numeric(10,2),
    calf_weight numeric(10,2),
    bull_calf_weight numeric(10,2),
    heifer_weight_gain numeric(10,2),
    bull_weight_gain numeric(10,2),
    calf_weight_gain numeric(10,2),
    cattle_digestibility numeric(5,2),
    heifer_digestibility numeric(5,2),
    bull_digestibility numeric(5,2),
    calf_digestibility numeric(5,2),
    bull_calf_digestibility numeric(5,2),
    pregnancy_rate numeric(5,2),
    cattle_confinement numeric(5,2),
    heifer_confinement numeric(5,2),
    bull_confinement numeric(5,2),
    calf_confinement numeric(5,2),
    bull_calf_confinement numeric(5,2),
    cattle_pasture numeric(5,2),
    heifer_pasture numeric(5,2),
    bull_pasture numeric(5,2),
    calf_pasture numeric(5,2),
    bull_calf_pasture numeric(5,2),
    created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.profiles (
    user_id uuid NOT NULL PRIMARY KEY,
    name text NOT NULL,
    email text,
    phone text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT profiles_email_unique UNIQUE (email)
);

-- ------------------------------------------------------------
-- FOREIGN KEYS
-- ------------------------------------------------------------

ALTER TABLE ONLY public.forms
    DROP CONSTRAINT IF EXISTS forms_user_id_fkey;
ALTER TABLE ONLY public.forms
    ADD CONSTRAINT forms_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);

ALTER TABLE ONLY public.personal_data
    DROP CONSTRAINT IF EXISTS personal_data_form_id_fkey;
ALTER TABLE ONLY public.personal_data
    ADD CONSTRAINT personal_data_form_id_fkey FOREIGN KEY (form_id) REFERENCES public.forms(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.property_data
    DROP CONSTRAINT IF EXISTS property_data_form_id_fkey;
ALTER TABLE ONLY public.property_data
    ADD CONSTRAINT property_data_form_id_fkey FOREIGN KEY (form_id) REFERENCES public.forms(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.economic_data
    DROP CONSTRAINT IF EXISTS economic_data_form_id_fkey;
ALTER TABLE ONLY public.economic_data
    ADD CONSTRAINT economic_data_form_id_fkey FOREIGN KEY (form_id) REFERENCES public.forms(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.social_data
    DROP CONSTRAINT IF EXISTS social_data_form_id_fkey;
ALTER TABLE ONLY public.social_data
    ADD CONSTRAINT social_data_form_id_fkey FOREIGN KEY (form_id) REFERENCES public.forms(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.environmental_data
    DROP CONSTRAINT IF EXISTS environmental_data_form_id_fkey;
ALTER TABLE ONLY public.environmental_data
    ADD CONSTRAINT environmental_data_form_id_fkey FOREIGN KEY (form_id) REFERENCES public.forms(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.cultures_data
    DROP CONSTRAINT IF EXISTS cultures_data_environmental_data_id_fkey;
ALTER TABLE ONLY public.cultures_data
    ADD CONSTRAINT cultures_data_environmental_data_id_fkey FOREIGN KEY (environmental_data_id) REFERENCES public.environmental_data(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.pastures_data
    DROP CONSTRAINT IF EXISTS pastures_data_environmental_data_id_fkey;
ALTER TABLE ONLY public.pastures_data
    ADD CONSTRAINT pastures_data_environmental_data_id_fkey FOREIGN KEY (environmental_data_id) REFERENCES public.environmental_data(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.livestock_data
    DROP CONSTRAINT IF EXISTS livestock_data_property_data_id_fkey;
ALTER TABLE ONLY public.livestock_data
    ADD CONSTRAINT livestock_data_property_data_id_fkey FOREIGN KEY (property_data_id) REFERENCES public.property_data(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.profiles
    DROP CONSTRAINT IF EXISTS profiles_user_id_fkey;
ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- ------------------------------------------------------------
-- ÍNDICES
-- ------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_forms_created_at ON public.forms USING btree (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_forms_status ON public.forms USING btree (status);
CREATE INDEX IF NOT EXISTS idx_forms_sustainability_index ON public.forms USING btree (sustainability_index);
CREATE INDEX IF NOT EXISTS idx_forms_user_id ON public.forms USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_property_data_municipality ON public.property_data USING btree (municipality);
CREATE INDEX IF NOT EXISTS idx_property_data_state ON public.property_data USING btree (state);

-- ------------------------------------------------------------
-- TRIGGER (updated_at automático em forms)
-- ------------------------------------------------------------

DROP TRIGGER IF EXISTS update_forms_updated_at ON public.forms;
CREATE TRIGGER update_forms_updated_at BEFORE UPDATE ON public.forms
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ------------------------------------------------------------
-- ROW LEVEL SECURITY
-- ------------------------------------------------------------

ALTER TABLE public.forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personal_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.economic_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.environmental_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cultures_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pastures_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.livestock_data ENABLE ROW LEVEL SECURITY;

-- forms
DROP POLICY IF EXISTS forms_select_own_or_public ON public.forms;
CREATE POLICY forms_select_own_or_public ON public.forms FOR SELECT
    USING (((auth.uid() = user_id) OR (user_id IS NULL)));

DROP POLICY IF EXISTS forms_insert_own_or_public ON public.forms;
CREATE POLICY forms_insert_own_or_public ON public.forms FOR INSERT
    WITH CHECK (((auth.uid() = user_id) OR (user_id IS NULL)));

DROP POLICY IF EXISTS forms_update_own_or_public ON public.forms;
CREATE POLICY forms_update_own_or_public ON public.forms FOR UPDATE
    USING (((auth.uid() = user_id) OR (user_id IS NULL)));

DROP POLICY IF EXISTS forms_delete_own ON public.forms;
CREATE POLICY forms_delete_own ON public.forms FOR DELETE
    USING ((auth.uid() = user_id));

-- personal_data
DROP POLICY IF EXISTS personal_data_crud_by_form_owner ON public.personal_data;
CREATE POLICY personal_data_crud_by_form_owner ON public.personal_data
    USING ((EXISTS ( SELECT 1 FROM public.forms f
        WHERE ((f.id = personal_data.form_id) AND ((f.user_id = auth.uid()) OR (f.user_id IS NULL))))))
    WITH CHECK ((EXISTS ( SELECT 1 FROM public.forms f
        WHERE ((f.id = personal_data.form_id) AND ((f.user_id = auth.uid()) OR (f.user_id IS NULL))))));

-- property_data
DROP POLICY IF EXISTS property_data_crud_by_form_owner ON public.property_data;
CREATE POLICY property_data_crud_by_form_owner ON public.property_data
    USING ((EXISTS ( SELECT 1 FROM public.forms f
        WHERE ((f.id = property_data.form_id) AND ((f.user_id = auth.uid()) OR (f.user_id IS NULL))))))
    WITH CHECK ((EXISTS ( SELECT 1 FROM public.forms f
        WHERE ((f.id = property_data.form_id) AND ((f.user_id = auth.uid()) OR (f.user_id IS NULL))))));

-- economic_data
DROP POLICY IF EXISTS economic_data_crud_by_form_owner ON public.economic_data;
CREATE POLICY economic_data_crud_by_form_owner ON public.economic_data
    USING ((EXISTS ( SELECT 1 FROM public.forms f
        WHERE ((f.id = economic_data.form_id) AND ((f.user_id = auth.uid()) OR (f.user_id IS NULL))))))
    WITH CHECK ((EXISTS ( SELECT 1 FROM public.forms f
        WHERE ((f.id = economic_data.form_id) AND ((f.user_id = auth.uid()) OR (f.user_id IS NULL))))));

-- social_data
DROP POLICY IF EXISTS social_data_crud_by_form_owner ON public.social_data;
CREATE POLICY social_data_crud_by_form_owner ON public.social_data
    USING ((EXISTS ( SELECT 1 FROM public.forms f
        WHERE ((f.id = social_data.form_id) AND ((f.user_id = auth.uid()) OR (f.user_id IS NULL))))))
    WITH CHECK ((EXISTS ( SELECT 1 FROM public.forms f
        WHERE ((f.id = social_data.form_id) AND ((f.user_id = auth.uid()) OR (f.user_id IS NULL))))));

-- environmental_data
DROP POLICY IF EXISTS environmental_data_crud_by_form_owner ON public.environmental_data;
CREATE POLICY environmental_data_crud_by_form_owner ON public.environmental_data
    USING ((EXISTS ( SELECT 1 FROM public.forms f
        WHERE ((f.id = environmental_data.form_id) AND ((f.user_id = auth.uid()) OR (f.user_id IS NULL))))))
    WITH CHECK ((EXISTS ( SELECT 1 FROM public.forms f
        WHERE ((f.id = environmental_data.form_id) AND ((f.user_id = auth.uid()) OR (f.user_id IS NULL))))));

-- cultures_data (via environmental_data -> forms)
DROP POLICY IF EXISTS cultures_data_crud_by_form_owner ON public.cultures_data;
CREATE POLICY cultures_data_crud_by_form_owner ON public.cultures_data
    USING ((EXISTS ( SELECT 1 FROM (public.environmental_data e JOIN public.forms f ON ((f.id = e.form_id)))
        WHERE ((e.id = cultures_data.environmental_data_id) AND ((f.user_id = auth.uid()) OR (f.user_id IS NULL))))))
    WITH CHECK ((EXISTS ( SELECT 1 FROM (public.environmental_data e JOIN public.forms f ON ((f.id = e.form_id)))
        WHERE ((e.id = cultures_data.environmental_data_id) AND ((f.user_id = auth.uid()) OR (f.user_id IS NULL))))));

-- pastures_data (via environmental_data -> forms)
DROP POLICY IF EXISTS pastures_data_crud_by_form_owner ON public.pastures_data;
CREATE POLICY pastures_data_crud_by_form_owner ON public.pastures_data
    USING ((EXISTS ( SELECT 1 FROM (public.environmental_data e JOIN public.forms f ON ((f.id = e.form_id)))
        WHERE ((e.id = pastures_data.environmental_data_id) AND ((f.user_id = auth.uid()) OR (f.user_id IS NULL))))))
    WITH CHECK ((EXISTS ( SELECT 1 FROM (public.environmental_data e JOIN public.forms f ON ((f.id = e.form_id)))
        WHERE ((e.id = pastures_data.environmental_data_id) AND ((f.user_id = auth.uid()) OR (f.user_id IS NULL))))));

-- livestock_data (via property_data -> forms)
DROP POLICY IF EXISTS livestock_data_crud_by_form_owner ON public.livestock_data;
CREATE POLICY livestock_data_crud_by_form_owner ON public.livestock_data
    USING ((EXISTS ( SELECT 1 FROM (public.property_data p JOIN public.forms f ON ((f.id = p.form_id)))
        WHERE ((p.id = livestock_data.property_data_id) AND ((f.user_id = auth.uid()) OR (f.user_id IS NULL))))))
    WITH CHECK ((EXISTS ( SELECT 1 FROM (public.property_data p JOIN public.forms f ON ((f.id = p.form_id)))
        WHERE ((p.id = livestock_data.property_data_id) AND ((f.user_id = auth.uid()) OR (f.user_id IS NULL))))));

-- ------------------------------------------------------------
-- GRANTS (acesso via API PostgREST)
-- ------------------------------------------------------------

GRANT ALL ON TABLE public.forms              TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.personal_data      TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.property_data      TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.economic_data      TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.social_data        TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.environmental_data TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.cultures_data      TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.pastures_data      TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.livestock_data     TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.profiles           TO anon, authenticated, service_role;

GRANT ALL ON FUNCTION public.calculate_sustainability_indices(uuid) TO anon, authenticated, service_role;
GRANT ALL ON FUNCTION public.update_updated_at_column()             TO anon, authenticated, service_role;

-- ============================================================
-- PRÓXIMOS PASSOS — execute na ordem, no mesmo SQL Editor:
--   1. supabase-migrations/TODAS-MIGRACOES-PENDENTES.sql
--   2. supabase-migrations/add-environmental-tables.sql
--   3. supabase-migrations/01-fix-schema-drift.sql
--   4. supabase-migrations/02-livestock-categorization.sql
--   5. supabase-migrations/create-all-backoffice-views.sql
-- (todos são idempotentes / usam IF NOT EXISTS)
--
-- OBS:
--   - add-economic-data-columns.sql e add-social-data-columns.sql
--     ficam OPCIONAIS (já cobertos pelo 01-fix-schema-drift.sql).
--   - NÃO rode docs/migracao-novo-formulario.sql (design abandonado:
--     dropa livestock_data/cultures_data/pastures_data que o app usa).
-- ============================================================
