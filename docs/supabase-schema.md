# Estrutura de Tabelas do Supabase para o Sistema Embrapa

## Visão Geral

Este documento descreve a estrutura completa de tabelas do Supabase para o sistema de formulários de sustentabilidade da Embrapa.

**Última atualização:** 22 de Dezembro de 2024

## Diagrama de Relacionamentos

```
forms (tabela principal)
├── personal_data (1:1)
├── property_data (1:1)
│   └── livestock_data (1:1) 
├── economic_data (1:1)
├── social_data (1:1)
└── environmental_data (1:1)
    ├── fertilizers_data (1:N)
    ├── herbicides_data (1:N)
    ├── fungicides_data (1:N)
    ├── insecticides_data (1:N)
    └── other_pesticides_data (1:N)

auth.users
└── profiles (1:1)
└── forms (1:N)
```

## Tabelas Principais

### 1. `profiles` - Perfis de Usuários
Armazena informações de perfil dos usuários autenticados.

```sql
CREATE TABLE public.profiles (
  user_id        UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name           TEXT,
  email          TEXT,
  phone          TEXT,
  is_manager     BOOLEAN DEFAULT false,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT profiles_email_unique UNIQUE (email)
);

-- Habilitar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Política para usuários verem apenas seu próprio perfil
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at automaticamente
CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
```

### 2. `forms` - Formulários Principais
Armazena a submissão completa de cada formulário.

```sql
CREATE TABLE public.forms (
  id                    UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id              UUID REFERENCES auth.users(id),
  status               VARCHAR(20) DEFAULT 'draft', -- draft, completed, processed
  property_name        VARCHAR(255),
  municipality         VARCHAR(100),
  state                VARCHAR(2),
  geolocation          TEXT,
  birth_place          VARCHAR(255),
  interview_date       DATE,
  sustainability_index INTEGER,
  economic_index       INTEGER,
  social_index         INTEGER,
  environmental_index  INTEGER,
  created_at           TIMESTAMPTZ DEFAULT NOW(),
  updated_at           TIMESTAMPTZ DEFAULT NOW(),
  submitted_at         TIMESTAMPTZ
);
```

### 2. `personal_data` - Dados Pessoais (Etapa 1)
```sql
CREATE TABLE personal_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  form_id UUID REFERENCES forms(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  age INTEGER,
  profession VARCHAR(100),
  education VARCHAR(100),
  years_in_agriculture INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3. `property_data` - Dados da Propriedade (Etapa 2)
```sql
CREATE TABLE property_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  form_id UUID REFERENCES forms(id) ON DELETE CASCADE,
  property_name VARCHAR(255),
  municipality VARCHAR(100),
  state VARCHAR(2),
  total_area DECIMAL(10,2),
  production_area DECIMAL(10,2),
  permanent_protection_area DECIMAL(10,2),
  legal_reserve_area DECIMAL(10,2),
  activity_types TEXT[], -- Array de tipos de atividade
  integration_system_type VARCHAR(100),
  livestock_type VARCHAR(100),
  production_system VARCHAR(100),
  system_usage_time INTEGER,
  daily_description TEXT,
  pasture_types TEXT[], -- Array de tipos de pastagem
  use_silage BOOLEAN,
  silage_hectares DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 4. `livestock_data` - Dados do Rebanho (Parte da Etapa 2)
```sql
CREATE TABLE livestock_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_data_id UUID REFERENCES property_data(id) ON DELETE CASCADE,
  -- Contagem de animais
  cattle_count INTEGER,
  heifer_count INTEGER,
  bull_count INTEGER,
  calf_count INTEGER,
  bull_calf_count INTEGER,
  -- Peso vivo médio (kg)
  cattle_weight DECIMAL(10,2),
  heifer_weight DECIMAL(10,2),
  bull_weight DECIMAL(10,2),
  calf_weight DECIMAL(10,2),
  bull_calf_weight DECIMAL(10,2),
  -- Ganho de peso médio por dia (kg/dia)
  heifer_weight_gain DECIMAL(10,2),
  bull_weight_gain DECIMAL(10,2),
  calf_weight_gain DECIMAL(10,2),
  -- Digestibilidade da dieta (%)
  cattle_digestibility DECIMAL(5,2),
  heifer_digestibility DECIMAL(5,2),
  bull_digestibility DECIMAL(5,2),
  calf_digestibility DECIMAL(5,2),
  bull_calf_digestibility DECIMAL(5,2),
  -- Taxa de prenhez (%)
  pregnancy_rate DECIMAL(5,2),
  -- Fração do tempo no confinamento (%)
  cattle_confinement DECIMAL(5,2),
  heifer_confinement DECIMAL(5,2),
  bull_confinement DECIMAL(5,2),
  calf_confinement DECIMAL(5,2),
  bull_calf_confinement DECIMAL(5,2),
  -- Fração do tempo na pastagem (%)
  cattle_pasture DECIMAL(5,2),
  heifer_pasture DECIMAL(5,2),
  bull_pasture DECIMAL(5,2),
  calf_pasture DECIMAL(5,2),
  bull_calf_pasture DECIMAL(5,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 5. `economic_data` - Dados Econômicos (Etapa 3)
```sql
CREATE TABLE economic_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  form_id UUID REFERENCES forms(id) ON DELETE CASCADE,
  gross_income DECIMAL(15,2),
  financing_percentage DECIMAL(5,2),
  production_cost DECIMAL(15,2),
  property_value DECIMAL(15,2),
  management_system VARCHAR(100),
  management_system_name VARCHAR(255),
  decision_maker_salary DECIMAL(10,2),
  product_commercialization TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 6. `social_data` - Dados Sociais (Etapa 4)
```sql
CREATE TABLE social_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  form_id UUID REFERENCES forms(id) ON DELETE CASCADE,
  permanent_employees INTEGER,
  highest_education_employee VARCHAR(100),
  highest_salary DECIMAL(10,2),
  lowest_education_employee VARCHAR(100),
  lowest_salary DECIMAL(10,2),
  temporary_employees INTEGER,
  outsourced_average_salary DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 7. `environmental_data` - Dados Ambientais (Etapa 5)
```sql
CREATE TABLE environmental_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  form_id UUID REFERENCES forms(id) ON DELETE CASCADE,
  organic_matter_percentage DECIMAL(5,2),
  calcium_quantity DECIMAL(10,2),
  monthly_fuel_consumption DECIMAL(10,2),
  monthly_electricity_expense DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 8. `fertilizers_data` - Adubos NPK por Cultura (Parte da Etapa 5)
```sql
CREATE TABLE fertilizers_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  form_id UUID REFERENCES forms(id) ON DELETE CASCADE,
  culture TEXT NOT NULL,
  formula TEXT NOT NULL,
  total_quantity TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 9. `herbicides_data` - Herbicidas por Cultura (Parte da Etapa 5)
```sql
CREATE TABLE herbicides_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  form_id UUID REFERENCES forms(id) ON DELETE CASCADE,
  culture TEXT NOT NULL,
  herbicides TEXT NOT NULL,
  applications_quantity TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 10. `fungicides_data` - Fungicidas por Cultura (Parte da Etapa 5)
```sql
CREATE TABLE fungicides_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  form_id UUID REFERENCES forms(id) ON DELETE CASCADE,
  culture TEXT NOT NULL,
  fungicides TEXT NOT NULL,
  applications TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 11. `insecticides_data` - Inseticidas por Cultura (Parte da Etapa 5)
```sql
CREATE TABLE insecticides_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  form_id UUID REFERENCES forms(id) ON DELETE CASCADE,
  culture TEXT NOT NULL,
  insecticides TEXT NOT NULL,
  applications TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 12. `other_pesticides_data` - Outros Defensivos por Cultura (Parte da Etapa 5)
```sql
CREATE TABLE other_pesticides_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  form_id UUID REFERENCES forms(id) ON DELETE CASCADE,
  culture TEXT NOT NULL,
  pesticide_name TEXT NOT NULL,
  applications TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Índices Recomendados

```sql
-- Para busca rápida por usuário
CREATE INDEX idx_forms_user_id ON forms(user_id);
CREATE INDEX idx_forms_status ON forms(status);
CREATE INDEX idx_forms_created_at ON forms(created_at DESC);

-- Para relatórios e análises
CREATE INDEX idx_forms_sustainability_index ON forms(sustainability_index);
CREATE INDEX idx_property_data_state ON property_data(state);
CREATE INDEX idx_property_data_municipality ON property_data(municipality);

-- Para dados relacionados
CREATE INDEX idx_personal_data_form_id ON personal_data(form_id);
CREATE INDEX idx_property_data_form_id ON property_data(form_id);
CREATE INDEX idx_economic_data_form_id ON economic_data(form_id);
CREATE INDEX idx_social_data_form_id ON social_data(form_id);
CREATE INDEX idx_environmental_data_form_id ON environmental_data(form_id);

-- Para novas tabelas de defensivos (Seção 6)
CREATE INDEX idx_fertilizers_form_id ON fertilizers_data(form_id);
CREATE INDEX idx_herbicides_form_id ON herbicides_data(form_id);
CREATE INDEX idx_fungicides_form_id ON fungicides_data(form_id);
CREATE INDEX idx_insecticides_form_id ON insecticides_data(form_id);
CREATE INDEX idx_other_pesticides_form_id ON other_pesticides_data(form_id);

-- Para livestock_data
CREATE INDEX idx_livestock_property_id ON livestock_data(property_data_id);
```

## Row Level Security (RLS)

Para garantir que os dados sejam acessíveis apenas aos usuários corretos:

```sql
-- Habilitar RLS em todas as tabelas
ALTER TABLE forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE personal_data ENABLE ROW LEVEL SECURITY;
-- ... repetir para todas as tabelas

-- Política para usuários autenticados verem apenas seus próprios dados
CREATE POLICY "Users can view own forms" ON forms
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert own forms" ON forms
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update own forms" ON forms
  FOR UPDATE USING (auth.uid() = user_id OR user_id IS NULL);

-- Para formulários públicos (sem user_id)
CREATE POLICY "Public forms are viewable" ON forms
  FOR SELECT USING (user_id IS NULL);
```

## Funções para Cálculo de Índices

```sql
-- Função para calcular índice de sustentabilidade
CREATE OR REPLACE FUNCTION calculate_sustainability_indices(form_id UUID)
RETURNS TABLE (
  economic_index INTEGER,
  social_index INTEGER,
  environmental_index INTEGER,
  sustainability_index INTEGER
)
LANGUAGE plpgsql
AS $$
DECLARE
  eco_idx INTEGER;
  soc_idx INTEGER;
  env_idx INTEGER;
  sus_idx INTEGER;
BEGIN
  -- Lógica de cálculo baseada nos dados coletados
  -- Este é um exemplo simplificado
  
  -- Cálculo do índice econômico
  SELECT 
    CASE 
      WHEN gross_income > 100000 THEN 80
      WHEN gross_income > 50000 THEN 60
      ELSE 40
    END INTO eco_idx
  FROM economic_data ed
  WHERE ed.form_id = $1;
  
  -- Cálculo do índice social
  SELECT 
    CASE 
      WHEN permanent_employees > 10 THEN 70
      WHEN permanent_employees > 5 THEN 55
      ELSE 40
    END INTO soc_idx
  FROM social_data sd
  WHERE sd.form_id = $1;
  
  -- Cálculo do índice ambiental
  SELECT 
    CASE 
      WHEN organic_matter_percentage > 3 THEN 60
      WHEN organic_matter_percentage > 2 THEN 40
      ELSE 20
    END INTO env_idx
  FROM environmental_data ed
  WHERE ed.form_id = $1;
  
  -- Índice geral de sustentabilidade (média ponderada)
  sus_idx := (eco_idx * 0.33 + soc_idx * 0.33 + env_idx * 0.34)::INTEGER;
  
  -- Atualizar a tabela forms com os índices calculados
  UPDATE forms 
  SET 
    economic_index = eco_idx,
    social_index = soc_idx,
    environmental_index = env_idx,
    sustainability_index = sus_idx,
    status = 'processed'
  WHERE id = $1;
  
  RETURN QUERY 
  SELECT eco_idx, soc_idx, env_idx, sus_idx;
END;
$$;
```

## Trigger para Atualização Automática

```sql
-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_forms_updated_at BEFORE UPDATE ON forms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## Implementação no Frontend

Para salvar os dados no Supabase, você pode criar uma função no frontend:

```typescript
import { supabase } from '@/lib/supabase';

export async function submitForm(formData: CompleteFormData) {
  try {
    // 1. Criar o formulário principal
    const { data: form, error: formError } = await supabase
      .from('forms')
      .insert({
        user_id: user?.id || null,
        status: 'completed'
      })
      .select()
      .single();

    if (formError) throw formError;

    // 2. Inserir dados pessoais
    const { error: personalError } = await supabase
      .from('personal_data')
      .insert({
        form_id: form.id,
        ...formData.personalData
      });

    // 3. Inserir dados da propriedade
    const { data: propertyData, error: propertyError } = await supabase
      .from('property_data')
      .insert({
        form_id: form.id,
        ...formData.propertyData
      })
      .select()
      .single();

    // ... continuar para outras tabelas

    // 4. Calcular índices
    const { data: indices } = await supabase
      .rpc('calculate_sustainability_indices', { form_id: form.id });

    return { success: true, formId: form.id, indices };
  } catch (error) {
    console.error('Error submitting form:', error);
    return { success: false, error };
  }
}
```

## Considerações de Performance

1. **Paginação**: Para listagens de formulários, use paginação:
```sql
SELECT * FROM forms 
WHERE user_id = $1 
ORDER BY created_at DESC 
LIMIT 10 OFFSET 0;
```

2. **Cache**: Use o cache do Supabase para queries frequentes
3. **Batch Insert**: Para culturas e pastagens, use insert em lote
4. **Índices**: Mantenha índices apenas nos campos realmente usados em queries

## Backup e Recuperação

Configure backups automáticos no painel do Supabase e considere exportar dados periodicamente:

```sql
-- Export para CSV
COPY (SELECT * FROM forms WHERE created_at > NOW() - INTERVAL '30 days') 
TO '/tmp/forms_export.csv' CSV HEADER;
```

## Monitoramento

Monitore o desempenho das queries usando:
- Supabase Dashboard
- pg_stat_statements
- Logs de slow queries

## VIEW para Respostas dos Formulários

Esta VIEW une os dados das tabelas principais para facilitar a listagem e busca de respostas:

```sql
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
    
    -- Data formatada
    TO_CHAR(f.created_at, 'DD/MM/YYYY') AS data_formatada,
    TO_CHAR(f.created_at, 'DD/MM/YYYY HH24:MI') AS data_hora_formatada
    
FROM 
    public.forms f
    LEFT JOIN public.personal_data pd ON pd.form_id = f.id
    LEFT JOIN public.property_data prop ON prop.form_id = f.id
ORDER BY 
    f.created_at DESC;

-- Permissões
GRANT SELECT ON public.form_responses_view TO authenticated;
GRANT SELECT ON public.form_responses_view TO service_role;
```

### Uso da VIEW na aplicação:

```typescript
// Buscar todas as respostas
const { data, error } = await supabase
  .from('form_responses_view')
  .select('*')
  .order('data_resposta', { ascending: false });

// Buscar com filtro
const { data, error } = await supabase
  .from('form_responses_view')
  .select('*')
  .or(`nome_usuario.ilike.%${searchTerm}%,nome_fazenda.ilike.%${searchTerm}%`);
```
