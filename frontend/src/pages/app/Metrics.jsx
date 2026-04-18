import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { 
  AreaChart, Area, LineChart, Line, BarChart, Bar, XAxis, YAxis, 
  Tooltip as RechartsTooltip, ResponsiveContainer, Cell
} from 'recharts';
import { Clock, Filter, ChevronRight, ChevronDown, Activity, Zap, Server, Loader, Cpu, Hash, BarChart3, Check } from 'lucide-react';
import { io } from 'socket.io-client';

const Metrics = () => {
  const { currentProject } = useSelector(state => state.project);
  const uiProject = currentProject || { id: 'mock-alpha', name: 'Project Alpha' };

  // Advanced UI States
  const [visType, setVisType] = useState('lines'); // 'lines' | 'bars'
  const [timeRange, setTimeRange] = useState('15m');
  const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false);
  const [expandedDimension, setExpandedDimension] = useState('');
  
  // Custom Tag Filter State
  const [customTags, setCustomTags] = useState(['env:prod', 'region:us']);
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newTagInput, setNewTagInput] = useState('');
  
  // Data States
  const [latencyData, setLatencyData] = useState([]);
  const [throughputData, setThroughputData] = useState([]);
  const [errorData, setErrorData] = useState([]);
  const [cpuData, setCpuData] = useState([]);
  const [connectionsData, setConnectionsData] = useState([]);
  
  // Current immediate stats for KPIs
  const [stats, setStats] = useState({
    latency: "124", throughput: "4.2", errorRate: "0.08", cpu: "64.2", mem: "1.8", connections: "14.8"
  });

  // Re-generate data based on TimeRange to mock backend API capability
  useEffect(() => {
    // In actual implementation: 
    // await metricsApi.getTimeseriesData(uiProject.id, 'cpu_usage', timeRange)
    
    // Simulating heavy re-fetch when timerange changes...
    const dataLen = 20;
    const lat = Array.from({length: dataLen}).map((_, i) => ({
      time: `14:${40 + i}`, val: Math.exp(-Math.pow(i - 10, 2) / 8) * 100 + 40
    }));
    const thr = Array.from({length: dataLen}).map((_, i) => ({
      time: `14:${40 + i}`, val: Math.sin(i / 3) * 2 + Math.cos(i / 2) * 1 + 5
    }));
    const err = Array.from({length: dataLen}).map((_, i) => ({
      time: `14:${40 + i}`, val: Math.abs(Math.sin(i) * 0.05 + 0.02)
    }));
    const cpuArr = Array.from({length: dataLen}).map((_, i) => ({
      time: `14:${40 + i}`, val: (i % 2 === 0 ? 60 : 70) + Math.random() * 5
    }));
    const conn = Array.from({length: dataLen}).map((_, i) => ({
      time: `14:${40 + i}`, val: Math.sin(i / 2) * 4 + 10 + Math.random() * 2
    }));

    setLatencyData(lat);
    setThroughputData(thr);
    setErrorData(err);
    setCpuData(cpuArr);
    setConnectionsData(conn);
    
    // Close dropdown dynamically when selecting
    setIsTimeDropdownOpen(false);
  }, [uiProject.id, timeRange]);

  // Handle Socket logic separately
  useEffect(() => {
    const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:3000', { withCredentials: true });
    socket.on('connect', () => socket.emit('join_project', uiProject.id));

    return () => socket.disconnect();
  }, [uiProject.id]);

  // Premium Custom Tooltip natively parsing the point data
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#161b22]/95 border border-[#2d333b] p-3 rounded-lg shadow-glass backdrop-blur-md">
          <p className="text-xs text-[#8b949e] mb-2 font-mono">{label} UTC</p>
          <div className="flex items-center space-x-2 text-sm font-semibold">
            <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: payload[0].color || payload[0].fill || '#818cf8' }}></div>
            <span className="text-white">
              {parseFloat(payload[0].value).toFixed(2)}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  const MetricCard = ({ title, value, unit, icon: Icon, color, children }) => (
    <div className="bg-[#11151c] border border-[rgba(255,255,255,0.05)] rounded-xl p-5 shadow-lg relative flex flex-col justify-between h-[280px]">
      <div className="relative z-20">
        <div className="flex justify-between items-center mb-4">
          <span className="text-[10px] font-mono tracking-widest text-[#8b949e] uppercase">{title}</span>
          {Icon && <Icon className="w-4 h-4 text-[#8b949e]" />}
        </div>
        <div className="flex items-baseline space-x-1">
          <span className="text-3xl font-bold tracking-tight text-white">{value}</span>
          <span className="text-xs font-semibold" style={{ color: color }}>{unit}</span>
        </div>
      </div>
      
      <div className="absolute bottom-0 left-0 w-full h-[140px] px-2 pb-2 z-10">
        {children}
      </div>
    </div>
  );

  return (
    <div className="w-full flex h-[calc(100vh-80px)] overflow-hidden">
      
      {/* MAIN LEFT AREA (75%) */}
      <div className="flex-1 flex flex-col pr-8 overflow-y-auto">
        
        {/* Header Block */}
        <div className="flex justify-between items-center mb-8 shrink-0 relative">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight mb-1">Service Metrics</h1>
            <p className="text-xs text-[#8b949e]">Real-time telemetry for <span className="text-[#a5b4fc]">edge-gateway-v2</span></p>
          </div>
          
          <div className="flex items-center space-x-4 relative">
            
            {/* Custom Interactive Time Range Dropdown */}
            <div className="relative">
              <div 
                onClick={() => setIsTimeDropdownOpen(!isTimeDropdownOpen)}
                className={`flex items-center bg-[#1c212b] border cursor-pointer ${isTimeDropdownOpen ? 'border-[#818cf8]' : 'border-[#2d333b]'} hover:border-[#818cf8] transition-colors rounded-lg px-4 py-2 text-xs font-mono text-[#8b949e]`}
              >
                <Clock className="w-3 h-3 mr-2 text-[#a5b4fc]" />
                <span>Last {timeRange.replace('m', ' Minutes').replace('h', ' Hour').replace('d', ' Days')}</span>
                <ChevronDown className="w-3 h-3 ml-2 text-[#8b949e]" />
              </div>
              
              {isTimeDropdownOpen && (
                <div className="absolute top-10 right-0 w-48 bg-[#161b22] border border-[#2d333b] rounded-lg shadow-xl z-50 overflow-hidden">
                  {['15m', '1h', '6h', '24h', '7d'].map((t) => (
                    <div 
                      key={t}
                      onClick={() => setTimeRange(t)}
                      className={`px-4 py-2.5 text-xs font-mono cursor-pointer flex items-center justify-between ${timeRange === t ? 'text-white bg-[#1c212b]' : 'text-[#8b949e] hover:bg-[#1c212b] hover:text-white'}`}
                    >
                      <span>Last {t}</span>
                      {timeRange === t && <Check className="w-3 h-3 text-[#c084fc]" />}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button 
              onClick={() => {
                // Mock heavy frontend refresh simulating api call
                setLatencyData([...latencyData.slice(1), { time: 'NOW', val: Math.random() * 100 + 40 }]);
              }}
              className="bg-gradient-to-r from-[#818cf8] to-[#c084fc] hover:opacity-90 text-white px-5 py-2 rounded-lg text-sm font-bold shadow-[0_0_15px_rgba(129,140,248,0.3)] transition-all active:scale-95"
            >
              Refresh Now
            </button>
          </div>
        </div>

        {/* 3x2 KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
          
          {/* P99 Latency */}
          <MetricCard title="P99 Latency" value={stats.latency} unit="ms" icon={Loader} color="#fff">
            <ResponsiveContainer width="100%" height="100%">
              {visType === 'lines' ? (
                <AreaChart data={latencyData}>
                  <defs>
                    <linearGradient id="purpleGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#c084fc" stopOpacity={0.4}/>
                      <stop offset="100%" stopColor="#c084fc" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <RechartsTooltip cursor={{stroke: '#374151', strokeWidth: 1, strokeDasharray: '4 4'}} content={<CustomTooltip />} />
                  <Area isAnimationActive={false} type="monotone" dataKey="val" stroke="#c084fc" strokeWidth={3} fill="url(#purpleGrad)" />
                  <XAxis dataKey="time" hide />
                  <YAxis domain={['dataMin - 10', 'dataMax + 20']} hide />
                </AreaChart>
              ) : (
                <BarChart data={latencyData}>
                  <RechartsTooltip cursor={{fill: '#1c212b'}} content={<CustomTooltip />} />
                  <Bar isAnimationActive={false} dataKey="val" fill="#c084fc" radius={[2,2,0,0]} />
                  <XAxis dataKey="time" hide />
                  <YAxis domain={['dataMin - 10', 'dataMax + 20']} hide />
                </BarChart>
              )}
            </ResponsiveContainer>
          </MetricCard>

          {/* Throughput */}
          <MetricCard title="Throughput" value={stats.throughput} unit="k RPS" icon={Zap} color="#2dd4bf">
            <ResponsiveContainer width="100%" height="100%">
               {visType === 'lines' ? (
                <AreaChart data={throughputData}>
                  <defs>
                    <linearGradient id="cyanGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.4}/>
                      <stop offset="100%" stopColor="#22d3ee" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <RechartsTooltip cursor={{stroke: '#374151', strokeWidth: 1, strokeDasharray: '4 4'}} content={<CustomTooltip />} />
                  <Area isAnimationActive={false} type="monotone" dataKey="val" stroke="#22d3ee" strokeWidth={3} fill="url(#cyanGrad)" />
                  <XAxis dataKey="time" hide />
                  <YAxis domain={['dataMin - 1', 'dataMax + 1']} hide />
                </AreaChart>
               ) : (
                <BarChart data={throughputData}>
                  <RechartsTooltip cursor={{fill: '#1c212b'}} content={<CustomTooltip />} />
                  <Bar isAnimationActive={false} dataKey="val" fill="#22d3ee" radius={[2,2,0,0]} />
                  <XAxis dataKey="time" hide />
                  <YAxis domain={['dataMin - 1', 'dataMax + 1']} hide />
                </BarChart>
               )}
            </ResponsiveContainer>
          </MetricCard>

          {/* Error Rate */}
          <MetricCard title="Error Rate" value={stats.errorRate} unit="%" icon={Activity} color="#fca5a5">
            <ResponsiveContainer width="100%" height="100%">
              {visType === 'lines' ? (
                <AreaChart data={errorData}>
                  <defs>
                    <linearGradient id="amberGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#fdba74" stopOpacity={0.4}/>
                      <stop offset="100%" stopColor="#fdba74" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <RechartsTooltip cursor={{stroke: '#374151', strokeWidth: 1, strokeDasharray: '4 4'}} content={<CustomTooltip />} />
                  <Area isAnimationActive={false} type="monotone" dataKey="val" stroke="#fdba74" strokeWidth={3} fill="url(#amberGrad)" />
                  <XAxis dataKey="time" hide />
                  <YAxis domain={[0, 'dataMax + 0.1']} hide />
                </AreaChart>
               ) : (
                <BarChart data={errorData}>
                  <RechartsTooltip cursor={{fill: '#1c212b'}} content={<CustomTooltip />} />
                  <Bar isAnimationActive={false} dataKey="val" fill="#fdba74" radius={[2,2,0,0]} />
                  <XAxis dataKey="time" hide />
                  <YAxis domain={[0, 'dataMax + 0.1']} hide />
                </BarChart>
               )}
            </ResponsiveContainer>
          </MetricCard>

          {/* CPU Utilization */}
          <MetricCard title="CPU Utilization" value={stats.cpu} unit="%" icon={Cpu} color="#fff">
            {/* Background vertical dark bars mimicking the image exactly */}
            {visType === 'lines' && (
              <div className="absolute inset-0 flex justify-between px-4 opacity-10 pointer-events-none z-0">
                 {[...Array(10)].map((_,i) => <div key={i} className="w-1 h-full bg-white"></div>)}
              </div>
            )}
            <ResponsiveContainer width="100%" height="100%" className="relative z-10">
              {visType === 'lines' ? (
                <LineChart data={cpuData}>
                  <RechartsTooltip cursor={{stroke: '#374151', strokeWidth: 1, strokeDasharray: '4 4'}} content={<CustomTooltip />} />
                  <Line isAnimationActive={false} type="linear" dataKey="val" stroke="#e2e8f0" strokeWidth={2} dot={false} />
                  <XAxis dataKey="time" hide />
                  <YAxis domain={[40, 100]} hide />
                </LineChart>
              ) : (
                <BarChart data={cpuData}>
                  <RechartsTooltip cursor={{fill: '#1c212b'}} content={<CustomTooltip />} />
                  <Bar isAnimationActive={false} dataKey="val" fill="#e2e8f0" radius={[2,2,0,0]} />
                  <XAxis dataKey="time" hide />
                  <YAxis domain={[40, 100]} hide />
                </BarChart>
              )}
            </ResponsiveContainer>
          </MetricCard>

          {/* Mem Resident Set */}
          <MetricCard title="Mem Resident Set" value={stats.mem} unit="GB" icon={Server} color="#fff">
            <div className="w-full h-[80px] mt-6 flex pb-2 relative group hover:opacity-90 transition-opacity">
               <div className="w-1/2 h-full bg-[#1e1b4b] border border-[#312e81] flex items-center justify-center">
                  <span className="text-[9px] text-[#4f46e5] font-mono tracking-widest text-center">STABLE ALLOCATION</span>
               </div>
               <div className="w-1/2 h-full bg-[#0a0a0a] border border-[#171717] flex items-center justify-center">
                  {/* Hover tooltip mechanism explicitly for this custom block */}
                  <div className="hidden group-hover:block absolute -top-10 left-1/2 -translate-x-1/2 bg-[#161b22] border border-[#2d333b] text-xs font-mono text-white px-3 py-1.5 rounded">
                    Limit: 4.0GB Max
                  </div>
               </div>
               <div className="absolute left-1/2 top-0 h-full w-[1px] bg-[#c084fc] shadow-[0_0_8px_#c084fc]"></div>
            </div>
          </MetricCard>

          {/* Active Connections */}
          <MetricCard title="Active Connections" value={stats.connections} unit="k" icon={Hash} color="#2dd4bf">
             <ResponsiveContainer width="100%" height="100%">
               {visType === 'lines' ? (
                <LineChart data={connectionsData}>
                  <RechartsTooltip cursor={{stroke: '#374151', strokeWidth: 1, strokeDasharray: '4 4'}} content={<CustomTooltip />} />
                  <Line isAnimationActive={false} type="linear" dataKey="val" stroke="#2dd4bf" strokeWidth={2.5} strokeDasharray="4 6" dot={false} />
                  <XAxis dataKey="time" hide />
                  <YAxis domain={['dataMin - 5', 'dataMax + 5']} hide />
                </LineChart>
               ) : (
                <BarChart data={connectionsData}>
                  <RechartsTooltip cursor={{fill: '#1c212b'}} content={<CustomTooltip />} />
                  <Bar isAnimationActive={false} dataKey="val" fill="#2dd4bf" radius={[2,2,0,0]} />
                  <XAxis dataKey="time" hide />
                  <YAxis domain={['dataMin - 5', 'dataMax + 5']} hide />
                </BarChart>
               )}
            </ResponsiveContainer>
          </MetricCard>

        </div>
      </div>

      {/* RIGHT SIDEBAR PANEL (25% Split) */}
      <div className="w-[300px] shrink-0 bg-[#0d1017] border border-[#2d333b] rounded-xl flex flex-col h-full overflow-hidden shadow-2xl">
        
        <div className="p-5 border-b border-[#2d333b] flex items-center space-x-3 bg-[#161b22]">
          <Filter className="w-4 h-4 text-[#a5b4fc]" />
          <h2 className="text-sm font-bold text-white tracking-wide">Metric Explorer</h2>
        </div>

        <div className="p-5 flex-1 overflow-y-auto space-y-8">
          
          {/* Dimensions Section */}
          <div className="space-y-3">
            <span className="text-[10px] font-mono tracking-widest text-[#8b949e] uppercase">Dimensions</span>
            
            <div className="space-y-2">
              {['Server Node', 'Endpoint Path', 'HTTP Method'].map((dim) => {
                const isOpen = expandedDimension === dim;
                return (
                  <div key={dim} className="w-full">
                    <div 
                      onClick={() => setExpandedDimension(isOpen ? '' : dim)}
                      className={`flex justify-between items-center bg-[#1c212b] border ${isOpen ? 'border-[#818cf8] shadow-[0_0_8px_rgba(129,140,248,0.2)]' : 'border-[#2d333b] hover:border-[#818cf8]'} px-4 py-2.5 rounded-lg cursor-pointer transition-colors group`}
                    >
                      <span className={`text-sm font-medium ${isOpen ? 'text-white' : 'text-[#c9d1d9] group-hover:text-white'}`}>{dim}</span>
                      {isOpen ? (
                        <div className="w-3 h-3 rounded-full bg-transparent border-[3px] border-[#818cf8]"></div>
                      ) : (
                        <ChevronRight className="w-3 h-3 text-[#8b949e] group-hover:text-white" />
                      )}
                    </div>
                    {/* Dimension Dropdown Content */}
                    {isOpen && (
                      <div className="mt-1 bg-[#161b22] border border-[#2d333b] rounded-lg p-2 space-y-1 max-h-40 overflow-y-auto">
                        {dim === 'Server Node' && ['us-east-1 (Primary)', 'us-east-2 (Replica)'].map(opt => <div key={opt} className="px-2 py-1.5 text-xs text-[#8b949e] hover:text-white hover:bg-[#1c212b] rounded cursor-pointer">{opt}</div>)}
                        {dim === 'Endpoint Path' && ['/api/v2/users', '/auth/login', '/gateway/stream'].map(opt => <div key={opt} className="px-2 py-1.5 text-xs text-[#8b949e] hover:text-white hover:bg-[#1c212b] rounded cursor-pointer">{opt}</div>)}
                        {dim === 'HTTP Method' && ['GET', 'POST', 'PUT', 'DELETE'].map(opt => <div key={opt} className="px-2 py-1.5 text-xs text-[#8b949e] hover:text-white hover:bg-[#1c212b] rounded cursor-pointer">{opt}</div>)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Custom Tags Section */}
          <div className="space-y-3">
            <span className="text-[10px] font-mono tracking-widest text-[#8b949e] uppercase">Custom Tags</span>
            <div className="flex flex-wrap gap-2">
              
              {customTags.map(tag => (
                <div key={tag} className="flex items-center bg-[#1c212b] border border-[#2d333b] px-2 py-1 rounded text-xs text-[#c9d1d9] font-mono cursor-pointer hover:bg-accent-error/10 hover:text-accent-error hover:border-accent-error/30 transition-colors" onClick={() => setCustomTags(customTags.filter(t => t !== tag))}>
                  {tag} <span className="ml-2 opacity-50 font-sans font-bold">×</span>
                </div>
              ))}

              {isAddingTag ? (
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    // Enforce strict tag formatting stringency (e.g., key_123:value-abc.45)
                    const isValid = /^[a-zA-Z0-9_]+:[a-zA-Z0-9_\-.]+$/.test(newTagInput);
                    if (isValid && !customTags.includes(newTagInput)) {
                      setCustomTags([...customTags, newTagInput]);
                      setNewTagInput('');
                      setIsAddingTag(false);
                    } else if (!isValid) {
                      alert("Invalid Format. Target must be generic key:value (no spaces or special chars).");
                    }
                  }}
                >
                  <input 
                    autoFocus
                    type="text"
                    placeholder="key:value"
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    onBlur={() => setIsAddingTag(false)}
                    className="bg-[#0a0c10] border border-[#818cf8] px-2 py-1 flex items-center rounded text-xs text-white font-mono focus:outline-none w-28"
                  />
                </form>
              ) : (
                <div 
                  onClick={() => setIsAddingTag(true)}
                  className="flex items-center bg-transparent border border-dashed border-[#8b949e] px-2 py-1 rounded text-xs text-[#8b949e] font-mono cursor-pointer hover:border-white hover:text-white transition-colors"
                >
                  + Add Filter
                </div>
              )}
              
            </div>
          </div>

          {/* Visualization Section */}
          <div className="space-y-3 pt-4 border-t border-[#2d333b]">
            <span className="text-[10px] font-mono tracking-widest text-[#8b949e] uppercase">Visualization</span>
            <div className="grid grid-cols-2 gap-2">
              
              <div 
                onClick={() => setVisType('lines')}
                className={`flex flex-col items-center justify-center border rounded-lg p-4 cursor-pointer transition-all ${
                  visType === 'lines' ? 'bg-[#1c212b] border-[#818cf8] shadow-[0_0_10px_rgba(129,140,248,0.1)]' : 'bg-[#1c212b] border-[#2d333b] hover:bg-[#2d333b]'
                }`}
              >
                <Activity className={`w-5 h-5 mb-2 ${visType === 'lines' ? 'text-[#818cf8]' : 'text-[#8b949e]'}`} />
                <span className={`text-xs ${visType === 'lines' ? 'text-white' : 'text-[#8b949e]'}`}>Lines</span>
              </div>
              
              <div 
                onClick={() => setVisType('bars')}
                className={`flex flex-col items-center justify-center border rounded-lg p-4 cursor-pointer transition-all ${
                  visType === 'bars' ? 'bg-[#1c212b] border-[#818cf8] shadow-[0_0_10px_rgba(129,140,248,0.1)]' : 'bg-[#1c212b] border-[#2d333b] hover:bg-[#2d333b]'
                }`}
              >
                <BarChart3 className={`w-5 h-5 mb-2 ${visType === 'bars' ? 'text-[#818cf8]' : 'text-[#8b949e]'}`} />
                <span className={`text-xs ${visType === 'bars' ? 'text-white' : 'text-[#8b949e]'}`}>Bars</span>
              </div>
              
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Metrics;
