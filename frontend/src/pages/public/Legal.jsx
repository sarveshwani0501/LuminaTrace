import React from 'react';

const Legal = ({ type }) => {
  const isPrivacy = type === 'privacy';
  const title = isPrivacy ? "Privacy Policy" : "Terms of Service";
  const date = "October 15, 2025"; // Placeholder date

  return (
    <div className="w-full max-w-4xl mx-auto px-6 py-20 min-h-[60vh]">
      <h1 className="text-4xl font-bold text-text-primary mb-4">{title}</h1>
      <p className="text-text-muted text-sm mb-12">Last Updated: {date}</p>

      <div className="text-text-secondary leading-relaxed space-y-6">
        <p>
          This is a placeholder {title.toLowerCase()} for LuminaTrace. In a production environment, this page would contain legally binding text outlining your rights, responsibilities, and how your data is processed.
        </p>

        {isPrivacy ? (
          <>
            <h2 className="text-2xl font-bold text-text-primary mt-10 mb-4">1. Information We Collect</h2>
            <p>
              When you use our services, we may collect information about your telemetry streams, server IP addresses, and account details. This helps us ensure the observability platform functions correctly.
            </p>
            
            <h2 className="text-2xl font-bold text-text-primary mt-10 mb-4">2. How We Use Your Information</h2>
            <p>
              We use your data solely to provide the LuminaTrace service, generate your dashboard metrics, and ensure platform security. We do not sell telemetry data to third parties.
            </p>

            <h2 className="text-2xl font-bold text-text-primary mt-10 mb-4">3. Data Retention</h2>
            <p>
              Your data is retained according to the terms of your pricing tier. Once the retention window expires, telemetry data is automatically permanently deleted from our TimescaleDB clusters.
            </p>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-text-primary mt-10 mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing or using the LuminaTrace platform, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, then you may not access the service.
            </p>
            
            <h2 className="text-2xl font-bold text-text-primary mt-10 mb-4">2. Service Level Agreement</h2>
            <p>
              We strive to provide 99.9% uptime. However, "Developer" tier accounts are provided as-is without any formal Service Level Agreement guarantees.
            </p>

            <h2 className="text-2xl font-bold text-text-primary mt-10 mb-4">3. Acceptable Use</h2>
            <p>
              You agree not to use the service to transmit malicious code, attempt to breach our infrastructure, or send telemetry data that intentionally exceeds your provisioned bandwidth to cause Denial of Service.
            </p>
          </>
        )}

        <h2 className="text-2xl font-bold text-text-primary mt-10 mb-4">Contact Us</h2>
        <p>
          If you have any questions about these terms, please contact our legal team at legal@luminatrace.com.
        </p>
      </div>
    </div>
  );
};

export default Legal;
