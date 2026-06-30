import React from 'react';

/**
 * Reusable component that wraps any text with a shimmering galaxy of 8 tiny,
 * organically twinkling stars of different colors and delays.
 */
const TwinklingText = ({ children, className = "" }) => {
  return (
    <span className="relative inline-block select-none">
      {/* Twinkling Magical Stars scattered over/around the word to make it look sparkling */}
      {/* Star 1 (Yellow, Top-Left) */}
      <span className="absolute -top-1 left-2 text-[7px] text-yellow-300 animate-twinkle pointer-events-none">
        <i className="fas fa-star"></i>
      </span>
      {/* Star 2 (Indigo, Top-Right) */}
      <span className="absolute -top-2 right-4 text-[6px] text-indigo-300 animate-twinkle-slow [animation-delay:0.5s] pointer-events-none">
        <i className="fas fa-star"></i>
      </span>
      {/* Star 3 (Cyan, Middle-Left) */}
      <span className="absolute top-3 -left-2 text-[5px] text-cyan-300 animate-twinkle [animation-delay:1.2s] pointer-events-none">
        <i className="fas fa-star"></i>
      </span>
      {/* Star 4 (Pink, Bottom-Right) */}
      <span className="absolute -bottom-1.5 right-1 text-[7px] text-pink-400 animate-twinkle-slow [animation-delay:0.8s] pointer-events-none">
        <i className="fas fa-star"></i>
      </span>
      {/* Star 5 (Yellow, Bottom-Center) */}
      <span className="absolute -bottom-2 left-10 text-[5px] text-yellow-200 animate-twinkle [animation-delay:1.8s] pointer-events-none">
        <i className="fas fa-star"></i>
      </span>
      {/* Star 6 (White, Top-Center) */}
      <span className="absolute -top-2 left-16 text-[6px] text-white/90 animate-twinkle-slow [animation-delay:1.5s] pointer-events-none">
        <i className="fas fa-star"></i>
      </span>
      {/* Star 7 (Cyan, Middle-Right) */}
      <span className="absolute top-2 -right-2 text-[5px] text-cyan-200 animate-twinkle [animation-delay:0.3s] pointer-events-none">
        <i className="fas fa-star"></i>
      </span>
      {/* Star 8 (Purple, Center-Right) */}
      <span className="absolute top-4 left-24 text-[6px] text-purple-300 animate-twinkle-slow [animation-delay:2.1s] pointer-events-none">
        <i className="fas fa-star"></i>
      </span>
      
      <span className={className}>
        {children}
      </span>
    </span>
  );
};

export default TwinklingText;
