-- Adicionar novas colunas na tabela social_data para Seção 5

ALTER TABLE social_data
ADD COLUMN IF NOT EXISTS temporary_employees INTEGER,
ADD COLUMN IF NOT EXISTS outsourced_average_salary NUMERIC(12,2);

-- Remover colunas antigas que não são mais usadas
ALTER TABLE social_data
DROP COLUMN IF EXISTS family_members,
DROP COLUMN IF EXISTS family_members_level,
DROP COLUMN IF EXISTS technical_assistance;

-- Comentários das novas colunas
COMMENT ON COLUMN social_data.temporary_employees IS 'Número de funcionários temporários utilizados no último ano safra';
COMMENT ON COLUMN social_data.outsourced_average_salary IS 'Salário médio pago aos funcionários terceirizados';
