'use client';

import type { AnalysisResult } from '../types';
import { InfoTooltip } from './InfoTooltip';

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-slate-100 dark:border-slate-700 last:border-0">
      <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">{label}</span>
      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 max-w-[58%] text-right truncate">{value}</span>
    </div>
  );
}

interface FinalVerdictCardProps {
  result?: AnalysisResult | null;
  modelFileName: string;
}

export function FinalVerdictCard({ result, modelFileName }: FinalVerdictCardProps) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 flex flex-col gap-4">
      <div className="flex items-center gap-1.5">
        <h2 className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
          Final Verdict
        </h2>
        <InfoTooltip text="The model's binary classification result — whether the sample is high or low in protein content." />
      </div>

      {!result ? (
        <div className="flex flex-col items-center justify-center gap-2 py-8 text-slate-300 dark:text-slate-600">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-[11px] text-center">Run an analysis to see the verdict</p>
        </div>
      ) : (
        <>
          {result.isHighProtein ? (
            <div
              className="rounded-lg bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-900 p-4"
              style={{ borderLeft: '4px solid #166534' }}
            >
              <p className="text-green-800 dark:text-green-400 font-bold uppercase tracking-wide text-sm">
                HIGH PROTEIN DETECTED
              </p>
            </div>
          ) : (
            <div
              className="rounded-lg bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-900 p-4"
              style={{ borderLeft: '4px solid #c2410c' }}
            >
              <p className="text-orange-800 dark:text-orange-400 font-bold uppercase tracking-wide text-sm">
                LOW PROTEIN DETECTED
              </p>
            </div>
          )}

          <div className="flex flex-col">
            <MetaRow label="Confidence" value={`${result.confidence}%`} />
            <MetaRow label="Inference Time" value={`${result.inferenceTime}s`} />
            <MetaRow label="Model Loaded" value={modelFileName} />
          </div>
        </>
      )}
    </div>
  );
}
