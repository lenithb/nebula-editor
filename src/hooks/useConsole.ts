import { useState, useCallback, useRef } from "react";

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
      message,
      timestamp: new Date(),
    };
    setEntries((prev) => [...prev, entry]);
  }, []);

  const clearEntries = useCallback(() => {
    setEntries([]);
  }, []);

  const errorCount = entries.filter((e) => e.level === "error").length;
  const warnCount = entries.filter((e) => e.level === "warn").length;

  return { entries, addEntry, clearEntries, errorCount, warnCount };
}
