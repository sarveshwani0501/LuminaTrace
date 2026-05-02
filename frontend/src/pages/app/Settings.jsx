// import React, { useState, useEffect, useCallback } from 'react';
// import { useSelector, useDispatch } from 'react-redux';
// import { 
//   ShieldCheck, Map, Users, Copy, Check,
//   Trash2, RotateCw, CheckCircle2, AlertTriangle, Send, X, Inbox, KeyRound
// } from 'lucide-react';
// import { authApi } from '../../api/auth';
// import { projectApi } from '../../api/project';
// import { orgApi } from '../../api/org';
// import { fetchProjects } from '../../store/slices/projectSlice';
// import { fetchOrganizations } from '../../store/slices/orgSlice';

// // Inline feedback hook
// const useFeedback = () => {
//   const [msg, setMsg] = useState(null); // { text, type: 'success'|'error' }
//   const show = (text, type = 'success') => {
//     setMsg({ text, type });
//     setTimeout(() => setMsg(null), 3500);
//   };
//   return [msg, show];
// };

// const CopyButton = ({ text, label }) => {
//   const [copied, setCopied] = useState(false);
//   const handleCopy = (e) => {
//     e.stopPropagation();
//     navigator.clipboard.writeText(text);
//     setCopied(true);
//     setTimeout(() => setCopied(false), 2000);
//   };
//   return (
//     <button
//       onClick={handleCopy}
//       title={`Copy ${label}`}
//       className="p-2 text-[#8b949e] hover:text-white hover:bg-white/10 rounded-lg transition-colors"
//     >
//       {copied ? <Check className="w-3.5 h-3.5 text-[#10b981]" /> : <Copy className="w-3.5 h-3.5" />}
//     </button>
//   );
// };

// const InlineFeedback = ({ msg }) => {
//   if (!msg) return null;
//   const isError = msg.type === 'error';
//   return (
//     <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium ${
//       isError ? 'bg-[#450a0a] text-[#fca5a5] border border-[#7f1d1d]' : 'bg-[#064e3b]/40 text-[#34d399] border border-[#065f46]'
//     }`}>
//       {isError ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
//       <span>{msg.text}</span>
//     </div>
//   );
// };

// // Reusable Empty State handler
// const ListEmpty = ({ label }) => (
//   <div className="w-full min-h-[200px] flex flex-col items-center justify-center text-center p-8 bg-[#161b22] border-t border-[#2d333b]">
//     <Inbox className="w-10 h-10 text-[#4b5563] mb-3" />
//     <p className="text-xs font-mono text-[#8b949e] tracking-wide">{label}</p>
//   </div>
// );

// const DangerActionModal = ({ title, description, expectedText, confirmLabel, onClose, onConfirm }) => {
//   const [inputText, setInputText] = useState('');
  
//   const isMatch = inputText === expectedText;

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (isMatch) {
//       onConfirm();
//     }
//   };

//   return (
//     <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
//       <div className="bg-[#0d1117] border border-[#7f1d1d] rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col relative">
//         <div className="absolute top-0 right-0 w-32 h-32 bg-[#ef4444]/10 rounded-full blur-3xl pointer-events-none"></div>
        
//         <div className="flex justify-between items-center px-6 py-4 border-b border-[#2d333b] bg-[#450a0a]/30">
//           <div className="flex items-center space-x-2">
//              <AlertTriangle className="w-5 h-5 text-[#ef4444]" />
//              <h2 className="text-white font-bold text-lg">{title}</h2>
//           </div>
//           <button onClick={onClose} className="p-2 ml-4 hover:bg-white/10 rounded-full transition-colors text-[#8b949e] hover:text-white">
//              <X className="w-5 h-5"/>
//           </button>
//         </div>
        
//         <form onSubmit={handleSubmit} className="p-6 space-y-5 bg-[#0a0c10]">
//           <p className="text-sm text-[#fca5a5]">{description}</p>
          
//           <div className="bg-[#11151c] border border-[#2d333b] p-4 rounded-lg">
//              <label className="block text-xs font-mono text-[#8b949e] uppercase mb-2">
//                Please type <strong className="text-white select-all">{expectedText}</strong> to verify.
//              </label>
//              <input 
//                 required
//                 type="text" 
//                 value={inputText}
//                 onChange={e => setInputText(e.target.value)}
//                 className="w-full bg-[#0d1117] border border-[#2d333b] text-white font-mono text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#ef4444] transition-colors" 
//              />
//           </div>

//           <div className="pt-4 flex justify-end space-x-3 border-t border-[#2d333b] pt-5 mt-2">
//              <button type="button" onClick={onClose} className="px-5 py-2 text-sm text-[#8b949e] hover:text-white font-medium transition-colors">Cancel</button>
//              <button 
//                type="submit" 
//                disabled={!isMatch}
//                className={`px-6 py-2 text-sm font-semibold rounded-lg shadow-lg transition-all flex items-center ${isMatch ? 'bg-[#ef4444] hover:bg-[#dc2626] text-white cursor-pointer shadow-[0_0_15px_rgba(239,68,68,0.4)]' : 'bg-[#ef4444]/30 text-[#fca5a5]/50 cursor-not-allowed border border-[#ef4444]/20'}`}
//              >
//                 {confirmLabel}
//              </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// const Settings = () => {
//   const dispatch = useDispatch();
//   const { currentOrg } = useSelector(state => state.org);
//   const { currentProject } = useSelector(state => state.project);
//   const { user } = useSelector(state => state.auth);

//   const [activeTab, setActiveTab] = useState('profile'); // profile | project | org
  
//   // Modals & Forms
//   const [activeDangerModal, setActiveDangerModal] = useState(null); // 'rotate' | 'delete' | null
//   const [pwdForm, setPwdForm] = useState({ current: '', next: '', confirm: '' });
//   const [inviteEmail, setInviteEmail] = useState('');
//   const [projectNameInput, setProjectNameInput] = useState('');
  
//   // Org Members & Invites State
//   const [members, setMembers] = useState([]);
//   const [invites, setInvites] = useState([]);
//   const [isLoadingOrgData, setIsLoadingOrgData] = useState(false);

//   // Security
//   const isOwner = currentOrg?.role === 'owner';
//   const canManageProject = isOwner;
//   const canDeleteProject = isOwner;
//   const canManageMembers = isOwner;

//   // api_key_preview is the first 12 chars of the real key (e.g. "lt_1028168a78")
//   // The full key is never returned by the backend after creation for security
//   const apiKeyDisplay = currentProject?.api_key_preview
//     ? `${currentProject.api_key_preview}${'*'.repeat(52)}`
//     : 'Not available — rotate to generate a new key';

//   const [pwdFeedback, showPwdFeedback] = useFeedback();
//   const [projFeedback, showProjFeedback] = useFeedback();
//   const [inviteFeedback, showInviteFeedback] = useFeedback();

//   useEffect(() => {
//     if (currentProject) {
//       setProjectNameInput(currentProject.name || '');
//     }
//   }, [currentProject]);

//   const loadOrgData = useCallback(async () => {
//     if (activeTab !== 'org' || !currentOrg) return;
//     setIsLoadingOrgData(true);
//     try {
//       const [memRes, invRes] = await Promise.allSettled([
//         orgApi.getMembers(currentOrg.id),
//         isOwner ? orgApi.getInvites(currentOrg.id) : Promise.resolve({ data: { invites: [] }})
//       ]);
      
//       if (memRes.status === 'fulfilled') setMembers(memRes.value.data.organizationMembers || []);
//       if (invRes.status === 'fulfilled') setInvites(Array.isArray(invRes.value.data) ? invRes.value.data : []);
//     } catch (err) {
//       console.error(err);
//     } finally {
//       setIsLoadingOrgData(false);
//     }
//   }, [activeTab, currentOrg, isOwner]);

//   useEffect(() => {
//     loadOrgData();
//   }, [loadOrgData]);


//   // Handlers
//   const handlePwdSubmit = async (e) => {
//     e.preventDefault();
//     if (pwdForm.next !== pwdForm.confirm) {
//       showPwdFeedback('New passwords do not match.', 'error');
//       return;
//     }
//     try {
//       await authApi.changePassword({ oldPassword: pwdForm.current, newPassword: pwdForm.next });
//       showPwdFeedback('Password updated successfully.');
//       setPwdForm({ current: '', next: '', confirm: '' });
//     } catch (err) {
//       showPwdFeedback(err.response?.data?.message || 'Incorrect current password.', 'error');
//     }
//   };

//   const handleUpdateProjectName = async () => {
//     if (!currentOrg || !currentProject || !projectNameInput) return;
//     try {
//       await projectApi.updateProject(currentOrg.id, currentProject.id, { name: projectNameInput });
//       dispatch(fetchProjects(currentOrg.id));
//       showProjFeedback('Project name saved.');
//     } catch (err) {
//       showProjFeedback('Failed to update project name.', 'error');
//     }
//   };

//   const handleRotateKey = async () => {
//     try {
//       await projectApi.rotateApiKey(currentOrg.id, currentProject.id);
//       dispatch(fetchProjects(currentOrg.id));
//       showProjFeedback('API key rotated. Update all connected services immediately.');
//       setActiveDangerModal(null);
//     } catch (err) {
//       showProjFeedback('Failed to rotate API key.', 'error');
//     }
//   };

//   const handleDeleteProject = async () => {
//     try {
//       await projectApi.deleteProject(currentOrg.id, currentProject.id);
//       setActiveDangerModal(null);
//       window.location.reload();
//     } catch (err) {
//       showProjFeedback('Failed to delete project.', 'error');
//       setActiveDangerModal(null);
//     }
//   };

//   const handleInviteSubmit = async (e) => {
//     e.preventDefault();
//     if (!inviteEmail) return;
//     try {
//       await orgApi.createInvite(currentOrg.id, { email: inviteEmail, role: 'member' });
//       setInviteEmail('');
//       loadOrgData();
//       showInviteFeedback(`Invitation sent to ${inviteEmail}.`);
//     } catch (err) {
//       showInviteFeedback(err.response?.data?.message || 'Failed to send invitation.', 'error');
//     }
//   };

//   const handleRevokeInvite = async (inviteId) => {
//     try {
//       await orgApi.deleteInvite(currentOrg.id, inviteId);
//       loadOrgData();
//       showInviteFeedback('Invitation revoked.');
//     } catch (err) {
//       showInviteFeedback('Failed to revoke invitation.', 'error');
//     }
//   };

//   const handleExpelMember = async (memberId) => {
//     try {
//       await orgApi.removeMember(currentOrg.id, memberId);
//       loadOrgData();
//     } catch (err) {
//       showInviteFeedback('Failed to remove member.', 'error');
//     }
//   };

//   return (
//     <div className="w-full flex justify-center h-[calc(100vh-80px)] overflow-y-auto pb-10">
//       <div className="w-full max-w-4xl px-2 pt-6">
         
//          {/* Settings Header */}
//          <div className="flex justify-between items-end mb-8 border-b border-[#2d333b] pb-6">
//             <div>
//               <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Settings</h1>
//               <p className="text-sm text-[#8b949e]">Manage your profile, project configuration, and organization members.</p>
//             </div>
//          </div>

//          {/* Navigation Pills */}
//          <div className="flex space-x-2 mb-8 bg-[#11151c] p-2 rounded-xl border border-white/5 inline-flex">
//             <button 
//               onClick={() => setActiveTab('profile')}
//               className={`px-6 py-2.5 rounded-lg text-sm font-bold flex items-center transition-all ${activeTab === 'profile' ? 'bg-[#a5b4fc]/10 text-[#a5b4fc]' : 'text-[#8b949e] hover:text-[#c9d1d9] hover:bg-[#161b22]'}`}
//             >
//               <ShieldCheck className="w-4 h-4 mr-2"/> Profile Security
//             </button>
//             {currentProject && (
//               <button 
//                 onClick={() => setActiveTab('project')}
//                 className={`px-6 py-2.5 rounded-lg text-sm font-bold flex items-center transition-all ${activeTab === 'project' ? 'bg-[#a5b4fc]/10 text-[#a5b4fc]' : 'text-[#8b949e] hover:text-[#c9d1d9] hover:bg-[#161b22]'}`}
//               >
//                 <Map className="w-4 h-4 mr-2"/> Project Configuration
//               </button>
//             )}
//             {currentOrg && (
//               <button 
//                 onClick={() => setActiveTab('org')}
//                 className={`px-6 py-2.5 rounded-lg text-sm font-bold flex items-center transition-all ${activeTab === 'org' ? 'bg-[#a5b4fc]/10 text-[#a5b4fc]' : 'text-[#8b949e] hover:text-[#c9d1d9] hover:bg-[#161b22]'}`}
//               >
//                 <Users className="w-4 h-4 mr-2"/> Organization Members
//               </button>
//             )}
//          </div>

//          {/* TAB 1: Profile & Security */}
//          {activeTab === 'profile' && (
//            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
//                <div className="bg-[#11151c] border border-[#2d333b] rounded-xl p-8 shadow-sm relative overflow-hidden mb-8">
//                   <div className="absolute -top-10 -right-10 w-48 h-48 bg-[#a5b4fc]/5 rounded-full blur-3xl pointer-events-none"></div>
                  
//                   <h3 className="text-lg font-bold text-white mb-6">Profile Settings</h3>
//                   <div className="grid grid-cols-2 gap-8 mb-8 relative z-10">
//                      <div>
//                         <label className="block text-xs font-mono text-[#8b949e] uppercase mb-1">Email Address</label>
//                         <div className="text-white bg-[#0d1117] border border-[#2d333b] px-4 py-2.5 rounded-lg opacity-80 cursor-not-allowed select-all">{user?.email || ''}</div>
//                      </div>
//                      <div>
//                         <label className="block text-xs font-mono text-[#8b949e] uppercase mb-1">Full Name</label>
//                         <div className="text-white bg-[#0d1117] border border-[#2d333b] px-4 py-2.5 rounded-lg opacity-80 cursor-not-allowed select-all">{user?.full_name || ''}</div>
//                      </div>
//                   </div>

//                   <hr className="border-[#2d333b] mb-8 relative z-10" />

//                   <h3 className="text-lg font-bold text-white mb-6 relative z-10">Change Password</h3>
//                   <form className="space-y-5 max-w-sm relative z-10" onSubmit={handlePwdSubmit}>
//                      <div>
//                         <label className="block text-xs font-mono text-[#8b949e] uppercase mb-1">Current Password</label>
//                         <input required type="password" value={pwdForm.current} onChange={e=>setPwdForm({...pwdForm, current: e.target.value})} className="w-full bg-[#0d1117] border border-[#2d333b] text-white text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#a5b4fc] transition-colors" />
//                      </div>
//                      <div>
//                         <label className="block text-xs font-mono text-[#8b949e] uppercase mb-1">New Secure Password</label>
//                         <input required type="password" minLength={8} value={pwdForm.next} onChange={e=>setPwdForm({...pwdForm, next: e.target.value})} className="w-full bg-[#0d1117] border border-[#2d333b] text-white text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#a5b4fc] transition-colors" />
//                      </div>
//                      <div>
//                         <label className="block text-xs font-mono text-[#8b949e] uppercase mb-1">Confirm Target Password</label>
//                         <input required type="password" minLength={8} value={pwdForm.confirm} onChange={e=>setPwdForm({...pwdForm, confirm: e.target.value})} className="w-full bg-[#0d1117] border border-[#2d333b] text-white text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#a5b4fc] transition-colors" />
//                      </div>
//                      <button type="submit" className="px-6 py-2.5 bg-gradient-to-r from-[#818cf8] to-[#c084fc] hover:opacity-90 text-white font-semibold rounded-lg shadow-[0_0_20px_rgba(129,140,248,0.2)] transition-all active:scale-95">
//                         Update Password
//                      </button>
//                   </form>
//                </div>
//            </div>
//          )}


//          {/* TAB 2: Project Architecture */}
//          {activeTab === 'project' && currentProject && (
//            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
               
//                {/* Project Details */}
//                <div className="bg-[#11151c] border border-[#2d333b] rounded-xl p-8 shadow-sm">
//                   <h3 className="text-lg font-bold text-white mb-1">Project Details</h3>
//                   <p className="text-xs text-[#8b949e] mb-6">Basic metadata for this project workspace.</p>
//                   <div className="grid grid-cols-2 gap-8">
//                      <div>
//                         <label className="block text-xs font-mono text-[#8b949e] uppercase mb-2">Project Name</label>
//                         <input 
//                            type="text" 
//                            value={projectNameInput}
//                            onChange={e=>setProjectNameInput(e.target.value)}
//                            readOnly={!canManageProject}
//                            className={`w-full bg-[#0d1117] border border-[#2d333b] text-white text-sm rounded-lg px-4 py-2.5 focus:outline-none transition-colors ${canManageProject ? 'focus:border-[#a5b4fc]' : 'opacity-70 cursor-not-allowed'}`} 
//                         />
//                      </div>
//                      <div>
//                         <label className="block text-xs font-mono text-[#8b949e] uppercase mb-2">Project ID</label>
//                         <div className="flex items-center bg-[#0d1117] border border-[#2d333b] rounded-lg pr-1">
//                            <div className="text-[#8b949e] font-mono text-xs px-4 py-2.5 flex-1 truncate select-all">{currentProject.id}</div>
//                            <CopyButton text={currentProject.id} label="Project ID" />
//                         </div>
//                      </div>
//                   </div>
//                   {canManageProject && (
//                      <div className="mt-6 flex items-center justify-end space-x-3">
//                         <InlineFeedback msg={projFeedback} />
//                         <button onClick={handleUpdateProjectName} disabled={projectNameInput === currentProject.name} className="px-5 py-2 inline-flex border border-[#2d333b] hover:bg-[#161b22] text-white text-xs font-bold uppercase rounded-lg transition-colors disabled:opacity-50">
//                            Save Changes
//                         </button>
//                      </div>
//                   )}
//                </div>

//                {/* API Key */}
//                <div className="bg-[#11151c] border border-[#2d333b] rounded-xl p-8 shadow-sm">
//                   <div className="flex items-center space-x-2 mb-1">
//                      <KeyRound className="w-4 h-4 text-[#a5b4fc]" />
//                      <h3 className="text-lg font-bold text-white">SDK Ingestion Key</h3>
//                   </div>
//                   <p className="text-sm text-[#8b949e] mb-6 max-w-2xl">
//                      Use this key in your SDK configuration. Only a preview is shown — the full key was visible once at creation. Rotate below if compromised.
//                   </p>

//                   {currentProject?.api_key_preview ? (
//                     <div className="flex items-center space-x-3 max-w-xl">
//                        <div className="flex items-center flex-1 bg-[#0d1117] border border-[#2d333b] rounded-lg pr-1">
//                           <input 
//                              type="text"
//                              readOnly
//                              value={apiKeyDisplay}
//                              className="flex-1 bg-transparent text-[#a5b4fc] font-mono text-xs px-4 py-3 cursor-not-allowed select-all outline-none"
//                           />
//                           <CopyButton text={currentProject.api_key_preview} label="API key preview" />
//                        </div>
//                     </div>
//                   ) : (
//                     <div className="flex items-center space-x-4 max-w-xl p-4 bg-[#451a03]/30 border border-[#78350f]/50 rounded-lg">
//                        <AlertTriangle className="w-5 h-5 text-[#f59e0b] shrink-0" />
//                        <div className="flex-1 min-w-0">
//                           <p className="text-sm font-medium text-[#fdba74]">Key preview unavailable</p>
//                           <p className="text-xs text-[#8b949e] mt-0.5">This project was created before previews were stored. Rotate the key below to generate a new one.</p>
//                        </div>
//                        {canManageProject && (
//                          <button
//                            onClick={() => setActiveDangerModal('rotate')}
//                            className="px-4 py-2 shrink-0 bg-[#f59e0b]/10 border border-[#f59e0b]/40 text-[#fbbf24] text-xs font-bold rounded-lg hover:bg-[#f59e0b]/20 transition-colors"
//                          >
//                            Generate New Key
//                          </button>
//                        )}
//                     </div>
//                   )}
//                </div>

//                {/* Red Zone (RBAC Protected) */}
//                {canManageProject && (
//                  <div className="border border-[#7f1d1d] bg-[#450a0a]/30 rounded-xl p-8 overflow-hidden relative">
//                     <div className="absolute top-0 right-0 w-32 h-32 bg-[#ef4444]/10 rounded-full blur-3xl"></div>
//                     <div className="flex items-center space-x-2 mb-2 relative z-10">
//                        <AlertTriangle className="w-5 h-5 text-[#ef4444]" />
//                        <h3 className="text-lg font-bold text-[#fca5a5]">Danger Zone</h3>
//                     </div>
//                     <p className="text-sm text-[#f87171] mb-6 max-w-xl relative z-10">Destructive system actions that immediately impact the active project integration.</p>
                    
//                     <div className="space-y-4 relative z-10">
//                        <div className="flex items-center justify-between p-4 border border-[#7f1d1d]/50 bg-[#450a0a]/50 rounded-lg">
//                           <div>
//                              <h4 className="text-white font-bold text-sm">Rotate API Key</h4>
//                              <p className="text-xs text-[#8b949e]">Invalidates the current key. You will need to immediately update all your connected services.</p>
//                           </div>
//                           <button 
//                             onClick={() => setActiveDangerModal('rotate')}
//                             className="px-5 py-2 inline-flex items-center bg-[#ef4444]/10 hover:bg-[#ef4444]/20 border border-[#ef4444] text-[#ef4444] text-xs font-bold uppercase rounded-lg transition-colors"
//                           >
//                              <RotateCw className="w-3.5 h-3.5 mr-2" /> Rotate Key
//                           </button>
//                        </div>

//                        {canDeleteProject && (
//                          <div className="flex items-center justify-between p-4 border border-[#7f1d1d]/50 bg-[#450a0a]/50 rounded-lg">
//                             <div>
//                                <h4 className="text-white font-bold text-sm">Drop Workspace</h4>
//                                <p className="text-xs text-[#8b949e]">Permanently deletes the workspace and all associated logs, configurations, and metrics.</p>
//                             </div>
//                             <button 
//                               onClick={() => setActiveDangerModal('delete')}
//                               className="px-5 py-2 inline-flex items-center bg-[#ef4444] hover:bg-[#dc2626] border border-[#ef4444] text-white shadow-[0_0_15px_rgba(239,68,68,0.4)] text-xs font-bold uppercase rounded-lg transition-all"
//                             >
//                                <Trash2 className="w-3.5 h-3.5 mr-2" /> Drop Sequence
//                             </button>
//                          </div>
//                        )}
//                     </div>
//                  </div>
//                )}
//            </div>
//          )}


//          {/* TAB 3: Organization Base */}
//          {activeTab === 'org' && currentOrg && (
//            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
               
//                {/* Invite UI (RBAC) */}
//                {canManageMembers && (
//                  <div className="bg-[#11151c] border border-[#2d333b] rounded-xl p-8 shadow-sm">
//                     <h3 className="text-lg font-bold text-white mb-2">Provision Organization Access</h3>
//                     <p className="text-sm text-[#8b949e] mb-6">Dispatch secure email invitations to provision authenticated users into your organization. They explicitly join securely restricted as secondary members.</p>
                    
//                     <form onSubmit={handleInviteSubmit} className="flex space-x-3 items-center max-w-2xl">
//                        <input 
//                           required
//                           type="email" 
//                           placeholder="colleague@domain.com"
//                           value={inviteEmail}
//                           onChange={e=>setInviteEmail(e.target.value)}
//                           className="flex-1 bg-[#0d1117] border border-[#2d333b] text-white text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#a5b4fc] transition-colors" 
//                        />
//                        <button type="submit" className="px-5 py-2.5 bg-white text-black hover:bg-gray-200 font-bold rounded-lg transition-colors flex items-center text-sm shadow-[0_0_15px_rgba(255,255,255,0.2)]">
//                           <Send className="w-4 h-4 mr-2" /> Dispatch Envelope
//                        </button>
//                     </form>

//                     {invites.length > 0 && (
//                       <div className="mt-8">
//                          <h4 className="text-xs font-mono text-[#8b949e] uppercase mb-3">Escrowed Active Invites</h4>
//                          <div className="space-y-2">
//                            {invites.map(inv => (
//                               <div key={inv.id} className="flex items-center justify-between p-3 border border-[#2d333b] bg-[#161b22] rounded-lg">
//                                  <div className="text-sm font-mono text-white opacity-80">{inv.email}</div>
//                                  <div className="flex items-center space-x-4">
//                                     <span className="text-[10px] text-[#8b949e] uppercase tracking-wider">{new Date(inv.created_at).toLocaleDateString()}</span>
//                                     <button onClick={() => handleRevokeInvite(inv.id)} className="text-[10px] text-[#fca5a5] hover:text-[#ef4444] font-bold uppercase transition-colors">Revoke Transmission</button>
//                                  </div>
//                               </div>
//                            ))}
//                          </div>
//                       </div>
//                     )}
//                  </div>
//                )}

//                {/* Member Directory */}
//                <div className="bg-[#11151c] border border-[#2d333b] rounded-xl overflow-hidden shadow-sm">
//                   <div className="px-6 py-5 border-b border-[#2d333b] flex justify-between items-center bg-[#161b22]">
//                      <h3 className="text-lg font-bold text-white">Active Operational Roster</h3>
//                      <span className="px-2 py-1 bg-white/5 border border-white/10 rounded-full font-mono text-[10px] text-[#c9d1d9] tracking-wider">{members.length} AUTHORIZED</span>
//                   </div>
                  
//                   <div className="w-full">
//                      <div className="w-full border-b border-[#2d333b] px-6 py-3 flex text-[10px] font-mono tracking-widest text-[#8b949e] uppercase bg-[#0d1117]">
//                         <div className="w-[45%]">Operator Signature</div>
//                         <div className="w-[25%]">Clearance Level</div>
//                         <div className="w-[15%]">Join Epoch</div>
//                         <div className="w-[15%] text-right pr-2">Action Override</div>
//                      </div>

//                      {isLoadingOrgData ? (
//                         <div className="w-full min-h-[150px] flex items-center justify-center">
//                            <p className="text-sm font-mono text-[#8b949e]">Decrypting authorization tables...</p>
//                         </div>
//                      ) : members.length === 0 ? (
//                         <ListEmpty label="No members found matching this organizational index." />
//                      ) : (
//                         members.map(member => {
//                            const isMemberOwner = member.role === 'owner';
//                            return (
//                              <div key={member.id} className="w-full px-6 py-4 flex items-center border-b border-white/5 hover:bg-[#161b22] transition-colors">
//                                 <div className="w-[45%] pr-4">
//                                    <h4 className="text-white text-sm font-bold flex items-center truncate">
//                                       {member.user_name || member.full_name || 'Accepted Member'} {isMemberOwner && <ShieldCheck className="w-3.5 h-3.5 ml-2 text-[#818cf8]" />}
//                                    </h4>
//                                    <p className="text-xs font-mono text-[#8b949e] mt-0.5 truncate">{member.user_email || member.email}</p>
//                                 </div>
//                                 <div className="w-[25%]">
//                                    <span className={`px-2.5 py-1 text-[10px] font-bold tracking-wider rounded uppercase border ${isMemberOwner ? 'bg-[#818cf8]/10 text-[#a5b4fc] border-[#818cf8]/20' : 'bg-white/5 text-[#8b949e] border-white/10'}`}>
//                                      {member.role}
//                                    </span>
//                                 </div>
//                                 <div className="w-[15%] font-mono text-xs text-[#8b949e]">
//                                    {member.joined_at ? new Date(member.joined_at).toISOString().split('T')[0] : 'N/A'}
//                                 </div>
//                                 <div className="w-[15%] flex justify-end">
//                                    {canManageMembers && !isMemberOwner && (
//                                       <button onClick={() => handleExpelMember(member.id || member.user_id)} className="p-2 text-[#8b949e] hover:text-[#ef4444] hover:bg-[#ef4444]/10 rounded bg-transparent transition-colors">
//                                          <Trash2 className="w-4 h-4" />
//                                       </button>
//                                    )}
//                                 </div>
//                              </div>
//                            )
//                         })
//                      )}
//                   </div>
//                </div>
//            </div>
//          )}
         
//       </div>

//       {/* Dynamic Danger Modals */}
//       {activeDangerModal === 'rotate' && (
//          <DangerActionModal 
//             title="Rotate API Key"
//             description="Rotating the key will immediately invalidate the current one. All services using it will stop sending data until you update them with the new key."
//             expectedText="ROTATE"
//             confirmLabel="Rotate Key"
//             onClose={() => setActiveDangerModal(null)}
//             onConfirm={handleRotateKey}
//          />
//       )}

//       {activeDangerModal === 'delete' && (
//          <DangerActionModal 
//             title={`Delete Project: ${currentProject?.name}`}
//             description={`This will permanently delete "${currentProject?.name}" and all its logs, metrics, traces, and configuration. This action cannot be undone.`}
//             expectedText={currentProject?.name}
//             confirmLabel="Delete Project"
//             onClose={() => setActiveDangerModal(null)}
//             onConfirm={handleDeleteProject}
//          />
//       )}

//     </div>
//   );
// };

// export default Settings;


import React, { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  ShieldCheck, Map, Users, Copy, Check,
  Trash2, RotateCw, CheckCircle2, AlertTriangle,
  Send, X, Inbox, KeyRound, Lock, Mail, User
} from 'lucide-react';
import { authApi }    from '../../api/auth';
import { projectApi } from '../../api/project';
import { orgApi }     from '../../api/org';
import { fetchProjects }      from '../../store/slices/projectSlice';
import { fetchOrganizations } from '../../store/slices/orgSlice';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

/* ─────────────────────────────────────────────────────────────────
   INLINE FEEDBACK HOOK
───────────────────────────────────────────────────────────────── */
const useFeedback = () => {
  const [msg, setMsg] = useState(null);
  const show = (text, type = 'success') => {
    setMsg({ text, type });
    setTimeout(() => setMsg(null), 3500);
  };
  return [msg, show];
};

/* ─────────────────────────────────────────────────────────────────
   COPY BUTTON
───────────────────────────────────────────────────────────────── */
const CopyButton = ({ text, label }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      title={`Copy ${label}`}
      className="p-2 text-text-muted hover:text-text-primary hover:bg-surface-hover rounded-md transition-colors duration-fast"
    >
      {copied
        ? <Check className="w-3.5 h-3.5 text-accent-success" />
        : <Copy className="w-3.5 h-3.5" />
      }
    </button>
  );
};

/* ─────────────────────────────────────────────────────────────────
   INLINE FEEDBACK BANNER
───────────────────────────────────────────────────────────────── */
const InlineFeedback = ({ msg }) => {
  if (!msg) return null;
  const isError = msg.type === 'error';
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm
      ${isError
        ? 'bg-accent-error/10 text-accent-error border border-accent-error/25'
        : 'bg-accent-success/10 text-accent-success border border-accent-success/25'
      }`}
    >
      {isError
        ? <AlertTriangle className="w-4 h-4 shrink-0" />
        : <CheckCircle2 className="w-4 h-4 shrink-0" />
      }
      <span>{msg.text}</span>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────
   EMPTY STATE
───────────────────────────────────────────────────────────────── */
const ListEmpty = ({ label }) => (
  <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
    <Inbox className="w-8 h-8 text-border" />
    <p className="text-xs font-mono text-text-muted">{label}</p>
  </div>
);

/* ─────────────────────────────────────────────────────────────────
   SECTION CARD  (consistent wrapper)
───────────────────────────────────────────────────────────────── */
const Section = ({ title, subtitle, children, className = '' }) => (
  <div className={`bg-surface border border-border rounded-card overflow-hidden ${className}`}>
    <div className="px-6 py-4 border-b border-border bg-background/30">
      <h3 className="text-base font-semibold text-text-primary">{title}</h3>
      {subtitle && <p className="text-sm text-text-muted mt-0.5">{subtitle}</p>}
    </div>
    <div className="p-6">{children}</div>
  </div>
);

/* ─────────────────────────────────────────────────────────────────
   MEMBER AVATAR  (initials from name or email)
───────────────────────────────────────────────────────────────── */
const MemberAvatar = ({ name, email }) => {
  const initials = name
    ? name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : (email?.[0] ?? '?').toUpperCase();
  return (
    <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
      <span className="text-xs font-semibold text-primary font-mono">{initials}</span>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────
   DANGER ACTION MODAL
───────────────────────────────────────────────────────────────── */
const DangerActionModal = ({ title, description, expectedText, confirmLabel, onClose, onConfirm }) => {
  const [inputText, setInputText] = useState('');
  const isMatch = inputText === expectedText;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isMatch) onConfirm();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-background border border-accent-error/30 rounded-card shadow-elevated w-full max-w-lg overflow-hidden relative">

        {/* Ambient glow */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-accent-error/8 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-accent-error/20 bg-accent-error/5">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-accent-error" />
            <h2 className="text-sm font-semibold text-text-primary">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-text-muted hover:text-text-primary hover:bg-surface-hover rounded-md transition-colors duration-fast"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
          <p className="text-sm text-text-secondary leading-relaxed">{description}</p>

          <div className="bg-surface border border-border rounded-md p-4 flex flex-col gap-2">
            <label className="text-xs text-text-muted">
              Type <span className="font-mono font-semibold text-text-primary select-all">{expectedText}</span> to confirm.
            </label>
            <input
              required
              type="text"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              className={`w-full bg-background border rounded-md px-3 py-2 font-mono text-sm text-text-primary
                focus:outline-none focus:ring-2 ring-offset-0 transition-[border-color,box-shadow] duration-fast
                ${isMatch
                  ? 'border-accent-error focus:border-accent-error focus:ring-accent-error/20'
                  : 'border-border hover:border-border-light focus:border-accent-error focus:ring-accent-error/15'
                }`}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-border">
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="danger"
              size="sm"
              disabled={!isMatch}
            >
              {confirmLabel}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────
   SETTINGS PAGE
───────────────────────────────────────────────────────────────── */
const Settings = () => {
  const dispatch = useDispatch();
  const { currentOrg }     = useSelector(state => state.org);
  const { currentProject } = useSelector(state => state.project);
  const { user }           = useSelector(state => state.auth);

  const [activeTab, setActiveTab] = useState('profile');

  const [activeDangerModal, setActiveDangerModal] = useState(null);
  const [pwdForm, setPwdForm]         = useState({ current: '', next: '', confirm: '' });
  const [inviteEmail, setInviteEmail] = useState('');
  const [projectNameInput, setProjectNameInput] = useState('');

  const [members, setMembers]               = useState([]);
  const [invites, setInvites]               = useState([]);
  const [isLoadingOrgData, setIsLoadingOrgData] = useState(false);

  const isOwner          = currentOrg?.role === 'owner';
  const canManageProject = isOwner;
  const canDeleteProject = isOwner;
  const canManageMembers = isOwner;

  const apiKeyDisplay = currentProject?.api_key_preview
    ? `${currentProject.api_key_preview}${'•'.repeat(28)}`
    : null;

  const [pwdFeedback,    showPwdFeedback]    = useFeedback();
  const [projFeedback,   showProjFeedback]   = useFeedback();
  const [inviteFeedback, showInviteFeedback] = useFeedback();

  useEffect(() => {
    if (currentProject) setProjectNameInput(currentProject.name || '');
  }, [currentProject]);

  const loadOrgData = useCallback(async () => {
    if (activeTab !== 'org' || !currentOrg) return;
    setIsLoadingOrgData(true);
    try {
      const [memRes, invRes] = await Promise.allSettled([
        orgApi.getMembers(currentOrg.id),
        isOwner
          ? orgApi.getInvites(currentOrg.id)
          : Promise.resolve({ data: { invites: [] } }),
      ]);
      if (memRes.status === 'fulfilled') setMembers(memRes.value.data.organizationMembers || memRes.value.data || []);
      if (invRes.status === 'fulfilled') {
        const data = invRes.value.data;
        setInvites(data?.invites || (Array.isArray(data) ? data : []));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingOrgData(false);
    }
  }, [activeTab, currentOrg, isOwner]);

  useEffect(() => { loadOrgData(); }, [loadOrgData]);

  /* ── Handlers (logic unchanged) ──────────────────────────── */
  const handlePwdSubmit = async (e) => {
    e.preventDefault();
    if (pwdForm.next !== pwdForm.confirm) {
      showPwdFeedback('New passwords do not match.', 'error');
      return;
    }
    try {
      await authApi.changePassword({ oldPassword: pwdForm.current, newPassword: pwdForm.next });
      showPwdFeedback('Password updated successfully.');
      setPwdForm({ current: '', next: '', confirm: '' });
    } catch (err) {
      showPwdFeedback(err.response?.data?.message || 'Incorrect current password.', 'error');
    }
  };

  const handleUpdateProjectName = async () => {
    if (!currentOrg || !currentProject || !projectNameInput) return;
    try {
      await projectApi.updateProject(currentOrg.id, currentProject.id, { name: projectNameInput });
      dispatch(fetchProjects(currentOrg.id));
      showProjFeedback('Project name saved.');
    } catch (err) {
      showProjFeedback('Failed to update project name.', 'error');
    }
  };

  const handleRotateKey = async () => {
    try {
      await projectApi.rotateApiKey(currentOrg.id, currentProject.id);
      dispatch(fetchProjects(currentOrg.id));
      showProjFeedback('API key rotated. Update all connected services immediately.');
      setActiveDangerModal(null);
    } catch (err) {
      showProjFeedback('Failed to rotate API key.', 'error');
    }
  };

  const handleDeleteProject = async () => {
    try {
      await projectApi.deleteProject(currentOrg.id, currentProject.id);
      setActiveDangerModal(null);
      window.location.reload();
    } catch (err) {
      showProjFeedback('Failed to delete project.', 'error');
      setActiveDangerModal(null);
    }
  };

  const handleInviteSubmit = async (e) => {
    e.preventDefault();
    if (!inviteEmail) return;
    try {
      await orgApi.createInvite(currentOrg.id, { email: inviteEmail, role: 'member' });
      setInviteEmail('');
      loadOrgData();
      showInviteFeedback(`Invitation sent to ${inviteEmail}.`);
    } catch (err) {
      showInviteFeedback(err.response?.data?.message || 'Failed to send invitation.', 'error');
    }
  };

  const handleRevokeInvite = async (inviteId) => {
    try {
      await orgApi.deleteInvite(currentOrg.id, inviteId);
      loadOrgData();
      showInviteFeedback('Invitation revoked.');
    } catch (err) {
      showInviteFeedback('Failed to revoke invitation.', 'error');
    }
  };

  const handleExpelMember = async (memberId) => {
    try {
      await orgApi.removeMember(currentOrg.id, memberId);
      loadOrgData();
    } catch (err) {
      showInviteFeedback('Failed to remove member.', 'error');
    }
  };

  /* ── Tab definitions ─────────────────────────────────────── */
  const TABS = [
    { key: 'profile', label: 'Profile & security', icon: ShieldCheck, show: true },
    { key: 'project', label: 'Project',             icon: Map,         show: !!currentProject },
    { key: 'org',     label: 'Organization',        icon: Users,       show: !!currentOrg },
  ].filter(t => t.show);

  /* ─────────────────────────────────────────────────────────── */
  return (
    <div className="w-full flex justify-center min-h-[calc(100vh-80px)] overflow-y-auto pb-12">
      <div className="w-full max-w-3xl px-4 pt-8 flex flex-col gap-7">

        {/* Page header */}
        <div className="flex items-end justify-between border-b border-border pb-6">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight mb-1">Settings</h1>
            <p className="text-sm text-text-muted mt-1">
              Manage your profile, project configuration, and organization members.
            </p>
          </div>
        </div>

        {/* Tab nav */}
        <div className="flex gap-1.5 bg-surface border border-border p-1.5 rounded-lg w-fit">
          {TABS.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-fast border focus:outline-none
                  ${activeTab === tab.key
                    ? 'bg-primary/10 text-primary border-primary/20'
                    : 'border-transparent text-text-muted hover:text-text-primary hover:bg-surface-hover'
                  }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ── TAB 1: Profile & Security ────────────────────── */}
        {activeTab === 'profile' && (
          <div className="flex flex-col gap-5">

            {/* Profile info — read only */}
            <Section title="Profile" subtitle="Your account identity — contact support to change these.">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-text-secondary">Email address</label>
                  <div className="flex items-center gap-2 px-3 py-2 bg-background border border-border rounded-md opacity-70 cursor-not-allowed">
                    <Mail className="w-4 h-4 text-text-muted shrink-0" />
                    <span className="text-base text-text-secondary font-mono select-all">{user?.email || '—'}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-text-secondary">Full name</label>
                  <div className="flex items-center gap-2 px-3 py-2 bg-background border border-border rounded-md opacity-70 cursor-not-allowed">
                    <User className="w-4 h-4 text-text-muted shrink-0" />
                    <span className="text-base text-text-secondary select-all">{user?.full_name || '—'}</span>
                  </div>
                </div>
              </div>
            </Section>

            {/* Change password */}
            <Section title="Change password" subtitle="Choose a strong password of at least 8 characters.">
              <form onSubmit={handlePwdSubmit} className="flex flex-col gap-4 max-w-sm">
                <Input
                  label="Current password"
                  type="password"
                  icon={Lock}
                  value={pwdForm.current}
                  onChange={e => setPwdForm({ ...pwdForm, current: e.target.value })}
                  required
                  autoComplete="current-password"
                />
                <Input
                  label="New password"
                  type="password"
                  icon={Lock}
                  value={pwdForm.next}
                  onChange={e => setPwdForm({ ...pwdForm, next: e.target.value })}
                  required
                  minLength={8}
                  hint="Minimum 8 characters"
                  autoComplete="new-password"
                />
                <Input
                  label="Confirm new password"
                  type="password"
                  icon={Lock}
                  value={pwdForm.confirm}
                  onChange={e => setPwdForm({ ...pwdForm, confirm: e.target.value })}
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
                {pwdFeedback && <InlineFeedback msg={pwdFeedback} />}
                <div className="flex justify-start">
                  <Button type="submit" variant="primary" size="md">
                    Update password
                  </Button>
                </div>
              </form>
            </Section>

          </div>
        )}

        {/* ── TAB 2: Project Configuration ─────────────────── */}
        {activeTab === 'project' && currentProject && (
          <div className="flex flex-col gap-5">

            {/* Project details */}
            <Section title="Project details" subtitle="Name and identifier for this monitoring workspace.">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                {/* Project name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-text-secondary">Project name</label>
                  <input
                    type="text"
                    value={projectNameInput}
                    onChange={e => setProjectNameInput(e.target.value)}
                    readOnly={!canManageProject}
                    className={`w-full bg-background border rounded-md px-3 py-2 text-base text-text-primary
                      ring-0 ring-offset-0 focus:outline-none focus:ring-2
                      transition-[border-color,box-shadow] duration-fast
                      ${canManageProject
                        ? 'border-border hover:border-border-light focus:border-primary focus:ring-primary/20'
                        : 'border-border opacity-60 cursor-not-allowed'
                      }`}
                  />
                </div>

                {/* Project ID — copy only */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-text-secondary">Project ID</label>
                  <div className="flex items-center bg-background border border-border rounded-md pr-1 overflow-hidden">
                    <span className="flex-1 px-3 py-2 font-mono text-sm text-text-muted select-all truncate">
                      {currentProject.id}
                    </span>
                    <CopyButton text={currentProject.id} label="Project ID" />
                  </div>
                </div>
              </div>

              {canManageProject && (
                <div className="flex flex-col gap-3 mt-5 pt-5 border-t border-border">
                  {projFeedback && <InlineFeedback msg={projFeedback} />}
                  <div className="flex items-center gap-2.5">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setProjectNameInput(currentProject.name || '')}
                      disabled={projectNameInput === currentProject.name}
                    >
                      Discard
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleUpdateProjectName}
                      disabled={projectNameInput === currentProject.name}
                    >
                      Save changes
                    </Button>
                  </div>
                </div>
              )}
            </Section>

            {/* SDK ingestion key */}
            <Section
              title="SDK ingestion key"
              subtitle="Use this key in your SDK configuration. The full key was shown once at creation — only a preview is stored."
            >
              {apiKeyDisplay ? (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center bg-background border border-border rounded-md pr-1 overflow-hidden max-w-lg">
                    <span className="flex-1 px-3 py-2.5 font-mono text-sm text-primary select-all truncate">
                      {apiKeyDisplay}
                    </span>
                    <CopyButton text={currentProject.api_key_preview} label="API key preview" />
                  </div>
                  <p className="text-sm text-text-muted font-mono">
                    Only the first 12 characters are stored. Rotate below if the key has been compromised.
                  </p>
                </div>
              ) : (
                <div className="flex items-start gap-3 p-4 bg-accent-warning/5 border border-accent-warning/25 rounded-md max-w-lg">
                  <AlertTriangle className="w-5 h-5 text-accent-warning shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-medium text-accent-warning">Key preview unavailable</p>
                    <p className="text-sm text-text-muted mt-0.5">
                      This project was created before previews were stored. Rotate the key below to generate a new one.
                    </p>
                  </div>
                  {canManageProject && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="shrink-0"
                      onClick={() => setActiveDangerModal('rotate')}
                    >
                      Generate new key
                    </Button>
                  )}
                </div>
              )}
            </Section>

            {/* Danger zone */}
            {canManageProject && (
              <div className="border border-accent-error/25 bg-accent-error/3 rounded-card overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-accent-error/8 rounded-full blur-3xl pointer-events-none" />

                <div className="flex items-center gap-2 px-6 py-4 border-b border-accent-error/15 bg-accent-error/5 relative z-10">
                  <AlertTriangle className="w-5 h-5 text-accent-error" />
                  <h3 className="text-base font-semibold text-accent-error">Danger zone</h3>
                </div>

                <div className="relative z-10 divide-y divide-border/50">

                  {/* Rotate key */}
                  <div className="flex items-center justify-between gap-6 px-6 py-5">
                    <div>
                      <p className="text-base font-medium text-text-primary">Rotate API key</p>
                      <p className="text-sm text-text-muted mt-0.5">
                        Immediately invalidates the current key. All connected services will stop sending data until updated.
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="shrink-0 !text-accent-error !border-accent-error/40 hover:!bg-accent-error/8 hover:!border-accent-error"
                      onClick={() => setActiveDangerModal('rotate')}
                    >
                      <RotateCw className="w-4 h-4 mr-1.5" />
                      Rotate key
                    </Button>
                  </div>

                  {/* Delete project */}
                  {canDeleteProject && (
                    <div className="flex items-center justify-between gap-6 px-6 py-5">
                      <div>
                        <p className="text-base font-medium text-text-primary">Delete project</p>
                        <p className="text-sm text-text-muted mt-0.5">
                          Permanently removes all logs, metrics, traces, alerts and configuration. This cannot be undone.
                        </p>
                      </div>
                      <Button
                        variant="danger"
                        size="sm"
                        className="shrink-0"
                        onClick={() => setActiveDangerModal('delete')}
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                        Delete project
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── TAB 3: Organization ──────────────────────────── */}
        {activeTab === 'org' && currentOrg && (
          <div className="flex flex-col gap-5">

            {/* Invite member */}
            {canManageMembers && (
              <Section
                title="Invite member"
                subtitle="Send an email invitation. The recipient will join as a member and can be promoted later."
              >
                <form onSubmit={handleInviteSubmit} className="flex flex-col gap-4">
                  <div className="flex gap-2.5 items-start max-w-lg">
                    <div className="flex-1">
                      <Input
                        type="email"
                        placeholder="colleague@company.com"
                        icon={Mail}
                        value={inviteEmail}
                        onChange={e => setInviteEmail(e.target.value)}
                        required
                        autoComplete="off"
                      />
                    </div>
                    <Button type="submit" variant="primary" size="md" icon={<Send className="w-3.5 h-3.5" />}>
                      Send invite
                    </Button>
                  </div>

                  {inviteFeedback && <InlineFeedback msg={inviteFeedback} />}
                </form>

                {/* Pending invitations */}
                {invites.length > 0 && (
                  <div className="mt-5 pt-5 border-t border-border flex flex-col gap-2">
                    <p className="text-sm font-medium text-text-muted uppercase tracking-widest font-mono mb-1">
                      Pending invitations
                    </p>
                    {invites.map(inv => (
                      <div
                        key={inv.id}
                        className="flex items-center justify-between px-3 py-2.5 bg-background border border-border rounded-md"
                      >
                        <div className="flex items-center gap-2.5">
                          <Mail className="w-4 h-4 text-text-muted shrink-0" />
                          <span className="text-base font-mono text-text-secondary">{inv.email}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-text-muted">
                            {new Date(inv.created_at).toLocaleDateString()}
                          </span>
                          <button
                            onClick={() => handleRevokeInvite(inv.id)}
                            className="text-sm text-accent-error hover:text-accent-error/80 font-medium transition-colors duration-fast"
                          >
                            Revoke
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Section>
            )}

            {/* Member list */}
            <div className="bg-surface border border-border rounded-card overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-background/30">
                <div>
                  <h3 className="text-base font-semibold text-text-primary">Members</h3>
                  <p className="text-sm text-text-muted mt-0.5">{members.length} active member{members.length !== 1 ? 's' : ''}</p>
                </div>
                <span className="text-xs font-mono text-text-muted bg-background border border-border rounded px-2 py-1">
                  {members.length} active
                </span>
              </div>

              {/* Table header */}
              <div className="grid px-6 py-2.5 border-b border-border bg-background/20 text-xs font-mono uppercase tracking-widest text-text-muted"
                style={{ gridTemplateColumns: '2fr 1fr 1fr auto' }}
              >
                <span>Member</span>
                <span>Role</span>
                <span>Joined</span>
                <span />
              </div>

              {isLoadingOrgData ? (
                <div className="flex items-center justify-center py-12">
                  <p className="text-base text-text-muted font-mono">Loading members…</p>
                </div>
              ) : members.length === 0 ? (
                <ListEmpty label="No members found in this organization." />
              ) : (
                <div className="divide-y divide-border/50">
                  {members.map(member => {
                    const isMemberOwner = member.role === 'owner';
                    const name  = member.user_name || member.full_name;
                    const email = member.user_email || member.email;
                    return (
                      <div
                        key={member.id}
                        className="grid items-center px-6 py-3.5 hover:bg-surface-hover transition-colors duration-fast"
                        style={{ gridTemplateColumns: '2fr 1fr 1fr auto' }}
                      >
                        {/* Member identity */}
                        <div className="flex items-center gap-3 min-w-0">
                          <MemberAvatar name={name} email={email} />
                          <div className="min-w-0">
                            <p className="text-base font-medium text-text-primary flex items-center gap-1.5 truncate">
                              {name || 'Member'}
                              {isMemberOwner && (
                                <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
                              )}
                            </p>
                            <p className="text-sm font-mono text-text-muted truncate">{email}</p>
                          </div>
                        </div>

                        {/* Role badge */}
                        <div>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-badge text-xs font-mono uppercase tracking-wide border
                            ${isMemberOwner
                              ? 'text-primary bg-primary/10 border-primary/20'
                              : member.role === 'admin'
                                ? 'text-secondary bg-secondary/10 border-secondary/20'
                                : 'text-text-muted bg-surface-active border-border-light'
                            }`}
                          >
                            {member.role}
                          </span>
                        </div>

                        {/* Joined date */}
                        <span className="text-sm font-mono text-text-muted">
                          {member.joined_at
                            ? new Date(member.joined_at).toISOString().split('T')[0]
                            : '—'}
                        </span>

                        {/* Remove action */}
                        <div className="flex justify-end">
                          {canManageMembers && !isMemberOwner && (
                            <button
                              onClick={() => handleExpelMember(member.id || member.user_id)}
                              title="Remove member"
                              className="p-1.5 text-text-muted hover:text-accent-error hover:bg-accent-error/8 rounded-md transition-colors duration-fast"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* ── Danger modals ──────────────────────────────────── */}
      {activeDangerModal === 'rotate' && (
        <DangerActionModal
          title="Rotate API key"
          description="Rotating the key will immediately invalidate the current one. All services using it will stop sending data until you update them with the new key."
          expectedText="ROTATE"
          confirmLabel="Rotate key"
          onClose={() => setActiveDangerModal(null)}
          onConfirm={handleRotateKey}
        />
      )}

      {activeDangerModal === 'delete' && (
        <DangerActionModal
          title={`Delete project: ${currentProject?.name}`}
          description={`This will permanently delete "${currentProject?.name}" and all its logs, metrics, traces, and configuration. This action cannot be undone.`}
          expectedText={currentProject?.name}
          confirmLabel="Delete project"
          onClose={() => setActiveDangerModal(null)}
          onConfirm={handleDeleteProject}
        />
      )}

    </div>
  );
};

export default Settings;