'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Section, SectionState } from '@/lib/evaluation-types';
import AspectRow from './AspectRow';
import TastingHints from './TastingHints';
import SectionScoreSlider from './SectionScoreSlider';
import { useLocale } from '@/lib/locale-context';

interface StyleGuideEntry {
  label: string;
  text: string;
}

interface Props {
  section: Section;
  state: SectionState;
  hintsEnabled: boolean;
  freeMode?: boolean;
  speed?: 'notes_only' | 'extended';
  styleGuide?: StyleGuideEntry[];
  styleName?: string;
  onChange: (state: SectionState) => void;
  index: number;
}

const notesHintFallback: Record<string, string> = {
  aroma_flavor: 'Describe aromas and flavors — what hits first, what develops, what lingers.',
  overall: 'Summarize your overall impression. You can also include recommendations — serving temperature, food pairings, or improvements for the brewer.',
};

export default function SectionCard({ section, state, hintsEnabled, freeMode = false, speed = 'extended', styleGuide, styleName, onChange, index }: Props) {
  const { t, messages } = useLocale();
  const [showNotesHint, setShowNotesHint] = useState(false);
  const [hintsOpen, setHintsOpen] = useState(hintsEnabled);
  const [styleGuideOpen, setStyleGuideOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  const notesHint: Record<string, string> = {
    ...notesHintFallback,
    ...(messages.form?.notesHint ?? {}),
  };

  const visibleAspects = speed === 'extended'
    ? section.aspects.filter((a) => !(freeMode && a.id === 'style_accuracy'))
    : [];

  function updateAspect(aspectId: string, aspectState: { intensity?: string; descriptors?: string[]; option?: string }) {
    onChange({
      ...state,
      aspects: { ...state.aspects, [aspectId]: aspectState },
    });
  }

  return (
    <motion.div
      ref={sectionRef}
      initial={{ opacity: 0, y: 48 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.65, ease: 'easeOut' }}
      className="bg-paper rounded-2xl shadow-sm border border-amber-100"
    >
      {/* Header — always visible, click to collapse/expand */}
      <div
        className="px-5 pt-5 pb-4 cursor-pointer select-none"
        onClick={() => setCollapsed((c) => !c)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-ink">{messages.section?.[section.id] || section.label}</h2>
            {section.tasting_hints?.length > 0 && (
              <button
                onClick={(e) => { e.stopPropagation(); setHintsOpen(!hintsOpen); }}
                className={`transition-colors ${hintsOpen ? 'text-amber-600' : 'text-amber-300 hover:text-amber-500'}`}
                title={t('form.tastingHints')}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            {!freeMode && (
              <div className="flex items-center gap-1.5 bg-amber-100 px-3 py-1 rounded-full">
                <span className="text-amber-700 font-bold text-sm">{t('form.max')}</span>
                <span className="text-amber-800 font-extrabold text-lg leading-none">{section.max_points}</span>
                <span className="text-amber-500 text-xs font-semibold">{t('form.pts')}</span>
              </div>
            )}
            <svg
              className={`w-5 h-5 text-amber-400 transition-transform duration-300 ${collapsed ? '' : 'rotate-180'}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Collapsible body */}
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            {/* Tasting hints */}
            {section.tasting_hints?.length > 0 && (
              <div className="px-5">
                <TastingHints hints={messages.tastingHint?.[section.id] || section.tasting_hints} open={hintsOpen} />
              </div>
            )}

            {/* Style guide */}
            {styleGuide && styleGuide.length > 0 && (
              <div className="px-5 mb-3">
                <div className="rounded-xl overflow-hidden border border-blue-200">
                  <button
                    onClick={() => setStyleGuideOpen(!styleGuideOpen)}
                    className="w-full flex items-center justify-between px-4 py-2.5 bg-blue-50 hover:bg-blue-100 transition-colors"
                  >
                    <span className="text-xs font-bold text-blue-800 flex items-center gap-2">
                      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      <span className="truncate">{styleName} — {messages.section?.[section.id] || section.label}</span>
                    </span>
                    <svg
                      className={`w-4 h-4 text-blue-400 transition-transform ${styleGuideOpen ? 'rotate-180' : ''}`}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {styleGuideOpen && (
                    <div className="px-4 py-3 bg-blue-50 space-y-3 border-t border-blue-100">
                      {styleGuide.map((entry, i) => (
                        <div key={i}>
                          {styleGuide.length > 1 && (
                            <p className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-1">{entry.label}</p>
                          )}
                          <p className="text-sm text-blue-900 leading-relaxed">{entry.text}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Aspects */}
            {visibleAspects.length > 0 && (
              <div className="px-5 pb-2">
                {section.id !== 'overall' && (
                  <div className="flex">
                    <div className="flex-1" />
                    <div className="bg-red-50 rounded-t-xl rounded-bl-xl py-1 px-2">
                      <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider whitespace-nowrap">{freeMode ? t('form.flawed') : t('form.inappropriate')}</span>
                    </div>
                  </div>
                )}
                <div className="relative z-0">
                  {section.id !== 'overall' && (
                    <div className="absolute right-0 top-0 bottom-0 w-10 bg-red-50 rounded-b-xl pointer-events-none -z-10" />
                  )}
                  {visibleAspects.map((aspect) => (
                    <AspectRow
                      key={aspect.id}
                      aspect={aspect}
                      state={state.aspects[aspect.id] ?? {}}
                      hintsEnabled={hintsEnabled}
                      showInappropriate={section.id !== 'overall'}
                      onChange={(s) => updateAspect(aspect.id, s)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Notes & score */}
            <div className="px-5 pb-4">
              <div className="mt-3">
                {section.sub_scores ? (
                  <div className="space-y-3">
                    {section.sub_scores.map((sub) => (
                      <div key={sub.id}>
                        <label className="block text-sm font-bold text-ink mb-1.5">
                          {messages.section?.[sub.id] || sub.label}
                        </label>
                        <textarea
                          value={state.subNotes?.[sub.id] ?? ''}
                          onChange={(e) => onChange({ ...state, subNotes: { ...state.subNotes, [sub.id]: e.target.value } })}
                          placeholder={t('form.notesPlaceholder')}
                          rows={3}
                          className="w-full px-3 py-2.5 bg-white rounded-xl border border-amber-200 text-sm text-ink placeholder-amber-300 focus:outline-none focus:border-amber-400 resize-none font-medium"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2 mb-1.5">
                      <label className="block text-sm font-bold text-ink">{t('form.notes')}</label>
                      {notesHint[section.id] && (
                        <button
                          onClick={() => setShowNotesHint(!showNotesHint)}
                          className="text-amber-500 hover:text-amber-700 transition-colors"
                          title={t('form.hint')}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                        </button>
                      )}
                    </div>
                    {showNotesHint && notesHint[section.id] && (
                      <div className="mb-2 p-2.5 bg-amber-50 rounded-lg text-xs text-amber-800 border border-amber-200">
                        {notesHint[section.id]}
                      </div>
                    )}
                    <textarea
                      value={state.notes}
                      onChange={(e) => onChange({ ...state, notes: e.target.value })}
                      placeholder={t('form.notesPlaceholder')}
                      rows={3}
                      className="w-full px-3 py-2.5 bg-white rounded-xl border border-amber-200 text-sm text-ink placeholder-amber-300 focus:outline-none focus:border-amber-400 resize-none font-medium"
                    />
                  </>
                )}
              </div>

              {(() => {
                const flagged = section.aspects.filter((a) => state.aspects[a.id]?.inappropriate);
                if (flagged.length === 0 || speed === 'notes_only') return null;
                return (
                  <div className="mt-3 p-3 bg-red-50 rounded-xl border border-red-100">
                    <p className="text-xs font-bold text-red-400 uppercase tracking-wide mb-2">
                      {freeMode ? t('form.flawed') : t('form.inappropriate')}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {flagged.map((a) => (
                        <span key={a.id} className="px-2.5 py-1 bg-white text-red-500 text-xs font-semibold rounded-lg border border-red-200">
                          {messages.aspect?.[a.id] || a.label}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {!freeMode && (
                <div className="mt-3">
                  {section.sub_scores ? (
                    section.sub_scores.map((sub) => (
                      <SectionScoreSlider
                        key={sub.id}
                        maxPoints={sub.max_points}
                        value={state.subScores?.[sub.id] ?? 0}
                        onChange={(v) => onChange({ ...state, subScores: { ...state.subScores, [sub.id]: v } })}
                        label={messages.section?.[sub.id] || sub.label}
                      />
                    ))
                  ) : (
                    <SectionScoreSlider
                      maxPoints={section.max_points}
                      value={state.score}
                      onChange={(v) => onChange({ ...state, score: v })}
                      label={messages.section?.[section.id] || section.label}
                    />
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
