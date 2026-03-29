# train_disease_models.py

import pickle
from datetime import datetime
from typing import Tuple
from sqlalchemy import text


import numpy as np
import pandas as pd
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.impute import SimpleImputer
from sqlalchemy.orm import Session

from database import engine, metadata_collection, SessionLocal
from models import Disease

FEATURE_COLUMNS = ["odds_ratio", "risk_allele_freq", "chromosome", "position"]
TARGET_COL = "is_significant"


# ---------- DATA PREP / CLEANING ----------

def clean_features(df: pd.DataFrame) -> Tuple[pd.DataFrame, pd.Series]:
    """Clean SNP features and return (X, y) for modeling."""
    df = df.copy()

    # odds_ratio
    df["odds_ratio"] = pd.to_numeric(df["odds_ratio"], errors="coerce").fillna(1.0)
    df["odds_ratio"] = df["odds_ratio"].clip(0.1, 20.0)

    # risk_allele_freq
    df["risk_allele_freq"] = pd.to_numeric(
        df["risk_allele_freq"], errors="coerce"
    ).fillna(0.3)
    df["risk_allele_freq"] = df["risk_allele_freq"].clip(0.0, 1.0)

    # chromosome
    df["chromosome"] = pd.to_numeric(df["chromosome"], errors="coerce").fillna(1.0)

    # position
    df["position"] = pd.to_numeric(df["position"], errors="coerce").fillna(1e7)
    df["position"] = df["position"].clip(1e5, 2.5e8)

    # target
    y = df[TARGET_COL].astype(int)

    X = df[FEATURE_COLUMNS]
    return X, y


def fetch_disease_training_data(disease_id: int) -> Tuple[pd.DataFrame, pd.Series]:
    with engine.connect() as conn:
        query = text("""
        SELECT
            s.odds_ratio,
            s.risk_allele_freq,
            s.chromosome,
            s.position,
            s.is_significant
        FROM snp AS s
        JOIN disease_snp AS ds
            ON ds.snp_id = s.snp_id
        WHERE ds.disease_id = :disease_id
        """)
        df = pd.read_sql(query, conn, params={"disease_id": disease_id})

    if df.empty:
        raise RuntimeError(f"No SNPs found for disease_id={disease_id}")

    X, y = clean_features(df)
    return X, y


# ---------- MODEL TRAINING & SAVING ----------

def train_disease_logreg(X: pd.DataFrame, y: pd.Series) -> Pipeline:
    """Train a logistic regression pipeline for a single disease."""
    class_counts = y.value_counts()
    if len(class_counts) == 2:
        min_ratio = class_counts.min() / len(y)
        class_weight = "balanced" if min_ratio < 0.1 else None
    else:
        class_weight = None

    pipe = Pipeline(
        [
            ("imputer", SimpleImputer(strategy="median")),
            ("scaler", StandardScaler()),
            ("clf", LogisticRegression(
                max_iter=2000,
                C=1.0,
                class_weight=class_weight,
                solver="lbfgs",
            )),
        ]
    )

    pipe.fit(X, y)
    return pipe


def save_disease_model(model: Pipeline, disease_id: int, training_rows: int) -> str:
    """Store the disease-specific model in MongoDB."""
    payload = {
        "model": pickle.dumps(model),
        "feature_names": FEATURE_COLUMNS,
        "training_rows": training_rows,
        "created_at": datetime.utcnow(),
        "disease_id": disease_id,
        "notes": {"type": "disease_specific", "pipeline": "impute+scale+logreg"},
    }
    result = metadata_collection.insert_one(payload)
    return str(result.inserted_id)


def load_latest_disease_model(disease_id: int) -> Tuple[Pipeline, dict]:
    """Load the newest model for a given disease_id from MongoDB."""
    doc = metadata_collection.find_one(
        {"disease_id": disease_id},
        sort=[("created_at", -1)],
    )
    if not doc:
        raise RuntimeError(f"No model found for disease_id={disease_id}")
    model = pickle.loads(doc["model"])
    return model, doc


# ---------- LOOP OVER ALL DISEASES ----------

def train_all_disease_models():
    """
    Iterate through all diseases, train a separate model for each,
    and save them to MongoDB.
    """
    session: Session = SessionLocal()
    try:
        diseases = session.query(Disease).all()
        print(f"Found {len(diseases)} diseases")

        for dis in diseases:
            print(f"\n=== Training model for disease_id={dis.disease_id}, name={dis.name} ===")
            try:
                X, y = fetch_disease_training_data(dis.disease_id)

                if y.nunique() < 2:
                    print(f"Skipping disease {dis.name}: only one target class")
                    continue

                model = train_disease_logreg(X, y)
                model_id = save_disease_model(model, dis.disease_id, len(X))
                print(f"  ✓ Saved model {model_id} for disease_id={dis.disease_id}")
            except Exception as e:
                print(f"  !! Failed for disease_id={dis.disease_id}: {e}")
    finally:
        session.close()


# ---------- PREDICTION API ----------

def predict_disease_risk(
    disease_id: int,
    odds_ratio: float,
    risk_allele_freq: float,
    chromosome: float,
    position: float,
) -> float:
    """
    Use the latest disease-specific model to predict risk (probability of class 1).
    """
    model, _ = load_latest_disease_model(disease_id)

    features = np.array(
        [[odds_ratio, risk_allele_freq, chromosome, position]],
        dtype=float,
    )
    proba = model.predict_proba(features)[0, 1]
    return float(proba)


# ---------- MAIN ENTRY POINT ----------

def main():
    # 1) Train models for every disease in the SQL database
    print("=== Training disease-specific logistic regression models ===")
    train_all_disease_models()

    # 2) OPTIONAL: Example of how to call predict_disease_risk()
    # Replace 1 with a real disease_id and feature values as needed.
    # example_proba = predict_disease_risk(
    #     disease_id=1,
    #     odds_ratio=1.2,
    #     risk_allele_freq=0.25,
    #     chromosome=1,
    #     position=1234567,
    # )
    # print("Example predicted risk:", example_proba)


if __name__ == "__main__":
    main()
