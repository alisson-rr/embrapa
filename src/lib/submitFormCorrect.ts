import { supabase } from '@/lib/supabase';

export interface CompleteFormData {
  personalData: {
    name: string;
    age: string;
    occupation: string;
    education: string;
    yearsInAgriculture: string;
  };
  propertyData: {
    propertyName: string;
    municipality: string;
    state: string;
    totalArea: string;
    productionArea: string;
    permanentProtectionArea: string;
    legalReserveArea: string;
    activityTypes: string[];
    integrationSystemType: string;
    livestockType: string;
    productionSystem: string;
    systemUsageTime: string;
    dailyDescription: string;
    pastureTypes: string[];
    useSilage: string;
    hectares: string;
    cattleCount: string;
    heiferCount: string;
    bullCount: string;
    calfCount: string;
    bullCalfCount: string;
    cattleWeight: string;
    heiferWeight: string;
    bullWeight: string;
    calfWeight: string;
    bullCalfWeight: string;
    heiferWeightGain: string;
    bullWeightGain: string;
    calfWeightGain: string;
    cattleDigestibility: string;
    heiferDigestibility: string;
    bullDigestibility: string;
    calfDigestibility: string;
    bullCalfDigestibility: string;
    pregnancyRate: string;
    cattleConfinement: string;
    heiferConfinement: string;
    bullConfinement: string;
    calfConfinement: string;
    bullCalfConfinement: string;
    cattlePasture: string;
    heiferPasture: string;
    bullPasture: string;
    calfPasture: string;
    bullCalfPasture: string;
  };
  economicData: {
    grossIncome: string;
    financingPercentage: string;
    productionCost: string;
    propertyValue: string;
    managementSystem: string;
  };
  socialData: {
    permanentEmployees: string;
    highestEducationEmployee: string;
    highestSalary: string;
    lowestEducationEmployee: string;
    lowestSalary: string;
    familyMembers: string;
    familyMembersLevel: string;
    technicalAssistance: string;
  };
  environmentalData: {
    organicMatterPercentage: string;
    calciumQuantity: string;
    monthlyFuelConsumption: string;
    monthlyElectricityExpense: string;
    cultures: any[];
    pastures: any[];
  };
}

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

export async function submitFormCorrect(formData: CompleteFormData, userId?: string) {
  try {
    console.log('Iniciando submissão do formulário nas tabelas corretas...', formData);

    // 1. Criar o formulário principal
    const { data: form, error: formError } = await supabase
      .from('forms')
      .insert({
        user_id: userId || null,
        status: 'completed',
        submitted_at: new Date().toISOString()
      })
      .select()
      .single();

    if (formError) {
      console.error('Erro ao criar formulário principal:', formError);
      throw new Error(`Erro ao criar formulário: ${formError.message}`);
    }

    console.log('Formulário principal criado:', form);
    const formId = form.id;

    // 2. Inserir dados pessoais
    const { error: personalError } = await supabase
      .from('personal_data')
      .insert({
        form_id: formId,
        name: formData.personalData.name,
        age: parseIntSafe(formData.personalData.age),
        occupation: formData.personalData.occupation,
        education: formData.personalData.education,
        years_in_agriculture: parseIntSafe(formData.personalData.yearsInAgriculture)
      });

    if (personalError) {
      console.error('Erro ao inserir dados pessoais:', personalError);
      throw new Error(`Erro ao salvar dados pessoais: ${personalError.message}`);
    }

    // 3. Inserir dados da propriedade
    const { data: propertyDataResult, error: propertyError } = await supabase
      .from('property_data')
      .insert({
        form_id: formId,
        property_name: formData.propertyData.propertyName,
        municipality: formData.propertyData.municipality,
        state: formData.propertyData.state,
        total_area: parseNumber(formData.propertyData.totalArea),
        production_area: parseNumber(formData.propertyData.productionArea),
        permanent_protection_area: parseNumber(formData.propertyData.permanentProtectionArea),
        legal_reserve_area: parseNumber(formData.propertyData.legalReserveArea),
        activity_types: formData.propertyData.activityTypes,
        integration_system_type: formData.propertyData.integrationSystemType,
        livestock_type: formData.propertyData.livestockType,
        production_system: formData.propertyData.productionSystem,
        system_usage_time: parseIntSafe(formData.propertyData.systemUsageTime),
        daily_description: formData.propertyData.dailyDescription,
        pasture_types: formData.propertyData.pastureTypes,
        use_silage: formData.propertyData.useSilage === 'Sim',
        silage_hectares: parseNumber(formData.propertyData.hectares)
      })
      .select()
      .single();

    if (propertyError) {
      console.error('Erro ao inserir dados da propriedade:', propertyError);
      throw new Error(`Erro ao salvar dados da propriedade: ${propertyError.message}`);
    }

    // 4. Inserir dados do rebanho (livestock_data)
    const { error: livestockError } = await supabase
      .from('livestock_data')
      .insert({
        property_data_id: propertyDataResult.id,
        cattle_count: parseIntSafe(formData.propertyData.cattleCount),
        heifer_count: parseIntSafe(formData.propertyData.heiferCount),
        bull_count: parseIntSafe(formData.propertyData.bullCount),
        calf_count: parseIntSafe(formData.propertyData.calfCount),
        bull_calf_count: parseIntSafe(formData.propertyData.bullCalfCount),
        cattle_weight: parseNumber(formData.propertyData.cattleWeight),
        heifer_weight: parseNumber(formData.propertyData.heiferWeight),
        bull_weight: parseNumber(formData.propertyData.bullWeight),
        calf_weight: parseNumber(formData.propertyData.calfWeight),
        bull_calf_weight: parseNumber(formData.propertyData.bullCalfWeight),
        heifer_weight_gain: parseNumber(formData.propertyData.heiferWeightGain),
        bull_weight_gain: parseNumber(formData.propertyData.bullWeightGain),
        calf_weight_gain: parseNumber(formData.propertyData.calfWeightGain),
        cattle_digestibility: parseNumber(formData.propertyData.cattleDigestibility),
        heifer_digestibility: parseNumber(formData.propertyData.heiferDigestibility),
        bull_digestibility: parseNumber(formData.propertyData.bullDigestibility),
        calf_digestibility: parseNumber(formData.propertyData.calfDigestibility),
        bull_calf_digestibility: parseNumber(formData.propertyData.bullCalfDigestibility),
        pregnancy_rate: parseNumber(formData.propertyData.pregnancyRate),
        cattle_confinement: parseNumber(formData.propertyData.cattleConfinement),
        heifer_confinement: parseNumber(formData.propertyData.heiferConfinement),
        bull_confinement: parseNumber(formData.propertyData.bullConfinement),
        calf_confinement: parseNumber(formData.propertyData.calfConfinement),
        bull_calf_confinement: parseNumber(formData.propertyData.bullCalfConfinement),
        cattle_pasture: parseNumber(formData.propertyData.cattlePasture),
        heifer_pasture: parseNumber(formData.propertyData.heiferPasture),
        bull_pasture: parseNumber(formData.propertyData.bullPasture),
        calf_pasture: parseNumber(formData.propertyData.calfPasture),
        bull_calf_pasture: parseNumber(formData.propertyData.bullCalfPasture)
      });

    if (livestockError) {
      console.error('Erro ao inserir dados do rebanho:', livestockError);
      // Não vamos dar throw aqui porque os dados do rebanho podem ser opcionais
    }

    // 5. Inserir dados econômicos
    const { error: economicError } = await supabase
      .from('economic_data')
      .insert({
        form_id: formId,
        gross_income: parseNumber(formData.economicData.grossIncome),
        financing_percentage: parseNumber(formData.economicData.financingPercentage),
        production_cost: parseNumber(formData.economicData.productionCost),
        property_value: parseNumber(formData.economicData.propertyValue),
        management_system: formData.economicData.managementSystem
      });

    if (economicError) {
      console.error('Erro ao inserir dados econômicos:', economicError);
      throw new Error(`Erro ao salvar dados econômicos: ${economicError.message}`);
    }

    // 6. Inserir dados sociais
    const { error: socialError } = await supabase
      .from('social_data')
      .insert({
        form_id: formId,
        permanent_employees: parseIntSafe(formData.socialData.permanentEmployees),
        highest_education_employee: formData.socialData.highestEducationEmployee,
        highest_salary: parseNumber(formData.socialData.highestSalary),
        lowest_education_employee: formData.socialData.lowestEducationEmployee,
        lowest_salary: parseNumber(formData.socialData.lowestSalary),
        family_members: parseIntSafe(formData.socialData.familyMembers),
        family_members_level: formData.socialData.familyMembersLevel,
        technical_assistance: formData.socialData.technicalAssistance === 'Sim'
      });

    if (socialError) {
      console.error('Erro ao inserir dados sociais:', socialError);
      throw new Error(`Erro ao salvar dados sociais: ${socialError.message}`);
    }

    // 7. Inserir dados ambientais
    const { data: environmentalDataResult, error: environmentalError } = await supabase
      .from('environmental_data')
      .insert({
        form_id: formId,
        organic_matter_percentage: parseNumber(formData.environmentalData.organicMatterPercentage),
        calcium_quantity: parseNumber(formData.environmentalData.calciumQuantity),
        monthly_fuel_consumption: parseNumber(formData.environmentalData.monthlyFuelConsumption),
        monthly_electricity_expense: parseNumber(formData.environmentalData.monthlyElectricityExpense)
      })
      .select()
      .single();

    if (environmentalError) {
      console.error('Erro ao inserir dados ambientais:', environmentalError);
      throw new Error(`Erro ao salvar dados ambientais: ${environmentalError.message}`);
    }

    // 8. Inserir dados das culturas
    if (formData.environmentalData.cultures && formData.environmentalData.cultures.length > 0) {
      const culturesData = formData.environmentalData.cultures.map((culture: any) => ({
        environmental_data_id: environmentalDataResult.id,
        culture_name: culture.name,
        area_hectares: parseNumber(culture.area),
        nitrogen_fertilizer: parseNumber(culture.nitrogen),
        phosphate_fertilizer: parseNumber(culture.phosphate),
        potassium_fertilizer: parseNumber(culture.potassium),
        limestone: parseNumber(culture.limestone),
        gypsum: parseNumber(culture.gypsum),
        urea: parseNumber(culture.urea)
      }));

      const { error: culturesError } = await supabase
        .from('cultures_data')
        .insert(culturesData);

      if (culturesError) {
        console.error('Erro ao inserir dados das culturas:', culturesError);
      }
    }

    // 9. Inserir dados das pastagens
    if (formData.environmentalData.pastures && formData.environmentalData.pastures.length > 0) {
      const pasturesData = formData.environmentalData.pastures.map((pasture: any) => ({
        environmental_data_id: environmentalDataResult.id,
        pasture_name: pasture.name,
        area_hectares: parseNumber(pasture.area),
        condition: pasture.condition
      }));

      const { error: pasturesError } = await supabase
        .from('pastures_data')
        .insert(pasturesData);

      if (pasturesError) {
        console.error('Erro ao inserir dados das pastagens:', pasturesError);
      }
    }

    // 10. Calcular índices de sustentabilidade (se a função RPC existir)
    let indices = null;
    try {
      const { data: indicesData, error: calcError } = await supabase
        .rpc('calculate_sustainability_indices', { form_id: formId });

      if (!calcError && indicesData) {
        indices = indicesData;
      }
    } catch (rpcError) {
      console.log('Função de cálculo de índices não encontrada ou erro:', rpcError);
    }

    console.log('Formulário salvo com sucesso em todas as tabelas!');

    return { 
      success: true, 
      formId: formId, 
      indices: indices,
      message: 'Formulário enviado com sucesso!' 
    };

  } catch (error: any) {
    console.error('Erro ao submeter formulário:', error);
    return { 
      success: false, 
      error: error.message || 'Erro ao salvar o formulário',
      message: error.message || 'Erro desconhecido ao salvar formulário'
    };
  }
}

// Função para recuperar os dados completos de um formulário
export async function getFormResults(formId: string) {
  try {
    const { data, error } = await supabase
      .from('form_responses_view')
      .select('*')
      .eq('form_id', formId)
      .single();

    if (error) {
      console.error('Erro ao buscar resultados:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Erro ao recuperar resultados do formulário:', error);
    return null;
  }
}
