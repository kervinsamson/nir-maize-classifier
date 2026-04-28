"""
preprocessor.py
---------------
Reusable preprocessing functions for the NIR Maize Classifier project.

Contains Savitzky-Golay smoothing and visualization utilities that are
imported by notebook 03_sg_preprocessing.ipynb and any downstream step
that needs clean spectral data.
"""

import numpy as np
import matplotlib.pyplot as plt
from scipy.signal import savgol_filter


# Wavelength axis used consistently across all spectral plots in this project.
# The Eigenvector corn dataset covers 1100–2498 nm at 2 nm intervals → 700 points.
WAVELENGTHS = np.linspace(1100, 2498, 700)


def apply_savitzky_golay(X, window_length=11, polyorder=2, deriv=0):
    """
    Apply Savitzky-Golay smoothing to each NIR spectrum in X.

    Savitzky-Golay filtering fits a low-degree polynomial to a sliding
    window of points and replaces the centre point with the polynomial
    value.  This removes high-frequency noise while preserving peak
    shapes better than a simple moving average.

    Parameters
    ----------
    X : numpy.ndarray, shape (n_samples, 700)
        Raw NIR absorbance matrix — one row per sample, one column per
        wavelength channel.
    window_length : int, optional
        Number of data points in the sliding window.  Must be a positive
        odd integer greater than polyorder.  Default is 11.
    polyorder : int, optional
        Degree of the polynomial used to fit the window.  A value of 2
        preserves peak curvature well.  Default is 2.
    deriv : int, optional
        Order of the derivative to compute.  0 means pure smoothing
        with no differentiation.  Default is 0.

    Returns
    -------
    X_smoothed : numpy.ndarray, shape (n_samples, 700)
        Smoothed NIR absorbance matrix with the same shape as X.
    """
    print("Applying Savitzky-Golay smoothing with the following parameters:")
    print(f"  window_length : {window_length}")
    print(f"  polyorder     : {polyorder}")
    print(f"  deriv         : {deriv}")

    # Apply the filter row-by-row along axis=1 (across wavelength channels)
    X_smoothed = savgol_filter(X, window_length=window_length,
                               polyorder=polyorder, deriv=deriv, axis=1)

    print(f"Smoothing complete. Output shape: {X_smoothed.shape}")
    return X_smoothed


def plot_preprocessing_comparison(X_raw, X_smoothed, sample_idx=0):
    """
    Plot a single raw spectrum alongside its Savitzky-Golay smoothed version.

    Both curves are drawn on the same axes so the noise-reduction effect
    of the filter can be seen clearly.

    Parameters
    ----------
    X_raw : numpy.ndarray, shape (n_samples, 700)
        Raw NIR absorbance matrix before smoothing.
    X_smoothed : numpy.ndarray, shape (n_samples, 700)
        Smoothed NIR absorbance matrix returned by apply_savitzky_golay().
    sample_idx : int, optional
        Row index of the sample to plot.  Default is 0 (first sample).

    Returns
    -------
    None
        Displays the plot inline (or in the active matplotlib backend).
    """
    fig, axes = plt.subplots(2, 1, figsize=(10, 7), sharex=True)

    # Top panel: raw vs smoothed
    ax = axes[0]
    ax.plot(WAVELENGTHS, X_raw[sample_idx],
            color='dimgray', linewidth=1.2, alpha=0.8, label='Raw Spectrum')
    ax.plot(WAVELENGTHS, X_smoothed[sample_idx],
            color='steelblue', linewidth=1.5, label='SG Smoothed')
    ax.set_title(f'Savitzky-Golay Preprocessing — Sample {sample_idx}',
                 fontsize=13)
    ax.set_ylabel('Absorbance', fontsize=11)
    ax.legend(fontsize=10)

    # Bottom panel: residual (noise removed)
    residual = X_raw[sample_idx] - X_smoothed[sample_idx]
    axes[1].plot(WAVELENGTHS, residual, color='tomato', linewidth=1.0)
    axes[1].axhline(0, color='black', linewidth=0.8, linestyle='--')
    axes[1].set_title('Residual (Raw − Smoothed)', fontsize=11)
    axes[1].set_xlabel('Wavelength (nm)', fontsize=11)
    axes[1].set_ylabel('Difference', fontsize=11)

    plt.tight_layout()
    plt.show()


def plot_all_preprocessed_spectra(X_smoothed, y,
                                   title='Preprocessed NIR Spectra by Protein Label'):
    """
    Plot all smoothed NIR spectra coloured by binary protein label.

    High-Protein samples (label = 1) are drawn in red and Low-Protein
    samples (label = 0) are drawn in blue, both at low opacity so
    overlapping curves remain readable.

    Parameters
    ----------
    X_smoothed : numpy.ndarray, shape (n_samples, 700)
        Smoothed NIR absorbance matrix returned by apply_savitzky_golay().
    y : numpy.ndarray, shape (n_samples,)
        Binary protein labels  (1 = High Protein, 0 = Low Protein).
    title : str, optional
        Title to display above the plot.
        Default is 'Preprocessed NIR Spectra by Protein Label'.

    Returns
    -------
    None
        Displays the plot inline (or in the active matplotlib backend).
    """
    fig, ax = plt.subplots(figsize=(12, 5))

    # Colour mapping: 1 → red (High Protein), 0 → blue (Low Protein)
    colour_map = {1: 'red', 0: 'blue'}
    plotted_labels = set()

    for i in range(len(X_smoothed)):
        label = int(y[i])
        colour = colour_map[label]

        # Only add a legend entry the first time each class appears
        if label not in plotted_labels:
            legend_label = 'High Protein (1)' if label == 1 else 'Low Protein (0)'
            ax.plot(WAVELENGTHS, X_smoothed[i],
                    color=colour, alpha=0.3, linewidth=0.8,
                    label=legend_label)
            plotted_labels.add(label)
        else:
            ax.plot(WAVELENGTHS, X_smoothed[i],
                    color=colour, alpha=0.3, linewidth=0.8)

    ax.set_title(title, fontsize=13)
    ax.set_xlabel('Wavelength (nm)', fontsize=11)
    ax.set_ylabel('Absorbance', fontsize=11)
    ax.legend(fontsize=10)

    plt.tight_layout()
    plt.show()


# ---------------------------------------------------------------------------
# Quick usage example — run this file directly to test the functions:
#   python src/preprocessor.py
# ---------------------------------------------------------------------------

if __name__ == '__main__':
    import os
    import sys

    # Allow running from the project root or from inside src/
    project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    sys.path.insert(0, project_root)

    from src.data_loader import load_labeled_data

    labeled_path = os.path.join(project_root, 'data', 'processed', 'labeled.csv')

    print("=" * 60)
    print("Loading labeled dataset ...")
    X, y, sample_ids = load_labeled_data(labeled_path)

    print("\nApplying Savitzky-Golay smoothing ...")
    X_smoothed = apply_savitzky_golay(X, window_length=11, polyorder=2, deriv=0)

    print("\nPlotting comparison for sample 0 ...")
    plot_preprocessing_comparison(X, X_smoothed, sample_idx=0)

    print("\nPlotting all preprocessed spectra ...")
    plot_all_preprocessed_spectra(X_smoothed, y)

    print("\nDone.")
