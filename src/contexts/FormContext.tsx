import React, { createContext, useContext, useState, ReactNode } from 'react';

// Tipos para cada etapa do formulário
export interface PersonalData {
  name: string;
  age: string;
  occupation: string;
  education: string;
  yearsInAgriculture: string;
}

export interface PropertyData {
  propertyName: string;
  municipality: string;
  state: string;
  totalArea: string;
  productionArea: string;
  permanentProtectionArea: string;
  legalReserveArea: string;
  activityTypes: string[];
  livestockType: string;
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

export interface EconomicData {
  grossIncome: string;
  financingPercentage: string;
  productionCost: string;
  propertyValue: string;
  managementSystem: string;
}

export interface SocialData {
  permanentEmployees: string;
  highestEducationEmployee: string;
  highestSalary: string;
  lowestEducationEmployee: string;
  lowestSalary: string;
  familyMembers: string;
  familyMembersLevel: string;
  technicalAssistance: string;
}

export interface FormData {
  personalData: PersonalData;
  propertyData: PropertyData;
  economicData: EconomicData;
  socialData: SocialData;
  currentStep: number;
  completedSteps: number[];
}

interface FormContextType {
  formData: FormData;
  updatePersonalData: (data: PersonalData) => void;
  updatePropertyData: (data: PropertyData) => void;
  updateEconomicData: (data: EconomicData) => void;
  updateSocialData: (data: SocialData) => void;
  setCurrentStep: (step: number) => void;
  markStepCompleted: (step: number) => void;
  resetForm: () => void;
  getFormProgress: () => number;
}

const FormContext = createContext<FormContextType | undefined>(undefined);

// Dados iniciais vazios
const initialFormData: FormData = {
  personalData: {
    name: "",
    age: "",
    occupation: "",
    education: "",
    yearsInAgriculture: "",
  },
  propertyData: {
    propertyName: "",
    municipality: "",
    state: "",
    totalArea: "",
    productionArea: "",
    permanentProtectionArea: "",
    legalReserveArea: "",
    activityTypes: [],
    livestockType: "",
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
  },
  economicData: {
    grossIncome: "",
    financingPercentage: "",
    productionCost: "",
    propertyValue: "",
    managementSystem: "",
  },
  socialData: {
    permanentEmployees: "",
    highestEducationEmployee: "",
    highestSalary: "",
    lowestEducationEmployee: "",
    lowestSalary: "",
    familyMembers: "",
    familyMembersLevel: "",
    technicalAssistance: "",
  },
  currentStep: 1,
  completedSteps: [],
};

export const FormProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [formData, setFormData] = useState<FormData>(() => {
    // Tentar carregar dados do localStorage
    const savedData = localStorage.getItem('embrapa-form-data');
    if (savedData) {
      try {
        return JSON.parse(savedData);
      } catch (error) {
        console.error('Erro ao carregar dados salvos:', error);
        return initialFormData;
      }
    }
    return initialFormData;
  });

  // Salvar no localStorage sempre que os dados mudarem
  const saveToLocalStorage = (newData: FormData) => {
    try {
      localStorage.setItem('embrapa-form-data', JSON.stringify(newData));
    } catch (error) {
      console.error('Erro ao salvar dados:', error);
    }
  };

  const updatePersonalData = (data: PersonalData) => {
    const newFormData = { ...formData, personalData: data };
    setFormData(newFormData);
    saveToLocalStorage(newFormData);
  };

  const updatePropertyData = (data: PropertyData) => {
    const newFormData = { ...formData, propertyData: data };
    setFormData(newFormData);
    saveToLocalStorage(newFormData);
  };

  const updateEconomicData = (data: EconomicData) => {
    const newFormData = { ...formData, economicData: data };
    setFormData(newFormData);
    saveToLocalStorage(newFormData);
  };

  const updateSocialData = (data: SocialData) => {
    const newFormData = { ...formData, socialData: data };
    setFormData(newFormData);
    saveToLocalStorage(newFormData);
  };

  const setCurrentStep = (step: number) => {
    const newFormData = { ...formData, currentStep: step };
    setFormData(newFormData);
    saveToLocalStorage(newFormData);
  };

  const markStepCompleted = (step: number) => {
    const completedSteps = [...formData.completedSteps];
    if (!completedSteps.includes(step)) {
      completedSteps.push(step);
    }
    const newFormData = { ...formData, completedSteps };
    setFormData(newFormData);
    saveToLocalStorage(newFormData);
  };

  const resetForm = () => {
    setFormData(initialFormData);
    localStorage.removeItem('embrapa-form-data');
  };

  const getFormProgress = () => {
    const totalSteps = 6;
    return Math.round((formData.completedSteps.length / totalSteps) * 100);
  };

  const value: FormContextType = {
    formData,
    updatePersonalData,
    updatePropertyData,
    updateEconomicData,
    updateSocialData,
    setCurrentStep,
    markStepCompleted,
    resetForm,
    getFormProgress,
  };

  return <FormContext.Provider value={value}>{children}</FormContext.Provider>;
};

export const useFormContext = () => {
  const context = useContext(FormContext);
  if (context === undefined) {
    throw new Error('useFormContext deve ser usado dentro de um FormProvider');
  }
  return context;
};
