import React, { useState, useEffect, useRef } from 'react';
import {
  Terminal, Code, Server, Activity, Database,
  HeartPulse, Copy, Check, BookOpen, Package,
  Layers, Radio
} from 'lucide-react';

const NAV_SECTIONS = [
  {
    label: 'Getting Started',
    items: [
      { id: 'installation',  label: 'Installation'      },
      { id: 'initialization', label: 'Initialization'    },
      { id: 'express',       label: 'Express Middleware' },
    ],
  },
  {
    label: 'Core API',
    items: [
      { id: 'logging',   label: 'Structured Logging'   },
      { id: 'metrics',   label: 'Custom Metrics'       },
      { id: 'tracing',   label: 'Distributed Tracing'  },
      { id: 'heartbeats', label: 'Heartbeats'          },
      { id: 'shutdown',  label: 'Graceful Shutdown'    },
    ],
  },
];

const ALL_IDS = NAV_SECTIONS.flatMap(g => g.items.map(i => i.id));

const SECTIONS = [
  {
    id: 'installation',
    icon: Terminal,
    iconColor: 'text-primary',
    iconBg: 'bg-primary/10 border-primary/20',
    title: 'Installation',
    intro: 'Install the package using your preferred package manager. Node.js 16 or higher is required.',
    codeId: 'install',
    code: `npm install luminatrace`,
  },
  {
    id: 'initialization',
    icon: Package,
    iconColor: 'text-secondary',
    iconBg: 'bg-secondary/10 border-secondary/20',
    title: 'Initialization',
    intro: 'Initialize the client once, as early as possible in your application entry point. Import your Workspace API key from the LuminaTrace dashboard.',
    codeId: 'init',
    code:
`import { LuminaTrace } from "luminatrace";

const lumina = new LuminaTrace({
  apiKey:         "lt_your_workspace_api_key_here",
  endpoint:       "https://your-luminatrace-instance.com",
  flushInterval: 3000,   // ms — how often queued data is sent (default: 5000)
  batchSize:     100,    // max events per HTTP batch (default: 100)
  debug:         false,  // set true to enable verbose console output
});`,
  },
  {
    id: 'express',
    icon: Server,
    iconColor: 'text-primary',
    iconBg: 'bg-primary/10 border-primary/20',
    title: 'Express Middleware',
    intro: 'Drop the middleware in before your routes. It automatically instruments every request — capturing latency, status codes, slow request warnings, and a root trace span — with zero additional code.',
    codeId: 'express-mw',
    code:
`import express from "express";
import { LuminaTrace } from "luminatrace";

const app = express();
const lumina = new LuminaTrace({ apiKey: "lt_...", endpoint: "https://..." });

// Register before your routes
app.use(lumina.middleware({
  ignorePaths:          ["/health", "/ping"], // skip telemetry on these prefixes
  captureHeaders:       false,                // set true to log request headers
  captureQuery:         true,                 // include query params in trace metadata
  slowRequestThreshold: 500,                  // warn if response time exceeds this (ms)
}));

// req.trace  — root span for this request
// req.lumina — SDK instance, pre-bound to the request context
app.get("/api/orders", async (req, res) => {
  req.lumina.log("info", "Orders endpoint hit", { userId: req.user?.id });
  const orders = await db.orders.findAll();
  res.json(orders);
});`,
  },
  {
    id: 'logging',
    icon: Database,
    iconColor: 'text-log-info',
    iconBg: 'bg-log-infoSubtle border-log-info/20',
    title: 'Structured Logging',
    intro: 'Send logs with a severity level and an optional metadata object. Logs sent inside a request context using req.lumina are automatically correlated to the active trace.',
    codeId: 'logs',
    code:
`// Standalone — outside a request context
lumina.log("debug",    "Cache warming started",          { keys: 142 });
lumina.log("info",     "Application ready",              { port: 3000 });
lumina.log("warn",     "Rate limit threshold approaching", { usage: "87%" });
lumina.log("error",    "Payment gateway timeout",        { orderId: "o_9kx2" });
lumina.log("critical", "Database connection pool empty", { pool: "primary" });

// Inside an Express route (auto-correlated to the request trace)
app.get("/users/:id", async (req, res) => {
  try {
    const user = await db.users.findById(req.params.id);
    req.lumina.log("info", "User fetched", { userId: req.params.id });
    res.json(user);
  } catch (err) {
    req.lumina.log("error", "User fetch failed", { error: err.message });
    res.status(500).json({ error: "Internal server error" });
  }
});`,
  },
  {
    id: 'metrics',
    icon: Activity,
    iconColor: 'text-accent-warning',
    iconBg: 'bg-accent-warning/10 border-accent-warning/20',
    title: 'Custom Metrics',
    intro: 'Record application-specific numeric metrics. The SDK buffers and batches all metric calls, so calling this frequently has negligible overhead. System metrics (CPU, memory, heap) are captured automatically.',
    codeId: 'metrics-code',
    code:
`// lumina.metric(name, value, unit?, tags?)
lumina.metric("active_connections", 312,   "count");
lumina.metric("queue_depth",        58,    "count", { queue: "email-delivery" });
lumina.metric("cache_hit_rate",     94.2,  "%",     { store: "redis-primary"  });
lumina.metric("response_time",      143,   "ms",    { endpoint: "/api/orders" });

// System metrics are captured automatically at systemMetricsInterval (default: 60s):
// cpu_usage (%), memory_used (MB), memory_used_percent (%), heap_used (MB)`,
  },
  {
    id: 'tracing',
    icon: Layers,
    iconColor: 'text-accent-success',
    iconBg: 'bg-accent-success/10 border-accent-success/20',
    title: 'Distributed Tracing',
    intro: 'Break down the execution of a request into named spans. Each span records its own start time, end time, and duration. Spans can be nested arbitrarily to model sequential or parallel work.',
    codeId: 'tracing-code',
    code:
`// When using the Express middleware, req.trace is the root span.
// Create child spans beneath it to profile individual operations.
app.get("/api/users/:id", async (req, res) => {

  const dbSpan = req.lumina.startSpan(req.trace, "db.users.findById");
  dbSpan.setAttribute("db.table",  "users");
  dbSpan.setAttribute("userId",    req.params.id);
  const user = await db.users.findById(req.params.id);
  dbSpan.end();

  const cacheSpan = req.lumina.startSpan(req.trace, "cache.set");
  await cache.set(\`user:\${req.params.id}\`, user, 300);
  cacheSpan.end();

  res.json(user);
});

// Outside Express — manual root trace
const trace   = lumina.startTrace("process-report");
const fetchSpan = lumina.startSpan(trace,     "fetch-raw-data");
const parseSpan = lumina.startSpan(fetchSpan, "parse-csv");   // nested under fetch
parseSpan.end();
fetchSpan.end();
trace.end();`,
  },
  {
    id: 'heartbeats',
    icon: Radio,
    iconColor: 'text-primary',
    iconBg: 'bg-primary/10 border-primary/20',
    title: 'Heartbeats',
    intro: 'Heartbeats register your server in the LuminaTrace Servers view and keep its status current. A server that stops sending heartbeats is marked offline after 60 seconds. The SDK sends a heartbeat automatically on every flush cycle.',
    codeId: 'heartbeat-code',
    code:
`// Manual heartbeat — useful on startup to register immediately
await lumina.heartbeat({
  name: "api-gateway-node-1",
  tags: { region: "us-east-1", version: process.env.APP_VERSION },
});`,
  },
  {
    id: 'shutdown',
    icon: HeartPulse,
    iconColor: 'text-accent-error',
    iconBg: 'bg-accent-error/10 border-accent-error/20',
    title: 'Graceful Shutdown',
    intro: 'Always call close() before your process exits. It stops the flush timer, stops system metric collection, and flushes all remaining queued logs, metrics, and spans in a single final batch.',
    codeId: 'shutdown-code',
    code:
`process.on("SIGTERM", async () => {
  await lumina.close(); // flush everything, stop all timers
  process.exit(0);
});

process.on("SIGINT", async () => {
  await lumina.close();
  process.exit(0);
});`,
  },
];

const CodeBlock = ({ code, id, copiedCode, onCopy }) => (
  <div className="relative rounded-card overflow-hidden bg-background border border-border my-5 shadow-glass">
    {/* Title bar */}
    <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-surface">
      <div className="flex items-center gap-1.5">
        <span className="w-2.5 h-2.5 rounded-full bg-accent-error/70" />
        <span className="w-2.5 h-2.5 rounded-full bg-accent-warning/70" />
        <span className="w-2.5 h-2.5 rounded-full bg-accent-success/70" />
      </div>
      <button
        onClick={() => onCopy(code, id)}
        className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium
                   text-text-muted hover:text-text-primary hover:bg-surface-active
                   transition-colors duration-fast"
      >
        {copiedCode === id
          ? <><Check className="w-3.5 h-3.5 text-accent-success" /><span className="text-accent-success">Copied</span></>
          : <><Copy className="w-3.5 h-3.5" /><span>Copy</span></>
        }
      </button>
    </div>
    <pre className="p-5 overflow-x-auto text-sm font-mono text-text-primary leading-relaxed">
      <code>{code}</code>
    </pre>
  </div>
);

const DocsPage = () => {
  const [copiedCode, setCopiedCode] = useState(null);
  const [activeId, setActiveId]     = useState('installation');
  const observerRef = useRef(null);

  const handleCopy = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Scroll-spy — highlight sidebar item matching the section in viewport
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        // Find the topmost visible section
        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) setActiveId(visible[0].target.id);
      },
      { rootMargin: '-10% 0px -70% 0px', threshold: 0 }
    );

    ALL_IDS.forEach(id => {
      const el = document.getElementById(id);
      if (el) observerRef.current.observe(el);
    });

    return () => observerRef.current?.disconnect();
  }, []);

  return (
    <div className="flex w-full max-w-7xl mx-auto px-4 md:px-8 pt-12 pb-24 gap-0">

      {/* ── Sidebar ─────────────────────────────────────────── */}
      <aside className="w-60 shrink-0 hidden lg:flex flex-col pr-8 border-r border-border
                        sticky top-24 h-[calc(100vh-96px)] overflow-y-auto">
        <div className="mb-6">
          <p className="text-[10px] font-semibold text-text-muted uppercase tracking-widest mb-1">
            On this page
          </p>
        </div>

        <nav className="space-y-6">
          {NAV_SECTIONS.map(group => (
            <div key={group.label}>
              <p className="text-[10px] font-semibold text-text-muted uppercase tracking-widest mb-2">
                {group.label}
              </p>
              <ul className="space-y-0.5">
                {group.items.map(item => {
                  const isActive = activeId === item.id;
                  return (
                    <li key={item.id}>
                      <a
                        href={`#${item.id}`}
                        className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-sm
                                    transition-colors duration-fast
                                    ${isActive
                                      ? 'text-primary bg-primary/10 font-medium'
                                      : 'text-text-secondary hover:text-text-primary hover:bg-surface-active'
                                    }`}
                      >
                        {isActive && (
                          <span className="w-1 h-1 rounded-full bg-primary shrink-0" />
                        )}
                        {!isActive && (
                          <span className="w-1 h-1 rounded-full bg-transparent shrink-0" />
                        )}
                        {item.label}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* npm badge at bottom of sidebar */}
        <div className="mt-auto pt-6 border-t border-border">
          <a
            href="https://www.npmjs.com/package/luminatrace"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 text-xs text-text-muted hover:text-text-primary transition-colors"
          >
            <span className="px-1.5 py-0.5 rounded bg-accent-error/10 text-accent-error border border-accent-error/20 font-mono text-[10px]">
              npm
            </span>
            luminatrace@0.1.0
          </a>
        </div>
      </aside>

      {/* ── Main Content ─────────────────────────────────────── */}
      <main className="flex-1 lg:pl-12 min-w-0">

        {/* Page header */}
        <div className="mb-12 pb-8 border-b border-border">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20">
              SDK
            </span>
            <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-surface-active text-text-muted border border-border">
              v0.1.0
            </span>
            <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-accent-success/10 text-accent-success border border-accent-success/20">
              Node.js ≥ 16
            </span>
          </div>

          <h1 className="text-3xl font-bold text-text-primary mb-3 tracking-tight">
            Node.js SDK
          </h1>
          <p className="text-base text-text-secondary leading-relaxed max-w-2xl">
            The official{' '}
            <code className="bg-surface-active px-1.5 py-0.5 rounded-md text-primary font-mono text-sm border border-border">
              luminatrace
            </code>{' '}
            package. Structured logging, custom metrics, distributed tracing, and system health
            monitoring — with zero-config auto-instrumentation for Express applications.
          </p>
        </div>

        {/* Sections */}
        {SECTIONS.map((section, idx) => {
          const Icon = section.icon;
          return (
            <section
              key={section.id}
              id={section.id}
              className={`scroll-mt-24 ${idx < SECTIONS.length - 1 ? 'mb-16 pb-16 border-b border-border' : 'mb-16'}`}
            >
              {/* Section heading */}
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 rounded-lg border ${section.iconBg} shrink-0`}>
                  <Icon className={`w-5 h-5 ${section.iconColor}`} />
                </div>
                <h2 className="text-xl font-bold text-text-primary tracking-tight">
                  {section.title}
                </h2>
              </div>

              <p className="text-sm text-text-secondary leading-relaxed mb-2 max-w-2xl">
                {section.intro}
              </p>

              <CodeBlock
                id={section.codeId}
                code={section.code}
                copiedCode={copiedCode}
                onCopy={handleCopy}
              />
            </section>
          );
        })}

        {/* Footer note */}
        <div className="mt-4 p-4 rounded-card border border-border bg-surface flex items-start gap-3">
          <BookOpen className="w-4 h-4 text-text-muted shrink-0 mt-0.5" />
          <p className="text-xs text-text-secondary leading-relaxed">
            For issues or contributions, visit the{' '}
            <a
              href="https://github.com/sarveshwani0501/luminatrace-js"
              target="_blank"
              rel="noreferrer"
              className="text-primary hover:underline"
            >
              luminatrace-js repository
            </a>
            . Full API reference and changelog are available in the README.
          </p>
        </div>

      </main>
    </div>
  );
};

export default DocsPage;