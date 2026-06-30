import React from 'react';


const Badge = ({ children, className = '', variant = 'default', dot = false }) => {
  const variants = {
    // Status / health badges 
    info:     'bg-secondary/10     text-secondary        border border-secondary/20',
    success:  'bg-accent-success/10 text-accent-success  border border-accent-success/20',
    warning:  'bg-accent-warning/10 text-accent-warning  border border-accent-warning/20',

    // Log-level badges 
    error:    'bg-log-errorSubtle    text-log-error    border border-log-error/30',
    critical: 'bg-log-criticalSubtle text-log-critical border border-log-critical/30',
    debug:    'bg-log-debugSubtle    text-log-debug    border border-log-debug/30',

    // Neutral tag 
    default:  'bg-surface-active text-text-secondary border border-border-light',
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1.5
        px-2 py-0.5 rounded-badge
        text-[11px] font-medium font-mono tracking-wide uppercase
        border transition-colors duration-fast
        ${variants[variant] ?? variants.default}
        ${className}
      `}
    >
      {dot && (
        <span className="w-1.5 h-1.5 rounded-pill bg-current opacity-80 shrink-0" />
      )}
      {children}
    </span>
  );
};

export default Badge;