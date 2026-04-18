import React, { useState } from 'react';
import { Server, X, Key, Copy, AlertTriangle } from 'lucide-react';

const CreateProjectModal = ({ onClose, onSuccess, currentOrg }) => {
  const [step, setStep] = useState(1);
  const [projectName, setProjectName] = useState('');
  const [generatedKey, setGeneratedKey] = useState('');

  const handleGenerate = (e) => {
    e.preventDefault();
    if (!projectName.trim()) return;
    
    // Simulate Backend API Key Creation
    const newKey = `lu_live_${Math.random().toString(36).substr(2, 9)}${Math.random().toString(36).substr(2, 9)}`;
    setGeneratedKey(newKey);
    setStep(2);
  };

  const handleDone = () => {
    // Pass the newly created workspace up to the system tree
    onSuccess({ id: `proj_${Math.random().toString(36).substr(2, 9)}`, name: projectName });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#0d1117] border border-[#2d333b] rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col relative">
        
        <div className="flex justify-between items-center px-6 py-4 border-b border-[#2d333b] bg-[#161b22]">
          <div className="flex items-center space-x-2">
             {step === 1 ? <Server className="w-5 h-5 text-[#818cf8]" /> : <Key className="w-5 h-5 text-[#10b981]" />}
             <h2 className="text-white font-bold text-lg">{step === 1 ? 'New Workspace' : 'Credentials Generated'}</h2>
          </div>
          {step === 1 && (
            <button onClick={onClose} className="p-2 ml-4 hover:bg-white/10 rounded-full transition-colors text-[#8b949e] hover:text-white">
              <X className="w-5 h-5"/>
            </button>
          )}
        </div>
        
        {step === 1 ? (
          <form onSubmit={handleGenerate} className="p-6 space-y-5 bg-[#0a0c10]">
            <p className="text-sm text-[#8b949e]">Deploying inside <strong className="text-white">{currentOrg?.name || 'Local Org'}</strong>. A dedicated Ingestion API key will be generated.</p>
            
            <div className="space-y-2">
               <label className="block text-xs font-mono text-[#8b949e] uppercase mb-1">
                 Workspace Target Name <span className="text-[#ef4444]">*</span>
               </label>
               <input 
                  autoFocus
                  required
                  type="text" 
                  placeholder="e.g. Production Billing Cluster"
                  value={projectName}
                  onChange={e => setProjectName(e.target.value)}
                  className="w-full bg-[#11151c] border border-[#2d333b] text-white font-mono text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#818cf8] transition-colors" 
               />
            </div>

            <div className="pt-4 flex justify-end space-x-3 border-t border-[#2d333b]">
               <button type="button" onClick={onClose} className="px-5 py-2 text-sm text-[#8b949e] hover:text-white font-medium transition-colors">Cancel</button>
               <button 
                 type="submit" 
                 disabled={!projectName.trim()}
                 className={`px-6 py-2 text-sm font-semibold rounded-lg shadow-lg transition-all flex items-center ${projectName.trim() ? 'bg-gradient-to-r from-[#818cf8] to-[#c084fc] text-white shadow-[0_0_15px_rgba(129,140,248,0.4)] hover:opacity-90' : 'bg-[#2d333b] text-[#8b949e] cursor-not-allowed'}`}
               >
                  Generate Credentials
               </button>
            </div>
          </form>
        ) : (
          <div className="p-6 space-y-6 bg-[#0a0c10]">
            <div className="flex items-start space-x-3 bg-[#451a03]/50 border border-[#78350f] p-4 rounded-lg">
               <AlertTriangle className="w-5 h-5 text-[#f59e0b] shrink-0 mt-0.5" />
               <div className="space-y-1">
                  <h4 className="text-sm font-bold text-[#fdba74]">Deploy this key immediately</h4>
                  <p className="text-xs text-[#fca5a5]/80">This is the exclusive ingest key for <strong className="text-white">{projectName}</strong>. For security integrity, it will never be displayed in plain-text again. Use this identical key across all microservices running inside this workspace.</p>
               </div>
            </div>

            <div className="space-y-2">
               <label className="block text-xs font-mono text-[#8b949e] uppercase mb-1">
                 Ingestion API Key
               </label>
               <div className="flex items-center space-x-2">
                 <input 
                    readOnly
                    type="text" 
                    value={generatedKey}
                    className="flex-1 bg-[#11151c] border border-[#065f46] text-[#34d399] font-mono text-sm rounded-lg px-4 py-2.5 focus:outline-none selection:bg-[#065f46]" 
                 />
                 <button 
                   onClick={() => navigator.clipboard.writeText(generatedKey)}
                   className="p-2.5 bg-[#11151c] border border-[#2d333b] hover:bg-[#161b22] hover:border-[#818cf8] text-[#8b949e] hover:text-[#818cf8] rounded-lg transition-colors"
                 >
                   <Copy className="w-5 h-5" />
                 </button>
               </div>
            </div>

            <div className="pt-2 flex justify-end border-t border-[#2d333b]">
               <button 
                 onClick={handleDone}
                 className="px-6 py-2 w-full text-sm font-bold rounded-lg shadow-lg bg-[#10b981] hover:bg-[#059669] text-white shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all"
               >
                  I have deployed the key
               </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateProjectModal;
