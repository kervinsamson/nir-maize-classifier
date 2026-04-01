'use client';

import { useState, useRef, useEffect, type ChangeEvent, type DragEvent } from 'react';
import { useTheme } from 'next-themes';

// â”€â”€ Icons â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const BrainIcon = ({ className = 'w-8 h-8' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z" />
    <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z" />
  </svg>
);

const ChartLineIcon = ({ className = 'w-8 h-8' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 3v18h18" />
    <path d="m19 9-5 5-4-4-3 3" />
  </svg>
);

const CheckCircleIcon = ({ className = 'w-8 h-8' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <path d="m9 11 3 3L22 4" />
  </svg>
);

const SpinnerIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

const SunIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
  </svg>
);

const MoonIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
  </svg>
);

// â”€â”€ Theme Toggle â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 animate-pulse" />;
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-200 transition-all duration-200 shadow-sm"
    >
      {isDark ? <SunIcon className="w-4 h-4" /> : <MoonIcon className="w-4 h-4" />}
    </button>
  );
}

// â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface AnalysisResult {
  isBt: boolean;
  confidence: number;
  inferenceTime: number;
}

// â”€â”€ Upload Box â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface UploadBoxProps {
  file: File | null;
  onFileSelect: (file: File) => void;
  accept: string;
  label: string;
  hint: string;
  variant: 'model' | 'data';
}

function UploadBox({ file, onFileSelect, accept, label, hint, variant }: UploadBoxProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) onFileSelect(f);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) onFileSelect(f);
  };

  const isModel = variant === 'model';
  const uploaded = !!file;

  let boxClass =
    'relative flex flex-col items-center justify-center gap-2 h-28 rounded-lg border-2 border-dashed ' +
    'cursor-pointer transition-all duration-200 select-none ';

  if (uploaded) {
    boxClass += 'border-green-500 bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-400';
  } else if (isDragging) {
    boxClass += isModel
      ? 'border-blue-500 bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400'
      : 'border-slate-400 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400';
  } else {
    boxClass += isModel
      ? 'border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-950/40 text-blue-500 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-950 hover:border-blue-400'
      : 'border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 hover:border-slate-400';
  }

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{label}</span>
      <div
        role="button"
        tabIndex={0}
        aria-label={`Upload ${label}`}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={boxClass}
      >
        {uploaded ? (
          <>
            <CheckCircleIcon className="w-6 h-6" />
            <span className="text-[11px] font-bold text-center px-3 w-full truncate leading-relaxed">
              {file.name}
            </span>
          </>
        ) : (
          <>
            {isModel
              ? <BrainIcon className="w-7 h-7" />
              : <ChartLineIcon className="w-7 h-7" />
            }
            <span className="text-[11px] font-medium text-center leading-relaxed">
              {hint}
              <span className="block text-[10px] opacity-50 mt-0.5">Click or drag &amp; drop</span>
            </span>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={handleChange}
        />
      </div>
    </div>
  );
}

// â”€â”€ Meta Row â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-slate-100 dark:border-slate-700 last:border-0">
      <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">{label}</span>
      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 max-w-[58%] text-right truncate">{value}</span>
    </div>
  );
}

// â”€â”€ Right Column Panels â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function SpectralPlot({ hasData }: { hasData: boolean }) {
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

function ProbabilityBars({ result }: { result: AnalysisResult | null }) {
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

function MathBreakdown() {
  const panels = ['PCA Components', 'Feature Weights', 'Decision Boundary'];
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 flex flex-col gap-5">
      <h3 className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Mathematical Breakdown</h3>
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

// â”€â”€ Main Page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export default function Home() {
  const [modelFile, setModelFile] = useState<File | null>(null);
  const [dataFile, setDataFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  const canAnalyze = modelFile !== null && dataFile !== null && !isProcessing;

  const handleAnalyze = async () => {
    if (!canAnalyze) return;
    setIsProcessing(true);
    setAnalysisResult(null);
    // Placeholder: replace with real API call
    await new Promise<void>((resolve) => setTimeout(resolve, 2000));
    setAnalysisResult({
      isBt: Math.random() > 0.5,
      confidence: parseFloat((Math.random() * 8 + 91).toFixed(1)),
      inferenceTime: parseFloat((Math.random() * 0.3 + 0.2).toFixed(2)),
    });
    setIsProcessing(false);
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col">

      {/* â”€â”€ Header â”€â”€ */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm flex-shrink-0">
        <div className="px-8 py-4 flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#7B1113]" />
            <span className="text-sm font-bold text-slate-800 dark:text-slate-100 tracking-tight">NIR Maize Classifier</span>
          </div>
          <div className="h-4 w-px bg-slate-200 dark:bg-slate-700" />
          <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            Near-Infrared Spectroscopy / Bt Detection System
          </span>
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* â”€â”€ Dashboard â”€â”€ */}
      <div className="flex flex-1 gap-5 p-6 w-full">

        {/* â”€â”€ Left Column (30%) â”€â”€ */}
        <aside className="w-[30%] flex flex-col gap-4 flex-shrink-0">

          {/* Card 1 â€” System Inputs */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 flex flex-col gap-5">
            <h2 className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              1. System Inputs
            </h2>

            <UploadBox
              file={modelFile}
              onFileSelect={setModelFile}
              accept=".h5,.pkl"
              label="Classifier Model"
              hint="Upload .h5 or .pkl"
              variant="model"
            />

            <UploadBox
              file={dataFile}
              onFileSelect={setDataFile}
              accept=".spa"
              label="Spectral Data"
              hint="Upload .spa"
              variant="data"
            />

            <button
              onClick={handleAnalyze}
              disabled={!canAnalyze}
              aria-disabled={!canAnalyze}
              className={[
                'w-full h-12 rounded-lg font-bold text-sm tracking-wide',
                'flex items-center justify-center gap-2',
                'transition-all duration-200',
                isProcessing
                  ? 'bg-[#7B1113] text-white opacity-75 cursor-not-allowed'
                  : canAnalyze
                    ? 'bg-[#7B1113] text-white hover:bg-[#5e0d0f] active:scale-[0.98] cursor-pointer shadow-md hover:shadow-lg'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed border border-slate-200 dark:border-slate-700',
              ].join(' ')}
            >
              {isProcessing ? (
                <>
                  <SpinnerIcon className="w-4 h-4 animate-spin" />
                  Processing Data...
                </>
              ) : (
                'Analyze Spectrum ->'
              )}
            </button>
          </div>

          {/* Card 2 â€” Final Verdict (shown after analysis) */}
          {analysisResult && (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 flex flex-col gap-4">
              <h2 className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                2. Final Verdict
              </h2>

              {analysisResult.isBt ? (
                <div
                  className="rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 p-4"
                  style={{ borderLeft: '4px solid #991b1b' }}
                >
                  <p className="text-red-800 dark:text-red-400 font-bold uppercase tracking-wide text-sm">
                    BT CORN DETECTED
                  </p>
                </div>
              ) : (
                <div
                  className="rounded-lg bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-900 p-4"
                  style={{ borderLeft: '4px solid #166534' }}
                >
                  <p className="text-green-800 dark:text-green-400 font-bold uppercase tracking-wide text-sm">
                    NON-BT CORN
                  </p>
                </div>
              )}

              <div className="flex flex-col">
                <MetaRow label="Confidence" value={`${analysisResult.confidence}%`} />
                <MetaRow label="Inference Time" value={`${analysisResult.inferenceTime}s`} />
                <MetaRow label="Model Loaded" value={modelFile?.name ?? '--'} />
              </div>
            </div>
          )}
        </aside>

        {/* â”€â”€ Right Column (70%) â”€â”€ */}
        <main className="flex-1 flex flex-col gap-4 min-w-0">
          <SpectralPlot hasData={!!dataFile} />
          <div className="grid grid-cols-2 gap-4">
            <ProbabilityBars result={analysisResult} />
            <MathBreakdown />
          </div>
        </main>

      </div>
    </div>
  );
}
