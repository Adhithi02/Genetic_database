import React, { useEffect, useState } from 'react';

export default function RiskArc({ risk = 0, size = 240, label = '' }) {
  const [animatedRisk, setAnimatedRisk] = useState(0);
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 20;
  const strokeW = 12;

  // 270-degree arc
  const startAngle = 135;
  const sweepAngle = 270;
  const endAngle = startAngle + sweepAngle;

  const toRad = (deg) => (deg * Math.PI) / 180;

  const arcPath = (angle) => {
    const end = startAngle + (angle / 100) * sweepAngle;
    const sA = toRad(startAngle);
    const eA = toRad(end);
    const x1 = cx + r * Math.cos(sA);
    const y1 = cy + r * Math.sin(sA);
    const x2 = cx + r * Math.cos(eA);
    const y2 = cy + r * Math.sin(eA);
    const largeArc = end - startAngle > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`;
  };

  const trackPath = arcPath(100);
  const fillPath = arcPath(animatedRisk);

  const getColor = (v) => {
    if (v > 70) return 'var(--copper)';
    if (v > 30) return 'var(--amber)';
    return 'var(--moss)';
  };

  const getTier = (v) => {
    if (v > 70) return 'HIGH RISK';
    if (v > 30) return 'MODERATE RISK';
    return 'LOW RISK';
  };

  useEffect(() => {
    const target = Math.round(risk * 100 * 10) / 10;
    let current = 0;
    const step = target / 60;
    const interval = setInterval(() => {
      current += step;
      if (current >= target) {
        current = target;
        clearInterval(interval);
      }
      setAnimatedRisk(current);
    }, 20);
    return () => clearInterval(interval);
  }, [risk]);

  const pct = Math.round(animatedRisk * 10) / 10;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Track */}
        <path
          d={trackPath}
          fill="none"
          stroke="var(--ink-faint)"
          strokeWidth={strokeW}
          strokeLinecap="round"
          opacity="0.4"
        />
        {/* Fill */}
        <path
          d={fillPath}
          fill="none"
          stroke={getColor(animatedRisk)}
          strokeWidth={strokeW}
          strokeLinecap="round"
        />
        {/* Centre text */}
        <text
          x={cx}
          y={cy - 8}
          textAnchor="middle"
          fontFamily="var(--font-display)"
          fontSize="52"
          fontWeight="400"
          fill="var(--ink)"
        >
          {pct}%
        </text>
        <text
          x={cx}
          y={cy + 22}
          textAnchor="middle"
          fontFamily="var(--font-body)"
          fontSize="13"
          fontWeight="500"
          fill={getColor(animatedRisk)}
          letterSpacing="0.08em"
        >
          {getTier(animatedRisk)}
        </text>
      </svg>
      {label && (
        <span style={{
          fontFamily: 'var(--font-body)',
          fontSize: 12,
          color: 'var(--ink-muted)',
          marginTop: -8,
        }}>
          {label}
        </span>
      )}
    </div>
  );
}
