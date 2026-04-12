export interface AnalysisResult {
  isHighProtein: boolean;
  confidence: number;        // 0–100 (maps to confidencePercent from backend)
  decisionFunctionScore: number;
  inferenceTime: number;
  modelType: string;
}

export interface PredictionRecord {
  id: number;
  filename: string;
  modelType: string;
  isHighProtein: boolean;
  confidence: number;
  inferenceTime: number;
  timestamp: string;
}

export interface ModelDetectionResult {
  modelType: string;
  hasScaler: boolean;
  algorithm: string;
  kernel: string;
  preprocessing: string;
  trainingSamples: string;
  augmentation: string;
  cvStrategy: string;
}
