'use client';

import { useLocale } from '@/lib/locale-context';

interface Props {
  maxPoints: number;
  value: number;
  onChange: (value: number) => void;
  label: string;
}

export default function SectionScoreSlider({ maxPoints, value, onChange, label }: Props) {
  const { t } = useLocale();
  const pct = maxPoints > 0 ? (value / maxPoints) * 100 : 0;

  return (
    <div className="mt-4 p-4 bg-foam rounded-xl border border-amber-100">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-bold text-ink">{label} — {t('form.score')}</span>
        <span className="text-lg font-extrabold text-amber-500">
          {value} <span className="text-sm font-semibold text-amber-300">/ {maxPoints}</span>
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={maxPoints}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full"
        style={{
          background: `linear-gradient(to right, #E8A10E ${pct}%, #E8E0D0 ${pct}%)`,
        }}
      />
      <div className="flex justify-between text-xs text-amber-400 mt-1 font-semibold">
        <span>0</span>
        <span>{maxPoints}</span>
      </div>
    </div>
  );
}
