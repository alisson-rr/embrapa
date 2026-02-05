// ================================================
// Implementação dos cálculos Fuzzy em TypeScript
// Baseado no código Python original
// ================================================

import { supabase } from '@/lib/supabase';

// Dados de regulamentação ambiental por estado
const REGULAMENTACAO: Record<string, number> = {
  "AM": 0.8, "AC": 0.8, "RO": 0.8, "RR": 0.8, "AP": 0.8, "PA": 0.8,
  "DF": 0.35, "GO": 0.35, "MT": 0.35, "TO": 0.35, "MG": 0.35, "MA": 0.35, "MS": 0.35,
  "RS": 0.2, "RJ": 0.2, "SP": 0.2, "SC": 0.2, "PR": 0.2, "ES": 0.2,
  "BA": 0.2, "SE": 0.2, "AL": 0.2, "PE": 0.2, "PB": 0.2, "RN": 0.2, "CE": 0.2, "PI": 0.2
};

// Dados de chuva média anual por estado (mm)
const CHUVA: Record<string, number> = {
  "AM": 2609, "AC": 2158, "RO": 1950, "RR": 1754, "AP": 2525, "PA": 2252,
  "DF": 1478, "GO": 1511, "MT": 1588, "TO": 1619, "MG": 1226, "MA": 1586, "MS": 1219,
  "RS": 1635, "RJ": 1403, "SP": 1450, "SC": 1921, "PR": 1802, "ES": 1309,
  "BA": 926, "SE": 1068, "AL": 1325, "PE": 930, "PB": 1837, "RN": 1214, "CE": 1123, "PI": 1039
};

// Dados de evapotranspiração por estado
const EVAPO: Record<string, number> = {
  "AM": 2221, "AC": 1958, "RO": 1750, "RR": 1800, "AP": 2182, "PA": 2199,
  "DF": 1304, "GO": 1689, "MT": 2066, "TO": 2138, "MG": 1512, "MA": 2181, "MS": 2000,
  "RS": 1427, "RJ": 1722, "SP": 1427, "SC": 1242, "PR": 1378, "ES": 1756,
  "BA": 1722, "SE": 1804, "AL": 1711, "PE": 1932, "PB": 2022, "RN": 2062, "CE": 1878, "PI": 2668
};

// Função para normalizar valor entre 0 e 100
const normalize = (value: number, min: number, max: number): number => {
  if (value <= min) return 0;
  if (value >= max) return 100;
  return ((value - min) / (max - min)) * 100;
};

// Função fuzzy simplificada para calcular pertinência
const fuzzyMembership = (value: number, low: number, medium: number, high: number): { low: number; medium: number; high: number } => {
  let lowMembership = 0;
  let mediumMembership = 0;
  let highMembership = 0;

  if (value <= low) {
    lowMembership = 1;
  } else if (value > low && value <= medium) {
    lowMembership = (medium - value) / (medium - low);
    mediumMembership = (value - low) / (medium - low);
  } else if (value > medium && value <= high) {
    mediumMembership = (high - value) / (high - medium);
    highMembership = (value - medium) / (high - medium);
  } else {
    highMembership = 1;
  }

  return { low: lowMembership, medium: mediumMembership, high: highMembership };
};

// Defuzzificação usando método do centroide simplificado
const defuzzify = (membership: { low: number; medium: number; high: number }): number => {
  const lowCenter = 25;
  const mediumCenter = 50;
  const highCenter = 75;
  
  const numerator = (membership.low * lowCenter) + (membership.medium * mediumCenter) + (membership.high * highCenter);
  const denominator = membership.low + membership.medium + membership.high;
  
  if (denominator === 0) return 50;
  return numerator / denominator;
};

// Interface para os dados do formulário
interface FormData {
  // Dados pessoais
  personal_data: {
    name: string;
    education_level: string;
  }[];
  
  // Dados da propriedade
  property_data: {
    total_area: number;
    production_area: number;
    state: string;
    system_usage_time: number;
  }[];
  
  // Dados econômicos
  economic_data: {
    gross_income: number;
    production_cost: number;
    property_value: number;
    financing_percentage: number;
  }[];
  
  // Dados sociais
  social_data: {
    permanent_employees: number;
    highest_salary: number;
    lowest_salary: number;
    technical_assistance: boolean;
  }[];
  
  // Dados ambientais
  environmental_data: {
    monthly_fuel_consumption: number;
  }[];
}

// ================================================
// CÁLCULO DO ÍNDICE ECONÔMICO
// ================================================
export function calcularIndiceEconomico(formData: FormData): number {
  try {
    const economic = formData.economic_data[0];
    const property = formData.property_data[0];
    
    if (!economic || !property) return 0;
    
    // FV = (Valor da Fazenda / Área Produtiva)^(1/Tempo no sistema)
    const areaProductiva = property.production_area || 1;
    const tempoSistema = property.system_usage_time || 1;
    const FV = Math.pow((economic.property_value / areaProductiva), (1 / tempoSistema));
    
    // P = Lucro por hectare = (Receita - Custo) / Área Produtiva
    const lucro = economic.gross_income - economic.production_cost;
    const P = lucro / areaProductiva;
    
    // DL = Percentual de financiamento (já está em %)
    const DL = economic.financing_percentage / 100;
    
    // WI = Salário do proprietário / Salário médio nacional (R$ 3.225)
    const salarioProprietario = lucro / 12; // Lucro mensal como proxy do salário
    const WI = salarioProprietario / 3225;
    
    // Aplicar fuzzy membership
    const fvMembership = fuzzyMembership(normalize(FV, 0, 100), 25, 50, 75);
    const pMembership = fuzzyMembership(normalize(P, 0, 5000), 25, 50, 75);
    const dlMembership = fuzzyMembership(normalize(DL, 1, 0), 25, 50, 75); // Invertido: menos dívida é melhor
    const wiMembership = fuzzyMembership(normalize(WI, 0, 10), 25, 50, 75);
    
    // Combinar os memberships (média ponderada)
    const combinedMembership = {
      low: (fvMembership.low + pMembership.low + dlMembership.low + wiMembership.low) / 4,
      medium: (fvMembership.medium + pMembership.medium + dlMembership.medium + wiMembership.medium) / 4,
      high: (fvMembership.high + pMembership.high + dlMembership.high + wiMembership.high) / 4
    };
    
    // Defuzzificar para obter o índice final
    const indice = defuzzify(combinedMembership);
    
    return Math.min(100, Math.max(0, indice));
  } catch (error) {
    console.error('Erro ao calcular índice econômico:', error);
    return 0;
  }
}

// ================================================
// CÁLCULO DO ÍNDICE SOCIAL
// ================================================
export function calcularIndiceSocial(formData: FormData): number {
  try {
    const social = formData.social_data[0];
    const personal = formData.personal_data[0];
    
    if (!social || !personal) return 0;
    
    // Anos de estudo baseado no nível de educação
    const educationYears: Record<string, number> = {
      'Analfabeto': 0,
      'Ensino Fundamental Incompleto': 4,
      'Ensino Fundamental': 8,
      'Ensino Médio Incompleto': 10,
      'Ensino Médio': 12,
      'Ensino Superior Incompleto': 14,
      'Ensino Superior': 16,
      'Pós-Graduação': 18
    };
    
    const anosEstudo = educationYears[personal.education_level] || 8;
    
    // JA - Job Attractiveness (simplificado - baseado em salários)
    const JA = social.lowest_salary / Math.max(social.highest_salary, 1);
    
    // TC - Total de cursos (usar assistência técnica como proxy)
    const TC = social.technical_assistance ? 10 : 2;
    
    // JQ - Job Quality (baseado em funcionários permanentes)
    const JQ = social.permanent_employees > 0 ? 10 : 2;
    
    // Plano de saúde e compartilhamento de lucros (simplificado)
    const planoSaude = social.highest_salary > 5000 ? 1 : 0;
    const compartilhaLucros = social.highest_salary > 8000 ? 1 : 0;
    
    // Aplicar fuzzy membership
    const estMembership = fuzzyMembership(normalize(anosEstudo, 0, 20), 25, 50, 75);
    const jaMembership = fuzzyMembership(normalize(JA, 0, 1), 25, 50, 75);
    const tcMembership = fuzzyMembership(normalize(TC, 0, 20), 25, 50, 75);
    const jqMembership = fuzzyMembership(normalize(JQ, 0, 20), 25, 50, 75);
    
    // Combinar os memberships
    const combinedMembership = {
      low: (estMembership.low + jaMembership.low + tcMembership.low + jqMembership.low) / 4,
      medium: (estMembership.medium + jaMembership.medium + tcMembership.medium + jqMembership.medium) / 4,
      high: (estMembership.high + jaMembership.high + tcMembership.high + jqMembership.high) / 4
    };
    
    // Adicionar bônus por benefícios
    if (planoSaude) combinedMembership.high += 0.1;
    if (compartilhaLucros) combinedMembership.high += 0.1;
    
    // Normalizar
    const total = combinedMembership.low + combinedMembership.medium + combinedMembership.high;
    if (total > 0) {
      combinedMembership.low /= total;
      combinedMembership.medium /= total;
      combinedMembership.high /= total;
    }
    
    // Defuzzificar
    const indice = defuzzify(combinedMembership);
    
    return Math.min(100, Math.max(0, indice));
  } catch (error) {
    console.error('Erro ao calcular índice social:', error);
    return 0;
  }
}

// ================================================
// CÁLCULO DO ÍNDICE AMBIENTAL
// ================================================
export function calcularIndiceAmbiental(formData: FormData): number {
  try {
    const property = formData.property_data[0];
    const environmental = formData.environmental_data[0];
    
    if (!property || !environmental) return 0;
    
    const estado = property.state || 'SP';
    const areaTotal = property.total_area || 1;
    const areaProducao = property.production_area || 1;
    
    // FO - Fração de área conservada vs regulamentação
    const areaConservada = areaTotal - areaProducao;
    const percentConservado = (areaConservada / areaTotal);
    const regulamentacao = REGULAMENTACAO[estado] || 0.2;
    const FO = percentConservado / regulamentacao;
    
    // Escoamento = (Chuva - Evapotranspiração) / Chuva
    const chuva = CHUVA[estado] || 1500;
    const evapo = EVAPO[estado] || 1500;
    const escoamento = (chuva - evapo) / chuva;
    
    // Consumo de combustível por área (L/ha/ano)
    const consumoMensal = environmental.monthly_fuel_consumption || 0;
    const consumoAnual = consumoMensal * 12;
    const consumoArea = consumoAnual / areaTotal;
    
    // Aplicar fuzzy membership
    const foMembership = fuzzyMembership(normalize(FO, 0, 2), 25, 50, 75);
    const escoMembership = fuzzyMembership(normalize(escoamento + 1, 0, 2), 25, 50, 75);
    const consumoMembership = fuzzyMembership(normalize(40 - consumoArea, 0, 40), 25, 50, 75); // Invertido: menos consumo é melhor
    
    // Combinar os memberships
    const combinedMembership = {
      low: (foMembership.low + escoMembership.low + consumoMembership.low) / 3,
      medium: (foMembership.medium + escoMembership.medium + consumoMembership.medium) / 3,
      high: (foMembership.high + escoMembership.high + consumoMembership.high) / 3
    };
    
    // Defuzzificar
    const indice = defuzzify(combinedMembership);
    
    return Math.min(100, Math.max(0, indice));
  } catch (error) {
    console.error('Erro ao calcular índice ambiental:', error);
    return 0;
  }
}

// ================================================
// CÁLCULO DO ÍNDICE DE SUSTENTABILIDADE
// ================================================
export function calcularIndiceSustentabilidade(economico: number, social: number, ambiental: number): number {
  try {
    // Aplicar fuzzy membership para cada índice
    const econMembership = fuzzyMembership(economico, 25, 50, 75);
    const socMembership = fuzzyMembership(social, 25, 50, 75);
    const ambMembership = fuzzyMembership(ambiental, 25, 50, 75);
    
    // Regras fuzzy para sustentabilidade
    let sustentabilidadeMembership = { low: 0, medium: 0, high: 0 };
    
    // Regra 1: Se qualquer índice é muito baixo, sustentabilidade é baixa
    if (econMembership.low > 0.5 || socMembership.low > 0.5 || ambMembership.low > 0.5) {
      sustentabilidadeMembership.low = Math.max(econMembership.low, socMembership.low, ambMembership.low);
    }
    
    // Regra 2: Se pelo menos 2 índices são médios, sustentabilidade é média
    const mediumCount = (econMembership.medium > 0.3 ? 1 : 0) + 
                       (socMembership.medium > 0.3 ? 1 : 0) + 
                       (ambMembership.medium > 0.3 ? 1 : 0);
    if (mediumCount >= 2) {
      sustentabilidadeMembership.medium = (econMembership.medium + socMembership.medium + ambMembership.medium) / 3;
    }
    
    // Regra 3: Se pelo menos 2 índices são altos, sustentabilidade é alta
    const highCount = (econMembership.high > 0.3 ? 1 : 0) + 
                     (socMembership.high > 0.3 ? 1 : 0) + 
                     (ambMembership.high > 0.3 ? 1 : 0);
    if (highCount >= 2) {
      sustentabilidadeMembership.high = (econMembership.high + socMembership.high + ambMembership.high) / 3;
    }
    
    // Se nenhuma regra foi ativada, usar média simples
    if (sustentabilidadeMembership.low === 0 && sustentabilidadeMembership.medium === 0 && sustentabilidadeMembership.high === 0) {
      const mediaSimples = (economico + social + ambiental) / 3;
      return Math.min(100, Math.max(0, mediaSimples));
    }
    
    // Normalizar
    const total = sustentabilidadeMembership.low + sustentabilidadeMembership.medium + sustentabilidadeMembership.high;
    if (total > 0) {
      sustentabilidadeMembership.low /= total;
      sustentabilidadeMembership.medium /= total;
      sustentabilidadeMembership.high /= total;
    }
    
    // Defuzzificar
    const indice = defuzzify(sustentabilidadeMembership);
    
    return Math.min(100, Math.max(0, indice));
  } catch (error) {
    console.error('Erro ao calcular índice de sustentabilidade:', error);
    return 0;
  }
}

// ================================================
// FUNÇÃO PRINCIPAL PARA CALCULAR TODOS OS ÍNDICES
// ================================================
export async function calcularIndices(formId: string): Promise<{
  economico: number;
  social: number;
  ambiental: number;
  sustentabilidade: number;
}> {
  try {
    // Buscar todos os dados do formulário
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
    
    // Calcular cada índice
    const indiceEconomico = calcularIndiceEconomico(formData);
    const indiceSocial = calcularIndiceSocial(formData);
    const indiceAmbiental = calcularIndiceAmbiental(formData);
    const indiceSustentabilidade = calcularIndiceSustentabilidade(
      indiceEconomico,
      indiceSocial,
      indiceAmbiental
    );
    
    // Salvar os índices no banco
    const { error: updateError } = await supabase
      .from('forms')
      .update({
        indice_economico: Math.round(indiceEconomico * 100) / 100,
        indice_social: Math.round(indiceSocial * 100) / 100,
        indice_ambiental: Math.round(indiceAmbiental * 100) / 100,
        indice_sustentabilidade: Math.round(indiceSustentabilidade * 100) / 100,
        updated_at: new Date().toISOString()
      })
      .eq('id', formId);
    
    if (updateError) {
      console.error('Erro ao salvar índices:', updateError);
    }
    
    return {
      economico: Math.round(indiceEconomico * 100) / 100,
      social: Math.round(indiceSocial * 100) / 100,
      ambiental: Math.round(indiceAmbiental * 100) / 100,
      sustentabilidade: Math.round(indiceSustentabilidade * 100) / 100
    };
  } catch (error) {
    console.error('Erro ao calcular índices:', error);
    return {
      economico: 0,
      social: 0,
      ambiental: 0,
      sustentabilidade: 0
    };
  }
}
