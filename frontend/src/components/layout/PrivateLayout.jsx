import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const PrivateLayout = () => {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto relative z-0">
        {/* Subtle top glow defining the app area header space */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-48 bg-primary/5 blur-[120px] pointer-events-none -z-10"></div>
        
        <main className="flex-1 w-full relative px-4 md:px-8 py-8 md:py-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default PrivateLayout;
