import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface GeneralMetrics {
  total_formularios: number;
  formularios_completos: number;
  taxa_abandono: number;
  tempo_medio_minutos: number;
  indice_sustentabilidade_medio: number;
  indice_economico_medio: number;
  indice_social_medio: number;
  indice_ambiental_medio: number;
  // Comparações com o período anterior
  total_formularios_change?: number;
  indice_sustentabilidade_change?: number;
  indice_economico_change?: number;
  indice_social_change?: number;
  indice_ambiental_change?: number;
}

interface ActivityDistribution {
  activity_type: string;
  total: number;
  percentage: number;
}

interface RegionalData {
  estado: string;
  total_formularios: number;
  indice_medio: number;
}

interface RecentResponse {
  id: string;
  created_at: string;
  sustainability_index: number;
  usuario_nome: string;
  propriedade_nome: string;
  municipio: string;
  estado: string;
}

interface MonthlyTrend {
  mes: string;
  total_formularios: number;
  indice_sustentabilidade: number;
  indice_economico: number;
  indice_social: number;
  indice_ambiental: number;
}

export interface DashboardData {
  generalMetrics: GeneralMetrics | null;
  activityDistribution: ActivityDistribution[];
  regionalData: RegionalData[];
  recentResponses: RecentResponse[];
  monthlyTrends: MonthlyTrend[];
}

export function useDashboardData() {
  const [data, setData] = useState<DashboardData>({
    generalMetrics: null,
    activityDistribution: [],
    regionalData: [],
    recentResponses: [],
    monthlyTrends: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Carregar todas as VIEWs em paralelo
        const [
          metricsResult,
          activityResult,
          regionalResult,
          recentResult,
          trendsResult
        ] = await Promise.all([
          // 1. Métricas gerais
          supabase
            .from('dashboard_metrics_view')
            .select('*')
            .single(),

          // 2. Distribuição por atividade
          supabase
            .from('dashboard_activity_distribution_view')
            .select('*')
            .order('total', { ascending: false }),

          // 3. Dados regionais
          supabase
            .from('dashboard_regional_view')
            .select('*')
            .order('total_formularios', { ascending: false }),

          // 4. Últimas respostas
          supabase
            .from('dashboard_recent_responses_view')
            .select('*')
            .limit(10),

          // 5. Tendências mensais (últimos 12 meses)
          supabase
            .from('dashboard_monthly_trends_view')
            .select('*')
            .order('mes', { ascending: false })
            .limit(12)
        ]);

        // Verificar erros
        if (metricsResult.error) {
          console.error('Erro ao carregar métricas gerais:', metricsResult.error);
        }
        if (activityResult.error) {
          console.error('Erro ao carregar distribuição por atividade:', activityResult.error);
        }
        if (regionalResult.error) {
          console.error('Erro ao carregar dados regionais:', regionalResult.error);
        }
        if (recentResult.error) {
          console.error('Erro ao carregar respostas recentes:', recentResult.error);
        }
        if (trendsResult.error) {
          console.error('Erro ao carregar tendências:', trendsResult.error);
        }

        // Processar dados das tendências para calcular comparações
        const trends = trendsResult.data || [];
        const currentMonth = trends[0];
        const previousMonth = trends[1];

        // Adicionar comparações às métricas gerais
        let generalMetrics = metricsResult.data;
        if (generalMetrics && currentMonth && previousMonth) {
          // Calcular variação percentual
          const calculateChange = (current: number, previous: number) => {
            if (!previous || previous === 0) return 0;
            return Math.round(((current - previous) / previous) * 100);
          };

          // Adicionar campos de comparação
          generalMetrics = {
            ...generalMetrics,
            total_formularios_change: calculateChange(
              currentMonth.total_formularios,
              previousMonth.total_formularios
            ),
            indice_sustentabilidade_change: calculateChange(
              currentMonth.indice_sustentabilidade,
              previousMonth.indice_sustentabilidade
            ),
            indice_economico_change: calculateChange(
              currentMonth.indice_economico,
              previousMonth.indice_economico
            ),
            indice_social_change: calculateChange(
              currentMonth.indice_social,
              previousMonth.indice_social
            ),
            indice_ambiental_change: calculateChange(
              currentMonth.indice_ambiental,
              previousMonth.indice_ambiental
            )
          };
        }

        setData({
          generalMetrics,
          activityDistribution: activityResult.data || [],
          regionalData: regionalResult.data || [],
          recentResponses: recentResult.data || [],
          monthlyTrends: trends
        });

      } catch (err) {
        console.error('Erro ao carregar dados do dashboard:', err);
        setError('Erro ao carregar dados do dashboard');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();

    // Atualizar a cada 5 minutos
    const interval = setInterval(loadDashboardData, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  // Função para recarregar os dados manualmente
  const refresh = async () => {
    setLoading(true);
    // Reexecutar o effect
    const loadDashboardData = async () => {
      try {
        setError(null);

        const [
          metricsResult,
          activityResult,
          regionalResult,
          recentResult,
          trendsResult
        ] = await Promise.all([
          supabase.from('dashboard_metrics_view').select('*').single(),
          supabase.from('dashboard_activity_distribution_view').select('*').order('total', { ascending: false }),
          supabase.from('dashboard_regional_view').select('*').order('total_formularios', { ascending: false }),
          supabase.from('dashboard_recent_responses_view').select('*').limit(10),
          supabase.from('dashboard_monthly_trends_view').select('*').order('mes', { ascending: false }).limit(12)
        ]);

        const trends = trendsResult.data || [];
        const currentMonth = trends[0];
        const previousMonth = trends[1];

        let generalMetrics = metricsResult.data;
        if (generalMetrics && currentMonth && previousMonth) {
          const calculateChange = (current: number, previous: number) => {
            if (!previous || previous === 0) return 0;
            return Math.round(((current - previous) / previous) * 100);
          };

          generalMetrics = {
            ...generalMetrics,
            total_formularios_change: calculateChange(currentMonth.total_formularios, previousMonth.total_formularios),
            indice_sustentabilidade_change: calculateChange(currentMonth.indice_sustentabilidade, previousMonth.indice_sustentabilidade),
            indice_economico_change: calculateChange(currentMonth.indice_economico, previousMonth.indice_economico),
            indice_social_change: calculateChange(currentMonth.indice_social, previousMonth.indice_social),
            indice_ambiental_change: calculateChange(currentMonth.indice_ambiental, previousMonth.indice_ambiental)
          };
        }

        setData({
          generalMetrics,
          activityDistribution: activityResult.data || [],
          regionalData: regionalResult.data || [],
          recentResponses: recentResult.data || [],
          monthlyTrends: trends
        });
      } catch (err) {
        console.error('Erro ao recarregar dados:', err);
        setError('Erro ao recarregar dados');
      } finally {
        setLoading(false);
      }
    };

    await loadDashboardData();
  };

  return { data, loading, error, refresh };
}
