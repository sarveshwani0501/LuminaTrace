// import React from 'react';
// import { Outlet, Link } from 'react-router-dom';
// import Button from '../ui/Button';

// const PublicNavbar = () => {
//   return (
//     <nav className="h-20 bg-background/80 backdrop-blur-glass border-b border-border fixed w-full top-0 z-50">
//       <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
//         <div className="flex items-center space-x-2">
//           <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
//             LuminaTrace
//           </span>
//         </div>
//         <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-text-secondary">
//           <Link to="/" className="hover:text-primary transition-colors">Product</Link>
//           <Link to="/integrations" className="hover:text-primary transition-colors">Integrations</Link>
//           <Link to="/docs" className="hover:text-primary transition-colors">Documentation</Link>
//           <Link to="/pricing" className="hover:text-primary transition-colors">Pricing</Link>
//         </div>
//         <div className="flex items-center space-x-4">
//           <Link to="/login">
//             <Button variant="ghost">Log In</Button>
//           </Link>
//           <Link to="/signup">
//             <Button variant="primary">Start Free Trial</Button>
//           </Link>
//         </div>
//       </div>
//     </nav>
//   );
// };

// export const PublicLayout = () => {
//   return (
//     <div className="min-h-screen bg-background text-text-primary flex flex-col font-sans">
//       <PublicNavbar />
//       <main className="flex-grow pt-20">
//         <Outlet />
//       </main>
//       {/* Comprehensive Footer */}
//       <footer className="w-full bg-surface-active border-t border-border pt-16 pb-8">
//         <div className="max-w-7xl mx-auto px-6">
//           <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
//             <div className="col-span-1 md:col-span-1">
//               <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4 block">
//                 LuminaTrace
//               </span>
//               <p className="text-text-secondary text-sm leading-relaxed mb-6">
//                 The cosmic observer for distributed systems. Unify your telemetry into a single, blazing-fast pane of glass.
//               </p>
//               <div className="flex space-x-4">
//                 <a href="https://github.com/sarveshwani0501/LuminaTrace-Application-Log-Monitoring-System" target="_blank" rel="noopener noreferrer" className="text-text-muted hover:text-primary transition-colors">
//                   GitHub
//                 </a>
//               </div>
//             </div>
            
//             <div>
//               <h4 className="text-text-primary font-bold mb-4">Product</h4>
//               <ul className="space-y-3 text-sm text-text-secondary">
//                 <li><Link to="/" className="hover:text-primary transition-colors">Features</Link></li>
//                 <li><Link to="/pricing" className="hover:text-primary transition-colors">Pricing</Link></li>
//                 <li><Link to="/integrations" className="hover:text-primary transition-colors">Integrations</Link></li>
//               </ul>
//             </div>

//             <div>
//               <h4 className="text-text-primary font-bold mb-4">Resources</h4>
//               <ul className="space-y-3 text-sm text-text-secondary">
//                 <li><Link to="/docs" className="hover:text-primary transition-colors">Documentation</Link></li>
//                 <li><a href="https://github.com/sarveshwani0501/luminatrace-js" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Node.js SDK</a></li>
//               </ul>
//             </div>

//             <div>
//               <h4 className="text-text-primary font-bold mb-4">Legal</h4>
//               <ul className="space-y-3 text-sm text-text-secondary">
//                 <li><Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
//                 <li><Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
//               </ul>
//             </div>
//           </div>
          
//           <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between">
//             <p className="text-text-muted text-sm mb-4 md:mb-0">
//               © {new Date().getFullYear()} LuminaTrace. All rights reserved.
//             </p>
//             <div className="flex items-center space-x-2 text-sm text-text-muted">
//               <span className="w-2 h-2 rounded-full bg-accent-success animate-pulse"></span>
//               <span>All systems operational</span>
//             </div>
//           </div>
//         </div>
//       </footer>
//     </div>
//   );
// };

// export default PublicLayout;
import React, { useState, useEffect } from 'react';
import { Outlet, Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

/* GitHub brand icon — not reliably exported by all lucide-react versions */
const GithubIcon = ({ className = '' }) => (
  <svg
    className={className}
    width="16" height="16"
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.604-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836a9.59 9.59 0 0 1 2.504.337c1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
  </svg>
);
import Button from '../ui/Button';

/* ─────────────────────────────────────────────────────────────────
   BRAND LOGOMARK  (reused in navbar + footer)
───────────────────────────────────────────────────────────────── */
const LogoMark = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 22 22" fill="none">
    <path
      d="M11 2L3 6.5v9L11 20l8-4.5v-9L11 2z"
      stroke="#7C3AED"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
    <circle cx="11" cy="11" r="2.5" fill="#7C3AED" />
  </svg>
);

const BrandName = ({ className = '' }) => (
  <span
    className={`font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent ${className}`}
  >
    LuminaTrace
  </span>
);

/* ─────────────────────────────────────────────────────────────────
   NAV LINKS  (single source of truth — used in both desktop + mobile)
   
   Pages to build:
   - /          Landing page
   - /docs      SDK docs (Node.js, explicit — no separate integrations page)
   - /pricing   Pricing
   - /changelog What's new (builds trust, shows active dev)
───────────────────────────────────────────────────────────────── */
const NAV_LINKS = [
  { label: 'Docs',      to: '/docs'      },
  { label: 'Pricing',   to: '/pricing'   },
  { label: 'Changelog', to: '/changelog' },
];

/* ─────────────────────────────────────────────────────────────────
   PUBLIC NAVBAR
───────────────────────────────────────────────────────────────── */
const PublicNavbar = () => {
  const [scrolled,   setScrolled]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  // Thicken border + shadow when scrolled
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <nav
      className={`h-16 fixed w-full top-0 z-50 transition-all duration-base
        bg-background/85 backdrop-blur-glass
        ${scrolled
          ? 'border-b border-border shadow-glass'
          : 'border-b border-transparent'
        }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">

        {/* Brand */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <LogoMark size={20} />
          <BrandName className="text-xl" />
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map(link => (
            <NavLink
              key={link.label}
              to={link.to}
              className={({ isActive }) =>
                `text-sm font-medium transition-colors duration-fast
                ${isActive
                  ? 'text-primary'
                  : 'text-text-secondary hover:text-text-primary'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          <Link to="/login">
            <Button variant="ghost" size="sm">Log in</Button>
          </Link>
          <Link to="/signup">
            <Button variant="primary" size="sm">Start free →</Button>
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 text-text-muted hover:text-text-primary transition-colors duration-fast rounded-md"
          onClick={() => setMobileOpen(v => !v)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="md:hidden absolute top-16 inset-x-0 bg-background border-b border-border shadow-elevated z-40">
          <div className="flex flex-col px-6 py-4 gap-0">
            {NAV_LINKS.map(link => (
              <Link
                key={link.label}
                to={link.to}
                className="py-3 text-sm font-medium text-text-secondary hover:text-text-primary border-b border-border/50 last:border-0 transition-colors duration-fast"
              >
                {link.label}
              </Link>
            ))}
            <div className="flex flex-col gap-2 pt-4">
              <Link to="/login"  className="w-full">
                <Button variant="ghost"   size="md" className="w-full">Log in</Button>
              </Link>
              <Link to="/signup" className="w-full">
                <Button variant="primary" size="md" className="w-full">Start free →</Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

/* ─────────────────────────────────────────────────────────────────
   FOOTER LINK HELPER
───────────────────────────────────────────────────────────────── */
const FooterLink = ({ label, to, href }) => {
  const cls = 'text-sm text-text-secondary hover:text-primary transition-colors duration-fast';
  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
        {label}
      </a>
    );
  }
  return <Link to={to} className={cls}>{label}</Link>;
};

/* ─────────────────────────────────────────────────────────────────
   FOOTER COLUMNS

   "Developers" column replaces "Resources" — more accurate for
   a dev-tool audience. No separate /integrations page since only
   Node.js is supported — called out explicitly in the brand column.
───────────────────────────────────────────────────────────────── */
const FOOTER_COLS = [
  {
    title: 'Product',
    links: [
      { label: 'Features',  to:   '/'          },
      { label: 'Pricing',   to:   '/pricing'   },
      { label: 'Changelog', to:   '/changelog' },
    ],
  },
  {
    title: 'Developers',
    links: [
      { label: 'Documentation', to:   '/docs'      },
      { label: 'Node.js SDK',   href: 'https://github.com/sarveshwani0501/luminatrace-js' },
      { label: 'API Reference', to:   '/docs#api'  },
      { label: 'GitHub',        href: 'https://github.com/sarveshwani0501/LuminaTrace-Application-Log-Monitoring-System' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'Privacy Policy',   to: '/privacy' },
      { label: 'Terms of Service', to: '/terms'   },
    ],
  },
];

/* ─────────────────────────────────────────────────────────────────
   FOOTER
───────────────────────────────────────────────────────────────── */
const Footer = () => (
  <footer className="w-full bg-surface border-t border-border pt-14 pb-8">
    <div className="max-w-7xl mx-auto px-6">

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">

        {/* Brand column */}
        <div className="md:col-span-1">
          <Link to="/" className="flex items-center gap-2 mb-4">
            <LogoMark size={18} />
            <BrandName className="text-lg" />
          </Link>

          <p className="text-sm text-text-secondary leading-relaxed mb-5">
            Open-source APM for distributed Node.js systems.
            Real-time logs, metrics, traces, and alerts — in one pane of glass.
          </p>

          {/* Explicit Node.js SDK callout */}
          <div className="inline-flex items-center gap-2 px-2.5 py-1.5 bg-accent-success/8 border border-accent-success/20 rounded-md">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-success shrink-0" />
            <span className="text-[11px] font-mono text-accent-success">Node.js SDK available</span>
          </div>
        </div>

        {/* Dynamic columns */}
        {FOOTER_COLS.map(col => (
          <div key={col.title}>
            <h4 className="text-sm font-semibold text-text-primary mb-4">{col.title}</h4>
            <ul className="flex flex-col gap-3">
              {col.links.map(link => (
                <li key={link.label}>
                  <FooterLink {...link} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-5">
          <p className="text-sm text-text-muted">
            © {new Date().getFullYear()} LuminaTrace. All rights reserved.
          </p>
          <a
            href="https://github.com/sarveshwani0501/LuminaTrace-Application-Log-Monitoring-System"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm text-text-muted hover:text-primary transition-colors duration-fast"
          >
            <GithubIcon className="w-3.5 h-3.5" />
            View on GitHub
          </a>
        </div>

        <div className="flex items-center gap-2 text-sm font-mono text-accent-success">
          <span className="w-2 h-2 rounded-full bg-accent-success animate-pulse" />
          All systems operational
        </div>
      </div>
    </div>
  </footer>
);

/* ─────────────────────────────────────────────────────────────────
   PUBLIC LAYOUT
───────────────────────────────────────────────────────────────── */
export const PublicLayout = () => (
  <div className="min-h-screen bg-background text-text-primary flex flex-col font-sans">
    <PublicNavbar />
    <main className="flex-grow pt-16">
      <Outlet />
    </main>
    <Footer />
  </div>
);

export default PublicLayout;