# Biological Dataset Processing Architecture

This document outlines the data ingestion and biological mapping pipeline for the Genomic Analysis project.

## Overview
The script `process_biology_data.py` is responsible for building a unified, offline biological dictionary. It connects raw genomic identifiers to their respective biological pathways and enzymatic properties without requiring external database calls during runtime inference.

## Input Files
The pipeline requires three primary data sources:
1. `cleaned_gwas.csv`: The core foundational dataset containing the processed GWAS records, mapping SNPs (e.g., odds_ratio, allele frequency, chromosome position) to specific human genes.
2. `Ensembl2Reactome_All_Levels.txt`: The global Reactome pathway flat file. Used for linking genomic Ensembl IDs to macro-biological pathways (e.g., DNA Double-Strand Break Repair).
3. `brenda_2026_1.txt`: The BRENDA enzyme database flat file. Used for extracting micro-level biochemical properties, specifically the Michaelis constant (Km) and target substrates.

## Processing Pipeline (`process_biology_data.py`)
Execution of the processing script handles four main stages:
1. **Gene Extraction**: Isolates all unique actionable gene symbols from the GWAS dataset.
2. **Identifier Translation**: Queries the MyGene.info API in batches to translate standard gene symbols into Uniprot and Ensembl IDs.
3. **Pathway Mapping**: Streams the multi-million row Reactome database, filtering exclusively for *Homo sapiens* annotations, and mapping them to the extracted Ensembl IDs.
4. **Kinetic Extraction**: Streams the BRENDA text format to evaluate Swissprot/Trembl acronyms (PR and KM blocks), mapping relevant human Uniprot IDs to their documented enzyme kinetic values.

## Output
The script outputs `biology_reference.json`.
This JSON file serves as an ultra-fast, offline dictionary. It is loaded into memory by the FastAPI application upon startup, acting as the primary mapping layer for the backend interpretation layer.

### JSON Structure Example
```json
{
    "FDFT1": {
        "pathways": [
            "Cholesterol biosynthesis",
            "Regulation of lipid metabolism"
        ],
        "kinetics": [
            {
                "type": "Km",
                "details": "0.0023 {farnesyl diphosphate}"
            }
        ]
    }
}
```
