'use client';

import { useState } from 'react';
import type { ModelDetectionResult } from '../types';
import { SpinnerIcon } from './icons';
import { UploadBox } from './UploadBox';
import { InfoTooltip } from './InfoTooltip';

interface SystemInputsCardProps {
  modelFile: File | null;
  dataFile: File | null;
  onModelSelect: (file: File) => void;
  onDataSelect: (file: File) => void;
  isProcessing: boolean;
  canAnalyze: boolean;
  onAnalyze: () => void;
  modelDetection: ModelDetectionResult | null;
}

export function SystemInputsCard({
  modelFile,
  dataFile,
  onModelSelect,
  onDataSelect,
  isProcessing,
  canAnalyze,
  onAnalyze,
  modelDetection,
}: SystemInputsCardProps) {
  const [showModelInfo, setShowModelInfo] = useState(false);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 flex flex-col gap-5">
      <div className="flex items-center gap-1.5">
        <h2 className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
          1. System Inputs
        </h2>
        <InfoTooltip text="Upload your trained classifier model (.h5 or .pkl) and a NIR spectral CSV file, then click Analyze to run a protein classification." />
      </div>

      <UploadBox
        file={modelFile}
        onFileSelect={onModelSelect}
        accept=".h5,.pkl"
        label="Classifier Model"
        hint="Upload .h5 or .pkl"
        variant="model"
      />

      <div>
        <button
          onClick={() => setShowModelInfo((prev) => !prev)}
          className="text-xs font-semibold text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer bg-transparent border-none p-0 text-left"
        >
          Model Information {modelDetection ? `(${modelDetection.modelType})` : modelFile ? '(detecting...)' : ''} {showModelInfo ? '▴' : '▾'}
        </button>
        <div className="overflow-hidden transition-all duration-200">
          {showModelInfo && (
            <table className="w-full rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 mt-2 text-xs">
              <tbody>
                {[
                  { property: 'Algorithm',         value: modelDetection?.algorithm       ?? '—' },
                  { property: 'Kernel',            value: modelDetection?.kernel          ?? '—' },
                  { property: 'Preprocessing',     value: modelDetection?.preprocessing   ?? '—' },
                  { property: 'Training Samples',  value: modelDetection?.trainingSamples ?? '—' },
                  { property: 'Augmentation',      value: modelDetection?.augmentation    ?? '—' },
                  { property: 'CV Strategy',       value: modelDetection?.cvStrategy      ?? '—' },
                ].map(({ property, value }, i) => (
                  <tr
                    key={property}
                    className={
                      i % 2 === 0
                        ? 'bg-slate-50 dark:bg-slate-800'
                        : 'bg-white dark:bg-slate-900'
                    }
                  >
                    <td className="text-slate-500 dark:text-slate-400 font-medium px-3 py-1.5 w-1/2">
                      {property}
                    </td>
                    <td className="text-slate-700 dark:text-slate-300 px-3 py-1.5">
                      {value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <UploadBox
        file={dataFile}
        onFileSelect={onDataSelect}
        accept=".csv"
        label="Spectral Data"
        hint="Upload .csv"
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
