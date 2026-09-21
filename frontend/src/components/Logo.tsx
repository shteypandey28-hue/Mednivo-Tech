import React from 'react';

export const Logo = ({ className = "w-10 h-10" }: { className?: string }) => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Left blue shape (folded ribbon) */}
    <path 
      d="M8 32V12C8 6 14 4 18 8L28 20" 
      stroke="url(#blue_grad)" 
      strokeWidth="8" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    {/* Right green shape (leaf-like fold) */}
    <path 
      d="M32 32V12C32 6 26 4 22 8L12 20" 
      stroke="url(#green_grad)" 
      strokeWidth="8" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      style={{ mixBlendMode: 'multiply' }}
    />
    <defs>
      <linearGradient id="blue_grad" x1="8" y1="4" x2="28" y2="32" gradientUnits="userSpaceOnUse">
        <stop stopColor="#2563eb" />
        <stop offset="1" stopColor="#38bdf8" />
      </linearGradient>
      <linearGradient id="green_grad" x1="32" y1="4" x2="12" y2="32" gradientUnits="userSpaceOnUse">
        <stop stopColor="#059669" />
        <stop offset="1" stopColor="#10b981" />
      </linearGradient>
    </defs>
  </svg>
);
