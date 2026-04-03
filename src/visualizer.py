"""
visualizer.py
-------------
Reusable plotting functions for the NIR Maize Classifier project.

All plots in this module are extracted directly from the visualisation cells
in 01_data_loading.ipynb and 02_labeling.ipynb. They are imported by future
notebooks (03 onwards) and by the FastAPI backend as needed.
"""

import numpy as np
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import seaborn as sns


def plot_protein_distribution(protein, median_val):
    """
    Plot a histogram with KDE of the protein column.

    A vertical dashed red line is drawn at the median value.
    This visualisation mirrors the distribution plot in 02_labeling.ipynb
    (Section 5) and shows how the median threshold divides the samples into
    High Protein and Low Protein groups.

    Parameters
    ----------
    protein : pandas.Series or array-like
        The protein values for all samples.
    median_val : float
        The median protein value to draw as the threshold line.

    Returns
    -------
    None
        Displays the plot immediately via plt.show().
    """
    fig, ax = plt.subplots(figsize=(9, 5))

    sns.histplot(
        protein,
        bins=15,
        kde=True,
        color='steelblue',
        edgecolor='white',
        ax=ax
    )

    ax.axvline(
        median_val,
        color='red',
        linestyle='--',
        linewidth=2.0,
        label=f'Median = {median_val:.3f} %'
    )

    ax.set_title('Protein Content Distribution with High/Low Labels')
    ax.set_xlabel('Protein Content (%)')
    ax.set_ylabel('Count')
    ax.legend()

    plt.tight_layout()
    plt.show()


def plot_spectra(X, title='NIR Spectra', alpha=0.3, color='steelblue'):
    """
    Plot all NIR spectra in X on a single figure.

    The wavelength axis is always 700 evenly-spaced points from 1100 nm to
    2498 nm (np.linspace), matching the Foss NIR Systems 6500 instrument used
    to collect this dataset.  This mirrors the raw spectra plot in
    01_data_loading.ipynb (Section 5).

    Parameters
    ----------
    X : numpy.ndarray, shape (n_samples, 700)
        Matrix of NIR absorbance values — one row per sample.
    title : str, optional
        Title displayed above the plot.  Default is 'NIR Spectra'.
    alpha : float, optional
        Transparency of each spectrum line (0 = fully transparent,
        1 = fully opaque).  Default is 0.3.
    color : str, optional
        Colour of all spectrum lines.  Default is 'steelblue'.

    Returns
    -------
    None
        Displays the plot immediately via plt.show().
    """
    # 700 wavelength points spanning 1100 nm to 2498 nm
    wavelengths = np.linspace(1100, 2498, 700)

    fig, ax = plt.subplots(figsize=(11, 5))

    for spectrum in X:
        ax.plot(wavelengths, spectrum, color=color, alpha=alpha, linewidth=0.8)

    ax.set_title(title)
    ax.set_xlabel('Wavelength (nm)')
    ax.set_ylabel('Absorbance')

    plt.tight_layout()
    plt.show()


def plot_spectra_by_label(X, y, title='NIR Spectra by Protein Label'):
    """
    Plot all NIR spectra colored by binary protein label.

    Each spectrum is drawn in red if it belongs to the High Protein class (1)
    or blue if it belongs to the Low Protein class (0).  A legend identifies
    both classes.  This mirrors the labeled spectra plot in 02_labeling.ipynb
    (Section 6).

    Parameters
    ----------
    X : numpy.ndarray, shape (n_samples, 700)
        Matrix of NIR absorbance values — one row per sample.
    y : array-like, shape (n_samples,)
        Binary protein labels (1 = High Protein, 0 = Low Protein).
    title : str, optional
        Title displayed above the plot.
        Default is 'NIR Spectra by Protein Label'.

    Returns
    -------
    None
        Displays the plot immediately via plt.show().
    """
    # 700 wavelength points spanning 1100 nm to 2498 nm
    wavelengths = np.linspace(1100, 2498, 700)

    y = np.asarray(y)   # ensure numpy array for boolean indexing

    fig, ax = plt.subplots(figsize=(11, 5))

    for spectrum, label in zip(X, y):
        color = 'red' if label == 1 else 'blue'
        ax.plot(wavelengths, spectrum, color=color, alpha=0.3, linewidth=0.8)

    # Build a legend manually so both classes are always shown
    high_patch = mpatches.Patch(color='red',  label=f'High Protein (1)  n={(y == 1).sum()}')
    low_patch  = mpatches.Patch(color='blue', label=f'Low Protein  (0)  n={(y == 0).sum()}')
    ax.legend(handles=[high_patch, low_patch], loc='upper right')

    ax.set_title(title)
    ax.set_xlabel('Wavelength (nm)')
    ax.set_ylabel('Absorbance')

    plt.tight_layout()
    plt.show()
