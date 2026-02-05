-- ====================================================
-- SQL PARA VERIFICAR SE AS VIEWS EXISTEM NO SUPABASE
-- ====================================================
-- Execute este SQL primeiro para diagnosticar o problema
-- ====================================================

-- 1. Verificar se as VIEWs existem
SELECT 
    table_name,
    CASE 
        WHEN table_name IN (
            'dashboard_metrics_view',
            'dashboard_activity_distribution_view',
            'dashboard_regional_view',
            'dashboard_recent_responses_view',
            'dashboard_monthly_trends_view',
            'form_responses_view'
        ) THEN '✅ NECESSÁRIA'
        ELSE '❌ EXTRA'
    END as status
FROM information_schema.views
WHERE table_schema = 'public'
  AND table_name LIKE '%view%'
ORDER BY table_name;

-- ====================================================
-- 2. Verificar dados nas tabelas base
-- ====================================================

-- Quantos formulários existem?
SELECT 
    'forms' as tabela,
    COUNT(*) as total_registros,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completos
FROM forms;

-- Quantos dados de propriedade (com estados)?
SELECT 
    'property_data' as tabela,
    COUNT(*) as total_registros,
    COUNT(DISTINCT state) as estados_unicos,
    STRING_AGG(DISTINCT state, ', ') as estados_cadastrados
FROM property_data
WHERE state IS NOT NULL;

-- Quantos dados pessoais?
SELECT 
    'personal_data' as tabela,
    COUNT(*) as total_registros,
    COUNT(DISTINCT form_id) as formularios_vinculados
FROM personal_data;

-- ====================================================
-- 3. Testar queries diretas (sem VIEWs)
-- ====================================================

-- Estados com formulários (query direta)
SELECT 
    COALESCE(prop.state, 'Não informado') AS estado,
    COUNT(DISTINCT f.id) AS total_formularios
FROM forms f
LEFT JOIN property_data prop ON prop.form_id = f.id
WHERE f.status = 'completed'
GROUP BY prop.state
HAVING COUNT(DISTINCT f.id) > 0
ORDER BY total_formularios DESC;

-- Últimas 10 respostas (query direta)
SELECT 
    f.id,
    f.created_at,
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

-- ====================================================
-- DIAGNÓSTICO COMPLETO
-- ====================================================

DO $$
DECLARE
    view_count INTEGER;
    forms_count INTEGER;
BEGIN
    -- Contar VIEWs necessárias
    SELECT COUNT(*) INTO view_count
    FROM information_schema.views
    WHERE table_schema = 'public'
      AND table_name IN (
        'dashboard_metrics_view',
        'dashboard_activity_distribution_view',
        'dashboard_regional_view',
        'dashboard_recent_responses_view',
        'dashboard_monthly_trends_view',
        'form_responses_view'
      );
    
    -- Contar formulários
    SELECT COUNT(*) INTO forms_count FROM forms;
    
    RAISE NOTICE '';
    RAISE NOTICE '==========================================';
    RAISE NOTICE 'DIAGNÓSTICO DO DASHBOARD';
    RAISE NOTICE '==========================================';
    RAISE NOTICE '';
    RAISE NOTICE 'VIEWs encontradas: % de 6 necessárias', view_count;
    RAISE NOTICE 'Formulários no banco: %', forms_count;
    RAISE NOTICE '';
    
    IF view_count < 6 THEN
        RAISE NOTICE '❌ PROBLEMA CRÍTICO: Faltam % VIEWs!', (6 - view_count);
        RAISE NOTICE '';
        RAISE NOTICE 'SOLUÇÃO:';
        RAISE NOTICE '1. Abrir o arquivo: /supabase-migrations/create-all-backoffice-views.sql';
        RAISE NOTICE '2. Copiar TODO o conteúdo';
        RAISE NOTICE '3. Executar no SQL Editor do Supabase';
        RAISE NOTICE '';
    ELSE
        RAISE NOTICE '✅ Todas as VIEWs estão criadas!';
        RAISE NOTICE '';
    END IF;
    
    IF forms_count = 0 THEN
        RAISE NOTICE '⚠️ AVISO: Não há formulários cadastrados no banco!';
        RAISE NOTICE '';
    END IF;
    
    RAISE NOTICE '==========================================';
END $$;
