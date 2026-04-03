nir-protein-classifier/
│
├── data/                       # Local data storage (DO NOT upload to GitHub)
│   ├── raw/                    # Original Eigenvector corn dataset files
│   └── processed/              # Cleaned/converted data after labeling
│       ├── labeled.csv         # All 80 samples with High/Low protein label
│       ├── X_train.npy         # Training spectra (before augmentation)
│       ├── X_test.npy          # Test spectra (NEVER augmented)
│       └── y_train.npy         # Training labels
│
├── notebooks/                  # Jupyter notebooks for Offline Benchmarking
│   ├── 01_data_loading.ipynb           # Load dataset, plot spectra, check protein distribution
│   ├── 02_labeling.ipynb               # Median split → assign High/Low protein labels
│   ├── 03_sg_preprocessing.ipynb       # Applying Savitzky-Golay smoothing
│   ├── 04_augmentation.ipynb           # Linear interpolation 80 → 2000 samples (train only)
│   ├── 05_plsda_svm_training.ipynb     # GridSearch for classical ML models
│   ├── 06_1d_cnn_training.ipynb        # Keras model architecture and training
│   └── 07_evaluation_metrics.ipynb     # Confusion matrices, F1-scores, McNemar's test
│
├── src/                        # Reusable Python scripts (keeps notebooks clean)
│   ├── __init__.py
│   ├── data_loader.py          # Functions to load and label the dataset
│   ├── preprocessor.py         # Savitzky-Golay smoothing function
│   ├── augmentor.py            # Linear interpolation augmentation function
│   └── visualizer.py           # Charts and figures for your manuscript
│
├── saved_models/               # Best models exported from your notebooks
│   ├── pls_da_best.pkl
│   ├── svm_best.pkl
│   └── 1d_cnn_best.h5
│
├── app/                        # The Online Identification System
│   │
│   ├── backend/                # Server & API (Python / FastAPI)
│   │   ├── main.py             # FastAPI endpoints (@app.post("/predict"))
│   │   ├── inference.py        # Loads .h5/.pkl files and makes predictions
│   │   └── schemas.py          # Pydantic models for request/response validation
│   │
│   └── frontend/               # User Interface (React + Vite + shadcn/ui)
│       ├── node_modules/       # Downloaded JavaScript libraries (Ignored by Git)
│       ├── public/             # Static files (e.g., logo, favicon.ico)
│       ├── src/
│       │   ├── components/
│       │   │   └── ui/         # shadcn/ui auto-generated components live here
│       │   ├── App.jsx         # Main UI (upload button, results display)
│       │   ├── App.css         # Styling for App.jsx
│       │   ├── main.jsx        # Boots up React (rarely touched)
│       │   └── index.css       # Global styling + shadcn CSS variables
│       ├── components.json     # shadcn/ui config file (auto-generated)
│       ├── index.html          # Single HTML file hosting your React app
│       ├── package.json        # React dependencies
│       └── vite.config.js      # Vite settings
│
├── docs/                       # Thesis documents
│   ├── manuscript/             # LaTeX files for your CMSC 190 paper
│   └── figures/                # High-res charts for your paper
│
├── .gitignore                  # Root gitignore (covers data/, saved_models/, __pycache__)
├── requirements.txt            # Python libraries (FastAPI, scikit-learn, TensorFlow)
└── README.md                   # Setup instructions for your panel