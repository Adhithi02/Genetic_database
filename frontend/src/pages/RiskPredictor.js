import React, { useState } from "react";
import "../App.css";
import InputForm from "../components/inputForm";
import Results from "../components/results";
import RiskVisualization from "../components/RiskVisualization";

function RiskPredictor({ onNavigate }) {
  const [result, setResult] = useState(null);

  return (
    <div className="app-container">
      <div className="app-header">
        <h1>Risk Predictor</h1>
        <p>Predict disease risk using genetic variants and visualize the computation process</p>
      </div>

      <div className="page-navigation">
        <button className="btn btn-secondary" onClick={() => onNavigate("home")}>
          Home
        </button>
      </div>

      <div className="main-content-layout">
        <div className="card fade-in form-card">
          <div className="card-title">
            Prediction Input
          </div>
          <InputForm setResult={setResult} />
        </div>

        {result && (
          <div className="card fade-in result-card">
            <RiskVisualization result={result} />
          </div>
        )}
        {!result && (
          <div className="card fade-in result-card placeholder-card">
            <div className="placeholder-content">
              <div className="placeholder-text">Submit the form to see risk prediction visualization</div>
            </div>
          </div>
        )}
      </div>

      {result && (
        <>
          <div className="section-divider"></div>
          <Results result={result} />
        </>
      )}
    </div>
  );
}

export default RiskPredictor;

