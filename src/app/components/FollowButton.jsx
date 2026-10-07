import { useState } from "react";
import { follow, unfollow } from "../lib/api";
import { useAppSession } from "../AppSession";

export default function FollowButton({ userId, onChange, size = "md" }) {
  const { myId, me, following, setFollowing, notify } = useAppSession();
  const [busy, setBusy] = useState(false);
  const [hover, setHover] = useState(false);
  if (!myId || !userId || userId === myId) return null;
  const isFollowing = following.has(userId);

  async function toggle(e) {
    e.stopPropagation();
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    const next = new Set(following);
    isFollowing ? next.delete(userId) : next.add(userId);
    setFollowing(next);
    onChange?.(isFollowing ? -1 : 1);
    try {
      if (isFollowing) await unfollow(myId, userId);
      else await follow(myId, userId, me?.display_name);
    } catch (err) {
      setFollowing(following);
      onChange?.(isFollowing ? 1 : -1);
      notify(err.message, "error");
    } finally {
      setBusy(false);
    }
  }

  const pad = size === "sm" ? "px-4 py-1.5 text-sm" : "px-5 py-2 text-sm";
  return isFollowing ? (
    <button onClick={toggle} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} disabled={busy}
            className={`rounded-full border font-semibold transition-colors ${pad} ${hover ? "border-red-500/60 bg-red-500/10 text-red-400" : "border-night-600 text-star"}`}>
      {hover ? "Unfollow" : "Following"}
    </button>
  ) : (
    <button onClick={toggle} disabled={busy} className={`rounded-full bg-star font-semibold text-night-950 transition-opacity hover:opacity-90 ${pad}`}>
      Follow
    </button>
  );
}
