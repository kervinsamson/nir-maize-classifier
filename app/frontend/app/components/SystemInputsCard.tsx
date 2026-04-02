'use client';

import { SpinnerIcon } from './icons';
import { UploadBox } from './UploadBox';

interface SystemInputsCardProps {
  modelFile: File | null;
  dataFile: File | null;
  onModelSelect: (file: File) => void;
  onDataSelect: (file: File) => void;
  isProcessing: boolean;
  canAnalyze: boolean;
  onAnalyze: () => void;
}

export function SystemInputsCard({
  modelFile,
  dataFile,
  onModelSelect,
  onDataSelect,
  isProcessing,
  canAnalyze,
  onAnalyze,
}: SystemInputsCardProps) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 flex flex-col gap-5">
      <h2 className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
        1. System Inputs
      </h2>

      <UploadBox
        file={modelFile}
        onFileSelect={onModelSelect}
        accept=".h5,.pkl"
        label="Classifier Model"
        hint="Upload .h5 or .pkl"
        variant="model"
      />

      <UploadBox
        file={dataFile}
        onFileSelect={onDataSelect}
        accept=".spa"
        label="Spectral Data"
        hint="Upload .spa"
        variant="data"
      />

      <button
        onClick={onAnalyze}
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
  );
}
