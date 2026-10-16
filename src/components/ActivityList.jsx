import { useCallback, useEffect, useState } from "react";
import { timeAgo } from "../app/lib/format";

// Who did what, from the server-written activity log (migration
// 20261016000006_activity_log.sql). `load(before)` returns { data, error }
// for rows older than `before` (an id), newest first, 50 at a time.

const ORG_STATUS = {
  pending_email: (n) => `applied for ${n} to become an organisation`,
  pending_review: (n) => `sent ${n}'s organisation application to review`,
  approved_unpaid: (n) => `approved ${n}'s organisation application`,
  active: (n) => `made ${n} an organisation`,
  grace: (n) => `put ${n} into a payment grace period`,
  lapsed: (n) => `removed ${n} as an organisation`,
  rejected: (n) => `rejected ${n}'s organisation application`,
};

function describe(r, showCommunity) {
  const where = showCommunity && r.community_name ? ` in ${r.community_name}` : "";
  const who = r.subject_name || "someone";
  const [kind, value] = r.action.split(":");
  switch (r.subject) {
    case "community":
      return {
        verified: `verified ${r.community_name || "a community"}`,
        unverified: `removed verification from ${r.community_name || "a community"}`,
        suspended: `suspended ${r.community_name || "a community"}${r.detail?.reason ? ` (${r.detail.reason})` : ""}`,
        unsuspended: `lifted the suspension of ${r.community_name || "a community"}`,
      }[r.action] || r.action;
    case "organisation":
      return (ORG_STATUS[value] || ((n) => `changed ${n}'s organisation status to ${value}`))(r.community_name || "a community");
    case "promotion":
      if (r.action === "created") return `created a promotion: ${r.subject_name || r.detail?.kind || ""}${where}`;
      return `${{ active: "started", paused: "paused", ended: "ended", rejected: "rejected" }[value] || value} a promotion: ${r.subject_name || ""}${where}`;
    case "member":
      if (kind === "role") return value === "moderator" ? `made ${who} a moderator${where}`
        : value === "admin" || value === "owner" ? `made ${who} an admin${where}` : `made ${who} a regular member${where}`;
      return r.action === "banned" ? `banned ${who}${where}` : `unbanned ${who}${where}`;
    case "user":
      return {
        admin_granted: `gave ${who} Starstreak team access`, admin_removed: `removed ${who}'s Starstreak team access`,
        suspended: `suspended ${who}'s account`, unsuspended: `restored ${who}'s account`,
      }[r.action] || r.action;
    default:
      return r.action;
  }
}

export default function ActivityList({ load, showCommunity = false, empty = "Nothing yet." }) {
  const [rows, setRows] = useState(null);
  const [more, setMore] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const fetchPage = useCallback(async (before) => {
    setBusy(true);
    const { data, error: e } = await load(before);
    setBusy(false);
    if (e) { setError(e.message || "Couldn't load the activity. Try again."); return; }
    setError("");
    setRows((prev) => (before ? [...(prev || []), ...(data || [])] : data || []));
    setMore((data || []).length === 50);
  }, [load]);

  useEffect(() => {
    const t = setTimeout(() => fetchPage(null), 0);
    return () => clearTimeout(t);
  }, [fetchPage]);

  if (error && !rows) {
    return (
      <div className="text-sm text-red-400">
        {error} <button onClick={() => fetchPage(null)} className="ml-2 text-flare underline">Retry</button>
      </div>
    );
  }
  if (!rows) return <p className="text-sm text-dust">Loading…</p>;
  if (rows.length === 0) return <p className="text-sm text-dust">{empty}</p>;

  return (
    <div>
      <ul className="divide-y divide-line">
        {rows.map((r) => (
          <li key={r.id} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 py-2.5 text-sm">
            <span className="min-w-0">
              <b className="font-medium">{r.actor_name}</b>
              {r.actor_username && <span className="text-dust"> @{r.actor_username}</span>}
              {" "}{describe(r, showCommunity)}
            </span>
            <time dateTime={r.at} title={new Date(r.at).toLocaleString()} className="shrink-0 text-xs text-dust">{timeAgo(r.at)}</time>
          </li>
        ))}
      </ul>
      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
      {more && (
        <button onClick={() => fetchPage(rows[rows.length - 1].id)} disabled={busy}
                className="mt-3 text-sm text-flare hover:underline disabled:opacity-50">
          {busy ? "Loading…" : "Show older"}
        </button>
      )}
    </div>
  );
}
