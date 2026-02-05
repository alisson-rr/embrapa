-- ========================================
-- Adicionar colunas de geolocalização, state e profession
-- ========================================

-- ATENÇÃO: Execute este SQL para adicionar as colunas
-- que são usadas no formulário mas não existem no banco

-- Verificar estrutura atual da tabela forms
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'forms' 
  AND table_schema = 'public'
ORDER BY column_name;

-- Adicionar colunas na tabela forms
ALTER TABLE public.forms 
ADD COLUMN IF NOT EXISTS geolocation TEXT;

ALTER TABLE public.forms 
ADD COLUMN IF NOT EXISTS state VARCHAR(2);

ALTER TABLE public.forms 
ADD COLUMN IF NOT EXISTS birth_place VARCHAR(255);

-- Verificar estrutura atual da tabela personal_data
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'personal_data' 
  AND table_schema = 'public'
ORDER BY column_name;

-- Adicionar coluna profession na tabela personal_data
ALTER TABLE public.personal_data 
ADD COLUMN IF NOT EXISTS profession VARCHAR(100);

-- Verificar estrutura após adição - tabela forms
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'forms' 
  AND table_schema = 'public'
ORDER BY column_name;

-- Verificar estrutura após adição - tabela personal_data
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
