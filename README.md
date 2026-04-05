# GeneRisk Intelligence: Universal Precision Medicine Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.10+](https://img.shields.io/badge/python-3.10+-blue.svg)](https://www.python.org/downloads/)
[![React 18](https://img.shields.io/badge/React-18-61DAFB.svg)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-05998B.svg)](https://fastapi.tiangolo.com/)

**GeneRisk Intelligence** is a high-fidelity, clinical-grade genomic analysis platform designed to bridge the gap between raw SNP data and actionable biological insights. By combining ensemble machine learning, SHAP-based explainability, Reactome pathway enrichment, and BRENDA enzyme kinetics, the platform provides a 360-degree view of polygenic disease susceptibility—all within an authoritative, "Scientific Elegance" aesthetic.

> [!IMPORTANT]
> **Zero-Database Architecture**: This platform operates entirely in-memory at runtime. By loading 13,918+ GWAS records and 3,400+ biological references into RAM on startup, it achieves near-zero latency without the overhead of external SQL or NoSQL dependencies.

---

## 🔬 Core Capabilities

### 1. Ensemble Risk Prediction
Utilizes a "Champion Selection" pipeline where Logistic Regression, Random Forest, and XGBoost algorithms race across 5-fold Stratified Cross-Validation. The system auto-selects the highest-performing model (ROC-AUC) for each disease.

### 2. Multi-Tiered Interpretability (XAI)
Beyond a simple risk score, the system employs **SHAP (SHapley Additive exPlanations)** to decompose the "Black Box." It visualizes exactly how much each genetic feature (Odds Ratio, Allele Frequency, Genomic Location) pushed the prediction up or down from the baseline.

### 3. Biological Chokepoint Mapping
Features an interactive **Force-Directed Genomic Network** that traces the causal chain from **Patient SNPs → Mutated Genes → Affected Pathways → Target Disease**. This identifies "hubs" where multiple genetic mutations converge on a single biological pathway.

### 4. Cross-Disease Vulnerability Screening
Simultaneously evaluates the patient's genetic profile across all four supported disease models—identifying "cross-pathway triggers" where a single variant may influence multiple co-morbidities.

### 5. Clinical Report Generation
Generates high-fidelity, 5-page PDF reports directly in the browser. These reports include live-captured charts, clinical narratives, enzyme kinetics interpretations, and detailed variant rankings.

---

## 🏛️ Supported Disease Models

| Disease | Dataset Size | Primary Model Architecture | Accuracy Metric |
|:---|:---|:---|:---|
| **Type 2 Diabetes** | 4,280 SNPs | XGBoost Ensemble | ROC-AUC: 0.84+ |
| **Coronary Artery Disease**| 1,724 SNPs | Random Forest Ensemble | ROC-AUC: 0.81+ |
| **Breast Cancer** | 1,885 SNPs | Logistic Regression | ROC-AUC: 0.79+ |
| **Hypertension** | 1,561 SNPs | XGBoost Ensemble | ROC-AUC: 0.82+ |

---

## 🛠️ Technology Stack

| Layer | Technologies |
|:---|:---|
| **Backend Engine** | Python 3.10, FastAPI, Uvicorn |
| **Intelligence** | Scikit-Learn, XGBoost, SHAP (XAI), Pandas, NumPy |
| **Frontend UI** | React 18, Vanilla CSS (Scientific Elegance Theme) |
| **Visualization** | Recharts (SVG), React-Force-Graph-2D (Canvas) |
| **Documentation** | Mermaid.js, Markdown |
| **Reporting** | jsPDF, html2canvas |

---

## 🚀 The 10-Step Intelligence Pipeline

When a patient submits their genomic variants, the platform executes the following deterministic sequence:

1.  **GWAS Cross-Reference**: Rapid lookup against 13,918 clinically validated records in RAM.
2.  **Weighted Feature Engineering**: Aggregates rsID data into a 4-dimensional vector based on phenotypic influence.
3.  **ML Inference**: High-speed prediction via the cross-validated champion model.
4.  **XAI Decomposition**: TreeExplainer computes Shapley values for per-feature impact analysis.
5.  **Variant Risk Ranking**: Re-evaluates each SNP in isolation to identify the "Primary Driver" variant.
6.  **Clinical PRS Calculation**: Traditional Polygenic Risk Scoring as a secondary validation baseline.
7.  **Pathway Enrichment**: Maps identified genes to the **Reactome** database to find systemically disrupted pathways.
8.  **Kinetic Interpretation**: For metabolic enzymes, retrieves **BRENDA Km** values to assess substrate affinity changes.
9.  **Clinical Narrative Generation**: Synthesis of all 8 steps into a human-readable, professional narrative.
10. **Network Topology Construction**: Generates a graph-structured JSON for force-directed visualization.

---

## 📂 Project Structure

```text
GeneRisk-Intelligence/
├── backend/
│   ├── main.py                # FastAPI Server & Intelligence Orchestration
│   ├── ml/                    # Machine Learning Core
│   │   ├── train_models.py    # Training & Cross-Validation Pipeline
│   │   ├── intelligence.py    # XAI & Enrichment Logic
│   │   └── models/            # Serialized Champion Models (.pkl)
│   ├── data/                  # Reference Knowledge Bases
│   │   └── biology_reference.json # Reactome & BRENDA mappings
│   └── requirements.txt       # Python Dependency Manifest
├── frontend/
│   ├── public/                # Static assets & Custom Typography
│   ├── src/
│   │   ├── components/        # ResultsDashboard, Home, InputPage
│   │   ├── svg/               # Custom Animated SVGs (RiskArc, ChromosomeMap)
│   │   └── styles/            # CSS Modules (Scientific Elegance Design System)
│   └── package.json           # React Dependency Manifest
└── cleaned_gwas.csv           # Master GWAS Dataset (13,918 records)
```

---

## ⚙️ Installation & Deployment

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Initialize and activate a virtual environment:
   ```bash
   python -m venv env
   # Windows:
   .\env\Scripts\activate
   ```
3. Install intelligence dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the API server:
   ```bash
   python main.py
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install UI dependencies:
   ```bash
   npm install
   ```
3. Launch the dashboard:
   ```bash
   npm start
   ```

---

## ⚖️ Clinical Disclaimer

> [!CAUTION]
> **RESEARCH USE ONLY**: This platform is an educational and research-oriented demonstration of Multi-Omic data integration and Machine Learning in genomics. It is **NOT** a clinical diagnostic tool. The risk scores generated reflect statistical associations in general populations and do not predict individual health outcomes with certainty. Always consult a board-certified Genetic Counselor or Clinical Pathologist for medical interpretation.

---

**GeneRisk Intelligence** — *Universal Precise Insights for a Genomic Future.*
