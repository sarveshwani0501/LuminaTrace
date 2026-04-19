import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { AreaChart, Area, ResponsiveContainer, Tooltip as RechartsTooltip, XAxis } from 'recharts';
import { AlertCircle, Clock, Server, Activity, TerminalSquare, Route, BarChart2, Inbox } from 'lucide-react';
import { metricsApi } from '../../api/metrics';
import { logsApi } from '../../api/logs';
import { serversApi } from '../../api/servers';
import { io } from 'socket.io-client';
const Dashboard = () => {
  const { currentProject } = useSelector(state => state.project);

  // States
  const [stats, setStats] = useState({
    errors: 0,
    avgLatency: 0,
    activeServers: 0,
    cpuLoad: 0,
    memoryLoad: 0,
  });
  const [chartData, setChartData] = useState([]);
  const [liveLogs, setLiveLogs] = useState([]);
  const [topRoutes, setTopRoutes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Bypass Redux null state for UI preview purposes
  const uiProject = currentProject;

  useEffect(() => {
    if (!uiProject?.id) return;

    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        const [latestRes, cpuTimeRes, memTimeRes] = await Promise.all([
          metricsApi.getLatestMetrics(uiProject.id),
          metricsApi.getTimeseries(uiProject.id, 'cpu_usage', '1h'),
          metricsApi.getTimeseries(uiProject.id, 'memory_used_percent', '1h')
        ]);

        const metricsList = latestRes.data?.metrics || [];
        
        // Find specific metrics
        const getMetricVal = (name) => {
          const m = metricsList.find(x => x.name === name);
          return m ? parseFloat(m.value) : 0;
        };

        setStats(prev => ({
          ...prev,
          avgLatency: getMetricVal('response_time').toFixed(0),
          cpuLoad: getMetricVal('cpu_usage').toFixed(1),
          memoryLoad: getMetricVal('memory_used_percent').toFixed(1)
        }));

        // Zip timeseries arrays for Recharts
        const cpuData = cpuTimeRes.data?.data || [];
        const memData = memTimeRes.data?.data || [];
       
        // We assume buckets align, but practically we should index them
        const timeMap = {};
        
        cpuData.forEach(d => {
           const timeStr = new Date(d.time_bucket).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
           timeMap[timeStr] = { time: timeStr, cpu: parseFloat(d.avg_value || d.value).toFixed(2), memory: 0 };
        });

        memData.forEach(d => {
           const timeStr = new Date(d.time_bucket).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
           if (!timeMap[timeStr]) timeMap[timeStr] = { time: timeStr, cpu: 0 };
           timeMap[timeStr].memory = parseFloat(d.avg_value || d.value).toFixed(2);
        });

        const mergedChart = Object.values(timeMap).sort((a,b) => a.time.localeCompare(b.time));
        setChartData(mergedChart);
        
        // Note: For Top Routes & Total Errors, those could be aggregated or pulled from Postgres when that analytics query is integrated.

      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, [currentProject?.id]);


  useEffect(() => {
    if(!currentProject?.id) return ;

    const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:3000', {
      withCredentials: true,
    })

    socket.on('connect', () => {
      console.log('Socket connected', socket.id);
      // Essential: Must instruct the backend to join the specific broadcast room!
      socket.emit('join_project', currentProject.id);
    });

    socket.on('joined_project', (data) => {
      console.log(`Now securely receiving live telemetry for project: ${data.projectId}`);
    });

    socket.on('new_metric', (metric) => {
      console.log('Live Metric: ', metric);

      if(metric.name === 'cpu_usage' || metric.name === 'memory_used_percent') {
        setStats(prev => ({
          ...prev,
          cpuLoad: metric.name === 'cpu_usage' ? parseFloat(metric.value).toFixed(1) : prev.cpuLoad,
          memoryLoad: metric.name === 'memory_used_percent' ? parseFloat(metric.value).toFixed(1) : prev.memoryLoad
        }))


        // Format the new data point to fit the Dual-Line Recharts map
        const timeStr = typeof metric.time === 'string' 
          ? new Date(metric.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
          : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        setChartData(prev => {
          const lastPoint = prev[prev.length - 1] || {};
          const newPoint = {
            time: timeStr,
            cpu: metric.name === 'cpu_usage' ? parseFloat(metric.value).toFixed(2) : (lastPoint.cpu || 0),
            memory: metric.name === 'memory_used_percent' ? parseFloat(metric.value).toFixed(2) : (lastPoint.memory || 0)
          };
          
          const updated = [...prev, newPoint];
          // Limit exactly to last 60 points for a smooth sliding window
          return updated.slice(-60);
        });
      }
    })


    socket.on('new_log', (log) => {
      setLiveLogs(prev => {
        const updated = [log, ...prev];
        return updated.slice(0, 100);
      })
    })


    return () => {
      socket.disconnect();
    }
  }, [uiProject?.id]);

  // A tiny custom tooltip for the Recharts graph
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-surface/90 border border-border p-2 rounded shadow-glass backdrop-blur-md">
          <p className="text-xs text-text-muted mb-1">{payload[0].payload.time} UTC</p>
          <p className="text-sm font-semibold text-primary">CPU: {payload[0].value}%</p>
          {payload[1] && <p className="text-sm font-semibold text-secondary">MEM: {payload[1].value}%</p>}
        </div>
      );
    }
    return null;
  };

  /**
   * Helper to colorize log levels
   */
  const renderLogLevel = (level) => {
    switch (level?.toUpperCase()) {
      case 'INFO': return <span className="text-primary font-bold">[INFO]</span>;
      case 'WARN': return <span className="text-accent-warning font-bold">[WARN]</span>;
      case 'ERROR': return <span className="text-accent-error bg-accent-error/10 px-1 rounded font-bold">[ERROR]</span>;
      default: return <span className="text-text-muted font-bold">[{level}]</span>;
    }
  };

  if (!uiProject) {
    return <div className="p-8 text-text-muted">Please select a project from the sidebar to view metrics.</div>;
  }

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto pb-10">
      
      {/* KPI HERO ROW */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* TOTAL ERRORS */}
        <div className="bg-surface border border-border rounded-xl p-5 shadow-sm relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-semibold tracking-wider text-text-muted uppercase">Total Errors</span>
            <AlertCircle className="w-4 h-4 text-accent-error/60" />
          </div>
          <div className="flex items-end space-x-2">
            <span className="text-4xl font-bold text-accent-error">1.2k</span>
            <span className="text-sm font-medium text-text-muted mb-1">+12.3%</span>
          </div>
          {/* Subtle decoration */}
          <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-accent-error/5 rounded-full blur-xl group-hover:bg-accent-error/10 transition-colors"></div>
        </div>

        {/* AVG LATENCY */}
        <div className="bg-surface border border-border rounded-xl p-5 shadow-sm relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-semibold tracking-wider text-text-muted uppercase">Avg Latency</span>
            <Clock className="w-4 h-4 text-primary/60" />
          </div>
          <div className="flex items-end space-x-2">
            <span className="text-4xl font-bold text-primary">{stats.avgLatency}</span>
            <span className="text-sm font-medium text-text-muted mb-1">ms</span>
            <span className="text-xs font-medium text-accent-success mb-1 ml-2">-4ms</span>
          </div>
          <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-primary/5 rounded-full blur-xl group-hover:bg-primary/10 transition-colors"></div>
        </div>

        {/* CPU/MEM LOAD */}
        <div className="bg-surface border border-border rounded-xl p-5 shadow-sm relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-semibold tracking-wider text-text-muted uppercase">Avg System Load</span>
            <Activity className="w-4 h-4 text-secondary/60" />
          </div>
          <div className="flex items-end space-x-2">
            <span className="text-4xl font-bold text-secondary">{stats.cpuLoad}</span>
            <span className="text-sm font-medium text-text-muted mb-1">%</span>
          </div>
          <div className="w-full bg-background rounded-full h-1.5 mt-4">
            <div className="bg-secondary h-1.5 rounded-full" style={{ width: `${Math.min(stats.cpuLoad, 100)}%` }}></div>
          </div>
        </div>

        {/* ACTIVE SERVERS */}
        <div className="bg-surface border border-border rounded-xl p-5 shadow-sm relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-semibold tracking-wider text-text-muted uppercase">Active Servers</span>
            <Server className="w-4 h-4 text-accent-success/60" />
          </div>
          <div className="flex items-end space-x-2">
            <span className="text-4xl font-bold text-text-primary">{stats.activeServers}</span>
          </div>
          {/* Active node indicators */}
          <div className="flex space-x-1 mt-4">
            {[...Array(Math.min(stats.activeServers || 5, 12))].map((_, i) => (
              <div key={i} className="w-2 h-2 rounded-full bg-accent-success/80 animate-pulse" style={{ animationDelay: `${i * 100}ms` }}></div>
            ))}
          </div>
        </div>

      </div>

      {/* MIDDLE SECTION: INFRASTRUCTURE HEALTH CHART */}
      <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-lg font-bold text-text-primary">Infrastructure Health</h2>
            <p className="text-xs text-text-muted">CPU & Memory Utilization over time</p>
          </div>
          <div className="flex space-x-4 text-xs font-medium">
            <div className="flex items-center space-x-1"><div className="w-2 h-2 rounded-sm bg-primary"></div><span className="text-text-secondary">CPU LOAD</span></div>
            <div className="flex items-center space-x-1"><div className="w-2 h-2 rounded-sm bg-secondary"></div><span className="text-text-secondary">MEMORY</span></div>
          </div>
        </div>
        
        <div className="h-[280px] w-full">
          {chartData.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <BarChart2 className="w-10 h-10 text-border mb-3" />
              <p className="text-sm font-medium text-text-muted">No telemetry data yet</p>
              <p className="text-xs text-text-muted/60 mt-1 max-w-xs">
                Send metrics from your servers using your API key to see CPU &amp; memory usage here.
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorMem" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" hide />
                <RechartsTooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }} />
                <Area isAnimationActive={false} type="monotone" dataKey="cpu" stroke="#818cf8" strokeWidth={3} fillOpacity={1} fill="url(#colorCpu)" activeDot={{ r: 6, fill: '#818cf8', stroke: '#111827', strokeWidth: 2 }} />
                <Area isAnimationActive={false} type="monotone" dataKey="memory" stroke="#38bdf8" strokeWidth={3} fillOpacity={1} fill="url(#colorMem)" activeDot={{ r: 6, fill: '#38bdf8', stroke: '#111827', strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* BOTTOM SECTION: LIVE INTELLIGENCE SPLIT */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* LEFT: REAL-TIME TERMINAL */}
        <div className="bg-[#0D1117] border border-border rounded-xl shadow-sm overflow-hidden flex flex-col h-[350px]">
          <div className="bg-surface/50 border-b border-border px-4 py-3 flex justify-between items-center shrink-0">
            <div className="flex items-center space-x-2">
              <TerminalSquare className="w-4 h-4 text-primary" />
              <span className="text-xs font-mono font-semibold text-text-primary">Live Terminal Stream <span className="text-text-muted opacity-50 ml-2">|</span></span>
              
              {/* Routing Link to full logs */}
              <button onClick={() => window.location.href = '/app/logs'} className="text-[10px] text-primary hover:text-primary/70 font-bold uppercase transition-colors flex items-center bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                View Full Stream
              </button>
            </div>
            <div className="flex space-x-1 border border-border rounded-full p-1 opacity-60">
              <div className="w-2 h-2 rounded-full bg-accent-error"></div>
              <div className="w-2 h-2 rounded-full bg-accent-warning"></div>
              <div className="w-2 h-2 rounded-full bg-accent-success"></div>
            </div>
          </div>
          <div className="p-4 flex-1 overflow-y-auto font-mono text-[11px] leading-relaxed space-y-2">
            {liveLogs.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-8">
                <Inbox className="w-8 h-8 text-border mb-3" />
                <p className="text-xs text-text-muted">No events yet</p>
                <p className="text-[10px] text-text-muted/50 mt-1">Waiting for live log events from your servers...</p>
              </div>
            ) : (
              liveLogs.map((log, index) => {
                const timeStr = typeof log.timestamp === 'string' ? log.timestamp.split('T')[1]?.substring(0,8) : new Date(log.timestamp).toLocaleTimeString();
                return (
                  <div key={index} className="flex space-x-3 items-start break-all">
                    <span className="text-text-muted shrink-0 w-16">{timeStr}</span>
                    <span className="shrink-0 w-14">{renderLogLevel(log.level)}</span>
                    <span className={`text-text-primary flex-1 ${log.level === 'ERROR' ? 'text-accent-error bg-accent-error/5 p-1 -m-1 rounded leading-tight' : ''}`}>
                      {log.message}
                    </span>
                  </div>
                );
              })
            )}
            {/* Live indicator */}
            <div className="flex space-x-3 items-center pt-2 opacity-50">
              <span className="w-1.5 h-4 bg-primary animate-pulse"></span>
              <span className="text-text-muted italic text-[10px]">Listening for events...</span>
            </div>
          </div>
        </div>

        {/* RIGHT: TOP API ROUTES / LATENCY BREAKDOWN */}
        <div className="bg-surface border border-border rounded-xl p-6 shadow-sm overflow-hidden h-[350px] flex flex-col">
          <div className="flex justify-between items-center mb-6 shrink-0">
             <div className="flex items-center space-x-2">
                <Route className="w-4 h-4 text-secondary" />
                <h2 className="text-sm font-bold text-text-primary">Top API Endpoints</h2>
             </div>
             <span className="text-[10px] bg-background px-2 py-1 rounded border border-border text-text-muted font-mono uppercase tracking-wider">Avg Latency Map</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-5 pr-2">
            {topRoutes.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-8">
                <Route className="w-8 h-8 text-border mb-3" />
                <p className="text-sm font-medium text-text-muted">No route data yet</p>
                <p className="text-xs text-text-muted/60 mt-1 max-w-xs">
                  API endpoint latency will appear here once your services start sending traces.
                </p>
              </div>
            ) : (
              topRoutes.map((route, i) => {
                const maxLatency = 700;
                const percent = Math.min((route.latency / maxLatency) * 100, 100);
                return (
                  <div key={i} className="group">
                    <div className="flex justify-between font-mono text-[10px] mb-1.5">
                      <span className="text-text-secondary truncate pr-4">{route.path || route.route}</span>
                      <span className="text-text-muted whitespace-nowrap">{route.latency}ms - <span className="text-primary">{route.count} reqs</span></span>
                    </div>
                    <div className="w-full bg-background rounded-full h-1">
                      <div 
                        className={`h-1 rounded-full ${route.latency > 400 ? 'bg-accent-error' : route.latency > 150 ? 'bg-accent-warning' : 'bg-primary'}`} 
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
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

export default Dashboard;
