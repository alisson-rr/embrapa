-- ====================================================
-- SQL CONSOLIDADO - TODAS AS VIEWS DO BACKOFFICE
-- ====================================================
-- Data: 22 de Dezembro de 2024
-- Versão: 3.0 - Corrigido para usar nomes em INGLÊS
-- ====================================================

-- DROP de todas as VIEWs antigas
DROP VIEW IF EXISTS dashboard_recent_responses_view CASCADE;
DROP VIEW IF EXISTS dashboard_monthly_trends_view CASCADE;
DROP VIEW IF EXISTS dashboard_metrics_view CASCADE;
DROP VIEW IF EXISTS dashboard_activity_distribution_view CASCADE;
DROP VIEW IF EXISTS dashboard_regional_view CASCADE;
DROP VIEW IF EXISTS form_responses_view CASCADE;

-- ====================================================
-- SEÇÃO 1: VIEWs para o DASHBOARD
-- ====================================================

-- ====================================================
-- 1. VIEW de Métricas Gerais
-- ====================================================
CREATE OR REPLACE VIEW dashboard_metrics_view AS
SELECT 
    COUNT(*) AS total_formularios,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) AS formularios_completos,
    ROUND(
        (1.0 - COUNT(CASE WHEN status = 'completed' THEN 1 END)::NUMERIC / 
        NULLIF(COUNT(*), 0)::NUMERIC) * 100, 
        0
    ) AS taxa_abandono,
    ROUND(
        AVG(
            CASE 
                WHEN updated_at > created_at 
                THEN EXTRACT(EPOCH FROM (updated_at - created_at)) / 60
                ELSE 0
            END
        )::NUMERIC, 
        0
    ) AS tempo_medio_minutos,
    COALESCE(ROUND(AVG(sustainability_index)::NUMERIC, 0), 0) AS indice_sustentabilidade_medio,
    COALESCE(ROUND(AVG(economic_index)::NUMERIC, 0), 0) AS indice_economico_medio,
    COALESCE(ROUND(AVG(social_index)::NUMERIC, 0), 0) AS indice_social_medio,
    COALESCE(ROUND(AVG(environmental_index)::NUMERIC, 0), 0) AS indice_ambiental_medio
FROM forms;

-- ====================================================
-- 2. VIEW de Distribuição por Atividade
-- ====================================================
CREATE OR REPLACE VIEW dashboard_activity_distribution_view AS
WITH all_activities AS (
    SELECT DISTINCT UNNEST(activity_types) AS activity_type
    FROM property_data
    WHERE activity_types IS NOT NULL
),
activity_counts AS (
    SELECT 
        aa.activity_type,
        COUNT(DISTINCT pd.form_id) AS total
    FROM all_activities aa
    LEFT JOIN property_data pd ON aa.activity_type = ANY(pd.activity_types)
    LEFT JOIN forms f ON f.id = pd.form_id AND f.status = 'completed'
    GROUP BY aa.activity_type
)
SELECT 
    activity_type,
    total,
    ROUND((total::NUMERIC / NULLIF(SUM(total) OVER (), 0) * 100), 0) AS percentage
FROM activity_counts
WHERE total > 0
ORDER BY total DESC;

-- ====================================================
-- 3. VIEW de Dados Regionais (por Estado)
-- ====================================================
CREATE OR REPLACE VIEW dashboard_regional_view AS
SELECT 
    COALESCE(prop.state, 'Não informado') AS estado,
    COUNT(DISTINCT f.id) AS total_formularios,
    COALESCE(ROUND(AVG(f.sustainability_index)::NUMERIC, 0), 0) AS indice_medio
FROM forms f
LEFT JOIN property_data prop ON prop.form_id = f.id
WHERE f.status = 'completed'
GROUP BY prop.state
HAVING COUNT(DISTINCT f.id) > 0
ORDER BY total_formularios DESC;

-- ====================================================
-- 4. VIEW de Últimas Respostas
-- ====================================================
CREATE OR REPLACE VIEW dashboard_recent_responses_view AS
SELECT 
    f.id,
    f.created_at,
    COALESCE(f.sustainability_index, 0) AS sustainability_index,
    COALESCE(pd.name, 'Anônimo') AS usuario_nome,
    COALESCE(prop.property_name, 'Não informada') AS propriedade_nome,
    COALESCE(prop.municipality, 'Não informado') AS municipio,
    COALESCE(prop.state, 'Não informado') AS estado
FROM forms f
LEFT JOIN personal_data pd ON pd.form_id = f.id
LEFT JOIN property_data prop ON prop.form_id = f.id
WHERE f.status = 'completed'
ORDER BY f.created_at ASC
LIMIT 10;

-- ====================================================
-- 5. VIEW de Tendências Mensais (últimos 12 meses)
-- ====================================================
CREATE OR REPLACE VIEW dashboard_monthly_trends_view AS
SELECT 
    DATE_TRUNC('month', created_at) AS mes,
    COUNT(*) AS total_formularios,
    COALESCE(ROUND(AVG(sustainability_index)::NUMERIC, 0), 0) AS indice_sustentabilidade,
    COALESCE(ROUND(AVG(economic_index)::NUMERIC, 0), 0) AS indice_economico,
    COALESCE(ROUND(AVG(social_index)::NUMERIC, 0), 0) AS indice_social,
    COALESCE(ROUND(AVG(environmental_index)::NUMERIC, 0), 0) AS indice_ambiental
FROM forms
WHERE created_at >= NOW() - INTERVAL '12 months'
  AND status = 'completed'
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY mes DESC;

-- ====================================================
-- SEÇÃO 2: VIEW para PÁGINA DE RESPOSTAS
-- ====================================================

-- ====================================================
-- 6. VIEW para Listagem de Respostas dos Formulários
-- ====================================================
CREATE VIEW form_responses_view AS
SELECT 
    -- Dados do formulário
    f.id AS form_id,
    f.user_id,
    f.status,
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
    prop.activity_types AS tipos_atividade,
    prop.livestock_type AS tipo_pecuaria,
    prop.production_system AS sistema_producao,
    
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
ORDER BY 
    f.created_at DESC;

-- ====================================================
-- PERMISSÕES para todas as VIEWs
-- ====================================================

-- Dashboard VIEWs
GRANT SELECT ON dashboard_metrics_view TO authenticated;
GRANT SELECT ON dashboard_metrics_view TO service_role;

GRANT SELECT ON dashboard_activity_distribution_view TO authenticated;
GRANT SELECT ON dashboard_activity_distribution_view TO service_role;

GRANT SELECT ON dashboard_regional_view TO authenticated;
GRANT SELECT ON dashboard_regional_view TO service_role;

GRANT SELECT ON dashboard_recent_responses_view TO authenticated;
GRANT SELECT ON dashboard_recent_responses_view TO service_role;

GRANT SELECT ON dashboard_monthly_trends_view TO authenticated;
GRANT SELECT ON dashboard_monthly_trends_view TO service_role;

-- Form Responses VIEW
GRANT SELECT ON form_responses_view TO authenticated;
GRANT SELECT ON form_responses_view TO service_role;

-- ====================================================
-- VERIFICAÇÃO: Conferir se as VIEWs foram criadas
-- ====================================================

SELECT 
    table_name, 
    table_type
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'VIEW'
  AND table_name LIKE '%view%'
ORDER BY table_name;

-- ====================================================
-- TESTE: Verificar se as VIEWs retornam dados
-- ====================================================

-- Testar VIEW de métricas
SELECT * FROM dashboard_metrics_view;

-- Testar VIEW de atividades
SELECT * FROM dashboard_activity_distribution_view;

-- Testar VIEW regional
SELECT * FROM dashboard_regional_view;

-- Testar VIEW de respostas recentes
SELECT * FROM dashboard_recent_responses_view;

-- Testar VIEW de tendências mensais
SELECT * FROM dashboard_monthly_trends_view;

-- Testar VIEW de respostas de formulários
SELECT * FROM form_responses_view LIMIT 5;

-- ====================================================
-- FIM DO SCRIPT
-- ====================================================
