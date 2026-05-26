'use client';

import { getScoreLabel } from '@/lib/evaluation-score-utils';
import type { BeerStyle } from '@/lib/evaluation-types';
import PintGlass from '@/components/PintGlass';
import { srmToHex } from '@/lib/srm';
import { useLocale } from '@/lib/locale-context';
import { useState } from 'react';

interface Props {
  total: number;
  maxTotal: number;
  beerName: string;
  selectedStyle?: BeerStyle | null;
  freeMode?: boolean;
}

export default function RunningScore({ total, maxTotal, beerName, selectedStyle, freeMode = false }: Props) {
  const { messages } = useLocale();
  const { text } = getScoreLabel(total);
  const pct = maxTotal > 0 ? (total / maxTotal) * 100 : 0;
  const [styleOpen, setStyleOpen] = useState(false);

  const avgSrm = selectedStyle?.srmmin && selectedStyle?.srmmax
    ? (parseFloat(selectedStyle.srmmin) + parseFloat(selectedStyle.srmmax)) / 2
    : null;
  const beerHex = avgSrm ? srmToHex(avgSrm) : '#F8A600';

  const ranges = selectedStyle ? [
    selectedStyle.ibumin && selectedStyle.ibumax ? `IBU ${selectedStyle.ibumin}–${selectedStyle.ibumax}` : null,
    selectedStyle.abvmin && selectedStyle.abvmax ? `ABV ${selectedStyle.abvmin}–${selectedStyle.abvmax}%` : null,
    selectedStyle.srmmin && selectedStyle.srmmax ? `SRM ${selectedStyle.srmmin}–${selectedStyle.srmmax}` : null,
  ].filter(Boolean) : [];

  return (
    <>
      <div className="sticky top-0 z-50 bg-paper/95 backdrop-blur-sm border-b border-amber-200 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-2.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-bold text-ink truncate text-sm">
              {beerName || 'Tasting'}
            </span>
          </div>

          {selectedStyle && (
            <button
              onClick={() => setStyleOpen(!styleOpen)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-colors text-xs font-bold flex-shrink-0 ${
                styleOpen ? 'bg-blue-200 text-blue-900' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              }`}
            >
              <span>📋</span>
              <span className="truncate max-w-[100px]">{selectedStyle.name}</span>
            </button>
          )}

          {!freeMode && (
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="hidden sm:flex flex-col items-end">
                <div className="w-32 h-2 bg-amber-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-xs text-amber-600 font-semibold mt-0.5">{messages.scoring[text] || text}</span>
              </div>
              <div className="text-right">
                <span className="text-2xl font-extrabold text-amber-500">{total}</span>
                <span className="text-sm font-semibold text-amber-300">/{maxTotal}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {selectedStyle && styleOpen && (
        <>
          <div
            className="fixed inset-0 z-30"
            onClick={() => setStyleOpen(false)}
          />
          <div className="fixed top-[53px] left-0 right-0 z-40 flex justify-center px-4">
            <div className="w-full max-w-2xl bg-white border border-blue-200 rounded-2xl shadow-xl p-5 space-y-3 max-h-[70vh] overflow-y-auto">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <PintGlass hex={beerHex} size={52} />
                  <div>
                    <span className="text-xs font-extrabold text-blue-500 uppercase tracking-wide">{selectedStyle.number}</span>
                    <h3 className="font-extrabold text-blue-900 text-lg leading-tight">{selectedStyle.name}</h3>
                  </div>
                </div>
                <button onClick={() => setStyleOpen(false)} className="text-blue-300 hover:text-blue-600 text-lg leading-none flex-shrink-0 mt-1">✕</button>
              </div>
              {ranges.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {ranges.map((r) => (
                    <span key={r} className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-full">{r}</span>
                  ))}
                </div>
              )}
              {selectedStyle.overallimpression && (
                <div>
                  <h4 className="text-xs font-extrabold text-blue-600 uppercase tracking-wide mb-1">{messages.stylePanel?.overallImpression || 'Overall Impression'}</h4>
                  <p className="text-sm text-blue-900">{selectedStyle.overallimpression}</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
