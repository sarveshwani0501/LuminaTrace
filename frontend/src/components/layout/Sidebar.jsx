import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Terminal, Activity, Bell, Settings, ServerIcon, LogOut, ChevronDown } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../../store/slices/authSlice';
import { setCurrentProject } from '../../store/slices/projectSlice';
import { useState } from 'react';
import CreateOrgModal from '../projects/CreateOrgModal';

const Sidebar = ({ onCreateProject }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { currentOrg } = useSelector(state => state.org);
  const { currentProject } = useSelector(state => state.project);
  const { user } = useSelector(state => state.auth);

  const [isOrgDropdownOpen, setIsOrgDropdownOpen] = useState(false);
  const [isProjDropdownOpen, setIsProjDropdownOpen] = useState(false);
  const [isCreateOrgModalOpen, setIsCreateOrgModalOpen] = useState(false);

  const availableOrgs = useSelector(state => state.org.list) || [];
  const availableProjects = useSelector(state => state.project.list) || [];
  
  const userOwnsAnOrg = availableOrgs.some(o => o.role === 'owner');

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
        <div className="relative z-[100] w-full shrink-0">
          <div 
            onClick={() => setIsOrgDropdownOpen(!isOrgDropdownOpen)}
            className="h-16 flex items-center px-4 border-b border-border hover:bg-surface-active cursor-pointer transition-colors bg-surface w-full"
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center space-x-2 overflow-hidden">
                <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center border border-primary/50 shrink-0">
                  <span className="text-primary font-bold text-lg leading-none">
                    {currentOrg ? currentOrg.name.charAt(0).toUpperCase() : 'N'}
                  </span>
                </div>
                <span className="font-semibold text-text-primary truncate max-w-[120px]">
                  {currentOrg ? currentOrg.name : 'No Organization'}
                </span>
              </div>
              <ChevronDown className={`w-4 h-4 text-text-muted flex-shrink-0 ml-2 transition-transform ${isOrgDropdownOpen ? 'rotate-180' : ''}`} />
            </div>
          </div>
          
          {isOrgDropdownOpen && (
            <div className="absolute top-16 left-2 w-[calc(100%-16px)] bg-background border border-border shadow-lg rounded-lg overflow-hidden py-1 z-50">
              {availableOrgs.map(org => {
                const isOwner = org.role === 'owner';
                return (
                  <div key={org.id} onClick={() => setIsOrgDropdownOpen(false)} className="px-4 py-2 hover:bg-surface-active cursor-pointer flex items-center justify-between transition-colors">
                    <div className="flex items-center overflow-hidden">
                      <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center border border-primary/20 mr-3 shrink-0">
                        <span className="text-primary text-xs font-bold">{org.name.charAt(0)}</span>
                      </div>
                      <span className="text-sm font-medium text-text-primary truncate pr-2">{org.name}</span>
                    </div>
                    {isOwner && <span className="text-[9px] font-mono font-bold tracking-widest text-[#10b981] bg-[#064e3b] px-1.5 py-0.5 rounded border border-[#065f46] shrink-0">OWNER</span>}
                  </div>
                );
              })}
              {!userOwnsAnOrg && (
                <div 
                  onClick={() => { setIsOrgDropdownOpen(false); setIsCreateOrgModalOpen(true); }}
                  className="border-t border-border mt-1 px-4 py-2 hover:bg-surface-active cursor-pointer text-xs font-medium text-primary flex items-center"
                >
                  + Create Organization
                </div>
              )}
            </div>
          )}
        </div>

        {/* Project Switcher */}
        <div className="px-4 py-4 shrink-0 relative z-[90]">
          <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-2">Workspace</p>
          <div 
            onClick={() => setIsProjDropdownOpen(!isProjDropdownOpen)}
            className={`flex items-center justify-between w-full px-3 py-2.5 rounded-lg bg-background border cursor-pointer transition-colors ${isProjDropdownOpen ? 'border-primary/50 bg-surface-active' : 'border-border hover:border-primary/50 hover:bg-surface-active'}`}
          >
            <span className="text-sm font-medium text-text-primary truncate flex-1">
              {currentProject ? currentProject.name : 'No Workspace'}
            </span>
            <ChevronDown className={`w-4 h-4 text-text-muted flex-shrink-0 ml-2 transition-transform ${isProjDropdownOpen ? 'rotate-180' : ''}`} />
          </div>

          {isProjDropdownOpen && (
            <div className="absolute top-[72px] left-4 w-[calc(100%-32px)] bg-background border border-border shadow-lg rounded-lg overflow-hidden py-1 z-50">
              {availableProjects.map(proj => (
                <div 
                  key={proj.id} 
                  onClick={() => { dispatch(setCurrentProject(proj)); setIsProjDropdownOpen(false); }} 
                  className={`px-3 py-2 hover:bg-surface-active cursor-pointer flex items-center transition-colors ${currentProject?.id === proj.id ? 'bg-primary/10' : ''}`}
                >
                  <div className={`w-2 h-2 rounded-full mr-2 shrink-0 ${currentProject?.id === proj.id ? 'bg-primary' : 'bg-primary/40'}`}></div>
                  <span className="text-sm text-text-secondary hover:text-text-primary truncate">{proj.name}</span>
                  {currentProject?.id === proj.id && <span className="ml-auto text-[9px] text-primary font-mono">active</span>}
                </div>
              ))}
              <div 
                onClick={() => { setIsProjDropdownOpen(false); onCreateProject?.(); }}
                className="border-t border-border mt-1 px-3 py-2 hover:bg-surface-active cursor-pointer text-xs font-medium text-primary flex items-center"
              >
                + New Workspace
              </div>
            </div>
          )}
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
                {user ? user.full_name : 'Guest'}
              </span>
              <span className="text-xs text-text-muted truncate">
                {user ? user.email : ''}
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

      {isCreateOrgModalOpen && (
        <CreateOrgModal 
          onClose={() => setIsCreateOrgModalOpen(false)} 
          onSuccess={() => setIsCreateOrgModalOpen(false)} 
        />
      )}
    </aside>
  );
};

export default Sidebar;
