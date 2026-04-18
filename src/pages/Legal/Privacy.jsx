import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase/client';

const STATIC_FALLBACK = `
<p>Starstreak Ltd ("we", "us", "our") is committed to building a secure, modern, and trustworthy digital ecosystem. This Privacy Policy explains how we collect, use, and protect your information across our products, including Nexora and Trustia.</p>
<p>By using our services you agree to the terms in this policy. If you do not agree, please discontinue use.</p>

<h2>1. Information We Collect</h2>
<p>We collect information to deliver personalized, secure, and seamless experiences across our ecosystem.</p>
<h3>1.1 Information You Provide</h3>
<ul>
  <li>Account details (name, email, profile info)</li>
  <li>Identity verification data (for Trustia)</li>
  <li>Preferences and settings</li>
  <li>Messages, posts, and uploaded content</li>
  <li>Support requests and communications</li>
</ul>
<h3>1.2 Automatically Collected Data</h3>
<ul>
  <li>Device details and OS information</li>
  <li>IP address and log data</li>
  <li>Feature usage and interactions</li>
  <li>Error logs and performance analytics</li>
</ul>
<h3>1.3 Data From Third Parties</h3>
<ul>
  <li>Identity verification partners</li>
  <li>Analytics services</li>
  <li>Authentication integrations</li>
</ul>

<h2>2. How We Use Your Information</h2>
<ul>
  <li>Provide and improve services</li>
  <li>Personalization and recommendations</li>
  <li>Security, fraud detection, and safety</li>
  <li>Communication and support</li>
  <li>Regulatory and legal compliance</li>
</ul>
<p><strong>We do not sell your personal data.</strong></p>

<h2>3. Sharing &amp; Disclosure</h2>
<ul>
  <li>Service providers who help operate our platforms</li>
  <li>Where required by law or for safety reasons</li>
  <li>During business transfers (merger, acquisition)</li>
</ul>

<h2>4. Data Retention</h2>
<p>We retain personal information only as long as necessary. When data is no longer required, we securely delete or anonymize it.</p>

<h2>5. Security</h2>
<p>We use industry-standard safeguards to protect your data, but no system is infallible.</p>

<h2>6. Your Rights</h2>
<ul>
  <li>Access your data</li>
  <li>Request corrections or deletion</li>
  <li>Restrict certain processing</li>
  <li>Export your data where applicable</li>
</ul>
<p>Contact us at <a href="mailto:privacy@starstreak.org">privacy@starstreak.org</a></p>

<h2>7. Cookies &amp; Tracking</h2>
<p>We use cookies and similar tools for functionality, analytics, personalization, and fraud prevention.</p>

<h2>8. International Transfers</h2>
<p>As a Kenya-based platform with global reach, data may be processed outside your country. We use safeguards where required.</p>

<h2>9. Children</h2>
<p>Our services are not intended for children under 13 (or the minimum digital age in your region).</p>

<h2>10. Changes to This Policy</h2>
<p>We may update this policy periodically. Significant updates will be communicated through our platforms.</p>

<h2>11. Contact Us</h2>
<p>For privacy-related inquiries: <a href="mailto:privacy@starstreak.org">privacy@starstreak.org</a></p>
`;

export default function Privacy() {
  const [content, setContent] = useState('');
  const [updatedAt, setUpdatedAt] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const { data } = await supabase
          .from('legal_pages')
          .select('content, updated_at')
          .eq('type', 'privacy')
          .single();
        if (data?.content) {
          setContent(data.content);
          setUpdatedAt(data.updated_at);
        } else {
          setContent(STATIC_FALLBACK);
        }
      } catch {
        setContent(STATIC_FALLBACK);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, []);

  const displayDate = updatedAt
    ? new Date(updatedAt).toLocaleDateString()
    : new Date().toLocaleDateString();

  return (
    <div className="container-custom py-20 flex flex-col items-center">
      <header className="mb-12 text-center max-w-2xl">
        <h1 className="text-5xl md:text-6xl font-extrabold gradient-text mb-3">Privacy Policy</h1>
        <p className="text-sm md:text-base text-gray-400">Last updated: {displayDate}</p>
      </header>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500"></div>
        </div>
      ) : (
        <article
          className="max-w-2xl text-gray-300 prose prose-invert prose-headings:text-white prose-a:text-emerald-400 hover:prose-a:text-emerald-300 prose-strong:text-white w-full"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      )}
    </div>
  );
}
