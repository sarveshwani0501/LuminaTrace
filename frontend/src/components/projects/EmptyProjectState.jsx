// import React from 'react';
// import { Activity, Plus, Code } from 'lucide-react';

// const EmptyProjectState = ({ onCreateClick }) => {
//   return (
//     <div className="h-full flex flex-col items-center justify-center py-20 px-4 text-center">
//       <div className="relative mb-8 group">
//         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-secondary/20 blur-[50px] rounded-full pointer-events-none" />
//         <div className="relative w-20 h-20 bg-surface-active border border-border rounded-2xl flex items-center justify-center shadow-glass z-10">
//           <Activity className="w-10 h-10 text-secondary" />
//         </div>
//         <div className="absolute -top-4 -right-4 w-8 h-8 bg-background border border-border-light rounded-lg flex items-center justify-center shadow-glass z-20">
//           <Code className="w-4 h-4 text-primary" />
//         </div>
//       </div>

//       <h2 className="text-2xl font-bold tracking-tight text-text-primary mb-3">No projects yet</h2>
//       <p className="text-text-secondary max-w-sm mx-auto mb-8">
//         Create your first workspace to get an API key and start sending telemetry data.
//       </p>

//       <button
//         onClick={onCreateClick}
//         className="flex items-center gap-2 px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover transition-colors shadow-glow-primary"
//       >
//         <Plus className="w-5 h-5" />
//         Create Your First Project
//       </button>
//     </div>
//   );
// };

// export default EmptyProjectState;


import React from 'react';
import { Activity, Plus, Code } from 'lucide-react';
import Button from '../ui/Button';

const EmptyProjectState = ({ onCreateClick }) => {
  return (
    <div className="h-full flex flex-col items-center justify-center py-20 px-4 text-center">

      {/* Icon cluster */}
      <div className="relative mb-8">
        {/* Ambient glow */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-32 h-32 bg-secondary/20 blur-[50px] rounded-full" />
        </div>

        {/* Main icon */}
        <div className="relative w-20 h-20 bg-surface-active border border-border rounded-2xl
                        flex items-center justify-center shadow-glass z-10">
          <Activity className="w-10 h-10 text-secondary" />
        </div>

        {/* Floating badge */}
        <div className="absolute -top-3 -right-3 w-8 h-8 bg-surface border border-border-light
                        rounded-lg flex items-center justify-center shadow-glass z-20">
          <Code className="w-4 h-4 text-primary" />
        </div>
      </div>

      {/* Copy */}
      <h2 className="text-xl font-semibold text-text-primary mb-2">
        No workspaces yet
      </h2>
      <p className="text-sm text-text-secondary max-w-xs mx-auto mb-8 leading-relaxed">
        Create your first workspace to get an API key and start sending telemetry data.
      </p>

      <Button
        variant="primary"
        size="md"
        icon={<Plus className="w-4 h-4" />}
        onClick={onCreateClick}
      >
        Create First Workspace
      </Button>
    </div>
  );
};

export default EmptyProjectState;