"""
data_loader.py
--------------
Reusable data-loading functions for the NIR Maize Classifier project.

All four functions in this module are extracted directly from the logic in
01_data_loading.ipynb and 02_labeling.ipynb. They are imported by future
notebooks (03 onwards) and by the FastAPI backend.
"""

import os
import pandas as pd
import numpy as np


# The 700 spectral column names used consistently across the whole project.
SPECTRAL_COLS = [f'Wave_{i}' for i in range(1, 701)]

# The four chemical label columns present in the raw CSV.
LABEL_COLS = ['Moisture', 'Starch', 'Oil', 'Protein']


def load_raw_data(filepath):
    """
    Load the raw NIR corn dataset from a CSV file.

    The CSV is expected to have the following columns:
        - SampleID  : unique sample identifier
        - Wave_1 to Wave_700  : NIR absorbance values (700 wavelength channels)
        - Moisture, Starch, Oil, Protein  : chemical composition labels

    Parameters
    ----------
    filepath : str
        Path to the raw CSV file
        (e.g. 'data/raw/corn_mp5_regression_data.csv').

    Returns
    -------
    X : numpy.ndarray, shape (n_samples, 700)
        Matrix of NIR absorbance values — one row per sample.
    labels_df : pandas.DataFrame, shape (n_samples, 4)
        DataFrame containing only the four label columns
        (Moisture, Starch, Oil, Protein).
    sample_ids : list
        List of SampleID values (one entry per sample).
    """
    df = pd.read_csv(filepath)

    X          = df[SPECTRAL_COLS].to_numpy()          # shape: (n_samples, 700)
    labels_df  = df[LABEL_COLS]                        # shape: (n_samples, 4)
    sample_ids = df['SampleID'].tolist()

    print(f"Dataset loaded: {df.shape[0]} samples, {df.shape[1]} columns")
    print(f"X shape       : {X.shape}  (samples x wavelength channels)")
    print(f"labels_df shape: {labels_df.shape}  (samples x labels)")

    return X, labels_df, sample_ids


def assign_protein_labels(df, target_col='Protein'):
    """
    Assign binary protein class labels to the dataset using a median split.

    The median of `target_col` is used as the threshold:
        - Protein >= median  →  Protein_Label = 1  (High Protein)
        - Protein <  median  →  Protein_Label = 0  (Low Protein)

    This is the same threshold strategy used in 02_labeling.ipynb.
    Using the median guarantees a balanced (or near-balanced) class split,
    which is important for fair model training.

    Parameters
    ----------
    df : pandas.DataFrame
        The full dataframe loaded from the raw CSV.  Must contain
        the column specified by `target_col`.
    target_col : str, optional
        Name of the column to threshold on.  Default is 'Protein'.

    Returns
    -------
    df : pandas.DataFrame
        The same dataframe with a new 'Protein_Label' column added
        (1 = High Protein, 0 = Low Protein).
    median_val : float
        The median value of `target_col` that was used as the threshold.
    """
    median_val = df[target_col].median()

    # 1 = High Protein (>= median), 0 = Low Protein (< median)
    df['Protein_Label'] = (df[target_col] >= median_val).astype(int)

    n_high = (df['Protein_Label'] == 1).sum()
    n_low  = (df['Protein_Label'] == 0).sum()

    print(f"Median {target_col} value : {median_val:.4f}")
    print(f"Class distribution:")
    print(f"  High Protein (1) : {n_high} samples")
    print(f"  Low Protein  (0) : {n_low} samples")

    return df, median_val


def save_labeled_data(df, filepath):
    """
    Save the labeled dataframe to a CSV file.

    Creates the output directory if it does not already exist.

    Parameters
    ----------
    df : pandas.DataFrame
        The labeled dataframe to save.  Typically this is the dataframe
        returned by assign_protein_labels().
    filepath : str
        Destination path for the CSV file
        (e.g. 'data/processed/labeled.csv').

    Returns
    -------
    None
    """
    # Create the directory if it does not exist
    output_dir = os.path.dirname(filepath)
    if output_dir:
        os.makedirs(output_dir, exist_ok=True)

    df.to_csv(filepath, index=False)

    print(f"File saved successfully to : {filepath}")
    print(f"Shape of saved dataframe   : {df.shape}")


def load_sensai_data(filepath):
    """
    Load the Maize_sensAIfood_Protein_549_NIRS5000_CRAW.csv dataset and
    normalise it to the same format returned by load_raw_data(), so that
    all downstream notebooks (02 labeling, 03 SG preprocessing, etc.) work
    without further changes.

    Differences from corn_mp5_regression_data.csv that are handled here:
        - Spectral columns are named as wavelength integers (1100, 1102, …, 2498)
          rather than Wave_1 … Wave_700.  They are renamed to Wave_1 … Wave_700
          in order (both datasets cover the identical 1100–2498 nm range at 2 nm
          steps, 700 channels total).
        - The sample identifier column is 'ID' instead of 'SampleID'.
        - Only 'Moisture' and 'Protein' are present as label columns
          (no 'Starch' or 'Oil').  A dummy Starch=0 and Oil=0 column are added
          so that assign_protein_labels() and save_labeled_data() remain unchanged.
        - Metadata columns (Spectrometer, Cereal, Variety, Country, Year) are
          dropped silently.

    Parameters
    ----------
    filepath : str
        Path to the sensai CSV file
        (e.g. 'data/raw/Maize_sensAIfood_Protein_549_NIRS5000_CRAW.csv').

    Returns
    -------
    X : numpy.ndarray, shape (n_samples, 700)
        Matrix of NIR absorbance values — one row per sample.
    labels_df : pandas.DataFrame, shape (n_samples, 4)
        DataFrame with columns Moisture, Starch, Oil, Protein.
        Starch and Oil are set to 0 (not available in this dataset).
    sample_ids : list
        List of sample ID strings (one entry per sample).
    """
    df = pd.read_csv(filepath)

    # ── Identify the 700 spectral columns (integer wavelength names) ──────────
    raw_spectral_cols = [c for c in df.columns if str(c).lstrip('-').isdigit()]
    if len(raw_spectral_cols) != 700:
        raise ValueError(
            f"Expected 700 spectral columns, found {len(raw_spectral_cols)}. "
            f"Check that the file is the sensai NIR dataset."
        )

    # ── Rename wavelength columns → Wave_1 … Wave_700 ─────────────────────────
    rename_map = {old: new for old, new in zip(raw_spectral_cols, SPECTRAL_COLS)}
    df = df.rename(columns={'ID': 'SampleID', **rename_map})

    # ── Add missing label columns so downstream code stays unchanged ──────────
    if 'Starch' not in df.columns:
        df['Starch'] = 0.0
    if 'Oil' not in df.columns:
        df['Oil'] = 0.0

    # ── Extract the same three outputs as load_raw_data() ─────────────────────
    X          = df[SPECTRAL_COLS].to_numpy()
    labels_df  = df[LABEL_COLS]
    sample_ids = df['SampleID'].tolist()

    print(f"Sensai dataset loaded : {df.shape[0]} samples")
    print(f"X shape               : {X.shape}  (samples x wavelength channels)")
    print(f"labels_df shape       : {labels_df.shape}  (samples x labels)")

    return X, labels_df, sample_ids


def load_labeled_data(filepath):
    """
    Load the processed labeled dataset for use in downstream notebooks.

    Expects a CSV with columns:
        SampleID, Wave_1 … Wave_700, Moisture, Starch, Oil,
        Protein, Protein_Label

    This is the file produced by 02_labeling.ipynb (and save_labeled_data()).
    It is the starting point for notebooks 03 onwards and for the backend.

    Parameters
    ----------
    filepath : str
        Path to the labeled CSV file
        (e.g. 'data/processed/labeled.csv').

    Returns
    -------
    X : numpy.ndarray, shape (n_samples, 700)
        Matrix of NIR absorbance values — one row per sample.
    y : numpy.ndarray, shape (n_samples,)
        Binary protein labels  (1 = High Protein, 0 = Low Protein).
    sample_ids : list
        List of SampleID values (one entry per sample).
    """
    df = pd.read_csv(filepath)

    X          = df[SPECTRAL_COLS].to_numpy()       # shape: (n_samples, 700)
    y          = df['Protein_Label'].to_numpy()     # shape: (n_samples,)
    sample_ids = df['SampleID'].tolist()

    print(f"Labeled data loaded: {df.shape[0]} samples")
    print(f"X shape  : {X.shape}")
    print(f"y shape  : {y.shape}  —  classes: {sorted(set(y.tolist()))}")

    return X, y, sample_ids


# ---------------------------------------------------------------------------
# Quick usage example — run this file directly to test the functions:
#   python src/data_loader.py
# ---------------------------------------------------------------------------

if __name__ == '__main__':
    import os

    # Resolve paths relative to the project root (one level above src/)
    project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    raw_path     = os.path.join(project_root, 'data', 'raw',
                                'corn_mp5_regression_data.csv')

    print("=" * 60)
    print("Step 1: load_raw_data()")
    print("=" * 60)
    X, labels_df, sample_ids = load_raw_data(raw_path)
    print(f"First 3 sample IDs : {sample_ids[:3]}")
    print()

    # Reload the full dataframe so assign_protein_labels() can add a column
    df_raw = pd.read_csv(raw_path)

    print("=" * 60)
    print("Step 2: assign_protein_labels()")
    print("=" * 60)
    df_labeled, median_val = assign_protein_labels(df_raw)
    print(f"\nMedian used as threshold: {median_val:.4f}")
    print("First 5 rows of Protein_Label column:")
    print(df_labeled[['SampleID', 'Protein', 'Protein_Label']].head())
