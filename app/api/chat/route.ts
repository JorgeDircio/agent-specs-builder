import { convertToModelMessages, streamText } from "ai";
import { NextRequest } from "next/server";
import {
  CLARIFICATION_SYSTEM_PROMPT,
  SPEC_CONTINUATION_SYSTEM_PROMPT,
  SPEC_GENERATION_SYSTEM_PROMPT,
  SPEC_ITERATION_SYSTEM_PROMPT,
} from "@/lib/prompts";

const requestCounts = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 20;
const RATE_WINDOW_MS = 60_000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = requestCounts.get(ip);

  if (!entry || now > entry.resetAt) {
    requestCounts.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }

  if (entry.count >= RATE_LIMIT) return false;

  entry.count++;
  return true;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";

  if (!checkRateLimit(ip)) {
    return new Response("Demasiadas solicitudes. Espera un momento.", {
      status: 429,
    });
  }

  const { messages, mode, model } = await req.json();

  const systemPrompt =
    mode === "continue"
      ? SPEC_CONTINUATION_SYSTEM_PROMPT
      : mode === "iterate"
        ? SPEC_ITERATION_SYSTEM_PROMPT
        : mode === "generate"
          ? SPEC_GENERATION_SYSTEM_PROMPT
          : CLARIFICATION_SYSTEM_PROMPT;

  const selectedModel =
    typeof model === "string" && model.includes("/")
      ? model
      : "google/gemini-2.5-flash-lite";

  const result = streamText({
    model: selectedModel,
    system: systemPrompt,
    messages: await convertToModelMessages(messages),
    maxOutputTokens: 65000,
  });

  return result.toUIMessageStreamResponse();
}
