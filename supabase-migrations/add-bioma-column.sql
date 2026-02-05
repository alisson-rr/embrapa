-- ============================================
-- ARQUIVO OBSOLETO - USE O ARQUIVO CONSOLIDADO
-- ============================================
-- Este arquivo foi substituído por:
-- supabase-migrations/TODAS-MIGRACOES-PENDENTES.sql
-- 
-- Execute o arquivo consolidado que contém TODAS as migrações:
-- - Coluna bioma
-- - Correção de pasture_types (ARRAY -> TEXT)
-- - Colunas de floresta
-- - Colunas de cultura de cobertura
-- ============================================

-- Se precisar executar APENAS o bioma, use:
ALTER TABLE public.property_data 
ADD COLUMN IF NOT EXISTS bioma VARCHAR(50);

COMMENT ON COLUMN public.property_data.bioma IS 'Bioma brasileiro: amazonia, caatinga, cerrado, mata-atlantica, pampa, pantanal';
