import pandas as pd
from sklearn.linear_model import LogisticRegression
from sqlalchemy.orm import joinedload
import pickle
from database import SessionLocal, mongo_db

def fetch_training_data():
    session = SessionLocal()
    # Join PatientSNP, SNP, Disease to get feature matrix - simplified example
    # For demo we assume a single disease, otherwise filter needed
    snps = session.query(SNP).all()
    snp_index = {snp.rsid: snp for snp in snps}

    # Query patient SNPs and build features by patient
    patient_snps = session.query(PatientSNP).options(joinedload(PatientSNP.snp)).all()

    data = {}
    for psnp in patient_snps:
        pid = psnp.patient_id
        rsid = psnp.snp.rsid
        snp_obj = snp_index.get(rsid)
        if not snp_obj:
            continue
        if pid not in data:
            data[pid] = {}
        # Encoding feature: odds ratio if risk allele present, else 1
        feature_val = snp_obj.odds_ratio if psnp.patient_allele == snp_obj.risk_allele else 1.0
        data[pid][rsid] = feature_val

    df = pd.DataFrame.from_dict(data, orient="index").fillna(1.0)
    # Ideally get labels from patient-disease relation, here simulated
    y = pd.Series([0]*len(df))  # Replace with real patient label extraction
    session.close()
    return df, y


def train_logistic_regression(X, y):
    model = LogisticRegression()
    model.fit(X, y)
    return model


def save_model_metadata(model):
    # Serialize model with pickle
    model_binary = pickle.dumps(model)
    mongo_db = mongo_db  # from db connection
    mongo_db.model_metadata.insert_one({
        "model": model_binary,
        "created_at": pd.Timestamp.now()
    })


def predict_risk(model, patient_features):
    proba = model.predict_proba([patient_features])[0, 1]
    return proba
