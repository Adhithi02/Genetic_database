import React from "react";

function Results({ result }) {
  return (
    <div style={{ marginTop: "20px" }}>
      <h3>Prediction Result</h3>
      <p>Patient ID: {result.patient_id}</p>
      <p>Disease: {result.disease}</p>
      <p>Risk Probability: {(result.risk_probability * 100).toFixed(2)}%</p>
    </div>
  );
}

export default Results;
