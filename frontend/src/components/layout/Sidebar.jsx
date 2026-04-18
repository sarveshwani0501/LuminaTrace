import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Terminal, Activity, Bell, Settings, ServerIcon, LogOut, ChevronDown } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../../store/slices/authSlice';

const Sidebar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { currentOrg } = useSelector(state => state.org);
  const { currentProject } = useSelector(state => state.project);
  const { user } = useSelector(state => state.auth);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/login');
  };

  const navLinks = [
    { name: 'Overview', icon: LayoutDashboard, path: '/app/dashboard' },
    { name: 'Metrics', icon: Activity, path: '/app/metrics' },
    { name: 'Logs', icon: Terminal, path: '/app/logs' },
    { name: 'Alerts', icon: Bell, path: '/app/alerts' },
    { name: 'Servers', icon: ServerIcon, path: '/app/servers' },
    { name: 'Settings', icon: Settings, path: '/app/settings' },
  ];

  return (
    <aside className="w-64 h-screen border-r border-border bg-surface flex flex-col justify-between hidden md:flex shrink-0">
      <div className="flex flex-col h-full overflow-y-auto">
        
        {/* Organization Switcher */}
        <div className="h-16 flex items-center px-4 border-b border-border hover:bg-surface-active cursor-pointer transition-colors sticky top-0 bg-surface z-10 w-full shrink-0">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-2 overflow-hidden">
              <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center border border-primary/50 shrink-0">
                <span className="text-primary font-bold text-lg leading-none">
                  {currentOrg ? currentOrg.name.charAt(0).toUpperCase() : 'L'}
                </span>
              </div>
              <span className="font-semibold text-text-primary truncate">
                {currentOrg ? currentOrg.name : 'LuminaTrace'}
              </span>
            </div>
            <ChevronDown className="w-4 h-4 text-text-muted flex-shrink-0 ml-2" />
          </div>
        </div>

        {/* Project Switcher */}
        <div className="px-4 py-4 shrink-0">
          <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-2">Workspace</p>
          <div className="flex items-center justify-between w-full px-3 py-2.5 rounded-lg bg-background border border-border cursor-pointer hover:border-primary/50 hover:bg-surface-active transition-colors">
            <span className="text-sm font-medium text-text-primary truncate flex-1">
              {currentProject ? currentProject.name : 'Select Project...'}
            </span>
            <ChevronDown className="w-4 h-4 text-text-muted flex-shrink-0 ml-2" />
          </div>
        </div>

        {/* Primary Navigation Links */}
        <nav className="flex-1 px-3 py-2 space-y-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.name}
                to={link.path}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-primary/10 text-primary shadow-sm'
                      : 'text-text-secondary hover:bg-surface-active hover:text-text-primary'
                  }`
                }
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span>{link.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Profile Card & Logout Footer */}
        <div className="p-4 border-t border-border mt-auto shrink-0 bg-surface">
          <div className="flex items-center p-2 -mx-2 rounded-lg hover:bg-surface-active transition-colors cursor-pointer group">
            <div className="w-9 h-9 rounded-full bg-secondary/20 flex items-center justify-center border border-secondary/50 shrink-0 shadow-glass">
              <span className="text-secondary font-bold text-sm">
                {user ? user.full_name?.charAt(0).toUpperCase() : 'U'}
              </span>
            </div>
            <div className="ml-3 flex flex-col flex-1 overflow-hidden">
              <span className="text-sm font-medium text-text-primary truncate">
                {user ? user.full_name : 'Guest Mod'}
              </span>
              <span className="text-xs text-text-muted truncate">
                {user ? user.email : 'guest@company.com'}
              </span>
            </div>
          </div>
          
          <button 
            onClick={handleLogout}
            className="mt-3 flex items-center justify-center w-full space-x-2 px-3 py-2 text-sm font-medium text-text-muted hover:text-accent-error hover:bg-accent-error/10 rounded-lg transition-colors border border-transparent hover:border-accent-error/20"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Log out</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
