import pandas as pd
import json
import requests
import re
import os
import time

print("="*60)
print("🧬 AI-Assisted Genomic Analysis — Biology Processor 🧬")
print("="*60)

# Paths (relative to backend/scripts/)
GWAS_FILE = '../../cleaned_gwas.csv'
REACTOME_FILE = '../data/Ensembl2Reactome_All_Levels.txt'
BRENDA_FILE = '../data/brenda_2026_1.txt'
OUTPUT_FILE = '../data/biology_reference.json'

def fetch_gene_mappings(gene_symbols):
    """Fetches Ensembl and UniProt IDs for our Gene Symbols using MyGene.info API"""
    print(f"[*] Fetching Ensembl and UniProt IDs for {len(gene_symbols)} genes...")
    url = 'https://mygene.info/v3/query'
    batch_size = 500
    mapping = {sym: {'ensembl': None, 'uniprot': None} for sym in gene_symbols}
    
    symbols_list = list(gene_symbols)
    # Using simple POST request to mygene to get scopes
    
    for i in range(0, len(symbols_list), batch_size):
        batch = symbols_list[i:i+batch_size]
        q = ','.join(batch)
        params = {
            'q': q,
            'scopes': 'symbol',
            'fields': 'ensembl.gene,uniprot.Swiss-Prot',
            'species': 'human'
        }
        try:
            res = requests.post(url, data=params)
            res.raise_for_status()
            data = res.json()
            for doc in data:
                if 'query' in doc:
                    sym = doc['query']
                    if sym in mapping:
                        # Extract Ensembl
                        if 'ensembl' in doc:
                            if isinstance(doc['ensembl'], list):
                                mapping[sym]['ensembl'] = doc['ensembl'][0].get('gene')
                            elif isinstance(doc['ensembl'], dict):
                                mapping[sym]['ensembl'] = doc['ensembl'].get('gene')
                        # Extract UniProt
                        if 'uniprot' in doc and 'Swiss-Prot' in doc['uniprot']:
                            up = doc['uniprot']['Swiss-Prot']
                            if isinstance(up, list):
                                mapping[sym]['uniprot'] = up[0]
                            else:
                                mapping[sym]['uniprot'] = up
        except Exception as e:
            print(f"    [!] Error fetching batch {i}: {e}")
        time.sleep(0.5) # respect API limits
        
    return mapping

def parse_reactome(mapping_dict):
    """Streams Reactome file and maps Ensembl IDs to Pathways."""
    print(f"\n[*] Parsing Reactome Pathways ({REACTOME_FILE})...")
    
    ensembl_to_sym = {}
    for sym, ids in mapping_dict.items():
        ens = ids.get('ensembl')
        if ens:
            if ens not in ensembl_to_sym:
                ensembl_to_sym[ens] = []
            ensembl_to_sym[ens].append(sym)
            
    gene_pathways = {sym: [] for sym in mapping_dict.keys()}
    
    if not os.path.exists(REACTOME_FILE):
        print(f"    [!] Warning: {REACTOME_FILE} not found. Skipping pathways.")
        return gene_pathways
        
    count = 0
    with open(REACTOME_FILE, 'r', encoding='utf-8') as f:
        for line in f:
            if "Homo sapiens" not in line:
                continue
            parts = line.strip().split('\t')
            if len(parts) >= 6:
                ens_id = parts[0]
                pathway_name = parts[3]
                if ens_id in ensembl_to_sym:
                    for sym in ensembl_to_sym[ens_id]:
                        if pathway_name not in gene_pathways[sym]:
                            gene_pathways[sym].append(pathway_name)
                    count += 1
    print(f"    [+] Mapped {count} human pathways to your GWAS genes.")
    return gene_pathways

def parse_brenda(mapping_dict):
    """Streams BRENDA file and extracts real Km values for matching UniProt IDs."""
    print(f"\n[*] Parsing BRENDA Enzyme Kinetics ({BRENDA_FILE})... this takes a few minutes.")
    
    uniprot_to_sym = {}
    for sym, ids in mapping_dict.items():
        up = ids.get('uniprot')
        if up:
            if up not in uniprot_to_sym:
                uniprot_to_sym[up] = []
            uniprot_to_sym[up].append(sym)
            
    gene_kinetics = {sym: [] for sym in mapping_dict.keys()}
    
    if not os.path.exists(BRENDA_FILE):
        print(f"    [!] Warning: {BRENDA_FILE} not found. Skipping kinetics.")
        return gene_kinetics

    # Search for PR lines with our exact Uniprot IDs to speed up processing
    human_uniprots = set(uniprot_to_sym.keys())
    
    current_human_proteins = {} # internal PR# -> Gene Symbol list
    matched_kinetics = 0

    with open(BRENDA_FILE, 'r', encoding='latin-1') as f:
        for line in f:
            if line.startswith('ID\t'):
                current_human_proteins = {}
                
            elif line.startswith('PR\t'):
                if "Homo sapiens" in line:
                    # Find PR numbers
                    # Example: PR  #1# P12345 Homo sapiens
                    parts = line.split()
                    if len(parts) >= 3 and parts[1].startswith('#'):
                        pr_num = parts[1].strip('#')
                        accessions = " ".join(parts[2:])
                        for up_id in human_uniprots:
                            if up_id in accessions:
                                current_human_proteins[pr_num] = uniprot_to_sym[up_id]
                                
            elif line.startswith('KM\t') and current_human_proteins:
                # Extract kinetics if it belongs to a human protein we care about
                parts = line.split('\t', 1)
                if len(parts) == 2:
                    val_str = parts[1].strip()
                    for pr_num, syms in current_human_proteins.items():
                        pr_tag = f"#{pr_num}#"
                        if pr_tag in val_str:
                            val_str_clean = val_str.replace(pr_tag, '').strip()
                            kinetic_record = {'type': 'Km', 'details': val_str_clean}
                            for sym in syms:
                                if kinetic_record not in gene_kinetics[sym]:
                                    gene_kinetics[sym].append(kinetic_record)
                                    matched_kinetics += 1
                                    
    print(f"    [+] Extracted {matched_kinetics} real kinetic parameters for your genes.")
    return gene_kinetics

def main():
    if not os.path.exists(GWAS_FILE):
        print(f"[!] Error: Cannot find {GWAS_FILE}. Please make sure it exists.")
        return
        
    print(f"[*] Reading {GWAS_FILE} directly...")
    df = pd.read_csv(GWAS_FILE)
    
    raw_genes = df['gene'].dropna().unique()
    clean_genes = set()
    for g in raw_genes:
        # Some genes look like "HEATR4 - ACOT2", split them
        for split_g in g.split('-'):
            clean_genes.add(split_g.strip())
            
    print(f"    [+] Found {len(clean_genes)} unique actionable gene symbols.")

    mapping_dict = fetch_gene_mappings(clean_genes)
    
    pathways = parse_reactome(mapping_dict)
    kinetics = parse_brenda(mapping_dict)
    
    print("\n[*] Compiling final ultra-fast Biology Reference JSON...")
    master_ref = {}
    for sym in clean_genes:
        g_paths = pathways.get(sym, [])
        g_kins = kinetics.get(sym, [])
        if g_paths or g_kins:
            master_ref[sym] = {
                'pathways': g_paths,
                'kinetics': g_kins
            }
            
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(master_ref, f, indent=4)
        
    print(f"    [+] Saved successfully to backend/{OUTPUT_FILE}!")
    print(f"    [+] Profiled Data count: {len(master_ref)} genes with biological data.")
    print("="*60)
    print("✅ Phase 1 Complete! You now have a 100% data-driven real biology layer.")

if __name__ == '__main__':
    main()
