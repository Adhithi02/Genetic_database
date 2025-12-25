import React, { useState, useRef, useEffect } from "react";
import "../styles/TermTooltip.css";

const TERMS = {
  dbms: {
    dbms: { term: "DBMS", meaning: "Database Management System - software that manages data storage, retrieval, and manipulation", relevance: "Organizes genetic data in tables for efficient querying" },
    table: { term: "Table", meaning: "A structured collection of related data organized in rows and columns", relevance: "Stores entities like Patient, SNP, Disease in separate tables" },
    select: { term: "SELECT", meaning: "SQL operation to retrieve data from one or more tables", relevance: "Queries the database to find matching SNP records" },
    join: { term: "JOIN", meaning: "SQL operation that combines rows from multiple tables based on related columns", relevance: "Links SNP and Disease tables to find disease-specific variants" },
    insert: { term: "INSERT", meaning: "SQL operation to add new records into a table", relevance: "Creates a new patient record in the database" },
    pk: { term: "Primary Key (PK)", meaning: "A unique identifier for each row in a table", relevance: "Ensures each patient, SNP, and disease has a unique ID" },
    fk: { term: "Foreign Key (FK)", meaning: "A column that references the primary key of another table", relevance: "Links related data across tables (e.g., patient_id in Prediction table)" },
    where: { term: "WHERE", meaning: "SQL clause that filters rows based on specified conditions", relevance: "Narrows down results to specific diseases or SNPs" },
    aggregate: { term: "Aggregation", meaning: "SQL operations that compute summary values (SUM, AVG, COUNT) from multiple rows", relevance: "Combines multiple SNP risk values into a single risk score" },
    confidence: { term: "Confidence", meaning: "A measure of how certain the prediction is, based on data quality and model accuracy", relevance: "Reflects the reliability of the computed risk probability" }
  },
  genetics: {
    snp: { term: "SNP", meaning: "Single Nucleotide Polymorphism - a variation at a single DNA position where people differ", relevance: "These variations can indicate increased or decreased disease risk" },
    rsid: { term: "rsID", meaning: "Reference SNP cluster ID - a unique identifier for each known genetic variant", relevance: "Used to look up specific genetic variants in databases" },
    allele: { term: "Allele", meaning: "One of two or more versions of a gene or DNA sequence at a specific location", relevance: "Different alleles (A, T, G, C) can have different disease associations" },
    gene: { term: "Gene", meaning: "A segment of DNA that codes for a protein and influences traits or disease risk", relevance: "Multiple genes can contribute to a single disease risk" },
    "odds ratio": { term: "Odds Ratio", meaning: "A measure of how strongly a genetic variant is associated with disease risk", relevance: "Higher odds ratios indicate stronger genetic risk factors" },
    "disease association": { term: "Disease Association", meaning: "A statistical link between a genetic variant and increased disease risk", relevance: "Found through large-scale genetic studies (GWAS)" },
    "risk score": { term: "Risk Score", meaning: "A numerical value combining multiple genetic factors to estimate disease probability", relevance: "The final output that predicts your disease risk" },
    "patient demographics": { term: "Patient Demographics", meaning: "Basic patient information like age and gender", relevance: "Can modify how genetic risk factors affect overall disease probability" },
    "genetics": { term: "Genetics", meaning: "The study of genes, genetic variation, and heredity", relevance: "Understanding genetics helps interpret how DNA affects health" },
    "disease-specific variants": { term: "Disease-Specific Variants", meaning: "Genetic variants that are known to affect risk for a particular disease", relevance: "Not all genetic variants affect all diseases - filtering is important" }
  }
};

function TermTooltip({ term, category, children }) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const termRef = useRef(null);
  const tooltipRef = useRef(null);

  const termKey = term.toLowerCase().replace(/\s+/g, "").replace(/[()]/g, "");
  const termData = TERMS[category]?.[termKey] || TERMS[category]?.[term];

  useEffect(() => {
    if (isVisible && termRef.current && tooltipRef.current) {
      const rect = termRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      
      let top = rect.bottom + 10;
      let left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);

      // Adjust if tooltip goes off screen
      if (left < 10) left = 10;
      if (left + tooltipRect.width > window.innerWidth - 10) {
        left = window.innerWidth - tooltipRect.width - 10;
      }
      if (top + tooltipRect.height > window.innerHeight - 10) {
        top = rect.top - tooltipRect.height - 10;
      }

      setPosition({ top, left });
    }
  }, [isVisible]);

  if (!termData) {
    return <span>{children}</span>;
  }

  return (
    <>
      <span
        ref={termRef}
        className="term-highlight"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onClick={() => setIsVisible(!isVisible)}
      >
        {children || termData.term}
      </span>
      {isVisible && (
        <div
          ref={tooltipRef}
          className={`term-tooltip ${category}`}
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`,
            position: "fixed",
            zIndex: 99999
          }}
          onMouseEnter={() => setIsVisible(true)}
          onMouseLeave={() => setIsVisible(false)}
        >
          <div className="tooltip-header">
            <strong>{termData.term}</strong>
          </div>
          <div className="tooltip-body">
            <div className="tooltip-meaning">{termData.meaning}</div>
            <div className="tooltip-relevance">
              <strong>Why it matters:</strong> {termData.relevance}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default TermTooltip;

