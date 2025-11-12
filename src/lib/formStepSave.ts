import { supabase } from '@/lib/supabase';

// Helpers para conversão de dados
const parseNumber = (value: string | number): number | null => {
  if (value === '' || value === null || value === undefined) return null;
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return isNaN(num) ? null : num;
};

const parseIntSafe = (value: string | number): number | null => {
  if (value === '' || value === null || value === undefined) return null;
  const num = typeof value === 'string' ? Number(value) : value;
  return isNaN(num) ? null : Math.floor(num);
};

// ========================================
// ETAPA 1: DADOS PESSOAIS
// ========================================
export async function savePersonalData(data: any, userId?: string) {
  try {
    // Primeiro, buscar ou criar um formulário
    let formId = localStorage.getItem('current_form_id');
    
    if (!formId) {
      // Criar novo formulário
      const { data: form, error: formError } = await supabase
        .from('forms')
        .insert({
          user_id: userId || null,
          status: 'draft',
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (formError) throw formError;
      
      formId = form.id;
      localStorage.setItem('current_form_id', formId);
      console.log('Novo formulário criado:', formId);
    } else {
      console.log('Usando formulário existente:', formId);
    }

    // Verificar se já existe dados pessoais para este formulário
    const { data: existingData } = await supabase
      .from('personal_data')
      .select('id')
      .eq('form_id', formId)
      .single();

    if (existingData) {
      // Atualizar dados existentes
      const { error } = await supabase
        .from('personal_data')
        .update({
          name: data.name,
          age: parseIntSafe(data.age),
          occupation: data.occupation,
          education: data.education,
          years_in_agriculture: parseIntSafe(data.yearsInAgriculture)
        })
        .eq('form_id', formId);

      if (error) throw error;
      console.log('Dados pessoais atualizados');
    } else {
      // Inserir novos dados
      const { error } = await supabase
        .from('personal_data')
        .insert({
          form_id: formId,
          name: data.name,
          age: parseIntSafe(data.age),
          occupation: data.occupation,
          education: data.education,
          years_in_agriculture: parseIntSafe(data.yearsInAgriculture)
        });

      if (error) throw error;
      console.log('Dados pessoais inseridos');
    }

    return { success: true, formId };
  } catch (error: any) {
    console.error('Erro ao salvar dados pessoais:', error);
    return { success: false, error: error.message };
  }
}

// ========================================
// ETAPA 2: DADOS DA PROPRIEDADE
// ========================================
export async function savePropertyData(data: any) {
  try {
    const formId = localStorage.getItem('current_form_id');
    if (!formId) {
      throw new Error('Formulário não encontrado. Por favor, volte ao início.');
    }

    // Verificar se já existe dados da propriedade
    const { data: existingData } = await supabase
      .from('property_data')
      .select('id')
      .eq('form_id', formId)
      .single();

    const propertyRecord = {
      property_name: data.propertyName,
      municipality: data.municipality,
      state: data.state,
      total_area: parseNumber(data.totalArea),
      production_area: parseNumber(data.productionArea),
      permanent_protection_area: parseNumber(data.permanentProtectionArea),
      legal_reserve_area: parseNumber(data.legalReserveArea),
      activity_types: data.activityTypes || [],
      integration_system_type: data.integrationSystemType,
      livestock_type: data.livestockType,
      production_system: data.productionSystem,
      system_usage_time: parseIntSafe(data.systemUsageTime),
      daily_description: data.dailyDescription,
      pasture_types: data.pastureTypes || [],
      use_silage: data.useSilage === 'Sim',
      silage_hectares: parseNumber(data.hectares)
    };

    let propertyDataId;

    if (existingData) {
      // Atualizar dados existentes
      const { error } = await supabase
        .from('property_data')
        .update(propertyRecord)
        .eq('form_id', formId);

      if (error) throw error;
      propertyDataId = existingData.id;
      console.log('Dados da propriedade atualizados');
    } else {
      // Inserir novos dados
      const { data: newData, error } = await supabase
        .from('property_data')
        .insert({
          form_id: formId,
          ...propertyRecord
        })
        .select()
        .single();

      if (error) throw error;
      propertyDataId = newData.id;
      console.log('Dados da propriedade inseridos');
    }

    // Salvar dados do rebanho se existirem
    if (data.cattleCount || data.heiferCount || data.bullCount) {
      await saveLivestockData(data, propertyDataId);
    }

    return { success: true, formId };
  } catch (error: any) {
    console.error('Erro ao salvar dados da propriedade:', error);
    return { success: false, error: error.message };
  }
}

// Função auxiliar para salvar dados do rebanho
async function saveLivestockData(data: any, propertyDataId: string) {
  try {
    // Verificar se já existe
    const { data: existingData } = await supabase
      .from('livestock_data')
      .select('id')
      .eq('property_data_id', propertyDataId)
      .single();

    const livestockRecord = {
      cattle_count: parseIntSafe(data.cattleCount),
      heifer_count: parseIntSafe(data.heiferCount),
      bull_count: parseIntSafe(data.bullCount),
      calf_count: parseIntSafe(data.calfCount),
      bull_calf_count: parseIntSafe(data.bullCalfCount),
      cattle_weight: parseNumber(data.cattleWeight),
      heifer_weight: parseNumber(data.heiferWeight),
      bull_weight: parseNumber(data.bullWeight),
      calf_weight: parseNumber(data.calfWeight),
      bull_calf_weight: parseNumber(data.bullCalfWeight),
      heifer_weight_gain: parseNumber(data.heiferWeightGain),
      bull_weight_gain: parseNumber(data.bullWeightGain),
      calf_weight_gain: parseNumber(data.calfWeightGain),
      cattle_digestibility: parseNumber(data.cattleDigestibility),
      heifer_digestibility: parseNumber(data.heiferDigestibility),
      bull_digestibility: parseNumber(data.bullDigestibility),
      calf_digestibility: parseNumber(data.calfDigestibility),
      bull_calf_digestibility: parseNumber(data.bullCalfDigestibility),
      pregnancy_rate: parseNumber(data.pregnancyRate),
      cattle_confinement: parseNumber(data.cattleConfinement),
      heifer_confinement: parseNumber(data.heiferConfinement),
      bull_confinement: parseNumber(data.bullConfinement),
      calf_confinement: parseNumber(data.calfConfinement),
      bull_calf_confinement: parseNumber(data.bullCalfConfinement),
      cattle_pasture: parseNumber(data.cattlePasture),
      heifer_pasture: parseNumber(data.heiferPasture),
      bull_pasture: parseNumber(data.bullPasture),
      calf_pasture: parseNumber(data.calfPasture),
      bull_calf_pasture: parseNumber(data.bullCalfPasture)
    };

    if (existingData) {
      // Atualizar
      const { error } = await supabase
        .from('livestock_data')
        .update(livestockRecord)
        .eq('property_data_id', propertyDataId);

      if (error) throw error;
    } else {
      // Inserir
      const { error } = await supabase
        .from('livestock_data')
        .insert({
          property_data_id: propertyDataId,
          ...livestockRecord
        });

      if (error) throw error;
    }
    console.log('Dados do rebanho salvos');
  } catch (error) {
    console.error('Erro ao salvar dados do rebanho:', error);
    // Não vamos dar throw aqui porque os dados do rebanho são opcionais
  }
}

// ========================================
// ETAPA 3: DADOS ECONÔMICOS
// ========================================
export async function saveEconomicData(data: any) {
  try {
    const formId = localStorage.getItem('current_form_id');
    if (!formId) {
      throw new Error('Formulário não encontrado. Por favor, volte ao início.');
    }

    // Verificar se já existe
    const { data: existingData } = await supabase
      .from('economic_data')
      .select('id')
      .eq('form_id', formId)
      .single();

    const economicRecord = {
      gross_income: parseNumber(data.grossIncome),
      financing_percentage: parseNumber(data.financingPercentage),
      production_cost: parseNumber(data.productionCost),
      property_value: parseNumber(data.propertyValue),
      management_system: data.managementSystem
    };

    if (existingData) {
      // Atualizar
      const { error } = await supabase
        .from('economic_data')
        .update(economicRecord)
        .eq('form_id', formId);

      if (error) throw error;
      console.log('Dados econômicos atualizados');
    } else {
      // Inserir
      const { error } = await supabase
        .from('economic_data')
        .insert({
          form_id: formId,
          ...economicRecord
        });

      if (error) throw error;
      console.log('Dados econômicos inseridos');
    }

    return { success: true, formId };
  } catch (error: any) {
    console.error('Erro ao salvar dados econômicos:', error);
    return { success: false, error: error.message };
  }
}

// ========================================
// ETAPA 4: DADOS SOCIAIS
// ========================================
export async function saveSocialData(data: any) {
  try {
    const formId = localStorage.getItem('current_form_id');
    if (!formId) {
      throw new Error('Formulário não encontrado. Por favor, volte ao início.');
    }

    // Verificar se já existe
    const { data: existingData } = await supabase
      .from('social_data')
      .select('id')
      .eq('form_id', formId)
      .single();

    const socialRecord = {
      permanent_employees: parseIntSafe(data.permanentEmployees),
      highest_education_employee: data.highestEducationEmployee,
      highest_salary: parseNumber(data.highestSalary),
      lowest_education_employee: data.lowestEducationEmployee,
      lowest_salary: parseNumber(data.lowestSalary),
      family_members: parseIntSafe(data.familyMembers),
      family_members_level: data.familyMembersLevel,
      technical_assistance: data.technicalAssistance === 'Sim'
    };

    if (existingData) {
      // Atualizar
      const { error } = await supabase
        .from('social_data')
        .update(socialRecord)
        .eq('form_id', formId);

      if (error) throw error;
      console.log('Dados sociais atualizados');
    } else {
      // Inserir
      const { error } = await supabase
        .from('social_data')
        .insert({
          form_id: formId,
          ...socialRecord
        });

      if (error) throw error;
      console.log('Dados sociais inseridos');
    }

    return { success: true, formId };
  } catch (error: any) {
    console.error('Erro ao salvar dados sociais:', error);
    return { success: false, error: error.message };
  }
}

// ========================================
// ETAPA 5: DADOS AMBIENTAIS
// ========================================
export async function saveEnvironmentalData(data: any) {
  try {
    const formId = localStorage.getItem('current_form_id');
    if (!formId) {
      throw new Error('Formulário não encontrado. Por favor, volte ao início.');
    }

    // Verificar se já existe
    const { data: existingData } = await supabase
      .from('environmental_data')
      .select('id')
      .eq('form_id', formId)
      .single();

    const environmentalRecord = {
      organic_matter_percentage: parseNumber(data.organicMatterPercentage),
      calcium_quantity: parseNumber(data.calciumQuantity),
      monthly_fuel_consumption: parseNumber(data.monthlyFuelConsumption),
      monthly_electricity_expense: parseNumber(data.monthlyElectricityExpense)
    };

    let environmentalDataId;

    if (existingData) {
      // Atualizar
      const { error } = await supabase
        .from('environmental_data')
        .update(environmentalRecord)
        .eq('form_id', formId);

      if (error) throw error;
      environmentalDataId = existingData.id;
      console.log('Dados ambientais atualizados');
    } else {
      // Inserir
      const { data: newData, error } = await supabase
        .from('environmental_data')
        .insert({
          form_id: formId,
          ...environmentalRecord
        })
        .select()
        .single();

      if (error) throw error;
      environmentalDataId = newData.id;
      console.log('Dados ambientais inseridos');
    }

    // Salvar culturas se existirem
    if (data.cultures && data.cultures.length > 0) {
      await saveCulturesData(data.cultures, environmentalDataId);
    }

    // Salvar pastagens se existirem
    if (data.pastures && data.pastures.length > 0) {
      await savePasturesData(data.pastures, environmentalDataId);
    }

    // Marcar formulário como completo e atualizar submitted_at
    const { error: updateError } = await supabase
      .from('forms')
      .update({
        status: 'completed',
        submitted_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', formId);

    if (updateError) {
      console.error('Erro ao atualizar status do formulário:', updateError);
    }

    // Tentar calcular índices de sustentabilidade
    try {
      const { data: indices } = await supabase
        .rpc('calculate_sustainability_indices', { form_id: formId });
      console.log('Índices calculados:', indices);
    } catch (rpcError) {
      console.log('Função de cálculo não encontrada ou erro:', rpcError);
    }

    return { success: true, formId };
  } catch (error: any) {
    console.error('Erro ao salvar dados ambientais:', error);
    return { success: false, error: error.message };
  }
}

// Função auxiliar para salvar culturas
async function saveCulturesData(cultures: any[], environmentalDataId: string) {
  try {
    // Deletar culturas existentes
    await supabase
      .from('cultures_data')
      .delete()
      .eq('environmental_data_id', environmentalDataId);

    // Inserir novas culturas
    const culturesRecords = cultures.map(culture => ({
      environmental_data_id: environmentalDataId,
      culture_name: culture.name,
      area_hectares: parseNumber(culture.area),
      nitrogen_fertilizer: parseNumber(culture.nitrogen),
      phosphate_fertilizer: parseNumber(culture.phosphate),
      potassium_fertilizer: parseNumber(culture.potassium),
      limestone: parseNumber(culture.limestone),
      gypsum: parseNumber(culture.gypsum),
      urea: parseNumber(culture.urea)
    }));

    if (culturesRecords.length > 0) {
      const { error } = await supabase
        .from('cultures_data')
        .insert(culturesRecords);

      if (error) throw error;
      console.log('Culturas salvas:', culturesRecords.length);
    }
  } catch (error) {
    console.error('Erro ao salvar culturas:', error);
  }
}

// Função auxiliar para salvar pastagens
async function savePasturesData(pastures: any[], environmentalDataId: string) {
  try {
    // Deletar pastagens existentes
    await supabase
      .from('pastures_data')
      .delete()
      .eq('environmental_data_id', environmentalDataId);

    // Inserir novas pastagens
    const pasturesRecords = pastures.map(pasture => ({
      environmental_data_id: environmentalDataId,
      pasture_name: pasture.name,
      area_hectares: parseNumber(pasture.area),
      condition: pasture.condition
    }));

    if (pasturesRecords.length > 0) {
      const { error } = await supabase
        .from('pastures_data')
        .insert(pasturesRecords);

      if (error) throw error;
      console.log('Pastagens salvas:', pasturesRecords.length);
    }
  } catch (error) {
    console.error('Erro ao salvar pastagens:', error);
  }
}

// ========================================
// FUNÇÃO PARA LIMPAR FORMULÁRIO AO FINALIZAR
// ========================================
export function clearCurrentForm() {
  localStorage.removeItem('current_form_id');
  localStorage.removeItem('personal-data');
  localStorage.removeItem('property-data');
  localStorage.removeItem('economic-data');
  localStorage.removeItem('social-data');
  localStorage.removeItem('environmental-data');
  console.log('Dados do formulário limpos do localStorage');
}
