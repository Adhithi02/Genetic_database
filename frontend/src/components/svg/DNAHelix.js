import React from 'react';

export default function DNAHelix({ height = 300, opacity = 0.25 }) {
  const points = 12;
  const w = 80;
  const h = height;
  const stepY = h / points;

  const leftPath = [];
  const rightPath = [];
  const rungs = [];

  for (let i = 0; i <= points; i++) {
    const y = i * stepY;
    const phase = (i / points) * Math.PI * 3;
    const lx = w / 2 + Math.sin(phase) * (w / 2 - 8);
    const rx = w / 2 + Math.sin(phase + Math.PI) * (w / 2 - 8);

    if (i === 0) {
      leftPath.push(`M ${lx} ${y}`);
      rightPath.push(`M ${rx} ${y}`);
    } else {
      leftPath.push(`L ${lx} ${y}`);
      rightPath.push(`L ${rx} ${y}`);
    }

    if (i % 2 === 0 && i > 0 && i < points) {
      rungs.push({ x1: lx, y1: y, x2: rx, y2: y });
    }
  }

  return (
    <div
      style={{
        position: 'absolute',
        right: -10,
        top: '50%',
        transform: 'translateY(-50%)',
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
    >
      <svg
        width={w}
        height={h}
        viewBox={`0 0 ${w} ${h}`}
        style={{
          opacity,
          animation: 'helixRotate 20s infinite linear',
        }}
      >
        <path
          d={leftPath.join(' ')}
          fill="none"
          stroke="var(--ink-faint)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d={rightPath.join(' ')}
          fill="none"
          stroke="var(--ink-faint)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        {rungs.map((r, i) => (
          <line
            key={i}
            x1={r.x1} y1={r.y1}
            x2={r.x2} y2={r.y2}
            stroke="var(--ink-faint)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        ))}
      </svg>
      <style>{`
        @keyframes helixRotate {
          0% { transform: rotateY(0deg); }
          100% { transform: rotateY(360deg); }
        }
      `}</style>
    </div>
  );
}
