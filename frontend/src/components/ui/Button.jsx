import React from 'react';


const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  loading = false,
  icon = null,
  ...props
}) => {
  const base = `
    inline-flex items-center justify-center gap-2
    font-medium rounded-md
    transition-all duration-base
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background
    disabled:opacity-40 disabled:cursor-not-allowed
    relative overflow-hidden
    after:absolute after:inset-0 after:bg-white/0 hover:after:bg-white/[.06] after:transition-colors after:duration-fast
  `;

  const variants = {
    
    primary: 'bg-primary hover:bg-primary-hover text-white shadow-glow-primary hover:shadow-[0_0_22px_-4px_rgba(124,58,237,0.6)]',

   
    secondary: 'bg-surface hover:bg-surface-hover text-secondary border border-border-light hover:border-secondary/30',

   
    outline: 'bg-transparent hover:bg-primary/10 text-primary border border-primary/40 hover:border-primary',

  
    danger: 'bg-accent-error hover:bg-red-600 text-white shadow-glow-error hover:shadow-[0_0_22px_-4px_rgba(239,68,68,0.5)]',

   
    ghost: 'bg-transparent hover:bg-surface-hover text-text-secondary hover:text-text-primary border border-transparent hover:border-border',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const iconSize = { sm: 'w-3.5 h-3.5', md: 'w-4 h-4', lg: 'w-5 h-5' };

  return (
    <button
      className={`${base} ${variants[variant] ?? variants.primary} ${sizes[size] ?? sizes.md} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <svg
          className={`${iconSize[size]} animate-spin opacity-80`}
          viewBox="0 0 16 16" fill="none"
        >
          <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" strokeDasharray="28" strokeDashoffset="10" />
        </svg>
      ) : icon ? (
        <span className={`${iconSize[size]} shrink-0`}>{icon}</span>
      ) : null}
      {children}
    </button>
  );
};

export default Button;