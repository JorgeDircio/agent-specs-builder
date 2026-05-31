"use client";

import ChatInput from "@/components/ChatInput";
import ChatMessages from "@/components/ChatMessages";
import ExportButton from "@/components/ExportButton";
import ModelSelector from "@/components/ModelSelector";
import ProgressIndicator from "@/components/ProgressIndicator";
import SpecViewer from "@/components/SpecViewer";
import { useModelPreference } from "@/hooks/useModelPreference";
import { useSpecSession } from "@/hooks/useSpecSession";

const COMPLETION_MARKER = "Generado con Agent Specs Builder";

export default function Home() {
  const { model, setModel } = useModelPreference();
  const {
    session,
    chat,
    isLoading,
    error,
    retry,
    startGeneration,
    startNewSession,
    handleDescriptionSubmit,
    handleClarificationSubmit,
    handleIterationSubmit,
    handleContinueSpec,
  } = useSpecSession(model);

  const isGenerating = session.step === "generation" && isLoading;
  const hasSpec = session.step === "review" && !!session.spec;
  const isTruncated =
    hasSpec &&
    session.spec!.length > 100 &&
    !session.spec!.includes(COMPLETION_MARKER);

  function handleSubmit(text: string) {
    if (session.step === "description") {
      handleDescriptionSubmit(text);
    } else if (session.step === "review") {
      handleIterationSubmit(text);
    } else {
      handleClarificationSubmit(text);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white px-4 py-3 sticky top-0 z-10">
        <div className="mx-auto max-w-3xl flex items-center justify-between">
          <div>
            <h1 className="text-sm font-semibold text-gray-900">
              Agent Specs Builder
            </h1>
            <p className="text-xs text-gray-500">
              De idea a especificación técnica
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ModelSelector
              model={model}
              onChange={setModel}
              disabled={isLoading}
            />
            <ProgressIndicator currentStep={session.step} />
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 mx-auto w-full max-w-3xl px-4 py-6 flex flex-col gap-4">
        {/* Empty state */}
        {chat.messages.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-3xl">
              📋
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Describe tu idea de producto
              </h2>
              <p className="mt-1 text-sm text-gray-500 max-w-sm">
                Escribe en lenguaje cotidiano. El agente hará preguntas para
                afinar los detalles y luego generará la especificación técnica
                completa.
              </p>
            </div>
          </div>
        )}

        {/* Chat — solo visible fuera del paso de generación */}
        {chat.messages.length > 0 && !isGenerating && session.step !== "review" && (
          <ChatMessages messages={chat.messages} isLoading={isLoading} />
        )}

        {/* Loader de generación */}
        {isGenerating && (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
            <div className="flex gap-1.5">
              <span className="h-2 w-2 rounded-full bg-blue-500 animate-bounce [animation-delay:0ms]" />
              <span className="h-2 w-2 rounded-full bg-blue-500 animate-bounce [animation-delay:150ms]" />
              <span className="h-2 w-2 rounded-full bg-blue-500 animate-bounce [animation-delay:300ms]" />
            </div>
            <p className="text-sm font-medium text-gray-600">Generando especificación…</p>
            <p className="text-xs text-gray-400">Esto puede tomar unos segundos</p>
          </div>
        )}

        {/* Spec completa */}
        {hasSpec && (
          <SpecViewer
            spec={session.spec!}
            isStreaming={false}
            isTruncated={isTruncated}
          />
        )}

        {/* Banner de spec incompleta */}
        {isTruncated && !isLoading && (
          <div className="flex items-center justify-between rounded-xl border border-amber-100 bg-amber-50 px-4 py-3">
            <p className="text-sm text-amber-800">
              La spec se cortó antes de terminar. Puedes continuar desde donde quedó sin perder lo generado.
            </p>
            <button
              onClick={handleContinueSpec}
              className="ml-4 shrink-0 rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600 transition-colors"
            >
              Continuar spec →
            </button>
          </div>
        )}

        {/* Banner de error */}
        {error && !isLoading && (
          <div className="flex items-center justify-between rounded-xl border border-red-100 bg-red-50 px-4 py-3">
            <p className="text-sm text-red-700">
              {error.message.includes("Free tier")
                ? "Este modelo requiere créditos de pago en Vercel. Agrega créditos en vercel.com/ai o prueba con otro modelo."
                : "Ocurrió un error al conectar con el modelo. Puedes reintentar."}
            </p>
            <button
              onClick={retry}
              className="ml-4 shrink-0 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 transition-colors"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* CTA de validación */}
        {session.step === "validation" && !isLoading && (
          <div className="flex items-center justify-between rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
            <p className="text-sm text-blue-800">
              ¿El resumen refleja tu visión? Confirma para generar la
              especificación técnica completa.
            </p>
            <button
              onClick={startGeneration}
              className="ml-4 shrink-0 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
            >
              Generar spec →
            </button>
          </div>
        )}

        {/* Acciones de revisión */}
        {hasSpec && !isTruncated && (
          <div className="flex items-center gap-3 justify-end">
            <ExportButton spec={session.spec!} />
            <button
              onClick={startNewSession}
              className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Nueva spec
            </button>
          </div>
        )}
      </main>

      {/* Footer input */}
      {session.step !== "generation" && (
        <footer className="border-t border-gray-200 bg-white px-4 py-4 sticky bottom-0">
          <div className="mx-auto max-w-3xl">
            {session.step === "review" && (
              <p className="text-xs text-gray-400 mb-2 pl-1">
                {isTruncated
                  ? "O escribe qué cambiar cuando la spec esté completa"
                  : "Spec generada · Pide cambios o correcciones para refinarla"}
              </p>
            )}
            <ChatInput
              step={session.step}
              isLoading={isLoading}
              onSubmit={handleSubmit}
            />
          </div>
        </footer>
      )}
    </div>
  );
}
