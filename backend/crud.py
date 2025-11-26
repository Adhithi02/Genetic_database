from sqlalchemy.orm import Session
from models import Patient, Gene, SNP, PatientSNP, Disease, Prediction

# Patient CRUD

def create_patient(db: Session, name: str, age: int, gender: str) -> Patient:
    patient = Patient(name=name, age=age, gender=gender)
    db.add(patient)
    db.commit()
    db.refresh(patient)
    return patient

def get_patient(db: Session, patient_id: int) -> Patient | None:
    return db.query(Patient).filter(Patient.patient_id == patient_id).first()

# Gene CRUD

def get_or_create_gene(db: Session, gene_name: str, description: str = "") -> Gene:
    gene = db.query(Gene).filter(Gene.gene_name == gene_name).first()
    if not gene:
        gene = Gene(gene_name=gene_name, description=description)
        db.add(gene)
        db.commit()
        db.refresh(gene)
    return gene

# SNP CRUD

def get_snp_by_rsid(db: Session, rsid: str) -> SNP | None:
    return db.query(SNP).filter(SNP.rsid == rsid).first()

def create_snp(db: Session, rsid: str, gene_id: int, chromosome: str, position: int, risk_allele: str, odds_ratio: float) -> SNP:
    snp = SNP(rsid=rsid, gene_id=gene_id, chromosome=chromosome, position=position, risk_allele=risk_allele, odds_ratio=odds_ratio)
    db.add(snp)
    db.commit()
    db.refresh(snp)
    return snp

# PatientSNP CRUD

def create_patient_snp(db: Session, patient_id: int, snp_id: int, patient_allele: str) -> PatientSNP:
    psnp = PatientSNP(patient_id=patient_id, snp_id=snp_id, patient_allele=patient_allele)
    db.add(psnp)
    db.commit()
    db.refresh(psnp)
    return psnp

def get_patient_snps(db: Session, patient_id: int) -> list[PatientSNP]:
    return db.query(PatientSNP).filter(PatientSNP.patient_id == patient_id).all()

# Disease CRUD

def get_or_create_disease(db: Session, name: str, description: str = "") -> Disease:
    disease = db.query(Disease).filter(Disease.name == name).first()
    if not disease:
        disease = Disease(name=name, description=description)
        db.add(disease)
        db.commit()
        db.refresh(disease)
    return disease

# Prediction CRUD

def create_prediction(db: Session, patient_id: int, disease_id: int, probability: float, risk_level: str) -> Prediction:
    prediction = Prediction(patient_id=patient_id, disease_id=disease_id, probability=probability, risk_level=risk_level)
    db.add(prediction)
    db.commit()
    db.refresh(prediction)
    return prediction

def get_predictions_by_patient(db: Session, patient_id: int) -> list[Prediction]:
    return db.query(Prediction).filter(Prediction.patient_id == patient_id).all()
