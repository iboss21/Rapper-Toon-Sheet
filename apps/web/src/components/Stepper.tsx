import { CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step {
  label: string;
  status: 'completed' | 'active' | 'pending';
}

interface StepperProps {
  currentStep: number;
}

export function Stepper({ currentStep }: StepperProps) {
  const steps: Step[] = [
    { label: 'Upload', status: currentStep > 0 ? 'completed' : currentStep === 0 ? 'active' : 'pending' },
    { label: 'Options', status: currentStep > 1 ? 'completed' : currentStep === 1 ? 'active' : 'pending' },
    { label: 'Generate', status: currentStep > 2 ? 'completed' : currentStep === 2 ? 'active' : 'pending' },
    { label: 'Download', status: currentStep > 3 ? 'completed' : currentStep === 3 ? 'active' : 'pending' }
  ];

  return (
    <div className="flex items-center justify-between mb-8">
      {steps.map((step, index) => (
        <div key={index} className="flex items-center flex-1">
          <div className="flex items-center">
            <div
              className={cn(
                'flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors',
                step.status === 'completed' && 'bg-primary border-primary',
                step.status === 'active' && 'border-primary text-primary',
                step.status === 'pending' && 'border-gray-700 text-gray-500'
              )}
            >
              {step.status === 'completed' ? (
                <CheckCircle2 className="w-6 h-6 text-white" />
              ) : (
                <span className="font-semibold">{index + 1}</span>
              )}
            </div>
            <span
              className={cn(
                'ml-3 font-medium transition-colors',
                step.status === 'active' && 'text-primary',
                step.status === 'pending' && 'text-gray-500'
              )}
            >
              {step.label}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div
              className={cn(
                'flex-1 h-0.5 mx-4 transition-colors',
                steps[index + 1].status === 'completed' || steps[index + 1].status === 'active'
                  ? 'bg-primary'
                  : 'bg-gray-700'
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}
