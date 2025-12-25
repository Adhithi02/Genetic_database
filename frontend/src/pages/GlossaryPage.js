import React, { useState } from "react";
import "../styles/GlossaryPage.css";

const ENHANCED_GLOSSARY_DATA = {
  dbms: [
    {
      key: "dbms",
      term: "DBMS",
      meaning: "Database Management System - software that manages data storage, retrieval, and manipulation",
      relevance: "Organizes genetic data in tables for efficient querying and ensures data integrity",
      example: "In this system, PostgreSQL is used as the DBMS to store patient data, SNP information, and disease associations",
      implementation: `# Database connection setup
from sqlalchemy import create_engine
from database import Base, SessionLocal

engine = create_engine("postgresql://user:pass@localhost/genetic_db")
Base.metadata.create_all(bind=engine)
session = SessionLocal()`
    },
    {
      key: "table",
      term: "Table",
      meaning: "A structured collection of related data organized in rows and columns",
      relevance: "Stores entities like Patient, SNP, Disease in separate tables for organized data management",
      example: "The 'patient' table stores patient_id, name, age, and gender. The 'snp' table stores snp_id, rsid, odds_ratio, etc.",
      implementation: `# Table definition using SQLAlchemy
class Patient(Base):
    __tablename__ = "patient"
    patient_id = Column(Integer, primary_key=True)
    name = Column(String(100))
    age = Column(Integer)
    gender = Column(String(10))`
    },
    {
      key: "select",
      term: "SELECT",
      meaning: "SQL operation to retrieve data from one or more tables",
      relevance: "Queries the database to find matching SNP records based on rsID",
      example: "SELECT * FROM snp WHERE rsid = 'rs123456' retrieves all information about that specific genetic variant",
      implementation: `# SELECT query in Python
snp = session.query(SNP).filter(SNP.rsid == "rs123456").first()
# Equivalent SQL: SELECT * FROM snp WHERE rsid = 'rs123456'`
    },
    {
      key: "join",
      term: "JOIN",
      meaning: "SQL operation that combines rows from multiple tables based on related columns",
      relevance: "Links SNP and Disease tables to find disease-specific variants through the DiseaseSNP junction table",
      example: "JOIN disease_snp ON snp.snp_id = disease_snp.snp_id connects SNPs to their associated diseases",
      implementation: `# JOIN operation
allowed_snp_ids = {
    row.snp_id
    for row in session.query(DiseaseSNP.snp_id)
    .filter(DiseaseSNP.disease_id == disease_id)
}
# Equivalent SQL:
# SELECT ds.snp_id FROM disease_snp ds
# JOIN snp s ON ds.snp_id = s.snp_id
# WHERE ds.disease_id = :disease_id`
    },
    {
      key: "insert",
      term: "INSERT",
      meaning: "SQL operation to add new records into a table",
      relevance: "Creates a new patient record in the database when a prediction is made",
      example: "INSERT INTO patient (name, age, gender) VALUES ('John Doe', 45, 'Male') creates a new patient entry",
      implementation: `# INSERT operation
patient = Patient(name="John Doe", age=45, gender="Male")
session.add(patient)
session.commit()
# Equivalent SQL:
# INSERT INTO patient (name, age, gender)
# VALUES ('John Doe', 45, 'Male')`
    },
    {
      key: "pk",
      term: "Primary Key (PK)",
      meaning: "A unique identifier for each row in a table",
      relevance: "Ensures each patient, SNP, and disease has a unique ID, preventing duplicates",
      example: "patient_id is the primary key in the patient table. Each patient gets a unique auto-incrementing ID",
      implementation: `# Primary Key definition
class Patient(Base):
    __tablename__ = "patient"
    patient_id = Column(Integer, primary_key=True, index=True)
    # Auto-increments: 1, 2, 3, 4...`
    },
    {
      key: "fk",
      term: "Foreign Key (FK)",
      meaning: "A column that references the primary key of another table",
      relevance: "Links related data across tables (e.g., patient_id in Prediction table references Patient table)",
      example: "In the Prediction table, patient_id is a foreign key that references Patient.patient_id",
      implementation: `# Foreign Key definition
class Prediction(Base):
    __tablename__ = "prediction"
    pred_id = Column(Integer, primary_key=True)
    patient_id = Column(Integer, ForeignKey("patient.patient_id"))
    disease_id = Column(Integer, ForeignKey("disease.disease_id"))
    # These FKs link to Patient and Disease tables`
    },
    {
      key: "where",
      term: "WHERE",
      meaning: "SQL clause that filters rows based on specified conditions",
      relevance: "Narrows down results to specific diseases or SNPs matching patient input",
      example: "WHERE disease_id = 1 AND rsid IN ('rs123', 'rs456') filters only Type 2 Diabetes SNPs",
      implementation: `# WHERE clause
disease = session.query(Disease)
    .filter(Disease.name == "Type 2 Diabetes")
    .first()
# Equivalent SQL:
# SELECT * FROM disease WHERE name = 'Type 2 Diabetes'`
    },
    {
      key: "aggregate",
      term: "Aggregation",
      meaning: "SQL operations that compute summary values (SUM, AVG, COUNT) from multiple rows",
      relevance: "Combines multiple SNP risk values into a single weighted risk score",
      example: "Weighted average of odds_ratio from all matched SNPs gives the final risk probability",
      implementation: `# Aggregation for risk calculation
def weighted_avg(values, weights, default):
    if not values:
        return default
    total_weight = sum(weights)
    return sum(v * w for v, w in zip(values, weights)) / total_weight

# Calculate average odds_ratio weighted by risk
avg_odds = weighted_avg(odds_vals, weights, 1.0)`
    },
    {
      key: "index",
      term: "Index",
      meaning: "Database structure that speeds up data retrieval by creating a sorted reference to table rows",
      relevance: "Makes queries on rsid, patient_id, and disease_id much faster",
      example: "An index on rsid allows instant lookup of SNPs instead of scanning the entire table",
      implementation: `# Index definition
class SNP(Base):
    __tablename__ = "snp"
    snp_id = Column(Integer, primary_key=True, index=True)
    rsid = Column(String(20), unique=True, index=True)
    # Index on rsid enables fast: WHERE rsid = 'rs123456'`
    }
  ],
  genetics: [
    {
      key: "snp",
      term: "SNP",
      meaning: "Single Nucleotide Polymorphism - a variation at a single DNA position where people differ",
      relevance: "These variations can indicate increased or decreased disease risk when analyzed together",
      example: "rs7903146 is a SNP in the TCF7L2 gene. People with the T allele have higher Type 2 Diabetes risk",
      implementation: `# SNP data structure
class SNP(Base):
    snp_id = Column(Integer, primary_key=True)
    rsid = Column(String(20), unique=True)  # e.g., "rs7903146"
    risk_allele = Column(String(1))         # e.g., "T"
    odds_ratio = Column(Float)              # e.g., 1.37
    risk_allele_freq = Column(Float)        # e.g., 0.28`
    },
    {
      key: "rsid",
      term: "rsID",
      meaning: "Reference SNP cluster ID - a unique identifier for each known genetic variant",
      relevance: "Used to look up specific genetic variants in databases like dbSNP",
      example: "rs7903146 uniquely identifies a specific position on chromosome 10 in the TCF7L2 gene",
      implementation: `# rsID lookup
snp = session.query(SNP).filter(SNP.rsid == "rs7903146").first()
if snp:
    print(f"Found SNP: {snp.rsid}, OR: {snp.odds_ratio}")
# rsID format: "rs" followed by numbers`
    },
    {
      key: "allele",
      term: "Allele",
      meaning: "One of two or more versions of a gene or DNA sequence at a specific location",
      relevance: "Different alleles (A, T, G, C) can have different disease associations",
      example: "At rs7903146, the reference allele is C and the risk allele is T. Having TT increases diabetes risk",
      implementation: `# Allele matching
patient_allele = "T"  # From patient input
snp = session.query(SNP).filter(SNP.rsid == "rs7903146").first()

if patient_allele == snp.risk_allele:
    # Patient has the risk allele
    risk_contribution = snp.odds_ratio
else:
    risk_contribution = 1.0  # No increased risk`
    },
    {
      key: "gene",
      term: "Gene",
      meaning: "A segment of DNA that codes for a protein and influences traits or disease risk",
      relevance: "Multiple genes can contribute to a single disease risk through polygenic inheritance",
      example: "TCF7L2, PPARG, and KCNJ11 are genes associated with Type 2 Diabetes risk",
      implementation: `# Gene-SNP relationship
class Gene(Base):
    __tablename__ = "gene"
    gene_id = Column(Integer, primary_key=True)
    gene_name = Column(String, unique=True)  # e.g., "TCF7L2"

class SNP(Base):
    gene_id = Column(Integer, ForeignKey("gene.gene_id"))
    # Links SNP to its associated gene`
    },
    {
      key: "odds ratio",
      term: "Odds Ratio",
      meaning: "A measure of how strongly a genetic variant is associated with disease risk",
      relevance: "Higher odds ratios indicate stronger genetic risk factors (OR > 1.0 = increased risk)",
      example: "An odds ratio of 1.37 means people with the risk allele have 37% higher odds of developing the disease",
      implementation: `# Odds Ratio interpretation
odds_ratio = 1.37  # From GWAS study

if odds_ratio > 1.0:
    risk_increase = (odds_ratio - 1.0) * 100  # 37% increase
    print(f"Risk allele increases disease odds by {risk_increase}%")
elif odds_ratio < 1.0:
    risk_decrease = (1.0 - odds_ratio) * 100
    print(f"Protective allele decreases disease odds by {risk_decrease}%")`
    },
    {
      key: "disease association",
      term: "Disease Association",
      meaning: "A statistical link between a genetic variant and increased disease risk, found through GWAS",
      relevance: "Found through large-scale genetic studies (GWAS) involving thousands of participants",
      example: "rs7903146 is associated with Type 2 Diabetes with p-value < 5×10⁻⁸, indicating strong statistical significance",
      implementation: `# Disease-SNP association
class DiseaseSNP(Base):
    __tablename__ = "disease_snp"
    disease_id = Column(Integer, ForeignKey("disease.disease_id"))
    snp_id = Column(Integer, ForeignKey("snp.snp_id"))
    # Junction table linking diseases to their associated SNPs

# Query disease-specific SNPs
disease_snps = session.query(DiseaseSNP.snp_id)
    .filter(DiseaseSNP.disease_id == 1)  # Type 2 Diabetes`
    },
    {
      key: "risk score",
      term: "Risk Score",
      meaning: "A numerical value combining multiple genetic factors to estimate disease probability",
      relevance: "The final output that predicts your disease risk using machine learning on aggregated SNP data",
      example: "A risk score of 0.65 (65%) means the patient has a 65% probability of developing the disease",
      implementation: `# Risk score calculation
features = [
    avg_odds_ratio,      # Weighted average of SNP odds ratios
    avg_risk_allele_freq, # Average risk allele frequency
    chromosome,          # Chromosomal location
    position             # Genomic position
]

# Machine learning model prediction
risk_probability = model.predict_proba([features])[0][1]
# Returns probability between 0.0 and 1.0`
    },
    {
      key: "patient demographics",
      term: "Patient Demographics",
      meaning: "Basic patient information like age and gender",
      relevance: "Can modify how genetic risk factors affect overall disease probability",
      example: "Older patients and certain genders may have different baseline risks that interact with genetic factors",
      implementation: `# Patient demographics storage
class Patient(Base):
    __tablename__ = "patient"
    patient_id = Column(Integer, primary_key=True)
    name = Column(String(100))
    age = Column(Integer)        # e.g., 45
    gender = Column(String(10))  # e.g., "Male", "Female"

# Age and gender can be used as features in ML model
patient_features = [age, gender_encoded, ...genetic_features]`
    },
    {
      key: "gwas",
      term: "GWAS",
      meaning: "Genome-Wide Association Study - large-scale studies that scan genomes for disease-associated variants",
      relevance: "GWAS studies identify which SNPs are associated with diseases, providing the data for our predictions",
      example: "A GWAS with 100,000 participants found rs7903146 associated with Type 2 Diabetes (p < 5×10⁻⁸)",
      implementation: `# GWAS data import
# GWAS results typically include:
# - rsID: SNP identifier
# - p-value: Statistical significance
# - odds_ratio: Effect size
# - risk_allele: Which allele increases risk

# Data loaded from cleaned_gwas.csv:
# rsid,odds_ratio,risk_allele_freq,chromosome,position,p_value
# rs7903146,1.37,0.28,10,114758349,2.3e-8`
    },
    {
      key: "polygenic",
      term: "Polygenic Risk",
      meaning: "Disease risk influenced by many genetic variants, each with small individual effects",
      relevance: "Most diseases are polygenic - multiple SNPs contribute to overall risk, not just one",
      example: "Type 2 Diabetes risk comes from hundreds of SNPs. Individually small, but combined they significantly impact risk",
      implementation: `# Polygenic risk calculation
# Combine multiple SNP effects
risk_factors = []
for snp in patient_snps:
    if snp.risk_allele == patient_allele:
        risk_factors.append(snp.odds_ratio)

# Weighted combination
polygenic_score = weighted_average(risk_factors)
# Multiple small effects combine into significant risk`
    }
  ]
};

function GlossaryPage({ onNavigate }) {
  const [activeTab, setActiveTab] = useState("genetics");
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedTerm, setExpandedTerm] = useState(null);

  const filteredTerms = ENHANCED_GLOSSARY_DATA[activeTab].filter(item =>
    item.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.meaning.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.example && item.example.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const toggleExpand = (key) => {
    setExpandedTerm(expandedTerm === key ? null : key);
  };

  return (
    <div className="app-container">
      <div className="app-header">
        <h1>Glossary</h1>
        <p>Comprehensive guide to DBMS and genetics terms with examples and implementations</p>
      </div>

      <div className="page-navigation">
        <button className="btn btn-secondary" onClick={() => onNavigate("home")}>
          Home
        </button>
      </div>

      <div className="glossary-page-container">
        <div className="glossary-tabs">
          <button
            className={`glossary-tab ${activeTab === "genetics" ? "active" : ""}`}
            onClick={() => setActiveTab("genetics")}
          >
            Genetics
          </button>
          <button
            className={`glossary-tab ${activeTab === "dbms" ? "active" : ""}`}
            onClick={() => setActiveTab("dbms")}
          >
            DBMS
          </button>
        </div>

        <div className="glossary-search">
          <input
            type="text"
            placeholder="Search terms, examples, or implementations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="glossary-content">
          {filteredTerms.length === 0 ? (
            <div className="glossary-empty">No terms found matching "{searchTerm}"</div>
          ) : (
            <div className="glossary-tiles">
              {filteredTerms.map((item) => (
                <div 
                  key={item.key} 
                  className={`glossary-tile ${expandedTerm === item.key ? 'expanded' : ''}`}
                >
                  <div className="glossary-tile-header" onClick={() => toggleExpand(item.key)}>
                    <strong className="glossary-tile-term">{item.term}</strong>
                    <span className="expand-icon">{expandedTerm === item.key ? '−' : '+'}</span>
                  </div>
                  <div className="glossary-tile-body">
                    <div className="glossary-tile-meaning">
                      <strong>Definition:</strong> {item.meaning}
                    </div>
                    <div className="glossary-tile-relevance">
                      <strong>Why it matters:</strong> {item.relevance}
                    </div>
                    
                    {expandedTerm === item.key && (
                      <div className="glossary-tile-expanded fade-in">
                        {item.example && (
                          <div className="glossary-example">
                            <strong>Example:</strong>
                            <p>{item.example}</p>
                          </div>
                        )}
                        {item.implementation && (
                          <div className="glossary-implementation">
                            <strong>Implementation:</strong>
                            <pre><code>{item.implementation}</code></pre>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default GlossaryPage;

