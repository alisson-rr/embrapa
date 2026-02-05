# Sistema de Cálculo de Índices de Sustentabilidade com Lógica Fuzzy

## 📊 Visão Geral

Este sistema implementa cálculos de sustentabilidade usando lógica fuzzy para avaliar propriedades rurais em três dimensões principais:
- **Econômica** 💰
- **Social** 👥  
- **Ambiental** 🌿

## 🧮 Índices Calculados

### 1. Índice Econômico (0-100)
Baseado em:
- **FV**: Valor da fazenda por área produtiva
- **WI**: Salário do proprietário vs média nacional
- **P**: Lucro por hectare
- **DL**: Percentual de despesas/financiamento

### 2. Índice Social (0-100)
Baseado em:
- **Anos de Estudo**: Nível educacional do proprietário
- **JA**: Job Attractiveness (atratividade do trabalho)
- **TC**: Total de cursos e capacitação técnica
- **JQ**: Job Quality (qualidade do emprego)
- **Benefícios**: Plano de saúde, compartilhamento de lucros

### 3. Índice Ambiental (0-100)
Baseado em:
- **FO**: Fração de área conservada vs regulamentação
- **Escoamento**: Balanço hídrico (chuva - evapotranspiração)
- **Consumo de Combustível**: Litros por hectare/ano

### 4. Índice de Sustentabilidade Geral (0-100)
Combinação fuzzy dos três índices anteriores usando regras:
- Se qualquer índice é muito baixo → sustentabilidade baixa
- Se pelo menos 2 índices são médios → sustentabilidade média  
- Se pelo menos 2 índices são altos → sustentabilidade alta

## 🔧 Implementação

### Arquivos Principais

#### 1. `/fuzzy/Fuzzy.py`
Implementação original em Python usando `scikit-fuzzy` com as regras fuzzy completas.

#### 2. `/src/lib/fuzzyCalculations.ts`
Implementação em TypeScript adaptada para o sistema web:
- Funções de pertinência fuzzy simplificadas
- Defuzzificação por centroide
- Integração com Supabase

#### 3. `/docs/add-sustainability-indices.sql`
Script SQL para adicionar as colunas necessárias no banco:
```sql
ALTER TABLE forms 
ADD COLUMN indice_economico DECIMAL(5,2),
ADD COLUMN indice_social DECIMAL(5,2),
ADD COLUMN indice_ambiental DECIMAL(5,2),
ADD COLUMN indice_sustentabilidade DECIMAL(5,2);
```

## 📈 Fluxo de Cálculo

1. **Coleta de Dados**: Formulário em 5 etapas coleta informações
2. **Salvamento**: Dados são salvos no Supabase
3. **Cálculo Fuzzy**: Na última etapa (ambiental), os índices são calculados
4. **Armazenamento**: Índices são salvos na tabela `forms`
5. **Visualização**: Resultados exibidos na página de resultados e dashboard

## 🎯 Como Usar

### 1. Executar o SQL no Supabase
```bash
# Execute o arquivo add-sustainability-indices.sql no Supabase
```

### 2. Importar e usar as funções
```typescript
import { calcularIndices } from '@/lib/fuzzyCalculations';

// Calcular todos os índices para um formulário
const indices = await calcularIndices(formId);
console.log(indices);
// { economico: 75.5, social: 62.3, ambiental: 88.1, sustentabilidade: 75.3 }
```

### 3. Visualizar no Dashboard
Os índices calculados aparecem automaticamente:
- Página de Resultados (`/result/{id}`)
- Dashboard administrativo
- Relatórios de sustentabilidade

## 📊 Dados Regionais

O sistema considera dados específicos por estado brasileiro:

### Regulamentação Ambiental
- **Amazônia Legal**: 80% de área preservada
- **Cerrado**: 35% de área preservada
- **Demais biomas**: 20% de área preservada

### Dados Climáticos
- Precipitação média anual por estado (mm)
- Evapotranspiração média por estado (mm)
- Usados para calcular balanço hídrico

## 🔄 Regras Fuzzy Simplificadas

### Membership Functions
Usamos funções triangulares e trapezoidais:
- **Baixo**: trimf([0, 25, 50])
- **Médio**: trimf([25, 50, 75])
- **Alto**: trapmf([50, 75, 100, 100])

### Defuzzificação
Método do centroide simplificado:
```typescript
const defuzzify = (membership) => {
  const numerator = (membership.low * 25) + 
                    (membership.medium * 50) + 
                    (membership.high * 75);
  const denominator = membership.low + 
                     membership.medium + 
                     membership.high;
  return numerator / denominator;
};
```

## 📝 Notas Importantes

1. **Precisão**: A implementação TypeScript é uma simplificação da versão Python original
2. **Performance**: Cálculos são feitos de forma assíncrona para não bloquear a UI
3. **Fallbacks**: Se algum cálculo falhar, valores padrão (0) são usados
4. **Cache**: Índices são salvos no banco para evitar recálculos

## 🚀 Melhorias Futuras

- [ ] Implementar mais regras fuzzy detalhadas
- [ ] Adicionar gráficos de pertinência fuzzy na UI
- [ ] Permitir ajuste manual de pesos
- [ ] Comparação com médias regionais/nacionais
- [ ] Exportação de relatórios PDF com análise fuzzy
- [ ] API Python com scikit-fuzzy para cálculos mais precisos
