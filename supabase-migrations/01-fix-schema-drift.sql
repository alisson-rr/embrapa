-- ============================================================
-- CORREÇÃO DE DRIFT DE SCHEMA (colunas que o CÓDIGO grava/lê
-- mas que não existem no backup nem nas outras migrações)
-- ============================================================
-- Origem de cada coluna: src/lib/formStepSave.ts (caminho de save ATIVO,
-- usado por todas as páginas do formulário). Sem estas colunas, os INSERT/
-- UPDATE do PostgREST falham com "column ... does not exist" e o formulário
-- quebra logo na Etapa 1.
--
-- Tudo aqui é ADITIVO e idempotente (ADD COLUMN IF NOT EXISTS).
-- Execute DEPOIS de 00-restore-base, TODAS-MIGRACOES-PENDENTES e
-- add-environmental-tables, e ANTES de create-all-backoffice-views.
-- ============================================================

-- ------------------------------------------------------------
-- forms: campos das "Informações Gerais" (saveGeneralInfo)
-- ------------------------------------------------------------
ALTER TABLE public.forms ADD COLUMN IF NOT EXISTS interview_date date;
ALTER TABLE public.forms ADD COLUMN IF NOT EXISTS property_name text;
ALTER TABLE public.forms ADD COLUMN IF NOT EXISTS municipality text;
ALTER TABLE public.forms ADD COLUMN IF NOT EXISTS state text;
ALTER TABLE public.forms ADD COLUMN IF NOT EXISTS geolocation text;
ALTER TABLE public.forms ADD COLUMN IF NOT EXISTS birth_place text;

-- ------------------------------------------------------------
-- personal_data: o código agora grava em 'occupation' (coluna do backup),
-- então NÃO é mais necessária a coluna 'profession'. Nada a fazer aqui.
-- ------------------------------------------------------------

-- ------------------------------------------------------------
-- property_data: detalhe do sistema de produção (savePropertyData)
-- ------------------------------------------------------------
ALTER TABLE public.property_data ADD COLUMN IF NOT EXISTS production_system_detail character varying(100);

-- ------------------------------------------------------------
-- economic_data: campos da Seção 4 (saveEconomicData)
-- (equivale ao add-economic-data-columns.sql)
-- ------------------------------------------------------------
ALTER TABLE public.economic_data ADD COLUMN IF NOT EXISTS management_system_name text;
ALTER TABLE public.economic_data ADD COLUMN IF NOT EXISTS decision_maker_salary numeric(12,2);
ALTER TABLE public.economic_data ADD COLUMN IF NOT EXISTS product_commercialization text;

-- ------------------------------------------------------------
-- social_data: campos extras (saveSocialData)
-- (equivale ao add-social-data-columns.sql, mas SEM dropar colunas)
-- ------------------------------------------------------------
ALTER TABLE public.social_data ADD COLUMN IF NOT EXISTS temporary_employees integer;
ALTER TABLE public.social_data ADD COLUMN IF NOT EXISTS outsourced_average_salary numeric(12,2);

-- ------------------------------------------------------------
-- environmental_data: alarga colunas numeric(5,2) (máx 999,99).
-- A % de matéria orgânica deveria ficar em 0–100, mas um valor
-- digitado errado estourava o limite e quebrava o save inteiro
-- (erro 22003 "numeric field overflow"). Alargar é seguro: não
-- há perda de dados ao ir de (5,2) para (10,2).
-- ------------------------------------------------------------
ALTER TABLE public.environmental_data
  ALTER COLUMN organic_matter_percentage TYPE numeric(10,2);

-- ============================================================
-- NOTAS (não corrigidas aqui — decisão de código, ver chat):
--
-- 1) [CORRIGIDO NO CÓDIGO] formStepSave.ts agora grava em 'occupation'
--    (coluna existente), alinhado com a view form_responses_view.
--
-- 2) [CORRIGIDO NO CÓDIGO] fuzzyCalculations.ts agora persiste em
--    economic_index / social_index / environmental_index /
--    sustainability_index (EN) — as colunas reais lidas pelo dashboard.
--
-- 3) NÃO rode docs/migracao-novo-formulario.sql: é um design
--    abandonado que DROPA livestock_data, cultures_data e
--    pastures_data (que o código usa) e cria tabelas que o código
--    não usa.
-- ============================================================
