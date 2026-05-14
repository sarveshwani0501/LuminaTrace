import React, { useState, useMemo } from 'react';
import { ExternalLink } from 'lucide-react';

/* ─────────────────────────────────────────────────────────────────
   CHANGELOG DATA
   
   Rules for adding entries:
   - Describe what the USER can now do — not how you built it
   - No internal tech names (Kafka, Redis, TimescaleDB, Socket.io)
   - One entry per release. Prepend new entries at the top.
   - tags: 'new' | 'improved' | 'fixed' | 'sdk' | 'breaking'
   - type: 'major' (filled dot) | 'minor' (hollow dot)
───────────────────────────────────────────────────────────────── */
const ENTRIES = [
  {
    version:   'v1.0.0',
    date:      'May 2025',
    type:      'major',
    title:     'LuminaTrace — Initial Release',
    subtitle:  'Full-stack observability for your Node.js services, available today.',
    tags:      ['new', 'sdk'],
    githubUrl: 'https://github.com/sarveshwani0501/LuminaTrace-Application-Log-Monitoring-System',
    changes: [
      {
        type: 'new',
        text: 'Real-time log streaming — every log your service emits appears in the dashboard the moment it happens, with full metadata and level filtering.',
      },
      {
        type: 'new',
        text: 'Metrics dashboard — track CPU usage, memory, latency, throughput, error rate, and active connections over any time window with live-updating charts.',
      },
      {
        type: 'new',
        text: 'Distributed tracing — instrument any request with a trace and visualize the full span waterfall: see every operation, how long it took, and where time was spent.',
      },
      {
        type: 'new',
        text: 'Alert rules — define a threshold on any metric and get an email the moment it\'s breached. Alerts auto-resolve when the metric returns to normal.',
      },
      {
        type: 'new',
        text: 'Uptime monitoring — add any public URL and get continuous availability checks with response time tracking and incident history.',
      },
      {
        type: 'new',
        text: 'Server monitoring — every server running the SDK is automatically registered and visible with live CPU, memory, and heartbeat status.',
      },
      {
        type: 'new',
        text: 'Multi-tenant workspaces — create an organization, invite teammates, and manage multiple projects each with their own isolated data and API key.',
      },
      {
        type: 'sdk',
        text: 'Node.js SDK — a single npm package to instrument your Express app. One line of middleware gives you automatic request tracing, logging, and metrics with zero configuration.',
      },
    ]
    }
];

/* ─────────────────────────────────────────────────────────────────
   TAG CONFIG
───────────────────────────────────────────────────────────────── */
const TAG_CONFIG = {
  new:      { label: 'New',      cls: 'bg-primary/8        text-primary         border-primary/20'        },
  improved: { label: 'Improved', cls: 'bg-secondary/8      text-secondary       border-secondary/20'      },
  fixed:    { label: 'Fixed',    cls: 'bg-accent-success/8 text-accent-success  border-accent-success/20' },
  sdk:      { label: 'SDK',      cls: 'bg-log-debugSubtle  text-log-debug       border-log-debug/25'      },
  breaking: { label: 'Breaking', cls: 'bg-accent-error/8   text-accent-error    border-accent-error/20'   },
};

const CHANGE_DOT = {
  new:      'bg-primary',
  improved: 'bg-secondary',
  fixed:    'bg-accent-success',
  sdk:      'bg-log-debug',
  breaking: 'bg-accent-error',
};

const FILTERS = ['all', 'new', 'improved', 'fixed', 'sdk', 'breaking'];

/* ─────────────────────────────────────────────────────────────────
   TAG BADGE
───────────────────────────────────────────────────────────────── */
const Tag = ({ type }) => {
  const cfg = TAG_CONFIG[type];
  if (!cfg) return null;
  return (
    <span
      className={`inline-flex items-center px-2 py-px rounded border
        text-[9px] font-mono font-semibold uppercase tracking-wide ${cfg.cls}`}
    >
      {cfg.label}
    </span>
  );
};

/* ─────────────────────────────────────────────────────────────────
   CHANGELOG PAGE
───────────────────────────────────────────────────────────────── */
const Changelog = () => {
  const [activeFilter, setActiveFilter] = useState('all');

  const filtered = useMemo(() =>
    activeFilter === 'all'
      ? ENTRIES
      : ENTRIES.filter(e => e.tags.includes(activeFilter)),
  [activeFilter]);

  return (
    <div className="min-h-screen bg-background text-text-primary">
      <div className="max-w-4xl mx-auto px-6 py-20">

        {/* ── Page header ───────────────────────────────────── */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-primary">
              What's new
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
          </div>
          <h1 className="text-4xl font-semibold text-text-primary tracking-tight mb-4">
            Changelog
          </h1>
          <p className="text-text-muted text-base max-w-md mx-auto leading-relaxed">
            Every release documented as it ships — what's new, what's improved,
            and what's fixed.
          </p>
        </div>

        {/* ── Filter pills ──────────────────────────────────── */}
        <div className="flex items-center justify-center gap-2 flex-wrap mb-14">
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-4 py-1.5 rounded-pill text-[11px] font-mono border
                transition-all duration-fast capitalize
                ${activeFilter === f
                  ? 'bg-primary/10 border-primary/30 text-primary'
                  : 'bg-surface border-border text-text-muted hover:border-border-light hover:text-text-secondary'
                }`}
            >
              {f === 'all' ? 'All releases' : TAG_CONFIG[f]?.label ?? f}
            </button>
          ))}
        </div>

        {/* ── Timeline ──────────────────────────────────────── */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-text-muted text-sm font-mono">
            No entries match this filter yet.
          </div>
        ) : (
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-[167px] top-8 bottom-8 w-px bg-border pointer-events-none" />

            <div className="flex flex-col gap-0">
              {filtered.map((entry) => (
                <div
                  key={entry.version}
                  className="grid gap-0"
                  style={{ gridTemplateColumns: '180px 1fr' }}
                >
                  {/* Left: date + version */}
                  <div className="pr-8 pt-7 pb-6 text-right self-start sticky top-24">
                    <p className="text-[10px] font-mono text-text-muted mb-1">
                      {entry.date}
                    </p>
                    <p className="text-sm font-mono font-medium text-text-primary">
                      {entry.version}
                    </p>
                  </div>

                  {/* Right: node + card */}
                  <div className="relative">
                    {/* Timeline node */}
                    <div
                      className={`absolute -left-[8.5px] top-8 w-[15px] h-[15px]
                        rounded-full border-2 border-background z-10
                        ${entry.type === 'major'
                          ? 'bg-primary shadow-[0_0_0_3px_rgba(124,58,237,0.2)]'
                          : 'bg-surface-active border-border-light'
                        }`}
                    />

                    {/* Card */}
                    <div className="ml-7 my-4">
                      <div className="bg-surface border border-border rounded-card p-6
                        transition-all duration-base hover:border-border-light hover:shadow-elevated">

                        {/* Header */}
                        <h2 className="text-base font-semibold text-text-primary mb-1">
                          {entry.title}
                        </h2>
                        <p className="text-sm text-text-muted mb-4 leading-relaxed">
                          {entry.subtitle}
                        </p>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-1.5 mb-5">
                          {entry.tags.map(tag => <Tag key={tag} type={tag} />)}
                        </div>

                        {/* Change list */}
                        <ul className="flex flex-col gap-3">
                          {entry.changes.map((change, ci) => (
                            <li key={ci} className="flex items-start gap-3">
                              <span
                                className={`w-1.5 h-1.5 rounded-full mt-[7px] shrink-0
                                  ${CHANGE_DOT[change.type] ?? 'bg-text-muted'}`}
                              />
                              <span className="text-sm text-text-secondary leading-relaxed">
                                {change.text}
                              </span>
                            </li>
                          ))}
                        </ul>

                        {/* GitHub link */}
                        <a
                          href={entry.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 mt-6
                            text-[11px] font-mono text-text-muted hover:text-primary
                            border border-border hover:border-primary/30 rounded-md
                            px-2.5 py-1 transition-all duration-fast"
                        >
                          <ExternalLink className="w-3 h-3" />
                          View on GitHub
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── GitHub CTA ────────────────────────────────────── */}
        <div className="mt-16 bg-surface border border-border rounded-card p-7
          flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div>
            <p className="text-sm font-semibold text-text-primary mb-1">
              Stay up to date
            </p>
            <p className="text-sm text-text-muted">
              Watch the repository on GitHub to get notified on every new release.
            </p>
          </div>
          <a
            href="https://github.com/sarveshwani0501/LuminaTrace-Application-Log-Monitoring-System"
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 inline-flex items-center gap-2 bg-primary
              hover:bg-primary-hover text-white px-5 py-2.5 rounded-md text-sm
              font-medium shadow-glow-primary transition-all duration-fast whitespace-nowrap"
          >
            <ExternalLink className="w-4 h-4" />
            Watch on GitHub
          </a>
        </div>

      </div>
    </div>
  );
};

export default Changelog;