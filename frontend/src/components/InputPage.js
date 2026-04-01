import React, { useState, useMemo } from 'react';
import DNAHelix from './svg/DNAHelix';
import '../styles/InputPage.css';

const DISEASES = [
  'Type 2 Diabetes',
  'Coronary Artery Disease',
  'Breast Cancer',
  'Hypertension',
];

const PRESETS = {
  'Type 2 Diabetes': {
    high: 'rs7903146\nrs2237897\nrs10811661\nrs73121277\nrs76675804',
    low: 'rs35011184\nrs34872471',
    mixed: 'rs7903146\nrs35011184\nrs76675804',
  },
  'Coronary Artery Disease': {
    high: 'rs58231493\nrs7253874\nrs1042445\nrs11204085\nrs4403732',
    low: 'rs4774035\nrs11626972',
    mixed: 'rs58231493\nrs4774035\nrs75524776',
  },
  'Breast Cancer': {
    high: 'rs35054928\nrs2981578\nrs1219648\nrs76007978\nrs2617583',
    low: 'rs4784227\nrs2981579',
    mixed: 'rs35054928\nrs4784227\nrs76007978',
  },
  'Hypertension': {
    high: 'rs62294282\nrs11722185\nrs4637402\nrs324498\nrs10833346',
    low: 'rs78917351\nrs479499',
    mixed: 'rs62294282\nrs78917351\nrs1293331',
  },
};

export default function InputPage({ onNavigate, initialDisease }) {
  const [disease, setDisease] = useState(initialDisease || DISEASES[0]);
  const [snpText, setSnpText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const parsedSNPs = useMemo(() => {
    return snpText
      .split(/[\n,]+/)
      .map(s => s.trim().toLowerCase())
      .filter(s => s.startsWith('rs') && s.length > 2);
  }, [snpText]);

  const loadPreset = (type) => {
    const preset = PRESETS[disease]?.[type] || '';
    setSnpText(preset);
  };

  const handleSubmit = async () => {
    if (parsedSNPs.length === 0) return;
    setLoading(true);
    setError('');

    try {
      const snpPayload = parsedSNPs.map(rsid => ({ rsid, allele: 'T' }));
      const body = {
        patient_name: 'Patient',
        age: 40,
        gender: 'Unknown',
        disease_name: disease,
        snps: snpPayload,
      };

      const [predictRes, networkRes, vulnRes] = await Promise.all([
        fetch('http://localhost:8000/predict/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        }),
        fetch('http://localhost:8000/network/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ disease_name: disease, snps: snpPayload }),
        }),
        fetch('http://localhost:8000/vulnerability-profile/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ patient_name: 'Patient', snps: snpPayload }),
        }),
      ]);

      const prediction = await predictRes.json();
      const network = await networkRes.json();
      const vulnerability = await vulnRes.json();

      onNavigate('results', { prediction, network, vulnerability, disease });
    } catch (e) {
      setError('Failed to connect to the analysis server. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="input-page">
      <div className="input-page-inner">
        {/* Back */}
        <button className="back-link" onClick={() => onNavigate('home')}>
          &larr; Back to Home
        </button>

        <h1 className="input-title fade-in">Enter Genetic Variants</h1>
        <p className="input-subtitle fade-in fade-in-delay-1">
          Select a disease and provide your SNP identifiers to begin analysis.
        </p>

        {/* Disease Selector */}
        <div className="section-label">SELECT DISEASE</div>
        <div className="disease-pills fade-in fade-in-delay-2">
          {DISEASES.map(d => (
            <button
              key={d}
              className={`disease-pill ${disease === d ? 'active' : ''}`}
              onClick={() => setDisease(d)}
            >
              {d}
            </button>
          ))}
        </div>

        {/* SNP Textarea */}
        <div className="section-label" style={{ marginTop: 32 }}>SNP IDENTIFIERS</div>
        <textarea
          className="snp-textarea fade-in fade-in-delay-3"
          value={snpText}
          onChange={(e) => setSnpText(e.target.value)}
          placeholder={"rs7903146\nrs1801282\nrs429358\n..."}
          rows={8}
        />

        {/* Info card */}
        <div className="info-card" style={{ marginTop: 12 }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: 2 }}>
            <circle cx="8" cy="8" r="7" stroke="var(--blue-ink)" strokeWidth="1.2" />
            <text x="8" y="11.5" textAnchor="middle" fontSize="10" fontWeight="600" fill="var(--blue-ink)">i</text>
          </svg>
          <p>
            rsIDs are standardised identifiers for genetic variants (e.g.&nbsp;
            <span className="data-text">rs7903146</span>). Enter one per line or
            comma-separated. Only variants in the GWAS Catalog for the selected
            disease will be used in the ML analysis; others are noted but excluded.
          </p>
        </div>

        {/* Live counter */}
        <div className="snp-counter">
          <span className="counter-num">{parsedSNPs.length}</span> variants entered
        </div>

        {/* Presets */}
        <div className="presets">
          <button className="preset-btn" onClick={() => loadPreset('high')}>Load high-risk example</button>
          <span className="stat-sep">&middot;</span>
          <button className="preset-btn" onClick={() => loadPreset('low')}>Load low-risk example</button>
          <span className="stat-sep">&middot;</span>
          <button className="preset-btn" onClick={() => loadPreset('mixed')}>Load mixed example</button>
        </div>

        {/* Error */}
        {error && <div className="error-msg">{error}</div>}

        {/* Submit */}
        <button
          className="btn-primary submit-btn"
          onClick={handleSubmit}
          disabled={parsedSNPs.length === 0 || loading}
        >
          {loading ? (
            <>
              <span className="spinner" />
              Analysing {parsedSNPs.length} variants...
            </>
          ) : (
            `Analyse ${parsedSNPs.length} Variant${parsedSNPs.length !== 1 ? 's' : ''}`
          )}
        </button>
      </div>

      <DNAHelix height={500} opacity={0.1} />
    </div>
  );
}
