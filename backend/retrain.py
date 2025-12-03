import pickle
from datetime import datetime
from typing import Tuple
import re
import pandas as pd
import numpy as np
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.impute import SimpleImputer
from database import metadata_collection, engine

FEATURE_COLUMNS = ["odds_ratio", "risk_allele_freq", "chromosome", "position"]

def clean_features(df: pd.DataFrame) -> pd.DataFrame:
    """Robust cleaning for messy SQL data."""
    df = df.copy()
    
    # 1. odds_ratio: clip insane outliers (3723 is ridiculous)
    df["odds_ratio"] = pd.to_numeric(df["odds_ratio"], errors="coerce").fillna(1.0)
    df["odds_ratio"] = df["odds_ratio"].clip(0.1, 20.0)  # Realistic GWAS range
    
    # 2. risk_allele_freq: [0,1]
    df["risk_allele_freq"] = pd.to_numeric(df["risk_allele_freq"], errors="coerce").fillna(0.3)
    df["risk_allele_freq"] = df["risk_allele_freq"].clip(0.0, 1.0)
    
    # 3. chromosome: parse messy strings -> 1-24
    def parse_chrom(val):
        if pd.isna(val):
            return 1.0
        s = str(val).strip()
        # Extract first valid chromosome number
        match = re.search(r'\b([1-9]\d?|X|Y)\b', s, re.IGNORECASE)
        if match:
            c = match.group(1).upper()
            if c == 'X': return 23.0
            if c == 'Y': return 24.0
            return float(c)
        return 1.0  # default
    
    df["chromosome"] = df["chromosome"].apply(parse_chrom)
    
    # 4. position: clip to reasonable genome size
    df["position"] = pd.to_numeric(df["position"], errors="coerce").fillna(1e7)
    df["position"] = df["position"].clip(1e5, 2.5e8)
    
    # 5. is_significant: ensure 0/1
    if df["is_significant"].dtype == bool:
        df["is_significant"] = df["is_significant"].astype(int)
    
    print("[DEBUG] Cleaned features stats:")
    print(df[FEATURE_COLUMNS].describe())
    
    return df[FEATURE_COLUMNS]

def fetch_training_data_from_sql() -> Tuple[pd.DataFrame, pd.Series]:
    """Load and clean training data."""
    with engine.connect() as conn:
        df = pd.read_sql(
            "SELECT odds_ratio, risk_allele_freq, chromosome, position, is_significant "
            "FROM snp",
            conn,
        )
    
    print(f"Raw SQL data: {len(df)} rows")
    print("Raw head:", df.head(3))
    
    X = clean_features(df)
    y = df["is_significant"].astype(int)
    
    print("Class balance:", y.value_counts().to_dict())
    return X, y

def train_logistic_regression(X: pd.DataFrame, y: pd.Series) -> Pipeline:
    """Train with proper scaling."""
    # Pipeline handles scaling + imputation + model
    pipe = Pipeline([
        ("imputer", SimpleImputer(strategy="median")),  # Any remaining NaNs
        ("scaler", StandardScaler()),
        ("clf", LogisticRegression(max_iter=2000, C=1.0))
    ])
    
    pipe.fit(X, y)
    
    # Extract model for inspection
    clf = pipe.named_steps["clf"]
    print("\n✓ TRAINED MODEL:")
    print("  Intercept:", clf.intercept_)
    print("  Coefficients:", clf.coef_)
    print("  Training accuracy:", pipe.score(X, y))
    
    # Verify it learned something
    train_proba = pipe.predict_proba(X)[:, 1]
    print("  Training proba range:", f"{train_proba.min():.3f} - {train_proba.max():.3f}")
    
    return pipe

def save_model_metadata(model: Pipeline, training_rows: int) -> str:
    payload = {
        "model": pickle.dumps(model),
        "feature_names": FEATURE_COLUMNS,
        "training_rows": training_rows,
        "created_at": datetime.utcnow(),
        "notes": {"pipeline": "scaled+imputed"}
    }
    result = metadata_collection.insert_one(payload)
    return str(result.inserted_id)

# MAIN TRAINING
if __name__ == "__main__":
    print("=== RETRAINING WITH FIXES ===")
    X, y = fetch_training_data_from_sql()
    model = train_logistic_regression(X, y)
    model_id = save_model_metadata(model, len(X))
    print(f"\n✓ New model saved: {model_id}")
