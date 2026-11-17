// TEMPORARY: for the Google Play closed test (12 testers kept for 14 days).
// Remove when Starstreak reaches production: delete this file, its route
// in main.jsx and its "Testing activity" entry in layouts/AdminLayout.jsx.
//
// "Last opened" is users.last_active, which the app sets each time it is
// opened or brought back to the foreground. It says nothing about guests
// (no account) or about what someone did in the app.

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";
import { FiRefreshCw, FiSearch, FiUsers, FiSun, FiCalendar, FiClock, FiMoon } from "react-icons/fi";

const HOUR = 3600 * 1000;
const DAY = 24 * HOUR;

// Buckets by time since last opened.
function bucketOf(lastActive, now) {
  if (!lastActive) return "never";
  const age = now - new Date(lastActive).getTime();
  if (age < DAY) return "today";
  if (age < 3 * DAY) return "3d";
  if (age < 7 * DAY) return "7d";
  return "inactive";
}

const BUCKETS = {
  today:    { label: "Today",         pill: "bg-green-500/15 text-green-400" },
  "3d":     { label: "Last 3 days",   pill: "bg-amber-500/15 text-amber-400" },
  "7d":     { label: "Last 7 days",   pill: "bg-flare/15 text-flare-soft" },
  inactive: { label: "Over 7 days",   pill: "bg-red-500/15 text-red-400" },
  never:    { label: "Never opened",  pill: "bg-night-700 text-dust" },
};

function ago(iso, now) {
  if (!iso) return "—";
  const ms = now - new Date(iso).getTime();
  const min = Math.floor(ms / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min} min ago`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h} h ago`;
  const d = Math.floor(h / 24);
  return d === 1 ? "yesterday" : `${d} days ago`;
}

const fmt = (iso) =>
  iso ? new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : "";

export default function AdminTesting() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [now, setNow] = useState(() => Date.now());

  async function load() {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from("users_admin")
      .select("id, display_name, username, email, avatar_url, created_at, last_active, total_post_count")
      .neq("is_deleted", true)
      .order("last_active", { ascending: false, nullsFirst: false })
      .limit(1000);
    if (err) setError(err.message);
    setUsers(data || []);
    setNow(Date.now());
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const withBucket = useMemo(
    () => users.map((u) => ({ ...u, bucket: bucketOf(u.last_active, now) })),
    [users, now],
  );

  // Cumulative: "3 days" includes today, "7 days" includes both.
  const counts = useMemo(() => {
    const c = { all: withBucket.length, today: 0, "3d": 0, "7d": 0, inactive: 0, never: 0 };
    for (const u of withBucket) c[u.bucket]++;
    return { ...c, within3: c.today + c["3d"], within7: c.today + c["3d"] + c["7d"] };
  }, [withBucket]);

  const shown = useMemo(() => {
    const term = search.trim().toLowerCase();
    return withBucket.filter((u) => {
      if (filter === "within3" && !["today", "3d"].includes(u.bucket)) return false;
      if (filter === "within7" && !["today", "3d", "7d"].includes(u.bucket)) return false;
      if (["today", "inactive", "never"].includes(filter) && u.bucket !== filter) return false;
      if (!term) return true;
      return [u.display_name, u.username, u.email].some((v) => v?.toLowerCase().includes(term));
    });
  }, [withBucket, filter, search]);

  const cards = [
    { key: "all",      label: "Accounts",           value: counts.all,      icon: FiUsers,    color: "text-flare-soft" },
    { key: "today",    label: "Opened in 24 hours", value: counts.today,    icon: FiSun,      color: "text-green-400" },
    { key: "within3",  label: "Opened in 3 days",   value: counts.within3,  icon: FiCalendar, color: "text-amber-400" },
    { key: "within7",  label: "Opened in 7 days",   value: counts.within7,  icon: FiClock,    color: "text-flare-soft" },
    { key: "never",    label: "Never opened",       value: counts.never,    icon: FiMoon,     color: "text-dust" },
  ];

  const tabs = [
    { key: "all", label: "All" },
    { key: "today", label: "Today" },
    { key: "within3", label: "3 days" },
    { key: "within7", label: "7 days" },
    { key: "inactive", label: "Over 7 days" },
    { key: "never", label: "Never opened" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-star">Testing activity</h1>
          <p className="text-mist text-sm mt-1">
            Who has opened the app, for the Play closed test. Temporary: removed at production launch.
          </p>
        </div>
        <button onClick={load} disabled={loading}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium bg-night-800 text-mist hover:text-star disabled:opacity-50">
          <FiRefreshCw className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {error && (
        <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">
          Couldn't load users: {error}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {cards.map(({ key, label, value, icon: Icon, color }) => (
          <button key={key} onClick={() => setFilter(key)}
            className={`text-left bg-night-850 border rounded-xl p-5 transition-colors ${filter === key ? "border-flare" : "border-line hover:border-night-600"}`}>
            <Icon className={`text-xl ${color} mb-3`} />
            <div className="text-2xl font-bold text-star">{loading ? "…" : value}</div>
            <div className="text-mist text-xs mt-0.5">{label}</div>
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-dust text-sm" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, username or email…"
            className="w-full bg-night-800 border border-night-600 text-star text-sm rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:border-flare" />
        </div>
        <div className="flex flex-wrap gap-2">
          {tabs.map((t) => (
            <button key={t.key} onClick={() => setFilter(t.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === t.key ? "bg-flare-deep text-star" : "bg-night-800 text-mist hover:text-star"}`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-night-850 border border-line rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-mist text-xs">
                <th className="text-left px-4 py-3 font-medium">User</th>
                <th className="text-left px-4 py-3 font-medium">Email</th>
                <th className="text-left px-4 py-3 font-medium">Last opened</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium">Posts</th>
                <th className="text-left px-4 py-3 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody>
              {!loading && shown.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-dust">No one here.</td></tr>
              )}
              {shown.map((u) => (
                <tr key={u.id} className="border-b border-line/50 last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {u.avatar_url
                        ? <img src={u.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                        : <div className="w-8 h-8 rounded-full bg-night-700 flex-shrink-0" />}
                      <div className="min-w-0">
                        <div className="text-star truncate">{u.display_name || "—"}</div>
                        {u.username && <div className="text-dust text-xs truncate">@{u.username}</div>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-mist">{u.email || "—"}</td>
                  <td className="px-4 py-3 text-star whitespace-nowrap" title={fmt(u.last_active)}>
                    {ago(u.last_active, now)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${BUCKETS[u.bucket].pill}`}>
                      {BUCKETS[u.bucket].label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-mist">{u.total_post_count || 0}</td>
                  <td className="px-4 py-3 text-mist whitespace-nowrap">
                    {u.created_at ? new Date(u.created_at).toLocaleDateString(undefined, { dateStyle: "medium" }) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
