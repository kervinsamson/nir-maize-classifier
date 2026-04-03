Load raw data (80 samples)
    ↓
Label them High/Low protein (median split)
    ↓
Preprocess with Savitzky-Golay (clean the spectra first)
    ↓
Split into train/test (64 train, 16 test)
    ↓
Augment ONLY the training set (64 → ~1000+ samples)
    ↓
Train models on augmented training data
    ↓
Evaluate on original 16 test samples