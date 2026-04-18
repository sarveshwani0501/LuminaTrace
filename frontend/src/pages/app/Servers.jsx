import React, { useState } from 'react';
import { Server, Activity, Thermometer, ShieldCheck, HardDrive, Cpu, Clock, AlertCircle } from 'lucide-react';

const mockServers = [
  {
    id: "uuid-1",
    name: "auth-cluster-01",
    hostname: "aws-ec2-us-east-auth",
    ip_address: "10.0.1.42",
    environment: "production",
    status: "online",
    last_heartbeat_at: "2 seconds ago",
    created_at: "2023-11-01T12:00:00Z",
    stats: { cpu: 24, mem: 62 }
  },
  {
    id: "uuid-2",
    name: "payment-gateway-node",
    hostname: "aws-ec2-us-east-payment",
    ip_address: "10.0.1.88",
    environment: "production",
    status: "online",
    last_heartbeat_at: "4 seconds ago",
    created_at: "2023-11-01T14:30:00Z",
    stats: { cpu: 82, mem: 91 } // Danger load
  },
  {
    id: "uuid-3",
    name: "frontend-renderer-01",
    hostname: "vercel-edge-region-a",
    ip_address: "192.168.1.10",
    environment: "staging",
    status: "online",
    last_heartbeat_at: "1 second ago",
    created_at: "2024-01-10T09:15:00Z",
    stats: { cpu: 12, mem: 28 }
  },
  {
    id: "uuid-4",
    name: "analytics-db-reader",
    hostname: "gcp-compute-analytics",
    ip_address: "172.16.0.4",
    environment: "production",
    status: "offline",
    last_heartbeat_at: "4 minutes ago",
    created_at: "2023-12-05T08:00:00Z",
    stats: { cpu: 0, mem: 0 }
  }
];

const Servers = () => {
  const [expandedId, setExpandedId] = useState(null);

  const getStatusColor = (status) => {
    return status === 'online' ? 'bg-[#10b981] shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-[#ef4444] shadow-[0_0_10px_rgba(239,68,68,0.5)]';
  };

  return (
    <div className="w-full flex justify-center pb-10">
      <div className="w-full max-w-6xl px-2">
         
         <div className="mb-8">
            <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Infrastructure Nodes</h1>
            <p className="text-sm text-[#8b949e]">Monitor active server instances pinging telemetry streams into this workspace.</p>
         </div>

         {/* 1. Infrastructure KPI Ribbon */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-[#11151c] border border-[#2d333b] rounded-xl p-6 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-mono text-[#8b949e] uppercase mb-1">Total Deployed</p>
                <h2 className="text-3xl font-bold text-white">{mockServers.length}</h2>
              </div>
              <div className="p-3 bg-[#a5b4fc]/10 rounded-lg">
                 <Server className="w-6 h-6 text-[#a5b4fc]" />
              </div>
            </div>

            <div className="bg-[#11151c] border border-[#065f46] rounded-xl p-6 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-mono text-[#10b981] uppercase mb-1">Operational Nodes</p>
                <h2 className="text-3xl font-bold text-[#10b981]">
                   {mockServers.filter(s => s.status === 'online').length}
                </h2>
              </div>
              <div className="p-3 bg-[#064e3b] rounded-lg">
                 <Activity className="w-6 h-6 text-[#10b981]" />
              </div>
            </div>

            <div className="bg-[#11151c] border border-[#7f1d1d] rounded-xl p-6 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-mono text-[#ef4444] uppercase mb-1">Signal Loss / Offline</p>
                <h2 className="text-3xl font-bold text-[#fca5a5]">
                   {mockServers.filter(s => s.status === 'offline').length}
                </h2>
              </div>
              <div className="p-3 bg-[#450a0a] rounded-lg">
                 <AlertCircle className="w-6 h-6 text-[#ef4444]" />
              </div>
            </div>
         </div>

         {/* 2. The Datatable */}
         <div className="bg-[#11151c] border border-[#2d333b] rounded-xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-[#2d333b] bg-[#161b22]">
               <h3 className="text-lg font-bold text-white">Active Server Roster</h3>
            </div>
            
            <div className="w-full">
               <div className="w-full border-b border-[#2d333b] px-6 py-3 flex text-[10px] font-mono tracking-widest text-[#8b949e] uppercase bg-[#0d1117] items-center">
                  <div className="w-[30%]">Node Identity</div>
                  <div className="w-[15%]">Operating Env</div>
                  <div className="w-[20%]">Hardware Load (Live)</div>
                  <div className="w-[20%]">Signal Heartbeat</div>
                  <div className="w-[15%] text-right pr-2">Telemetry</div>
               </div>

               {mockServers.map(server => (
                  <div key={server.id} className="flex flex-col border-b border-white/5 last:border-b-0">
                     {/* Row Summary */}
                     <div 
                       onClick={() => setExpandedId(expandedId === server.id ? null : server.id)}
                       className="w-full px-6 py-4 flex items-center hover:bg-[#161b22] cursor-pointer transition-colors"
                     >
                        <div className="w-[30%] flex items-center space-x-4">
                           <div className={`w-2 h-2 rounded-full ${getStatusColor(server.status)}`}></div>
                           <div>
                              <h4 className="text-sm font-bold text-white">{server.name}</h4>
                              <p className="text-[10px] font-mono text-[#8b949e] mt-0.5">{server.ip_address}</p>
                           </div>
                        </div>

                        <div className="w-[15%]">
                           <span className={`px-2 py-0.5 text-[10px] font-bold tracking-wider rounded uppercase border ${server.environment === 'production' ? 'bg-[#a5b4fc]/10 border-[#a5b4fc]/20 text-[#a5b4fc]' : 'bg-[#fcd34d]/10 border-[#fcd34d]/20 text-[#fbbf24]'}`}>
                             {server.environment}
                           </span>
                        </div>

                        <div className="w-[20%] pr-6">
                           {server.status === 'online' ? (
                             <div className="space-y-1.5">
                                <div className="flex items-center space-x-2">
                                   <Cpu className="w-3 h-3 text-[#8b949e] shrink-0" />
                                   <div className="w-full h-1 bg-[#2d333b] rounded-full overflow-hidden">
                                      <div className={`h-full rounded-full transition-all duration-500 ${server.stats.cpu > 80 ? 'bg-[#ef4444]' : 'bg-[#818cf8]'}`} style={{width: `${server.stats.cpu}%`}}></div>
                                   </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                   <HardDrive className="w-3 h-3 text-[#8b949e] shrink-0" />
                                   <div className="w-full h-1 bg-[#2d333b] rounded-full overflow-hidden">
                                      <div className={`h-full rounded-full transition-all duration-500 ${server.stats.mem > 80 ? 'bg-[#ef4444]' : 'bg-[#38bdf8]'}`} style={{width: `${server.stats.mem}%`}}></div>
                                   </div>
                                </div>
                             </div>
                           ) : (
                             <span className="text-[10px] text-[#ef4444] font-mono">CONNECTION LOST</span>
                           )}
                        </div>

                        <div className="w-[20%] font-mono text-xs text-[#c9d1d9] flex items-center">
                           <Clock className="w-3 h-3 mr-2 text-[#8b949e]" />
                           {server.last_heartbeat_at}
                        </div>

                        <div className="w-[15%] text-right pr-2">
                           {server.status === 'online' ? (
                              <span className="text-[10px] text-[#10b981] flex items-center justify-end font-bold uppercase"><ShieldCheck className="w-3.5 h-3.5 mr-1" /> Bound</span>
                           ) : (
                              <span className="text-[10px] text-[#8b949e] uppercase">Halted</span>
                           )}
                        </div>
                     </div>

                     {/* Expanded Row Details */}
                     {expandedId === server.id && (
                        <div className="w-full bg-[#0d1117] p-6 border-t border-[#2d333b] grid grid-cols-2 md:grid-cols-4 gap-6 animate-in slide-in-from-top-2 fade-in duration-200">
                           <div>
                              <p className="text-[10px] uppercase font-mono text-[#8b949e] mb-1">UUID Pointer</p>
                              <p className="text-xs font-mono text-white select-all">{server.id}</p>
                           </div>
                           <div>
                              <p className="text-[10px] uppercase font-mono text-[#8b949e] mb-1">Assigned Hostname</p>
                              <p className="text-xs font-mono text-white break-words">{server.hostname}</p>
                           </div>
                           <div>
                              <p className="text-[10px] uppercase font-mono text-[#8b949e] mb-1">Ingestion Engine CPU</p>
                              <p className={`text-sm font-bold ${server.stats.cpu > 80 ? 'text-[#ef4444]' : 'text-white'}`}>{server.stats.cpu}% Utilized</p>
                           </div>
                           <div>
                              <p className="text-[10px] uppercase font-mono text-[#8b949e] mb-1">VRAM / Heap Allocation</p>
                              <p className={`text-sm font-bold ${server.stats.mem > 80 ? 'text-[#ef4444]' : 'text-white'}`}>{server.stats.mem}% Saturated</p>
                           </div>
                        </div>
                     )}
                  </div>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
};

export default Servers;
