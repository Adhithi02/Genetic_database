import React, { useState } from "react";
import "../styles/Glossary.css";

const GLOSSARY_DATA = {
  dbms: [
    { key: "dbms", term: "DBMS", meaning: "Database Management System - software that manages data storage, retrieval, and manipulation", relevance: "Organizes genetic data in tables for efficient querying" },
    { key: "table", term: "Table", meaning: "A structured collection of related data organized in rows and columns", relevance: "Stores entities like Patient, SNP, Disease in separate tables" },
    { key: "select", term: "SELECT", meaning: "SQL operation to retrieve data from one or more tables", relevance: "Queries the database to find matching SNP records" },
    { key: "join", term: "JOIN", meaning: "SQL operation that combines rows from multiple tables based on related columns", relevance: "Links SNP and Disease tables to find disease-specific variants" },
    { key: "insert", term: "INSERT", meaning: "SQL operation to add new records into a table", relevance: "Creates a new patient record in the database" },
    { key: "pk", term: "Primary Key (PK)", meaning: "A unique identifier for each row in a table", relevance: "Ensures each patient, SNP, and disease has a unique ID" },
    { key: "fk", term: "Foreign Key (FK)", meaning: "A column that references the primary key of another table", relevance: "Links related data across tables (e.g., patient_id in Prediction table)" },
    { key: "where", term: "WHERE", meaning: "SQL clause that filters rows based on specified conditions", relevance: "Narrows down results to specific diseases or SNPs" },
    { key: "aggregate", term: "Aggregation", meaning: "SQL operations that compute summary values (SUM, AVG, COUNT) from multiple rows", relevance: "Combines multiple SNP risk values into a single risk score" },
    { key: "confidence", term: "Confidence", meaning: "A measure of how certain the prediction is, based on data quality and model accuracy", relevance: "Reflects the reliability of the computed risk probability" }
  ],
  genetics: [
    { key: "snp", term: "SNP", meaning: "Single Nucleotide Polymorphism - a variation at a single DNA position where people differ", relevance: "These variations can indicate increased or decreased disease risk" },
    { key: "rsid", term: "rsID", meaning: "Reference SNP cluster ID - a unique identifier for each known genetic variant", relevance: "Used to look up specific genetic variants in databases" },
    { key: "allele", term: "Allele", meaning: "One of two or more versions of a gene or DNA sequence at a specific location", relevance: "Different alleles (A, T, G, C) can have different disease associations" },
    { key: "gene", term: "Gene", meaning: "A segment of DNA that codes for a protein and influences traits or disease risk", relevance: "Multiple genes can contribute to a single disease risk" },
    { key: "odds ratio", term: "Odds Ratio", meaning: "A measure of how strongly a genetic variant is associated with disease risk", relevance: "Higher odds ratios indicate stronger genetic risk factors" },
    { key: "disease association", term: "Disease Association", meaning: "A statistical link between a genetic variant and increased disease risk", relevance: "Found through large-scale genetic studies (GWAS)" },
    { key: "risk score", term: "Risk Score", meaning: "A numerical value combining multiple genetic factors to estimate disease probability", relevance: "The final output that predicts your disease risk" },
    { key: "patient demographics", term: "Patient Demographics", meaning: "Basic patient information like age and gender", relevance: "Can modify how genetic risk factors affect overall disease probability" },
    { key: "genetics", term: "Genetics", meaning: "The study of genes, genetic variation, and heredity", relevance: "Understanding genetics helps interpret how DNA affects health" },
    { key: "disease-specific variants", term: "Disease-Specific Variants", meaning: "Genetic variants that are known to affect risk for a particular disease", relevance: "Not all genetic variants affect all diseases - filtering is important" }
  ]
};

function Glossary({ onClose }) {
  const [activeTab, setActiveTab] = useState("genetics");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredTerms = GLOSSARY_DATA[activeTab].filter(item =>
    item.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.meaning.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="glossary-overlay" onClick={onClose}>
      <div className="glossary-panel" onClick={(e) => e.stopPropagation()}>
        <div className="glossary-header">
          <h2>Glossary</h2>
          <button className="glossary-close" onClick={onClose}>×</button>
        </div>

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
            placeholder="Search terms..."
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
                <div key={item.key} className="glossary-tile">
                  <div className="glossary-tile-header">
                    <strong className="glossary-tile-term">{item.term}</strong>
                  </div>
                  <div className="glossary-tile-body">
                    <div className="glossary-tile-meaning">{item.meaning}</div>
                    <div className="glossary-tile-relevance">
                      <strong>Why it matters:</strong> {item.relevance}
                    </div>
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

export default Glossary;

