"""
trainer.py
----------
Reusable model evaluation and persistence utilities for the NIR Maize
Classifier project.

Contains functions for computing classification metrics, plotting confusion
matrices, saving trained models to disk, and loading them back.  These
functions are shared across:

  • notebook 05_plsda_svm_training.ipynb  — PLS-DA and SVM
  • notebook 06_cnn_training.ipynb        — 1D-CNN
  • notebook 07_model_comparison.ipynb    — Final comparison of all models
"""

import os

import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import (
    accuracy_score,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
)
import joblib


# ---------------------------------------------------------------------------
# 1. Evaluation
# ---------------------------------------------------------------------------

def evaluate_model(model, X_test, y_test, model_name='Model'):
    """
    Generate predictions and compute four classification metrics for a model.

    Runs model.predict() on X_test, then computes accuracy, precision,
    recall, and F1-score against y_test using scikit-learn.  All metrics
    are printed to the console and returned as a dictionary.

    Parameters
    ----------
    model : scikit-learn estimator
        A fitted model with a .predict() method.
    X_test : numpy.ndarray, shape (n_samples, n_features)
        Test feature matrix.  Must NOT have been used during training or
        hyperparameter tuning.
    y_test : numpy.ndarray, shape (n_samples,)
        True binary class labels (0 = Low Protein, 1 = High Protein).
    model_name : str, optional
        Human-readable name used in the printed output.  Default is
        'Model'.

    Returns
    -------
    results : dict
        Dictionary with the following keys:
          - 'model_name' : str   — the value passed as model_name
          - 'accuracy'   : float — fraction of correctly classified samples
          - 'precision'  : float — positive predictive value
          - 'recall'     : float — true positive rate / sensitivity
          - 'f1_score'   : float — harmonic mean of precision and recall
    """
    y_pred = model.predict(X_test)

    acc  = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred, average='binary')
    rec  = recall_score(y_test, y_pred, average='binary')
    f1   = f1_score(y_test, y_pred, average='binary')

    print(f"\n{'=' * 45}")
    print(f"  Evaluation Results — {model_name}")
    print(f"{'=' * 45}")
    print(f"  Accuracy  : {acc:.4f}")
    print(f"  Precision : {prec:.4f}")
    print(f"  Recall    : {rec:.4f}")
    print(f"  F1-Score  : {f1:.4f}")
    print(f"{'=' * 45}\n")

    return {
        'model_name': model_name,
        'accuracy':   acc,
        'precision':  prec,
        'recall':     rec,
        'f1_score':   f1,
    }


# ---------------------------------------------------------------------------
# 2. Confusion Matrix
# ---------------------------------------------------------------------------

def plot_confusion_matrix(y_test, y_pred, model_name='Model'):
    """
    Plot a labelled confusion matrix heatmap for a binary classification result.

    Computes the confusion matrix from y_test and y_pred, then renders it as
    an annotated seaborn heatmap with human-readable axis labels for Low and
    High Protein classes.

    Parameters
    ----------
    y_test : array-like, shape (n_samples,)
        True binary class labels (0 = Low Protein, 1 = High Protein).
    y_pred : array-like, shape (n_samples,)
        Predicted binary class labels produced by the model.
    model_name : str, optional
        Human-readable name displayed in the plot title.  Default is 'Model'.

    Returns
    -------
    None
        Displays the confusion matrix plot inline (plt.show()).
    """
    cm = confusion_matrix(y_test, y_pred)
    tick_labels = ['Low Protein (0)', 'High Protein (1)']

    fig, ax = plt.subplots(figsize=(6, 5))
    sns.heatmap(
        cm,
        annot=True,
        fmt='d',
        cmap='Blues',
        xticklabels=tick_labels,
        yticklabels=tick_labels,
        linewidths=0.5,
        linecolor='gray',
        ax=ax,
    )
    ax.set_xlabel('Predicted Label', fontsize=12)
    ax.set_ylabel('True Label', fontsize=12)
    ax.set_title(f'Confusion Matrix \u2014 {model_name}', fontsize=14)
    plt.tight_layout()
    plt.show()


# ---------------------------------------------------------------------------
# 3. Save / Load
# ---------------------------------------------------------------------------

def save_model(model, filepath):
    """
    Save a trained scikit-learn model to disk using joblib.

    Creates the parent directory automatically if it does not already exist,
    then serialises the model to the given filepath.  A confirmation message
    is printed after saving.

    Parameters
    ----------
    model : scikit-learn estimator
        Any fitted scikit-learn-compatible model object.
    filepath : str
        Destination path for the saved model file (e.g.
        'saved_models/svm_best.pkl').

    Returns
    -------
    None
    """
    os.makedirs(os.path.dirname(os.path.abspath(filepath)), exist_ok=True)
    joblib.dump(model, filepath)
    print(f"Model saved to: {filepath}")


def load_model(filepath):
    """
    Load a saved scikit-learn model from disk using joblib.

    Deserialises a model that was previously saved with save_model() (or any
    joblib.dump() call) and returns it ready for prediction.  A confirmation
    message is printed after loading.

    Parameters
    ----------
    filepath : str
        Path to the saved model file (e.g. 'saved_models/svm_best.pkl').

    Returns
    -------
    model : scikit-learn estimator
        The loaded model object.
    """
    model = joblib.load(filepath)
    print(f"Model loaded from: {filepath}")
    return model


# ---------------------------------------------------------------------------
# Module note
# ---------------------------------------------------------------------------
# This module (src/trainer.py) is intentionally kept model-agnostic so that
# it can be shared across multiple training notebooks:
#
#   05_plsda_svm_training.ipynb  — uses evaluate_model, plot_confusion_matrix,
#                                   save_model for PLS-DA and SVM
#   06_cnn_training.ipynb        — uses the same functions for the 1D-CNN
#   07_model_comparison.ipynb    — uses load_model to reload all saved models
#                                   and evaluate_model for the final comparison
#
# Any changes to the metric definitions or plot style here will automatically
# propagate to all three notebooks, ensuring consistent reporting.
# ---------------------------------------------------------------------------
