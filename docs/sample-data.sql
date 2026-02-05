-- ====================================================
-- DADOS DE EXEMPLO PARA O SISTEMA EMBRAPA
-- ====================================================
-- Este arquivo contém dados fictícios para testar o sistema
-- Execute este script no SQL Editor do Supabase
-- ====================================================

-- IMPORTANTE: Limpar dados anteriores (CUIDADO: isso apaga tudo!)
-- DELETE FROM pastures_data;
-- DELETE FROM cultures_data;
-- DELETE FROM environmental_data;
-- DELETE FROM social_data;
-- DELETE FROM economic_data;
-- DELETE FROM livestock_data;
-- DELETE FROM property_data;
-- DELETE FROM personal_data;
-- DELETE FROM forms;

-- ====================================================
-- FORMULÁRIO 1 - Fazenda Santa Helena (Pecuária)
-- ====================================================

-- 1.1 - Criar formulário principal
INSERT INTO forms (id, user_id, status, sustainability_index, economic_index, social_index, environmental_index, created_at, submitted_at)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  NULL,
  'completed',
  78,
  72,
  81,
  82,
  NOW() - INTERVAL '15 days',
  NOW() - INTERVAL '15 days'
);

-- 1.2 - Dados pessoais
INSERT INTO personal_data (form_id, name, age, occupation, education, years_in_agriculture)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'João da Silva Santos',
  45,
  'Pecuarista',
  'Ensino Médio Completo',
  20
);

-- 1.3 - Dados da propriedade
INSERT INTO property_data (form_id, property_name, municipality, state, total_area, production_area, permanent_protection_area, legal_reserve_area, activity_types, livestock_type, production_system, system_usage_time, pasture_types, use_silage, silage_hectares)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'Fazenda Santa Helena',
  'Campo Grande',
  'MS',
  500.00,
  350.00,
  75.00,
  125.00,
  ARRAY['Pecuária', 'Agricultura'],
  'Corte',
  'Extensivo',
  12,
  ARRAY['Brachiaria', 'Panicum'],
  true,
  20.00
);

-- 1.4 - Dados do rebanho
INSERT INTO livestock_data (property_data_id, cattle_count, heifer_count, bull_count, calf_count, cattle_weight, heifer_weight, bull_weight, calf_weight, pregnancy_rate, cattle_pasture, heifer_pasture, bull_pasture, calf_pasture)
VALUES (
  (SELECT id FROM property_data WHERE form_id = '11111111-1111-1111-1111-111111111111'),
  250, 80, 30, 60,
  480.5, 350.0, 520.0, 180.0,
  85.5,
  95.0, 100.0, 100.0, 100.0
);

-- 1.5 - Dados econômicos
INSERT INTO economic_data (form_id, gross_income, financing_percentage, production_cost, property_value, management_system)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  850000.00,
  15.5,
  520000.00,
  3500000.00,
  'Profissional com consultoria'
);

-- 1.6 - Dados sociais
INSERT INTO social_data (form_id, permanent_employees, highest_education_employee, highest_salary, lowest_education_employee, lowest_salary, family_members, family_members_level, technical_assistance)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  8,
  'Ensino Superior Completo',
  4500.00,
  'Ensino Fundamental Incompleto',
  1800.00,
  4,
  'Ensino Médio',
  true
);

-- 1.7 - Dados ambientais
INSERT INTO environmental_data (form_id, organic_matter_percentage, calcium_quantity, monthly_fuel_consumption, monthly_electricity_expense)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  3.2,
  450.0,
  1200.0,
  2800.00
);

-- 1.8 - Pastagens
INSERT INTO pastures_data (environmental_data_id, pasture_name, area_hectares, condition)
VALUES 
  ((SELECT id FROM environmental_data WHERE form_id = '11111111-1111-1111-1111-111111111111'), 'Brachiaria Brizantha', 200.0, 'good'),
  ((SELECT id FROM environmental_data WHERE form_id = '11111111-1111-1111-1111-111111111111'), 'Panicum Maximum', 150.0, 'average');


-- ====================================================
-- FORMULÁRIO 2 - Sítio Boa Esperança (Agricultura)
-- ====================================================

INSERT INTO forms (id, user_id, status, sustainability_index, economic_index, social_index, environmental_index, created_at, submitted_at)
VALUES (
  '22222222-2222-2222-2222-222222222222',
  NULL,
  'completed',
  65,
  58,
  72,
  64,
  NOW() - INTERVAL '10 days',
  NOW() - INTERVAL '10 days'
);

INSERT INTO personal_data (form_id, name, age, occupation, education, years_in_agriculture)
VALUES (
  '22222222-2222-2222-2222-222222222222',
  'Maria Oliveira Costa',
  38,
  'Agricultora',
  'Ensino Superior Completo',
  15
);

INSERT INTO property_data (form_id, property_name, municipality, state, total_area, production_area, permanent_protection_area, legal_reserve_area, activity_types, production_system, pasture_types, use_silage)
VALUES (
  '22222222-2222-2222-2222-222222222222',
  'Sítio Boa Esperança',
  'Dourados',
  'MS',
  120.00,
  90.00,
  15.00,
  30.00,
  ARRAY['Agricultura', 'Lavoura'],
  'Convencional',
  ARRAY[]::text[],
  false
);

INSERT INTO economic_data (form_id, gross_income, financing_percentage, production_cost, property_value, management_system)
VALUES (
  '22222222-2222-2222-2222-222222222222',
  320000.00,
  25.0,
  210000.00,
  850000.00,
  'Familiar com apoio técnico'
);

INSERT INTO social_data (form_id, permanent_employees, highest_education_employee, highest_salary, lowest_education_employee, lowest_salary, family_members, family_members_level, technical_assistance)
VALUES (
  '22222222-2222-2222-2222-222222222222',
  3,
  'Ensino Médio Completo',
  2500.00,
  'Ensino Fundamental Completo',
  1600.00,
  5,
  'Ensino Superior',
  true
);

INSERT INTO environmental_data (form_id, organic_matter_percentage, calcium_quantity, monthly_fuel_consumption, monthly_electricity_expense)
VALUES (
  '22222222-2222-2222-2222-222222222222',
  2.8,
  320.0,
  800.0,
  1500.00
);

INSERT INTO cultures_data (environmental_data_id, culture_name, area_hectares, nitrogen_fertilizer, phosphate_fertilizer, potassium_fertilizer, limestone, urea)
VALUES 
  ((SELECT id FROM environmental_data WHERE form_id = '22222222-2222-2222-2222-222222222222'), 'Soja', 50.0, 120.0, 80.0, 60.0, 2000.0, 150.0),
  ((SELECT id FROM environmental_data WHERE form_id = '22222222-2222-2222-2222-222222222222'), 'Milho', 40.0, 180.0, 100.0, 80.0, 1500.0, 200.0);


-- ====================================================
-- FORMULÁRIO 3 - Fazenda São Pedro (Sistema Integrado)
-- ====================================================

INSERT INTO forms (id, user_id, status, sustainability_index, economic_index, social_index, environmental_index, created_at, submitted_at)
VALUES (
  '33333333-3333-3333-3333-333333333333',
  NULL,
  'completed',
  82,
  79,
  85,
  83,
  NOW() - INTERVAL '5 days',
  NOW() - INTERVAL '5 days'
);

INSERT INTO personal_data (form_id, name, age, occupation, education, years_in_agriculture)
VALUES (
  '33333333-3333-3333-3333-333333333333',
  'Carlos Eduardo Ferreira',
  52,
  'Produtor Rural',
  'Pós-graduação',
  28
);

INSERT INTO property_data (form_id, property_name, municipality, state, total_area, production_area, permanent_protection_area, legal_reserve_area, activity_types, integration_system_type, livestock_type, production_system, system_usage_time, pasture_types, use_silage, silage_hectares)
VALUES (
  '33333333-3333-3333-3333-333333333333',
  'Fazenda São Pedro',
  'Maracaju',
  'MS',
  800.00,
  600.00,
  100.00,
  200.00,
  ARRAY['Integração', 'Pecuária', 'Agricultura'],
  'ILPF',
  'Corte e Leite',
  'Semi-intensivo',
  8,
  ARRAY['Brachiaria', 'Panicum', 'Estrela'],
  true,
  35.00
);

INSERT INTO livestock_data (property_data_id, cattle_count, heifer_count, bull_count, calf_count, cattle_weight, heifer_weight, bull_weight, calf_weight, heifer_weight_gain, pregnancy_rate, cattle_pasture, heifer_pasture, bull_pasture, calf_pasture)
VALUES (
  (SELECT id FROM property_data WHERE form_id = '33333333-3333-3333-3333-333333333333'),
  380, 120, 45, 85,
  520.0, 380.0, 580.0, 195.0,
  0.8,
  88.0,
  90.0, 95.0, 100.0, 100.0
);

INSERT INTO economic_data (form_id, gross_income, financing_percentage, production_cost, property_value, management_system)
VALUES (
  '33333333-3333-3333-3333-333333333333',
  1850000.00,
  10.0,
  1120000.00,
  8500000.00,
  'Profissional com tecnologia avançada'
);

INSERT INTO social_data (form_id, permanent_employees, highest_education_employee, highest_salary, lowest_education_employee, lowest_salary, family_members, family_members_level, technical_assistance)
VALUES (
  '33333333-3333-3333-3333-333333333333',
  15,
  'Pós-graduação',
  6500.00,
  'Ensino Médio Incompleto',
  2000.00,
  3,
  'Ensino Superior',
  true
);

INSERT INTO environmental_data (form_id, organic_matter_percentage, calcium_quantity, monthly_fuel_consumption, monthly_electricity_expense)
VALUES (
  '33333333-3333-3333-3333-333333333333',
  4.1,
  580.0,
  1800.0,
  4200.00
);

INSERT INTO cultures_data (environmental_data_id, culture_name, area_hectares, nitrogen_fertilizer, phosphate_fertilizer, potassium_fertilizer, limestone, gypsum, urea)
VALUES 
  ((SELECT id FROM environmental_data WHERE form_id = '33333333-3333-3333-3333-333333333333'), 'Soja', 200.0, 150.0, 100.0, 80.0, 3000.0, 500.0, 180.0),
  ((SELECT id FROM environmental_data WHERE form_id = '33333333-3333-3333-3333-333333333333'), 'Milho', 150.0, 200.0, 120.0, 100.0, 2500.0, 400.0, 250.0),
  ((SELECT id FROM environmental_data WHERE form_id = '33333333-3333-3333-3333-333333333333'), 'Sorgo', 80.0, 100.0, 60.0, 50.0, 1500.0, 200.0, 120.0);

INSERT INTO pastures_data (environmental_data_id, pasture_name, area_hectares, condition)
VALUES 
  ((SELECT id FROM environmental_data WHERE form_id = '33333333-3333-3333-3333-333333333333'), 'Brachiaria Integrada', 150.0, 'good'),
  ((SELECT id FROM environmental_data WHERE form_id = '33333333-3333-3333-3333-333333333333'), 'Panicum com Eucalipto', 100.0, 'good');


-- ====================================================
-- FORMULÁRIO 4 - Chácara Recanto Verde (Pequeno Produtor)
-- ====================================================

INSERT INTO forms (id, user_id, status, sustainability_index, economic_index, social_index, environmental_index, created_at, submitted_at)
VALUES (
  '44444444-4444-4444-4444-444444444444',
  NULL,
  'completed',
  58,
  52,
  65,
  57,
  NOW() - INTERVAL '3 days',
  NOW() - INTERVAL '3 days'
);

INSERT INTO personal_data (form_id, name, age, occupation, education, years_in_agriculture)
VALUES (
  '44444444-4444-4444-4444-444444444444',
  'Ana Paula Rodrigues',
  33,
  'Agricultora Familiar',
  'Ensino Médio Completo',
  10
);

INSERT INTO property_data (form_id, property_name, municipality, state, total_area, production_area, permanent_protection_area, legal_reserve_area, activity_types, production_system, pasture_types, use_silage)
VALUES (
  '44444444-4444-4444-4444-444444444444',
  'Chácara Recanto Verde',
  'Sidrolândia',
  'MS',
  25.00,
  18.00,
  3.00,
  5.00,
  ARRAY['Agricultura', 'Pecuária'],
  'Familiar',
  ARRAY['Nativa'],
  false
);

INSERT INTO economic_data (form_id, gross_income, financing_percentage, production_cost, property_value, management_system)
VALUES (
  '44444444-4444-4444-4444-444444444444',
  75000.00,
  35.0,
  48000.00,
  180000.00,
  'Familiar sem assistência técnica regular'
);

INSERT INTO social_data (form_id, permanent_employees, highest_education_employee, highest_salary, lowest_education_employee, lowest_salary, family_members, family_members_level, technical_assistance)
VALUES (
  '44444444-4444-4444-4444-444444444444',
  1,
  'Ensino Médio Completo',
  1500.00,
  'Ensino Fundamental Incompleto',
  1500.00,
  6,
  'Ensino Médio',
  false
);

INSERT INTO environmental_data (form_id, organic_matter_percentage, calcium_quantity, monthly_fuel_consumption, monthly_electricity_expense)
VALUES (
  '44444444-4444-4444-4444-444444444444',
  2.1,
  180.0,
  350.0,
  580.00
);

INSERT INTO cultures_data (environmental_data_id, culture_name, area_hectares, nitrogen_fertilizer, phosphate_fertilizer, potassium_fertilizer, limestone)
VALUES 
  ((SELECT id FROM environmental_data WHERE form_id = '44444444-4444-4444-4444-444444444444'), 'Hortaliças', 3.0, 50.0, 30.0, 25.0, 500.0),
  ((SELECT id FROM environmental_data WHERE form_id = '44444444-4444-4444-4444-444444444444'), 'Mandioca', 8.0, 40.0, 20.0, 15.0, 800.0);

INSERT INTO pastures_data (environmental_data_id, pasture_name, area_hectares, condition)
VALUES 
  ((SELECT id FROM environmental_data WHERE form_id = '44444444-4444-4444-4444-444444444444'), 'Pastagem Nativa', 7.0, 'average');


-- ====================================================
-- FORMULÁRIO 5 - Fazenda Esperança (Recente)
-- ====================================================

INSERT INTO forms (id, user_id, status, sustainability_index, economic_index, social_index, environmental_index, created_at, submitted_at)
VALUES (
  '55555555-5555-5555-5555-555555555555',
  NULL,
  'completed',
  71,
  68,
  74,
  70,
  NOW() - INTERVAL '1 day',
  NOW() - INTERVAL '1 day'
);

INSERT INTO personal_data (form_id, name, age, occupation, education, years_in_agriculture)
VALUES (
  '55555555-5555-5555-5555-555555555555',
  'Roberto Carlos Almeida',
  48,
  'Pecuarista e Agricultor',
  'Ensino Superior Completo',
  22
);

INSERT INTO property_data (form_id, property_name, municipality, state, total_area, production_area, permanent_protection_area, legal_reserve_area, activity_types, livestock_type, production_system, system_usage_time, pasture_types, use_silage, silage_hectares)
VALUES (
  '55555555-5555-5555-5555-555555555555',
  'Fazenda Esperança',
  'Rio Brilhante',
  'MS',
  650.00,
  480.00,
  85.00,
  130.00,
  ARRAY['Pecuária', 'Agricultura'],
  'Mista',
  'Intensivo',
  6,
  ARRAY['Brachiaria', 'Tanzânia'],
  true,
  28.00
);

INSERT INTO livestock_data (property_data_id, cattle_count, heifer_count, bull_count, calf_count, cattle_weight, heifer_weight, bull_weight, pregnancy_rate, cattle_pasture, heifer_pasture, bull_pasture, calf_pasture)
VALUES (
  (SELECT id FROM property_data WHERE form_id = '55555555-5555-5555-5555-555555555555'),
  310, 95, 38, 72,
  495.0, 365.0, 545.0,
  87.0,
  85.0, 90.0, 100.0, 100.0
);

INSERT INTO economic_data (form_id, gross_income, financing_percentage, production_cost, property_value, management_system)
VALUES (
  '55555555-5555-5555-5555-555555555555',
  1250000.00,
  18.0,
  780000.00,
  5200000.00,
  'Profissional com consultoria'
);

INSERT INTO social_data (form_id, permanent_employees, highest_education_employee, highest_salary, lowest_education_employee, lowest_salary, family_members, family_members_level, technical_assistance)
VALUES (
  '55555555-5555-5555-5555-555555555555',
  10,
  'Ensino Superior Completo',
  5200.00,
  'Ensino Fundamental Completo',
  1900.00,
  4,
  'Ensino Superior',
  true
);

INSERT INTO environmental_data (form_id, organic_matter_percentage, calcium_quantity, monthly_fuel_consumption, monthly_electricity_expense)
VALUES (
  '55555555-5555-5555-5555-555555555555',
  3.5,
  490.0,
  1450.0,
  3200.00
);

INSERT INTO cultures_data (environmental_data_id, culture_name, area_hectares, nitrogen_fertilizer, phosphate_fertilizer, potassium_fertilizer, limestone, urea)
VALUES 
  ((SELECT id FROM environmental_data WHERE form_id = '55555555-5555-5555-5555-555555555555'), 'Soja', 120.0, 140.0, 90.0, 70.0, 2200.0, 170.0),
  ((SELECT id FROM environmental_data WHERE form_id = '55555555-5555-5555-5555-555555555555'), 'Milho Safrinha', 80.0, 160.0, 95.0, 75.0, 1800.0, 190.0);

INSERT INTO pastures_data (environmental_data_id, pasture_name, area_hectares, condition)
VALUES 
  ((SELECT id FROM environmental_data WHERE form_id = '55555555-5555-5555-5555-555555555555'), 'Brachiaria Ruziziensis', 180.0, 'good'),
  ((SELECT id FROM environmental_data WHERE form_id = '55555555-5555-5555-5555-555555555555'), 'Tanzânia', 100.0, 'average');


-- ====================================================
-- VERIFICAÇÃO DOS DADOS INSERIDOS
-- ====================================================

-- Contar registros por tabela
SELECT 'forms' as tabela, COUNT(*) as total FROM forms
UNION ALL
SELECT 'personal_data', COUNT(*) FROM personal_data
UNION ALL
SELECT 'property_data', COUNT(*) FROM property_data
UNION ALL
SELECT 'livestock_data', COUNT(*) FROM livestock_data
UNION ALL
SELECT 'economic_data', COUNT(*) FROM economic_data
UNION ALL
SELECT 'social_data', COUNT(*) FROM social_data
UNION ALL
SELECT 'environmental_data', COUNT(*) FROM environmental_data
UNION ALL
SELECT 'cultures_data', COUNT(*) FROM cultures_data
UNION ALL
SELECT 'pastures_data', COUNT(*) FROM pastures_data;

-- Visualizar dados da VIEW
SELECT * FROM form_responses_view ORDER BY data_resposta DESC;

-- Visualizar métricas do dashboard
SELECT * FROM dashboard_metrics_view;

-- ====================================================
-- FIM DO SCRIPT
-- ====================================================
