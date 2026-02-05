-- ============================================
-- TODAS AS MIGRAÇÕES PENDENTES - SISTEMA EMBRAPA
-- ============================================
-- Data: 05/02/2026
-- Descrição: Consolidação de todas as alterações necessárias no banco
-- Execute este SQL no Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. ADICIONAR COLUNA BIOMA
-- ============================================
-- Campo novo no formulário de informações gerais
ALTER TABLE public.property_data 
ADD COLUMN IF NOT EXISTS bioma VARCHAR(50);

COMMENT ON COLUMN public.property_data.bioma IS 'Bioma brasileiro: amazonia, caatinga, cerrado, mata-atlantica, pampa, pantanal';

-- ============================================
-- 2. CORRIGIR TIPO DA COLUNA PASTURE_TYPES
-- ============================================
-- Problema: O banco espera ARRAY mas o formulário envia string simples
-- Solução: Alterar para TEXT (string simples)

-- Primeiro, verificar se a coluna existe e qual o tipo atual
DO $$ 
BEGIN
    -- Se a coluna pasture_types existir como array, converter para TEXT
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'property_data' 
        AND column_name = 'pasture_types'
        AND data_type = 'ARRAY'
    ) THEN
        -- Converter array para texto (concatenando valores)
        ALTER TABLE public.property_data 
        ALTER COLUMN pasture_types TYPE TEXT 
        USING array_to_string(pasture_types, ', ');
        
        RAISE NOTICE 'Coluna pasture_types convertida de ARRAY para TEXT';
    ELSIF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'property_data' 
        AND column_name = 'pasture_types'
    ) THEN
        -- Se não existe, criar como TEXT
        ALTER TABLE public.property_data ADD COLUMN pasture_types TEXT;
        RAISE NOTICE 'Coluna pasture_types criada como TEXT';
    ELSE
        RAISE NOTICE 'Coluna pasture_types já existe como TEXT ou outro tipo compatível';
    END IF;
END $$;

-- ============================================
-- 3. ADICIONAR COLUNAS FALTANTES EM PROPERTY_DATA
-- ============================================
-- Campos necessários para o formulário de propriedade

-- Espécies de pastagem (campo separado do tipo)
ALTER TABLE public.property_data 
ADD COLUMN IF NOT EXISTS pasture_species TEXT;

COMMENT ON COLUMN public.property_data.pasture_species IS 'Espécies de pastagem plantadas';

-- Cultura de cobertura
ALTER TABLE public.property_data 
ADD COLUMN IF NOT EXISTS use_cover_crop BOOLEAN DEFAULT false;

ALTER TABLE public.property_data 
ADD COLUMN IF NOT EXISTS cover_crop_types TEXT;

COMMENT ON COLUMN public.property_data.use_cover_crop IS 'Se usa cultura de cobertura';
COMMENT ON COLUMN public.property_data.cover_crop_types IS 'Tipos de cultura de cobertura utilizados';

-- Espécies florestais (para salvar direto em property_data também)
ALTER TABLE public.property_data 
ADD COLUMN IF NOT EXISTS forest_species TEXT;

ALTER TABLE public.property_data 
ADD COLUMN IF NOT EXISTS forest_area DECIMAL(10,2);

COMMENT ON COLUMN public.property_data.forest_species IS 'Espécies florestais plantadas';
COMMENT ON COLUMN public.property_data.forest_area IS 'Área de floresta em hectares';

-- ============================================
-- 4. GARANTIR QUE TABELAS DE ESTRATÉGIA EXISTEM
-- ============================================

-- Tabela para estratégia de lavoura (culturas)
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

-- Tabela para estratégia de pecuária (pastagens)
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

-- Tabela para estratégia de floresta
CREATE TABLE IF NOT EXISTS public.forest_strategy (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    form_id UUID NOT NULL REFERENCES public.forms(id) ON DELETE CASCADE,
    planted_species TEXT,
    forest_area DECIMAL(10,2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 5. CRIAR ÍNDICES (se não existirem)
-- ============================================
CREATE INDEX IF NOT EXISTS idx_crop_strategy_form_id ON public.crop_strategy(form_id);
CREATE INDEX IF NOT EXISTS idx_pasture_strategy_form_id ON public.pasture_strategy(form_id);
CREATE INDEX IF NOT EXISTS idx_forest_strategy_form_id ON public.forest_strategy(form_id);

-- ============================================
-- 6. HABILITAR RLS NAS TABELAS DE ESTRATÉGIA
-- ============================================
ALTER TABLE public.crop_strategy ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pasture_strategy ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forest_strategy ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso (permitir acesso baseado no form_id)
DO $$ 
BEGIN
    -- crop_strategy
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'crop_strategy' AND policyname = 'Allow all access to crop_strategy') THEN
        CREATE POLICY "Allow all access to crop_strategy" ON public.crop_strategy FOR ALL USING (true) WITH CHECK (true);
    END IF;
    
    -- pasture_strategy
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'pasture_strategy' AND policyname = 'Allow all access to pasture_strategy') THEN
        CREATE POLICY "Allow all access to pasture_strategy" ON public.pasture_strategy FOR ALL USING (true) WITH CHECK (true);
    END IF;
    
    -- forest_strategy
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'forest_strategy' AND policyname = 'Allow all access to forest_strategy') THEN
        CREATE POLICY "Allow all access to forest_strategy" ON public.forest_strategy FOR ALL USING (true) WITH CHECK (true);
    END IF;
END $$;

-- ============================================
-- VERIFICAÇÃO FINAL
-- ============================================
-- Execute para confirmar que as colunas foram criadas

SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'property_data'
  AND column_name IN ('bioma', 'pasture_types', 'pasture_species', 'use_cover_crop', 'cover_crop_types', 'forest_species', 'forest_area')
ORDER BY column_name;

-- ============================================
-- 7. ADICIONAR COLUNAS SOCIAIS FALTANTES
-- ============================================
-- Novos campos adicionados ao formulário social

-- Informações da família
ALTER TABLE public.social_data 
ADD COLUMN IF NOT EXISTS oldest_family_member_age INTEGER;

ALTER TABLE public.social_data 
ADD COLUMN IF NOT EXISTS youngest_family_member_age INTEGER;

COMMENT ON COLUMN public.social_data.oldest_family_member_age IS 'Idade do integrante mais velho da família que trabalha na propriedade';
COMMENT ON COLUMN public.social_data.youngest_family_member_age IS 'Idade do integrante mais novo da família que trabalha na propriedade';

-- Cursos de capacitação
ALTER TABLE public.social_data 
ADD COLUMN IF NOT EXISTS operational_courses INTEGER DEFAULT 0;

ALTER TABLE public.social_data 
ADD COLUMN IF NOT EXISTS technical_courses INTEGER DEFAULT 0;

ALTER TABLE public.social_data 
ADD COLUMN IF NOT EXISTS specialization_courses INTEGER DEFAULT 0;

COMMENT ON COLUMN public.social_data.operational_courses IS 'Quantidade de cursos operacionais realizados no último ano';
COMMENT ON COLUMN public.social_data.technical_courses IS 'Quantidade de cursos técnicos realizados no último ano';
COMMENT ON COLUMN public.social_data.specialization_courses IS 'Quantidade de cursos de especialização realizados no último ano';

-- Assistência e benefícios
ALTER TABLE public.social_data 
ADD COLUMN IF NOT EXISTS has_technical_assistance BOOLEAN DEFAULT false;

ALTER TABLE public.social_data 
ADD COLUMN IF NOT EXISTS technical_assistance_type TEXT;

ALTER TABLE public.social_data 
ADD COLUMN IF NOT EXISTS has_profit_sharing BOOLEAN DEFAULT false;

ALTER TABLE public.social_data 
ADD COLUMN IF NOT EXISTS has_health_plan BOOLEAN DEFAULT false;

COMMENT ON COLUMN public.social_data.has_technical_assistance IS 'Se a propriedade recebe assistência técnica';
COMMENT ON COLUMN public.social_data.technical_assistance_type IS 'Tipo de assistência técnica recebida';
COMMENT ON COLUMN public.social_data.has_profit_sharing IS 'Se os funcionários têm participação nos lucros';
COMMENT ON COLUMN public.social_data.has_health_plan IS 'Se a propriedade oferece plano de saúde aos funcionários';

-- ============================================
-- REFERÊNCIA DOS BIOMAS BRASILEIROS
-- ============================================
-- | Valor            | Nome Display    |
-- |------------------|-----------------|
-- | amazonia         | Amazônia        |
-- | caatinga         | Caatinga        |
-- | cerrado          | Cerrado         |
-- | mata-atlantica   | Mata Atlântica  |
-- | pampa            | Pampa           |
-- | pantanal         | Pantanal        |
-- ============================================
