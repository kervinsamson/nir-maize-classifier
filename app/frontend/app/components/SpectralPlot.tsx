export function SpectralPlot({ hasData }: { hasData: boolean }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 flex flex-col gap-4 flex-1">
      <div className="flex items-center justify-between">
        <h3 className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Spectral Input</h3>
        <span className="text-[10px] text-slate-300 dark:text-slate-600 font-mono tracking-wide">900 - 2500 nm</span>
      </div>
      <div className="flex-1 min-h-[200px] rounded-lg bg-slate-50 dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center">
        {hasData ? (
          <svg className="w-full h-full px-8 py-4" viewBox="0 0 400 100" preserveAspectRatio="none" fill="none">
            <path
              d="M0 80 C20 70, 40 30, 60 50 C80 70, 100 20, 120 35 C140 50, 160 15, 180 40 C200 65, 220 10, 240 30 C260 50, 280 60, 300 45 C320 30, 340 70, 360 55 C380 40, 390 60, 400 50"
              stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            />
            <path
              d="M0 80 C20 70, 40 30, 60 50 C80 70, 100 20, 120 35 C140 50, 160 15, 180 40 C200 65, 220 10, 240 30 C260 50, 280 60, 300 45 C320 30, 340 70, 360 55 C380 40, 390 60, 400 50 L400 100 L0 100 Z"
              fill="#eff6ff" opacity="0.6"
            />
          </svg>
        ) : (
          <div className="flex flex-col items-center gap-3 text-slate-300 dark:text-slate-600">
            <svg className="w-14 h-8" viewBox="0 0 120 40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M0 32 Q15 8 30 24 Q45 38 60 14 Q75 -4 90 20 Q105 38 120 16" />
            </svg>
            <span className="text-[11px] text-center leading-relaxed">
              Upload a <code className="font-mono bg-slate-100 dark:bg-slate-800 px-1 rounded text-slate-400 dark:text-slate-500">.spa</code> file to visualize the spectrum
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
