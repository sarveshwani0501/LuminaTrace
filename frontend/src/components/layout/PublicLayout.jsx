import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import Button from '../ui/Button';

const PublicNavbar = () => {
  return (
    <nav className="h-20 bg-background/80 backdrop-blur-glass border-b border-border fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            LuminaTrace
          </span>
        </div>
        <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-text-secondary">
          <Link to="/" className="hover:text-primary transition-colors">Product</Link>
          <Link to="/integrations" className="hover:text-primary transition-colors">Integrations</Link>
          <Link to="/docs" className="hover:text-primary transition-colors">Documentation</Link>
          <Link to="/pricing" className="hover:text-primary transition-colors">Pricing</Link>
        </div>
        <div className="flex items-center space-x-4">
          <Link to="/login">
            <Button variant="ghost">Log In</Button>
          </Link>
          <Link to="/signup">
            <Button variant="primary">Start Free Trial</Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export const PublicLayout = () => {
  return (
    <div className="min-h-screen bg-background text-text-primary flex flex-col font-sans">
      <PublicNavbar />
      <main className="flex-grow pt-20">
        <Outlet />
      </main>
      {/* Comprehensive Footer */}
      <footer className="w-full bg-surface-active border-t border-border pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-1">
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4 block">
                LuminaTrace
              </span>
              <p className="text-text-secondary text-sm leading-relaxed mb-6">
                The cosmic observer for distributed systems. Unify your telemetry into a single, blazing-fast pane of glass.
              </p>
              <div className="flex space-x-4">
                <a href="https://github.com/sarveshwani0501/LuminaTrace-Application-Log-Monitoring-System" target="_blank" rel="noopener noreferrer" className="text-text-muted hover:text-primary transition-colors">
                  GitHub
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="text-text-primary font-bold mb-4">Product</h4>
              <ul className="space-y-3 text-sm text-text-secondary">
                <li><Link to="/" className="hover:text-primary transition-colors">Features</Link></li>
                <li><Link to="/pricing" className="hover:text-primary transition-colors">Pricing</Link></li>
                <li><Link to="/integrations" className="hover:text-primary transition-colors">Integrations</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-text-primary font-bold mb-4">Resources</h4>
              <ul className="space-y-3 text-sm text-text-secondary">
                <li><Link to="/docs" className="hover:text-primary transition-colors">Documentation</Link></li>
                <li><a href="https://github.com/sarveshwani0501/luminatrace-js" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Node.js SDK</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-text-primary font-bold mb-4">Legal</h4>
              <ul className="space-y-3 text-sm text-text-secondary">
                <li><Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between">
            <p className="text-text-muted text-sm mb-4 md:mb-0">
              © {new Date().getFullYear()} LuminaTrace. All rights reserved.
            </p>
            <div className="flex items-center space-x-2 text-sm text-text-muted">
              <span className="w-2 h-2 rounded-full bg-accent-success animate-pulse"></span>
              <span>All systems operational</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
