import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import {
  BarChart, Bar, ResponsiveContainer, Cell,
  Tooltip as RechartsTooltip, XAxis
} from 'recharts';
import {
  Search, Clock, ChevronDown, ChevronRight,
  Check, Copy, ExternalLink, Inbox
} from 'lucide-react';
import { io } from 'socket.io-client';
import TraceWaterfallModal from '../../components/traces/TraceWaterfallModal';
import { logsApi } from '../../api/logs';


const TIME_LABELS = {
  '15m': 'Last 15 min',
  '1h':  'Last 1 hour',
  '6h':  'Last 6 hours',
  '24h': 'Last 24 hours',
  '7d':  'Last 7 days',
};

const LEVELS = [
  { key: 'ERROR', dot: '#EF4444', active: 'bg-log-criticalSubtle text-log-error border-log-error/30',   inactive: 'bg-surface text-text-muted border-border' },
  { key: 'WARN',  dot: '#F59E0B', active: 'bg-log-warningSubtle text-log-warning border-log-warning/30', inactive: 'bg-surface text-text-muted border-border' },
  { key: 'INFO',  dot: '#94A3B8', active: 'bg-log-infoSubtle text-log-info border-log-info/20',          inactive: 'bg-surface text-text-muted border-border' },
  { key: 'DEBUG', dot: '#6366F1', active: 'bg-log-debugSubtle text-log-debug border-log-debug/30',       inactive: 'bg-surface text-text-muted border-border' },
];


const getLevelCls = (level) => {
  switch (level?.toUpperCase()) {
    case 'ERROR':    return 'text-log-error    bg-log-errorSubtle    border-log-error/25';
    case 'critical': // fall-through
    case 'CRITICAL': return 'text-log-critical bg-log-criticalSubtle border-log-critical/25';
    case 'WARN':
    case 'WARNING':  return 'text-log-warning  bg-log-warningSubtle  border-log-warning/25';
    case 'DEBUG':    return 'text-log-debug    bg-log-debugSubtle    border-log-debug/25';
    default:         return 'text-log-info     bg-log-infoSubtle     border-log-info/15';
  }
};


const getMsgCls = (level) =>
  level?.toUpperCase() === 'ERROR' || level?.toUpperCase() === 'CRITICAL'
    ? 'text-log-error'
    : 'text-text-secondary group-hover:text-text-primary';


const formatTime = (iso) => {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    return `${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}:${d.getSeconds().toString().padStart(2,'0')}.${d.getMilliseconds().toString().padStart(3,'0')}`;
  } catch { return iso; }
};


const parseVolumeData = (data = [], range = '1h') => {
  const showDate = ['6h', '24h', '7d'].includes(range);
  const parsed = data.map(d => {
    const dt = new Date(d.time_bucket || d.time || d.bucket);
    const time = showDate
      ? dt.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' +
        dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return { time, count: parseInt(d.log_count || d.value || 0, 10), isPeak: false };
  }).reverse();

  const maxCount = Math.max(...parsed.map(p => p.count), 0);
  parsed.forEach(p => { p.isPeak = p.count === maxCount && maxCount > 0; });
  return parsed;
};


const VolumeTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface-elevated border border-border-light rounded-lg px-3 py-2 shadow-elevated text-xs font-mono z-50">
      <p className="text-text-muted mb-1">{label}</p>
      <p className="text-primary font-semibold">{payload[0].value} logs</p>
    </div>
  );
};


const EmptyState = ({ label }) => (
  <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-center px-6 py-10">
    <Inbox className="w-7 h-7 text-border" />
    <p className="text-xs font-mono text-text-muted">{label}</p>
  </div>
);


const CopyBtn = ({ text }) => {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="px-2 py-1 border-l border-border text-text-muted hover:text-text-primary hover:bg-surface-hover transition-colors duration-fast"
    >
      {copied ? <Check className="w-3 h-3 text-accent-success" /> : <Copy className="w-3 h-3" />}
    </button>
  );
};


const Logs = () => {
  const { currentProject } = useSelector(state => state.project);
  const projectId = currentProject?.id;

  const [isLiveStream,       setIsLiveStream]       = useState(true);
  const [expandedLogId,      setExpandedLogId]      = useState(null);
  const [timeRange,          setTimeRange]          = useState('1h');
  const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false);
  const [searchQuery,        setSearchQuery]        = useState('');
  const [selectedLevels,     setSelectedLevels]     = useState([]);
  const [activeTraceId,      setActiveTraceId]      = useState(null);
  const [logs,               setLogs]               = useState([]);
  const [volumeData,         setVolumeData]         = useState([]);
  const [isLoading,          setIsLoading]          = useState(true);

  /* Fetch */
  const fetchLogsData = useCallback(async () => {
    if (!projectId) return;
    setIsLoading(true);
    try {
      const primaryLevel = selectedLevels.length === 1 ? selectedLevels[0] : undefined;
      const [logsRes, volumeRes] = await Promise.allSettled([
        logsApi.getLogs(projectId, { timerange: timeRange, level: primaryLevel, limit: 150 }),
        logsApi.getVolume(projectId, timeRange),
      ]);

      if (logsRes.status === 'fulfilled') {
        const d = logsRes.value.data?.logs || [];
        setLogs(Array.isArray(d) ? d.map((log, i) => {
          let meta = log.metadata;
          if (typeof meta === 'string') { try { meta = JSON.parse(meta); } catch (_) {} }
          return { ...log, id: log.id || `${log.time}-${i}`, metadata: meta };
        }) : []);
      }

      if (volumeRes.status === 'fulfilled') {
        const v = volumeRes.value.data?.data || volumeRes.value.data || [];
        setVolumeData(parseVolumeData(Array.isArray(v) ? v : [], timeRange));
      }
    } catch (err) {
      console.error('Logs fetch failed', err);
    } finally {
      setIsLoading(false);
    }
  }, [projectId, timeRange, selectedLevels]);

  useEffect(() => { fetchLogsData(); }, [fetchLogsData]);

  /* Socket */
  useEffect(() => {
    if (!isLiveStream || !projectId) return;
    const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:3000', { withCredentials: true });
    socket.on('connect', () => socket.emit('join_project', projectId));

    socket.on('new_log', (log) => {
      if (selectedLevels.length > 0 && !selectedLevels.includes(log.level)) return;
      setLogs(prev => {
        let meta = log.metadata;
        if (typeof meta === 'string') { try { meta = JSON.parse(meta); } catch (_) {} }
        const newLog = {
          ...log,
          id: log.id || `${log.time}-${Math.random().toString(36).substr(2, 9)}`,
          metadata: meta,
        };
        if (prev.find(p => p.id === newLog.id || (p.time === newLog.time && p.message === newLog.message))) return prev;
        return [newLog, ...prev].slice(0, 150);
      });
    });

    return () => socket.disconnect();
  }, [projectId, isLiveStream, selectedLevels]);

  /* Filtered logs (memoised) */
  const filteredLogs = useMemo(() => logs.filter(l => {
    if (selectedLevels.length > 0 && !selectedLevels.includes(l.level)) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        l.message?.toLowerCase().includes(q) ||
        (l.trace_id && l.trace_id.toLowerCase().includes(q)) ||
        (l.metadata && JSON.stringify(l.metadata).toLowerCase().includes(q))
      );
    }
    return true;
  }), [logs, selectedLevels, searchQuery]);

  /* Level pill toggle */
  const toggleLevel = (key) =>
    setSelectedLevels(prev =>
      prev.includes(key) ? prev.filter(l => l !== key) : [...prev, key]
    );

  /* Dropdown close on outside click */
  useEffect(() => {
    if (!isTimeDropdownOpen) return;
    const handler = (e) => {
      if (!e.target.closest('[data-time-dropdown]')) setIsTimeDropdownOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isTimeDropdownOpen]);

 
  return (
    <div className="w-full flex flex-col h-[calc(100vh-80px)] overflow-hidden gap-3 px-1 pb-4 pt-1">

      {/* HEADER */}
      <div className="shrink-0 flex flex-col gap-3">

        {/* Title row */}
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-xl font-semibold text-text-primary tracking-tight">Logs</h1>
            <p className="text-xs text-text-muted mt-0.5 font-mono flex items-center gap-2">
              Streaming event history
              {filteredLogs.length > 0 && (
                <span className="px-1.5 py-px bg-primary/10 border border-primary/20 rounded text-primary text-[10px] font-semibold">
                  {filteredLogs.length}{filteredLogs.length === 150 ? ' (max)' : ''}
                </span>
              )}
            </p>
          </div>

          {/* Level filters + live toggle */}
          <div className="flex items-center gap-2">

            {/* Live tail toggle */}
            <div className="flex items-center gap-2 pr-3 border-r border-border">
              {isLiveStream && (
                <span className="inline-flex items-center gap-1 text-[10px] font-mono text-accent-success bg-accent-success/8 border border-accent-success/20 rounded px-1.5 py-px">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-success animate-pulse" />
                  live
                </span>
              )}
              <span className="text-[10px] font-mono text-text-muted uppercase tracking-widest">Tail</span>
              <button
                onClick={() => setIsLiveStream(v => !v)}
                className={`w-8 h-4 rounded-full relative transition-colors duration-base cursor-pointer ${isLiveStream ? 'bg-primary' : 'bg-border-light'}`}
                aria-label="Toggle live stream"
              >
                <div className={`w-3 h-3 bg-white rounded-full absolute top-0.5 transition-all duration-base ${isLiveStream ? 'left-[18px]' : 'left-0.5'}`} />
              </button>
            </div>

            {/* Level pills */}
            {LEVELS.map(lvl => {
              const isActive = selectedLevels.length === 0 || selectedLevels.includes(lvl.key);
              return (
                <button
                  key={lvl.key}
                  onClick={() => toggleLevel(lvl.key)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[10px] font-mono font-semibold uppercase tracking-wide transition-all duration-fast
                    ${isActive ? lvl.active : lvl.inactive}`}
                >
                  <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: lvl.dot }} />
                  {lvl.key}
                </button>
              );
            })}

            {selectedLevels.length > 0 && (
              <button
                onClick={() => setSelectedLevels([])}
                className="text-[10px] font-mono text-text-muted hover:text-text-primary border border-border hover:border-border-light rounded-md px-2.5 py-1 transition-colors duration-fast"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Filter bar: search + time range */}
        <div className="flex gap-3 items-center">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="w-3.5 h-3.5 text-text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search message, trace ID, or metadata…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-background border border-border rounded-md pl-9 pr-3 py-2 text-sm text-text-primary placeholder:text-text-muted
                ring-0 ring-offset-0 focus:outline-none focus:ring-2 focus:border-primary focus:ring-primary/20
                hover:border-border-light transition-[border-color,box-shadow] duration-fast"
            />
          </div>

          {/* Time range */}
          <div className="relative" data-time-dropdown>
            <button
              onClick={() => setIsTimeDropdownOpen(v => !v)}
              className={`flex items-center gap-2 bg-surface border rounded-md px-3 py-2 text-xs font-mono transition-colors duration-fast
                ${isTimeDropdownOpen
                  ? 'border-primary text-primary'
                  : 'border-border text-text-secondary hover:border-border-light hover:text-text-primary'
                }`}
            >
              <Clock className="w-3.5 h-3.5" />
              {TIME_LABELS[timeRange] ?? timeRange}
              <ChevronDown className={`w-3 h-3 transition-transform duration-fast ${isTimeDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isTimeDropdownOpen && (
              <div className="absolute top-full mt-1 right-0 w-44 bg-surface-elevated border border-border-light rounded-lg shadow-elevated z-50 overflow-hidden">
                {Object.entries(TIME_LABELS).map(([val, label]) => (
                  <button
                    key={val}
                    onClick={() => { setTimeRange(val); setIsTimeDropdownOpen(false); }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 text-xs font-mono transition-colors duration-fast
                      ${timeRange === val
                        ? 'text-text-primary bg-surface-hover'
                        : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
                      }`}
                  >
                    {label}
                    {timeRange === val && <Check className="w-3 h-3 text-primary" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Volume chart */}
        <div className="bg-surface border border-border rounded-card px-4 pt-3 pb-2 h-[90px] flex flex-col gap-1.5">
          <span className="text-[9px] font-mono uppercase tracking-widest text-text-muted shrink-0">
            Event volume · {TIME_LABELS[timeRange] ?? timeRange}
          </span>
          <div className="flex-1 min-h-0">
            {volumeData.length === 0 ? (
              <EmptyState label="No volume data in this time range." />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={volumeData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <RechartsTooltip
                    cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                    content={(props) => <VolumeTooltip {...props} />}
                    animationDuration={0}
                    wrapperStyle={{ zIndex: 50 }}
                  />
                  <Bar dataKey="count" radius={[2, 2, 0, 0]}>
                    {volumeData.map((entry, i) => (
                      <Cell
                        key={`cell-${i}`}
                        fill={entry.isPeak ? '#7C3AED' : '#1E293B'}
                        fillOpacity={entry.isPeak ? 1 : 0.7}
                      />
                    ))}
                  </Bar>
                  <XAxis dataKey="time" hide />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* ── LOG TABLE ───────────────────────────────────────── */}
      <div className="flex-1 min-h-0 bg-[#0D1117] border border-border rounded-card flex flex-col overflow-hidden">

        {filteredLogs.length === 0 ? (
          <EmptyState
            label={isLoading
              ? 'Loading logs…'
              : 'No logs found. They will appear here once your services start sending events.'
            }
          />
        ) : (
          <div className="flex flex-col h-full">

            {/* Table header */}
            <div className="shrink-0 grid px-4 py-2.5 bg-background/60 border-b border-border sticky top-0 z-10
              text-[9px] font-mono uppercase tracking-widest text-text-muted select-none"
              style={{ gridTemplateColumns: '20px 80px 52px 110px 100px 100px 1fr' }}
            >
              <div />
              <div>Time</div>
              <div>Level</div>
              <div>Server</div>
              <div>Trace ID</div>
              <div>Span ID</div>
              <div className="pl-3">Message</div>
            </div>

            {/* Scrollable rows */}
            <div className="flex-1 overflow-y-auto px-2 py-1.5 flex flex-col gap-0.5">
              {filteredLogs.map(log => {
                const isExpanded = expandedLogId === log.id;
                return (
                  <div
                    key={log.id}
                    className={`rounded-md border transition-all duration-fast
                      ${isExpanded
                        ? 'bg-surface border-border-light shadow-glass mb-1'
                        : 'bg-transparent border-transparent hover:bg-surface hover:border-border cursor-pointer'
                      }`}
                  >
                    {/* Row header */}
                    <div
                      className="grid items-center px-2 py-2 cursor-pointer select-none group"
                      style={{ gridTemplateColumns: '20px 80px 52px 110px 100px 100px 1fr' }}
                      onClick={() => setExpandedLogId(prev => prev === log.id ? null : log.id)}
                    >
                      <ChevronRight className={`w-3.5 h-3.5 text-text-muted transition-transform duration-fast ${isExpanded ? 'rotate-90' : ''}`} />

                      {/* Time */}
                      <span className="font-mono text-[10px] text-text-muted">{formatTime(log.time)}</span>

                      {/* Level badge */}
                      <span className={`inline-flex items-center justify-center px-1.5 py-px rounded border font-mono text-[9px] font-semibold uppercase tracking-wide ${getLevelCls(log.level)}`}>
                        {(log.level ?? 'INFO').slice(0, 4)}
                      </span>

                      {/* Server */}
                      <span className="font-mono text-[10px] text-text-secondary truncate pr-2" title={log.server_name || log.server_hostname}>
                        {log.server_name || log.server_hostname || '—'}
                      </span>

                      {/* Trace ID */}
                      <span className="font-mono text-[10px] text-primary truncate" title={log.trace_id}>
                        {log.trace_id ? log.trace_id.substring(0, 8) + '…' : <span className="text-text-muted/40">—</span>}
                      </span>

                      {/* Span ID */}
                      <span className="font-mono text-[10px] text-log-debug truncate" title={log.span_id}>
                        {log.span_id ? log.span_id.substring(0, 8) + '…' : <span className="text-text-muted/40">—</span>}
                      </span>

                      {/* Message */}
                      <span className={`pl-3 text-xs truncate transition-colors duration-fast ${getMsgCls(log.level)}`}>
                        {log.message}
                      </span>
                    </div>

                    {/* Expanded detail */}
                    {isExpanded && (
                      <div className="px-10 pb-4 pt-2 flex flex-col gap-3">

                        {/* Full message */}
                        <div className={`bg-background border rounded-md p-3 whitespace-pre-wrap text-sm font-mono text-text-primary leading-relaxed select-text
                          ${log.level?.toUpperCase() === 'ERROR' || log.level?.toUpperCase() === 'CRITICAL'
                            ? 'border-log-error/30'
                            : 'border-border'
                          }`}
                        >
                          {log.message}
                        </div>

                        {/* Metadata + trace side by side */}
                        <div className="flex gap-3">

                          {/* Metadata */}
                          <div className="flex-1 bg-background border border-border rounded-md p-3 flex flex-col gap-2 min-w-0">
                            <span className="text-[9px] font-mono uppercase tracking-widest text-text-muted border-b border-border pb-1.5">
                              Metadata
                            </span>
                            <pre className="text-[11px] font-mono text-log-debug overflow-x-auto whitespace-pre-wrap select-text leading-relaxed">
                              {log.metadata ? JSON.stringify(log.metadata, null, 2) : '{}'}
                            </pre>
                          </div>

                          {/* Trace panel */}
                          <div className="w-56 shrink-0 bg-background border border-border rounded-md p-4 flex flex-col items-center gap-3">
                            <span className="text-[9px] font-mono uppercase tracking-widest text-text-muted self-stretch text-center">
                              Distributed trace
                            </span>
                            {log.trace_id ? (
                              <>
                                <div className="flex items-center w-full bg-surface border border-border rounded-md overflow-hidden">
                                  <span className="flex-1 px-3 py-1.5 font-mono text-[10px] text-primary truncate select-all">
                                    {log.trace_id}
                                  </span>
                                  <CopyBtn text={log.trace_id} />
                                </div>
                                <button
                                  onClick={() => setActiveTraceId(log.trace_id)}
                                  className="w-full flex items-center justify-center gap-2 bg-primary/10 hover:bg-primary/20 border border-primary/30 hover:border-primary/50 px-3 py-2 rounded-md text-xs font-medium text-primary transition-all duration-fast"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                  View trace waterfall
                                </button>
                              </>
                            ) : (
                              <p className="text-xs font-mono text-text-muted text-center py-3">
                                No trace ID attached to this log.
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Waterfall modal */}
      {activeTraceId && (
        <TraceWaterfallModal
          traceId={activeTraceId}
          projectId={projectId}
          onClose={() => setActiveTraceId(null)}
        />
      )}
    </div>
  );
};

export default Logs;