-- ============================================================
-- PERFIL DO REBANHO — categorização por sexo × faixa de idade
-- (feedback do Júlio/Embrapa: quantidade de animais, sexo e idade)
-- ============================================================
-- Execute no SQL Editor (depois do 00-restore-base). Idempotente.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.livestock_categorization (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    form_id uuid NOT NULL REFERENCES public.forms(id) ON DELETE CASCADE,
    male_under_1 integer DEFAULT 0,    -- Machos < 1 ano (bezerros)
    female_under_1 integer DEFAULT 0,  -- Fêmeas < 1 ano (bezerras)
    male_1_2 integer DEFAULT 0,        -- Machos 1–2 anos (garrotes)
    female_1_2 integer DEFAULT 0,      -- Fêmeas 1–2 anos (novilhas)
    male_over_2 integer DEFAULT 0,     -- Machos > 2 anos (touros/bois)
    female_over_2 integer DEFAULT 0,   -- Fêmeas > 2 anos (vacas)
    created_at timestamp with time zone DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_livestock_categorization_form_id
    ON public.livestock_categorization(form_id);

-- Um registro por formulário
CREATE UNIQUE INDEX IF NOT EXISTS uq_livestock_categorization_form_id
    ON public.livestock_categorization(form_id);

ALTER TABLE public.livestock_categorization ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS livestock_categorization_crud_by_form_owner ON public.livestock_categorization;
CREATE POLICY livestock_categorization_crud_by_form_owner ON public.livestock_categorization
    USING ((EXISTS ( SELECT 1 FROM public.forms f
        WHERE ((f.id = livestock_categorization.form_id) AND ((f.user_id = auth.uid()) OR (f.user_id IS NULL))))))
    WITH CHECK ((EXISTS ( SELECT 1 FROM public.forms f
        WHERE ((f.id = livestock_categorization.form_id) AND ((f.user_id = auth.uid()) OR (f.user_id IS NULL))))));

GRANT ALL ON TABLE public.livestock_categorization TO anon, authenticated, service_role;

COMMENT ON TABLE public.livestock_categorization IS 'Perfil do rebanho: quantidade de animais por sexo e faixa de idade';
