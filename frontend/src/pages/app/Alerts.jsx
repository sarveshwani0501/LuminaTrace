// import React, { useState, useEffect, useCallback } from 'react';
// import { useSelector } from 'react-redux';
// import { 
//   Bell, CheckCircle2, AlertTriangle, Clock, Server, 
//   Trash2, Search, Filter, Plus, X, ChevronDown, Inbox
// } from 'lucide-react';
// import { alertsApi } from '../../api/alerts';

// const AVAILABLE_METRICS = [
//   { id: 'cpu_usage', label: 'CPU Usage', unit: '%', placeholder: 'e.g. 85.0', defaultCondition: '>', min: 0, max: 100 },
//   { id: 'memory_used_percent', label: 'Memory Utilization', unit: '%', placeholder: 'e.g. 90.0', defaultCondition: '>', min: 0, max: 100 },
//   { id: 'response_time', label: 'API Latency', unit: 'ms', placeholder: 'e.g. 1500', defaultCondition: '>', min: 0, max: 60000 },
//   { id: 'active_connections', label: 'DB/Active Connections', unit: 'count', placeholder: 'e.g. 500', defaultCondition: '>', min: 0, max: 100000 },
//   { id: 'error_count', label: 'Error Count', unit: 'count', placeholder: 'e.g. 50', defaultCondition: '>', min: 0, max: 100000 },
//   { id: 'http_request_count', label: 'Request Volume', unit: 'count', placeholder: 'e.g. 10000', defaultCondition: '>', min: 0, max: 1000000 },
// ];

// const CONDITION_OPTIONS = [
//   { value: '>', label: 'Greater than (>)' },
//   { value: '<', label: 'Less than (<)' },
//   { value: '==', label: 'Equals (==)' },
// ];

// // Reusable Empty State component
// const ListEmpty = ({ label }) => (
//   <div className="w-full h-full min-h-[300px] flex flex-col items-center justify-center text-center p-8">
//     <Inbox className="w-12 h-12 text-[#2d333b] mb-4" />
//     <p className="text-sm font-mono text-[#8b949e] tracking-wide">{label}</p>
//   </div>
// );

// // Custom styled dark theme select
// const CustomSelect = ({ options, valueKey, labelKey, value, onChange, label, className = '' }) => {
//   const [isOpen, setIsOpen] = useState(false);
//   const selectedObj = options.find(o => o[valueKey] === value) || options[0];
  
//   return (
//     <div className={`relative ${className}`}>
//       <label className="block text-xs font-mono text-[#8b949e] uppercase mb-1.5">{label}</label>
//       <div 
//         onClick={() => setIsOpen(!isOpen)}
//         className="w-full bg-[#11151c] border border-[#2d333b] text-white text-sm rounded-lg px-4 py-2.5 cursor-pointer flex justify-between items-center hover:border-[#a5b4fc] transition-colors"
//       >
//         <span>{selectedObj[labelKey]}</span>
//         <ChevronDown className={`w-4 h-4 text-[#8b949e] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
//       </div>
      
//       {isOpen && (
//         <React.Fragment>
//           <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
//           <div className="absolute top-[105%] left-0 right-0 bg-[#161b22] border border-[#2d333b] rounded-lg shadow-xl z-50 overflow-hidden max-h-48 overflow-y-auto no-scrollbar">
//             {options.map(opt => (
//               <div 
//                 key={opt[valueKey]}
//                 onClick={() => { onChange(opt[valueKey]); setIsOpen(false); }}
//                 className={`px-4 py-2.5 text-sm cursor-pointer hover:bg-[#1c212b] transition-colors flex items-center justify-between ${value === opt[valueKey] ? 'bg-[#1c212b] text-white' : 'text-[#c9d1d9]'}`}
//               >
//                 <span>{opt[labelKey]}</span>
//                 {value === opt[valueKey] && <CheckCircle2 className="w-4 h-4 text-[#818cf8]" />}
//               </div>
//             ))}
//           </div>
//         </React.Fragment>
//       )}
//     </div>
//   );
// };

// const CreateRuleModal = ({ projectId, onClose, onSaveComplete }) => {
//   const [formData, setFormData] = useState({ 
//     metric_id: AVAILABLE_METRICS[0].id, 
//     condition: AVAILABLE_METRICS[0].defaultCondition, 
//     threshold: '', 
//     email: '' 
//   });
  
//   const [errorMsg, setErrorMsg] = useState('');
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   // Dynamically resolve references
//   const activeMetric = AVAILABLE_METRICS.find(m => m.id === formData.metric_id) || AVAILABLE_METRICS[0];

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setErrorMsg('');

//     // Strict Validations
//     if (!formData.threshold || isNaN(formData.threshold)) {
//       return setErrorMsg('Threshold must be a valid numeric value.');
//     }
    
//     // Contextual Metric Boundary Validations
//     const numericThreshold = Number(formData.threshold);
//     if (activeMetric.min !== undefined && numericThreshold < activeMetric.min) {
//        return setErrorMsg(`Invalid input: ${activeMetric.label} cannot be lower than ${activeMetric.min}.`);
//     }
//     if (activeMetric.max !== undefined && numericThreshold > activeMetric.max) {
//        return setErrorMsg(`Invalid input: ${activeMetric.label} cannot exceed ${activeMetric.max}${activeMetric.unit === '%' ? '%' : ''}.`);
//     }

//     // Robust Regex Email validation preventing naive spoofing
//     const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
//     if (!emailRegex.test(formData.email)) {
//       return setErrorMsg('Please enter a strictly valid email routing address.');
//     }

//     try {
//       setIsSubmitting(true);
      
//       const payload = {
//         metricName: activeMetric.id,
//         condition: formData.condition,
//         threshold: numericThreshold,
//         email: formData.email
//       };

//       await alertsApi.createRule(projectId, payload);
//       onSaveComplete();
//       onClose();

//     } catch (err) {
//       console.error(err);
//       setErrorMsg(err.response?.data?.error || 'Failed to successfully deploy telemetry rule.');
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
//       <div className="bg-[#0d1117] border border-[#2d333b] rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col pt-1">
        
//         <div className="flex justify-between items-center px-6 py-4 border-b border-[#2d333b] bg-[#161b22]">
//           <div>
//              <h2 className="text-white font-bold text-lg mb-0.5">Configure Telemetry Rule</h2>
//              <p className="text-xs font-mono text-[#8b949e]">Define thresholds to monitor anomalies across your cosmic cluster.</p>
//           </div>
//           <button onClick={onClose} disabled={isSubmitting} className="p-2 ml-4 hover:bg-white/10 rounded-full transition-colors text-[#8b949e] hover:text-white disabled:opacity-50">
//              <X className="w-5 h-5"/>
//           </button>
//         </div>
        
//         <form onSubmit={handleSubmit} className="p-6 space-y-5 bg-[#0a0c10]">
          
//           {errorMsg && (
//             <div className="w-full bg-[#450a0a]/50 border border-[#7f1d1d] text-[#fca5a5] px-4 py-3 rounded-lg text-sm flex items-start animate-in fade-in">
//               <AlertTriangle className="w-4 h-4 mr-2 mt-0.5 shrink-0" />
//               <span>{errorMsg}</span>
//             </div>
//           )}

//           <CustomSelect 
//             label="Target Telemetry Metric"
//             options={AVAILABLE_METRICS}
//             valueKey="id"
//             labelKey="label"
//             value={formData.metric_id}
//             onChange={(val) => {
//                const newMetric = AVAILABLE_METRICS.find(m => m.id === val);
//                setFormData({ ...formData, metric_id: val, condition: newMetric.defaultCondition, threshold: '' });
//             }}
//           />
          
//           <div className="flex space-x-4">
//             <CustomSelect 
//               className="w-[45%]"
//               label="Evaluation"
//               options={CONDITION_OPTIONS}
//               valueKey="value"
//               labelKey="label"
//               value={formData.condition}
//               onChange={(val) => setFormData({...formData, condition: val})}
//             />

//             <div className="w-[55%]">
//               <label className="block text-xs font-mono text-[#8b949e] uppercase mb-1.5 flex justify-between">
//                  Threshold Value <span className="text-[#6366f1]">{activeMetric.unit}</span>
//               </label>
//               <div className="relative">
//                  <input 
//                     type="text"
//                     placeholder={activeMetric.placeholder} 
//                     value={formData.threshold} 
//                     onChange={e => {
//                        const val = e.target.value.replace(/[^0-9.]/g, '');
//                        const parts = val.split('.');
//                        const formatted = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : val;
//                        setFormData({...formData, threshold: formatted});
//                     }}
//                     className="w-full bg-[#11151c] border border-[#2d333b] text-white text-sm rounded-lg px-4 py-2.5 pr-10 focus:outline-none focus:border-[#a5b4fc] transition-colors" 
//                  />
//                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-mono text-[#4b5563] pointer-events-none">
//                     {activeMetric.unit}
//                  </span>
//               </div>
//             </div>
//           </div>
          
//           <div>
//             <label className="block text-xs font-mono text-[#8b949e] uppercase mb-1.5 flex justify-between">
//                Notification Routing <span className="text-[10px] text-[#4b5563] lowercase">Email</span>
//             </label>
//             <input 
//                type="text" 
//                placeholder="oncall.engineer@luminatrace.io" 
//                value={formData.email} 
//                onChange={e => setFormData({...formData, email: e.target.value})} 
//                className="w-full bg-[#11151c] border border-[#2d333b] text-white text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#a5b4fc] transition-colors" 
//             />
//           </div>

//           <div className="pt-4 flex justify-end space-x-3 border-t border-[#2d333b] pt-5 mt-2">
//              <button type="button" onClick={onClose} disabled={isSubmitting} className="px-5 py-2 text-sm text-[#8b949e] hover:text-white font-medium transition-colors disabled:opacity-50">Abort</button>
//              <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-gradient-to-r from-[#818cf8] to-[#c084fc] hover:opacity-90 disabled:opacity-50 text-white text-sm font-semibold rounded-lg shadow-[0_0_20px_rgba(129,140,248,0.3)] transition-all flex items-center">
//                 {isSubmitting ? 'Deploying...' : 'Deploy Monitor'}
//              </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// const Alerts = () => {
//   const { currentProject } = useSelector(state => state.project);
//   const projectId = currentProject?.id;

//   const [activeTab, setActiveTab] = useState('history'); // 'history' | 'rules'
//   const [events, setEvents] = useState([]);
//   const [rules, setRules] = useState([]);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [isLoading, setIsLoading] = useState(true);

//   const fetchAlertData = useCallback(async () => {
//     if (!projectId) return;
//     setIsLoading(true);
//     try {
//       const [rulesRes, eventsRes] = await Promise.allSettled([
//         alertsApi.getRules(projectId),
//         alertsApi.getEvents(projectId)
//       ]);

//       if (rulesRes.status === 'fulfilled') {
//         setRules(rulesRes.value.data?.rules || []);
//       }
//       if (eventsRes.status === 'fulfilled') {
//         setEvents(eventsRes.value.data?.events || []);
//       }
//     } catch (err) {
//       console.error("Failed to load alerts module data", err);
//     } finally {
//       setIsLoading(false);
//     }
//   }, [projectId]);

//   useEffect(() => {
//     fetchAlertData();
//   }, [fetchAlertData]);

//   const firingCount = events.filter(e => e.status === 'firing').length;
//   const resolvedCount = events.filter(e => e.status === 'resolved').length;

//   // Derive MTTR from resolved events natively without mocks
//   const computeMeanTimeToResolve = () => {
//     const resolvedEvents = events.filter(e => e.status === 'resolved' && e.resolved_at && e.triggered_at);
//     if (resolvedEvents.length === 0) return 0;
    
//     const totalMinutes = resolvedEvents.reduce((acc, ev) => {
//       const start = new Date(ev.triggered_at);
//       const end = new Date(ev.resolved_at);
//       return acc + ((end - start) / 60000);
//     }, 0);
//     return Math.round(totalMinutes / resolvedEvents.length);
//   };

//   const calculateDuration = (start, end) => {
//     const d1 = new Date(start);
//     const d2 = end ? new Date(end) : new Date();
//     const diffMins = Math.floor((d2 - d1) / 60000);
//     if (diffMins < 60) return `${diffMins}m`;
//     const hrs = Math.floor(diffMins / 60);
//     const remaining = diffMins % 60;
//     return `${hrs}h ${remaining}m`;
//   };

//   const getMetricLabel = (metricId) => {
//     const found = AVAILABLE_METRICS.find(m => m.id === metricId);
//     return found ? found.label : metricId;
//   };

//   const handleRuleToggle = async (id, currentStatus) => {
//     try {
//       // Optimistic update
//       setRules(prev => prev.map(r => r.id === id ? { ...r, is_active: !currentStatus } : r));
//       await alertsApi.toggleRule(projectId, id, !currentStatus);
//     } catch (err) {
//       // Revert if error
//       setRules(prev => prev.map(r => r.id === id ? { ...r, is_active: currentStatus } : r));
//       console.error(err);
//     }
//   };

//   const handleDeleteRule = async (id) => {
//     try {
//       await alertsApi.deleteRule(projectId, id);
//       setRules(prev => prev.filter(r => r.id !== id));
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   return (
//     <div className="w-full flex flex-col h-[calc(100vh-80px)] overflow-hidden space-y-6 px-2 pb-4 pt-2">
      
//       {/* Header Row */}
//       <div className="flex justify-between items-start shrink-0">
//          <div>
//            <h1 className="text-3xl font-bold text-white tracking-tight mb-1">Active Alerts</h1>
//            <p className="text-sm font-mono text-[#8b949e]">Real-time alerting for anomaly remediation.</p>
//          </div>
//          <button onClick={() => setIsModalOpen(true)} className="px-5 py-2.5 bg-gradient-to-r from-[#818cf8] to-[#c084fc] hover:opacity-90 text-white rounded-lg shadow-[0_0_20px_rgba(129,140,248,0.3)] font-semibold text-sm transition-all flex items-center active:scale-95">
//             <Bell className="w-4 h-4 mr-2" />
//             New Monitor
//          </button>
//       </div>

//       {/* KPI Ribbon */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6 shrink-0">
//          <div className="bg-[#11151c] border border-white/5 rounded-xl p-5 flex flex-col justify-center relative overflow-hidden">
//             <div className="absolute top-0 right-0 w-32 h-32 bg-[#ef4444]/5 blur-[50px] rounded-full pointer-events-none"></div>
//             <span className="text-[10px] font-mono tracking-widest text-[#8b949e] uppercase mb-2">Total Firing Alerts</span>
//             <div className="flex items-baseline space-x-3">
//               <span className="text-4xl font-bold font-mono text-white tracking-tighter">{firingCount}</span>
//               {firingCount > 0 && <span className="text-xs font-mono text-[#fca5a5] flex items-center bg-[#450a0a] px-1.5 py-0.5 rounded border border-[#7f1d1d]"><AlertTriangle className="w-3 h-3 mr-1"/> Action Req</span>}
//             </div>
//          </div>
         
//          <div className="bg-[#11151c] border border-white/5 rounded-xl p-5 flex flex-col justify-center relative overflow-hidden">
//             <div className="absolute top-0 right-0 w-32 h-32 bg-[#a5b4fc]/5 blur-[50px] rounded-full pointer-events-none"></div>
//             <span className="text-[10px] font-mono tracking-widest text-[#8b949e] uppercase mb-2">Mean Time to Resolve</span>
//             <div className="flex items-baseline space-x-1">
//               <span className="text-4xl font-bold font-mono text-white tracking-tighter">{computeMeanTimeToResolve()}</span>
//               <span className="text-xl font-mono text-[#8b949e]">m</span>
//             </div>
//          </div>

//          <div className="bg-[#11151c] border border-white/5 rounded-xl p-5 flex flex-col justify-center relative overflow-hidden">
//             <div className="absolute top-0 right-0 w-32 h-32 bg-[#10b981]/5 blur-[50px] rounded-full pointer-events-none"></div>
//             <span className="text-[10px] font-mono tracking-widest text-[#8b949e] uppercase mb-2">Total Resolved</span>
//             <div className="flex items-baseline space-x-3">
//               <span className="text-4xl font-bold font-mono text-white tracking-tighter">{resolvedCount}</span>
//               <span className="text-xs text-[#8b949e] font-mono">STABLE</span>
//             </div>
//          </div>
//       </div>

//       {/* Main Tabbed Console */}
//       <div className="flex-1 min-h-0 bg-[#11151c] border border-white/5 rounded-xl flex flex-col overflow-hidden">
         
//          {/* Tab Headers */}
//          <div className="w-full border-b border-[#2d333b] bg-[#161b22] px-6 py-0 flex space-x-8 shrink-0">
//             <button 
//               onClick={() => setActiveTab('history')}
//               className={`py-4 text-sm font-medium border-b-2 flex items-center transition-colors ${activeTab === 'history' ? 'border-[#a5b4fc] text-white' : 'border-transparent text-[#8b949e] hover:text-[#c9d1d9]'}`}
//             >
//                <Clock className="w-4 h-4 mr-2" /> Recent Triggers
//             </button>
//             <button 
//               onClick={() => setActiveTab('rules')}
//               className={`py-4 text-sm font-medium border-b-2 flex items-center transition-colors ${activeTab === 'rules' ? 'border-[#a5b4fc] text-white' : 'border-transparent text-[#8b949e] hover:text-[#c9d1d9]'}`}
//             >
//                <Filter className="w-4 h-4 mr-2" /> Configured Rules
//             </button>
//          </div>

//          {/* Content Area Rendering */}
//          <div className="flex-1 overflow-y-auto w-full no-scrollbar relative">
           
//            {isLoading ? (
//              <div className="w-full h-full flex flex-col items-center justify-center pt-24 text-[#8b949e] font-mono text-sm">Loading telemetry configurations...</div>
//            ) : activeTab === 'history' ? (
//              <div className="w-full h-full flex flex-col">
//                 <div className="w-full border-b border-[#2d333b] px-6 py-3 flex text-[10px] font-mono tracking-widest text-[#8b949e] uppercase sticky top-0 bg-[#11151c]/95 backdrop-blur z-10">
//                   <div className="w-[30%]">Alert Description Context</div>
//                   <div className="w-[15%]">Violated Value</div>
//                   <div className="w-[20%]">Server Target</div>
//                   <div className="w-[15%]">Duration Active</div>
//                   <div className="w-[20%] text-right pr-4">Status</div>
//                 </div>

//                 {events.length === 0 ? (
//                    <ListEmpty label="No anomaly events have triggered yet. Your system is perfectly stable." />
//                 ) : (
//                   events.map((ev) => (
//                     <div key={ev.event_id} className="w-full px-6 py-4 flex items-center border-b border-white/5 hover:bg-[#161b22] transition-colors">
//                        <div className="w-[30%]">
//                           <h4 className="text-white text-sm font-semibold truncate">{getMetricLabel(ev.metric_name)} Anomaly</h4>
//                           <p className="text-xs font-mono text-[#8b949e] mt-1 truncate">Condition: {getMetricLabel(ev.metric_name)} {ev.condition} {ev.threshold}</p>
//                        </div>
//                        <div className="w-[15%]">
//                           <span className="font-mono text-sm text-[#fca5a5]">{ev.triggered_value}</span>
//                        </div>
//                        <div className="w-[20%] flex items-center text-[#c9d1d9] text-xs font-mono">
//                           <Server className="w-3.5 h-3.5 mr-2 text-[#8b949e]"/> {ev.server_name || ev.server_hostname || 'Cluster Node'}
//                        </div>
//                        <div className="w-[15%] font-mono text-xs text-[#8b949e]">
//                           {calculateDuration(ev.triggered_at, ev.resolved_at)}
//                        </div>
//                        <div className="w-[20%] flex justify-end">
//                           <span className={`px-3 py-1 text-[10px] font-bold tracking-wider rounded-full border ${ev.status === 'firing' ? 'bg-[#450a0a]/50 text-[#ef4444] border-[#7f1d1d]' : 'bg-[#064e3b]/50 text-[#10b981] border-[#065f46]'}`}>
//                             {ev.status.toUpperCase()}
//                           </span>
//                        </div>
//                     </div>
//                   ))
//                 )}
//              </div>
//            ) : (
//              <div className="w-full h-full flex flex-col">
//                 <div className="w-full border-b border-[#2d333b] px-6 py-3 flex text-[10px] font-mono tracking-widest text-[#8b949e] uppercase sticky top-0 bg-[#11151c]/95 backdrop-blur z-10">
//                   <div className="w-[30%]">Monitored Metric</div>
//                   <div className="w-[15%]">Condition Evaluated</div>
//                   <div className="w-[25%]">Routing Details</div>
//                   <div className="w-[15%] text-center">Active State</div>
//                   <div className="w-[15%] text-right pr-4">Actions</div>
//                 </div>

//                 {rules.length === 0 ? (
//                   <ListEmpty label="Configure a telemetry rule monitor to get notified on system anomalies." />
//                 ) : (
//                   rules.map((rule) => (
//                     <div key={rule.id} className={`w-full px-6 py-4 flex items-center border-b border-white/5 transition-colors ${rule.is_active ? 'hover:bg-[#161b22]' : 'opacity-60 bg-black/20'}`}>
//                        <div className="w-[30%] font-semibold text-white text-sm">
//                           {getMetricLabel(rule.metric_name)}
//                        </div>
//                        <div className="w-[15%]">
//                           <span className="px-2 py-1 bg-white/5 border border-white/10 rounded font-mono text-xs text-[#c9d1d9] tracking-wider">
//                              METRIC {rule.condition} {rule.threshold}
//                           </span>
//                        </div>
//                        <div className="w-[25%] text-[#8b949e] text-xs font-mono truncate pr-4">
//                           {rule.notification_email}
//                        </div>
//                        <div className="w-[15%] flex justify-center">
//                           <button 
//                              onClick={() => handleRuleToggle(rule.id, rule.is_active)}
//                              className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors ${rule.is_active ? 'bg-[#818cf8]' : 'bg-[#4b5563]'}`}
//                           >
//                              <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${rule.is_active ? 'translate-x-4' : 'translate-x-1'}`} />
//                           </button>
//                        </div>
//                        <div className="w-[15%] flex justify-end">
//                           <button onClick={() => handleDeleteRule(rule.id)} className="p-1.5 text-[#8b949e] hover:text-[#ef4444] hover:bg-[#ef4444]/10 rounded bg-transparent transition-colors">
//                              <Trash2 className="w-4 h-4"/>
//                           </button>
//                        </div>
//                     </div>
//                   ))
//                 )}
//              </div>
//            )}

//          </div>
//       </div>
      
//       {isModalOpen && (
//         <CreateRuleModal 
//           projectId={projectId} 
//           onClose={() => setIsModalOpen(false)} 
//           onSaveComplete={() => {
//              setActiveTab('rules');
//              fetchAlertData(); // Reload perfectly parsed schema format explicitly from postres query to avoid optimistic object mismatch
//           }} 
//         />
//       )}
      
//     </div>
//   );
// };

// export default Alerts;
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useSelector } from 'react-redux';
import {
  Bell, CheckCircle2, AlertTriangle, Clock,
  Server, Trash2, Filter, Plus, X, ChevronDown,
  Inbox, AlertCircle, Check
} from 'lucide-react';
import { alertsApi } from '../../api/alerts';
import Button from '../../components/ui/Button';

/* ─────────────────────────────────────────────────────────────────
   CONSTANTS  (stable — module scope)
───────────────────────────────────────────────────────────────── */
const AVAILABLE_METRICS = [
  { id: 'cpu_usage',          label: 'CPU Usage',              unit: '%',     placeholder: 'e.g. 85.0',   defaultCondition: '>', min: 0, max: 100    },
  { id: 'memory_used_percent',label: 'Memory Utilization',     unit: '%',     placeholder: 'e.g. 90.0',   defaultCondition: '>', min: 0, max: 100    },
  { id: 'response_time',      label: 'API Latency',            unit: 'ms',    placeholder: 'e.g. 1500',   defaultCondition: '>', min: 0, max: 60000  },
  { id: 'active_connections', label: 'Active Connections',     unit: 'count', placeholder: 'e.g. 500',    defaultCondition: '>', min: 0, max: 100000 },
  { id: 'error_count',        label: 'Error Count',            unit: 'count', placeholder: 'e.g. 50',     defaultCondition: '>', min: 0, max: 100000 },
  { id: 'http_request_count', label: 'Request Volume',         unit: 'count', placeholder: 'e.g. 10000',  defaultCondition: '>', min: 0, max: 1000000},
];

const CONDITION_OPTIONS = [
  { value: '>',  label: 'Greater than (>)'  },
  { value: '<',  label: 'Less than (<)'     },
  { value: '==', label: 'Equals (==)'       },
];

/* ─────────────────────────────────────────────────────────────────
   PURE HELPERS  (module scope — never recreated)
───────────────────────────────────────────────────────────────── */
const getMetricLabel = (metricId) =>
  AVAILABLE_METRICS.find(m => m.id === metricId)?.label ?? metricId;

const getMetricUnit = (metricId) =>
  AVAILABLE_METRICS.find(m => m.id === metricId)?.unit ?? '';

const calculateDuration = (start, end) => {
  const d1 = new Date(start);
  const d2 = end ? new Date(end) : new Date();
  const diffMins = Math.floor((d2 - d1) / 60000);
  if (diffMins < 60) return `${diffMins}m`;
  const hrs = Math.floor(diffMins / 60);
  return `${hrs}h ${diffMins % 60}m`;
};

/* ─────────────────────────────────────────────────────────────────
   EMPTY STATE
───────────────────────────────────────────────────────────────── */
const EmptyState = ({ label, sub }) => (
  <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
    <Inbox className="w-8 h-8 text-border" />
    <div>
      <p className="text-sm font-medium text-text-muted">{label}</p>
      {sub && <p className="text-xs text-text-muted/60 mt-1 max-w-xs mx-auto">{sub}</p>}
    </div>
  </div>
);

/* ─────────────────────────────────────────────────────────────────
   CUSTOM SELECT  (with outside-click close)
───────────────────────────────────────────────────────────────── */
const CustomSelect = ({ options, valueKey, labelKey, value, onChange, label, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);
  const selectedObj = options.find(o => o[valueKey] === value) ?? options[0];

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setIsOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  return (
    <div className={`relative ${className}`} ref={ref}>
      {label && (
        <label className="block text-xs font-mono text-text-muted uppercase tracking-widest mb-1.5">
          {label}
        </label>
      )}
      <button
        type="button"
        onClick={() => setIsOpen(v => !v)}
        className={`w-full bg-background border rounded-md px-3 py-2 text-sm text-text-primary flex items-center justify-between
          ring-0 ring-offset-0 focus:outline-none focus:ring-2 transition-[border-color,box-shadow] duration-fast
          ${isOpen
            ? 'border-primary ring-primary/20'
            : 'border-border hover:border-border-light focus:border-primary focus:ring-primary/20'
          }`}
      >
        <span>{selectedObj[labelKey]}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-text-muted transition-transform duration-fast ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-[calc(100%+4px)] left-0 right-0 bg-surface-elevated border border-border-light rounded-lg shadow-elevated z-50 overflow-hidden max-h-48 overflow-y-auto">
          {options.map(opt => (
            <button
              key={opt[valueKey]}
              type="button"
              onClick={() => { onChange(opt[valueKey]); setIsOpen(false); }}
              className={`w-full flex items-center justify-between px-3 py-2.5 text-sm transition-colors duration-fast text-left
                ${value === opt[valueKey]
                  ? 'bg-surface-hover text-text-primary'
                  : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
                }`}
            >
              <span>{opt[labelKey]}</span>
              {value === opt[valueKey] && <Check className="w-3.5 h-3.5 text-primary shrink-0" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────
   TOGGLE SWITCH
───────────────────────────────────────────────────────────────── */
const Toggle = ({ checked, onChange }) => (
  <button
    type="button"
    onClick={onChange}
    aria-checked={checked}
    role="switch"
    className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors duration-base focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 focus-visible:ring-offset-background
      ${checked ? 'bg-primary' : 'bg-border-light'}`}
  >
    <span className={`inline-block h-3 w-3 rounded-full bg-white shadow transition-transform duration-base ${checked ? 'translate-x-4' : 'translate-x-0.5'}`} />
  </button>
);

/* ─────────────────────────────────────────────────────────────────
   CREATE RULE MODAL
───────────────────────────────────────────────────────────────── */
const CreateRuleModal = ({ projectId, onClose, onSaveComplete }) => {
  const [formData, setFormData] = useState({
    metric_id: AVAILABLE_METRICS[0].id,
    condition: AVAILABLE_METRICS[0].defaultCondition,
    threshold: '',
    email: '',
  });
  const [errorMsg,     setErrorMsg]     = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeMetric = AVAILABLE_METRICS.find(m => m.id === formData.metric_id) ?? AVAILABLE_METRICS[0];

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape' && !isSubmitting) onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isSubmitting, onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.threshold || isNaN(formData.threshold)) {
      return setErrorMsg('Threshold must be a valid numeric value.');
    }

    const numericThreshold = Number(formData.threshold);
    if (activeMetric.min !== undefined && numericThreshold < activeMetric.min) {
      return setErrorMsg(`${activeMetric.label} cannot be lower than ${activeMetric.min}.`);
    }
    if (activeMetric.max !== undefined && numericThreshold > activeMetric.max) {
      return setErrorMsg(`${activeMetric.label} cannot exceed ${activeMetric.max}${activeMetric.unit === '%' ? '%' : ''}.`);
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(formData.email)) {
      return setErrorMsg('Please enter a valid email address.');
    }

    try {
      setIsSubmitting(true);
      const payload = {
        metricName: activeMetric.id,
        condition:  formData.condition,
        threshold:  numericThreshold,
        email:      formData.email,
      };
      await alertsApi.createRule(projectId, payload);
      onSaveComplete();
      onClose();
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.error || 'Failed to create alert rule. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/65 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget && !isSubmitting) onClose(); }}
    >
      <div className="bg-background border border-border rounded-card shadow-elevated w-full max-w-lg overflow-hidden flex flex-col">

        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-border bg-surface">
          <div>
            <h2 className="text-sm font-semibold text-text-primary">New alert rule</h2>
            <p className="text-xs font-mono text-text-muted mt-0.5">
              Set a threshold — get notified when it's breached
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 text-text-muted hover:text-text-primary hover:bg-surface-hover rounded-md transition-colors duration-fast disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5 bg-background">

          {/* Error banner */}
          {errorMsg && (
            <div className="flex items-start gap-2 px-3 py-2.5 rounded-md bg-accent-error/10 border border-accent-error/30 text-accent-error text-sm">
              <AlertCircle className="w-4 h-4 shrink-0 mt-px" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Metric selector */}
          <CustomSelect
            label="Metric"
            options={AVAILABLE_METRICS}
            valueKey="id"
            labelKey="label"
            value={formData.metric_id}
            onChange={(val) => {
              const newMetric = AVAILABLE_METRICS.find(m => m.id === val);
              setFormData({ ...formData, metric_id: val, condition: newMetric.defaultCondition, threshold: '' });
            }}
          />

          {/* Condition + Threshold */}
          <div className="grid grid-cols-2 gap-4">
            <CustomSelect
              label="Condition"
              options={CONDITION_OPTIONS}
              valueKey="value"
              labelKey="label"
              value={formData.condition}
              onChange={(val) => setFormData({ ...formData, condition: val })}
            />

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-mono text-text-muted uppercase tracking-widest">
                  Threshold
                </label>
                <span className="text-[10px] font-mono text-primary">{activeMetric.unit}</span>
              </div>
              <div className="relative">
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder={activeMetric.placeholder}
                  value={formData.threshold}
                  onChange={e => {
                    const val  = e.target.value.replace(/[^0-9.]/g, '');
                    const parts = val.split('.');
                    const formatted = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : val;
                    setFormData({ ...formData, threshold: formatted });
                  }}
                  className="w-full bg-background border border-border rounded-md px-3 py-2 pr-10 text-sm text-text-primary placeholder:text-text-muted
                    ring-0 ring-offset-0 focus:outline-none focus:ring-2 focus:border-primary focus:ring-primary/20
                    hover:border-border-light transition-[border-color,box-shadow] duration-fast"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-text-muted pointer-events-none">
                  {activeMetric.unit}
                </span>
              </div>
            </div>
          </div>

          {/* Notification email */}
          <div>
            <label className="block text-xs font-mono text-text-muted uppercase tracking-widest mb-1.5">
              Notification email
            </label>
            <input
              type="text"
              placeholder="oncall@company.com"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-text-primary placeholder:text-text-muted
                ring-0 ring-offset-0 focus:outline-none focus:ring-2 focus:border-primary focus:ring-primary/20
                hover:border-border-light transition-[border-color,box-shadow] duration-fast"
            />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border">
            <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" loading={isSubmitting}>
              {isSubmitting ? 'Creating…' : 'Create rule'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────
   ALERTS PAGE
───────────────────────────────────────────────────────────────── */
const Alerts = () => {
  const { currentProject } = useSelector(state => state.project);
  const projectId = currentProject?.id;

  const [activeTab,   setActiveTab]   = useState('history');
  const [events,      setEvents]      = useState([]);
  const [rules,       setRules]       = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading,   setIsLoading]   = useState(true);

  /* ── Fetch ────────────────────────────────────────────────── */
  const fetchAlertData = useCallback(async () => {
    if (!projectId) return;
    setIsLoading(true);
    try {
      const [rulesRes, eventsRes] = await Promise.allSettled([
        alertsApi.getRules(projectId),
        alertsApi.getEvents(projectId),
      ]);
      if (rulesRes.status  === 'fulfilled') setRules(rulesRes.value.data?.rules   || []);
      if (eventsRes.status === 'fulfilled') setEvents(eventsRes.value.data?.events || []);
    } catch (err) {
      console.error('Failed to load alerts', err);
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => { fetchAlertData(); }, [fetchAlertData]);

  /* ── Derived stats (memoised — not called inline in JSX) ─── */
  const firingCount   = useMemo(() => events.filter(e => e.status === 'firing').length,   [events]);
  const resolvedCount = useMemo(() => events.filter(e => e.status === 'resolved').length, [events]);

  const mttr = useMemo(() => {
    const resolved = events.filter(e => e.status === 'resolved' && e.resolved_at && e.triggered_at);
    if (!resolved.length) return 0;
    const totalMins = resolved.reduce((acc, ev) => {
      return acc + (new Date(ev.resolved_at) - new Date(ev.triggered_at)) / 60000;
    }, 0);
    return Math.round(totalMins / resolved.length);
  }, [events]);

  /* ── Handlers ─────────────────────────────────────────────── */
  const handleRuleToggle = async (id, currentStatus) => {
    // Optimistic update
    setRules(prev => prev.map(r => r.id === id ? { ...r, is_active: !currentStatus } : r));
    try {
      await alertsApi.toggleRule(projectId, id, !currentStatus);
    } catch (err) {
      // Revert on failure
      setRules(prev => prev.map(r => r.id === id ? { ...r, is_active: currentStatus } : r));
      console.error(err);
    }
  };

  const handleDeleteRule = async (id) => {
    try {
      await alertsApi.deleteRule(projectId, id);
      setRules(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  /* ─────────────────────────────────────────────────────────── */
  return (
    <div className="w-full flex flex-col h-[calc(100vh-80px)] overflow-hidden gap-5 px-1 pb-4 pt-1">

      {/* ── Header ──────────────────────────────────────────── */}
      <div className="flex items-start justify-between shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight mb-1">Alerts</h1>
          <p className="text-sm text-text-muted mt-1">Real-time alerting and threshold monitoring</p>
        </div>
        <Button
          variant="primary"
          size="md"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setIsModalOpen(true)}
        >
          New alert rule
        </Button>
      </div>

      {/* ── KPI ribbon ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">

        {/* Firing */}
        <div className="bg-surface border border-border rounded-card p-5 relative overflow-hidden group transition-all duration-base hover:border-border-light hover:shadow-elevated">
          <p className="text-[10px] font-mono uppercase tracking-widest text-accent-error mb-2">Firing now</p>
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-semibold font-mono leading-none text-accent-error">{firingCount}</span>
            {firingCount > 0 && (
              <span className="inline-flex items-center gap-1.5 text-[10px] font-mono text-accent-error bg-accent-error/10 border border-accent-error/25 rounded px-2 py-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-error animate-pulse" />
                Action required
              </span>
            )}
          </div>
          <div className="absolute -bottom-5 -right-5 w-20 h-20 rounded-full blur-2xl opacity-10 group-hover:opacity-20 transition-opacity duration-slow pointer-events-none bg-accent-error" />
        </div>

        {/* MTTR */}
        <div className="bg-surface border border-border rounded-card p-5 relative overflow-hidden group transition-all duration-base hover:border-border-light hover:shadow-elevated">
          <p className="text-[10px] font-mono uppercase tracking-widest text-text-muted mb-2">Avg MTTR</p>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-semibold font-mono leading-none text-text-primary">{mttr}</span>
            <span className="text-base text-text-muted font-mono">min</span>
          </div>
          <p className="text-[10px] font-mono text-text-muted/60 mt-1">Mean time to resolve</p>
          <div className="absolute -bottom-5 -right-5 w-20 h-20 rounded-full blur-2xl opacity-10 group-hover:opacity-20 transition-opacity duration-slow pointer-events-none bg-primary" />
        </div>

        {/* Resolved */}
        <div className="bg-surface border border-border rounded-card p-5 relative overflow-hidden group transition-all duration-base hover:border-border-light hover:shadow-elevated">
          <p className="text-[10px] font-mono uppercase tracking-widest text-accent-success mb-2">Resolved</p>
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-semibold font-mono leading-none text-accent-success">{resolvedCount}</span>
            <span className="text-[10px] font-mono text-accent-success/70 bg-accent-success/8 border border-accent-success/20 rounded px-2 py-0.5">
              stable
            </span>
          </div>
          <div className="absolute -bottom-5 -right-5 w-20 h-20 rounded-full blur-2xl opacity-10 group-hover:opacity-20 transition-opacity duration-slow pointer-events-none bg-accent-success" />
        </div>

      </div>

      {/* ── Tabbed console ──────────────────────────────────── */}
      <div className="flex-1 min-h-0 bg-surface border border-border rounded-card flex flex-col overflow-hidden">

        {/* Tab nav */}
        <div className="flex border-b border-border bg-background/30 px-4 shrink-0">
          {[
            { key: 'history', label: 'Recent triggers', icon: Clock   },
            { key: 'rules',   label: 'Alert rules',     icon: Filter  },
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 py-3 px-4 text-sm font-medium border-b-2 transition-colors duration-fast
                  ${activeTab === tab.key
                    ? 'border-primary text-text-primary'
                    : 'border-transparent text-text-muted hover:text-text-secondary'
                  }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
                {/* Badge on history tab when there are firing events */}
                {tab.key === 'history' && firingCount > 0 && (
                  <span className="text-[9px] font-mono font-semibold text-accent-error bg-accent-error/10 border border-accent-error/25 rounded-full px-1.5 py-px">
                    {firingCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        <div className="flex-1 min-h-0 overflow-y-auto">

          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm font-mono text-text-muted">Loading…</p>
            </div>

          ) : activeTab === 'history' ? (
            /* ── History tab ──────────────────────────────── */
            <div className="flex flex-col h-full">
              <div
                className="grid px-5 py-2.5 border-b border-border bg-background/20 sticky top-0 z-10
                  text-[9px] font-mono uppercase tracking-widest text-text-muted select-none"
                style={{ gridTemplateColumns: '2fr 1fr 1.5fr 1fr 1fr' }}
              >
                <div>Alert</div>
                <div>Triggered value</div>
                <div>Server</div>
                <div>Duration</div>
                <div className="text-right">Status</div>
              </div>

              {events.length === 0 ? (
                <EmptyState
                  label="No alerts triggered yet."
                  sub="Your system is stable. Alerts will appear here when a threshold is breached."
                />
              ) : (
                events.map(ev => (
                  <div
                    key={ev.event_id}
                    className="grid items-center px-5 py-3.5 border-b border-border/40 last:border-b-0 hover:bg-surface-hover transition-colors duration-fast"
                    style={{ gridTemplateColumns: '2fr 1fr 1.5fr 1fr 1fr' }}
                  >
                    {/* Alert description */}
                    <div>
                      <p className="text-sm font-medium text-text-primary truncate">
                        {getMetricLabel(ev.metric_name)}
                      </p>
                      <p className="text-[10px] font-mono text-text-muted mt-0.5 truncate">
                        {ev.metric_name} {ev.condition} {ev.threshold}
                      </p>
                    </div>

                    {/* Triggered value — with unit context */}
                    <div>
                      <span className={`font-mono text-sm font-semibold ${ev.status === 'firing' ? 'text-accent-error' : 'text-log-warning'}`}>
                        {ev.triggered_value}
                        <span className="text-text-muted font-normal text-[10px] ml-0.5">
                          {getMetricUnit(ev.metric_name)}
                        </span>
                      </span>
                    </div>

                    {/* Server */}
                    <div className="flex items-center gap-1.5">
                      <Server className="w-3.5 h-3.5 text-text-muted shrink-0" />
                      <span className="font-mono text-xs text-text-secondary truncate">
                        {ev.server_name || ev.server_hostname || 'Unknown'}
                      </span>
                    </div>

                    {/* Duration */}
                    <div className="font-mono text-xs text-text-muted">
                      {calculateDuration(ev.triggered_at, ev.resolved_at)}
                    </div>

                    {/* Status pill */}
                    <div className="flex justify-end">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[9px] font-mono font-semibold uppercase tracking-wide
                        ${ev.status === 'firing'
                          ? 'bg-accent-error/8 text-accent-error border-accent-error/25'
                          : 'bg-accent-success/8 text-accent-success border-accent-success/25'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${ev.status === 'firing' ? 'bg-accent-error animate-pulse' : 'bg-accent-success'}`} />
                        {ev.status === 'firing' ? 'Firing' : 'Resolved'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

          ) : (
            /* ── Rules tab ────────────────────────────────── */
            <div className="flex flex-col h-full">
              <div
                className="grid px-5 py-2.5 border-b border-border bg-background/20 sticky top-0 z-10
                  text-[9px] font-mono uppercase tracking-widest text-text-muted select-none"
                style={{ gridTemplateColumns: '2fr 1.5fr 2fr 1fr 1fr' }}
              >
                <div>Metric</div>
                <div>Condition</div>
                <div>Notify</div>
                <div className="text-center">Enabled</div>
                <div className="text-right">Action</div>
              </div>

              {rules.length === 0 ? (
                <EmptyState
                  label="No alert rules configured."
                  sub="Create a rule to get notified when a metric crosses a threshold."
                />
              ) : (
                rules.map(rule => (
                  <div
                    key={rule.id}
                    className={`grid items-center px-5 py-3.5 border-b border-border/40 last:border-b-0 transition-all duration-fast
                      ${rule.is_active ? 'hover:bg-surface-hover' : 'opacity-50 bg-background/20'}`}
                    style={{ gridTemplateColumns: '2fr 1.5fr 2fr 1fr 1fr' }}
                  >
                    {/* Metric name */}
                    <p className="text-sm font-medium text-text-primary truncate">
                      {getMetricLabel(rule.metric_name)}
                    </p>

                    {/* Condition — show metric name + condition + threshold */}
                    <div>
                      <span className="inline-flex items-center px-2 py-px bg-background border border-border rounded text-[10px] font-mono text-text-secondary tracking-wide">
                        {rule.metric_name} {rule.condition} {rule.threshold}
                      </span>
                    </div>

                    {/* Notification email */}
                    <p className="text-xs font-mono text-text-muted truncate pr-3">
                      {rule.notification_email}
                    </p>

                    {/* Toggle */}
                    <div className="flex justify-center">
                      <Toggle
                        checked={rule.is_active}
                        onChange={() => handleRuleToggle(rule.id, rule.is_active)}
                      />
                    </div>

                    {/* Delete */}
                    <div className="flex justify-end">
                      <button
                        onClick={() => handleDeleteRule(rule.id)}
                        title="Delete rule"
                        className="p-1.5 text-text-muted hover:text-accent-error hover:bg-accent-error/8 rounded-md transition-colors duration-fast"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <CreateRuleModal
          projectId={projectId}
          onClose={() => setIsModalOpen(false)}
          onSaveComplete={() => {
            setActiveTab('rules');
            fetchAlertData();
          }}
        />
      )}
    </div>
  );
};

export default Alerts;