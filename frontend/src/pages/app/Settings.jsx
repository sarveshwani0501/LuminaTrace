import React, { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  ShieldCheck, Map, Users, Eye, EyeOff, Copy, 
  Trash2, RotateCw, CheckCircle2, AlertTriangle, Send, X, Inbox
} from 'lucide-react';
import { authApi } from '../../api/auth';
import { projectApi } from '../../api/project';
import { orgApi } from '../../api/org';
// Assuming updates to names could trigger local redux refetches
import { fetchProjects } from '../../store/slices/projectSlice';
import { fetchOrganizations } from '../../store/slices/orgSlice';

// Reusable Empty State handler
const ListEmpty = ({ label }) => (
  <div className="w-full min-h-[200px] flex flex-col items-center justify-center text-center p-8 bg-[#161b22] border-t border-[#2d333b]">
    <Inbox className="w-10 h-10 text-[#4b5563] mb-3" />
    <p className="text-xs font-mono text-[#8b949e] tracking-wide">{label}</p>
  </div>
);

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
  const dispatch = useDispatch();
  const { currentOrg } = useSelector(state => state.org);
  const { currentProject } = useSelector(state => state.project);
  const { user } = useSelector(state => state.auth);

  const [activeTab, setActiveTab] = useState('profile'); // profile | project | org
  
  // Modals & Forms
  const [activeDangerModal, setActiveDangerModal] = useState(null); // 'rotate' | 'delete' | null
  const [pwdForm, setPwdForm] = useState({ current: '', next: '', confirm: '' });
  const [inviteEmail, setInviteEmail] = useState('');
  const [projectNameInput, setProjectNameInput] = useState('');
  
  // Org Members & Invites State
  const [members, setMembers] = useState([]);
  const [invites, setInvites] = useState([]);
  const [isLoadingOrgData, setIsLoadingOrgData] = useState(false);

  // Security
  const isOwner = currentOrg?.role === 'owner';
  const canManageProject = isOwner;
  const canDeleteProject = isOwner;
  const canManageMembers = isOwner;

  // Masking logic
  const renderApiKey = () => {
     if (!currentProject) return "lu_live_********************************";
     if (currentProject.api_key) return currentProject.api_key;
     return "lu_live_********************************";
  };

  useEffect(() => {
    if (currentProject) {
      setProjectNameInput(currentProject.name || '');
    }
  }, [currentProject]);

  const loadOrgData = useCallback(async () => {
    if (activeTab !== 'org' || !currentOrg) return;
    setIsLoadingOrgData(true);
    try {
      const [memRes, invRes] = await Promise.allSettled([
        orgApi.getMembers(currentOrg.id),
        isOwner ? orgApi.getInvites(currentOrg.id) : Promise.resolve({ data: { invites: [] }})
      ]);
      
      if (memRes.status === 'fulfilled') setMembers(memRes.value.data.organizationMembers || []);
      if (invRes.status === 'fulfilled') setInvites(Array.isArray(invRes.value.data) ? invRes.value.data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingOrgData(false);
    }
  }, [activeTab, currentOrg, isOwner]);

  useEffect(() => {
    loadOrgData();
  }, [loadOrgData]);


  // Handlers
  const handlePwdSubmit = async (e) => {
    e.preventDefault();
    if (pwdForm.next !== pwdForm.confirm) {
      alert("New passwords do not match.");
      return;
    }
    try {
      await authApi.changePassword({ oldPassword: pwdForm.current, newPassword: pwdForm.next });
      alert("Password successfully updated!");
      setPwdForm({ current: '', next: '', confirm: '' });
    } catch (err) {
      alert(err.response?.data?.message || err.response?.data?.error || "Failed to update password. Did you enter the correct current password?");
    }
  };

  const handleUpdateProjectName = async () => {
    if (!currentOrg || !currentProject || !projectNameInput) return;
    try {
      await projectApi.updateProject(currentOrg.id, currentProject.id, { name: projectNameInput });
      dispatch(fetchProjects(currentOrg.id)); // Reload projects
      alert("Project metadata saved successfully.");
    } catch (err) {
      alert("Error updating project name.");
    }
  };

  const handleRotateKey = async () => {
    try {
      await projectApi.rotateApiKey(currentOrg.id, currentProject.id);
      dispatch(fetchProjects(currentOrg.id));
      alert("API Key successfully rotated.");
      setActiveDangerModal(null);
    } catch (err) {
      alert("Error rotating API Key.");
    }
  };

  const handleDeleteProject = async () => {
    try {
      await projectApi.deleteProject(currentOrg.id, currentProject.id);
      alert(`Project ${currentProject.name} was successfully deleted.`);
      setActiveDangerModal(null);
      window.location.reload(); // Hard reset state
    } catch (err) {
      alert("Error deleting Project.");
    }
  };

  const handleInviteSubmit = async (e) => {
    e.preventDefault();
    if (!inviteEmail) return;
    try {
      await orgApi.createInvite(currentOrg.id, { email: inviteEmail, role: 'member' });
      setInviteEmail('');
      loadOrgData();
      alert('Invitation envelope dispatched successfully!');
    } catch (err) {
      alert(err.response?.data?.message || err.response?.data?.error || "Error sending invite.");
    }
  };

  const handleRevokeInvite = async (inviteId) => {
    try {
      await orgApi.deleteInvite(currentOrg.id, inviteId);
      loadOrgData();
    } catch (err) {
      alert("Failed to revoke invite.");
    }
  };

  const handleExpelMember = async (memberId) => {
    try {
      await orgApi.removeMember(currentOrg.id, memberId);
      loadOrgData();
    } catch (err) {
      alert("Failed to remove member.");
    }
  };

  return (
    <div className="w-full flex justify-center h-[calc(100vh-80px)] overflow-y-auto pb-10">
      <div className="w-full max-w-4xl px-2 pt-6">
         
         {/* Settings Header */}
         <div className="flex justify-between items-end mb-8 border-b border-[#2d333b] pb-6">
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Settings</h1>
              <p className="text-sm text-[#8b949e]">Manage your profile, project configuration, and organization members.</p>
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
            {currentProject && (
              <button 
                onClick={() => setActiveTab('project')}
                className={`px-6 py-2.5 rounded-lg text-sm font-bold flex items-center transition-all ${activeTab === 'project' ? 'bg-[#a5b4fc]/10 text-[#a5b4fc]' : 'text-[#8b949e] hover:text-[#c9d1d9] hover:bg-[#161b22]'}`}
              >
                <Map className="w-4 h-4 mr-2"/> Project Configuration
              </button>
            )}
            {currentOrg && (
              <button 
                onClick={() => setActiveTab('org')}
                className={`px-6 py-2.5 rounded-lg text-sm font-bold flex items-center transition-all ${activeTab === 'org' ? 'bg-[#a5b4fc]/10 text-[#a5b4fc]' : 'text-[#8b949e] hover:text-[#c9d1d9] hover:bg-[#161b22]'}`}
              >
                <Users className="w-4 h-4 mr-2"/> Organization Members
              </button>
            )}
         </div>

         {/* TAB 1: Profile & Security */}
         {activeTab === 'profile' && (
           <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
               <div className="bg-[#11151c] border border-[#2d333b] rounded-xl p-8 shadow-sm relative overflow-hidden mb-8">
                  <div className="absolute -top-10 -right-10 w-48 h-48 bg-[#a5b4fc]/5 rounded-full blur-3xl pointer-events-none"></div>
                  
                  <h3 className="text-lg font-bold text-white mb-6">Profile Settings</h3>
                  <div className="grid grid-cols-2 gap-8 mb-8 relative z-10">
                     <div>
                        <label className="block text-xs font-mono text-[#8b949e] uppercase mb-1">Email Address</label>
                        <div className="text-white bg-[#0d1117] border border-[#2d333b] px-4 py-2.5 rounded-lg opacity-80 cursor-not-allowed select-all">{user?.email || ''}</div>
                     </div>
                     <div>
                        <label className="block text-xs font-mono text-[#8b949e] uppercase mb-1">Full Name</label>
                        <div className="text-white bg-[#0d1117] border border-[#2d333b] px-4 py-2.5 rounded-lg opacity-80 cursor-not-allowed select-all">{user?.full_name || ''}</div>
                     </div>
                  </div>

                  <hr className="border-[#2d333b] mb-8 relative z-10" />

                  <h3 className="text-lg font-bold text-white mb-6 relative z-10">Change Password</h3>
                  <form className="space-y-5 max-w-sm relative z-10" onSubmit={handlePwdSubmit}>
                     <div>
                        <label className="block text-xs font-mono text-[#8b949e] uppercase mb-1">Current Password</label>
                        <input required type="password" value={pwdForm.current} onChange={e=>setPwdForm({...pwdForm, current: e.target.value})} className="w-full bg-[#0d1117] border border-[#2d333b] text-white text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#a5b4fc] transition-colors" />
                     </div>
                     <div>
                        <label className="block text-xs font-mono text-[#8b949e] uppercase mb-1">New Secure Password</label>
                        <input required type="password" minLength={8} value={pwdForm.next} onChange={e=>setPwdForm({...pwdForm, next: e.target.value})} className="w-full bg-[#0d1117] border border-[#2d333b] text-white text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#a5b4fc] transition-colors" />
                     </div>
                     <div>
                        <label className="block text-xs font-mono text-[#8b949e] uppercase mb-1">Confirm Target Password</label>
                        <input required type="password" minLength={8} value={pwdForm.confirm} onChange={e=>setPwdForm({...pwdForm, confirm: e.target.value})} className="w-full bg-[#0d1117] border border-[#2d333b] text-white text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#a5b4fc] transition-colors" />
                     </div>
                     <button type="submit" className="px-6 py-2.5 bg-gradient-to-r from-[#818cf8] to-[#c084fc] hover:opacity-90 text-white font-semibold rounded-lg shadow-[0_0_20px_rgba(129,140,248,0.2)] transition-all active:scale-95">
                        Update Password
                     </button>
                  </form>
               </div>
           </div>
         )}


         {/* TAB 2: Project Architecture */}
         {activeTab === 'project' && currentProject && (
           <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
               
               {/* Project Details */}
               <div className="bg-[#11151c] border border-[#2d333b] rounded-xl p-8 shadow-sm">
                  <h3 className="text-lg font-bold text-white mb-6">Project Metadata</h3>
                  <div className="grid grid-cols-2 gap-8">
                     <div>
                        <label className="block text-xs font-mono text-[#8b949e] uppercase mb-2">Workspace Alias</label>
                        <input 
                           type="text" 
                           value={projectNameInput}
                           onChange={e=>setProjectNameInput(e.target.value)}
                           readOnly={!canManageProject}
                           className={`w-full bg-[#0d1117] border border-[#2d333b] text-white text-sm rounded-lg px-4 py-2.5 focus:outline-none transition-colors ${canManageProject ? 'focus:border-[#a5b4fc]' : 'opacity-70 cursor-not-allowed'}`} 
                        />
                     </div>
                     <div>
                        <label className="block text-xs font-mono text-[#8b949e] uppercase mb-2">Project Identity Tracker</label>
                        <div className="text-[#8b949e] font-mono text-xs bg-[#0d1117] border border-transparent px-4 py-3 rounded-lg opacity-80 cursor-not-allowed select-all truncate">
                           {currentProject.id}
                        </div>
                     </div>
                  </div>
                  {canManageProject && (
                     <div className="mt-6 flex justify-end">
                        <button onClick={handleUpdateProjectName} disabled={projectNameInput === currentProject.name} className="px-5 py-2 inline-flex border border-[#2d333b] hover:bg-[#161b22] text-white text-xs font-bold uppercase rounded-lg transition-colors disabled:opacity-50">
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
                     For security reasons, your plain-text API key is visible initially logic. If compromised, you must generate a new one using the Rotation tool below.
                  </p>
                  
                  <div className="flex space-x-3 items-center">
                     <div className="relative flex-1 max-w-lg">
                        <input 
                           type="text"
                           readOnly
                           value={renderApiKey()}
                           className="w-full bg-[#0d1117] border border-[#2d333b] text-[#a5b4fc] font-mono text-xs rounded-lg px-4 py-3 cursor-not-allowed select-all"
                        />
                     </div>
                  </div>
               </div>

               {/* Red Zone (RBAC Protected) */}
               {canManageProject && (
                 <div className="border border-[#7f1d1d] bg-[#450a0a]/30 rounded-xl p-8 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#ef4444]/10 rounded-full blur-3xl"></div>
                    <div className="flex items-center space-x-2 mb-2 relative z-10">
                       <AlertTriangle className="w-5 h-5 text-[#ef4444]" />
                       <h3 className="text-lg font-bold text-[#fca5a5]">Danger Zone</h3>
                    </div>
                    <p className="text-sm text-[#f87171] mb-6 max-w-xl relative z-10">Destructive system actions that immediately impact the active project integration.</p>
                    
                    <div className="space-y-4 relative z-10">
                       <div className="flex items-center justify-between p-4 border border-[#7f1d1d]/50 bg-[#450a0a]/50 rounded-lg">
                          <div>
                             <h4 className="text-white font-bold text-sm">Rotate API Key</h4>
                             <p className="text-xs text-[#8b949e]">Invalidates the current key. You will need to immediately update all your connected services.</p>
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
                               <h4 className="text-white font-bold text-sm">Drop Workspace</h4>
                               <p className="text-xs text-[#8b949e]">Permanently deletes the workspace and all associated logs, configurations, and metrics.</p>
                            </div>
                            <button 
                              onClick={() => setActiveDangerModal('delete')}
                              className="px-5 py-2 inline-flex items-center bg-[#ef4444] hover:bg-[#dc2626] border border-[#ef4444] text-white shadow-[0_0_15px_rgba(239,68,68,0.4)] text-xs font-bold uppercase rounded-lg transition-all"
                            >
                               <Trash2 className="w-3.5 h-3.5 mr-2" /> Drop Sequence
                            </button>
                         </div>
                       )}
                    </div>
                 </div>
               )}
           </div>
         )}


         {/* TAB 3: Organization Base */}
         {activeTab === 'org' && currentOrg && (
           <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
               
               {/* Invite UI (RBAC) */}
               {canManageMembers && (
                 <div className="bg-[#11151c] border border-[#2d333b] rounded-xl p-8 shadow-sm">
                    <h3 className="text-lg font-bold text-white mb-2">Provision Organization Access</h3>
                    <p className="text-sm text-[#8b949e] mb-6">Dispatch secure email invitations to provision authenticated users into your organization. They explicitly join securely restricted as secondary members.</p>
                    
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
                          <Send className="w-4 h-4 mr-2" /> Dispatch Envelope
                       </button>
                    </form>

                    {invites.length > 0 && (
                      <div className="mt-8">
                         <h4 className="text-xs font-mono text-[#8b949e] uppercase mb-3">Escrowed Active Invites</h4>
                         <div className="space-y-2">
                           {invites.map(inv => (
                              <div key={inv.id} className="flex items-center justify-between p-3 border border-[#2d333b] bg-[#161b22] rounded-lg">
                                 <div className="text-sm font-mono text-white opacity-80">{inv.email}</div>
                                 <div className="flex items-center space-x-4">
                                    <span className="text-[10px] text-[#8b949e] uppercase tracking-wider">{new Date(inv.created_at).toLocaleDateString()}</span>
                                    <button onClick={() => handleRevokeInvite(inv.id)} className="text-[10px] text-[#fca5a5] hover:text-[#ef4444] font-bold uppercase transition-colors">Revoke Transmission</button>
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
                     <h3 className="text-lg font-bold text-white">Active Operational Roster</h3>
                     <span className="px-2 py-1 bg-white/5 border border-white/10 rounded-full font-mono text-[10px] text-[#c9d1d9] tracking-wider">{members.length} AUTHORIZED</span>
                  </div>
                  
                  <div className="w-full">
                     <div className="w-full border-b border-[#2d333b] px-6 py-3 flex text-[10px] font-mono tracking-widest text-[#8b949e] uppercase bg-[#0d1117]">
                        <div className="w-[45%]">Operator Signature</div>
                        <div className="w-[25%]">Clearance Level</div>
                        <div className="w-[15%]">Join Epoch</div>
                        <div className="w-[15%] text-right pr-2">Action Override</div>
                     </div>

                     {isLoadingOrgData ? (
                        <div className="w-full min-h-[150px] flex items-center justify-center">
                           <p className="text-sm font-mono text-[#8b949e]">Decrypting authorization tables...</p>
                        </div>
                     ) : members.length === 0 ? (
                        <ListEmpty label="No members found matching this organizational index." />
                     ) : (
                        members.map(member => {
                           const isMemberOwner = member.role === 'owner';
                           return (
                             <div key={member.id} className="w-full px-6 py-4 flex items-center border-b border-white/5 hover:bg-[#161b22] transition-colors">
                                <div className="w-[45%] pr-4">
                                   <h4 className="text-white text-sm font-bold flex items-center truncate">
                                      {member.user_name || member.full_name || 'Accepted Member'} {isMemberOwner && <ShieldCheck className="w-3.5 h-3.5 ml-2 text-[#818cf8]" />}
                                   </h4>
                                   <p className="text-xs font-mono text-[#8b949e] mt-0.5 truncate">{member.user_email || member.email}</p>
                                </div>
                                <div className="w-[25%]">
                                   <span className={`px-2.5 py-1 text-[10px] font-bold tracking-wider rounded uppercase border ${isMemberOwner ? 'bg-[#818cf8]/10 text-[#a5b4fc] border-[#818cf8]/20' : 'bg-white/5 text-[#8b949e] border-white/10'}`}>
                                     {member.role}
                                   </span>
                                </div>
                                <div className="w-[15%] font-mono text-xs text-[#8b949e]">
                                   {member.joined_at ? new Date(member.joined_at).toISOString().split('T')[0] : 'N/A'}
                                </div>
                                <div className="w-[15%] flex justify-end">
                                   {canManageMembers && !isMemberOwner && (
                                      <button onClick={() => handleExpelMember(member.id || member.user_id)} className="p-2 text-[#8b949e] hover:text-[#ef4444] hover:bg-[#ef4444]/10 rounded bg-transparent transition-colors">
                                         <Trash2 className="w-4 h-4" />
                                      </button>
                                   )}
                                </div>
                             </div>
                           )
                        })
                     )}
                  </div>
               </div>
           </div>
         )}
         
      </div>

      {/* Dynamic Danger Modals */}
      {activeDangerModal === 'rotate' && (
         <DangerActionModal 
            title="Rotate Production Key"
            description="Warning: Rotating the SDK API Key will instantly halt and reject ingestion for all currently deployed microservices utilizing the old index key! You must immediately deploy the new hash to your pods."
            expectedText="ROTATE"
            confirmLabel="Force Rotate"
            onClose={() => setActiveDangerModal(null)}
            onConfirm={handleRotateKey}
         />
      )}

      {activeDangerModal === 'delete' && (
         <DangerActionModal 
            title={`Drop Sequence: ${currentProject?.name}`}
            description={`Caution: [ ${currentProject?.name} ] and its entire historic telemetry traces, events, and metrics logs will be permanently erased. Undoing this drop sequence is algorithmically impossible.`}
            expectedText={currentProject?.name}
            confirmLabel="Destroy Traces"
            onClose={() => setActiveDangerModal(null)}
            onConfirm={handleDeleteProject}
         />
      )}

    </div>
  );
};

export default Settings;
