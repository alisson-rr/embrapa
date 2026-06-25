import { supabase } from '@/lib/supabase';

// Benchmark regional: médias de referência por UF (e 'BR' = nacional)
// usadas SOMENTE na seção "Comparação Regional" da página de resultados.
// Não entram no cálculo do índice fuzzy.

export interface RegionalBenchmark {
  id?: string;
  state: string; // 'BR' = nacional; demais = UF (SP, MS...)
  economic_index: number | null;
  social_index: number | null;
  environmental_index: number | null;
  sustainability_index: number | null;
  updated_at?: string | null;
  updated_by?: string | null;
}

// Sigla -> nome (inclui BR = nacional no topo)
export const UF_LIST: { value: string; label: string }[] = [
  { value: 'BR', label: 'Média Nacional' },
  { value: 'AC', label: 'Acre' },
  { value: 'AL', label: 'Alagoas' },
  { value: 'AP', label: 'Amapá' },
  { value: 'AM', label: 'Amazonas' },
  { value: 'BA', label: 'Bahia' },
  { value: 'CE', label: 'Ceará' },
  { value: 'DF', label: 'Distrito Federal' },
  { value: 'ES', label: 'Espírito Santo' },
  { value: 'GO', label: 'Goiás' },
  { value: 'MA', label: 'Maranhão' },
  { value: 'MT', label: 'Mato Grosso' },
  { value: 'MS', label: 'Mato Grosso do Sul' },
  { value: 'MG', label: 'Minas Gerais' },
  { value: 'PA', label: 'Pará' },
  { value: 'PB', label: 'Paraíba' },
  { value: 'PR', label: 'Paraná' },
  { value: 'PE', label: 'Pernambuco' },
  { value: 'PI', label: 'Piauí' },
  { value: 'RJ', label: 'Rio de Janeiro' },
  { value: 'RN', label: 'Rio Grande do Norte' },
  { value: 'RS', label: 'Rio Grande do Sul' },
  { value: 'RO', label: 'Rondônia' },
  { value: 'RR', label: 'Roraima' },
  { value: 'SC', label: 'Santa Catarina' },
  { value: 'SP', label: 'São Paulo' },
  { value: 'SE', label: 'Sergipe' },
  { value: 'TO', label: 'Tocantins' },
];

export const ufLabel = (uf: string): string =>
  UF_LIST.find((u) => u.value === uf)?.label || uf;

// Carrega todos os benchmarks (para o painel admin).
export async function getAllBenchmarks(): Promise<RegionalBenchmark[]> {
  const { data, error } = await supabase
    .from('regional_benchmarks')
    .select('*')
    .order('state', { ascending: true });
  if (error) {
    console.error('Erro ao carregar benchmarks regionais:', error);
    return [];
  }
  return (data || []) as RegionalBenchmark[];
}

// Salva (upsert por UF) uma lista de benchmarks vinda do painel admin.
export async function saveBenchmarks(
  rows: RegionalBenchmark[],
  userId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const payload = rows.map((r) => ({
      state: r.state,
      economic_index: r.economic_index,
      social_index: r.social_index,
      environmental_index: r.environmental_index,
      sustainability_index: r.sustainability_index,
      updated_at: new Date().toISOString(),
      updated_by: userId || null,
    }));
    const { error } = await supabase
      .from('regional_benchmarks')
      .upsert(payload, { onConflict: 'state' });
    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error('Erro ao salvar benchmarks regionais:', error);
    return { success: false, error: error.message };
  }
}

// Busca o benchmark de uma UF, com fallback para a média nacional ('BR').
// Usado pela página de resultados (roda como anon).
export async function getBenchmarkForState(
  uf?: string | null
): Promise<RegionalBenchmark | null> {
  const wanted = (uf || '').toUpperCase();
  const keys = wanted && wanted !== 'BR' ? [wanted, 'BR'] : ['BR'];

  const { data, error } = await supabase
    .from('regional_benchmarks')
    .select('*')
    .in('state', keys);
  if (error || !data || data.length === 0) {
    if (error) console.error('Erro ao buscar benchmark regional:', error);
    return null;
  }

  const hasValues = (b: RegionalBenchmark) =>
    b.economic_index != null ||
    b.social_index != null ||
    b.environmental_index != null ||
    b.sustainability_index != null;

  // Prioriza a UF (se tiver algum valor preenchido); senão cai no nacional.
  const exact = data.find((b) => b.state === wanted);
  if (exact && hasValues(exact)) return exact;
  const national = data.find((b) => b.state === 'BR');
  if (national && hasValues(national)) return national;
  return exact || national || null;
}
