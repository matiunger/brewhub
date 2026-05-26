'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formData } from '@/lib/evaluation-form-data';
import { useLocale } from '@/lib/locale-context';

interface Props {
  descriptorIds: string[];
  selected: string[];
  color?: string;
  onChange: (selected: string[]) => void;
}

const colorMap: Record<string, { base: string; selected: string; hint: string }> = {
  amber:  { base: 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100',     selected: 'bg-amber-400 text-white border-amber-400',     hint: 'border-amber-300 bg-amber-50 text-amber-900' },
  green:  { base: 'bg-green-50 text-green-800 border-green-200 hover:bg-green-100',     selected: 'bg-green-500 text-white border-green-500',     hint: 'border-green-300 bg-green-50 text-green-900' },
  pink:   { base: 'bg-pink-50 text-pink-800 border-pink-200 hover:bg-pink-100',         selected: 'bg-pink-400 text-white border-pink-400',       hint: 'border-pink-300 bg-pink-50 text-pink-900' },
  purple: { base: 'bg-purple-50 text-purple-800 border-purple-200 hover:bg-purple-100', selected: 'bg-purple-400 text-white border-purple-400',   hint: 'border-purple-300 bg-purple-50 text-purple-900' },
  blue:   { base: 'bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100',         selected: 'bg-blue-400 text-white border-blue-400',       hint: 'border-blue-300 bg-blue-50 text-blue-900' },
  orange: { base: 'bg-orange-50 text-orange-800 border-orange-200 hover:bg-orange-100', selected: 'bg-orange-400 text-white border-orange-400',   hint: 'border-orange-300 bg-orange-50 text-orange-900' },
  yellow: { base: 'bg-yellow-50 text-yellow-800 border-yellow-200 hover:bg-yellow-100', selected: 'bg-yellow-400 text-white border-yellow-400',   hint: 'border-yellow-300 bg-yellow-50 text-yellow-900' },
  lime:   { base: 'bg-lime-50 text-lime-800 border-lime-200 hover:bg-lime-100',         selected: 'bg-lime-500 text-white border-lime-500',       hint: 'border-lime-300 bg-lime-50 text-lime-900' },
  red:    { base: 'bg-red-50 text-red-800 border-red-200 hover:bg-red-100',             selected: 'bg-red-400 text-white border-red-400',         hint: 'border-red-300 bg-red-50 text-red-900' },
  gray:   { base: 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100',         selected: 'bg-gray-500 text-white border-gray-500',       hint: 'border-gray-300 bg-gray-50 text-gray-800' },
  lila:   { base: 'bg-violet-50 text-violet-800 border-violet-200 hover:bg-violet-100', selected: 'bg-violet-400 text-white border-violet-400',   hint: 'border-violet-300 bg-violet-50 text-violet-900' },
};

export default function DescriptorChips({ descriptorIds, selected, color = 'gray', onChange }: Props) {
  const { messages } = useLocale();
  const [activeHintId, setActiveHintId] = useState<string | null>(null);

  const descriptors = descriptorIds
    .map((id) => formData.descriptors.find((d) => d.id === id))
    .filter(Boolean);

  const activeDescriptor = activeHintId
    ? descriptors.find((d) => d?.id === activeHintId) ?? null
    : null;

  const colors = colorMap[color] ?? colorMap.gray;

  function handleClick(id: string, hasHint: boolean) {
    if (selected.includes(id)) {
      onChange(selected.filter((s) => s !== id));
    } else {
      onChange([...selected, id]);
    }

    if (hasHint) {
      setActiveHintId((prev) => (prev === id ? null : id));
    } else {
      setActiveHintId(null);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {descriptors.map((d) => {
          if (!d) return null;
          const isSelected = selected.includes(d.id);
          const isHintActive = activeHintId === d.id;
          return (
            <button
              key={d.id}
              onClick={() => handleClick(d.id, !!d.hint)}
              className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition-all duration-150 ${
                isSelected ? colors.selected + ' scale-105' : colors.base
              } ${isHintActive ? 'ring-2 ring-offset-1 ring-current' : ''}`}
            >
              {messages.descriptor?.[d.id] || d.name}
              {d.hint && <span className="ml-1 opacity-60 text-[10px]">ⓘ</span>}
            </button>
          );
        })}
      </div>

      <AnimatePresence>
        {activeDescriptor?.hint && (
          <motion.div
            key={activeDescriptor.id}
            initial={{ opacity: 0, y: -6, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -6, height: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div className={`flex items-start gap-2 p-3 rounded-xl border text-xs leading-relaxed ${colors.hint}`}>
              <span className="flex-1">{messages.descriptorHint?.[activeDescriptor.id] || activeDescriptor.hint}</span>
              <button
                onClick={() => setActiveHintId(null)}
                className="shrink-0 opacity-50 hover:opacity-100 transition-opacity mt-0.5"
                aria-label="Close hint"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
