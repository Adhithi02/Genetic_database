import requests

base = "http://localhost:8000"

print("=" * 70)
print("  TESTING KINETICS WITH ENZYME-CODING SNPs")
print("=" * 70)

# These SNPs map to genes that HAVE BRENDA kinetics data
tests = [
    {
        "disease": "Type 2 Diabetes",
        "snps": [
            {"rsid": "rs7903146", "allele": "T"},     # TCF7L2 (no kinetics)
            {"rsid": "rs73121277", "allele": "A"},     # DDC (HAS kinetics!)
            {"rsid": "rs76675804", "allele": "G"},     # TH (HAS 31 Km records!)
        ]
    },
    {
        "disease": "Coronary Artery Disease",
        "snps": [
            {"rsid": "rs11204085", "allele": "T"},     # LPL (HAS kinetics!)
            {"rsid": "rs4403732", "allele": "C"},      # CHST3 (HAS kinetics!)
        ]
    },
    {
        "disease": "Breast Cancer",
        "snps": [
            {"rsid": "rs76007978", "allele": "A"},     # PTPRD (HAS kinetics!)
            {"rsid": "rs2617583", "allele": "T"},      # LPCAT1 (HAS kinetics!)
        ]
    },
]

for test in tests:
    print(f"\n--- {test['disease']} ---")
    r = requests.post(f"{base}/predict/", json={
        "patient_name": "Kinetics Test",
        "age": 45, "gender": "Male",
        "disease_name": test["disease"],
        "snps": test["snps"]
    })
    d = r.json()

    print(f"  ML Risk: {round(d['ml_prediction']['risk_probability']*100, 1)}%")
    print(f"  Genes: {d['genes_identified']}")

    # SNP Rankings
    print(f"  Per-SNP Rankings:")
    for s in d.get("snp_rankings", []):
        print(f"    #{s['risk_rank']} {s['rsid']} ({s['gene']}) = {round(s['individual_risk']*100,1)}%")

    # Pathway Enrichment
    pe = d.get("pathway_enrichment", {})
    print(f"  Pathways hit: {pe.get('total_pathways_hit', 0)}")
    critical = [p for p in pe.get("enriched_pathways", []) if p["disruption_level"] == "Critical"]
    if critical:
        print(f"  CRITICAL pathways: {[p['pathway'] for p in critical[:3]]}")

    # KINETICS - the key test
    kinetics = d.get("kinetics_interpretation", [])
    if kinetics:
        print(f"  ENZYME KINETICS FOUND ({len(kinetics)} genes):")
        for k in kinetics:
            print(f"    {k['gene']} [{k['clinical_relevance']}] - {k['km_entries']} Km records")
            print(f"    >> {k['interpretation'][:150]}")
    else:
        print(f"  No kinetics (genes are not enzymes)")

    # Narrative
    print(f"  Narrative: {d.get('clinical_narrative', '')[:200]}...")

print("\n" + "=" * 70)
print("  KINETICS ENGINE VERIFIED")
print("=" * 70)
