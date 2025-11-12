import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useSocialData } from "@/hooks/useFormStorage";
import { saveSocialData as saveToDatabase } from "@/lib/formStepSave";
import FormSidebar from "@/components/FormSidebar";
import FormStep from "@/components/FormStep";
import SocialInfoForm from "@/components/SocialInfoForm";
import MobileStepper from "@/components/MobileStepper";
import Step4Modal from "@/components/Step4Modal";

const steps = [
  { number: 1, title: "Dados pessoais", completed: true },
  { number: 2, title: "Informações da propriedade", completed: true },
  { number: 3, title: "Informações econômicas", completed: true },
  { number: 4, title: "Informações sociais", completed: false },
  { number: 5, title: "Informações ambientais", completed: false },
  { number: 6, title: "Resultado", completed: false },
];

interface SocialInfoFormData {
  permanentEmployees: string;
  highestEducationEmployee: string;
  highestSalary: string;
  lowestEducationEmployee: string;
  lowestSalary: string;
  familyMembers: string;
  familyMembersLevel: string;
  technicalAssistance: string;
}

const SocialInfoPage = () => {
  const [currentStep] = useState(4);
  const navigate = useNavigate();
  const [isFormValid, setIsFormValid] = useState(false);
  const { toast } = useToast();
  const { data: socialData, saveData: saveSocialData } = useSocialData();
  const [isSaving, setIsSaving] = useState(false);

  const handleFormSubmit = async (data: SocialInfoFormData) => {
    setIsSaving(true);
    
    // Salvar no localStorage primeiro
    saveSocialData(data);
    
    // Salvar no banco de dados
    const result = await saveToDatabase(data);
    
    if (result.success) {
      toast({
        title: "Dados salvos com sucesso!",
        description: "Dados sociais salvos no banco de dados.",
      });
      
      // Navegar para próxima etapa
      setTimeout(() => {
        navigate('/environmental-info');
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
    navigate('/economic-info');
  };

  const handleModalContinue = () => {
    toast({
      title: "Bem-vindo ao passo 4!",
      description: "Vamos coletar informações sociais da sua propriedade.",
    });
  };

  return (
    <>
      <Step4Modal onContinue={handleModalContinue} />
      
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
          title="Informações sociais"
          subtitle="Identifique os índices sociais atrelados a sua propriedade."
          onBack={currentStep > 1 ? handleBack : undefined}
          onNext={handleNext}
          canGoBack={currentStep > 1}
          canGoNext={true}
          isNextDisabled={!isFormValid}
        >
          <SocialInfoForm
            onSubmit={handleFormSubmit}
            initialData={socialData}
            onValidationChange={setIsFormValid}
          />
        </FormStep>
      </div>
    </div>
    </>
  );
};

export default SocialInfoPage;
