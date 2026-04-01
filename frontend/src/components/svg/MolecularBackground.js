import React from 'react';

export default function MolecularBackground() {
  const hexSize = 32;
  const hexH = hexSize * Math.sqrt(3);
  const cols = 20;
  const rows = 14;

  const hexPoints = (cx, cy) => {
    const pts = [];
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i - Math.PI / 6;
      pts.push(`${cx + hexSize * Math.cos(angle)},${cy + hexSize * Math.sin(angle)}`);
    }
    return pts.join(' ');
  };

  const hexagons = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const cx = col * hexSize * 1.5 + (row % 2 === 1 ? hexSize * 0.75 : 0);
      const cy = row * hexH * 0.5;
      hexagons.push({ cx, cy, key: `${row}-${col}` });
    }
  }

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    >
      <svg
        width="100%"
        height="100%"
        style={{ opacity: 0.04 }}
      >
        {hexagons.map(({ cx, cy, key }) => (
          <polygon
            key={key}
            points={hexPoints(cx, cy)}
            fill="none"
            stroke="var(--ink)"
            strokeWidth="0.8"
          />
        ))}
      </svg>
    </div>
  );
}
