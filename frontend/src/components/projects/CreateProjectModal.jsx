// import React, { useState } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { Server, X, Key, Copy, AlertTriangle, Loader2, CheckCircle } from 'lucide-react';
// import { createProject, setCurrentProject } from '../../store/slices/projectSlice';

// const CreateProjectModal = ({ onClose, onSuccess, currentOrg }) => {
//   const dispatch = useDispatch();
//   const { currentOrg: storeOrg } = useSelector(state => state.org);
  
//   // Use prop org if provided, otherwise fall back to store
//   const org = currentOrg || storeOrg;

//   const [step, setStep] = useState(1); // 1 = form, 2 = api key reveal
//   const [projectName, setProjectName] = useState('');
//   const [description, setDescription] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [generatedKey, setGeneratedKey] = useState('');
//   const [createdProject, setCreatedProject] = useState(null);
//   const [copied, setCopied] = useState(false);

//   const handleCreate = async (e) => {
//     e.preventDefault();
//     if (!projectName.trim()) return;
//     if (!org?.id) {
//       setError('No organization selected. Please refresh and try again.');
//       return;
//     }

//     setIsLoading(true);
//     setError(null);

//     try {
//       const result = await dispatch(createProject({
//         orgId: org.id,
//         projectData: { name: projectName.trim(), description: description.trim() || undefined }
//       })).unwrap();

//       // result contains the real project with plaintext api_key (one-time only!)
//       setCreatedProject(result);
//       setGeneratedKey(result.api_key);
//       setStep(2);

//       if (onSuccess) onSuccess(result);
//     } catch (err) {
//       setError(err || 'Failed to create project. Please try again.');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleCopy = () => {
//     navigator.clipboard.writeText(generatedKey);
//     setCopied(true);
//     setTimeout(() => setCopied(false), 2000);
//   };

//   const handleDone = () => {
//     // Only NOW transition to the dashboard — after user has confirmed they saved the key
//     if (createdProject) {
//       dispatch(setCurrentProject(createdProject));
//     }
//     onClose();
//   };

//   return (
//     <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
//       <div className="bg-[#0d1117] border border-[#2d333b] rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col relative">
        
//         {/* Header */}
//         <div className="flex justify-between items-center px-6 py-4 border-b border-[#2d333b] bg-[#161b22]">
//           <div className="flex items-center space-x-2">
//             {step === 1 ? <Server className="w-5 h-5 text-[#818cf8]" /> : <Key className="w-5 h-5 text-[#10b981]" />}
//             <h2 className="text-white font-bold text-lg">
//               {step === 1 ? 'New Workspace' : 'Credentials Generated'}
//             </h2>
//           </div>
//           {step === 1 && (
//             <button onClick={onClose} className="p-2 ml-4 hover:bg-white/10 rounded-full transition-colors text-[#8b949e] hover:text-white">
//               <X className="w-5 h-5"/>
//             </button>
//           )}
//         </div>
        
//         {/* Step 1: Name form */}
//         {step === 1 ? (
//           <form onSubmit={handleCreate} className="p-6 space-y-5 bg-[#0a0c10]">
//             <p className="text-sm text-[#8b949e]">
//               Creating workspace inside <strong className="text-white">{org?.name || 'your organization'}</strong>. 
//               A dedicated Ingestion API key will be generated.
//             </p>

//             {error && (
//               <div className="flex items-start space-x-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
//                 <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
//                 <p className="text-xs text-red-400">{error}</p>
//               </div>
//             )}
            
//             <div className="space-y-2">
//               <label className="block text-xs font-mono text-[#8b949e] uppercase mb-1">
//                 Workspace Name <span className="text-[#ef4444]">*</span>
//               </label>
//               <input 
//                 autoFocus
//                 required
//                 type="text" 
//                 placeholder="e.g. Production Billing Cluster"
//                 value={projectName}
//                 onChange={e => setProjectName(e.target.value)}
//                 className="w-full bg-[#11151c] border border-[#2d333b] text-white font-mono text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#818cf8] transition-colors" 
//               />
//             </div>

//             <div className="space-y-2">
//               <label className="block text-xs font-mono text-[#8b949e] uppercase mb-1">
//                 Description <span className="text-[#8b949e] font-normal normal-case font-sans">(optional)</span>
//               </label>
//               <textarea 
//                 rows={2}
//                 placeholder="What does this workspace monitor?"
//                 value={description}
//                 onChange={e => setDescription(e.target.value)}
//                 className="w-full bg-[#11151c] border border-[#2d333b] text-white text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#818cf8] transition-colors resize-none" 
//               />
//             </div>

//             <div className="pt-4 flex justify-end space-x-3 border-t border-[#2d333b]">
//               <button type="button" onClick={onClose} className="px-5 py-2 text-sm text-[#8b949e] hover:text-white font-medium transition-colors">
//                 Cancel
//               </button>
//               <button 
//                 type="submit" 
//                 disabled={!projectName.trim() || isLoading}
//                 className={`px-6 py-2 text-sm font-semibold rounded-lg shadow-lg transition-all flex items-center gap-2 ${
//                   projectName.trim() && !isLoading 
//                     ? 'bg-gradient-to-r from-[#818cf8] to-[#c084fc] text-white shadow-[0_0_15px_rgba(129,140,248,0.4)] hover:opacity-90' 
//                     : 'bg-[#2d333b] text-[#8b949e] cursor-not-allowed'
//                 }`}
//               >
//                 {isLoading ? (
//                   <>
//                     <Loader2 className="w-4 h-4 animate-spin" />
//                     Creating...
//                   </>
//                 ) : 'Generate Credentials'}
//               </button>
//             </div>
//           </form>
//         ) : (
//           /* Step 2: API Key reveal */
//           <div className="p-6 space-y-6 bg-[#0a0c10]">
//             {/* Success header */}
//             <div className="flex items-center space-x-3 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
//               <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
//               <div>
//                 <p className="text-sm font-semibold text-emerald-300">{createdProject?.name} created successfully!</p>
//                 <p className="text-xs text-emerald-400/70">Your workspace is ready to receive telemetry.</p>
//               </div>
//             </div>

//             {/* Warning */}
//             <div className="flex items-start space-x-3 bg-amber-500/10 border border-amber-500/20 p-4 rounded-lg">
//               <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
//               <div className="space-y-1">
//                 <h4 className="text-sm font-bold text-amber-300">Copy this key now</h4>
//                 <p className="text-xs text-amber-400/80">
//                   This API key is shown <strong className="text-white">only once</strong> for security reasons. 
//                   Use this same key across all microservices inside <strong className="text-white">{createdProject?.name}</strong>.
//                 </p>
//               </div>
//             </div>

//             {/* API Key */}
//             <div className="space-y-2">
//               <label className="block text-xs font-mono text-[#8b949e] uppercase mb-1">
//                 Ingestion API Key
//               </label>
//               <div className="flex items-center space-x-2">
//                 <input 
//                   readOnly
//                   type="text" 
//                   value={generatedKey}
//                   className="flex-1 bg-[#11151c] border border-[#065f46] text-[#34d399] font-mono text-xs rounded-lg px-4 py-2.5 focus:outline-none selection:bg-[#065f46]" 
//                 />
//                 <button 
//                   onClick={handleCopy}
//                   className={`p-2.5 border rounded-lg transition-all ${
//                     copied 
//                       ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' 
//                       : 'bg-[#11151c] border-[#2d333b] hover:bg-[#161b22] hover:border-[#818cf8] text-[#8b949e] hover:text-[#818cf8]'
//                   }`}
//                 >
//                   {copied ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
//                 </button>
//               </div>
//               <p className="text-xs text-[#8b949e] font-mono">
//                 Preview stored: <span className="text-[#8b949e]">{createdProject?.api_key_preview || generatedKey?.substring(0, 12)}...</span>
//               </p>
//             </div>

//             <div className="pt-2 flex justify-end border-t border-[#2d333b]">
//               <button 
//                 onClick={handleDone}
//                 className="px-6 py-2 w-full text-sm font-bold rounded-lg shadow-lg bg-[#10b981] hover:bg-[#059669] text-white shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all"
//               >
//                 I've saved the key — Go to Dashboard
//               </button>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default CreateProjectModal;


import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Server, X, Key, Copy, AlertTriangle, CheckCircle } from 'lucide-react';
import { createProject, setCurrentProject } from '../../store/slices/projectSlice';
import Button from '../ui/Button';
import Input from '../ui/Input';

const CreateProjectModal = ({ onClose, onSuccess, currentOrg }) => {
  const dispatch = useDispatch();
  const { currentOrg: storeOrg } = useSelector(state => state.org);
  const org = currentOrg || storeOrg;

  const [step, setStep] = useState(1);
  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [generatedKey, setGeneratedKey] = useState('');
  const [createdProject, setCreatedProject] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!projectName.trim()) return;
    if (!org?.id) {
      setError('No organization selected. Please refresh and try again.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await dispatch(createProject({
        orgId: org.id,
        projectData: {
          name: projectName.trim(),
          description: description.trim() || undefined
        }
      })).unwrap();

      setCreatedProject(result);
      setGeneratedKey(result.api_key);
      setStep(2);
      if (onSuccess) onSuccess(result);
    } catch (err) {
      setError(err || 'Failed to create project. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDone = () => {
    if (createdProject) dispatch(setCurrentProject(createdProject));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-surface border border-border rounded-card shadow-elevated w-full max-w-md overflow-hidden flex flex-col relative">

        {/* Ambient glow */}
        <div className={`absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl pointer-events-none transition-colors duration-slow
          ${step === 2 ? 'bg-accent-success/10' : 'bg-primary/10'}`}
        />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-md border flex items-center justify-center transition-colors duration-slow
              ${step === 2
                ? 'bg-accent-success/15 border-accent-success/30'
                : 'bg-primary/15 border-primary/30'
              }`}
            >
              {step === 1
                ? <Server className="w-4 h-4 text-primary" />
                : <Key className="w-4 h-4 text-accent-success" />
              }
            </div>
            <h2 className="text-base font-semibold text-text-primary">
              {step === 1 ? 'New Workspace' : 'Credentials Generated'}
            </h2>
          </div>
          {step === 1 && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-md text-text-muted hover:text-text-primary hover:bg-surface-active transition-colors duration-fast"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* ── Step 1: Form ── */}
        {step === 1 ? (
          <form onSubmit={handleCreate} className="p-6 space-y-5">
            <p className="text-sm text-text-secondary">
              Creating workspace inside{' '}
              <span className="text-text-primary font-medium">{org?.name ?? 'your organization'}</span>.
              A dedicated Ingestion API key will be generated.
            </p>

            {error && (
              <div className="flex items-start gap-2.5 p-3 bg-accent-error/10 border border-accent-error/20 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-accent-error shrink-0 mt-0.5" />
                <p className="text-xs text-accent-error">{error}</p>
              </div>
            )}

            <Input
              autoFocus
              required
              label="Workspace Name"
              placeholder="e.g. Production Billing Cluster"
              value={projectName}
              onChange={e => setProjectName(e.target.value)}
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-text-secondary tracking-wide">
                Description
                <span className="text-text-muted font-normal ml-1">(optional)</span>
              </label>
              <textarea
                rows={2}
                placeholder="What does this workspace monitor?"
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full rounded-md border border-border bg-background
                           text-sm text-text-primary placeholder:text-text-muted
                           px-3 py-2 resize-none
                           focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-transparent
                           hover:border-border-light transition-all duration-fast"
              />
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t border-border">
              <Button type="button" variant="ghost" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                loading={isLoading}
                disabled={!projectName.trim() || isLoading}
              >
                Generate Credentials
              </Button>
            </div>
          </form>

        ) : (
        /* ── Step 2: API Key reveal ── */
          <div className="p-6 space-y-5">

            {/* Success banner */}
            <div className="flex items-center gap-3 p-3 bg-accent-success/10 border border-accent-success/20 rounded-lg">
              <CheckCircle className="w-5 h-5 text-accent-success shrink-0" />
              <div>
                <p className="text-sm font-medium text-accent-success">
                  {createdProject?.name} created successfully
                </p>
                <p className="text-xs text-accent-success/70 mt-0.5">
                  Your workspace is ready to receive telemetry.
                </p>
              </div>
            </div>

            {/* One-time warning */}
            <div className="flex items-start gap-3 p-3 bg-accent-warning/10 border border-accent-warning/20 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-accent-warning shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="text-sm font-medium text-accent-warning">Copy this key now</p>
                <p className="text-xs text-text-secondary">
                  This key is shown <span className="text-text-primary font-medium">only once</span>.
                  Use it across all services inside{' '}
                  <span className="text-text-primary font-medium">{createdProject?.name}</span>.
                </p>
              </div>
            </div>

            {/* API Key field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-text-secondary tracking-wide">
                Ingestion API Key
              </label>
              <div className="flex items-center gap-2">
                <input
                  readOnly
                  type="text"
                  value={generatedKey}
                  className="flex-1 rounded-md border border-accent-success/30 bg-background
                             text-accent-success font-mono text-xs px-3 py-2.5
                             focus:outline-none select-all cursor-text"
                />
                <button
                  onClick={handleCopy}
                  className={`p-2.5 rounded-md border transition-all duration-fast
                    ${copied
                      ? 'bg-accent-success/15 border-accent-success/30 text-accent-success'
                      : 'bg-background border-border text-text-muted hover:border-primary/40 hover:text-primary hover:bg-primary/5'
                    }`}
                >
                  {copied
                    ? <CheckCircle className="w-4 h-4" />
                    : <Copy className="w-4 h-4" />
                  }
                </button>
              </div>
              <p className="text-[11px] text-text-muted font-mono">
                Stored preview:{' '}
                <span className="text-text-secondary">
                  {createdProject?.api_key_preview ?? generatedKey?.substring(0, 12)}...
                </span>
              </p>
            </div>

            {/* Done */}
            <div className="pt-2 border-t border-border">
              <Button
                variant="primary"
                size="md"
                className="w-full"
                onClick={handleDone}
              >
                I've saved the key — Go to Dashboard
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateProjectModal;