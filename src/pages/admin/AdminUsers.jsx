import { useEffect, useState, useRef } from "react";
import { supabase } from "../../lib/supabase";
import {
  FiSearch, FiMoreVertical, FiCheckCircle, FiSlash, FiShield,
  FiUser, FiUsers, FiHeart, FiFileText, FiTrendingUp
} from "react-icons/fi";

const PAGE_SIZE = 25;

// ── Verification thresholds ───────────────────────────────────────────────────
const VERIFY_MIN_FOLLOWERS = 500;
const VERIFY_MIN_LIKES     = 300;
const VERIFY_MIN_POSTS     = 20;

function MetricChip({ icon: Icon, value, highlight }) {
  return (
    <span className={`flex items-center gap-0.5 text-xs ${highlight ? "text-flare-soft" : "text-dust"}`}>
      <Icon className="text-xs" /> {(value || 0).toLocaleString()}
    </span>
  );
}

function verifyEligible(user) {
  return (
    !user.is_verified &&
    !user.is_suspended &&
    (
      (user.follower_count || 0) >= VERIFY_MIN_FOLLOWERS ||
      ((user.total_likes_received || 0) >= VERIFY_MIN_LIKES && (user.total_post_count || 0) >= VERIFY_MIN_POSTS)
    )
  );
}

export default function AdminUsers() {
  const [users, setUsers]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [filter, setFilter]     = useState("all");
  const [page, setPage]         = useState(0);
  const [total, setTotal]       = useState(0);
  const [menuOpen, setMenuOpen] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => { loadUsers(); }, [page, filter]);

  useEffect(() => {
    const handler = e => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(null);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const COLS = "id, firebase_uid, display_name, username, email, avatar_url, is_admin, is_verified, is_suspended, created_at, last_active, follower_count, total_post_count, total_likes_received";

  async function loadUsers() {
    setLoading(true);
    let q = supabase.from("users").select(COLS, { count: "exact" }).neq("is_deleted", true);

    if (filter === "suspended") {
      q = q.eq("is_suspended", true);
    } else if (filter === "verified") {
      q = q.eq("is_verified", true);
    } else if (filter === "admin") {
      q = q.eq("is_admin", true);
    } else if (filter === "pending") {
      q = q
        .eq("is_verified", false)
        .neq("is_suspended", true)
        .or(`follower_count.gte.${VERIFY_MIN_FOLLOWERS},and(total_likes_received.gte.${VERIFY_MIN_LIKES},total_post_count.gte.${VERIFY_MIN_POSTS})`);
    }

    const sortCol = filter === "pending" ? "follower_count" : "created_at";
    const { data, count } = await q
      .order(sortCol, { ascending: false })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    setUsers(data || []);
    setTotal(count || 0);
    setLoading(false);
  }

  async function searchUsers(term) {
    if (!term.trim()) { loadUsers(); return; }
    setLoading(true);
    const { data } = await supabase.from("users")
      .select(COLS)
      .or(`username.ilike.%${term}%,display_name.ilike.%${term}%,email.ilike.%${term}%`)
      .neq("is_deleted", true)
      .order("created_at", { ascending: false })
      .limit(50);
    setUsers(data || []);
    setLoading(false);
  }

  async function updateUser(uid, updates) {
    await supabase.from("users").update(updates).eq("firebase_uid", uid);
    setUsers(prev => prev.map(u => u.firebase_uid === uid ? { ...u, ...updates } : u));
    setMenuOpen(null);
  }

  const filtered = search
    ? users.filter(u =>
        (u.username || "").toLowerCase().includes(search.toLowerCase()) ||
        (u.display_name || "").toLowerCase().includes(search.toLowerCase()) ||
        (u.email || "").toLowerCase().includes(search.toLowerCase()))
    : users;

  const filterTabs = [
    { key: "all",       label: "All" },
    { key: "pending",   label: "✨ Pending Verification" },
    { key: "suspended", label: "Suspended" },
    { key: "verified",  label: "Verified" },
    { key: "admin",     label: "Admin" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-star">Users</h1>
        <p className="text-mist text-sm mt-1">{total.toLocaleString()} total accounts</p>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-dust text-sm" />
          <input type="text" value={search}
            onChange={e => { setSearch(e.target.value); searchUsers(e.target.value); }}
            placeholder="Search users…"
            className="w-full bg-night-800 border border-night-600 text-star text-sm rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:border-flare" />
        </div>
        <div className="flex flex-wrap gap-2">
          {filterTabs.map(f => (
            <button key={f.key} onClick={() => { setFilter(f.key); setPage(0); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === f.key ? "bg-flare-deep text-star" : "bg-night-800 text-mist hover:text-star"}`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {filter === "pending" && (
        <div className="flex items-center gap-2 text-xs text-dust bg-night-850 border border-line rounded-lg px-4 py-2.5">
          <FiTrendingUp className="text-flare-soft flex-shrink-0" />
          Users with <span className="text-star mx-1">{VERIFY_MIN_FOLLOWERS}+ followers</span> or
          <span className="text-star mx-1">{VERIFY_MIN_LIKES}+ likes</span> &amp;
          <span className="text-star mx-1">{VERIFY_MIN_POSTS}+ posts</span> — sorted by followers
        </div>
      )}

      <div className="bg-night-850 border border-line rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-mist text-xs">
                <th className="text-left px-4 py-3 font-medium">User</th>
                <th className="text-left px-4 py-3 font-medium">Email</th>
                <th className="text-left px-4 py-3 font-medium">Metrics</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium">Joined</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i} className="border-b border-line/50">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <td key={j} className="px-4 py-3">
                          <div className="h-4 bg-night-800 rounded animate-pulse w-24" />
                        </td>
                      ))}
                      <td />
                    </tr>
                  ))
                : filtered.map(user => {
                    const eligible = verifyEligible(user);
                    return (
                      <tr key={user.id}
                        className={`border-b border-line/50 hover:bg-night-800/40 transition-colors ${eligible && filter === "pending" ? "bg-flare-deep/10" : ""}`}>

                        {/* User */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-night-700 flex-shrink-0 flex items-center justify-center text-xs overflow-hidden">
                              {user.avatar_url
                                ? <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                                : (user.display_name?.[0] || "?").toUpperCase()}
                            </div>
                            <div>
                              <div className="text-star font-medium flex items-center gap-1.5 flex-wrap">
                                {user.display_name || "—"}
                                {user.is_verified && <FiCheckCircle className="text-flare-soft text-xs" title="Verified" />}
                                {user.is_admin    && <FiShield className="text-flare-soft text-xs" title="Admin" />}
                                {eligible && (
                                  <span className="text-flare-soft text-xs font-normal">eligible</span>
                                )}
                              </div>
                              <div className="text-dust text-xs">@{user.username || "—"}</div>
                            </div>
                          </div>
                        </td>

                        {/* Email */}
                        <td className="px-4 py-3 text-mist text-xs">{user.email || "—"}</td>

                        {/* Metrics */}
                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-0.5">
                            <MetricChip icon={FiUsers}    value={user.follower_count}      highlight={(user.follower_count || 0) >= VERIFY_MIN_FOLLOWERS} />
                            <MetricChip icon={FiHeart}    value={user.total_likes_received} highlight={(user.total_likes_received || 0) >= VERIFY_MIN_LIKES} />
                            <MetricChip icon={FiFileText} value={user.total_post_count}     highlight={(user.total_post_count || 0) >= VERIFY_MIN_POSTS} />
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3">
                          {user.is_suspended
                            ? <span className="px-2 py-0.5 rounded-full text-xs bg-red-500/20 text-red-400">Suspended</span>
                            : <span className="px-2 py-0.5 rounded-full text-xs bg-green-500/20 text-green-400">Active</span>}
                        </td>

                        {/* Joined */}
                        <td className="px-4 py-3 text-dust text-xs">{formatDate(user.created_at)}</td>

                        {/* Actions menu */}
                        <td className="px-4 py-3 relative" ref={menuOpen === user.firebase_uid ? menuRef : null}>
                          <button onClick={() => setMenuOpen(menuOpen === user.firebase_uid ? null : user.firebase_uid)}
                            className="p-1 rounded text-dust hover:text-star hover:bg-night-700 transition-colors">
                            <FiMoreVertical />
                          </button>
                          {menuOpen === user.firebase_uid && (
                            <div className="absolute right-4 top-8 z-20 bg-night-800 border border-night-600 rounded-xl shadow-xl py-1 min-w-[180px]">
                              {user.is_verified
                                ? <MenuItem icon={FiCheckCircle} label="Remove Verification"
                                    onClick={() => updateUser(user.firebase_uid, { is_verified: false })} />
                                : <MenuItem icon={FiCheckCircle} label="Verify Account"
                                    onClick={() => updateUser(user.firebase_uid, { is_verified: true })} />}
                              {user.is_suspended
                                ? <MenuItem icon={FiUser} label="Unsuspend"
                                    onClick={() => updateUser(user.firebase_uid, { is_suspended: false, suspension_reason: null })} />
                                : <MenuItem icon={FiSlash} label="Suspend" danger
                                    onClick={() => updateUser(user.firebase_uid, { is_suspended: true, suspended_at: new Date().toISOString() })} />}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
              }
            </tbody>
          </table>
        </div>

        {!search && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-line">
            <span className="text-dust text-xs">
              {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, total)} of {total.toLocaleString()}
            </span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                className="px-3 py-1 text-xs bg-night-800 text-mist rounded-lg disabled:opacity-40 hover:text-star">Prev</button>
              <button onClick={() => setPage(p => p + 1)} disabled={(page + 1) * PAGE_SIZE >= total}
                className="px-3 py-1 text-xs bg-night-800 text-mist rounded-lg disabled:opacity-40 hover:text-star">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MenuItem({ icon: Icon, label, onClick, danger }) {
  return (
    <button onClick={onClick}
      className={`flex items-center gap-2.5 w-full px-3 py-2 text-sm transition-colors ${danger ? "text-red-400 hover:bg-red-500/10" : "text-mist hover:bg-night-700"}`}>
      <Icon className="text-base" />{label}
    </button>
  );
}

function formatDate(ts) {
  if (!ts) return "—";
  return new Date(ts).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" });
}
