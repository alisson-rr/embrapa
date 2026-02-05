import { useState, useEffect } from 'react';

// Tipos para cada etapa do formulário
export interface GeneralInfoFormData {
  // Seção 1: Informações Gerais
  propertyName: string;
  municipality: string;
  state: string;
  geolocation: string;
  // Seção 2: Caracterização do Entrevistado
  name: string;
  age: string;
  profession: string;
  education: string;
  yearsInAgriculture: string;
}

export interface PersonalFormData {
  name: string;
  age: string;
  profession: string;
  education: string;
  yearsInAgriculture: string;
  propertyName: string;
  municipality: string;
  state: string;
}

export interface PropertyFormData {
  // 4 perguntas básicas
  totalArea: string;
  productionArea: string;
  productionSystem: string;
  productionSystemDetail: string;
  systemUsageTime: string;
  // Cards de seleção
  activityTypes: string[];
  // Perguntas condicionais - Lavoura
  crops: Array<{
    name: string;
    plantingMonth: string;
    areaPercentage: string;
  }>;
  useCoverCrop: string;
  coverCropTypes: string;
  // Perguntas condicionais - Pecuária
  pastureTypes: string;
  pastureSpecies: string;
  useSilage: string;
  silageHectares: string;
  // Perguntas condicionais - Floresta
  forestSpecies: string;
  forestArea: string;
  // Perguntas finais
  permanentProtectionArea: string;
  legalReserveArea: string;
}

export interface EconomicFormData {
  grossIncome: string;
  financingPercentage: string;
  productionCost: string;
  propertyValue: string;
  managementSystem: string;
  managementSystemName: string;
  decisionMakerSalary: string;
  productCommercialization: string;
}

export interface SocialFormData {
  permanentEmployees: string;
  highestEducationEmployee: string;
  highestSalary: string;
  lowestEducationEmployee: string;
  lowestSalary: string;
  temporaryEmployees: string;
  outsourcedAverageSalary: string;
  // Novos campos sociais
  oldestFamilyMemberAge: string;
  youngestFamilyMemberAge: string;
  operationalCourses: string;
  technicalCourses: string;
  specializationCourses: string;
  hasTechnicalAssistance: string;
  technicalAssistanceType: string;
  hasProfitSharing: string;
  hasHealthPlan: string;
}

export interface EnvironmentalFormData {
  organicMatterPercentage: string;
  calciumQuantity: string;
  fertilizers: Array<{
    culture: string;
    formula: string;
    totalQuantity: string;
  }>;
  herbicides: Array<{
    culture: string;
    herbicides: string;
    applicationsQuantity: string;
  }>;
  fungicides: Array<{
    culture: string;
    fungicides: string;
    applications: string;
  }>;
  insecticides: Array<{
    culture: string;
    insecticides: string;
    applications: string;
  }>;
  otherPesticides: Array<{
    culture: string;
    pesticideName: string;
    applications: string;
  }>;
  fuelConsumption: string;
  electricityExpense: string;
}

// Hook para gerenciar localStorage de cada etapa
export const useFormStorage = () => {
  // Função para salvar dados no localStorage
  const saveToStorage = (key: string, data: any) => {
    try {
      localStorage.setItem(`embrapa-${key}`, JSON.stringify(data));
    } catch (error) {
      console.error(`Erro ao salvar ${key}:`, error);
    }
  };

  // Função para carregar dados do localStorage
  const loadFromStorage = <T>(key: string, defaultValue: T): T => {
    try {
      const saved = localStorage.getItem(`embrapa-${key}`);
      return saved ? JSON.parse(saved) : defaultValue;
    } catch (error) {
      console.error(`Erro ao carregar ${key}:`, error);
      return defaultValue;
    }
  };

  // Função para limpar todos os dados
  const clearAllData = () => {
    try {
      const keys = ['personal-data', 'property-data', 'economic-data', 'social-data', 'environmental-data'];
      keys.forEach(key => localStorage.removeItem(`embrapa-${key}`));
    } catch (error) {
      console.error('Erro ao limpar dados:', error);
    }
  };

  return {
    saveToStorage,
    loadFromStorage,
    clearAllData,
  };
};

// Hook específico para informações gerais (Etapa 1)
export const useGeneralInfo = () => {
  const { saveToStorage, loadFromStorage } = useFormStorage();
  
  const defaultData: GeneralInfoFormData = {
    propertyName: "",
    municipality: "",
    state: "",
    geolocation: "",
    name: "",
    age: "",
    profession: "",
    education: "",
    yearsInAgriculture: "",
  };

  const [data, setData] = useState<GeneralInfoFormData>(() => 
    loadFromStorage('general-info', defaultData)
  );

  const saveData = (newData: GeneralInfoFormData) => {
    setData(newData);
    saveToStorage('general-info', newData);
  };

  return { data, saveData };
};

// Hook específico para dados pessoais
export const usePersonalData = () => {
  const { saveToStorage, loadFromStorage } = useFormStorage();
  
  const defaultData: PersonalFormData = {
    name: "",
    age: "",
    profession: "",
    education: "",
    yearsInAgriculture: "",
    propertyName: "",
    municipality: "",
    state: "",
  };

  const [data, setData] = useState<PersonalFormData>(() => 
    loadFromStorage('personal-data', defaultData)
  );

  const saveData = (newData: PersonalFormData) => {
    setData(newData);
    saveToStorage('personal-data', newData);
  };

  return { data, saveData };
};

// Hook específico para dados da propriedade
export const usePropertyData = () => {
  const { saveToStorage, loadFromStorage } = useFormStorage();
  
  const defaultData: PropertyFormData = {
    totalArea: "",
    productionArea: "",
    productionSystem: "",
    productionSystemDetail: "",
    systemUsageTime: "",
    activityTypes: [],
    crops: [],
    useCoverCrop: "",
    coverCropTypes: "",
    pastureTypes: "",
    pastureSpecies: "",
    useSilage: "",
    silageHectares: "",
    forestSpecies: "",
    forestArea: "",
    permanentProtectionArea: "",
    legalReserveArea: "",
  };

  const [data, setData] = useState<PropertyFormData>(() => 
    loadFromStorage('property-data', defaultData)
  );

  const saveData = (newData: PropertyFormData) => {
    setData(newData);
    saveToStorage('property-data', newData);
  };

  return { data, saveData };
};

// Hook específico para dados econômicos
export const useEconomicData = () => {
  const { saveToStorage, loadFromStorage } = useFormStorage();
  
  const defaultData: EconomicFormData = {
    grossIncome: "",
    financingPercentage: "",
    productionCost: "",
    propertyValue: "",
    managementSystem: "",
    managementSystemName: "",
    decisionMakerSalary: "",
    productCommercialization: "",
  };

  const [data, setData] = useState<EconomicFormData>(() => 
    loadFromStorage('economic-data', defaultData)
  );

  const saveData = (newData: EconomicFormData) => {
    setData(newData);
    saveToStorage('economic-data', newData);
  };

  return { data, saveData };
};

// Hook específico para dados sociais
export const useSocialData = () => {
  const { saveToStorage, loadFromStorage } = useFormStorage();
  
  const defaultData: SocialFormData = {
    permanentEmployees: "",
    highestEducationEmployee: "",
    highestSalary: "",
    lowestEducationEmployee: "",
    lowestSalary: "",
    temporaryEmployees: "",
    outsourcedAverageSalary: "",
    // Novos campos sociais
    oldestFamilyMemberAge: "",
    youngestFamilyMemberAge: "",
    operationalCourses: "",
    technicalCourses: "",
    specializationCourses: "",
    hasTechnicalAssistance: "",
    technicalAssistanceType: "",
    hasProfitSharing: "",
    hasHealthPlan: "",
  };

  const [data, setData] = useState<SocialFormData>(() => 
    loadFromStorage('social-data', defaultData)
  );

  const saveData = (newData: SocialFormData) => {
    setData(newData);
    saveToStorage('social-data', newData);
  };

  return { data, saveData };
};

// Hook específico para dados ambientais
export const useEnvironmentalData = () => {
  const { saveToStorage, loadFromStorage } = useFormStorage();
  
  const defaultData: EnvironmentalFormData = {
    organicMatterPercentage: "",
    calciumQuantity: "",
    fertilizers: [],
    herbicides: [],
    fungicides: [],
    insecticides: [],
    otherPesticides: [],
    fuelConsumption: "",
    electricityExpense: "",
  };

  const [data, setData] = useState<EnvironmentalFormData>(() => 
    loadFromStorage('environmental-data', defaultData)
  );

  const saveData = (newData: EnvironmentalFormData) => {
    setData(newData);
    saveToStorage('environmental-data', newData);
  };

  return { data, saveData };
};
