// import React, { useState, useEffect, useCallback } from 'react';
// import { useSelector } from 'react-redux';
// import { Server, Activity, Thermometer, ShieldCheck, HardDrive, Cpu, Clock, AlertCircle, ChevronRight, Inbox, RefreshCw } from 'lucide-react';
// import { serversApi } from '../../api/servers';
// import { metricsApi } from '../../api/metrics';

// // ---- Pure helpers at module scope ----
// const calculateAge = (timestampStr) => {
//   if (!timestampStr) return 'No heartbeat';
//   const diffSecs = Math.floor((Date.now() - new Date(timestampStr)) / 1000);
//   if (diffSecs < 60)  return `${diffSecs}s ago`;
//   const diffMins = Math.floor(diffSecs / 60);
//   if (diffMins < 60)  return `${diffMins}m ago`;
//   const diffHrs = Math.floor(diffMins / 60);
//   if (diffHrs < 24)   return `${diffHrs}h ago`;
//   return `${Math.floor(diffHrs / 24)}d ago`;
// };

// const getStatusColor = (status) =>
//   status === 'online'
//     ? 'bg-[#10b981] shadow-[0_0_10px_rgba(16,185,129,0.5)]'
//     : status === 'offline'
//     ? 'bg-[#ef4444] shadow-[0_0_10px_rgba(239,68,68,0.5)]'
//     : 'bg-[#f59e0b] shadow-[0_0_6px_rgba(245,158,11,0.4)]'; // unknown → amber

// const getEnvBadge = (env) => {
//   switch (env?.toLowerCase()) {
//     case 'production': return 'bg-[#a5b4fc]/10 border-[#a5b4fc]/20 text-[#a5b4fc]';
//     case 'staging':    return 'bg-[#fcd34d]/10 border-[#fcd34d]/20 text-[#fbbf24]';
//     case 'development':return 'bg-[#6ee7b7]/10 border-[#6ee7b7]/20 text-[#34d399]';
//     default:           return 'bg-white/5 border-white/10 text-[#8b949e]';
//   }
// };

// const ListEmpty = ({ label }) => (
//   <div className="w-full min-h-[300px] flex flex-col items-center justify-center text-center p-8">
//     <Inbox className="w-12 h-12 text-[#2d333b] mb-4" />
//     <p className="text-sm font-mono text-[#8b949e] tracking-wide">{label}</p>
//   </div>
// );

// const Servers = () => {
//   const { currentProject } = useSelector(state => state.project);
//   const projectId = currentProject?.id;

//   const [expandedId, setExpandedId]   = useState(null);
//   const [serversList, setServersList] = useState([]);
//   const [isLoading, setIsLoading]     = useState(true);

//   const fetchInfrastructure = useCallback(async () => {
//     if (!projectId) return;
//     setIsLoading(true);

//     try {
//       const [serversRes, metricsRes] = await Promise.allSettled([
//         serversApi.listServers(projectId),
//         metricsApi.getLatestMetrics(projectId),
//       ]);

//       const backendServers = serversRes.status === 'fulfilled'
//         ? serversRes.value.data?.servers || []
//         : [];

//       // getLatestMetrics returns { metrics: [...] } — NOT { data: [...] }
//       const globalMetrics = metricsRes.status === 'fulfilled'
//         ? metricsRes.value.data?.metrics || []
//         : [];

//       const unifiedServers = backendServers.map(server => {
//         const localMetrics = globalMetrics.filter(m => m.server_id === server.id);
//         const cpuMetric = localMetrics.find(m => m.name === 'cpu_usage' || m.name === 'cpu');
//         const memMetric = localMetrics.find(m => m.name === 'memory_used_percent' || m.name === 'memory');
        
//         return {
//           ...server,
//           // backend returns last_seen_at (raw SELECT *), normalise to one field
//           lastSeen: server.last_seen_at || server.last_heartbeat_at || null,
//           stats: {
//             cpu: cpuMetric ? parseFloat(cpuMetric.value) : null,
//             mem: memMetric ? parseFloat(memMetric.value) : null,
//           },
//         };
//       });

//       setServersList(unifiedServers);
//     } catch (err) {
//       console.error('Failed to load infrastructure', err);
//     } finally {
//       setIsLoading(false);
//     }
//   }, [projectId]);

//   useEffect(() => { fetchInfrastructure(); }, [fetchInfrastructure]);

//   const onlineCount  = serversList.filter(s => s.status === 'online').length;
//   const offlineCount = serversList.filter(s => s.status !== 'online').length;

//   return (
//     <div className="w-full flex justify-center pb-10">
//       <div className="w-full max-w-6xl px-2">

//         {/* Header */}
//         <div className="mb-8 pt-2 flex justify-between items-end">
//           <div>
//             <h1 className="text-3xl font-bold text-white tracking-tight mb-1">Infrastructure Nodes</h1>
//             <p className="text-sm font-mono text-[#8b949e]">
//               Monitor active server instances pinging telemetry into this workspace.
//               {serversList.length > 0 && (
//                 <span className="ml-2 px-1.5 py-0.5 bg-[#1c212b] border border-[#2d333b] rounded text-[#a5b4fc] font-bold text-xs">
//                   {serversList.length} node{serversList.length !== 1 ? 's' : ''}
//                 </span>
//               )}
//             </p>
//           </div>
//           <button
//             onClick={fetchInfrastructure}
//             disabled={isLoading}
//             className="flex items-center space-x-2 bg-[#1c212b] border border-[#2d333b] hover:border-[#818cf8] px-4 py-2 rounded-lg text-xs font-mono text-[#8b949e] hover:text-white transition-all disabled:opacity-50"
//           >
//             <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
//             <span>{isLoading ? 'Loading...' : 'Refresh'}</span>
//           </button>
//         </div>

//         {/* KPI Ribbon */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
//           <div className="bg-[#11151c] border border-white/5 rounded-xl p-6 flex items-center justify-between">
//             <div>
//               <p className="text-[10px] font-mono font-bold tracking-widest text-[#8b949e] uppercase mb-1">Total Deployed</p>
//               <div className="flex items-end">
//                 <h2 className="text-3xl font-bold text-white leading-none">{serversList.length}</h2>
//                 <span className="text-xs font-mono ml-3 text-[#c9d1d9] mb-0.5">nodes</span>
//               </div>
//             </div>
//             <div className="p-3 bg-white/5 rounded-lg border border-white/10">
//               <Server className="w-6 h-6 text-[#a5b4fc]" />
//             </div>
//           </div>

//           <div className="bg-[#11151c] border border-white/5 rounded-xl p-6 flex items-center justify-between">
//             <div>
//               <p className="text-[10px] font-mono tracking-widest font-bold text-[#10b981] uppercase mb-1">Operational Nodes</p>
//               <h2 className="text-3xl font-bold text-[#10b981] leading-none">{onlineCount}</h2>
//             </div>
//             <div className="p-3 bg-[#064e3b]/30 rounded-lg border border-[#065f46]">
//               <Activity className="w-6 h-6 text-[#10b981]" />
//             </div>
//           </div>

//           <div className="bg-[#11151c] border border-white/5 rounded-xl p-6 flex items-center justify-between">
//             <div>
//               <p className="text-[10px] font-mono tracking-widest font-bold text-[#ef4444] uppercase mb-1">Offline / Unknown</p>
//               <div className="flex items-end space-x-2">
//                 <h2 className="text-3xl font-bold text-[#fca5a5] leading-none">{offlineCount}</h2>
//                 {offlineCount > 0 && (
//                   <span className="text-[10px] font-bold tracking-wider font-mono px-1.5 py-0.5 rounded bg-[#ef4444] text-white mb-0.5">ALERT</span>
//                 )}
//               </div>
//             </div>
//             <div className="p-3 bg-[#450a0a]/50 rounded-lg border border-[#7f1d1d]">
//               <AlertCircle className="w-6 h-6 text-[#ef4444]" />
//             </div>
//           </div>
//         </div>

//         {/* Datatable */}
//         <div className="bg-[#11151c] border border-white/5 rounded-xl overflow-hidden">
//           {/* Table Header */}
//           <div className="w-full border-b border-[#2d333b] px-6 py-3 flex text-[10px] font-mono tracking-widest text-[#8b949e] uppercase bg-[#161b22] items-center">
//             <div className="w-[30%]">Node Identity</div>
//             <div className="w-[12%]">Environment</div>
//             <div className="w-[22%]">Hardware Load</div>
//             <div className="w-[18%]">Last Heartbeat</div>
//             <div className="w-[18%] text-right pr-2">Status</div>
//           </div>

//           {isLoading ? (
//             <div className="w-full min-h-[300px] flex flex-col items-center justify-center p-8">
//               <RefreshCw className="w-6 h-6 text-[#818cf8] animate-spin mb-3" />
//               <p className="text-sm font-mono text-[#8b949e]">Polling infrastructure health...</p>
//             </div>
//           ) : serversList.length === 0 ? (
//             <ListEmpty label="No servers registered. Deploy the LuminaTrace SDK and it will auto-register on first metric flush." />
//           ) : (
//             serversList.map(server => {
//               const isExpanded = expandedId === server.id;
//               const hasCpu = server.stats.cpu !== null;
//               const hasMem = server.stats.mem !== null;

//               return (
//                 <div key={server.id} className="flex flex-col border-b border-white/5 last:border-b-0">
//                   {/* Row */}
//                   <div
//                     onClick={() => setExpandedId(isExpanded ? null : server.id)}
//                     className={`w-full px-4 py-4 flex items-center cursor-pointer transition-colors ${isExpanded ? 'bg-[#161b22]' : 'hover:bg-[#161b22]'}`}
//                   >
//                     {/* Identity */}
//                     <div className="w-[30%] flex items-center space-x-3 pl-2 min-w-0">
//                       <ChevronRight className={`w-4 h-4 text-[#8b949e] shrink-0 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} />
//                       <div className={`w-2 h-2 rounded-full shrink-0 ${getStatusColor(server.status)}`} />
//                       <div className="min-w-0 pr-4">
//                         <h4 className="text-sm font-bold text-white truncate">{server.name}</h4>
//                         <p className="text-[10px] font-mono text-[#8b949e] mt-0.5 truncate">
//                           {server.hostname || server.ip_address || server.id.substring(0, 8) + '...'}
//                         </p>
//                       </div>
//                     </div>

//                     {/* Environment */}
//                     <div className="w-[12%]">
//                       <span className={`px-2 py-0.5 text-[10px] font-bold tracking-wider rounded uppercase border ${getEnvBadge(server.environment)}`}>
//                         {server.environment || 'unknown'}
//                       </span>
//                     </div>

//                     {/* Hardware load bars */}
//                     <div className="w-[22%] pr-8">
//                       {server.status === 'online' && (hasCpu || hasMem) ? (
//                         <div className="space-y-1.5">
//                           <div className="flex items-center space-x-2">
//                             <Cpu className="w-3 h-3 text-[#8b949e] shrink-0" />
//                             <div className="flex-1 h-1.5 bg-[#2d333b] rounded-full overflow-hidden">
//                               <div
//                                 className={`h-full rounded-full transition-all duration-700 ${hasCpu && server.stats.cpu > 80 ? 'bg-[#ef4444]' : 'bg-[#818cf8]'}`}
//                                 style={{ width: `${hasCpu ? Math.min(Math.max(server.stats.cpu, 0), 100) : 0}%` }}
//                               />
//                             </div>
//                             <span className="text-[10px] font-mono text-[#8b949e] w-8 text-right shrink-0">
//                               {hasCpu ? `${server.stats.cpu.toFixed(0)}%` : '—'}
//                             </span>
//                           </div>
//                           <div className="flex items-center space-x-2">
//                             <HardDrive className="w-3 h-3 text-[#8b949e] shrink-0" />
//                             <div className="flex-1 h-1.5 bg-[#2d333b] rounded-full overflow-hidden">
//                               <div
//                                 className={`h-full rounded-full transition-all duration-700 ${hasMem && server.stats.mem > 80 ? 'bg-[#ef4444]' : 'bg-[#38bdf8]'}`}
//                                 style={{ width: `${hasMem ? Math.min(Math.max(server.stats.mem, 0), 100) : 0}%` }}
//                               />
//                             </div>
//                             <span className="text-[10px] font-mono text-[#8b949e] w-8 text-right shrink-0">
//                               {hasMem ? `${server.stats.mem.toFixed(0)}%` : '—'}
//                             </span>
//                           </div>
//                         </div>
//                       ) : (
//                         <span className="text-[10px] text-[#4b5563] font-mono">No metrics yet</span>
//                       )}
//                     </div>

//                     {/* Heartbeat */}
//                     <div className="w-[18%] font-mono text-xs text-[#c9d1d9] flex items-center pr-4">
//                       <Clock className="w-3 h-3 mr-2 text-[#8b949e] shrink-0" />
//                       {calculateAge(server.lastSeen)}
//                     </div>

//                     {/* Status badge */}
//                     <div className="w-[18%] text-right pr-4">
//                       {server.status === 'online' ? (
//                         <span className="text-[10px] text-[#10b981] flex items-center justify-end font-bold uppercase tracking-wider">
//                           <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Online
//                         </span>
//                       ) : server.status === 'offline' ? (
//                         <span className="text-[10px] text-[#ef4444] font-bold uppercase tracking-wider">Offline</span>
//                       ) : (
//                         <span className="text-[10px] text-[#f59e0b] font-bold uppercase tracking-wider">Unknown</span>
//                       )}
//                     </div>
//                   </div>

//                   {/* Expanded Details */}
//                   {isExpanded && (
//                     <div className="w-full bg-[#0a0c10] px-8 py-5 grid grid-cols-2 md:grid-cols-4 gap-6 border-t border-[#2d333b] cursor-default">
//                       <div>
//                         <p className="text-[9px] tracking-widest uppercase font-mono text-[#4b5563] mb-1.5">Server ID</p>
//                         <p className="text-xs font-mono text-[#a5b4fc] select-all bg-[#a5b4fc]/10 px-2 py-1 rounded break-all">{server.id}</p>
//                       </div>
//                       <div>
//                         <p className="text-[9px] tracking-widest uppercase font-mono text-[#4b5563] mb-1.5">Hostname</p>
//                         <p className="text-xs font-mono text-white break-words">{server.hostname || '—'}</p>
//                         {server.ip_address && (
//                           <p className="text-[10px] font-mono text-[#8b949e] mt-1">{server.ip_address}</p>
//                         )}
//                       </div>
//                       <div>
//                         <p className="text-[9px] tracking-widest uppercase font-mono text-[#4b5563] mb-1.5 flex items-center">
//                           <Cpu className="w-3 h-3 mr-1" /> CPU Usage
//                         </p>
//                         <p className={`text-2xl font-mono font-bold ${hasCpu && server.stats.cpu > 80 ? 'text-[#ef4444]' : 'text-white'}`}>
//                           {hasCpu ? `${server.stats.cpu.toFixed(1)}%` : <span className="text-[#4b5563] text-sm">No data</span>}
//                         </p>
//                       </div>
//                       <div>
//                         <p className="text-[9px] tracking-widest uppercase font-mono text-[#4b5563] mb-1.5 flex items-center">
//                           <HardDrive className="w-3 h-3 mr-1" /> Memory Usage
//                         </p>
//                         <p className={`text-2xl font-mono font-bold ${hasMem && server.stats.mem > 80 ? 'text-[#ef4444]' : 'text-white'}`}>
//                           {hasMem ? `${server.stats.mem.toFixed(1)}%` : <span className="text-[#4b5563] text-sm">No data</span>}
//                         </p>
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               );
//             })
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Servers;
import React, { useState, useEffect, useCallback, memo } from 'react';
import { useSelector } from 'react-redux';
import {
  Server, Activity, HardDrive, Cpu, Clock,
  AlertCircle, ChevronRight, Inbox, RefreshCw, ShieldCheck
} from 'lucide-react';
import { serversApi } from '../../api/servers';
import { metricsApi } from '../../api/metrics';

/* ─────────────────────────────────────────────────────────────────
   MODULE-SCOPE PURE HELPERS
───────────────────────────────────────────────────────────────── */

const calculateAge = (timestampStr) => {
  if (!timestampStr) return 'No heartbeat';
  const diffSecs = Math.floor((Date.now() - new Date(timestampStr)) / 1000);
  if (diffSecs < 60)  return `${diffSecs}s ago`;
  const diffMins = Math.floor(diffSecs / 60);
  if (diffMins < 60)  return `${diffMins}m ago`;
  const diffHrs  = Math.floor(diffMins / 60);
  if (diffHrs  < 24)  return `${diffHrs}h ago`;
  return `${Math.floor(diffHrs / 24)}d ago`;
};

/** Status dot classes */
const getStatusDot = (status) => {
  switch (status) {
    case 'online':  return 'bg-accent-success shadow-[0_0_8px_rgba(16,185,129,0.55)]';
    case 'offline': return 'bg-accent-error  shadow-[0_0_8px_rgba(239,68,68,0.55)]';
    default:        return 'bg-accent-warning shadow-[0_0_6px_rgba(245,158,11,0.45)]';
  }
};

/** Environment badge classes */
const getEnvBadge = (env) => {
  switch (env?.toLowerCase()) {
    case 'production':  return 'bg-primary/8  border-primary/25  text-primary';
    case 'staging':     return 'bg-accent-warning/8 border-accent-warning/25 text-accent-warning';
    case 'development': return 'bg-accent-success/8 border-accent-success/25 text-accent-success';
    default:            return 'bg-surface-active border-border-light text-text-muted';
  }
};

/** CPU/MEM bar fill color based on threshold */
const cpuBarColor  = (v) => v > 80 ? 'bg-accent-error' : 'bg-primary';
const memBarColor  = (v) => v > 80 ? 'bg-accent-error' : v > 70 ? 'bg-accent-warning' : 'bg-secondary';
const statValColor = (v) => v > 80 ? 'text-accent-error' : v > 70 ? 'text-accent-warning' : 'text-text-primary';

/* ─────────────────────────────────────────────────────────────────
   EMPTY / LOADING STATES
───────────────────────────────────────────────────────────────── */
const EmptyState = ({ icon: Icon, label, sub }) => (
  <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
    <Icon className="w-9 h-9 text-border" />
    <div>
      <p className="text-sm font-medium text-text-muted">{label}</p>
      {sub && <p className="text-xs text-text-muted/60 mt-1 max-w-xs mx-auto">{sub}</p>}
    </div>
  </div>
);

/* ─────────────────────────────────────────────────────────────────
   KPI CARD
───────────────────────────────────────────────────────────────── */
const KpiCard = ({ label, value, unit, icon: Icon, accentColor, iconBg, iconBorder }) => (
  <div className="bg-surface border border-border rounded-card p-5 flex items-center justify-between relative overflow-hidden group transition-all duration-base hover:border-border-light hover:shadow-elevated">
    <div>
      <p className="text-[10px] font-mono font-medium uppercase tracking-widest mb-2" style={{ color: accentColor }}>
        {label}
      </p>
      <div className="flex items-baseline gap-1.5">
        <span className="text-3xl font-semibold leading-none" style={{ color: accentColor }}>{value}</span>
        {unit && <span className="text-sm text-text-muted">{unit}</span>}
      </div>
    </div>
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconBg} border ${iconBorder}`}>
      <Icon className="w-5 h-5" style={{ color: accentColor }} />
    </div>
    {/* Ambient glow */}
    <div
      className="absolute -bottom-5 -right-5 w-20 h-20 rounded-full blur-2xl opacity-10 group-hover:opacity-20 transition-opacity duration-slow pointer-events-none"
      style={{ background: accentColor }}
    />
  </div>
);

/* ─────────────────────────────────────────────────────────────────
   LOAD BAR  (CPU or MEM)
───────────────────────────────────────────────────────────────── */
const LoadBar = ({ label, value, colorFn }) => {
  const hasVal  = value !== null;
  const pct     = hasVal ? Math.min(Math.max(value, 0), 100) : 0;
  const barCls  = hasVal ? colorFn(value) : 'bg-border';
  const valCls  = hasVal ? statValColor(value) : 'text-text-muted';

  return (
    <div className="flex items-center gap-2">
      <span className="text-[9px] font-mono text-text-muted w-7 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-background rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-slow ${barCls}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={`text-[10px] font-mono w-8 text-right shrink-0 ${valCls}`}>
        {hasVal ? `${value.toFixed(0)}%` : '—'}
      </span>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────
   SERVER ROW  (memoised — only re-renders when its own data changes)
───────────────────────────────────────────────────────────────── */
const ServerRow = memo(({ server, isExpanded, onToggle }) => {
  const hasCpu = server.stats.cpu !== null;
  const hasMem = server.stats.mem !== null;
  const isOnline = server.status === 'online';

  return (
    <div className="border-b border-border/40 last:border-b-0">

      {/* ── Collapsed row ─────────────────────────────────── */}
      <div
        onClick={onToggle}
        className={`grid items-center px-5 py-3.5 cursor-pointer transition-colors duration-fast
          ${isExpanded ? 'bg-surface-hover' : 'hover:bg-surface/60'}`}
        style={{ gridTemplateColumns: '2fr 1fr 2fr 1.2fr 1fr' }}
      >
        {/* Node identity */}
        <div className="flex items-center gap-3 min-w-0">
          <ChevronRight className={`w-3.5 h-3.5 text-text-muted shrink-0 transition-transform duration-fast ${isExpanded ? 'rotate-90' : ''}`} />
          <div className={`w-2 h-2 rounded-full shrink-0 ${getStatusDot(server.status)}`} />
          <div className="min-w-0">
            <p className="text-sm font-medium text-text-primary truncate">{server.name}</p>
            <p className="text-[10px] font-mono text-text-muted mt-0.5 truncate">
              {server.hostname || server.ip_address || server.id.substring(0, 8) + '…'}
            </p>
          </div>
        </div>

        {/* Environment */}
        <div>
          <span className={`inline-flex items-center px-2 py-px rounded border text-[9px] font-mono font-semibold uppercase tracking-wide ${getEnvBadge(server.environment)}`}>
            {server.environment || 'unknown'}
          </span>
        </div>

        {/* Hardware load */}
        <div className="pr-6">
          {isOnline && (hasCpu || hasMem) ? (
            <div className="flex flex-col gap-1.5">
              <LoadBar label="CPU" value={hasCpu ? server.stats.cpu : null} colorFn={cpuBarColor} />
              <LoadBar label="MEM" value={hasMem ? server.stats.mem : null} colorFn={memBarColor} />
            </div>
          ) : (
            <span className="text-[10px] font-mono text-text-muted/50">No metrics</span>
          )}
        </div>

        {/* Last heartbeat */}
        <div className="flex items-center gap-1.5">
          <Clock className="w-3 h-3 text-text-muted shrink-0" />
          <span className="font-mono text-[10px] text-text-secondary">
            {calculateAge(server.lastSeen)}
          </span>
        </div>

        {/* Status */}
        <div className="flex items-center justify-end gap-1.5">
          {isOnline ? (
            <>
              <ShieldCheck className="w-3.5 h-3.5 text-accent-success" />
              <span className="text-[10px] font-mono font-semibold uppercase tracking-wide text-accent-success">Online</span>
            </>
          ) : server.status === 'offline' ? (
            <>
              <AlertCircle className="w-3.5 h-3.5 text-accent-error" />
              <span className="text-[10px] font-mono font-semibold uppercase tracking-wide text-accent-error">Offline</span>
            </>
          ) : (
            <span className="text-[10px] font-mono font-semibold uppercase tracking-wide text-accent-warning">Unknown</span>
          )}
        </div>
      </div>

      {/* ── Expanded detail panel ─────────────────────────── */}
      {isExpanded && (
        <div className="bg-background/60 border-t border-border px-5 py-4 grid grid-cols-2 md:grid-cols-4 gap-5">

          {/* Server ID */}
          <div>
            <p className="text-[9px] font-mono uppercase tracking-widest text-text-muted mb-1.5">Server ID</p>
            <p className="text-[10px] font-mono text-primary bg-primary/8 border border-primary/20 px-2 py-1.5 rounded-md select-all break-all leading-relaxed">
              {server.id}
            </p>
          </div>

          {/* Hostname + IP */}
          <div>
            <p className="text-[9px] font-mono uppercase tracking-widest text-text-muted mb-1.5">Hostname</p>
            <p className="text-sm font-medium text-text-primary font-mono">{server.hostname || '—'}</p>
            {server.ip_address && (
              <p className="text-[10px] font-mono text-text-muted mt-1">{server.ip_address}</p>
            )}
          </div>

          {/* CPU stat */}
          <div>
            <p className="text-[9px] font-mono uppercase tracking-widest text-text-muted mb-1.5 flex items-center gap-1">
              <Cpu className="w-3 h-3" /> CPU usage
            </p>
            {hasCpu ? (
              <div>
                <span className={`text-2xl font-semibold font-mono leading-none ${statValColor(server.stats.cpu)}`}>
                  {server.stats.cpu.toFixed(1)}
                </span>
                <span className="text-sm text-text-muted ml-0.5">%</span>
                {server.stats.cpu > 80 && (
                  <p className="text-[9px] font-mono text-accent-error mt-1 flex items-center gap-1">
                    <AlertCircle className="w-2.5 h-2.5" /> High CPU
                  </p>
                )}
              </div>
            ) : (
              <span className="text-sm text-text-muted font-mono">No data</span>
            )}
          </div>

          {/* Memory stat */}
          <div>
            <p className="text-[9px] font-mono uppercase tracking-widest text-text-muted mb-1.5 flex items-center gap-1">
              <HardDrive className="w-3 h-3" /> Memory usage
            </p>
            {hasMem ? (
              <div>
                <span className={`text-2xl font-semibold font-mono leading-none ${statValColor(server.stats.mem)}`}>
                  {server.stats.mem.toFixed(1)}
                </span>
                <span className="text-sm text-text-muted ml-0.5">%</span>
                {server.stats.mem > 80 && (
                  <p className="text-[9px] font-mono text-accent-error mt-1 flex items-center gap-1">
                    <AlertCircle className="w-2.5 h-2.5" /> High memory
                  </p>
                )}
              </div>
            ) : (
              <span className="text-sm text-text-muted font-mono">No data</span>
            )}
          </div>

        </div>
      )}
    </div>
  );
});
ServerRow.displayName = 'ServerRow';

/* ─────────────────────────────────────────────────────────────────
   SERVERS PAGE
───────────────────────────────────────────────────────────────── */
const Servers = () => {
  const { currentProject } = useSelector(state => state.project);
  const projectId = currentProject?.id;

  const [expandedId,   setExpandedId]   = useState(null);
  const [serversList,  setServersList]  = useState([]);
  const [isLoading,    setIsLoading]    = useState(true);

  const fetchInfrastructure = useCallback(async () => {
    if (!projectId) return;
    setIsLoading(true);
    try {
      const [serversRes, metricsRes] = await Promise.allSettled([
        serversApi.listServers(projectId),
        metricsApi.getLatestMetrics(projectId),
      ]);

      const backendServers = serversRes.status === 'fulfilled'
        ? serversRes.value.data?.servers || []
        : [];

      const globalMetrics = metricsRes.status === 'fulfilled'
        ? metricsRes.value.data?.metrics || []
        : [];

      const unified = backendServers.map(server => {
        const localMetrics = globalMetrics.filter(m => m.server_id === server.id);
        const cpuMetric    = localMetrics.find(m => m.name === 'cpu_usage'           || m.name === 'cpu');
        const memMetric    = localMetrics.find(m => m.name === 'memory_used_percent' || m.name === 'memory');
        return {
          ...server,
          lastSeen: server.last_seen_at || server.last_heartbeat_at || null,
          stats: {
            cpu: cpuMetric ? parseFloat(cpuMetric.value) : null,
            mem: memMetric ? parseFloat(memMetric.value) : null,
          },
        };
      });

      setServersList(unified);
    } catch (err) {
      console.error('Failed to load infrastructure', err);
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => { fetchInfrastructure(); }, [fetchInfrastructure]);

  const onlineCount  = serversList.filter(s => s.status === 'online').length;
  const offlineCount = serversList.filter(s => s.status !== 'online').length;

  const handleToggle = useCallback((id) =>
    setExpandedId(prev => prev === id ? null : id),
  []);

  /* ─────────────────────────────────────────────────────────── */
  return (
    <div className="w-full flex justify-center pb-10">
      <div className="w-full max-w-6xl px-2 pt-2 flex flex-col gap-6">

        {/* ── Page header ───────────────────────────────────── */}
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-xl font-semibold text-text-primary tracking-tight">Servers</h1>
            <p className="text-xs text-text-muted mt-1 font-mono flex items-center gap-2">
              Active nodes sending telemetry to this workspace
              {serversList.length > 0 && (
                <span className="px-1.5 py-px bg-primary/10 border border-primary/20 rounded text-primary text-[10px] font-semibold">
                  {serversList.length} node{serversList.length !== 1 ? 's' : ''}
                </span>
              )}
            </p>
          </div>

          <button
            onClick={fetchInfrastructure}
            disabled={isLoading}
            className="flex items-center gap-2 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white px-4 py-2 rounded-md text-xs font-medium shadow-glow-primary transition-all duration-fast active:scale-95"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Loading…' : 'Refresh'}
          </button>
        </div>

        {/* ── KPI ribbon ────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <KpiCard
            label="Total nodes"
            value={serversList.length}
            unit="nodes"
            icon={Server}
            accentColor="#7C3AED"
            iconBg="bg-primary/10"
            iconBorder="border-primary/20"
          />
          <KpiCard
            label="Online"
            value={onlineCount}
            icon={Activity}
            accentColor="#10B981"
            iconBg="bg-accent-success/10"
            iconBorder="border-accent-success/20"
          />
          <KpiCard
            label="Offline / unknown"
            value={offlineCount}
            icon={AlertCircle}
            accentColor={offlineCount > 0 ? '#EF4444' : '#64748B'}
            iconBg={offlineCount > 0 ? 'bg-accent-error/10' : 'bg-surface-active'}
            iconBorder={offlineCount > 0 ? 'border-accent-error/20' : 'border-border'}
          />
        </div>

        {/* ── Server table ──────────────────────────────────── */}
        <div className="bg-surface border border-border rounded-card overflow-hidden">

          {/* Table header */}
          <div
            className="grid px-5 py-3 border-b border-border bg-background/30 text-[9px] font-mono uppercase tracking-widest text-text-muted select-none"
            style={{ gridTemplateColumns: '2fr 1fr 2fr 1.2fr 1fr' }}
          >
            <div>Node</div>
            <div>Environment</div>
            <div>Hardware load</div>
            <div>Last heartbeat</div>
            <div className="text-right">Status</div>
          </div>

          {/* Body */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16">
              <RefreshCw className="w-6 h-6 text-primary animate-spin" />
              <p className="text-sm font-mono text-text-muted">Loading servers…</p>
            </div>
          ) : serversList.length === 0 ? (
            <EmptyState
              icon={Inbox}
              label="No servers registered yet."
              sub="Deploy the LuminaTrace SDK — servers auto-register on the first metric flush."
            />
          ) : (
            serversList.map(server => (
              <ServerRow
                key={server.id}
                server={server}
                isExpanded={expandedId === server.id}
                onToggle={() => handleToggle(server.id)}
              />
            ))
          )}
        </div>

      </div>
    </div>
  );
};

export default Servers;