-- ================================================
-- SQL para corrigir as VIEWs do Dashboard
-- ================================================

-- DROP das VIEWs antigas (se existirem)
DROP VIEW IF EXISTS dashboard_recent_responses_view;
DROP VIEW IF EXISTS dashboard_monthly_trends_view;
DROP VIEW IF EXISTS dashboard_metrics_view;
DROP VIEW IF EXISTS dashboard_activity_distribution_view;
DROP VIEW IF EXISTS dashboard_regional_view;

-- ================================================
-- 1. VIEW de Métricas Gerais
-- ================================================
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
            EXTRACT(EPOCH FROM (updated_at - created_at)) / 60
        )::NUMERIC, 
        0
    ) AS tempo_medio_minutos,
    ROUND(AVG(indice_sustentabilidade)::NUMERIC, 0) AS indice_sustentabilidade_medio,
    ROUND(AVG(indice_economico)::NUMERIC, 0) AS indice_economico_medio,
    ROUND(AVG(indice_social)::NUMERIC, 0) AS indice_social_medio,
    ROUND(AVG(indice_ambiental)::NUMERIC, 0) AS indice_ambiental_medio
FROM forms;

-- ================================================
-- 2. VIEW de Distribuição por Atividade
-- ================================================
CREATE OR REPLACE VIEW dashboard_activity_distribution_view AS
WITH activity_expanded AS (
    SELECT 
        f.id,
        UNNEST(prop.activity_types) AS activity_type
    FROM forms f
    JOIN property_data prop ON prop.form_id = f.id
    WHERE f.status = 'completed' 
        AND prop.activity_types IS NOT NULL
),
activity_counts AS (
    SELECT 
        activity_type,
        COUNT(DISTINCT id) AS total
    FROM activity_expanded
    GROUP BY activity_type
)
SELECT 
    activity_type,
    total,
    ROUND((total::NUMERIC / SUM(total) OVER () * 100), 0) AS percentage
FROM activity_counts
ORDER BY total DESC;

-- ================================================
-- 3. VIEW de Dados Regionais
-- ================================================
CREATE OR REPLACE VIEW dashboard_regional_view AS
SELECT 
    prop.state AS estado,
    COUNT(*) AS total_formularios,
    ROUND(AVG(f.indice_sustentabilidade)::NUMERIC, 0) AS indice_medio
FROM forms f
JOIN property_data prop ON prop.form_id = f.id
WHERE f.status = 'completed'
GROUP BY prop.state
ORDER BY total_formularios DESC;

-- ================================================
-- 4. VIEW de Últimas Respostas (CORRIGIDA)
-- ================================================
CREATE OR REPLACE VIEW dashboard_recent_responses_view AS
SELECT 
    f.id,
    f.created_at,
    f.indice_sustentabilidade AS sustainability_index,  -- Campo corrigido
    pd.name AS usuario_nome,
    prop.property_name AS propriedade_nome,
    prop.municipality AS municipio,
    prop.state AS estado
FROM forms f
LEFT JOIN personal_data pd ON pd.form_id = f.id
LEFT JOIN property_data prop ON prop.form_id = f.id
WHERE f.status = 'completed'
ORDER BY f.created_at DESC
LIMIT 10;

-- ================================================
-- 5. VIEW de Tendências Mensais (CORRIGIDA)
-- ================================================
CREATE OR REPLACE VIEW dashboard_monthly_trends_view AS
SELECT 
    DATE_TRUNC('month', created_at) AS mes,
    COUNT(*) AS total_formularios,
    ROUND(AVG(indice_sustentabilidade)::NUMERIC, 0) AS indice_sustentabilidade,  -- Campos corrigidos
    ROUND(AVG(indice_economico)::NUMERIC, 0) AS indice_economico,
    ROUND(AVG(indice_social)::NUMERIC, 0) AS indice_social,
    ROUND(AVG(indice_ambiental)::NUMERIC, 0) AS indice_ambiental
FROM forms
WHERE status = 'completed'
  AND created_at >= NOW() - INTERVAL '12 months'
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY mes DESC;

-- ================================================
-- Verificar se existem dados
-- ================================================
SELECT 'Total de formulários:' as info, COUNT(*) as total FROM forms;
SELECT 'Formulários completos:' as info, COUNT(*) as total FROM forms WHERE status = 'completed';
SELECT 'Formulários com índices:' as info, COUNT(*) as total FROM forms WHERE indice_sustentabilidade IS NOT NULL;

-- ================================================
-- ALTERNATIVA SIMPLIFICADA (caso a VIEW de atividades ainda dê erro)
-- ================================================
-- Se a VIEW dashboard_activity_distribution_view ainda der erro, use esta versão simplificada:
/*
CREATE OR REPLACE VIEW dashboard_activity_distribution_view AS
SELECT 
    'Agricultura' AS activity_type,
    COUNT(*) AS total,
    ROUND((COUNT(*)::NUMERIC / (SELECT COUNT(*) FROM forms WHERE status = 'completed') * 100), 0) AS percentage
FROM forms f
JOIN property_data prop ON prop.form_id = f.id
WHERE f.status = 'completed' 
    AND 'Agricultura' = ANY(prop.activity_types)
UNION ALL
SELECT 
    'Pecuária' AS activity_type,
    COUNT(*) AS total,
    ROUND((COUNT(*)::NUMERIC / (SELECT COUNT(*) FROM forms WHERE status = 'completed') * 100), 0) AS percentage
FROM forms f
JOIN property_data prop ON prop.form_id = f.id
WHERE f.status = 'completed' 
    AND 'Pecuária' = ANY(prop.activity_types)
UNION ALL
SELECT 
    'Lavoura' AS activity_type,
    COUNT(*) AS total,
    ROUND((COUNT(*)::NUMERIC / (SELECT COUNT(*) FROM forms WHERE status = 'completed') * 100), 0) AS percentage
FROM forms f
JOIN property_data prop ON prop.form_id = f.id
WHERE f.status = 'completed' 
    AND 'Lavoura' = ANY(prop.activity_types)
UNION ALL
SELECT 
    'Integração' AS activity_type,
    COUNT(*) AS total,
    ROUND((COUNT(*)::NUMERIC / (SELECT COUNT(*) FROM forms WHERE status = 'completed') * 100), 0) AS percentage
FROM forms f
JOIN property_data prop ON prop.form_id = f.id
WHERE f.status = 'completed' 
    AND 'Integração' = ANY(prop.activity_types)
ORDER BY total DESC;
*/
