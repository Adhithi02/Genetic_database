import json

with open("data/biology_reference.json", "r") as f:
    bio = json.load(f)

# Find genes with kinetics data
genes_with_kinetics = []
for gene, data in bio.items():
    kinetics = data.get("kinetics", [])
    if kinetics:
        genes_with_kinetics.append({
            "gene": gene,
            "km_count": len(kinetics),
            "sample": kinetics[0]["details"][:80] if kinetics else ""
        })

print(f"Total genes in biology_reference: {len(bio)}")
print(f"Genes WITH enzyme kinetics: {len(genes_with_kinetics)}")
print(f"Genes WITHOUT kinetics: {len(bio) - len(genes_with_kinetics)}")
print()

# Show top examples
genes_with_kinetics.sort(key=lambda x: x["km_count"], reverse=True)
print("Top genes with most kinetic records:")
for g in genes_with_kinetics[:15]:
    print(f"  {g['gene']:12s} — {g['km_count']} Km records — Sample: {g['sample']}")

# Now check which of these genes are in GWAS for each disease
import pandas as pd
df = pd.read_csv("../cleaned_gwas.csv")
kinetics_genes = set(g["gene"] for g in genes_with_kinetics)

print("\n\nGenes WITH kinetics that appear in GWAS per disease:")
for disease in df["disease"].unique():
    disease_genes = set()
    for g in df[df["disease"] == disease]["gene"].dropna().unique():
        for part in str(g).split("-"):
            disease_genes.add(part.strip().upper())
    overlap = kinetics_genes & disease_genes
    if overlap:
        print(f"\n  {disease}:")
        for gene in list(overlap)[:5]:
            rsids = df[(df["disease"] == disease) & (df["gene"].str.contains(gene, case=False, na=False))]["rsid"].head(2).tolist()
            print(f"    {gene} -> rsIDs: {rsids}")
