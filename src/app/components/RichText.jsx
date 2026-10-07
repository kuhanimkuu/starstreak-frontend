import { Link } from "react-router-dom";
import { safeUrl } from "../lib/media";

// URLs, @mentions and #hashtags — rendered as React elements (never as HTML).
const TOKEN = /(https?:\/\/[^\s<]+[^\s<.,:;"')\]!?])|(@[A-Za-z0-9_]{2,30})|(#[\p{L}\p{N}_]{2,50})/gu;

export default function RichText({ text, className = "" }) {
  if (!text) return null;
  const parts = [];
  let last = 0;
  for (const m of text.matchAll(TOKEN)) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    const [token, url, mention, tag] = m;
    if (url) {
      const href = safeUrl(url);
      parts.push(
        href ? (
          <a key={m.index} href={href} target="_blank" rel="noopener noreferrer nofollow ugc"
             onClick={(e) => e.stopPropagation()} className="text-accent hover:underline break-all">
            {url.replace(/^https?:\/\//, "").slice(0, 60)}{url.length > 68 ? "…" : ""}
          </a>
        ) : token,
      );
    } else if (mention) {
      parts.push(
        <Link key={m.index} to={`/profile/${mention.slice(1)}`} onClick={(e) => e.stopPropagation()}
              className="text-accent hover:underline">
          {mention}
        </Link>,
      );
    } else if (tag) {
      parts.push(<span key={m.index} className="text-accent">{tag}</span>);
    }
    last = m.index + token.length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return <div className={`whitespace-pre-wrap break-words ${className}`}>{parts}</div>;
}
