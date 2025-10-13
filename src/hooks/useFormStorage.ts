import { useState, useEffect } from 'react';

// Tipos para cada etapa do formulário
export interface PersonalFormData {
  name: string;
  age: string;
  occupation: string;
  education: string;
  yearsInAgriculture: string;
}

export interface PropertyFormData {
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
  // Dados do rebanho
  cattleCount: string;
  heiferCount: string;
  bullCount: string;
  calfCount: string;
  bullCalfCount: string;
  // Peso vivo médio
  cattleWeight: string;
  heiferWeight: string;
  bullWeight: string;
  calfWeight: string;
  bullCalfWeight: string;
  // Ganho de peso médio por dia
  heiferWeightGain: string;
  bullWeightGain: string;
  calfWeightGain: string;
  // Digestibilidade da dieta
  cattleDigestibility: string;
  heiferDigestibility: string;
  bullDigestibility: string;
  calfDigestibility: string;
  bullCalfDigestibility: string;
  // Taxa de prenhez
  pregnancyRate: string;
  // Fração do tempo no confinamento
  cattleConfinement: string;
  heiferConfinement: string;
  bullConfinement: string;
  calfConfinement: string;
  bullCalfConfinement: string;
  // Fração do tempo na pastagem
  cattlePasture: string;
  heiferPasture: string;
  bullPasture: string;
  calfPasture: string;
  bullCalfPasture: string;
}

export interface EconomicFormData {
  grossIncome: string;
  financingPercentage: string;
  productionCost: string;
  propertyValue: string;
  managementSystem: string;
}

export interface SocialFormData {
  permanentEmployees: string;
  highestEducationEmployee: string;
  highestSalary: string;
  lowestEducationEmployee: string;
  lowestSalary: string;
  familyMembers: string;
  familyMembersLevel: string;
  technicalAssistance: string;
}

export interface EnvironmentalFormData {
  organicMatterPercentage: string;
  calciumQuantity: string;
  cultures: any[];
  pastures: any[];
  monthlyFuelConsumption: string;
  monthlyElectricityExpense: string;
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

// Hook específico para dados pessoais
export const usePersonalData = () => {
  const { saveToStorage, loadFromStorage } = useFormStorage();
  
  const defaultData: PersonalFormData = {
    name: "",
    age: "",
    occupation: "",
    education: "",
    yearsInAgriculture: "",
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
    propertyName: "",
    municipality: "",
    state: "",
    totalArea: "",
    productionArea: "",
    permanentProtectionArea: "",
    legalReserveArea: "",
    activityTypes: [],
    integrationSystemType: "",
    livestockType: "",
    productionSystem: "",
    systemUsageTime: "",
    dailyDescription: "",
    pastureTypes: [],
    useSilage: "",
    hectares: "",
    cattleCount: "",
    heiferCount: "",
    bullCount: "",
    calfCount: "",
    bullCalfCount: "",
    cattleWeight: "",
    heiferWeight: "",
    bullWeight: "",
    calfWeight: "",
    bullCalfWeight: "",
    heiferWeightGain: "",
    bullWeightGain: "",
    calfWeightGain: "",
    cattleDigestibility: "",
    heiferDigestibility: "",
    bullDigestibility: "",
    calfDigestibility: "",
    bullCalfDigestibility: "",
    pregnancyRate: "",
    cattleConfinement: "",
    heiferConfinement: "",
    bullConfinement: "",
    calfConfinement: "",
    bullCalfConfinement: "",
    cattlePasture: "",
    heiferPasture: "",
    bullPasture: "",
    calfPasture: "",
    bullCalfPasture: "",
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
    familyMembers: "",
    familyMembersLevel: "",
    technicalAssistance: "",
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
    cultures: [],
    pastures: [],
    monthlyFuelConsumption: "",
    monthlyElectricityExpense: "",
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
