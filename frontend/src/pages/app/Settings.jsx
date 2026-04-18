import React, { useState } from 'react';
import { 
  ShieldCheck, Map, Users, Eye, EyeOff, Copy, 
  Trash2, RotateCw, CheckCircle2, AlertTriangle, Send,X
} from 'lucide-react';

const mockMembers = [
  { id: '1', name: 'Cassiopeia Vance', email: 'c.vance@lumina.io', role: 'owner', joined: '2023-10-12' },
  { id: '3', name: 'Mira Sol', email: 'm.sol@lumina.io', role: 'member', joined: '2024-01-20' },
  { id: '4', name: 'Aris Thorne', email: 'a.thorne@lumina.io', role: 'member', joined: '2024-02-15' },
];

const mockInvites = [
  { id: 'inv_1', email: 'jax.v@nebula.net', sentAt: '2 days ago' }
];

const DangerActionModal = ({ title, description, expectedText, confirmLabel, onClose, onConfirm }) => {
  const [inputText, setInputText] = useState('');
  
  const isMatch = inputText === expectedText;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isMatch) {
      onConfirm();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#0d1117] border border-[#7f1d1d] rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#ef4444]/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="flex justify-between items-center px-6 py-4 border-b border-[#2d333b] bg-[#450a0a]/30">
          <div className="flex items-center space-x-2">
             <AlertTriangle className="w-5 h-5 text-[#ef4444]" />
             <h2 className="text-white font-bold text-lg">{title}</h2>
          </div>
          <button onClick={onClose} className="p-2 ml-4 hover:bg-white/10 rounded-full transition-colors text-[#8b949e] hover:text-white">
             <X className="w-5 h-5"/>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5 bg-[#0a0c10]">
          <p className="text-sm text-[#fca5a5]">{description}</p>
          
          <div className="bg-[#11151c] border border-[#2d333b] p-4 rounded-lg">
             <label className="block text-xs font-mono text-[#8b949e] uppercase mb-2">
               Please type <strong className="text-white select-all">{expectedText}</strong> to verify.
             </label>
             <input 
                required
                type="text" 
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                className="w-full bg-[#0d1117] border border-[#2d333b] text-white font-mono text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#ef4444] transition-colors" 
             />
          </div>

          <div className="pt-4 flex justify-end space-x-3 border-t border-[#2d333b] pt-5 mt-2">
             <button type="button" onClick={onClose} className="px-5 py-2 text-sm text-[#8b949e] hover:text-white font-medium transition-colors">Cancel</button>
             <button 
               type="submit" 
               disabled={!isMatch}
               className={`px-6 py-2 text-sm font-semibold rounded-lg shadow-lg transition-all flex items-center ${isMatch ? 'bg-[#ef4444] hover:bg-[#dc2626] text-white cursor-pointer shadow-[0_0_15px_rgba(239,68,68,0.4)]' : 'bg-[#ef4444]/30 text-[#fca5a5]/50 cursor-not-allowed border border-[#ef4444]/20'}`}
             >
                {confirmLabel}
             </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile'); // profile | project | org
  const [previewRole, setPreviewRole] = useState('owner'); // 'owner' | 'member'
  
  // Tab 1 States
  const [pwdForm, setPwdForm] = useState({ current: '', next: '', confirm: '' });
  
  // Tab 2 States
  const maskedKey = "lu_live_********************************";
  const [activeDangerModal, setActiveDangerModal] = useState(null); // 'rotate' | 'delete' | null
  
  // Tab 3 States
  const [inviteEmail, setInviteEmail] = useState('');

  const handleInviteSubmit = (e) => {
    e.preventDefault();
    alert(`Invite sent to ${inviteEmail}`);
    setInviteEmail('');
  }

  const handlePwdSubmit = (e) => {
   e.preventDefault();
  }

  // Helper checks for RBAC rendering
  const canManageProject = previewRole === 'owner';
  const canDeleteProject = previewRole === 'owner';
  const canManageMembers = previewRole === 'owner';
  const canExpelMembers = previewRole === 'owner';

  return (
    <div className="w-full flex justify-center h-[calc(100vh-80px)] overflow-y-auto pb-10">
      <div className="w-full max-w-4xl px-2 pt-6">
         
         {/* Settings Header & Developer RBAC Toggle */}
         <div className="flex justify-between items-end mb-8 border-b border-[#2d333b] pb-6">
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Settings</h1>
              <p className="text-sm text-[#8b949e]">Manage your profile, project configuration, and organization members.</p>
            </div>
            
            {/* Developer RBAC Preview Tester */}
            <div className="bg-[#11151c] border border-[#2d333b] p-2 rounded-xl flex items-center space-x-2 shrink-0 shadow-lg relative overflow-hidden">
               <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-[#818cf8] to-transparent"></div>
               <span className="text-[10px] font-mono uppercase text-[#8b949e] px-2 pl-3">Simulate Role:</span>
               <select 
                  value={previewRole} 
                  onChange={(e) => setPreviewRole(e.target.value)}
                  className="bg-[#161b22] border border-[#2d333b] text-[#fca5a5] text-xs font-bold rounded px-3 py-1.5 focus:outline-none appearance-none cursor-pointer"
               >
                  <option value="owner">OWNER</option>
                  <option value="member">MEMBER</option>
               </select>
            </div>
         </div>

         {/* Navigation Pills */}
         <div className="flex space-x-2 mb-8 bg-[#11151c] p-2 rounded-xl border border-white/5 inline-flex">
            <button 
              onClick={() => setActiveTab('profile')}
              className={`px-6 py-2.5 rounded-lg text-sm font-bold flex items-center transition-all ${activeTab === 'profile' ? 'bg-[#a5b4fc]/10 text-[#a5b4fc]' : 'text-[#8b949e] hover:text-[#c9d1d9] hover:bg-[#161b22]'}`}
            >
              <ShieldCheck className="w-4 h-4 mr-2"/> Profile Security
            </button>
            <button 
              onClick={() => setActiveTab('project')}
              className={`px-6 py-2.5 rounded-lg text-sm font-bold flex items-center transition-all ${activeTab === 'project' ? 'bg-[#a5b4fc]/10 text-[#a5b4fc]' : 'text-[#8b949e] hover:text-[#c9d1d9] hover:bg-[#161b22]'}`}
            >
              <Map className="w-4 h-4 mr-2"/> Project Configuration
            </button>
            <button 
              onClick={() => setActiveTab('org')}
              className={`px-6 py-2.5 rounded-lg text-sm font-bold flex items-center transition-all ${activeTab === 'org' ? 'bg-[#a5b4fc]/10 text-[#a5b4fc]' : 'text-[#8b949e] hover:text-[#c9d1d9] hover:bg-[#161b22]'}`}
            >
              <Users className="w-4 h-4 mr-2"/> Organization Members
            </button>
         </div>

         {/* TAB 1: Profile & Security */}
         {activeTab === 'profile' && (
           <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
               <div className="bg-[#11151c] border border-[#2d333b] rounded-xl p-8 shadow-sm relative overflow-hidden mb-8">
                  <div className="absolute -top-10 -right-10 w-48 h-48 bg-[#a5b4fc]/5 rounded-full blur-3xl point-events-none"></div>
                  
                  <h3 className="text-lg font-bold text-white mb-6">Profile Settings</h3>
                  <div className="grid grid-cols-2 gap-8 mb-8">
                     <div>
                        <label className="block text-xs font-mono text-[#8b949e] uppercase mb-1">Email Address</label>
                        <div className="text-white bg-[#0d1117] border border-[#2d333b] px-4 py-2.5 rounded-lg opacity-80 cursor-not-allowed">c.vance@lumina.io</div>
                     </div>
                     <div>
                        <label className="block text-xs font-mono text-[#8b949e] uppercase mb-1">Full Name</label>
                        <div className="text-white bg-[#0d1117] border border-[#2d333b] px-4 py-2.5 rounded-lg opacity-80 cursor-not-allowed">Cassiopeia Vance</div>
                     </div>
                  </div>

                  <hr className="border-[#2d333b] mb-8" />

                  <h3 className="text-lg font-bold text-white mb-6">Change Password</h3>
                  <form className="space-y-5 max-w-sm" onSubmit={handlePwdSubmit}>
                     <div>
                        <label className="block text-xs font-mono text-[#8b949e] uppercase mb-1">Current Password</label>
                        <input required type="password" value={pwdForm.current} onChange={e=>setPwdForm({...pwdForm, current: e.target.value})} className="w-full bg-[#0d1117] border border-[#2d333b] text-white text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#a5b4fc] transition-colors" />
                     </div>
                     <div>
                        <label className="block text-xs font-mono text-[#8b949e] uppercase mb-1">New Secure Password</label>
                        <input required type="password" value={pwdForm.next} onChange={e=>setPwdForm({...pwdForm, next: e.target.value})} className="w-full bg-[#0d1117] border border-[#2d333b] text-white text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#a5b4fc] transition-colors" />
                     </div>
                     <div>
                        <label className="block text-xs font-mono text-[#8b949e] uppercase mb-1">Confirm Target Password</label>
                        <input required type="password" value={pwdForm.confirm} onChange={e=>setPwdForm({...pwdForm, confirm: e.target.value})} className="w-full bg-[#0d1117] border border-[#2d333b] text-white text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#a5b4fc] transition-colors" />
                     </div>
                     <button type="button" onClick={() => alert("Password Updated")} className="px-6 py-2.5 bg-gradient-to-r from-[#818cf8] to-[#c084fc] hover:opacity-90 text-white font-semibold rounded-lg shadow-[0_0_20px_rgba(129,140,248,0.2)] transition-all">
                        Update Password
                     </button>
                  </form>
               </div>
           </div>
         )}


         {/* TAB 2: Project Architecture */}
         {activeTab === 'project' && (
           <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
               
               {/* Project Details */}
               <div className="bg-[#11151c] border border-[#2d333b] rounded-xl p-8 shadow-sm">
                  <h3 className="text-lg font-bold text-white mb-6">Project Metadata</h3>
                  <div className="grid grid-cols-2 gap-8">
                     <div>
                        <label className="block text-xs font-mono text-[#8b949e] uppercase mb-2">Project Name</label>
                        <input 
                           type="text" 
                           defaultValue="Project Alpha" 
                           readOnly={!canManageProject}
                           className={`w-full bg-[#0d1117] border border-[#2d333b] text-white text-sm rounded-lg px-4 py-2.5 focus:outline-none transition-colors ${canManageProject ? 'focus:border-[#a5b4fc]' : 'opacity-70 cursor-not-allowed'}`} 
                        />
                     </div>
                     <div>
                        <label className="block text-xs font-mono text-[#8b949e] uppercase mb-2">Project ID</label>
                        <div className="text-[#8b949e] font-mono text-sm bg-[#0d1117] border border-transparent px-4 py-2.5 rounded-lg opacity-80 cursor-not-allowed select-all">
                           prj_9x2bV4NmQpLw
                        </div>
                     </div>
                  </div>
                  {canManageProject && (
                     <div className="mt-6 flex justify-end">
                        <button className="px-5 py-2 inline-flex border border-[#2d333b] hover:bg-[#161b22] text-white text-xs font-bold uppercase rounded-lg transition-colors">
                           Save Changes
                        </button>
                     </div>
                  )}
               </div>

               {/* API Secrets */}
               <div className="bg-[#11151c] border border-[#2d333b] rounded-xl p-8 shadow-sm">
                  <div className="flex items-center space-x-3 mb-2">
                     <h3 className="text-lg font-bold text-white">SDK API Key</h3>
                  </div>
                  <p className="text-sm text-[#8b949e] mb-6 max-w-2xl">
                     For security reasons, your API key is only shown during initial project creation. If you have lost it, you must generate a new one using the Rotation tool below.
                  </p>
                  
                  <div className="flex space-x-3 items-center">
                     <div className="relative flex-1 max-w-lg">
                        <input 
                           type="text"
                           readOnly
                           value={maskedKey}
                           className="w-full bg-[#0d1117] border border-[#2d333b] opacity-60 text-white font-mono text-sm rounded-lg px-4 py-3 cursor-not-allowed"
                        />
                     </div>
                  </div>
               </div>

               {/* Red Zone (RBAC Protected) */}
               {canManageProject && (
                 <div className="border border-[#7f1d1d] bg-[#450a0a]/30 rounded-xl p-8 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#ef4444]/10 rounded-full blur-3xl"></div>
                    <div className="flex items-center space-x-2 mb-2">
                       <AlertTriangle className="w-5 h-5 text-[#ef4444]" />
                       <h3 className="text-lg font-bold text-[#fca5a5]">Danger Zone</h3>
                    </div>
                    <p className="text-sm text-[#f87171] mb-6 max-w-xl">Destructive system actions that immediately impact the project.</p>
                    
                    <div className="space-y-4">
                       <div className="flex items-center justify-between p-4 border border-[#7f1d1d]/50 bg-[#450a0a]/50 rounded-lg">
                          <div>
                             <h4 className="text-white font-bold text-sm">Rotate API Key</h4>
                             <p className="text-xs text-[#8b949e]">Invalidates the current key. You will need to update all your services.</p>
                          </div>
                          <button 
                            onClick={() => setActiveDangerModal('rotate')}
                            className="px-5 py-2 inline-flex items-center bg-[#ef4444]/10 hover:bg-[#ef4444]/20 border border-[#ef4444] text-[#ef4444] text-xs font-bold uppercase rounded-lg transition-colors"
                          >
                             <RotateCw className="w-3.5 h-3.5 mr-2" /> Rotate Key
                          </button>
                       </div>

                       {canDeleteProject && (
                         <div className="flex items-center justify-between p-4 border border-[#7f1d1d]/50 bg-[#450a0a]/50 rounded-lg">
                            <div>
                               <h4 className="text-white font-bold text-sm">Delete Project</h4>
                               <p className="text-xs text-[#8b949e]">Permanently deletes the project and all associated logs and metrics.</p>
                            </div>
                            <button 
                              onClick={() => setActiveDangerModal('delete')}
                              className="px-5 py-2 inline-flex items-center bg-[#ef4444] hover:bg-[#dc2626] border border-[#ef4444] text-white shadow-[0_0_15px_rgba(239,68,68,0.4)] text-xs font-bold uppercase rounded-lg transition-all"
                            >
                               <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete Project
                            </button>
                         </div>
                       )}
                    </div>
                 </div>
               )}
           </div>
         )}


         {/* TAB 3: Org base */}
         {activeTab === 'org' && (
           <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
               
               {/* Invite UI (RBAC) */}
               {canManageMembers && (
                 <div className="bg-[#11151c] border border-[#2d333b] rounded-xl p-8 shadow-sm">
                    <h3 className="text-lg font-bold text-white mb-2">Invite Members</h3>
                    <p className="text-sm text-[#8b949e] mb-6">Send email invitations to add users to your organization. They will join as members.</p>
                    
                    <form onSubmit={handleInviteSubmit} className="flex space-x-3 items-center max-w-2xl">
                       <input 
                          required
                          type="email" 
                          placeholder="colleague@domain.com"
                          value={inviteEmail}
                          onChange={e=>setInviteEmail(e.target.value)}
                          className="flex-1 bg-[#0d1117] border border-[#2d333b] text-white text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#a5b4fc] transition-colors" 
                       />
                       <button type="submit" className="px-5 py-2.5 bg-white text-black hover:bg-gray-200 font-bold rounded-lg transition-colors flex items-center text-sm shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                          <Send className="w-4 h-4 mr-2" /> Send Invite
                       </button>
                    </form>

                    {mockInvites.length > 0 && (
                      <div className="mt-8">
                         <h4 className="text-xs font-mono text-[#8b949e] uppercase mb-3">Pending Invites</h4>
                         <div className="space-y-2">
                           {mockInvites.map(inv => (
                              <div key={inv.id} className="flex items-center justify-between p-3 border border-[#2d333b] bg-[#161b22] rounded-lg">
                                 <div className="text-sm font-mono text-white opacity-80">{inv.email}</div>
                                 <div className="flex items-center space-x-4">
                                    <span className="text-[10px] text-[#8b949e] uppercase tracking-wider">{inv.sentAt}</span>
                                    <button className="text-[10px] text-[#fca5a5] hover:text-[#ef4444] font-bold uppercase transition-colors">Revoke</button>
                                 </div>
                              </div>
                           ))}
                         </div>
                      </div>
                    )}
                 </div>
               )}

               {/* Member Directory */}
               <div className="bg-[#11151c] border border-[#2d333b] rounded-xl overflow-hidden shadow-sm">
                  <div className="px-6 py-5 border-b border-[#2d333b] flex justify-between items-center bg-[#161b22]">
                     <h3 className="text-lg font-bold text-white">Active Members</h3>
                     <span className="px-2 py-1 bg-white/5 border border-white/10 rounded-full font-mono text-[10px] text-[#c9d1d9] tracking-wider">{mockMembers.length} MEMBERS</span>
                  </div>
                  
                  <div className="w-full">
                     <div className="w-full border-b border-[#2d333b] px-6 py-3 flex text-[10px] font-mono tracking-widest text-[#8b949e] uppercase bg-[#0d1117]">
                        <div className="w-[40%]">Member Name</div>
                        <div className="w-[30%]">Access Level</div>
                        <div className="w-[15%]">Join Date</div>
                        <div className="w-[15%] text-right pr-2">Action</div>
                     </div>

                     {mockMembers.map(member => {
                        const isOwner = member.role === 'owner';
                        return (
                          <div key={member.id} className="w-full px-6 py-4 flex items-center border-b border-white/5 hover:bg-[#161b22] transition-colors">
                             <div className="w-[40%]">
                                <h4 className="text-white text-sm font-bold flex items-center">
                                   {member.name} {isOwner && <ShieldCheck className="w-3.5 h-3.5 ml-2 text-[#818cf8]" />}
                                </h4>
                                <p className="text-xs font-mono text-[#8b949e] mt-0.5">{member.email}</p>
                             </div>
                             <div className="w-[30%]">
                                <span className={`px-2.5 py-1 text-[10px] font-bold tracking-wider rounded uppercase border ${isOwner ? 'bg-[#818cf8]/10 text-[#a5b4fc] border-[#818cf8]/20' : 'bg-white/5 text-[#8b949e] border-white/10'}`}>
                                  {member.role}
                                </span>
                             </div>
                             <div className="w-[15%] font-mono text-xs text-[#8b949e]">
                                {member.joined}
                             </div>
                             <div className="w-[15%] flex justify-end">
                                {canExpelMembers && !isOwner && (
                                   <button className="p-1.5 text-[#8b949e] hover:text-[#ef4444] hover:bg-[#ef4444]/10 rounded transition-colors">
                                      <Trash2 className="w-4 h-4" />
                                   </button>
                                )}
                             </div>
                          </div>
                        )
                     })}
                  </div>
               </div>
           </div>
         )}
         
      </div>

      {/* Dynamic Danger Modals */}
      {activeDangerModal === 'rotate' && (
         <DangerActionModal 
            title="Rotate API Key"
            description="Warning: Rotating the SDK API Key will instantly fail ingestion for all currently deployed microservices using the old key. Proceed carefully."
            expectedText="ROTATE"
            confirmLabel="Force Rotate Key"
            onClose={() => setActiveDangerModal(null)}
            onConfirm={() => {
              alert("Wait implicitly for new key delivery: lu_live_newKey...");
              setActiveDangerModal(null);
            }}
         />
      )}

      {activeDangerModal === 'delete' && (
         <DangerActionModal 
            title="Delete Project: Project Alpha"
            description="Caution: Project Alpha and all of its metric telemetry, logs, and alert rules will be permanently eradicated. This action cannot be undone."
            expectedText="Project Alpha"
            confirmLabel="Permanently Delete"
            onClose={() => setActiveDangerModal(null)}
            onConfirm={() => {
              alert("Project 'Project Alpha' Obliterated!");
              setActiveDangerModal(null);
            }}
         />
      )}

    </div>
  );
};

export default Settings;
