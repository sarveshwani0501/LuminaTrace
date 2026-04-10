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
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <a href="#features" className="hover:text-primary transition-colors">Features</a>
          <a href="#docs" className="hover:text-primary transition-colors">SDK Docs</a>
          <a href="#pricing" className="hover:text-primary transition-colors">Pricing</a>
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
      <footer className="py-8 border-t border-border bg-surface text-center text-text-muted text-sm">
        <p>© {new Date().getFullYear()} LuminaTrace. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default PublicLayout;
