import React, { useState } from 'react';
import { Activity, Plus, Server, Code } from 'lucide-react';
import Button from '../ui/Button';
import CreateProjectModal from './CreateProjectModal';

const EmptyProjectState = ({ onCreate }) => {
  const [isCreating, setIsCreating] = useState(false);

  if (isCreating) {
    return (
       <div className="h-full flex flex-col items-center justify-center p-20">
          <CreateProjectModal 
             onClose={() => setIsCreating(false)} 
             currentOrg={{ name: 'Current Organization' }}
             onSuccess={(data) => {
                setIsCreating(false);
                if(onCreate) onCreate(data);
             }}
          />
       </div>
    );
  }

  return (
    <div className="h-full flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="relative mb-8 group">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-secondary/20 blur-[50px] rounded-full pointer-events-none transition-all duration-500 group-hover:bg-secondary/30 group-hover:w-40 group-hover:h-40"></div>
        <div className="relative w-20 h-20 bg-surface-active border border-border rounded-2xl flex items-center justify-center shadow-glass z-10 transition-transform duration-300 group-hover:scale-105">
          <Activity className="w-10 h-10 text-secondary" />
        </div>
        
        {/* Floating elements */}
        <div className="absolute -top-4 -right-4 w-8 h-8 bg-background border border-border-light rounded-lg flex items-center justify-center shadow-glass delay-100 transition-transform duration-300 group-hover:-translate-y-2 group-hover:translate-x-2 z-20">
          <Code className="w-4 h-4 text-primary" />
        </div>
      </div>

      <h2 className="text-2xl font-bold tracking-tight text-text-primary mb-3">No projects found</h2>
      <p className="text-text-secondary max-w-sm mx-auto mb-8">
        Your organization doesn't have any telemtry environments set up yet. Create one to obtain your API key and start tracing.
      </p>

      <Button onClick={() => setIsCreating(true)} size="lg" className="shadow-glow-primary">
        <Plus className="w-5 h-5 mr-2 -ml-1" /> Create Your First Project
      </Button>
    </div>
  );
};

export default EmptyProjectState;
