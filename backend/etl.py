import pandas as pd
from sklearn.model_selection import train_test_split
from database import SessionLocal
from models import Patient, Gene, SNP, Disease, PatientSNP
from sqlalchemy.exc import IntegrityError

def clean_and_split_dataset(file_path):
    df = pd.read_csv(file_path)

    # Filter significant SNPs only for simplicity
    df = df[df["is_significant"] == True]

    # Get unique diseases for Disease table
    diseases = df["disease"].unique()

    # Create disease DataFrame for insertion
    disease_rows = [{"name": dis, "description": ""} for dis in diseases]

    train_df, test_df = train_test_split(df, test_size=0.2, random_state=42)
    return train_df, test_df, disease_rows


def populate_sql_from_train(train_df, disease_rows):
    session = SessionLocal()
    try:
        # Insert diseases
        for d in disease_rows:
            if not session.query(Disease).filter(Disease.name == d["name"]).first():
                session.add(Disease(name=d["name"], description=d["description"]))
        session.commit()

        # Insert Genes & SNPs
        genes_cache = {}
        for _, row in train_df.iterrows():
            gene_name = row["gene"]
            if gene_name not in genes_cache:
                gene = session.query(Gene).filter_by(gene_name=gene_name).first()
                if not gene:
                    gene = Gene(gene_name=gene_name, description="")
                    session.add(gene)
                    session.flush()
                genes_cache[gene_name] = gene

            gene = genes_cache[gene_name]

            # SNP entry
            snp = session.query(SNP).filter(SNP.rsid == row["rsid"]).first()
            if not snp:
                snp = SNP(
                    rsid=row["rsid"], gene_id=gene.gene_id, chromosome=row["chromosome"],
                    position=int(row["position"]), risk_allele=row["risk_allele"],
                    odds_ratio=float(row["odds_ratio"])
                )
                session.add(snp)
        session.commit()
    except IntegrityError:
        session.rollback()
    finally:
        session.close()
