import React from "react";

export default function Terms() {
  const lastUpdated = new Date().toLocaleDateString();

  return (
    <div className="container-custom py-20 flex flex-col items-center">

      {/* Header */}
      <header className="mb-12 text-center max-w-2xl">
        <h1 className="text-5xl md:text-6xl font-extrabold gradient-text mb-3">
          Terms of Service
        </h1>
        <p className="text-sm md:text-base text-gray-400">
          Last updated: {lastUpdated}
        </p>
      </header>

      {/* Article */}
      <article className="max-w-2xl text-center text-gray-300">

        <p className="text-base md:text-lg leading-relaxed mb-6">
          These Terms of Service (“Terms”) govern your access to and use of Starstreak’s
          websites, applications, and services (collectively, the “Services”).  
          By using the Services, you agree to these Terms. If you do not agree, do not
          use the Services.
        </p>

        <h2 className="text-3xl font-semibold mb-4">1. Definitions</h2>
        <p className="text-base md:text-lg leading-relaxed mb-6">
          <strong>User</strong> refers to any person who accesses or uses the Services.  
          <strong>User Content</strong> includes any content posted, uploaded, transmitted, or otherwise
          provided by Users, such as messages, posts, media, or profile information.  
          <strong>We</strong>, <strong>us</strong>, and <strong>our</strong> refer to Starstreak (founded 2026).
        </p>

        <h2 className="text-3xl font-semibold mb-4">2. Eligibility</h2>
        <p className="text-base md:text-lg leading-relaxed mb-6">
          You must meet the minimum legal age required in your jurisdiction to use the Services.
          By using the Services you confirm that you are eligible, legally competent, and able
          to form a binding contract.
        </p>

        <h2 className="text-3xl font-semibold mb-4">3. Account Registration & Security</h2>
        <p className="text-base md:text-lg leading-relaxed mb-6">
          Certain features require an account. You agree to provide accurate information and to
          maintain the security of your credentials. You are responsible for all activity under
          your account and must notify us immediately of unauthorized access.
        </p>

        <h2 className="text-3xl font-semibold mb-4">4. Acceptable Use & Prohibited Conduct</h2>
        <p className="text-base md:text-lg leading-relaxed mb-6">
          You agree not to use the Services for illegal activities, harassment, intellectual
          property infringement, distribution of malware, data scraping, or interfering with
          platform operations. We may restrict or remove access for violations.
        </p>

        <h2 className="text-3xl font-semibold mb-4">5. User Content</h2>
        <p className="text-base md:text-lg leading-relaxed mb-6">
          You retain ownership of the content you post. By posting User Content, you grant
          Starstreak a global, non-exclusive, royalty-free license to host, display, distribute,
          and use that content as necessary to operate and promote the Services.
        </p>

        <h2 className="text-3xl font-semibold mb-4">6. Moderation & Community Standards</h2>
        <p className="text-base md:text-lg leading-relaxed mb-6">
          We aim to maintain a safe, respectful community. We may review or remove User Content
          that violates policies. Moderation may be automated or human, and we do not guarantee
          prior review before content becomes visible.
        </p>

        <h2 className="text-3xl font-semibold mb-4">7. Paid Services, Fees & Billing</h2>
        <p className="text-base md:text-lg leading-relaxed mb-6">
          Some Services require payment. Fees, billing terms, and refund policies (if any) will
          be disclosed during purchase. Failure to pay may result in suspension of paid features.
        </p>

        <h3 className="text-2xl font-semibold mb-3">7.1 Free Trials & Promotions</h3>
        <p className="text-base md:text-lg leading-relaxed mb-6">
          Trial periods and promotions are governed by their specific terms. We may change or
          cancel such offers at any time.
        </p>

        <h3 className="text-2xl font-semibold mb-3">7.2 Refunds</h3>
        <p className="text-base md:text-lg leading-relaxed mb-6">
          Refund policies will be provided where applicable. Unless stated otherwise, all fees
          paid are non-refundable.
        </p>

        <h2 className="text-3xl font-semibold mb-4">8. Third-Party Services & Links</h2>
        <p className="text-base md:text-lg leading-relaxed mb-6">
          The Services may include links or integrations with third-party services. We are not
          responsible for their content, privacy practices, or terms. Your interactions with
          third parties are solely between you and the third party.
        </p>

        <h2 className="text-3xl font-semibold mb-4">9. Intellectual Property</h2>
        <p className="text-base md:text-lg leading-relaxed mb-6">
          All intellectual property in the Services (excluding User Content) belongs to Starstreak
          or its licensors. You receive a limited, non-exclusive license to use the Services in
          accordance with these Terms.
        </p>

        <h2 className="text-3xl font-semibold mb-4">10. Data, Privacy & Security</h2>
        <p className="text-base md:text-lg leading-relaxed mb-6">
          Our handling of personal data is explained in our Privacy Policy. While we use industry-
          standard safeguards, no system is completely secure. Report suspected security issues to{" "}
          <a href="mailto:privacy@starstreak.com" className="text-emerald-400 hover:text-emerald-300">
            privacy@starstreak.com
          </a>.
        </p>

        <h2 className="text-3xl font-semibold mb-4">11. Suspension & Termination</h2>
        <p className="text-base md:text-lg leading-relaxed mb-6">
          We may suspend or terminate accounts for violations, risks to users, illegal activity,
          or other valid reasons. You may terminate your account anytime. Certain provisions will
          continue after termination.
        </p>

        <h2 className="text-3xl font-semibold mb-4">12. Disclaimers & Warranties</h2>
        <p className="text-base md:text-lg leading-relaxed mb-6">
          The Services are provided “as is” and “as available.” Starstreak disclaims all warranties,
          express or implied, to the fullest extent allowed by law.
        </p>

        <h2 className="text-3xl font-semibold mb-4">13. Limitation of Liability</h2>
        <p className="text-base md:text-lg leading-relaxed mb-6">
          To the maximum extent allowed by law, Starstreak is not liable for indirect, incidental,
          special, or consequential damages. Direct liability is limited to the greater of:  
          (a) the amount you paid in the last 12 months, or  
          (b) the minimum statutory amount applicable in your region.
        </p>

        <h2 className="text-3xl font-semibold mb-4">14. Indemnification</h2>
        <p className="text-base md:text-lg leading-relaxed mb-6">
          You agree to indemnify and hold Starstreak harmless from claims, losses, or expenses
          arising from your misuse of the Services or violation of these Terms.
        </p>

        <h2 className="text-3xl font-semibold mb-4">15. Governing Law & Dispute Resolution</h2>
        <p className="text-base md:text-lg leading-relaxed mb-6">
          These Terms are governed by the laws of Kenya. Disputes will be resolved in Nairobi courts
          or through binding arbitration if mutually chosen. Consumer protection laws in your country
          may grant additional rights.
        </p>

        <h2 className="text-3xl font-semibold mb-4">16. Changes to Terms</h2>
        <p className="text-base md:text-lg leading-relaxed mb-6">
          We may update these Terms periodically. Material changes will be announced through the Services.
          Continued use after updates constitutes acceptance.
        </p>

        <h2 className="text-3xl font-semibold mb-4">17. International Users</h2>
        <p className="text-base md:text-lg leading-relaxed mb-6">
          Starstreak operates globally from Kenya. If you use the Services outside Kenya, you are responsible
          for complying with local laws. The Privacy Policy explains how we handle international data transfers.
        </p>

        <h2 className="text-3xl font-semibold mb-4">18. Contact</h2>
        <p className="text-base md:text-lg leading-relaxed mb-8">
          For legal inquiries, contact us at<br />
          <a href="mailto:legal@starstreak.com" className="text-emerald-400 hover:text-emerald-300">
            legal@starstreak.com
          </a>
        </p>

        <div className="mt-8 p-4 rounded-lg bg-[#071025] border-l-4 border-amber-600 text-center max-w-xl mx-auto">
          <strong className="block text-amber-400">Important</strong>
          <p className="mt-2 text-sm md:text-base text-gray-500">
            This document is a strong foundation but not legal advice. A licensed attorney should review
            and customize it based on your business, jurisdiction, and regulatory environment.
          </p>
        </div>

      </article>
    </div>
  );
}
