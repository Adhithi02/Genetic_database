import requests
import json

base = "http://localhost:8000"
PASS = 0
FAIL = 0

def test(name, condition, detail=""):
    global PASS, FAIL
    if condition:
        PASS += 1
        print(f"  ✅ {name}")
    else:
        FAIL += 1
        print(f"  ❌ {name} — {detail}")

# Known valid rsIDs per disease (from cleaned_gwas.csv)
DISEASE_SNPS = {
    "Type 2 Diabetes": ["rs7903146", "rs2237897", "rs10811661"],
    "Coronary Artery Disease": ["rs58231493", "rs7253874", "rs1042445"],
    "Breast Cancer": ["rs35054928", "rs2981578", "rs1219648"],
    "Hypertension": ["rs62294282", "rs11722185", "rs4637402"],
}

print("=" * 70)
print("  COMPREHENSIVE PIPELINE VALIDATION — ALL 4 DISEASES")
print("=" * 70)

# ---- TEST 1: Health Check ----
print("\n[1] HEALTH CHECK (/)")
try:
    r = requests.get(f"{base}/")
    d = r.json()
    test("Server responds", r.status_code == 200)
    test("4 diseases supported", len(d["diseases_supported"]) == 4)
    test("4 models loaded", len(d["models_loaded"]) == 4)
    test("GWAS loaded (13918)", d["gwas_records_loaded"] == 13918)
    test("Biology loaded (3464)", d["biology_genes_loaded"] == 3464)
except Exception as e:
    FAIL += 1
    print(f"  ❌ Server not reachable: {e}")

# ---- TEST 2: Predict with KNOWN SNPs per disease ----
print("\n[2] PREDICTION WITH KNOWN SNPs (per disease)")
for disease, snps in DISEASE_SNPS.items():
    print(f"\n  --- {disease} ---")
    try:
        r = requests.post(f"{base}/predict/", json={
            "patient_name": "Validator", "age": 40, "gender": "Female",
            "disease_name": disease,
            "snps": [{"rsid": s, "allele": "T"} for s in snps]
        })
        d = r.json()
        test(f"API returns 200", r.status_code == 200)
        test(f"ML risk exists", "ml_prediction" in d and "risk_probability" in d["ml_prediction"], str(d.get("ml_prediction")))
        test(f"Risk between 0-1", 0 <= d["ml_prediction"]["risk_probability"] <= 1)
        test(f"SNPs matched > 0", d["matched_snps"] > 0, f"matched={d['matched_snps']}")
        test(f"SHAP exists", "shap_explanation" in d and "error" not in d["shap_explanation"], str(d.get("shap_explanation")))
        test(f"PRS exists", "prs" in d and "raw_score" in d["prs"])
        test(f"Genes identified", len(d.get("genes_identified", [])) > 0, f"genes={d.get('genes_identified')}")
        print(f"      → Risk: {d['ml_prediction']['risk_probability']}, PRS: {d['prs']['raw_score']}, Genes: {d['genes_identified'][:3]}")
    except Exception as e:
        FAIL += 1
        print(f"  ❌ {disease} prediction failed: {e}")

# ---- TEST 3: Different SNPs = Different Results ----
print("\n[3] DIFFERENTIATION TEST (different SNPs → different risks)")
for disease, snps in DISEASE_SNPS.items():
    risks = []
    for snp in snps:
        r = requests.post(f"{base}/predict/", json={
            "patient_name": "DiffTest", "age": 30, "gender": "Male",
            "disease_name": disease,
            "snps": [{"rsid": snp, "allele": "A"}]
        })
        risks.append(r.json()["ml_prediction"]["risk_probability"])
    unique = len(set(risks))
    test(f"{disease}: {unique}/{len(risks)} unique risks", unique == len(risks), f"risks={risks}")

# ---- TEST 4: Network Endpoint ----
print("\n[4] NETWORK GRAPH GENERATION (/network/)")
for disease, snps in DISEASE_SNPS.items():
    try:
        r = requests.post(f"{base}/network/", json={
            "disease_name": disease,
            "snps": [{"rsid": s, "allele": "T"} for s in snps]
        })
        d = r.json()
        test(f"{disease}: nodes={len(d['nodes'])}, links={len(d['links'])}", 
             len(d["nodes"]) > 1 and len(d["links"]) > 0,
             f"nodes={len(d['nodes'])}, links={len(d['links'])}")
        
        # Check node types exist
        types = set(n["type"] for n in d["nodes"])
        test(f"{disease}: has disease+gene+snp nodes", 
             "disease" in types and "gene" in types and "snp" in types,
             f"types={types}")
    except Exception as e:
        FAIL += 1
        print(f"  ❌ {disease} network failed: {e}")

# ---- TEST 5: Interpret Endpoint ----
print("\n[5] BIOLOGICAL INTERPRETATION (/interpret/)")
test_genes = ["TCF7L2", "BRCA1", "MTHFR", "ACE"]
try:
    r = requests.post(f"{base}/interpret/", json={"gene_symbols": test_genes})
    d = r.json()
    test("Interpret returns 200", r.status_code == 200)
    for gene in test_genes:
        found = gene in d.get("interpretations", {})
        has_data = found and (len(d["interpretations"][gene].get("pathways", [])) > 0 or "note" in d["interpretations"][gene])
        test(f"Gene {gene} interpreted", found, f"missing from response")
except Exception as e:
    FAIL += 1
    print(f"  ❌ Interpret failed: {e}")

# ---- TEST 6: Unknown/Random SNPs Still Work ----
print("\n[6] GRACEFUL HANDLING OF UNKNOWN SNPS")
try:
    r = requests.post(f"{base}/predict/", json={
        "patient_name": "Unknown", "age": 25, "gender": "Other",
        "disease_name": "Breast Cancer",
        "snps": [{"rsid": "rs00000000", "allele": "G"}]
    })
    d = r.json()
    test("Unknown SNP returns 200", r.status_code == 200)
    test("Risk still computed", "ml_prediction" in d)
    test("SNP reported as not found", len(d.get("snp_details", {}).get("not_found", [])) > 0)
except Exception as e:
    FAIL += 1
    print(f"  ❌ Unknown SNP handling failed: {e}")

# ---- TEST 7: Invalid Disease Rejected ----
print("\n[7] ERROR HANDLING")
try:
    r = requests.post(f"{base}/predict/", json={
        "patient_name": "Bad", "age": 30, "gender": "Male",
        "disease_name": "Fake Disease",
        "snps": [{"rsid": "rs123", "allele": "A"}]
    })
    test("Invalid disease returns 400", r.status_code == 400)
except Exception as e:
    FAIL += 1
    print(f"  ❌ Error handling failed: {e}")

# ---- FINAL VERDICT ----
print("\n" + "=" * 70)
total = PASS + FAIL
print(f"  FINAL SCORE: {PASS}/{total} tests passed")
if FAIL == 0:
    print("  🎉 ALL SYSTEMS OPERATIONAL — READY FOR IDP PRESENTATION!")
else:
    print(f"  ⚠️  {FAIL} test(s) need attention.")
print("=" * 70)
