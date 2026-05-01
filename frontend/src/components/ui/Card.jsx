// import React from 'react';

// /**
//  * Reusable Card Component for LuminaTrace
//  */
// export const Card = ({ children, className = '', ...props }) => {
//   return (
//     <div 
//       className={`bg-surface border border-border rounded-xl shadow-glass overflow-hidden ${className}`}
//       {...props}
//     >
//       {children}
//     </div>
//   );
// };

// export const CardHeader = ({ children, className = '' }) => {
//   return (
//     <div className={`px-6 py-4 border-b border-border-light flex items-center justify-between ${className}`}>
//       {children}
//     </div>
//   );
// };

// export const CardTitle = ({ children, className = '' }) => {
//   return (
//     <h3 className={`text-lg font-semibold text-text-primary ${className}`}>
//       {children}
//     </h3>
//   );
// };

// export const CardContent = ({ children, className = '' }) => {
//   return (
//     <div className={`p-6 ${className}`}>
//       {children}
//     </div>
//   );
// };


import React from 'react';

/**
 * Card family for LuminaTrace panels, server tiles, stat blocks.
 *
 * Composition:
 *   <Card>
 *     <CardHeader>
 *       <CardTitle dot>api-gateway</CardTitle>
 *       <CardSubtitle>us-east-1 · 3 instances</CardSubtitle>
 *     </CardHeader>
 *     <CardContent> ... </CardContent>
 *     <CardFooter> ... </CardFooter>
 *   </Card>
 */

export const Card = ({ children, className = '', hoverable = false, ...props }) => (
  <div
    className={`
      bg-surface border border-border rounded-card shadow-glass overflow-hidden
      transition-all duration-base
      ${hoverable ? 'hover:border-border-light hover:shadow-elevated cursor-pointer' : ''}
      ${className}
    `}
    {...props}
  >
    {children}
  </div>
);

export const CardHeader = ({ children, className = '', action = null }) => (
  <div className={`px-5 py-4 border-b border-border flex items-start justify-between gap-4 ${className}`}>
    <div className="min-w-0">{children}</div>
    {action && <div className="shrink-0">{action}</div>}
  </div>
);

/**
 * @param {boolean} dot  - Prepend a violet accent dot (useful for server/service names)
 */
export const CardTitle = ({ children, className = '', dot = false }) => (
  <h3 className={`flex items-center gap-2 text-sm font-semibold text-text-primary leading-tight ${className}`}>
    {dot && (
      <span className="w-1.5 h-1.5 rounded-pill bg-primary shadow-glow-primary shrink-0" />
    )}
    {children}
  </h3>
);

export const CardSubtitle = ({ children, className = '' }) => (
  <p className={`mt-0.5 text-xs text-text-muted ${className}`}>{children}</p>
);

export const CardContent = ({ children, className = '' }) => (
  <div className={`p-5 ${className}`}>{children}</div>
);

/**
 * Slightly recessed footer — good for timestamps, action rows, pagination.
 */
export const CardFooter = ({ children, className = '' }) => (
  <div className={`px-5 py-3 border-t border-border bg-background/40 flex items-center justify-between gap-4 ${className}`}>
    {children}
  </div>
);
