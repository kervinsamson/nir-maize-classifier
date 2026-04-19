"""
split_sensai_samples.py
-----------------------
Splits Maize_sensAIfood_Protein_549_NIRS5000_CRAW.csv into individual
per-sample CSV files, one row per file, containing only the 700 spectral
values (no metadata, no header).

Filename format:
    {ID}_{protein_value}_{high_protein|low_protein}.csv
    e.g.  Maize_4_0001_8.303_high_protein.csv

Protein class is assigned via a median split on the Protein column,
matching the same strategy used for the original 80-sample dataset.

Output directory: data/raw/samples_sensai/
"""

import os
import pandas as pd

# ── Paths (resolved relative to this script's location) ───────────────────────
_HERE      = os.path.dirname(os.path.abspath(__file__))
_ROOT      = os.path.dirname(_HERE)
INPUT_CSV  = os.path.join(_ROOT, 'data', 'raw', 'Maize_sensAIfood_Protein_549_NIRS5000_CRAW.csv')
OUTPUT_DIR = os.path.join(_ROOT, 'data', 'raw', 'samples_sensai')

# ── Load ──────────────────────────────────────────────────────────────────────
df = pd.read_csv(INPUT_CSV)
print(f"Loaded: {df.shape[0]} samples, {df.shape[1]} columns")

# ── Identify spectral columns (all numeric column names) ──────────────────────
spectral_cols = [c for c in df.columns if str(c).lstrip('-').isdigit()]
print(f"Spectral columns: {len(spectral_cols)} ({spectral_cols[0]} — {spectral_cols[-1]})")

# ── Median split for protein class label ──────────────────────────────────────
median_protein = df['Protein'].median()
print(f"Median protein   : {median_protein:.4f}")

df['Protein_Label'] = (df['Protein'] >= median_protein).astype(int)
n_high = (df['Protein_Label'] == 1).sum()
n_low  = (df['Protein_Label'] == 0).sum()
print(f"High Protein (>= median) : {n_high} samples")
print(f"Low Protein  (<  median) : {n_low} samples")

# ── Output directory ──────────────────────────────────────────────────────────
os.makedirs(OUTPUT_DIR, exist_ok=True)

# ── Split and save ────────────────────────────────────────────────────────────
for _, row in df.iterrows():
    sample_id     = row['ID']
    protein_val   = row['Protein']
    protein_class = 'high_protein' if row['Protein_Label'] == 1 else 'low_protein'

    # Spectral values only — no metadata, no header, matching existing sample format
    spectral_values = row[spectral_cols].values.reshape(1, -1)
    sample_df = pd.DataFrame(spectral_values, columns=spectral_cols)

    filename     = f"{sample_id}_{protein_val}_{protein_class}.csv"
    output_path  = os.path.join(OUTPUT_DIR, filename)
    sample_df.to_csv(output_path, index=False, header=False)

print(f"\nDone. {len(df)} sample files saved to {OUTPUT_DIR}/")
