-- Adicionar novas colunas na tabela economic_data para Seção 4

ALTER TABLE economic_data
ADD COLUMN IF NOT EXISTS management_system_name TEXT,
ADD COLUMN IF NOT EXISTS decision_maker_salary NUMERIC(12,2),
ADD COLUMN IF NOT EXISTS product_commercialization TEXT;

-- Comentários das colunas
COMMENT ON COLUMN economic_data.management_system_name IS 'Nome do sistema de gestão utilizado (se management_system = sim)';
COMMENT ON COLUMN economic_data.decision_maker_salary IS 'Valor do salário do tomador de decisão';
COMMENT ON COLUMN economic_data.product_commercialization IS 'Descrição de como é feita a comercialização da produção';
