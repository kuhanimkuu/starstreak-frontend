import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase/client';

const STATIC_CONTENT = `
<h2>1. What Are Cookies?</h2>
<p>Cookies are small text files placed on your device when you visit a website. They help the site remember your preferences and provide a better experience.</p>

<h2>2. How We Use Cookies</h2>
<p>Starstreak and its products (including Nexora) use cookies and similar technologies for the following purposes:</p>
<ul>
  <li><strong>Essential cookies</strong> – Required for core functionality such as authentication and session management. These cannot be disabled.</li>
  <li><strong>Analytics cookies</strong> – Help us understand how visitors interact with our sites so we can improve them.</li>
  <li><strong>Preference cookies</strong> – Remember your settings (such as dark/light mode) across visits.</li>
  <li><strong>Security cookies</strong> – Used for fraud detection and to protect your account.</li>
</ul>

<h2>3. Third-Party Cookies</h2>
<p>Some pages may include content or integrations from third-party services (e.g., analytics providers). These services may set their own cookies in accordance with their privacy policies. We do not control third-party cookies.</p>

<h2>4. Managing Cookies</h2>
<p>You can control cookies through your browser settings. Most browsers allow you to:</p>
<ul>
  <li>View cookies stored on your device</li>
  <li>Delete specific or all cookies</li>
  <li>Block third-party cookies</li>
  <li>Set preferences for specific websites</li>
</ul>
<p>Note that disabling essential cookies may affect the functionality of our services.</p>

<h2>5. Cookie Retention</h2>
<p>Session cookies are deleted when you close your browser. Persistent cookies remain on your device until they expire or you delete them. Typical retention periods range from 30 days to 2 years depending on the purpose.</p>

<h2>6. Changes to This Policy</h2>
<p>We may update this Cookie Policy periodically to reflect changes in our practices or applicable law. We will notify users of significant changes through our platforms.</p>

<h2>7. Contact Us</h2>
<p>For questions about our use of cookies, contact us at <a href="mailto:privacy@starstreak.org">privacy@starstreak.org</a>.</p>
`;

export default function Cookie() {
  const [content, setContent] = useState('');
  const [updatedAt, setUpdatedAt] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const { data } = await supabase
          .from('legal_pages')
          .select('content, updated_at')
          .eq('type', 'cookies')
          .single();
        if (data?.content) {
          setContent(data.content);
          setUpdatedAt(data.updated_at);
        } else {
          setContent(STATIC_CONTENT);
        }
      } catch {
        setContent(STATIC_CONTENT);
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
        <h1 className="text-5xl md:text-6xl font-extrabold gradient-text mb-3">Cookie Policy</h1>
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
