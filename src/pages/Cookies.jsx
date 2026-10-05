import React from 'react';
import { Link } from 'react-router-dom';
import { PageHero } from '../components/ui/Section';

export default function CookiePolicy() {
  const lastUpdated = "December 8, 2025"; // Update as needed

  return (
    <div className="min-h-screen">
      <PageHero eyebrow="Legal" title="Cookie Policy" intro="This page explains how Starstreak uses cookies and similar technologies to operate, improve, and secure the platform.">
        <p className="mt-6 text-sm text-dust">Last updated {lastUpdated}</p>
      </PageHero>
      <div className="container-ss py-16 md:py-20">

        {/* Table of Contents */}
        <nav className="max-w-4xl mx-auto mb-10">
          <div className="bg-night-800 rounded-lg shadow-sm border border-line p-4">
            <h2 className="font-semibold text-star mb-3">On this page</h2>
            <ul className="grid md:grid-cols-3 gap-2 text-sm text-brand">
              {[
                ["What Are Cookies?", "#what-are-cookies"],
                ["Types We Use", "#types"],
                ["Why We Use Them", "#why"],
                ["Third-Party Cookies", "#third-party"],
                ["Managing Cookies", "#managing"],
                ["Changes", "#changes"],
                ["Contact Us", "#contact"]
              ].map(([title, href]) => (
                <li key={href}>
                  <a href={href} className="hover:underline">{title}</a>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        <article className="prose prose-neutral max-w-4xl mx-auto">

          {/* 1. What Are Cookies */}
          <section id="what-are-cookies" className="mb-10">
            <h2>1. What Are Cookies?</h2>
            <p>
              Cookies are small text files stored on your device when you visit a website or use an app. They help us
              remember your preferences, keep your session active, and understand how you interact with Starstreak.
            </p>
            <p>
              Similar technologies, such as local storage, device identifiers, and tracking pixels, may also be used 
              for the same purposes. We refer to all of these as “cookies” in this policy.
            </p>
          </section>

          {/* 2. Types of Cookies */}
          <section id="types" className="mb-10">
            <h2>2. Types of Cookies We Use</h2>

            <h3>2.1 Essential Cookies</h3>
            <p>
              Required for Starstreak to function. These cookies:
            </p>
            <ul>
              <li>Authenticate your login</li>
              <li>Maintain session security</li>
              <li>Enable core platform features (navigation, profiles, posts, messaging)</li>
            </ul>

            <h3>2.2 Performance & Analytics Cookies</h3>
            <p>
              Help us understand how users interact with Starstreak so we can improve stability and user experience.
            </p>
            <ul>
              <li>Crash analytics</li>
              <li>Page load metrics</li>
              <li>Feature usage tracking</li>
            </ul>

            <h3>2.3 Preference Cookies</h3>
            <p>
              Store your settings to personalize your experience, such as:
            </p>
            <ul>
              <li>Theme choices</li>
              <li>Language preferences</li>
              <li>Content filters</li>
            </ul>

            <h3>2.4 Functional Cookies</h3>
            <p>
              Support enhanced features like:
            </p>
            <ul>
              <li>Saved drafts</li>
              <li>Remembering where you left off in the feed</li>
              <li>UI personalization</li>
            </ul>

            <h3>2.5 Advertising Cookies (If Introduced)</h3>
            <p>
              Starstreak currently does <strong>not</strong> use advertising cookies.  
              If advertising features are added in the future, this policy will be updated.
            </p>
          </section>

          {/* 3. Why We Use Cookies */}
          <section id="why" className="mb-10">
            <h2>3. Why We Use Cookies</h2>
            <p>We use cookies to:</p>
            <ul>
              <li>Keep your account signed in securely</li>
              <li>Remember your preferences and settings</li>
              <li>Improve app performance and reliability</li>
              <li>Analyze trends to enhance Starstreak features</li>
              <li>Protect against abusive or harmful behavior</li>
            </ul>
          </section>

          {/* 4. Third-Party Cookies */}
          <section id="third-party" className="mb-10">
            <h2>4. Third-Party Cookies</h2>
            <p>
              Some cookies are placed by trusted third-party partners to support analytics, crash reporting, and security.
              These may include:
            </p>
            <ul>
              <li>Crash and performance monitoring providers</li>
              <li>Analytics platforms</li>
              <li>Security & fraud prevention tools</li>
            </ul>
            <p>
              Third parties cannot use data collected through Starstreak cookies for their own marketing purposes.
            </p>
          </section>

          {/* 5. Managing Cookies */}
          <section id="managing" className="mb-10">
            <h2>5. Managing Your Cookie Preferences</h2>
            <p>
              You have full control over cookies through your browser or device settings. You may:
            </p>
            <ul>
              <li>Block cookies</li>
              <li>Delete existing cookies</li>
              <li>Set preferences for specific sites</li>
              <li>Disable tracking technologies where supported</li>
            </ul>
            <p>
              Note: Disabling essential cookies may cause parts of Starstreak to stop functioning properly, including 
              login, posting, messaging, and personalization.
            </p>
          </section>

          {/* 6. Changes */}
          <section id="changes" className="mb-10">
            <h2>6. Changes to This Cookie Policy</h2>
            <p>
              We may update this Cookie Policy to reflect changes in technology, new features, or legal requirements.
              When updated, we will revise the "Last updated" date at the top. Continued use of Starstreak indicates
              acceptance of the updated policy.
            </p>
          </section>

          {/* 7. Contact */}
          <section id="contact" className="mb-16">
            <h2>7. Contact Us</h2>
            <p>
              If you have questions or concerns about this Cookie Policy or how Starstreak uses cookies, you may contact us:
            </p>
            <div className="mt-4 bg-night-800 p-6 rounded-lg shadow-sm border border-line">
              <p className="font-semibold">Privacy & Cookie Inquiries</p>
              <p className="text-sm text-mist mt-1">
                Email: <a className="text-brand hover:underline" href="mailto:privacy@starstreak.org">
                  privacy@starstreak.org
                </a>
              </p>
              <p className="text-sm text-mist mt-2">
                Support: <Link to="/support" className="text-brand hover:underline">/support</Link>
              </p>
              <p className="text-sm text-mist mt-2">
                Company: Hephix Ltd
              </p>
            </div>
          </section>

          {/* CTA */}
          <section className="text-center mb-12">
            <p className="text-mist mb-4">
              You may also want to review our{" "}
              <Link to="/privacy" className="text-brand hover:underline">Privacy Policy</Link>{" "}
              and{" "}
              <Link to="/terms" className="text-brand hover:underline">Terms of Service</Link>.
            </p>
          </section>

        </article>
      </div>
    </div>
  );
}
