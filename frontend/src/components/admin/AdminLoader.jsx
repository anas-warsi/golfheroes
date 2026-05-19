import React from 'react';

export const AdminLoader = ({ message = 'Loading administration data...' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 w-full">
      <div className="relative w-12 h-12 mb-4">
        {/* Pulsing glow */}
        <div className="absolute inset-0 rounded-full bg-primary/20 blur-md animate-pulse"></div>
        {/* Spinning border */}
        <div className="w-full h-full rounded-full border-2 border-white/5 border-t-primary animate-spin"></div>
      </div>
      <p className="text-text-muted text-sm tracking-wide animate-pulse">{message}</p>
    </div>
  );
};
