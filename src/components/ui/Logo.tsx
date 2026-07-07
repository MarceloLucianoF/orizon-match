import React from "react";

interface LogoProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

export function Logo({ size, className = "w-6 h-6", ...props }: LogoProps) {
  const finalSize = size || undefined;

  return (
    <svg
      viewBox="0 0 32 32"
      width={finalSize}
      height={finalSize}
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <defs>
        {/* Helix loop gradient (teal to cyan) */}
        <linearGradient id="helix-grad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#00897B" />
          <stop offset="100%" stopColor="#00B59C" />
        </linearGradient>
        {/* Drop shadow filter to make the helix loop glow */}
        <filter id="helix-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* BACK LOOP (drawn behind the H vertical pillars to create 3D wrapping) */}
      <path
        d="M 6.5,21.5 C 7,15.5 12,10 18.5,8 C 22.5,6.5 25.5,8 26,11.5"
        stroke="url(#helix-grad)"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
        opacity="0.8"
      />

      {/* The "H" symbol (middle layer) */}
      <g fill="currentColor">
        {/* Left vertical pillar */}
        <rect x="10" y="6" width="3.5" height="20" rx="1.2" />
        {/* Right vertical pillar */}
        <rect x="18.5" y="6" width="3.5" height="20" rx="1.2" />
        {/* Crossbar */}
        <rect x="13.5" y="14.5" width="5" height="3" />
      </g>

      {/* FRONT LOOP (drawn on top of the H vertical pillars to complete 3D wrapping) */}
      <path
        d="M 26,11.5 C 26.5,15.5 22,21.5 15.5,24 C 9.5,26.5 6,25 6.5,21.5"
        stroke="url(#helix-grad)"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
        filter="url(#helix-glow)"
      />
    </svg>
  );
}
