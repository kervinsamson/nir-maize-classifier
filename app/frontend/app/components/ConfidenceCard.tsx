'use client';

import { useState } from 'react';
import type { AnalysisResult } from '../types';

interface ConfidenceCardProps {
  result?: AnalysisResult | null;
}

export function ConfidenceCard({ result }: ConfidenceCardProps) {
  const [showModal, setShowModal] = useState(false);

  const confidence = result?.confidence;
  const isHighProtein = result?.isHighProtein;
  const decisionFunctionScore = result?.decisionFunctionScore;

  return (
    <>
      <div
        className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 flex flex-col gap-3 cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => setShowModal(true)}
      >
        <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
          CONFIDENCE
        </p>

        <div className="flex flex-col items-center justify-center flex-1 py-4 gap-1">
          <span
            className="text-7xl font-black tabular-nums leading-none"
            style={{ color: result ? (isHighProtein ? '#16a34a' : '#f97316') : '#64748b' }}
          >
            {confidence !== undefined ? `${confidence}%` : '—'}
          </span>
          <span
            className="text-xs font-semibold uppercase tracking-widest mt-2"
            style={{ color: result ? (isHighProtein ? '#16a34a' : '#f97316') : '#64748b' }}
          >
            {result ? (isHighProtein ? 'High Protein' : 'Low Protein') : 'No Analysis'}
          </span>
        </div>

        <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center">Click for details</p>
      </div>

      {showModal && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white dark:bg-slate-900 rounded-xl p-6 max-w-sm w-full mx-4 flex flex-col gap-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide">
                Confidence Score
              </p>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors bg-transparent border-none cursor-pointer p-0 text-base leading-none"
              >
                ✕
              </button>
            </div>

            {result ? (
              <>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  The confidence score represents how strongly the model&#39;s raw output favors the
                  predicted class. It is normalized to a 0–100% scale by the backend regardless of
                  which model (PLS-DA, SVM, or 1D-CNN) was used.
                </p>

                <p className="text-xs text-slate-500 dark:text-slate-400">
                  A score above 50% indicates High Protein. The further from 50%, the more certain the
                  prediction.
                </p>

                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 flex flex-col gap-1.5 font-mono text-[11px]">
                  <p className="text-slate-600 dark:text-slate-400">Raw Score: {decisionFunctionScore}</p>
                  <p className="text-slate-600 dark:text-slate-400">Confidence: {confidence}%</p>
                  <p className="text-slate-600 dark:text-slate-400">
                    Prediction: {isHighProtein ? 'High Protein' : 'Low Protein'}
                  </p>
                </div>

                <p className="text-[10px] italic text-slate-400 dark:text-slate-500">
                  Confidence computation varies by model type and is handled by the backend.
                </p>
              </>
            ) : (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Perform an analysis to see confidence details.
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
