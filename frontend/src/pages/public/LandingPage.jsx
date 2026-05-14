// import React from 'react';
// import { Link } from 'react-router-dom';
// import { Activity, Terminal, Shield, Zap, ArrowRight, BarChart2, Check } from 'lucide-react';
// import Button from '../../components/ui/Button';
// import { Card, CardContent } from '../../components/ui/Card';

// const LandingPage = () => {
//   return (
//     <div className="flex flex-col items-center w-full">
//       {/* Hero Section */}
//       <section className="relative w-full max-w-7xl mx-auto px-6 pt-20 pb-32 flex flex-col items-center text-center">
//         {/* Decorative ambient glow */}
//         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-primary/20 blur-[120px] rounded-full pointer-events-none"></div>

//         <div className="inline-flex items-center px-3 py-1 rounded-full bg-surface border border-border-light text-secondary text-sm font-medium mb-8">
//           <Zap className="w-4 h-4 mr-2" />
//           LuminaTrace SDK is now live.
//         </div>
        
//         <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-text-primary max-w-4xl mb-6">
//           The Cosmic Observer for <br className="hidden md:block"/>
//           <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
//             Distributed Systems
//           </span>
//         </h1>
        
//         <p className="text-lg md:text-xl text-text-secondary max-w-2xl mb-10">
//           Unify your logs, metrics, and tracing into a single pane of glass. Detect anomalies in real-time, monitor server health, and troubleshoot microservices at the speed of light.
//         </p>

//         <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
//           <Link to="/signup">
//             <Button size="lg" className="w-full sm:w-auto font-bold tracking-wide">
//               Start Free Trial <ArrowRight className="w-4 h-4 ml-2" />
//             </Button>
//           </Link>
//           <Link to="/docs">
//             <Button variant="secondary" size="lg" className="w-full sm:w-auto group">
//               <Terminal className="w-4 h-4 mr-2 group-hover:text-primary transition-colors" /> Read the SDK Docs
//             </Button>
//           </Link>
//         </div>
//       </section>

//       {/* Trust & Features Section */}
//       <section id="features" className="w-full bg-surface-active py-24 border-y border-border">
//         <div className="max-w-7xl mx-auto px-6">
//           <div className="text-center mb-16">
//             <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">Deep Telemetry. Zero Friction.</h2>
//             <p className="text-text-secondary max-w-2xl mx-auto">
//               Built on extreme performance architecture leveraging TimescaleDB and Kafka to handle massive ingestion rates without breaking a sweat.
//             </p>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
//             <Card className="bg-background border-border hover:border-primary/50 transition-colors duration-300">
//               <CardContent className="pt-6">
//                 <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6">
//                   <Activity className="w-6 h-6 text-primary" />
//                 </div>
//                 <h3 className="text-xl font-bold text-text-primary mb-2">Time-Series Metrics</h3>
//                 <p className="text-text-secondary text-sm">
//                   Track CPU, resident memory, and network throughput across your entire fleet. Build completely custom dashboards securely.
//                 </p>
//               </CardContent>
//             </Card>

//             <Card className="bg-background border-border hover:border-secondary/50 transition-colors duration-300">
//               <CardContent className="pt-6">
//                 <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-6">
//                   <Terminal className="w-6 h-6 text-secondary" />
//                 </div>
//                 <h3 className="text-xl font-bold text-text-primary mb-2">Real-Time Streaming Logs</h3>
//                 <p className="text-text-secondary text-sm">
//                   WebSocket powered log tailing straight from the edge. Filter by info, warning, and fatal errors instantly from the terminal view.
//                 </p>
//               </CardContent>
//             </Card>

//             <Card className="bg-background border-border hover:border-[#F59E0B]/50 transition-colors duration-300">
//               <CardContent className="pt-6">
//                 <div className="w-12 h-12 rounded-lg bg-accent-warning/10 flex items-center justify-center mb-6">
//                   <BarChart2 className="w-6 h-6 text-accent-warning" />
//                 </div>
//                 <h3 className="text-xl font-bold text-text-primary mb-2">Distributed Tracing</h3>
//                 <p className="text-text-secondary text-sm">
//                   Understand exactly where performance bottlenecks lie by tracing requests across distributed microservice gaps via Span Trees.
//                 </p>
//               </CardContent>
//             </Card>
//           </div>
//         </div>
//       </section>

//       {/* Docs / NPM Setup Mini View */}
//       <section id="docs" className="w-full max-w-5xl mx-auto px-6 py-24">
//         <div className="flex flex-col md:flex-row items-center gap-12 bg-surface border border-border rounded-2xl p-8 relative overflow-hidden">
//           {/* Subtle glow */}
//           <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-secondary/20 blur-[80px] rounded-full pointer-events-none"></div>

//           <div className="w-full md:w-1/2 z-10">
//             <h2 className="text-3xl font-bold text-text-primary mb-4">Install the SDK in seconds.</h2>
//             <p className="text-text-secondary mb-6">
//               Our official NPM package intercepts Node.js events automatically, providing seamless out-of-the-box telemetry without complex boilerplates.
//             </p>
//             <div className="flex items-center space-x-4">
//               <a href="#" className="text-secondary hover:text-white transition-colors flex items-center font-medium">
//                 View NPM Package <ArrowRight className="w-4 h-4 ml-1" />
//               </a>
//             </div>
//           </div>
          
//           <div className="w-full md:w-1/2 z-10">
//             <div className="bg-[#050510] rounded-xl border border-border-light p-4 font-mono text-sm shadow-glass">
//               <div className="flex items-center space-x-2 border-b border-border-light pb-2 mb-4">
//                 <div className="w-3 h-3 rounded-full bg-[#FF5F56]"></div>
//                 <div className="w-3 h-3 rounded-full bg-[#FFBD2E]"></div>
//                 <div className="w-3 h-3 rounded-full bg-[#27C93F]"></div>
//               </div>
//               <p className="text-text-muted mb-2">// 1. Install via npm</p>
//               <p className="text-primary-glow mb-4"><span className="text-accent-success">$</span> npm install @luminatrace/sdk</p>
              
//               <p className="text-text-muted mb-2">// 2. Initialize in app.js</p>
//               <p className="text-text-secondary">
//                 <span className="text-primary">import</span> LuminaTrace <span className="text-primary">from</span> <span className="text-secondary">'@luminatrace/sdk'</span>;
//               </p>
//               <p className="text-text-secondary mt-2">
//                 LuminaTrace.<span className="text-secondary">init</span>({'{'} <br/>
//                 &nbsp;&nbsp;projectId: <span className="text-secondary">'YOUR_PROJECT_KEY'</span><br/>
//                 {'}'});
//               </p>
//             </div>
//           </div>
//         </div>
//       </section>
//       {/* End of Landing Page */}
//     </div>
//   );
// };

// export default LandingPage;
import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Terminal, Activity, Bell,
  Server, GitBranch, Shield, Clock, Check,
  Zap, Eye, AlertCircle
} from 'lucide-react';
import Button from '../../components/ui/Button';

/* ─────────────────────────────────────────────────────────────────
   ANIMATED STAR FIELD  (canvas — purely decorative, hero only)
───────────────────────────────────────────────────────────────── */
const StarField = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animFrame;

    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Generate stars once
    const STAR_COUNT = 120;
    const stars = Array.from({ length: STAR_COUNT }, () => ({
      x:       Math.random(),
      y:       Math.random(),
      r:       Math.random() * 1.2 + 0.3,
      opacity: Math.random() * 0.5 + 0.1,
      speed:   Math.random() * 0.0003 + 0.0001,
      phase:   Math.random() * Math.PI * 2,
    }));

    // A handful of larger "trace" lines — suggest distributed spans
    const LINES = Array.from({ length: 6 }, (_, i) => ({
      x1: Math.random() * 0.6 + 0.1,
      y1: 0.2 + i * 0.12,
      len: Math.random() * 0.2 + 0.05,
      opacity: Math.random() * 0.12 + 0.04,
      color: i % 2 === 0 ? '124,58,237' : '0,229,255',
    }));

    let t = 0;
    const draw = () => {
      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      // Stars
      stars.forEach(s => {
        const pulse = Math.sin(t * s.speed * 1000 + s.phase) * 0.3 + 0.7;
        ctx.beginPath();
        ctx.arc(s.x * W, s.y * H, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(248,250,252,${s.opacity * pulse})`;
        ctx.fill();
      });

      // Trace lines
      LINES.forEach(l => {
        const pulse = Math.sin(t * 0.8 + l.x1 * 10) * 0.5 + 0.5;
        ctx.beginPath();
        ctx.moveTo(l.x1 * W, l.y1 * H);
        ctx.lineTo((l.x1 + l.len) * W, l.y1 * H);
        ctx.strokeStyle = `rgba(${l.color},${l.opacity * pulse})`;
        ctx.lineWidth = 1;
        ctx.stroke();

        // End dot
        ctx.beginPath();
        ctx.arc((l.x1 + l.len) * W, l.y1 * H, 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${l.color},${(l.opacity + 0.1) * pulse})`;
        ctx.fill();
      });

      t += 0.016;
      animFrame = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animFrame);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      aria-hidden="true"
    />
  );
};

/* ─────────────────────────────────────────────────────────────────
   ANIMATED TERMINAL  (fake log stream in the hero)
───────────────────────────────────────────────────────────────── */
const LOG_LINES = [
  { level: 'INFO',  msg: 'GET /api/orders/291 → 200  48ms',    color: 'text-text-muted'    },
  { level: 'INFO',  msg: 'POST /auth/login → 200  112ms',       color: 'text-text-muted'    },
  { level: 'WARN',  msg: 'DB connection pool at 81% capacity',  color: 'text-accent-warning'},
  { level: 'INFO',  msg: 'Span flushed · traceId=a3f7c1',       color: 'text-text-muted'    },
  { level: 'ERROR', msg: 'Payment timeout · orderId=8821',      color: 'text-log-error'     },
  { level: 'INFO',  msg: 'GET /api/users/1 → 200  31ms',        color: 'text-text-muted'    },
  { level: 'INFO',  msg: 'Alert resolved · cpu_usage < 80%',    color: 'text-accent-success'},
];

const LEVEL_CLS = {
  INFO:  'text-log-info',
  WARN:  'text-log-warning',
  ERROR: 'text-log-error',
};

const LiveTerminal = () => {
  const [visible, setVisible] = useState([LOG_LINES[0]]);
  const idx = useRef(1);

  useEffect(() => {
    const tick = setInterval(() => {
      const line = LOG_LINES[idx.current];
      if (line) {
        setVisible(v => [...v, line]);
        idx.current++;
      }
      if (idx.current >= LOG_LINES.length) {
        // Reset cycle: start from index 1 next time (LOG_LINES[0] is already shown)
        idx.current = 1;
        setVisible([LOG_LINES[0]]);
      }
    }, 900);
    return () => clearInterval(tick);
  }, []);

  return (
    <div className="bg-[#0D1117] border border-border rounded-card overflow-hidden shadow-elevated font-mono text-xs">
      {/* Chrome bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-surface border-b border-border">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-primary" />
          <span className="text-[10px] text-text-muted">live terminal</span>
          <span className="inline-flex items-center gap-1 text-[9px] font-mono text-accent-success bg-accent-success/10 border border-accent-success/20 rounded px-1.5 py-px">
            <span className="w-1 h-1 rounded-full bg-accent-success animate-pulse" />
            live
          </span>
        </div>
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-accent-error/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-accent-warning/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-accent-success/60" />
        </div>
      </div>
      {/* Log lines */}
      <div className="p-4 flex flex-col gap-1.5 min-h-[160px]">
        {visible.filter(Boolean).map((line, i) => (
          <div key={i} className="flex items-baseline gap-2.5 animate-[fadeIn_.3s_ease]">
            <span className="text-text-muted/40 w-14 shrink-0 text-[10px]">
              {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
            <span className={`w-10 shrink-0 font-semibold text-[9px] uppercase ${LEVEL_CLS[line.level] ?? 'text-text-muted'}`}>
              {line.level}
            </span>
            <span className={`text-[11px] ${line.color}`}>{line.msg}</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5 mt-1 opacity-30">
          <span className="inline-block w-1.5 h-3 bg-primary animate-pulse rounded-sm" />
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────
   FEATURE CARD
───────────────────────────────────────────────────────────────── */
const FeatureCard = ({ icon: Icon, color, title, description, items }) => (
  <div className="bg-surface border border-border rounded-card p-6 flex flex-col gap-4 group transition-all duration-base hover:border-border-light hover:shadow-elevated relative overflow-hidden">
    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color.bg}`}>
      <Icon className={`w-5 h-5 ${color.icon}`} />
    </div>
    <div>
      <h3 className="text-sm font-semibold text-text-primary mb-2">{title}</h3>
      <p className="text-sm text-text-muted leading-relaxed">{description}</p>
    </div>
    {items && (
      <ul className="flex flex-col gap-1.5 mt-auto">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-2 text-xs text-text-secondary">
            <Check className="w-3 h-3 text-accent-success shrink-0" />
            {item}
          </li>
        ))}
      </ul>
    )}
    {/* Corner glow */}
    <div className={`absolute -bottom-6 -right-6 w-24 h-24 rounded-full blur-2xl opacity-0 group-hover:opacity-15 transition-opacity duration-slow pointer-events-none ${color.glow}`} />
  </div>
);

/* ─────────────────────────────────────────────────────────────────
   HOW IT WORKS STEP
───────────────────────────────────────────────────────────────── */
const Step = ({ number, title, description, last }) => (
  <div className="flex gap-5">
    <div className="flex flex-col items-center">
      <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center shrink-0">
        <span className="text-xs font-mono font-semibold text-primary">{number}</span>
      </div>
      {!last && <div className="w-px flex-1 bg-border mt-2" />}
    </div>
    <div className="pb-8">
      <p className="text-sm font-semibold text-text-primary mb-1">{title}</p>
      <p className="text-sm text-text-muted leading-relaxed">{description}</p>
    </div>
  </div>
);

/* ─────────────────────────────────────────────────────────────────
   FEATURES DATA
───────────────────────────────────────────────────────────────── */
const FEATURES = [
  {
    icon: Terminal,
    color: { bg: 'bg-primary/10', icon: 'text-primary', glow: 'bg-primary' },
    title: 'Real-time log streaming',
    description: 'Every log your service writes appears in the dashboard the moment it happens. Filter by severity, search by trace ID, and drill into full metadata — no refresh needed.',
    items: ['INFO, WARN, ERROR, DEBUG levels', 'Full metadata inspection', 'Search by message or trace ID'],
  },
  {
    icon: Activity,
    color: { bg: 'bg-secondary/10', icon: 'text-secondary', glow: 'bg-secondary' },
    title: 'Metrics & performance charts',
    description: 'Track CPU, memory, response time, throughput, and error rate for every server in your fleet. Charts update live and let you zoom into any time window.',
    items: ['CPU & memory per server', 'P99 latency & error rate', 'Custom time windows: 15m → 7d'],
  },
  {
    icon: GitBranch,
    color: { bg: 'bg-accent-warning/10', icon: 'text-accent-warning', glow: 'bg-accent-warning' },
    title: 'Distributed tracing',
    description: 'Follow a single request across every service it touches. The waterfall view shows you exactly where time is spent — so you can fix the right thing.',
    items: ['Request waterfall visualization', 'Parent-child span hierarchy', 'Click any log to view its trace'],
  },
  {
    icon: Bell,
    color: { bg: 'bg-accent-error/10', icon: 'text-accent-error', glow: 'bg-accent-error' },
    title: 'Threshold alerts',
    description: 'Set a limit on any metric and get an email the moment it\'s crossed. Alerts resolve automatically when the metric recovers — no manual work.',
    items: ['Email notifications', 'Per-server or fleet-wide rules', 'Automatic resolution'],
  },
  {
    icon: Eye,
    color: { bg: 'bg-accent-success/10', icon: 'text-accent-success', glow: 'bg-accent-success' },
    title: 'Uptime monitoring',
    description: 'Add any public URL and LuminaTrace checks it continuously. You\'ll know about downtime within seconds — not from a user complaint.',
    items: ['Configurable check intervals', 'Response time tracking', 'Incident history & duration'],
  },
  {
    icon: Server,
    color: { bg: 'bg-log-debugSubtle', icon: 'text-log-debug', glow: 'bg-log-debug' },
    title: 'Server health',
    description: 'Every server running the SDK registers itself automatically. See live status, CPU load, and memory at a glance across your entire fleet.',
    items: ['Auto-registration on first run', 'Online / offline status', 'Per-server metric breakdown'],
  },
];

/* ─────────────────────────────────────────────────────────────────
   LANDING PAGE
───────────────────────────────────────────────────────────────── */
const LandingPage = () => {
  return (
    <div className="flex flex-col items-center w-full overflow-x-hidden">

      {/* ── HERO ──────────────────────────────────────────────── */}
      <section className="relative w-full min-h-[92vh] flex flex-col items-center justify-center text-center px-6 py-28 overflow-hidden">

        {/* Star field canvas */}
        <StarField />

        {/* Primary violet glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-primary/15 blur-[140px] rounded-full pointer-events-none" />
        {/* Secondary cyan glow */}
        <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] bg-secondary/8 blur-[100px] rounded-full pointer-events-none" />

        {/* Announcement pill */}
        <div className="relative z-10 inline-flex items-center gap-2 px-3 py-1.5 rounded-pill bg-surface border border-border-light text-sm font-medium text-secondary mb-8">
          <Zap className="w-3.5 h-3.5" />
          Node.js SDK — available now
          <ArrowRight className="w-3.5 h-3.5 opacity-60" />
        </div>

        {/* Headline */}
        <h1 className="relative z-10 text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight text-text-primary max-w-4xl mb-6 leading-[1.1]">
          See everything happening
          <br className="hidden md:block" />
          <span className="bg-gradient-to-r from-primary via-primary to-secondary bg-clip-text text-transparent">
            {' '}inside your services
          </span>
        </h1>

        {/* Subheadline */}
        <p className="relative z-10 text-lg md:text-xl text-text-secondary max-w-xl mb-10 leading-relaxed">
          LuminaTrace gives you logs, metrics, traces, and alerts
          for your Node.js services — in one place, updating live.
        </p>

        {/* CTAs */}
        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-4 mb-20">
          <Link to="/signup">
            <Button size="lg" className="font-medium">
              Get started free
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          <Link to="/docs">
            <Button variant="secondary" size="lg" className="font-medium">
              <Terminal className="w-4 h-4 mr-2" />
              Read the docs
            </Button>
          </Link>
        </div>

        {/* Live terminal preview */}
        <div className="relative z-10 w-full max-w-2xl">
          <LiveTerminal />
        </div>

      </section>

      {/* ── SOCIAL PROOF STRIP ────────────────────────────────── */}
      <div className="w-full border-y border-border bg-surface/50 py-5">
        <div className="max-w-5xl mx-auto px-6 flex flex-wrap items-center justify-center gap-8 text-xs font-mono text-text-muted">
          {[
            { icon: Shield,      label: 'End-to-end encrypted'       },
            { icon: Clock,       label: 'Sub-second log delivery'    },
            { icon: AlertCircle, label: 'Alerts in under 30 seconds' },
            { icon: Server,      label: 'Auto server registration'   },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2">
              <Icon className="w-3.5 h-3.5 text-primary/60" />
              {label}
            </div>
          ))}
        </div>
      </div>

      {/* ── FEATURES ──────────────────────────────────────────── */}
      <section className="w-full max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <p className="text-[10px] font-mono uppercase tracking-widest text-primary mb-3">
            What's included
          </p>
          <h2 className="text-3xl md:text-4xl font-semibold text-text-primary tracking-tight mb-4">
            Everything you need to understand your system
          </h2>
          <p className="text-text-muted max-w-xl mx-auto text-base leading-relaxed">
            Six tools, one dashboard. No configuration beyond adding the SDK to your app.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map(f => <FeatureCard key={f.title} {...f} />)}
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────── */}
      <section className="w-full bg-surface border-y border-border py-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">

            {/* Left: steps */}
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-primary mb-3">
                How it works
              </p>
              <h2 className="text-3xl font-semibold text-text-primary tracking-tight mb-10">
                Up and running in minutes
              </h2>
              <Step number="1" title="Install the SDK"
                description="Add the LuminaTrace package to your Node.js project with a single npm install." />
              <Step number="2" title="Add one line to your app"
                description="Initialize the SDK with your project API key. For Express apps, one middleware line instruments every request automatically." />
              <Step number="3" title="Open the dashboard"
                description="Your logs, metrics, and server health start appearing immediately. No extra setup, no YAML files, no agents to manage." />
              <Step number="4" last title="Set up alerts"
                description="Define thresholds on any metric and get notified by email the moment something needs your attention." />
            </div>

            {/* Right: code snippet */}
            <div className="sticky top-24">
              <div className="bg-[#0D1117] border border-border rounded-card overflow-hidden font-mono text-sm shadow-elevated">
                {/* Chrome */}
                <div className="flex items-center gap-1.5 px-4 py-3 border-b border-border bg-surface">
                  <div className="w-2.5 h-2.5 rounded-full bg-accent-error/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-accent-warning/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-accent-success/60" />
                  <span className="ml-3 text-[10px] text-text-muted">app.js</span>
                </div>
                {/* Code */}
                <div className="p-5 flex flex-col gap-1 text-[12px] leading-[1.8]">
                  <p className="text-text-muted">{'// 1. Install'}</p>
                  <p><span className="text-accent-success">$</span> <span className="text-text-secondary">npm install luminatrace</span></p>
                  <p className="mt-3 text-text-muted">{'// 2. Initialize'}</p>
                  <p>
                    <span className="text-primary">import</span>
                    <span className="text-text-primary"> LuminaTrace </span>
                    <span className="text-primary">from</span>
                    <span className="text-secondary"> 'luminatrace'</span>
                    <span className="text-text-primary">;</span>
                  </p>
                  <p className="mt-2">
                    <span className="text-text-primary">const lumina = </span>
                    <span className="text-accent-warning">new</span>
                    <span className="text-text-primary"> LuminaTrace({'{'}</span>
                  </p>
                  <p className="pl-5">
                    <span className="text-text-secondary">apiKey: </span>
                    <span className="text-secondary">'lt_your_key'</span>
                    <span className="text-text-muted">,</span>
                  </p>
                  <p><span className="text-text-primary">{'}'});</span></p>
                  <p className="mt-3 text-text-muted">{'// 3. Auto-instrument Express'}</p>
                  <p>
                    <span className="text-text-primary">app.</span>
                    <span className="text-accent-warning">use</span>
                    <span className="text-text-primary">(lumina.</span>
                    <span className="text-secondary">middleware</span>
                    <span className="text-text-primary">());</span>
                  </p>
                  <p className="mt-3 text-text-muted">{'// Done. Logs & metrics appear in your dashboard.'}</p>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <Link
                  to="/docs"
                  className="text-sm text-primary hover:text-primary-hover font-medium flex items-center gap-1 transition-colors duration-fast"
                >
                  Full documentation <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────────── */}
      <section className="w-full max-w-7xl mx-auto px-6 py-28">
        <div className="relative rounded-card border border-border bg-surface p-14 text-center overflow-hidden">
          {/* Background glows */}
          <div className="absolute top-0 left-1/4 w-80 h-40 bg-primary/10 blur-[80px] rounded-full pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-80 h-40 bg-secondary/8 blur-[80px] rounded-full pointer-events-none" />

          <div className="relative z-10">
            <p className="text-[10px] font-mono uppercase tracking-widest text-primary mb-4">
              Open source · free to use
            </p>
            <h2 className="text-3xl md:text-4xl font-semibold text-text-primary tracking-tight mb-4">
              Start monitoring your services today
            </h2>
            <p className="text-text-muted text-base max-w-md mx-auto mb-10 leading-relaxed">
              Create a free account, add the SDK to your Node.js app,
              and see your first logs in under five minutes.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/signup">
                <Button size="lg" className="font-medium">
                  Create free account
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link to="/docs">
                <Button variant="ghost" size="lg" className="font-medium">
                  Read the docs
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default LandingPage;