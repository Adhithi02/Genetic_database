import React from 'react';

export default function PathwayFlowSVG({ width = 560, height = 60 }) {
  const nodes = [
    { label: 'SNP', x: 50 },
    { label: 'Gene', x: 190 },
    { label: 'Pathway', x: 350 },
    { label: 'Disease', x: 510 },
  ];

  const nodeW = 80;
  const nodeH = 32;
  const cy = height / 2;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      {/* Connecting lines with animated dash */}
      {nodes.slice(0, -1).map((node, i) => {
        const next = nodes[i + 1];
        return (
          <line
            key={`line-${i}`}
            x1={node.x + nodeW / 2}
            y1={cy}
            x2={next.x - nodeW / 2}
            y2={cy}
            stroke="var(--ink-faint)"
            strokeWidth="1.5"
            strokeDasharray="6 4"
          >
            <animate
              attributeName="stroke-dashoffset"
              from="20"
              to="0"
              dur="2s"
              repeatCount="indefinite"
            />
          </line>
        );
      })}

      {/* Arrow heads */}
      {nodes.slice(0, -1).map((node, i) => {
        const next = nodes[i + 1];
        const ax = next.x - nodeW / 2 - 2;
        return (
          <polygon
            key={`arrow-${i}`}
            points={`${ax},${cy - 4} ${ax + 6},${cy} ${ax},${cy + 4}`}
            fill="var(--ink-faint)"
          />
        );
      })}

      {/* Node boxes */}
      {nodes.map((node, i) => (
        <g key={i}>
          <rect
            x={node.x - nodeW / 2}
            y={cy - nodeH / 2}
            width={nodeW}
            height={nodeH}
            rx="8"
            fill="var(--paper)"
            stroke="var(--ink-faint)"
            strokeWidth="1"
          />
          <text
            x={node.x}
            y={cy + 4}
            textAnchor="middle"
            fontFamily="var(--font-body)"
            fontSize="12"
            fontWeight="500"
            fill="var(--ink-muted)"
          >
            {node.label}
          </text>
        </g>
      ))}
    </svg>
  );
}
