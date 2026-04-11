"""
main.py
-------
FastAPI application entry point for the NIR Protein Classifier API.

Run with:
    uvicorn main:app --reload --port 8000
"""

import time

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from inference import run_inference
from schemas import PredictionResponse

# ---------------------------------------------------------------------------
# App setup
# ---------------------------------------------------------------------------
app = FastAPI(title='NIR Protein Classifier API')

# Allow requests from the Next.js frontend running on localhost:3000
app.add_middleware(
    CORSMiddleware,
    allow_origins=['http://localhost:3000'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.get('/')
def root():
    """Health-check endpoint."""
    return {'message': 'NIR Protein Classifier API is running'}


@app.post('/predict', response_model=PredictionResponse)
async def predict(
    model_file: UploadFile = File(..., description='Trained model (.pkl or .keras)'),
    spectrum_file: UploadFile = File(..., description='Single-sample NIR spectrum (.csv)'),
):
    """
    Accepts a model file and a spectrum CSV file, runs inference, and returns
    the classification result with a confidence score.
    """

    # --- Validate file extensions ---
    if not (model_file.filename.endswith('.pkl') or model_file.filename.endswith('.keras')):
        raise HTTPException(
            status_code=400,
            detail='Invalid model file. Please upload a .pkl or .keras file.',
        )

    if not spectrum_file.filename.endswith('.csv'):
        raise HTTPException(
            status_code=400,
            detail='Invalid spectrum file. Please upload a .csv file.',
        )

    # --- Read uploaded file contents ---
    model_bytes = await model_file.read()
    csv_bytes = await spectrum_file.read()

    # --- Run inference and measure wall-clock time ---
    start = time.time()
    try:
        result = run_inference(model_bytes, model_file.filename, csv_bytes)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f'Inference failed: {str(e)}')

    # Overwrite the placeholder inferenceTime with the real elapsed time
    result['inferenceTime'] = round(time.time() - start, 3)

    return result
