import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { Server, Activity, Thermometer, ShieldCheck, HardDrive, Cpu, Clock, AlertCircle, ChevronRight, Inbox } from 'lucide-react';
import { serversApi } from '../../api/servers';
import { metricsApi } from '../../api/metrics';

// Reusable Empty State handler
const ListEmpty = ({ label }) => (
  <div className="w-full h-full min-h-[300px] flex flex-col items-center justify-center text-center p-8">
    <Inbox className="w-12 h-12 text-[#2d333b] mb-4" />
    <p className="text-sm font-mono text-[#8b949e] tracking-wide">{label}</p>
  </div>
);

const Servers = () => {
  const { currentProject } = useSelector(state => state.project);
  const projectId = currentProject?.id;

  const [expandedId, setExpandedId] = useState(null);
  const [serversList, setServersList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Helper calculation for age
  const calculateAge = (timestampStr) => {
    if (!timestampStr) return "Unknown";
    const d1 = new Date(timestampStr);
    const d2 = new Date();
    const diffSecs = Math.floor((d2 - d1) / 1000);
    
    if (diffSecs < 60) return `${diffSecs} seconds ago`;
    const diffMins = Math.floor(diffSecs / 60);
    if (diffMins < 60) return `${diffMins} minutes ago`;
    const diffHrs = Math.floor(diffMins / 60);
    if (diffHrs < 24) return `${diffHrs} hours ago`;
    return `${Math.floor(diffHrs / 24)} days ago`;
  };

  const fetchInfrastructure = useCallback(async () => {
    if (!projectId) return;
    setIsLoading(true);

    try {
      // Concurrently fetch both the structural identity state and the global clustered metrics payload
      const [serversRes, metricsRes] = await Promise.allSettled([
        serversApi.listServers(projectId),
        metricsApi.getLatestMetrics(projectId)
      ]);

      let backendServers = [];
      let globalMetrics = [];

      if (serversRes.status === 'fulfilled') {
        backendServers = serversRes.value.data?.servers || [];
      }
      if (metricsRes.status === 'fulfilled') {
        globalMetrics = metricsRes.value.data?.data || [];
      }

      // Efficient Map Join: Safely attach the hardware stats onto each server entity
      const unifiedServers = backendServers.map(server => {
        // Filter out global metrics explicitly belonging to this individual server_id
        const localMetrics = globalMetrics.filter(m => m.server_id === server.id);
        
        // Pluck standard HW values safely, defaulting to zeros if the node hasn't emitted those keys
        const cpuMetric = localMetrics.find(m => m.name === 'cpu_usage' || m.name === 'cpu');
        const memMetric = localMetrics.find(m => m.name === 'memory_used_percent' || m.name === 'memory');

        return {
           ...server,
           stats: {
             cpu: cpuMetric ? parseFloat(cpuMetric.value) : 0,
             mem: memMetric ? parseFloat(memMetric.value) : 0
           }
        };
      });

      setServersList(unifiedServers);

    } catch (err) {
      console.error("Failed to load infrastructure datagrid", err);
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchInfrastructure();
  }, [fetchInfrastructure]);


  const getStatusColor = (status) => {
    return status === 'online' ? 'bg-[#10b981] shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-[#ef4444] shadow-[0_0_10px_rgba(239,68,68,0.5)]';
  };

  return (
    <div className="w-full flex justify-center pb-10">
      <div className="w-full max-w-6xl px-2">
         
         <div className="mb-8 pt-2">
            <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Infrastructure Nodes</h1>
            <p className="text-sm font-mono text-[#8b949e]">Monitor active server instances pinging telemetry streams into this workspace.</p>
         </div>

         {/* 1. Infrastructure KPI Ribbon */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-[#11151c] border border-white/5 rounded-xl p-6 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[10px] font-mono font-bold tracking-widest text-[#8b949e] uppercase mb-1">Total Deployed</p>
                <div className="flex items-end">
                   <h2 className="text-3xl font-bold text-white leading-none">{serversList.length}</h2>
                   <span className="text-xs font-mono ml-3 text-[#c9d1d9] mb-0.5">nodes</span>
                </div>
              </div>
              <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                 <Server className="w-6 h-6 text-[#a5b4fc]" />
              </div>
            </div>

            <div className="bg-[#11151c] border border-white/5 rounded-xl p-6 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[10px] font-mono tracking-widest font-bold text-[#10b981] uppercase mb-1">Operational Nodes</p>
                <div className="flex items-end">
                   <h2 className="text-3xl font-bold text-[#10b981] leading-none">
                     {serversList.filter(s => s.status === 'online').length}
                   </h2>
                </div>
              </div>
              <div className="p-3 bg-[#064e3b]/30 rounded-lg border border-[#065f46]">
                 <Activity className="w-6 h-6 text-[#10b981]" />
              </div>
            </div>

            <div className="bg-[#11151c] border border-white/5 rounded-xl p-6 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[10px] font-mono tracking-widest font-bold text-[#ef4444] uppercase mb-1">Signal Loss / Offline</p>
                 <div className="flex items-end">
                   <h2 className="text-3xl font-bold text-[#fca5a5] leading-none">
                     {serversList.filter(s => s.status === 'offline').length}
                   </h2>
                   {serversList.filter(s => s.status === 'offline').length > 0 && <span className="text-[10px] font-bold tracking-wider font-mono ml-3 px-1.5 py-0.5 rounded bg-[#ef4444] text-white">ALERT</span>}
                </div>
              </div>
              <div className="p-3 bg-[#450a0a]/50 rounded-lg border border-[#7f1d1d]">
                 <AlertCircle className="w-6 h-6 text-[#ef4444]" />
              </div>
            </div>
         </div>

         {/* 2. The Datatable */}
         <div className="bg-[#11151c] border border-white/5 rounded-xl overflow-hidden shadow-sm">
            
            <div className="w-full">
               <div className="w-full border-b border-[#2d333b] px-6 py-3 flex text-[10px] font-mono tracking-widest text-[#8b949e] uppercase bg-[#161b22] items-center">
                  <div className="w-[30%]">Node Identity</div>
                  <div className="w-[15%]">Operating Env</div>
                  <div className="w-[20%]">Hardware Load (Live)</div>
                  <div className="w-[20%]">Signal Heartbeat</div>
                  <div className="w-[15%] text-right pr-2">Telemetry</div>
               </div>

               {isLoading ? (
                  <div className="w-full h-full min-h-[300px] flex flex-col items-center justify-center p-8">
                     <p className="text-sm font-mono text-[#8b949e]">Polling infrastructure health...</p>
                  </div>
               ) : serversList.length === 0 ? (
                  <ListEmpty label="No assigned servers exist in this workspace. Have you deployed the agent?" />
               ) : (
                  serversList.map(server => {
                    const isExpanded = expandedId === server.id;

                    return (
                      <div key={server.id} className="flex flex-col border-b border-white/5 last:border-b-0">
                         {/* Row Summary */}
                         <div 
                           onClick={() => setExpandedId(isExpanded ? null : server.id)}
                           className={`w-full px-4 py-4 flex items-center cursor-pointer transition-colors ${isExpanded ? 'bg-[#161b22]' : 'hover:bg-[#161b22]'}`}
                         >
                            <div className="w-[30%] flex items-center space-x-3 pl-2">
                               <ChevronRight className={`w-4 h-4 text-[#8b949e] shrink-0 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} />
                               <div className={`w-2 h-2 rounded-full shrink-0 ${getStatusColor(server.status)}`}></div>
                               <div className="min-w-0 pr-4">
                                  <h4 className="text-sm font-bold text-white truncate">{server.name}</h4>
                                  <p className="text-[10px] font-mono text-[#8b949e] mt-0.5 truncate">{server.ip_address || server.id.substring(0,8)}</p>
                               </div>
                            </div>

                            <div className="w-[15%]">
                               <span className={`px-2 py-0.5 text-[10px] font-bold tracking-wider rounded uppercase border ${server.environment === 'production' ? 'bg-[#a5b4fc]/10 border-[#a5b4fc]/20 text-[#a5b4fc]' : 'bg-[#fcd34d]/10 border-[#fcd34d]/20 text-[#fbbf24]'}`}>
                                 {server.environment || 'UNKNOWN'}
                               </span>
                            </div>

                            <div className="w-[20%] pr-8">
                               {server.status === 'online' ? (
                                 <div className="space-y-1.5">
                                    <div className="flex items-center space-x-3">
                                       <Cpu className="w-3.5 h-3.5 text-[#8b949e] shrink-0" />
                                       <div className="w-full h-1.5 bg-[#2d333b] rounded-full overflow-hidden relative">
                                          <div className={`h-full rounded-full transition-all duration-500 absolute top-0 left-0 ${server.stats.cpu > 80 ? 'bg-[#ef4444] shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'bg-[#818cf8]'}`} style={{width: `${Math.min(Math.max(server.stats.cpu, 0), 100)}%`}}></div>
                                       </div>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                       <HardDrive className="w-3.5 h-3.5 text-[#8b949e] shrink-0" />
                                       <div className="w-full h-1.5 bg-[#2d333b] rounded-full overflow-hidden relative">
                                          <div className={`h-full rounded-full transition-all duration-500 absolute top-0 left-0 ${server.stats.mem > 80 ? 'bg-[#ef4444] shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'bg-[#38bdf8]'}`} style={{width: `${Math.min(Math.max(server.stats.mem, 0), 100)}%`}}></div>
                                       </div>
                                    </div>
                                 </div>
                               ) : (
                                 <span className="text-[10px] text-[#ef4444] bg-[#450a0a] border border-[#7f1d1d] px-2 py-0.5 rounded font-mono uppercase tracking-widest">SIGNAL LOST</span>
                               )}
                            </div>

                            <div className="w-[20%] font-mono text-xs text-[#c9d1d9] flex items-center pr-4">
                               <Clock className="w-3 h-3 mr-2 text-[#8b949e]" />
                               {calculateAge(server.last_heartbeat_at)}
                            </div>

                            <div className="w-[15%] text-right pr-4">
                               {server.status === 'online' ? (
                                  <span className="text-[10px] text-[#10b981] flex items-center justify-end font-bold uppercase tracking-wider"><ShieldCheck className="w-3.5 h-3.5 mr-1" /> BOUND</span>
                               ) : (
                                  <span className="text-[10px] text-[#8b949e] uppercase font-bold tracking-wider">HALTED</span>
                               )}
                            </div>
                         </div>

                         {/* Expanded Row Details */}
                         {isExpanded && (
                            <div className="w-full bg-[#0a0c10] p-6 pt-5 grid grid-cols-2 md:grid-cols-4 gap-8 shadow-inner cursor-default">
                               <div>
                                  <p className="text-[10px] tracking-widest uppercase font-mono text-[#4b5563] mb-1">UUID Pointer Segment</p>
                                  <p className="text-xs font-mono text-[#a5b4fc] select-all bg-[#a5b4fc]/10 px-2 py-1 rounded inline-block">{server.id}</p>
                               </div>
                               <div>
                                  <p className="text-[10px] tracking-widest uppercase font-mono text-[#4b5563] mb-1">Network Hostname Profile</p>
                                  <p className="text-xs font-mono text-white break-words">{server.hostname || 'Unassigned / Anonymous Node'}</p>
                               </div>
                               <div>
                                  <p className="text-[10px] tracking-widest uppercase font-mono text-[#4b5563] mb-1.5 flex items-center"><Thermometer className="w-3 h-3 mr-1 text-[#4b5563]" /> Hardware Core Saturation</p>
                                  <p className={`text-xl font-mono tracking-tight font-bold ${server.stats.cpu > 80 ? 'text-[#ef4444]' : 'text-white'}`}>{server.stats.cpu.toFixed(1)}% <span className="text-xs font-sans text-[#8b949e] ml-1 font-normal tracking-normal uppercase">Utilized</span></p>
                               </div>
                               <div>
                                  <p className="text-[10px] tracking-widest uppercase font-mono text-[#4b5563] mb-1.5">VRAM / Heap Allocation</p>
                                  <p className={`text-xl font-mono tracking-tight font-bold ${server.stats.mem > 80 ? 'text-[#ef4444]' : 'text-white'}`}>{server.stats.mem.toFixed(1)}% <span className="text-xs font-sans text-[#8b949e] ml-1 font-normal tracking-normal uppercase">Claimed</span></p>
                               </div>
                            </div>
                         )}
                      </div>
                    );
                  })
               )}
            </div>
         </div>
      </div>
    </div>
  );
};

export default Servers;
