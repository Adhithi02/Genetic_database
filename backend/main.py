from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

import uvicorn
import pandas as pd
import numpy as np
import os
import sys
import json
import pickle

# Add ml/ directory to Python path so we can import xai and prs
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "ml"))
from xai import explain_prediction
from prs import calculate_prs

app = FastAPI(
    title="AI-Assisted Genomic Analysis API",
    description="Precision medicine platform for multi-disease genomic risk prediction with biological interpretation.",
    version="2.0"
)

FEATURE_COLUMNS = ["odds_ratio", "risk_allele_freq", "chromosome", "position"]

TARGET_DISEASES = [
    "Type 2 Diabetes",
    "Coronary Artery Disease",
    "Breast Cancer",
    "Hypertension"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory data stores (loaded at startup)
_model_cache: dict[str, object] = {}
_biology_ref: dict = {}
_gwas_df: pd.DataFrame = pd.DataFrame()


# ---------- Pydantic Schemas ----------

class SNPInput(BaseModel):
    rsid: str
    allele: str = ""

class PredictRequest(BaseModel):
    patient_name: str
    age: int
    gender: str
    snps: list[SNPInput]
    disease_name: str

class InterpretRequest(BaseModel):
    gene_symbols: list[str]

class NetworkRequest(BaseModel):
    disease_name: str
    snps: list[SNPInput]


# ---------- Startup: Load everything into memory ----------

@app.on_event("startup")
def load_resources():
    global _biology_ref, _gwas_df

    base_dir = os.path.dirname(__file__)

    # 1. Load GWAS dataset (replaces PostgreSQL)
    gwas_path = os.path.join(base_dir, "..", "cleaned_gwas.csv")
    if os.path.exists(gwas_path):
        _gwas_df = pd.read_csv(gwas_path)
        # Clean numeric columns once
        _gwas_df["odds_ratio"] = pd.to_numeric(_gwas_df["odds_ratio"], errors="coerce").fillna(1.0)
        _gwas_df["risk_allele_freq"] = pd.to_numeric(_gwas_df["risk_allele_freq"], errors="coerce").fillna(0.0)
        _gwas_df["chromosome"] = pd.to_numeric(_gwas_df["chromosome"], errors="coerce").fillna(0.0)
        _gwas_df["position"] = pd.to_numeric(_gwas_df["position"], errors="coerce").fillna(0.0)
        print(f"[Startup] Loaded GWAS dataset: {len(_gwas_df)} SNP records")
    else:
        print(f"[Startup] Warning: {gwas_path} not found.")

    # 2. Load biology_reference.json
    bio_path = os.path.join(base_dir, "data", "biology_reference.json")
    if os.path.exists(bio_path):
        with open(bio_path, "r", encoding="utf-8") as f:
            _biology_ref = json.load(f)
        print(f"[Startup] Loaded biology reference: {len(_biology_ref)} genes")
    else:
        print(f"[Startup] Warning: {bio_path} not found.")

    # 3. Load all 4 local .pkl models
    models_dir = os.path.join(base_dir, "ml", "models")
    for disease_name in TARGET_DISEASES:
        safe_name = disease_name.replace(" ", "_").lower()
        model_path = os.path.join(models_dir, f"{safe_name}_model.pkl")
        if os.path.exists(model_path):
            with open(model_path, "rb") as f:
                _model_cache[disease_name] = pickle.load(f)
            print(f"[Startup] Loaded model: {disease_name}")
        else:
            print(f"[Startup] Warning: Model not found for {disease_name}")


# ---------- Helpers ----------

def lookup_snps(snp_rsids: list[str], disease_name: str) -> pd.DataFrame:
    """
    Looks up SNP data from the in-memory GWAS dataframe (replaces PostgreSQL queries).
    Filters to only SNPs associated with the requested disease.
    """
    if _gwas_df.empty:
        return pd.DataFrame()

    # Filter by disease and match rsids
    disease_df = _gwas_df[_gwas_df["disease"] == disease_name]
    matched = disease_df[disease_df["rsid"].isin(snp_rsids)]
    return matched


def build_features_from_snps(matched_df: pd.DataFrame) -> list[float]:
    """
    Aggregates matched SNP records into a single feature vector for the ML model.
    Uses weighted averaging to emphasize high-risk SNPs.
    """
    if matched_df.empty:
        return [1.0, 0.0, 0.0, 0.0]

    weights = [max(1.0, abs(o - 1.0)) for o in matched_df["odds_ratio"]]
    total_weight = sum(weights) or 1.0

    features = [
        sum(v * w for v, w in zip(matched_df["odds_ratio"], weights)) / total_weight,
        sum(v * w for v, w in zip(matched_df["risk_allele_freq"], weights)) / total_weight,
        sum(v * w for v, w in zip(matched_df["chromosome"], weights)) / total_weight,
        sum(v * w for v, w in zip(matched_df["position"], weights)) / total_weight,
    ]
    return features


# ---------- Endpoints ----------

@app.get("/")
def root():
    return {
        "project": "AI-Assisted Genomic Analysis for Universal Healthcare",
        "version": "2.0",
        "diseases_supported": TARGET_DISEASES,
        "models_loaded": list(_model_cache.keys()),
        "biology_genes_loaded": len(_biology_ref),
        "gwas_records_loaded": len(_gwas_df),
    }


@app.get("/diseases/")
def list_diseases():
    return {"diseases": TARGET_DISEASES}


@app.post("/predict/")
def predict(data: PredictRequest):
    """
    Full prediction pipeline: ML Risk + SHAP Explainability + PRS Clinical Score.
    100% local, no database required.
    """
    if data.disease_name not in TARGET_DISEASES:
        raise HTTPException(status_code=400, detail=f"Unsupported disease: {data.disease_name}. Supported: {TARGET_DISEASES}")

    if data.disease_name not in _model_cache:
        raise HTTPException(status_code=503, detail=f"Model not loaded for {data.disease_name}")

    # 1. Look up patient SNPs from in-memory GWAS data
    rsid_list = [s.rsid for s in data.snps]
    matched_df = lookup_snps(rsid_list, data.disease_name)

    # 2. Build aggregated features
    features = build_features_from_snps(matched_df)

    # 3. ML Prediction
    model = _model_cache[data.disease_name]
    feature_array = np.array([features], dtype=float)
    proba = float(model.predict_proba(feature_array)[0, 1])

    # 4. SHAP Explanation
    patient_df = pd.DataFrame([dict(zip(FEATURE_COLUMNS, features))])
    try:
        shap_explanation = explain_prediction(data.disease_name, patient_df, FEATURE_COLUMNS)
    except Exception as e:
        shap_explanation = {"error": str(e)}

    # 5. PRS Clinical Score
    prs_result = calculate_prs(matched_df) if not matched_df.empty else {"raw_score": 0.0, "clinical_classification": "No Risk Data"}

    # 6. Collect gene info from matched SNPs
    genes_found = []
    if not matched_df.empty and "gene" in matched_df.columns:
        genes_found = matched_df["gene"].dropna().unique().tolist()

    return {
        "patient": {
            "name": data.patient_name,
            "age": data.age,
            "gender": data.gender,
        },
        "disease": data.disease_name,
        "ml_prediction": {
            "risk_probability": round(proba, 4),
            "risk_level": "High" if proba > 0.5 else "Low",
        },
        "shap_explanation": shap_explanation,
        "prs": prs_result,
        "matched_snps": len(matched_df),
        "total_snps_submitted": len(data.snps),
        "genes_identified": genes_found,
    }


@app.post("/interpret/")
def interpret(data: InterpretRequest):
    """
    Returns biological interpretation: Gene -> Pathways + Kinetics.
    Reads from the in-memory biology_reference.json dictionary.
    """
    if not _biology_ref:
        raise HTTPException(status_code=503, detail="Biology reference not loaded.")

    results = {}
    for gene in data.gene_symbols:
        # Handle composite gene names like "HEATR4 - ACOT2"
        gene_parts = [g.strip() for g in gene.split("-")]
        for g in gene_parts:
            g_upper = g.strip().upper()
            if g_upper in _biology_ref:
                results[g_upper] = _biology_ref[g_upper]
            else:
                results[g_upper] = {"pathways": [], "kinetics": [], "note": "Gene not found in biological reference."}

    return {"interpretations": results}


@app.post("/network/")
def generate_network(data: NetworkRequest):
    """
    Generates Node/Edge graph JSON for the interactive Genomic Vulnerability Network.
    Maps: Patient SNPs -> Genes -> Pathways -> Disease.
    """
    if data.disease_name not in TARGET_DISEASES:
        raise HTTPException(status_code=400, detail=f"Unsupported disease: {data.disease_name}")

    if not _biology_ref:
        raise HTTPException(status_code=503, detail="Biology reference not loaded.")

    rsid_list = [s.rsid for s in data.snps]
    matched_df = lookup_snps(rsid_list, data.disease_name)

    nodes = []
    links = []
    seen_nodes = set()

    # Disease node (center)
    disease_node_id = f"disease_{data.disease_name}"
    nodes.append({"id": disease_node_id, "label": data.disease_name, "type": "disease", "size": 20})
    seen_nodes.add(disease_node_id)

    if matched_df.empty:
        return {"nodes": nodes, "links": links, "disease": data.disease_name}

    for _, row in matched_df.iterrows():
        rsid = row.get("rsid", "")
        gene = row.get("gene", None)

        # SNP node
        snp_node_id = f"snp_{rsid}"
        if snp_node_id not in seen_nodes:
            nodes.append({
                "id": snp_node_id,
                "label": rsid,
                "type": "snp",
                "odds_ratio": round(float(row.get("odds_ratio", 1.0)), 3),
                "size": 8,
            })
            seen_nodes.add(snp_node_id)

        if gene and pd.notna(gene):
            gene_parts = [g.strip() for g in str(gene).split("-")]
            for gene_symbol in gene_parts:
                gene_node_id = f"gene_{gene_symbol}"

                if gene_node_id not in seen_nodes:
                    bio = _biology_ref.get(gene_symbol, {})
                    kinetics = bio.get("kinetics", [])
                    pathways = bio.get("pathways", [])

                    nodes.append({
                        "id": gene_node_id,
                        "label": gene_symbol,
                        "type": "gene",
                        "has_kinetics": len(kinetics) > 0,
                        "kinetics_count": len(kinetics),
                        "pathway_count": len(pathways),
                        "size": 12,
                    })
                    seen_nodes.add(gene_node_id)

                    # Gene -> Pathway links (top 5 for readability)
                    for pathway_name in pathways[:5]:
                        pathway_node_id = f"pathway_{pathway_name}"
                        if pathway_node_id not in seen_nodes:
                            nodes.append({
                                "id": pathway_node_id,
                                "label": pathway_name,
                                "type": "pathway",
                                "size": 10,
                            })
                            seen_nodes.add(pathway_node_id)
                        links.append({"source": gene_node_id, "target": pathway_node_id, "type": "gene_pathway"})

                        # Pathway -> Disease link
                        link_key = f"{pathway_node_id}->{disease_node_id}"
                        if link_key not in seen_nodes:
                            links.append({"source": pathway_node_id, "target": disease_node_id, "type": "pathway_disease"})
                            seen_nodes.add(link_key)

                # SNP -> Gene link
                links.append({"source": snp_node_id, "target": gene_node_id, "type": "snp_gene"})

    return {"nodes": nodes, "links": links, "disease": data.disease_name}


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
