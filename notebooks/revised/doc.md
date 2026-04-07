this shit is wrong because the training data are augmented test set and that is a no no. data leakage. test set must be completely unseen.


Here is how you can effectively test on all 80 of your samples without cheating:
1. Leave-One-Out Cross-Validation (LOOCV)
For datasets under 100 samples, LOOCV is the gold standard. Here is how it works:
Pull out Sample 1 and hide it.
Take the remaining 79 samples and apply your augmentation to them (turning those 79 into hundreds or thousands of spectra).
Train your SVM or 1D-CNN on that augmented set.
Test the model on the hidden Sample 1 and record the result.
Throw the model away, put Sample 1 back, and pull out Sample 2.
Repeat this process 80 times.
The Result: By the end, you will have 80 independent test predictions. You calculate your final accuracy based on these 80 predictions. Because the test sample was never part of the augmentation for that specific model, there is zero data leakage, and your accuracy metric is 100% valid.
2. K-Fold Cross Validation (e.g., 5-Fold)
If training 80 different 1D-CNN models takes too long computationally, use 5-Fold Cross Validation:
Divide your 80 samples into 5 groups of 16.
Hide Group 1 (16 samples).
Take the other 4 groups (64 samples), augment them, and train your model.
Test on the hidden 16 samples and record the results.
Repeat this 5 times, hiding a different group of 16 each time.
The Result: Again, every single one of your 80 samples is used as a test sample exactly once. You combine the predictions from all 5 folds to get your true overall accuracy on all 80 samples.
A Warning About 1D-CNNs and 80 Samples
Because you only have 80 physical samples, you should be very careful with Deep Learning (1D-CNNs).
Deep learning models are notoriously data-hungry. Even if you augment 80 samples into 10,000 samples, you still only have 80 samples worth of biological variance. The neural network might just memorize the specific shapes of your 80 samples rather than learning the actual chemistry (moisture, starch, protein, etc.).
SVM is generally much better suited for a dataset of this size than a CNN.
Partial Least Squares (PLS) Regression / Discriminant Analysis (PLS-DA): This is the undisputed champion algorithm for NIR data with less than 200 samples. If you haven't tried PLS yet, you absolutely should. It is mathematically designed to handle the exact situation you are in (highly correlated spectra with a low number of physical samples).
Summary: Do not use the training data's "parents" as a test set. Use Cross-Validation, making sure you split the data first, then augment the training folds inside the loop. This is the only way to get a realistic, publishable accuracy score.