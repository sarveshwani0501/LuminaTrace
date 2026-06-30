import React, { useState, useEffect, memo } from 'react';
import { createPortal } from 'react-dom';
import {
  X, AlertCircle, Database, Server,
  Cpu, Layers, Info, Loader2, GitBranch
} from 'lucide-react';
import { spansApi } from '../../api/spans';



const getServiceIcon = (service = '') => {
  const s = service.toLowerCase();
  if (s.includes('gateway'))                    return <Layers  className="w-3.5 h-3.5" />;
  if (s.includes('auth'))                       return <Cpu     className="w-3.5 h-3.5" />;
  if (s.includes('redis') || s.includes('postgres') || s.includes('db'))
                                                return <Database className="w-3.5 h-3.5" />;
  return                                               <Server  className="w-3.5 h-3.5" />;
};


const getBarStyle = (level = '') => {
  switch (level?.toUpperCase()) {
    case 'ERROR':    return { background: '#EF4444', boxShadow: '0 0 8px rgba(239,68,68,0.45)' };
    case 'CRITICAL': return { background: '#EF4444', boxShadow: '0 0 8px rgba(239,68,68,0.6)' };
    case 'WARN':     return { background: '#F59E0B', boxShadow: '0 0 8px rgba(245,158,11,0.35)' };
    case 'DEBUG':    return { background: '#6366F1', boxShadow: '0 0 6px rgba(99,102,241,0.3)' };
    default:         return { background: '#7C3AED', boxShadow: '0 0 8px rgba(124,58,237,0.35)' };
  }
};


const calcLeft  = (offset, total) => `${(Number(offset) / total) * 100}%`;

const calcWidth = (dur,    total) => `${Math.max((Number(dur) / total) * 100, 0.5)}%`;


const CenteredState = ({ children }) => (
  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/80">
    {children}
  </div>
);


const SpanRow = memo(({ span, totalDuration, isHovered, isDimmed, onHover, onLeave }) => {
  const barStyle  = getBarStyle(span.level);
  const leftPct   = calcLeft(span.offset,   totalDuration);
  const widthPct  = calcWidth(span.duration, totalDuration);
  const isError   = span.level?.toUpperCase() === 'ERROR' || span.level?.toUpperCase() === 'CRITICAL';

  return (
    <div
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      className={`flex w-full border-b border-border/30 transition-all duration-fast
        ${isDimmed   ? 'opacity-25' : 'opacity-100'}
        ${isHovered  ? 'bg-surface-hover' : 'hover:bg-surface/40'}
      `}
    >
      {/* Left panel: tree label */}
      <div className="w-[38%] flex items-center gap-2 px-4 py-2.5 border-r border-border/40 min-w-0">
        <div
          style={{ marginLeft: `${span.depth * 18}px` }}
          className="flex items-center gap-2 min-w-0"
        >
          {/* Depth connector lines */}
          {span.depth > 0 && (
            <div className="relative flex items-center shrink-0" style={{ width: '14px' }}>
              <div className="absolute -top-5 left-0 w-px h-7 bg-border/50" />
              <div className="absolute top-1/2 left-0 w-3 h-px bg-border/50" />
            </div>
          )}

          {/* Service icon */}
          <span
            className="shrink-0"
            style={{ color: isError ? '#EF4444' : span.level?.toUpperCase() === 'WARN' ? '#F59E0B' : '#7C3AED' }}
          >
            {getServiceIcon(span.service)}
          </span>

          {/* Name + service tag */}
          <div className="min-w-0">
            <p className={`text-xs font-medium truncate transition-colors duration-fast
              ${isHovered ? 'text-text-primary' : 'text-text-secondary'}
              ${isError   ? '!text-accent-error' : ''}
            `}>
              {span.name}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[9px] font-mono text-text-muted bg-surface-active border border-border rounded px-1.5 py-px truncate max-w-[120px]">
                {span.service}
              </span>
              {isError && <AlertCircle className="w-2.5 h-2.5 text-accent-error shrink-0" />}
            </div>
          </div>
        </div>
      </div>

      {/* Right panel: Gantt bar */}
      <div className="w-[62%] relative flex items-center px-2 py-2.5" style={{ minHeight: '40px' }}>
        {/* The bar */}
        <div
          className="absolute h-3 rounded-sm z-10 transition-opacity duration-fast"
          style={{
            left:   leftPct,
            width:  widthPct,
            ...barStyle,
            opacity: isHovered ? 1 : 0.8,
          }}
        >
          {/* Gloss overlay */}
          <div className="absolute inset-0 rounded-sm bg-white/10 mix-blend-overlay" />
        </div>

        {/* Duration label — rendered outside/right of bar */}
        <span
          className="absolute font-mono text-[9px] text-text-muted pointer-events-none z-20 whitespace-nowrap"
          style={{ left: `calc(${leftPct} + ${widthPct} + 5px)` }}
        >
          {span.duration}ms
        </span>
      </div>
    </div>
  );
});
SpanRow.displayName = 'SpanRow';


const TraceWaterfallModal = ({ traceId, projectId, onClose }) => {
  const [spans,         setSpans]         = useState([]);
  const [totalDuration, setTotalDuration] = useState(1000);
  const [hoveredSpan,   setHoveredSpan]   = useState(null);
  const [loading,       setLoading]       = useState(false);
  const [error,         setError]         = useState(null);

  /* Fetch spans  */
  useEffect(() => {
    if (!traceId || !projectId) return;
    setLoading(true);
    setError(null);

    spansApi.getSpansByTrace(traceId, projectId)
      .then(res => {
        const data = res.data || [];
        setSpans(data);
        if (data.length > 0) {
          const max = data.reduce(
            (acc, s) => Math.max(acc, Number(s.offset) + Number(s.duration)), 0
          );
          setTotalDuration(max || 1);
        }
      })
      .catch(() => setError('Failed to load trace spans.'))
      .finally(() => setLoading(false));
  }, [traceId, projectId]);

  /* Close on Escape key  */
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  if (!traceId) return null;

  /* Axis tick values  */
  const ticks = [0, 0.25, 0.5, 0.75, 1].map(f => Math.round(totalDuration * f));

 
  const modal = (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-5 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-6xl bg-background border border-border rounded-card shadow-elevated flex flex-col overflow-hidden"
        style={{ height: '85vh' }}
        onClick={e => e.stopPropagation()}
      >

        {/*  Modal header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-border bg-surface shrink-0">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <GitBranch className="w-4 h-4 text-primary/70" />
              <h2 className="text-sm font-semibold text-text-primary">Trace waterfall</h2>
              <span className="font-mono text-[10px] text-text-muted bg-background border border-border rounded px-2 py-px truncate max-w-[220px]">
                {traceId}
              </span>
            </div>
            <p className="text-xs text-text-muted ml-7">
              {spans.length > 0
                ? <>Root: <span className="font-mono text-text-primary">{spans[0]?.name || spans[0]?.service || '—'}</span></>
                : 'Awaiting span data…'
              }
            </p>
          </div>

          <div className="flex items-center gap-5 shrink-0">
            {/* Stats */}
            <div className="flex items-center gap-5">
              <div className="flex flex-col items-end">
                <span className="text-[9px] font-mono uppercase tracking-widest text-text-muted">Total duration</span>
                <span className="font-mono font-semibold text-text-primary text-base leading-tight">
                  {totalDuration}<span className="text-xs text-text-muted font-normal ml-0.5">ms</span>
                </span>
              </div>
              <div className="w-px h-7 bg-border" />
              <div className="flex flex-col items-end">
                <span className="text-[9px] font-mono uppercase tracking-widest text-text-muted">Spans</span>
                <span className="font-mono font-semibold text-text-primary text-base leading-tight">{spans.length}</span>
              </div>
            </div>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-1.5 text-text-muted hover:text-text-primary hover:bg-surface-hover rounded-md transition-colors duration-fast"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/*  Axis header  */}
        <div className="flex shrink-0 px-4 py-2 bg-background/50 border-b border-border text-[9px] font-mono text-text-muted select-none">
          <div className="w-[38%] pl-2">Execution tree</div>
          <div className="w-[62%] relative pr-2 h-4">
            {ticks.map((ms, i) => (
              <span
                key={i}
                className="absolute -translate-x-1/2"
                style={{ left: `${i * 25}%` }}
              >
                {ms}ms
              </span>
            ))}
            {/* Right-align last tick */}
            <span className="absolute right-0">{totalDuration}ms</span>
          </div>
        </div>

        {/*  Timeline body */}
        <div className="flex-1 min-h-0 overflow-y-auto relative bg-[#0A0C10]">

          {/* Grid lines */}
          {!loading && spans.length > 0 && (
            <div className="absolute inset-y-0 right-0 w-[62%] pointer-events-none">
              {[0, 25, 50, 75].map(pct => (
                <div
                  key={pct}
                  className="absolute top-0 bottom-0 w-px bg-white/[0.04]"
                  style={{ left: `${pct}%` }}
                />
              ))}
              <div className="absolute top-0 bottom-0 right-0 w-px bg-white/[0.04]" />
            </div>
          )}

          {/* Loading */}
          {loading && (
            <CenteredState>
              <Loader2 className="w-7 h-7 text-primary animate-spin" />
              <span className="text-sm font-mono text-text-muted">Loading spans…</span>
            </CenteredState>
          )}

          {/* Error */}
          {!loading && error && (
            <CenteredState>
              <AlertCircle className="w-7 h-7 text-accent-error" />
              <span className="text-sm font-mono text-accent-error">{error}</span>
            </CenteredState>
          )}

          {/* Empty */}
          {!loading && !error && spans.length === 0 && (
            <CenteredState>
              <GitBranch className="w-7 h-7 text-border" />
              <span className="text-sm font-mono text-text-muted">No spans recorded for this trace.</span>
            </CenteredState>
          )}

          {/* Span rows */}
          {!loading && !error && spans.map((span) => (
            <SpanRow
              key={span.id}
              span={span}
              totalDuration={totalDuration}
              isHovered={hoveredSpan?.id === span.id}
              isDimmed={!!hoveredSpan && hoveredSpan.id !== span.id}
              onHover={() => setHoveredSpan(span)}
              onLeave={() => setHoveredSpan(null)}
            />
          ))}
        </div>

        {/*  Bottom inspector  */}
        <div className="shrink-0 h-20 border-t border-border bg-surface px-6 flex items-center justify-between gap-6">
          {hoveredSpan ? (
            <>
              {/* Left: icon + name + service */}
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0
                  ${hoveredSpan.level?.toUpperCase() === 'ERROR' || hoveredSpan.level?.toUpperCase() === 'CRITICAL'
                    ? 'bg-accent-error/10 text-accent-error'
                    : 'bg-primary/10 text-primary'
                  }`}
                >
                  {hoveredSpan.level?.toUpperCase() === 'ERROR'
                    ? <AlertCircle className="w-4 h-4" />
                    : <Info className="w-4 h-4" />
                  }
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">{hoveredSpan.name}</p>
                  <p className="text-xs font-mono text-text-muted truncate">
                    {hoveredSpan.meta || `${hoveredSpan.service} layer`}
                  </p>
                </div>
              </div>

              {/* Right: stats */}
              <div className="flex items-center gap-0 bg-background border border-border rounded-lg overflow-hidden shrink-0">
                <div className="flex flex-col px-4 py-2.5 border-r border-border">
                  <span className="text-[9px] font-mono uppercase tracking-widest text-text-muted">Start offset</span>
                  <span className="font-mono text-xs text-text-secondary mt-0.5">+{hoveredSpan.offset}ms</span>
                </div>
                <div className="flex flex-col px-4 py-2.5 border-r border-border">
                  <span className="text-[9px] font-mono uppercase tracking-widest text-text-muted">Duration</span>
                  <span className="font-mono text-sm font-semibold text-text-primary mt-0.5">
                    {hoveredSpan.duration}<span className="text-[10px] text-text-muted font-normal">ms</span>
                  </span>
                </div>
                <div className="flex flex-col px-4 py-2.5">
                  <span className="text-[9px] font-mono uppercase tracking-widest text-text-muted">Service</span>
                  <span className="font-mono text-xs text-primary mt-0.5">{hoveredSpan.service}</span>
                </div>
              </div>
            </>
          ) : (
            <p className="w-full text-center text-xs font-mono text-text-muted/50">
              Hover a span to inspect its details
            </p>
          )}
        </div>

      </div>
    </div>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(modal, document.body);
};

export default TraceWaterfallModal;