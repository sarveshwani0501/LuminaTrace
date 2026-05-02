import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { Server, Activity, Thermometer, ShieldCheck, HardDrive, Cpu, Clock, AlertCircle, ChevronRight, Inbox, RefreshCw } from 'lucide-react';
import { serversApi } from '../../api/servers';
import { metricsApi } from '../../api/metrics';

// ---- Pure helpers at module scope ----
const calculateAge = (timestampStr) => {
  if (!timestampStr) return 'No heartbeat';
  const diffSecs = Math.floor((Date.now() - new Date(timestampStr)) / 1000);
  if (diffSecs < 60)  return `${diffSecs}s ago`;
  const diffMins = Math.floor(diffSecs / 60);
  if (diffMins < 60)  return `${diffMins}m ago`;
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24)   return `${diffHrs}h ago`;
  return `${Math.floor(diffHrs / 24)}d ago`;
};

const getStatusColor = (status) =>
  status === 'online'
    ? 'bg-[#10b981] shadow-[0_0_10px_rgba(16,185,129,0.5)]'
    : status === 'offline'
    ? 'bg-[#ef4444] shadow-[0_0_10px_rgba(239,68,68,0.5)]'
    : 'bg-[#f59e0b] shadow-[0_0_6px_rgba(245,158,11,0.4)]'; // unknown → amber

const getEnvBadge = (env) => {
  switch (env?.toLowerCase()) {
    case 'production': return 'bg-[#a5b4fc]/10 border-[#a5b4fc]/20 text-[#a5b4fc]';
    case 'staging':    return 'bg-[#fcd34d]/10 border-[#fcd34d]/20 text-[#fbbf24]';
    case 'development':return 'bg-[#6ee7b7]/10 border-[#6ee7b7]/20 text-[#34d399]';
    default:           return 'bg-white/5 border-white/10 text-[#8b949e]';
  }
};

const ListEmpty = ({ label }) => (
  <div className="w-full min-h-[300px] flex flex-col items-center justify-center text-center p-8">
    <Inbox className="w-12 h-12 text-[#2d333b] mb-4" />
    <p className="text-sm font-mono text-[#8b949e] tracking-wide">{label}</p>
  </div>
);

const Servers = () => {
  const { currentProject } = useSelector(state => state.project);
  const projectId = currentProject?.id;

  const [expandedId, setExpandedId]   = useState(null);
  const [serversList, setServersList] = useState([]);
  const [isLoading, setIsLoading]     = useState(true);

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

      // getLatestMetrics returns { metrics: [...] } — NOT { data: [...] }
      const globalMetrics = metricsRes.status === 'fulfilled'
        ? metricsRes.value.data?.metrics || []
        : [];

      const unifiedServers = backendServers.map(server => {
        const localMetrics = globalMetrics.filter(m => m.server_id === server.id);
        const cpuMetric = localMetrics.find(m => m.name === 'cpu_usage' || m.name === 'cpu');
        const memMetric = localMetrics.find(m => m.name === 'memory_used_percent' || m.name === 'memory');
        
        return {
          ...server,
          // backend returns last_seen_at (raw SELECT *), normalise to one field
          lastSeen: server.last_seen_at || server.last_heartbeat_at || null,
          stats: {
            cpu: cpuMetric ? parseFloat(cpuMetric.value) : null,
            mem: memMetric ? parseFloat(memMetric.value) : null,
          },
        };
      });

      setServersList(unifiedServers);
    } catch (err) {
      console.error('Failed to load infrastructure', err);
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => { fetchInfrastructure(); }, [fetchInfrastructure]);

  const onlineCount  = serversList.filter(s => s.status === 'online').length;
  const offlineCount = serversList.filter(s => s.status !== 'online').length;

  return (
    <div className="w-full flex justify-center pb-10">
      <div className="w-full max-w-6xl px-2">

        {/* Header */}
        <div className="mb-8 pt-2 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight mb-1">Infrastructure Nodes</h1>
            <p className="text-sm font-mono text-[#8b949e]">
              Monitor active server instances pinging telemetry into this workspace.
              {serversList.length > 0 && (
                <span className="ml-2 px-1.5 py-0.5 bg-[#1c212b] border border-[#2d333b] rounded text-[#a5b4fc] font-bold text-xs">
                  {serversList.length} node{serversList.length !== 1 ? 's' : ''}
                </span>
              )}
            </p>
          </div>
          <button
            onClick={fetchInfrastructure}
            disabled={isLoading}
            className="flex items-center space-x-2 bg-[#1c212b] border border-[#2d333b] hover:border-[#818cf8] px-4 py-2 rounded-lg text-xs font-mono text-[#8b949e] hover:text-white transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Loading...' : 'Refresh'}</span>
          </button>
        </div>

        {/* KPI Ribbon */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-[#11151c] border border-white/5 rounded-xl p-6 flex items-center justify-between">
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

          <div className="bg-[#11151c] border border-white/5 rounded-xl p-6 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-mono tracking-widest font-bold text-[#10b981] uppercase mb-1">Operational Nodes</p>
              <h2 className="text-3xl font-bold text-[#10b981] leading-none">{onlineCount}</h2>
            </div>
            <div className="p-3 bg-[#064e3b]/30 rounded-lg border border-[#065f46]">
              <Activity className="w-6 h-6 text-[#10b981]" />
            </div>
          </div>

          <div className="bg-[#11151c] border border-white/5 rounded-xl p-6 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-mono tracking-widest font-bold text-[#ef4444] uppercase mb-1">Offline / Unknown</p>
              <div className="flex items-end space-x-2">
                <h2 className="text-3xl font-bold text-[#fca5a5] leading-none">{offlineCount}</h2>
                {offlineCount > 0 && (
                  <span className="text-[10px] font-bold tracking-wider font-mono px-1.5 py-0.5 rounded bg-[#ef4444] text-white mb-0.5">ALERT</span>
                )}
              </div>
            </div>
            <div className="p-3 bg-[#450a0a]/50 rounded-lg border border-[#7f1d1d]">
              <AlertCircle className="w-6 h-6 text-[#ef4444]" />
            </div>
          </div>
        </div>

        {/* Datatable */}
        <div className="bg-[#11151c] border border-white/5 rounded-xl overflow-hidden">
          {/* Table Header */}
          <div className="w-full border-b border-[#2d333b] px-6 py-3 flex text-[10px] font-mono tracking-widest text-[#8b949e] uppercase bg-[#161b22] items-center">
            <div className="w-[30%]">Node Identity</div>
            <div className="w-[12%]">Environment</div>
            <div className="w-[22%]">Hardware Load</div>
            <div className="w-[18%]">Last Heartbeat</div>
            <div className="w-[18%] text-right pr-2">Status</div>
          </div>

          {isLoading ? (
            <div className="w-full min-h-[300px] flex flex-col items-center justify-center p-8">
              <RefreshCw className="w-6 h-6 text-[#818cf8] animate-spin mb-3" />
              <p className="text-sm font-mono text-[#8b949e]">Polling infrastructure health...</p>
            </div>
          ) : serversList.length === 0 ? (
            <ListEmpty label="No servers registered. Deploy the LuminaTrace SDK and it will auto-register on first metric flush." />
          ) : (
            serversList.map(server => {
              const isExpanded = expandedId === server.id;
              const hasCpu = server.stats.cpu !== null;
              const hasMem = server.stats.mem !== null;

              return (
                <div key={server.id} className="flex flex-col border-b border-white/5 last:border-b-0">
                  {/* Row */}
                  <div
                    onClick={() => setExpandedId(isExpanded ? null : server.id)}
                    className={`w-full px-4 py-4 flex items-center cursor-pointer transition-colors ${isExpanded ? 'bg-[#161b22]' : 'hover:bg-[#161b22]'}`}
                  >
                    {/* Identity */}
                    <div className="w-[30%] flex items-center space-x-3 pl-2 min-w-0">
                      <ChevronRight className={`w-4 h-4 text-[#8b949e] shrink-0 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} />
                      <div className={`w-2 h-2 rounded-full shrink-0 ${getStatusColor(server.status)}`} />
                      <div className="min-w-0 pr-4">
                        <h4 className="text-sm font-bold text-white truncate">{server.name}</h4>
                        <p className="text-[10px] font-mono text-[#8b949e] mt-0.5 truncate">
                          {server.hostname || server.ip_address || server.id.substring(0, 8) + '...'}
                        </p>
                      </div>
                    </div>

                    {/* Environment */}
                    <div className="w-[12%]">
                      <span className={`px-2 py-0.5 text-[10px] font-bold tracking-wider rounded uppercase border ${getEnvBadge(server.environment)}`}>
                        {server.environment || 'unknown'}
                      </span>
                    </div>

                    {/* Hardware load bars */}
                    <div className="w-[22%] pr-8">
                      {server.status === 'online' && (hasCpu || hasMem) ? (
                        <div className="space-y-1.5">
                          <div className="flex items-center space-x-2">
                            <Cpu className="w-3 h-3 text-[#8b949e] shrink-0" />
                            <div className="flex-1 h-1.5 bg-[#2d333b] rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-700 ${hasCpu && server.stats.cpu > 80 ? 'bg-[#ef4444]' : 'bg-[#818cf8]'}`}
                                style={{ width: `${hasCpu ? Math.min(Math.max(server.stats.cpu, 0), 100) : 0}%` }}
                              />
                            </div>
                            <span className="text-[10px] font-mono text-[#8b949e] w-8 text-right shrink-0">
                              {hasCpu ? `${server.stats.cpu.toFixed(0)}%` : '—'}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <HardDrive className="w-3 h-3 text-[#8b949e] shrink-0" />
                            <div className="flex-1 h-1.5 bg-[#2d333b] rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-700 ${hasMem && server.stats.mem > 80 ? 'bg-[#ef4444]' : 'bg-[#38bdf8]'}`}
                                style={{ width: `${hasMem ? Math.min(Math.max(server.stats.mem, 0), 100) : 0}%` }}
                              />
                            </div>
                            <span className="text-[10px] font-mono text-[#8b949e] w-8 text-right shrink-0">
                              {hasMem ? `${server.stats.mem.toFixed(0)}%` : '—'}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-[10px] text-[#4b5563] font-mono">No metrics yet</span>
                      )}
                    </div>

                    {/* Heartbeat */}
                    <div className="w-[18%] font-mono text-xs text-[#c9d1d9] flex items-center pr-4">
                      <Clock className="w-3 h-3 mr-2 text-[#8b949e] shrink-0" />
                      {calculateAge(server.lastSeen)}
                    </div>

                    {/* Status badge */}
                    <div className="w-[18%] text-right pr-4">
                      {server.status === 'online' ? (
                        <span className="text-[10px] text-[#10b981] flex items-center justify-end font-bold uppercase tracking-wider">
                          <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Online
                        </span>
                      ) : server.status === 'offline' ? (
                        <span className="text-[10px] text-[#ef4444] font-bold uppercase tracking-wider">Offline</span>
                      ) : (
                        <span className="text-[10px] text-[#f59e0b] font-bold uppercase tracking-wider">Unknown</span>
                      )}
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="w-full bg-[#0a0c10] px-8 py-5 grid grid-cols-2 md:grid-cols-4 gap-6 border-t border-[#2d333b] cursor-default">
                      <div>
                        <p className="text-[9px] tracking-widest uppercase font-mono text-[#4b5563] mb-1.5">Server ID</p>
                        <p className="text-xs font-mono text-[#a5b4fc] select-all bg-[#a5b4fc]/10 px-2 py-1 rounded break-all">{server.id}</p>
                      </div>
                      <div>
                        <p className="text-[9px] tracking-widest uppercase font-mono text-[#4b5563] mb-1.5">Hostname</p>
                        <p className="text-xs font-mono text-white break-words">{server.hostname || '—'}</p>
                        {server.ip_address && (
                          <p className="text-[10px] font-mono text-[#8b949e] mt-1">{server.ip_address}</p>
                        )}
                      </div>
                      <div>
                        <p className="text-[9px] tracking-widest uppercase font-mono text-[#4b5563] mb-1.5 flex items-center">
                          <Cpu className="w-3 h-3 mr-1" /> CPU Usage
                        </p>
                        <p className={`text-2xl font-mono font-bold ${hasCpu && server.stats.cpu > 80 ? 'text-[#ef4444]' : 'text-white'}`}>
                          {hasCpu ? `${server.stats.cpu.toFixed(1)}%` : <span className="text-[#4b5563] text-sm">No data</span>}
                        </p>
                      </div>
                      <div>
                        <p className="text-[9px] tracking-widest uppercase font-mono text-[#4b5563] mb-1.5 flex items-center">
                          <HardDrive className="w-3 h-3 mr-1" /> Memory Usage
                        </p>
                        <p className={`text-2xl font-mono font-bold ${hasMem && server.stats.mem > 80 ? 'text-[#ef4444]' : 'text-white'}`}>
                          {hasMem ? `${server.stats.mem.toFixed(1)}%` : <span className="text-[#4b5563] text-sm">No data</span>}
                        </p>
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
  );
};

export default Servers;
