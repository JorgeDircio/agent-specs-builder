"use client";

import { FlowStep } from "@/lib/storage";
import { useEffect, useRef, useState } from "react";

interface Props {
  step: FlowStep;
  isLoading: boolean;
  onSubmit: (text: string) => void;
}

const PLACEHOLDERS: Record<FlowStep, string> = {
  description:
    'Describe tu idea de producto… ej: "Quiero una app para que restaurantes gestionen sus reservaciones"',
  clarification: "Responde la pregunta...",
  validation: "Confirma el resumen o indica qué cambiar...",
  generation: "Generando especificación...",
  review: "¿Qué quieres mejorar, corregir o aclarar en la spec?",
};

export default function ChatInput({ step, isLoading, onSubmit }: Props) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isDisabled = isLoading || step === "generation";

  useEffect(() => {
    if (!isDisabled) textareaRef.current?.focus();
  }, [isDisabled, step]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = value.trim();
    if (!text) return;
    onSubmit(text);
    setValue("");
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const form = e.currentTarget.form;
      if (form) form.requestSubmit();
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-2"
      aria-label="Formulario de entrada"
    >
      <div className="relative flex items-end rounded-xl border border-gray-200 bg-white shadow-sm focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isDisabled}
          placeholder={PLACEHOLDERS[step]}
          rows={step === "description" ? 4 : 2}
          aria-label="Entrada de texto"
          aria-multiline="true"
          className="w-full resize-none rounded-xl bg-transparent px-4 py-3 pr-16 text-sm text-gray-800 placeholder-gray-400 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isDisabled || !value.trim()}
          aria-label="Enviar"
          className="absolute bottom-2 right-2 flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white transition-colors hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400"
        >
          {isLoading ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path d="M3.105 2.288a.75.75 0 0 0-.826.95l1.414 4.926A1.5 1.5 0 0 0 5.135 9.25h6.115a.75.75 0 0 1 0 1.5H5.135a1.5 1.5 0 0 0-1.442 1.086l-1.414 4.926a.75.75 0 0 0 .826.95 28.897 28.897 0 0 0 15.293-7.154.75.75 0 0 0 0-1.115A28.897 28.897 0 0 0 3.105 2.288Z" />
            </svg>
          )}
        </button>
      </div>
      <p className="text-xs text-gray-400 pl-1">
        {step === "description"
          ? "Sé tan detallado como quieras. Enter para enviar, Shift+Enter para nueva línea."
          : "Enter para enviar · Shift+Enter para nueva línea"}
      </p>
    </form>
  );
}
