import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Clock, AlertCircle, Database, Server, Cpu, Layers, Link as LinkIcon, Info, Loader2 } from 'lucide-react';
import { spansApi } from '../../api/spans';

const TraceWaterfallModal = ({ traceId, projectId, onClose }) => {
  const [spans, setSpans] = useState([]);
  const [totalDuration, setTotalDuration] = useState(1000);
  const [hoveredSpan, setHoveredSpan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!traceId || !projectId) return;

    const fetchSpans = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await spansApi.getSpansByTrace(traceId, projectId);
        const data = res.data;
        setSpans(data);
        // totalDuration = the span with the largest offset + duration
        if (data.length > 0) {
          const max = data.reduce((acc, s) => Math.max(acc, s.offset + s.duration), 0);
          setTotalDuration(max || 1);
        }
      } catch (err) {
        setError('Failed to load trace spans.');
      } finally {
        setLoading(false);
      }
    };

    fetchSpans();
  }, [traceId, projectId]);

  if (!traceId) return null;

  // Helper icons for service layer distinction
  const getServiceIcon = (service) => {
    if (service.includes('gateway')) return <Layers className="w-3.5 h-3.5" />;
    if (service.includes('auth')) return <Cpu className="w-3.5 h-3.5" />;
    if (service.includes('redis') || service.includes('postgres')) return <Database className="w-3.5 h-3.5" />;
    return <Server className="w-3.5 h-3.5" />;
  };

  const getBarColor = (level) => {
    switch (level) {
      case 'ERROR': return 'bg-[#ef4444] shadow-[0_0_10px_rgba(239,68,68,0.5)]';
      case 'WARN': return 'bg-[#f59e0b] shadow-[0_0_10px_rgba(245,158,11,0.3)]';
      case 'DEBUG': return 'bg-[#06b6d4]';
      default: return 'bg-[#818cf8] shadow-[0_0_10px_rgba(129,140,248,0.3)]';
    }
  };

  const calculateWidth = (dur) => `${Math.max((dur / totalDuration) * 100, 0.5)}%`;
  const calculateLeft = (offset) => `${(offset / totalDuration) * 100}%`;

  const modalContent = (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm shadow-[0_0_100px_rgba(0,0,0,1)]">
      
      <div className="w-full max-w-7xl h-[85vh] bg-[#0d1117] border border-white/10 rounded-xl shadow-2xl flex flex-col overflow-hidden relative" onClick={e => e.stopPropagation()}>
        
        {/* HEADER */}
        <div className="px-6 py-4 border-b border-[#2d333b] flex justify-between items-center bg-[#161b22] shrink-0">
          <div>
            <div className="flex items-center space-x-3 mb-1">
              <h2 className="text-xl font-bold text-white tracking-tight">Trace Waterfall</h2>
              <span className="px-2 py-0.5 bg-[#4b5563]/30 border border-[#4b5563]/50 rounded text-xs font-mono text-[#8b949e]">{traceId}</span>
            </div>
            <p className="text-sm text-[#8b949e]">Root Method: <span className="text-white font-mono bg-white/5 px-1 py-0.5 rounded">[POST] /api/v1/auth/login</span></p>
          </div>
          
          <div className="flex items-center space-x-6">
             <div className="flex flex-col items-end">
               <span className="text-[10px] font-mono tracking-widest text-[#8b949e] uppercase">Total Duration</span>
               <span className="text-white font-mono font-bold text-lg">{totalDuration}<span className="text-sm font-normal text-[#8b949e]">ms</span></span>
             </div>
             <div className="flex flex-col items-end">
               <span className="text-[10px] font-mono tracking-widest text-[#8b949e] uppercase">Spans Executed</span>
               <span className="text-white font-mono font-bold text-lg">{spans.length}</span>
             </div>
             <button onClick={onClose} className="p-2 ml-4 hover:bg-white/10 rounded-full transition-colors text-[#8b949e] hover:text-white">
                <X className="w-5 h-5" />
             </button>
          </div>
        </div>

        {/* GANTT HEADER AXIS */}
        <div className="flex w-full bg-[#11151c] border-b border-[#2d333b] px-4 py-2 text-[10px] font-mono tracking-widest text-[#8b949e] uppercase shrink-0 sticky top-0 z-20 shadow-md">
          <div className="w-[35%] pl-4">Execution Tree (Hierarchy)</div>
          <div className="w-[65%] relative h-full">
            <span className="absolute left-0">0ms</span>
            <span className="absolute left-1/4 -translate-x-1/2">{Math.floor(totalDuration * 0.25)}ms</span>
            <span className="absolute left-1/2 -translate-x-1/2">{Math.floor(totalDuration * 0.50)}ms</span>
            <span className="absolute left-3/4 -translate-x-1/2">{Math.floor(totalDuration * 0.75)}ms</span>
            <span className="absolute right-0">{totalDuration}ms</span>
          </div>
        </div>

        {/* TRACE TIMELINE CANVAS */}
        <div className="flex-1 overflow-y-auto w-full no-scrollbar relative bg-[#0a0c10]">

          {/* Loading State */}
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#0a0c10]">
              <div className="flex flex-col items-center space-y-3">
                <Loader2 className="w-8 h-8 text-[#818cf8] animate-spin" />
                <span className="text-[#8b949e] text-sm font-mono">Fetching trace spans...</span>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#0a0c10]">
              <div className="flex flex-col items-center space-y-3">
                <AlertCircle className="w-8 h-8 text-[#ef4444]" />
                <span className="text-[#ef4444] text-sm font-mono">{error}</span>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && spans.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#0a0c10]">
              <span className="text-[#4b5563] text-sm font-mono">No spans recorded for this trace yet.</span>
            </div>
          )}
          
          {/* Vertical Grid Lines */}
          {!loading && spans.length > 0 && (
          <div className="absolute inset-y-0 right-0 w-[65%] pointer-events-none opacity-20">
            <div className="absolute top-0 bottom-0 left-0 border-l border-white/10"></div>
            <div className="absolute top-0 bottom-0 left-1/4 border-l border-white/10 border-dashed"></div>
            <div className="absolute top-0 bottom-0 left-1/2 border-l border-white/10 border-dashed"></div>
            <div className="absolute top-0 bottom-0 left-3/4 border-l border-white/10 border-dashed"></div>
            <div className="absolute top-0 bottom-0 right-0 border-r border-white/10"></div>
          </div>
          )}

          {/* Span Lines Iterator */}
          <div className="w-full relative py-2">
            {spans.map((span, index) => (
              <div 
                key={span.id}
                onMouseEnter={() => setHoveredSpan(span)}
                onMouseLeave={() => setHoveredSpan(null)}
                className={`flex w-full group relative ${hoveredSpan && hoveredSpan.id !== span.id ? 'opacity-30' : 'opacity-100'} transition-opacity duration-200 hover:bg-[#161b22]`}
              >
                
                {/* Left Panel: Structuring & Text */}
                <div className="w-[35%] flex items-center pr-4 py-2 border-r border-[#2d333b]">
                   
                   {/* Deep Indentation Graphics */}
                   <div style={{ marginLeft: `${span.depth * 24}px` }} className="flex items-center">
                      <div className="mr-3 text-[#4b5563] relative flex items-center justify-center">
                         {span.depth > 0 && (
                            <>
                              <div className="absolute -top-4 -left-3 w-px h-6 bg-[#2d333b]"></div>
                              <div className="absolute top-1/2 -left-3 w-4 h-px bg-[#2d333b]"></div>
                            </>
                         )}
                         <span className="opacity-80" style={{ color: span.level === 'ERROR' ? '#ef4444' : span.level === 'WARN' ? '#f59e0b' : '#a5b4fc' }}>
                           {getServiceIcon(span.service)}
                         </span>
                      </div>
                      
                      <div className="flex flex-col overflow-hidden">
                        <span className="text-white text-sm font-semibold truncate group-hover:text-[#a5b4fc] transition-colors">{span.name}</span>
                        <div className="flex items-center text-[#8b949e] space-x-2 mt-0.5">
                           <span className="px-1.5 py-0.5 bg-white/5 border border-white/10 rounded text-[9px] font-mono">{span.service}</span>
                           {span.level === 'ERROR' && <AlertCircle className="w-3 h-3 text-[#ef4444]" />}
                        </div>
                      </div>
                   </div>
                </div>

                {/* Right Panel: Gantt Positioning Canvas */}
                <div className="w-[65%] relative py-2 px-2 flex items-center">
                   
                   {/* The Absolute Positioned Horizon Bar */}
                   <div 
                      className={`h-4 rounded-sm relative cursor-pointer ${getBarColor(span.level)} opacity-90 group-hover:opacity-100 transition-all z-10 flex min-w-[2px] items-center`}
                      style={{ 
                        left: calculateLeft(span.offset), 
                        width: calculateWidth(span.duration),
                      }}
                   >
                     <div className="absolute left-0 right-0 top-0 bottom-0 bg-white/10 mix-blend-overlay"></div>
                   </div>

                   {/* Trace Anchor Text rendering conditionally outside the bar if it's too small */}
                   <span 
                      className="absolute font-mono text-[9px] text-[#8b949e] pointer-events-none group-hover:text-white transition-colors z-0"
                      style={{ 
                        left: calculateLeft(span.offset), 
                        transform: `translateX(calc(${calculateWidth(span.duration)} + 8px))`
                      }}
                   >
                     {span.duration}ms
                   </span>
                </div>

              </div>
            ))}
          </div>

        </div>

        {/* BOTTOM METADATA INSPECTOR (Active Hover Detail) */}
        <div className="h-[80px] bg-[#161b22] border-t border-[#2d333b] px-6 py-3 flex items-center shrink-0 shadow-[0_-10px_20px_rgba(0,0,0,0.2)] z-30">
           {hoveredSpan ? (
             <div className="flex w-full justify-between items-center animate-in fade-in slide-in-from-bottom-2 duration-200">
               <div className="flex items-center space-x-4">
                  <span className={`p-2 rounded-lg ${hoveredSpan.level === 'ERROR' ? 'bg-[#450a0a] text-[#ef4444]' : 'bg-[#1c212b] text-[#818cf8]'}`}>
                     {hoveredSpan.level === 'ERROR' ? <AlertCircle className="w-5 h-5"/> : <Info className="w-5 h-5"/>}
                  </span>
                  <div>
                    <h3 className="text-white font-medium text-sm">{hoveredSpan.name}</h3>
                    <p className="text-[#8b949e] font-mono text-xs">{hoveredSpan.meta || `Executing inside ${hoveredSpan.service} layer`}</p>
                  </div>
               </div>
               
               <div className="flex space-x-6 bg-[#0d1117] px-4 py-2 rounded border border-white/5">
                 <div className="flex flex-col">
                   <span className="text-[#8b949e] text-[9px] uppercase font-mono tracking-wider">Start Offset</span>
                   <span className="text-[#c9d1d9] font-mono text-xs">+{hoveredSpan.offset}ms</span>
                 </div>
                 <div className="w-px h-6 bg-white/10"></div>
                 <div className="flex flex-col">
                   <span className="text-[#8b949e] text-[9px] uppercase font-mono tracking-wider">Time Isolated</span>
                   <span className="text-white font-mono text-sm font-bold">{hoveredSpan.duration}<span className="text-[10px] text-[#8b949e] font-normal">ms</span></span>
                 </div>
               </div>
             </div>
           ) : (
             <div className="w-full h-full flex items-center justify-center text-[#4b5563] text-sm font-mono opacity-60">
                 Hover over a horizontal trace span to inspect metadata payload...
             </div>
           )}
        </div>

      </div>
    </div>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(modalContent, document.body);
};

export default TraceWaterfallModal;
