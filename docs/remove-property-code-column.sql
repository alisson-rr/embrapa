-- ========================================
-- Remover colunas da tabela forms (se existirem)
-- ========================================

-- ATENÇÃO: Execute este SQL com cuidado!
-- Esta operação é irreversível e apagará todos os dados
-- das colunas da tabela forms.

-- Verificar se as colunas existem antes de remover
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'forms' 
  AND table_schema = 'public'
  AND column_name IN ('property_code', 'interview_date', 'birth_place')
ORDER BY column_name;

-- Remover as colunas (se existirem)
ALTER TABLE public.forms 
DROP COLUMN IF EXISTS property_code;

ALTER TABLE public.forms 
DROP COLUMN IF EXISTS interview_date;

ALTER TABLE public.forms 
DROP COLUMN IF EXISTS birth_place;

-- Verificar se as colunas foram removidas
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
