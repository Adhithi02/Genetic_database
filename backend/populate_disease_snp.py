import csv
from sqlalchemy.orm import Session
from database import SessionLocal
from models import SNP, Disease, DiseaseSNP


CSV_FILE = r"E:\Desktop\DBMS Lab\genetic-risk-project\cleaned_gwas.csv"   # <-- your 80% dataset


def populate_disease_snp():
    db: Session = SessionLocal()

    with open(CSV_FILE, "r") as f:
        reader = csv.DictReader(f)

        for row in reader:
            rsid = row["rsid"]
            disease_name = row["disease"]

            # 1. FIND SNP in the DB (these already exist)
            snp = db.query(SNP).filter_by(rsid=rsid).first()
            if not snp:
                print(f"Skipping {rsid} — SNP not found in DB.")
                continue

            # 2. FIND/CREATE disease
            disease = db.query(Disease).filter_by(name=disease_name).first()
            if not disease:
                # Your DB might not have diseases yet, so create them
                disease = Disease(name=disease_name, description="")
                db.add(disease)
                db.commit()
                db.refresh(disease)

            # 3. CHECK if link already exists
            exists = db.query(DiseaseSNP).filter_by(
                disease_id=disease.disease_id,
                snp_id=snp.snp_id
            ).first()

            if exists:
                continue

            # 4. INSERT link
            link = DiseaseSNP(
                disease_id=disease.disease_id,
                snp_id=snp.snp_id
            )
            db.add(link)
            db.commit()

            print(f"Linked SNP {rsid} → Disease {disease_name}")

    db.close()
    print("\n✔ Completed linking SNPs to diseases!")


if __name__ == "__main__":
    populate_disease_snp()
