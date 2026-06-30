import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Terminal, Activity, Bell,
  Settings, ServerIcon, LogOut, ChevronDown, Plus
} from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../../store/slices/authSlice';
import { setCurrentProject } from '../../store/slices/projectSlice';
import CreateOrgModal from '../projects/CreateOrgModal';
import Badge from '../ui/Badge';

const NAV_LINKS = [
  { name: 'Overview',  icon: LayoutDashboard, path: '/app/dashboard' },
  { name: 'Metrics',   icon: Activity,         path: '/app/metrics'   },
  { name: 'Logs',      icon: Terminal,          path: '/app/logs'      },
  { name: 'Alerts',    icon: Bell,              path: '/app/alerts'    },
  { name: 'Servers',   icon: ServerIcon,        path: '/app/servers'   },
  { name: 'Settings',  icon: Settings,          path: '/app/settings'  },
];

const Sidebar = ({ onCreateProject }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { currentOrg, list: availableOrgs = [] } = useSelector(state => state.org);
  const { currentProject, list: availableProjects = [] } = useSelector(state => state.project);
  const { user } = useSelector(state => state.auth);

  const [isOrgDropdownOpen,  setIsOrgDropdownOpen]  = useState(false);
  const [isProjDropdownOpen, setIsProjDropdownOpen] = useState(false);
  const [isCreateOrgModalOpen, setIsCreateOrgModalOpen] = useState(false);

  const userOwnsAnOrg = availableOrgs.some(o => o.role === 'owner');

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/login');
  };

  
  const getInitial = (u) =>
    u?.full_name?.charAt(0).toUpperCase() ||
    u?.email?.charAt(0).toUpperCase() ||
    'U';

  return (
    <aside className="w-64 h-screen border-r border-border bg-surface hidden md:flex flex-col shrink-0">
      <div className="flex flex-col h-full overflow-y-auto">

        {/*  Organization Switcher  */}
        <div className="relative z-[100] shrink-0">
          <button
            onClick={() => setIsOrgDropdownOpen(v => !v)}
            className="h-16 w-full flex items-center px-4 border-b border-border
                       hover:bg-surface-active transition-colors duration-fast"
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2.5 overflow-hidden">
                {/* Org avatar */}
                <div className="w-8 h-8 rounded-md bg-primary/20 border border-primary/40
                                flex items-center justify-center shrink-0">
                  <span className="text-primary text-sm font-bold leading-none">
                    {currentOrg ? currentOrg.name.charAt(0).toUpperCase() : 'N'}
                  </span>
                </div>
                <span className="text-sm font-semibold text-text-primary truncate max-w-[120px]">
                  {currentOrg?.name ?? 'No Organization'}
                </span>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-text-muted shrink-0 ml-2
                            transition-transform duration-fast
                            ${isOrgDropdownOpen ? 'rotate-180' : ''}`}
              />
            </div>
          </button>

          {isOrgDropdownOpen && (
            <div className="absolute top-[64px] left-2 w-[calc(100%-16px)]
                            bg-surface-elevated border border-border-light
                            shadow-elevated rounded-card overflow-hidden py-1 z-50">
              {availableOrgs.map(org => (
                <button
                  key={org.id}
                  onClick={() => setIsOrgDropdownOpen(false)}
                  className="w-full px-3 py-2 hover:bg-surface-active transition-colors
                             flex items-center justify-between gap-2 text-left"
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <div className="w-6 h-6 rounded bg-primary/10 border border-primary/20
                                    flex items-center justify-center shrink-0">
                      <span className="text-primary text-xs font-bold">
                        {org.name.charAt(0)}
                      </span>
                    </div>
                    <span className="text-sm text-text-primary truncate">{org.name}</span>
                  </div>
                  {org.role === 'owner' && (
                    <Badge variant="success" className="shrink-0">Owner</Badge>
                  )}
                </button>
              ))}

              {!userOwnsAnOrg && (
                <button
                  onClick={() => { setIsOrgDropdownOpen(false); setIsCreateOrgModalOpen(true); }}
                  className="w-full border-t border-border mt-1 px-3 py-2
                             hover:bg-surface-active transition-colors
                             flex items-center gap-2 text-xs font-medium text-primary"
                >
                  <Plus className="w-3.5 h-3.5 shrink-0" />
                  Create Organization
                </button>
              )}
            </div>
          )}
        </div>

        {/* Project / Workspace Switcher */}
        <div className="px-4 py-4 shrink-0 relative z-[90]">
          <p className="text-[10px] font-semibold text-text-muted uppercase tracking-widest mb-2 px-1">
            Workspace
          </p>

          <button
            onClick={() => setIsProjDropdownOpen(v => !v)}
            className={`flex items-center justify-between w-full px-3 py-2.5 rounded-lg
                        border text-sm font-medium text-text-primary transition-all duration-fast
                        ${isProjDropdownOpen
                          ? 'border-primary/50 bg-surface-active'
                          : 'border-border bg-background hover:border-primary/40 hover:bg-surface-active'
                        }`}
          >
            <span className="truncate flex-1 text-left">
              {currentProject?.name ?? 'Select Workspace'}
            </span>
            <ChevronDown
              className={`w-4 h-4 text-text-muted shrink-0 ml-2
                          transition-transform duration-fast
                          ${isProjDropdownOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {isProjDropdownOpen && (
            <div className="absolute top-[72px] left-4 w-[calc(100%-32px)]
                            bg-surface-elevated border border-border-light
                            shadow-elevated rounded-card overflow-hidden py-1 z-50">
              {availableProjects.map(proj => {
                const isActive = currentProject?.id === proj.id;
                return (
                  <button
                    key={proj.id}
                    onClick={() => { dispatch(setCurrentProject(proj)); setIsProjDropdownOpen(false); }}
                    className={`w-full px-3 py-2 flex items-center gap-2.5 text-left
                                hover:bg-surface-active transition-colors
                                ${isActive ? 'bg-primary/10' : ''}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-pill shrink-0
                                      ${isActive ? 'bg-primary shadow-glow-primary' : 'bg-border-light'}`}
                    />
                    <span className={`text-sm truncate flex-1
                                      ${isActive ? 'text-text-primary font-medium' : 'text-text-secondary'}`}>
                      {proj.name}
                    </span>
                    {isActive && (
                      <Badge variant="info" className="shrink-0">active</Badge>
                    )}
                  </button>
                );
              })}

              <button
                onClick={() => { setIsProjDropdownOpen(false); onCreateProject?.(); }}
                className="w-full border-t border-border mt-1 px-3 py-2
                           hover:bg-surface-active transition-colors
                           flex items-center gap-2 text-xs font-medium text-primary"
              >
                <Plus className="w-3.5 h-3.5 shrink-0" />
                New Workspace
              </button>
            </div>
          )}
        </div>

        {/*  Primary Navigation*/}
        <nav className="flex-1 px-3 py-2 space-y-0.5">
          <p className="text-[10px] font-semibold text-text-muted uppercase tracking-widest mb-2 px-2">
            Navigate
          </p>
          {NAV_LINKS.map(({ name, icon: Icon, path }) => (
            <NavLink
              key={name}
              to={path}
              className={({ isActive }) =>
                `group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                 transition-all duration-fast relative
                 ${isActive
                   ? 'bg-primary/10 text-primary border-l-2 border-primary pl-[10px]'
                   : 'text-text-secondary hover:bg-surface-active hover:text-text-primary border-l-2 border-transparent pl-[10px]'
                 }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-all duration-fast
                                ${isActive
                                  ? 'text-primary drop-shadow-[0_0_6px_rgba(124,58,237,0.7)]'
                                  : 'group-hover:text-text-primary'
                                }`}
                  />
                  <span>{name}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/*  User Profile & Logout */}
        <div className="p-4 border-t border-border shrink-0">
          {/* Profile row */}
          <div className="flex items-center gap-3 px-2 py-2 rounded-lg
                          hover:bg-surface-active transition-colors duration-fast cursor-default">
            <div className="w-9 h-9 rounded-full bg-secondary/20 border border-secondary/40
                            flex items-center justify-center shrink-0">
              <span className="text-secondary text-sm font-bold">
                {getInitial(user)}
              </span>
            </div>
            <div className="flex flex-col flex-1 overflow-hidden">
              <span className="text-sm font-medium text-text-primary truncate">
                {user?.full_name ?? 'Guest'}
              </span>
              <span className="text-xs text-text-muted truncate">
                {user?.email ?? ''}
              </span>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="mt-2 w-full flex items-center justify-center gap-2
                       px-3 py-2 rounded-lg text-sm font-medium
                       text-text-muted border border-transparent
                       hover:text-accent-error hover:bg-accent-error/10 hover:border-accent-error/20
                       transition-all duration-fast"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            Sign out
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
