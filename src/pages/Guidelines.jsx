import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import RichContent from "../components/RichContent";
import DocLayout, { formatDate } from "../components/ui/DocLayout";
import Mascot from "../components/ui/Mascot";

// Shown when ops hasn't published guidelines in platform_content.
const FALLBACK = [
  {
    title: "Be respectful",
    body: "Treat others with kindness. No harassment, hate speech, bullying or discriminatory remarks. Starstreak is for expression — not for harming or belittling others.",
  },
  {
    title: "Keep communities safe & inclusive",
    body: "Communities should feel welcoming. Owners and moderators must enforce rules consistently and fairly. Discrimination or exclusion based on identity, background or beliefs isn’t allowed.",
  },
  {
    title: "Have healthy conversations",
    body: "Debate is welcome, hostility isn’t. Avoid spam, misinformation and deliberately misleading posts. Keep discussions civil and in the right communities.",
  },
  {
    title: "Protect your privacy — and others’",
    body: "Don’t share private information such as phone numbers, addresses, IDs, academic records or financial details. Never pressure anyone into sharing personal information.",
  },
  {
    title: "Prohibited content",
    list: [
      "Hate speech or discriminatory content",
      "Harassment, threats or targeted insults",
      "Non-consensual or intimate imagery",
      "Violence, self-harm encouragement or dangerous acts",
      "Illegal activities or promotion of harm",
      "Sexual content involving minors or any exploitation",
      "Spam, scams or deceptive content",
    ],
  },
  {
    title: "Consequences",
    body: "Breaking these guidelines can lead to content removal, warnings, temporary restrictions or permanent suspension, depending on severity. Repeated violations lead to stronger action.",
  },
  {
    title: "Appeals",
    body: "If you think a moderation decision was wrong, you can appeal through Starstreak Support. We review appeals carefully to make sure they’re fair and accurate.",
  },
];

export default function Guidelines() {
  const [content, setContent] = useState(null);
  const [updatedAt, setUpdatedAt] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("platform_content")
      .select("content, updated_at")
      .eq("key", "guidelines")
      .maybeSingle()
      .then(({ data }) => {
        if (data?.content?.trim()) {
          setContent(data.content);
          setUpdatedAt(data.updated_at);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <DocLayout
      eyebrow="Community guidelines"
      title={
        <>
          Keep Starstreak <span className="text-flare-gradient">a good place.</span>
        </>
      }
      intro="These guidelines keep Starstreak safe, respectful and expressive. By using Starstreak, you agree to follow them."
      updated={formatDate(updatedAt)}
      loading={loading}
      mascot={<Mascot pose="chat" className="w-56" />}
      footer={
        <>
          <p>Starstreak is built by everyone. Thanks for helping keep it safe and welcoming.</p>
          <p className="mt-3 text-sm">
            Questions?{" "}
            <a href="mailto:support@starstreak.org" className="text-accent hover:text-gold">
              support@starstreak.org
            </a>{" "}
            ·{" "}
            <Link to="/support" className="text-accent hover:text-gold">
              Support
            </Link>{" "}
            ·{" "}
            <Link to="/terms" className="text-accent hover:text-gold">
              Terms
            </Link>
          </p>
        </>
      }
    >
      {content ? (
        <RichContent content={content} />
      ) : (
        <ol className="space-y-10">
          {FALLBACK.map((g, i) => (
            <li key={g.title} className="flex gap-5">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-flare-gradient font-extrabold text-night-950">
                {i + 1}
              </span>
              <div>
                <h2 className="text-xl font-bold text-star">{g.title}</h2>
                {g.body && <p className="mt-2 leading-relaxed text-mist">{g.body}</p>}
                {g.list && (
                  <ul className="mt-3 space-y-2">
                    {g.list.map((item) => (
                      <li key={item} className="flex gap-3 text-mist">
                        <span className="text-red-400">✕</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </li>
          ))}
        </ol>
      )}
    </DocLayout>
  );
}
