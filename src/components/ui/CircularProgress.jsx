import React from 'react';

const CircularProgress = ({ percentage, size, strokeWidth, color, showLabel = true }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Background circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="rgba(55, 65, 81, 0.5)"
        strokeWidth={strokeWidth}
      />

      {/* Progress circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: 'stroke-dashoffset 0.5s ease-in-out' }}
      />

      {/* Optional percentage label inside the circle */}
      {showLabel && (
        <text
          x="50%"
          y="50%"
          dy=".3em"
          textAnchor="middle"
          fill="white"
          fontSize={size / 6}
          fontWeight="bold"
        >
          {Math.round(percentage)}%
        </text>
      )}
    </svg>
  );
};

export default CircularProgress;
