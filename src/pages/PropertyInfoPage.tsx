import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { usePropertyData } from "@/hooks/useFormStorage";
import { savePropertyData as saveToDatabase } from "@/lib/formStepSave";
import FormSidebar from "@/components/FormSidebar";
import FormStep from "@/components/FormStep";
import PropertyInfoForm from "@/components/PropertyInfoForm";
import MobileStepper from "@/components/MobileStepper";

const steps = [
  { number: 1, title: "Dados pessoais", completed: true },
  { number: 2, title: "Informações da propriedade", completed: false },
  { number: 3, title: "Informações econômicas", completed: false },
  { number: 4, title: "Informações sociais", completed: false },
  { number: 5, title: "Informações ambientais", completed: false },
  { number: 6, title: "Resultado", completed: false },
];

interface PropertyInfoFormData {
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

const PropertyInfoPage = () => {
  const [currentStep] = useState(2);
  const navigate = useNavigate();
  const [isFormValid, setIsFormValid] = useState(false);
  const { toast } = useToast();
  const { data: propertyData, saveData: savePropertyData } = usePropertyData();
  const [isSaving, setIsSaving] = useState(false);

  const handleFormSubmit = async (data: PropertyInfoFormData) => {
    setIsSaving(true);
    
    // Salvar no localStorage primeiro
    savePropertyData(data);
    
    // Salvar no banco de dados
    const result = await saveToDatabase(data);
    
    if (result.success) {
      toast({
        title: "Dados salvos com sucesso!",
        description: "Dados da propriedade salvos no banco de dados.",
      });
      
      // Navegar para próxima etapa
      setTimeout(() => {
        navigate('/economic-info');
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
    navigate('/');
  };


  return (
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
          title="Inf. da propriedade"
          subtitle="Identifique sua propriedade e nos ajude a entender como ajudar."
          onBack={currentStep > 1 ? handleBack : undefined}
          onNext={handleNext}
          canGoBack={currentStep > 1}
          canGoNext={true}
          isNextDisabled={!isFormValid}
        >
          <PropertyInfoForm
            onSubmit={handleFormSubmit}
            initialData={propertyData}
            onValidationChange={setIsFormValid}
          />
        </FormStep>
      </div>
    </div>
  );
};

export default PropertyInfoPage;
