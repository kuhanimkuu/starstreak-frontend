import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import RichContent from '../components/RichContent';
import { PageHero } from '../components/ui/Section';

export default function Privacy() {
  const [dbContent, setDbContent] = useState(null);
  const [dbUpdatedAt, setDbUpdatedAt] = useState(null);
  const [loading, setLoading] = useState(true);
  const lastUpdated = 'March 22, 2026';

  useEffect(() => {
    supabase
      .from('platform_content')
      .select('content, updated_at')
      .eq('key', 'privacy')
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
      <PageHero eyebrow="Legal" title="Starstreak Privacy Policy" intro="This page explains how Starstreak, a product operated by Hephix Ltd, collects, uses, and protects your information.">
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
                <ul className="grid md:grid-cols-3 gap-2 text-sm text-brand">
                  {[
                    ['Introduction', '#introduction'],
                    ['Info We Collect', '#info-we-collect'],
                    ['Automatic Info', '#auto-info'],
                    ['Third Parties', '#third-parties'],
                    ['How We Use Info', '#how-use'],
                    ['How We Share', '#how-share'],
                    ['Data Retention', '#retention'],
                    ['Your Rights', '#rights'],
                    ['Cookies', '#cookies'],
                    ['Children', '#children'],
                    ['Security', '#security'],
                    ['International Transfers', '#transfers'],
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
              <section id="introduction" className="mb-8">
                <h2>1. Introduction</h2>
                <p>Welcome to Starstreak, a social and community platform operated by <strong>Hephix Ltd</strong> ("we", "our", or "us"). This Privacy Policy explains how we collect, use, disclose, and protect information when you use Starstreak.</p>
                <p>By accessing or using Starstreak, you agree to the practices described in this Privacy Policy.</p>
              </section>
              <section id="info-we-collect" className="mb-8">
                <h2>2. Information We Collect</h2>
                <h3>2.1 Information You Provide Directly</h3>
                <ul>
                  <li><strong>Account Information:</strong> name, username, email, password, date of birth, and profile details.</li>
                  <li><strong>Profile Content:</strong> bio, interests, avatars, and other profile elements.</li>
                  <li><strong>Posts & Media:</strong> text posts, comments, photos, videos, polls, and other user-generated content.</li>
                  <li><strong>Messages:</strong> direct messages are end-to-end encrypted and inaccessible to Starstreak.</li>
                  <li><strong>Reports & Feedback:</strong> content moderation reports, safety concerns, and support requests.</li>
                </ul>
              </section>
              <section id="auto-info" className="mb-8">
                <h2>3. Information We Collect Automatically</h2>
                <ul>
                  <li><strong>Device Information:</strong> IP address, device type, operating system, app version.</li>
                  <li><strong>Usage Data:</strong> app interactions, pages viewed, session duration.</li>
                  <li><strong>Approximate Location:</strong> derived from IP address only. No GPS or precise location data is collected.</li>
                </ul>
              </section>
              <section id="third-parties" className="mb-8">
                <h2>4. Information From Third Parties</h2>
                <p>We may receive authentication data when signing in through compatible providers. We do not buy third-party demographic datasets and do not sell user data.</p>
              </section>
              <section id="how-use" className="mb-8">
                <h2>5. How We Use Your Information</h2>
                <ul>
                  <li><strong>Provide & Personalise the Service</strong></li>
                  <li><strong>Safety, Security & Moderation</strong></li>
                  <li><strong>Improve Starstreak</strong></li>
                  <li><strong>Legal Compliance</strong></li>
                </ul>
                <p>We do <strong>not</strong> sell personal data.</p>
              </section>
              <section id="how-share" className="mb-8">
                <h2>6. How We Share Information</h2>
                <p>We share data only with trusted service providers (Supabase Inc. for infrastructure, Google Firebase for push notifications) under contractual obligations. We do not sell data to any third party.</p>
              </section>
              <section id="retention" className="mb-8">
                <h2>7. Data Retention</h2>
                <p>Active account data is retained for the life of the account. Deleted content is removed within 30 days. Moderation and legal records may be retained for up to 7 years. Message metadata is retained for up to 12 months after message deletion.</p>
              </section>
              <section id="rights" className="mb-8">
                <h2>8. Your Rights & Controls</h2>
                <p>Under the Data Protection Act, 2019 (Kenya), you have rights of access, rectification, erasure, portability, restriction, and objection. Contact us at <a href="mailto:privacy@starstreak.org" className="text-brand hover:underline">privacy@starstreak.org</a> to exercise these rights. We respond within 30 days.</p>
              </section>
              <section id="cookies" className="mb-8">
                <h2>9. Cookies & Tracking Technologies</h2>
                <p>Starstreak is a mobile application and does not use browser cookies. The only third-party service integrated is Firebase Cloud Messaging for push notifications.</p>
              </section>
              <section id="children" className="mb-8">
                <h2>10. Children's Privacy</h2>
                <p>Starstreak requires users to be at least 13 years old. Users aged 13–17 require parental consent. If we discover an account belonging to a child under 13, we will remove it promptly.</p>
              </section>
              <section id="security" className="mb-8">
                <h2>11. Security Measures</h2>
                <p>We implement end-to-end encryption for direct messages, TLS in transit, encryption at rest, Row-Level Security, role-based access controls, and regular security reviews.</p>
              </section>
              <section id="transfers" className="mb-8">
                <h2>12. International Data Transfers</h2>
                <p>Data is processed by Supabase Inc. on EU servers and via Google Firebase in the US. All transfers are subject to appropriate safeguards under the Data Protection Act, 2019 (Kenya).</p>
              </section>
              <section id="changes" className="mb-8">
                <h2>13. Changes to This Privacy Policy</h2>
                <p>We may update this Privacy Policy from time to time. Material changes will be communicated via in-app notification or email in advance.</p>
              </section>
              <section id="contact" className="mb-12">
                <h2>14. Contact Us</h2>
                <div className="mt-4 bg-night-800 p-6 rounded-lg shadow-sm border border-line">
                  <p className="font-semibold">Privacy & Data Requests</p>
                  <p className="text-sm text-mist mt-1">Email: <a className="text-brand hover:underline" href="mailto:privacy@starstreak.org">privacy@starstreak.org</a></p>
                  <p className="text-sm text-mist mt-2">Support: <Link to="/support" className="text-brand hover:underline">/support</Link></p>
                  <p className="text-sm text-mist mt-2">Company: Hephix Ltd, Nairobi, Kenya</p>
                </div>
              </section>
            </article>
          </>
        )}

        {/* Footer links */}
        <div className="max-w-4xl mx-auto mt-10 text-center text-sm text-dust space-y-4">
          <p>
            Questions? Email{' '}
            <a href="mailto:privacy@starstreak.org" className="text-brand hover:underline">privacy@starstreak.org</a>
            {' '}or visit{' '}
            <Link to="/support" className="text-brand hover:underline">Support</Link>.
          </p>
          <p className="text-mist">
            For more details, review our{' '}
            <Link to="/terms" className="text-brand hover:underline">Terms of Service</Link>
            {' '}and{' '}
            <Link to="/safety" className="text-brand hover:underline">Safety Center</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
