'use client';

import { useState } from 'react';
import type { AnalysisResult } from '../types';
import { InfoTooltip } from './InfoTooltip';

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
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 flex flex-col gap-3">
        <div className="flex items-center gap-1.5">
          <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            ANALYSIS DETAILS
          </p>
          <InfoTooltip text="Shows the raw decision function score, model type, and a confidence percentage derived from the classifier's output." />
        </div>

        {!result ? (
          <div className="flex flex-col items-center justify-center gap-2 py-8 text-slate-300 dark:text-slate-600">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p className="text-[11px] text-center">Run an analysis to see details</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700">
              <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">Model Type</span>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{result.modelType}</span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700">
              <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">Raw Decision Score</span>
              <span className="text-xs font-bold font-mono text-slate-700 dark:text-slate-300">
                {result.decisionFunctionScore >= 0 ? '+' : ''}{result.decisionFunctionScore.toFixed(4)}
              </span>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">Confidence</span>
                <span className="text-xs font-bold font-mono" style={{ color: result.isHighProtein ? '#16a34a' : '#f97316' }}>
                  {result.confidence.toFixed(2)}%
                </span>
              </div>
              <div className="relative w-full h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="absolute left-0 top-0 h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${result.confidence}%`,
                    backgroundColor: result.isHighProtein ? '#16a34a' : '#f97316',
                  }}
                />
                <div
                  className="absolute top-0 h-full w-0.5 bg-white dark:bg-slate-900"
                  style={{ left: '50%' }}
                />
              </div>
              <div className="flex justify-between">
                <span className="text-[9px] text-slate-300 dark:text-slate-600">0%</span>
                <span className="text-[9px] text-slate-400 dark:text-slate-500">◆ 50% threshold</span>
                <span className="text-[9px] text-slate-300 dark:text-slate-600">100%</span>
              </div>
            </div>

            <button
              onClick={() => setShowModal(true)}
              className="text-[10px] text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors bg-transparent border-none cursor-pointer p-0 text-center w-full mt-1"
            >
              How is confidence computed? →
            </button>
          </div>
        )}
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
