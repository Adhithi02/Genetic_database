# Machine Learning Training Pipeline

This document details the model selection and training architecture for the Genomic Analysis project.

## Overview
The script `train_models.py` automates the empirical selection of optimal machine learning algorithms for multi-disease genomic risk prediction. It evaluates both linear and non-linear classification models to handle complex epistatic gene interactions inherent in GWAS data.

## Input Data
The pipeline relies entirely on local processed tabular data:
- `cleaned_gwas.csv`: Contains the engineered numerical features required for statistical modeling.

**Feature Set (`X`):**
- `odds_ratio`
- `risk_allele_freq`
- `chromosome`
- `position`

**Target Variable (`y`):**
- `is_significant` (Binary classification target representing severe clinical risk).

## Training Architecture (`train_models.py`)
Rather than relying on a predetermined algorithm, the script executes an automated pipeline for each unique disease found within the dataset.

1. **Algorithm Scope**:
   - Logistic Regression (Linear baseline)
   - Random Forest Classifier (Non-linear, Bagging)
   - XGBoost Classifier (Non-linear, Boosting)

2. **Evaluation Strategy**:
   - The features undergo median imputation and standard scaling.
   - Algorithms are evaluated using 5-Fold Stratified Cross-Validation.
   - The primary evaluation metric is ROC-AUC (Receiver Operating Characteristic - Area Under Curve) to account for potential class imbalances within genetic datasets.

3. **Model Selection**:
   - For each disease, the system automatically compares the mean ROC-AUC across all algorithms.
   - The highest-scoring algorithm is designated as the champion model.
   - The champion model is retrained on the entire dataset for that specific disease to maximize data utilization.

## Output
The script serializes the winning mathematical models and saves them locally.
- Directory: `models/`
- Format: Python Pickle (`.pkl`)
- Example files: `type_2_diabetes_model.pkl`, `coronary_artery_disease_model.pkl`

These `.pkl` files contain the full scikit-learn/XGBoost prediction pipelines (including imputer and scaler states). They are invoked by the FastAPI endpoints during live inference to generate real-time patient risk probabilities.
