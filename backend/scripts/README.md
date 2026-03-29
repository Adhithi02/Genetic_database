# Scripts Directory

This directory contains one-time data processing scripts that are not part of the runtime application.

## Scripts

### process_biology_data.py
Master data-engineering script responsible for building the biological reference dictionary. It performs the following operations:

1. Extracts all unique gene symbols from the GWAS dataset.
2. Translates gene symbols to Ensembl and UniProt identifiers via the MyGene.info API.
3. Parses the Reactome pathway database, filtering exclusively for Homo sapiens entries, and maps genes to their documented biological pathways.
4. Parses the BRENDA enzyme database in Swissprot/Trembl text format, extracting real Michaelis constant (Km) values for human enzymes matching our gene set.
5. Compiles all mappings into a single optimized JSON file (`data/biology_reference.json`).

**Usage:**
```bash
cd backend/scripts
python process_biology_data.py
```

**Prerequisites:** Requires `Ensembl2Reactome_All_Levels.txt` and `brenda_2026_1.txt` to be present in the `data/` directory.

**Output:** Generates `data/biology_reference.json` containing pathway and kinetic data for 3,464 genes.
