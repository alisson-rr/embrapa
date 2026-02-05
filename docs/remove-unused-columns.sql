-- ========================================
-- Remover colunas não utilizadas das tabelas
-- ========================================

-- ATENÇÃO: Execute este SQL para remover colunas
-- que não são mais usadas no formulário

-- Verificar estrutura atual da tabela personal_data
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'personal_data' 
  AND table_schema = 'public'
ORDER BY column_name;

-- Remover coluna occupation (substituída por profession)
ALTER TABLE public.personal_data 
DROP COLUMN IF EXISTS occupation;

-- Verificar estrutura após remoção - tabela personal_data
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'personal_data' 
  AND table_schema = 'public'
ORDER BY column_name;

-- ========================================
-- Instruções:
-- 1. Acesse o Supabase Dashboard
-- 2. Vá para SQL Editor
-- 3. Copie e cole este script
-- 4. Execute o script
-- 5. Verifique se não houve erros
-- ========================================
