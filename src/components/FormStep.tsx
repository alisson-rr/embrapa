import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface FormStepProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  onBack?: () => void;
  onNext?: () => void;
  canGoBack?: boolean;
  canGoNext?: boolean;
  isNextDisabled?: boolean;
  isLastStep?: boolean;
}

const FormStep = ({ 
  title, 
  subtitle, 
  children, 
  onBack, 
  onNext,
  canGoBack = true,
  canGoNext = true,
  isNextDisabled = false,
  isLastStep = false
}: FormStepProps) => {
  return (
    <main className="flex-1 min-h-screen p-6 lg:p-12">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">
            {title}
          </h1>
          <p className="text-lg text-gray-600">
            {subtitle}
          </p>
        </header>

        {/* Form Card */}
        <Card className="p-8 bg-white shadow-lg border-0 rounded-2xl">
          {children}
        </Card>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          {canGoBack ? (
            <Button 
              variant="outline" 
              onClick={onBack}
              className="flex items-center gap-2 rounded-xl border-2 border-gray-300 hover:border-primary hover:text-primary"
            >
              <ChevronLeft className="w-4 h-4" />
              Voltar
            </Button>
          ) : (
            <div></div>
          )}

          {canGoNext && (
            <Button 
              onClick={onNext}
              disabled={isNextDisabled}
              className="flex items-center gap-2 bg-primary hover:bg-primary/90 rounded-xl px-6 py-2.5"
            >
              {isLastStep ? 'Concluir' : 'Prosseguir'}
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </main>
  );
};

export default FormStep;