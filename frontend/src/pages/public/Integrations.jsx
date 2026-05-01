import React from 'react';
import { Terminal, Server, Hexagon } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Link } from 'react-router-dom';

const Integrations = () => {
  const integrations = [
    { name: 'Node.js', description: 'Native bindings and process metrics for Node environments.', icon: <Hexagon className="w-8 h-8 text-[#339933]" />, docLink: '/docs#installation' },
    { name: 'Express', description: 'Zero-config middleware for automatic routing tracing and request logs.', icon: <Server className="w-8 h-8 text-text-primary" />, docLink: '/docs#express' }
  ];

  return (
    <div className="flex flex-col items-center w-full pb-24">
      {/* Header */}
      <section className="w-full max-w-7xl mx-auto px-6 pt-20 pb-16 text-center">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-text-primary mb-6">
          Connect Your Entire Stack
        </h1>
        <p className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto">
          LuminaTrace currently supports full-stack Node.js environments. Ingest your data in minutes using our official SDK.
        </p>
      </section>

      {/* Grid */}
      <section className="w-full max-w-4xl mx-auto px-6 mb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {integrations.map((item, idx) => (
            <Card key={idx} className="bg-surface border-border hover:border-primary/50 transition-colors group h-full">
              <CardContent className="p-8 flex flex-col h-full">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-16 h-16 rounded-xl bg-background border border-border flex items-center justify-center group-hover:scale-105 transition-transform">
                    {item.icon}
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-text-primary mb-3">{item.name}</h3>
                <p className="text-text-secondary flex-grow mb-6">
                  {item.description}
                </p>
                <div className="pt-4 border-t border-border mt-auto">
                  <Link to={item.docLink} className="text-sm font-medium text-primary hover:text-secondary transition-colors flex items-center">
                    View Documentation <Terminal className="w-4 h-4 ml-2" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
      
      {/* CTA */}
      <section className="w-full max-w-4xl mx-auto px-6 mt-8">
        <div className="text-center bg-surface-active rounded-2xl border border-border p-12">
          <h3 className="text-2xl font-bold text-text-primary mb-4">Don't see your framework?</h3>
          <p className="text-text-secondary mb-8">
            You can use our HTTP ingest API to send logs and metrics from any language or environment.
          </p>
          <Link to="/docs">
            <Button variant="primary">Read the API Reference</Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Integrations;
