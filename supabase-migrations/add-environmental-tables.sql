-- Criar tabelas para armazenar os dados de adubos e defensivos da Seção 6

-- Tabela de Adubos NPK por cultura
CREATE TABLE IF NOT EXISTS fertilizers_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  culture TEXT NOT NULL,
  formula TEXT NOT NULL,
  total_quantity TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela de Herbicidas
CREATE TABLE IF NOT EXISTS herbicides_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  culture TEXT NOT NULL,
  herbicides TEXT NOT NULL,
  applications_quantity TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela de Fungicidas
CREATE TABLE IF NOT EXISTS fungicides_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  culture TEXT NOT NULL,
  fungicides TEXT NOT NULL,
  applications TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela de Inseticidas
CREATE TABLE IF NOT EXISTS insecticides_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  culture TEXT NOT NULL,
  insecticides TEXT NOT NULL,
  applications TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela de Outros Defensivos
CREATE TABLE IF NOT EXISTS other_pesticides_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  culture TEXT NOT NULL,
  pesticide_name TEXT NOT NULL,
  applications TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Comentários das tabelas
COMMENT ON TABLE fertilizers_data IS 'Armazena dados de adubos NPK utilizados por cultura';
COMMENT ON TABLE herbicides_data IS 'Armazena dados de herbicidas utilizados por cultura';
COMMENT ON TABLE fungicides_data IS 'Armazena dados de fungicidas utilizados por cultura';
COMMENT ON TABLE insecticides_data IS 'Armazena dados de inseticidas utilizados por cultura';
COMMENT ON TABLE other_pesticides_data IS 'Armazena dados de outros defensivos utilizados por cultura';

-- Índices para melhorar performance nas consultas
CREATE INDEX IF NOT EXISTS idx_fertilizers_form_id ON fertilizers_data(form_id);
CREATE INDEX IF NOT EXISTS idx_herbicides_form_id ON herbicides_data(form_id);
CREATE INDEX IF NOT EXISTS idx_fungicides_form_id ON fungicides_data(form_id);
CREATE INDEX IF NOT EXISTS idx_insecticides_form_id ON insecticides_data(form_id);
CREATE INDEX IF NOT EXISTS idx_other_pesticides_form_id ON other_pesticides_data(form_id);
