import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import FormSidebar from "@/components/FormSidebar";
import FormStep from "@/components/FormStep";
import PersonalDataForm from "@/components/PersonalDataForm";
import MobileStepper from "@/components/MobileStepper";

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
  const [formData, setFormData] = useState<PersonalDataFormData>({
    name: "",
    age: "",
    occupation: "",
    education: "",
    yearsInAgriculture: "",
  });
  const { toast } = useToast();

  const handleFormSubmit = (data: PersonalDataFormData) => {
    setFormData(data);
    // Here you would typically navigate to the next step
    toast({
      title: "Dados salvos com sucesso!",
      description: "Prosseguindo para a próxima etapa...",
    });
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

  const isFormValid = formData.name && formData.age && formData.occupation && formData.education && formData.yearsInAgriculture;

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <FormSidebar currentStep={currentStep} steps={steps} />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
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
            initialData={formData}
          />
        </FormStep>
      </div>
    </div>
  );
};

export default PersonalDataPage;