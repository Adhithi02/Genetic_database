import React, { useState } from "react";
import "../App.css";
import InputForm from "../components/inputForm";
import RiskVisualization from "../components/RiskVisualization";
import GenomicNetwork from "../components/GenomicNetwork";

function RiskPredictor({ onNavigate }) {
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState("clinical");

  return (
    <div className="app-container">
      <div className="app-header">
        <h1>Genomic Vulnerability Predictor</h1>
        <p>Advanced diagnostic profiling using SHAP and Reactome Pathway Analysis</p>
      </div>

      <div className="page-navigation">
        <button className="btn btn-secondary" onClick={() => onNavigate("home")}>
          Back to Home
        </button>
      </div>

      <div className="main-content-layout">
        <div className="card fade-in form-card">
          <div className="card-title">Patient Variant Input</div>
          <InputForm setResult={(data) => {
             setResult(data);
             setActiveTab("clinical");
          }} />
        </div>

        {result && (
          <div className="card fade-in result-card" style={{ padding: 0 }}>
             {/* Modern Tab Bar */}
             <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.1)' }}>
                <button 
                  onClick={() => setActiveTab('clinical')}
                  style={{ flex: 1, padding: '16px', border: 'none', background: activeTab === 'clinical' ? 'rgba(59, 130, 246, 0.1)' : 'transparent', color: activeTab === 'clinical' ? '#3b82f6' : '#9ca3af', borderBottom: activeTab === 'clinical' ? '2px solid #3b82f6' : 'none', cursor: 'pointer', fontWeight: 600, fontSize: '15px' }}
                >
                  Clinical Assessment
                </button>
                <button 
                  onClick={() => setActiveTab('network')}
                  style={{ flex: 1, padding: '16px', border: 'none', background: activeTab === 'network' ? 'rgba(168, 85, 247, 0.1)' : 'transparent', color: activeTab === 'network' ? '#a855f7' : '#9ca3af', borderBottom: activeTab === 'network' ? '2px solid #a855f7' : 'none', cursor: 'pointer', fontWeight: 600, fontSize: '15px' }}
                >
                  Biological Topography
                </button>
             </div>
             
             <div style={{ padding: '24px' }}>
               {activeTab === 'clinical' && <RiskVisualization result={result} />}
               {activeTab === 'network' && <GenomicNetwork networkData={result.network} height={600} />}
             </div>
          </div>
        )}
        
        {!result && (
          <div className="card fade-in result-card placeholder-card">
            <div className="placeholder-content">
              <div className="placeholder-text">Submit patient genetics to generate personalized diagnostic profiling.</div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}

export default RiskPredictor;
