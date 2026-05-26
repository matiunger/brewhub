'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import type { Aspect, AspectState, SRMOption } from '@/lib/evaluation-types';
import IntensityScale from './IntensityScale';
import DescriptorChips from './DescriptorChips';
import OptionPicker from './OptionPicker';
import SRMPicker from './SRMPicker';
import { useLocale } from '@/lib/locale-context';

const headColorHex: Record<string, { hex: string; light: boolean }> = {
  White:  { hex: '#FFFFFF', light: true },
  Ivory:  { hex: '#FFFFF0', light: true },
  Cream:  { hex: '#FFF8DC', light: true },
  Beige:  { hex: '#E8D5A3', light: true },
  Tan:    { hex: '#C9A96E', light: true },
  Brown:  { hex: '#7B4F2E', light: false },
};

export const aspectColorMap: Record<string, string> = {
  malt:                         'amber',
  malt_flavor:                  'amber',
  hops:                         'lime',
  hops_flavor:                  'lime',
  fermentation_character:       'pink',
  fermentation_character_flavor:'pink',
  esters:                       'pink',
  esters_flavor:                'pink',
  phenols:                      'purple',
  phenols_flavor:               'purple',
  acidity:         'blue',
  acidity_flavor:  'blue',
  alcohol:         'orange',
  alcohol_flavor:  'orange',
  sweetness:       'yellow',
  sweetness_flavor:'yellow',
  bitterness:      'lime',
  other_aroma:     'gray',
  other_flavor:    'gray',
  other_appearance:'gray',
  mouthfeel_flaws: 'red',
  style_accuracy:  'lila',
  technical_merit: 'lila',
  drinkability:    'lila',
};

interface Props {
  aspect: Aspect;
  state: AspectState;
  hintsEnabled?: boolean;
  showInappropriate?: boolean;
  onChange: (state: AspectState) => void;
}

export default function AspectRow({ aspect, state, hintsEnabled = false, showInappropriate = true, onChange }: Props) {
  const { t, messages } = useLocale();
  const [showHint, setShowHint] = useState(hintsEnabled && !!aspect.tasting_hint);

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="flex border-b border-amber-100 last:border-0"
    >
      {/* Main content */}
      <div className={`flex-1 min-w-0 py-3 ${showInappropriate ? 'pr-2' : ''}`}>
        <div className="flex items-center gap-2 mb-2 h-7">
          <span className="font-bold text-ink text-sm">{messages.aspect?.[aspect.id] || aspect.label}</span>
          {aspect.tasting_hint && (
            <button
              onClick={() => setShowHint(!showHint)}
              className="text-amber-500 hover:text-amber-700 transition-colors"
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

        {aspect.type === 'srm' && aspect.options && (
          <SRMPicker
            options={aspect.options as SRMOption[]}
            value={state.option}
            onChange={(v) => onChange({ ...state, option: v })}
          />
        )}

        {aspect.type === 'slider' && aspect.options && (
          <OptionPicker
            options={aspect.options as string[]}
            value={state.option}
            onChange={(v) => onChange({ ...state, option: v })}
          />
        )}

        {!aspect.type && aspect.options && (
          <>
            {aspect.id === 'head_color' && state.option && headColorHex[state.option] && (
              <div
                className="w-full rounded-xl px-4 py-3 flex items-center justify-between mb-2.5 transition-colors duration-300 border border-black/5"
                style={{ backgroundColor: headColorHex[state.option].hex }}
              >
                <span className={`font-extrabold text-sm ${headColorHex[state.option].light ? 'text-gray-800' : 'text-white'}`}>
                  {state.option}
                </span>
              </div>
            )}
            <OptionPicker
              options={aspect.options as string[]}
              value={state.option}
              onChange={(v) => onChange({ ...state, option: v })}
            />
          </>
        )}

        {aspect.intensity_scale && (
          <div className="mb-2">
            <IntensityScale
              value={state.intensity}
              color={aspectColorMap[aspect.id] ?? 'gray'}
              onChange={(v) => onChange({ ...state, intensity: v })}
            />
          </div>
        )}

        {aspect.descriptors && aspect.descriptors.length > 0 && (
          <div className="mt-2">
            <DescriptorChips
              descriptorIds={aspect.descriptors}
              selected={state.descriptors ?? []}
              color={aspectColorMap[aspect.id] ?? 'gray'}
              onChange={(v) => onChange({ ...state, descriptors: v })}
            />
          </div>
        )}
      </div>

      {/* Inappropriate checkbox column */}
      {showInappropriate && (
        <div className="w-10 shrink-0 flex items-start justify-center pt-12">
          <button
            onClick={() => onChange({ ...state, inappropriate: !state.inappropriate })}
            className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all duration-150 ${
              state.inappropriate
                ? 'bg-red-500 border-red-500 text-white'
                : 'bg-white border-red-200 text-red-300 hover:border-red-400 hover:text-red-400'
            }`}
            title={t('form.inappropriate')}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <circle cx="12" cy="12" r="10" />
              <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      )}
    </motion.div>
  );
}
