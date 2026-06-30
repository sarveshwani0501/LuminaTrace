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


export const CardFooter = ({ children, className = '' }) => (
  <div className={`px-5 py-3 border-t border-border bg-background/40 flex items-center justify-between gap-4 ${className}`}>
    {children}
  </div>
);
