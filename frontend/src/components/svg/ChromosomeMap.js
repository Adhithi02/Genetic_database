import React, { useState } from 'react';

const CHROMOSOMES = [
  { id: 1, h: 100 }, { id: 2, h: 96 }, { id: 3, h: 80 }, { id: 4, h: 76 },
  { id: 5, h: 72 }, { id: 6, h: 68 }, { id: 7, h: 64 }, { id: 8, h: 58 },
  { id: 9, h: 56 }, { id: 10, h: 54 }, { id: 11, h: 54 }, { id: 12, h: 52 },
  { id: 13, h: 44 }, { id: 14, h: 42 }, { id: 15, h: 40 }, { id: 16, h: 36 },
  { id: 17, h: 34 }, { id: 18, h: 32 }, { id: 19, h: 24 }, { id: 20, h: 26 },
  { id: 21, h: 18 }, { id: 22, h: 20 }, { id: 23, h: 62, label: 'X/Y' },
];

export default function ChromosomeMap({ snpData = [] }) {
  const [hovered, setHovered] = useState(null);

  // Map: chromosome number -> list of rsIDs
  const chrMap = {};
  snpData.forEach(snp => {
    const chr = snp.chromosome?.toString().replace('chr', '') || '';
    if (!chrMap[chr]) chrMap[chr] = [];
    chrMap[chr].push(snp.rsid);
  });

  const gap = 36;
  const baseY = 120;
  const totalW = CHROMOSOMES.length * gap + 40;

  return (
    <div style={{ position: 'relative', width: '100%', overflow: 'hidden' }}>
      <svg width="100%" height="160" viewBox={`0 0 ${totalW} 160`} preserveAspectRatio="xMidYMid meet">
        {CHROMOSOMES.map((chr, i) => {
          const x = 20 + i * gap;
          const y = baseY - chr.h;
          const hasSNP = chrMap[chr.id.toString()];
          const pinchY = y + chr.h * 0.4;
          const w = 14;

          return (
            <g
              key={chr.id}
              onMouseEnter={() => setHovered(chr.id)}
              onMouseLeave={() => setHovered(null)}
              style={{ cursor: hasSNP ? 'pointer' : 'default' }}
            >
              {/* Chromosome body with centromere pinch */}
              <path
                d={`
                  M ${x} ${y + 4}
                  Q ${x} ${y}, ${x + 3} ${y}
                  L ${x + w - 3} ${y}
                  Q ${x + w} ${y}, ${x + w} ${y + 4}
                  L ${x + w} ${pinchY - 4}
                  Q ${x + w} ${pinchY}, ${x + w - 3} ${pinchY}
                  L ${x + 3} ${pinchY}
                  Q ${x} ${pinchY}, ${x} ${pinchY - 4}
                  Z
                `}
                fill={hasSNP ? 'var(--blue-mist)' : '#f0ede8'}
                stroke={hasSNP ? 'var(--blue-ink)' : 'var(--ink-faint)'}
                strokeWidth="0.8"
              />
              <path
                d={`
                  M ${x} ${pinchY + 4}
                  Q ${x} ${pinchY}, ${x + 3} ${pinchY}
                  L ${x + w - 3} ${pinchY}
                  Q ${x + w} ${pinchY}, ${x + w} ${pinchY + 4}
                  L ${x + w} ${baseY - 4}
                  Q ${x + w} ${baseY}, ${x + w - 3} ${baseY}
                  L ${x + 3} ${baseY}
                  Q ${x} ${baseY}, ${x} ${baseY - 4}
                  Z
                `}
                fill={hasSNP ? 'var(--blue-mist)' : '#f0ede8'}
                stroke={hasSNP ? 'var(--blue-ink)' : 'var(--ink-faint)'}
                strokeWidth="0.8"
              />

              {/* Copper dot if SNP present */}
              {hasSNP && (
                <circle
                  cx={x + w / 2}
                  cy={y + chr.h * 0.3}
                  r={4}
                  fill="var(--copper)"
                />
              )}

              {/* Chromosome label */}
              <text
                x={x + w / 2}
                y={baseY + 14}
                textAnchor="middle"
                fontFamily="var(--font-data)"
                fontSize="9"
                fill="var(--ink-muted)"
              >
                {chr.label || chr.id}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Tooltip */}
      {hovered && chrMap[hovered.toString()] && (
        <div style={{
          position: 'absolute',
          top: 4,
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'var(--paper)',
          border: '1px solid var(--ink-faint)',
          borderRadius: 8,
          padding: '8px 14px',
          boxShadow: 'var(--shadow)',
          zIndex: 10,
          fontSize: 12,
          fontFamily: 'var(--font-data)',
        }}>
          <span style={{ color: 'var(--ink-muted)', fontSize: 10 }}>
            Chr {hovered}
          </span>
          <br />
          {chrMap[hovered.toString()].join(', ')}
        </div>
      )}
    </div>
  );
}
