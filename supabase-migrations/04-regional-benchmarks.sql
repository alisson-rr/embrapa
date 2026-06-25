-- ============================================================
-- BENCHMARKS REGIONAIS (médias por estado p/ a Comparação Regional)
-- ============================================================
-- A página de resultados tem uma seção "Comparação Regional" que, até
-- aqui, só repetia os 3 índices do próprio produtor (não comparava com
-- nada). Esta tabela guarda as médias de referência por UF (e uma média
-- NACIONAL como fallback), configuráveis pelo painel admin em
-- Configurações → Comparação Regional.
--
-- IMPORTANTE: estes valores são apenas BENCHMARK DE COMPARAÇÃO exibido
-- no resultado. NÃO entram no cálculo do índice fuzzy em si (esse segue
-- a metodologia da Embrapa, que não é editável pelo admin por design).
--
-- Execute no SQL Editor (depois de 00-restore-base). Idempotente.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.regional_benchmarks (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    -- 'BR' = média nacional (fallback). Demais = sigla da UF (SP, MS...).
    state text NOT NULL,
    economic_index numeric(5,2),
    social_index numeric(5,2),
    environmental_index numeric(5,2),
    sustainability_index numeric(5,2),
    updated_at timestamp with time zone DEFAULT now(),
    updated_by uuid
);

-- Uma linha por UF (e uma para 'BR')
CREATE UNIQUE INDEX IF NOT EXISTS uq_regional_benchmarks_state
    ON public.regional_benchmarks(state);

ALTER TABLE public.regional_benchmarks ENABLE ROW LEVEL SECURITY;

-- Leitura PÚBLICA: a página de resultados roda sem login (anon).
DROP POLICY IF EXISTS regional_benchmarks_read ON public.regional_benchmarks;
CREATE POLICY regional_benchmarks_read ON public.regional_benchmarks
    FOR SELECT USING (true);

-- Escrita só para usuários autenticados (painel admin).
DROP POLICY IF EXISTS regional_benchmarks_write ON public.regional_benchmarks;
CREATE POLICY regional_benchmarks_write ON public.regional_benchmarks
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

GRANT SELECT ON TABLE public.regional_benchmarks TO anon;
GRANT ALL ON TABLE public.regional_benchmarks TO authenticated, service_role;

COMMENT ON TABLE public.regional_benchmarks IS
    'Médias de referência por UF (e BR=nacional) para a Comparação Regional da página de resultados. Não afeta o cálculo fuzzy.';

-- Pré-popula uma linha por UF + BR (valores nulos; o admin preenche).
INSERT INTO public.regional_benchmarks (state)
SELECT uf FROM (VALUES
  ('BR'),
  ('AC'),('AL'),('AP'),('AM'),('BA'),('CE'),('DF'),('ES'),('GO'),
  ('MA'),('MT'),('MS'),('MG'),('PA'),('PB'),('PR'),('PE'),('PI'),
  ('RJ'),('RN'),('RS'),('RO'),('RR'),('SC'),('SP'),('SE'),('TO')
) AS t(uf)
ON CONFLICT (state) DO NOTHING;
