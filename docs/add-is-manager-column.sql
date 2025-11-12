-- Script para adicionar a coluna is_manager na tabela profiles
-- Execute este script no SQL Editor do Supabase Dashboard

-- 1. Adicionar a coluna is_manager
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_manager BOOLEAN NOT NULL DEFAULT false;

-- 2. Criar índice para melhorar performance nas consultas
CREATE INDEX IF NOT EXISTS idx_profiles_is_manager ON public.profiles(is_manager);

-- 3. (Opcional) Atualizar alguns usuários existentes como managers
-- Descomente as linhas abaixo se quiser definir alguns usuários como managers
-- UPDATE public.profiles 
-- SET is_manager = true 
-- WHERE email LIKE '%@embrapa.br';

-- Verificar se a coluna foi adicionada
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar dados
SELECT user_id, name, email, is_manager, created_at 
FROM public.profiles 
LIMIT 5;
