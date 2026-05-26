'use client';

import { useState } from 'react';
import type { BeerStyle } from '@/lib/evaluation-types';
import PintGlass from '@/components/PintGlass';
import { srmToHex } from '@/lib/srm';
import { useLocale } from '@/lib/locale-context';

interface Props {
  style: BeerStyle;
}

export default function StyleReference({ style }: Props) {
  const [open, setOpen] = useState(false);
  const { t } = useLocale();

  const ranges = [
    style.ibumin && style.ibumax ? `IBU: ${style.ibumin}–${style.ibumax}` : null,
    style.abvmin && style.abvmax ? `ABV: ${style.abvmin}–${style.abvmax}%` : null,
    style.srmmin && style.srmmax ? `SRM: ${style.srmmin}–${style.srmmax}` : null,
  ].filter(Boolean);

  const avgSrm = style.srmmin && style.srmmax
    ? (parseFloat(style.srmmin) + parseFloat(style.srmmax)) / 2
    : null;
  const beerHex = avgSrm ? srmToHex(avgSrm) : '#F8A600';

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-2xl overflow-hidden mb-4">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-blue-100 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="text-left">
            <div className="font-bold text-blue-900 text-sm">{t('stylePanel.styleReference')}</div>
            <div className="text-xs text-blue-600 font-semibold">{style.number} — {style.name}</div>
          </div>
        </div>
        <svg
          className={`w-4 h-4 text-blue-500 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="px-5 pb-5 space-y-3">
          <div className="flex items-center gap-3">
            <PintGlass hex={beerHex} size={52} />
            <div>
              <div className="text-xs font-extrabold text-blue-500 uppercase tracking-wide">{style.number}</div>
              <div className="font-extrabold text-blue-900 text-base leading-tight">{style.name}</div>
            </div>
          </div>

          {ranges.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {ranges.map((r) => (
                <span key={r} className="px-3 py-1 bg-blue-200 text-blue-800 text-xs font-bold rounded-full">{r}</span>
              ))}
            </div>
          )}

          {style.overallimpression && (
            <div>
              <h4 className="text-xs font-extrabold text-blue-800 uppercase tracking-wide mb-1">{t('stylePanel.overallImpression')}</h4>
              <p className="text-sm text-blue-900">{style.overallimpression}</p>
            </div>
          )}

          {style.aroma && (
            <div>
              <h4 className="text-xs font-extrabold text-blue-800 uppercase tracking-wide mb-1">{t('stylePanel.aroma')}</h4>
              <p className="text-sm text-blue-900">{style.aroma}</p>
            </div>
          )}

          {style.appearance && (
            <div>
              <h4 className="text-xs font-extrabold text-blue-800 uppercase tracking-wide mb-1">{t('stylePanel.appearance')}</h4>
              <p className="text-sm text-blue-900">{style.appearance}</p>
            </div>
          )}

          {style.flavor && (
            <div>
              <h4 className="text-xs font-extrabold text-blue-800 uppercase tracking-wide mb-1">{t('stylePanel.flavor')}</h4>
              <p className="text-sm text-blue-900">{style.flavor}</p>
            </div>
          )}

          {style.mouthfeel && (
            <div>
              <h4 className="text-xs font-extrabold text-blue-800 uppercase tracking-wide mb-1">{t('stylePanel.mouthfeel')}</h4>
              <p className="text-sm text-blue-900">{style.mouthfeel}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
