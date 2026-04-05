'use client';

import { useState } from 'react';
import type { AnalysisResult } from '../types';

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-slate-100 dark:border-slate-700 last:border-0">
      <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">{label}</span>
      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 max-w-[58%] text-right truncate">{value}</span>
    </div>
  );
}

interface FinalVerdictCardProps {
  result: AnalysisResult;
  modelFileName: string;
}

export function FinalVerdictCard({ result, modelFileName }: FinalVerdictCardProps) {
  const [showExplanation, setShowExplanation] = useState(false);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 flex flex-col gap-4">
      <h2 className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
        2. Final Verdict
      </h2>

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
        <button
          onClick={() => setShowExplanation((prev) => !prev)}
          className="text-[10px] text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer bg-transparent border-none p-0 text-left transition-colors w-full py-1"
        >
          {showExplanation ? 'How is this calculated? ▴' : 'How is this calculated? ▾'}
        </button>
        {showExplanation && (
          <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 flex flex-col gap-2 text-xs text-slate-600 dark:text-slate-400">
            <p className="font-bold text-slate-700 dark:text-slate-300 text-[11px] uppercase tracking-wide">Confidence Score</p>
            <p>The confidence score represents how strongly the model predicts High or Low Protein. It is computed from the model&apos;s raw output score using a 0–100% scale. A score above 50% indicates High Protein — the further from 50%, the more certain the prediction.</p>
            <div className="bg-white dark:bg-slate-900 rounded p-2 border border-slate-200 dark:border-slate-700 flex flex-col gap-1 text-[10px] font-mono">
              <p className="text-slate-500 dark:text-slate-400">Raw Score: {result.decisionFunctionScore}</p>
              <p className="text-slate-500 dark:text-slate-400">Confidence: {result.confidence}%</p>
              <p className="text-slate-500 dark:text-slate-400">Prediction: {result.isHighProtein ? 'High Protein' : 'Low Protein'}</p>
            </div>
            <p className="text-[10px] italic text-slate-400 dark:text-slate-500">Note: Confidence computation varies by model type (PLS-DA, SVM, 1D-CNN) and is handled by the backend.</p>
          </div>
        )}
        <MetaRow label="Inference Time" value={`${result.inferenceTime}s`} />
        <MetaRow label="Model Loaded" value={modelFileName} />
      </div>
    </div>
  );
}
