import React from 'react';

/**
 * Reusable Button Component for LuminaTrace Dark Theme
 * 
 * @param {string} variant - 'primary' | 'secondary' | 'danger' | 'ghost'
 * @param {string} size - 'sm' | 'md' | 'lg'
 */
const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-md transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-primary hover:bg-primary-hover text-white shadow-glow-primary',
    secondary: 'bg-surface hover:bg-surface-hover text-secondary border border-border-light shadow-glass',
    danger: 'bg-accent-error hover:bg-red-600 text-white shadow-glow-error',
    ghost: 'bg-transparent hover:bg-surface-hover text-text-secondary hover:text-text-primary',
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const currentVariant = variants[variant] || variants.primary;
  const currentSize = sizes[size] || sizes.md;

  return (
    <button
      className={`${baseStyles} ${currentVariant} ${currentSize} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
