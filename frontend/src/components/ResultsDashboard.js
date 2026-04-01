import React, { useState, useRef, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ResponsiveContainer, ReferenceLine, RadarChart, PolarGrid, PolarAngleAxis, Radar } from 'recharts';
import ForceGraph2D from 'react-force-graph-2d';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import RiskArc from './svg/RiskArc';
import ChromosomeMap from './svg/ChromosomeMap';
import PathwayFlowSVG from './svg/PathwayFlowSVG';
import '../styles/ResultsDashboard.css';

const SECTIONS = [
  { id: 'overview', label: 'Overview' },
  { id: 'shap', label: 'SHAP Analysis' },
  { id: 'snp-rankings', label: 'SNP Rankings' },
  { id: 'pathways', label: 'Pathway Analysis' },
  { id: 'kinetics', label: 'Enzyme Kinetics' },
  { id: 'network', label: 'Network Graph' },
  { id: 'cross-disease', label: 'Cross-Disease' },
];

const PATHWAY_DESCRIPTIONS = {
  'Signal Transduction': 'Cellular communication pathways that convert extracellular signals into intracellular responses, regulating gene expression, metabolism, and cell behaviour.',
  'Metabolism': 'Core biochemical reactions that produce energy (catabolism) and build cellular components (anabolism), essential for all cellular functions.',
  'Gene expression (Transcription)': 'The process of copying DNA into mRNA, controlled by transcription factors and regulatory elements that determine which genes are active.',
  'Immune System': 'Complex network of cells, proteins, and signalling molecules that detect and eliminate pathogens and abnormal cells.',
  'Developmental Biology': 'Molecular pathways governing cell differentiation, tissue formation, and organ development from embryonic stages.',
  'Neuronal System': 'Signalling pathways in neurons including synaptic transmission, receptor activation, and neurotransmitter metabolism.',
  'Cell Cycle': 'Molecular checkpoints and regulatory mechanisms ensuring proper DNA replication and cell division.',
  'Disease': 'Pathways directly implicated in disease mechanisms, including oncogenic signalling, metabolic disorders, and inflammatory cascades.',
  'Hemostasis': 'Blood clotting cascade involving platelet activation, coagulation factors, and fibrin formation for wound healing.',
  'Generic Transcription Pathway': 'Basal transcription machinery including RNA polymerase II assembly and promoter recognition complexes.',
};

export default function ResultsDashboard({ data, onNavigate }) {
  const [activeSection, setActiveSection] = useState('overview');
  const [networkDetailOpen, setNetworkDetailOpen] = useState(false);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const contentRef = useRef(null);
  const graphRef = useRef(null);
  const { prediction, network, vulnerability, disease } = data;

  const p = prediction;
  const risk = p.ml_prediction?.risk_probability || 0;
  const riskPct = (risk * 100).toFixed(1);
  const riskLevel = p.ml_prediction?.risk_level || 'Unknown';
  const shap = p.shap_explanation || {};
  const prs = p.prs || {};
  const snpRankings = p.snp_rankings || [];
  const pathwayData = p.pathway_enrichment || {};
  const kinetics = p.kinetics_interpretation || [];
  const narrative = p.clinical_narrative || '';
  const snpDetails = p.snp_details || {};
  const vulnProfile = vulnerability?.vulnerability_profile || [];

  // SHAP chart data
  const shapData = shap.feature_importance
    ? Object.entries(shap.feature_importance).map(([key, val]) => ({
        feature: key.replace(/_/g, ' '),
        value: parseFloat(val),
      })).sort((a, b) => Math.abs(b.value) - Math.abs(a.value))
    : [];

  // Radar chart data
  const radarData = vulnProfile.map(v => ({
    disease: v.disease.replace('Coronary Artery Disease', 'CAD'),
    risk: Math.round(v.risk_probability * 100),
    fullName: v.disease,
  }));

  const scrollTo = (id) => {
    setActiveSection(id);
    document.getElementById(`section-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const getRiskColor = (v) => {
    if (v > 70) return 'var(--copper)';
    if (v > 30) return 'var(--amber)';
    return 'var(--moss)';
  };

  const getBadgeClass = (level) => {
    const l = (level || '').toLowerCase();
    if (l === 'high' || l === 'critical') return 'badge-high';
    if (l === 'moderate' || l === 'elevated') return 'badge-moderate';
    return 'badge-low';
  };

  // ── Download network graph as PNG ──
  const downloadGraph = useCallback(() => {
    const canvas = document.querySelector('.network-card canvas');
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `GeneRisk_Network_${disease.replace(/\s+/g, '_')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }, [disease]);

  // ── Generate PDF Report ──
  const generateReport = async () => {
    setGeneratingPDF(true);
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageW = 210;
      const pageH = 297;
      const margin = 16;
      const contentW = pageW - margin * 2;

      const addHeader = () => {
        pdf.setFillColor(26, 58, 92);
        pdf.rect(0, 0, pageW, 28, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(20);
        pdf.setFont('helvetica', 'normal');
        pdf.text('GeneRisk Intelligence', margin, 14);
        pdf.setFontSize(10);
        pdf.text('Polygenic Risk Assessment Report', margin, 22);
        pdf.text(new Date().toLocaleDateString(), pageW - margin, 14, { align: 'right' });
        pdf.setTextColor(28, 25, 23);
        return 36;
      };

      const addFooter = (pageNum) => {
        pdf.setFontSize(8);
        pdf.setTextColor(107, 101, 96);
        pdf.text(`Page ${pageNum}`, pageW - margin, pageH - 8, { align: 'right' });
        pdf.text('Generated by GeneRisk Intelligence', margin, pageH - 8);
        pdf.setTextColor(28, 25, 23);
      };

      const addSection = (title, y) => {
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text(title, margin, y);
        pdf.setDrawColor(181, 84, 26);
        pdf.setLineWidth(0.5);
        pdf.line(margin, y + 2, margin + pdf.getTextWidth(title), y + 2);
        pdf.setDrawColor(196, 190, 184);
        pdf.setFont('helvetica', 'normal');
        return y + 10;
      };

      // Capture a DOM section as image and add to PDF
      const captureSection = async (sectionId) => {
        const el = document.getElementById(sectionId);
        if (!el) return null;
        const canvas = await html2canvas(el, {
          scale: 2,
          backgroundColor: '#F7F4EF',
          useCORS: true,
          logging: false,
        });
        return canvas.toDataURL('image/png');
      };

      // ════ PAGE 1: COVER + OVERVIEW ════
      let y = addHeader();
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.text('ANALYSIS SUMMARY', margin, y);
      pdf.setFont('helvetica', 'normal');
      y += 8;
      pdf.setFontSize(10);
      pdf.text(`Disease Analysed:`, margin, y);
      pdf.text(disease, margin + 45, y);
      y += 6;
      pdf.text(`Variants Submitted:`, margin, y);
      pdf.text(`${p.total_snps_submitted}`, margin + 45, y);
      y += 6;
      pdf.text(`Variants Matched:`, margin, y);
      pdf.text(`${p.matched_snps} disease-specific, ${p.cross_disease_snps || 0} cross-disease`, margin + 45, y);
      y += 6;
      pdf.text(`Analysis Date:`, margin, y);
      pdf.text(new Date().toLocaleString(), margin + 45, y);
      y += 14;

      // Risk display
      pdf.setFillColor(...(risk > 0.7 ? [253,240,232] : risk > 0.3 ? [253,246,227] : [234,244,238]));
      pdf.roundedRect(margin, y, contentW, 50, 4, 4, 'F');
      pdf.setFontSize(48);
      pdf.setFont('helvetica', 'bold');
      const riskColor = risk > 0.7 ? [181,84,26] : risk > 0.3 ? [146,98,26] : [45,106,79];
      pdf.setTextColor(...riskColor);
      pdf.text(`${riskPct}%`, pageW / 2, y + 28, { align: 'center' });
      pdf.setFontSize(14);
      pdf.text(riskLevel.toUpperCase() + ' RISK', pageW / 2, y + 42, { align: 'center' });
      pdf.setTextColor(28, 25, 23);
      y += 58;

      pdf.setFontSize(9);
      pdf.text(`PRS Score: ${(prs.raw_score || 0).toFixed(4)}  |  Classification: ${prs.clinical_classification || 'N/A'}`, pageW / 2, y, { align: 'center' });
      y += 12;

      // SNP Rankings table
      y = addSection('Variant Risk Rankings', y);
      pdf.setFontSize(7.5);
      pdf.setFont('helvetica', 'bold');
      const cols = [margin, margin+12, margin+42, margin+90, margin+108, margin+142];
      ['Rank','rsID','Gene','Chr','Risk %','Odds Ratio'].forEach((h, i) => pdf.text(h, cols[i], y));
      pdf.setFont('helvetica', 'normal');
      y += 1;
      pdf.setDrawColor(196, 190, 184);
      pdf.line(margin, y, pageW - margin, y);
      y += 4;
      snpRankings.forEach((snp) => {
        // Draw risk bar
        const barW = 28;
        const riskVal = snp.individual_risk * 100;
        pdf.setFillColor(240, 237, 232);
        pdf.rect(cols[4], y - 3, barW, 3.5, 'F');
        pdf.setFillColor(...(riskVal > 70 ? [181,84,26] : riskVal > 30 ? [146,98,26] : [45,106,79]));
        pdf.rect(cols[4], y - 3, barW * (riskVal / 100), 3.5, 'F');
        pdf.text(`#${snp.risk_rank}`, cols[0], y);
        pdf.text(snp.rsid, cols[1], y);
        pdf.text((snp.gene || '').substring(0, 22), cols[2], y);
        pdf.text(String(snp.chromosome || ''), cols[3], y);
        pdf.text(`${riskVal.toFixed(1)}%`, cols[4] + barW + 2, y);
        pdf.text(String(snp.odds_ratio), cols[5], y);
        y += 5;
      });

      addFooter(1);

      // ════ PAGE 2: NARRATIVE + SHAP CHART ════
      pdf.addPage();
      y = addHeader();
      y = addSection('Clinical Interpretation (AI-Generated)', y);
      pdf.setFontSize(10);
      const splitNarr = pdf.splitTextToSize(narrative, contentW);
      pdf.text(splitNarr, margin, y);
      y += splitNarr.length * 4.5 + 8;

      // Capture SHAP chart image
      const shapImg = await captureSection('section-shap');
      if (shapImg && y < pageH - 90) {
        pdf.addImage(shapImg, 'PNG', margin, y, contentW, 70);
        y += 74;
      }

      y = addSection('SHAP Values Table', y);
      pdf.setFontSize(7.5);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Feature', margin, y);
      pdf.text('SHAP Value', margin + 70, y);
      pdf.text('Direction', margin + 100, y);
      pdf.text('Impact', margin + 135, y);
      pdf.setFont('helvetica', 'normal');
      y += 5;
      shapData.forEach(d => {
        pdf.text(d.feature, margin, y);
        pdf.text(d.value.toFixed(6), margin + 70, y);
        pdf.text(d.value >= 0 ? 'Risk Increasing' : 'Risk Decreasing', margin + 100, y);
        // Draw mini bar
        const absVal = Math.min(Math.abs(d.value) * 200, 30);
        pdf.setFillColor(...(d.value >= 0 ? [181,84,26] : [45,106,79]));
        pdf.rect(margin + 135, y - 2.5, absVal, 3, 'F');
        y += 5;
      });

      addFooter(2);

      // ════ PAGE 3: PATHWAY ENRICHMENT ════
      pdf.addPage();
      y = addHeader();
      y = addSection('Reactome Pathway Enrichment', y);
      pdf.setFontSize(9);
      const pathways = pathwayData.enriched_pathways || [];
      pdf.text(`${pathwayData.total_pathways_hit || 0} pathways affected. Most disrupted: ${pathwayData.most_disrupted || 'N/A'}`, margin, y);
      y += 8;

      pathways.slice(0, 10).forEach((pw) => {
        if (y > pageH - 30) { addFooter(3); pdf.addPage(); y = addHeader(); }
        // Status badge
        if (pw.disruption_level === 'Critical') {
          pdf.setFillColor(253, 240, 232);
          pdf.setTextColor(181, 84, 26);
        } else {
          pdf.setFillColor(253, 246, 227);
          pdf.setTextColor(146, 98, 26);
        }
        pdf.roundedRect(margin, y - 3, contentW, 12, 2, 2, 'F');
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`[${pw.disruption_level.toUpperCase()}]`, margin + 2, y + 2);
        pdf.setTextColor(28, 25, 23);
        pdf.text(pw.pathway, margin + 26, y + 2);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(7);
        pdf.text(`${pw.hit_count} gene(s): ${pw.genes_affected.join(', ')}`, margin + 2, y + 8);
        y += 16;
      });

      // Kinetics
      y += 4;
      y = addSection('Enzyme Kinetics (BRENDA)', y);
      if (kinetics.length > 0) {
        kinetics.forEach(k => {
          if (y > pageH - 35) { addFooter(3); pdf.addPage(); y = addHeader(); }
          pdf.setFontSize(9);
          pdf.setFont('helvetica', 'bold');
          pdf.text(`${k.gene}`, margin, y);
          pdf.setFont('helvetica', 'normal');
          // Relevance badge
          const bx = margin + pdf.getTextWidth(k.gene) + 4;
          const badgeColor = k.clinical_relevance === 'Critical' ? [181,84,26] : k.clinical_relevance === 'High' ? [146,98,26] : [107,101,96];
          pdf.setTextColor(...badgeColor);
          pdf.text(`[${k.clinical_relevance}]`, bx, y);
          pdf.setTextColor(28, 25, 23);
          y += 5;
          pdf.setFontSize(8);
          const splitK = pdf.splitTextToSize(k.interpretation, contentW - 4);
          pdf.text(splitK, margin + 4, y);
          y += splitK.length * 3.5 + 4;
        });
      } else {
        pdf.setFontSize(9);
        pdf.text('No enzyme-encoding genes found among submitted variants.', margin, y);
        y += 6;
      }

      addFooter(3);

      // ════ PAGE 4: NETWORK GRAPH ════
      pdf.addPage();
      y = addHeader();
      y = addSection('Genomic Vulnerability Network', y);
      pdf.setFontSize(9);
      pdf.text('Force-directed graph showing: SNP (blue) -> Gene (green) -> Pathway (amber) -> Disease (red)', margin, y);
      y += 6;

      // Capture network canvas
      const networkCanvas = document.querySelector('.network-card canvas');
      if (networkCanvas) {
        const netImg = networkCanvas.toDataURL('image/png');
        const imgW = contentW;
        const imgH = imgW * 0.6;
        pdf.addImage(netImg, 'PNG', margin, y, imgW, imgH);
        y += imgH + 6;
      }

      pdf.setFontSize(8);
      pdf.text(`Network Statistics: ${network?.nodes?.length || 0} nodes, ${network?.links?.length || 0} edges`, margin, y);
      y += 4;
      pdf.text(`SNPs: ${network?.nodes?.filter(n => n.type === 'snp').length || 0} | Genes: ${network?.nodes?.filter(n => n.type === 'gene').length || 0} | Pathways: ${network?.nodes?.filter(n => n.type === 'pathway').length || 0}`, margin, y);

      addFooter(4);

      // ════ PAGE 5: CROSS-DISEASE ════
      pdf.addPage();
      y = addHeader();
      y = addSection('Cross-Disease Vulnerability Profile', y);
      pdf.setFontSize(9);
      pdf.text('Your variants were tested against all 4 disease models simultaneously:', margin, y);
      y += 8;

      // Visual risk bars for each disease
      vulnProfile.forEach(v => {
        const rp = v.risk_probability * 100;
        const barWidth = contentW - 50;
        // Label
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'bold');
        pdf.text(v.disease, margin, y + 3);
        pdf.setFont('helvetica', 'normal');
        y += 7;
        // Track
        pdf.setFillColor(240, 237, 232);
        pdf.roundedRect(margin, y, barWidth, 6, 2, 2, 'F');
        // Fill
        const fillColor = rp > 70 ? [181,84,26] : rp > 30 ? [146,98,26] : [45,106,79];
        pdf.setFillColor(...fillColor);
        pdf.roundedRect(margin, y, barWidth * (rp / 100), 6, 2, 2, 'F');
        // Percentage
        pdf.setFontSize(9);
        pdf.setTextColor(...fillColor);
        pdf.text(`${rp.toFixed(1)}% [${v.risk_level}]`, margin + barWidth + 3, y + 5);
        pdf.setTextColor(28, 25, 23);
        y += 14;
      });

      // Capture radar chart
      const radarImg = await captureSection('section-cross-disease');
      if (radarImg && y < pageH - 80) {
        pdf.addImage(radarImg, 'PNG', margin, y, contentW, 65);
        y += 68;
      }

      // Disclaimer
      y = Math.max(y, pageH - 40);
      pdf.setDrawColor(196, 190, 184);
      pdf.line(margin, y, pageW - margin, y);
      y += 6;
      pdf.setFontSize(7);
      pdf.setTextColor(107, 101, 96);
      const disc = 'DISCLAIMER: This report is generated by an AI-assisted analysis system for research and educational purposes only. It does not constitute a clinical diagnosis or medical advice. Genetic risk scores reflect statistical associations and do not predict disease outcomes with certainty. Always consult a qualified healthcare professional for medical decisions.';
      pdf.text(pdf.splitTextToSize(disc, contentW), margin, y);

      addFooter(5);

      // Save
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      pdf.save(`GeneRisk_${disease.replace(/\s+/g, '_')}_Report_${dateStr}.pdf`);
    } catch (err) {
      console.error('PDF generation failed:', err);
      alert('Report generation failed. Check console for details.');
    } finally {
      setGeneratingPDF(false);
    }
  };

  return (
    <div className="dashboard">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <button className="back-link" onClick={() => onNavigate('home')}>&larr; Home</button>
          <div className="sidebar-report-card card" style={{ padding: 16, marginTop: 12 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, marginBottom: 4 }}>Analysis Report</div>
            <div style={{ fontSize: 13, color: 'var(--ink-muted)' }}>{disease}</div>
            <div style={{ fontSize: 11, color: 'var(--ink-muted)', marginTop: 4 }}>{new Date().toLocaleDateString()}</div>
            <div style={{ fontFamily: 'var(--font-data)', fontSize: 11, color: 'var(--ink-muted)', marginTop: 4 }}>
              {p.total_snps_submitted} variants submitted
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {SECTIONS.map(s => (
            <button
              key={s.id}
              className={`sidebar-nav-item ${activeSection === s.id ? 'active' : ''}`}
              onClick={() => scrollTo(s.id)}
            >
              {s.label}
            </button>
          ))}
        </nav>

        <button
          className="btn-outlined"
          style={{ width: '100%', marginTop: 'auto' }}
          onClick={generateReport}
          disabled={generatingPDF}
        >
          {generatingPDF ? 'Generating...' : 'Download PDF Report'}
        </button>
      </aside>

      {/* Content */}
      <main className="dashboard-content" ref={contentRef}>

        {/* ═══ SECTION 1: OVERVIEW ═══ */}
        <section id="section-overview" className="dash-section fade-in">
          <div className="section-label">GENOMIC OVERVIEW</div>

          {/* Chromosome Map */}
          <div className="card" style={{ padding: '16px 24px', marginBottom: 24 }}>
            <ChromosomeMap snpData={snpRankings} />
          </div>

          {/* 3-column layout */}
          <div className="overview-grid">
            {/* Risk Arc */}
            <div className="card overview-arc-card">
              <RiskArc risk={risk} size={220} />
              <div className="arc-pills">
                <span className="pill">PRS: {(prs.raw_score || 0).toFixed(3)}</span>
                <span className="pill">{p.matched_snps || 0} matched</span>
              </div>
            </div>

            {/* Stats */}
            <div className="overview-stats">
              <div className="card stat-card">
                <div className="section-label">ML CONFIDENCE</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 28 }}>{riskPct}%</div>
                <div style={{ fontSize: 12, color: 'var(--ink-muted)', marginTop: 4 }}>
                  Ensemble model &middot; 5-fold CV
                </div>
              </div>
              <div className="card stat-card">
                <div className="section-label">POLYGENIC RISK SCORE</div>
                <div style={{ fontFamily: 'var(--font-data)', fontSize: 20 }}>{(prs.raw_score || 0).toFixed(4)}</div>
                <span className={`badge ${getBadgeClass(prs.clinical_classification?.split(' ')[0])}`}>
                  {prs.clinical_classification || 'N/A'}
                </span>
              </div>
              <div className="card stat-card">
                <div className="section-label">VARIANTS</div>
                <div style={{ fontFamily: 'var(--font-data)', fontSize: 14 }}>
                  {p.matched_snps}/{p.total_snps_submitted} matched &middot; {p.cross_disease_snps || 0} cross-disease
                </div>
              </div>
            </div>

            {/* Risk Tier */}
            <div className={`card overview-tier-card ${riskLevel.toLowerCase()}-bg`}>
              <div className="section-label">RISK CLASSIFICATION</div>
              <div className="tier-label" style={{ color: getRiskColor(riskPct) }}>
                {riskLevel.toUpperCase()}
              </div>
            </div>
          </div>

          {/* Clinical Narrative */}
          {narrative && (
            <div className="narrative-card">
              <div className="narrative-header">
                <span>Clinical Interpretation</span>
                <span className="narrative-badge">(AI-generated)</span>
              </div>
              <div className="narrative-body">{narrative}</div>
              <div className="narrative-footer">
                This interpretation is generated by an AI model and is for research purposes only. It does not constitute clinical medical advice.
              </div>
            </div>
          )}
        </section>

        {/* ═══ SECTION 2: SHAP ═══ */}
        <section id="section-shap" className="dash-section">
          <div className="section-label">SHAP ANALYSIS</div>
          <h2>Feature Importance</h2>

          <div className="card explainer-card" style={{ marginBottom: 24 }}>
            <h3>How SHAP Values Work</h3>
            <p>
              SHAP (SHapley Additive exPlanations) values measure each genetic feature's
              contribution to your individual risk prediction. A positive value pushed the
              prediction higher than average; a negative value pushed it lower. The baseline
              (zero) represents the model's average prediction across all patients in the
              training population.
            </p>
          </div>

          {shapData.length > 0 && (
            <div className="card" style={{ padding: '24px 16px' }}>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={shapData} layout="vertical" margin={{ left: 100, right: 30 }}>
                  <XAxis type="number" tick={{ fontSize: 11, fontFamily: 'var(--font-data)' }} />
                  <YAxis dataKey="feature" type="category" tick={{ fontSize: 13, fontFamily: 'var(--font-body)' }} width={100} />
                  <ReferenceLine x={0} stroke="var(--ink)" strokeWidth={1} />
                  <Tooltip
                    contentStyle={{ background: 'var(--paper)', border: '1px solid var(--ink-faint)', borderRadius: 8, fontSize: 12 }}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {shapData.map((d, i) => (
                      <Cell key={i} fill={d.value >= 0 ? 'var(--copper)' : 'var(--moss)'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* SHAP Table */}
          {shapData.length > 0 && (
            <div className="card" style={{ marginTop: 16, padding: 0, overflow: 'hidden' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Feature</th>
                    <th>SHAP Impact</th>
                    <th>Direction</th>
                  </tr>
                </thead>
                <tbody>
                  {shapData.map((d, i) => (
                    <tr key={i}>
                      <td>{d.feature}</td>
                      <td className="data-text">{d.value.toFixed(4)}</td>
                      <td>
                        <span className={`badge ${d.value >= 0 ? 'badge-high' : 'badge-low'}`}>
                          {d.value >= 0 ? 'Risk ↑' : 'Risk ↓'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* ═══ SECTION 3: SNP RANKINGS ═══ */}
        <section id="section-snp-rankings" className="dash-section">
          <div className="section-label">SNP RISK RANKINGS</div>
          <h2>Individual Variant Risk Scores</h2>

          <div className="card explainer-card" style={{ marginBottom: 24 }}>
            <p>
              Each submitted variant is evaluated independently through the ML model.
              This reveals which specific rsIDs are driving your overall risk score.
              Individual variant scores are not additive — the combined ML prediction accounts
              for feature interactions.
            </p>
          </div>

          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>rsID</th>
                  <th>Gene</th>
                  <th>Chr</th>
                  <th>Individual Risk</th>
                  <th style={{ textAlign: 'right' }}>Odds Ratio</th>
                </tr>
              </thead>
              <tbody>
                {snpRankings.map((snp, i) => {
                  const riskVal = (snp.individual_risk * 100);
                  const barColor = riskVal > 70 ? 'var(--copper)' : riskVal > 30 ? 'var(--amber)' : 'var(--moss)';
                  return (
                    <tr key={i} className={i < 3 ? 'top-rank' : ''}>
                      <td className="data-text" style={{ color: 'var(--ink-muted)' }}>#{snp.risk_rank}</td>
                      <td className="data-text" style={{ color: 'var(--blue-ink)' }}>{snp.rsid}</td>
                      <td style={{ fontWeight: 500 }}>{snp.gene}</td>
                      <td><span className="chr-badge">{snp.chromosome}</span></td>
                      <td>
                        <div className="risk-bar-cell">
                          <div className="risk-bar-track">
                            <div className="risk-bar-fill" style={{ width: `${riskVal}%`, background: barColor }} />
                          </div>
                          <span className="data-text">{riskVal.toFixed(1)}%</span>
                        </div>
                      </td>
                      <td className="data-text" style={{ textAlign: 'right' }}>{snp.odds_ratio}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* ═══ SECTION 4: PATHWAY ANALYSIS ═══ */}
        <section id="section-pathways" className="dash-section">
          <div className="section-label">PATHWAY ANALYSIS</div>
          <h2>Reactome Pathway Enrichment</h2>

          <div style={{ margin: '16px 0 24px' }}>
            <PathwayFlowSVG />
          </div>

          <div className="card explainer-card" style={{ marginBottom: 24 }}>
            <p>
              Reactome pathway enrichment reveals which biological processes are affected
              by your genetic variants. When multiple variants converge on the same pathway
              (flagged CRITICAL), this suggests the pathway is under sustained genetic
              pressure — a stronger signal than isolated single-gene effects.
            </p>
          </div>

          {(pathwayData.enriched_pathways || []).map((pw, i) => {
            const borderColor = pw.disruption_level === 'Critical' ? 'var(--copper)' : pw.disruption_level === 'Moderate' ? 'var(--amber)' : 'var(--ink-faint)';
            return (
              <div key={i} className="card pathway-card" style={{ borderLeft: `4px solid ${borderColor}` }}>
                <div className="pathway-card-header">
                  <div>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18 }}>{pw.pathway}</h3>
                    <span className="data-text" style={{ fontSize: 12, color: 'var(--ink-muted)' }}>
                      {pw.hit_count} gene{pw.hit_count !== 1 ? 's' : ''} affected
                    </span>
                  </div>
                  <span className={`badge ${getBadgeClass(pw.disruption_level)}`}>
                    {pw.disruption_level}
                  </span>
                </div>
                <div className="pathway-genes">
                  {pw.genes_affected.map(g => (
                    <span key={g} className="pill" style={{ fontSize: 11 }}>{g}</span>
                  ))}
                </div>
                {PATHWAY_DESCRIPTIONS[pw.pathway] && (
                  <p style={{ fontSize: 12, color: 'var(--ink-muted)', marginTop: 8, lineHeight: 1.6 }}>
                    {PATHWAY_DESCRIPTIONS[pw.pathway]}
                  </p>
                )}
              </div>
            );
          })}
        </section>

        {/* ═══ SECTION 5: ENZYME KINETICS ═══ */}
        <section id="section-kinetics" className="dash-section">
          <div className="section-label">ENZYME KINETICS</div>
          <h2>BRENDA Kinetic Analysis</h2>

          <div className="card explainer-card" style={{ marginBottom: 24 }}>
            <p>
              For variants in enzyme-encoding genes, we retrieve Km (Michaelis constant)
              values from the BRENDA enzyme database. Km measures how much substrate is
              needed for half-maximal enzyme activity. Genetic variants in low-Km enzymes
              are clinically significant: these enzymes operate efficiently at low substrate
              concentrations, meaning even minor disruptions can cascade into metabolic dysfunction.
            </p>
          </div>

          {/* Km scale */}
          <div className="card km-scale-card">
            <div className="km-scale">
              <div className="km-band km-critical">0–0.1 mM<br /><small>Very high affinity</small></div>
              <div className="km-band km-elevated">0.1–1.0 mM<br /><small>Moderate affinity</small></div>
              <div className="km-band km-nominal">1.0+ mM<br /><small>Low affinity</small></div>
            </div>
          </div>

          {kinetics.length > 0 ? (
            <div className="card" style={{ padding: 0, overflow: 'hidden', marginTop: 16 }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Gene</th>
                    <th>Km Records</th>
                    <th>Relevance</th>
                    <th>Interpretation</th>
                  </tr>
                </thead>
                <tbody>
                  {kinetics.map((k, i) => (
                    <tr key={i}>
                      <td className="data-text" style={{ fontWeight: 500 }}>{k.gene}</td>
                      <td className="data-text">{k.km_entries}</td>
                      <td><span className={`badge ${getBadgeClass(k.clinical_relevance)}`}>{k.clinical_relevance}</span></td>
                      <td style={{ fontSize: 12, maxWidth: 400 }}>{k.interpretation}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: 32, color: 'var(--ink-muted)', fontSize: 14 }}>
              No enzyme-encoding genes found among the submitted variants. Kinetics analysis applies only to genes that encode functional enzymes with characterised Km values.
            </div>
          )}
        </section>

        {/* ═══ SECTION 6: NETWORK GRAPH ═══ */}
        <section id="section-network" className="dash-section">
          <div className="section-label">NETWORK GRAPH</div>
          <h2>Genomic Vulnerability Network</h2>

          <div className="card explainer-card" style={{ marginBottom: 24 }}>
            <p>
              This force-directed graph maps the complete biological relationship chain
              from your genetic variants to the target disease. Densely connected nodes
              (hubs) represent critical biological chokepoints.
            </p>
          </div>

          <div className="card network-card">
            {network && network.nodes && network.nodes.length > 0 && (
              <ForceGraph2D
                ref={graphRef}
                graphData={network}
                width={750}
                height={500}
                backgroundColor="#FDFBF8"
                nodeRelSize={5}
                d3AlphaDecay={0.02}
                d3VelocityDecay={0.3}
                d3AlphaMin={0.001}
                warmupTicks={80}
                cooldownTicks={200}
                nodeColor={node => {
                  switch (node.type) {
                    case 'snp': return '#90CDF4';
                    case 'gene': return '#9AE6B4';
                    case 'pathway': return '#FBD38D';
                    case 'disease': return '#FCA5A5';
                    default: return '#C4BEB8';
                  }
                }}
                nodeLabel={node => `${(node.type || '').toUpperCase()}: ${node.label || node.id}`}
                linkColor={() => '#D4CFC9'}
                linkWidth={0.8}
                linkDirectionalParticles={1}
                linkDirectionalParticleWidth={2}
                linkDirectionalParticleColor={() => '#C4BEB8'}
                onEngineStop={() => {
                  // Zoom to fit after layout stabilises
                  if (graphRef.current) {
                    graphRef.current.zoomToFit(400, 40);
                  }
                }}
                nodeCanvasObject={(node, ctx, globalScale) => {
                  const sizes = { disease: 14, pathway: 10, gene: 8, snp: 5 };
                  const colors = { snp: '#90CDF4', gene: '#9AE6B4', pathway: '#FBD38D', disease: '#FCA5A5' };
                  const r = sizes[node.type] || 5;

                  // Node
                  ctx.beginPath();
                  ctx.arc(node.x, node.y, r, 0, 2 * Math.PI);
                  ctx.fillStyle = colors[node.type] || '#C4BEB8';
                  ctx.fill();
                  ctx.strokeStyle = 'rgba(28,25,23,0.15)';
                  ctx.lineWidth = 0.5;
                  ctx.stroke();

                  // Always show label
                  const label = node.label || node.id || '';
                  const fontSize = node.type === 'disease' ? 11 : node.type === 'pathway' ? 9 : 8;
                  ctx.font = `${fontSize / Math.max(globalScale, 0.8)}px Outfit, sans-serif`;
                  ctx.textAlign = 'center';
                  ctx.textBaseline = 'top';

                  // White background behind text for readability
                  const textWidth = ctx.measureText(label).width;
                  const textY = node.y + r + 2;
                  ctx.fillStyle = 'rgba(253,251,248,0.85)';
                  ctx.fillRect(node.x - textWidth / 2 - 2, textY - 1, textWidth + 4, fontSize / Math.max(globalScale, 0.8) + 2);

                  ctx.fillStyle = '#1C1917';
                  ctx.fillText(label, node.x, textY);
                }}
              />
            )}
            <div className="network-actions">
              <div className="network-legend">
                <span><span className="legend-dot" style={{ background: '#90CDF4' }} />SNP</span>
                <span><span className="legend-dot" style={{ background: '#9AE6B4' }} />Gene</span>
                <span><span className="legend-dot" style={{ background: '#FBD38D' }} />Pathway</span>
                <span><span className="legend-dot" style={{ background: '#FCA5A5' }} />Disease</span>
              </div>
              <button className="btn-outlined" style={{ height: 32, fontSize: 12 }} onClick={downloadGraph}>
                Download Graph PNG
              </button>
            </div>
          </div>

          {/* Collapsible detailed explanation */}
          <div className="card network-detail-card" style={{ marginTop: 16 }}>
            <button
              className="network-detail-toggle"
              onClick={() => setNetworkDetailOpen(!networkDetailOpen)}
            >
              <span>Understanding This Network</span>
              <span className={`toggle-arrow ${networkDetailOpen ? 'open' : ''}`}>&#9662;</span>
            </button>

            {networkDetailOpen && (
              <div className="network-detail-body">
                <div className="detail-section">
                  <h4>What the graph shows</h4>
                  <p>
                    This is a <strong>force-directed network graph</strong> that visualises the complete biological relationship
                    chain from your submitted genetic variants to the target disease. Each node is a biological entity,
                    and edges (lines) represent experimentally validated associations.
                  </p>
                </div>

                <div className="detail-section">
                  <h4>Node types explained</h4>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span className="legend-dot" style={{ background: '#90CDF4' }} />
                      <div>
                        <strong>SNP Nodes</strong> (smallest, blue) — Your submitted genetic variants.
                        Each rsID is a specific point mutation in the genome.
                      </div>
                    </div>
                    <div className="detail-item">
                      <span className="legend-dot" style={{ background: '#9AE6B4' }} />
                      <div>
                        <strong>Gene Nodes</strong> (medium, green) — Genes where your variants are located.
                        A gene encodes a protein that performs a biological function.
                      </div>
                    </div>
                    <div className="detail-item">
                      <span className="legend-dot" style={{ background: '#FBD38D' }} />
                      <div>
                        <strong>Pathway Nodes</strong> (large, amber) — Reactome biological pathways that
                        the affected genes participate in. Multiple genes converging on one pathway
                        indicates systemic risk.
                      </div>
                    </div>
                    <div className="detail-item">
                      <span className="legend-dot" style={{ background: '#FCA5A5' }} />
                      <div>
                        <strong>Disease Node</strong> (largest, red) — The central target disease.
                        All pathways ultimately connect to the disease through established GWAS associations.
                      </div>
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>How to interpret the layout</h4>
                  <ul>
                    <li><strong>Clusters</strong> — SNPs that share the same gene will cluster together. This shows co-located risk.</li>
                    <li><strong>Hub nodes</strong> — Genes or pathways with many connections are critical biological chokepoints. Disruption here has amplified effects.</li>
                    <li><strong>Isolated nodes</strong> — Variants with few connections may have independent, isolated risk contributions.</li>
                    <li><strong>Path length</strong> — Shorter paths from SNP to Disease indicate more direct biological impact.</li>
                  </ul>
                </div>

                <div className="detail-section">
                  <h4>Network statistics</h4>
                  <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                    <span className="pill">Nodes: {network?.nodes?.length || 0}</span>
                    <span className="pill">Edges: {network?.links?.length || 0}</span>
                    <span className="pill">SNPs: {network?.nodes?.filter(n => n.type === 'snp').length || 0}</span>
                    <span className="pill">Genes: {network?.nodes?.filter(n => n.type === 'gene').length || 0}</span>
                    <span className="pill">Pathways: {network?.nodes?.filter(n => n.type === 'pathway').length || 0}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ═══ SECTION 7: CROSS-DISEASE ═══ */}
        <section id="section-cross-disease" className="dash-section">
          <div className="section-label">CROSS-DISEASE PROFILE</div>
          <h2>Multi-Disease Vulnerability Assessment</h2>

          <div className="card explainer-card" style={{ marginBottom: 24 }}>
            <p>
              Many genetic variants affect multiple diseases simultaneously because they
              alter foundational biological pathways shared across conditions. This cross-disease
              profile runs your submitted variants through all four disease models and presents
              a comparative vulnerability assessment.
            </p>
          </div>

          {/* Radar + Cards */}
          <div className="cross-disease-layout">
            <div className="card radar-card">
              <ResponsiveContainer width="100%" height={340}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="var(--ink-faint)" />
                  <PolarAngleAxis dataKey="disease" tick={{ fontSize: 12, fontFamily: 'var(--font-body)' }} />
                  <Radar dataKey="risk" stroke="var(--blue-ink)" fill="var(--blue-ink)" fillOpacity={0.2} strokeWidth={1.5} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div className="cross-cards-grid">
              {vulnProfile.map((v, i) => (
                <div key={i} className="card cross-card">
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, marginBottom: 4 }}>
                    {v.disease}
                  </div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: getRiskColor(v.risk_probability * 100) }}>
                    {(v.risk_probability * 100).toFixed(1)}%
                  </div>
                  <span className={`badge ${getBadgeClass(v.risk_level)}`}>{v.risk_level}</span>
                  <div style={{ fontSize: 11, color: 'var(--ink-muted)', marginTop: 6 }} className="data-text">
                    {v.matched_snps} SNPs matched
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
