import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';

export const EmptyState = ({ icon: Icon = AlertCircle, title, description, actionText, onAction }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-12 rounded-2xl border border-dashed border-white/10 bg-surface/30 shadow-inner">
      <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-text-muted mb-6">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-xl font-heading font-bold text-text mb-2">{title}</h3>
      <p className="text-text-muted text-sm max-w-sm mb-6">{description}</p>
      {actionText && onAction && (
        <Button variant="primary" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
};
