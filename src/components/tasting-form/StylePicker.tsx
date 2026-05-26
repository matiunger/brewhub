'use client';

import { useState, useRef, useEffect } from 'react';
import { stylesData, searchStyles } from '@/lib/evaluation-styles-data';
import type { BeerStyle } from '@/lib/evaluation-types';

interface Props {
  value: string | null;
  onChange: (styleNumber: string | null, style: BeerStyle | null) => void;
  placeholder?: string;
}

export default function StylePicker({ value, onChange, placeholder = 'Search style...' }: Props) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selectedStyle = value ? stylesData.find((s) => s.number === value) : null;
  const results = searchStyles(query).slice(0, 20);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function selectStyle(style: BeerStyle) {
    onChange(style.number, style);
    setQuery('');
    setOpen(false);
  }

  function clear() {
    onChange(null, null);
    setQuery('');
  }

  return (
    <div ref={ref} className="relative">
      {selectedStyle ? (
        <div className="flex items-center gap-2 px-3 py-2.5 bg-amber-50 border border-amber-300 rounded-xl">
          <span className="text-xs font-bold text-amber-600 bg-amber-200 px-1.5 py-0.5 rounded-md">{selectedStyle.number}</span>
          <span className="font-semibold text-ink text-sm flex-1">{selectedStyle.name}</span>
          <button onClick={clear} className="text-amber-400 hover:text-amber-700 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ) : (
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className="w-full px-3 py-2.5 bg-white border border-amber-200 rounded-xl text-sm text-ink placeholder-amber-300 focus:outline-none focus:border-amber-400 font-medium"
        />
      )}

      {open && !selectedStyle && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-amber-200 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto">
          {results.length === 0 ? (
            <div className="px-4 py-3 text-sm text-amber-500">No styles found</div>
          ) : (
            results.map((style) => (
              <button
                key={style.number}
                onClick={() => selectStyle(style)}
                className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-amber-50 transition-colors text-left"
              >
                <span className="text-xs font-bold text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded-md shrink-0">{style.number}</span>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-ink">{style.name}</div>
                  <div className="text-xs text-amber-600 truncate">{style.category}</div>
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
