import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className = "w-8 h-8" }) => (
  <svg viewBox="0 0 100 100" className={className} fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="currentColor" stopOpacity="1" />
        <stop offset="100%" stopColor="currentColor" stopOpacity="0.8" />
      </linearGradient>
    </defs>
    
    {/* Outer Frame - subtly reminiscent of a film frame or app icon */}
    <rect x="5" y="5" width="90" height="90" rx="20" fill="currentColor" className="opacity-10" />
    
    {/* Stylized M */}
    <path 
      d="M25 75V25H40L50 45L60 25H75V75H63V45L50 70L37 45V75H25Z" 
      fill="currentColor"
    />
    
    {/* Stylized F accent - overlaying/intertwined concept */}
    <path 
      d="M60 25H80V37H60V25Z" 
      fill="currentColor" 
      className="opacity-90"
    />
    <path 
      d="M63 48H78V60H63V48Z" 
      fill="currentColor" 
      className="opacity-90"
    />
  </svg>
);