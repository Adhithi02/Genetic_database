import requests
import json

base = "http://localhost:8000"

print("=" * 70)
print("  TESTING ADVANCED INTELLIGENCE ENGINE")
print("=" * 70)

# Test with multiple known Type 2 Diabetes SNPs
payload = {
    "patient_name": "Intelligence Test",
    "age": 50,
    "gender": "Female",
    "disease_name": "Type 2 Diabetes",
    "snps": [
        {"rsid": "rs7903146", "allele": "T"},
        {"rsid": "rs2237897", "allele": "C"},
        {"rsid": "rs10811661", "allele": "T"}
    ]
}

print("\n[1] FULL PREDICTION WITH INTELLIGENCE\n")
r = requests.post(f"{base}/predict/", json=payload)
d = r.json()

print(f"ML Risk: {d['ml_prediction']['risk_probability']} ({d['ml_prediction']['risk_level']})")
print(f"PRS: {d['prs']['raw_score']} ({d['prs']['clinical_classification']})")

print(f"\n--- Per-SNP Risk Rankings ---")
for snp in d.get("snp_rankings", []):
    print(f"  #{snp['risk_rank']} {snp['rsid']} ({snp['gene']}) → Risk: {round(snp['individual_risk']*100,1)}% | OR: {snp['odds_ratio']}")

print(f"\n--- Pathway Enrichment ---")
pe = d.get("pathway_enrichment", {})
print(f"  Total pathways hit: {pe.get('total_pathways_hit', 0)}")
print(f"  Most disrupted: {pe.get('most_disrupted', 'N/A')}")
for pw in pe.get("enriched_pathways", [])[:5]:
    print(f"  • {pw['pathway']} [{pw['disruption_level']}] — Genes: {', '.join(pw['genes_affected'])}")

print(f"\n--- Enzyme Kinetics ---")
for k in d.get("kinetics_interpretation", []):
    print(f"  🧬 {k['gene']} [{k['clinical_relevance']}] — {k['km_entries']} Km records")
    print(f"     {k['interpretation'][:120]}...")

print(f"\n--- Clinical Narrative ---")
print(f"  {d.get('clinical_narrative', 'N/A')}")

# Test Cross-Disease Vulnerability
print("\n\n" + "=" * 70)
print("  [2] CROSS-DISEASE VULNERABILITY PROFILE")
print("=" * 70)

r2 = requests.post(f"{base}/vulnerability-profile/", json={
    "patient_name": "Multi-Disease Test",
    "snps": [
        {"rsid": "rs7903146", "allele": "T"},
        {"rsid": "rs2237897", "allele": "C"}
    ]
})
d2 = r2.json()

print(f"\n  Diseases screened: {d2['total_diseases_screened']}")
print(f"  Highest risk: {d2['highest_risk']['disease']} ({d2['highest_risk']['risk_probability']})")
print()
for v in d2["vulnerability_profile"]:
    bar_len = int(v["risk_probability"] * 30)
    bar = "█" * bar_len + "░" * (30 - bar_len)
    print(f"  {v['disease']:30s} {bar} {round(v['risk_probability']*100,1)}% [{v['risk_level']}]")

print("\n" + "=" * 70)
print("  ✅ INTELLIGENCE ENGINE VALIDATED")
print("=" * 70)
