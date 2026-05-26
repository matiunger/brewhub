'use client';

import type { SRMOption } from '@/lib/evaluation-types';
import { useLocale } from '@/lib/locale-context';

interface Props {
  options: SRMOption[];
  value?: string;
  onChange: (value: string) => void;
}

function isLight(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return 0.299 * r + 0.587 * g + 0.114 * b > 140;
}

export default function SRMPicker({ options, value, onChange }: Props) {
  const { messages } = useLocale();
  const index = value ? options.findIndex((o) => o.label === value) : 0;
  const selected = options[Math.max(0, index)];
  const light = isLight(selected.hex);

  const gradient = `linear-gradient(to right, ${options.map((o) => o.hex).join(', ')})`;

  return (
    <div className="w-full space-y-2.5">
      {/* Color preview */}
      <div
        className="w-full rounded-xl px-4 py-3 flex items-center justify-between transition-colors duration-300"
        style={{ backgroundColor: selected.hex }}
      >
        <span className={`font-extrabold text-sm ${light ? 'text-gray-800' : 'text-white'}`}>
          {messages.colorLabel?.[selected.label.trim()] || selected.label.trim()}
        </span>
        <span className={`text-xs font-semibold ${light ? 'text-gray-600' : 'text-white/70'}`}>
          SRM {selected.srm_min}–{selected.srm_max}
        </span>
      </div>

      {/* Gradient slider */}
      <input
        type="range"
        min={0}
        max={options.length - 1}
        step={1}
        value={index >= 0 ? index : 0}
        onChange={(e) => onChange(options[Number(e.target.value)].label)}
        style={{ background: gradient }}
        className="w-full h-4 rounded-full cursor-pointer appearance-none
          [&::-webkit-slider-runnable-track]:h-4 [&::-webkit-slider-runnable-track]:rounded-full
          [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6
          [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white
          [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white
          [&::-webkit-slider-thumb]:mt-[-4px] [&::-webkit-slider-thumb]:cursor-pointer
          [&::-moz-range-track]:h-4 [&::-moz-range-track]:rounded-full
          [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:rounded-full
          [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:shadow-md
          [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:cursor-pointer"
      />
    </div>
  );
}
