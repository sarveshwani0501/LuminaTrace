import React, { useState } from 'react';
import { Building2, X } from 'lucide-react';

const CreateOrgModal = ({ onClose, onSuccess }) => {
  const [orgName, setOrgName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!orgName.trim()) return;
    
    // Simulate Backend Creation Phase
    console.log("Creating Organization:", orgName);
    
    // Fire Success Hook
    onSuccess({ id: `org_${Math.random().toString(36).substr(2, 9)}`, name: orgName, role: 'owner' });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#0d1117] border border-[#2d333b] rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#818cf8]/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="flex justify-between items-center px-6 py-4 border-b border-[#2d333b] bg-[#161b22]">
          <div className="flex items-center space-x-2">
             <Building2 className="w-5 h-5 text-[#818cf8]" />
             <h2 className="text-white font-bold text-lg">Create Organization</h2>
          </div>
          <button onClick={onClose} className="p-2 ml-4 hover:bg-white/10 rounded-full transition-colors text-[#8b949e] hover:text-white">
             <X className="w-5 h-5"/>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5 bg-[#0a0c10]">
          <p className="text-sm text-[#8b949e]">Initialize a master organizational node. You will automatically be assigned the <strong className="text-white">Owner</strong> role.</p>
          
          <div className="space-y-2">
             <label className="block text-xs font-mono text-[#8b949e] uppercase mb-1">
               Organization Name <span className="text-[#ef4444]">*</span>
             </label>
             <input 
                autoFocus
                required
                type="text" 
                placeholder="e.g. Stark Industries"
                value={orgName}
                onChange={e => setOrgName(e.target.value)}
                className="w-full bg-[#11151c] border border-[#2d333b] text-white font-mono text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#818cf8] transition-colors" 
             />
          </div>

          <div className="pt-4 flex justify-end space-x-3 border-t border-[#2d333b]">
             <button type="button" onClick={onClose} className="px-5 py-2 text-sm text-[#8b949e] hover:text-white font-medium transition-colors">Cancel</button>
             <button 
               type="submit" 
               disabled={!orgName.trim()}
               className={`px-6 py-2 text-sm font-semibold rounded-lg shadow-lg transition-all flex items-center ${orgName.trim() ? 'bg-gradient-to-r from-[#818cf8] to-[#c084fc] text-white shadow-[0_0_15px_rgba(129,140,248,0.4)] hover:opacity-90' : 'bg-[#2d333b] text-[#8b949e] cursor-not-allowed'}`}
             >
                Create Hub
             </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateOrgModal;
