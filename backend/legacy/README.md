# Legacy Directory

This directory contains scripts from the original project implementation that have been superseded by the new modular architecture. They are retained for reference purposes only and are not used by the current application.

## Files
- **ml.py**: Original monolithic ML training and prediction module.
- **train_disease_models.py**: Original disease-specific Logistic Regression training script (replaced by `ml/train_models.py` which supports intelligent model selection across multiple algorithms).
- **train_pipeline.py**: Original simplified training pipeline.
- **retrain.py**: Original model retraining utility.
- **diagnose_model.py**: Original model diagnostics script.
- **populate_disease_snp.py**: Original script for populating disease-SNP associations in PostgreSQL.
