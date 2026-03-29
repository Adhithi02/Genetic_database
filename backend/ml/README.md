# Machine Learning Directory

This directory contains the intelligent model selection pipeline, explainability engine, and clinical scoring modules.

## Scripts

### train_models.py
Automated model selection pipeline that evaluates Linear (Logistic Regression) against Non-Linear (Random Forest, XGBoost) algorithms for each of the 4 target diseases using 5-Fold Stratified Cross-Validation. The winning model per disease is serialized and saved to the `models/` subdirectory.

**Usage:**
```bash
cd backend/ml
python train_models.py
```

### xai.py (Explainable AI)
Uses SHAP (SHapley Additive exPlanations) to decompose individual patient predictions into per-feature contribution scores. This allows the system to identify exactly which SNP characteristics drove a specific risk prediction, transforming the ML model from a black box into a transparent, interpretable tool.

### prs.py (Polygenic Risk Score)
Computes the traditional clinical Polygenic Risk Score using the standard formula: Sum of ln(Odds Ratio) multiplied by allele dosage. This provides a non-ML clinical baseline that can be compared against the ML prediction to validate model performance.

## models/ Subdirectory
Contains the serialized scikit-learn/XGBoost pipelines (`.pkl` files) for each disease. Each pipeline includes the full preprocessing chain (imputer, scaler) and the trained classifier.

### Current Models
| Disease | Winning Algorithm | ROC-AUC |
|---|---|---|
| Type 2 Diabetes | XGBoost | 0.8616 |
| Coronary Artery Disease | XGBoost | 0.8649 |
| Breast Cancer | Random Forest | 0.8409 |
| Hypertension | Random Forest | 0.8672 |
