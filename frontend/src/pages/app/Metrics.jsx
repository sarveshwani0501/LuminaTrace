import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { 
  AreaChart, Area, LineChart, Line, BarChart, Bar, XAxis, YAxis, 
  Tooltip as RechartsTooltip, ResponsiveContainer
} from 'recharts';
import { Clock, Filter, ChevronRight, ChevronDown, Activity, Zap, Server, Loader, Cpu, Hash, BarChart3, Check, BarChart2 } from 'lucide-react';
import { io } from 'socket.io-client';
import { metricsApi } from '../../api/metrics';
import { serversApi } from '../../api/servers';

// Helper: parse a timeseries API response into { time, val } chart points
// Handles both avg_value (timeseries) and p99_value (P99 endpoint) field names
const parseTimeseries = (data = []) =>
  data.map(d => ({
    time: new Date(d.time_bucket || d.bucket || d.time).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
    val: parseFloat(d.p99_value ?? d.avg_value ?? d.value ?? 0)
  })).filter(d => !isNaN(d.val));

// Inline empty state shown inside each MetricCard when no data arrives
const ChartEmpty = ({ label }) => (
  <div className="w-full h-full flex flex-col items-center justify-center text-center px-2">
    <BarChart2 className="w-6 h-6 text-[#2d333b] mb-2" />
    <p className="text-[9px] text-[#8b949e] font-mono leading-tight">{label}</p>
  </div>
);

const Metrics = () => {
  const { currentProject } = useSelector(state => state.project);

  const [visType, setVisType] = useState('lines');
  const [timeRange, setTimeRange] = useState('1h');
  const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false);
  const [servers, setServers] = useState([]);
  const [selectedServerId, setSelectedServerId] = useState('');
  const [isServerDropdownOpen, setIsServerDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Chart data states
  const [latencyData, setLatencyData] = useState([]);
  const [cpuData, setCpuData] = useState([]);
  const [memData, setMemData] = useState([]);
  const [throughputData, setThroughputData] = useState([]);
  const [errorData, setErrorData] = useState([]);
  const [connectionsData, setConnectionsData] = useState([]);

  // KPI stats (latest values)
  const [stats, setStats] = useState({
    latency: '--', cpu: '--', mem: '--', throughput: '--', errorRate: '--', connections: '--'
  });

  const fetchAll = useCallback(async () => {
    if (!currentProject?.id) return;
    setIsLoading(true);
    setIsTimeDropdownOpen(false);

    try {
      const [latestRes, cpuRes, memRes, p99Res, throughputRes, errorRateRes, connectionsRes, serversRes] = await Promise.allSettled([
        metricsApi.getLatestMetrics(currentProject.id, selectedServerId || null),
        metricsApi.getTimeseries(currentProject.id, 'cpu_usage', timeRange, selectedServerId || null),
        metricsApi.getTimeseries(currentProject.id, 'memory_used_percent', timeRange, selectedServerId || null),
        metricsApi.getTimeseriesP99(currentProject.id, timeRange, selectedServerId || null),
        metricsApi.getThroughput(currentProject.id, timeRange, selectedServerId || null),
        metricsApi.getErrorRate(currentProject.id, timeRange, selectedServerId || null),
        metricsApi.getActiveConnections(currentProject.id, timeRange, selectedServerId || null),
        serversApi.listServers(currentProject.id)
      ]);

      // KPI stats from latest metrics
      if (latestRes.status === 'fulfilled') {
        const metricsList = latestRes.value.data?.metrics || [];
        const get = (name) => {
          const m = metricsList.find(x => x.name === name);
          return m ? parseFloat(m.value).toFixed(1) : '--';
        };
        setStats({
          latency: get('response_time'),
          cpu: get('cpu_usage'),
          mem: get('memory_used_percent'),
          throughput: get('request_count'),
          errorRate: get('error_rate'),
          connections: get('active_connections'),
        });
      }

      if (cpuRes.status === 'fulfilled') setCpuData(parseTimeseries(cpuRes.value.data?.data || []));
      if (memRes.status === 'fulfilled') setMemData(parseTimeseries(memRes.value.data?.data || []));
      if (p99Res.status === 'fulfilled') setLatencyData(parseTimeseries(p99Res.value.data?.data || []));
      if (throughputRes.status === 'fulfilled') setThroughputData(parseTimeseries(throughputRes.value.data?.data || []));
      if (errorRateRes.status === 'fulfilled') setErrorData(parseTimeseries(errorRateRes.value.data?.data || []));
      if (connectionsRes.status === 'fulfilled') setConnectionsData(parseTimeseries(connectionsRes.value.data?.data || []));
      if (serversRes.status === 'fulfilled') setServers(serversRes.value.data?.servers || []);

    } catch (err) {
      console.error('Metrics fetch failed', err);
    } finally {
      setIsLoading(false);
    }
  }, [currentProject?.id, timeRange, selectedServerId]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Socket: live metric updates
  useEffect(() => {
    if (!currentProject?.id) return;
    const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:3000', { withCredentials: true });
    socket.on('connect', () => socket.emit('join_project', currentProject.id));

    socket.on('new_metric', (metric) => {
      const timeStr = new Date(metric.time || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const val = parseFloat(metric.value);

      if (metric.name === 'cpu_usage') {
        setCpuData(prev => [...prev.slice(-59), { time: timeStr, val }]);
        setStats(prev => ({ ...prev, cpu: val.toFixed(1) }));
      }
      if (metric.name === 'memory_used_percent') {
        setMemData(prev => [...prev.slice(-59), { time: timeStr, val }]);
        setStats(prev => ({ ...prev, mem: val.toFixed(1) }));
      }
      if (metric.name === 'response_time') {
        setLatencyData(prev => [...prev.slice(-59), { time: timeStr, val }]);
        setStats(prev => ({ ...prev, latency: val.toFixed(1) }));
      }
      if (metric.name === 'request_count') {
        // Append as a live throughput point (raw count per interval, not RPS, for live view)
        setThroughputData(prev => [...prev.slice(-59), { time: timeStr, val }]);
        setStats(prev => ({ ...prev, throughput: val.toFixed(0) }));
      }
      if (metric.name === 'error_count') {
        setErrorData(prev => [...prev.slice(-59), { time: timeStr, val }]);
      }
      if (metric.name === 'active_connections') {
        setConnectionsData(prev => [...prev.slice(-59), { time: timeStr, val }]);
        setStats(prev => ({ ...prev, connections: val.toFixed(0) }));
      }
    });

    return () => socket.disconnect();
  }, [currentProject?.id]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload?.length) {
      return (
        <div className="bg-[#161b22]/95 border border-[#2d333b] p-3 rounded-lg shadow-glass backdrop-blur-md">
          <p className="text-xs text-[#8b949e] mb-2 font-mono">{label}</p>
          <div className="flex items-center space-x-2 text-sm font-semibold">
            <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: payload[0].color || payload[0].fill || '#818cf8' }}></div>
            <span className="text-white">{parseFloat(payload[0].value).toFixed(2)}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  const MetricCard = ({ title, value, unit, icon: Icon, color, data, chart, emptyLabel }) => (
    <div className="bg-[#11151c] border border-[rgba(255,255,255,0.05)] rounded-xl p-5 shadow-lg relative flex flex-col justify-between h-[280px]">
      <div className="relative z-20">
        <div className="flex justify-between items-center mb-4">
          <span className="text-[10px] font-mono tracking-widest text-[#8b949e] uppercase">{title}</span>
          {Icon && <Icon className="w-4 h-4 text-[#8b949e]" />}
        </div>
        <div className="flex items-baseline space-x-1">
          <span className="text-3xl font-bold tracking-tight text-white">{value}</span>
          <span className="text-xs font-semibold" style={{ color }}>{unit}</span>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 w-full h-[140px] px-2 pb-2 z-10">
        {!data || data.length === 0
          ? <ChartEmpty label={emptyLabel || 'No data — send metrics via SDK to populate'} />
          : chart
        }
      </div>
    </div>
  );

  return (
    <div className="w-full flex h-[calc(100vh-80px)] overflow-hidden">
      
      {/* MAIN AREA */}
      <div className="flex-1 flex flex-col pr-8 overflow-y-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8 shrink-0 relative">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight mb-1">Service Metrics</h1>
            <p className="text-xs text-[#8b949e]">
              Real-time telemetry for{' '}
              <span className="text-[#a5b4fc]">{currentProject?.name || 'your project'}</span>
            </p>
          </div>
          
          <div className="flex items-center space-x-4 relative">
            {/* Time Range Dropdown */}
            <div className="relative">
              <div 
                onClick={() => setIsTimeDropdownOpen(!isTimeDropdownOpen)}
                className={`flex items-center bg-[#1c212b] border cursor-pointer ${isTimeDropdownOpen ? 'border-[#818cf8]' : 'border-[#2d333b]'} hover:border-[#818cf8] transition-colors rounded-lg px-4 py-2 text-xs font-mono text-[#8b949e]`}
              >
                <Clock className="w-3 h-3 mr-2 text-[#a5b4fc]" />
                <span>Last {timeRange.replace('m', ' min').replace('h', ' hour').replace('d', ' day')}</span>
                <ChevronDown className="w-3 h-3 ml-2 text-[#8b949e]" />
              </div>
              
              {isTimeDropdownOpen && (
                <div className="absolute top-10 right-0 w-48 bg-[#161b22] border border-[#2d333b] rounded-lg shadow-xl z-50 overflow-hidden">
                  <div className="px-4 py-2 text-[9px] text-[#8b949e] font-mono tracking-wider border-b border-[#2d333b] uppercase bg-[#0d1117]">
                    Larger ranges use wider buckets
                  </div>
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
              onClick={fetchAll}
              disabled={isLoading}
              className="bg-gradient-to-r from-[#818cf8] to-[#c084fc] hover:opacity-90 disabled:opacity-50 text-white px-5 py-2 rounded-lg text-sm font-bold shadow-[0_0_15px_rgba(129,140,248,0.3)] transition-all active:scale-95"
            >
              {isLoading ? 'Loading...' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* 3x2 KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">

          {/* P99 Latency */}
          <MetricCard title="P99 Latency" value={stats.latency} unit="ms" icon={Loader} color="#fff" data={latencyData}
            emptyLabel="No latency data — instrument your services with the SDK"
            chart={
              <ResponsiveContainer width="100%" height="100%">
                {visType === 'lines' ? (
                  <AreaChart data={latencyData}>
                    <defs>
                      <linearGradient id="purpleGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#c084fc" stopOpacity={0.4}/>
                        <stop offset="100%" stopColor="#c084fc" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <RechartsTooltip cursor={{stroke: '#374151', strokeWidth: 1}} content={<CustomTooltip />} />
                    <Area isAnimationActive={false} type="monotone" dataKey="val" stroke="#c084fc" strokeWidth={3} fill="url(#purpleGrad)" />
                    <XAxis dataKey="time" hide /><YAxis hide />
                  </AreaChart>
                ) : (
                  <BarChart data={latencyData}>
                    <RechartsTooltip cursor={{fill: '#1c212b'}} content={<CustomTooltip />} />
                    <Bar isAnimationActive={false} dataKey="val" fill="#c084fc" radius={[2,2,0,0]} />
                    <XAxis dataKey="time" hide /><YAxis hide />
                  </BarChart>
                )}
              </ResponsiveContainer>
            }
          />

          {/* CPU Utilization */}
          <MetricCard title="CPU Utilization" value={stats.cpu} unit="%" icon={Cpu} color="#fff" data={cpuData}
            emptyLabel="No CPU data yet"
            chart={
              <ResponsiveContainer width="100%" height="100%">
                {visType === 'lines' ? (
                  <LineChart data={cpuData}>
                    <RechartsTooltip cursor={{stroke: '#374151', strokeWidth: 1}} content={<CustomTooltip />} />
                    <Line isAnimationActive={false} type="linear" dataKey="val" stroke="#e2e8f0" strokeWidth={2} dot={false} />
                    <XAxis dataKey="time" hide /><YAxis domain={[0, 100]} hide />
                  </LineChart>
                ) : (
                  <BarChart data={cpuData}>
                    <RechartsTooltip cursor={{fill: '#1c212b'}} content={<CustomTooltip />} />
                    <Bar isAnimationActive={false} dataKey="val" fill="#e2e8f0" radius={[2,2,0,0]} />
                    <XAxis dataKey="time" hide /><YAxis hide />
                  </BarChart>
                )}
              </ResponsiveContainer>
            }
          />

          {/* Memory */}
          <MetricCard title="Memory Usage" value={stats.mem} unit="%" icon={Server} color="#fff" data={memData}
            emptyLabel="No memory data yet"
            chart={
              <ResponsiveContainer width="100%" height="100%">
                {visType === 'lines' ? (
                  <AreaChart data={memData}>
                    <defs>
                      <linearGradient id="memGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.4}/>
                        <stop offset="100%" stopColor="#38bdf8" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <RechartsTooltip cursor={{stroke: '#374151', strokeWidth: 1}} content={<CustomTooltip />} />
                    <Area isAnimationActive={false} type="monotone" dataKey="val" stroke="#38bdf8" strokeWidth={3} fill="url(#memGrad)" />
                    <XAxis dataKey="time" hide /><YAxis domain={[0, 100]} hide />
                  </AreaChart>
                ) : (
                  <BarChart data={memData}>
                    <RechartsTooltip cursor={{fill: '#1c212b'}} content={<CustomTooltip />} />
                    <Bar isAnimationActive={false} dataKey="val" fill="#38bdf8" radius={[2,2,0,0]} />
                    <XAxis dataKey="time" hide /><YAxis hide />
                  </BarChart>
                )}
              </ResponsiveContainer>
            }
          />

          {/* Throughput (RPS) — aggregated from request_count / interval */}
          <MetricCard title="Throughput" value={stats.throughput} unit="RPS" icon={Zap} color="#2dd4bf" data={throughputData}
            emptyLabel="No request_count data — send HTTP metrics to see RPS"
            chart={
              <ResponsiveContainer width="100%" height="100%">
                {visType === 'lines' ? (
                  <AreaChart data={throughputData}>
                    <defs>
                      <linearGradient id="cyanGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#2dd4bf" stopOpacity={0.4}/>
                        <stop offset="100%" stopColor="#2dd4bf" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <RechartsTooltip cursor={{stroke: '#374151', strokeWidth: 1}} content={<CustomTooltip />} />
                    <Area isAnimationActive={false} type="monotone" dataKey="val" stroke="#2dd4bf" strokeWidth={3} fill="url(#cyanGrad)" />
                    <XAxis dataKey="time" hide /><YAxis hide />
                  </AreaChart>
                ) : (
                  <BarChart data={throughputData}>
                    <RechartsTooltip cursor={{fill: '#1c212b'}} content={<CustomTooltip />} />
                    <Bar isAnimationActive={false} dataKey="val" fill="#2dd4bf" radius={[2,2,0,0]} />
                    <XAxis dataKey="time" hide /><YAxis hide />
                  </BarChart>
                )}
              </ResponsiveContainer>
            }
          />

          {/* Error Rate — (error_count / request_count) * 100 per bucket */}
          <MetricCard title="Error Rate" value={stats.errorRate} unit="%" icon={Activity} color="#fca5a5" data={errorData}
            emptyLabel="No error data — send error_count metric to see error rate"
            chart={
              <ResponsiveContainer width="100%" height="100%">
                {visType === 'lines' ? (
                  <AreaChart data={errorData}>
                    <defs>
                      <linearGradient id="amberGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#fdba74" stopOpacity={0.4}/>
                        <stop offset="100%" stopColor="#fdba74" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <RechartsTooltip cursor={{stroke: '#374151', strokeWidth: 1}} content={<CustomTooltip />} />
                    <Area isAnimationActive={false} type="monotone" dataKey="val" stroke="#fdba74" strokeWidth={3} fill="url(#amberGrad)" />
                    <XAxis dataKey="time" hide /><YAxis hide />
                  </AreaChart>
                ) : (
                  <BarChart data={errorData}>
                    <RechartsTooltip cursor={{fill: '#1c212b'}} content={<CustomTooltip />} />
                    <Bar isAnimationActive={false} dataKey="val" fill="#fdba74" radius={[2,2,0,0]} />
                    <XAxis dataKey="time" hide /><YAxis hide />
                  </BarChart>
                )}
              </ResponsiveContainer>
            }
          />

          {/* Active Connections — metric_name=active_connections */}
          <MetricCard title="Active Connections" value={stats.connections} unit="" icon={Hash} color="#2dd4bf" data={connectionsData}
            emptyLabel="Send active_connections metric from your SDK to see connection counts"
            chart={
              <ResponsiveContainer width="100%" height="100%">
                {visType === 'lines' ? (
                  <LineChart data={connectionsData}>
                    <RechartsTooltip cursor={{stroke: '#374151', strokeWidth: 1}} content={<CustomTooltip />} />
                    <Line isAnimationActive={false} type="linear" dataKey="val" stroke="#2dd4bf" strokeWidth={2.5} strokeDasharray="4 6" dot={false} />
                    <XAxis dataKey="time" hide /><YAxis hide />
                  </LineChart>
                ) : (
                  <BarChart data={connectionsData}>
                    <RechartsTooltip cursor={{fill: '#1c212b'}} content={<CustomTooltip />} />
                    <Bar isAnimationActive={false} dataKey="val" fill="#2dd4bf" radius={[2,2,0,0]} />
                    <XAxis dataKey="time" hide /><YAxis hide />
                  </BarChart>
                )}
              </ResponsiveContainer>
            }
          />

        </div>
      </div>

      {/* RIGHT SIDEBAR PANEL */}
      <div className="w-[300px] shrink-0 bg-[#0d1017] border border-[#2d333b] rounded-xl flex flex-col h-full overflow-hidden shadow-2xl">
        
        <div className="p-5 border-b border-[#2d333b] flex items-center space-x-3 bg-[#161b22]">
          <Filter className="w-4 h-4 text-[#a5b4fc]" />
          <h2 className="text-sm font-bold text-white tracking-wide">Metric Explorer</h2>
        </div>

        <div className="p-5 flex-1 overflow-y-auto space-y-8">
          
          {/* Node Filter */}
          <div className="space-y-3 relative">
            <span className="text-[10px] font-mono tracking-widest text-[#8b949e] uppercase">Node Targeting</span>
            
            <div 
              onClick={() => setIsServerDropdownOpen(!isServerDropdownOpen)}
              className={`flex justify-between items-center bg-[#1c212b] border ${isServerDropdownOpen ? 'border-[#818cf8]' : 'border-[#2d333b] hover:border-[#818cf8]'} px-4 py-2.5 rounded-lg cursor-pointer transition-colors group relative`}
            >
              <span className={`text-sm font-medium ${isServerDropdownOpen ? 'text-white' : 'text-[#c9d1d9]'}`}>
                {selectedServerId ? servers.find(s => s.id === selectedServerId)?.name || 'Unknown Node' : 'All Servers'}
              </span>
              <ChevronDown className={`w-4 h-4 text-[#8b949e] transition-transform ${isServerDropdownOpen ? 'rotate-180' : ''}`} />
            </div>
            
            {isServerDropdownOpen && (
              <div className="absolute top-[60px] left-0 right-0 bg-[#161b22] border border-[#2d333b] rounded-lg shadow-xl z-50 overflow-hidden">
                <div 
                  onClick={() => { setSelectedServerId(''); setIsServerDropdownOpen(false); }}
                  className={`px-4 py-3 text-sm cursor-pointer flex items-center justify-between ${!selectedServerId ? 'text-white bg-[#1c212b]' : 'text-[#8b949e] hover:bg-[#1c212b] hover:text-white'}`}
                >
                  <span>All Servers</span>
                  {!selectedServerId && <Check className="w-4 h-4 text-[#c084fc]" />}
                </div>
                {servers.map((server) => (
                  <div 
                    key={server.id}
                    onClick={() => { setSelectedServerId(server.id); setIsServerDropdownOpen(false); }}
                    className={`px-4 py-3 text-sm cursor-pointer flex items-center justify-between ${selectedServerId === server.id ? 'text-white bg-[#1c212b]' : 'text-[#8b949e] hover:bg-[#1c212b] hover:text-white'}`}
                  >
                    <span>{server.name}</span>
                    {selectedServerId === server.id && <Check className="w-4 h-4 text-[#c084fc]" />}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Visualization Type */}
          <div className="space-y-3 pt-4 border-t border-[#2d333b]">
            <span className="text-[10px] font-mono tracking-widest text-[#8b949e] uppercase">Visualization</span>
            <div className="grid grid-cols-2 gap-2">
              <div 
                onClick={() => setVisType('lines')}
                className={`flex flex-col items-center justify-center border rounded-lg p-4 cursor-pointer transition-all ${visType === 'lines' ? 'bg-[#1c212b] border-[#818cf8]' : 'bg-[#1c212b] border-[#2d333b] hover:bg-[#2d333b]'}`}
              >
                <Activity className={`w-5 h-5 mb-2 ${visType === 'lines' ? 'text-[#818cf8]' : 'text-[#8b949e]'}`} />
                <span className={`text-xs ${visType === 'lines' ? 'text-white' : 'text-[#8b949e]'}`}>Lines</span>
              </div>
              <div 
                onClick={() => setVisType('bars')}
                className={`flex flex-col items-center justify-center border rounded-lg p-4 cursor-pointer transition-all ${visType === 'bars' ? 'bg-[#1c212b] border-[#818cf8]' : 'bg-[#1c212b] border-[#2d333b] hover:bg-[#2d333b]'}`}
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
