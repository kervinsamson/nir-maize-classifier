'use client';

import { useState } from 'react';
import type { AnalysisResult, ModelDetectionResult, PredictionRecord } from './types';
import { ThemeToggle } from './components/ThemeToggle';
import { SystemInputsCard } from './components/SystemInputsCard';
import { FinalVerdictCard } from './components/FinalVerdictCard';
import { SpectralPlot } from './components/SpectralPlot';
import { ConfidenceCard } from './components/ConfidenceCard';
import { PredictionHistory } from './components/PredictionHistory';

export default function Home() {
  const [modelFile, setModelFile] = useState<File | null>(null);
  const [dataFile, setDataFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [modelDetection, setModelDetection] = useState<ModelDetectionResult | null>(null);
  const [spectrumData, setSpectrumData] = useState<number[] | null>(null);
  const [predictionHistory, setPredictionHistory] = useState<PredictionRecord[]>([]);

  const API_URL = 'http://localhost:8000';
  const canAnalyze = modelFile !== null && dataFile !== null && !isProcessing;

  const handleModelSelect = async (file: File) => {
    setModelFile(file);
    setModelDetection(null);

    try {
      const formData = new FormData();
      formData.append('model_file', file);

      const response = await fetch(`${API_URL}/detect`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const detection: ModelDetectionResult = await response.json();
        setModelDetection(detection);
      }
    } catch {
      // Detection failed silently — model info will just show placeholders
    }
  };

  const handleDataSelect = (file: File) => {
    setDataFile(file);
    setSpectrumData(null);
    setAnalysisResult(null);
    setError(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const values = text.trim().split(',').map(Number);
      if (values.length === 700) {
        setSpectrumData(values);
      }
    };
    reader.readAsText(file);
  };

  const handleAnalyze = async () => {
    if (!canAnalyze) return;
    setIsProcessing(true);
    setAnalysisResult(null);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('model_file', modelFile);
      formData.append('spectrum_file', dataFile);

      const response = await fetch(`${API_URL}/predict`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({ detail: 'Unknown error' }));
        setError(err.detail ?? 'Request failed');
        return;
      }

      const data = await response.json();
      setAnalysisResult({
        isHighProtein: data.isHighProtein,
        confidence: data.confidencePercent,
        decisionFunctionScore: data.decisionFunctionScore,
        inferenceTime: data.inferenceTime,
        modelType: data.modelType,
      });
      setPredictionHistory(prev => [...prev, {
        id: prev.length + 1,
        filename: dataFile?.name ?? 'unknown.csv',
        modelType: data.modelType,
        isHighProtein: data.isHighProtein,
        confidence: data.confidencePercent,
        inferenceTime: data.inferenceTime,
        timestamp: new Date().toLocaleTimeString(),
      }]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Network error');
    } finally {
      setIsProcessing(false);
    }
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
            onModelSelect={handleModelSelect}
            onDataSelect={handleDataSelect}
            isProcessing={isProcessing}
            canAnalyze={canAnalyze}
            onAnalyze={handleAnalyze}
            modelDetection={modelDetection}
          />
          {error && (
            <div className="rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 p-4 text-xs text-red-700 dark:text-red-400 font-medium">
              {error}
            </div>
          )}
          {analysisResult && (
            <FinalVerdictCard
              result={analysisResult}
              modelFileName={modelFile?.name ?? '--'}
            />
          )}
        </aside>

        <main className="flex-1 flex flex-col gap-4 min-w-0">
          <SpectralPlot hasData={!!dataFile} spectrumData={spectrumData} isHighProtein={analysisResult?.isHighProtein ?? null} />
          <div className="grid grid-cols-2 gap-4">
            <ConfidenceCard result={analysisResult} />
            <PredictionHistory records={predictionHistory} />
          </div>
        </main>
      </div>
    </div>
  );
}
