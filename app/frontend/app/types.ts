export interface AnalysisResult {
  isHighProtein: boolean;
  confidence: number;        // 0–100 (maps to confidencePercent from backend)
  decisionFunctionScore: number;
  inferenceTime: number;
  modelType: string;
}
