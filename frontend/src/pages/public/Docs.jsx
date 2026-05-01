import React, { useState } from 'react';
import { Terminal, Code, Server, Activity, Database, HeartPulse, ChevronRight, Copy, Check } from 'lucide-react';
import { Link } from 'react-router-dom';

const DocsPage = () => {
  const [copiedCode, setCopiedCode] = useState(null);

  const handleCopy = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const CodeBlock = ({ code, language = 'javascript', id }) => (
    <div className="relative group rounded-xl overflow-hidden bg-[#0d1117] border border-border my-6 shadow-glass">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-[#161b22]">
        <div className="flex space-x-2">
          <div className="w-3 h-3 rounded-full bg-[#FF5F56]"></div>
          <div className="w-3 h-3 rounded-full bg-[#FFBD2E]"></div>
          <div className="w-3 h-3 rounded-full bg-[#27C93F]"></div>
        </div>
        <button
          onClick={() => handleCopy(code, id)}
          className="p-1.5 rounded-md hover:bg-surface-active transition-colors text-text-muted hover:text-text-primary"
        >
          {copiedCode === id ? <Check className="w-4 h-4 text-accent-success" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-sm font-mono text-text-primary leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );

  return (
    <div className="flex w-full max-w-7xl mx-auto px-4 md:px-8 pt-12 pb-24">
      {/* Sidebar Navigation */}
      <aside className="w-64 shrink-0 hidden lg:block pr-8 border-r border-border h-[calc(100vh-140px)] sticky top-28 overflow-y-auto">
        <div className="space-y-8">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-3">Getting Started</h4>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li><a href="#installation" className="hover:text-primary transition-colors flex items-center"><ChevronRight className="w-3 h-3 mr-1" /> Installation</a></li>
              <li><a href="#initialization" className="hover:text-primary transition-colors flex items-center"><ChevronRight className="w-3 h-3 mr-1" /> Initialization</a></li>
              <li><a href="#express" className="hover:text-primary transition-colors flex items-center"><ChevronRight className="w-3 h-3 mr-1" /> Express Middleware</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-3">Core Concepts</h4>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li><a href="#logging" className="hover:text-primary transition-colors flex items-center"><ChevronRight className="w-3 h-3 mr-1" /> Logging</a></li>
              <li><a href="#metrics" className="hover:text-primary transition-colors flex items-center"><ChevronRight className="w-3 h-3 mr-1" /> Custom Metrics</a></li>
              <li><a href="#tracing" className="hover:text-primary transition-colors flex items-center"><ChevronRight className="w-3 h-3 mr-1" /> Distributed Tracing</a></li>
              <li><a href="#heartbeats" className="hover:text-primary transition-colors flex items-center"><ChevronRight className="w-3 h-3 mr-1" /> Heartbeats</a></li>
            </ul>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:pl-12 max-w-4xl">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-text-primary mb-4">Node.js SDK Documentation</h1>
          <p className="text-lg text-text-secondary">
            The official <code className="bg-surface-active px-1.5 py-0.5 rounded text-primary">luminatrace</code> package provides seamless integration with your Node.js applications, offering zero-config telemetry for Express apps and powerful manual instrumentation APIs.
          </p>
        </div>

        {/* Installation */}
        <section id="installation" className="mb-16 scroll-mt-24">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
              <Terminal className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-text-primary">Installation</h2>
          </div>
          <p className="text-text-secondary mb-4">Install the package using your preferred package manager.</p>
          <CodeBlock id="install" code="npm install luminatrace" />
        </section>

        {/* Initialization */}
        <section id="initialization" className="mb-16 scroll-mt-24">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-secondary/10 rounded-lg border border-secondary/20">
              <Code className="w-6 h-6 text-secondary" />
            </div>
            <h2 className="text-2xl font-bold text-text-primary">Initialization</h2>
          </div>
          <p className="text-text-secondary mb-4">
            Initialize the client as early as possible in your application lifecycle. You will need your Workspace API Key from the LuminaTrace dashboard.
          </p>
          <CodeBlock id="init" code={`import { LuminaTrace } from "luminatrace";

const lumina = new LuminaTrace({
  apiKey: "lt_your_workspace_api_key_here",
  endpoint: "http://localhost:3000", // Your LuminaTrace instance URL
  flushInterval: 3000,               // Optional: Auto-flush interval in ms (default: 5000)
  batchSize: 100,                    // Optional: Max events per batch (default: 100)
});`} />
        </section>

        {/* Express Middleware */}
        <section id="express" className="mb-16 scroll-mt-24">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-[#8b5cf6]/10 rounded-lg border border-[#8b5cf6]/20">
              <Server className="w-6 h-6 text-[#8b5cf6]" />
            </div>
            <h2 className="text-2xl font-bold text-text-primary">Express Middleware</h2>
          </div>
          <p className="text-text-secondary mb-4">
            If you are using Express, the SDK provides a robust middleware that automatically instruments incoming requests, captures response times, tracks status codes, and generates root spans for tracing.
          </p>
          <CodeBlock id="express-mw" code={`import express from "express";
import { LuminaTrace } from "luminatrace";

const app = express();
const lumina = new LuminaTrace({ apiKey: "YOUR_API_KEY" });

// Add the middleware before your routes
app.use(lumina.middleware({
  ignorePaths: ["/health", "/metrics"], // Skip telemetry for these paths
  captureHeaders: false,                // Don't log sensitive request headers
  captureQuery: true,                   // Include query parameters in trace metadata
  slowRequestThreshold: 500,            // Tag requests slower than 500ms
}));

app.get("/api/hello", (req, res) => {
  // req.lumina is now injected!
  req.lumina.log("info", "Hello endpoint hit");
  res.json({ message: "Hello World" });
});`} />
        </section>

        {/* Logging */}
        <section id="logging" className="mb-16 scroll-mt-24">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-log-infoSubtle rounded-lg border border-log-info/20">
              <Database className="w-6 h-6 text-log-info" />
            </div>
            <h2 className="text-2xl font-bold text-text-primary">Structured Logging</h2>
          </div>
          <p className="text-text-secondary mb-4">
            Send structured logs with severity levels and rich metadata. If used within an Express request context (`req.lumina.log`), the logs are automatically attached to the active request trace!
          </p>
          <CodeBlock id="logs" code={`// Standalone logging
lumina.log("info", "Application started", { version: "1.0.0" });
lumina.log("debug", "User attempted login", { userId: 123 });
lumina.log("error", "Database connection failed", { code: "ECONNREFUSED" });

// Within an Express route (auto-correlated with the trace)
app.get("/users/:id", (req, res) => {
  try {
    // ... logic
    req.lumina.log("info", "User fetched successfully", { userId: req.params.id });
  } catch (err) {
    req.lumina.log("error", "Fetch failed", { error: err.message });
  }
});`} />
        </section>

        {/* Metrics */}
        <section id="metrics" className="mb-16 scroll-mt-24">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-[#F59E0B]/10 rounded-lg border border-[#F59E0B]/20">
              <Activity className="w-6 h-6 text-[#F59E0B]" />
            </div>
            <h2 className="text-2xl font-bold text-text-primary">Custom Metrics</h2>
          </div>
          <p className="text-text-secondary mb-4">
            Record application-specific time-series metrics. The SDK buffers and batches metrics efficiently.
          </p>
          <CodeBlock id="metrics-code" code={`// lumina.metric(name, value, unit)
lumina.metric("active_users", 142);
lumina.metric("cpu_usage", 75.5, "%");
lumina.metric("memory_usage", 2048, "MB");`} />
        </section>

        {/* Distributed Tracing */}
        <section id="tracing" className="mb-16 scroll-mt-24">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-[#10b981]/10 rounded-lg border border-[#10b981]/20">
              <Code className="w-6 h-6 text-[#10b981]" />
            </div>
            <h2 className="text-2xl font-bold text-text-primary">Distributed Tracing</h2>
          </div>
          <p className="text-text-secondary mb-4">
            Break down the execution time of complex operations by creating child spans. Spans track start and end times automatically.
          </p>
          <CodeBlock id="tracing-code" code={`app.get("/api/users/:id", async (req, res) => {
  // Start a child span representing a database query
  // req.trace is the parent span injected by the middleware
  const dbSpan = req.lumina.startSpan(req.trace, "fetch-user-from-db");
  dbSpan.setAttribute("userId", req.params.id);

  const user = await db.users.find(req.params.id);
  
  // End the span when the operation completes
  dbSpan.end();

  res.json(user);
});`} />
        </section>

        {/* Heartbeats */}
        <section id="heartbeats" className="mb-16 scroll-mt-24">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-[#ec4899]/10 rounded-lg border border-[#ec4899]/20">
              <HeartPulse className="w-6 h-6 text-[#ec4899]" />
            </div>
            <h2 className="text-2xl font-bold text-text-primary">Heartbeats</h2>
          </div>
          <p className="text-text-secondary mb-4">
            Send periodic heartbeats to track server availability and trigger "Server Down" alerts if a node stops reporting.
          </p>
          <CodeBlock id="heartbeat-code" code={`// Send a heartbeat on server startup
lumina.heartbeat({ 
  name: "API Gateway Node-1",
  tags: { region: "us-east-1", version: "1.2.4" } 
});

// Note: Ensure you gracefully flush data on shutdown
process.on("SIGTERM", async () => {
  await lumina.close();
  process.exit(0);
});`} />
        </section>

      </main>
    </div>
  );
};

export default DocsPage;
