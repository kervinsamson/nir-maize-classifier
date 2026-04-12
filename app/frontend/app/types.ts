export interface AnalysisResult {
  isHighProtein: boolean;
  confidence: number;        // 0–100 (maps to confidencePercent from backend)
  decisionFunctionScore: number;
  inferenceTime: number;
  modelType: string;
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
