'use client';

import type { ReactNode } from 'react';
import { useLocale } from '@/lib/locale-context';

interface Props {
  options: string[];
  value?: string;
  onChange: (value: string) => void;
  icons?: Record<string, ReactNode>;
}

export default function OptionPicker({ options, value, onChange, icons }: Props) {
  const { messages } = useLocale();
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((opt) => {
        const selected = value === opt;
        return (
          <button
            key={opt}
            onClick={() => onChange(selected ? '' : opt)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold border transition-all duration-150 ${
              selected
                ? 'bg-amber-400 text-white border-amber-400 shadow-sm'
                : 'bg-white text-ink border-amber-200 hover:border-amber-400 hover:bg-amber-50'
            }`}
          >
            {icons?.[opt]}
            {messages.option?.[opt] || opt}
          </button>
        );
      })}
    </div>
  );
}
