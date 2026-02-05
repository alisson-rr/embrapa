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
// ETAPA 1: INFORMAÇÕES GERAIS (Nova estrutura - Seções 1 e 2)
// ========================================
export async function saveGeneralInfo(data: any, userId?: string) {
  try {
    // Primeiro, buscar ou criar um formulário
    let formId = localStorage.getItem('current_form_id');
    
    if (!formId) {
      // Criar novo formulário com data da entrevista
      const today = new Date().toISOString().split('T')[0];
      
      const { data: form, error: formError } = await supabase
        .from('forms')
        .insert({
          user_id: userId || null,
          status: 'draft',
          interview_date: today,
          property_name: data.propertyName || null,
          municipality: data.municipality || null,
          state: data.state || null,
          geolocation: data.geolocation || null,
          birth_place: data.birthPlace || null,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (formError) throw formError;
      
      formId = form.id;
      localStorage.setItem('current_form_id', formId);
      console.log('Novo formulário criado com data da entrevista:', today);
    } else {
      // Atualizar campos gerais do formulário existente (mantém data original)
      const { error: updateError } = await supabase
        .from('forms')
        .update({
          property_name: data.propertyName || null,
          municipality: data.municipality || null,
          state: data.state || null,
          geolocation: data.geolocation || null,
          birth_place: data.birthPlace || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', formId);

      if (updateError) throw updateError;
      console.log('Formulário atualizado com informações gerais');
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
          profession: data.profession,
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
          profession: data.profession,
          education: data.education,
          years_in_agriculture: parseIntSafe(data.yearsInAgriculture)
        });

      if (error) throw error;
      console.log('Dados pessoais inseridos');
    }

    // Atualizar property_data com nome da propriedade e município
    const { data: existingProperty } = await supabase
      .from('property_data')
      .select('id')
      .eq('form_id', formId)
      .single();

    if (existingProperty) {
      // Atualizar apenas nome, município e bioma
      await supabase
        .from('property_data')
        .update({
          property_name: data.propertyName,
          municipality: data.municipality,
          bioma: data.bioma || null
        })
        .eq('form_id', formId);
    } else {
      // Criar registro inicial apenas com nome, município e bioma
      await supabase
        .from('property_data')
        .insert({
          form_id: formId,
          property_name: data.propertyName,
          municipality: data.municipality,
          bioma: data.bioma || null
        });
    }

    return { success: true, formId };
  } catch (error: any) {
    console.error('Erro ao salvar informações gerais:', error);
    return { success: false, error: error.message };
  }
}

// ========================================
// ETAPA 1 (ANTIGA): DADOS PESSOAIS
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
          profession: data.profession,
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
          profession: data.profession,
          education: data.education,
          years_in_agriculture: parseIntSafe(data.yearsInAgriculture)
        });

      if (error) throw error;
      console.log('Dados pessoais inseridos');
    }

    // Atualizar ou criar property_data com nome da propriedade, município e estado
    const { data: existingProperty } = await supabase
      .from('property_data')
      .select('id')
      .eq('form_id', formId)
      .single();

    if (existingProperty) {
      // Atualizar apenas nome, município e estado
      await supabase
        .from('property_data')
        .update({
          property_name: data.propertyName,
          municipality: data.municipality,
          state: data.state
        })
        .eq('form_id', formId);
    } else {
      // Criar registro inicial apenas com nome, município e estado
      await supabase
        .from('property_data')
        .insert({
          form_id: formId,
          property_name: data.propertyName,
          municipality: data.municipality,
          state: data.state
        });
    }

    return { success: true, formId };
  } catch (error: any) {
    console.error('Erro ao salvar dados pessoais:', error);
    return { success: false, error: error.message };
  }
}

// ========================================
// ETAPA 2: DADOS DA PROPRIEDADE (Estrutura completa)
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
      total_area: parseNumber(data.totalArea),
      production_area: parseNumber(data.productionArea),
      production_system: data.productionSystem,
      production_system_detail: data.productionSystemDetail || null,
      system_usage_time: parseIntSafe(data.systemUsageTime),
      activity_types: data.activityTypes || [],
      permanent_protection_area: parseNumber(data.permanentProtectionArea),
      legal_reserve_area: parseNumber(data.legalReserveArea),
      // Campos de pecuária (pasture_types agora é TEXT, não ARRAY)
      pasture_types: data.pastureTypes || null,
      pasture_species: data.pastureSpecies || null,
      use_silage: data.useSilage === 'sim',
      silage_hectares: parseNumber(data.silageHectares),
      // Campos de lavoura - cultura de cobertura
      use_cover_crop: data.useCoverCrop === 'sim',
      cover_crop_types: data.coverCropTypes || null,
      // Campos de floresta (salvos também em property_data)
      forest_species: data.forestSpecies || null,
      forest_area: parseNumber(data.forestArea),
    };

    if (existingData) {
      // Atualizar dados existentes (mantém property_name e municipality da etapa 1)
      const { error } = await supabase
        .from('property_data')
        .update(propertyRecord)
        .eq('form_id', formId);

      if (error) throw error;
      console.log('Dados da propriedade atualizados');
    } else {
      // Inserir novos dados (não deveria acontecer pois etapa 1 já cria o registro)
      const { error } = await supabase
        .from('property_data')
        .insert({
          form_id: formId,
          ...propertyRecord
        });

      if (error) throw error;
      console.log('Dados da propriedade inseridos');
    }

    // Salvar culturas (lavoura) se existirem
    if (data.crops && data.crops.length > 0) {
      await saveCropsData(data.crops, formId);
    }

    // Salvar dados de floresta se existirem
    if (data.forestSpecies || data.forestArea) {
      await saveForestData(data, formId);
    }

    return { success: true, formId };
  } catch (error: any) {
    console.error('Erro ao salvar dados da propriedade:', error);
    return { success: false, error: error.message };
  }
}

// Função auxiliar para salvar culturas (lavoura)
async function saveCropsData(crops: any[], formId: string) {
  try {
    // Deletar culturas existentes
    await supabase
      .from('crop_strategy')
      .delete()
      .eq('form_id', formId);

    // Inserir novas culturas
    const cropsRecords = crops.map(crop => ({
      form_id: formId,
      crop_name: crop.name,
      planting_month: parseIntSafe(crop.plantingMonth),
      area_hectares: parseNumber(crop.areaPercentage),
    }));

    if (cropsRecords.length > 0) {
      const { error } = await supabase
        .from('crop_strategy')
        .insert(cropsRecords);

      if (error) throw error;
      console.log('Culturas salvas:', cropsRecords.length);
    }
  } catch (error) {
    console.error('Erro ao salvar culturas:', error);
  }
}

// Função auxiliar para salvar dados de floresta
async function saveForestData(data: any, formId: string) {
  try {
    // Deletar dados de floresta existentes
    await supabase
      .from('forest_strategy')
      .delete()
      .eq('form_id', formId);

    // Inserir novos dados de floresta
    if (data.forestSpecies || data.forestArea) {
      const { error } = await supabase
        .from('forest_strategy')
        .insert({
          form_id: formId,
          planted_species: data.forestSpecies || null,
          forest_area: parseNumber(data.forestArea),
        });

      if (error) throw error;
      console.log('Dados de floresta salvos');
    }
  } catch (error) {
    console.error('Erro ao salvar dados de floresta:', error);
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
      financing_percentage: parseFloat(data.financingPercentage?.replace('%', '').replace(',', '.')) || 0,
      production_cost: parseNumber(data.productionCost),
      property_value: parseNumber(data.propertyValue),
      management_system: data.managementSystem,
      management_system_name: data.managementSystem === 'sim' ? data.managementSystemName : null,
      decision_maker_salary: parseNumber(data.decisionMakerSalary),
      product_commercialization: data.productCommercialization
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
      temporary_employees: parseIntSafe(data.temporaryEmployees),
      outsourced_average_salary: parseNumber(data.outsourcedAverageSalary),
      // Novos campos sociais
      oldest_family_member_age: parseIntSafe(data.oldestFamilyMemberAge),
      youngest_family_member_age: parseIntSafe(data.youngestFamilyMemberAge),
      operational_courses: parseIntSafe(data.operationalCourses) || 0,
      technical_courses: parseIntSafe(data.technicalCourses) || 0,
      specialization_courses: parseIntSafe(data.specializationCourses) || 0,
      has_technical_assistance: data.hasTechnicalAssistance === 'sim',
      technical_assistance_type: data.hasTechnicalAssistance === 'sim' ? data.technicalAssistanceType : null,
      has_profit_sharing: data.hasProfitSharing === 'sim',
      has_health_plan: data.hasHealthPlan === 'sim'
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
      monthly_fuel_consumption: parseNumber(data.fuelConsumption),
      monthly_electricity_expense: parseNumber(data.electricityExpense)
    };

    if (existingData) {
      // Atualizar
      const { error } = await supabase
        .from('environmental_data')
        .update(environmentalRecord)
        .eq('form_id', formId);

      if (error) throw error;
      console.log('Dados ambientais atualizados');
    } else {
      // Inserir
      const { error } = await supabase
        .from('environmental_data')
        .insert({
          form_id: formId,
          ...environmentalRecord
        });

      if (error) throw error;
      console.log('Dados ambientais inseridos');
    }

    // Salvar arrays de adubos e defensivos
    if (data.fertilizers && data.fertilizers.length > 0) {
      await saveFertilizersData(data.fertilizers, formId);
    }
    
    if (data.herbicides && data.herbicides.length > 0) {
      await saveHerbicidesData(data.herbicides, formId);
    }
    
    if (data.fungicides && data.fungicides.length > 0) {
      await saveFungicidesData(data.fungicides, formId);
    }
    
    if (data.insecticides && data.insecticides.length > 0) {
      await saveInsecticidesData(data.insecticides, formId);
    }
    
    if (data.otherPesticides && data.otherPesticides.length > 0) {
      await saveOtherPesticidesData(data.otherPesticides, formId);
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

// Funções auxiliares para salvar arrays de adubos e defensivos
async function saveFertilizersData(fertilizers: any[], formId: string) {
  try {
    // Deletar registros existentes
    await supabase
      .from('fertilizers_data')
      .delete()
      .eq('form_id', formId);

    // Inserir novos registros
    const records = fertilizers
      .filter(f => f.culture && f.formula && f.totalQuantity)
      .map(fertilizer => ({
        form_id: formId,
        culture: fertilizer.culture,
        formula: fertilizer.formula,
        total_quantity: fertilizer.totalQuantity
      }));

    if (records.length > 0) {
      const { error } = await supabase
        .from('fertilizers_data')
        .insert(records);

      if (error) throw error;
      console.log('Adubos salvos:', records.length);
    }
  } catch (error) {
    console.error('Erro ao salvar adubos:', error);
  }
}

async function saveHerbicidesData(herbicides: any[], formId: string) {
  try {
    await supabase
      .from('herbicides_data')
      .delete()
      .eq('form_id', formId);

    const records = herbicides
      .filter(h => h.culture && h.herbicides && h.applicationsQuantity)
      .map(herbicide => ({
        form_id: formId,
        culture: herbicide.culture,
        herbicides: herbicide.herbicides,
        applications_quantity: herbicide.applicationsQuantity
      }));

    if (records.length > 0) {
      const { error } = await supabase
        .from('herbicides_data')
        .insert(records);

      if (error) throw error;
      console.log('Herbicidas salvos:', records.length);
    }
  } catch (error) {
    console.error('Erro ao salvar herbicidas:', error);
  }
}

async function saveFungicidesData(fungicides: any[], formId: string) {
  try {
    await supabase
      .from('fungicides_data')
      .delete()
      .eq('form_id', formId);

    const records = fungicides
      .filter(f => f.culture && f.fungicides && f.applications)
      .map(fungicide => ({
        form_id: formId,
        culture: fungicide.culture,
        fungicides: fungicide.fungicides,
        applications: fungicide.applications
      }));

    if (records.length > 0) {
      const { error } = await supabase
        .from('fungicides_data')
        .insert(records);

      if (error) throw error;
      console.log('Fungicidas salvos:', records.length);
    }
  } catch (error) {
    console.error('Erro ao salvar fungicidas:', error);
  }
}

async function saveInsecticidesData(insecticides: any[], formId: string) {
  try {
    await supabase
      .from('insecticides_data')
      .delete()
      .eq('form_id', formId);

    const records = insecticides
      .filter(i => i.culture && i.insecticides && i.applications)
      .map(insecticide => ({
        form_id: formId,
        culture: insecticide.culture,
        insecticides: insecticide.insecticides,
        applications: insecticide.applications
      }));

    if (records.length > 0) {
      const { error } = await supabase
        .from('insecticides_data')
        .insert(records);

      if (error) throw error;
      console.log('Inseticidas salvos:', records.length);
    }
  } catch (error) {
    console.error('Erro ao salvar inseticidas:', error);
  }
}

async function saveOtherPesticidesData(otherPesticides: any[], formId: string) {
  try {
    await supabase
      .from('other_pesticides_data')
      .delete()
      .eq('form_id', formId);

    const records = otherPesticides
      .filter(o => o.culture && o.pesticideName && o.applications)
      .map(other => ({
        form_id: formId,
        culture: other.culture,
        pesticide_name: other.pesticideName,
        applications: other.applications
      }));

    if (records.length > 0) {
      const { error } = await supabase
        .from('other_pesticides_data')
        .insert(records);

      if (error) throw error;
      console.log('Outros defensivos salvos:', records.length);
    }
  } catch (error) {
    console.error('Erro ao salvar outros defensivos:', error);
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
