"use client";

import { getMessageText } from "@/hooks/useSpecSession";
import { UIMessage } from "ai";
import { useEffect, useRef } from "react";

interface Props {
  messages: UIMessage[];
  isLoading: boolean;
}

export default function ChatMessages({ messages, isLoading }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  if (messages.length === 0) return null;

  return (
    <div
      className="flex flex-col gap-4 overflow-y-auto"
      aria-live="polite"
      aria-label="Conversación"
    >
      {messages.map((message) => {
        const text = getMessageText(message);
        if (!text) return null;
        return (
          <div
            key={message.id}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                message.role === "user"
                  ? "bg-blue-600 text-white rounded-br-sm"
                  : "bg-gray-50 text-gray-800 border border-gray-100 rounded-bl-sm"
              }`}
            >
              {text}
            </div>
          </div>
        );
      })}

      {isLoading && (
        <div className="flex justify-start">
          <div className="bg-gray-50 border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3">
            <span className="flex gap-1 items-center" aria-label="Escribiendo">
              <span className="h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:0ms]" />
              <span className="h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:150ms]" />
              <span className="h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:300ms]" />
            </span>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
