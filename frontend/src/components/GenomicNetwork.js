import React, { useRef, useEffect, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';

function GenomicNetwork({ networkData, width = 800, height = 500 }) {
  const fgRef = useRef();

  // Resize handling
  const [dimensions, setDimensions] = useState({ width, height });
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      setDimensions({
        width: containerRef.current.offsetWidth,
        height: containerRef.current.offsetHeight || height
      });
    }
    const handleResize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight || height
        });
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [height]);

  if (!networkData || !networkData.nodes || networkData.nodes.length === 0) {
    return (
      <div className="network-placeholder">
        <p>No network pathways mapped for this patient's profile.</p>
      </div>
    );
  }

  // Visual categorization
  const getNodeColor = (node) => {
    switch (node.type) {
      case 'disease': return '#ef4444'; // Red
      case 'gene': return '#3b82f6';    // Blue
      case 'pathway': return '#a855f7'; // Purple
      case 'snp': return '#f59e0b';     // Yellow
      default: return '#9ca3af';
    }
  };

  const getLinkColor = (link) => {
    switch (link.type) {
      case 'snp_gene': return 'rgba(245, 158, 11, 0.4)';
      case 'gene_pathway': return 'rgba(59, 130, 246, 0.4)';
      case 'pathway_disease': return 'rgba(239, 68, 68, 0.4)';
      default: return 'rgba(255, 255, 255, 0.1)';
    }
  };

  return (
    <div className="genomic-network-container" ref={containerRef} style={{ width: '100%', height: '100%', minHeight: '500px', backgroundColor: '#0B0F19', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
      {/* Legend Map */}
      <div className="network-legend" style={{ position: 'absolute', zIndex: 10, padding: '15px', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(5px)', margin: '10px', borderRadius: '8px', fontSize: '13px' }}>
        <h4 style={{ margin: '0 0 10px 0', color: '#fff', fontSize: '14px' }}>Biological Topography</h4>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ef4444' }}></span> Target Disease
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#a855f7' }}></span> Reactome Pathway
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#3b82f6' }}></span> Gene (Ensembl mapping)
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#f59e0b' }}></span> Patient SNP
        </div>
      </div>

      <ForceGraph2D
        ref={fgRef}
        width={dimensions.width}
        height={dimensions.height}
        graphData={networkData}
        nodeLabel={(node) => `
          <div style="background: #1f2937; padding: 8px 12px; border-radius: 6px; border: 1px solid #374151; font-family: sans-serif; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.5);">
            <strong style="color: ${getNodeColor(node)}; font-size: 14px;">${node.label}</strong>
            <div style="font-size: 12px; color: #d1d5db; margin-top: 4px; text-transform: uppercase;">${node.type}</div>
            ${node.type === 'snp' ? `<div style="font-size: 11px; margin-top: 4px;">Log Odds Ratio: ${node.odds_ratio}</div>` : ''}
            ${node.has_kinetics ? `<div style="font-size: 11px; margin-top: 4px; color: #10b981;">▶ Has Breast Enzyme Kinetics Mapping</div>` : ''}
          </div>
        `}
        nodeColor={getNodeColor}
        nodeRelSize={1}
        nodeVal={node => node.size || 5}
        linkColor={getLinkColor}
        linkWidth={1.5}
        linkDirectionalParticles={2}
        linkDirectionalParticleSpeed={0.005}
        backgroundColor="#0B0F19"
        cooldownTicks={100}
        onEngineStop={() => fgRef.current.zoomToFit(400, 50)}
      />
    </div>
  );
}

export default GenomicNetwork;
