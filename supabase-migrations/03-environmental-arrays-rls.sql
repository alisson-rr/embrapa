-- ============================================================
-- RLS DAS TABELAS DE ADUBOS E DEFENSIVOS (arrays da Etapa 5)
-- ============================================================
-- O add-environmental-tables.sql cria fertilizers_data, herbicides_data,
-- fungicides_data, insecticides_data e other_pesticides_data, mas NÃO
-- cria políticas de RLS. Com a RLS ligada e sem policy permissiva, todo
-- INSERT do formulário falha com:
--   42501 "new row violates row-level security policy"
-- (HTTP 401). Resultado: os índices calculam, mas adubos/defensivos
-- nunca são gravados.
--
-- Aqui ligamos a RLS (idempotente) e criamos, para cada tabela, uma
-- policy de CRUD com a MESMA regra das demais tabelas do formulário:
-- o registro pertence a um form do usuário (auth.uid()) OU a um form
-- anônimo (user_id IS NULL). Também garantimos os GRANTs ao anon.
--
-- Execute no SQL Editor depois de add-environmental-tables.sql.
-- Pode rodar quantas vezes quiser (idempotente).
-- ============================================================

DO $$
DECLARE
  t        text;
  policy   text;
  tbls     text[] := ARRAY[
    'fertilizers_data',
    'herbicides_data',
    'fungicides_data',
    'insecticides_data',
    'other_pesticides_data'
  ];
BEGIN
  FOREACH t IN ARRAY tbls LOOP
    policy := t || '_crud_by_form_owner';

    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', policy, t);
    EXECUTE format(
      'CREATE POLICY %I ON public.%I '
      || 'USING (EXISTS (SELECT 1 FROM public.forms f '
      || 'WHERE f.id = %I.form_id AND (f.user_id = auth.uid() OR f.user_id IS NULL))) '
      || 'WITH CHECK (EXISTS (SELECT 1 FROM public.forms f '
      || 'WHERE f.id = %I.form_id AND (f.user_id = auth.uid() OR f.user_id IS NULL)))',
      policy, t, t, t
    );
    EXECUTE format(
      'GRANT ALL ON TABLE public.%I TO anon, authenticated, service_role', t
    );
  END LOOP;
END $$;
