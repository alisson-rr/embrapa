import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
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
  const [formData, setFormData] = useState<EconomicInfoFormData>({
    grossIncome: "",
    financingPercentage: "",
    productionCost: "",
    propertyValue: "",
    managementSystem: "",
  });
  const { toast } = useToast();

  const handleFormSubmit = (data: EconomicInfoFormData) => {
    setFormData(data);
    toast({
      title: "Dados salvos com sucesso!",
      description: "Prosseguindo para a próxima etapa...",
    });
    // Navigate to next step
    setTimeout(() => {
      navigate('/social-info');
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
              initialData={formData}
              onValidationChange={setIsFormValid}
            />
          </FormStep>
        </div>
      </div>
    </>
  );
};

export default EconomicInfoPage;
