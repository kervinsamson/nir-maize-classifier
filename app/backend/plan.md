User uploads unknown .csv spectrum
    ↓
backend/inference.py loads the raw spectrum
    ↓
Applies SG smoothing (window=11, polyorder=2, deriv=0)
    ↓
Feeds preprocessed spectrum into loaded model
    ↓
Returns prediction (High Protein / Low Protein) + confidence score