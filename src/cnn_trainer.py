"""
cnn_trainer.py
--------------
Reusable 1D-CNN building, training, and evaluation utilities for the NIR
Maize Classifier project.

Contains functions for constructing the Keras Sequential model, reshaping
NumPy arrays to the required Conv1D input shape, running the training loop
with early stopping and model checkpointing, plotting training history, and
reporting evaluation metrics on the held-out test set.

These functions are used in:
  • notebook 06_1d_cnn_training.ipynb — builds, trains, and evaluates the CNN
  • notebook 07_model_comparison.ipynb — loads the saved best weights for
                                         head-to-head comparison with PLS-DA
                                         and SVM
"""

import os

import matplotlib.pyplot as plt
import numpy as np
import seaborn as sns

import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint
from sklearn.metrics import (
    accuracy_score,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
)


# ---------------------------------------------------------------------------
# 1. Model Architecture
# ---------------------------------------------------------------------------

def build_1d_cnn(input_length=700):
    """
    Build and compile a simplified 1D Convolutional Neural Network for binary
    classification of NIR spectral data.

    The network treats each spectrum as a 1D time-series of length
    ``input_length``, where every timestep holds one absorbance value.
    Two Conv1D blocks (each followed by BatchNormalization) extract spectral
    features before a single Dense layer combines them into the final sigmoid
    output.

    Architecture (in order):
        1.  Input               — shape (input_length, 1)
        2.  Conv1D              — 32 filters, kernel 11, relu, padding same
        3.  BatchNormalization
        4.  MaxPooling1D        — pool size 2
        5.  Conv1D              — 64 filters, kernel 7, relu, padding same
        6.  BatchNormalization
        7.  MaxPooling1D        — pool size 2
        8.  Flatten
        9.  Dense               — 32 units, relu
        10. Dropout             — rate 0.3
        11. Dense (output)      — 1 unit, sigmoid

    Key design decisions:
        • Fewer filters (32 / 64) than a typical CNN to avoid overfitting on
          the small dataset.
        • BatchNormalization after each Conv1D stabilises gradient flow and
          reduces sensitivity to the learning rate.
        • Larger first kernel (11) captures broader spectral absorption bands.
        • Lower learning rate (0.0001) prevents the Adam optimizer from
          overshooting the loss minimum.

    Compiled with:
        • Optimizer : Adam(learning_rate=0.0001)
        • Loss      : binary_crossentropy
        • Metrics   : ['accuracy']

    After compilation, model.summary() is printed to the console.

    Parameters
    ----------
    input_length : int, optional
        Number of wavelength features in each spectrum.  Defaults to 700,
        which matches the preprocessed NIR data in this project.

    Returns
    -------
    model : keras.Sequential
        A fully compiled Keras model ready for training.
    """
    model = keras.Sequential(
        [
            layers.Input(shape=(input_length, 1)),

            # --- Feature extraction block 1 ---
            layers.Conv1D(32, kernel_size=11, activation='relu',
                          padding='same'),
            layers.BatchNormalization(),
            layers.MaxPooling1D(pool_size=2),

            # --- Feature extraction block 2 ---
            layers.Conv1D(64, kernel_size=7, activation='relu',
                          padding='same'),
            layers.BatchNormalization(),
            layers.MaxPooling1D(pool_size=2),

            # --- Classification head ---
            layers.Flatten(),
            layers.Dense(32, activation='relu'),
            layers.Dropout(rate=0.3),
            layers.Dense(1, activation='sigmoid'),
        ],
        name='1d_cnn_protein_classifier',
    )

    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=0.0001),
        loss='binary_crossentropy',
        metrics=['accuracy'],
    )

    model.summary()
    return model


# ---------------------------------------------------------------------------
# 2. Data Reshaping
# ---------------------------------------------------------------------------

def reshape_for_cnn(X):
    """
    Reshape a 2D feature matrix into the 3D format required by Conv1D.

    Keras Conv1D expects input of shape ``(n_samples, steps, features)``.
    For NIR spectra each wavelength point is one "timestep" with a single
    feature (its absorbance value), so the last dimension is always 1.

    Parameters
    ----------
    X : numpy.ndarray, shape (n_samples, n_wavelengths)
        Original flat feature matrix produced by the preprocessing and
        augmentation notebooks.

    Returns
    -------
    X_reshaped : numpy.ndarray, shape (n_samples, n_wavelengths, 1)
        Reshaped array ready to be fed directly into the Conv1D input layer.
    """
    return X.reshape(X.shape[0], X.shape[1], 1)


# ---------------------------------------------------------------------------
# 2b. Input Scaling
# ---------------------------------------------------------------------------

def scale_for_cnn(X_train, X_test):
    """
    Normalise CNN input data using StandardScaler.

    CNNs are sensitive to input scale.  If the raw absorbance values span
    very different ranges across wavelengths the optimizer can get stuck in
    a flat region of the loss surface, causing the model to output near-0.5
    probabilities for every sample (random-guessing behaviour).

    This function fits a StandardScaler on the training data only and then
    applies the same transformation to the test data.  Fitting on training
    data only prevents information from the test set leaking into the scaler
    (data-leakage prevention).

    The fitted scaler is also saved to ``saved_models/cnn_scaler.pkl`` so it
    can be reloaded in Notebook 07 when the model is used for inference.

    Parameters
    ----------
    X_train : numpy.ndarray, shape (n_samples, 700)
        Training spectra before reshaping.  Must be the raw 2D matrix, NOT
        the 3D reshaped version.
    X_test : numpy.ndarray, shape (n_samples, 700)
        Test spectra before reshaping.  The scaler is only applied here,
        never fitted.

    Returns
    -------
    X_train_scaled : numpy.ndarray, shape (n_samples, 700)
        Standardised training spectra (mean 0, std 1 per wavelength channel).
    X_test_scaled : numpy.ndarray, shape (n_samples, 700)
        Standardised test spectra (same scaler parameters as training).
    scaler : sklearn.preprocessing.StandardScaler
        The fitted scaler object.
    """
    from sklearn.preprocessing import StandardScaler
    import joblib

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled  = scaler.transform(X_test)

    os.makedirs('../saved_models', exist_ok=True)
    joblib.dump(scaler, '../saved_models/cnn_scaler.pkl')
    print('CNN scaler saved to ../saved_models/cnn_scaler.pkl')
    print(f'X_train_scaled shape: {X_train_scaled.shape}')
    print(f'X_test_scaled shape : {X_test_scaled.shape}')

    return X_train_scaled, X_test_scaled, scaler


# ---------------------------------------------------------------------------
# 3. Training
# ---------------------------------------------------------------------------

def train_cnn(model, X_train, y_train, epochs=50, batch_size=32,
              validation_split=0.1, random_state=42):
    """
    Train a compiled Keras model with early stopping and model checkpointing.

    This function sets a global TensorFlow random seed, configures two
    callbacks to guard against overfitting and to preserve the best weights,
    then calls model.fit().  The saved_models/ directory is created
    automatically if it does not already exist.

    Callbacks
    ---------
    EarlyStopping
        Monitors ``val_loss``.  Training stops if it does not improve for
        10 consecutive epochs.  ``restore_best_weights=True`` ensures the
        model is rolled back to its best state after stopping.

    ModelCheckpoint
        Saves the model to ``saved_models/1d_cnn_best.h5`` whenever
        ``val_loss`` reaches a new minimum (``save_best_only=True``).

    Parameters
    ----------
    model : keras.Sequential
        A compiled Keras model returned by build_1d_cnn().
    X_train : numpy.ndarray, shape (n_samples, n_wavelengths, 1)
        Reshaped training feature matrix (output of reshape_for_cnn()).
    y_train : numpy.ndarray, shape (n_samples,)
        Binary class labels for the training set (0 = Low, 1 = High Protein).
    epochs : int, optional
        Maximum number of training epochs.  Default is 50.
    batch_size : int, optional
        Number of samples per gradient-update step.  Default is 32.
    validation_split : float, optional
        Fraction of X_train held out for validation during training.
        Default is 0.1 (10 %).
    random_state : int, optional
        Seed passed to tf.random.set_seed() for reproducibility.
        Default is 42.

    Returns
    -------
    history : keras.callbacks.History
        History object whose ``.history`` dict contains per-epoch records
        for loss, val_loss, accuracy, and val_accuracy.
    """
    tf.random.set_seed(random_state)

    # Create output directory if needed
    os.makedirs('../saved_models', exist_ok=True)

    callbacks = [
        EarlyStopping(
            monitor='val_loss',
            patience=20,
            restore_best_weights=True,
            verbose=1,
        ),
        ModelCheckpoint(
            filepath='../saved_models/1d_cnn_best.h5',
            monitor='val_loss',
            save_best_only=True,
            verbose=1,
        ),
    ]

    history = model.fit(
        X_train,
        y_train,
        epochs=epochs,
        batch_size=batch_size,
        validation_split=validation_split,
        callbacks=callbacks,
        verbose=1,
    )

    epochs_run = len(history.history['loss'])
    print(f"\nTraining complete. Ran {epochs_run} epoch(s).")
    return history


# ---------------------------------------------------------------------------
# 4. Training History Plot
# ---------------------------------------------------------------------------

def plot_training_history(history):
    """
    Plot training and validation loss and accuracy curves side by side.

    Reads the ``history.history`` dictionary returned by train_cnn() and
    draws two subplots:
        Left  — Training vs Validation Loss over epochs
        Right — Training vs Validation Accuracy over epochs

    Uses a clean seaborn style for readability.

    Parameters
    ----------
    history : keras.callbacks.History
        History object returned by train_cnn() (or model.fit() directly).

    Returns
    -------
    None
        Displays the figure inline via plt.show().
    """
    sns.set_style('whitegrid')

    epochs = range(1, len(history.history['loss']) + 1)

    fig, axes = plt.subplots(1, 2, figsize=(14, 5))
    fig.suptitle('1D-CNN Training History', fontsize=15, fontweight='bold')

    # --- Loss ---
    axes[0].plot(epochs, history.history['loss'],
                 label='Training', linewidth=2)
    axes[0].plot(epochs, history.history['val_loss'],
                 label='Validation', linewidth=2, linestyle='--')
    axes[0].set_xlabel('Epoch', fontsize=12)
    axes[0].set_ylabel('Loss', fontsize=12)
    axes[0].set_title('Loss over Epochs', fontsize=13)
    axes[0].legend(fontsize=11)

    # --- Accuracy ---
    axes[1].plot(epochs, history.history['accuracy'],
                 label='Training', linewidth=2)
    axes[1].plot(epochs, history.history['val_accuracy'],
                 label='Validation', linewidth=2, linestyle='--')
    axes[1].set_xlabel('Epoch', fontsize=12)
    axes[1].set_ylabel('Accuracy', fontsize=12)
    axes[1].set_title('Accuracy over Epochs', fontsize=13)
    axes[1].legend(fontsize=11)

    plt.tight_layout()
    plt.show()


# ---------------------------------------------------------------------------
# 5. Evaluation
# ---------------------------------------------------------------------------

def evaluate_cnn(model, X_test, y_test, threshold=0.5):
    """
    Evaluate a trained 1D-CNN on the held-out test set and report metrics.

    Calls model.predict() to obtain raw sigmoid probabilities, converts them
    to binary predictions using ``threshold``, then computes four standard
    classification metrics with scikit-learn.  All metrics are printed to the
    console and returned in a dictionary.

    Parameters
    ----------
    model : keras.Sequential
        A trained Keras model (best weights already restored by callbacks).
    X_test : numpy.ndarray, shape (n_samples, n_wavelengths, 1)
        Reshaped test feature matrix (output of reshape_for_cnn()).  Must NOT
        have been used during training or hyperparameter tuning.
    y_test : numpy.ndarray, shape (n_samples,)
        True binary class labels (0 = Low Protein, 1 = High Protein).
    threshold : float, optional
        Decision boundary for converting probabilities to class labels.
        Default is 0.5.

    Returns
    -------
    results : dict
        Dictionary with the following keys:
          - 'model_name' : str            — '1D-CNN'
          - 'accuracy'   : float          — fraction of correct predictions
          - 'precision'  : float          — positive predictive value
          - 'recall'     : float          — true positive rate
          - 'f1_score'   : float          — harmonic mean of precision/recall
          - 'y_pred'     : numpy.ndarray  — binary predicted labels
          - 'y_prob'     : numpy.ndarray  — raw sigmoid probabilities
    """
    y_prob = model.predict(X_test)[:, 0]
    y_pred = (y_prob >= threshold).astype(int)

    acc  = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred, average='binary')
    rec  = recall_score(y_test, y_pred, average='binary')
    f1   = f1_score(y_test, y_pred, average='binary')

    print(f"\n{'=' * 45}")
    print(f"  Evaluation Results — 1D-CNN")
    print(f"{'=' * 45}")
    print(f"  Accuracy  : {acc:.4f}")
    print(f"  Precision : {prec:.4f}")
    print(f"  Recall    : {rec:.4f}")
    print(f"  F1-Score  : {f1:.4f}")
    print(f"{'=' * 45}\n")

    return {
        'model_name': '1D-CNN',
        'accuracy':   acc,
        'precision':  prec,
        'recall':     rec,
        'f1_score':   f1,
        'y_pred':     y_pred,
        'y_prob':     y_prob,
    }


# ---------------------------------------------------------------------------
# 6. Confusion Matrix
# ---------------------------------------------------------------------------

def plot_cnn_confusion_matrix(y_test, y_pred):
    """
    Plot a labelled confusion matrix heatmap for the 1D-CNN results.

    Computes the confusion matrix from the true and predicted labels, then
    renders it as an annotated seaborn heatmap with human-readable tick labels
    for the Low Protein and High Protein classes.

    Parameters
    ----------
    y_test : array-like, shape (n_samples,)
        True binary class labels (0 = Low Protein, 1 = High Protein).
    y_pred : array-like, shape (n_samples,)
        Predicted binary class labels produced by evaluate_cnn().

    Returns
    -------
    None
        Displays the figure inline via plt.show().
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
    ax.set_title('Confusion Matrix \u2014 1D-CNN', fontsize=14)
    plt.tight_layout()
    plt.show()


# ---------------------------------------------------------------------------
# Usage example
# ---------------------------------------------------------------------------

if __name__ == '__main__':
    # -----------------------------------------------------------------------
    # Quick smoke-test: build a model, reshape dummy data, run one epoch.
    # Replace the dummy arrays with the real .npy files from data/processed/
    # -----------------------------------------------------------------------

    print("=== cnn_trainer.py — quick smoke-test ===\n")

    # 1. Build the model
    model = build_1d_cnn(input_length=700)

    # 2. Create dummy data that matches the project's actual shapes
    rng = np.random.default_rng(42)
    X_dummy = rng.random((50, 700)).astype(np.float32)
    y_dummy = rng.integers(0, 2, size=50).astype(np.float32)

    # 3. Reshape for Conv1D
    X_dummy_cnn = reshape_for_cnn(X_dummy)
    print(f"\nReshaped X shape: {X_dummy_cnn.shape}")  # (50, 700, 1)

    # 4. Train for just 1 epoch as a sanity check
    history = train_cnn(
        model,
        X_dummy_cnn,
        y_dummy,
        epochs=1,
        batch_size=16,
        validation_split=0.1,
        random_state=42,
    )
    print("\nSmoke-test passed.")
