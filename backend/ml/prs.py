import pandas as pd

print("="*60)
print("🧬 System: Polygenic Risk Score (PRS) Engine Initialized 🧬")
print("="*60)

def calculate_prs(patient_snps: pd.DataFrame) -> dict:
    """
    Calculates the traditional clinical Polygenic Risk Score (PRS).
    
    This acts as a non-ML baseline to compare our XGBoost/Random Forest models against.
    Standard clinical formula: Sum of (Natural Log of Odds Ratio) * (Number of Risk Alleles)
    For simplicity with our current GWAS format: Sum of (Odds_Ratio * Risk_Allele_Freq) 
    scaled to the patient's individual mutation load.
    
    Args:
        patient_snps (pd.DataFrame): Dataframe of the patient's mutated SNPs.
        Must contain 'odds_ratio' and 'risk_allele_freq' columns.
        
    Returns:
        dict: Raw clinical score and normalized qualitative string.
    """
    if patient_snps.empty:
        return {"raw_score": 0.0, "clinical_classification": "No Risk Data"}
        
    import numpy as np
    
    # Clean standard features
    df = patient_snps.copy()
    df["odds_ratio"] = pd.to_numeric(df["odds_ratio"], errors="coerce").fillna(1.0)
    df["risk_allele_freq"] = pd.to_numeric(df["risk_allele_freq"], errors="coerce").fillna(0.0)
    
    # Standard clinical PRS formula: Σ ln(OR) * dosage
    # ln(OR) converts multiplicative risk to additive log-risk
    # risk_allele_freq acts as allele dosage proxy (0 to 1)
    df["log_or"] = np.log(df["odds_ratio"].clip(lower=0.01))
    prs_score = (df["log_or"] * df["risk_allele_freq"]).sum()
    
    # Classification thresholds calibrated for log-scale PRS
    if prs_score > 0.5:
        classification = "High Clinical Risk (90th Percentile)"
    elif prs_score > 0.15:
        classification = "Moderate Clinical Risk (50th Percentile)"
    else:
        classification = "Low Clinical Risk (10th Percentile)"
        
    return {
        "raw_score": round(float(prs_score), 3),
        "clinical_classification": classification
    }

# Quick local test module if run directly
if __name__ == "__main__":
    # Simulate a patient who has 3 dangerous SNPs
    test_patient = pd.DataFrame([
        {"odds_ratio": 1.2, "risk_allele_freq": 0.25},
        {"odds_ratio": 2.1, "risk_allele_freq": 0.45},
        {"odds_ratio": 1.5, "risk_allele_freq": 0.30}
    ])
    
    print("[*] Calculating PRS for simulated patient block...")
    result = calculate_prs(test_patient)
    print(f"    Raw Score: {result['raw_score']}")
    print(f"    Category: {result['clinical_classification']}")
