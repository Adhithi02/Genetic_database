# AI-Based Multi-Disease Genomic Risk Prediction and Pathway Vulnerability Analysis

## Project Overview

This platform represents a clinical-grade precision medicine system designed to provide deep biological insights into polygenic disease susceptibility. By integrating high-throughput genomic data with functional biological databases, the system moves beyond simple risk scoring to offer a comprehensive interpretation of genetic variants. The platform utilizes advanced ensemble machine learning, SHAP-based explainability, and force-directed graph theory to trace the causal chain from individual single-nucleotide polymorphisms (SNPs) to systemic pathway disruptions.

The architecture emphasizes a zero-database dependency model, where all genomic reference data (13,918 GWAS records) and biological ontology data (3,464 genes) are loaded into memory at runtime to ensure maximum performance and data privacy.

---

## Technical Methodology

### 1. In-Memory Genomic Data Engine
The system replaces traditional database overhead with a high-speed, in-memory data engine. At startup, the platform ingests a curated dataset of over 13,000 GWAS records, including odds ratios, risk allele frequencies, and genomic coordinates. This allows for near-zero latency cross-referencing of patient genotypes.

### 2. Machine Learning Intelligence Pipeline
The core predictive engine operates through a sophisticated 10-step pipeline:
*   **Variant Harmonization**: Cross-referencing patient rsIDs against the internal GWAS corpus.
*   **Phenotypic Feature Engineering**: Constructing a high-dimensional feature vector based on variant pathogenicity and genomic context.
*   **Ensemble Model Inference**: Utilizing champion models selected through 5-fold stratified cross-validation. Current models include XGBoost, Random Forest, and Logistic Regression ensembles tailored for Type 2 Diabetes, Coronary Artery Disease, Breast Cancer, and Hypertension.
*   **XAI (Explainable AI)**: Generating SHAP (SHapley Additive exPlanations) values to decompose the model's decision-making process, providing per-feature impact metrics.
*   **Pathogenic Variant Ranking**: Identifying and ranking individual SNPs by their contribution to the overall risk probability.
*   **Polygenic Risk Scoring (PRS)**: Calculating traditional clinical risk metrics as a baseline for comparison with machine learning outputs.
*   **Pathway Enrichment Analysis**: Mapping identified genes to biological pathways to detect systemic functional disruptions.
*   **Metabolic Kinetic Interpretation**: Analyzing enzyme kinetics for genes encoding metabolic proteins.
*   **Automated Clinical Synthesis**: Generating a structured, natural-language narrative that summarizes all findings into a professional report.
*   **Topological Network Construction**: Creating a node-link model for visualization of the variant-gene-pathway hierarchy.

### 3. Integrated Functional Biology
The platform uniquely integrates several authoritative data sources to interpret genetic findings:
*   **Variant-Disease Associations**: Derived from the GWAS Catalog, providing the statistical foundation for risk calculations.
*   **Pathway Ontologies**: Utilizing Reactome data to understand how individual gene mutations converge on shared biological processes.
*   **Enzyme Kinetics**: Integrating BRENDA database parameters (Km values) to evaluate the potential impact of mutations on enzymatic substrate affinity and metabolic flux.

---

## Data Sources and Licensing

This project utilizes data from several open-access biological databases. Users of this platform must adhere to the respective licensing terms of these organizations.

### 1. Reactome Knowledgebase
Pathway data and gene-to-pathway mappings are derived from the Reactome Knowledgebase.
*   **License**: Reactome data is provided under the Creative Commons Attribution 4.0 International (CC BY 4.0) License.
*   **Citation**: Fabregat A, et al. (2018). The Reactome Pathway Knowledgebase. Nucleic Acids Res. 46(D1):D649-D655.

### 2. BRENDA Enzyme Database
Enzyme kinetic parameters (Km values) are sourced from the BRENDA database.
*   **License**: BRENDA is freely available for academic and non-profit use. Commercial entities may require a license through Bio-Base or the database owners.
*   **Usage**: Data is processed locally and encapsulated within the `biology_reference.json` file.

### 3. GWAS Catalog
SNP-disease association data is sourced from the NHGRI-EBI Catalog of published genome-wide association studies.
*   **Usage**: Data has been cleaned and filtered for the four target diseases (Type 2 Diabetes, CAD, Breast Cancer, Hypertension).

---

## System Architecture

### Backend Infrastructure
Developed with FastAPI and Python 3.10+, the backend serves as the primary intelligence orchestrator. It handles model serialization (.pkl), XAI computation (SHAP), and biological enrichment logic. All components are modularized for horizontal scalability of disease models.

### Frontend Presentation
The user interface follows a "Scientific Elegance" design philosophy, prioritizing data density and visual clarity.
*   **Interactive Karyogram**: Visualizing SNP distribution across the human chromosomes.
*   **Risk Architecture**: Utilizing animated SVG gauges for risk probability visualization.
*   **Genomic Vulnerability Network**: A force-directed 2D network graph (interactive canvas) showing the biological hierarchy of risk.
*   **Multi-Disease Radar**: A comparative profile showing cross-disease vulnerability based on shared genetic pathways.

---

## Installation and Deployment

### Prerequisites
*   Python 3.10 or higher
*   Node.js 18 or higher
*   NPM 9 or higher

### Backend Setup
1.  Initialize a Python virtual environment: `python -m venv env`
2.  Activate the environment: `.\env\Scripts\activate` (Windows) or `source env/bin/activate` (Linux/Mac)
3.  Install dependencies: `pip install -r backend/requirements.txt`
4.  Execute the server: `python backend/main.py`

### Frontend Setup
1.  Navigate to the frontend directory: `cd frontend`
2.  Install packages: `npm install`
3.  Start the development server: `npm start`

---

## API Reference

### POST /predict/
Executes the full 10-step intelligence pipeline for a specific patient genotype and target disease.

### POST /network/
Generates the graph-theoretical representation of the variant-pathway-disease relationship for the network visualization.

### POST /vulnerability-profile/
Performs a simultaneous analysis across all supported disease models to identify shared genetic risks.

---

## Clinical Disclaimer

This platform is intended for research and educational purposes only. The risk predictions generated by the AI models are based on statistical associations in population-level GWAS data and do not constitute a clinical diagnosis or medical advice. Genetic risk assessments should be interpreted by qualified healthcare professionals or genetic counselors. The authors and project participants assume no liability for medical or health-related decisions made based on this software.
