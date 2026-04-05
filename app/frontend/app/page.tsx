'use client';

import { useState } from 'react';
import type { AnalysisResult } from './types';
import { ThemeToggle } from './components/ThemeToggle';
import { SystemInputsCard } from './components/SystemInputsCard';
import { FinalVerdictCard } from './components/FinalVerdictCard';
import { SpectralPlot } from './components/SpectralPlot';
import { ConfidenceGauge } from './components/ConfidenceGauge';
import { MathBreakdown } from './components/MathBreakdown';

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
      isHighProtein: Math.random() > 0.5,
      confidence: parseFloat((Math.random() * 8 + 91).toFixed(1)),
      decisionFunctionScore: parseFloat((Math.random() * 6 - 3).toFixed(2)),
      inferenceTime: parseFloat((Math.random() * 0.3 + 0.2).toFixed(2)),
    });
    setIsProcessing(false);
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col">
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm flex-shrink-0">
        <div className="px-8 py-4 flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#7B1113]" />
            <span className="text-sm font-bold text-slate-800 dark:text-slate-100 tracking-tight">NIR Maize Classifier</span>
          </div>
          <div className="h-4 w-px bg-slate-200 dark:bg-slate-700" />
          <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            Near-Infrared Spectroscopy / Protein Classification System
          </span>
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="flex flex-1 gap-5 p-6 w-full">
        <aside className="w-[30%] flex flex-col gap-4 flex-shrink-0">
          <SystemInputsCard
            modelFile={modelFile}
            dataFile={dataFile}
            onModelSelect={setModelFile}
            onDataSelect={setDataFile}
            isProcessing={isProcessing}
            canAnalyze={canAnalyze}
            onAnalyze={handleAnalyze}
          />
          {analysisResult && (
            <FinalVerdictCard
              result={analysisResult}
              modelFileName={modelFile?.name ?? '--'}
            />
          )}
        </aside>

        <main className="flex-1 flex flex-col gap-4 min-w-0">
          <SpectralPlot hasData={!!dataFile} />
          <div className="grid grid-cols-2 gap-4">
            {analysisResult && (
              <ConfidenceGauge
                confidence={analysisResult.confidence}
                isHighProtein={analysisResult.isHighProtein}
                decisionFunctionScore={analysisResult.decisionFunctionScore}
              />
            )}
            <MathBreakdown />
          </div>
        </main>
      </div>
    </div>
  );
}
