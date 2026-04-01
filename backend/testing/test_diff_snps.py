import requests
import json

base = "http://localhost:8000"

print("=" * 60)
print("TEST 1: Known Type 2 Diabetes SNP (rs7903146)")
print("=" * 60)
r1 = requests.post(f"{base}/predict/", json={
    "patient_name": "Test A", "age": 45, "gender": "Male",
    "disease_name": "Type 2 Diabetes",
    "snps": [{"rsid": "rs7903146", "allele": "T"}]
})
d1 = r1.json()
print(f"  Risk: {d1['ml_prediction']['risk_probability']} ({d1['ml_prediction']['risk_level']})")
print(f"  Matched: {d1['matched_snps']}, Cross: {d1.get('cross_disease_snps', 0)}")
print(f"  SNP Details: {d1.get('snp_details', {})}")

print()
print("=" * 60)
print("TEST 2: Different known SNP (rs10811661)")
print("=" * 60)
r2 = requests.post(f"{base}/predict/", json={
    "patient_name": "Test B", "age": 45, "gender": "Male",
    "disease_name": "Type 2 Diabetes",
    "snps": [{"rsid": "rs10811661", "allele": "T"}]
})
d2 = r2.json()
print(f"  Risk: {d2['ml_prediction']['risk_probability']} ({d2['ml_prediction']['risk_level']})")
print(f"  Matched: {d2['matched_snps']}, Cross: {d2.get('cross_disease_snps', 0)}")
print(f"  SNP Details: {d2.get('snp_details', {})}")

print()
print("=" * 60)
print("TEST 3: Random/unknown SNP (rs9999999)")
print("=" * 60)
r3 = requests.post(f"{base}/predict/", json={
    "patient_name": "Test C", "age": 45, "gender": "Male",
    "disease_name": "Type 2 Diabetes",
    "snps": [{"rsid": "rs9999999", "allele": "A"}]
})
d3 = r3.json()
print(f"  Risk: {d3['ml_prediction']['risk_probability']} ({d3['ml_prediction']['risk_level']})")
print(f"  Matched: {d3['matched_snps']}, Cross: {d3.get('cross_disease_snps', 0)}")
print(f"  SNP Details: {d3.get('snp_details', {})}")

print()
print("=" * 60)
print("TEST 4: Another random SNP (rs1111111)")
print("=" * 60)
r4 = requests.post(f"{base}/predict/", json={
    "patient_name": "Test D", "age": 45, "gender": "Male",
    "disease_name": "Type 2 Diabetes",
    "snps": [{"rsid": "rs1111111", "allele": "G"}]
})
d4 = r4.json()
print(f"  Risk: {d4['ml_prediction']['risk_probability']} ({d4['ml_prediction']['risk_level']})")
print(f"  Matched: {d4['matched_snps']}, Cross: {d4.get('cross_disease_snps', 0)}")
print(f"  SNP Details: {d4.get('snp_details', {})}")

print()
print("=" * 60)
print("VERDICT:")
risks = [
    d1['ml_prediction']['risk_probability'],
    d2['ml_prediction']['risk_probability'],
    d3['ml_prediction']['risk_probability'],
    d4['ml_prediction']['risk_probability']
]
if len(set(risks)) == len(risks):
    print("  ALL 4 PREDICTIONS ARE DIFFERENT - BUG IS FIXED!")
else:
    print(f"  WARNING: Some predictions are identical: {risks}")
print("=" * 60)
