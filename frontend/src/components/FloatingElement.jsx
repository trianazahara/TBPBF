import React from 'react';

const FloatingElement = ({ className, animationDelay }) => {
  return (
    <div 
      className={`absolute ${className}`}
      style={{
        animation: `float 6s ease-in-out infinite`,
        animationDelay: `${animationDelay}s`
      }}
    >
      <div className="w-4 h-4 bg-white/20 rounded-full backdrop-blur-sm" />
    </div>
  );
};

export default FloatingElement;