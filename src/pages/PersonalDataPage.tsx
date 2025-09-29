import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { usePersonalData } from "@/hooks/useFormStorage";
import FormSidebar from "@/components/FormSidebar";
import FormStep from "@/components/FormStep";
import PersonalDataForm from "@/components/PersonalDataForm";
import MobileStepper from "@/components/MobileStepper";
import WelcomeModal from "@/components/WelcomeModal";

const steps = [
  { number: 1, title: "Dados pessoais", completed: false },
  { number: 2, title: "Informações profissionais", completed: false },
  { number: 3, title: "Experiência agrícola", completed: false },
  { number: 4, title: "Práticas sustentáveis", completed: false },
  { number: 5, title: "Tecnologia e inovação", completed: false },
  { number: 6, title: "Revisão e confirmação", completed: false },
];

interface PersonalDataFormData {
  name: string;
  age: string;
  occupation: string;
  education: string;
  yearsInAgriculture: string;
}

const PersonalDataPage = () => {
  const [currentStep] = useState(1);
  const navigate = useNavigate();
  const [isFormValid, setIsFormValid] = useState(false);
  const { toast } = useToast();
  const { data: personalData, saveData: savePersonalData } = usePersonalData();

  const handleFormSubmit = (data: PersonalDataFormData) => {
    savePersonalData(data);
    toast({
      title: "Dados salvos com sucesso!",
      description: "Prosseguindo para a próxima etapa...",
    });
    // Navigate to next step
    setTimeout(() => {
      navigate('/property-info');
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
    // Navigate back logic here
    console.log("Navigate back");
  };

  const handleWelcomeStart = () => {
    // Start fresh questionnaire
    toast({
      title: "Iniciando questionário",
      description: "Vamos começar com seus dados pessoais.",
    });
  };

  const handleWelcomeContinue = () => {
    // Continue existing questionnaire
    toast({
      title: "Continuando questionário",
      description: "Retomando de onde você parou.",
    });
  };


  return (
    <>
      <WelcomeModal 
        onStart={handleWelcomeStart}
        onContinue={handleWelcomeContinue}
      />
      
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
          title="Dados pessoais"
          subtitle="Preencha as informações do formulário"
          onBack={currentStep > 1 ? handleBack : undefined}
          onNext={handleNext}
          canGoBack={currentStep > 1}
          canGoNext={true}
          isNextDisabled={!isFormValid}
        >
          <PersonalDataForm
            onSubmit={handleFormSubmit}
            initialData={personalData}
            onValidationChange={setIsFormValid}
          />
        </FormStep>
      </div>
    </div>
    </>
  );
};

export default PersonalDataPage;