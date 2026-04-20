"""
extract_test_samples.py
-----------------------
Picks 10 random samples (5 high protein, 5 low protein) from labeled.csv,
saves them as individual web-app-ready CSVs (700 floats, no header), and
removes them from Maize_sensAIfood_Protein_549_NIRS5000_CRAW.csv so they
remain unseen during training.

Usage:
    python scripts/extract_test_samples.py [--seed SEED]

Outputs:
    data/raw/test_samples/<SampleID>_<label>.csv  -- one per sample (700 floats)
    data/raw/test_samples/manifest.csv            -- sample IDs, protein values, labels
    data/raw/Maize_sensAIfood_Protein_549_NIRS5000_CRAW.csv is overwritten in-place
      (original backed up as ...CRAW_backup.csv)
"""

import argparse
import os
import shutil

import numpy as np
import pandas as pd

# ---------------------------------------------------------------------------
# Paths (relative to project root)
# ---------------------------------------------------------------------------
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

LABELED_CSV    = os.path.join(PROJECT_ROOT, "data", "processed", "labeled.csv")
RAW_CSV        = os.path.join(PROJECT_ROOT, "data", "raw",
                               "Maize_sensAIfood_Protein_549_NIRS5000_CRAW.csv")
OUTPUT_DIR     = os.path.join(PROJECT_ROOT, "data", "raw", "test_samples")

WAVE_COLS      = [f"Wave_{i}" for i in range(1, 701)]   # 700 spectral features
N_PER_CLASS    = 5


def main(seed: int = 42) -> None:
    rng = np.random.default_rng(seed)

    # ------------------------------------------------------------------
    # 1. Load labeled data
    # ------------------------------------------------------------------
    print(f"Loading {LABELED_CSV} ...")
    labeled = pd.read_csv(LABELED_CSV)

    high = labeled[labeled["Protein_Label"] == 1]
    low  = labeled[labeled["Protein_Label"] == 0]

    print(f"  High-protein samples available : {len(high)}")
    print(f"  Low-protein  samples available : {len(low)}")

    if len(high) < N_PER_CLASS or len(low) < N_PER_CLASS:
        raise ValueError(
            f"Not enough samples: need {N_PER_CLASS} of each class, "
            f"found {len(high)} high / {len(low)} low."
        )

    # ------------------------------------------------------------------
    # 2. Random selection
    # ------------------------------------------------------------------
    selected_high = high.sample(n=N_PER_CLASS, random_state=int(rng.integers(0, 2**31)))
    selected_low  = low.sample(n=N_PER_CLASS,  random_state=int(rng.integers(0, 2**31)))
    selected      = pd.concat([selected_high, selected_low])

    print("\nSelected samples:")
    for _, row in selected.iterrows():
        label_str = "high_protein" if row["Protein_Label"] == 1 else "low_protein"
        print(f"  {row['SampleID']}  protein={row['Protein']:.3f}  label={label_str}")

    # ------------------------------------------------------------------
    # 3. Save individual CSVs (700 floats, no header) + manifest
    # ------------------------------------------------------------------
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    manifest_rows = []
    for _, row in selected.iterrows():
        label_str = "high_protein" if row["Protein_Label"] == 1 else "low_protein"
        filename  = f"{row['SampleID']}_{label_str}.csv"
        filepath  = os.path.join(OUTPUT_DIR, filename)

        spectrum = row[WAVE_COLS].values.astype(float)
        np.savetxt(filepath, spectrum.reshape(1, -1), delimiter=",", fmt="%.7f",
                   newline="\n", header="", comments="")

        manifest_rows.append({
            "SampleID"     : row["SampleID"],
            "Protein"      : row["Protein"],
            "Protein_Label": int(row["Protein_Label"]),
            "Label_Text"   : label_str,
            "Filename"     : filename,
        })
        print(f"  Saved → {filepath}")

    manifest_df = pd.DataFrame(manifest_rows)
    manifest_path = os.path.join(OUTPUT_DIR, "manifest.csv")
    manifest_df.to_csv(manifest_path, index=False)
    print(f"\nManifest saved → {manifest_path}")

    # ------------------------------------------------------------------
    # 4. Remove selected samples from the raw CSV
    # ------------------------------------------------------------------
    print(f"\nLoading {RAW_CSV} ...")
    raw = pd.read_csv(RAW_CSV)
    print(f"  Rows before removal: {len(raw)}")

    ids_to_remove = set(selected["SampleID"].tolist())

    # Back up the original file before modifying
    backup_path = RAW_CSV.replace(".csv", "_backup.csv")
    if not os.path.exists(backup_path):
        shutil.copy2(RAW_CSV, backup_path)
        print(f"  Backup saved → {backup_path}")
    else:
        print(f"  Backup already exists, skipping: {backup_path}")

    raw_filtered = raw[~raw["ID"].isin(ids_to_remove)]
    removed = len(raw) - len(raw_filtered)
    print(f"  Rows removed        : {removed}")
    print(f"  Rows after removal  : {len(raw_filtered)}")

    if removed != len(ids_to_remove):
        missing = ids_to_remove - set(raw["ID"].tolist())
        print(f"  WARNING: {len(missing)} sample(s) not found in raw CSV: {missing}")

    raw_filtered.to_csv(RAW_CSV, index=False)
    print(f"  Updated raw CSV saved → {RAW_CSV}")

    print("\nDone. Use the files in data/raw/test_samples/ to test the web app.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Extract unseen test samples.")
    parser.add_argument("--seed", type=int, default=42,
                        help="Random seed for reproducibility (default: 42)")
    args = parser.parse_args()
    main(seed=args.seed)
