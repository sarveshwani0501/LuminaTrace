import React from 'react';
import { Link } from 'react-router-dom';
import { Check, HelpCircle } from 'lucide-react';
import Button from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';

const Pricing = () => {
  const faqs = [
    {
      question: "What counts as an event?",
      answer: "An event is any single log line, metric data point, or trace span sent to LuminaTrace. For example, a single HTTP request might generate 1 log line and 3 spans, which counts as 4 events."
    },
    {
      question: "Can I upgrade or downgrade at any time?",
      answer: "Yes, you can change your plan at any time. Prorated charges or credits will automatically be applied to your account."
    },
    {
      question: "What happens if I exceed my monthly event limit?",
      answer: "On the Developer plan, events beyond the limit are dropped. On the Pro plan, you will be charged a standard overage rate per additional million events."
    },
    {
      question: "Is there a self-hosted option?",
      answer: "Currently, LuminaTrace is offered exclusively as a managed cloud service. However, Enterprise customers have options for dedicated single-tenant clusters."
    }
  ];

  return (
    <div className="flex flex-col items-center w-full pb-24">
      {/* Header */}
      <section className="w-full max-w-7xl mx-auto px-6 pt-20 pb-16 text-center">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-text-primary mb-6">
          Transparent Pricing for Every Scale
        </h1>
        <p className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto">
          Start for free, upgrade when you need massive throughput. No hidden fees.
        </p>
      </section>

      {/* Pricing Cards */}
      <section className="w-full max-w-5xl mx-auto px-6 mb-24 pt-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Developer Tier */}
          <Card className="bg-background border-border hover:border-border-light transition-colors duration-300">
            <CardContent className="p-8">
              <h3 className="text-xl font-bold text-text-primary mb-2">Developer</h3>
              <div className="flex items-baseline mb-6">
                <span className="text-4xl font-extrabold text-text-primary">$0</span>
                <span className="text-text-secondary ml-2">/ month</span>
              </div>
              <p className="text-text-secondary text-sm mb-8">Perfect for side projects and local testing.</p>
              <ul className="space-y-4 mb-8">
                {['100k events / month', '3 days retention', 'Community support', 'Core integrations'].map((feature, i) => (
                  <li key={i} className="flex items-center text-sm text-text-primary">
                    <Check className="w-4 h-4 text-primary mr-3 shrink-0" /> {feature}
                  </li>
                ))}
              </ul>
              <Link to="/signup" className="block">
                <Button variant="secondary" className="w-full">Get Started</Button>
              </Link>
            </CardContent>
          </Card>

          {/* Pro Tier */}
          <Card className="bg-surface border-primary shadow-[0_0_30px_rgba(129,140,248,0.15)] relative transform md:-translate-y-4">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-white text-xs font-bold uppercase tracking-wider py-1 px-3 rounded-full">
              Most Popular
            </div>
            <CardContent className="p-8">
              <h3 className="text-xl font-bold text-text-primary mb-2">Pro</h3>
              <div className="flex items-baseline mb-6">
                <span className="text-4xl font-extrabold text-text-primary">$49</span>
                <span className="text-text-secondary ml-2">/ month</span>
              </div>
              <p className="text-text-secondary text-sm mb-8">For growing startups with real production traffic.</p>
              <ul className="space-y-4 mb-8">
                {['50M events / month', '14 days retention', 'Priority email support', 'Advanced alerts'].map((feature, i) => (
                  <li key={i} className="flex items-center text-sm text-text-primary">
                    <Check className="w-4 h-4 text-primary mr-3 shrink-0" /> {feature}
                  </li>
                ))}
              </ul>
              <Link to="/signup" className="block">
                <Button variant="primary" className="w-full">Start Free Trial</Button>
              </Link>
            </CardContent>
          </Card>

          {/* Enterprise Tier */}
          <Card className="bg-background border-border hover:border-border-light transition-colors duration-300">
            <CardContent className="p-8">
              <h3 className="text-xl font-bold text-text-primary mb-2">Enterprise</h3>
              <div className="flex items-baseline mb-6">
                <span className="text-4xl font-extrabold text-text-primary">Custom</span>
              </div>
              <p className="text-text-secondary text-sm mb-8">For massive scale requiring custom compliance.</p>
              <ul className="space-y-4 mb-8">
                {['Unlimited events', 'Custom retention', '24/7 Phone Support', 'Dedicated SLA'].map((feature, i) => (
                  <li key={i} className="flex items-center text-sm text-text-primary">
                    <Check className="w-4 h-4 text-primary mr-3 shrink-0" /> {feature}
                  </li>
                ))}
              </ul>
              <a href="mailto:sales@luminatrace.com" className="block">
                <Button variant="ghost" className="w-full border border-border">Contact Sales</Button>
              </a>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="w-full max-w-4xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-text-primary">Frequently Asked Questions</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {faqs.map((faq, idx) => (
            <div key={idx} className="bg-surface border border-border rounded-xl p-6">
              <h4 className="flex items-start text-lg font-bold text-text-primary mb-3">
                <HelpCircle className="w-5 h-5 text-primary mr-3 shrink-0 mt-0.5" />
                {faq.question}
              </h4>
              <p className="text-text-secondary text-sm leading-relaxed pl-8">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Pricing;
