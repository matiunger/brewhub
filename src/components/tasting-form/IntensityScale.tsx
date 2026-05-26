'use client';

import { formData } from '@/lib/evaluation-form-data';
import { useLocale } from '@/lib/locale-context';

const scale = formData.intensity_scale;

interface Props {
  value?: string;
  color?: string;
  onChange: (value: string) => void;
}

const fillShades: Record<string, string[]> = {
  amber:  ['bg-amber-100',  'bg-amber-200',  'bg-amber-300',  'bg-amber-400',  'bg-amber-500',  'bg-amber-600' ],
  lime:   ['bg-lime-100',   'bg-lime-200',   'bg-lime-300',   'bg-lime-400',   'bg-lime-500',   'bg-lime-600'  ],
  green:  ['bg-green-100',  'bg-green-200',  'bg-green-300',  'bg-green-400',  'bg-green-500',  'bg-green-600' ],
  pink:   ['bg-pink-100',   'bg-pink-200',   'bg-pink-300',   'bg-pink-400',   'bg-pink-500',   'bg-pink-600'  ],
  purple: ['bg-purple-100', 'bg-purple-200', 'bg-purple-300', 'bg-purple-400', 'bg-purple-500', 'bg-purple-600'],
  blue:   ['bg-blue-100',   'bg-blue-200',   'bg-blue-300',   'bg-blue-400',   'bg-blue-500',   'bg-blue-600'  ],
  orange: ['bg-orange-100', 'bg-orange-200', 'bg-orange-300', 'bg-orange-400', 'bg-orange-500', 'bg-orange-600'],
  yellow: ['bg-yellow-100', 'bg-yellow-200', 'bg-yellow-300', 'bg-yellow-400', 'bg-yellow-500', 'bg-yellow-600'],
  red:    ['bg-red-100',    'bg-red-200',    'bg-red-300',    'bg-red-400',    'bg-red-500',    'bg-red-600'   ],
  gray:   ['bg-gray-100',   'bg-gray-200',   'bg-gray-300',   'bg-gray-400',   'bg-gray-500',   'bg-gray-600'  ],
  lila:   ['bg-violet-100', 'bg-violet-200', 'bg-violet-300', 'bg-violet-400', 'bg-violet-500', 'bg-violet-600'],
};

const textShades: Record<string, string[]> = {
  amber:  ['text-amber-600',  'text-amber-700',  'text-amber-800',  'text-white', 'text-white', 'text-white'],
  lime:   ['text-lime-600',   'text-lime-700',   'text-lime-800',   'text-white', 'text-white', 'text-white'],
  green:  ['text-green-600',  'text-green-700',  'text-green-800',  'text-white', 'text-white', 'text-white'],
  pink:   ['text-pink-600',   'text-pink-700',   'text-pink-800',   'text-white', 'text-white', 'text-white'],
  purple: ['text-purple-600', 'text-purple-700', 'text-purple-800', 'text-white', 'text-white', 'text-white'],
  blue:   ['text-blue-600',   'text-blue-700',   'text-blue-800',   'text-white', 'text-white', 'text-white'],
  orange: ['text-orange-600', 'text-orange-700', 'text-orange-800', 'text-white', 'text-white', 'text-white'],
  yellow: ['text-yellow-600', 'text-yellow-700', 'text-yellow-800', 'text-yellow-900', 'text-white', 'text-white'],
  red:    ['text-red-600',    'text-red-700',    'text-red-800',    'text-white', 'text-white', 'text-white'],
  gray:   ['text-gray-600',   'text-gray-700',   'text-gray-800',   'text-white', 'text-white', 'text-white'],
  lila:   ['text-violet-600', 'text-violet-700', 'text-violet-800', 'text-white', 'text-white', 'text-white'],
};

export default function IntensityScale({ value, color = 'amber', onChange }: Props) {
  const { messages } = useLocale();
  const selectedIndex = value ? scale.findIndex((o) => o.id === value) : -1;
  const fills = fillShades[color] ?? fillShades.amber;
  const texts = textShades[color] ?? textShades.amber;

  return (
    <div className="w-full">
      <div className="flex w-full h-8 rounded-lg overflow-hidden gap-px bg-stone-200">
        {scale.map((step, i) => {
          const isFilled = selectedIndex >= 0 && i <= selectedIndex;
          return (
            <button
              key={step.id}
              type="button"
              onClick={() => onChange(step.id)}
              className={`
                flex-1 flex items-center justify-center
                text-[10px] font-semibold transition-colors duration-100
                first:rounded-l-lg last:rounded-r-lg
                ${isFilled ? `${fills[i]} ${texts[i]}` : 'bg-stone-100 text-stone-400'}
              `}
            >
              {i !== 2 && i !== 4 ? (messages.intensity?.[step.id] || step.label) : ''}
            </button>
          );
        })}
      </div>
    </div>
  );
}
