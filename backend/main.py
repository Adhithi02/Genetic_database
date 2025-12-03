from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from database import SessionLocal, genetic_inputs_collection
from models import Patient, Prediction, Disease, SNP, DiseaseSNP
from ml import FEATURE_COLUMNS, load_latest_model, predict_risk
import uvicorn
import pandas as pd

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

_model_cache: dict[str, object] = {"model": None, "metadata": None}


# Pydantic schemas
class PatientCreate(BaseModel):
    name: str
    age: int
    gender: str


class SNPInput(BaseModel):
    rsid: str
    allele: str


class PredictRequest(BaseModel):
    patient: PatientCreate
    snps: list[SNPInput]
    disease_name: str


def _ensure_model_loaded():
    if _model_cache["model"] is None:
        model, metadata = load_latest_model()
        _model_cache["model"] = model
        _model_cache["metadata"] = metadata
    return _model_cache


def _build_patient_feature_vector(
    session,
    snps: list[SNPInput],
    disease_id: int | None = None,
) -> list[float]:
    """
    Build patient feature vector by aggregating their SNPs.
    Filters SNPs to those linked with the disease (if mappings exist) and then
    uses a weighted average based on odds_ratio to emphasize high-risk SNPs.
    """
    odds_vals, freq_vals, chrom_vals, pos_vals = [], [], [], []
    matched_snps = 0
    allowed_snp_ids: set[int] | None = None

    if disease_id is not None:
        allowed_snp_ids = {
            row.snp_id for row in session.query(DiseaseSNP.snp_id).filter(DiseaseSNP.disease_id == disease_id)
        }
        if not allowed_snp_ids:
            print(
                f"[DEBUG] No disease-specific SNP mappings found for disease_id={disease_id}; "
                "patient SNPs will be ignored."
            )

    for snp in snps:
        record = session.query(SNP).filter(SNP.rsid == snp.rsid).first()
        if not record:
            continue
        if allowed_snp_ids is not None and record.snp_id not in allowed_snp_ids:
            continue
        matched_snps += 1
        odds_vals.append(record.odds_ratio or 1.0)
        freq_vals.append(record.risk_allele_freq or 0.0)
        try:
            chrom = float(record.chromosome) if record.chromosome else 0.0
        except ValueError:
            chrom = 0.0
        chrom_vals.append(chrom)
        pos_vals.append(float(record.position or 0.0))

    if matched_snps == 0:
        # No SNPs matched - return default values matching training distribution
        # Use median/default values that match typical SNP characteristics
        return [1.0, 0.0, 0.0, 0.0]

    # Weighted average: weight by odds_ratio to emphasize high-risk SNPs
    weights = [max(1.0, abs(o - 1.0)) for o in odds_vals]  # Higher weight for non-neutral odds ratios
    total_weight = sum(weights)
    
    if total_weight == 0:
        total_weight = len(weights)
        weights = [1.0] * len(weights)

    def _weighted_avg(values, weights, default):
        if not values:
            return default
        return sum(v * w for v, w in zip(values, weights)) / total_weight

    features = [
        _weighted_avg(odds_vals, weights, 1.0),
        _weighted_avg(freq_vals, weights, 0.0),
        _weighted_avg(chrom_vals, weights, 0.0),
        _weighted_avg(pos_vals, weights, 0.0),
    ]
    
    print(
        f"[DEBUG] Matched {matched_snps}/{len(snps)} SNPs "
        f"({'disease-filtered' if disease_id else 'all'}) -> features: {features}"
    )
    return features


@app.on_event("startup")
def _warm_model_cache():
    try:
        _ensure_model_loaded()
    except RuntimeError:
        # Allow startup even if model isn't ready; endpoints will raise clean errors.
        pass


@app.post("/init/")
def initialize():
    """Confirm a trained model exists without retraining the pipeline."""
    try:
        cache = _ensure_model_loaded()
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc))
    return {
        "message": "Model metadata loaded",
        "model_id": str(cache["metadata"]["_id"]),
        "trained_at": cache["metadata"]["created_at"],
    }


@app.post("/predict/")
def predict(data: PredictRequest):
    session = SessionLocal()
    try:
        cache = _ensure_model_loaded()
    except RuntimeError as exc:
        session.close()
        raise HTTPException(status_code=503, detail=str(exc))

    try:
        patient = Patient(name=data.patient.name, age=data.patient.age, gender=data.patient.gender)
        session.add(patient)
        session.commit()

        disease = session.query(Disease).filter(Disease.name == data.disease_name).first()
        if not disease:
            disease = Disease(name=data.disease_name, description="")
            session.add(disease)
            session.commit()

        features = _build_patient_feature_vector(session, data.snps, disease_id=disease.disease_id)
        feature_payload = dict(zip(FEATURE_COLUMNS, features))

        doc = {
            "patient_id": patient.patient_id,
            "upload_time": pd.Timestamp.now().isoformat(),
            "raw_snps": {snp.rsid: snp.allele for snp in data.snps},
            "derived_features": feature_payload,
            "model_id": str(cache["metadata"]["_id"]),
            "source": "user_input",
        }
        genetic_inputs_collection.insert_one(doc)

        proba = predict_risk(cache["model"], features)

        prediction = Prediction(
            patient_id=patient.patient_id,
            disease_id=disease.disease_id,
            probability=proba,
            risk_level="High" if proba > 0.5 else "Low",
        )
        session.add(prediction)
        session.commit()

        return {
            "patient_id": patient.patient_id,
            "disease": data.disease_name,
            "risk_probability": proba,
            "model_id": str(cache["metadata"]["_id"]),
        }
    finally:
        session.close()


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
