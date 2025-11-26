from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from database import SessionLocal, genetic_inputs_collection
from models import Patient, Prediction, Disease
from ml import train_logistic_regression, predict_risk, save_model_metadata, fetch_training_data
from etl import clean_and_split_dataset, populate_sql_from_train
import uvicorn
import pandas as pd

app = FastAPI()

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

@app.post("/init/")
def initialize():
    file_path='E:\Desktop\DBMS Lab\genetic-risk-project\cleaned_gwas.csv'
    train_df, test_df, diseases = clean_and_split_dataset(file_path)
    populate_sql_from_train(train_df, diseases)

    X_train, y_train = fetch_training_data()
    model = train_logistic_regression(X_train, y_train)
    save_model_metadata(model)
    
    return {"message": "Initialized and trained model"}

@app.post("/predict/")
def predict(data: PredictRequest):
    session = SessionLocal()

    # Add Patient
    patient = Patient(name=data.patient.name, age=data.patient.age, gender=data.patient.gender)
    session.add(patient)
    session.commit()

    # Insert genetic input to MongoDB raw
    doc = {
        "patient_id": patient.patient_id,
        "upload_time": pd.Timestamp.now().isoformat(),
        "raw_snps": {snp.rsid: snp.allele for snp in data.snps},
        "source": "user_input"
    }
    genetic_inputs_collection.insert_one(doc)

    # Build patient feature vector
    from ml import mongo_db
    model_meta = mongo_db.model_metadata.find().sort("created_at",-1).limit(1)[0]
    import pickle
    model = pickle.loads(model_meta["model"])

    session.close()
    # Create SNP features vector - simplified; full vector creation requires SNP reference from DB
    features = [1.0] * 50  # Placeholder: map actual SNPs here
    proba = predict_risk(model, features)

    # Store prediction
    disease = session.query(Disease).filter(Disease.name == data.disease_name).first()
    if not disease:
        disease = Disease(name=data.disease_name, description="")
        session.add(disease)
        session.commit()
    prediction = Prediction(patient_id=patient.patient_id, disease_id=disease.disease_id, probability=proba, risk_level="High" if proba>0.5 else "Low")
    session.add(prediction)
    session.commit()
    session.close()

    return {"patient_id": patient.patient_id, "disease": data.disease_name, "risk_probability": proba}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
