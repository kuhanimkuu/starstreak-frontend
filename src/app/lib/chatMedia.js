import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

// Chat media lives in the private `messages` bucket (migration
// 20261018000001): the stored public address no longer opens, so it's
// swapped for a signed link that works for a few hours and only for people
// in the conversation. Same approach as the app (chat_media_urls.dart).

const MARKER = "/storage/v1/object/public/messages/";
const VALID_FOR = 6 * 3600; // seconds
const cache = new Map(); // path -> { url, expires }
const inflight = new Map(); // path -> Promise<string|null>

export function chatMediaPath(url) {
  if (!url) return null;
  const i = url.indexOf(MARKER);
  if (i < 0) return null;
  const rest = url.slice(i + MARKER.length).split("?")[0];
  return rest ? decodeURIComponent(rest) : null;
}

function fresh(path) {
  const hit = cache.get(path);
  return hit && hit.expires - Date.now() > 3600 * 1000 ? hit.url : null;
}

async function sign(path) {
  const hit = fresh(path);
  if (hit) return hit;
  if (!inflight.has(path)) {
    inflight.set(path, supabase.storage.from("messages").createSignedUrl(path, VALID_FOR)
      .then(({ data, error }) => {
        if (error || !data?.signedUrl) return null;
        cache.set(path, { url: data.signedUrl, expires: Date.now() + VALID_FOR * 1000 });
        return data.signedUrl;
      })
      .catch(() => null)
      .finally(() => inflight.delete(path)));
  }
  return inflight.get(path);
}

/** A link that opens `url` now: signed for chat media, unchanged otherwise. */
export function useChatMedia(url) {
  const path = chatMediaPath(url);
  // undefined = still signing; "" = signing failed; otherwise the link.
  const [signed, setSigned] = useState(() => (path ? fresh(path) ?? undefined : undefined));
  useEffect(() => {
    if (!path) return;
    let off = false;
    sign(path).then((u) => { if (!off) setSigned(u || ""); });
    return () => { off = true; };
  }, [path]);
  if (!path) return url;
  // While signing is pending, show nothing; if it fails (e.g. the bucket is
  // still public, before migration 20261018000001), fall back to the stored
  // address, which then still opens.
  return signed === undefined ? null : signed || url;
}
