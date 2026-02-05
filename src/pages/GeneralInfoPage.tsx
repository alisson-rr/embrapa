import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useGeneralInfo } from "@/hooks/useFormStorage";
import { saveGeneralInfo as saveToDatabase } from "@/lib/formStepSave";
import { useAuth } from "@/contexts/AuthContext";
import FormSidebar from "@/components/FormSidebar";
import FormStep from "@/components/FormStep";
import GeneralInfoForm from "@/components/GeneralInfoForm";
import MobileStepper from "@/components/MobileStepper";
import WelcomeModal from "@/components/WelcomeModal";

const steps = [
  { number: 1, title: "Informações Gerais", completed: false },
  { number: 2, title: "Caracterização da Propriedade", completed: false },
  { number: 3, title: "Categorização do Rebanho", completed: false },
  { number: 4, title: "Informações Econômicas", completed: false },
  { number: 5, title: "Informações Sociais", completed: false },
  { number: 6, title: "Informações Ambientais", completed: false },
  { number: 7, title: "Comentários", completed: false },
];

interface GeneralInfoFormData {
  propertyName: string;
  municipality: string;
  state: string;
  geolocation: string;
  name: string;
  age: string;
  profession: string;
  education: string;
  yearsInAgriculture: string;
}

const GeneralInfoPage = () => {
  const [currentStep] = useState(1);
  const navigate = useNavigate();
  const [isFormValid, setIsFormValid] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { data: generalInfo, saveData: saveGeneralInfo } = useGeneralInfo();
  const [isSaving, setIsSaving] = useState(false);

  const handleFormSubmit = async (data: GeneralInfoFormData) => {
    setIsSaving(true);
    
    // Salvar no localStorage primeiro
    saveGeneralInfo(data);
    
    // Salvar no banco de dados
    const result = await saveToDatabase(data, user?.id);
    
    if (result.success) {
      toast({
        title: "Dados salvos com sucesso!",
        description: "Informações gerais salvas no banco de dados.",
      });
      
      // Navegar para próxima etapa
      setTimeout(() => {
        navigate('/property-info');
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
    const form = document.querySelector('form');
    if (form) {
      form.requestSubmit();
    }
  };

  const handleBack = () => {
    console.log("Navigate back");
  };

  const handleWelcomeStart = () => {
    toast({
      title: "Iniciando questionário",
      description: "Vamos começar com as informações gerais.",
    });
  };

  const handleWelcomeContinue = () => {
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
        <FormSidebar currentStep={currentStep} steps={steps} />
        
        <div className="flex-1 flex flex-col lg:pl-0 pl-4 pr-4">
          <MobileStepper 
            currentStep={currentStep} 
            totalSteps={steps.length} 
            steps={steps}
          />
          
          <FormStep
            title="Informações Gerais e Caracterização"
            subtitle="Preencha os dados da entrevista e informações pessoais"
            onBack={currentStep > 1 ? handleBack : undefined}
            onNext={handleNext}
            canGoBack={currentStep > 1}
            canGoNext={true}
            isNextDisabled={!isFormValid || isSaving}
          >
            <GeneralInfoForm
              onSubmit={handleFormSubmit}
              initialData={generalInfo}
              onValidationChange={setIsFormValid}
            />
          </FormStep>
        </div>
      </div>
    </>
  );
};

export default GeneralInfoPage;
