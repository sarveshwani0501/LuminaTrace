import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { 
  BarChart, Bar, ResponsiveContainer, Cell, Tooltip as RechartsTooltip, XAxis
} from 'recharts';
import { 
  AlertCircle, Info, AlertTriangle, ExternalLink, Copy, 
  TerminalSquare, Cpu, HardDrive, Search, Filter, Server, Clock, ChevronDown, Check
} from 'lucide-react';
import { io } from 'socket.io-client';

const Logs = () => {
  const { currentProject } = useSelector(state => state.project) || { currentProject: { id: 'mock-alpha' } };
  const projectId = currentProject?.id || 'mock-alpha';

  const [isLiveStream, setIsLiveStream] = useState(true);
  const [selectedLog, setSelectedLog] = useState(null);
  
  // Custom Filters mapping directly to `getLogs` backend API
  const [timeRange, setTimeRange] = useState('1h');
  const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState(null); // 'ERROR', 'WARN', 'INFO', 'DEBUG', or null
  
  // Strict Mock State mapping exactly to DB schema fields
  const [logs, setLogs] = useState([]);
  const [volumeData, setVolumeData] = useState([]);

  useEffect(() => {
    // Generate Volume Data
    const vol = Array.from({length: 30}).map((_, i) => ({
      time: `14:${20 + i}`, 
      count: Math.floor(Math.random() * 80) + 10,
      isPeak: i === 18 
    }));
    setVolumeData(vol);

    // High-fidelity backend payload simulation mapping STRICTLY to your SDK / DB schema
    // Fields: time, server_name (from join), level, message, trace_id, span_id, metadata
    const rawLogs = [
      { id: '1', time: '2024-05-20T14:22:01.004Z', server_name: 'auth-master-01', level: 'ERROR', message: 'Connection timed out while verifying JWT', trace_id: 'tr_9x2b_k8L1', span_id: 'sp_4n0w_e1V0', metadata: { error_type: 'Timeout' } },
      { id: '2', time: '2024-05-20T14:21:58.892', server_name: 'gateway-node-A', level: 'ERROR', message: 'Upstream 502 Bad Gateway', trace_id: 'tr_4a9z_r3N4', span_id: 'sp_8fP2_k9X1', metadata: { route: '/api/v1/auth' } },
      { id: '3', time: '2024-05-20T14:21:55.210', server_name: 'redis-cache-03', level: 'WARN', message: 'High memory pressure: cache eviction policy triggered', trace_id: 'tr_0p7v_x5R2', span_id: 'sp_9xK1_l0M4', metadata: { keys_evicted: 124 } },
      { id: '4', time: '2024-05-20T14:21:52.441', server_name: 'billing-worker-01', level: 'INFO', message: 'Successfully processed recurring invoice payment', trace_id: 'tr_1q8d_y9T0', span_id: 'sp_3mN9_j8B5', metadata: { invoice_id: 'INV-2024-81' } },
      { id: '5', time: '2024-05-20T14:21:50.002', server_name: 'api-core-02', level: 'DEBUG', message: 'HTTP GET /health check passed', trace_id: null, span_id: null, metadata: { response_time_ms: 12 } },
    ];
    setLogs(rawLogs);
    setSelectedLog(rawLogs[0]);
  }, [timeRange]);

  // WebSockets setup
  useEffect(() => {
    if (!isLiveStream) return;
    const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:3000', { withCredentials: true });
    socket.on('connect', () => socket.emit('join_project', projectId));
    
    const interval = setInterval(() => {
       const newLog = { 
         id: Math.random().toString(), 
         time: new Date().toISOString(), 
         server_name: 'auth-master-01', 
         level: 'INFO', 
         message: 'Validating generic JWT context payload...', 
         trace_id: `tr_${Math.random().toString(36).substr(2, 9)}`,
         span_id: `sp_${Math.random().toString(36).substr(2, 9)}`,
         metadata: { auto_injected: true }
       };
       setLogs(prev => [newLog, ...prev].slice(0, 100)); 
    }, 4500);

    return () => {
      clearInterval(interval);
      socket.disconnect();
    };
  }, [projectId, isLiveStream]);


  // Clean formatting matching proper Log Levels (ERROR, WARN, INFO, DEBUG)
  const getLevelBadge = (level) => {
    switch(level) {
      case 'ERROR': return "text-[#fca5a5] bg-[#450a0a] border-[#7f1d1d]";
      case 'WARN': return "text-[#fdba74] bg-[#451a03] border-[#78350f]";
      case 'DEBUG': return "text-[#67e8f9] bg-[#083344] border-[#164e63]";
      case 'INFO':
      default: return "text-[#8b949e] bg-[#1c212b] border-[#2d333b]";
    }
  };

  const getLevelColor = (level) => {
    switch(level) {
      case 'ERROR': return "#ef4444";
      case 'WARN': return "#f59e0b";
      case 'DEBUG': return "#06b6d4";
      case 'INFO':
      default: return "#8b949e";
    }
  };

  const formatTime = (isoString) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}.${date.getMilliseconds().toString().padStart(3, '0')}`;
    } catch(e) { return isoString; }
  };


  return (
    <div className="w-full flex flex-col h-[calc(100vh-80px)] overflow-hidden space-y-4 px-2 pb-4">
      
      {/* HEADER & TOP TIER BLOCK */}
      <div className="shrink-0 space-y-4 pt-2">
        
        {/* Title & Level Filters */}
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight mb-1">System Logs</h1>
            <p className="text-xs font-mono text-[#8b949e]">Streaming live events from cluster</p>
          </div>
          
          <div className="flex space-x-2 justify-end">
            <div 
              onClick={() => setSelectedLevel(selectedLevel === 'ERROR' ? null : 'ERROR')}
              className={`px-3 py-1.5 border rounded text-xs font-mono flex items-center cursor-pointer transition-colors ${selectedLevel === 'ERROR' || !selectedLevel ? 'bg-[#450a0a]/80 text-[#fca5a5] border-[#7f1d1d] shadow-[0_0_10px_rgba(239,68,68,0.1)]' : 'bg-[#11151c] text-[#8b949e] border-white/10 hover:border-white/30'}`}>
              <div className="w-1.5 h-1.5 rounded-full bg-[#ef4444] mr-2"></div>ERROR (8)
            </div>
            <div 
              onClick={() => setSelectedLevel(selectedLevel === 'WARN' ? null : 'WARN')}
              className={`px-3 py-1.5 border rounded text-xs font-mono flex items-center cursor-pointer transition-colors ${selectedLevel === 'WARN' || !selectedLevel ? 'bg-[#451a03]/80 text-[#fdba74] border-[#78350f]' : 'bg-[#11151c] text-[#8b949e] border-white/10 hover:border-white/30'}`}>
              <div className="w-1.5 h-1.5 rounded-full bg-[#f59e0b] mr-2"></div>WARN (12)
            </div>
            <div 
               onClick={() => setSelectedLevel(selectedLevel === 'INFO' ? null : 'INFO')}
               className={`px-3 py-1.5 border rounded text-xs font-mono flex items-center cursor-pointer transition-colors ${selectedLevel === 'INFO' || !selectedLevel ? 'bg-[#1c212b] text-[#c9d1d9] border-[#2d333b]' : 'bg-[#11151c] text-[#8b949e] border-white/10 hover:border-white/30'}`}>
               <div className="w-1.5 h-1.5 rounded-full bg-[#8b949e] mr-2"></div>INFO (340)
            </div>
            <div 
               onClick={() => setSelectedLevel(selectedLevel === 'DEBUG' ? null : 'DEBUG')}
               className={`px-3 py-1.5 border rounded text-xs font-mono flex items-center cursor-pointer transition-colors ${selectedLevel === 'DEBUG' || !selectedLevel ? 'bg-[#083344]/80 text-[#67e8f9] border-[#164e63]' : 'bg-[#11151c] text-[#8b949e] border-white/10 hover:border-white/30'}`}>
               <div className="w-1.5 h-1.5 rounded-full bg-[#06b6d4] mr-2"></div>DEBUG (41)
            </div>
          </div>
        </div>

        {/* Action Filters Bar */}
        <div className="flex space-x-4 items-center">
          
          {/* Search Box */}
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-[#8b949e] absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search logs via metadata or trace id..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#11151c] border border-white/10 text-white text-sm rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-[#a5b4fc] transition-colors"
            />
          </div>

          {/* Server Selector */}
          <div className="flex items-center bg-[#11151c] border border-white/10 rounded-lg px-4 py-2 text-sm text-[#8b949e] cursor-pointer hover:border-[#a5b4fc] transition-colors">
             <Server className="w-4 h-4 mr-2" />
             <span>All Servers</span>
             <ChevronDown className="w-4 h-4 ml-6" />
          </div>

          {/* Time Filter */}
          <div className="relative">
            <div 
              onClick={() => setIsTimeDropdownOpen(!isTimeDropdownOpen)}
              className={`flex items-center bg-[#11151c] border cursor-pointer ${isTimeDropdownOpen ? 'border-[#818cf8]' : 'border-white/10'} hover:border-[#818cf8] transition-colors rounded-lg px-4 py-2 text-sm text-[#8b949e]`}
            >
              <Clock className="w-4 h-4 mr-2" />
              <span>Last {timeRange}</span>
              <ChevronDown className="w-4 h-4 ml-6" />
            </div>
            
            {isTimeDropdownOpen && (
              <div className="absolute top-12 right-0 w-48 bg-[#161b22] border border-[#2d333b] rounded-lg shadow-xl z-50 overflow-hidden">
                {['15m', '1h', '6h', '24h', '7d'].map((t) => (
                  <div 
                    key={t}
                    onClick={() => { setTimeRange(t); setIsTimeDropdownOpen(false); }}
                    className={`px-4 py-3 text-sm cursor-pointer flex items-center justify-between ${timeRange === t ? 'text-white bg-[#1c212b]' : 'text-[#8b949e] hover:bg-[#1c212b] hover:text-white'}`}
                  >
                    <span>Last {t}</span>
                    {timeRange === t && <Check className="w-4 h-4 text-[#c084fc]" />}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* LOG VOLUME BAR CHART (100px strict height) */}
        <div className="bg-[#11151c] border border-white/5 rounded-xl p-3 h-[110px] flex flex-col relative w-full">
           <div className="flex justify-between items-center mb-1 z-10 w-full shrink-0">
             <span className="text-[10px] font-mono tracking-widest text-[#8b949e] uppercase">Log Volume Grouping</span>
           </div>
           <div className="absolute inset-x-4 bottom-2 top-8">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={volumeData}>
                <RechartsTooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-[#0d1117]/95 border border-white/10 p-2 rounded-lg shadow-2xl backdrop-blur-sm z-50">
                          <p className="text-[10px] text-[#8b949e] mb-1 font-mono uppercase tracking-wider">{label} GMT</p>
                          <p className="text-white text-xs font-mono"><span className="text-[#a5b4fc] font-bold">{payload[0].value}</span> Logs</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="count" radius={[2,2,0,0]}>
                  {volumeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.isPeak ? '#a5b4fc' : '#2d333b'} fillOpacity={entry.isPeak ? 1 : 0.8} />
                  ))}
                </Bar>
                <XAxis dataKey="time" hide />
              </BarChart>
            </ResponsiveContainer>
           </div>
        </div>
      </div>


      {/* MIDDLE TIER: DATATABLE (Uncluttered) */}
      <div className="flex-1 min-h-0 bg-[#11151c] border border-white/5 rounded-xl flex flex-col overflow-hidden relative">
        {/* Table Header */}
        <div className="w-full bg-[#161b22] border-b border-[#2d333b] px-6 py-3 flex text-[10px] font-mono tracking-widest text-[#8b949e] uppercase shrink-0 sticky top-0 z-10 text-center">
          <div className="w-[15%]">Time</div>
          <div className="w-[15%]">Server Node</div>
          <div className="w-[10%]">Level</div>
          <div className="w-[45%] text-left pl-8">Message</div>
          <div className="w-[15%]">Trace</div>
        </div>

        {/* Table Body - Filtered by Level and Search Query manually simulating backend payload for now */}
        <div className="flex-1 overflow-y-auto w-full no-scrollbar pb-4">
          {logs.filter(l => {
             if (selectedLevel && l.level !== selectedLevel) return false;
             if (searchQuery) {
               const q = searchQuery.toLowerCase();
               if (!l.message.toLowerCase().includes(q) && 
                   !(l.trace_id && l.trace_id.toLowerCase().includes(q)) &&
                   !(l.metadata && JSON.stringify(l.metadata).toLowerCase().includes(q))) {
                 return false;
               }
             }
             return true;
          }).map((log) => (
            <div 
              key={log.id} 
              onClick={() => setSelectedLog(log)} 
              className={`w-full px-6 py-3 flex items-center border-b border-white/5 transition-colors cursor-pointer ${selectedLog?.id === log.id ? 'bg-[#1c212b] border-l-2 border-l-[#a5b4fc]' : 'border-l-2 border-l-transparent hover:bg-[#161b22]'}`}
            >
              <div className="w-[15%] text-[#8b949e] font-mono text-xs text-center">{formatTime(log.time)}</div>
              <div className="w-[15%] text-[#c9d1d9] font-mono text-xs truncate px-4 text-center">{log.server_name}</div>
              <div className="w-[10%] text-center">
                 <span className={`px-2.5 py-0.5 border rounded text-[10px] font-bold tracking-wider ${getLevelBadge(log.level)}`}>
                  {log.level}
                </span>
              </div>
              <div className="w-[45%] text-[#e5e7eb] text-sm font-medium truncate pr-6 pl-8 hover:text-white transition-colors" style={{ color: log.level === 'ERROR' ? '#fca5a5' : '' }}>
                 {log.message}
              </div>
              <div className="w-[15%] flex justify-center">
                  {log.trace_id ? (
                     <div className="inline-flex items-center space-x-1.5 text-[#a5b4fc] group">
                       <span className="font-mono text-xs">{log.trace_id.substring(0, 12)}...</span>
                       <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                     </div>
                  ) : (
                     <span className="text-[#4b5563] font-mono text-xs">--</span>
                  )}
              </div>
            </div>
          ))}
        </div>
      </div>


    </div>
  );
};

export default Logs;
