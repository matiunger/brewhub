'use client';

import { createContext, useContext, useCallback, type ReactNode } from 'react';
import en from '@/messages/en';
import type { Messages } from '@/messages/en';

interface LocaleContextValue {
  locale: string;
  t: (key: string) => string;
  messages: Messages;
}

function getNestedValue(obj: Record<string, unknown>, path: string): string | undefined {
  const parts = path.split('.');
  let current: unknown = obj;
  for (const part of parts) {
    if (current == null || typeof current !== 'object') return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return typeof current === 'string' ? current : undefined;
}

const LocaleContext = createContext<LocaleContextValue>({
  locale: 'en',
  t: (key) => key,
  messages: en,
});

export function LocaleProvider({ children }: { children: ReactNode }) {
  const t = useCallback((key: string): string => {
    return getNestedValue(en as unknown as Record<string, unknown>, key) ?? key;
  }, []);

  return (
    <LocaleContext.Provider value={{ locale: 'en', t, messages: en }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  return useContext(LocaleContext);
}
