import { useState } from "react";
import { useFormContext } from "@/contexts/FormContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const FormDebugPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { formData, resetForm, getFormProgress } = useFormContext();

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="bg-gray-800 hover:bg-gray-700 text-white text-xs px-3 py-2"
        >
          Debug API
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80">
      <Card className="p-4 bg-gray-900 text-white text-xs max-h-96 overflow-y-auto">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-bold text-sm">Fake API Debug</h3>
          <Button
            onClick={() => setIsOpen(false)}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-gray-700 h-6 w-6 p-0"
          >
            ×
          </Button>
        </div>
        
        <div className="space-y-3">
          <div>
            <strong>Progresso:</strong> {getFormProgress()}%
          </div>
          
          <div>
            <strong>Passo Atual:</strong> {formData.currentStep}
          </div>
          
          <div>
            <strong>Passos Completos:</strong> [{formData.completedSteps.join(', ')}]
          </div>
          
          <div>
            <strong>Dados Pessoais:</strong>
            <pre className="text-xs bg-gray-800 p-2 rounded mt-1 overflow-x-auto">
              {JSON.stringify(formData.personalData, null, 2)}
            </pre>
          </div>
          
          <div>
            <strong>Dados da Propriedade:</strong>
            <pre className="text-xs bg-gray-800 p-2 rounded mt-1 overflow-x-auto">
              {JSON.stringify({
                nome: formData.propertyData.propertyName,
                municipio: formData.propertyData.municipality,
                estado: formData.propertyData.state,
                atividades: formData.propertyData.activityTypes,
                // Mostra apenas alguns campos para não sobrecarregar
              }, null, 2)}
            </pre>
          </div>
          
          <div>
            <strong>Dados Econômicos:</strong>
            <pre className="text-xs bg-gray-800 p-2 rounded mt-1 overflow-x-auto">
              {JSON.stringify(formData.economicData, null, 2)}
            </pre>
          </div>
          
          <div>
            <strong>Dados Sociais:</strong>
            <pre className="text-xs bg-gray-800 p-2 rounded mt-1 overflow-x-auto">
              {JSON.stringify(formData.socialData, null, 2)}
            </pre>
          </div>
          
          <div className="pt-2 border-t border-gray-700">
            <Button
              onClick={resetForm}
              variant="destructive"
              size="sm"
              className="w-full text-xs"
            >
              Resetar Formulário
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default FormDebugPanel;
