import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  LayoutDashboard, Terminal, Activity,
  Bell, Server, Settings, ChevronDown
} from 'lucide-react';

/* ─────────────────────────────────────────────────────────────────
   NAV ITEMS
───────────────────────────────────────────────────────────────── */
const NAV_ITEMS = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/app/dashboard' },
  { name: 'Logs',      icon: Terminal,        path: '/app/logs'      },
  { name: 'Metrics',   icon: Activity,        path: '/app/metrics'   },
  { name: 'Alerts',    icon: Bell,            path: '/app/alerts'    },
  { name: 'Servers',   icon: Server,          path: '/app/servers'   },
  { name: 'Settings',  icon: Settings,        path: '/app/settings'  },
];

/* ─────────────────────────────────────────────────────────────────
   USER AVATAR  (initials from name or email)
───────────────────────────────────────────────────────────────── */
const UserAvatar = ({ name, email }) => {
  const initials = name
    ? name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : (email?.[0] ?? '?').toUpperCase();
  return (
    <div className="w-7 h-7 rounded-full bg-primary/15 border border-primary/25 flex items-center justify-center shrink-0">
      <span className="text-[10px] font-semibold text-primary font-mono">{initials}</span>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────
   SIDEBAR
   Accepts onCreateProject from PrivateLayout so the "+ New Project"
   trigger in the header can open the modal.
───────────────────────────────────────────────────────────────── */
export const Sidebar = ({ onCreateProject }) => {
  const { user }           = useSelector(state => state.auth);
  const { currentProject } = useSelector(state => state.project);
  const { currentOrg }     = useSelector(state => state.org);

  return (
    <aside className="w-60 bg-background border-r border-border h-screen flex flex-col hidden md:flex shrink-0">

      {/* Brand */}
      <div className="h-16 flex items-center px-5 border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          <svg width="18" height="18" viewBox="0 0 22 22" fill="none">
            <path d="M11 2L3 6.5v9L11 20l8-4.5v-9L11 2z" stroke="#7C3AED" strokeWidth="1.6" strokeLinejoin="round"/>
            <circle cx="11" cy="11" r="2.5" fill="#7C3AED"/>
          </svg>
          <span className="text-lg font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            LuminaTrace
          </span>
        </div>
      </div>

      {/* Org + Project context */}
      <div className="px-3 py-3 border-b border-border shrink-0">
        {/* Org name */}
        {currentOrg && (
          <p className="text-[9px] font-mono uppercase tracking-widest text-text-muted px-2 mb-1.5">
            {currentOrg.name}
          </p>
        )}
        {/* Project switcher */}
        <button
          onClick={onCreateProject}
          className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-md bg-surface hover:bg-surface-hover border border-border hover:border-border-light transition-all duration-fast group"
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-success shrink-0" />
            <span className="text-xs font-medium text-text-primary truncate">
              {currentProject?.name ?? 'Select project'}
            </span>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-text-muted shrink-0 group-hover:text-text-primary transition-colors duration-fast" />
        </button>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5">
        {NAV_ITEMS.map(item => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-fast
                ${isActive
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary border border-transparent'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              {item.name}
            </NavLink>
          );
        })}
      </nav>

      {/* User profile — real data from Redux auth state */}
      <div className="p-3 border-t border-border shrink-0">
        <div className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-surface-hover transition-colors duration-fast">
          <UserAvatar name={user?.full_name} email={user?.email} />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-text-primary truncate">
              {user?.full_name ?? 'User'}
            </p>
            <p className="text-[10px] font-mono text-text-muted truncate">
              {user?.email ?? ''}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};

/* ─────────────────────────────────────────────────────────────────
   HEADER  (sticky top bar inside private layout)
───────────────────────────────────────────────────────────────── */
const Header = ({ onCreateProject }) => {
  const { currentProject } = useSelector(state => state.project);
  const { currentOrg }     = useSelector(state => state.org);

  return (
    <header className="h-14 bg-background/90 backdrop-blur-glass border-b border-border flex items-center justify-between px-6 z-10 sticky top-0 shrink-0">

      {/* Left: org / project breadcrumb + switcher */}
      <div className="flex items-center gap-3">
        {currentOrg && (
          <>
            <span className="text-xs font-mono text-text-muted">{currentOrg.name}</span>
            <span className="text-border">/</span>
          </>
        )}
        <button
          onClick={onCreateProject}
          className="flex items-center gap-2 bg-surface hover:bg-surface-hover border border-border hover:border-border-light rounded-md px-3 py-1.5 text-xs font-medium text-text-secondary hover:text-text-primary transition-all duration-fast"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-accent-success shrink-0" />
          {currentProject?.name ?? 'No project selected'}
          <ChevronDown className="w-3 h-3 text-text-muted" />
        </button>
      </div>

      {/* Right: system health */}
      <div className="flex items-center gap-2 text-xs font-mono text-accent-success">
        <span className="w-2 h-2 rounded-full bg-accent-success animate-pulse" />
        System healthy
      </div>
    </header>
  );
};

/* ─────────────────────────────────────────────────────────────────
   APP LAYOUT  (used by AppLayout.jsx route wrapper if needed)
   NOTE: PrivateLayout is the primary private wrapper.
   This component is kept for any standalone usage.
───────────────────────────────────────────────────────────────── */
const AppLayout = () => (
  <div className="flex h-screen overflow-hidden bg-background">
    <Sidebar />
    <div className="flex-1 flex flex-col h-full min-w-0">
      <Header />
      <main className="flex-1 overflow-y-auto px-6 py-8">
        <Outlet />
      </main>
    </div>
  </div>
);

export default AppLayout;