import React from 'react';
import { cn } from '../../utils/cn';

export const AdminCard = ({ title, children, className }) => {
  return (
    <div className={cn("rounded-xl border border-white/5 bg-surface p-6 shadow-xl relative overflow-hidden transition-all duration-300 hover:border-white/10", className)}>
      {title && (
        <h3 className="text-lg font-heading font-bold text-text mb-4 border-b border-white/5 pb-3">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
};
