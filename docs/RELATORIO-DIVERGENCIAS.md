# Relatório de Divergências - Formulário x Banco de Dados

**Data:** 22 de Dezembro de 2024

## ✅ ETAPA 1 - Dados Pessoais

### Campos do Formulário:
- name, age, occupation, education, yearsInAgriculture

### Tabela: `personal_data`
- name, age, occupation, education, years_in_agriculture, created_at

### Status: ✅ **CORRETO**
- Todos os campos estão mapeados e sendo salvos corretamente

---

## ⚠️ ETAPA 2 - Dados da Propriedade

### Campos do Formulário:
- totalArea, productionArea, productionSystem, productionSystemDetail, systemUsageTime
- activityTypes, crops, useCoverCrop, coverCropTypes
- pastureTypes, pastureSpecies, useSilage, silageHectares
- forestSpecies, forestArea
- permanentProtectionArea, legalReserveArea

### Tabela: `property_data`
```sql
property_name, municipality, state, total_area, production_area,
permanent_protection_area, legal_reserve_area, activity_types,
integration_system_type, livestock_type, production_system,
system_usage_time, daily_description, pasture_types, use_silage,
silage_hectares, created_at
```

### ❌ PROBLEMAS IDENTIFICADOS:

1. **Campo `state` (UF) está FALTANDO no formulário**
   - A tabela tem a coluna `state` mas o formulário não pergunta
   - Solução: Adicionar campo de Estado na Etapa 1 ou 2

2. **Campo `production_system_detail` não está sendo salvo**
   - O formulário captura mas não salva no banco
   - Tabela não tem esta coluna

3. **Campos de floresta não estão sendo salvos na property_data**
   - forestSpecies e forestArea vão para tabela `forest_strategy` (que pode não existir)

4. **Campos que faltam na tabela:**
   - `production_system_detail` (ILPF, ILP, etc)
   - `cover_crop_usage` (sim/não)
   - `cover_crop_types` (tipos de cultura de cobertura)

---

## ⚠️ ETAPA 3 - Dados Econômicos

### Campos do Formulário:
- grossIncome, financingPercentage, productionCost, propertyValue
- managementSystem, managementSystemName, decisionMakerSalary, productCommercialization

### Tabela: `economic_data`
```sql
gross_income, financing_percentage, production_cost, property_value,
management_system, management_system_name, decision_maker_salary,
product_commercialization, created_at
```

### ❌ PROBLEMA CRÍTICO:

**3 CAMPOS NÃO ESTÃO SENDO SALVOS NO BANCO!**

```typescript
// Arquivo: formStepSave.ts - linha 422-431
const economicRecord = {
  gross_income: parseNumber(data.grossIncome),
  financing_percentage: parseFloat(...),
  production_cost: parseNumber(data.productionCost),
  property_value: parseNumber(data.propertyValue),
  management_system: data.managementSystem
  // NOTA: management_system_name, decision_maker_salary e product_commercialization
  // precisam ser adicionados como colunas na tabela economic_data no Supabase
  // Por enquanto esses dados ficam salvos apenas no localStorage
};
```

**AÇÃO NECESSÁRIA:**
- Executar SQL migration: `/supabase-migrations/add-economic-data-columns.sql`
- Atualizar `saveEconomicData()` para salvar os 3 campos faltantes

---

## ⚠️ ETAPA 4 - Dados Sociais

### Campos do Formulário:
- permanentEmployees, highestEducationEmployee, highestSalary
- lowestEducationEmployee, lowestSalary
- temporaryEmployees, outsourcedAverageSalary

### Tabela: `social_data`
```sql
permanent_employees, highest_education_employee, highest_salary,
lowest_education_employee, lowest_salary, temporary_employees,
outsourced_average_salary, created_at
```

### ❌ PROBLEMA CRÍTICO:

**2 CAMPOS NÃO ESTÃO SENDO SALVOS NO BANCO!**

```typescript
// Arquivo: formStepSave.ts - linha 479-488
const socialRecord = {
  permanent_employees: parseIntSafe(data.permanentEmployees),
  highest_education_employee: data.highestEducationEmployee,
  highest_salary: parseNumber(data.highestSalary),
  lowest_education_employee: data.lowestEducationEmployee,
  lowest_salary: parseNumber(data.lowestSalary)
  // NOTA: temporary_employees e outsourced_average_salary
  // precisam ser adicionados como colunas na tabela social_data no Supabase
  // Por enquanto esses dados ficam salvos apenas no localStorage
};
```

**AÇÃO NECESSÁRIA:**
- Executar SQL migration: `/supabase-migrations/add-social-data-columns.sql`
- Atualizar `saveSocialData()` para salvar os 2 campos faltantes

---

## ⚠️ ETAPA 5 - Dados Ambientais

### Campos do Formulário:
- organicMatterPercentage, calciumQuantity
- **fertilizers[]** (culture, formula, totalQuantity)
- **herbicides[]** (culture, herbicides, applicationsQuantity)
- **fungicides[]** (culture, fungicides, applications)
- **insecticides[]** (culture, insecticides, applications)
- **otherPesticides[]** (culture, pesticideName, applications)
- fuelConsumption, electricityExpense

### Tabelas:
- `environmental_data`: organic_matter_percentage, calcium_quantity, monthly_fuel_consumption, monthly_electricity_expense
- `fertilizers_data`: culture, formula, total_quantity
- `herbicides_data`: culture, herbicides, applications_quantity
- `fungicides_data`: culture, fungicides, applications
- `insecticides_data`: culture, insecticides, applications
- `other_pesticides_data`: culture, pesticide_name, applications

### ❌ PROBLEMA CRÍTICO:

**ARRAYS DE ADUBOS E DEFENSIVOS NÃO ESTÃO SENDO SALVOS!**

```typescript
// Arquivo: formStepSave.ts - linha 536-544
const environmentalRecord = {
  organic_matter_percentage: parseNumber(data.organicMatterPercentage),
  calcium_quantity: parseNumber(data.calciumQuantity),
  monthly_fuel_consumption: parseNumber(data.fuelConsumption),
  monthly_electricity_expense: parseNumber(data.electricityExpense)
  // NOTA: fertilizers, herbicides, fungicides, insecticides, otherPesticides
  // precisam de novas tabelas no Supabase para armazenar arrays
  // Por enquanto esses dados ficam salvos apenas no localStorage
};
```

**AÇÕES NECESSÁRIAS:**
1. Executar SQL migration: `/supabase-migrations/add-environmental-tables.sql`
2. Criar funções para salvar arrays:
   - `saveFertilizersData()`
   - `saveHerbicidesData()`
   - `saveFungicidesData()`
   - `saveInsecticidesData()`
   - `saveOtherPesticidesData()`
3. Atualizar `saveEnvironmentalData()` para chamar essas funções

---

## 📊 RESUMO GERAL

### Campos NÃO sendo salvos no banco:
1. **Economic (3 campos):** management_system_name, decision_maker_salary, product_commercialization
2. **Social (2 campos):** temporary_employees, outsourced_average_salary
3. **Environmental (5 arrays):** fertilizers, herbicides, fungicides, insecticides, otherPesticides

### Campos faltando no formulário:
1. **Property:** Campo "Estado (UF)" não existe

### SQL Migrations Pendentes:
1. ✅ `/supabase-migrations/add-economic-data-columns.sql` (CRIADO)
2. ✅ `/supabase-migrations/add-social-data-columns.sql` (CRIADO)
3. ✅ `/supabase-migrations/add-environmental-tables.sql` (CRIADO)

### Código Pendente de Atualização:
1. ❌ `formStepSave.ts` - `saveEconomicData()` - incluir 3 campos
2. ❌ `formStepSave.ts` - `saveSocialData()` - incluir 2 campos
3. ❌ `formStepSave.ts` - `saveEnvironmentalData()` - criar funções para arrays
4. ❌ `PropertyInfoForm.tsx` - adicionar campo "Estado (UF)"

---

## 🎯 PRÓXIMOS PASSOS

### 1. Executar SQLs no Supabase (URGENTE)
```bash
# No SQL Editor do Supabase, executar na ordem:
1. add-economic-data-columns.sql
2. add-social-data-columns.sql
3. add-environmental-tables.sql
```

### 2. Atualizar código backend (formStepSave.ts)
- Incluir campos faltantes em saveEconomicData
- Incluir campos faltantes em saveSocialData
- Criar funções para salvar arrays de defensivos
- Integrar no saveEnvironmentalData

### 3. Adicionar campo Estado no formulário
- Decidir se vai na Etapa 1 ou 2
- Atualizar interface e validação
