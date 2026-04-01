import requests
import json

base_url = "http://localhost:8000"

try:
    print("--- Testing /diseases/ ---")
    res = requests.get(f"{base_url}/diseases/")
    print(res.json())

    print("\n--- Testing /predict-full/ ---")
    payload = {
        "patient": {"name": "Test Patient", "age": 45, "gender": "Female"},
        "snps": [{"rsid": "rs10830963", "allele": "G"}], # using a known diabetes SNP
        "disease_name": "Type 2 Diabetes"
    }
    res = requests.post(f"{base_url}/predict-full/", json=payload)
    print(json.dumps(res.json(), indent=2))

    print("\n--- Testing /interpret/ ---")
    payload = {
        "gene_symbols": ["MTNR1B"] # gene for rs10830963
    }
    res = requests.post(f"{base_url}/interpret/", json=payload)
    print(json.dumps(res.json(), indent=2))

    print("\n--- Testing /network/ ---")
    payload = {
        "disease_name": "Type 2 Diabetes",
        "snps": [{"rsid": "rs10830963", "allele": "G"}]
    }
    res = requests.post(f"{base_url}/network/", json=payload)
    data = res.json()
    print(f"Nodes: {len(data.get('nodes', []))}, Links: {len(data.get('links', []))}")
except Exception as e:
    print(f"Error testing: {e}")
