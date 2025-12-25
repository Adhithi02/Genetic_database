import React from "react";
import "../styles/Home.css";

function Home({ onNavigate }) {
  return (
    <div className="home-container">
      <div className="home-header">
        <h1>Genetic Risk Database</h1>
        <p>Comprehensive platform for genetic risk prediction and education</p>
      </div>

      <div className="home-buttons">
        <button 
          className="home-button risk-predictor"
          onClick={() => onNavigate('predictor')}
        >
          <div className="button-content">
            <h2>Risk Predictor</h2>
            <p>Predict disease risk using genetic variants and visualize the computation process</p>
          </div>
        </button>

        <button 
          className="home-button glossary"
          onClick={() => onNavigate('glossary')}
        >
          <div className="button-content">
            <h2>Glossary</h2>
            <p>Comprehensive guide to DBMS and genetics terms with examples and implementations</p>
          </div>
        </button>

        <button 
          className="home-button blog"
          onClick={() => onNavigate('blog')}
        >
          <div className="button-content">
            <h2>Blog</h2>
            <p>Articles and insights about genetic risk prediction and database systems</p>
          </div>
        </button>
      </div>
    </div>
  );
}

export default Home;

