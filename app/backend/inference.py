"""
inference.py
------------
Core inference logic for the NIR Protein Classifier.

This module handles:
  1. Parsing the uploaded CSV spectrum (700 float values, no header)
  2. Applying Savitzky-Golay smoothing via src/preprocessor.py
  3. Loading the uploaded model (.keras for 1D-CNN, .pkl for PLS-DA/SVM)
  4. Generating a prediction and confidence score
  5. Returning a result dictionary compatible with PredictionResponse
"""

import io
import os
import sys
import tempfile

import joblib
import numpy as np

# ---------------------------------------------------------------------------
# Allow Python to find src/ which is two levels up from app/backend/
# ---------------------------------------------------------------------------
_BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))   # app/backend/
_PROJECT_ROOT = os.path.join(_BACKEND_DIR, '..', '..')       # project root
sys.path.append(os.path.normpath(_PROJECT_ROOT))

from src.preprocessor import apply_savitzky_golay  # noqa: E402


def run_inference(model_bytes: bytes, model_filename: str, csv_bytes: bytes) -> dict:
    """
    Run end-to-end inference on a single NIR spectrum.

    Parameters
    ----------
    model_bytes : bytes
        Raw bytes of the uploaded model file (.keras or .pkl).
    model_filename : str
        Original filename of the uploaded model (used to detect model type).
    csv_bytes : bytes
        Raw bytes of the uploaded spectrum CSV file.
        Expected format: one row of 700 comma-separated floats, NO header.

    Returns
    -------
    dict
        Keys match PredictionResponse fields (except inferenceTime, which is
        injected by main.py after this function returns).
    """

    # ------------------------------------------------------------------
    # 1. Parse the CSV into a (1, 700) numpy array
    # ------------------------------------------------------------------
    csv_text = csv_bytes.decode('utf-8')
    spectrum = np.loadtxt(io.StringIO(csv_text), delimiter=',')

    # Flatten in case loadtxt returns a 2-D array for a single-row file
    spectrum = spectrum.flatten()

    if spectrum.shape[0] != 700:
        raise ValueError(
            f'Expected exactly 700 spectral values but got {spectrum.shape[0]}. '
            'Please upload a CSV with one row of 700 comma-separated floats.'
        )

    # Reshape to (1, 700) — one sample, 700 wavelength channels
    X = spectrum.reshape(1, 700)

    # ------------------------------------------------------------------
    # 2. Apply Savitzky-Golay smoothing
    # ------------------------------------------------------------------
    X_smoothed = apply_savitzky_golay(X, window_length=11, polyorder=2, deriv=0)

    # ------------------------------------------------------------------
    # 3. Load the model and detect its type
    # ------------------------------------------------------------------
    if model_filename.endswith('.keras'):
        # --- 1D-CNN (TensorFlow/Keras) ---
        from tensorflow.keras.models import load_model  # type: ignore

        # Keras needs a file path, not in-memory bytes, so we use a temp file
        with tempfile.NamedTemporaryFile(suffix='.keras', delete=False) as tmp:
            tmp.write(model_bytes)
            tmp_path = tmp.name

        try:
            model = load_model(tmp_path)
        finally:
            # Always clean up the temporary file
            os.unlink(tmp_path)

        model_type = '1D-CNN'
        is_svm = False

    elif model_filename.endswith('.pkl'):
        # --- PLS-DA or SVM (scikit-learn) ---
        bundle = joblib.load(io.BytesIO(model_bytes))
        if not isinstance(bundle, dict) or 'model_type' not in bundle:
            raise ValueError(
                'Invalid .pkl file. Please upload a model saved by this system.'
            )

    else:
        raise ValueError(
            'Unsupported model format. Please upload a .keras or .pkl file.'
        )

    # ------------------------------------------------------------------
    # 4. Extract model, scaler, and model_type from the bundle
    # ------------------------------------------------------------------
    model = bundle['model']
    scaler = bundle['scaler']
    model_type = bundle['model_type']

    # ------------------------------------------------------------------
    # 5a. Prepare input based on model type
    # ------------------------------------------------------------------
    if model_type == 'SVM':
        if scaler is None:
            raise ValueError('SVM model bundle is missing its scaler.')
        X_input = scaler.transform(X_smoothed)

    elif model_type == 'PLS-DA':
        X_input = X_smoothed

    elif model_type == '1D-CNN':
        X_input = X_smoothed.reshape(1, 700, 1)

    else:
        raise ValueError(f'Unknown model type: {model_type}')

    # ------------------------------------------------------------------
    # 5b. Generate prediction and confidence score
    # ------------------------------------------------------------------
    if model_type == 'PLS-DA':
        raw = float(model.predict(X_input)[0][0])
        confidence = float(np.clip(raw, 0.0, 1.0))
        decision_score = raw

    elif model_type == 'SVM':
        decision_score = float(model.decision_function(X_input)[0])
        # Convert SVM raw margin to a probability-like score via sigmoid
        confidence = float(1 / (1 + np.exp(-decision_score)))

    else:  # 1D-CNN
        confidence = float(model.predict(X_input, verbose=0)[0][0])
        decision_score = confidence

    # ------------------------------------------------------------------
    # 6. Build and return the result dictionary
    # ------------------------------------------------------------------
    return {
        'isHighProtein': confidence >= 0.5,
        'confidence': confidence,
        'confidencePercent': round(confidence * 100, 2),
        'decisionFunctionScore': round(decision_score, 4),
        'inferenceTime': 0.0,   # placeholder — main.py overwrites this
        'modelType': model_type,
        'modelFileName': model_filename,
    }
