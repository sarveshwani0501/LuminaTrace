import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import Sidebar from './Sidebar';
import EmptyProjectState from '../projects/EmptyProjectState';
import CreateProjectModal from '../projects/CreateProjectModal';
import { fetchProjects } from '../../store/slices/projectSlice';

const PrivateLayout = () => {
  const dispatch = useDispatch();
  const { currentOrg } = useSelector(state => state.org);
  const { currentProject, isLoading, list } = useSelector(state => state.project);

  // Modal lives here — outside the conditional rendering area
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

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
        <div className="h-full flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
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
      <Sidebar onCreateProject={() => setShowCreateModal(true)} />

      <div className="flex-1 flex flex-col h-screen overflow-y-auto relative z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-48 bg-primary/5 blur-[120px] pointer-events-none -z-10" />
        <main className="flex-1 w-full relative px-4 md:px-8 py-8 md:py-10">
          {renderContent()}
        </main>
      </div>

      {/* Modal mounted here — never unmounted by content area changes */}
      {showCreateModal && (
        <CreateProjectModal
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </div>
  );
};

export default PrivateLayout;
