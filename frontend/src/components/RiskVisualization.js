import React from "react";
import "../styles/RiskVisualization.css";

function RiskVisualization({ result }) {
  const riskProbability = (result.risk_probability * 100).toFixed(2);
  const riskLevel = result.risk_probability > 0.7 ? "High" 
                   : result.risk_probability > 0.4 ? "Medium" 
                   : "Low";
  
  const riskColor = result.risk_probability > 0.7 ? "#ef4444" 
                   : result.risk_probability > 0.4 ? "#f59e0b" 
                   : "#10b981";
  
  const riskPercentage = parseFloat(riskProbability);
  const circumference = 2 * Math.PI * 90; // radius = 90
  const offset = circumference - (riskPercentage / 100) * circumference;

  // Risk categories for visualization
  const riskCategories = [
    { label: "Low", range: [0, 40], color: "#10b981" },
    { label: "Medium", range: [40, 70], color: "#f59e0b" },
    { label: "High", range: [70, 100], color: "#ef4444" }
  ];

  const getRiskCategoryIndex = () => {
    if (riskPercentage < 40) return 0;
    if (riskPercentage < 70) return 1;
    return 2;
  };

  return (
    <div className="risk-visualization">
      <div className="card-title">Risk Prediction</div>
        
        {/* Circular Gauge Chart */}
        <div className="gauge-container">
          <svg className="gauge-chart" viewBox="0 0 220 220">
            {/* Background circle */}
            <circle
              cx="110"
              cy="110"
              r="90"
              fill="none"
              stroke="rgba(255, 255, 255, 0.1)"
              strokeWidth="16"
            />
            
            {/* Risk level segments */}
            {riskCategories.map((category, index) => {
              const startAngle = (category.range[0] / 100) * 360 - 90;
              const endAngle = (category.range[1] / 100) * 360 - 90;
              const startRad = (startAngle * Math.PI) / 180;
              const endRad = (endAngle * Math.PI) / 180;
              const x1 = 110 + 90 * Math.cos(startRad);
              const y1 = 110 + 90 * Math.sin(startRad);
              const x2 = 110 + 90 * Math.cos(endRad);
              const y2 = 110 + 90 * Math.sin(endRad);
              const largeArc = category.range[1] - category.range[0] > 50 ? 1 : 0;
              
              return (
                <path
                  key={index}
                  d={`M 110 110 L ${x1} ${y1} A 90 90 0 ${largeArc} 1 ${x2} ${y2} Z`}
                  fill={category.color}
                  opacity="0.12"
                />
              );
            })}
            
            {/* Risk level segment borders */}
            {riskCategories.map((category, index) => {
              if (index === 0) return null; // Skip first border
              const angle = (category.range[0] / 100) * 360 - 90;
              const rad = (angle * Math.PI) / 180;
              const x = 110 + 90 * Math.cos(rad);
              const y = 110 + 90 * Math.sin(rad);
              
              return (
                <line
                  key={`border-${index}`}
                  x1="110"
                  y1="110"
                  x2={x}
                  y2={y}
                  stroke="rgba(255, 255, 255, 0.2)"
                  strokeWidth="2"
                />
              );
            })}
            
            {/* Progress circle */}
            <circle
              cx="110"
              cy="110"
              r="90"
              fill="none"
              stroke={riskColor}
              strokeWidth="16"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              transform="rotate(-90 110 110)"
              className="gauge-progress"
            />
            
            {/* Center text */}
            <text x="110" y="100" textAnchor="middle" className="gauge-percentage">
              {riskProbability}%
            </text>
            <text x="110" y="125" textAnchor="middle" className="gauge-label">
              {riskLevel} Risk
            </text>
          </svg>
        </div>

        {/* Risk Level Indicator */}
        <div className="risk-indicator">
          <div className="risk-level-badge" style={{ backgroundColor: riskColor + "20", borderColor: riskColor }}>
            <span className="risk-level-text" style={{ color: riskColor }}>
              {riskLevel}
            </span>
          </div>
        </div>

        {/* Bar Chart Visualization */}
        <div className="risk-bar-chart">
          <div className="bar-chart-title">Risk Distribution</div>
          <div className="bar-chart-container">
            {riskCategories.map((category, index) => {
              const isActive = index === getRiskCategoryIndex();
              const barWidth = category.range[1] - category.range[0];
              
              return (
                <div key={index} className="bar-chart-item">
                  <div className="bar-chart-label">{category.label}</div>
                  <div className="bar-chart-bar-wrapper">
                    <div 
                      className={`bar-chart-bar ${isActive ? 'active' : ''}`}
                      style={{
                        width: `${barWidth}%`,
                        backgroundColor: isActive ? category.color : category.color + "40",
                        borderColor: isActive ? category.color : 'transparent'
                      }}
                    >
                      {isActive && (
                        <div 
                          className="bar-chart-marker"
                          style={{
                            left: `${((riskPercentage - category.range[0]) / barWidth) * 100}%`,
                            backgroundColor: category.color
                          }}
                        />
                      )}
                    </div>
                  </div>
                  <div className="bar-chart-range">
                    {category.range[0]}% - {category.range[1]}%
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Details */}
        <div className="prediction-details">
          <div className="detail-item">
            <span className="detail-label">Patient ID</span>
            <span className="detail-value">{result.patient_id}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Disease</span>
            <span className="detail-value">{result.disease}</span>
          </div>
          {result.model_id && (
            <div className="detail-item">
              <span className="detail-label">Model ID</span>
              <span className="detail-value">{result.model_id.substring(0, 8)}...</span>
            </div>
          )}
        </div>
    </div>
  );
}

export default RiskVisualization;

