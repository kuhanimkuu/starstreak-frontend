/**
 * Posts keep every attachment in one `media_urls` text array (same encoding
 * the phone app uses):
 *   image      plain URL
 *   video      plain URL ending in a video extension
 *   document   doc::<file name>::<url>
 *   link       link::<url>
 *   repost     repost::@<username>::<name>   /  repostsrc::<post id>
 */

const VIDEO_EXT = /\.(mp4|mov|avi|webm|m4v|mkv)(\?|#|$)/i;

/** Only http(s) URLs ever reach an href/src (no javascript:, data: …). */
export function safeUrl(url) {
  if (typeof url !== "string") return null;
  try {
    const u = new URL(url.trim());
    return u.protocol === "https:" || u.protocol === "http:" ? u.href : null;
  } catch {
    return null;
  }
}

export function parseMedia(mediaUrls) {
  const out = { images: [], videos: [], documents: [], link: null, repost: null, repostSourceId: null };
  for (const raw of mediaUrls || []) {
    if (typeof raw !== "string") continue;
    if (raw.startsWith("doc::")) {
      const [, name, ...rest] = raw.split("::");
      const url = safeUrl(rest.join("::"));
      if (url) out.documents.push({ name: name || "Document", url });
    } else if (raw.startsWith("link::")) {
      out.link = safeUrl(raw.slice(6));
    } else if (raw.startsWith("repostsrc::")) {
      out.repostSourceId = raw.slice(11);
    } else if (raw.startsWith("repost::")) {
      const [, who, name] = raw.split("::");
      out.repost = { username: who?.startsWith("@") ? who.slice(1) : null, name: name || who || "" };
    } else {
      const url = safeUrl(raw);
      if (!url) continue;
      (VIDEO_EXT.test(url) ? out.videos : out.images).push(url);
    }
  }
  return out;
}
