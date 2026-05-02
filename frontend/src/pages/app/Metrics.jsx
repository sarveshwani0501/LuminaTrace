import React, { useState, useEffect, useCallback, useRef, memo } from 'react';
import { useSelector } from 'react-redux';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer
} from 'recharts';
import {
  Clock, Filter, ChevronDown, Activity, Zap, Server,
  Loader2, Cpu, Hash, BarChart3, Check, BarChart2,
  RefreshCw, Wifi, WifiOff
} from 'lucide-react';
import { io } from 'socket.io-client';
import { metricsApi } from '../../api/metrics';
import { serversApi } from '../../api/servers';

/* ─────────────────────────────────────────────────────────────────
   CONSTANTS  (stable references — defined once at module scope)
───────────────────────────────────────────────────────────────── */
const TIME_RANGES = [
  { value: '15m', label: 'Last 15 min' },
  { value: '1h',  label: 'Last 1 hour' },
  { value: '6h',  label: 'Last 6 hours' },
  { value: '24h', label: 'Last 24 hours' },
  { value: '7d',  label: 'Last 7 days' },
];

const METRIC_COLORS = {
  latency:     '#7C3AED',   // primary violet
  cpu:         '#00E5FF',   // secondary cyan
  mem:         '#F59E0B',   // warning amber
  throughput:  '#10B981',   // success green
  errorRate:   '#F97316',   // log-error orange
  connections: '#6366F1',   // indigo
};

/* ─────────────────────────────────────────────────────────────────
   PURE HELPERS  (no closure over state — stable across renders)
───────────────────────────────────────────────────────────────── */

/** Parse a timeseries API response into { time, val } chart points */
const parseTimeseries = (data = []) =>
  data
    .map(d => ({
      time: new Date(d.time_bucket || d.bucket || d.time)
        .toLocaleString(undefined, { 
          month: 'short', day: 'numeric', 
          hour: '2-digit', minute: '2-digit', second: '2-digit' 
        }),
      val: parseFloat(d.p99_value ?? d.avg_value ?? d.value ?? 0),
    }))
    .filter(d => !isNaN(d.val));

/**
 * Get the representative "current" value from a parsed series.
 * Walks backward from the end to find the last NON-ZERO point.
 * Prevents incomplete trailing buckets (val=0) from overwriting the
 * KPI stat when the chart clearly has real data — e.g. Throughput
 * showing 0.0 while the area chart shows a healthy curve.
 */
const lastVal = (arr) => {
  if (!arr.length) return null;
  for (let i = arr.length - 1; i >= 0; i--) {
    if (arr[i].val !== 0 && !isNaN(arr[i].val)) {
      return parseFloat(arr[i].val).toFixed(1);
    }
  }
  // Every point is genuinely zero — show it
  return parseFloat(arr[arr.length - 1].val).toFixed(1);
};

/* ─────────────────────────────────────────────────────────────────
   CHART TOOLTIP  (stable — defined at module scope, not inside render)
───────────────────────────────────────────────────────────────── */
const ChartTooltip = memo(({ active, payload, label, unit = '' }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface-elevated border border-border-light rounded-lg px-3 py-2 shadow-elevated text-xs font-mono z-50">
      <p className="text-text-muted mb-1">{label}</p>
      <p className="font-semibold" style={{ color: payload[0]?.color ?? payload[0]?.fill ?? '#7C3AED' }}>
        {parseFloat(payload[0].value).toFixed(2)}{unit && <span className="text-text-muted ml-1">{unit}</span>}
      </p>
    </div>
  );
});
ChartTooltip.displayName = 'ChartTooltip';

/* ─────────────────────────────────────────────────────────────────
   EMPTY STATE (inside chart area)
───────────────────────────────────────────────────────────────── */
const ChartEmpty = memo(({ label }) => (
  <div className="w-full h-full flex flex-col items-center justify-center text-center px-3 gap-2">
    <BarChart2 className="w-5 h-5 text-border" />
    <p className="text-[10px] text-text-muted font-mono leading-snug">{label}</p>
  </div>
));
ChartEmpty.displayName = 'ChartEmpty';

/* ─────────────────────────────────────────────────────────────────
   METRIC CARD
   Memoized — only re-renders when its own props change.
   Chart type (visType) is passed as a prop, not read from closure.
───────────────────────────────────────────────────────────────── */
const MetricCard = memo(({
  title, value, unit, icon: Icon,
  color, data, visType, emptyLabel, gradientId,
}) => {
  /* Cursor style matching the card's accent color */
  const tooltipCursor = visType === 'bars'
    ? { fill: 'rgba(255,255,255,0.04)' }
    : { stroke: 'rgba(255,255,255,0.06)', strokeWidth: 1 };

  const sharedChartProps = {
    isAnimationActive: false,
    'aria-hidden': true,
  };

  const makeTooltip = (u) => (props) => <ChartTooltip {...props} unit={u} />;

  const chartNode = visType === 'bars' ? (
    <BarChart data={data}>
      <RechartsTooltip
        cursor={tooltipCursor}
        content={makeTooltip(unit)}
        animationDuration={0}
        wrapperStyle={{ zIndex: 50 }}
      />
      <Bar {...sharedChartProps} dataKey="val" fill={color} radius={[2, 2, 0, 0]} />
      <XAxis dataKey="time" hide />
      <YAxis hide />
    </BarChart>
  ) : (
    <AreaChart data={data}>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%"  stopColor={color} stopOpacity={0.25} />
          <stop offset="95%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <RechartsTooltip
        cursor={tooltipCursor}
        content={makeTooltip(unit)}
        animationDuration={0}
        wrapperStyle={{ zIndex: 50 }}
      />
      <Area
        {...sharedChartProps}
        type="monotone"
        dataKey="val"
        stroke={color}
        strokeWidth={2}
        fill={`url(#${gradientId})`}
        dot={false}
        activeDot={{ r: 4, fill: color, stroke: '#0B0F19', strokeWidth: 2 }}
      />
      <XAxis dataKey="time" hide />
      <YAxis hide />
    </AreaChart>
  );

  return (
    <div className="bg-surface border border-border rounded-card p-5 relative overflow-hidden flex flex-col gap-3 h-[240px] group transition-all duration-base hover:border-border-light hover:shadow-elevated">

      {/* Card header */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono font-medium uppercase tracking-widest text-text-muted">
          {title}
        </span>
        {Icon && <Icon className="w-3.5 h-3.5 text-text-muted/50" />}
      </div>

      {/* Value */}
      <div className="flex items-baseline gap-1" style={{ color }}>
        <span className="text-3xl font-semibold leading-none tracking-tight">
          {value}
        </span>
        {unit && <span className="text-sm text-text-muted font-normal">{unit}</span>}
      </div>

      {/* Chart — fills remaining space */}
      <div className="flex-1 min-h-0">
        {!data || data.length === 0 ? (
          <ChartEmpty label={emptyLabel} />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            {chartNode}
          </ResponsiveContainer>
        )}
      </div>

      {/* Corner ambient glow */}
      <div
        className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full blur-2xl opacity-10 group-hover:opacity-20 transition-opacity duration-slow pointer-events-none"
        style={{ background: color }}
      />
    </div>
  );
});
MetricCard.displayName = 'MetricCard';

/* ─────────────────────────────────────────────────────────────────
   DROPDOWN  (generic reusable)
───────────────────────────────────────────────────────────────── */
const Dropdown = memo(({ trigger, children, isOpen, onToggle, align = 'right' }) => {
  const ref = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onToggle(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen, onToggle]);

  return (
    <div className="relative" ref={ref}>
      {trigger}
      {isOpen && (
        <div
          className={`absolute top-full mt-1 bg-surface-elevated border border-border-light rounded-lg shadow-elevated z-50 overflow-hidden min-w-[160px] ${align === 'right' ? 'right-0' : 'left-0'}`}
        >
          {children}
        </div>
      )}
    </div>
  );
});
Dropdown.displayName = 'Dropdown';

/* ─────────────────────────────────────────────────────────────────
   METRICS PAGE
───────────────────────────────────────────────────────────────── */
const Metrics = () => {
  const { currentProject } = useSelector(state => state.project);

  /* ── UI state (does NOT affect data fetching) ───────────────── */
  const [visType,             setVisType]             = useState('lines');
  const [timeRangeDropdown,   setTimeRangeDropdown]   = useState(false);
  const [serverDropdown,      setServerDropdown]      = useState(false);
  const [isConnected,         setIsConnected]         = useState(false);

  /* ── Fetch-triggering state (changes here → new fetch) ──────── */
  const [timeRange,         setTimeRange]         = useState('1h');
  const [selectedServerId,  setSelectedServerId]  = useState('');

  /* ── Data state ─────────────────────────────────────────────── */
  const [servers,         setServers]         = useState([]);
  const [isLoading,       setIsLoading]       = useState(false);
  const [latencyData,     setLatencyData]     = useState([]);
  const [cpuData,         setCpuData]         = useState([]);
  const [memData,         setMemData]         = useState([]);
  const [throughputData,  setThroughputData]  = useState([]);
  const [errorData,       setErrorData]       = useState([]);
  const [connectionsData, setConnectionsData] = useState([]);
  const [stats, setStats] = useState({
    latency: '--', cpu: '--', mem: '--',
    throughput: '--', errorRate: '--', connections: '--',
  });

  /* ── Fetch — only depends on real data params ───────────────── */
  const fetchAll = useCallback(async () => {
    if (!currentProject?.id) return;
    setIsLoading(true);

    try {
      const serverId = selectedServerId || null;

      const [
        latestRes, cpuRes, memRes, p99Res,
        throughputRes, errorRateRes, connectionsRes, serversRes,
      ] = await Promise.allSettled([
        metricsApi.getLatestMetrics(currentProject.id, serverId),
        metricsApi.getTimeseries(currentProject.id, 'cpu_usage', timeRange, serverId),
        metricsApi.getTimeseries(currentProject.id, 'memory_used_percent', timeRange, serverId),
        metricsApi.getTimeseriesP99(currentProject.id, timeRange, serverId),
        metricsApi.getThroughput(currentProject.id, timeRange, serverId),
        metricsApi.getErrorRate(currentProject.id, timeRange, serverId),
        metricsApi.getActiveConnections(currentProject.id, timeRange, serverId),
        serversApi.listServers(currentProject.id),
      ]);

      const ok = (res) => res.status === 'fulfilled';

      const parsedCpu        = ok(cpuRes)          ? parseTimeseries(cpuRes.value.data?.data          || []) : [];
      const parsedMem        = ok(memRes)          ? parseTimeseries(memRes.value.data?.data          || []) : [];
      const parsedLatency    = ok(p99Res)          ? parseTimeseries(p99Res.value.data?.data          || []) : [];
      const parsedThroughput = ok(throughputRes)   ? parseTimeseries(throughputRes.value.data?.data   || []) : [];
      const parsedError      = ok(errorRateRes)    ? parseTimeseries(errorRateRes.value.data?.data    || []) : [];
      const parsedConns      = ok(connectionsRes)  ? parseTimeseries(connectionsRes.value.data?.data  || []) : [];

      setCpuData(parsedCpu);
      setMemData(parsedMem);
      setLatencyData(parsedLatency);
      setThroughputData(parsedThroughput);
      setErrorData(parsedError);
      setConnectionsData(parsedConns);

      if (ok(serversRes)) setServers(serversRes.value.data?.servers || []);

      /* KPI values: last point of each series, fall back to latest snapshot */
      let fallback = {};
      if (ok(latestRes)) {
        const metricsList = latestRes.value.data?.metrics || [];
        const get = (name) => {
          const m = metricsList.find(x => x.name === name);
          return m ? parseFloat(m.value).toFixed(1) : null;
        };
        fallback = {
          latency:     get('response_time'),
          cpu:         get('cpu_usage'),
          mem:         get('memory_used_percent'),
          throughput:  get('http_request_count'),
          errorRate:   get('error_rate') ?? get('error_count'),
          connections: get('active_connections'),
        };
      }

      setStats({
        latency:     lastVal(parsedLatency)    ?? fallback.latency     ?? '--',
        cpu:         lastVal(parsedCpu)        ?? fallback.cpu         ?? '--',
        mem:         lastVal(parsedMem)        ?? fallback.mem         ?? '--',
        throughput:  lastVal(parsedThroughput) ?? fallback.throughput  ?? '--',
        errorRate:   lastVal(parsedError)      ?? fallback.errorRate   ?? '--',
        connections: lastVal(parsedConns)      ?? fallback.connections ?? '--',
      });

    } catch (err) {
      console.error('Metrics fetch failed', err);
    } finally {
      setIsLoading(false);
    }
  /* NOTE: isTimeDropdownOpen / serverDropdown NOT in deps — closing them
     does not need to trigger a refetch, eliminating the loop risk. */
  }, [currentProject?.id, timeRange, selectedServerId]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  /* ── Socket.io — live metric updates ────────────────────────── */
  useEffect(() => {
    if (!currentProject?.id) return;

    const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:3000', {
      withCredentials: true,
    });

    socket.on('connect',    () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));

    socket.on('connect', () => socket.emit('join_project', currentProject.id));

    socket.on('new_metric', (metric) => {
      const timeStr = new Date(metric.time || Date.now())
        .toLocaleString(undefined, { 
          month: 'short', day: 'numeric', 
          hour: '2-digit', minute: '2-digit', second: '2-digit' 
        });
      const val = parseFloat(metric.value);

      const push = (setter) =>
        setter(prev => [...prev.slice(-59), { time: timeStr, val }]);

      if (metric.name === 'cpu_usage') {
        push(setCpuData);
        setStats(prev => ({ ...prev, cpu: val.toFixed(1) }));
      }
      if (metric.name === 'memory_used_percent') {
        push(setMemData);
        setStats(prev => ({ ...prev, mem: val.toFixed(1) }));
      }
      if (metric.name === 'response_time') {
        push(setLatencyData);
        setStats(prev => ({ ...prev, latency: val.toFixed(1) }));
      }
      if (metric.name === 'request_count' || metric.name === 'http_request_count') {
        push(setThroughputData);
        setStats(prev => ({ ...prev, throughput: val.toFixed(0) }));
      }
      if (metric.name === 'error_count') {
        push(setErrorData);
      }
      if (metric.name === 'active_connections') {
        push(setConnectionsData);
        setStats(prev => ({ ...prev, connections: val.toFixed(0) }));
      }
    });

    return () => socket.disconnect();
  }, [currentProject?.id]);

  /* ── Derived ────────────────────────────────────────────────── */
  const activeTimeRange = TIME_RANGES.find(t => t.value === timeRange);
  const selectedServer  = servers.find(s => s.id === selectedServerId);

  const handleTimeRangeToggle  = useCallback((v) => setTimeRangeDropdown(v), []);
  const handleServerToggle     = useCallback((v) => setServerDropdown(v), []);

  /* ── Metric card definitions ─────────────────────────────────
     Defined inside component but only reconstructed when stats change.
     Chart data arrays are passed as stable refs from state.
  ────────────────────────────────────────────────────────────── */
  const METRIC_CARDS = [
    {
      key:         'latency',
      title:       'P99 Latency',
      value:       stats.latency,
      unit:        'ms',
      icon:        Loader2,
      color:       METRIC_COLORS.latency,
      data:        latencyData,
      gradientId:  'grad-latency',
      emptyLabel:  'No latency data · instrument your services with the SDK',
    },
    {
      key:         'cpu',
      title:       'CPU Utilization',
      value:       stats.cpu,
      unit:        '%',
      icon:        Cpu,
      color:       METRIC_COLORS.cpu,
      data:        cpuData,
      gradientId:  'grad-cpu',
      emptyLabel:  'No CPU data yet · ensure captureSystemMetrics is enabled',
    },
    {
      key:         'mem',
      title:       'Memory Usage',
      value:       stats.mem,
      unit:        '%',
      icon:        Server,
      color:       METRIC_COLORS.mem,
      data:        memData,
      gradientId:  'grad-mem',
      emptyLabel:  'No memory data yet',
    },
    {
      key:         'throughput',
      title:       'Throughput',
      value:       stats.throughput,
      unit:        'RPS',
      icon:        Zap,
      color:       METRIC_COLORS.throughput,
      data:        throughputData,
      gradientId:  'grad-throughput',
      emptyLabel:  'No throughput data · send http_request_count metric',
    },
    {
      key:         'errorRate',
      title:       'Error Rate',
      value:       stats.errorRate,
      unit:        '%',
      icon:        Activity,
      color:       METRIC_COLORS.errorRate,
      data:        errorData,
      gradientId:  'grad-error',
      emptyLabel:  'No error data · send error_count metric from the SDK',
    },
    {
      key:         'connections',
      title:       'Active Connections',
      value:       stats.connections,
      unit:        '',
      icon:        Hash,
      color:       METRIC_COLORS.connections,
      data:        connectionsData,
      gradientId:  'grad-conns',
      emptyLabel:  'No connection data · send active_connections metric',
    },
  ];

  /* ─────────────────────────────────────────────────────────── */
  return (
    <div className="w-full flex gap-5 h-[calc(100vh-80px)] overflow-hidden">

      {/* ── MAIN AREA ──────────────────────────────────────── */}
      <div className="flex-1 flex flex-col gap-5 min-w-0 overflow-y-auto pb-10">

        {/* Page header */}
        <div className="flex items-start justify-between shrink-0">
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl font-bold text-white tracking-tight mb-1">Service metrics</h1>
            <p className="text-sm text-text-muted mt-1 truncate">
              Performance telemetry across your infrastructure
            </p>
          </div>

          <div className="flex items-center gap-2.5">

            {/* Time range dropdown */}
            <Dropdown
              isOpen={timeRangeDropdown}
              onToggle={handleTimeRangeToggle}
              align="right"
              trigger={
                <button
                  onClick={() => handleTimeRangeToggle(!timeRangeDropdown)}
                  className={`flex items-center gap-2 bg-surface border rounded-md px-3 py-2 text-xs font-mono transition-colors duration-fast
                    ${timeRangeDropdown
                      ? 'border-primary text-primary'
                      : 'border-border text-text-secondary hover:border-border-light hover:text-text-primary'
                    }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  {activeTimeRange?.label ?? timeRange}
                  <ChevronDown className={`w-3 h-3 transition-transform duration-fast ${timeRangeDropdown ? 'rotate-180' : ''}`} />
                </button>
              }
            >
              <div className="px-3 py-1.5 text-[9px] font-mono uppercase tracking-widest text-text-muted border-b border-border bg-background/60">
                Larger ranges use wider buckets
              </div>
              {TIME_RANGES.map(t => (
                <button
                  key={t.value}
                  onClick={() => { setTimeRange(t.value); handleTimeRangeToggle(false); }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-mono transition-colors duration-fast
                    ${timeRange === t.value
                      ? 'text-text-primary bg-surface-hover'
                      : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
                    }`}
                >
                  {t.label}
                  {timeRange === t.value && <Check className="w-3 h-3 text-primary" />}
                </button>
              ))}
            </Dropdown>

            {/* Refresh button */}
            <button
              onClick={fetchAll}
              disabled={isLoading}
              className="flex items-center gap-2 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white px-4 py-2 rounded-md text-xs font-medium shadow-glow-primary transition-all duration-fast active:scale-95"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Loading…' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* 3×2 metric grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {METRIC_CARDS.map(card => (
            <MetricCard
              key={card.key}
              visType={visType}
              {...card}
            />
          ))}
        </div>
      </div>

      {/* ── SIDEBAR ────────────────────────────────────────── */}
      <div className="w-[260px] shrink-0 bg-background border border-border rounded-card flex flex-col overflow-hidden shadow-glass">

        {/* Sidebar header */}
        <div className="flex items-center gap-2.5 px-4 py-3.5 border-b border-border bg-surface shrink-0">
          <Filter className="w-3.5 h-3.5 text-primary/70" />
          <h2 className="text-xs font-semibold text-text-primary">Metric explorer</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-5">

          {/* ── Node targeting ─────────────────────────────── */}
          <div>
            <p className="text-[9px] font-mono font-medium uppercase tracking-widest text-text-muted mb-2.5">
              Node targeting
            </p>

            <Dropdown
              isOpen={serverDropdown}
              onToggle={handleServerToggle}
              align="left"
              trigger={
                <button
                  onClick={() => handleServerToggle(!serverDropdown)}
                  className={`w-full flex items-center justify-between bg-surface-hover border rounded-md px-3 py-2 text-xs transition-colors duration-fast
                    ${serverDropdown
                      ? 'border-primary text-text-primary'
                      : 'border-border text-text-secondary hover:border-border-light hover:text-text-primary'
                    }`}
                >
                  <span className="font-mono truncate">
                    {selectedServer?.name ?? 'All servers'}
                  </span>
                  <ChevronDown className={`w-3 h-3 ml-2 shrink-0 transition-transform duration-fast ${serverDropdown ? 'rotate-180' : ''}`} />
                </button>
              }
            >
              {/* All servers option */}
              <button
                onClick={() => { setSelectedServerId(''); handleServerToggle(false); }}
                className={`w-full flex items-center justify-between px-3 py-2.5 text-xs font-mono transition-colors duration-fast
                  ${!selectedServerId
                    ? 'text-text-primary bg-surface-hover'
                    : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
                  }`}
              >
                All servers
                {!selectedServerId && <Check className="w-3 h-3 text-primary" />}
              </button>
              {servers.map(server => (
                <button
                  key={server.id}
                  onClick={() => { setSelectedServerId(server.id); handleServerToggle(false); }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 text-xs font-mono transition-colors duration-fast
                    ${selectedServerId === server.id
                      ? 'text-text-primary bg-surface-hover'
                      : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
                    }`}
                >
                  <span className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ background: server.status === 'online' ? '#10B981' : '#EF4444' }}
                    />
                    <span className="truncate">{server.name ?? server.hostname}</span>
                  </span>
                  {selectedServerId === server.id && <Check className="w-3 h-3 text-primary shrink-0" />}
                </button>
              ))}
            </Dropdown>

            {/* Inline server status list (below the dropdown — always visible) */}
            {servers.length > 0 && (
              <div className="mt-3 flex flex-col gap-0 divide-y divide-border/50">
                {servers.map(server => (
                  <button
                    key={server.id}
                    onClick={() => setSelectedServerId(prev => prev === server.id ? '' : server.id)}
                    className={`flex items-center gap-2.5 py-2 text-left w-full transition-colors duration-fast group ${
                      selectedServerId === server.id ? 'opacity-100' : 'opacity-70 hover:opacity-100'
                    }`}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ background: server.status === 'online' ? '#10B981' : '#EF4444' }}
                    />
                    <span className="flex-1 min-w-0 text-[11px] font-mono text-text-secondary group-hover:text-text-primary truncate transition-colors duration-fast">
                      {server.name ?? server.hostname}
                    </span>
                    {selectedServerId === server.id && (
                      <span className="text-[9px] font-mono text-primary bg-primary/10 px-1.5 py-px rounded border border-primary/20 shrink-0">
                        selected
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="h-px bg-border" />

          {/* ── Visualization type ──────────────────────────── */}
          <div>
            <p className="text-[9px] font-mono font-medium uppercase tracking-widest text-text-muted mb-2.5">
              Visualization
            </p>
            <div className="grid grid-cols-2 gap-2">
              {[
                {
                  key: 'lines', label: 'Area',
                  icon: (
                    <svg width="20" height="14" viewBox="0 0 20 14" fill="none">
                      <path d="M1 12 5 6l4 3 5-7 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ),
                },
                {
                  key: 'bars', label: 'Bars',
                  icon: (
                    <svg width="20" height="14" viewBox="0 0 20 14" fill="none">
                      <rect x="1"  y="6"  width="4" height="7" rx="1" fill="currentColor" opacity=".7"/>
                      <rect x="8"  y="3"  width="4" height="10" rx="1" fill="currentColor" opacity=".9"/>
                      <rect x="15" y="1"  width="4" height="12" rx="1" fill="currentColor"/>
                    </svg>
                  ),
                },
              ].map(opt => (
                <button
                  key={opt.key}
                  onClick={() => setVisType(opt.key)}
                  className={`flex flex-col items-center justify-center gap-2 py-3 rounded-md border text-xs transition-all duration-fast
                    ${visType === opt.key
                      ? 'bg-primary/10 border-primary/40 text-primary'
                      : 'bg-surface-hover border-border text-text-muted hover:border-border-light hover:text-text-secondary'
                    }`}
                >
                  {opt.icon}
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="h-px bg-border" />

          {/* ── Stream status ───────────────────────────────── */}
          <div>
            <p className="text-[9px] font-mono font-medium uppercase tracking-widest text-text-muted mb-2.5">
              Stream status
            </p>
            <div className={`flex items-center gap-2 px-3 py-2 rounded-md border text-xs font-mono
              ${isConnected
                ? 'bg-accent-success/6 border-accent-success/20 text-accent-success'
                : 'bg-accent-error/6 border-accent-error/20 text-accent-error'
              }`}
            >
              {isConnected
                ? <Wifi className="w-3.5 h-3.5 shrink-0" />
                : <WifiOff className="w-3.5 h-3.5 shrink-0" />
              }
              {isConnected ? 'Socket connected' : 'Socket disconnected'}
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};

export default Metrics;