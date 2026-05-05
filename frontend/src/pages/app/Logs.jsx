// import React, { useState, useEffect, useCallback, useMemo } from 'react';
// import { useSelector } from 'react-redux';
// import { 
//   BarChart, Bar, ResponsiveContainer, Cell, Tooltip as RechartsTooltip, XAxis
// } from 'recharts';
// import { 
//   AlertCircle, Info, AlertTriangle, ExternalLink, Copy, 
//   TerminalSquare, Cpu, HardDrive, Search, Filter, Server, Clock, ChevronDown, Check, ChevronRight, Inbox
// } from 'lucide-react';
// import { io } from 'socket.io-client';
// import TraceWaterfallModal from '../../components/traces/TraceWaterfallModal';
// import { logsApi } from '../../api/logs';

// // ---- Pure helpers — defined at module scope to prevent recreation on each render ----
// const getLevelBadge = (level) => {
//   switch(level?.toUpperCase()) {
//     case 'ERROR': return 'text-[#fca5a5] bg-[#450a0a] border-[#7f1d1d]';
//     case 'WARN':  return 'text-[#fdba74] bg-[#451a03] border-[#78350f]';
//     case 'DEBUG': return 'text-[#67e8f9] bg-[#083344] border-[#164e63]';
//     default:      return 'text-[#8b949e] bg-[#1c212b] border-[#2d333b]';
//   }
// };

// const getLevelColor = (level) => {
//   switch(level?.toUpperCase()) {
//     case 'ERROR': return '#ef4444';
//     case 'WARN':  return '#f59e0b';
//     case 'DEBUG': return '#06b6d4';
//     default:      return '#8b949e';
//   }
// };

// const formatTime = (isoString) => {
//   if (!isoString) return '';
//   try {
//     const d = new Date(isoString);
//     return `${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}:${d.getSeconds().toString().padStart(2,'0')}.${d.getMilliseconds().toString().padStart(3,'0')}`;
//   } catch(e) { return isoString; }
// };

// const TIME_LABELS = { '15m': '15 min', '1h': '1 hour', '6h': '6 hours', '24h': '24 hours', '7d': '7 days' };

// const ChartEmpty = ({ label }) => (
//   <div className="w-full h-full flex flex-col items-center justify-center text-center px-4">
//     <Inbox className="w-8 h-8 text-[#2d333b] mb-3" />
//     <p className="text-[11px] text-[#8b949e] font-mono leading-tight bg-[#161b22] px-4 py-2 border border-[#2d333b] rounded-lg border-dashed">
//       {label}
//     </p>
//   </div>
// );

// const Logs = () => {
//   const { currentProject } = useSelector(state => state.project);
//   const projectId = currentProject?.id;

//   const [isLiveStream, setIsLiveStream] = useState(true);
//   const [expandedLogId, setExpandedLogId] = useState(null);
  
//   // Custom Filters mapping directly to backend API
//   const [timeRange, setTimeRange] = useState('1h');
//   const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [selectedLevels, setSelectedLevels] = useState([]);
//   const [activeTraceId, setActiveTraceId] = useState(null);
  
//   // Backend State
//   const [logs, setLogs] = useState([]);
//   const [volumeData, setVolumeData] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);

//   // Helper: map volume intervals safely
//   const parseVolumeData = (data = [], range = '1h') => {
//     const showDate = ['6h', '24h', '7d'].includes(range);
//     return data.map(d => {
//       const dt = new Date(d.time_bucket || d.time || d.bucket);
//       const timeStr = showDate
//         ? dt.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' +
//           dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
//         : dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
//       return {
//         time: timeStr,
//         count: parseInt(d.log_count || d.value || 0, 10),
//         isPeak: false,
//       };
//     }).reverse(); // Usually comes DESC from DB, chart needs ASC
//   };

//   const fetchLogsData = useCallback(async () => {
//     if (!projectId) return;
//     setIsLoading(true);
    
//     try {
//       const primaryLevel = selectedLevels.length === 1 ? selectedLevels[0] : undefined;
//       const [logsRes, volumeRes] = await Promise.allSettled([
//          logsApi.getLogs(projectId, { timerange: timeRange, level: primaryLevel, limit: 150 }),
//          logsApi.getVolume(projectId, timeRange)
//       ]);
//       if (logsRes.status === 'fulfilled') {
//         const d = logsRes.value.data?.logs || [];
//         setLogs(Array.isArray(d) ? d.map((log, i) => {
//           let meta = log.metadata;
//           if (typeof meta === 'string') {
//             try { meta = JSON.parse(meta); } catch(e) {}
//           }
//           return { ...log, id: log.id || `${log.time}-${i}`, metadata: meta };
//         }) : []);
//       }
      
//       if (volumeRes.status === 'fulfilled') {
//         const v = volumeRes.value.data?.data || volumeRes.value.data || [];
//         const parsed = parseVolumeData(Array.isArray(v) ? v : [], timeRange);
        
//         // Mark highest volume count as Peak to highlight column
//         const maxCount = Math.max(...parsed.map(p => p.count), 0);
//         parsed.forEach(p => { p.isPeak = (p.count === maxCount && maxCount > 0); });
        
//         setVolumeData(parsed);
//       }
//     } catch (err) {
//       console.error('Logs fetch failed', err);
//     } finally {
//       setIsLoading(false);
//     }
//   }, [projectId, timeRange, selectedLevels]);

//   useEffect(() => {
//     fetchLogsData();
//   }, [fetchLogsData]);

//   // WebSockets setup
//   useEffect(() => {
//     if (!isLiveStream || !projectId) return;
//     const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:3000', { withCredentials: true });
//     socket.on('connect', () => socket.emit('join_project', projectId));
    
//     socket.on('new_log', (log) => {
//        // Only append if it passes the active level filter locally so UI doesn't bounce around
//        if (selectedLevels.length > 0 && !selectedLevels.includes(log.level)) return;
       
//        setLogs(prev => {
//           let meta = log.metadata;
//           if (typeof meta === 'string') {
//             try { meta = JSON.parse(meta); } catch(e) {}
//           }
//           const newLog = { ...log, id: log.id || `${log.time}-${Math.random().toString(36).substr(2, 9)}`, metadata: meta };
          
//           // Prevent duplicates by checking trace_id/message/time combo if id doesn't match
//           if (prev.find(p => p.id === newLog.id || (p.time === newLog.time && p.message === newLog.message))) return prev;
          
//           return [newLog, ...prev].slice(0, 150); 
//        });
//     });

//     return () => socket.disconnect();
//   }, [projectId, isLiveStream, selectedLevels]);


//   const toggleAccordion = (logId) => {
//     setExpandedLogId(prev => prev === logId ? null : logId);
//   };

//   // Memoised filter — only recomputes when logs, selectedLevels, or searchQuery change
//   const filteredLogs = useMemo(() => logs.filter(l => {
//     if (selectedLevels.length > 0 && !selectedLevels.includes(l.level)) return false;
//     if (searchQuery) {
//       const q = searchQuery.toLowerCase();
//       if (!l.message?.toLowerCase().includes(q) &&
//           !(l.trace_id && l.trace_id.toLowerCase().includes(q)) &&
//           !(l.metadata && JSON.stringify(l.metadata).toLowerCase().includes(q))) {
//         return false;
//       }
//     }
//     return true;
//   }), [logs, selectedLevels, searchQuery]);

//   return (
//     <div className="w-full flex flex-col h-[calc(100vh-80px)] overflow-hidden space-y-4 px-2 pb-4">
      
//       {/* HEADER & TOP TIER BLOCK */}
//       <div className="shrink-0 space-y-4 pt-2">
        
//         {/* Title & Level Filters */}
//         <div className="flex justify-between items-end">
//           <div>
//             <h1 className="text-3xl font-bold text-white tracking-tight mb-1">System Logs</h1>
//             <p className="text-xs font-mono text-[#8b949e]">
//               Streaming event history & telemetry
//               {filteredLogs.length > 0 && (
//                 <span className="ml-2 px-1.5 py-0.5 bg-[#1c212b] border border-[#2d333b] rounded text-[#a5b4fc] font-bold">
//                   {filteredLogs.length} {filteredLogs.length === 150 ? '(max)' : ''}
//                 </span>
//               )}
//             </p>
//           </div>
          
//           <div className="flex items-center space-x-3 justify-end">
//             <div className="flex items-center mr-2 border-r border-[#2d333b] pr-4">
//                <span className="text-xs font-mono text-[#8b949e] mr-2 tracking-widest uppercase">Live Tail</span>
//                <div 
//                  onClick={() => setIsLiveStream(!isLiveStream)}
//                  className={`w-8 h-4 rounded-full cursor-pointer relative transition-colors duration-300 ${isLiveStream ? 'bg-[#c084fc]' : 'bg-[#2d333b]'}`}
//                >
//                  <div className={`w-3.5 h-3.5 bg-white rounded-full absolute top-[1px] transition-transform duration-300 ${isLiveStream ? 'left-[17px]' : 'left-[1px]'}`}></div>
//                </div>
//             </div>

//             <div 
//               onClick={() => setSelectedLevels(prev => prev.includes('ERROR') ? prev.filter(l => l !== 'ERROR') : [...prev, 'ERROR'])}
//               className={`px-3 py-1.5 border rounded text-xs font-mono flex items-center cursor-pointer transition-colors ${selectedLevels.includes('ERROR') || selectedLevels.length === 0 ? 'bg-[#450a0a]/80 text-[#fca5a5] border-[#7f1d1d] shadow-[0_0_10px_rgba(239,68,68,0.1)]' : 'bg-[#11151c] text-[#8b949e] border-[#2d333b] hover:border-white/30'}`}>
//               <div className="w-1.5 h-1.5 rounded-full bg-[#ef4444] mr-2"></div>ERROR
//             </div>
//             <div 
//               onClick={() => setSelectedLevels(prev => prev.includes('WARN') ? prev.filter(l => l !== 'WARN') : [...prev, 'WARN'])}
//               className={`px-3 py-1.5 border rounded text-xs font-mono flex items-center cursor-pointer transition-colors ${selectedLevels.includes('WARN') || selectedLevels.length === 0 ? 'bg-[#451a03]/80 text-[#fdba74] border-[#78350f]' : 'bg-[#11151c] text-[#8b949e] border-[#2d333b] hover:border-white/30'}`}>
//               <div className="w-1.5 h-1.5 rounded-full bg-[#f59e0b] mr-2"></div>WARN
//             </div>
//             <div 
//                onClick={() => setSelectedLevels(prev => prev.includes('INFO') ? prev.filter(l => l !== 'INFO') : [...prev, 'INFO'])}
//                className={`px-3 py-1.5 border rounded text-xs font-mono flex items-center cursor-pointer transition-colors ${selectedLevels.includes('INFO') || selectedLevels.length === 0 ? 'bg-[#1c212b] text-[#c9d1d9] border-[#2d333b]' : 'bg-[#11151c] text-[#8b949e] border-[#2d333b] hover:border-white/30'}`}>
//                <div className="w-1.5 h-1.5 rounded-full bg-[#8b949e] mr-2"></div>INFO
//             </div>
//             <div 
//                onClick={() => setSelectedLevels(prev => prev.includes('DEBUG') ? prev.filter(l => l !== 'DEBUG') : [...prev, 'DEBUG'])}
//                className={`px-3 py-1.5 border rounded text-xs font-mono flex items-center cursor-pointer transition-colors ${selectedLevels.includes('DEBUG') || selectedLevels.length === 0 ? 'bg-[#083344]/80 text-[#67e8f9] border-[#164e63]' : 'bg-[#11151c] text-[#8b949e] border-[#2d333b] hover:border-white/30'}`}>
//                <div className="w-1.5 h-1.5 rounded-full bg-[#06b6d4] mr-2"></div>DEBUG
//             </div>
//             {selectedLevels.length > 0 && (
//               <button
//                 onClick={() => setSelectedLevels([])}
//                 className="px-3 py-1.5 border border-[#2d333b] rounded text-xs font-mono text-[#8b949e] hover:text-white hover:border-white/30 transition-colors"
//               >
//                 Clear
//               </button>
//             )}
//           </div>
//         </div>

//         {/* Action Filters Bar */}
//         <div className="flex space-x-4 items-center">
          
//           {/* Search Box */}
//           <div className="flex-1 relative">
//             <Search className="w-4 h-4 text-[#8b949e] absolute left-3 top-1/2 -translate-y-1/2" />
//             <input 
//               type="text" 
//               placeholder="Search logs via message, metadata, or trace id..." 
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               className="w-full bg-[#11151c] border border-white/10 text-white text-sm rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-[#a5b4fc] transition-colors"
//             />
//           </div>

//           {/* Log Count + Time Filter */}
//           <div className="flex items-center space-x-2">
//             <div className="relative z-[60]">
//               <div 
//                 onClick={() => setIsTimeDropdownOpen(!isTimeDropdownOpen)}
//                 className={`flex items-center bg-[#11151c] border cursor-pointer ${isTimeDropdownOpen ? 'border-[#818cf8]' : 'border-white/10'} hover:border-[#818cf8] transition-colors rounded-lg px-4 py-2 text-sm text-[#8b949e]`}
//               >
//                 <Clock className="w-4 h-4 mr-2" />
//                 <span>Last {TIME_LABELS[timeRange] || timeRange}</span>
//                 <ChevronDown className="w-4 h-4 ml-3" />
//               </div>
            
//             {isTimeDropdownOpen && (
//               <div className="absolute top-12 right-0 w-48 bg-[#161b22] border border-[#2d333b] rounded-lg shadow-xl z-50 overflow-hidden">
//                 {['15m', '1h', '6h', '24h', '7d'].map((t) => (
//                   <div 
//                     key={t}
//                     onClick={() => { setTimeRange(t); setIsTimeDropdownOpen(false); }}
//                     className={`px-4 py-3 text-sm cursor-pointer flex items-center justify-between ${timeRange === t ? 'text-white bg-[#1c212b]' : 'text-[#8b949e] hover:bg-[#1c212b] hover:text-white'}`}
//                   >
//                     <span>Last {TIME_LABELS[t] || t}</span>
//                     {timeRange === t && <Check className="w-4 h-4 text-[#c084fc]" />}
//                   </div>
//                 ))}
//               </div>
//             )}
//             </div>{/* end relative z-60 */}
//           </div>{/* end flex space-x-2 */}

//         </div>{/* end Action Filters Bar */}

//         {/* LOG VOLUME BAR CHART (100px strict height) */}
//         <div className="bg-[#11151c] border border-white/5 rounded-xl p-3 h-[110px] flex flex-col relative w-full overflow-hidden">
//            <div className="flex justify-between items-center mb-1 z-10 w-full shrink-0">
//              <span className="text-[10px] font-mono tracking-widest text-[#8b949e] uppercase">Event Volume Distribution</span>
//            </div>
//            <div className="absolute inset-x-4 bottom-2 top-8">
//              {volumeData.length === 0 ? (
//                 <ChartEmpty label="No volume data recorded in this time range." />
//              ) : (
//                 <ResponsiveContainer width="100%" height="100%">
//                   <BarChart data={volumeData}>
//                     <RechartsTooltip 
//                       cursor={{ fill: 'rgba(255,255,255,0.05)' }}
//                       content={({ active, payload, label }) => {
//                         if (active && payload && payload.length) {
//                           return (
//                             <div className="bg-[#0d1117]/95 border border-white/10 p-2 rounded-lg shadow-2xl backdrop-blur-sm z-50">
//                               <p className="text-[10px] text-[#8b949e] mb-1 font-mono uppercase tracking-wider">{label}</p>
//                               <p className="text-white text-xs font-mono"><span className="text-[#a5b4fc] font-bold">{payload[0].value}</span> Logs</p>
//                             </div>
//                           );
//                         }
//                         return null;
//                       }}
//                     />
//                     <Bar dataKey="count" radius={[2,2,0,0]}>
//                       {volumeData.map((entry, index) => (
//                         <Cell key={`cell-${index}`} fill={entry.isPeak ? '#a5b4fc' : '#2d333b'} fillOpacity={entry.isPeak ? 1 : 0.8} />
//                       ))}
//                     </Bar>
//                     <XAxis dataKey="time" hide />
//                   </BarChart>
//                 </ResponsiveContainer>
//              )}
//            </div>
//         </div>
//       </div>


//       {/* MIDDLE TIER: ACCORDION LOG LIST */}
//       <div className="flex-1 min-h-0 bg-[#0d1117] border border-white/5 rounded-xl flex flex-col overflow-hidden relative shadow-inner">
//         {filteredLogs.length === 0 ? (
//            <ChartEmpty label={isLoading ? "Loading logs..." : "No logs available. They will appear here when an agent transmits them."} />
//         ) : (
//            <div className="flex-1 flex flex-col w-full min-h-0">
//              {/* TABLE HEADER */}
//              <div className="flex items-center px-4 py-2 bg-[#161b22] border-b border-white/5 text-[10px] font-mono tracking-widest text-[#8b949e] uppercase select-none shrink-0 rounded-t-xl z-10 sticky top-0">
//                 <div className="w-8 shrink-0"></div>
//                 <div className="w-24 shrink-0">Time</div>
//                 <div className="w-20 shrink-0 text-center">Level</div>
//                 <div className="w-32 shrink-0">Server</div>
//                 <div className="w-32 shrink-0 px-2">Trace ID</div>
//                 <div className="w-32 shrink-0 px-2">Span ID</div>
//                 <div className="flex-1 pl-4">Message</div>
//              </div>
             
//              {/* LOG ITEMS */}
//              <div className="flex-1 overflow-y-auto w-full p-2 space-y-1">
//              {filteredLogs.map((log) => {
//                const isExpanded = expandedLogId === log.id;
               
//                return (
//                  <div 
//                    key={log.id}
//                    className={`w-full rounded-lg transition-all duration-200 border ${
//                      isExpanded 
//                      ? 'bg-[#161b22] border-[#2d333b] shadow-md mb-2 pb-2' 
//                      : 'bg-[#11151c] border-transparent hover:border-[#2d333b] hover:bg-[#161b22] cursor-pointer'
//                    }`}
//                  >
//                    {/* ROW HEADER (Always Visible) */}
//                    <div 
//                      className="px-4 py-2.5 flex items-center group cursor-pointer select-none"
//                      onClick={() => toggleAccordion(log.id)}
//                    >
//                      {/* Indicator */}
//                      <div className="w-8 shrink-0 flex items-center justify-start">
//                         <ChevronRight className={`w-4 h-4 text-[#8b949e] transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} />
//                      </div>
                     
//                      {/* Time */}
//                      <div className="w-24 shrink-0 text-[#8b949e] font-mono text-[11px]">
//                        {formatTime(log.time)}
//                      </div>
                     
//                      {/* Level */}
//                      <div className="w-20 shrink-0 flex justify-center px-2">
//                        <span className={`px-2 py-0.5 border rounded text-[9px] font-bold tracking-wider w-full text-center ${getLevelBadge(log.level)}`}>
//                          {log.level || 'INFO'}
//                        </span>
//                      </div>
                     
//                      {/* Server */}
//                      <div className="w-32 shrink-0 text-[#c9d1d9] font-mono text-[11px] truncate pr-4" title={log.server_name || log.server_hostname || 'Local-Node'}>
//                        {log.server_name || log.server_hostname || 'Local-Node'}
//                      </div>

//                      {/* Trace ID */}
//                      <div className="w-32 shrink-0 text-[#a5b4fc] font-mono text-[11px] truncate px-2" title={log.trace_id}>
//                        {log.trace_id ? log.trace_id.substring(0, 8) + '...' : <span className="text-[#4b5563]">-</span>}
//                      </div>

//                      {/* Span ID */}
//                      <div className="w-32 shrink-0 text-[#818cf8] font-mono text-[11px] truncate px-2" title={log.span_id}>
//                        {log.span_id ? log.span_id.substring(0, 8) + '...' : <span className="text-[#4b5563]">-</span>}
//                      </div>
                     
//                      {/* Message Preview */}
//                      <div 
//                        className={`flex-1 pl-4 text-xs font-semibold pr-2 transition-colors ${isExpanded ? 'text-white line-clamp-1' : 'text-[#8b949e] truncate group-hover:text-[#c9d1d9]'}`}
//                        style={{ color: !isExpanded && log.level?.toUpperCase() === 'ERROR' ? '#fca5a5' : undefined }}
//                      >
//                         {log.message}
//                      </div>
//                    </div>

//                    {/* EXPANDED CONTENT AREA */}
//                    {isExpanded && (
//                      <div className="px-14 pt-2 pb-4 flex flex-col space-y-4 cursor-default">
                        
//                         {/* Full Multi-line Message Block */}
//                         <div className="bg-[#0a0c10] border border-[#2d333b] rounded-md p-3 whitespace-pre-wrap text-sm font-mono text-[#e5e7eb] leading-relaxed select-text" style={{ borderColor: log.level?.toUpperCase() === 'ERROR' ? '#7f1d1d' : '#2d333b' }}>
//                            {log.message}
//                         </div>
                        
//                         <div className="flex flex-row space-x-4 w-full">
//                            {/* Metadata JSON Block */}
//                            <div className="flex-1 bg-[#0a0c10] border border-[#2d333b] rounded-md p-3 overflow-hidden flex flex-col">
//                               <span className="text-[10px] font-mono tracking-widest text-[#8b949e] uppercase mb-2 border-b border-[#2d333b] pb-2 inline-block">Context Metadata</span>
//                               <pre className="text-[11px] font-mono text-[#818cf8] overflow-x-auto whitespace-pre-wrap flex-1 select-text">
//                                 {log.metadata ? JSON.stringify(log.metadata, null, 2) : '{}'}
//                               </pre>
//                            </div>

//                            {/* Trace Panel */}
//                            <div className="w-64 bg-[#0a0c10] border border-[#2d333b] rounded-md p-4 flex flex-col items-center justify-center shrink-0">
//                               <span className="text-[10px] font-mono tracking-widest text-[#8b949e] uppercase mb-4 w-full text-center">Distributed Trace</span>
//                               {log.trace_id ? (
//                                 <div className="flex flex-col items-center space-y-3 w-full">
//                                     <div className="group flex items-center bg-[#161b22] border border-[#2d333b] rounded w-full overflow-hidden shadow-inner">
//                                        <div className="flex-1 px-3 py-2 font-mono text-[#a5b4fc] text-[11px] text-center select-text">
//                                           {log.trace_id}
//                                        </div>
//                                        <button 
//                                          className="px-3 h-full border-l border-[#2d333b] hover:bg-[#818cf8] hover:text-white text-[#8b949e] transition-colors"
//                                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigator.clipboard.writeText(log.trace_id); }}
//                                          title="Copy exact trace id"
//                                        >
//                                          <Copy className="w-3.5 h-3.5" />
//                                        </button>
//                                     </div>
//                                     <button 
//                                         onClick={() => setActiveTraceId(log.trace_id)}
//                                         className="w-full flex items-center justify-center bg-gradient-to-r from-[#818cf8]/10 to-[#c084fc]/10 hover:from-[#818cf8]/20 hover:to-[#c084fc]/20 border border-[#818cf8]/30 px-4 py-2 rounded text-xs font-bold text-white transition-all active:scale-95"
//                                     >
//                                         <ExternalLink className="w-3.5 h-3.5 mr-2 text-[#c084fc]" />
//                                         View Trace Waterfall
//                                     </button>
//                                 </div>
//                               ) : (
//                                 <p className="text-[11px] font-mono text-[#4b5563] text-center py-4">No trace isolated for this span context.</p>
//                               )}
//                            </div>
//                         </div>

//                      </div>
//                    )}

//                  </div>
//                );
//              })}
//              </div>
//            </div>
//         )}
//       </div>

//       {/* RENDER WATERFALL MODAL */}
//       {activeTraceId && (
//         <TraceWaterfallModal 
//            traceId={activeTraceId}
//            projectId={projectId}
//            onClose={() => setActiveTraceId(null)} 
//         />
//       )}

//     </div>
//   );
// };

// export default Logs;


import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import {
  BarChart, Bar, ResponsiveContainer, Cell,
  Tooltip as RechartsTooltip, XAxis
} from 'recharts';
import {
  Search, Clock, ChevronDown, ChevronRight,
  Check, Copy, ExternalLink, Inbox
} from 'lucide-react';
import { io } from 'socket.io-client';
import TraceWaterfallModal from '../../components/traces/TraceWaterfallModal';
import { logsApi } from '../../api/logs';

/* ─────────────────────────────────────────────────────────────────
   MODULE-SCOPE PURE HELPERS  (never recreated on render)
───────────────────────────────────────────────────────────────── */
const TIME_LABELS = {
  '15m': 'Last 15 min',
  '1h':  'Last 1 hour',
  '6h':  'Last 6 hours',
  '24h': 'Last 24 hours',
  '7d':  'Last 7 days',
};

const LEVELS = [
  { key: 'ERROR', dot: '#EF4444', active: 'bg-log-criticalSubtle text-log-error border-log-error/30',   inactive: 'bg-surface text-text-muted border-border' },
  { key: 'WARN',  dot: '#F59E0B', active: 'bg-log-warningSubtle text-log-warning border-log-warning/30', inactive: 'bg-surface text-text-muted border-border' },
  { key: 'INFO',  dot: '#94A3B8', active: 'bg-log-infoSubtle text-log-info border-log-info/20',          inactive: 'bg-surface text-text-muted border-border' },
  { key: 'DEBUG', dot: '#6366F1', active: 'bg-log-debugSubtle text-log-debug border-log-debug/30',       inactive: 'bg-surface text-text-muted border-border' },
];

/** Log level badge classes using theme log.* tokens */
const getLevelCls = (level) => {
  switch (level?.toUpperCase()) {
    case 'ERROR':    return 'text-log-error    bg-log-errorSubtle    border-log-error/25';
    case 'critical': // fall-through
    case 'CRITICAL': return 'text-log-critical bg-log-criticalSubtle border-log-critical/25';
    case 'WARN':
    case 'WARNING':  return 'text-log-warning  bg-log-warningSubtle  border-log-warning/25';
    case 'DEBUG':    return 'text-log-debug    bg-log-debugSubtle    border-log-debug/25';
    default:         return 'text-log-info     bg-log-infoSubtle     border-log-info/15';
  }
};

/** Message text color for error-level rows */
const getMsgCls = (level) =>
  level?.toUpperCase() === 'ERROR' || level?.toUpperCase() === 'CRITICAL'
    ? 'text-log-error'
    : 'text-text-secondary group-hover:text-text-primary';

/** Format ISO timestamp → HH:MM:SS.mmm */
const formatTime = (iso) => {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    return `${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}:${d.getSeconds().toString().padStart(2,'0')}.${d.getMilliseconds().toString().padStart(3,'0')}`;
  } catch { return iso; }
};

/** Parse volume timeseries → chart-ready array */
const parseVolumeData = (data = [], range = '1h') => {
  const showDate = ['6h', '24h', '7d'].includes(range);
  const parsed = data.map(d => {
    const dt = new Date(d.time_bucket || d.time || d.bucket);
    const time = showDate
      ? dt.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' +
        dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return { time, count: parseInt(d.log_count || d.value || 0, 10), isPeak: false };
  }).reverse();

  const maxCount = Math.max(...parsed.map(p => p.count), 0);
  parsed.forEach(p => { p.isPeak = p.count === maxCount && maxCount > 0; });
  return parsed;
};

/* ─────────────────────────────────────────────────────────────────
   VOLUME TOOLTIP  (module scope — stable reference for Recharts)
───────────────────────────────────────────────────────────────── */
const VolumeTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface-elevated border border-border-light rounded-lg px-3 py-2 shadow-elevated text-xs font-mono z-50">
      <p className="text-text-muted mb-1">{label}</p>
      <p className="text-primary font-semibold">{payload[0].value} logs</p>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────
   EMPTY STATE
───────────────────────────────────────────────────────────────── */
const EmptyState = ({ label }) => (
  <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-center px-6 py-10">
    <Inbox className="w-7 h-7 text-border" />
    <p className="text-xs font-mono text-text-muted">{label}</p>
  </div>
);

/* ─────────────────────────────────────────────────────────────────
   COPY BUTTON (inline, tiny)
───────────────────────────────────────────────────────────────── */
const CopyBtn = ({ text }) => {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="px-2 py-1 border-l border-border text-text-muted hover:text-text-primary hover:bg-surface-hover transition-colors duration-fast"
    >
      {copied ? <Check className="w-3 h-3 text-accent-success" /> : <Copy className="w-3 h-3" />}
    </button>
  );
};

/* ─────────────────────────────────────────────────────────────────
   LOGS PAGE
───────────────────────────────────────────────────────────────── */
const Logs = () => {
  const { currentProject } = useSelector(state => state.project);
  const projectId = currentProject?.id;

  const [isLiveStream,       setIsLiveStream]       = useState(true);
  const [expandedLogId,      setExpandedLogId]      = useState(null);
  const [timeRange,          setTimeRange]          = useState('1h');
  const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false);
  const [searchQuery,        setSearchQuery]        = useState('');
  const [selectedLevels,     setSelectedLevels]     = useState([]);
  const [activeTraceId,      setActiveTraceId]      = useState(null);
  const [logs,               setLogs]               = useState([]);
  const [volumeData,         setVolumeData]         = useState([]);
  const [isLoading,          setIsLoading]          = useState(true);

  /* ── Fetch ────────────────────────────────────────────────── */
  const fetchLogsData = useCallback(async () => {
    if (!projectId) return;
    setIsLoading(true);
    try {
      const primaryLevel = selectedLevels.length === 1 ? selectedLevels[0] : undefined;
      const [logsRes, volumeRes] = await Promise.allSettled([
        logsApi.getLogs(projectId, { timerange: timeRange, level: primaryLevel, limit: 150 }),
        logsApi.getVolume(projectId, timeRange),
      ]);

      if (logsRes.status === 'fulfilled') {
        const d = logsRes.value.data?.logs || [];
        setLogs(Array.isArray(d) ? d.map((log, i) => {
          let meta = log.metadata;
          if (typeof meta === 'string') { try { meta = JSON.parse(meta); } catch (_) {} }
          return { ...log, id: log.id || `${log.time}-${i}`, metadata: meta };
        }) : []);
      }

      if (volumeRes.status === 'fulfilled') {
        const v = volumeRes.value.data?.data || volumeRes.value.data || [];
        setVolumeData(parseVolumeData(Array.isArray(v) ? v : [], timeRange));
      }
    } catch (err) {
      console.error('Logs fetch failed', err);
    } finally {
      setIsLoading(false);
    }
  }, [projectId, timeRange, selectedLevels]);

  useEffect(() => { fetchLogsData(); }, [fetchLogsData]);

  /* ── Socket ───────────────────────────────────────────────── */
  useEffect(() => {
    if (!isLiveStream || !projectId) return;
    const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:3000', { withCredentials: true });
    socket.on('connect', () => socket.emit('join_project', projectId));

    socket.on('new_log', (log) => {
      if (selectedLevels.length > 0 && !selectedLevels.includes(log.level)) return;
      setLogs(prev => {
        let meta = log.metadata;
        if (typeof meta === 'string') { try { meta = JSON.parse(meta); } catch (_) {} }
        const newLog = {
          ...log,
          id: log.id || `${log.time}-${Math.random().toString(36).substr(2, 9)}`,
          metadata: meta,
        };
        if (prev.find(p => p.id === newLog.id || (p.time === newLog.time && p.message === newLog.message))) return prev;
        return [newLog, ...prev].slice(0, 150);
      });
    });

    return () => socket.disconnect();
  }, [projectId, isLiveStream, selectedLevels]);

  /* ── Filtered logs (memoised) ─────────────────────────────── */
  const filteredLogs = useMemo(() => logs.filter(l => {
    if (selectedLevels.length > 0 && !selectedLevels.includes(l.level)) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        l.message?.toLowerCase().includes(q) ||
        (l.trace_id && l.trace_id.toLowerCase().includes(q)) ||
        (l.metadata && JSON.stringify(l.metadata).toLowerCase().includes(q))
      );
    }
    return true;
  }), [logs, selectedLevels, searchQuery]);

  /* ── Level pill toggle ────────────────────────────────────── */
  const toggleLevel = (key) =>
    setSelectedLevels(prev =>
      prev.includes(key) ? prev.filter(l => l !== key) : [...prev, key]
    );

  /* ── Dropdown close on outside click ─────────────────────── */
  useEffect(() => {
    if (!isTimeDropdownOpen) return;
    const handler = (e) => {
      if (!e.target.closest('[data-time-dropdown]')) setIsTimeDropdownOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isTimeDropdownOpen]);

  /* ─────────────────────────────────────────────────────────── */
  return (
    <div className="w-full flex flex-col h-[calc(100vh-80px)] overflow-hidden gap-3 px-1 pb-4 pt-1">

      {/* ── HEADER ──────────────────────────────────────────── */}
      <div className="shrink-0 flex flex-col gap-3">

        {/* Title row */}
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-xl font-semibold text-text-primary tracking-tight">Logs</h1>
            <p className="text-xs text-text-muted mt-0.5 font-mono flex items-center gap-2">
              Streaming event history
              {filteredLogs.length > 0 && (
                <span className="px-1.5 py-px bg-primary/10 border border-primary/20 rounded text-primary text-[10px] font-semibold">
                  {filteredLogs.length}{filteredLogs.length === 150 ? ' (max)' : ''}
                </span>
              )}
            </p>
          </div>

          {/* Level filters + live toggle */}
          <div className="flex items-center gap-2">

            {/* Live tail toggle */}
            <div className="flex items-center gap-2 pr-3 border-r border-border">
              {isLiveStream && (
                <span className="inline-flex items-center gap-1 text-[10px] font-mono text-accent-success bg-accent-success/8 border border-accent-success/20 rounded px-1.5 py-px">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-success animate-pulse" />
                  live
                </span>
              )}
              <span className="text-[10px] font-mono text-text-muted uppercase tracking-widest">Tail</span>
              <button
                onClick={() => setIsLiveStream(v => !v)}
                className={`w-8 h-4 rounded-full relative transition-colors duration-base cursor-pointer ${isLiveStream ? 'bg-primary' : 'bg-border-light'}`}
                aria-label="Toggle live stream"
              >
                <div className={`w-3 h-3 bg-white rounded-full absolute top-0.5 transition-all duration-base ${isLiveStream ? 'left-[18px]' : 'left-0.5'}`} />
              </button>
            </div>

            {/* Level pills */}
            {LEVELS.map(lvl => {
              const isActive = selectedLevels.length === 0 || selectedLevels.includes(lvl.key);
              return (
                <button
                  key={lvl.key}
                  onClick={() => toggleLevel(lvl.key)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[10px] font-mono font-semibold uppercase tracking-wide transition-all duration-fast
                    ${isActive ? lvl.active : lvl.inactive}`}
                >
                  <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: lvl.dot }} />
                  {lvl.key}
                </button>
              );
            })}

            {selectedLevels.length > 0 && (
              <button
                onClick={() => setSelectedLevels([])}
                className="text-[10px] font-mono text-text-muted hover:text-text-primary border border-border hover:border-border-light rounded-md px-2.5 py-1 transition-colors duration-fast"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Filter bar: search + time range */}
        <div className="flex gap-3 items-center">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="w-3.5 h-3.5 text-text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search message, trace ID, or metadata…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-background border border-border rounded-md pl-9 pr-3 py-2 text-sm text-text-primary placeholder:text-text-muted
                ring-0 ring-offset-0 focus:outline-none focus:ring-2 focus:border-primary focus:ring-primary/20
                hover:border-border-light transition-[border-color,box-shadow] duration-fast"
            />
          </div>

          {/* Time range */}
          <div className="relative" data-time-dropdown>
            <button
              onClick={() => setIsTimeDropdownOpen(v => !v)}
              className={`flex items-center gap-2 bg-surface border rounded-md px-3 py-2 text-xs font-mono transition-colors duration-fast
                ${isTimeDropdownOpen
                  ? 'border-primary text-primary'
                  : 'border-border text-text-secondary hover:border-border-light hover:text-text-primary'
                }`}
            >
              <Clock className="w-3.5 h-3.5" />
              {TIME_LABELS[timeRange] ?? timeRange}
              <ChevronDown className={`w-3 h-3 transition-transform duration-fast ${isTimeDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isTimeDropdownOpen && (
              <div className="absolute top-full mt-1 right-0 w-44 bg-surface-elevated border border-border-light rounded-lg shadow-elevated z-50 overflow-hidden">
                {Object.entries(TIME_LABELS).map(([val, label]) => (
                  <button
                    key={val}
                    onClick={() => { setTimeRange(val); setIsTimeDropdownOpen(false); }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 text-xs font-mono transition-colors duration-fast
                      ${timeRange === val
                        ? 'text-text-primary bg-surface-hover'
                        : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
                      }`}
                  >
                    {label}
                    {timeRange === val && <Check className="w-3 h-3 text-primary" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Volume chart */}
        <div className="bg-surface border border-border rounded-card px-4 pt-3 pb-2 h-[90px] flex flex-col gap-1.5">
          <span className="text-[9px] font-mono uppercase tracking-widest text-text-muted shrink-0">
            Event volume · {TIME_LABELS[timeRange] ?? timeRange}
          </span>
          <div className="flex-1 min-h-0">
            {volumeData.length === 0 ? (
              <EmptyState label="No volume data in this time range." />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={volumeData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <RechartsTooltip
                    cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                    content={(props) => <VolumeTooltip {...props} />}
                    animationDuration={0}
                    wrapperStyle={{ zIndex: 50 }}
                  />
                  <Bar dataKey="count" radius={[2, 2, 0, 0]}>
                    {volumeData.map((entry, i) => (
                      <Cell
                        key={`cell-${i}`}
                        fill={entry.isPeak ? '#7C3AED' : '#1E293B'}
                        fillOpacity={entry.isPeak ? 1 : 0.7}
                      />
                    ))}
                  </Bar>
                  <XAxis dataKey="time" hide />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* ── LOG TABLE ───────────────────────────────────────── */}
      <div className="flex-1 min-h-0 bg-[#0D1117] border border-border rounded-card flex flex-col overflow-hidden">

        {filteredLogs.length === 0 ? (
          <EmptyState
            label={isLoading
              ? 'Loading logs…'
              : 'No logs found. They will appear here once your services start sending events.'
            }
          />
        ) : (
          <div className="flex flex-col h-full">

            {/* Table header */}
            <div className="shrink-0 grid px-4 py-2.5 bg-background/60 border-b border-border sticky top-0 z-10
              text-[9px] font-mono uppercase tracking-widest text-text-muted select-none"
              style={{ gridTemplateColumns: '20px 80px 52px 110px 100px 100px 1fr' }}
            >
              <div />
              <div>Time</div>
              <div>Level</div>
              <div>Server</div>
              <div>Trace ID</div>
              <div>Span ID</div>
              <div className="pl-3">Message</div>
            </div>

            {/* Scrollable rows */}
            <div className="flex-1 overflow-y-auto px-2 py-1.5 flex flex-col gap-0.5">
              {filteredLogs.map(log => {
                const isExpanded = expandedLogId === log.id;
                return (
                  <div
                    key={log.id}
                    className={`rounded-md border transition-all duration-fast
                      ${isExpanded
                        ? 'bg-surface border-border-light shadow-glass mb-1'
                        : 'bg-transparent border-transparent hover:bg-surface hover:border-border cursor-pointer'
                      }`}
                  >
                    {/* Row header */}
                    <div
                      className="grid items-center px-2 py-2 cursor-pointer select-none group"
                      style={{ gridTemplateColumns: '20px 80px 52px 110px 100px 100px 1fr' }}
                      onClick={() => setExpandedLogId(prev => prev === log.id ? null : log.id)}
                    >
                      <ChevronRight className={`w-3.5 h-3.5 text-text-muted transition-transform duration-fast ${isExpanded ? 'rotate-90' : ''}`} />

                      {/* Time */}
                      <span className="font-mono text-[10px] text-text-muted">{formatTime(log.time)}</span>

                      {/* Level badge */}
                      <span className={`inline-flex items-center justify-center px-1.5 py-px rounded border font-mono text-[9px] font-semibold uppercase tracking-wide ${getLevelCls(log.level)}`}>
                        {(log.level ?? 'INFO').slice(0, 4)}
                      </span>

                      {/* Server */}
                      <span className="font-mono text-[10px] text-text-secondary truncate pr-2" title={log.server_name || log.server_hostname}>
                        {log.server_name || log.server_hostname || '—'}
                      </span>

                      {/* Trace ID */}
                      <span className="font-mono text-[10px] text-primary truncate" title={log.trace_id}>
                        {log.trace_id ? log.trace_id.substring(0, 8) + '…' : <span className="text-text-muted/40">—</span>}
                      </span>

                      {/* Span ID */}
                      <span className="font-mono text-[10px] text-log-debug truncate" title={log.span_id}>
                        {log.span_id ? log.span_id.substring(0, 8) + '…' : <span className="text-text-muted/40">—</span>}
                      </span>

                      {/* Message */}
                      <span className={`pl-3 text-xs truncate transition-colors duration-fast ${getMsgCls(log.level)}`}>
                        {log.message}
                      </span>
                    </div>

                    {/* Expanded detail */}
                    {isExpanded && (
                      <div className="px-10 pb-4 pt-2 flex flex-col gap-3">

                        {/* Full message */}
                        <div className={`bg-background border rounded-md p-3 whitespace-pre-wrap text-sm font-mono text-text-primary leading-relaxed select-text
                          ${log.level?.toUpperCase() === 'ERROR' || log.level?.toUpperCase() === 'CRITICAL'
                            ? 'border-log-error/30'
                            : 'border-border'
                          }`}
                        >
                          {log.message}
                        </div>

                        {/* Metadata + trace side by side */}
                        <div className="flex gap-3">

                          {/* Metadata */}
                          <div className="flex-1 bg-background border border-border rounded-md p-3 flex flex-col gap-2 min-w-0">
                            <span className="text-[9px] font-mono uppercase tracking-widest text-text-muted border-b border-border pb-1.5">
                              Metadata
                            </span>
                            <pre className="text-[11px] font-mono text-log-debug overflow-x-auto whitespace-pre-wrap select-text leading-relaxed">
                              {log.metadata ? JSON.stringify(log.metadata, null, 2) : '{}'}
                            </pre>
                          </div>

                          {/* Trace panel */}
                          <div className="w-56 shrink-0 bg-background border border-border rounded-md p-4 flex flex-col items-center gap-3">
                            <span className="text-[9px] font-mono uppercase tracking-widest text-text-muted self-stretch text-center">
                              Distributed trace
                            </span>
                            {log.trace_id ? (
                              <>
                                <div className="flex items-center w-full bg-surface border border-border rounded-md overflow-hidden">
                                  <span className="flex-1 px-3 py-1.5 font-mono text-[10px] text-primary truncate select-all">
                                    {log.trace_id}
                                  </span>
                                  <CopyBtn text={log.trace_id} />
                                </div>
                                <button
                                  onClick={() => setActiveTraceId(log.trace_id)}
                                  className="w-full flex items-center justify-center gap-2 bg-primary/10 hover:bg-primary/20 border border-primary/30 hover:border-primary/50 px-3 py-2 rounded-md text-xs font-medium text-primary transition-all duration-fast"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                  View trace waterfall
                                </button>
                              </>
                            ) : (
                              <p className="text-xs font-mono text-text-muted text-center py-3">
                                No trace ID attached to this log.
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Waterfall modal */}
      {activeTraceId && (
        <TraceWaterfallModal
          traceId={activeTraceId}
          projectId={projectId}
          onClose={() => setActiveTraceId(null)}
        />
      )}
    </div>
  );
};

export default Logs;