import pickle
from datetime import datetime
from typing import Tuple

import pandas as pd
from sklearn.linear_model import LogisticRegression

from database import metadata_collection, engine

FEATURE_COLUMNS = ["odds_ratio", "risk_allele_freq", "chromosome", "position"]


def _coerce_numeric(series: pd.Series, default: float) -> pd.Series:
    """Convert to numeric and fill NaNs with default."""
    numeric = pd.to_numeric(series, errors="coerce")
    return numeric.fillna(default)


def build_training_matrix(train_df: pd.DataFrame) -> Tuple[pd.DataFrame, pd.Series]:
    """Return X/y matrices using the agreed upon feature set."""
    print("\n[DEBUG] Raw training_df head:")
    print(train_df.head())
    print("[DEBUG] Raw training_df dtypes:")
    print(train_df.dtypes)

    df = train_df.copy()
    df["odds_ratio"] = _coerce_numeric(df.get("odds_ratio", 1.0), 1.0)
    df["risk_allele_freq"] = _coerce_numeric(df.get("risk_allele_freq", 0.0), 0.0)
    df["chromosome"] = _coerce_numeric(df.get("chromosome", 0.0), 0.0)
    df["position"] = _coerce_numeric(df.get("position", 0.0), 0.0)

    if "is_significant" not in df.columns:
        raise ValueError("Training dataframe must include 'is_significant' column.")

    print("\n[DEBUG] After coercion head:")
    print(df[FEATURE_COLUMNS + ["is_significant"]].head())
    print("[DEBUG] After coercion describe():")
    print(df[FEATURE_COLUMNS].describe())
    print("[DEBUG] is_significant value_counts():")
    print(df["is_significant"].value_counts(dropna=False))

    X = df[FEATURE_COLUMNS].astype(float)
    y = df["is_significant"].astype(int)

    print("\n[DEBUG] X dtypes:", X.dtypes.to_dict())
    print("[DEBUG] y unique values:", y.unique())
    print("[DEBUG] First 10 y:", y.head(10).tolist())

    return X, y


def fetch_training_data_from_sql() -> Tuple[pd.DataFrame, pd.Series]:
    """Load training data directly from the SQL `snp` table."""
    try:
        with engine.connect() as conn:
            print("Fetching training data from SQL database...")
            df = pd.read_sql(
                "SELECT odds_ratio, risk_allele_freq, chromosome, position, is_significant "
                "FROM snp",
                conn,
            )
            print(f"Loaded {len(df)} rows from SQL database")
        return build_training_matrix(df)
    except Exception as e:
        print(f"Error fetching training data from SQL: {e}")
        raise RuntimeError(f"Failed to load training data from database: {e}") from e


def train_logistic_regression(X: pd.DataFrame, y: pd.Series) -> LogisticRegression:
    # Check class balance
    class_counts = y.value_counts()
    print(f"\n[DEBUG] Training class distribution:")
    print(class_counts)
    print(f"[DEBUG] Class balance ratio: {class_counts.get(1, 0) / len(y):.3f} positive")
    
    # Use class_weight='balanced' if classes are imbalanced
    if len(class_counts) == 2:
        min_class_ratio = min(class_counts) / len(y)
        if min_class_ratio < 0.1:  # If minority class is < 10%
            print("[DEBUG] Using balanced class weights due to imbalance")
            model = LogisticRegression(max_iter=1000, class_weight='balanced')
        else:
            model = LogisticRegression(max_iter=1000)
    else:
        print(f"[WARNING] Only {len(class_counts)} unique class(es) found - model may not learn properly")
        model = LogisticRegression(max_iter=1000)
    
    model.fit(X, y)

    print("\n[DEBUG] Model classes_:", model.classes_)
    print("[DEBUG] Model intercept_:", model.intercept_)
    print("[DEBUG] Model coef_:", model.coef_)

    # Show probabilities on first 10 training rows
    proba_train = model.predict_proba(X.iloc[:10])
    print("\n[DEBUG] predict_proba on first 10 training rows:")
    for i, (row, p) in enumerate(zip(X.iloc[:10].values, proba_train)):
        print(f"  Row {i} features={row} -> proba={p}")

    return model


def save_model_metadata(
    model: LogisticRegression,
    feature_names,
    training_rows: int,
    notes: dict | None = None,
) -> str:
    payload = {
        "model": pickle.dumps(model),
        "feature_names": list(feature_names),
        "training_rows": training_rows,
        "created_at": datetime.utcnow(),
        "notes": notes or {},
    }
    result = metadata_collection.insert_one(payload)
    return str(result.inserted_id)


def load_latest_model() -> Tuple[LogisticRegression, dict]:
    doc = metadata_collection.find_one(sort=[("created_at", -1)])
    if not doc:
        raise RuntimeError("No trained model metadata found in MongoDB.")
    model = pickle.loads(doc["model"])
    return model, doc


def predict_risk(model: LogisticRegression, patient_features: list[float]) -> float:
    """
    Predict risk probability for a patient.
    patient_features should be [odds_ratio, risk_allele_freq, chromosome, position]
    """
    import numpy as np
    
    # Debug: show incoming features and the resulting probability vector
    print("\n[DEBUG] predict_risk called with patient_features:", patient_features)
    
    # Ensure features are in correct format
    if len(patient_features) != len(FEATURE_COLUMNS):
        raise ValueError(f"Expected {len(FEATURE_COLUMNS)} features, got {len(patient_features)}")
    
    # Convert to numpy array and reshape for sklearn
    features_array = np.array(patient_features).reshape(1, -1)
    
    # Get prediction probabilities
    proba_vec = model.predict_proba(features_array)[0]
    print("[DEBUG] Full predict_proba output:", proba_vec)
    print("[DEBUG] Model classes:", model.classes_)
    
    # Find index of class 1 (significant/positive class)
    if len(proba_vec) == 2:
        # Binary classification: [prob_class_0, prob_class_1]
        proba = proba_vec[1] if model.classes_[1] == 1 else proba_vec[0]
    else:
        # Multi-class or edge case
        class_1_idx = np.where(model.classes_ == 1)[0]
        if len(class_1_idx) > 0:
            proba = proba_vec[class_1_idx[0]]
        else:
            # Fallback: use max probability
            proba = np.max(proba_vec)
    
    print("[DEBUG] Returning risk (class=1 prob):", proba)
    return float(proba)


# Optional quick test block (run only when executing this file directly)
if __name__ == "__main__":
    X, y = fetch_training_data_from_sql()
    model = train_logistic_regression(X, y)
    # Example: use first row as a test patient
    example_features = X.iloc[0].tolist()
    print("\n[DEBUG] Example features from first row:", example_features)
    example_risk = predict_risk(model, example_features)
    print("[DEBUG] Example risk from first row:", example_risk)
