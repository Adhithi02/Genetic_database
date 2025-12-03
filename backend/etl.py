import pandas as pd
from sklearn.model_selection import train_test_split
from database import SessionLocal
from models import Gene, SNP, Disease
from sqlalchemy.exc import IntegrityError


def _safe_float(value, default=None):
    try:
        if value == "" or value is None:
            return default
        return float(value)
    except (TypeError, ValueError):
        return default


def _safe_int(value, default=None):
    try:
        if value == "" or value is None:
            return default
        return int(float(value))
    except (TypeError, ValueError):
        return default

def clean_and_split_dataset(file_path):
    df = pd.read_csv(file_path)

    # IMPORTANT: Don't filter for significant SNPs here - we need both classes for training!
    # The model needs to learn the difference between significant and non-significant SNPs
    # Filtering here would make all training data have is_significant=True, causing the model
    # to always predict the same class
    
    # Get unique diseases for Disease table
    diseases = df["disease"].unique()

    # Create disease DataFrame for insertion
    disease_rows = [{"name": dis, "description": ""} for dis in diseases]

    train_df, test_df = train_test_split(df, test_size=0.2, random_state=42)
    return train_df, test_df, disease_rows


def populate_sql_from_train(train_df, disease_rows):
    """Bulk insert training data into SQL database with batching to avoid connection timeouts."""
    session = SessionLocal()
    BATCH_SIZE = 1000  # Commit every 1000 rows
    
    try:
        # Bulk insert diseases
        existing_diseases = {d.name for d in session.query(Disease.name).all()}
        new_diseases = [
            Disease(name=d["name"], description=d["description"])
            for d in disease_rows
            if d["name"] not in existing_diseases
        ]
        if new_diseases:
            session.bulk_save_objects(new_diseases)
            session.commit()
            print(f"Inserted {len(new_diseases)} diseases")

        # Get all existing genes in one query
        existing_genes = {g.gene_name: g for g in session.query(Gene).all()}
        
        # Prepare gene data
        unique_genes = train_df["gene"].unique()
        genes_to_insert = []
        for gene_name in unique_genes:
            if gene_name not in existing_genes:
                genes_to_insert.append({"gene_name": gene_name, "description": ""})
        
        # Bulk insert new genes
        if genes_to_insert:
            session.bulk_insert_mappings(Gene, genes_to_insert)
            session.commit()
            print(f"Inserted {len(genes_to_insert)} genes")
            # Refresh cache
            existing_genes = {g.gene_name: g for g in session.query(Gene).all()}

        # Get existing SNPs to avoid duplicates
        existing_snp_rsids = {rsid for rsid, in session.query(SNP.rsid).all()}
        
        # Prepare SNP data in batches
        snps_to_insert = []
        gene_id_map = {g.gene_name: g.gene_id for g in existing_genes.values()}
        
        for idx, row in train_df.iterrows():
            rsid = row["rsid"]
            if rsid in existing_snp_rsids:
                continue
                
            gene_name = row["gene"]
            gene_id = gene_id_map.get(gene_name)
            if not gene_id:
                continue  # Skip if gene not found
                
            snps_to_insert.append({
                "rsid": rsid,
                "gene_id": gene_id,
                "chromosome": str(row.get("chromosome", "")),
                "position": _safe_int(row.get("position")),
                "risk_allele": str(row.get("risk_allele", "") or "").upper()[:1],
                "odds_ratio": _safe_float(row.get("odds_ratio"), default=1.0),
                "risk_allele_freq": _safe_float(row.get("risk_allele_freq"), default=0.0),
                "p_value": _safe_float(row.get("p_value"), default=None),
                "is_significant": bool(row.get("is_significant", False)),
            })
            
            # Commit in batches to avoid long transactions
            if len(snps_to_insert) >= BATCH_SIZE:
                session.bulk_insert_mappings(SNP, snps_to_insert)
                session.commit()
                print(f"Inserted batch of {len(snps_to_insert)} SNPs...")
                snps_to_insert = []
        
        # Insert remaining SNPs
        if snps_to_insert:
            session.bulk_insert_mappings(SNP, snps_to_insert)
            session.commit()
            print(f"Inserted final batch of {len(snps_to_insert)} SNPs")
        
        print(f"Total SNPs inserted: {len(train_df)} (excluding duplicates)")
        
    except IntegrityError as e:
        session.rollback()
        print(f"Integrity error (some rows may already exist): {e}")
    except Exception as e:
        session.rollback()
        print(f"Error during bulk insert: {e}")
        raise
    finally:
        session.close()
