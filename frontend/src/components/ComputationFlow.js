import React, { useState, useEffect } from "react";
import "../styles/ComputationFlow.css";
import SQLViewer from "./SQLViewer";

const STEPS = [
  {
    id: 1,
    title: "Patient Identification",
    icon: null,
    dbms: {
      table: "Patient",
      operation: "INSERT",
      keys: "PK: patient_id",
      description: "Create a new patient record with demographics"
    },
    genetics: {
      term: "Patient Demographics",
      meaning: "Basic patient information (age, gender) that may influence disease risk",
      relevance: "Age and gender can affect how genetic variants interact with disease risk"
    },
    sql: `INSERT INTO Patient (name, age, gender)
VALUES (:name, :age, :gender)
RETURNING patient_id;`
  },
  {
    id: 2,
    title: "SNP Matching",
    icon: null,
    dbms: {
      table: "SNP",
      operation: "SELECT",
      keys: "PK: snp_id, Lookup: rsid",
      description: "Match patient's SNP rsIDs with database records"
    },
    genetics: {
      term: "SNP Matching",
      meaning: "Finding specific genetic variants in the database using rsID identifiers",
      relevance: "Each rsID uniquely identifies a genetic variant location"
    },
    sql: `SELECT snp_id, odds_ratio, risk_allele_freq, 
       chromosome, position
FROM SNP
WHERE rsid IN (:rsid1, :rsid2, ...);`
  },
  {
    id: 3,
    title: "Gene Association",
    icon: null,
    dbms: {
      table: "DiseaseSNP (JOIN)",
      operation: "JOIN",
      keys: "FK: disease_id, FK: snp_id",
      description: "Join SNPs with disease associations"
    },
    genetics: {
      term: "Disease Association",
      meaning: "Link between specific genetic variants and disease risk",
      relevance: "Not all SNPs are relevant to all diseases - filtering is crucial"
    },
    sql: `SELECT s.snp_id, s.odds_ratio, s.risk_allele_freq
FROM SNP s
JOIN DiseaseSNP ds ON s.snp_id = ds.snp_id
WHERE ds.disease_id = :disease_id
  AND s.rsid IN (:patient_rsids);`
  },
  {
    id: 4,
    title: "Disease Filtering",
    icon: null,
    dbms: {
      table: "Disease",
      operation: "SELECT + FILTER",
      keys: "PK: disease_id, WHERE clause",
      description: "Filter SNPs specific to the selected disease"
    },
    genetics: {
      term: "Disease-Specific Variants",
      meaning: "Genetic variants that have been shown to affect risk for a specific disease",
      relevance: "Different diseases have different genetic risk factors"
    },
    sql: `SELECT d.disease_id, d.name
FROM Disease d
WHERE d.name = :disease_name;`
  },
  {
    id: 5,
    title: "Risk Aggregation",
    icon: null,
    dbms: {
      table: "Aggregation",
      operation: "AGGREGATE",
      keys: "Weighted average calculation",
      description: "Compute weighted risk score from matched SNPs"
    },
    genetics: {
      term: "Risk Score Calculation",
      meaning: "Combining multiple genetic risk factors into a single probability",
      relevance: "Risk is calculated using odds ratios and allele frequencies from GWAS studies"
    },
    sql: `-- Weighted average of odds_ratio, risk_allele_freq
SELECT 
  SUM(odds_ratio * weight) / SUM(weight) as avg_odds_ratio,
  SUM(risk_allele_freq * weight) / SUM(weight) as avg_risk_freq
FROM matched_snps;`
  }
];

function ComputationFlow({ result, activeStep, setActiveStep }) {
  const [expandedStep, setExpandedStep] = useState(null);
  const [showSQL, setShowSQL] = useState({});

  // Auto-animate steps
  useEffect(() => {
    if (result && activeStep >= 0 && activeStep < STEPS.length - 1) {
      const timer = setTimeout(() => {
        setActiveStep(activeStep + 1);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [activeStep, result]);

  const toggleStep = (stepId) => {
    setExpandedStep(expandedStep === stepId ? null : stepId);
  };

  const toggleSQL = (stepId) => {
    setShowSQL({ ...showSQL, [stepId]: !showSQL[stepId] });
  };

  return (
    <div className="computation-flow">
      <div className="flow-timeline">
        {STEPS.map((step, index) => {
          const isActive = activeStep >= 0 && index <= activeStep;
          const isExpanded = expandedStep === step.id;
          const isCurrent = activeStep >= 0 && index === activeStep;

          return (
            <div key={step.id} className={`flow-step ${isActive ? 'active' : ''} ${isCurrent ? 'current' : ''}`}>
              <div className="step-connector">
                {index > 0 && <div className={`connector-line ${isActive ? 'filled' : ''}`}></div>}
                <div className="step-node" onClick={() => toggleStep(step.id)}>
                  <div className="step-number">{step.id}</div>
                </div>
                {index < STEPS.length - 1 && <div className={`connector-line ${index < activeStep ? 'filled' : ''}`}></div>}
              </div>

              <div className="step-content">
                <div className="step-header" onClick={() => toggleStep(step.id)}>
                  <h3>{step.title}</h3>
                  <button className="expand-btn">{isExpanded ? '−' : '+'}</button>
                </div>

                {isExpanded && (
                  <div className="step-details fade-in">
                    <div className="dual-explanation">
                      {/* DBMS Perspective */}
                      <div className="explanation-card dbms-card">
                        <div className="explanation-header">
                          <span className="explanation-title">DBMS Perspective</span>
                        </div>
                        <div className="explanation-body">
                          <div className="explanation-item">
                            <strong>Table:</strong> {step.dbms.table}
                          </div>
                          <div className="explanation-item">
                            <strong>Operation:</strong> {step.dbms.operation}
                          </div>
                          <div className="explanation-item">
                            <strong>Keys:</strong> {step.dbms.keys}
                          </div>
                          <div className="explanation-description">
                            {step.dbms.description}
                          </div>
                        </div>
                      </div>

                      {/* Genetics Perspective */}
                      <div className="explanation-card genetics-card">
                        <div className="explanation-header">
                          <span className="explanation-title">Genetics Perspective</span>
                        </div>
                        <div className="explanation-body">
                          <div className="explanation-item">
                            <strong>Term:</strong> {step.genetics.term}
                          </div>
                          <div className="explanation-description">
                            <strong>Meaning:</strong> {step.genetics.meaning}
                          </div>
                          <div className="explanation-description">
                            <strong>Why it matters:</strong> {step.genetics.relevance}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* SQL Viewer */}
                    <div className="sql-section">
                      <button 
                        className="btn btn-secondary sql-toggle"
                        onClick={() => toggleSQL(step.id)}
                      >
                        {showSQL[step.id] ? 'Hide SQL' : 'Show SQL Query'}
                      </button>
                      {showSQL[step.id] && (
                        <SQLViewer sql={step.sql} stepTitle={step.title} />
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flow-legend">
        <div className="legend-item">
          <div className="legend-node active"></div>
          <span>Completed</span>
        </div>
        <div className="legend-item">
          <div className="legend-node current"></div>
          <span>Current</span>
        </div>
        <div className="legend-item">
          <div className="legend-node"></div>
          <span>Pending</span>
        </div>
      </div>
    </div>
  );
}

export default ComputationFlow;

