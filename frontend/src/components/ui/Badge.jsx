import React from 'react';

/**
 * Badge Component for Statuses and Server tags
 * @param {string} variant - 'info' | 'success' | 'warning' | 'error' | 'default'
 */
const Badge = ({ children, className = '', variant = 'default' }) => {
  const variants = {
    info: 'bg-secondary/10 text-secondary border border-secondary/20',
    success: 'bg-accent-success/10 text-accent-success border border-accent-success/20',
    warning: 'bg-accent-warning/10 text-accent-warning border border-accent-warning/20',
    error: 'bg-accent-error/10 text-accent-error border border-accent-error/20',
    default: 'bg-surface-active text-text-secondary border border-border-light',
  };

  const currentVariant = variants[variant] || variants.default;

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium font-mono ${currentVariant} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
