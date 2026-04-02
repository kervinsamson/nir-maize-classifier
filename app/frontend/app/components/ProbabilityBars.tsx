import type { AnalysisResult } from '../types';

export function ProbabilityBars({ result }: { result: AnalysisResult | null }) {
  const btPct = result ? (result.isBt ? result.confidence : 100 - result.confidence) : 0;
  const nonBtPct = result ? (result.isBt ? 100 - result.confidence : result.confidence) : 0;

  const bars = [
    { label: 'Bt Corn', pct: btPct, barColor: '#ef4444' },
    { label: 'Non-Bt Corn', pct: nonBtPct, barColor: '#22c55e' },
  ];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 flex flex-col gap-5">
      <h3 className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Class Probability</h3>
      <div className="flex flex-col gap-4">
        {bars.map(({ label, pct, barColor }) => (
          <div key={label} className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{label}</span>
              <span className="text-xs font-bold font-mono text-slate-700 dark:text-slate-300">
                {result ? `${pct.toFixed(1)}%` : '--'}
              </span>
            </div>
            <div className="h-2.5 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{ width: `${pct}%`, backgroundColor: barColor }}
              />
            </div>
          </div>
        ))}
      </div>
      {!result && (
        <p className="text-[11px] text-slate-300 dark:text-slate-600 text-center">Run analysis to view class probabilities</p>
      )}
    </div>
  );
}
