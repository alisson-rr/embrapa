interface Step {
  number: number;
  title: string;
  completed: boolean;
}

interface MobileStepperProps {
  currentStep: number;
  totalSteps: number;
  steps: Step[];
}

const MobileStepper = ({ currentStep, totalSteps, steps }: MobileStepperProps) => {
  return (
    <div className="lg:hidden bg-sidebar-bg text-sidebar-fg p-4 mb-6">
      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">Passo {currentStep} de {totalSteps}</span>
          <span className="text-sm text-sidebar-muted">{Math.round((currentStep / totalSteps) * 100)}%</span>
        </div>
        <div className="w-full bg-step-inactive rounded-full h-2">
          <div 
            className="bg-step-active h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Current Step Title */}
      <div className="text-center">
        <h2 className="text-lg font-semibold">
          {steps.find(step => step.number === currentStep)?.title}
        </h2>
      </div>
    </div>
  );
};

export default MobileStepper;