import os
import pickle
import shap
import pandas as pd
import numpy as np

# Suppress SHAP runtime warnings
import warnings
warnings.filterwarnings("ignore")

MODELS_DIR = "models"
GWAS_FILE = "../../cleaned_gwas.csv"
FEATURE_COLUMNS = ["odds_ratio", "risk_allele_freq", "chromosome", "position"]

def load_local_model(disease_name: str):
    """Loads the specific mathematical champion model for the requested disease."""
    safe_name = disease_name.replace(" ", "_").lower()
    model_path = os.path.join(MODELS_DIR, f"{safe_name}_model.pkl")
    
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model for {disease_name} not found locally at {model_path}.")
        
    with open(model_path, "rb") as f:
        model = pickle.load(f)
    return model

def get_background_data(disease_name: str, sample_size: int = 100) -> np.ndarray:
    """
    Loads a sample of training data for the disease to serve as the SHAP background.
    SHAP needs this to understand what 'normal' looks like so it can explain deviations.
    """
    df = pd.read_csv(GWAS_FILE)
    disease_df = df[df['disease'] == disease_name]
    
    if disease_df.empty:
        raise RuntimeError(f"No training data found for {disease_name}")
    
    # Clean features identically to how they were trained
    disease_df = disease_df.copy()
    disease_df["odds_ratio"] = pd.to_numeric(disease_df["odds_ratio"], errors="coerce").fillna(1.0).clip(0.1, 20.0)
    disease_df["risk_allele_freq"] = pd.to_numeric(disease_df["risk_allele_freq"], errors="coerce").fillna(0.3).clip(0.0, 1.0)
    disease_df["chromosome"] = pd.to_numeric(disease_df["chromosome"], errors="coerce").fillna(1.0)
    disease_df["position"] = pd.to_numeric(disease_df["position"], errors="coerce").fillna(1e7).clip(1e5, 2.5e8)
    
    X_bg = disease_df[FEATURE_COLUMNS].values
    
    # Sample a subset for speed (SHAP recommends 50-200 background samples)
    if len(X_bg) > sample_size:
        rng = np.random.default_rng(42)
        indices = rng.choice(len(X_bg), size=sample_size, replace=False)
        X_bg = X_bg[indices]
    
    return X_bg

def explain_prediction(disease_name: str, patient_features: pd.DataFrame, feature_names: list) -> dict:
    """
    Takes a patient's genomic features, loads the disease model,
    and uses SHAP to mathematically explain WHICH features drove the risk percentage.
    
    Returns a dict of {feature_name: shap_impact_value} sorted by absolute magnitude.
    """
    # 1. Load the requested Pipeline
    pipeline = load_local_model(disease_name)
    
    # 2. Extract pipeline steps
    imputer = pipeline.named_steps['imputer']
    scaler = pipeline.named_steps['scaler']
    classifier = pipeline.named_steps['clf']
    
    # 3. Load and preprocess background data (critical for accurate SHAP)
    X_bg_raw = get_background_data(disease_name)
    X_bg_imputed = imputer.transform(X_bg_raw)
    X_bg_scaled = scaler.transform(X_bg_imputed)
    
    # 4. Preprocess the patient data identically
    X_patient_imputed = imputer.transform(patient_features)
    X_patient_scaled = scaler.transform(X_patient_imputed)
    
    # 5. Create SHAP explainer with proper background reference
    explainer = shap.TreeExplainer(classifier, X_bg_scaled)
    shap_values = explainer.shap_values(X_patient_scaled, check_additivity=False)
    
    # 6. Handle output shape differences between model types
    if isinstance(shap_values, list):
        # Random Forest returns [class_0_values, class_1_values]
        impacts = shap_values[1][0]  # class 1 (Risk), first patient
    elif len(shap_values.shape) == 3:
        impacts = shap_values[0, :, 1]
    else:
        impacts = shap_values[0]
        
    # 7. Format into a clean dictionary
    explanation = {}
    for i, feature in enumerate(feature_names):
        explanation[feature] = round(float(impacts[i]), 5)
        
    # Sort by absolute magnitude of impact (most dangerous at the top)
    sorted_explanation = dict(sorted(explanation.items(), key=lambda item: abs(item[1]), reverse=True))
    
    return sorted_explanation

# Quick local test module if run directly
if __name__ == "__main__":
    test_disease = "Breast Cancer"
    test_patient = pd.DataFrame([{
        "odds_ratio": 1.4, 
        "risk_allele_freq": 0.45, 
        "chromosome": 17, 
        "position": 41223400  # BRCA1 region
    }])
    feature_cols = ["odds_ratio", "risk_allele_freq", "chromosome", "position"]
    
    try:
        print(f"[*] Running SHAP explanation for: {test_disease}")
        results = explain_prediction(test_disease, test_patient, feature_cols)
        print("\nSHAP Feature Importance (Impact on Risk %):")
        for k, v in results.items():
            direction = "increases risk" if v > 0 else "decreases risk"
            print(f"   {k}: {v:+.5f} ({direction})")
    except Exception as e:
        print(f"[!] Error: {e}")
