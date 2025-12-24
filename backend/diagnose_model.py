"""
Diagnostic script to check why predictions are always 0.5.
Run this after training to inspect the model and feature distributions.
"""
import pandas as pd
from database import engine
from ml import load_latest_model, FEATURE_COLUMNS, predict_risk
import numpy as np
from sklearn.pipeline import Pipeline

from sklearn.pipeline import Pipeline

def diagnose_model():
    print("=" * 60)
    print("MODEL DIAGNOSTICS")
    print("=" * 60)

    # Load model
    try:
        model, metadata = load_latest_model()
        print(f"\n✓ Model loaded successfully")
        print(f"  Model ID: {metadata['_id']}")
        print(f"  Trained on: {metadata.get('training_rows', 'unknown')} rows")
        print(f"  Feature names: {metadata.get('feature_names', 'unknown')}")
    except Exception as e:
        print(f"\n✗ Failed to load model: {e}")
        return

    # Unwrap final estimator if Pipeline
    print(f"\n[Model Parameters]")

    if isinstance(model, Pipeline):
        # More robust: fall back to last step if 'logreg' not present
        if "logreg" in model.named_steps:
            logreg = model.named_steps["logreg"]
        else:
            logreg = list(model.named_steps.values())[-1]
    else:
        logreg = model

    print(f"  Classes: {logreg.classes_}")
    print(f"  Intercept: {logreg.intercept_}")
    print(f"  Coefficients shape: {logreg.coef_.shape}")
    print(f"  Coefficients:\n{logreg.coef_}")

    # Use logreg here, not model
    if np.allclose(logreg.coef_, 0):
        print("\n⚠ WARNING: All coefficients are near zero - model is not learning!")
    else:
        print("\n✓ Model has non-zero coefficients")

    
    # Load training data statistics
    print(f"\n[Training Data Statistics]")
    try:
        with engine.connect() as conn:
            df = pd.read_sql(
                "SELECT odds_ratio, risk_allele_freq, chromosome, position, is_significant FROM snp",
                conn,
            )
        
        print(f"  Total rows: {len(df)}")
        print(f"  Class distribution:")
        print(df['is_significant'].value_counts())
        
        print(f"\n  Feature statistics:")
        for col in FEATURE_COLUMNS:
            print(f"    {col}:")
            print(f"      Mean: {df[col].mean():.4f}")
            print(f"      Std:  {df[col].std():.4f}")
            print(f"      Min:  {df[col].min():.4f}")
            print(f"      Max:  {df[col].max():.4f}")
            print(f"      Median: {df[col].median():.4f}")
        
        # Test predictions on training data
        print(f"\n[Test Predictions on Training Data]")
        sample_size = min(10, len(df))
        sample_df = df.sample(n=sample_size, random_state=42)
        
        for idx, row in sample_df.iterrows():
            features = [
                float(row['odds_ratio']),
                float(row['risk_allele_freq']),
                float(row['chromosome']),
                float(row['position']),
            ]
            proba = predict_risk(model, features)
            actual_class = row['is_significant']
            print(f"  Row {idx}: features={features[:2]}... -> proba={proba:.4f}, actual={actual_class}")
        
        # Test with typical patient feature (averaged)
        print(f"\n[Test with Typical Patient Features (Averaged)]")
        avg_features = [
            float(df['odds_ratio'].mean()),
            float(df['risk_allele_freq'].mean()),
            float(df['chromosome'].mean()),
            float(df['position'].mean()),
        ]
        proba_avg = predict_risk(model, avg_features)
        print(f"  Averaged features: {avg_features}")
        print(f"  Prediction: {proba_avg:.4f}")
        
        # Test with edge cases
        print(f"\n[Test Edge Cases]")
        edge_cases = [
            ([1.0, 0.0, 0.0, 0.0], "Default/zero features"),
            ([2.0, 0.5, 1.0, 1000000.0], "High odds ratio"),
            ([0.5, 0.1, 1.0, 500000.0], "Low odds ratio"),
        ]
        for features, desc in edge_cases:
            proba = predict_risk(model, features)
            print(f"  {desc}: {features} -> proba={proba:.4f}")
            
    except Exception as e:
        print(f"\n✗ Failed to load training data: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    diagnose_model()

