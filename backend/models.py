from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime

class Patient(Base):
    __tablename__ = "patient"
    patient_id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100))
    age = Column(Integer)
    gender = Column(String(10))

class Gene(Base):
    __tablename__ = "gene"
    gene_id = Column(Integer, primary_key=True, index=True)
    gene_name = Column(String, unique=True)
    description = Column(String)

class SNP(Base):
    __tablename__ = "snp"
    snp_id = Column(Integer, primary_key=True, index=True)
    rsid = Column(String(20), unique=True)
    gene_id = Column(Integer, ForeignKey("gene.gene_id"))
    chromosome = Column(Integer)
    position = Column(Integer)
    risk_allele = Column(String(1))
    odds_ratio = Column(Float)
    risk_allele_freq = Column(Float)
    p_value = Column(Float)
    is_significant = Column(Boolean, default=False)

class PatientSNP(Base):
    __tablename__ = "patient_snp"
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patient.patient_id"))
    snp_id = Column(Integer, ForeignKey("snp.snp_id"))
    patient_allele = Column(String(1))

class Disease(Base):
    __tablename__ = "disease"
    disease_id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100))
    description = Column(String)

class Prediction(Base):
    __tablename__ = "prediction"
    pred_id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patient.patient_id"))
    disease_id = Column(Integer, ForeignKey("disease.disease_id"))
    probability = Column(Float)
    risk_level = Column(String(20))
    timestamp = Column(DateTime, default=datetime.utcnow)
    
class DiseaseSNP(Base):
    __tablename__ = "disease_snp"

    id = Column(Integer, primary_key=True, index=True)
    disease_id = Column(Integer, ForeignKey("disease.disease_id"))
    snp_id = Column(Integer, ForeignKey("snp.snp_id"))

