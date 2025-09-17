import embrapaLogo from "@/assets/embrapa-logo-white.png";

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
    <aside className="bg-sidebar-bg text-sidebar-fg min-h-screen w-80 p-8 flex flex-col lg:flex hidden">
      {/* Logo */}
      <div className="mb-12">
        <img 
          src={embrapaLogo} 
          alt="Embrapa" 
          className="h-16 w-auto"
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
                  ? 'text-step-active font-semibold' 
                  : step.number < currentStep 
                    ? 'text-sidebar-muted' 
                    : 'text-step-inactive'
              }`}
            >
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step.number === currentStep
                    ? 'bg-step-active text-sidebar-bg'
                    : step.completed
                      ? 'bg-sidebar-muted text-sidebar-bg'
                      : 'bg-transparent border-2 border-step-inactive'
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
  );
};

export default FormSidebar;