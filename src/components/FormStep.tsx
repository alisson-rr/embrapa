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
}

const FormStep = ({ 
  title, 
  subtitle, 
  children, 
  onBack, 
  onNext,
  canGoBack = true,
  canGoNext = true,
  isNextDisabled = false
}: FormStepProps) => {
  return (
    <main className="flex-1 bg-background min-h-screen p-6 lg:p-12">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">
            {title}
          </h1>
          <p className="text-lg text-muted-foreground">
            {subtitle}
          </p>
        </header>

        {/* Form Card */}
        <Card className="p-8 bg-form-bg shadow-[var(--shadow-form)] border-0">
          {children}
        </Card>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          {canGoBack ? (
            <Button 
              variant="outline" 
              onClick={onBack}
              className="flex items-center gap-2"
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
              className="flex items-center gap-2 bg-primary hover:bg-primary-light"
            >
              Prosseguir
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </main>
  );
};

export default FormStep;