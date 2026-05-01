// import React from 'react';

// /**
//  * Reusable Button Component for LuminaTrace Dark Theme
//  * 
//  * @param {string} variant - 'primary' | 'secondary' | 'danger' | 'ghost'
//  * @param {string} size - 'sm' | 'md' | 'lg'
//  */
// const Button = ({
//   children,
//   variant = 'primary',
//   size = 'md',
//   className = '',
//   disabled = false,
//   ...props
// }) => {
//   const baseStyles = 'inline-flex items-center justify-center font-medium rounded-md transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed';
  
//   const variants = {
//     primary: 'bg-primary hover:bg-primary-hover text-white shadow-glow-primary',
//     secondary: 'bg-surface hover:bg-surface-hover text-secondary border border-border-light shadow-glass',
//     danger: 'bg-accent-error hover:bg-red-600 text-white shadow-glow-error',
//     ghost: 'bg-transparent hover:bg-surface-hover text-text-secondary hover:text-text-primary',
//   };
  
//   const sizes = {
//     sm: 'px-3 py-1.5 text-sm',
//     md: 'px-4 py-2 text-base',
//     lg: 'px-6 py-3 text-lg',
//   };

//   const currentVariant = variants[variant] || variants.primary;
//   const currentSize = sizes[size] || sizes.md;

//   return (
//     <button
//       className={`${baseStyles} ${currentVariant} ${currentSize} ${className}`}
//       disabled={disabled}
//       {...props}
//     >
//       {children}
//     </button>
//   );
// };

// export default Button;


import React from 'react';

/**
 * Button Component for LuminaTrace.
 *
 * @param {'primary'|'secondary'|'outline'|'danger'|'ghost'} variant
 * @param {'sm'|'md'|'lg'} size
 * @param {React.ReactNode} icon  - Optional leading icon element
 * @param {boolean}  loading      - Shows a spinner and disables the button
 */
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
    // Filled violet — primary actions (Create, Save, Deploy)
    primary: 'bg-primary hover:bg-primary-hover text-white shadow-glow-primary hover:shadow-[0_0_22px_-4px_rgba(124,58,237,0.6)]',

    // Dark surface with cyan text — secondary actions (View, Export)
    secondary: 'bg-surface hover:bg-surface-hover text-secondary border border-border-light hover:border-secondary/30',

    // Transparent violet outline — tertiary actions (Rotate Key, Edit)
    outline: 'bg-transparent hover:bg-primary/10 text-primary border border-primary/40 hover:border-primary',

    // Red filled — destructive actions (Delete, Revoke)
    danger: 'bg-accent-error hover:bg-red-600 text-white shadow-glow-error hover:shadow-[0_0_22px_-4px_rgba(239,68,68,0.5)]',

    // No background — dismiss, cancel
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