-- ============================================================================
-- SCRIPT DE MIGRAÇÃO: ADAPTAÇÃO DO BANCO PARA O NOVO FORMULÁRIO EMBRAPA
-- Data: 22/12/2025
-- Descrição: Remove campos desnecessários e adiciona novas tabelas/campos
-- ============================================================================

-- ATENÇÃO: Este script faz mudanças DESTRUTIVAS no banco de dados!
-- Faça backup antes de executar!

BEGIN;

-- ============================================================================
-- PARTE 1: ADICIONAR NOVOS CAMPOS EM TABELAS EXISTENTES
-- ============================================================================

-- 1.1 FORMS: Adicionar campos de informações gerais
ALTER TABLE public.forms ADD COLUMN IF NOT EXISTS interview_date DATE;
ALTER TABLE public.forms ADD COLUMN IF NOT EXISTS property_code VARCHAR(50);
ALTER TABLE public.forms ADD COLUMN IF NOT EXISTS birth_place VARCHAR(255);

-- 1.2 PROPERTY_DATA: Ajustar campos existentes
ALTER TABLE public.property_data ALTER COLUMN system_usage_time TYPE VARCHAR(100);
ALTER TABLE public.property_data ADD COLUMN IF NOT EXISTS production_system_detail VARCHAR(100);

-- 1.3 ECONOMIC_DATA: Adicionar novos campos
ALTER TABLE public.economic_data ADD COLUMN IF NOT EXISTS decision_maker_salary DECIMAL(10,2);
ALTER TABLE public.economic_data ADD COLUMN IF NOT EXISTS commercialization_method TEXT;
ALTER TABLE public.economic_data ADD COLUMN IF NOT EXISTS production_cost_type VARCHAR(50);
ALTER TABLE public.economic_data ADD COLUMN IF NOT EXISTS financing_lavoura DECIMAL(5,2);
ALTER TABLE public.economic_data ADD COLUMN IF NOT EXISTS financing_pecuaria DECIMAL(5,2);
ALTER TABLE public.economic_data ADD COLUMN IF NOT EXISTS financing_floresta DECIMAL(5,2);

-- 1.4 SOCIAL_DATA: Adicionar novos campos
ALTER TABLE public.social_data ADD COLUMN IF NOT EXISTS temporary_employees INTEGER;
ALTER TABLE public.social_data ADD COLUMN IF NOT EXISTS outsourced_avg_salary DECIMAL(10,2);
ALTER TABLE public.social_data ADD COLUMN IF NOT EXISTS family_oldest_age INTEGER;
ALTER TABLE public.social_data ADD COLUMN IF NOT EXISTS family_youngest_age INTEGER;
ALTER TABLE public.social_data ADD COLUMN IF NOT EXISTS training_offered BOOLEAN DEFAULT false;
ALTER TABLE public.social_data ADD COLUMN IF NOT EXISTS training_operational_qty INTEGER;
ALTER TABLE public.social_data ADD COLUMN IF NOT EXISTS training_technical_qty INTEGER;
ALTER TABLE public.social_data ADD COLUMN IF NOT EXISTS training_specialization_qty INTEGER;
ALTER TABLE public.social_data ADD COLUMN IF NOT EXISTS technical_assistance_provider VARCHAR(100);
ALTER TABLE public.social_data ADD COLUMN IF NOT EXISTS technical_assistance_value DECIMAL(10,2);
ALTER TABLE public.social_data ADD COLUMN IF NOT EXISTS profit_sharing_system BOOLEAN DEFAULT false;
ALTER TABLE public.social_data ADD COLUMN IF NOT EXISTS health_plan_offered BOOLEAN DEFAULT false;

-- Ajustar campos existentes em social_data
ALTER TABLE public.social_data ALTER COLUMN family_members TYPE BOOLEAN USING (family_members::INTEGER > 0);
ALTER TABLE public.social_data ALTER COLUMN technical_assistance TYPE VARCHAR(100);

-- ============================================================================
-- PARTE 2: REMOVER TABELA DE REBANHO ANTIGA (ESTRUTURA INCORRETA)
-- ============================================================================

-- Nota: A tabela livestock_data atual tem estrutura muito diferente do formulário
-- Será substituída por uma nova estrutura
DROP TABLE IF EXISTS public.livestock_data CASCADE;

-- ============================================================================
-- PARTE 3: CRIAR NOVAS TABELAS
-- ============================================================================

-- 3.1 ESTRATÉGIA DE USO DA TERRA - LAVOURA
CREATE TABLE IF NOT EXISTS public.crop_strategy (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  form_id UUID NOT NULL REFERENCES public.forms(id) ON DELETE CASCADE,
  crop_name VARCHAR(100) NOT NULL,
  planting_month INTEGER CHECK (planting_month BETWEEN 1 AND 12),
  area_percentage DECIMAL(5,2),
  area_hectares DECIMAL(10,2),
  used_cover_crop BOOLEAN DEFAULT false,
  cover_crop_types TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.2 ESTRATÉGIA DE USO DA TERRA - PECUÁRIA (PASTAGENS)
CREATE TABLE IF NOT EXISTS public.pasture_strategy (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  form_id UUID NOT NULL REFERENCES public.forms(id) ON DELETE CASCADE,
  species VARCHAR(100),
  cultivar VARCHAR(100),
  area_hectares DECIMAL(10,2),
  uses_silage BOOLEAN DEFAULT false,
  silage_hectares DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.3 ESTRATÉGIA DE USO DA TERRA - FLORESTA (ILPF)
CREATE TABLE IF NOT EXISTS public.forest_strategy (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  form_id UUID NOT NULL REFERENCES public.forms(id) ON DELETE CASCADE,
  planted_species TEXT,
  forest_area DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.4 NOVA ESTRUTURA DE REBANHO - CATEGORIZAÇÃO POR IDADE
CREATE TABLE IF NOT EXISTS public.livestock_categorization (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  form_id UUID NOT NULL REFERENCES public.forms(id) ON DELETE CASCADE,
  -- Categorização por idade
  male_under_1 INTEGER DEFAULT 0, -- Bezerro
  female_under_1 INTEGER DEFAULT 0, -- Bezerra
  male_1_2 INTEGER DEFAULT 0, -- Garrote
  female_1_2 INTEGER DEFAULT 0, -- Novilha
  male_over_2 INTEGER DEFAULT 0, -- Boi magro/gordo
  female_over_2 INTEGER DEFAULT 0, -- Vaca
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.5 FLUXO DE ANIMAIS - COMPRAS
CREATE TABLE IF NOT EXISTS public.livestock_purchases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  form_id UUID NOT NULL REFERENCES public.forms(id) ON DELETE CASCADE,
  male_under_1 INTEGER DEFAULT 0,
  female_under_1 INTEGER DEFAULT 0,
  male_1_2 INTEGER DEFAULT 0,
  female_1_2 INTEGER DEFAULT 0,
  male_over_2 INTEGER DEFAULT 0,
  female_over_2 INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.6 FLUXO DE ANIMAIS - VENDAS
CREATE TABLE IF NOT EXISTS public.livestock_sales (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  form_id UUID NOT NULL REFERENCES public.forms(id) ON DELETE CASCADE,
  -- Machos < 1 ano (Bezerro)
  male_under_1_qty INTEGER DEFAULT 0,
  male_under_1_price DECIMAL(10,2),
  -- Fêmeas < 1 ano (Bezerra)
  female_under_1_qty INTEGER DEFAULT 0,
  female_under_1_price DECIMAL(10,2),
  -- Machos 1-2 anos (Garrote)
  male_1_2_qty INTEGER DEFAULT 0,
  male_1_2_price DECIMAL(10,2),
  -- Fêmeas 1-2 anos (Novilha)
  female_1_2_qty INTEGER DEFAULT 0,
  female_1_2_price DECIMAL(10,2),
  -- Machos > 2 anos (Boi)
  male_over_2_qty INTEGER DEFAULT 0,
  male_over_2_price DECIMAL(10,2),
  male_over_2_weight DECIMAL(10,2), -- em @
  male_over_2_carcass_yield DECIMAL(5,2), -- %
  -- Fêmeas > 2 anos (Vaca)
  female_over_2_qty INTEGER DEFAULT 0,
  female_over_2_price DECIMAL(10,2),
  female_over_2_weight DECIMAL(10,2), -- em @
  female_over_2_carcass_yield DECIMAL(5,2), -- %
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.7 PRODUTIVIDADE E CUSTOS POR CULTURA (LAVOURA)
CREATE TABLE IF NOT EXISTS public.crop_productivity (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  form_id UUID NOT NULL REFERENCES public.forms(id) ON DELETE CASCADE,
  crop_name VARCHAR(100) NOT NULL,
  productivity DECIMAL(10,2),
  production_cost DECIMAL(15,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.8 ADUBO NPK DETALHADO
CREATE TABLE IF NOT EXISTS public.fertilizer_npk (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  form_id UUID NOT NULL REFERENCES public.forms(id) ON DELETE CASCADE,
  culture VARCHAR(100) NOT NULL,
  formula VARCHAR(50), -- Ex: 10-20-10
  total_quantity DECIMAL(10,2), -- kg
  production_type VARCHAR(20) CHECK (production_type IN ('lavoura', 'pecuaria', 'floresta')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.9 DEFENSIVOS AGRÍCOLAS - HERBICIDAS
CREATE TABLE IF NOT EXISTS public.pesticides_herbicides (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  form_id UUID NOT NULL REFERENCES public.forms(id) ON DELETE CASCADE,
  culture VARCHAR(100) NOT NULL,
  herbicide_names TEXT,
  application_count INTEGER,
  quantity_ha DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.10 DEFENSIVOS AGRÍCOLAS - FUNGICIDAS
CREATE TABLE IF NOT EXISTS public.pesticides_fungicides (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  form_id UUID NOT NULL REFERENCES public.forms(id) ON DELETE CASCADE,
  culture VARCHAR(100) NOT NULL,
  fungicide_names TEXT,
  application_count INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.11 DEFENSIVOS AGRÍCOLAS - INSETICIDAS
CREATE TABLE IF NOT EXISTS public.pesticides_insecticides (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  form_id UUID NOT NULL REFERENCES public.forms(id) ON DELETE CASCADE,
  culture VARCHAR(100) NOT NULL,
  insecticide_names TEXT,
  application_count INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.12 DEFENSIVOS AGRÍCOLAS - OUTROS
CREATE TABLE IF NOT EXISTS public.pesticides_others (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  form_id UUID NOT NULL REFERENCES public.forms(id) ON DELETE CASCADE,
  culture VARCHAR(100) NOT NULL,
  pesticide_type VARCHAR(100),
  pesticide_names TEXT,
  application_count INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.13 COMENTÁRIOS E OBSERVAÇÕES
CREATE TABLE IF NOT EXISTS public.form_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  form_id UUID NOT NULL REFERENCES public.forms(id) ON DELETE CASCADE,
  general_observations TEXT,
  accepts_visit BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- PARTE 4: REMOVER TABELAS ANTIGAS QUE NÃO SERÃO MAIS USADAS
-- ============================================================================

-- Remover tabelas de culturas e pastagens antigas (estrutura diferente)
DROP TABLE IF EXISTS public.cultures_data CASCADE;
DROP TABLE IF EXISTS public.pastures_data CASCADE;

-- ============================================================================
-- PARTE 5: CRIAR ÍNDICES PARA PERFORMANCE
-- ============================================================================

-- Índices para as novas tabelas
CREATE INDEX IF NOT EXISTS idx_crop_strategy_form_id ON public.crop_strategy(form_id);
CREATE INDEX IF NOT EXISTS idx_pasture_strategy_form_id ON public.pasture_strategy(form_id);
CREATE INDEX IF NOT EXISTS idx_forest_strategy_form_id ON public.forest_strategy(form_id);
CREATE INDEX IF NOT EXISTS idx_livestock_categorization_form_id ON public.livestock_categorization(form_id);
CREATE INDEX IF NOT EXISTS idx_livestock_purchases_form_id ON public.livestock_purchases(form_id);
CREATE INDEX IF NOT EXISTS idx_livestock_sales_form_id ON public.livestock_sales(form_id);
CREATE INDEX IF NOT EXISTS idx_crop_productivity_form_id ON public.crop_productivity(form_id);
CREATE INDEX IF NOT EXISTS idx_fertilizer_npk_form_id ON public.fertilizer_npk(form_id);
CREATE INDEX IF NOT EXISTS idx_pesticides_herbicides_form_id ON public.pesticides_herbicides(form_id);
CREATE INDEX IF NOT EXISTS idx_pesticides_fungicides_form_id ON public.pesticides_fungicides(form_id);
CREATE INDEX IF NOT EXISTS idx_pesticides_insecticides_form_id ON public.pesticides_insecticides(form_id);
CREATE INDEX IF NOT EXISTS idx_pesticides_others_form_id ON public.pesticides_others(form_id);
CREATE INDEX IF NOT EXISTS idx_form_comments_form_id ON public.form_comments(form_id);

-- Índices para busca
CREATE INDEX IF NOT EXISTS idx_forms_interview_date ON public.forms(interview_date);
CREATE INDEX IF NOT EXISTS idx_forms_property_code ON public.forms(property_code);

-- ============================================================================
-- PARTE 6: ATUALIZAR VIEW DE RESPOSTAS
-- ============================================================================

-- Deletar VIEW antiga
DROP VIEW IF EXISTS public.form_responses_view;

-- Criar VIEW atualizada
CREATE VIEW public.form_responses_view AS
SELECT 
    -- Dados do formulário
    f.id AS form_id,
    f.user_id,
    f.status,
    f.interview_date,
    f.property_code,
    f.birth_place,
    f.sustainability_index,
    f.economic_index,
    f.social_index,
    f.environmental_index,
    f.created_at AS data_resposta,
    f.updated_at AS data_atualizacao,
    f.submitted_at AS data_submissao,
    
    -- Dados pessoais do usuário
    pd.name AS nome_usuario,
    pd.age AS idade_usuario,
    pd.occupation AS ocupacao,
    pd.education AS escolaridade,
    pd.years_in_agriculture AS anos_agricultura,
    
    -- Dados da propriedade
    prop.property_name AS nome_fazenda,
    prop.municipality AS municipio,
    prop.state AS estado,
    prop.total_area AS area_total,
    prop.production_area AS area_producao,
    prop.permanent_protection_area AS area_app,
    prop.legal_reserve_area AS area_reserva_legal,
    prop.activity_types AS tipos_atividade,
    prop.production_system AS sistema_producao,
    prop.production_system_detail AS detalhe_sistema_producao,
    prop.system_usage_time AS tempo_uso_sistema,
    
    -- Dados econômicos
    eco.gross_income AS renda_bruta,
    eco.property_value AS valor_propriedade,
    eco.decision_maker_salary AS salario_decisor,
    
    -- Dados sociais
    soc.permanent_employees AS empregados_permanentes,
    soc.temporary_employees AS empregados_temporarios,
    soc.health_plan_offered AS oferece_plano_saude,
    
    -- Localização formatada
    CONCAT(
        COALESCE(prop.municipality, ''),
        CASE 
            WHEN prop.municipality IS NOT NULL AND prop.state IS NOT NULL THEN ', ' 
            ELSE ''
        END,
        COALESCE(prop.state, '')
    ) AS localizacao,
    
    -- Data formatada
    TO_CHAR(f.created_at, 'DD/MM/YYYY') AS data_formatada,
    TO_CHAR(f.created_at, 'DD/MM/YYYY HH24:MI') AS data_hora_formatada
    
FROM 
    public.forms f
    LEFT JOIN public.personal_data pd ON pd.form_id = f.id
    LEFT JOIN public.property_data prop ON prop.form_id = f.id
    LEFT JOIN public.economic_data eco ON eco.form_id = f.id
    LEFT JOIN public.social_data soc ON soc.form_id = f.id
ORDER BY 
    f.created_at DESC;

-- Permissões
GRANT SELECT ON public.form_responses_view TO authenticated;
GRANT SELECT ON public.form_responses_view TO service_role;

-- ============================================================================
-- PARTE 7: HABILITAR RLS NAS NOVAS TABELAS
-- ============================================================================

-- Habilitar RLS
ALTER TABLE public.crop_strategy ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pasture_strategy ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forest_strategy ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.livestock_categorization ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.livestock_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.livestock_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crop_productivity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fertilizer_npk ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pesticides_herbicides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pesticides_fungicides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pesticides_insecticides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pesticides_others ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_comments ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso (usuários podem acessar dados de seus próprios formulários)
CREATE POLICY "Users can view own data" ON public.crop_strategy
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.forms f 
      WHERE f.id = crop_strategy.form_id 
      AND (f.user_id = auth.uid() OR f.user_id IS NULL)
    )
  );

CREATE POLICY "Users can insert own data" ON public.crop_strategy
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.forms f 
      WHERE f.id = crop_strategy.form_id 
      AND (f.user_id = auth.uid() OR f.user_id IS NULL)
    )
  );

-- Repetir políticas para todas as novas tabelas
-- (Para brevidade, não vou repetir todas, mas o padrão é o mesmo)

-- Política para pasture_strategy
CREATE POLICY "Users can view own data" ON public.pasture_strategy
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.forms f WHERE f.id = pasture_strategy.form_id AND (f.user_id = auth.uid() OR f.user_id IS NULL)));

CREATE POLICY "Users can insert own data" ON public.pasture_strategy
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.forms f WHERE f.id = pasture_strategy.form_id AND (f.user_id = auth.uid() OR f.user_id IS NULL)));

-- Política para forest_strategy
CREATE POLICY "Users can view own data" ON public.forest_strategy
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.forms f WHERE f.id = forest_strategy.form_id AND (f.user_id = auth.uid() OR f.user_id IS NULL)));

CREATE POLICY "Users can insert own data" ON public.forest_strategy
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.forms f WHERE f.id = forest_strategy.form_id AND (f.user_id = auth.uid() OR f.user_id IS NULL)));

-- Política para livestock_categorization
CREATE POLICY "Users can view own data" ON public.livestock_categorization
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.forms f WHERE f.id = livestock_categorization.form_id AND (f.user_id = auth.uid() OR f.user_id IS NULL)));

CREATE POLICY "Users can insert own data" ON public.livestock_categorization
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.forms f WHERE f.id = livestock_categorization.form_id AND (f.user_id = auth.uid() OR f.user_id IS NULL)));

-- Política para livestock_purchases
CREATE POLICY "Users can view own data" ON public.livestock_purchases
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.forms f WHERE f.id = livestock_purchases.form_id AND (f.user_id = auth.uid() OR f.user_id IS NULL)));

CREATE POLICY "Users can insert own data" ON public.livestock_purchases
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.forms f WHERE f.id = livestock_purchases.form_id AND (f.user_id = auth.uid() OR f.user_id IS NULL)));

-- Política para livestock_sales
CREATE POLICY "Users can view own data" ON public.livestock_sales
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.forms f WHERE f.id = livestock_sales.form_id AND (f.user_id = auth.uid() OR f.user_id IS NULL)));

CREATE POLICY "Users can insert own data" ON public.livestock_sales
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.forms f WHERE f.id = livestock_sales.form_id AND (f.user_id = auth.uid() OR f.user_id IS NULL)));

-- Políticas para as demais tabelas (mesmo padrão)
CREATE POLICY "Users can view own data" ON public.crop_productivity FOR SELECT USING (EXISTS (SELECT 1 FROM public.forms f WHERE f.id = crop_productivity.form_id AND (f.user_id = auth.uid() OR f.user_id IS NULL)));
CREATE POLICY "Users can insert own data" ON public.crop_productivity FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.forms f WHERE f.id = crop_productivity.form_id AND (f.user_id = auth.uid() OR f.user_id IS NULL)));

CREATE POLICY "Users can view own data" ON public.fertilizer_npk FOR SELECT USING (EXISTS (SELECT 1 FROM public.forms f WHERE f.id = fertilizer_npk.form_id AND (f.user_id = auth.uid() OR f.user_id IS NULL)));
CREATE POLICY "Users can insert own data" ON public.fertilizer_npk FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.forms f WHERE f.id = fertilizer_npk.form_id AND (f.user_id = auth.uid() OR f.user_id IS NULL)));

CREATE POLICY "Users can view own data" ON public.pesticides_herbicides FOR SELECT USING (EXISTS (SELECT 1 FROM public.forms f WHERE f.id = pesticides_herbicides.form_id AND (f.user_id = auth.uid() OR f.user_id IS NULL)));
CREATE POLICY "Users can insert own data" ON public.pesticides_herbicides FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.forms f WHERE f.id = pesticides_herbicides.form_id AND (f.user_id = auth.uid() OR f.user_id IS NULL)));

CREATE POLICY "Users can view own data" ON public.pesticides_fungicides FOR SELECT USING (EXISTS (SELECT 1 FROM public.forms f WHERE f.id = pesticides_fungicides.form_id AND (f.user_id = auth.uid() OR f.user_id IS NULL)));
CREATE POLICY "Users can insert own data" ON public.pesticides_fungicides FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.forms f WHERE f.id = pesticides_fungicides.form_id AND (f.user_id = auth.uid() OR f.user_id IS NULL)));

CREATE POLICY "Users can view own data" ON public.pesticides_insecticides FOR SELECT USING (EXISTS (SELECT 1 FROM public.forms f WHERE f.id = pesticides_insecticides.form_id AND (f.user_id = auth.uid() OR f.user_id IS NULL)));
CREATE POLICY "Users can insert own data" ON public.pesticides_insecticides FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.forms f WHERE f.id = pesticides_insecticides.form_id AND (f.user_id = auth.uid() OR f.user_id IS NULL)));

CREATE POLICY "Users can view own data" ON public.pesticides_others FOR SELECT USING (EXISTS (SELECT 1 FROM public.forms f WHERE f.id = pesticides_others.form_id AND (f.user_id = auth.uid() OR f.user_id IS NULL)));
CREATE POLICY "Users can insert own data" ON public.pesticides_others FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.forms f WHERE f.id = pesticides_others.form_id AND (f.user_id = auth.uid() OR f.user_id IS NULL)));

CREATE POLICY "Users can view own data" ON public.form_comments FOR SELECT USING (EXISTS (SELECT 1 FROM public.forms f WHERE f.id = form_comments.form_id AND (f.user_id = auth.uid() OR f.user_id IS NULL)));
CREATE POLICY "Users can insert own data" ON public.form_comments FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.forms f WHERE f.id = form_comments.form_id AND (f.user_id = auth.uid() OR f.user_id IS NULL)));

-- ============================================================================
-- PARTE 8: COMENTÁRIOS E DOCUMENTAÇÃO
-- ============================================================================

COMMENT ON TABLE public.crop_strategy IS 'Estratégia de uso da terra para lavoura - culturas plantadas';
COMMENT ON TABLE public.pasture_strategy IS 'Estratégia de uso da terra para pecuária - tipos de pastagem';
COMMENT ON TABLE public.forest_strategy IS 'Estratégia de uso da terra para ILPF - floresta';
COMMENT ON TABLE public.livestock_categorization IS 'Categorização do rebanho por idade e sexo';
COMMENT ON TABLE public.livestock_purchases IS 'Fluxo de animais - compras realizadas';
COMMENT ON TABLE public.livestock_sales IS 'Fluxo de animais - vendas realizadas com preços e pesos';
COMMENT ON TABLE public.crop_productivity IS 'Produtividade e custos por cultura na lavoura';
COMMENT ON TABLE public.fertilizer_npk IS 'Adubo NPK utilizado por cultura';
COMMENT ON TABLE public.pesticides_herbicides IS 'Herbicidas aplicados por cultura';
COMMENT ON TABLE public.pesticides_fungicides IS 'Fungicidas aplicados por cultura';
COMMENT ON TABLE public.pesticides_insecticides IS 'Inseticidas aplicados por cultura';
COMMENT ON TABLE public.pesticides_others IS 'Outros defensivos aplicados por cultura';
COMMENT ON TABLE public.form_comments IS 'Comentários e observações gerais do formulário';

-- ============================================================================
-- FIM DA MIGRAÇÃO
-- ============================================================================

COMMIT;

-- ============================================================================
-- VERIFICAÇÃO PÓS-MIGRAÇÃO
-- ============================================================================

-- Execute estas queries para verificar se tudo foi criado corretamente:

-- 1. Listar todas as novas tabelas criadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'crop_strategy', 'pasture_strategy', 'forest_strategy',
  'livestock_categorization', 'livestock_purchases', 'livestock_sales',
  'crop_productivity', 'fertilizer_npk',
  'pesticides_herbicides', 'pesticides_fungicides', 
  'pesticides_insecticides', 'pesticides_others',
  'form_comments'
)
ORDER BY table_name;

-- 2. Verificar novos campos em forms
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'forms' 
AND column_name IN ('interview_date', 'property_code', 'birth_place');

-- 3. Verificar novos campos em economic_data
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'economic_data' 
AND column_name IN ('decision_maker_salary', 'commercialization_method', 'production_cost_type');

-- 4. Verificar novos campos em social_data
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'social_data' 
AND column_name IN ('temporary_employees', 'family_oldest_age', 'training_offered', 'health_plan_offered');

-- 5. Verificar se a VIEW foi atualizada
SELECT * FROM public.form_responses_view LIMIT 1;
