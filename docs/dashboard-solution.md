# Análise de Dados Dinâmicos e Solução para Dashboard

## 📊 STATUS ATUAL DAS TELAS DA ÁREA LOGADA

### ✅ TELAS COM DADOS DINÂMICOS (FUNCIONANDO)

#### 1. **FormResponsesPage** (Respostas)
- ✅ Busca dados da VIEW `form_responses_view`
- ✅ Totalmente dinâmico
- ✅ Paginação funcional
- ✅ Busca integrada

#### 2. **PermissionsPage** (Permissionamento)
- ✅ Busca da tabela `profiles`
- ✅ Filtra apenas `is_manager = true`
- ✅ Totalmente dinâmico
- ✅ CRUD completo

#### 3. **SettingsPage** (Configurações)
- ✅ Usa dados do `AuthContext` (profile do usuário logado)
- ✅ Carrega do cache e atualiza do banco
- ✅ Totalmente dinâmico

#### 4. **ResultsPage** (Resultados)
- ✅ Busca dados do formulário específico por ID
- ✅ Query completa com todas as tabelas relacionadas
- ⚠️ **PORÉM**: Os valores dos índices estão fixos no código (79/100)
- ⚠️ **PORÉM**: Os textos e recomendações são estáticos

---

### ⚠️ TELAS COM DADOS PARCIALMENTE DINÂMICOS

#### 5. **Dashboard** (Painel Principal)
- ✅ Busca dados reais da tabela `forms`
- ✅ Calcula métricas baseadas nos dados:
  - Total de respostas
  - Taxa de abandono
  - Índices médios de sustentabilidade
- ⚠️ **PROBLEMAS IDENTIFICADOS**:
  - Tempo médio de preenchimento: **FIXO (25 min)**
  - Últimas respostas: **Limitadas a 5**
  - Gráfico de pizza: **Categorias simplificadas**
  - Mapa do Brasil: **Sem dados reais por região**
  - Mini gráficos de tendência: **Dados simulados**

---

## 🎯 SOLUÇÃO PROPOSTA PARA O DASHBOARD

### **Abordagem: Criar VIEW SQL Otimizada**

A melhor solução é criar uma **VIEW SQL especializada** chamada `dashboard_metrics_view` que:

1. **Pré-calcula todas as métricas necessárias**
2. **Agrupa dados por período, região e categoria**
3. **Otimiza performance** (1 query em vez de várias)
4. **Facilita manutenção** (lógica no banco)

---

## 📋 ESTRUTURA DA VIEW PROPOSTA

### **1. Métricas Gerais**
```sql
- total_formularios: Total de formulários
- formularios_completos: Formulários com status 'completed'
- taxa_abandono: % de formulários não completados
- tempo_medio_preenchimento: Calculado pela diferença entre created_at e submitted_at
- indice_sustentabilidade_medio: Média dos sustainability_index
- indice_economico_medio: Média dos economic_index
- indice_social_medio: Média dos social_index
- indice_ambiental_medio: Média dos environmental_index
```

### **2. Dados por Região**
```sql
- formularios_por_estado: Contagem agrupada por state
- indice_medio_por_estado: Índice de sustentabilidade médio por estado
- propriedades_por_estado: Total de propriedades por estado
```

### **3. Dados por Tipo de Atividade**
```sql
- formularios_por_tipo: Agrupado por activity_types
- distribuicao_agricultura: % de formulários com agricultura
- distribuicao_pecuaria: % de formulários com pecuária
- distribuicao_mista: % de formulários com atividades mistas
```

### **4. Séries Temporais (para gráficos de linha)**
```sql
- formularios_por_mes: Agrupado por mês
- evolucao_indices: Evolução dos índices ao longo do tempo
- tendencias_por_categoria: Tendência de cada métrica
```

### **5. Últimas Respostas**
```sql
- ultimas_10_respostas: JOIN com personal_data e property_data
- inclui: nome, propriedade, data, índice
```

---

## 🏗️ IMPLEMENTAÇÃO SUGERIDA

### **Fase 1: Criar a VIEW Principal**

```sql
CREATE VIEW dashboard_metrics_view AS
SELECT 
    -- Métricas gerais
    COUNT(*) AS total_formularios,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) AS formularios_completos,
    ROUND(
        (COUNT(*) - COUNT(CASE WHEN status = 'completed' THEN 1 END))::DECIMAL / 
        NULLIF(COUNT(*), 0) * 100, 
        2
    ) AS taxa_abandono,
    
    -- Tempo médio de preenchimento (em minutos)
    ROUND(
        AVG(
            EXTRACT(EPOCH FROM (submitted_at - created_at)) / 60
        )::NUMERIC, 
        0
    ) AS tempo_medio_minutos,
    
    -- Índices médios
    ROUND(AVG(sustainability_index)::NUMERIC, 0) AS indice_sustentabilidade_medio,
    ROUND(AVG(economic_index)::NUMERIC, 0) AS indice_economico_medio,
    ROUND(AVG(social_index)::NUMERIC, 0) AS indice_social_medio,
    ROUND(AVG(environmental_index)::NUMERIC, 0) AS indice_ambiental_medio
    
FROM forms
WHERE status = 'completed';
```

### **Fase 2: VIEW para Distribuição por Atividade**

```sql
CREATE VIEW dashboard_activity_distribution_view AS
SELECT 
    activity_type,
    COUNT(*) AS total,
    ROUND((COUNT(*)::DECIMAL / (SELECT COUNT(*) FROM forms WHERE status = 'completed')) * 100, 1) AS percentage
FROM (
    SELECT 
        UNNEST(property_data.activity_types) AS activity_type
    FROM forms
    JOIN property_data ON property_data.form_id = forms.id
    WHERE forms.status = 'completed'
) AS activities
GROUP BY activity_type
ORDER BY total DESC;
```

### **Fase 3: VIEW para Dados Regionais**

```sql
CREATE VIEW dashboard_regional_view AS
SELECT 
    prop.state AS estado,
    COUNT(*) AS total_formularios,
    ROUND(AVG(f.sustainability_index)::NUMERIC, 0) AS indice_medio
FROM forms f
JOIN property_data prop ON prop.form_id = f.id
WHERE f.status = 'completed'
  AND prop.state IS NOT NULL
GROUP BY prop.state
ORDER BY total_formularios DESC;
```

### **Fase 4: VIEW para Últimas Respostas**

```sql
CREATE VIEW dashboard_recent_responses_view AS
SELECT 
    f.id,
    f.created_at,
    f.sustainability_index,
    pd.name AS usuario_nome,
    prop.property_name AS propriedade_nome,
    prop.municipality AS municipio,
    prop.state AS estado
FROM forms f
JOIN personal_data pd ON pd.form_id = f.id
JOIN property_data prop ON prop.form_id = f.id
WHERE f.status = 'completed'
ORDER BY f.created_at DESC
LIMIT 10;
```

### **Fase 5: VIEW para Tendências Mensais**

```sql
CREATE VIEW dashboard_monthly_trends_view AS
SELECT 
    DATE_TRUNC('month', created_at) AS mes,
    COUNT(*) AS total_formularios,
    ROUND(AVG(sustainability_index)::NUMERIC, 0) AS indice_sustentabilidade,
    ROUND(AVG(economic_index)::NUMERIC, 0) AS indice_economico,
    ROUND(AVG(social_index)::NUMERIC, 0) AS indice_social,
    ROUND(AVG(environmental_index)::NUMERIC, 0) AS indice_ambiental
FROM forms
WHERE status = 'completed'
  AND created_at >= NOW() - INTERVAL '12 months'
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY mes DESC;
```

---

## 💻 INTEGRAÇÃO NO FRONTEND

### **Estrutura de Código Sugerida**

```typescript
// Hook customizado para Dashboard
export function useDashboardData() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      // 1. Métricas gerais
      const { data: general } = await supabase
        .from('dashboard_metrics_view')
        .select('*')
        .single();

      // 2. Distribuição por atividade
      const { data: activities } = await supabase
        .from('dashboard_activity_distribution_view')
        .select('*');

      // 3. Dados regionais
      const { data: regional } = await supabase
        .from('dashboard_regional_view')
        .select('*');

      // 4. Últimas respostas
      const { data: recent } = await supabase
        .from('dashboard_recent_responses_view')
        .select('*');

      // 5. Tendências mensais
      const { data: trends } = await supabase
        .from('dashboard_monthly_trends_view')
        .select('*');

      setMetrics({
        general,
        activities,
        regional,
        recent,
        trends
      });
    };

    loadDashboard();
  }, []);

  return { metrics, loading };
}
```

---

## 🎨 MELHORIAS VISUAIS RECOMENDADAS

### **1. Mapa do Brasil**
- Colorir estados baseado em `dashboard_regional_view`
- Tooltip com dados ao passar o mouse
- Graduação de cores por índice de sustentabilidade

### **2. Gráfico de Pizza**
- Usar dados reais de `dashboard_activity_distribution_view`
- Atualizar cores e legendas dinamicamente

### **3. Mini Gráficos (Sparklines)**
- Usar dados de `dashboard_monthly_trends_view`
- Mostrar evolução dos últimos 6 meses

### **4. Cards de Métricas**
- Comparação com período anterior
- Indicador de tendência (↑↓)
- Cores dinâmicas baseadas em performance

---

## 📈 BENEFÍCIOS DA SOLUÇÃO

### **Performance**
- ✅ Queries otimizadas e indexadas
- ✅ Cálculos feitos no banco (mais rápido)
- ✅ Redução de queries no frontend

### **Manutenibilidade**
- ✅ Lógica centralizada no banco
- ✅ Fácil atualização de métricas
- ✅ Reutilizável em outros contextos

### **Escalabilidade**
- ✅ Funciona com qualquer volume de dados
- ✅ Índices podem ser adicionados facilmente
- ✅ Cache pode ser implementado

### **UX**
- ✅ Dados sempre atualizados
- ✅ Dashboard reflete situação real
- ✅ Insights baseados em dados reais

---

## 🚀 PRÓXIMOS PASSOS (QUANDO FOR IMPLEMENTAR)

1. **Criar as VIEWs no Supabase** (rodar scripts SQL)
2. **Criar hook customizado** `useDashboardData()`
3. **Atualizar componente Dashboard.tsx** para usar as VIEWs
4. **Implementar visualizações dinâmicas** (mapa, gráficos)
5. **Adicionar sistema de cache** (opcional, para performance)
6. **Testes com dados reais**

---

## 📝 NOTAS IMPORTANTES

- As VIEWs precisam ser criadas no Supabase SQL Editor
- Índices podem melhorar ainda mais a performance
- Considerar adicionar filtros por período (últimos 30 dias, 6 meses, etc.)
- Pensar em permissões (RLS) para as VIEWs
- Documentar todas as métricas e seus cálculos

---

**Conclusão**: A melhor abordagem é usar VIEWs SQL para pré-calcular as métricas do Dashboard. Isso garante performance, manutenibilidade e dados sempre atualizados, sem sobrecarregar o frontend com cálculos complexos.
