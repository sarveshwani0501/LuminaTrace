import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, Terminal, Activity, Bell, Server, Settings, User } from 'lucide-react';

const Sidebar = () => {
  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/app/dashboard' },
    { name: 'Logs', icon: Terminal, path: '/app/logs' },
    { name: 'Metrics', icon: Activity, path: '/app/metrics' },
    { name: 'Alerts', icon: Bell, path: '/app/alerts' },
    { name: 'Servers', icon: Server, path: '/app/servers' },
    { name: 'Settings', icon: Settings, path: '/app/settings' },
  ];

  return (
    <aside className="w-64 bg-background border-r border-border h-screen flex flex-col hidden md:flex">
      <div className="h-16 flex items-center px-6 border-b border-border-light">
        <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          LuminaTrace
        </h1>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors font-medium ${
                  isActive
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>
      
      {/* Lower Profile Section Placeholder */}
      <div className="p-4 border-t border-border-light">
        <div className="flex items-center space-x-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-surface-active flex items-center justify-center">
            <User className="w-4 h-4 text-text-muted" />
          </div>
          <div>
            <p className="text-sm font-medium text-text-primary">Admin</p>
            <p className="text-xs text-text-muted">admin@org.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

const Header = () => {
  return (
    <header className="h-16 bg-background border-b border-border-light flex items-center justify-between px-6 z-10 sticky top-0">
      <div className="flex items-center space-x-4">
        {/* Project Selector Placeholder */}
        <div className="bg-surface px-4 py-1.5 rounded border border-border-light text-sm text-text-secondary cursor-pointer hover:border-primary/50 transition-colors">
          Project Alpha ▾
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-accent-success shadow-glow-secondary"></span>
          <span className="text-accent-success">SYSTEM HEALTHY</span>
        </div>
      </div>
    </header>
  );
};

const AppLayout = () => {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col w-full h-full">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 scroll-smooth">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
