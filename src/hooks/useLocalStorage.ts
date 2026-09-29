import { useState, useCallback } from "react";

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item === null) return initialValue;
      const parsed: unknown = JSON.parse(item);
      // si el valor guardado no tiene el tipo esperado (storage editado
      // a mano o de una version vieja), usamos el valor inicial
      if (typeof parsed !== typeof initialValue) return initialValue;
      if (typeof parsed === "number" && !Number.isFinite(parsed)) {
        return initialValue;
      }
      return parsed as T;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        setStoredValue((prev) => {
          const next =
            typeof value === "function"
              ? (value as (prev: T) => T)(prev)
              : value;
          window.localStorage.setItem(key, JSON.stringify(next));
          return next;
        });
      } catch {
      }
    },
    [key]
  );

  return [storedValue, setValue];
}
