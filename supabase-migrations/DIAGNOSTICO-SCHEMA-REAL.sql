-- ====================================================
-- DIAGNÓSTICO: VERIFICAR SCHEMA REAL DAS TABELAS
-- ====================================================
-- Execute este SQL para ver EXATAMENTE quais colunas existem
-- ====================================================

-- 1. TABELA FORMS - Ver todas as colunas
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'forms'
ORDER BY ordinal_position;

-- 2. TABELA PROPERTY_DATA - Ver todas as colunas
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'property_data'
ORDER BY ordinal_position;

-- 3. TABELA PERSONAL_DATA - Ver todas as colunas
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'personal_data'
ORDER BY ordinal_position;

-- ====================================================
-- 4. VERIFICAR SE HÁ DADOS NAS TABELAS
-- ====================================================

-- Quantos registros em cada tabela?
SELECT 'forms' as tabela, COUNT(*) as total FROM forms
UNION ALL
SELECT 'property_data', COUNT(*) FROM property_data
UNION ALL
SELECT 'personal_data', COUNT(*) FROM personal_data;

-- ====================================================
-- 5. TESTAR QUERY SIMPLES DE JOIN
-- ====================================================
-- Ver os primeiros 5 registros com JOIN completo

SELECT 
    f.id,
    f.status,
    f.created_at,
    pd.name as nome_pessoa,
    prop.property_name as nome_propriedade,
    prop.state as estado,
    prop.municipality as municipio
FROM forms f
LEFT JOIN personal_data pd ON pd.form_id = f.id
LEFT JOIN property_data prop ON prop.form_id = f.id
ORDER BY f.created_at DESC
LIMIT 5;

-- ====================================================
-- 6. VERIFICAR NOMES DAS COLUNAS DE ÍNDICES
-- ====================================================
-- Descobrir se é sustainability_index OU indice_sustentabilidade

SELECT 
    column_name
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'forms'
  AND (column_name LIKE '%index%' OR column_name LIKE '%indice%');

-- ====================================================
-- 7. VER ESTRUTURA COMPLETA DO ACTIVITY_TYPES
-- ====================================================
-- Descobrir o tipo exato desta coluna

SELECT 
    column_name,
    data_type,
    udt_name
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'property_data'
  AND column_name = 'activity_types';

-- ====================================================
-- 8. SAMPLE DE DADOS REAIS
-- ====================================================

-- Ver exemplo de activity_types
SELECT 
    id,
    activity_types,
    state,
    municipality
FROM property_data
LIMIT 5;
