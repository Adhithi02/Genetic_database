import os
import pickle
import numpy as np
import pandas as pd
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.impute import SimpleImputer
from sklearn.model_selection import StratifiedKFold, cross_val_score
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from xgboost import XGBClassifier

print("="*70)
print(" Intelligent ML Model Selection Pipeline (Local) ")
print("="*70)

GWAS_FILE = '../../cleaned_gwas.csv'
FEATURE_COLUMNS = ["odds_ratio", "risk_allele_freq", "chromosome", "position"]
TARGET_COL = "is_significant"
MODELS_DIR = "models"

# Only train models for our 4 core IDP diseases
TARGET_DISEASES = [
    "Type 2 Diabetes",
    "Coronary Artery Disease",
    "Breast Cancer",
    "Hypertension"
]

# Ensure local models directory exists
os.makedirs(MODELS_DIR, exist_ok=True)

# ---------- DATA PREP ----------
def clean_features(df: pd.DataFrame) -> tuple[pd.DataFrame, pd.Series]:
    """Clean SNP features and return (X, y) for modeling."""
    df = df.copy()
    df["odds_ratio"] = pd.to_numeric(df["odds_ratio"], errors="coerce").fillna(1.0).clip(0.1, 20.0)
    df["risk_allele_freq"] = pd.to_numeric(df["risk_allele_freq"], errors="coerce").fillna(0.3).clip(0.0, 1.0)
    df["chromosome"] = pd.to_numeric(df["chromosome"], errors="coerce").fillna(1.0)
    df["position"] = pd.to_numeric(df["position"], errors="coerce").fillna(1e7).clip(1e5, 2.5e8)
    
    y = df[TARGET_COL].astype(int)
    X = df[FEATURE_COLUMNS]
    return X, y

def fetch_disease_training_data(df: pd.DataFrame, disease_name: str) -> tuple[pd.DataFrame, pd.Series]:
    """Fetch all SNPs linked to the specific disease straight from the CSV."""
    disease_df = df[df['disease'] == disease_name]
    if disease_df.empty:
        raise RuntimeError(f"No SNPs found for {disease_name}")
    return clean_features(disease_df)

# ---------- PIPELINE BUILDERS ----------
def get_pipelines():
    """Define the 3 competing algorithms"""
    lr = Pipeline([
        ("imputer", SimpleImputer(strategy="median")),
        ("scaler", StandardScaler()),
        ("clf", LogisticRegression(max_iter=2000, class_weight="balanced", solver="lbfgs"))
    ])
    
    rf = Pipeline([
        ("imputer", SimpleImputer(strategy="median")),
        ("scaler", StandardScaler()),
        ("clf", RandomForestClassifier(n_estimators=100, class_weight="balanced", random_state=42))
    ])
    
    xgb = Pipeline([
        ("imputer", SimpleImputer(strategy="median")),
        ("scaler", StandardScaler()),
        ("clf", XGBClassifier(n_estimators=100, eval_metric='logloss', random_state=42))
    ])
    
    return {'Logistic Regression': lr, 'Random Forest': rf, 'XGBoost': xgb}

# ---------- EVALUATION & TRAINING ----------
def evaluate_and_select_best(X: pd.DataFrame, y: pd.Series, disease_name: str):
    print(f"\nTraining models for: {disease_name}")
    print(f"   Dataset size: {len(X)} instances")
    
    pipelines = get_pipelines()
    best_model_name = ""
    best_score = 0
    best_pipeline = None
    
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    
    for name, pipe in pipelines.items():
        # Evaluate using ROC-AUC
        scores = cross_val_score(pipe, X, y, cv=cv, scoring='roc_auc')
        mean_score = np.mean(scores)
        print(f"   [{name}] ROC-AUC: {mean_score:.4f}")
        
        if mean_score > best_score:
            best_score = mean_score
            best_model_name = name
            best_pipeline = pipe
            
    print(f"   Winner: {best_model_name} (ROC-AUC: {best_score:.4f})")
    
    # Retrain best model on full dataset
    best_pipeline.fit(X, y)
    
    # Save locally as .pkl (fixing spaces in filename)
    safe_name = disease_name.replace(" ", "_").lower()
    model_path = os.path.join(MODELS_DIR, f"{safe_name}_model.pkl")
    with open(model_path, "wb") as f:
        pickle.dump(best_pipeline, f)
    print(f"   Saved local model to: {model_path}")

def main():
    if not os.path.exists(GWAS_FILE):
        print(f"[!] Critical Error: Cannot find {GWAS_FILE}.")
        return

    print(f"[*] Loading Local GWAS Database: {GWAS_FILE}")
    df = pd.read_csv(GWAS_FILE)
    
    print(f"[*] Training models for {len(TARGET_DISEASES)} core diseases.")
    
    for disease_name in TARGET_DISEASES:
        try:
            X, y = fetch_disease_training_data(df, disease_name)
            if y.nunique() < 2:
                print(f"   [!] Skipping {disease_name}: Need at least two outcome classes (0/1).")
                continue
            evaluate_and_select_best(X, y, disease_name)
        except Exception as e:
            print(f"   [!] Failed for {disease_name}: {e}")
            
    print("\n" + "="*70)
    print(" Phase 2 Complete! Master models saved in local /models/ directory.")
    
if __name__ == "__main__":
    main()
