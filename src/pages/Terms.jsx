import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import RichContent from '../components/RichContent';
import { PageHero } from '../components/ui/Section';

export default function Terms() {
  const [dbContent, setDbContent] = useState(null);
  const [dbUpdatedAt, setDbUpdatedAt] = useState(null);
  const [loading, setLoading] = useState(true);
  const lastUpdated = 'March 22, 2026';

  useEffect(() => {
    supabase
      .from('platform_content')
      .select('content, updated_at')
      .eq('key', 'terms')
      .maybeSingle()
      .then(({ data }) => {
        if (data?.content?.trim()) {
          setDbContent(data.content);
          setDbUpdatedAt(data.updated_at);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-night-900 to-night-900">
        <div className="animate-pulse text-dust">Loading…</div>
      </div>
    );
  }

  const displayDate = dbUpdatedAt
    ? new Date(dbUpdatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : lastUpdated;

  return (
    <div className="min-h-screen">
      <PageHero eyebrow="Legal" title="Terms of Service" intro="These Terms of Service govern your use of Starstreak, operated by Hephix Ltd.">
        <p className="mt-6 text-sm text-dust">Last updated {displayDate}</p>
      </PageHero>
      <div className="container-ss py-16 md:py-20">

        {/* DB content — rich HTML or legacy plain text */}
        {dbContent ? (
          <article className="max-w-4xl mx-auto bg-night-800 rounded-xl shadow-sm border border-line p-8 md:p-12">
            <RichContent content={dbContent} />
          </article>
        ) : (
          <>
            {/* TOC */}
            <nav className="max-w-4xl mx-auto mb-10">
              <div className="bg-night-800 rounded-lg shadow-sm border border-line p-4">
                <h2 className="font-semibold mb-3 text-star">On this page</h2>
                <ul className="grid md:grid-cols-2 gap-2 text-sm text-brand">
                  {[
                    ['Acceptance of Terms', '#acceptance'],
                    ['Eligibility', '#eligibility'],
                    ['Accounts', '#accounts'],
                    ['User Content', '#user-content'],
                    ['Community Guidelines', '#community-guidelines'],
                    ['Prohibited Conduct', '#prohibited'],
                    ['Moderation & Enforcement', '#moderation'],
                    ['Intellectual Property', '#ip'],
                    ['Payments & Subscriptions', '#payments'],
                    ['Disclaimers', '#disclaimers'],
                    ['Limitation of Liability', '#limitation'],
                    ['Indemnification', '#indemnification'],
                    ['Termination', '#termination'],
                    ['Governing Law', '#governing'],
                    ['Changes', '#changes'],
                    ['Contact', '#contact'],
                  ].map(([label, href]) => (
                    <li key={href}><a href={href} className="hover:underline">{label}</a></li>
                  ))}
                </ul>
              </div>
            </nav>

            {/* Fallback static content */}
            <article className="prose prose-neutral max-w-4xl mx-auto">
              <section id="acceptance" className="mb-8">
                <h2>1. Acceptance of Terms</h2>
                <p>By accessing or using Starstreak (the "Service"), you agree to be bound by these Terms and our <Link to="/privacy" className="text-brand hover:underline">Privacy Policy</Link>, and any other applicable policies posted by us. If you do not agree to these Terms, do not use the Service.</p>
              </section>
              <section id="eligibility" className="mb-8">
                <h2>2. Eligibility</h2>
                <p>You must be at least 13 years of age to use Starstreak. Users aged 13–17 require parental or guardian consent. By using the Service, you represent and warrant that you meet the applicable age and eligibility requirements.</p>
              </section>
              <section id="accounts" className="mb-8">
                <h2>3. Accounts</h2>
                <p>To access certain features, you must create an account. You agree to provide accurate, current, and complete information during registration and to keep your account information up to date. You are responsible for maintaining the security of your account credentials and for all activity that occurs under your account.</p>
              </section>
              <section id="user-content" className="mb-8">
                <h2>4. User Content</h2>
                <p>"User Content" means any content you post, submit, or make available on the Service, including text, images, audio, video, and other materials. You retain ownership of your User Content, subject to the rights you grant to Starstreak below.</p>
                <p>By posting User Content, you grant Starstreak a worldwide, non-exclusive, royalty-free, transferable, sublicensable license to host, store, use, reproduce, modify, publish, publicly perform, display, and distribute such content on the Service and in connection with providing the Service.</p>
              </section>
              <section id="community-guidelines" className="mb-8">
                <h2>5. Community Guidelines</h2>
                <p>Starstreak is built around communities and conversations. You agree to follow our <Link to="/guidelines" className="text-brand hover:underline">Community Guidelines</Link>, which explain the types of content and behavior that are and are not allowed.</p>
              </section>
              <section id="prohibited" className="mb-8">
                <h2>6. Prohibited Conduct</h2>
                <p>Do not use the Service to:</p>
                <ul>
                  <li>Violate any laws or regulations.</li>
                  <li>Harass, threaten, or intimidate others.</li>
                  <li>Post hate speech, explicit sexual content involving minors, or content that promotes violence.</li>
                  <li>Infringe or misappropriate the intellectual property or privacy rights of others.</li>
                  <li>Distribute malware, spam, or engage in phishing or fraudulent activity.</li>
                  <li>Attempt to access accounts you do not own or bypass security mechanisms.</li>
                </ul>
              </section>
              <section id="moderation" className="mb-8">
                <h2>7. Moderation & Enforcement</h2>
                <p>We review content and may remove or restrict access to content that violates these Terms. We may suspend or terminate accounts, remove content, or take other actions at our discretion to enforce these Terms and protect the community.</p>
              </section>
              <section id="ip" className="mb-8">
                <h2>8. Intellectual Property</h2>
                <p>Hephix Ltd retains all rights, title, and interest in and to the Service, including all software, designs, text, graphics, logos, trademarks, and other material provided by us.</p>
              </section>
              <section id="payments" className="mb-8">
                <h2>9. Payments & Subscriptions</h2>
                <p>Some features of Starstreak may be paid or subscription-based. Payments are processed by third-party payment processors and are subject to their terms and privacy policies.</p>
              </section>
              <section id="disclaimers" className="mb-8">
                <h2>10. Disclaimers</h2>
                <p>THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED.</p>
              </section>
              <section id="limitation" className="mb-8">
                <h2>11. Limitation of Liability</h2>
                <p>TO THE MAXIMUM EXTENT PERMITTED BY LAW, NEITHER STARSTREAK, HEPHIX LTD, NOR THEIR AFFILIATES SHALL BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES.</p>
              </section>
              <section id="indemnification" className="mb-8">
                <h2>12. Indemnification</h2>
                <p>You agree to indemnify and hold harmless Starstreak, Hephix Ltd, and their officers, directors, employees, and agents from any claims arising from your violation of these Terms or your use of the Service.</p>
              </section>
              <section id="termination" className="mb-8">
                <h2>13. Termination</h2>
                <p>We may suspend or terminate your access to the Service at any time for violations of these Terms or other conduct that we determine harmful to the Service or users.</p>
              </section>
              <section id="governing" className="mb-8">
                <h2>14. Governing Law & Dispute Resolution</h2>
                <p>These Terms are governed by the laws of Kenya. Any disputes shall be resolved in the courts of Nairobi, Kenya.</p>
              </section>
              <section id="changes" className="mb-8">
                <h2>15. Changes to These Terms</h2>
                <p>We may modify these Terms from time to time. If changes are material, we will provide notice via the Service or by other means before changes take effect.</p>
              </section>
              <section id="contact" className="mb-12">
                <h2>16. Contact</h2>
                <div className="mt-4 bg-night-800 p-6 rounded-lg shadow-sm border border-line">
                  <p className="font-semibold">Legal & Terms</p>
                  <p className="text-sm text-mist mt-1">Email: <a href="mailto:legal@starstreak.org" className="text-brand hover:underline">legal@starstreak.org</a></p>
                  <p className="text-sm text-mist mt-2">Support: <Link to="/support" className="text-brand hover:underline">/support</Link></p>
                  <p className="text-sm text-mist mt-2">Company: Hephix Ltd</p>
                </div>
              </section>
            </article>
          </>
        )}

        {/* Footer links */}
        <div className="max-w-4xl mx-auto mt-10 text-center text-sm text-dust space-y-4">
          <p>
            Questions? Email{' '}
            <a href="mailto:legal@starstreak.org" className="text-brand hover:underline">legal@starstreak.org</a>
            {' '}or visit{' '}
            <Link to="/support" className="text-brand hover:underline">Support</Link>.
          </p>
          <p className="text-mist">
            You may also want to review our{' '}
            <Link to="/privacy" className="text-brand hover:underline">Privacy Policy</Link>
            {' '}and{' '}
            <Link to="/guidelines" className="text-brand hover:underline">Community Guidelines</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
