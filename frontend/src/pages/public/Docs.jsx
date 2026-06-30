import React, { useState, useEffect, useRef } from 'react';
import {
  Terminal, Package, Server, Activity, Database,
  HeartPulse, Copy, Check, BookOpen, Layers, Radio
} from 'lucide-react';


const NAV_SECTIONS = [
  {
    label: 'Getting Started',
    items: [
      { id: 'installation',   label: 'Installation'       },
      { id: 'initialization', label: 'Initialization'     },
      { id: 'express',        label: 'Express Middleware'  },
    ],
  },
  {
    label: 'Core API',
    items: [
      { id: 'logging',    label: 'Structured Logging'  },
      { id: 'metrics',    label: 'Custom Metrics'      },
      { id: 'tracing',    label: 'Distributed Tracing' },
      { id: 'heartbeats', label: 'Heartbeats'          },
      { id: 'shutdown',   label: 'Graceful Shutdown'   },
    ],
  },
];

const ALL_IDS = NAV_SECTIONS.flatMap(g => g.items.map(i => i.id));


const TOKENS = [
  // Strings FIRST — captures "https://..." whole before // can be seen as a comment
  { re: /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)/g, cls: 'text-secondary'     }, // string → cyan
  // Comments — only reached on segments that weren't already consumed by strings above
  { re: /(\/\/[^\n]*)/g,                                              cls: 'text-[#4B5563]'     }, // comment → dim
  // Keywords
  { re: /\b(import|export|from|const|let|var|new|async|await|return|function|class|true|false|null|undefined|process|of|in|if|else|try|catch|throw)\b/g, cls: 'text-primary' },
  // Built-in globals
  { re: /\b(console|Promise|Error|Object|Array|Math|Date|JSON|require)\b/g, cls: 'text-primary' },
  // Shell prompt $
  { re: /(\$)/g,                                                      cls: 'text-accent-success' }, // $ → green
  // Numbers
  { re: /\b(\d+)\b/g,                                                 cls: 'text-accent-warning' }, // number → amber
  // Function / method calls  word(
  { re: /\b([a-zA-Z_][a-zA-Z0-9_]*)(?=\s*\()/g,                     cls: 'text-accent-success' }, // fn → green
];


const highlight = (raw) => {
  // We work with an array of { text, colored } segments
  let segments = [{ text: raw, colored: false }];

  TOKENS.forEach(({ re, cls }) => {
    const next = [];
    segments.forEach(seg => {
      if (seg.colored) { next.push(seg); return; }
      const parts = seg.text.split(re);
      // split() with a capturing group interleaves matches between non-matches
      parts.forEach((part, i) => {
        if (!part) return;
        // Odd indices are the captured group (the match)
        if (i % 2 === 1) {
          next.push({ text: part, colored: true, cls });
        } else {
          next.push({ text: part, colored: false });
        }
      });
    });
    segments = next;
  });

  return segments.map((seg, i) =>
    seg.colored
      ? <span key={i} className={seg.cls}>{seg.text}</span>
      : <span key={i} className="text-text-secondary">{seg.text}</span>
  );
};


const CodeBlock = ({ code, id, filename, copiedCode, onCopy }) => (
  <div className="rounded-card overflow-hidden bg-[#0D1117] border border-border shadow-glass my-5">
    {/* Chrome bar */}
    <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-surface">
      <div className="flex items-center gap-3">
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-accent-error/60" />
          <span className="w-2.5 h-2.5 rounded-full bg-accent-warning/60" />
          <span className="w-2.5 h-2.5 rounded-full bg-accent-success/60" />
        </div>
        {filename && (
          <span className="text-[10px] font-mono text-text-muted">{filename}</span>
        )}
      </div>
      <button
        onClick={() => onCopy(code, id)}
        className="flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-mono
                   text-text-muted hover:text-text-primary hover:bg-surface-active
                   border border-transparent hover:border-border
                   transition-all duration-fast"
      >
        {copiedCode === id ? (
          <><Check className="w-3 h-3 text-accent-success" /><span className="text-accent-success">Copied!</span></>
        ) : (
          <><Copy className="w-3 h-3" /><span>Copy</span></>
        )}
      </button>
    </div>
    {/* Code */}
    <pre className="p-5 overflow-x-auto text-[12.5px] font-mono leading-[1.85] whitespace-pre">
      <code>{highlight(code)}</code>
    </pre>
  </div>
);

const IC = ({ children }) => (
  <code className="bg-surface-active px-1.5 py-0.5 rounded-md text-primary font-mono text-[12px] border border-border">
    {children}
  </code>
);


const SECTIONS = [
  {
    id: 'installation',
    icon: Terminal,
    iconColor: 'text-primary',
    iconBg: 'bg-primary/8 border-primary/20',
    title: 'Installation',
    filename: 'terminal',
    intro: <>Install the package using your preferred package manager. <IC>Node.js 16</IC> or higher is required.</>,
    code: `$ npm install luminatrace`,
  },
  {
    id: 'initialization',
    icon: Package,
    iconColor: 'text-secondary',
    iconBg: 'bg-secondary/8 border-secondary/20',
    title: 'Initialization',
    filename: 'app.js',
    intro: <>Initialize the client once, as early as possible in your application entry point. Copy your API key from the LuminaTrace dashboard under <IC>Settings → Project</IC>.</>,
    code:
`import { LuminaTrace } from "luminatrace";

const lumina = new LuminaTrace({
  apiKey:        "lt_your_workspace_api_key_here",
  endpoint:      "https://your-luminatrace-instance.com",
  flushInterval: 3000,   // how often queued data is sent, in ms (default: 5000)
  batchSize:     100,    // max events per batch (default: 100)
  debug:         false,  // set true to see verbose output in your console
});`,
  },
  {
    id: 'express',
    icon: Server,
    iconColor: 'text-primary',
    iconBg: 'bg-primary/8 border-primary/20',
    title: 'Express Middleware',
    filename: 'app.js',
    intro: <>Drop the middleware in before your routes. It automatically captures request duration, status codes, and creates a root trace span for every request — with zero extra code. Inside any route, <IC>req.lumina</IC> gives you an SDK instance pre-bound to the active trace.</>,
    code:
`import express from "express";
import { LuminaTrace } from "luminatrace";

const app    = express();
const lumina = new LuminaTrace({ apiKey: "lt_...", endpoint: "https://..." });

// Register before your routes
app.use(lumina.middleware({
  ignorePaths:          ["/health", "/ping"], // skip telemetry on these paths
  captureHeaders:       false,                // set true to include request headers
  captureQuery:         true,                 // include query params in trace metadata
  slowRequestThreshold: 500,                  // warn when response exceeds this (ms)
}));

// req.trace  — root span for this request
// req.lumina — SDK instance, pre-bound to the current trace
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
    filename: 'app.js',
    intro: <>Send logs with a severity level and an optional metadata object. Logs sent inside a request using <IC>req.lumina</IC> are automatically linked to the active trace — click any trace ID in the dashboard to see all correlated logs.</>,
    code:
`// Standalone — outside a request
lumina.log("debug",    "Cache warming started",           { keys: 142 });
lumina.log("info",     "Application ready",               { port: 3000 });
lumina.log("warn",     "Rate limit threshold approaching", { usage: "87%" });
lumina.log("error",    "Payment gateway timeout",         { orderId: "o_9kx2" });
lumina.log("critical", "Database connection pool empty",  { pool: "primary" });

// Inside an Express route — auto-linked to the request trace
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
    iconBg: 'bg-accent-warning/8 border-accent-warning/20',
    title: 'Custom Metrics',
    filename: 'app.js',
    intro: <>Record any numeric value as a named metric. Metrics appear in the dashboard charts and can trigger alert rules. CPU, memory, and heap usage are captured automatically — you only need this for application-level metrics.</>,
    code:
`// lumina.metric(name, value, unit?, tags?)
lumina.metric("active_connections", 312,  "count");
lumina.metric("queue_depth",        58,   "count", { queue: "email-delivery" });
lumina.metric("cache_hit_rate",     94.2, "%",     { store: "redis-primary"  });
lumina.metric("response_time",      143,  "ms",    { endpoint: "/api/orders" });

// These are captured automatically every 60 seconds — no code needed:
// cpu_usage (%), memory_used (MB), memory_used_percent (%), heap_used (MB)`,
  },
  {
    id: 'tracing',
    icon: Layers,
    iconColor: 'text-accent-success',
    iconBg: 'bg-accent-success/8 border-accent-success/20',
    title: 'Distributed Tracing',
    filename: 'app.js',
    intro: <>Break a request into named spans to see exactly where time is spent. Spans can be nested to model sequential or parallel work. The waterfall view in the dashboard renders the full hierarchy automatically.</>,
    code:
`// With Express middleware, req.trace is already the root span.
// Create child spans to profile individual operations.
app.get("/api/users/:id", async (req, res) => {

  const dbSpan = req.lumina.startSpan(req.trace, "db.users.findById");
  const user   = await db.users.findById(req.params.id);
  dbSpan.end();

  const cacheSpan = req.lumina.startSpan(req.trace, "cache.set");
  await cache.set(\`user:\${req.params.id}\`, user, 300);
  cacheSpan.end();

  res.json(user);
});

// Outside Express — create a manual root trace
const trace     = lumina.startTrace("process-report");
const fetchSpan = lumina.startSpan(trace,     "fetch-raw-data");
const parseSpan = lumina.startSpan(fetchSpan, "parse-csv");  // nested under fetch
parseSpan.end();
fetchSpan.end();
trace.end();`,
  },
  {
    id: 'heartbeats',
    icon: Radio,
    iconColor: 'text-primary',
    iconBg: 'bg-primary/8 border-primary/20',
    title: 'Heartbeats',
    filename: 'app.js',
    intro: <>Heartbeats register your server in the Servers view and keep its status current. A server that stops sending heartbeats is marked offline after 60 seconds. The SDK sends one automatically on every flush — call it manually on startup to register immediately.</>,
    code:
`await lumina.heartbeat({
  name: "api-gateway-node-1",
  tags: { region: "us-east-1", version: process.env.APP_VERSION },
});`,
  },
  {
    id: 'shutdown',
    icon: HeartPulse,
    iconColor: 'text-accent-error',
    iconBg: 'bg-accent-error/8 border-accent-error/20',
    title: 'Graceful Shutdown',
    filename: 'app.js',
    intro: <>Always call <IC>lumina.close()</IC> before your process exits. It stops the flush timer, stops system metric collection, and sends one final batch containing everything still in the queue — so no data is lost on deployment or restart.</>,
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


const DocsPage = () => {
  const [copiedCode, setCopiedCode] = useState(null);
  const [activeId,   setActiveId]   = useState('installation');
  const observerRef = useRef(null);

  const handleCopy = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  /* Scroll-spy */
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
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

      {/* Sidebar */}
      <aside className="w-56 shrink-0 hidden lg:flex flex-col pr-8 border-r border-border sticky top-20 h-[calc(100vh-80px)] overflow-y-auto">
        <p className="text-[10px] font-semibold text-text-muted uppercase tracking-widest mb-5">
          On this page
        </p>

        <nav className="flex flex-col gap-5 flex-1">
          {NAV_SECTIONS.map(group => (
            <div key={group.label}>
              <p className="text-[10px] font-semibold text-text-muted uppercase tracking-widest mb-1.5">
                {group.label}
              </p>
              <ul className="flex flex-col gap-0.5">
                {group.items.map(item => {
                  const isActive = activeId === item.id;
                  return (
                    <li key={item.id}>
                      <a
                        href={`#${item.id}`}
                        className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md text-sm
                          transition-all duration-fast
                          ${isActive
                            ? 'text-primary bg-primary/10 font-medium border-l-2 border-primary'
                            : 'text-text-secondary hover:text-text-primary hover:bg-surface-active'
                          }`}
                      >
                        <span className={`w-1 h-1 rounded-full shrink-0 transition-colors duration-fast ${isActive ? 'bg-primary' : 'bg-transparent'}`} />
                        {item.label}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* npm badge */}
        <div className="mt-auto pt-5 border-t border-border">
          <a
            href="https://www.npmjs.com/package/luminatrace"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 text-xs text-text-muted hover:text-text-primary transition-colors duration-fast"
          >
            <span className="px-1.5 py-0.5 rounded bg-accent-error/10 text-accent-error border border-accent-error/20 font-mono text-[10px]">
              npm
            </span>
            luminatrace@0.1.0
          </a>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 lg:pl-12 min-w-0">

        {/* Page header */}
        <div className="mb-12 pb-8 border-b border-border">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20">SDK</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-surface-active text-text-muted border border-border">v0.1.0</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-accent-success/10 text-accent-success border border-accent-success/20">Node.js ≥ 16</span>
          </div>
          <h1 className="text-3xl font-semibold text-text-primary mb-3 tracking-tight">
            Node.js SDK
          </h1>
          <p className="text-base text-text-secondary leading-relaxed max-w-2xl">
            The official <IC>luminatrace</IC> package. Structured logging, custom metrics,
            distributed tracing, and system health monitoring — with zero-config
            auto-instrumentation for Express applications.
          </p>
        </div>

        {/* Sections */}
        {SECTIONS.map((section, idx) => {
          const Icon = section.icon;
          const isLast = idx === SECTIONS.length - 1;
          return (
            <section
              key={section.id}
              id={section.id}
              className={`scroll-mt-24 ${!isLast ? 'mb-16 pb-16 border-b border-border' : 'mb-8'}`}
            >
              {/* Heading */}
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 rounded-lg border shrink-0 ${section.iconBg}`}>
                  <Icon className={`w-4 h-4 ${section.iconColor}`} />
                </div>
                <h2 className="text-lg font-semibold text-text-primary tracking-tight">
                  {section.title}
                </h2>
              </div>

              {/* Intro */}
              <p className="text-sm text-text-secondary leading-relaxed max-w-2xl mb-1">
                {section.intro}
              </p>

              {/* Code block */}
              <CodeBlock
                id={section.id}
                filename={section.filename}
                code={section.code}
                copiedCode={copiedCode}
                onCopy={handleCopy}
              />
            </section>
          );
        })}

        {/* Footer note */}
        <div className="p-4 rounded-card border border-border bg-surface flex items-start gap-3">
          <BookOpen className="w-4 h-4 text-text-muted shrink-0 mt-0.5" />
          <p className="text-xs text-text-secondary leading-relaxed">
            For issues or contributions, visit the{' '}
            <a
              href="https://github.com/sarveshwani0501/luminatrace-js"
              target="_blank"
              rel="noreferrer"
              className="text-primary hover:text-primary-hover underline underline-offset-2 transition-colors duration-fast"
            >
              luminatrace-js repository
            </a>.
            {' '}Full API reference and changelog are in the README.
          </p>
        </div>

      </main>
    </div>
  );
};

export default DocsPage;