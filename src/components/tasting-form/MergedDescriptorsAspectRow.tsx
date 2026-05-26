'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import type { Aspect, AspectState } from '@/lib/evaluation-types';
import IntensityScale from './IntensityScale';
import DescriptorChips from './DescriptorChips';
import { aspectColorMap } from './AspectRow';
import { useLocale } from '@/lib/locale-context';

interface Props {
  aspect: Aspect;
  state: AspectState;
  mergedAspects: Aspect[];
  mergedStates: AspectState[];
  hintsEnabled: boolean;
  onChange: (state: AspectState) => void;
  onChangeMerged: (id: string, state: AspectState) => void;
}

export default function MergedDescriptorsAspectRow({
  aspect,
  state,
  mergedAspects,
  mergedStates,
  hintsEnabled,
  onChange,
  onChangeMerged,
}: Props) {
  const { t, messages } = useLocale();
  const [showHint, setShowHint] = useState(hintsEnabled && !!aspect.tasting_hint);

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="py-3 border-b border-amber-100 last:border-0"
    >
      <div className="flex items-start gap-2 mb-2">
        <span className="font-bold text-ink text-sm">{messages.aspect?.[aspect.id] || aspect.label}</span>
        {aspect.tasting_hint && (
          <button
            onClick={() => setShowHint(!showHint)}
            className="text-amber-500 hover:text-amber-700 transition-colors mt-0.5"
            title={t('form.hint')}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </button>
        )}
      </div>

      {showHint && aspect.tasting_hint && (
        <div className="mb-2 p-2.5 bg-amber-50 rounded-lg text-xs text-amber-800 border border-amber-200">
          {messages.aspectHint?.[aspect.id] || aspect.tasting_hint}
        </div>
      )}

      <div className="mb-2">
        <IntensityScale
          value={state.intensity}
          color={aspectColorMap[aspect.id] ?? 'pink'}
          onChange={(v) => onChange({ ...state, intensity: v })}
        />
      </div>

      {mergedAspects.map((mergedAspect, i) => {
        if (!mergedAspect.descriptors?.length) return null;
        const mergedState = mergedStates[i] ?? {};
        const color = aspectColorMap[mergedAspect.id] ?? 'gray';
        return (
          <div key={mergedAspect.id} className="mt-2">
            <DescriptorChips
              descriptorIds={mergedAspect.descriptors}
              selected={mergedState.descriptors ?? []}
              color={color}
              onChange={(v) => onChangeMerged(mergedAspect.id, { ...mergedState, descriptors: v })}
            />
          </div>
        );
      })}
    </motion.div>
  );
}
