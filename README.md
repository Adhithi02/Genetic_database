# GeneRisk Intelligence Platform

A clinical-grade precision medicine platform that predicts genetic disease susceptibility using ensemble machine learning, explains predictions with SHAP explainability, maps biological pathways via Reactome, interprets enzyme kinetics using BRENDA, and generates clinical narratives. The platform features a premium "Scientific Elegance" frontend dashboard with PDF report generation and interactive force-directed genomic networks.

Everything runs 100% locally with a zero-database architecture (no SQL/NoSQL databases required).

---

## Supported Diseases

| Disease | Training SNPs | ML Pipeline |
|---------|--------------|-------------|
| Type 2 Diabetes | 4,280 | Auto-selected Ensemble (LR/RF/XGB) with 5-fold CV |
| Coronary Artery Disease | 1,724 | Auto-selected Ensemble |
| Breast Cancer | 1,885 | Auto-selected Ensemble |
| Hypertension | 1,561 | Auto-selected Ensemble |

---

## Key Features

1. **Zero-Database Architecture**: Super fast in-memory GWAS cross-referencing against 13,918 clinical records.
2. **Machine Learning Pipeline**: Trained using Logistic Regression, Random Forests, and XGBoost to calculate probability of risk.
3. **SHAP Tell-All Explainability**: Transparent breakdown showing exact impact of each patient's SNP mutation.
4. **Pathway Enrichment Analysis**: Reactome pathway matching to identify systemically disrupted biological processes.
5. **Enzyme Kinetics Analysis**: BRENDA database integration (Km values) to evaluate metabolic enzyme efficiency.
6. **Force-Directed Network Graph**: Interactive SNP -> Gene -> Pathway -> Disease topology view.
7. **Cross-Disease Vulnerability Scan**: Patient SNPs tested against all available models to build a comparative risk profile.
8. **Clinical PDF Reports**: Downloadable, 5-page clinical reports using `jsPDF` and `html2canvas` directly from the dashboard.

---

## Project Structure

```
project-root/
|
+-- cleaned_gwas.csv                     # Core dataset: 13,918 curated GWAS SNP records
+-- backend/
|   +-- main.py                          # FastAPI server 
|   +-- requirements.txt                 # Backend ML/API dependencies
|   +-- ml/                              # Core Intelligence Engine
|   |   +-- train_models.py              # 3-algorithm execution with cross-validation
|   |   +-- intelligence.py              # Per-SNP SHAP, Pathway, Kinetics, Narrative generator
|   |   +-- prs.py                       # Polygenic risk scorer
|   |   +-- models/                      # Stored .pkl models
|   +-- data/                            # Processed biology references
|   |   +-- biology_reference.json       # 3,464 genes mapped to Reactome/BRENDA
|   +-- testing/                         # Validation and CI scripts
|
+-- frontend/
    +-- package.json                     # React dependencies
    +-- src/
        +-- App.js                       # React application routing
        +-- components/                  
        |   +-- Home.js                  # Landing page
        |   +-- InputPage.js             # SNP data entry interface
        |   +-- ResultsDashboard.js      # The 7-section clinical report view
        |   +-- svg/                     # Custom React SVG Components
        |       +-- ChromosomeMap.js     # Karyogram visualisation
        |       +-- RiskArc.js           # Animated risk gauge
        |       +-- DNAHelix.js          # Animated watermark background
```

---

## API Endpoints (`backend/main.py`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | API Health check & status |
| `/diseases/` | GET | Lists available disease models |
| `/predict/` | POST | Full 10-step intelligence sequence (ML, SHAP, PRS, Kinetics, Pathways, Narrative) |
| `/network/` | POST | Generates node-link JSON for force-directed graphs |
| `/interpret/` | POST | Biological symbol interpretation |
| `/vulnerability-profile/` | POST | Comparative multi-disease background scan |

---

## Technology Stack

| Component | Stack |
|-------|-----------|
| **Backend API** | FastAPI + Uvicorn |
| **Intelligence / Data** | XGBoost, Scikit-Learn, SHAP, Pandas, NumPy |
| **Frontend UI** | React 18, Custom CSS (Vanilla) |
| **Visualisation** | Recharts, `react-force-graph-2d` |
| **PDF Processing** | `jsPDF`, `html2canvas` |
| **Model Format** | `.pkl` (Python Pickle) |

---

## Setup & Running Locally

### 1. Start the Intelligence Backend
```bash
cd backend
python -m venv env
source env/Scripts/activate      # Windows: \env\Scripts\activate
pip install -r requirements.txt
python main.py
```
*The FastAPI server mounts on http://localhost:8000.*

### 2. Start the Frontend Dashboard
```bash
cd frontend
npm install
npm start
```
*The React application opens on http://localhost:3000.*

---

## Legal & Clinical Disclaimer

**For Research Use Only.** The GeneRisk Intelligence platform is an AI-assisted demonstration of multi-omic data integration. It does not constitute a clinical diagnosis, medical advice, or treatment recommendation.
