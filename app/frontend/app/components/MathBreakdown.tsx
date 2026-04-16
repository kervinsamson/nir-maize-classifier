import { InfoTooltip } from './InfoTooltip';

export function MathBreakdown() {
  const panels = ['PCA Components', 'Feature Weights', 'Decision Boundary'];
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 flex flex-col gap-5">
      <div className="flex items-center gap-1.5">
        <h3 className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Mathematical Breakdown</h3>
        <InfoTooltip text="Displays internal model components such as PCA projections, feature weights, and the decision boundary (coming soon)." />
      </div>
      <div className="grid grid-cols-3 gap-3">
        {panels.map((name) => (
          <div key={name} className="rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 p-4 flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse" />
            <span className="text-[10px] text-slate-400 dark:text-slate-500 text-center font-medium leading-tight">{name}</span>
          </div>
        ))}
      </div>
      <p className="text-[11px] text-slate-300 dark:text-slate-600 text-center">Run analysis to populate mathematical details</p>
    </div>
  );
}
