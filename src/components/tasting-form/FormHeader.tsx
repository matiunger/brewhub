'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { HeaderState, EvaluationSettings } from '@/lib/evaluation-types';
import OptionPicker from './OptionPicker';
import ComboInput from './ComboInput';
import { useLocale } from '@/lib/locale-context';
import { BottleWine, Cylinder, Barrel } from 'lucide-react';

interface Props {
  header: HeaderState;
  settings: EvaluationSettings;
  onChange: (header: HeaderState) => void;
  onStyleChange: (styleId: string | null) => void;
  batchName?: string;
  batchStyle?: string;
  keggingDate?: string;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-bold text-amber-700 mb-1">{label}</label>
      {children}
    </div>
  );
}

const inputClass = "w-full px-3 py-2.5 bg-white border border-amber-200 rounded-xl text-sm text-ink placeholder-amber-300 focus:outline-none focus:border-amber-400 font-medium";

function calcAge(productionDate: string, toDate?: string): string {
  const prod = new Date(productionDate);
  const now = toDate ? new Date(toDate) : new Date();
  const days = Math.floor((now.getTime() - prod.getTime()) / (1000 * 60 * 60 * 24));
  if (days < 0) return '';
  if (days < 14) return `${days} day${days !== 1 ? 's' : ''}`;
  if (days < 60) return `${Math.floor(days / 7)} week${Math.floor(days / 7) !== 1 ? 's' : ''}`;
  const months = Math.floor(days / 30.44);
  if (months < 24) return `${months} month${months !== 1 ? 's' : ''}`;
  const years = Math.floor(months / 12);
  const rem = months % 12;
  return rem > 0 ? `${years} year${years !== 1 ? 's' : ''} ${rem} month${rem !== 1 ? 's' : ''}` : `${years} year${years !== 1 ? 's' : ''}`;
}

export default function FormHeader({ header, settings, onChange, onStyleChange, batchName, batchStyle, keggingDate }: Props) {
  const { t } = useLocale();
  const [collapsed, setCollapsed] = useState(false);

  const autoAge = keggingDate ? calcAge(keggingDate, header.date || undefined) : null;

  return (
    <div className="bg-paper rounded-2xl shadow-sm border border-amber-100 mb-4">
      {/* Header — always visible, click to collapse/expand */}
      <div
        className="px-5 pt-5 pb-4 cursor-pointer select-none"
        onClick={() => setCollapsed((c) => !c)}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-ink">{t('header.beerInfo')}</h2>
          <svg
            className={`w-5 h-5 text-amber-400 transition-transform duration-300 ${collapsed ? '' : 'rotate-180'}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

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
            <div className="px-5 pb-5">
              {/* Beer identity — read-only from batch */}
              {(batchName || batchStyle) && (
                <div className="mb-4 pb-4 border-b border-amber-100">
                  {batchName && (
                    <p className="text-base font-extrabold text-ink">{batchName}</p>
                  )}
                  {batchStyle && (
                    <p className="text-xs font-semibold text-amber-500 mt-0.5">{batchStyle}</p>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 sm:col-span-1">
                  <Field label={t('header.date')}>
                    <input
                      type="datetime-local"
                      value={header.date}
                      onChange={(e) => onChange({ ...header, date: e.target.value })}
                      className={inputClass}
                    />
                  </Field>
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <Field label={t('header.taster')}>
                    <ComboInput
                      value={header.taster}
                      onChange={(v) => onChange({ ...header, taster: v })}
                      suggestions={[]}
                      placeholder={t('header.placeholders.taster')}
                      className={inputClass}
                    />
                  </Field>
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <Field label={t('header.presentation')}>
                    <OptionPicker
                      options={['Bottle', 'Can', 'Draft']}
                      value={header.presentation}
                      onChange={(v) => onChange({ ...header, presentation: v })}
                      icons={{
                        Bottle: <BottleWine size={14} />,
                        Can: <Cylinder size={14} />,
                        Draft: <Barrel size={14} />,
                      }}
                    />
                  </Field>
                </div>

                {autoAge && (
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs font-bold text-amber-700 mb-1">{t('header.age')}</label>
                    <div className={inputClass + ' text-amber-600 select-none'}>{autoAge}</div>
                  </div>
                )}

                <div className="col-span-2">
                  <Field label={t('header.comments')}>
                    <textarea
                      value={header.comments}
                      onChange={(e) => onChange({ ...header, comments: e.target.value })}
                      placeholder={t('header.placeholders.comments')}
                      rows={3}
                      className={inputClass + ' resize-none'}
                    />
                  </Field>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
