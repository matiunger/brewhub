'use client';

import { createContext, useContext, useState } from 'react';
import type { BeerStyle } from './evaluation-types';

export interface EvaluateData {
  total: number;
  maxTotal: number;
  selectedStyle: BeerStyle | null;
  freeMode: boolean;
}

const EvaluateContext = createContext<{
  data: EvaluateData | null;
  setData: (d: EvaluateData | null) => void;
}>({ data: null, setData: () => {} });

export function EvaluateProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<EvaluateData | null>(null);
  return (
    <EvaluateContext.Provider value={{ data, setData }}>
      {children}
    </EvaluateContext.Provider>
  );
}

export function useEvaluateContext() {
  return useContext(EvaluateContext);
}
