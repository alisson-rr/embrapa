import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useEnvironmentalData, usePropertyData } from "@/hooks/useFormStorage";
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
  cultures: any[];
  pastures: any[];
  monthlyFuelConsumption: string;
  monthlyElectricityExpense: string;
}

const EnvironmentalInfoPage = () => {
  const [currentStep] = useState(5);
  const navigate = useNavigate();
  const [isFormValid, setIsFormValid] = useState(false);
  const { toast } = useToast();
  const { data: environmentalData, saveData: saveEnvironmentalData } = useEnvironmentalData();
  const { data: propertyData } = usePropertyData();

  // Verificar condicionais baseadas nos dados da propriedade
  const hasCultures = useMemo(() => {
    // Verifica se o usuário selecionou agricultura nas atividades
    if (propertyData.activityTypes && Array.isArray(propertyData.activityTypes)) {
      return propertyData.activityTypes.some(
        activity => activity.toLowerCase().includes('agricultura') || 
                   activity.toLowerCase().includes('lavoura') ||
                   activity.toLowerCase().includes('cultura')
      );
    }
    return false;
  }, [propertyData.activityTypes]);

  const hasPastures = useMemo(() => {
    // Verifica se o usuário tem pastagens selecionadas
    if (propertyData.pastureTypes && Array.isArray(propertyData.pastureTypes)) {
      return propertyData.pastureTypes.length > 0;
    }
    // Ou se selecionou pecuária nas atividades
    if (propertyData.activityTypes && Array.isArray(propertyData.activityTypes)) {
      return propertyData.activityTypes.some(
        activity => activity.toLowerCase().includes('pecuária') || 
                   activity.toLowerCase().includes('pecuaria') ||
                   activity.toLowerCase().includes('pastagem')
      );
    }
    return false;
  }, [propertyData.pastureTypes, propertyData.activityTypes]);

  const handleFormSubmit = (data: EnvironmentalInfoFormData) => {
    saveEnvironmentalData(data);
    toast({
      title: "Dados salvos com sucesso!",
      description: "Prosseguindo para a próxima etapa...",
    });
    // Navigate to next step (resultado)
    setTimeout(() => {
      console.log("Navigate to step 6 - Resultado");
      // navigate('/resultado');
    }, 1000);
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
          >
            <EnvironmentalInfoForm
              onSubmit={handleFormSubmit}
              initialData={environmentalData}
              onValidationChange={setIsFormValid}
              hasCultures={hasCultures}
              hasPastures={hasPastures}
            />
          </FormStep>
        </div>
      </div>
    </>
  );
};

export default EnvironmentalInfoPage;
