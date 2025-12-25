import React, { useState } from "react";
import "../styles/BlogPage.css";
import erDiagram from "../erdiagram.png";

function BlogPage({ onNavigate }) {
  const [expandedSections, setExpandedSections] = useState({
    overview: false,
    architecture: false,
    database: false,
    dbms: false,
    etl: false,
    implementation: false,
    workflow: false,
    examples: false,
    ml: false,
    conclusion: false
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <div className="app-container">
      <div className="app-header">
        <h1>Project Documentation</h1>
        <p>Comprehensive guide to the Genetic Risk Database System</p>
      </div>

      <div className="page-navigation">
        <button className="btn btn-secondary" onClick={() => onNavigate("home")}>
          Home
        </button>
      </div>

      <div className="blog-container">
        
        {/* Project Overview */}
        <section id="overview" className={`blog-section collapsible ${expandedSections.overview ? 'expanded' : ''}`}>
          <div className="section-header" onClick={() => toggleSection('overview')}>
            <h2>1. Project Overview</h2>
            <span className="expand-icon">{expandedSections.overview ? '−' : '+'}</span>
          </div>
          {expandedSections.overview && (
            <div className="section-content">
          <h2>1. Project Overview</h2>
          <p>
            The <strong>Genetic Risk Database</strong> is a comprehensive system that combines 
            database management, genetic data processing, and machine learning to predict disease 
            risk based on genetic variants (SNPs). The system demonstrates the integration of 
            relational databases (PostgreSQL), NoSQL databases (MongoDB), and machine learning 
            models to provide explainable genetic risk predictions.
          </p>
          
          <div className="info-box">
            <h3>Key Features</h3>
            <ul>
              <li><strong>Relational Database (PostgreSQL):</strong> Stores structured genetic and patient data</li>
              <li><strong>NoSQL Database (MongoDB):</strong> Stores machine learning model metadata and input logs</li>
              <li><strong>Machine Learning Models:</strong> Disease-specific logistic regression models for risk prediction</li>
              <li><strong>Explainable AI:</strong> Visual computation flow showing how predictions are made</li>
              <li><strong>Interactive UI:</strong> Modern web interface with glassmorphism design</li>
            </ul>
          </div>
            </div>
          )}
        </section>

        {/* System Architecture */}
        <section id="architecture" className={`blog-section collapsible ${expandedSections.architecture ? 'expanded' : ''}`}>
          <div className="section-header" onClick={() => toggleSection('architecture')}>
            <h2>2. System Architecture</h2>
            <span className="expand-icon">{expandedSections.architecture ? '−' : '+'}</span>
          </div>
          {expandedSections.architecture && (
            <div className="section-content">
          
          <div className="architecture-diagram">
            <div className="arch-layer">
              <h3>Frontend Layer (React)</h3>
              <ul>
                <li>User interface for input and visualization</li>
                <li>Computation flow visualization</li>
                <li>Risk prediction charts and graphs</li>
              </ul>
            </div>
            
            <div className="arch-arrow">↓</div>
            
            <div className="arch-layer">
              <h3>API Layer (FastAPI)</h3>
              <ul>
                <li>RESTful endpoints for predictions</li>
                <li>Request validation and processing</li>
                <li>Session management</li>
              </ul>
            </div>
            
            <div className="arch-arrow">↓</div>
            
            <div className="arch-layer">
              <h3>Business Logic Layer</h3>
              <ul>
                <li>Feature vector construction</li>
                <li>SNP matching and filtering</li>
                <li>Weighted aggregation</li>
                <li>Model prediction</li>
              </ul>
            </div>
            
            <div className="arch-arrow">↓</div>
            
            <div className="arch-layer">
              <h3>Data Layer</h3>
              <div className="arch-databases">
                <div className="arch-db">
                  <strong>PostgreSQL</strong>
                  <ul>
                    <li>Patient data</li>
                    <li>SNP information</li>
                    <li>Disease associations</li>
                    <li>Predictions</li>
                  </ul>
                </div>
                <div className="arch-db">
                  <strong>MongoDB</strong>
                  <ul>
                    <li>ML model metadata</li>
                    <li>Input logs</li>
                    <li>Model serialization</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
            </div>
          )}
        </section>

        {/* Database Design */}
        <section id="database" className={`blog-section collapsible ${expandedSections.database ? 'expanded' : ''}`}>
          <div className="section-header" onClick={() => toggleSection('database')}>
            <h2>3. Database Design & ER Diagram</h2>
            <span className="expand-icon">{expandedSections.database ? '−' : '+'}</span>
          </div>
          {expandedSections.database && (
            <div className="section-content">
          
          <div className="er-diagram-container">
            <img src={erDiagram} alt="ER Diagram" className="er-diagram" />
            <p className="diagram-caption">Entity-Relationship Diagram showing all tables and their relationships</p>
          </div>

          <h3>3.1 Database Schema</h3>
          
          <div className="schema-table">
            <h4>Patient Table</h4>
            <pre><code>{`CREATE TABLE patient (
    patient_id INTEGER PRIMARY KEY,
    name VARCHAR(100),
    age INTEGER,
    gender VARCHAR(10)
);`}</code></pre>
            <p><strong>Purpose:</strong> Stores patient demographic information. Each patient gets a unique auto-incrementing ID.</p>
            <p><strong>Primary Key:</strong> patient_id (auto-incrementing integer)</p>
            <p><strong>Example:</strong> Patient with ID 1, name "John Doe", age 45, gender "Male"</p>
          </div>

          <div className="schema-table">
            <h4>Gene Table</h4>
            <pre><code>{`CREATE TABLE gene (
    gene_id INTEGER PRIMARY KEY,
    gene_name VARCHAR UNIQUE,
    description TEXT
);`}</code></pre>
            <p><strong>Purpose:</strong> Stores gene information. Genes are biological units that code for proteins.</p>
            <p><strong>Primary Key:</strong> gene_id</p>
            <p><strong>Unique Constraint:</strong> gene_name (ensures no duplicate gene names)</p>
            <p><strong>Example:</strong> Gene ID 1, name "TCF7L2", description "Transcription factor involved in diabetes"</p>
          </div>

          <div className="schema-table">
            <h4>SNP Table</h4>
            <pre><code>{`CREATE TABLE snp (
    snp_id INTEGER PRIMARY KEY,
    rsid VARCHAR(20) UNIQUE,
    gene_id INTEGER REFERENCES gene(gene_id),
    chromosome INTEGER,
    position INTEGER,
    risk_allele VARCHAR(1),
    odds_ratio FLOAT,
    risk_allele_freq FLOAT,
    p_value FLOAT,
    is_significant BOOLEAN
);`}</code></pre>
            <p><strong>Purpose:</strong> Stores Single Nucleotide Polymorphism (SNP) data - genetic variants that affect disease risk.</p>
            <p><strong>Primary Key:</strong> snp_id</p>
            <p><strong>Foreign Key:</strong> gene_id → gene.gene_id (links SNP to its associated gene)</p>
            <p><strong>Unique Constraint:</strong> rsid (Reference SNP ID, e.g., "rs7903146")</p>
            <p><strong>Key Fields:</strong></p>
            <ul>
              <li><strong>odds_ratio:</strong> Measure of disease association (OR > 1.0 = increased risk)</li>
              <li><strong>risk_allele_freq:</strong> Frequency of risk allele in population</li>
              <li><strong>p_value:</strong> Statistical significance (p &lt; 5×10<sup>-8</sup> is genome-wide significant)</li>
            </ul>
            <p><strong>Example:</strong> SNP ID 1, rsid "rs7903146", gene_id 1, chromosome 10, position 114758349, risk_allele "T", odds_ratio 1.37</p>
          </div>

          <div className="schema-table">
            <h4>Disease Table</h4>
            <pre><code>{`CREATE TABLE disease (
    disease_id INTEGER PRIMARY KEY,
    name VARCHAR(100),
    description TEXT
);`}</code></pre>
            <p><strong>Purpose:</strong> Stores disease information that can be predicted.</p>
            <p><strong>Primary Key:</strong> disease_id</p>
            <p><strong>Example:</strong> Disease ID 1, name "Type 2 Diabetes", description "Metabolic disorder characterized by high blood sugar"</p>
          </div>

          <div className="schema-table">
            <h4>DiseaseSNP Table (Junction Table)</h4>
            <pre><code>{`CREATE TABLE disease_snp (
    id INTEGER PRIMARY KEY,
    disease_id INTEGER REFERENCES disease(disease_id),
    snp_id INTEGER REFERENCES snp(snp_id)
);`}</code></pre>
            <p><strong>Purpose:</strong> Many-to-many relationship table linking diseases to their associated SNPs.</p>
            <p><strong>Primary Key:</strong> id</p>
            <p><strong>Foreign Keys:</strong></p>
            <ul>
              <li>disease_id → disease.disease_id</li>
              <li>snp_id → snp.snp_id</li>
            </ul>
            <p><strong>Why Junction Table?</strong> One disease can be associated with many SNPs, and one SNP can be associated with multiple diseases. This table enables the many-to-many relationship.</p>
            <p><strong>Example:</strong> Links Type 2 Diabetes (disease_id=1) to rs7903146 (snp_id=1)</p>
          </div>

          <div className="schema-table">
            <h4>Prediction Table</h4>
            <pre><code>{`CREATE TABLE prediction (
    pred_id INTEGER PRIMARY KEY,
    patient_id INTEGER REFERENCES patient(patient_id),
    disease_id INTEGER REFERENCES disease(disease_id),
    probability FLOAT,
    risk_level VARCHAR(20),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`}</code></pre>
            <p><strong>Purpose:</strong> Stores prediction results for each patient-disease combination.</p>
            <p><strong>Primary Key:</strong> pred_id</p>
            <p><strong>Foreign Keys:</strong></p>
            <ul>
              <li>patient_id → patient.patient_id</li>
              <li>disease_id → disease.disease_id</li>
            </ul>
            <p><strong>Fields:</strong></p>
            <ul>
              <li><strong>probability:</strong> Risk probability (0.0 to 1.0)</li>
              <li><strong>risk_level:</strong> "Low", "Medium", or "High" based on probability</li>
              <li><strong>timestamp:</strong> When prediction was made</li>
            </ul>
            <p><strong>Example:</strong> Prediction for patient_id=1, disease_id=1, probability=0.65, risk_level="High"</p>
          </div>

          <h3>3.2 Relationships</h3>
          <div className="relationships">
            <div className="relationship-item">
              <strong>Patient → Prediction:</strong> One-to-Many (one patient can have multiple predictions)
            </div>
            <div className="relationship-item">
              <strong>Disease → Prediction:</strong> One-to-Many (one disease can have multiple predictions)
            </div>
            <div className="relationship-item">
              <strong>Gene → SNP:</strong> One-to-Many (one gene can have multiple SNPs)
            </div>
            <div className="relationship-item">
              <strong>Disease ↔ SNP:</strong> Many-to-Many (via DiseaseSNP junction table)
            </div>
          </div>
            </div>
          )}
        </section>

        {/* DBMS Concepts */}
        <section id="dbms-concepts" className={`blog-section collapsible ${expandedSections.dbms ? 'expanded' : ''}`}>
          <div className="section-header" onClick={() => toggleSection('dbms')}>
            <h2>4. DBMS Concepts & Operations</h2>
            <span className="expand-icon">{expandedSections.dbms ? '−' : '+'}</span>
          </div>
          {expandedSections.dbms && (
            <div className="section-content">

          <h3>4.1 Primary Keys (PK)</h3>
          <p>
            A <strong>Primary Key</strong> is a unique identifier for each row in a table. It ensures:
          </p>
          <ul>
            <li><strong>Uniqueness:</strong> No two rows can have the same primary key value</li>
            <li><strong>Non-nullability:</strong> Primary key cannot be NULL</li>
            <li><strong>Indexing:</strong> Automatically creates an index for fast lookups</li>
          </ul>
          
          <div className="code-example">
            <h4>Implementation Example:</h4>
            <pre><code>{`# SQLAlchemy Model
class Patient(Base):
    __tablename__ = "patient"
    patient_id = Column(Integer, primary_key=True, index=True)
    # Auto-increments: 1, 2, 3, 4...

# SQL Equivalent
CREATE TABLE patient (
    patient_id SERIAL PRIMARY KEY,  -- SERIAL auto-increments
    ...
);`}</code></pre>
            <p><strong>Usage in Queries:</strong></p>
            <pre><code>{`# Find patient by primary key (very fast due to index)
patient = session.query(Patient).filter(Patient.patient_id == 1).first()

# SQL: SELECT * FROM patient WHERE patient_id = 1;`}</code></pre>
          </div>

          <h3>4.2 Foreign Keys (FK)</h3>
          <p>
            A <strong>Foreign Key</strong> is a column that references the primary key of another table. It:
          </p>
          <ul>
            <li><strong>Maintains Referential Integrity:</strong> Ensures referenced row exists</li>
            <li><strong>Enforces Relationships:</strong> Links related data across tables</li>
            <li><strong>Prevents Orphan Records:</strong> Cannot delete parent if children exist (unless CASCADE)</li>
          </ul>
          
          <div className="code-example">
            <h4>Implementation Example:</h4>
            <pre><code>{`# SQLAlchemy Model
class Prediction(Base):
    __tablename__ = "prediction"
    pred_id = Column(Integer, primary_key=True)
    patient_id = Column(Integer, ForeignKey("patient.patient_id"))
    disease_id = Column(Integer, ForeignKey("disease.disease_id"))
    # These FKs link to Patient and Disease tables

# SQL Equivalent
CREATE TABLE prediction (
    pred_id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES patient(patient_id),
    disease_id INTEGER REFERENCES disease(disease_id),
    ...
);`}</code></pre>
            <p><strong>Referential Integrity Example:</strong></p>
            <pre><code>{`# This will FAIL if patient_id=999 doesn't exist
prediction = Prediction(
    patient_id=999,  # Must exist in patient table
    disease_id=1,
    probability=0.65
)
session.add(prediction)
session.commit()  # Database enforces FK constraint`}</code></pre>
          </div>

          <h3>4.3 SELECT Operation</h3>
          <p>
            <strong>SELECT</strong> retrieves data from one or more tables. It's the most common database operation.
          </p>
          
          <div className="code-example">
            <h4>Basic SELECT:</h4>
            <pre><code>{`# Find SNP by rsID
snp = session.query(SNP).filter(SNP.rsid == "rs7903146").first()

# SQL Equivalent:
SELECT * FROM snp WHERE rsid = 'rs7903146';`}</code></pre>
            
            <h4>SELECT with Multiple Conditions:</h4>
            <pre><code>{`# Find disease by name
disease = session.query(Disease)
    .filter(Disease.name == "Type 2 Diabetes")
    .first()

# SQL Equivalent:
SELECT * FROM disease WHERE name = 'Type 2 Diabetes';`}</code></pre>
            
            <h4>SELECT Multiple Columns:</h4>
            <pre><code>{`# Get only specific columns
result = session.query(SNP.rsid, SNP.odds_ratio, SNP.risk_allele)
    .filter(SNP.rsid.in_(["rs7903146", "rs1801282"]))
    .all()

# SQL Equivalent:
SELECT rsid, odds_ratio, risk_allele 
FROM snp 
WHERE rsid IN ('rs7903146', 'rs1801282');`}</code></pre>
          </div>

          <h3>4.4 JOIN Operation</h3>
          <p>
            <strong>JOIN</strong> combines rows from multiple tables based on related columns. In this project, JOINs are used extensively to link related data.
          </p>
          
          <div className="code-example">
            <h4>INNER JOIN - Finding Disease-Specific SNPs:</h4>
            <pre><code>{`# Get all SNPs associated with Type 2 Diabetes
allowed_snp_ids = {
    row.snp_id
    for row in session.query(DiseaseSNP.snp_id)
        .filter(DiseaseSNP.disease_id == disease_id)
}

# SQL Equivalent (INNER JOIN):
SELECT ds.snp_id 
FROM disease_snp ds
INNER JOIN disease d ON ds.disease_id = d.disease_id
WHERE d.disease_id = 1;`}</code></pre>
            
            <h4>JOIN with Multiple Tables:</h4>
            <pre><code>{`# Get SNP details with gene information
result = session.query(SNP, Gene)
    .join(Gene, SNP.gene_id == Gene.gene_id)
    .filter(SNP.rsid == "rs7903146")
    .first()

# SQL Equivalent:
SELECT s.*, g.*
FROM snp s
INNER JOIN gene g ON s.gene_id = g.gene_id
WHERE s.rsid = 'rs7903146';`}</code></pre>
            
            <p><strong>Why JOIN is Critical:</strong> The DiseaseSNP junction table enables filtering SNPs that are relevant to a specific disease. Without JOIN, we'd have to query all SNPs and filter in application code (inefficient).</p>
          </div>

          <h3>4.5 INSERT Operation</h3>
          <p>
            <strong>INSERT</strong> adds new records to a table. Used when creating new patients and storing predictions.
          </p>
          
          <div className="code-example">
            <h4>Inserting a New Patient:</h4>
            <pre><code>{`# Create new patient record
patient = Patient(
    name="John Doe",
    age=45,
    gender="Male"
)
session.add(patient)  # Add to session
session.commit()      # Commit to database
session.refresh(patient)  # Refresh to get auto-generated patient_id

# SQL Equivalent:
INSERT INTO patient (name, age, gender)
VALUES ('John Doe', 45, 'Male')
RETURNING patient_id;`}</code></pre>
            
            <h4>Inserting a Prediction:</h4>
            <pre><code>{`# Store prediction result
prediction = Prediction(
    patient_id=patient.patient_id,  # FK to patient
    disease_id=disease.disease_id,   # FK to disease
    probability=0.65,
    risk_level="High"
)
session.add(prediction)
session.commit()

# SQL Equivalent:
INSERT INTO prediction (patient_id, disease_id, probability, risk_level)
VALUES (1, 1, 0.65, 'High');`}</code></pre>
          </div>

          <h3>4.6 WHERE Clause</h3>
          <p>
            <strong>WHERE</strong> filters rows based on specified conditions. Essential for querying specific data.
          </p>
          
          <div className="code-example">
            <h4>WHERE with Equality:</h4>
            <pre><code>{`# Find patient by ID
patient = session.query(Patient)
    .filter(Patient.patient_id == 1)
    .first()

# SQL: SELECT * FROM patient WHERE patient_id = 1;`}</code></pre>
            
            <h4>WHERE with IN Clause:</h4>
            <pre><code>{`# Find multiple SNPs by rsID
snps = session.query(SNP)
    .filter(SNP.rsid.in_(["rs7903146", "rs1801282", "rs5219"]))
    .all()

# SQL: SELECT * FROM snp WHERE rsid IN ('rs7903146', 'rs1801282', 'rs5219');`}</code></pre>
            
            <h4>WHERE with Multiple Conditions:</h4>
            <pre><code>{`# Find significant SNPs for a disease
significant_snps = session.query(SNP)
    .join(DiseaseSNP, SNP.snp_id == DiseaseSNP.snp_id)
    .filter(
        DiseaseSNP.disease_id == 1,
        SNP.is_significant == True,
        SNP.odds_ratio > 1.2
    )
    .all()

# SQL:
SELECT s.* FROM snp s
JOIN disease_snp ds ON s.snp_id = ds.snp_id
WHERE ds.disease_id = 1 
  AND s.is_significant = TRUE 
  AND s.odds_ratio > 1.2;`}</code></pre>
          </div>

          <h3>4.7 Aggregation Operations</h3>
          <p>
            <strong>Aggregation</strong> computes summary values from multiple rows. Used to combine multiple SNP risk values into a single risk score.
          </p>
          
          <div className="code-example">
            <h4>Weighted Average Aggregation:</h4>
            <pre><code>{`# Build patient feature vector by aggregating SNPs
def _weighted_avg(values, weights, default):
    if not values:
        return default
    total_weight = sum(weights)
    return sum(v * w for v, w in zip(values, weights)) / total_weight

# Collect odds ratios from matched SNPs
odds_vals = [1.37, 1.25, 1.15]  # From multiple SNPs
weights = [max(1.0, abs(o - 1.0)) for o in odds_vals]  # Higher OR = higher weight

# Calculate weighted average
avg_odds_ratio = _weighted_avg(odds_vals, weights, 1.0)

# SQL Equivalent (conceptual):
SELECT 
    SUM(odds_ratio * weight) / SUM(weight) as avg_odds_ratio
FROM matched_snps;`}</code></pre>
            
            <p><strong>Why Weighted Average?</strong> SNPs with higher odds ratios (stronger disease associations) should contribute more to the final risk score. A simple average would treat all SNPs equally, which is less accurate.</p>
          </div>

          <h3>4.8 Indexes</h3>
          <p>
            <strong>Indexes</strong> are database structures that speed up data retrieval by creating sorted references to table rows.
          </p>
          
          <div className="code-example">
            <h4>Index on rsID (Critical for Performance):</h4>
            <pre><code>{`# SQLAlchemy automatically creates index on primary keys
class SNP(Base):
    __tablename__ = "snp"
    snp_id = Column(Integer, primary_key=True, index=True)  # Indexed
    rsid = Column(String(20), unique=True, index=True)     # Indexed for fast lookup

# SQL Equivalent:
CREATE INDEX idx_snp_rsid ON snp(rsid);

# Without index: O(n) - scans entire table
# With index: O(log n) - binary search on sorted index`}</code></pre>
            
            <p><strong>Performance Impact:</strong> Looking up a SNP by rsID without an index would require scanning all rows. With an index, the database can find it instantly using a B-tree structure.            </p>
          </div>

          <h3>4.9 SQL vs NoSQL: Hybrid Database Architecture</h3>
          <p>
            This project uses a <strong>hybrid database approach</strong>, combining the strengths of both SQL (PostgreSQL) and NoSQL (MongoDB) databases.
          </p>
          
          <div className="code-example">
            <h4>SQL Database (PostgreSQL) - Structured Data:</h4>
            <pre><code>{`# PostgreSQL stores structured, relational data
- Patient records with relationships (FKs)
- SNP information with indexed lookups
- Disease-SNP associations (junction table)
- Prediction history with timestamps

# Advantages:
✓ ACID transactions (data integrity)
✓ Complex JOINs for relationships
✓ Indexed queries (fast rsID lookups)
✓ Foreign key constraints (referential integrity)
✓ Structured schema (consistent data)`}</code></pre>
            
            <h4>NoSQL Database (MongoDB) - Flexible Storage:</h4>
            <pre><code>{`# MongoDB stores unstructured, flexible data
- ML model binaries (pickled Python objects)
- Model metadata (variable structure)
- Input logs (evolving schema)
- Training history

# Advantages:
✓ Flexible schema (no fixed structure)
✓ Fast writes for logging
✓ Document storage (JSON-like)
✓ Horizontal scaling
✓ No schema migrations needed`}</code></pre>
          </div>

          <h3>4.10 Merging SQL and NoSQL</h3>
          <p>
            The system seamlessly integrates both databases:
          </p>
          
          <div className="code-example">
            <h4>Integration Pattern:</h4>
            <pre><code>{`# Step 1: Query SQL for structured data
disease = session.query(Disease).filter(Disease.name == "Type 2 Diabetes").first()
patient = Patient(name="John", age=45, gender="Male")
session.add(patient)
session.commit()

# Step 2: Load ML model from MongoDB
model, metadata = load_latest_disease_model(disease.disease_id)
# MongoDB query: find_one({"disease_id": 1}, sort=[("created_at", -1)])

# Step 3: Process and predict
features = build_features_from_sql(session, snps, disease.disease_id)
probability = model.predict_proba([features])[0][1]

# Step 4: Store results in SQL
prediction = Prediction(
    patient_id=patient.patient_id,  # FK from SQL
    disease_id=disease.disease_id,   # FK from SQL
    probability=probability
)
session.add(prediction)
session.commit()

# Step 5: Log in MongoDB for audit trail
doc = {
    "patient_id": patient.patient_id,  # Reference to SQL
    "features": features,
    "model_id": str(metadata["_id"]),  # Reference to MongoDB
    "timestamp": datetime.utcnow()
}
genetic_inputs_collection.insert_one(doc)`}</code></pre>
            
            <p><strong>Why This Works:</strong> SQL handles structured queries and relationships, while MongoDB handles flexible storage. The patient_id acts as a bridge between both databases.</p>
          </div>
            </div>
          )}
        </section>

        {/* ETL Pipeline & Dataset Processing */}
        <section className={`blog-section collapsible ${expandedSections.etl ? 'expanded' : ''}`}>
          <div className="section-header" onClick={() => toggleSection('etl')}>
            <h2>5. ETL Pipeline & Dataset Processing</h2>
            <span className="expand-icon">{expandedSections.etl ? '−' : '+'}</span>
          </div>
          {expandedSections.etl && (
            <div className="section-content">
          
          <h3>5.1 ETL Overview</h3>
          <p>
            <strong>ETL (Extract, Transform, Load)</strong> is the process of extracting data from source files, transforming it into the required format, and loading it into the database.
          </p>
          
          <div className="info-box">
            <h3>ETL Pipeline Stages</h3>
            <ol>
              <li><strong>Extract:</strong> Read CSV file containing GWAS (Genome-Wide Association Study) data</li>
              <li><strong>Transform:</strong> Clean data, handle missing values, split into train/test sets</li>
              <li><strong>Load:</strong> Bulk insert into PostgreSQL tables (Gene, SNP, Disease, DiseaseSNP)</li>
            </ol>
          </div>

          <h3>5.2 Dataset Processing</h3>
          <div className="code-example">
            <h4>Step 1: Extract - Reading CSV File</h4>
            <pre><code>{`# Read GWAS dataset
import pandas as pd

df = pd.read_csv("cleaned_gwas.csv")

# Dataset contains:
# - rsid: SNP identifier
# - gene: Gene name
# - disease: Disease name
# - odds_ratio: Disease association strength
# - risk_allele_freq: Population frequency
# - chromosome, position: Genomic location
# - p_value: Statistical significance
# - is_significant: Boolean flag`}</code></pre>
            
            <h4>Step 2: Transform - Data Cleaning</h4>
            <pre><code>{`# Clean and validate data
def _safe_float(value, default=None):
    try:
        if value == "" or value is None:
            return default
        return float(value)
    except (TypeError, ValueError):
        return default

def _safe_int(value, default=None):
    try:
        if value == "" or value is None:
            return default
        return int(float(value))
    except (TypeError, ValueError):
        return default

# Apply cleaning to each row
for idx, row in df.iterrows():
    odds_ratio = _safe_float(row.get("odds_ratio"), default=1.0)
    chromosome = _safe_int(row.get("chromosome"), default=None)
    position = _safe_int(row.get("position"), default=None)
    # ... more cleaning`}</code></pre>
            
            <h4>Step 3: Transform - Train/Test Split</h4>
            <pre><code>{`# Split dataset for ML training
from sklearn.model_selection import train_test_split

train_df, test_df = train_test_split(
    df, 
    test_size=0.2,  # 20% for testing
    random_state=42  # Reproducibility
)

# Extract unique diseases
diseases = df["disease"].unique()
disease_rows = [{"name": dis, "description": ""} for dis in diseases]`}</code></pre>
          </div>

          <h3>5.3 Load - Bulk Insert into Database</h3>
          <div className="code-example">
            <h4>Bulk Insert with Batching:</h4>
            <pre><code>{`def populate_sql_from_train(train_df, disease_rows):
    session = SessionLocal()
    BATCH_SIZE = 1000  # Commit every 1000 rows
    
    # 1. Insert Diseases
    existing_diseases = {d.name for d in session.query(Disease.name).all()}
    new_diseases = [
        Disease(name=d["name"], description=d["description"])
        for d in disease_rows
        if d["name"] not in existing_diseases
    ]
    if new_diseases:
        session.bulk_save_objects(new_diseases)
        session.commit()
    
    # 2. Insert Genes
    existing_genes = {g.gene_name: g for g in session.query(Gene).all()}
    unique_genes = train_df["gene"].unique()
    genes_to_insert = [
        {"gene_name": gene_name, "description": ""}
        for gene_name in unique_genes
        if gene_name not in existing_genes
    ]
    if genes_to_insert:
        session.bulk_insert_mappings(Gene, genes_to_insert)
        session.commit()
    
    # 3. Insert SNPs in Batches
    existing_snp_rsids = {rsid for rsid, in session.query(SNP.rsid).all()}
    snps_to_insert = []
    gene_id_map = {g.gene_name: g.gene_id for g in existing_genes.values()}
    
    for idx, row in train_df.iterrows():
        if row["rsid"] in existing_snp_rsids:
            continue  # Skip duplicates
        
        snps_to_insert.append({
            "rsid": row["rsid"],
            "gene_id": gene_id_map.get(row["gene"]),
            "chromosome": str(row.get("chromosome", "")),
            "position": _safe_int(row.get("position")),
            "risk_allele": str(row.get("risk_allele", "")).upper()[:1],
            "odds_ratio": _safe_float(row.get("odds_ratio"), default=1.0),
            "risk_allele_freq": _safe_float(row.get("risk_allele_freq"), default=0.0),
            "p_value": _safe_float(row.get("p_value"), default=None),
            "is_significant": bool(row.get("is_significant", False)),
        })
        
        # Commit in batches to avoid long transactions
        if len(snps_to_insert) >= BATCH_SIZE:
            session.bulk_insert_mappings(SNP, snps_to_insert)
            session.commit()
            snps_to_insert = []
    
    # Insert remaining SNPs
    if snps_to_insert:
        session.bulk_insert_mappings(SNP, snps_to_insert)
        session.commit()`}</code></pre>
            
            <p><strong>Why Batching?</strong> Inserting thousands of rows in one transaction can cause timeouts and lock the database. Batching commits every 1000 rows, making the process faster and more reliable.</p>
          </div>

          <h3>5.4 Creating Disease-SNP Associations</h3>
          <div className="code-example">
            <pre><code>{`# After inserting SNPs and Diseases, create associations
def create_disease_snp_associations(train_df):
    session = SessionLocal()
    
    # Get mappings
    disease_map = {d.name: d.disease_id for d in session.query(Disease).all()}
    snp_map = {s.rsid: s.snp_id for s in session.query(SNP).all()}
    
    # Create DiseaseSNP junction table entries
    associations = []
    for idx, row in train_df.iterrows():
        disease_id = disease_map.get(row["disease"])
        snp_id = snp_map.get(row["rsid"])
        
        if disease_id and snp_id:
            associations.append({
                "disease_id": disease_id,
                "snp_id": snp_id
            })
    
    # Bulk insert associations
    if associations:
        session.bulk_insert_mappings(DiseaseSNP, associations)
        session.commit()
        print(f"Created {len(associations)} disease-SNP associations")
    
    session.close()`}</code></pre>
          </div>

          <h3>5.5 Complete ETL Workflow</h3>
          <div className="workflow-example">
            <div className="example-step">
              <h4>1. Extract</h4>
              <p>Read <code>cleaned_gwas.csv</code> containing ~2,786 rows of GWAS data</p>
            </div>
            
            <div className="example-step">
              <h4>2. Transform</h4>
              <ul>
                <li>Clean missing values (use defaults: odds_ratio=1.0, freq=0.0)</li>
                <li>Validate data types (convert strings to int/float safely)</li>
                <li>Split into train (80%) and test (20%) sets</li>
                <li>Extract unique diseases and genes</li>
              </ul>
            </div>
            
            <div className="example-step">
              <h4>3. Load</h4>
              <ol>
                <li>Insert unique diseases into <code>disease</code> table</li>
                <li>Insert unique genes into <code>gene</code> table</li>
                <li>Insert SNPs in batches of 1000 into <code>snp</code> table</li>
                <li>Create disease-SNP associations in <code>disease_snp</code> junction table</li>
              </ol>
            </div>
            
            <div className="example-step">
              <h4>4. Result</h4>
              <p>Database is populated and ready for:</p>
              <ul>
                <li>ML model training (using train_df)</li>
                <li>Model evaluation (using test_df)</li>
                <li>Risk predictions (querying SNP data)</li>
              </ul>
            </div>
          </div>
            </div>
          )}
        </section>

        {/* Implementation Details */}
        <section id="implementation" className={`blog-section collapsible ${expandedSections.implementation ? 'expanded' : ''}`}>
          <div className="section-header" onClick={() => toggleSection('implementation')}>
            <h2>6. Implementation Details</h2>
            <span className="expand-icon">{expandedSections.implementation ? '−' : '+'}</span>
          </div>
          {expandedSections.implementation && (
            <div className="section-content">

          <h3>5.1 Database Connection Setup</h3>
          <div className="code-example">
            <pre><code>{`# database.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# PostgreSQL connection
SQLALCHEMY_DATABASE_URL = "postgresql://user:password@localhost/genetic_db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    pool_size=5,           # Connection pool size
    max_overflow=10,       # Additional connections if needed
    pool_pre_ping=True,    # Verify connections before using
    pool_recycle=3600,     # Recycle connections after 1 hour
)

SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
Base = declarative_base()  # Base class for all models`}</code></pre>
            <p><strong>Connection Pooling:</strong> Reuses database connections instead of creating new ones for each request, significantly improving performance.</p>
          </div>

          <h3>5.2 Feature Vector Construction</h3>
          <p>
            The system builds a feature vector from patient SNPs by:
          </p>
          <ol>
            <li>Matching patient rsIDs with database SNPs</li>
            <li>Filtering to disease-specific SNPs (using JOIN)</li>
            <li>Aggregating values using weighted averages</li>
          </ol>
          
          <div className="code-example">
            <pre><code>{`def _build_patient_feature_vector(session, snps, disease_id):
    # Step 1: Get disease-specific SNP IDs (JOIN operation)
    allowed_snp_ids = {
        row.snp_id
        for row in session.query(DiseaseSNP.snp_id)
            .filter(DiseaseSNP.disease_id == disease_id)
    }
    
    # Step 2: Match patient SNPs with database
    odds_vals, freq_vals, chrom_vals, pos_vals = [], [], [], []
    
    for snp in snps:
        # SELECT operation with WHERE clause
        record = session.query(SNP).filter(SNP.rsid == snp.rsid).first()
        if not record:
            continue
        if record.snp_id not in allowed_snp_ids:
            continue  # Skip SNPs not associated with this disease
        
        # Collect values for aggregation
        odds_vals.append(record.odds_ratio or 1.0)
        freq_vals.append(record.risk_allele_freq or 0.0)
        chrom_vals.append(float(record.chromosome or 0.0))
        pos_vals.append(float(record.position or 0.0))
    
    # Step 3: Weighted aggregation
    weights = [max(1.0, abs(o - 1.0)) for o in odds_vals]
    total_weight = sum(weights) if weights else len(odds_vals)
    
    features = [
        sum(v * w for v, w in zip(odds_vals, weights)) / total_weight,
        sum(v * w for v, w in zip(freq_vals, weights)) / total_weight,
        sum(v * w for v, w in zip(chrom_vals, weights)) / total_weight,
        sum(v * w for v, w in zip(pos_vals, weights)) / total_weight,
    ]
    
    return features`}</code></pre>
          </div>

          <h3>5.3 Complete Prediction Workflow</h3>
          <div className="workflow-steps">
            <div className="workflow-step">
              <h4>Step 1: Validate Disease</h4>
              <pre><code>{`# SELECT with WHERE
disease = session.query(Disease)
    .filter(Disease.name == data.disease_name)
    .first()
if not disease:
    raise HTTPException(400, "Unknown disease")`}</code></pre>
            </div>
            
            <div className="workflow-step">
              <h4>Step 2: Create Patient Record</h4>
              <pre><code>{`# INSERT operation
patient = Patient(
    name=data.patient.name,
    age=data.patient.age,
    gender=data.patient.gender
)
session.add(patient)
session.commit()
session.refresh(patient)  # Get auto-generated patient_id`}</code></pre>
            </div>
            
            <div className="workflow-step">
              <h4>Step 3: Build Feature Vector</h4>
              <pre><code>{`# Multiple SELECT operations with JOINs
features = _build_patient_feature_vector(session, data.snps, disease_id)
# Returns: [avg_odds_ratio, avg_risk_allele_freq, avg_chromosome, avg_position]`}</code></pre>
            </div>
            
            <div className="workflow-step">
              <h4>Step 4: Machine Learning Prediction</h4>
              <pre><code>{`# Load model from MongoDB, predict
model, metadata = load_latest_disease_model(disease_id)
proba = model.predict_proba([features])[0][1]  # Probability of class 1`}</code></pre>
            </div>
            
            <div className="workflow-step">
              <h4>Step 5: Store Prediction</h4>
              <pre><code>{`# INSERT with Foreign Keys
prediction = Prediction(
    patient_id=patient.patient_id,      # FK
    disease_id=disease.disease_id,      # FK
    probability=proba,
    risk_level="High" if proba > 0.5 else "Low"
)
session.add(prediction)
session.commit()`}</code></pre>
            </div>
          </div>
            </div>
          )}
        </section>

        {/* Complete Workflow */}
        <section id="workflow" className={`blog-section collapsible ${expandedSections.workflow ? 'expanded' : ''}`}>
          <div className="section-header" onClick={() => toggleSection('workflow')}>
            <h2>7. Complete Workflow Example</h2>
            <span className="expand-icon">{expandedSections.workflow ? '−' : '+'}</span>
          </div>
          {expandedSections.workflow && (
            <div className="section-content">
          
          <div className="workflow-example">
            <h3>Scenario: Predicting Type 2 Diabetes Risk</h3>
            
            <div className="example-step">
              <h4>Input:</h4>
              <ul>
                <li>Patient: John Doe, Age 45, Male</li>
                <li>Disease: Type 2 Diabetes</li>
                <li>SNPs: rs7903146 (allele T), rs1801282 (allele G)</li>
              </ul>
            </div>
            
            <div className="example-step">
              <h4>Step 1: Database Queries</h4>
              <pre><code>{`-- Query 1: Find disease
SELECT * FROM disease WHERE name = 'Type 2 Diabetes';
-- Returns: disease_id = 1

-- Query 2: Find disease-specific SNPs (JOIN)
SELECT ds.snp_id 
FROM disease_snp ds
WHERE ds.disease_id = 1;
-- Returns: [1, 2, 5, 8, ...] (SNP IDs associated with Type 2 Diabetes)

-- Query 3: Match patient SNPs
SELECT * FROM snp WHERE rsid = 'rs7903146';
-- Returns: snp_id=1, odds_ratio=1.37, risk_allele='T', ...

SELECT * FROM snp WHERE rsid = 'rs1801282';
-- Returns: snp_id=2, odds_ratio=1.25, risk_allele='G', ...`}</code></pre>
            </div>
            
            <div className="example-step">
              <h4>Step 2: Feature Aggregation</h4>
              <pre><code>{`Matched SNPs:
- rs7903146: OR=1.37, freq=0.28, chrom=10, pos=114758349
- rs1801282: OR=1.25, freq=0.15, chrom=3, pos=12345678

Weights: [0.37, 0.25]  # abs(OR - 1.0)
Total weight: 0.62

Weighted averages:
- avg_odds_ratio = (1.37*0.37 + 1.25*0.25) / 0.62 = 1.32
- avg_risk_allele_freq = (0.28*0.37 + 0.15*0.25) / 0.62 = 0.23
- avg_chromosome = (10*0.37 + 3*0.25) / 0.62 = 7.1
- avg_position = (114758349*0.37 + 12345678*0.25) / 0.62 = 75,234,567

Feature vector: [1.32, 0.23, 7.1, 75234567]`}</code></pre>
            </div>
            
            <div className="example-step">
              <h4>Step 3: Machine Learning Prediction</h4>
              <pre><code>{`# Load Type 2 Diabetes model from MongoDB
model = load_disease_model(disease_id=1)

# Predict
features = [1.32, 0.23, 7.1, 75234567]
probability = model.predict_proba([features])[0][1]
# Returns: 0.65 (65% risk)`}</code></pre>
            </div>
            
            <div className="example-step">
              <h4>Step 4: Store Results</h4>
              <pre><code>{`-- INSERT patient
INSERT INTO patient (name, age, gender)
VALUES ('John Doe', 45, 'Male')
RETURNING patient_id;
-- Returns: patient_id = 1

-- INSERT prediction
INSERT INTO prediction (patient_id, disease_id, probability, risk_level)
VALUES (1, 1, 0.65, 'High');`}</code></pre>
            </div>
          </div>
            </div>
          )}
        </section>

        {/* Real-World Examples */}
        <section id="examples" className={`blog-section collapsible ${expandedSections.examples ? 'expanded' : ''}`}>
          <div className="section-header" onClick={() => toggleSection('examples')}>
            <h2>8. Real-World Examples</h2>
            <span className="expand-icon">{expandedSections.examples ? '−' : '+'}</span>
          </div>
          {expandedSections.examples && (
            <div className="section-content">

          <h3>Example 1: Querying Disease-Specific SNPs</h3>
          <div className="code-example">
            <p><strong>Problem:</strong> Find all SNPs associated with Type 2 Diabetes that have odds ratio > 1.3</p>
            <pre><code>{`# SQLAlchemy
significant_snps = session.query(SNP)
    .join(DiseaseSNP, SNP.snp_id == DiseaseSNP.snp_id)
    .filter(
        DiseaseSNP.disease_id == 1,  # Type 2 Diabetes
        SNP.odds_ratio > 1.3
    )
    .all()

# SQL Equivalent
SELECT s.*
FROM snp s
INNER JOIN disease_snp ds ON s.snp_id = ds.snp_id
WHERE ds.disease_id = 1
  AND s.odds_ratio > 1.3;`}</code></pre>
            <p><strong>DBMS Concepts Used:</strong> JOIN (to link tables), WHERE (to filter), Comparison operators</p>
          </div>

          <h3>Example 2: Patient History Query</h3>
          <div className="code-example">
            <p><strong>Problem:</strong> Get all predictions for a specific patient with disease names</p>
            <pre><code>{`# SQLAlchemy
patient_history = session.query(Prediction, Disease)
    .join(Disease, Prediction.disease_id == Disease.disease_id)
    .filter(Prediction.patient_id == 1)
    .order_by(Prediction.timestamp.desc())
    .all()

# SQL Equivalent
SELECT p.*, d.name as disease_name
FROM prediction p
INNER JOIN disease d ON p.disease_id = d.disease_id
WHERE p.patient_id = 1
ORDER BY p.timestamp DESC;`}</code></pre>
            <p><strong>DBMS Concepts Used:</strong> JOIN (multiple tables), WHERE (filtering), ORDER BY (sorting)</p>
          </div>

          <h3>Example 3: Statistical Aggregation</h3>
          <div className="code-example">
            <p><strong>Problem:</strong> Calculate average risk probability for a disease</p>
            <pre><code>{`# SQLAlchemy
from sqlalchemy import func

avg_risk = session.query(
    Disease.name,
    func.avg(Prediction.probability).label('avg_probability'),
    func.count(Prediction.pred_id).label('prediction_count')
).join(
    Prediction, Disease.disease_id == Prediction.disease_id
).group_by(
    Disease.disease_id
).all()

# SQL Equivalent
SELECT 
    d.name,
    AVG(p.probability) as avg_probability,
    COUNT(p.pred_id) as prediction_count
FROM disease d
INNER JOIN prediction p ON d.disease_id = p.disease_id
GROUP BY d.disease_id;`}</code></pre>
            <p><strong>DBMS Concepts Used:</strong> JOIN, GROUP BY, Aggregate functions (AVG, COUNT)</p>
          </div>
            </div>
          )}
        </section>

        {/* ML Integration */}
        <section id="ml-integration" className={`blog-section collapsible ${expandedSections.ml ? 'expanded' : ''}`}>
          <div className="section-header" onClick={() => toggleSection('ml')}>
            <h2>9. Machine Learning Integration</h2>
            <span className="expand-icon">{expandedSections.ml ? '−' : '+'}</span>
          </div>
          {expandedSections.ml && (
            <div className="section-content">

          <h3>8.1 Hybrid Database Architecture</h3>
          <p>
            The system uses a <strong>hybrid database approach</strong>:
          </p>
          <ul>
            <li><strong>PostgreSQL (Relational):</strong> Structured data (patients, SNPs, diseases, predictions)</li>
            <li><strong>MongoDB (NoSQL):</strong> Unstructured data (ML model binaries, metadata, logs)</li>
          </ul>

          <div className="code-example">
            <h4>Why Two Databases?</h4>
            <pre><code>{`# PostgreSQL: Perfect for structured queries
- Patient data with relationships (FKs)
- SNP lookups by rsID (indexed)
- JOIN operations for disease-SNP associations
- ACID transactions for data integrity

# MongoDB: Perfect for flexible storage
- ML model serialization (pickled Python objects)
- Variable metadata structure
- Fast writes for logging
- No schema constraints for evolving data`}</code></pre>
          </div>

          <h3>8.2 Model Storage and Retrieval</h3>
          <div className="code-example">
            <pre><code>{`# Storing trained model in MongoDB
import pickle

model_doc = {
    "disease_id": 1,
    "model": pickle.dumps(trained_model),  # Serialized model
    "created_at": datetime.utcnow(),
    "accuracy": 0.85,
    "feature_columns": ["odds_ratio", "risk_allele_freq", "chromosome", "position"]
}
metadata_collection.insert_one(model_doc)

# Retrieving model
def load_latest_disease_model(disease_id):
    doc = metadata_collection.find_one(
        {"disease_id": disease_id},
        sort=[("created_at", -1)]  # Latest model
    )
    model = pickle.loads(doc["model"])  # Deserialize
    return model, doc`}</code></pre>
          </div>

          <h3>8.3 End-to-End Data Flow</h3>
          <div className="data-flow">
            <div className="flow-item">
              <strong>1. User Input</strong> → Patient demographics + SNP rsIDs
            </div>
            <div className="flow-arrow">↓</div>
            <div className="flow-item">
              <strong>2. Database Queries</strong> → SELECT SNPs, JOIN with DiseaseSNP, filter by disease
            </div>
            <div className="flow-arrow">↓</div>
            <div className="flow-item">
              <strong>3. Feature Engineering</strong> → Weighted aggregation of SNP values
            </div>
            <div className="flow-arrow">↓</div>
            <div className="flow-item">
              <strong>4. ML Prediction</strong> → Load model from MongoDB, predict probability
            </div>
            <div className="flow-arrow">↓</div>
            <div className="flow-item">
              <strong>5. Store Results</strong> → INSERT prediction into PostgreSQL
            </div>
            <div className="flow-arrow">↓</div>
            <div className="flow-item">
              <strong>6. Logging</strong> → Store input/features in MongoDB for audit trail
            </div>
          </div>
            </div>
          )}
        </section>

        {/* Conclusion */}
        <section className={`blog-section collapsible conclusion ${expandedSections.conclusion ? 'expanded' : ''}`}>
          <div className="section-header" onClick={() => toggleSection('conclusion')}>
            <h2>Conclusion</h2>
            <span className="expand-icon">{expandedSections.conclusion ? '−' : '+'}</span>
          </div>
          {expandedSections.conclusion && (
            <div className="section-content">
          <p>
            This project demonstrates the power of combining <strong>relational databases</strong> for structured data 
            management, <strong>NoSQL databases</strong> for flexible storage, and <strong>machine learning</strong> for 
            intelligent predictions. The DBMS operations (SELECT, JOIN, INSERT, Aggregation) form the backbone of the 
            system, enabling efficient data retrieval, relationship management, and feature engineering.
          </p>
          <p>
            Key takeaways:
          </p>
          <ul>
            <li><strong>Proper Database Design:</strong> Normalized schema with appropriate relationships ensures data integrity</li>
            <li><strong>Indexing:</strong> Critical for performance, especially on frequently queried columns like rsID</li>
            <li><strong>JOIN Operations:</strong> Essential for linking related data across tables</li>
            <li><strong>Aggregation:</strong> Combines multiple data points into meaningful features</li>
            <li><strong>Hybrid Architecture:</strong> Using the right database for the right purpose maximizes efficiency</li>
            </ul>
            </div>
          )}
        </section>

      </div>
    </div>
  );
}

export default BlogPage;

