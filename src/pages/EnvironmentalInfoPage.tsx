import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useEnvironmentalData, usePropertyData } from "@/hooks/useFormStorage";
import { saveEnvironmentalData as saveToDatabase, clearCurrentForm } from "@/lib/formStepSave";
import { calcularIndices } from "@/lib/fuzzyCalculations";
import FormSidebar from "@/components/FormSidebar";
import FormStep from "@/components/FormStep";
import EnvironmentalInfoForm from "@/components/EnvironmentalInfoForm";
import MobileStepper from "@/components/MobileStepper";
import Step5Modal from "@/components/Step5Modal";

const steps = [
  { number: 1, title: "Dados pessoais", completed: true },
  { number: 2, title: "Informações da propriedade", completed: true },
  { number: 3, title: "Informações econômicas", completed: true },
  { number: 4, title: "Informações sociais", completed: true },
  { number: 5, title: "Informações ambientais", completed: false },
  { number: 6, title: "Resultado", completed: false },
];

interface EnvironmentalInfoFormData {
  organicMatterPercentage: string;
  calciumQuantity: string;
  fertilizers: any[];
  herbicides: any[];
  fungicides: any[];
  insecticides: any[];
  otherPesticides: any[];
  fuelConsumption: string;
  electricityExpense: string;
}

const EnvironmentalInfoPage = () => {
  const [currentStep] = useState(5);
  const navigate = useNavigate();
  const [isFormValid, setIsFormValid] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const { data: environmentalData, saveData: saveEnvironmentalData } = useEnvironmentalData();
  const { data: propertyData } = usePropertyData();

  // Culturas cadastradas na etapa 2 (Lavoura)
  const availableCrops = propertyData.crops || [];

  const handleFormSubmit = async (data: EnvironmentalInfoFormData) => {
    setIsSaving(true);
    
    // Salvar no localStorage primeiro
    saveEnvironmentalData(data);
    
    // Salvar no banco de dados (última etapa - marca como completo)
    const result = await saveToDatabase(data);
    
    if (result.success && result.formId) {
      toast({
        title: "Calculando índices de sustentabilidade...",
        description: "Processando dados com lógica fuzzy.",
      });
      
      // Calcular índices de sustentabilidade usando lógica fuzzy
      try {
        const indices = await calcularIndices(result.formId);
        console.log('Índices calculados:', indices);
        
        toast({
          title: "Cálculo concluído!",
          description: `Índice de Sustentabilidade: ${indices.sustentabilidade.toFixed(0)}/100`,
        });
      } catch (error) {
        console.error('Erro ao calcular índices:', error);
        // Continuar mesmo se houver erro no cálculo
        toast({
          title: "Aviso",
          description: "Não foi possível calcular todos os índices, mas o formulário foi salvo.",
          variant: "default",
        });
      }
      
      // Limpar dados do localStorage e navegar para resultados
      clearCurrentForm();
      
      // Navegar para página de resultados com o formId
      setTimeout(() => {
        navigate(`/result/${result.formId}`);
      }, 1000);
    } else {
      toast({
        title: "Erro ao salvar",
        description: result.error || "Não foi possível salvar os dados no banco.",
        variant: "destructive",
      });
    }
    
    setIsSaving(false);
  };

  const handleNext = () => {
    // Trigger form submission
    const form = document.querySelector('form');
    if (form) {
      form.requestSubmit();
    }
  };

  const handleBack = () => {
    navigate('/social-info');
  };

  const handleModalContinue = () => {
    toast({
      title: "Bem-vindo ao passo 5!",
      description: "Vamos coletar informações ambientais da sua propriedade.",
    });
  };

  return (
    <>
      <Step5Modal onContinue={handleModalContinue} />
      
      <div className="flex min-h-screen bg-gray-50">
        {/* Desktop Sidebar */}
        <FormSidebar currentStep={currentStep} steps={steps} />
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col lg:pl-0 pl-4 pr-4">
          {/* Mobile Stepper */}
          <MobileStepper 
            currentStep={currentStep} 
            totalSteps={steps.length} 
            steps={steps}
          />
          
          {/* Form Step */}
          <FormStep
            title="Informações ambientais"
            subtitle="Identifique os índices ambientais da sua propriedade."
            onBack={currentStep > 1 ? handleBack : undefined}
            onNext={handleNext}
            canGoBack={currentStep > 1}
            canGoNext={true}
            isNextDisabled={!isFormValid}
            isLastStep={true}
          >
            <EnvironmentalInfoForm
              onSubmit={handleFormSubmit}
              initialData={environmentalData}
              onValidationChange={setIsFormValid}
              availableCrops={availableCrops}
            />
          </FormStep>
        </div>
      </div>
    </>
  );
};

export default EnvironmentalInfoPage;
