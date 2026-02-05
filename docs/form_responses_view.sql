-- ====================================================
-- VIEW para Respostas dos Formulários
-- ====================================================
-- Esta VIEW une os dados das tabelas forms, personal_data e property_data
-- para facilitar a listagem na tela de Respostas
-- ====================================================

-- Deletar a view se já existir
DROP VIEW IF EXISTS public.form_responses_view;

-- Criar a VIEW
CREATE VIEW public.form_responses_view AS
SELECT 
    -- Dados do formulário
    f.id AS form_id,
    f.user_id,
    f.status,
    f.sustainability_index,
    f.economic_index,
    f.social_index,
    f.environmental_index,
    f.created_at AS data_resposta,
    f.updated_at AS data_atualizacao,
    f.submitted_at AS data_submissao,
    
    -- Dados pessoais do usuário
    pd.name AS nome_usuario,
    pd.age AS idade_usuario,
    pd.occupation AS ocupacao,
    pd.education AS escolaridade,
    pd.years_in_agriculture AS anos_agricultura,
    
    -- Dados da propriedade
    prop.property_name AS nome_fazenda,
    prop.municipality AS municipio,
    prop.state AS estado,
    prop.total_area AS area_total,
    prop.production_area AS area_producao,
    prop.activity_types AS tipos_atividade,
    prop.livestock_type AS tipo_pecuaria,
    prop.production_system AS sistema_producao,
    
    -- Localização formatada
    CONCAT(
        COALESCE(prop.municipality, ''),
        CASE 
            WHEN prop.municipality IS NOT NULL AND prop.state IS NOT NULL THEN ', ' 
            ELSE ''
        END,
        COALESCE(prop.state, '')
    ) AS localizacao,
    
    -- Data formatada (para uso direto na aplicação)
    TO_CHAR(f.created_at, 'DD/MM/YYYY') AS data_formatada,
    TO_CHAR(f.created_at, 'DD/MM/YYYY HH24:MI') AS data_hora_formatada
    
FROM 
    public.forms f
    -- JOIN com personal_data usando form_id = forms.id
    LEFT JOIN public.personal_data pd 
        ON pd.form_id = f.id
    -- JOIN com property_data usando form_id = forms.id
    LEFT JOIN public.property_data prop 
        ON prop.form_id = f.id
ORDER BY 
    f.created_at DESC;

-- ====================================================
-- Permissões da VIEW
-- ====================================================

-- Conceder acesso de leitura para usuários autenticados
GRANT SELECT ON public.form_responses_view TO authenticated;

-- Conceder acesso de leitura para o service_role (Supabase)
GRANT SELECT ON public.form_responses_view TO service_role;

-- ====================================================
-- Comentários para documentação
-- ====================================================

COMMENT ON VIEW public.form_responses_view IS 
'VIEW que une dados das tabelas forms, personal_data e property_data para facilitar a listagem de respostas dos formulários.';

COMMENT ON COLUMN public.form_responses_view.form_id IS 'ID único do formulário';
COMMENT ON COLUMN public.form_responses_view.nome_usuario IS 'Nome completo do usuário que preencheu o formulário';
COMMENT ON COLUMN public.form_responses_view.nome_fazenda IS 'Nome da propriedade/fazenda';
COMMENT ON COLUMN public.form_responses_view.municipio IS 'Município da propriedade';
COMMENT ON COLUMN public.form_responses_view.estado IS 'Estado da propriedade';
COMMENT ON COLUMN public.form_responses_view.localizacao IS 'Localização formatada (Município, Estado)';
COMMENT ON COLUMN public.form_responses_view.data_formatada IS 'Data de preenchimento formatada (DD/MM/YYYY)';
COMMENT ON COLUMN public.form_responses_view.sustainability_index IS 'Índice de sustentabilidade calculado';
COMMENT ON COLUMN public.form_responses_view.sistema_producao IS 'Sistema de produção utilizado';

-- ====================================================
-- Query de exemplo para usar na aplicação
-- ====================================================

/*
-- Buscar todas as respostas:
SELECT * FROM public.form_responses_view;

-- Buscar com filtro de nome:
SELECT * FROM public.form_responses_view 
WHERE nome_usuario ILIKE '%joão%' 
   OR nome_fazenda ILIKE '%joão%';

-- Buscar com paginação:
SELECT * FROM public.form_responses_view 
LIMIT 10 OFFSET 0;

-- Contar total de respostas:
SELECT COUNT(*) FROM public.form_responses_view;

-- Buscar respostas de um período específico:
SELECT * FROM public.form_responses_view 
WHERE data_resposta >= '2024-01-01' 
  AND data_resposta <= '2024-12-31';
*/
