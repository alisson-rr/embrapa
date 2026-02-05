-- ========================================
-- Atualizar VIEW e remover colunas não utilizadas
-- ========================================

-- ATENÇÃO: Execute este SQL para atualizar a view que depende
-- da coluna occupation e depois remover a coluna

-- 1. Atualizar a VIEW form_responses_view para usar profession
DROP VIEW IF EXISTS public.form_responses_view;

CREATE VIEW public.form_responses_view AS
SELECT 
    -- Dados do formulário
    f.id AS form_id,
    f.user_id,
    f.status,
    f.property_name AS nome_fazenda,
    f.municipality,
    f.state,
    f.geolocation,
    f.birth_place,
    f.interview_date,
    f.sustainability_index,
    f.economic_index,
    f.social_index,
    f.environmental_index,
    f.created_at AS data_resposta,
    f.updated_at,
    f.submitted_at,
    
    -- Dados pessoais do usuário
    pd.name AS nome_usuario,
    pd.age AS idade_usuario,
    pd.profession AS ocupacao,
    pd.education AS escolaridade,
    pd.years_in_agriculture AS anos_agricultura,
    
    -- Dados da propriedade
    propd.total_area,
    propd.production_area,
    propd.production_system,
    propd.system_usage_time,
    
    -- Dados econômicos
    eco.gross_income,
    eco.financing_percentage,
    eco.production_cost,
    
    -- Dados sociais
    soc.permanent_employees,
    soc.highest_education_employee,
    soc.highest_salary,
    soc.lowest_education_employee,
    soc.lowest_salary,
    
    -- Dados ambientais
    env.organic_matter_percentage,
    env.calcium_quantity,
    env.monthly_fuel_consumption
    
FROM forms f
LEFT JOIN personal_data pd ON f.id = pd.form_id
LEFT JOIN property_data propd ON f.id = propd.form_id
LEFT JOIN economic_data eco ON f.id = eco.form_id
LEFT JOIN social_data soc ON f.id = soc.form_id
LEFT JOIN environmental_data env ON f.id = env.form_id
ORDER BY f.created_at DESC;

-- Conceder permissões para a VIEW atualizada
GRANT SELECT ON public.form_responses_view TO authenticated;
GRANT SELECT ON public.form_responses_view TO service_role;

-- 2. Agora pode remover a coluna occupation
ALTER TABLE public.personal_data 
DROP COLUMN IF EXISTS occupation;

-- 3. Verificar estrutura final
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'personal_data' 
  AND table_schema = 'public'
ORDER BY column_name;

-- 4. Verificar se a VIEW está funcionando
SELECT * FROM public.form_responses_view LIMIT 1;

-- ========================================
-- Instruções:
-- 1. Acesse o Supabase Dashboard
-- 2. Vá para SQL Editor
-- 3. Copie e cole este script
-- 4. Execute o script
-- 5. Verifique se não houve erros
-- ========================================
