import { Check } from 'lucide-react';

interface StepNavigatorProps {
  currentStep: 1 | 2 | 3;
  onStepClick: (step: 1 | 2 | 3) => void;
  canNavigate: {
    step1: boolean;
    step2: boolean;
    step3: boolean;
  };
}

export function StepNavigator({ currentStep, onStepClick, canNavigate }: StepNavigatorProps) {
  const steps = [
    { number: 1, label: 'Input', enabled: canNavigate.step1 },
    { number: 2, label: 'Generate', enabled: canNavigate.step2 },
    { number: 3, label: 'Customize', enabled: canNavigate.step3 }
  ];

  return (
    <div className="card-float p-5 mb-8 animate-fade-in">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center flex-1">
            <div
              className={`flex items-center gap-2 ${
                step.enabled ? '' : 'opacity-50'
              }`}
            >
              <div
                className={`step-circle ${
                  currentStep === step.number
                    ? 'active'
                    : currentStep > step.number
                    ? 'completed'
                    : ''
                }`}
              >
                {currentStep > step.number ? (
                  <Check className="w-4 h-4" />
                ) : (
                  step.number
                )}
              </div>
              <div className="text-left">
                <div className={`text-xs font-bold ${
                  currentStep === step.number ? 'text-[#8FA6FF]' : 'text-[#3C3C3C]'
                }`}>
                  Step {step.number}
                </div>
                <div className={`text-xs ${
                  currentStep === step.number ? 'text-[#3C3C3C]' : 'text-gray-500'
                }`}>
                  {step.label}
                </div>
              </div>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`flex-1 h-1 mx-4 rounded-full transition-all duration-300 ${
                  currentStep > step.number ? 'bg-[#8FA6FF]' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
