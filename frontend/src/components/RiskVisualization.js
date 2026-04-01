import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from "recharts";
import { Activity, ShieldAlert, HeartPulse } from "lucide-react";
import "../styles/RiskVisualization.css";

function RiskVisualization({ result }) {
  if (!result || !result.prediction) return null;

  const pred = result.prediction;
  const mlProb = pred.ml_prediction.risk_probability;
  const mlLevel = pred.ml_prediction.risk_level;
  
  const riskPercentage = (mlProb * 100).toFixed(1);
  const prsValue = pred.prs.raw_score.toFixed(3);
  const prsClass = pred.prs.clinical_classification;

  // Gauge values
  const circumference = 2 * Math.PI * 90;
  const offset = circumference - (riskPercentage / 100) * circumference;
  
  // Risk color mapping
  const getRiskColor = (prob) => {
    if (prob > 0.7) return "#ef4444";
    if (prob > 0.4) return "#f59e0b";
    return "#10b981";
  };
  const color = getRiskColor(mlProb);

  // SHAP formatting
  let shapData = [];
  if (pred.shap_explanation && !pred.shap_explanation.error) {
    shapData = Object.entries(pred.shap_explanation).map(([key, value]) => ({
      name: key.replace(/_/g, " ").toUpperCase(),
      impact: value * 100,
      isNegative: value < 0
    }));
  }

  return (
    <div className="risk-visualization">
      
      {/* HEADER STATS */}
      <div className="dashboard-stats-grid">
        <div className="stat-card">
          <HeartPulse size={24} className="stat-icon" style={{color: color}} />
          <div className="stat-content">
            <span className="stat-label">ML Risk Score</span>
            <span className="stat-value" style={{color: color}}>{riskPercentage}%</span>
            <span className="stat-sub">{mlLevel} Classification</span>
          </div>
        </div>
        
        <div className="stat-card">
          <Activity size={24} className="stat-icon text-blue" />
          <div className="stat-content">
            <span className="stat-label">Clinical PRS Baseline</span>
            <span className="stat-value text-blue">{prsValue}</span>
            <span className="stat-sub">{prsClass}</span>
          </div>
        </div>

        <div className="stat-card">
          <ShieldAlert size={24} className="stat-icon text-purple" />
          <div className="stat-content">
            <span className="stat-label">Biomarkers Matched</span>
            <span className="stat-value text-purple">{pred.matched_snps}</span>
            <span className="stat-sub">of {pred.total_snps_submitted} submitted</span>
          </div>
        </div>
      </div>

      <div className="shards-layout">
        {/* ML GAUGE CHART */}
        <div className="shard-card text-center relative-pos">
          <h3 className="shard-title">Risk Probability Gauge</h3>
          <div className="gauge-wrapper">
            <svg className="gauge-chart" viewBox="0 0 220 220">
              <circle cx="110" cy="110" r="90" fill="none" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="18" />
              <circle
                cx="110" cy="110" r="90" fill="none"
                stroke={color} strokeWidth="18" strokeLinecap="round"
                strokeDasharray={circumference} strokeDashoffset={offset}
                transform="rotate(-90 110 110)"
                className="gauge-progress animate-gauge"
              />
              <text x="110" y="105" textAnchor="middle" className="gauge-percentage">
                {riskPercentage}%
              </text>
              <text x="110" y="130" textAnchor="middle" className="gauge-label">
                Machine Learning Prediction
              </text>
            </svg>
          </div>
        </div>

        {/* SHAP EXPLAINABILITY BAR CHART */}
        <div className="shard-card">
          <h3 className="shard-title">SHAP Feature Explainability</h3>
          <p className="shard-subtitle">Mathematical breakdown of risk drivers (Red = Increases Risk, Green = Decreases Risk)</p>
          
          {shapData.length > 0 ? (
            <div className="shap-chart-container">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={shapData} layout="vertical" margin={{ top: 20, right: 30, left: 40, bottom: 5 }}>
                  <XAxis type="number" stroke="rgba(255,255,255,0.5)" />
                  <YAxis dataKey="name" type="category" stroke="rgba(255,255,255,0.8)" width={120} tick={{ fontSize: 12 }} />
                  <Tooltip 
                    cursor={{fill: 'rgba(255,255,255,0.05)'}}
                    contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '8px' }}
                    formatter={(val) => [`${Math.abs(val).toFixed(2)}% impact`, "Driver"]}
                  />
                  <ReferenceLine x={0} stroke="rgba(255,255,255,0.3)" />
                  <Bar dataKey="impact" barSize={20} radius={[0, 4, 4, 0]}>
                    {shapData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.impact > 0 ? '#ef4444' : '#10b981'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="placeholder-text" style={{padding: '40px', textAlign: 'center', color: '#9ca3af'}}>No SHAP explanations available for this run.</div>
          )}
        </div>
      </div>

    </div>
  );
}

export default RiskVisualization;
