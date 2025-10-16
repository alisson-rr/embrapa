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

export async function submitForm(formData: CompleteFormData, userId?: string) {
  try {
    console.log('Iniciando submissão do formulário...', formData);

    const livestockData = {
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
      bull_calf_pasture: parseNumber(formData.propertyData.bullCalfPasture),
    };

    const formRecord = {
      user_id: userId || null,
      status: 'completed',
      name: formData.personalData.name || null,
      age: parseIntSafe(formData.personalData.age),
      occupation: formData.personalData.occupation || null,
      education: formData.personalData.education || null,
      years_in_agriculture: parseIntSafe(formData.personalData.yearsInAgriculture),
      property_name: formData.propertyData.propertyName || null,
      municipality: formData.propertyData.municipality || null,
      state: formData.propertyData.state || null,
      total_area: parseNumber(formData.propertyData.totalArea),
      production_area: parseNumber(formData.propertyData.productionArea),
      permanent_protection_area: parseNumber(formData.propertyData.permanentProtectionArea),
      legal_reserve_area: parseNumber(formData.propertyData.legalReserveArea),
      activity_types: formData.propertyData.activityTypes || [],
      integration_system_type: formData.propertyData.integrationSystemType || null,
      livestock_type: formData.propertyData.livestockType || null,
      production_system: formData.propertyData.productionSystem || null,
      system_usage_time: parseIntSafe(formData.propertyData.systemUsageTime),
      daily_description: formData.propertyData.dailyDescription || null,
      pasture_types: formData.propertyData.pastureTypes || [],
      use_silage: formData.propertyData.useSilage === 'Sim',
      silage_hectares: parseNumber(formData.propertyData.hectares),
      livestock_data: livestockData,
      gross_income: parseNumber(formData.economicData.grossIncome),
      financing_percentage: parseNumber(formData.economicData.financingPercentage),
      production_cost: parseNumber(formData.economicData.productionCost),
      property_value: parseNumber(formData.economicData.propertyValue),
      management_system: formData.economicData.managementSystem || null,
      permanent_employees: parseIntSafe(formData.socialData.permanentEmployees),
      highest_education_employee: formData.socialData.highestEducationEmployee || null,
      highest_salary: parseNumber(formData.socialData.highestSalary),
      lowest_education_employee: formData.socialData.lowestEducationEmployee || null,
      lowest_salary: parseNumber(formData.socialData.lowestSalary),
      family_members: parseIntSafe(formData.socialData.familyMembers),
      family_members_level: formData.socialData.familyMembersLevel || null,
      technical_assistance: formData.socialData.technicalAssistance === 'Sim',
      organic_matter_percentage: parseNumber(formData.environmentalData.organicMatterPercentage),
      calcium_quantity: parseNumber(formData.environmentalData.calciumQuantity),
      monthly_fuel_consumption: parseNumber(formData.environmentalData.monthlyFuelConsumption),
      monthly_electricity_expense: parseNumber(formData.environmentalData.monthlyElectricityExpense),
      cultures: formData.environmentalData.cultures || [],
      pastures: formData.environmentalData.pastures || [],
    };

    const { data: form, error: insertError } = await supabase
      .from('sustainability_forms')
      .insert(formRecord)
      .select()
      .single();

    if (insertError) {
      console.error('Erro ao inserir formulário:', insertError);
      throw new Error(`Erro ao salvar: ${insertError.message}`);
    }

    console.log('Formulário salvo com sucesso:', form);

    const { data: indices, error: calcError } = await supabase
      .rpc('calculate_sustainability_indices', { p_form_id: form.id });

    if (calcError) {
      console.error('Erro ao calcular índices:', calcError);
    }

    return { success: true, formId: form.id, indices: indices?.[0] || null };
  } catch (error: any) {
    console.error('Erro ao submeter formulário:', error);
    return { success: false, error: error.message || 'Erro desconhecido' };
  }
}

export async function getFormResults(formId: string) {
  try {
    const { data, error } = await supabase
      .from('sustainability_forms')
      .select('*')
      .eq('id', formId)
      .single();
    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}