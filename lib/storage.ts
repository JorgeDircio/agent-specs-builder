import type { UIMessage } from "ai";

export type FlowStep =
  | "description"
  | "clarification"
  | "validation"
  | "generation"
  | "review";

export interface SpecSession {
  id: string;
  step: FlowStep;
  messages: UIMessage[];
  spec: string | null;
  updatedAt: number;
}

const SESSION_KEY = "spec_session";

export function saveSession(session: SpecSession): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function loadSession(): SpecSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as SpecSession) : null;
  } catch {
    return null;
  }
}

export function clearSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SESSION_KEY);
}

export function createSession(): SpecSession {
  return {
    id: crypto.randomUUID(),
    step: "description",
    messages: [],
    spec: null,
    updatedAt: Date.now(),
  };
}
