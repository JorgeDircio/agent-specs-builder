"use client";

import { FlowStep } from "@/lib/storage";

const STEPS: { key: FlowStep; label: string }[] = [
  { key: "description", label: "Descripción" },
  { key: "clarification", label: "Clarificación" },
  { key: "validation", label: "Validación" },
  { key: "generation", label: "Generación" },
  { key: "review", label: "Revisión" },
];

interface Props {
  currentStep: FlowStep;
}

export default function ProgressIndicator({ currentStep }: Props) {
  const currentIndex = STEPS.findIndex((s) => s.key === currentStep);

  return (
    <div className="flex items-center gap-1">
      {STEPS.map((step, i) => {
        const isDone = i < currentIndex;
        const isActive = i === currentIndex;

        return (
          <div key={step.key} className="flex items-center gap-1">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`h-2 w-2 rounded-full transition-colors ${
                  isDone
                    ? "bg-emerald-500"
                    : isActive
                      ? "bg-blue-500 ring-2 ring-blue-200"
                      : "bg-gray-200"
                }`}
              />
              <span
                className={`text-xs hidden sm:block ${
                  isActive
                    ? "text-blue-600 font-medium"
                    : isDone
                      ? "text-emerald-600"
                      : "text-gray-400"
                }`}
              >
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`h-px w-6 sm:w-10 mb-3 transition-colors ${
                  isDone ? "bg-emerald-400" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
