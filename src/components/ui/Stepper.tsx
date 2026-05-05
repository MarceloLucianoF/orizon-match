interface StepperProps {
  steps: string[];
  currentStep: number;
}

export default function Stepper({ steps, currentStep }: StepperProps) {
  return (
    <ol className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {steps.map((step, index) => {
        const isActive = index === currentStep;
        const isComplete = index < currentStep;

        return (
          <li
            key={step}
            className={`flex items-center gap-3 rounded-xl border px-3 py-2 text-sm backdrop-blur-xl ${
              isActive
                ? "border-primary/20 bg-primary/10 text-primary"
                : isComplete
                  ? "border-emerald-300 bg-emerald-500/10 text-emerald-300"
                  : "border-border bg-surface/80 text-muted"
            }`}
          >
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-bgSoft text-xs font-bold text-text">
              {isComplete ? "✓" : index + 1}
            </span>
            <span className="font-medium">{step}</span>
          </li>
        );
      })}
    </ol>
  );
}
