# NIR Maize Classifier

> CMSC 190 — Special Problem

---

## Getting Started

### Jupyter Notebooks

1. **Initialize a Python virtual environment**

   ```bash
   python -m venv venv
   ```

2. **Activate the virtual environment**

   On Windows:
   ```bash
   venv\Scripts\activate
   ```

   On macOS/Linux:
   ```bash
   source venv/bin/activate
   ```

3. **Install dependencies**

   ```bash
   pip install -r requirements.txt
   ```

4. **Launch Jupyter**

   ```bash
   jupyter notebook
   ```

   Then open the notebooks in the `notebooks/` directory in order:
   - `01_data_loading.ipynb`
   - `02_labeling.ipynb`
   - `03_sg_preprocessing.ipynb`

### Frontend

1. **Navigate to the frontend directory**

   ```bash
   cd app/frontend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the development server**

   ```bash
   npm run dev
   ```

   The app will be available at [http://localhost:3000](http://localhost:3000).

### TODO
- revise notebooks 05 - 06 to make use of new test/training data split
