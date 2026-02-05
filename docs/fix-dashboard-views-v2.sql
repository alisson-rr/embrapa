    -- ================================================
    -- SQL CORRIGIDO V2 - Problemas com JOINs e NULLs
    -- ================================================

    -- DROP das VIEWs antigas
    DROP VIEW IF EXISTS dashboard_recent_responses_view CASCADE;
    DROP VIEW IF EXISTS dashboard_monthly_trends_view CASCADE;
    DROP VIEW IF EXISTS dashboard_metrics_view CASCADE;
    DROP VIEW IF EXISTS dashboard_activity_distribution_view CASCADE;
    DROP VIEW IF EXISTS dashboard_regional_view CASCADE;

    -- ================================================
    -- 1. VIEW de Métricas Gerais (corrigida para incluir formulários incompletos)
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
                CASE 
                    WHEN updated_at > created_at 
                    THEN EXTRACT(EPOCH FROM (updated_at - created_at)) / 60
                    ELSE 0
                END
            )::NUMERIC, 
            0
        ) AS tempo_medio_minutos,
        COALESCE(ROUND(AVG(indice_sustentabilidade)::NUMERIC, 0), 0) AS indice_sustentabilidade_medio,
        COALESCE(ROUND(AVG(indice_economico)::NUMERIC, 0), 0) AS indice_economico_medio,
        COALESCE(ROUND(AVG(indice_social)::NUMERIC, 0), 0) AS indice_social_medio,
        COALESCE(ROUND(AVG(indice_ambiental)::NUMERIC, 0), 0) AS indice_ambiental_medio
    FROM forms;

    -- ================================================
    -- 2. VIEW de Distribuição por Atividade (simplificada)
    -- ================================================
    CREATE OR REPLACE VIEW dashboard_activity_distribution_view AS
    WITH all_activities AS (
        -- Pegar todas as atividades possíveis
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

    -- ================================================
    -- 3. VIEW de Dados Regionais (corrigida para mostrar TODOS os estados com dados)
    -- ================================================
    CREATE OR REPLACE VIEW dashboard_regional_view AS
    SELECT 
        COALESCE(prop.state, 'Não informado') AS estado,
        COUNT(DISTINCT f.id) AS total_formularios,
        COALESCE(ROUND(AVG(f.indice_sustentabilidade)::NUMERIC, 0), 0) AS indice_medio
    FROM forms f
    LEFT JOIN property_data prop ON prop.form_id = f.id
    GROUP BY prop.state
    ORDER BY total_formularios DESC;

    -- ================================================
    -- 4. VIEW de Últimas Respostas (corrigida - incluindo formulários sem índices)
    -- ================================================
    CREATE OR REPLACE VIEW dashboard_recent_responses_view AS
    SELECT 
        f.id,
        f.created_at,
        COALESCE(f.indice_sustentabilidade, 0) AS sustainability_index,
        COALESCE(pd.name, 'Anônimo') AS usuario_nome,
        COALESCE(prop.property_name, 'Propriedade não informada') AS propriedade_nome,
        COALESCE(prop.municipality, 'Cidade não informada') AS municipio,
        COALESCE(prop.state, 'Estado não informado') AS estado
    FROM forms f
    LEFT JOIN personal_data pd ON pd.form_id = f.id
    LEFT JOIN property_data prop ON prop.form_id = f.id
    ORDER BY f.created_at DESC
    LIMIT 10;

    -- ================================================
    -- 5. VIEW de Tendências Mensais (corrigida)
    -- ================================================
    CREATE OR REPLACE VIEW dashboard_monthly_trends_view AS
    SELECT 
        DATE_TRUNC('month', created_at) AS mes,
        COUNT(*) AS total_formularios,
        COALESCE(ROUND(AVG(indice_sustentabilidade)::NUMERIC, 0), 0) AS indice_sustentabilidade,
        COALESCE(ROUND(AVG(indice_economico)::NUMERIC, 0), 0) AS indice_economico,
        COALESCE(ROUND(AVG(indice_social)::NUMERIC, 0), 0) AS indice_social,
        COALESCE(ROUND(AVG(indice_ambiental)::NUMERIC, 0), 0) AS indice_ambiental
    FROM forms
    WHERE created_at >= NOW() - INTERVAL '12 months'
    GROUP BY DATE_TRUNC('month', created_at)
    ORDER BY mes DESC;

    -- ================================================
    -- DEBUG: Verificar se existem dados nas tabelas base
    -- ================================================
    SELECT 'Forms:' as tabela, COUNT(*) as total, 
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completos,
        COUNT(CASE WHEN indice_sustentabilidade IS NOT NULL THEN 1 END) as com_indices
    FROM forms;

    SELECT 'Property Data:' as tabela, COUNT(*) as total,
        COUNT(DISTINCT state) as estados_unicos,
        COUNT(CASE WHEN state = 'SP' OR state = 'São Paulo' THEN 1 END) as sao_paulo
    FROM property_data;

    SELECT 'Personal Data:' as tabela, COUNT(*) as total,
        COUNT(DISTINCT form_id) as forms_vinculados
    FROM personal_data;

    -- Ver últimos 5 formulários com seus dados
    SELECT 
        f.id,
        f.created_at,
        f.status,
        f.indice_sustentabilidade,
        pd.name as usuario,
        prop.state as estado,
        prop.municipality as cidade,
        prop.activity_types as atividades
    FROM forms f
    LEFT JOIN personal_data pd ON pd.form_id = f.id
    LEFT JOIN property_data prop ON prop.form_id = f.id
    ORDER BY f.created_at DESC
    LIMIT 5;
