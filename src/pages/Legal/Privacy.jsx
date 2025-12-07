import React from "react";

export default function Privacy() {
  const lastUpdated = new Date().toLocaleDateString();

  return (
    <div className="container-custom py-20 flex flex-col items-center">
      {/* Header */}
      <header className="mb-12 text-center max-w-2xl">
        <h1 className="text-5xl md:text-6xl font-extrabold gradient-text mb-3">
          Privacy Policy
        </h1>
        <p className="text-sm md:text-base text-gray-400">Last updated: {lastUpdated}</p>
      </header>

      {/* Article */}
      <article className="max-w-2xl text-center text-gray-300">

        <p className="text-base md:text-lg leading-relaxed mb-4">
          Starstreak (“we”, “us”, “our”) is committed to building a secure, modern, and
          trustworthy digital ecosystem. This Privacy Policy explains how we collect,
          use, and protect your information across our products, including Nexora and Trustia.
        </p>

        <p className="text-base md:text-lg leading-relaxed mb-6">
          By using our services you agree to the terms in this policy. If you do not agree,
          please discontinue use.
        </p>

        <h2 className="text-2xl md:text-3xl font-semibold mb-4">1. Information We Collect</h2>
        <p className="text-base md:text-lg leading-relaxed mb-6">
          We collect information to deliver personalized, secure, and seamless experiences across our ecosystem.
        </p>

        <h3 className="text-xl md:text-2xl font-medium mb-3">1.1 Information You Provide</h3>
        <div className="flex flex-col items-center space-y-2 mb-6">
          <div className="text-base md:text-lg">• Account details (name, email, profile info)</div>
          <div className="text-base md:text-lg">• Identity verification data (for Trustia)</div>
          <div className="text-base md:text-lg">• Preferences and settings</div>
          <div className="text-base md:text-lg">• Messages, posts, and uploaded content</div>
          <div className="text-base md:text-lg">• Support requests and communications</div>
        </div>

        <h3 className="text-xl md:text-2xl font-medium mb-3">1.2 Automatically Collected Data</h3>
        <div className="flex flex-col items-center space-y-2 mb-6">
          <div className="text-base md:text-lg">• Device details and OS information</div>
          <div className="text-base md:text-lg">• IP address and log data</div>
          <div className="text-base md:text-lg">• Feature usage and interactions</div>
          <div className="text-base md:text-lg">• Error logs and performance analytics</div>
        </div>

        <h3 className="text-xl md:text-2xl font-medium mb-3">1.3 Data From Third Parties</h3>
        <div className="flex flex-col items-center space-y-2 mb-6">
          <div className="text-base md:text-lg">• Identity verification partners</div>
          <div className="text-base md:text-lg">• Analytics services</div>
          <div className="text-base md:text-lg">• Authentication integrations</div>
        </div>

        <h2 className="text-2xl md:text-3xl font-semibold mb-4">2. How We Use Your Information</h2>
        <div className="flex flex-col items-center space-y-2 mb-6">
          <div className="text-base md:text-lg">• Provide and improve services</div>
          <div className="text-base md:text-lg">• Personalization and recommendations</div>
          <div className="text-base md:text-lg">• Security, fraud detection, and safety</div>
          <div className="text-base md:text-lg">• Communication and support</div>
          <div className="text-base md:text-lg">• Regulatory and legal compliance</div>
        </div>

        <p className="text-base md:text-lg font-medium mb-6"><strong>We do not sell your personal data.</strong></p>

        <h2 className="text-2xl md:text-3xl font-semibold mb-4">3. Sharing & Disclosure</h2>
        <div className="flex flex-col items-center space-y-2 mb-6">
          <div className="text-base md:text-lg">• Service providers who help operate our platforms</div>
          <div className="text-base md:text-lg">• Where required by law or for safety reasons</div>
          <div className="text-base md:text-lg">• During business transfers (merger, acquisition)</div>
        </div>

        <h2 className="text-2xl md:text-3xl font-semibold mb-4">4. Data Retention</h2>
        <p className="text-base md:text-lg leading-relaxed mb-6">
          We retain personal information only as long as necessary. When data is no longer required,
          we securely delete or anonymize it.
        </p>

        <h2 className="text-2xl md:text-3xl font-semibold mb-4">5. Security</h2>
        <p className="text-base md:text-lg leading-relaxed mb-6">
          We use industry-standard safeguards to protect your data, but no system is infallible.
        </p>

        <h2 className="text-2xl md:text-3xl font-semibold mb-4">6. Your Rights</h2>
        <div className="flex flex-col items-center space-y-2 mb-6">
          <div className="text-base md:text-lg">• Access your data</div>
          <div className="text-base md:text-lg">• Request corrections or deletion</div>
          <div className="text-base md:text-lg">• Restrict certain processing</div>
          <div className="text-base md:text-lg">• Export your data where applicable</div>
        </div>

        <p className="text-base md:text-lg mb-6">
          Contact us at
          <br />
          <a href="mailto:privacy@starstreak.com" className="text-emerald-400 hover:text-emerald-300">privacy@starstreak.com</a>
        </p>

        <h2 className="text-2xl md:text-3xl font-semibold mb-4">7. Cookies & Tracking</h2>
        <p className="text-base md:text-lg leading-relaxed mb-6">
          We use cookies and similar tools for functionality, analytics, personalization, and fraud prevention.
        </p>

        <h2 className="text-2xl md:text-3xl font-semibold mb-4">8. International Transfers</h2>
        <p className="text-base md:text-lg leading-relaxed mb-6">
          As a Kenya-based platform with global reach, data may be processed outside your country. We use safeguards where required.
        </p>

        <h2 className="text-2xl md:text-3xl font-semibold mb-4">9. Children</h2>
        <p className="text-base md:text-lg leading-relaxed mb-6">
          Our services are not intended for children under 13 (or the minimum digital age in your region).
        </p>

        <h2 className="text-2xl md:text-3xl font-semibold mb-4">10. Changes to This Policy</h2>
        <p className="text-base md:text-lg leading-relaxed mb-6">
          We may update this policy periodically. Significant updates will be communicated through our platforms.
        </p>

        <h2 className="text-2xl md:text-3xl font-semibold mb-4">11. Contact Us</h2>
        <p className="text-base md:text-lg mb-8">
          For privacy-related inquiries: <br />
          <a href="mailto:privacy@starstreak.com" className="text-emerald-400 hover:text-emerald-300">privacy@starstreak.com</a>
        </p>

        <div className="mt-8 p-4 rounded-lg bg-[#071025] border-l-4 border-emerald-600 text-center max-w-xl mx-auto">
          <strong className="block text-emerald-400">Legal Note</strong>
          <p className="mt-2 text-sm md:text-base text-gray-500">
            This is a high-quality template and should be reviewed by legal counsel for compliance with local and international laws.
          </p>
        </div>

      </article>
    </div>
  );
}
