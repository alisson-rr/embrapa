-- Script para criar a tabela profiles no Supabase
-- Execute este script no SQL Editor do Supabase Dashboard

-- 1. Criar a tabela profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  user_id    UUID PRIMARY KEY
             REFERENCES auth.users(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  email      TEXT,
  phone      TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT profiles_email_unique UNIQUE (email)
);

-- 2. Criar função para atualizar updated_at automaticamente (se não existir)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Criar trigger para atualizar updated_at na tabela profiles
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- 4. Habilitar Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 5. Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- 6. Criar políticas de segurança
-- Política para usuários verem apenas seu próprio perfil
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Política para usuários inserirem apenas seu próprio perfil
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Política para usuários atualizarem apenas seu próprio perfil
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- 7. (Opcional) Criar índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- 8. (Opcional) Inserir perfis para usuários existentes que ainda não têm perfil
-- IMPORTANTE: Isso cria perfis básicos para todos os usuários existentes
-- Comente esta parte se não quiser criar perfis automaticamente
INSERT INTO public.profiles (user_id, name, email)
SELECT 
  id,
  COALESCE(raw_user_meta_data->>'name', split_part(email, '@', 1)),
  email
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.profiles)
ON CONFLICT (user_id) DO NOTHING;

-- Verificar se a tabela foi criada com sucesso
SELECT 'Tabela profiles criada com sucesso!' AS status;
SELECT COUNT(*) AS total_profiles FROM public.profiles;
