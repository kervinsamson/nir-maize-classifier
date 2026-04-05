"""
augmentor.py
------------
Reusable data-splitting and augmentation functions for the NIR Maize
Classifier project.

Contains utilities for stratified train/test splitting, linear-interpolation
augmentation (based on Li et al., 2025 — the SpecTran paper), saving
augmented data, and visualising results.  These functions are imported by
notebook 04_augmentation.ipynb.

Methodological note
-------------------
The SpecTran paper augmented all 80 samples BEFORE splitting, which creates
data leakage because synthetic samples derived from test-set spectra end up
in the training set.  This module corrects that by always splitting FIRST and
augmenting ONLY the training set.
"""

import os

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import seaborn as sns
from sklearn.model_selection import train_test_split


# Wavelength axis shared across all projects in this codebase.
# The Eigenvector corn dataset spans 1100–2498 nm at 2 nm intervals → 700 pts.
WAVELENGTHS = np.linspace(1100, 2498, 700)


# ---------------------------------------------------------------------------
# 1. Splitting
# ---------------------------------------------------------------------------

def split_data(X, y, test_size=0.2, random_state=42):
    """
    Perform a stratified train/test split on NIR spectral data.

    Stratification ensures that the ratio of High-Protein (1) to Low-Protein
    (0) samples is preserved in both the training and test sets, which is
    important when working with small, class-balanced datasets.

    Parameters
    ----------
    X : numpy.ndarray, shape (n_samples, n_wavelengths)
        NIR absorbance matrix — one row per sample.
    y : numpy.ndarray, shape (n_samples,)
        Binary protein labels (1 = High Protein, 0 = Low Protein).
    test_size : float, optional
        Proportion of the dataset to include in the test split.  Default
        is 0.2 (20 % test, 80 % train).
    random_state : int, optional
        Random seed for reproducibility.  Default is 42.

    Returns
    -------
    X_train : numpy.ndarray
        Training spectra.
    X_test : numpy.ndarray
        Test spectra (held-out; never augmented).
    y_train : numpy.ndarray
        Training labels.
    y_test : numpy.ndarray
        Test labels (held-out; never augmented).
    """
    X_train, X_test, y_train, y_test = train_test_split(
        X, y,
        test_size=test_size,
        stratify=y,
        random_state=random_state,
    )

    print("=" * 50)
    print("Train/Test Split Results")
    print("=" * 50)
    print(f"X_train shape : {X_train.shape}")
    print(f"X_test  shape : {X_test.shape}")
    print(f"y_train shape : {y_train.shape}")
    print(f"y_test  shape : {y_test.shape}")

    print("\nClass distribution — Training set:")
    unique, counts = np.unique(y_train, return_counts=True)
    for label, count in zip(unique, counts):
        label_name = "High Protein" if label == 1 else "Low Protein"
        print(f"  {label} ({label_name}): {count} samples")

    print("\nClass distribution — Test set:")
    unique, counts = np.unique(y_test, return_counts=True)
    for label, count in zip(unique, counts):
        label_name = "High Protein" if label == 1 else "Low Protein"
        print(f"  {label} ({label_name}): {count} samples")

    return X_train, X_test, y_train, y_test


# ---------------------------------------------------------------------------
# 2. Augmentation
# ---------------------------------------------------------------------------

def interpolation_augment(X_train, y_train, target_total=2000,
                           noise_level=0.01, random_state=42):
    """
    Augment the training set using linear interpolation between pairs of
    existing samples, then add slight Gaussian noise for diversity.

    This method is adapted from the SpecTran paper (Li et al., 2025).
    For each synthetic sample, two distinct original training spectra are
    randomly selected and linearly combined using a weight alpha drawn
    uniformly from (0.1, 0.9).  The same weight is applied to their labels,
    which are then rounded to 0 or 1 because the task is binary
    classification.  A small amount of Gaussian noise is added to each
    synthetic spectrum so no two synthetic samples are identical.

    IMPORTANT: This function must be called ONLY on the training set.
    The test set must never be augmented under any circumstances.

    Parameters
    ----------
    X_train : numpy.ndarray, shape (n_train, n_wavelengths)
        Original training spectra after the train/test split.
    y_train : numpy.ndarray, shape (n_train,)
        Original training labels (binary: 0 or 1).
    target_total : int, optional
        Desired total number of training samples after augmentation
        (original + synthetic).  Default is 2000 to match the SpecTran
        paper for comparability.
    noise_level : float, optional
        Standard deviation of the Gaussian noise added to each synthetic
        spectrum.  Default is 0.01.
    random_state : int, optional
        Random seed for reproducibility.  Default is 42.

    Returns
    -------
    X_train_augmented : numpy.ndarray, shape (target_total, n_wavelengths)
        Combined array of original and synthetic training spectra, shuffled.
    y_train_augmented : numpy.ndarray, shape (target_total,)
        Corresponding labels for the augmented training set, shuffled.
    """
    np.random.seed(random_state)

    n_train = len(X_train)
    n_synthetic = target_total - n_train

    print("=" * 50)
    print("Interpolation Augmentation")
    print("=" * 50)
    print(f"Original training size          : {n_train}")
    print(f"Synthetic samples to generate   : {n_synthetic}")

    X_synthetic = np.zeros((n_synthetic, X_train.shape[1]))
    y_synthetic = np.zeros(n_synthetic, dtype=int)

    for i in range(n_synthetic):
        # Pick two DISTINCT original samples
        idx_i, idx_j = np.random.choice(n_train, 2, replace=False)
        x_i, x_j = X_train[idx_i], X_train[idx_j]
        y_i, y_j = y_train[idx_i], y_train[idx_j]

        # Interpolation weight strictly between 0.1 and 0.9
        alpha = np.random.uniform(0.1, 0.9)

        # Linear interpolation of spectrum
        x_new = alpha * x_i + (1 - alpha) * x_j

        # Linear interpolation of label, rounded to nearest integer (0 or 1)
        y_new = int(round(alpha * float(y_i) + (1 - alpha) * float(y_j)))

        # Add slight Gaussian noise for diversity
        x_new += np.random.normal(0, noise_level, size=x_new.shape)

        X_synthetic[i] = x_new
        y_synthetic[i] = y_new

    # Combine originals with synthetic samples
    X_combined = np.vstack([X_train, X_synthetic])
    y_combined = np.concatenate([y_train, y_synthetic])

    # Shuffle the combined dataset
    shuffle_idx = np.random.permutation(len(X_combined))
    X_train_augmented = X_combined[shuffle_idx]
    y_train_augmented = y_combined[shuffle_idx]

    print(f"Final training size after augmentation : {len(X_train_augmented)}")
    print("\nClass distribution after augmentation:")
    unique, counts = np.unique(y_train_augmented, return_counts=True)
    for label, count in zip(unique, counts):
        label_name = "High Protein" if label == 1 else "Low Protein"
        print(f"  {label} ({label_name}): {count} samples")

    return X_train_augmented, y_train_augmented


# ---------------------------------------------------------------------------
# 3. Saving
# ---------------------------------------------------------------------------

def save_augmented_csv(X_train_augmented, y_train_augmented,
                       filepath='data/processed/combined_augmented.csv'):
    """
    Save the augmented training dataset to a CSV file for transparency and
    documentation purposes.

    Each row represents one training sample (original or synthetic).  The
    first 700 columns are wavelength-channel absorbance values named
    Wave_1 through Wave_700.  The final column is the binary protein label.

    Parameters
    ----------
    X_train_augmented : numpy.ndarray, shape (n_samples, 700)
        Augmented training spectra (original + synthetic combined).
    y_train_augmented : numpy.ndarray, shape (n_samples,)
        Corresponding binary protein labels (0 = Low, 1 = High).
    filepath : str, optional
        Destination path for the CSV file.  Parent directories are created
        automatically if they do not exist.
        Default is 'data/processed/combined_augmented.csv'.

    Returns
    -------
    None
    """
    # Build column names: Wave_1, Wave_2, ..., Wave_700
    n_wavelengths = X_train_augmented.shape[1]
    wave_columns = [f"Wave_{i + 1}" for i in range(n_wavelengths)]

    df = pd.DataFrame(X_train_augmented, columns=wave_columns)
    df['Protein_Label'] = y_train_augmented.astype(int)

    # Ensure the output directory exists
    os.makedirs(os.path.dirname(filepath), exist_ok=True)

    df.to_csv(filepath, index=False)

    print(f"Augmented CSV saved to   : {filepath}")
    print(f"Saved DataFrame shape    : {df.shape}")


# ---------------------------------------------------------------------------
# 4. Visualisation
# ---------------------------------------------------------------------------

def plot_augmentation_distribution(y_train_original, y_train_augmented):
    """
    Plot side-by-side bar charts comparing the class distribution of the
    training set before and after augmentation.

    This confirms that interpolation augmentation preserves the original
    class balance (or improves it) rather than introducing class skew.

    Parameters
    ----------
    y_train_original : numpy.ndarray, shape (n_original,)
        Class labels of the original (pre-augmentation) training set.
    y_train_augmented : numpy.ndarray, shape (n_augmented,)
        Class labels of the augmented training set.

    Returns
    -------
    None
    """
    fig, axes = plt.subplots(1, 2, figsize=(12, 5))

    label_names = {0: 'Low Protein', 1: 'High Protein'}
    palette = {0: '#4C72B0', 1: '#DD8452'}

    for ax, y_data, title in zip(
        axes,
        [y_train_original, y_train_augmented],
        ['Before Augmentation', 'After Augmentation'],
    ):
        unique, counts = np.unique(y_data, return_counts=True)
        labels = [label_names[u] for u in unique]

        plot_df = pd.DataFrame({'Label': labels, 'Count': counts,
                                'Code': unique})
        sns.barplot(data=plot_df, x='Label', y='Count',
                    hue='Label',
                    palette=[palette[c] for c in plot_df['Code']],
                    ax=ax, legend=False)

        ax.set_title(title, fontsize=13)
        ax.set_xlabel('Protein Class', fontsize=11)
        ax.set_ylabel('Number of Samples', fontsize=11)

        for bar, count in zip(ax.patches, counts):
            ax.text(
                bar.get_x() + bar.get_width() / 2,
                bar.get_height() + max(counts) * 0.01,
                str(count),
                ha='center', va='bottom', fontsize=11,
            )

    fig.suptitle('Class Distribution Before and After Augmentation',
                 fontsize=14, fontweight='bold')
    plt.tight_layout()
    plt.show()


def plot_augmented_spectra(X_train_original, X_train_augmented,
                           y_train_augmented):
    """
    Plot two side-by-side line charts comparing the original training spectra
    with the full augmented training spectra, coloured by protein class.

    This visual check confirms that synthetic spectra follow the same
    spectral distribution as the originals — referred to as distribution
    fidelity in the SpecTran paper.

    Parameters
    ----------
    X_train_original : numpy.ndarray, shape (n_original, 700)
        Original training spectra before augmentation.
    X_train_augmented : numpy.ndarray, shape (n_augmented, 700)
        Augmented training spectra (original + synthetic, shuffled).
    y_train_augmented : numpy.ndarray, shape (n_augmented,)
        Labels for the augmented training set (used for colouring).

    Returns
    -------
    None
    """
    fig, axes = plt.subplots(1, 2, figsize=(16, 5))

    color_map = {1: 'red', 0: 'blue'}
    label_map = {1: 'High Protein', 0: 'Low Protein'}

    # ---- Left: original training spectra ----
    ax = axes[0]
    # Reconstruct original labels (stored in augmented set for the first
    # n_original rows before shuffling — here we infer from augmented set
    # to keep the function signature simple; we just use X_train_original
    # without per-sample colour since y_train_original is not passed in).
    # We instead colour by the majority to show both classes.
    plotted_labels = set()
    # We don't have y_train_original in scope here, so we read from the
    # augmented set only to colour the augmented panel.  For the original
    # panel we show all spectra in a neutral colour with a note.
    for spectrum in X_train_original:
        ax.plot(WAVELENGTHS, spectrum, color='steelblue', alpha=0.3,
                linewidth=0.8)
    ax.plot([], [], color='steelblue', linewidth=1.5, label='Training samples')
    ax.set_title(f'Original Training Spectra ({len(X_train_original)} samples)',
                 fontsize=12)
    ax.set_xlabel('Wavelength (nm)', fontsize=11)
    ax.set_ylabel('Absorbance', fontsize=11)
    ax.legend(fontsize=10)

    # ---- Right: augmented training spectra ----
    ax = axes[1]
    for spectrum, label in zip(X_train_augmented, y_train_augmented):
        color = color_map[int(label)]
        ax.plot(WAVELENGTHS, spectrum, color=color, alpha=0.1, linewidth=0.5)

    # Legend handles
    for code, lname in label_map.items():
        ax.plot([], [], color=color_map[code], linewidth=1.5, label=lname)
    ax.set_title(
        f'Augmented Training Spectra ({len(X_train_augmented)} samples)',
        fontsize=12,
    )
    ax.set_xlabel('Wavelength (nm)', fontsize=11)
    ax.set_ylabel('Absorbance', fontsize=11)
    ax.legend(fontsize=10)

    plt.suptitle('NIR Spectra: Original vs. Augmented Training Set',
                 fontsize=14, fontweight='bold')
    plt.tight_layout()
    plt.show()


# ---------------------------------------------------------------------------
# Usage example
# ---------------------------------------------------------------------------

if __name__ == '__main__':
    # Load preprocessed data produced by notebook 03
    X = np.load('../data/processed/X_preprocessed.npy')
    y = np.load('../data/processed/y_labels.npy')

    # Step 1 — Split first to avoid data leakage
    X_train, X_test, y_train, y_test = split_data(X, y,
                                                   test_size=0.2,
                                                   random_state=42)

    # Step 2 — Augment ONLY the training set
    X_train_aug, y_train_aug = interpolation_augment(
        X_train, y_train, target_total=2000, noise_level=0.01,
        random_state=42,
    )

    # Step 3 — Save the augmented training set as CSV
    save_augmented_csv(
        X_train_aug, y_train_aug,
        filepath='../data/processed/combined_augmented.csv',
    )
