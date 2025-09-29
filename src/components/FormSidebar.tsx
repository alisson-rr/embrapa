interface Step {
  number: number;
  title: string;
  completed: boolean;
}

interface FormSidebarProps {
  currentStep: number;
  steps: Step[];
}

const FormSidebar = ({ currentStep, steps }: FormSidebarProps) => {
  return (
    <div className="lg:flex hidden p-4 min-h-screen">
      <aside className="bg-primary text-white w-80 p-8 flex flex-col rounded-2xl shadow-lg">
        {/* Logo */}
        <div className="mb-12">
          <img 
            src="/Logo.png" 
            alt="Embrapa" 
            className="h-16 w-auto filter brightness-0 invert"
          />
        </div>

        {/* Steps Navigation */}
        <nav className="flex-1">
          <ul className="space-y-6">
            {steps.map((step) => (
              <li 
                key={step.number}
                className={`flex items-center gap-4 ${
                  step.number === currentStep 
                    ? 'text-white font-semibold' 
                    : step.number < currentStep 
                      ? 'text-white/70' 
                      : 'text-white/50'
                }`}
              >
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step.number === currentStep
                      ? 'bg-white text-primary'
                      : step.completed
                        ? 'bg-white/20 text-white'
                        : 'bg-transparent border-2 border-white/30'
                  }`}
                >
                  {step.completed ? '✓' : step.number}
                </div>
                <span className="text-base">
                  {step.title}
                </span>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </div>
  );
};

export default FormSidebar;