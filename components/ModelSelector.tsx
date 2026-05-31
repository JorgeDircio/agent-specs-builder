"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  model: string;
  onChange: (id: string) => void;
  disabled?: boolean;
}

export default function ModelSelector({ model, onChange, disabled }: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(model);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.select();
  }, [editing]);

  useEffect(() => {
    if (!editing) setDraft(model);
  }, [model, editing]);

  function commit() {
    const value = draft.trim();
    if (value && value.includes("/")) {
      onChange(value);
    } else {
      setDraft(model);
    }
    setEditing(false);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") commit();
    if (e.key === "Escape") { setDraft(model); setEditing(false); }
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={handleKeyDown}
        placeholder="provider/model-name"
        className="w-52 rounded-lg border border-blue-400 bg-white px-2.5 py-1.5 text-xs text-gray-800 outline-none ring-2 ring-blue-100"
        aria-label="ID del modelo"
      />
    );
  }

  return (
    <button
      onClick={() => !disabled && setEditing(true)}
      disabled={disabled}
      title="Haz clic para cambiar el modelo. Puedes usar cualquier modelo del catálogo de Vercel AI Gateway."
      className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors max-w-[200px]"
      aria-label="Modelo actual, clic para editar"
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3 w-3 shrink-0 text-gray-400" aria-hidden="true">
        <path d="M13.488 2.513a1.75 1.75 0 0 0-2.475 0L6.75 6.774a2.75 2.75 0 0 0-.596.892l-.848 2.047a.75.75 0 0 0 .98.98l2.047-.848a2.75 2.75 0 0 0 .892-.596l4.261-4.262a1.75 1.75 0 0 0 0-2.474ZM4.75 7.5a.75.75 0 0 0 0 1.5h.5a.75.75 0 0 0 0-1.5h-.5ZM3 10.25a.75.75 0 0 1 .75-.75h.5a.75.75 0 0 1 0 1.5h-.5a.75.75 0 0 1-.75-.75ZM2.25 12a.75.75 0 0 0 0 1.5h.5a.75.75 0 0 0 0-1.5h-.5Z" />
      </svg>
      <span className="truncate font-mono">{model}</span>
    </button>
  );
}
