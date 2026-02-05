-- ========================================
-- Adicionar colunas que faltam na tabela forms
-- ========================================

-- ATENÇÃO: Execute este SQL para adicionar as colunas
-- que são usadas no formulário mas não existem no banco

-- Verificar estrutura atual da tabela forms
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'forms' 
  AND table_schema = 'public'
ORDER BY column_name;

-- Adicionar colunas que faltam na tabela forms
ALTER TABLE public.forms 
ADD COLUMN IF NOT EXISTS property_name VARCHAR(255);

ALTER TABLE public.forms 
ADD COLUMN IF NOT EXISTS municipality VARCHAR(100);

ALTER TABLE public.forms 
ADD COLUMN IF NOT EXISTS birth_place VARCHAR(255);

ALTER TABLE public.forms 
ADD COLUMN IF NOT EXISTS interview_date DATE;

-- Verificar estrutura após adição
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'forms' 
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
