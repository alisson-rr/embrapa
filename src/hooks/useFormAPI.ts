import { useState } from 'react';
import { useFormContext, PersonalData, PropertyData, EconomicData, SocialData } from '@/contexts/FormContext';

// Simula delay de rede
const simulateNetworkDelay = (ms: number = 1000) => 
  new Promise(resolve => setTimeout(resolve, ms));

// Simula resposta de API
const createAPIResponse = <T>(data: T, success: boolean = true) => ({
  success,
  data,
  message: success ? 'Dados salvos com sucesso!' : 'Erro ao salvar dados',
  timestamp: new Date().toISOString(),
});

export const useFormAPI = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { 
    formData, 
    updatePersonalData, 
    updatePropertyData, 
    updateEconomicData, 
    updateSocialData,
    markStepCompleted 
  } = useFormContext();

  // API para salvar dados pessoais
  const savePersonalData = async (data: PersonalData) => {
    setLoading(true);
    setError(null);
    
    try {
      await simulateNetworkDelay(800);
      
      // Simula validação no backend
      if (!data.name || !data.age) {
        throw new Error('Nome e idade são obrigatórios');
      }
      
      updatePersonalData(data);
      markStepCompleted(1);
      
      return createAPIResponse(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      return createAPIResponse(data, false);
    } finally {
      setLoading(false);
    }
  };

  // API para salvar dados da propriedade
  const savePropertyData = async (data: PropertyData) => {
    setLoading(true);
    setError(null);
    
    try {
      await simulateNetworkDelay(1200);
      
      // Simula validação no backend
      if (!data.propertyName || !data.municipality) {
        throw new Error('Nome da propriedade e município são obrigatórios');
      }
      
      updatePropertyData(data);
      markStepCompleted(2);
      
      return createAPIResponse(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      return createAPIResponse(data, false);
    } finally {
      setLoading(false);
    }
  };

  // API para salvar dados econômicos
  const saveEconomicData = async (data: EconomicData) => {
    setLoading(true);
    setError(null);
    
    try {
      await simulateNetworkDelay(900);
      
      // Simula validação no backend
      if (!data.grossIncome || !data.managementSystem) {
        throw new Error('Renda bruta e sistema de gestão são obrigatórios');
      }
      
      updateEconomicData(data);
      markStepCompleted(3);
      
      return createAPIResponse(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      return createAPIResponse(data, false);
    } finally {
      setLoading(false);
    }
  };

  // API para salvar dados sociais
  const saveSocialData = async (data: SocialData) => {
    setLoading(true);
    setError(null);
    
    try {
      await simulateNetworkDelay(1000);
      
      // Simula validação no backend
      if (!data.permanentEmployees || !data.technicalAssistance) {
        throw new Error('Número de empregados e assistência técnica são obrigatórios');
      }
      
      updateSocialData(data);
      markStepCompleted(4);
      
      return createAPIResponse(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      return createAPIResponse(data, false);
    } finally {
      setLoading(false);
    }
  };

  // API para buscar dados salvos (simula carregamento do servidor)
  const loadFormData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await simulateNetworkDelay(600);
      
      // Retorna os dados atuais do contexto (que já vêm do localStorage)
      return createAPIResponse(formData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar dados';
      setError(errorMessage);
      return createAPIResponse(formData, false);
    } finally {
      setLoading(false);
    }
  };

  // API para submeter formulário completo
  const submitCompleteForm = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await simulateNetworkDelay(2000); // Simula processamento mais longo
      
      // Simula validação completa
      const { personalData, propertyData, economicData, socialData } = formData;
      
      if (!personalData.name || !propertyData.propertyName || !economicData.grossIncome || !socialData.permanentEmployees) {
        throw new Error('Formulário incompleto. Verifique todos os campos obrigatórios.');
      }
      
      // Simula geração de relatório
      const reportId = `EMBRAPA-${Date.now()}`;
      const result = {
        reportId,
        formData,
        generatedAt: new Date().toISOString(),
        status: 'completed'
      };
      
      markStepCompleted(6);
      
      return createAPIResponse(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao processar formulário';
      setError(errorMessage);
      return createAPIResponse(null, false);
    } finally {
      setLoading(false);
    }
  };

  return {
    // Estados
    loading,
    error,
    formData,
    
    // Métodos da API
    savePersonalData,
    savePropertyData,
    saveEconomicData,
    saveSocialData,
    loadFormData,
    submitCompleteForm,
    
    // Utilitários
    clearError: () => setError(null),
  };
};
