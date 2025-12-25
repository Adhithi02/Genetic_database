import React, { useState, useEffect } from "react";
import "../styles/Results.css";
import ComputationFlow from "./ComputationFlow";

function Results({ result }) {
  const [activeStep, setActiveStep] = useState(-1);
  
  // Start animation when component mounts
  useEffect(() => {
    setActiveStep(0);
  }, [result]);
  
  const riskProbability = (result.risk_probability * 100).toFixed(2);
  const riskLevel = result.risk_probability > 0.7 ? "High" 
                   : result.risk_probability > 0.4 ? "Medium" 
                   : "Low";
  
  const riskColor = result.risk_probability > 0.7 ? "#dc3545" 
                   : result.risk_probability > 0.4 ? "#ffc107" 
                   : "#28a745";

  return (
    <div className="results-container fade-in">
      {/* Section: How the Prediction Was Computed */}
      <div className="card">
        <div className="card-title">
          How the Prediction Was Computed
        </div>
        <p className="computation-intro">
          Follow the computation flow below to understand how your genetic data transforms into a disease risk prediction. 
          Each step shows both the DBMS operations and the genetics concepts involved.
        </p>
        
        <ComputationFlow 
          result={result}
          activeStep={activeStep}
          setActiveStep={setActiveStep}
        />
      </div>
    </div>
  );
}

export default Results;
