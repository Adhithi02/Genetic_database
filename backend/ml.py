import pickle
from datetime import datetime
from typing import Tuple, Optional

import numpy as np  
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sqlalchemy.orm import Session

from database import metadata_collection, engine  # keep your real imports

FEATURE_COLUMNS = ["odds_ratio", "risk_allele_freq", "chromosome", "position"]


def _coerce_numeric(series: pd.Series, default: float) -> pd.Series:
    """Convert to numeric and fill NaNs with default."""
    numeric = pd.to_numeric(series, errors="coerce")
    return numeric.fillna(default)


def build_training_matrix(train_df: pd.DataFrame) -> Tuple[pd.DataFrame, pd.Series]:
    df = train_df.copy()

    df["odds_ratio"] = _coerce_numeric(df.get("odds_ratio", 1.0), 1.0)
    # Clip extreme OR values
    df["odds_ratio"] = df["odds_ratio"].clip(lower=0.01, upper=20.0)
    # Optional: log-transform
    df["odds_ratio"] = np.log(df["odds_ratio"])

    df["risk_allele_freq"] = _coerce_numeric(df.get("risk_allele_freq", 0.0), 0.0)
    df["chromosome"] = _coerce_numeric(df.get("chromosome", 0.0), 0.0)
    df["position"] = _coerce_numeric(df.get("position", 0.0), 0.0)

    if "is_significant" not in df.columns:
        raise ValueError("Training dataframe must include 'is_significant' column.")

    X = df[FEATURE_COLUMNS].astype(float)
    y = df["is_significant"].astype(int)

    # Final NaN guard
    if X.isna().any().any():
        print("[DEBUG] NaNs found in X, imputing with medians")
        X = X.fillna(X.median(numeric_only=True))

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


def train_logistic_regression(X: pd.DataFrame, y: pd.Series) -> Pipeline:
    class_counts = y.value_counts()
    print("\n[DEBUG] Training class distribution:")
    print(class_counts)

    if len(class_counts) == 2:
        min_class_ratio = min(class_counts) / len(y)
        if min_class_ratio < 0.1:
            print("[DEBUG] Using balanced class weights due to imbalance")
            base_model = LogisticRegression(
                max_iter=1000,
                class_weight="balanced",
                solver="lbfgs",
            )
        else:
            base_model = LogisticRegression(max_iter=1000, solver="lbfgs")
    else:
        print("[WARNING] Only one class found; model may not learn properly")
        base_model = LogisticRegression(max_iter=1000, solver="lbfgs")

    model = Pipeline(
        steps=[
            ("scaler", StandardScaler()),
            ("logreg", base_model),
        ]
    )

    model.fit(X, y)

    logreg = model.named_steps["logreg"]
    print("\n[DEBUG] Model intercept_:", logreg.intercept_)
    print("[DEBUG] Model coef_:", logreg.coef_)

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
    disease_id: Optional[int] = None,
) -> str:
    """
    Save model metadata to MongoDB.
    If disease_id is provided, saves as disease-specific model.
    """
    payload = {
        "model": pickle.dumps(model),
        "feature_names": list(feature_names),
        "training_rows": training_rows,
        "created_at": datetime.utcnow(),
        "notes": notes or {},
    }
    if disease_id is not None:
        payload["disease_id"] = disease_id
    result = metadata_collection.insert_one(payload)
    return str(result.inserted_id)


def load_latest_model() -> Tuple[LogisticRegression, dict]:
    doc = metadata_collection.find_one(sort=[("created_at", -1)])
    if not doc:
        raise RuntimeError("No trained model metadata found in MongoDB.")
    model = pickle.loads(doc["model"])
    return model, doc


def load_disease_model(disease_id: int) -> Tuple[Pipeline, dict]:
    """
    Load the latest disease-specific model from MongoDB.
    """
    doc = metadata_collection.find_one(
        {"disease_id": disease_id},
        sort=[("created_at", -1)]
    )
    if not doc:
        raise RuntimeError(f"No trained model found for disease_id={disease_id}.")
    model = pickle.loads(doc["model"])
    return model, doc


def predict_risk(model, patient_features: list[float]) -> float:
    import numpy as np

    print("\n[DEBUG] predict_risk called with patient_features:", patient_features)

    if len(patient_features) != len(FEATURE_COLUMNS):
        raise ValueError(f"Expected {len(FEATURE_COLUMNS)} features, got {len(patient_features)}")

    features_array = np.array(patient_features, dtype=float).reshape(1, -1)

    # Support both bare estimators and pipelines with a "logreg" step
    estimator = model
    classes = getattr(model, "classes_", None)
    if hasattr(model, "named_steps"):
        if "logreg" in model.named_steps:
            estimator = model.named_steps["logreg"]
            classes = getattr(estimator, "classes_", classes)

    proba_vec = estimator.predict_proba(features_array)[0]
    print("[DEBUG] Full predict_proba output:", proba_vec)
    print("[DEBUG] Model classes:", classes)

    if classes is None:
        # Fallback: assume binary ordering [0, 1] if no classes_ present
        proba = proba_vec[-1] if len(proba_vec) >= 2 else float(proba_vec[0])
    elif len(proba_vec) == 2:
        proba = proba_vec[1] if classes[1] == 1 else proba_vec[0]
    else:
        class_1_idx = np.where(classes == 1)[0]
        proba = proba_vec[class_1_idx[0]] if len(class_1_idx) > 0 else np.max(proba_vec)

    print("[DEBUG] Returning risk (class=1 prob):", proba)
    return float(proba)


if __name__ == "__main__":
    X, y = fetch_training_data_from_sql()
    model = train_logistic_regression(X, y)
    # Example: use first row as a test patient
    example_features = X.iloc[0].tolist()
    print("\n[DEBUG] Example features from first row:", example_features)
    example_risk = predict_risk(model, example_features)
    print("[DEBUG] Example risk from first row:", example_risk)
