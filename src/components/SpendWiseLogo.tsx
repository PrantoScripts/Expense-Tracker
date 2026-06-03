import React from "react";

interface SpendWiseLogoProps {
  className?: string;
}

export function SpendWiseLogo({ className = "h-8 w-8" }: SpendWiseLogoProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        {/* Main Wallet Gradient */}
        <linearGradient id="swWalletGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2563EB" /> {/* Vibrant Blue */}
          <stop offset="100%" stopColor="#1D4ED8" /> {/* Rich Royal Blue */}
        </linearGradient>

        {/* Clasp/Snap Gradient */}
        <linearGradient id="swClaspGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#1E40AF" />
        </linearGradient>

        {/* Arrow Glow Gradient */}
        <linearGradient id="swArrowGrad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#D9E6FF" />
          <stop offset="100%" stopColor="#FFFFFF" />
        </linearGradient>

        {/* Soft Drop Shadow for Depth (Anti-flatness) */}
        <filter id="swArrowShadow" x="-15%" y="-15%" width="130%" height="130%">
          <feDropShadow dx="0.8" dy="1.5" stdDeviation="1.2" floodColor="#0F172A" floodOpacity="0.3" />
        </filter>
      </defs>

      {/* Main Wallet Body Container */}
      <rect
        x="12"
        y="22"
        width="76"
        height="56"
        rx="10"
        fill="url(#swWalletGrad)"
      />

      {/* Top Slip Fold line (Wallet lip/opening) */}
      <path
        d="M 18 29 L 82 29"
        stroke="#93C5FD"
        strokeWidth="2.2"
        strokeLinecap="round"
        opacity="0.85"
      />

      {/* Clasp / Snap Button Strap on Right */}
      <rect
        x="74"
        y="40"
        width="16"
        height="20"
        rx="5.5"
        fill="url(#swClaspGrad)"
        stroke="#1D4ED8"
        strokeWidth="1.2"
      />

      {/* Snap Metal Button Dot */}
      <circle
        cx="82"
        cy="50"
        r="3.5"
        fill="#FFFFFF"
      />

      {/* Modern High-Growth Diagonally Upward Arrow */}
      <path
        d="M 19 72 L 53 43 L 46 37 L 68 34 L 62 56 L 56 49 L 23 77 Z"
        fill="url(#swArrowGrad)"
        filter="url(#swArrowShadow)"
      />
    </svg>
  );
}
