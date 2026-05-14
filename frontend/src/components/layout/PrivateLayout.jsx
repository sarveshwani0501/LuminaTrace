import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import Sidebar from './Sidebar';
import EmptyProjectState from '../projects/EmptyProjectState';
import CreateProjectModal from '../projects/CreateProjectModal';
import { fetchProjects } from '../../store/slices/projectSlice';

const PrivateLayout = () => {
  const dispatch = useDispatch();
  const { currentOrg }                        = useSelector(state => state.org);
  const { currentProject, isLoading, list }   = useSelector(state => state.project);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [hasFetched,      setHasFetched]      = useState(false);

  useEffect(() => {
    if (currentOrg?.id) {
      dispatch(fetchProjects(currentOrg.id)).finally(() => setHasFetched(true));
    } else {
      setHasFetched(true);
    }
  }, [currentOrg?.id, dispatch]);

  const renderContent = () => {
    if (!hasFetched || isLoading) {
      return (
        <div className="h-full flex flex-col items-center justify-center gap-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-mono text-text-muted">Loading workspace…</p>
        </div>
      );
    }
    if (list.length === 0 && !currentProject) {
      return <EmptyProjectState onCreateClick={() => setShowCreateModal(true)} />;
    }
    return <Outlet />;
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">

      {/* Sidebar — passes modal opener so the project switcher works */}
      <Sidebar onCreateProject={() => setShowCreateModal(true)} />

      {/* Content area */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto relative min-w-0">

        {/* Subtle ambient glow at top of content area */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-40 pointer-events-none -z-10"
          style={{ background: 'radial-gradient(ellipse at top, rgba(124,58,237,0.06) 0%, transparent 70%)' }}
        />

        <main className="flex-1 w-full relative px-5 md:px-8 py-8">
          {renderContent()}
        </main>
      </div>

      {/* Modal mounted at layout level — never unmounted by content changes */}
      {showCreateModal && (
        <CreateProjectModal onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  );
};

export default PrivateLayout;