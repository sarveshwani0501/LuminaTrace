// import React, { forwardRef, useState } from 'react';
// import { Eye, EyeOff } from 'lucide-react';

// /**
//  * Reusable Input Component for Luminatrace
//  */
// const Input = forwardRef(({ className = '', type = 'text', error, ...props }, ref) => {
//   const [showPassword, setShowPassword] = useState(false);
//   const isPassword = type === 'password';
//   const currentType = isPassword ? (showPassword ? 'text' : 'password') : type;

//   return (
//     <div className="w-full">
//       <div className="relative">
//         <input
//           type={currentType}
//           className={`flex w-full rounded-md border bg-background px-3 py-2 text-sm text-text-primary 
//             placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent 
//             shadow-glass transition-colors disabled:cursor-not-allowed disabled:opacity-50
//             ${isPassword ? 'pr-10' : ''}
//             ${error ? 'border-accent-error focus:ring-accent-error' : 'border-border'} 
//             ${className}`}
//           ref={ref}
//           {...props}
//         />
//         {isPassword && (
//           <button
//             type="button"
//             onClick={() => setShowPassword(!showPassword)}
//             className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors focus:outline-none"
//             tabIndex="-1"
//           >
//             {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
//           </button>
//         )}
//       </div>
//       {error && (
//         <p className="mt-1 text-xs text-accent-error">{error}</p>
//       )}
//     </div>
//   );
// });

// Input.displayName = 'Input';

// export default Input;


import React, { forwardRef, useState, useId } from 'react';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

/**
 * Input Component for LuminaTrace.
 *
 * Supports:
 *  - label + hint text
 *  - leading icon  (pass a Lucide icon element via `icon` prop)
 *  - trailing suffix text  (e.g. "%" or "ms")
 *  - password show/hide toggle
 *  - error state with inline message
 *
 * @example
 * <Input
 *   label="Alert Threshold"
 *   hint="Fires when exceeded"
 *   suffix="%"
 *   placeholder="80"
 * />
 *
 * <Input
 *   label="Password"
 *   type="password"
 *   error="Must be at least 8 characters"
 * />
 */
const Input = forwardRef(({
  className = '',
  type = 'text',
  label,
  hint,
  error,
  icon: Icon = null,
  suffix = null,
  id: externalId,
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const autoId = useId();
  const id = externalId ?? autoId;

  const isPassword = type === 'password';
  const resolvedType = isPassword ? (showPassword ? 'text' : 'password') : type;

  const hasLeft  = !!Icon;
  const hasRight = isPassword || !!suffix;

  return (
    <div className="w-full flex flex-col gap-1.5">
      {/* Label */}
      {label && (
        <label
          htmlFor={id}
          className="text-xs font-medium text-text-secondary tracking-wide"
        >
          {label}
        </label>
      )}

      {/* Input wrapper */}
      <div className="relative w-full">
        {/* Leading icon */}
        {Icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none w-4 h-4 flex items-center">
            <Icon className="w-4 h-4" />
          </span>
        )}

        <input
          id={id}
          type={resolvedType}
          ref={ref}
          className={`
            w-full rounded-md bg-background
            text-sm text-text-primary placeholder:text-text-muted
            border ring-0 ring-offset-0
            focus:outline-none focus:ring-2
            transition-[border-color,box-shadow] duration-fast
            disabled:cursor-not-allowed disabled:opacity-50
            ${hasLeft  ? 'pl-9'  : 'pl-3'}
            ${hasRight ? 'pr-10' : 'pr-3'}
            py-2
            ${error
              ? 'border-accent-error focus:border-accent-error focus:ring-accent-error/20'
              : 'border-border hover:border-border-light focus:border-primary focus:ring-primary/20'
            }
            ${className}
          `}
          {...props}
        />

        {/* Trailing — password toggle takes precedence over suffix */}
        {isPassword ? (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword(v => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors focus:outline-none"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword
              ? <EyeOff className="w-4 h-4" />
              : <Eye     className="w-4 h-4" />}
          </button>
        ) : suffix ? (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted text-xs font-mono pointer-events-none select-none">
            {suffix}
          </span>
        ) : null}
      </div>

      {/* Error or hint — error takes precedence */}
      {error ? (
        <p className="flex items-center gap-1 text-[11px] text-accent-error">
          <AlertCircle className="w-3 h-3 shrink-0" />
          {error}
        </p>
      ) : hint ? (
        <p className="text-[11px] text-text-muted">{hint}</p>
      ) : null}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;