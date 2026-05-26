'use client';

import { useState } from 'react';
import { useLocale } from '@/lib/locale-context';

interface Props {
  hints: string[];
  autoOpen?: boolean;
  label?: string;
  open?: boolean;
}

export default function TastingHints({ hints, autoOpen = false, label, open: controlledOpen }: Props) {
  const { t } = useLocale();
  const [internalOpen, setInternalOpen] = useState(autoOpen);

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;

  if (isControlled && !open) return null;

  return (
    <div className="mb-3 rounded-xl overflow-hidden border border-amber-200">
      {!isControlled && (
        <button
          onClick={() => setInternalOpen(!internalOpen)}
          className="w-full flex items-center justify-between px-4 py-2.5 bg-amber-50 hover:bg-amber-100 transition-colors"
        >
          <span className="text-sm font-bold text-amber-800 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            {label ?? t('form.tastingHints')}
          </span>
          <svg
            className={`w-4 h-4 text-amber-600 transition-transform ${internalOpen ? 'rotate-180' : ''}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      )}
      {open && (
        <ul className="px-4 py-3 bg-amber-50 space-y-1.5">
          {hints.map((hint, i) => (
            <li key={i} className="text-sm text-amber-900 flex gap-2">
              <span className="text-amber-400 font-bold mt-0.5">•</span>
              <span>{hint}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
