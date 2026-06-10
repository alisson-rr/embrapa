// ================================================
// Implementação dos cálculos Fuzzy em TypeScript
// Port FIEL do Mamdani do Fuzzy.py (scikit-fuzzy):
//   - mesmas funções de pertinência (trimf/trapmf)
//   - mesmas regras
//   - agregação por max, implicação por min (Mamdani)
//   - defuzzificação por centroide sobre o universo 0..100
//   - mesma normalização final por eixo (constantes do Python)
// ================================================

import { supabase } from '@/lib/supabase';

// Regulamentação ambiental por estado (% de reserva legal obrigatória)
const REGULAMENTACAO: Record<string, number> = {
  AM: 0.8, AC: 0.8, RO: 0.8, RR: 0.8, AP: 0.8, PA: 0.8,
  DF: 0.35, GO: 0.35, MT: 0.35, TO: 0.35, MG: 0.35, MA: 0.35, MS: 0.35,
  RS: 0.2, RJ: 0.2, SP: 0.2, SC: 0.2, PR: 0.2, ES: 0.2,
  BA: 0.2, SE: 0.2, AL: 0.2, PE: 0.2, PB: 0.2, RN: 0.2, CE: 0.2, PI: 0.2,
};

// Chuva média anual por estado (mm)
const CHUVA: Record<string, number> = {
  AM: 2609, AC: 2158, RO: 1950, RR: 1754, AP: 2525, PA: 2252,
  DF: 1478, GO: 1511, MT: 1588, TO: 1619, MG: 1226, MA: 1586, MS: 1219,
  RS: 1635, RJ: 1403, SP: 1450, SC: 1921, PR: 1802, ES: 1309,
  BA: 926, SE: 1068, AL: 1325, PE: 930, PB: 1837, RN: 1214, CE: 1123, PI: 1039,
};

// Evapotranspiração por estado (mm)
const EVAPO: Record<string, number> = {
  AM: 2221, AC: 1958, RO: 1750, RR: 1800, AP: 2182, PA: 2199,
  DF: 1304, GO: 1689, MT: 2066, TO: 2138, MG: 1512, MA: 2181, MS: 2000,
  RS: 1427, RJ: 1722, SP: 1427, SC: 1242, PR: 1378, ES: 1756,
  BA: 1722, SE: 1804, AL: 1711, PE: 1932, PB: 2022, RN: 2062, CE: 1878, PI: 2668,
};

// Anos de estudo do fazendeiro a partir do nível de escolaridade (universo 0..20)
const ANOS_ESTUDO: Record<string, number> = {
  'sem-escolaridade': 0,
  'fundamental-incompleto': 4,
  'fundamental-completo': 9,
  'medio-incompleto': 10,
  'medio-completo': 12,
  'tecnico-incompleto': 12,
  'tecnico-completo': 13,
  'superior-incompleto': 14,
  'superior-completo': 16,
  'pos-graduacao': 18,
};

// ================================================
// Funções de pertinência (iguais ao skfuzzy)
// ================================================
const trimf = (x: number, a: number, b: number, c: number): number => {
  if (x <= a || x >= c) return 0;
  if (x < b) return b === a ? 1 : (x - a) / (b - a);
  if (x > b) return c === b ? 1 : (c - x) / (c - b);
  return 1; // x === b
};

const trapmf = (x: number, a: number, b: number, c: number, d: number): number => {
  if (x <= a || x >= d) return 0;
  if (x >= b && x <= c) return 1;
  if (x < b) return b === a ? 1 : (x - a) / (b - a);
  return d === c ? 1 : (d - x) / (d - c);
};

const clamp = (v: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, v));

const num = (v: unknown): number => {
  const n = typeof v === 'string' ? parseFloat(v) : (v as number);
  return n == null || Number.isNaN(n) ? 0 : n;
};

// ================================================
// Saída comum (indice_*): mesmos conjuntos para os 3 eixos e sustentabilidade
//   muito_baixo trimf[0,0,25] | baixo trimf[0,25,50]
//   medio trimf[25,50,75]     | alto trapmf[50,75,100,100]
// Defuzzificação por centroide sobre 0..100 (passo 1), implicação Mamdani (min).
// ================================================
type OutStrength = { mb: number; b: number; m: number; a: number };

const defuzzCentroid = (s: OutStrength): number => {
  let numr = 0;
  let den = 0;
  for (let x = 0; x <= 100; x += 1) {
    const agg = Math.max(
      Math.min(s.mb, trimf(x, 0, 0, 25)),
      Math.min(s.b, trimf(x, 0, 25, 50)),
      Math.min(s.m, trimf(x, 25, 50, 75)),
      Math.min(s.a, trapmf(x, 50, 75, 100, 100)),
    );
    numr += x * agg;
    den += agg;
  }
  return den === 0 ? 0 : numr / den;
};

// Aplica uma regra: out[label] = max(out[label], força)
const fire = (out: OutStrength, label: keyof OutStrength, strength: number): void => {
  out[label] = Math.max(out[label], strength);
};

// ================================================
// Interface dos dados lidos do banco
// ================================================
interface FormData {
  personal_data: { education: string }[];
  property_data: {
    total_area: number;
    production_area: number;
    state: string;
    system_usage_time: number;
  }[];
  economic_data: {
    gross_income: number;
    production_cost: number;
    property_value: number;
    financing_percentage: number;
    decision_maker_salary: number;
  }[];
  social_data: {
    permanent_employees: number;
    temporary_employees: number;
    oldest_family_member_age: number;
    youngest_family_member_age: number;
    operational_courses: number;
    technical_courses: number;
    specialization_courses: number;
    has_profit_sharing: boolean;
    has_health_plan: boolean;
  }[];
  environmental_data: { monthly_fuel_consumption: number }[];
}

// ================================================
// ÍNDICE ECONÔMICO
// ================================================
export function calcularIndiceEconomico(formData: FormData): number {
  try {
    const e = formData.economic_data?.[0];
    const p = formData.property_data?.[0];
    if (!e || !p) return 0;

    const prodArea = num(p.production_area);
    const tempo = num(p.system_usage_time);

    // FV = (Valor da fazenda / Área produtiva)^(1/Tempo no sistema)   universo 0..120
    const FV = prodArea > 0 && tempo > 0
      ? clamp(Math.pow(num(e.property_value) / prodArea, 1 / tempo), 0, 120)
      : 0;
    // P = Lucro por hectare   universo 0..7000
    const P = prodArea > 0
      ? clamp((num(e.gross_income) - num(e.production_cost)) / prodArea, 0, 7000)
      : 0;
    // DL = % da receita em financiamento   universo 0..1
    const DL = clamp(num(e.financing_percentage) / 100, 0, 1);
    // WI = Salário do tomador de decisão / salário médio (3225)   universo 0..11
    const WI = clamp(num(e.decision_maker_salary) / 3225, 0, 11);

    const fv = {
      mb: trimf(FV, 0, 1, 2), b: trimf(FV, 1, 3, 10), m: trimf(FV, 8, 20, 40),
      a: trimf(FV, 30, 60, 90), ma: trapmf(FV, 80, 100, 120, 120),
    };
    const wi = {
      mb: trimf(WI, 0, 1, 2), b: trimf(WI, 1, 2, 4), m: trimf(WI, 3, 4, 6),
      a: trimf(WI, 5, 7, 9), ma: trapmf(WI, 8, 9, 11, 11),
    };
    const pp = {
      mb: trimf(P, 0, 100, 1000), b: trimf(P, 500, 1500, 2500), m: trimf(P, 2000, 3500, 5000),
      a: trimf(P, 4500, 5500, 6500), ma: trapmf(P, 6000, 6700, 7000, 7000),
    };
    const dl = {
      mb: trimf(DL, 0, 0, 0.1), b: trimf(DL, 0.05, 0.15, 0.3), m: trimf(DL, 0.2, 0.35, 0.5),
      a: trimf(DL, 0.4, 0.6, 0.8), ma: trapmf(DL, 0.7, 0.85, 1, 1),
    };

    const out: OutStrength = { mb: 0, b: 0, m: 0, a: 0 };
    fire(out, 'mb', dl.ma); fire(out, 'b', dl.a); fire(out, 'm', dl.m); fire(out, 'a', dl.b); fire(out, 'a', dl.mb);
    fire(out, 'a', wi.ma); fire(out, 'a', wi.a); fire(out, 'm', wi.m); fire(out, 'b', wi.b); fire(out, 'mb', wi.mb);
    fire(out, 'a', pp.ma); fire(out, 'a', pp.a); fire(out, 'm', pp.m); fire(out, 'b', pp.b); fire(out, 'mb', pp.mb);
    fire(out, 'a', fv.ma); fire(out, 'a', fv.a); fire(out, 'm', fv.m); fire(out, 'b', fv.b); fire(out, 'mb', fv.mb);

    const raw = defuzzCentroid(out);
    return clamp((raw - 8.333333333333332) * 100 / (80.55555555555556 - 8.333333333333332), 0, 100);
  } catch (error) {
    console.error('Erro ao calcular índice econômico:', error);
    return 0;
  }
}

// ================================================
// ÍNDICE SOCIAL
// ================================================
export function calcularIndiceSocial(formData: FormData): number {
  try {
    const s = formData.social_data?.[0];
    const pers = formData.personal_data?.[0];
    if (!s || !pers) return 0;

    const anosEstudo = clamp(ANOS_ESTUDO[pers.education] ?? 8, 0, 20);
    const iv = num(s.oldest_family_member_age);
    const inn = num(s.youngest_family_member_age);
    const JA = iv > 0 ? clamp(inn / iv, 0, 1) : 0;
    const TC = clamp(
      num(s.operational_courses) + 2 * num(s.technical_courses) + 3 * num(s.specialization_courses),
      0, 20,
    );
    const temp = num(s.temporary_employees);
    const JQ = clamp((num(s.permanent_employees) / (temp + 1)) / (temp + 1), 0, 20);
    const planoSaude = s.has_health_plan ? 1 : 0;
    const compartilhaLucros = s.has_profit_sharing ? 1 : 0;

    const ae = {
      mb: trimf(anosEstudo, 0, 0, 5), b: trimf(anosEstudo, 3, 5, 8), m: trimf(anosEstudo, 6, 9, 13),
      a: trimf(anosEstudo, 10, 13, 16), ma: trapmf(anosEstudo, 13, 16, 20, 20),
    };
    const ja = {
      mb: trimf(JA, 0, 0, 0.2), b: trimf(JA, 0.1, 0.25, 0.4), m: trimf(JA, 0.3, 0.45, 0.6),
      a: trimf(JA, 0.5, 0.65, 0.8), ma: trapmf(JA, 0.7, 0.85, 1, 1),
    };
    const tc = {
      mb: trimf(TC, 0, 0, 4), b: trimf(TC, 2, 5, 8), m: trimf(TC, 8, 10, 12),
      a: trimf(TC, 10, 12, 14), ma: trapmf(TC, 12, 16, 20, 20),
    };
    const jq = {
      mb: trimf(JQ, 0, 0, 4), b: trimf(JQ, 2, 5, 8), m: trimf(JQ, 8, 10, 12),
      a: trimf(JQ, 10, 12, 14), ma: trapmf(JQ, 12, 16, 20, 20),
    };
    const ps = { nao: trimf(planoSaude, 0, 0, 0.5), sim: trimf(planoSaude, 0.5, 1, 1) };
    const cl = { nao: trimf(compartilhaLucros, 0, 0, 0.5), sim: trimf(compartilhaLucros, 0.5, 1, 1) };

    const out: OutStrength = { mb: 0, b: 0, m: 0, a: 0 };
    fire(out, 'mb', ja.ma); fire(out, 'b', ja.a); fire(out, 'm', ja.m); fire(out, 'a', ja.b); fire(out, 'a', ja.mb);
    fire(out, 'a', ae.a); fire(out, 'm', ae.m); fire(out, 'b', ae.b); fire(out, 'mb', ae.mb); fire(out, 'a', ae.ma);
    fire(out, 'a', cl.sim); fire(out, 'b', cl.nao);
    fire(out, 'a', Math.max(jq.a, jq.ma)); fire(out, 'm', jq.m); fire(out, 'b', Math.max(jq.b, jq.mb));
    fire(out, 'm', tc.m); fire(out, 'a', Math.max(tc.a, tc.ma)); fire(out, 'b', Math.max(tc.b, tc.mb));
    fire(out, 'a', ps.sim); fire(out, 'b', ps.nao);

    const raw = defuzzCentroid(out);
    return clamp((raw - 20.83066751972702) * 100 / (80.55555555555556 - 20.83066751972702), 0, 100);
  } catch (error) {
    console.error('Erro ao calcular índice social:', error);
    return 0;
  }
}

// ================================================
// ÍNDICE AMBIENTAL
// ================================================
export function calcularIndiceAmbiental(formData: FormData): number {
  try {
    const p = formData.property_data?.[0];
    const env = formData.environmental_data?.[0];
    if (!p || !env) return 0;

    const estado = (p.state || 'SP').toUpperCase();
    const totalArea = num(p.total_area);
    const prodArea = num(p.production_area);

    // FO = %área conservada / regulamentação   universo 0..1
    const reg = REGULAMENTACAO[estado] || 0.2;
    const FO = totalArea > 0
      ? clamp(((totalArea - prodArea) / totalArea) / reg, 0, 1)
      : 0;
    // Escoamento = (chuva - evapo)/chuva   universo -1..1
    const chuva = CHUVA[estado] || 1500;
    const evapo = EVAPO[estado] || 1500;
    const Escoamento = clamp((chuva - evapo) / chuva, -1, 1);
    // consumo_area = combustível anual / área total   universo 0..40
    const consumoArea = totalArea > 0
      ? clamp((num(env.monthly_fuel_consumption) * 12) / totalArea, 0, 40)
      : 0;

    const fo = {
      mb: trimf(FO, 0, 0, 0.1), b: trimf(FO, 0.05, 0.15, 0.3), m: trimf(FO, 0.2, 0.35, 0.5),
      a: trimf(FO, 0.4, 0.6, 0.8), ma: trapmf(FO, 0.7, 0.85, 1, 1),
    };
    const esc = {
      ma: trimf(Escoamento, -1, -1, -0.2), a: trimf(Escoamento, -0.3, -0.1, 0.1),
      m: trimf(Escoamento, 0, 0.2, 0.4), b: trimf(Escoamento, 0.3, 0.5, 0.7),
      mb: trapmf(Escoamento, 0.6, 0.8, 1, 1),
    };
    const co = {
      mb: trimf(consumoArea, 0, 0, 3), b: trimf(consumoArea, 1, 4, 8), m: trimf(consumoArea, 6, 10, 15),
      a: trimf(consumoArea, 12, 18, 25), ma: trapmf(consumoArea, 20, 28, 40, 40),
    };

    const out: OutStrength = { mb: 0, b: 0, m: 0, a: 0 };
    // Escoamento
    fire(out, 'a', esc.m);
    fire(out, 'm', Math.max(esc.b, esc.a));
    fire(out, 'b', Math.max(esc.mb, esc.ma));
    // FO  (no Python apontava p/ indice_economico por bug; aqui aponta p/ ambiental)
    fire(out, 'b', fo.b);
    fire(out, 'mb', fo.mb);
    fire(out, 'a', fo.a);
    fire(out, 'a', fo.ma);
    fire(out, 'm', fo.m);
    // consumo_area
    fire(out, 'a', co.mb);
    fire(out, 'a', co.b);
    fire(out, 'm', co.m);
    fire(out, 'b', co.a);
    fire(out, 'mb', co.ma);

    const raw = defuzzCentroid(out);
    return clamp((raw - 20.83066751972702) * 100 / (80.55555555555556 - 20.83066751972702), 0, 100);
  } catch (error) {
    console.error('Erro ao calcular índice ambiental:', error);
    return 0;
  }
}

// ================================================
// ÍNDICE DE SUSTENTABILIDADE (combina os 3, 0..100)
// ================================================
export function calcularIndiceSustentabilidade(economico: number, social: number, ambiental: number): number {
  try {
    const sets = (v: number) => ({
      mb: trimf(v, 0, 0, 25), b: trimf(v, 0, 25, 50), m: trimf(v, 25, 50, 75), a: trapmf(v, 50, 75, 100, 100),
    });
    const ec = sets(clamp(economico, 0, 100));
    const so = sets(clamp(social, 0, 100));
    const am = sets(clamp(ambiental, 0, 100));

    const out: OutStrength = { mb: 0, b: 0, m: 0, a: 0 };
    // Regra 1: algum muito baixo -> muito baixo
    fire(out, 'mb', Math.max(ec.mb, so.mb, am.mb));
    // Regra 2: algum baixo -> baixo
    fire(out, 'b', Math.max(ec.b, so.b, am.b));
    // Regra 3: pelo menos dois médios -> médio
    fire(out, 'm', Math.max(
      Math.min(ec.m, so.m), Math.min(ec.m, am.m), Math.min(so.m, am.m),
    ));
    // Regra 4: pelo menos dois altos -> alto
    fire(out, 'a', Math.max(
      Math.min(ec.a, so.a), Math.min(ec.a, am.a), Math.min(so.a, am.a),
    ));

    const raw = defuzzCentroid(out);
    return clamp((raw - 8.33) * 100 / (80.56 - 8.33), 0, 100);
  } catch (error) {
    console.error('Erro ao calcular índice de sustentabilidade:', error);
    return 0;
  }
}

// ================================================
// FUNÇÃO PRINCIPAL — busca dados, calcula, persiste e retorna
// ================================================
export async function calcularIndices(formId: string): Promise<{
  economico: number;
  social: number;
  ambiental: number;
  sustentabilidade: number;
}> {
  try {
    const { data: formData, error } = await supabase
      .from('forms')
      .select(`
        *,
        personal_data(*),
        property_data(*),
        economic_data(*),
        social_data(*),
        environmental_data(*)
      `)
      .eq('id', formId)
      .single();

    if (error || !formData) {
      throw new Error('Erro ao buscar dados do formulário');
    }

    const indiceEconomico = calcularIndiceEconomico(formData);
    const indiceSocial = calcularIndiceSocial(formData);
    const indiceAmbiental = calcularIndiceAmbiental(formData);
    const indiceSustentabilidade = calcularIndiceSustentabilidade(
      indiceEconomico,
      indiceSocial,
      indiceAmbiental,
    );

    // Persistir nas colunas canônicas (inteiras) lidas pelo dashboard/resultados
    const { error: updateError } = await supabase
      .from('forms')
      .update({
        economic_index: Math.round(indiceEconomico),
        social_index: Math.round(indiceSocial),
        environmental_index: Math.round(indiceAmbiental),
        sustainability_index: Math.round(indiceSustentabilidade),
        updated_at: new Date().toISOString(),
      })
      .eq('id', formId);

    if (updateError) {
      console.error('Erro ao salvar índices:', updateError);
    }

    return {
      economico: Math.round(indiceEconomico * 100) / 100,
      social: Math.round(indiceSocial * 100) / 100,
      ambiental: Math.round(indiceAmbiental * 100) / 100,
      sustentabilidade: Math.round(indiceSustentabilidade * 100) / 100,
    };
  } catch (error) {
    console.error('Erro ao calcular índices:', error);
    return { economico: 0, social: 0, ambiental: 0, sustentabilidade: 0 };
  }
}
