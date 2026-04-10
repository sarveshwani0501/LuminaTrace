import React, { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

/**
 * Reusable Input Component for Luminatrace
 */
const Input = forwardRef(({ className = '', type = 'text', error, ...props }, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const currentType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="w-full">
      <div className="relative">
        <input
          type={currentType}
          className={`flex w-full rounded-md border bg-background px-3 py-2 text-sm text-text-primary 
            placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent 
            shadow-glass transition-colors disabled:cursor-not-allowed disabled:opacity-50
            ${isPassword ? 'pr-10' : ''}
            ${error ? 'border-accent-error focus:ring-accent-error' : 'border-border'} 
            ${className}`}
          ref={ref}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors focus:outline-none"
            tabIndex="-1"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
      {error && (
        <p className="mt-1 text-xs text-accent-error">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
