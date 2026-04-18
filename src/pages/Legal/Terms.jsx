import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase/client';

const STATIC_FALLBACK = `
<p>These Terms of Service ("Terms") govern your access to and use of Starstreak's websites, applications, and services (collectively, the "Services"). By using the Services, you agree to these Terms. If you do not agree, do not use the Services.</p>

<h2>1. Definitions</h2>
<p><strong>User</strong> refers to any person who accesses or uses the Services. <strong>User Content</strong> includes any content posted, uploaded, transmitted, or otherwise provided by Users, such as messages, posts, media, or profile information. <strong>We</strong>, <strong>us</strong>, and <strong>our</strong> refer to Starstreak Ltd.</p>

<h2>2. Eligibility</h2>
<p>You must meet the minimum legal age required in your jurisdiction to use the Services. By using the Services you confirm that you are eligible, legally competent, and able to form a binding contract.</p>

<h2>3. Account Registration &amp; Security</h2>
<p>Certain features require an account. You agree to provide accurate information and to maintain the security of your credentials. You are responsible for all activity under your account and must notify us immediately of unauthorized access.</p>

<h2>4. Acceptable Use &amp; Prohibited Conduct</h2>
<p>You agree not to use the Services for illegal activities, harassment, intellectual property infringement, distribution of malware, data scraping, or interfering with platform operations. We may restrict or remove access for violations.</p>

<h2>5. User Content</h2>
<p>You retain ownership of the content you post. By posting User Content, you grant Starstreak a global, non-exclusive, royalty-free license to host, display, distribute, and use that content as necessary to operate and promote the Services.</p>

<h2>6. Moderation &amp; Community Standards</h2>
<p>We aim to maintain a safe, respectful community. We may review or remove User Content that violates policies. Moderation may be automated or human, and we do not guarantee prior review before content becomes visible.</p>

<h2>7. Paid Services, Fees &amp; Billing</h2>
<p>Some Services require payment. Fees, billing terms, and refund policies (if any) will be disclosed during purchase. Failure to pay may result in suspension of paid features.</p>

<h2>8. Third-Party Services &amp; Links</h2>
<p>The Services may include links or integrations with third-party services. We are not responsible for their content, privacy practices, or terms.</p>

<h2>9. Intellectual Property</h2>
<p>All intellectual property in the Services (excluding User Content) belongs to Starstreak or its licensors. You receive a limited, non-exclusive license to use the Services in accordance with these Terms.</p>

<h2>10. Data, Privacy &amp; Security</h2>
<p>Our handling of personal data is explained in our Privacy Policy. While we use industry-standard safeguards, no system is completely secure. Report suspected security issues to <a href="mailto:privacy@starstreak.org">privacy@starstreak.org</a>.</p>

<h2>11. Suspension &amp; Termination</h2>
<p>We may suspend or terminate accounts for violations, risks to users, illegal activity, or other valid reasons. You may terminate your account anytime.</p>

<h2>12. Disclaimers &amp; Warranties</h2>
<p>The Services are provided "as is" and "as available." Starstreak disclaims all warranties, express or implied, to the fullest extent allowed by law.</p>

<h2>13. Limitation of Liability</h2>
<p>To the maximum extent allowed by law, Starstreak is not liable for indirect, incidental, special, or consequential damages.</p>

<h2>14. Indemnification</h2>
<p>You agree to indemnify and hold Starstreak harmless from claims, losses, or expenses arising from your misuse of the Services or violation of these Terms.</p>

<h2>15. Governing Law &amp; Dispute Resolution</h2>
<p>These Terms are governed by the laws of Kenya. Disputes will be resolved in Nairobi courts or through binding arbitration if mutually chosen.</p>

<h2>16. Changes to Terms</h2>
<p>We may update these Terms periodically. Material changes will be announced through the Services. Continued use after updates constitutes acceptance.</p>

<h2>17. International Users</h2>
<p>Starstreak operates globally from Kenya. If you use the Services outside Kenya, you are responsible for complying with local laws.</p>

<h2>18. Contact</h2>
<p>For legal inquiries, contact us at <a href="mailto:legal@starstreak.org">legal@starstreak.org</a></p>
`;

export default function Terms() {
  const [content, setContent] = useState('');
  const [updatedAt, setUpdatedAt] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const { data } = await supabase
          .from('legal_pages')
          .select('content, updated_at')
          .eq('type', 'terms')
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
        <h1 className="text-5xl md:text-6xl font-extrabold gradient-text mb-3">Terms of Service</h1>
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
