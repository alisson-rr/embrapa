# VIEWs Necessárias para o Backoffice

**Data:** 22 de Dezembro de 2024

## 📊 Dashboard - 5 VIEWs Obrigatórias

### ❌ PROBLEMA CRÍTICO:
O Dashboard depende de 5 VIEWs que **podem não existir** no Supabase!

### 1️⃣ dashboard_metrics_view
**Campos retornados:**
- total_formularios
- formularios_completos
- taxa_abandono
- tempo_medio_minutos
- indice_sustentabilidade_medio
- indice_economico_medio
- indice_social_medio
- indice_ambiental_medio

**Usado em:** Métricas gerais do Dashboard (cards superiores)

---

### 2️⃣ dashboard_activity_distribution_view
**Campos retornados:**
- activity_type
- total
- percentage

**Usado em:** Gráfico de Pizza - Tipo de categorias

---

### 3️⃣ dashboard_regional_view
**Campos retornados:**
- estado
- total_formularios
- indice_medio

**Usado em:** Gráfico de Barras - Formulários por Estado

---

### 4️⃣ dashboard_recent_responses_view
**Campos retornados:**
- id
- created_at
- sustainability_index
- usuario_nome
- propriedade_nome
- municipio
- estado

**Usado em:** Card "Últimas respostas"

---

### 5️⃣ dashboard_monthly_trends_view
**Campos retornados:**
- mes
- total_formularios
- indice_sustentabilidade
- indice_economico
- indice_social
- indice_ambiental

**Usado em:** Mini gráficos de linha nos cards de índices

---

## 📋 FormResponsesPage - 1 VIEW Obrigatória

### ✅ form_responses_view (JÁ DOCUMENTADA)

**Campos retornados:**
- form_id
- user_id
- status
- sustainability_index
- economic_index
- social_index
- environmental_index
- data_resposta
- data_atualizacao
- data_submissao
- nome_usuario
- idade_usuario
- ocupacao
- escolaridade
- anos_agricultura
- nome_fazenda
- municipio
- estado
- area_total
- area_producao
- tipos_atividade
- tipo_pecuaria
- sistema_producao
- localizacao (formatada)
- data_formatada (DD/MM/YYYY)
- data_hora_formatada (DD/MM/YYYY HH24:MI)

**Status:** ✅ VIEW documentada em `/docs/form_responses_view.sql`

**Usado em:**
- FormResponsesPage.tsx - Listagem de respostas
- Filtros por: município, estado, propriedade, data
- Ordenação por: nome_usuario, nome_fazenda, data_resposta

---

## ⚠️ DIVERGÊNCIA IMPORTANTE: Nomes de Colunas

### Tabela `forms` - VERIFICAR NOMENCLATURA:

**Opção 1: Inglês (atual no schema)**
```sql
sustainability_index
economic_index
social_index
environmental_index
```

**Opção 2: Português (usado nas VIEWs)**
```sql
indice_sustentabilidade
indice_economico
indice_social
indice_ambiental
```

**PROBLEMA:** As VIEWs do Dashboard usam nomes em PORTUGUÊS, mas o schema pode ter em INGLÊS!

---

## 🎯 AÇÕES NECESSÁRIAS:

### 1. Executar SQL das VIEWs do Dashboard
**Arquivo:** `/docs/fix-dashboard-views-v2.sql`
- Contém as 5 VIEWs necessárias
- DROP + CREATE das VIEWs
- Queries de debug para testar

### 2. Verificar Nomes das Colunas da Tabela `forms`
Execute no Supabase SQL Editor:
```sql
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'forms' 
  AND column_name LIKE '%index%' 
  OR column_name LIKE '%indice%';
```

### 3. Se colunas estiverem em INGLÊS, atualizar VIEWs:
- Trocar `indice_sustentabilidade` → `sustainability_index`
- Trocar `indice_economico` → `economic_index`
- Trocar `indice_social` → `social_index`
- Trocar `indice_ambiental` → `environmental_index`

---

## 📝 Checklist de Verificação:

- [ ] Executar `/docs/fix-dashboard-views-v2.sql` no Supabase
- [ ] Executar `/docs/form_responses_view.sql` no Supabase
- [ ] Verificar nomenclatura das colunas na tabela `forms`
- [ ] Ajustar VIEWs se necessário
- [ ] Testar Dashboard no navegador
- [ ] Testar página de Respostas no navegador
- [ ] Verificar se gráficos carregam dados corretamente

---

## 🔍 Como Testar:

1. **Dashboard:**
   - Acessar `/dashboard`
   - Verificar se cards superiores mostram números
   - Verificar se gráfico de pizza carrega
   - Verificar se gráfico de barras (estados) carrega
   - Verificar se "Últimas respostas" mostra dados
   - Verificar se mini gráficos de linha aparecem

2. **Respostas:**
   - Acessar `/form-responses`
   - Verificar se lista de respostas carrega
   - Testar busca por nome
   - Testar filtros (cidade, estado, propriedade, data)
   - Testar ordenação clicando nas colunas
   - Testar paginação

---

## 🚨 SE DASHBOARD NÃO CARREGAR:

1. Abrir Console do navegador (F12)
2. Verificar erros no console
3. Mensagens comuns:
   - "relation dashboard_metrics_view does not exist" → VIEW não foi criada
   - "column indice_sustentabilidade does not exist" → Nome de coluna incorreto
   - "permission denied for view" → Falta permissão GRANT SELECT

4. Verificar no Supabase SQL Editor:
```sql
-- Ver todas as VIEWs existentes:
SELECT table_name 
FROM information_schema.views 
WHERE table_schema = 'public' 
  AND table_name LIKE 'dashboard%';

-- Ver colunas da tabela forms:
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'forms';
```
