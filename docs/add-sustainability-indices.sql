-- ================================================
-- SQL para adicionar colunas de índices de sustentabilidade
-- ================================================

-- Adicionar colunas de índices na tabela forms
ALTER TABLE forms 
ADD COLUMN IF NOT EXISTS indice_economico DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS indice_social DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS indice_ambiental DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS indice_sustentabilidade DECIMAL(5,2);

-- Criar tabela para armazenar parâmetros calculados
CREATE TABLE IF NOT EXISTS sustainability_parameters (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    form_id UUID REFERENCES forms(id) ON DELETE CASCADE,
    
    -- Parâmetros Econômicos
    fv_valor DECIMAL(10,2), -- Valor da fazenda/área produtiva
    wi_valor DECIMAL(10,2), -- Salário do proprietário/média nacional
    p_valor DECIMAL(10,2),  -- Lucro por hectare
    dl_valor DECIMAL(10,2), -- Despesas/área produtiva
    
    -- Parâmetros Sociais
    anos_estudo INTEGER,
    ja_valor DECIMAL(5,2), -- Job attractiveness
    tc_valor INTEGER,      -- Total de cursos
    jq_valor DECIMAL(5,2), -- Job quality
    plano_saude BOOLEAN,
    compartilha_lucros BOOLEAN,
    
    -- Parâmetros Ambientais
    fo_valor DECIMAL(5,2), -- Área conservada/regulamentação
    escoamento_valor DECIMAL(5,2),
    consumo_area_valor DECIMAL(10,2), -- Consumo combustível/área
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_forms_indice_sustentabilidade ON forms(indice_sustentabilidade);
CREATE INDEX IF NOT EXISTS idx_forms_indice_economico ON forms(indice_economico);
CREATE INDEX IF NOT EXISTS idx_forms_indice_social ON forms(indice_social);
CREATE INDEX IF NOT EXISTS idx_forms_indice_ambiental ON forms(indice_ambiental);
CREATE INDEX IF NOT EXISTS idx_sustainability_parameters_form_id ON sustainability_parameters(form_id);

-- Criar VIEW para dashboard com índices
CREATE OR REPLACE VIEW dashboard_indices_view AS
SELECT 
    f.id,
    f.user_id,
    pd.name as nome_usuario,
    pr.property_name as nome_fazenda,
    pr.state as estado,
    pr.municipality as municipio,
    f.indice_economico,
    f.indice_social,
    f.indice_ambiental,
    f.indice_sustentabilidade,
    f.created_at,
    f.updated_at
FROM forms f
LEFT JOIN personal_data pd ON f.id = pd.form_id
LEFT JOIN property_data pr ON f.id = pr.form_id
WHERE f.status = 'completed'
    AND f.indice_sustentabilidade IS NOT NULL
ORDER BY f.created_at DESC;

-- Adicionar comentários às colunas
COMMENT ON COLUMN forms.indice_economico IS 'Índice econômico calculado pela lógica fuzzy (0-100)';
COMMENT ON COLUMN forms.indice_social IS 'Índice social calculado pela lógica fuzzy (0-100)';
COMMENT ON COLUMN forms.indice_ambiental IS 'Índice ambiental calculado pela lógica fuzzy (0-100)';
COMMENT ON COLUMN forms.indice_sustentabilidade IS 'Índice de sustentabilidade geral calculado pela lógica fuzzy (0-100)';
