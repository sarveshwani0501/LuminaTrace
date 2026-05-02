import React, { useState, useEffect, memo } from 'react';
import { useSelector } from 'react-redux';
import {
  AreaChart, Area, ResponsiveContainer,
  Tooltip as RechartsTooltip, XAxis, YAxis
} from 'recharts';
import {
  AlertCircle, Clock, Cpu, Server,
  TerminalSquare, Route, BarChart2,
  Inbox, Activity, ArrowRight
} from 'lucide-react';
import { metricsApi } from '../../api/metrics';
import { logsApi }    from '../../api/logs';
import { serversApi } from '../../api/servers';
import { io }         from 'socket.io-client';

/* ─────────────────────────────────────────────────────────────────
   CHART TOOLTIP
───────────────────────────────────────────────────────────────── */
const ChartTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface-elevated border border-border-light rounded-lg px-3 py-2 shadow-elevated text-xs font-mono">
      <p className="text-text-muted mb-1">{payload[0]?.payload?.time}</p>
      <p className="text-primary">CPU &nbsp;{payload[0]?.value ?? '—'}%</p>
      {payload[1] && <p className="text-secondary">MEM {payload[1].value}%</p>}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────
   LOG LEVEL BADGE
───────────────────────────────────────────────────────────────── */
const LogLevelBadge = ({ level }) => {
  const map = {
    INFO:     'text-log-info  bg-log-infoSubtle  border-log-info/20',
    WARN:     'text-log-warning bg-log-warningSubtle border-log-warning/20',
    WARNING:  'text-log-warning bg-log-warningSubtle border-log-warning/20',
    ERROR:    'text-log-error bg-log-errorSubtle border-log-error/20',
    CRITICAL: 'text-log-critical bg-log-criticalSubtle border-log-critical/20',
    DEBUG:    'text-log-debug bg-log-debugSubtle border-log-debug/20',
  };
  const key = level?.toUpperCase() ?? 'INFO';
  const cls = map[key] ?? map.INFO;
  return (
    <span className={`inline-flex items-center px-1.5 py-px rounded border font-mono text-[10px] font-semibold uppercase tracking-wide shrink-0 w-14 justify-center ${cls}`}>
      {key.slice(0, 4)}
    </span>
  );
};

/* ─────────────────────────────────────────────────────────────────
   METHOD BADGE
───────────────────────────────────────────────────────────────── */
const MethodBadge = ({ method }) => {
  const map = {
    GET:    'text-accent-success bg-accent-success/10',
    POST:   'text-primary bg-primary/10',
    PUT:    'text-accent-warning bg-accent-warning/10',
    PATCH:  'text-secondary bg-secondary/10',
    DELETE: 'text-accent-error bg-accent-error/10',
  };
  const cls = map[method?.toUpperCase()] ?? 'text-text-muted bg-surface-active';
  return (
    <span className={`inline-flex items-center px-1.5 py-px rounded font-mono text-[10px] font-semibold uppercase shrink-0 w-12 justify-center ${cls}`}>
      {method ?? 'GET'}
    </span>
  );
};

/* ─────────────────────────────────────────────────────────────────
   KPI CARD
───────────────────────────────────────────────────────────────── */
const KpiCard = ({ label, value, unit, sub, subColor = 'text-text-muted', icon: Icon, accentColor, barPct }) => (
  <div className="bg-surface border border-border rounded-card p-5 relative overflow-hidden group transition-all duration-base hover:border-border-light hover:shadow-elevated">
    {/* Header */}
    <div className="flex items-center justify-between mb-3">
      <span className="text-[10px] font-semibold uppercase tracking-widest text-text-muted">{label}</span>
      {Icon && <Icon className="w-3.5 h-3.5 opacity-50" style={{ color: accentColor }} />}
    </div>

    {/* Value */}
    <div className="flex items-baseline gap-1.5 mb-1">
      <span className="text-3xl font-semibold leading-none" style={{ color: accentColor }}>
        {value}
      </span>
      {unit && <span className="text-sm text-text-muted">{unit}</span>}
    </div>

    {/* Sub */}
    {sub && <p className={`text-[11px] mt-1 ${subColor}`}>{sub}</p>}

    {/* Progress bar */}
    {barPct !== undefined && (
      <div className="mt-3 h-0.5 w-full bg-background rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-slow"
          style={{ width: `${Math.min(barPct, 100)}%`, background: accentColor, opacity: 0.7 }}
        />
      </div>
    )}

    {/* Ambient corner glow */}
    <div
      className="absolute -bottom-5 -right-5 w-20 h-20 rounded-full blur-2xl opacity-10 group-hover:opacity-20 transition-opacity duration-slow pointer-events-none"
      style={{ background: accentColor }}
    />
  </div>
);

/* ─────────────────────────────────────────────────────────────────
   EMPTY STATE
───────────────────────────────────────────────────────────────── */
const EmptyState = ({ icon: Icon, title, subtitle }) => (
  <div className="flex flex-col items-center justify-center h-full gap-3 py-10 text-center">
    <Icon className="w-8 h-8 text-border" />
    <div>
      <p className="text-sm font-medium text-text-muted">{title}</p>
      {subtitle && <p className="text-xs text-text-muted/60 mt-1 max-w-xs mx-auto">{subtitle}</p>}
    </div>
  </div>
);

/* ─────────────────────────────────────────────────────────────────
   DASHBOARD
───────────────────────────────────────────────────────────────── */
const Dashboard = () => {
  const { currentProject } = useSelector(state => state.project);

  const [stats, setStats] = useState({
    errors: 0,
    avgLatency: 0,
    activeServers: 0,
    cpuLoad: 0,
    memoryLoad: 0,
  });
  const [chartData, setChartData] = useState([]);
  const [liveLogs,  setLiveLogs]  = useState([]);
  const [topRoutes, setTopRoutes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  /* ── Initial data fetch ───────────────────────────────────── */
  useEffect(() => {
    if (!currentProject?.id) return;

    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        const [
          latestRes, cpuTimeRes, memTimeRes,
          recentLogsRes, errorTimeRes, topRoutesRes, serversRes
        ] = await Promise.all([
          metricsApi.getLatestMetrics(currentProject.id),
          metricsApi.getTimeseries(currentProject.id, 'cpu_usage', '1h'),
          metricsApi.getTimeseries(currentProject.id, 'memory_used_percent', '1h'),
          logsApi.getRecentLogs(currentProject.id, 50),
          metricsApi.getTimeseries(currentProject.id, 'error_count', '1h'),
          logsApi.getTopRoutes(currentProject.id, '24h', 10),
          serversApi.listServers(currentProject.id),
        ]);

        const metricsList = latestRes.data?.metrics || [];
        if (recentLogsRes?.data?.logs) setLiveLogs(recentLogsRes.data.logs);
        if (topRoutesRes?.data?.routes) setTopRoutes(topRoutesRes.data.routes);

        const errorData  = errorTimeRes.data?.data || [];
        // The generic timeseries API returns avg_value and data_points.
        // For a count metric, sum = avg_value * data_points.
        const totalErrors = errorData.reduce((acc, d) => {
          const avg = parseFloat(d.avg_value || 0);
          const points = parseInt(d.data_points || 1, 10);
          return acc + Math.round(avg * points);
        }, 0);

        const getMetricVal = (name) => {
          const m = metricsList.find(x => x.name === name);
          return m ? parseFloat(m.value) : 0;
        };

        const activeServers = (serversRes?.data?.servers || []).filter(s => s.status === 'online');

        setStats({
          errors: totalErrors,
          avgLatency: getMetricVal('response_time').toFixed(0),
          cpuLoad: getMetricVal('cpu_usage').toFixed(1),
          memoryLoad: getMetricVal('memory_used_percent').toFixed(1),
          activeServers: activeServers.length,
        });

        /* ── Build chart data ── */
        const cpuData = cpuTimeRes.data?.data || [];
        const memData = memTimeRes.data?.data || [];
        const timeMap = {};

        cpuData.forEach(d => {
          const tv  = d.time_bucket || d.bucket || d.time;
          const raw = new Date(tv).getTime();
          const str = new Date(tv).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          timeMap[str] = { rawTime: raw, time: str, cpu: parseFloat(d.avg_value ?? d.value).toFixed(1), memory: 0 };
        });
        memData.forEach(d => {
          const tv  = d.time_bucket || d.bucket || d.time;
          const raw = new Date(tv).getTime();
          const str = new Date(tv).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          if (!timeMap[str]) timeMap[str] = { rawTime: raw, time: str, cpu: 0 };
          timeMap[str].memory = parseFloat(d.avg_value ?? d.value).toFixed(1);
        });

        setChartData(Object.values(timeMap).sort((a, b) => a.rawTime - b.rawTime));
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, [currentProject?.id]);

  /* ── Socket.io real-time ──────────────────────────────────── */
  useEffect(() => {
    if (!currentProject?.id) return;

    const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:3000', {
      withCredentials: true,
    });

    socket.on('connect', () => socket.emit('join_project', currentProject.id));

    socket.on('new_metric', (metric) => {
      if (metric.name === 'cpu_usage' || metric.name === 'memory_used_percent') {
        setStats(prev => ({
          ...prev,
          cpuLoad: metric.name === 'cpu_usage'
            ? parseFloat(metric.value).toFixed(1)
            : prev.cpuLoad,
          memoryLoad: metric.name === 'memory_used_percent'
            ? parseFloat(metric.value).toFixed(1)
            : prev.memoryLoad,
        }));

        const timeStr = new Date(metric.time || Date.now())
          .toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

        setChartData(prev => {
          const last = prev[prev.length - 1];
          if (last?.time === timeStr) {
            const updated = { ...last };
            if (metric.name === 'cpu_usage')          updated.cpu    = parseFloat(metric.value).toFixed(1);
            if (metric.name === 'memory_used_percent') updated.memory = parseFloat(metric.value).toFixed(1);
            return [...prev.slice(0, -1), updated];
          }
          return [...prev, {
            rawTime: Date.now(),
            time: timeStr,
            cpu: metric.name === 'cpu_usage' ? parseFloat(metric.value).toFixed(1) : (last?.cpu ?? 0),
            memory: metric.name === 'memory_used_percent' ? parseFloat(metric.value).toFixed(1) : (last?.memory ?? 0),
          }].slice(-60);
        });
      }
    });

    socket.on('new_log', (log) => {
      setLiveLogs(prev => {
        let meta = log.metadata;
        if (typeof meta === 'string') { try { meta = JSON.parse(meta); } catch (_) {} }
        return [{ ...log, metadata: meta }, ...prev].slice(0, 100);
      });
    });

    return () => socket.disconnect();
  }, [currentProject?.id]);

  /* ── No project selected ──────────────────────────────────── */
  if (!currentProject) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-sm text-text-muted">Select a project from the sidebar to view metrics.</p>
      </div>
    );
  }

  /* ── Helpers ──────────────────────────────────────────────── */
  const errRate = (rate) => {
    const v = parseFloat(rate || 0);
    if (v === 0)  return 'text-accent-success bg-accent-success/10';
    if (v < 5)    return 'text-accent-warning bg-accent-warning/10';
    return        'text-accent-error bg-accent-error/10';
  };

  const barColor = (rate) => {
    const v = parseFloat(rate || 0);
    if (v === 0) return '#7C3AED';
    if (v < 5)   return '#F59E0B';
    return '#EF4444';
  };

  /* ─────────────────────────────────────────────────────────── */
  return (
    <div className="flex flex-col gap-5 w-full max-w-7xl mx-auto pb-10">

      {/* ── KPI ROW ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

        <KpiCard
          label="Total errors"
          value={stats.errors >= 1000 ? (stats.errors / 1000).toFixed(1) + 'k' : stats.errors}
          sub="this hour"
          icon={AlertCircle}
          accentColor="#EF4444"
          barPct={Math.min((stats.errors / 500) * 100, 100)}
        />

        <KpiCard
          label="Avg latency"
          value={stats.avgLatency}
          unit="ms"
          icon={Clock}
          accentColor="#7C3AED"
          barPct={Math.min((stats.avgLatency / 1000) * 100, 100)}
        />

        {/* CPU + Memory dual-metric card */}
        <div className="bg-surface border border-border rounded-card p-5 relative overflow-hidden group transition-all duration-base hover:border-border-light hover:shadow-elevated">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-text-muted">System load</span>
            <Cpu className="w-3.5 h-3.5 text-secondary/50" />
          </div>
          <div className="flex items-baseline gap-1.5 mb-3">
            <span className="text-3xl font-semibold leading-none text-secondary">{stats.cpuLoad}</span>
            <span className="text-sm text-text-muted">% cpu</span>
          </div>
          {/* Dual progress bars */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-text-muted w-7">CPU</span>
              <div className="flex-1 h-1 bg-background rounded-full overflow-hidden">
                <div className="h-full bg-secondary rounded-full transition-all duration-slow" style={{ width: `${Math.min(stats.cpuLoad, 100)}%`, opacity: 0.8 }} />
              </div>
              <span className="text-[10px] font-mono text-secondary w-9 text-right">{stats.cpuLoad}%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-text-muted w-7">MEM</span>
              <div className="flex-1 h-1 bg-background rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-slow"
                  style={{
                    width: `${Math.min(stats.memoryLoad, 100)}%`,
                    background: parseFloat(stats.memoryLoad) > 85 ? '#EF4444' : parseFloat(stats.memoryLoad) > 70 ? '#F59E0B' : '#00E5FF',
                    opacity: 0.8,
                  }}
                />
              </div>
              <span className="text-[10px] font-mono text-text-secondary w-9 text-right">{stats.memoryLoad}%</span>
            </div>
          </div>
          <div className="absolute -bottom-5 -right-5 w-20 h-20 rounded-full blur-2xl opacity-10 group-hover:opacity-20 transition-opacity duration-slow pointer-events-none bg-secondary" />
        </div>

        {/* Active servers */}
        <div className="bg-surface border border-border rounded-card p-5 relative overflow-hidden group transition-all duration-base hover:border-border-light hover:shadow-elevated">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-text-muted">Active servers</span>
            <Server className="w-3.5 h-3.5 text-accent-success/50" />
          </div>
          <div className="flex items-baseline gap-1.5 mb-1">
            <span className="text-3xl font-semibold leading-none text-text-primary">{stats.activeServers}</span>
          </div>
          <p className="text-[11px] text-text-muted mb-3">servers online</p>
          {/* Server dot grid */}
          <div className="flex flex-wrap gap-1.5">
            {stats.activeServers > 0
              ? Array.from({ length: Math.min(stats.activeServers, 14) }).map((_, i) => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full bg-accent-success"
                    style={{ opacity: 0.75, animationDelay: `${i * 120}ms` }}
                  />
                ))
              : <span className="text-[10px] text-text-muted font-mono">No servers online</span>
            }
          </div>
          <div className="absolute -bottom-5 -right-5 w-20 h-20 rounded-full blur-2xl opacity-10 group-hover:opacity-20 transition-opacity duration-slow pointer-events-none bg-accent-success" />
        </div>

      </div>

      {/* ── INFRASTRUCTURE CHART ────────────────────────────── */}
      <div className="bg-surface border border-border rounded-card p-6 shadow-glass">
        <div className="flex items-start justify-between mb-5">
          <div>
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary/60" />
              <h2 className="text-sm font-semibold text-text-primary">Infrastructure health</h2>
            </div>
            <p className="text-xs text-text-muted mt-0.5 ml-6">CPU & memory utilization · last 1h</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="flex items-center gap-1.5 text-text-secondary">
                <span className="w-2 h-2 rounded-sm bg-primary inline-block opacity-80" />
                CPU
              </span>
              <span className="flex items-center gap-1.5 text-text-secondary">
                <span className="w-2 h-2 rounded-sm bg-secondary inline-block opacity-80" />
                Memory
              </span>
            </div>
          </div>
        </div>

        <div className="h-64 w-full">
          {chartData.length === 0 ? (
            <EmptyState
              icon={BarChart2}
              title="No telemetry data yet"
              subtitle="Send metrics from your servers using the SDK to see CPU & memory usage here."
            />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradCpu" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#7C3AED" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradMem" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#00E5FF" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#00E5FF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="time"
                  tick={{ fill: '#64748B', fontSize: 10, fontFamily: 'Fira Code, monospace' }}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fill: '#64748B', fontSize: 10, fontFamily: 'Fira Code, monospace' }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={v => `${v}%`}
                />
                <RechartsTooltip
                  content={<ChartTooltip />}
                  cursor={{ stroke: 'rgba(255,255,255,0.06)', strokeWidth: 1 }}
                />
                <Area
                  isAnimationActive={false}
                  type="monotone"
                  dataKey="cpu"
                  stroke="#7C3AED"
                  strokeWidth={2}
                  fill="url(#gradCpu)"
                  dot={false}
                  activeDot={{ r: 4, fill: '#7C3AED', stroke: '#0B0F19', strokeWidth: 2 }}
                />
                <Area
                  isAnimationActive={false}
                  type="monotone"
                  dataKey="memory"
                  stroke="#00E5FF"
                  strokeWidth={2}
                  fill="url(#gradMem)"
                  dot={false}
                  activeDot={{ r: 4, fill: '#00E5FF', stroke: '#0B0F19', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── BOTTOM SPLIT ────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* ── LIVE TERMINAL ─────────────────────────────────── */}
        <div className="flex flex-col bg-[#0D1117] border border-border rounded-card overflow-hidden" style={{ height: '380px' }}>

          {/* Terminal chrome bar */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-surface/60 border-b border-border shrink-0">
            <div className="flex items-center gap-2.5">
              <TerminalSquare className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-mono font-medium text-text-primary">live terminal</span>
              {/* live pulse */}
              <span className="inline-flex items-center gap-1 text-[10px] font-mono text-accent-success bg-accent-success/10 border border-accent-success/20 rounded px-1.5 py-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-success animate-pulse" />
                live
              </span>
              <button
                onClick={() => window.location.href = '/app/logs'}
                className="text-[10px] font-mono text-primary bg-primary/10 border border-primary/20 rounded px-2 py-0.5 hover:bg-primary/20 transition-colors duration-fast"
              >
                full stream →
              </button>
            </div>
            {/* macOS dots */}
            <div className="flex items-center gap-1.5 opacity-50">
              <div className="w-2.5 h-2.5 rounded-full bg-accent-error" />
              <div className="w-2.5 h-2.5 rounded-full bg-accent-warning" />
              <div className="w-2.5 h-2.5 rounded-full bg-accent-success" />
            </div>
          </div>

          {/* Log lines */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1.5 font-mono text-[11px] leading-relaxed">
            {liveLogs.length === 0 ? (
              <EmptyState
                icon={Inbox}
                title="No events yet"
                subtitle="Waiting for live log events from your servers…"
              />
            ) : (
              liveLogs.map((log, i) => {
                const lvl = log.level?.toUpperCase() ?? 'INFO';
                const ts = log.timestamp || log.time;
                const timeStr = ts
                  ? new Date(ts).toLocaleString(undefined, { 
                      month: 'short', day: 'numeric', 
                      hour: '2-digit', minute: '2-digit', second: '2-digit' 
                    })
                  : '—';

                const msgColor =
                  lvl === 'CRITICAL' ? 'text-log-critical'
                  : lvl === 'ERROR'  ? 'text-log-error'
                  : 'text-text-secondary';

                return (
                  <div key={i} className="flex items-baseline gap-2.5 group">
                    <span className="text-text-muted/50 w-[120px] shrink-0">{timeStr}</span>
                    <LogLevelBadge level={log.level} />
                    <span className={`flex-1 break-all ${msgColor} group-hover:text-text-primary transition-colors duration-fast`}>
                      {log.message}
                    </span>
                  </div>
                );
              })
            )}
            {/* Blinking cursor */}
            <div className="flex items-center gap-2 pt-1 opacity-30">
              <span className="inline-block w-1.5 h-3.5 bg-primary animate-pulse rounded-sm" />
              <span className="text-text-muted text-[10px] italic">listening for events…</span>
            </div>
          </div>
        </div>

        {/* ── TOP API ROUTES ────────────────────────────────── */}
        <div className="flex flex-col bg-surface border border-border rounded-card overflow-hidden" style={{ height: '380px' }}>

          <div className="flex items-start justify-between px-5 py-3.5 border-b border-border shrink-0">
            <div>
              <div className="flex items-center gap-2">
                <Route className="w-3.5 h-3.5 text-secondary/60" />
                <h2 className="text-sm font-semibold text-text-primary">Top API endpoints</h2>
              </div>
              <p className="text-xs text-text-muted mt-0.5 ml-5">Error rate · request count · 24h</p>
            </div>
            <span className="text-[10px] font-mono text-text-muted bg-background border border-border rounded px-2 py-1">
              24h window
            </span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-border/50">
            {topRoutes.length === 0 ? (
              <EmptyState
                icon={Route}
                title="No route data yet"
                subtitle="API endpoint data will appear once your services start sending traces."
              />
            ) : (
              topRoutes.map((route, i) => {
                const errVal  = parseFloat(route.error_rate || 0);
                const reqCount = route.request_count ?? route.count ?? 0;
                /* bar width: normalized to max requests among all routes */
                const maxReqs = Math.max(...topRoutes.map(r => r.request_count ?? r.count ?? 0), 1);
                const barW    = Math.round((reqCount / maxReqs) * 100);

                return (
                  <div key={i} className="px-5 py-3 group hover:bg-surface-hover transition-colors duration-fast">
                    {/* Top row */}
                    <div className="flex items-center gap-2 mb-2">
                      <MethodBadge method={route.method} />
                      <span className="font-mono text-[11px] text-text-secondary flex-1 min-w-0 truncate group-hover:text-text-primary transition-colors duration-fast">
                        {route.path ?? route.route}
                      </span>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] font-mono text-primary">
                          {reqCount.toLocaleString()} reqs
                        </span>
                        <span className={`text-[10px] font-mono px-1.5 py-px rounded ${errRate(route.error_rate)}`}>
                          {errVal.toFixed(1)}% err
                        </span>
                      </div>
                    </div>
                    {/* Request volume bar */}
                    <div className="h-0.5 w-full bg-background rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-slow"
                        style={{ width: `${barW}%`, background: barColor(route.error_rate), opacity: 0.6 }}
                      />
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