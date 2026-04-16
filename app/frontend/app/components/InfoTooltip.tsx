'use client';

interface InfoTooltipProps {
  text: string;
}

export function InfoTooltip({ text }: InfoTooltipProps) {
  return (
    <div className="relative inline-flex group">
      <button
        type="button"
        className="w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 text-[9px] font-bold flex items-center justify-center hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors cursor-default select-none"
        aria-label="More information"
        tabIndex={-1}
      >
        ?
      </button>
      <div
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 rounded-lg bg-slate-800 dark:bg-slate-950 border border-slate-700 dark:border-slate-800 px-3 py-2 text-[11px] text-slate-200 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-50 leading-relaxed"
      >
        {text}
        <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800 dark:border-t-slate-950" />
      </div>
    </div>
  );
}
