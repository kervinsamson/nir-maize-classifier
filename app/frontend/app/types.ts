export interface AnalysisResult {
  isHighProtein: boolean;
  confidence: number;
  decisionFunctionScore: number;
  inferenceTime: number;
}
