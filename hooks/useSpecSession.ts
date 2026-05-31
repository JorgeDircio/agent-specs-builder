"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, UIMessage, isTextUIPart } from "ai";
import { useEffect, useRef, useState } from "react";
import {
  FlowStep,
  SpecSession,
  clearSession,
  createSession,
  loadSession,
  saveSession,
} from "@/lib/storage";

export function getMessageText(message: UIMessage): string {
  return message.parts
    .filter(isTextUIPart)
    .map((p) => p.text)
    .join("");
}

export function useSpecSession(model: string) {
  const [session, setSession] = useState<SpecSession>(() => createSession());
  const modeRef = useRef<"clarify" | "generate" | "continue">("clarify");
  const modelRef = useRef(model);
  modelRef.current = model;
  const initialized = useRef(false);

  const chat = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
    onFinish({ message }) {
      setSession((prev) => {
        const text = getMessageText(message);
        const updated: SpecSession = {
          ...prev,
          messages: [...prev.messages, message],
          updatedAt: Date.now(),
        };

        if (modeRef.current === "continue") {
          updated.spec = (prev.spec ?? "") + text;
          updated.step = "review";
        } else if (modeRef.current === "generate") {
          updated.spec = text;
          updated.step = "review";
        } else if (prev.step === "clarification" && isReadyToGenerate(text)) {
          updated.step = "validation";
        }

        saveSession(updated);
        return updated;
      });
    },
  });

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    const saved = loadSession();
    if (saved) {
      setSession(saved);
      chat.setMessages(saved.messages);
    }
  // chat.setMessages is stable across renders
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isLoading =
    chat.status === "streaming" || chat.status === "submitted";

  function body(mode: string) {
    return { mode, model: modelRef.current };
  }

  function advanceStep(next: FlowStep) {
    setSession((prev) => {
      const updated = { ...prev, step: next, updatedAt: Date.now() };
      saveSession(updated);
      return updated;
    });
  }

  function startGeneration() {
    modeRef.current = "generate";
    advanceStep("generation");
    chat.sendMessage(
      { text: "Genera la especificación técnica completa basándote en toda la información que hemos discutido." },
      { body: body("generate") }
    );
  }

  function handleIterationSubmit(feedback: string) {
    modeRef.current = "generate";
    advanceStep("generation");
    chat.sendMessage(
      { text: `Por favor, mejora la especificación técnica con el siguiente feedback:\n\n${feedback}` },
      { body: body("iterate") }
    );
  }

  function handleContinueSpec() {
    modeRef.current = "continue";
    advanceStep("generation");
    chat.sendMessage(
      { text: "Continúa la especificación técnica desde donde se cortó." },
      { body: body("continue") }
    );
  }

  function startNewSession() {
    modeRef.current = "clarify";
    chat.setMessages([]);
    clearSession();
    const fresh = createSession();
    setSession(fresh);
    saveSession(fresh);
  }

  function handleDescriptionSubmit(description: string) {
    advanceStep("clarification");
    chat.sendMessage({ text: description }, { body: body("clarify") });
  }

  function handleClarificationSubmit(text: string) {
    chat.sendMessage({ text }, { body: body("clarify") });
  }

  function retry() {
    chat.clearError();
    chat.regenerate();
  }

  return {
    session,
    chat,
    isLoading,
    error: chat.error,
    retry,
    advanceStep,
    startGeneration,
    startNewSession,
    handleDescriptionSubmit,
    handleClarificationSubmit,
    handleIterationSubmit,
    handleContinueSpec,
  };
}

function isReadyToGenerate(content: string): boolean {
  return (
    content.includes("## Resumen de tu producto") ||
    content.includes("¿Este resumen refleja tu visión")
  );
}
