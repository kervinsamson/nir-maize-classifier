'use client';

import type { PredictionRecord } from '../types';
import { InfoTooltip } from './InfoTooltip';

interface PredictionHistoryProps {
  records: PredictionRecord[];
}

export function PredictionHistory({ records }: PredictionHistoryProps) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <h3 className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            Prediction History
          </h3>
          <InfoTooltip text="A running log of all predictions made this session — including the file name, model used, result, confidence score, and inference time." />
        </div>
        <span className="text-[10px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-full">
          {records.length} {records.length === 1 ? 'sample' : 'samples'}
        </span>
      </div>

      {records.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-8 text-slate-300 dark:text-slate-600">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="text-[11px] text-center">No predictions yet. Upload a model and spectrum to begin.</p>
        </div>
      ) : (
        <>
          <div className="overflow-y-auto max-h-[220px] custom-scrollbar">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-white dark:bg-slate-800">
                <tr className="border-b border-slate-100 dark:border-slate-700">
                  <th className="text-left py-2 text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide">#</th>
                  <th className="text-left py-2 text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide">File</th>
                  <th className="text-left py-2 text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Model</th>
                  <th className="text-left py-2 text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Result</th>
                  <th className="text-right py-2 text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Confidence</th>
                  <th className="text-right py-2 text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Time</th>
                </tr>
              </thead>
              <tbody>
                {[...records].reverse().map((record) => (
                  <tr key={record.id} className="border-b border-slate-50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="py-2 text-slate-400 dark:text-slate-500 font-mono">{record.id}</td>
                    <td className="py-2 text-slate-600 dark:text-slate-300 max-w-[100px] truncate font-mono text-[10px]" title={record.filename}>{record.filename}</td>
                    <td className="py-2 text-slate-500 dark:text-slate-400">{record.modelType}</td>
                    <td className="py-2">
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide ${
                        record.isHighProtein
                          ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400'
                          : 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-400'
                      }`}>
                        {record.isHighProtein ? 'High' : 'Low'}
                      </span>
                    </td>
                    <td className="py-2 text-right font-mono text-slate-600 dark:text-slate-300">{record.confidence.toFixed(1)}%</td>
                    <td className="py-2 text-right font-mono text-slate-400 dark:text-slate-500">{record.inferenceTime.toFixed(3)}s</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[10px] text-slate-300 dark:text-slate-600 text-center">
            Session history — resets on page refresh
          </p>
        </>
      )}
    </div>
  );
}
