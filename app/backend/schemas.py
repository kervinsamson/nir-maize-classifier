"""
schemas.py
----------
Pydantic response models for the NIR Protein Classifier API.
"""

from pydantic import BaseModel


class PredictionResponse(BaseModel):
    isHighProtein: bool          # True if confidence >= 0.5
    confidence: float            # 0.0 to 1.0
    confidencePercent: float     # 0.0 to 100.0
    decisionFunctionScore: float # Raw model score before sigmoid/clip
    inferenceTime: float         # Total inference time in seconds
    modelType: str               # 'PLS-DA', 'SVM', or '1D-CNN'
    modelFileName: str           # Original uploaded model filename
