import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useEconomicData } from "@/hooks/useFormStorage";
import { saveEconomicData as saveToDatabase } from "@/lib/formStepSave";
import FormSidebar from "@/components/FormSidebar";
import FormStep from "@/components/FormStep";
import EconomicInfoForm from "@/components/EconomicInfoForm";
import MobileStepper from "@/components/MobileStepper";
import Step3Modal from "@/components/Step3Modal";

const steps = [
  { number: 1, title: "Dados pessoais", completed: true },
  { number: 2, title: "Informações da propriedade", completed: true },
  { number: 3, title: "Informações econômicas", completed: false },
  { number: 4, title: "Informações sociais", completed: false },
  { number: 5, title: "Informações ambientais", completed: false },
  { number: 6, title: "Resultado", completed: false },
];

interface EconomicInfoFormData {
  grossIncome: string;
  financingPercentage: string;
  productionCost: string;
  propertyValue: string;
  managementSystem: string;
}

const EconomicInfoPage = () => {
  const [currentStep] = useState(3);
  const navigate = useNavigate();
  const [isFormValid, setIsFormValid] = useState(false);
  const { toast } = useToast();
  const { data: economicData, saveData: saveEconomicData } = useEconomicData();
  const [isSaving, setIsSaving] = useState(false);

  const handleFormSubmit = async (data: EconomicInfoFormData) => {
    setIsSaving(true);
    
    // Salvar no localStorage primeiro
    saveEconomicData(data);
    
    // Salvar no banco de dados
    const result = await saveToDatabase(data);
    
    if (result.success) {
      toast({
        title: "Dados salvos com sucesso!",
        description: "Dados econômicos salvos no banco de dados.",
      });
      
      // Navegar para próxima etapa
      setTimeout(() => {
        navigate('/social-info');
      }, 500);
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
    navigate('/property-info');
  };

  const handleModalContinue = () => {
    toast({
      title: "Bem-vindo ao passo 3!",
      description: "Vamos coletar informações econômicas da sua propriedade.",
    });
  };

  return (
    <>
      <Step3Modal onContinue={handleModalContinue} />
      
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
            title="Informações econômicas"
            subtitle="Identifique os índices econômicos da sua propriedade."
            onBack={currentStep > 1 ? handleBack : undefined}
            onNext={handleNext}
            canGoBack={currentStep > 1}
            canGoNext={true}
            isNextDisabled={!isFormValid}
          >
            <EconomicInfoForm
              onSubmit={handleFormSubmit}
              initialData={economicData}
              onValidationChange={setIsFormValid}
            />
          </FormStep>
        </div>
      </div>
    </>
  );
};

export default EconomicInfoPage;
