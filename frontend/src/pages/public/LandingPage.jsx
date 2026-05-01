import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, Terminal, Shield, Zap, ArrowRight, BarChart2, Check } from 'lucide-react';
import Button from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';

const LandingPage = () => {
  return (
    <div className="flex flex-col items-center w-full">
      {/* Hero Section */}
      <section className="relative w-full max-w-7xl mx-auto px-6 pt-20 pb-32 flex flex-col items-center text-center">
        {/* Decorative ambient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-primary/20 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="inline-flex items-center px-3 py-1 rounded-full bg-surface border border-border-light text-secondary text-sm font-medium mb-8">
          <Zap className="w-4 h-4 mr-2" />
          LuminaTrace SDK is now live.
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-text-primary max-w-4xl mb-6">
          The Cosmic Observer for <br className="hidden md:block"/>
          <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Distributed Systems
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-text-secondary max-w-2xl mb-10">
          Unify your logs, metrics, and tracing into a single pane of glass. Detect anomalies in real-time, monitor server health, and troubleshoot microservices at the speed of light.
        </p>

        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <Link to="/signup">
            <Button size="lg" className="w-full sm:w-auto font-bold tracking-wide">
              Start Free Trial <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          <Link to="/docs">
            <Button variant="secondary" size="lg" className="w-full sm:w-auto group">
              <Terminal className="w-4 h-4 mr-2 group-hover:text-primary transition-colors" /> Read the SDK Docs
            </Button>
          </Link>
        </div>
      </section>

      {/* Trust & Features Section */}
      <section id="features" className="w-full bg-surface-active py-24 border-y border-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">Deep Telemetry. Zero Friction.</h2>
            <p className="text-text-secondary max-w-2xl mx-auto">
              Built on extreme performance architecture leveraging TimescaleDB and Kafka to handle massive ingestion rates without breaking a sweat.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-background border-border hover:border-primary/50 transition-colors duration-300">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6">
                  <Activity className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-text-primary mb-2">Time-Series Metrics</h3>
                <p className="text-text-secondary text-sm">
                  Track CPU, resident memory, and network throughput across your entire fleet. Build completely custom dashboards securely.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-background border-border hover:border-secondary/50 transition-colors duration-300">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-6">
                  <Terminal className="w-6 h-6 text-secondary" />
                </div>
                <h3 className="text-xl font-bold text-text-primary mb-2">Real-Time Streaming Logs</h3>
                <p className="text-text-secondary text-sm">
                  WebSocket powered log tailing straight from the edge. Filter by info, warning, and fatal errors instantly from the terminal view.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-background border-border hover:border-[#F59E0B]/50 transition-colors duration-300">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-lg bg-accent-warning/10 flex items-center justify-center mb-6">
                  <BarChart2 className="w-6 h-6 text-accent-warning" />
                </div>
                <h3 className="text-xl font-bold text-text-primary mb-2">Distributed Tracing</h3>
                <p className="text-text-secondary text-sm">
                  Understand exactly where performance bottlenecks lie by tracing requests across distributed microservice gaps via Span Trees.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Docs / NPM Setup Mini View */}
      <section id="docs" className="w-full max-w-5xl mx-auto px-6 py-24">
        <div className="flex flex-col md:flex-row items-center gap-12 bg-surface border border-border rounded-2xl p-8 relative overflow-hidden">
          {/* Subtle glow */}
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-secondary/20 blur-[80px] rounded-full pointer-events-none"></div>

          <div className="w-full md:w-1/2 z-10">
            <h2 className="text-3xl font-bold text-text-primary mb-4">Install the SDK in seconds.</h2>
            <p className="text-text-secondary mb-6">
              Our official NPM package intercepts Node.js events automatically, providing seamless out-of-the-box telemetry without complex boilerplates.
            </p>
            <div className="flex items-center space-x-4">
              <a href="#" className="text-secondary hover:text-white transition-colors flex items-center font-medium">
                View NPM Package <ArrowRight className="w-4 h-4 ml-1" />
              </a>
            </div>
          </div>
          
          <div className="w-full md:w-1/2 z-10">
            <div className="bg-[#050510] rounded-xl border border-border-light p-4 font-mono text-sm shadow-glass">
              <div className="flex items-center space-x-2 border-b border-border-light pb-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-[#FF5F56]"></div>
                <div className="w-3 h-3 rounded-full bg-[#FFBD2E]"></div>
                <div className="w-3 h-3 rounded-full bg-[#27C93F]"></div>
              </div>
              <p className="text-text-muted mb-2">// 1. Install via npm</p>
              <p className="text-primary-glow mb-4"><span className="text-accent-success">$</span> npm install @luminatrace/sdk</p>
              
              <p className="text-text-muted mb-2">// 2. Initialize in app.js</p>
              <p className="text-text-secondary">
                <span className="text-primary">import</span> LuminaTrace <span className="text-primary">from</span> <span className="text-secondary">'@luminatrace/sdk'</span>;
              </p>
              <p className="text-text-secondary mt-2">
                LuminaTrace.<span className="text-secondary">init</span>({'{'} <br/>
                &nbsp;&nbsp;projectId: <span className="text-secondary">'YOUR_PROJECT_KEY'</span><br/>
                {'}'});
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* End of Landing Page */}
    </div>
  );
};

export default LandingPage;
