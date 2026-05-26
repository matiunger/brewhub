'use client';

import { useState, useEffect } from 'react';
import { isRedirectError } from 'next/dist/client/components/redirect-error';
import { formData } from '@/lib/evaluation-form-data';
import { getStyleById, findStyleByName } from '@/lib/evaluation-styles-data';
import {
  buildInitialState,
  getTotalScore,
} from '@/lib/evaluation-score-utils';
import { useEvaluateContext } from '@/lib/evaluate-context';
import type { EvaluationState, SectionState, EvaluationSettings } from '@/lib/evaluation-types';
import { motion } from 'framer-motion';
import FormHeader from './FormHeader';
import SectionCard from './SectionCard';
import TastingHints from './TastingHints';
import { useLocale } from '@/lib/locale-context';
import { FlagTriangleRight, Save } from 'lucide-react';
import { toast } from 'sonner';

const DRAFT_KEY = 'brewhub_tasting_draft';

function saveDraft(state: EvaluationState): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(state));
  }
}

function loadDraft(): EvaluationState | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(DRAFT_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw) as EvaluationState; } catch { return null; }
}

function clearDraft(): void {
  if (typeof window !== 'undefined') localStorage.removeItem(DRAFT_KEY);
}

interface Props {
  initialState?: EvaluationState;
  onSave: (state: EvaluationState) => Promise<void>;
  batchName?: string;
  batchStyle?: string;
  keggingDate?: string;
}

export default function EvaluationForm({ initialState, onSave, batchName, batchStyle, keggingDate }: Props) {
  const { t, messages } = useLocale();
  const { setData: setEvalData } = useEvaluateContext();
  const [state, setState] = useState<EvaluationState | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialState) {
      setState(initialState);
    } else {
      const draft = loadDraft();
      if (draft) {
        setState(draft);
      } else {
        const defaultSettings = { mode: 'libre' as const, speed: 'extended' as const, hints: false, styleId: null };
        setState(buildInitialState(defaultSettings));
      }
    }
    return () => setEvalData(null);
  }, [setEvalData]);

  useEffect(() => {
    if (!state) return;
    // Only autosave drafts for new tastings (no initialState)
    if (!initialState) saveDraft(state);
    const total = getTotalScore(state);
    const isSM = state.settings.mode === 'contra_estilo';
    const resolvedStyle = isSM
      ? (batchStyle ? findStyleByName(batchStyle) : (state.settings.styleId ? getStyleById(state.settings.styleId) : null))
      : null;
    setEvalData({
      total,
      maxTotal: formData.total_points,
      selectedStyle: resolvedStyle ?? null,
      freeMode: !isSM,
    });
  }, [state, setEvalData, initialState]);

  if (!state) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-amber-400 text-2xl font-bold animate-pulse">{t('form.loading')}</div>
      </div>
    );
  }

  function updateSection(sectionId: string, sectionState: SectionState) {
    setState((prev) => {
      if (!prev) return prev;
      return { ...prev, sections: { ...prev.sections, [sectionId]: sectionState } };
    });
  }

  function updateSettings(patch: Partial<EvaluationSettings>) {
    setState((prev) => prev ? { ...prev, settings: { ...prev.settings, ...patch } } : prev);
  }

  function updateStyle(styleId: string | null) {
    setState((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        settings: { ...prev.settings, styleId },
        header: { ...prev.header, style: styleId ?? '' },
      };
    });
  }

  const isStyleMode = state.settings.mode === 'contra_estilo';
  const selectedStyle = isStyleMode
    ? (batchStyle ? findStyleByName(batchStyle) : (state.settings.styleId ? getStyleById(state.settings.styleId) : null))
    : null;

  function getStyleGuide(sectionId: string) {
    if (!isStyleMode) return undefined;
    const style = selectedStyle;
    if (!style) return undefined;
    switch (sectionId) {
      case 'appearance':
        return [{ label: t('stylePanel.appearance'), text: style.appearance }];
      case 'aroma_flavor':
        return [
          { label: t('stylePanel.aroma'), text: style.aroma },
          { label: t('stylePanel.flavor'), text: style.flavor },
        ];
      case 'mouthfeel':
        return [{ label: t('stylePanel.mouthfeel'), text: style.mouthfeel }];
      case 'overall':
        return [{ label: t('stylePanel.overallImpression'), text: style.overallimpression }];
      default:
        return undefined;
    }
  }

  async function handleSave() {
    if (!state) return;
    setSaving(true);
    try {
      await onSave(state);
      clearDraft();
    } catch (e) {
      if (isRedirectError(e)) throw e;
      toast.error('Failed to save tasting');
      setSaving(false);
    }
  }

  const total = getTotalScore(state);

  return (
    <div className="min-h-screen">
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {/* Session settings */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center bg-amber-100 rounded-xl p-1 gap-0.5">
            {(['libre', 'contra_estilo'] as const).map((m) => (
              <button
                key={m}
                onClick={() => updateSettings({ mode: m })}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  state.settings.mode === m
                    ? 'bg-white text-amber-900 shadow-sm border border-amber-200'
                    : 'text-amber-500 hover:text-amber-700'
                }`}
              >
                {m === 'libre' ? t('form.free') : t('form.byStyle')}
              </button>
            ))}
          </div>
          <div className="flex items-center bg-amber-100 rounded-xl p-1 gap-0.5">
            {([
              { value: 'notes_only', label: t('form.notes') },
              { value: 'extended', label: t('form.extended') },
            ] as const).map(({ value, label }) => (
              <button
                key={value}
                onClick={() => updateSettings({ speed: value })}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  state.settings.speed === value
                    ? 'bg-white text-amber-900 shadow-sm border border-amber-200'
                    : 'text-amber-500 hover:text-amber-700'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <FormHeader
          header={state.header}
          settings={state.settings}
          onChange={(header) => setState((prev) => prev ? { ...prev, header } : prev)}
          onStyleChange={updateStyle}
          batchName={batchName}
          batchStyle={batchStyle}
          keggingDate={keggingDate}
        />

        <TastingHints
          label={messages.tastingProcedure.label}
          hints={messages.tastingProcedure.steps.map((s) => `${s.title} — ${s.hint}`)}
        />

        {formData.sections.map((section, i) => {
          return (
            <div key={section.id}>
              <SectionCard
                section={section}
                state={state.sections[section.id] ?? { score: 0, notes: '', flawed: false, aspects: {} }}
                hintsEnabled={state.settings.hints}
                freeMode={state.settings.mode === 'libre'}
                speed={state.settings.speed}
                styleGuide={getStyleGuide(section.id)}
                styleName={selectedStyle?.name}
                onChange={(s) => updateSection(section.id, s)}
                index={i}
              />
            </div>
          );
        })}

        <div className="pb-8 space-y-3">
          {/* Score summary */}
          <div className="bg-paper rounded-2xl border border-amber-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-amber-700">Total Score</p>
                <p className="text-3xl font-extrabold text-amber-500">
                  {total}
                  <span className="text-base font-semibold text-amber-300"> / {formData.total_points}</span>
                </p>
              </div>
              <div className="w-24 h-2 bg-amber-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full transition-all duration-500"
                  style={{ width: `${formData.total_points > 0 ? (total / formData.total_points) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleSave}
            disabled={saving}
            className="w-full py-4 bg-amber-400 hover:bg-amber-500 disabled:opacity-60 text-white font-extrabold text-lg rounded-2xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <Save size={20} />
            {saving ? 'Saving…' : 'Save to Brewhub'}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
