import React, { useEffect, useState } from 'react';
import DNAHelix from './svg/DNAHelix';
import MolecularBackground from './svg/MolecularBackground';
import '../styles/Home.css';

const DISEASES = [
  {
    name: 'Type 2 Diabetes',
    desc: 'A metabolic disorder characterised by insulin resistance and elevated blood glucose from pancreatic beta-cell dysfunction.',
    snps: '4,280',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="6" stroke="var(--blue-ink)" strokeWidth="1.5" />
        <circle cx="16" cy="16" r="2" fill="var(--blue-ink)" />
        <path d="M16 4v6M16 22v6M4 16h6M22 16h6" stroke="var(--blue-ink)" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    name: 'Coronary Artery Disease',
    desc: 'Atherosclerotic plaque build-up in coronary arteries reducing myocardial blood flow and oxygen delivery.',
    snps: '1,724',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <path d="M16 28s-10-6.5-10-14c0-4 3-7 6.5-7 2 0 3.5 1.5 3.5 1.5S17.5 7 19.5 7c3.5 0 6.5 3 6.5 7 0 7.5-10 14-10 14z" stroke="var(--blue-ink)" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    name: 'Breast Cancer',
    desc: 'Malignant cell proliferation in breast tissue driven by somatic and heritable genetic mutations in tumour-suppressor pathways.',
    snps: '1,885',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <path d="M16 6c-3 0-5.5 2.5-5.5 5.5 0 4 5.5 9.5 5.5 9.5s5.5-5.5 5.5-9.5C21.5 8.5 19 6 16 6z" stroke="var(--blue-ink)" strokeWidth="1.5" />
        <line x1="16" y1="21" x2="16" y2="27" stroke="var(--blue-ink)" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="12" y1="24" x2="20" y2="24" stroke="var(--blue-ink)" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    name: 'Hypertension',
    desc: 'Chronically elevated arterial blood pressure increasing cardiovascular, renal, and cerebrovascular disease risk.',
    snps: '1,561',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <path d="M4 20 Q8 12, 12 20 Q16 28, 20 20 Q24 12, 28 20" stroke="var(--blue-ink)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <line x1="4" y1="20" x2="28" y2="20" stroke="var(--ink-faint)" strokeWidth="0.5" strokeDasharray="2 2" />
      </svg>
    ),
  },
];

export default function Home({ onNavigate }) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetch('http://localhost:8000/')
      .then(r => r.json())
      .then(d => setStats(d))
      .catch(() => {});
  }, []);

  return (
    <div className="home">
      {/* Hero */}
      <section className="hero">
        <MolecularBackground />
        <DNAHelix height={400} opacity={0.15} />

        <div className="hero-content">
          <div className="wordmark">
            <span className="wordmark-name">GeneRisk</span>
            <span className="wordmark-sep">|</span>
            <span className="wordmark-label">Intelligence Platform</span>
          </div>

          <h1 className="hero-title fade-in">
            Understand Your<br />Genetic Architecture
          </h1>

          <p className="hero-subtitle fade-in fade-in-delay-1">
            A clinical-grade polygenic risk assessment platform. Analyse genetic
            variants against 13,918 validated GWAS records using ensemble machine
            learning, SHAP explainability, and Reactome pathway enrichment.
          </p>

          <button
            className="btn-primary hero-cta fade-in fade-in-delay-2"
            onClick={() => onNavigate('input')}
          >
            Begin Analysis
          </button>

          <div className="hero-stats fade-in fade-in-delay-3">
            <span className="stat-item">13,918 SNP records</span>
            <span className="stat-sep">&middot;</span>
            <span className="stat-item">4 diseases</span>
            <span className="stat-sep">&middot;</span>
            <span className="stat-item">100% local</span>
            <span className="stat-sep">&middot;</span>
            <span className="stat-item">SHAP explained</span>
          </div>
        </div>
      </section>

      {/* Disease Cards */}
      <section className="disease-section">
        <div className="section-label">SUPPORTED DISEASES</div>
        <div className="disease-grid">
          {DISEASES.map((d, i) => (
            <div
              key={d.name}
              className={`disease-card card fade-in fade-in-delay-${i + 1}`}
              onClick={() => onNavigate('input', d.name)}
            >
              <div className="disease-card-icon">{d.icon}</div>
              <h3 className="disease-card-name">{d.name}</h3>
              <p className="disease-card-desc">{d.desc}</p>
              <div className="disease-card-pills">
                <span className="pill">{d.snps} SNPs</span>
                <span className="pill">ML model</span>
              </div>
              <span className="disease-card-link">
                Analyse <span>&rarr;</span>
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
