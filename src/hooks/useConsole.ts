import { useState, useCallback, useRef } from "react";

// limites para que un console.log en bucle no sature la memoria de la pestaña
const MAX_ENTRADAS = 500;
const MAX_LARGO_MENSAJE = 10_000;

export type ConsoleLevel = "log" | "warn" | "error" | "info";

export interface ConsoleEntry {
  id: string;
  level: ConsoleLevel;
  message: string;
  timestamp: Date;
}

interface UseConsoleReturn {
  entries: ConsoleEntry[];
  addEntry: (level: ConsoleLevel, message: string) => void;
  clearEntries: () => void;
  errorCount: number;
  warnCount: number;
}

export function useConsole(): UseConsoleReturn {
  const [entries, setEntries] = useState<ConsoleEntry[]>([]);
  const idRef = useRef(0);

  const addEntry = useCallback((level: ConsoleLevel, message: string) => {
    const entry: ConsoleEntry = {
      id: `entry-${++idRef.current}`,
      level,
      message:
        message.length > MAX_LARGO_MENSAJE
          ? `${message.slice(0, MAX_LARGO_MENSAJE)}…`
          : message,
      timestamp: new Date(),
    };
    setEntries((prev) => {
      const next = [...prev, entry];
      return next.length > MAX_ENTRADAS ? next.slice(-MAX_ENTRADAS) : next;
    });
  }, []);

  const clearEntries = useCallback(() => {
    setEntries([]);
  }, []);

  const errorCount = entries.filter((e) => e.level === "error").length;
  const warnCount = entries.filter((e) => e.level === "warn").length;

  return { entries, addEntry, clearEntries, errorCount, warnCount };
}
