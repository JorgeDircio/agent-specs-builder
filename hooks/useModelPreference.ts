"use client";

import { useEffect, useState } from "react";

const DEFAULT_MODEL = "google/gemini-2.5-flash-lite";
const STORAGE_KEY = "preferred_model";

export function useModelPreference() {
  const [model, setModelState] = useState<string>(DEFAULT_MODEL);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setModelState(saved);
  }, []);

  function setModel(id: string) {
    setModelState(id);
    localStorage.setItem(STORAGE_KEY, id);
  }

  return { model, setModel };
}
