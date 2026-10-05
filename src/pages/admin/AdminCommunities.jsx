import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import {
  FiSearch, FiStar, FiTrash2, FiZap, FiLayers, FiClock,
  FiArchive, FiSlash, FiAlertTriangle, FiFlag, FiCheckCircle, FiUsers
} from "react-icons/fi";

const PAGE_SIZE = 20;

// ── Metric thresholds ─────────────────────────────────────────────────────────
const VERIFY_MIN_MEMBERS = 200;
const VERIFY_MIN_POSTS   = 20;
const AT_RISK_MIN        = 3;   // 3–4 pending reports → at risk
const SUSPEND_MIN        = 5;   // 5+ pending reports  → pending suspension

// ── Helpers ───────────────────────────────────────────────────────────────────
function flashLifecycle(c) {
  if (c.is_suspended) return "suspended";
  if (c.is_archived)  return "archived";
  if (c.flash_lifecycle_state === "expiredPendingDecision") return "deciding";
  if (c.expires_at && new Date(c.expires_at) < new Date()) return "deciding";
  return "live";
}

function ReportBadge({ count }) {
  if (!count) return null;
  const color = count >= SUSPEND_MIN
    ? "bg-red-500/20 text-red-400"
    : "bg-amber-500/20 text-amber-400";
  return (
    <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${color}`}>
      <FiFlag className="text-xs" /> {count} report{count !== 1 ? "s" : ""}
    </span>
  );
}

function FlashBadge({ community }) {
  const state = flashLifecycle(community);
  const map = {
    live:      { label: "Live",      cls: "bg-green-500/20 text-green-400",  icon: FiZap },
    deciding:  { label: "Deciding",  cls: "bg-amber-500/20 text-amber-400",  icon: FiClock },
    archived:  { label: "Archived",  cls: "bg-night-500/20 text-mist",    icon: FiArchive },
    suspended: { label: "Suspended", cls: "bg-red-500/20 text-red-400",      icon: FiSlash },
  };
  const { label, cls, icon: Icon } = map[state] || map.archived;
  return (
    <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${cls}`}>
      <Icon className="text-xs" /> {label}
    </span>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function AdminCommunities() {
  const [tab, setTab]               = useState("normal");
  const [filter, setFilter]         = useState("all");       // normal sub-filter
  const [flashFilter, setFlashFilter] = useState("all");     // flash sub-filter
  const [communities, setCommunities] = useState([]);
  const [reportCounts, setReportCounts] = useState({});      // id → pending report count
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [page, setPage]             = useState(0);
  const [total, setTotal]           = useState(0);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [suspendTarget, setSuspendTarget] = useState(null);
  const [suspendReason, setSuspendReason] = useState("");

  useEffect(() => { loadCommunities(); }, [tab, filter, flashFilter, page]);

  // ── Load communities ────────────────────────────────────────────────────────
  async function loadCommunities() {
    setLoading(true);
    setReportCounts({});

    try {
      if (tab === "normal") {
        await loadNormal();
      } else {
        await loadFlash();
      }
    } catch (e) {
      console.error("loadCommunities:", e);
    }

    setLoading(false);
  }

  async function loadNormal() {
    // At-risk / pending-suspension filters need report aggregation first
    if (filter === "at_risk" || filter === "pending_suspension") {
      const { data: reps } = await supabase
        .from("content_reports")
        .select("content_id")
        .eq("content_type", "community")
        .eq("status", "pending");

      const counts = {};
      (reps || []).forEach(r => {
        if (r.content_id) counts[r.content_id] = (counts[r.content_id] || 0) + 1;
      });
      setReportCounts(counts);

      const ids = Object.entries(counts)
        .filter(([, c]) => filter === "at_risk" ? c >= AT_RISK_MIN && c < SUSPEND_MIN : c >= SUSPEND_MIN)
        .map(([id]) => id);

      if (!ids.length) { setCommunities([]); setTotal(0); return; }

      const { data, count, error } = await supabase
        .from("communities")
        .select("id, name, description, type, member_count, post_count, created_at, category, is_suspended, verification_status", { count: "exact" })
        .in("id", ids)
        .neq("is_archived", true)
        .order("created_at", { ascending: false })
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

      if (error) console.error(error);
      setCommunities(data || []);
      setTotal(count || 0);
      return;
    }

    // Standard filters
    let q = supabase
      .from("communities")
      .select("id, name, description, type, member_count, post_count, created_at, category, is_suspended, verification_status", { count: "exact" })
      .neq("is_archived", true);

    if (filter === "suspended") {
      q = q.eq("is_suspended", true);
    } else if (filter === "pending_verification") {
      q = q
        .neq("type", "nexoraOfficial")
        .neq("is_suspended", true)
        .gte("member_count", VERIFY_MIN_MEMBERS)
        .gte("post_count", VERIFY_MIN_POSTS);
    }
    // "all" — no extra filter

    const { data, count, error } = await q
      .order("member_count", { ascending: false })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    if (error) console.error(error);
    const rows = data || [];
    setCommunities(rows);
    setTotal(count || 0);

    // Batch-load report counts for this page
    if (rows.length) {
      const ids = rows.map(c => c.id);
      const { data: reps } = await supabase
        .from("content_reports")
        .select("content_id")
        .eq("content_type", "community")
        .eq("status", "pending")
        .in("content_id", ids);
      const counts = {};
      (reps || []).forEach(r => {
        if (r.content_id) counts[r.content_id] = (counts[r.content_id] || 0) + 1;
      });
      setReportCounts(counts);
    }
  }

  async function loadFlash() {
    // Flagged filter needs report pre-aggregation
    if (flashFilter === "flagged" || flashFilter === "pending_suspension") {
      const { data: reps } = await supabase
        .from("content_reports")
        .select("content_id")
        .eq("content_type", "community")
        .eq("status", "pending");

      const counts = {};
      (reps || []).forEach(r => {
        if (r.content_id) counts[r.content_id] = (counts[r.content_id] || 0) + 1;
      });
      setReportCounts(counts);

      const ids = Object.entries(counts)
        .filter(([, c]) => c >= SUSPEND_MIN)
        .map(([id]) => id);

      if (!ids.length) { setCommunities([]); setTotal(0); return; }

      const { data, count, error } = await supabase
        .from("flash_communities")
        .select("id, name, description, type, member_count, created_at, category, is_archived, expires_at, flash_lifecycle_state, is_suspended", { count: "exact" })
        .in("id", ids)
        .order("created_at", { ascending: false })
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

      if (error) console.error(error);
      setCommunities(data || []);
      setTotal(count || 0);
      return;
    }

    let q = supabase
      .from("flash_communities")
      .select("id, name, description, type, member_count, created_at, category, is_archived, expires_at, flash_lifecycle_state, is_suspended", { count: "exact" });

    const now = new Date().toISOString();
    if (flashFilter === "live") {
      q = q.neq("is_archived", true).neq("is_suspended", true)
           .or("flash_lifecycle_state.is.null,flash_lifecycle_state.eq.active")
           .gt("expires_at", now);
    } else if (flashFilter === "deciding") {
      q = q.neq("is_archived", true).neq("is_suspended", true)
           .eq("flash_lifecycle_state", "expiredPendingDecision");
    } else if (flashFilter === "archived") {
      q = q.eq("is_archived", true);
    } else if (flashFilter === "suspended") {
      q = q.eq("is_suspended", true);
    }
    // "all" — no filter

    const { data, count, error } = await q
      .order("created_at", { ascending: false })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    if (error) console.error(error);
    const rows = data || [];
    setCommunities(rows);
    setTotal(count || 0);

    // Batch report counts
    if (rows.length) {
      const ids = rows.map(c => c.id);
      const { data: reps } = await supabase
        .from("content_reports")
        .select("content_id")
        .eq("content_type", "community")
        .eq("status", "pending")
        .in("content_id", ids);
      const counts = {};
      (reps || []).forEach(r => {
        if (r.content_id) counts[r.content_id] = (counts[r.content_id] || 0) + 1;
      });
      setReportCounts(counts);
    }
  }

  // ── Actions ─────────────────────────────────────────────────────────────────
  async function verifyCommunity(id) {
    await supabase.from("communities").update({ type: "nexoraOfficial" }).eq("id", id);
    setCommunities(prev => prev.map(c => c.id === id ? { ...c, type: "nexoraOfficial" } : c));
  }

  async function unverify(id) {
    await supabase.from("communities").update({ type: "public" }).eq("id", id);
    setCommunities(prev => prev.map(c => c.id === id ? { ...c, type: "public" } : c));
  }

  async function confirmSuspend() {
    if (!suspendTarget) return;
    const table = tab === "normal" ? "communities" : "flash_communities";
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from(table).update({
      is_suspended: true,
      suspended_at: new Date().toISOString(),
      suspension_reason: suspendReason || null,
      suspended_by: user?.email || null,
    }).eq("id", suspendTarget.id);
    setCommunities(prev => prev.map(c => c.id === suspendTarget.id ? { ...c, is_suspended: true } : c));
    setSuspendTarget(null);
    setSuspendReason("");
  }

  async function unsuspend(id) {
    const table = tab === "normal" ? "communities" : "flash_communities";
    await supabase.from(table).update({
      is_suspended: false,
      suspended_at: null,
      suspension_reason: null,
      suspended_by: null,
    }).eq("id", id);
    setCommunities(prev => prev.map(c => c.id === id ? { ...c, is_suspended: false } : c));
  }

  async function deleteCommunity(id) {
    const table = tab === "normal" ? "communities" : "flash_communities";
    await supabase.from(table).delete().eq("id", id);
    setCommunities(prev => prev.filter(c => c.id !== id));
    setTotal(t => t - 1);
    setConfirmDelete(null);
  }

  // ── Derived ──────────────────────────────────────────────────────────────────
  const filtered = search
    ? communities.filter(c => (c.name || "").toLowerCase().includes(search.toLowerCase()))
    : communities;

  const normalFilters = [
    { key: "all",                  label: "All" },
    { key: "pending_verification", label: "✨ Pending Verification" },
    { key: "at_risk",              label: "⚠️ At Risk" },
    { key: "pending_suspension",   label: "🔴 Flagged" },
    { key: "suspended",            label: "🚫 Suspended" },
  ];

  const flashFilters = [
    { key: "all",               label: "All" },
    { key: "live",              label: "⚡ Live" },
    { key: "deciding",          label: "⏳ Deciding" },
    { key: "archived",          label: "📦 Archived" },
    { key: "pending_suspension",label: "🔴 Flagged" },
    { key: "suspended",         label: "🚫 Suspended" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-star">Communities</h1>
        <p className="text-mist text-sm mt-1">{total.toLocaleString()} {tab === "normal" ? "communities" : "Flashes"}</p>
      </div>

      {/* Main tabs */}
      <div className="flex gap-2">
        <button onClick={() => { setTab("normal"); setFilter("all"); setPage(0); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === "normal" ? "bg-flare-deep text-star" : "bg-night-800 text-mist hover:text-star"}`}>
          <FiLayers className="text-sm" /> Communities
        </button>
        <button onClick={() => { setTab("flash"); setFlashFilter("all"); setPage(0); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === "flash" ? "bg-amber-600 text-star" : "bg-night-800 text-mist hover:text-star"}`}>
          <FiZap className="text-sm" /> Flash
        </button>
      </div>

      {/* Sub-filters */}
      <div className="flex flex-wrap gap-2">
        {(tab === "normal" ? normalFilters : flashFilters).map(f => {
          const active = tab === "normal" ? filter === f.key : flashFilter === f.key;
          return (
            <button key={f.key}
              onClick={() => { tab === "normal" ? setFilter(f.key) : setFlashFilter(f.key); setPage(0); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${active ? "bg-night-700 text-star" : "bg-night-850 text-dust hover:text-star border border-line"}`}>
              {f.label}
            </button>
          );
        })}
      </div>

      {/* Metric legend */}
      {tab === "normal" && filter === "pending_verification" && (
        <div className="flex items-center gap-2 text-xs text-dust bg-night-850 border border-line rounded-lg px-4 py-2.5">
          <FiCheckCircle className="text-flare-soft flex-shrink-0" />
          Showing communities with <span className="text-star mx-1">{VERIFY_MIN_MEMBERS}+ members</span> and
          <span className="text-star mx-1">{VERIFY_MIN_POSTS}+ posts</span> not yet Official
        </div>
      )}
      {(filter === "at_risk" || filter === "pending_suspension") && tab === "normal" && (
        <div className="flex items-center gap-2 text-xs text-dust bg-night-850 border border-line rounded-lg px-4 py-2.5">
          <FiAlertTriangle className="text-amber-400 flex-shrink-0" />
          {filter === "at_risk"
            ? `Communities with ${AT_RISK_MIN}–${SUSPEND_MIN - 1} pending reports`
            : `Communities with ${SUSPEND_MIN}+ pending reports — consider suspending`}
        </div>
      )}

      {/* Search */}
      <div className="relative max-w-xs">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-dust text-sm" />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search communities…"
          className="w-full bg-night-800 border border-night-600 text-star text-sm rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:border-flare" />
      </div>

      {/* Grid */}
      {loading
        ? <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-night-850 border border-line rounded-xl p-5 animate-pulse">
                <div className="h-4 bg-night-800 rounded w-3/4 mb-3" />
                <div className="h-3 bg-night-800 rounded w-1/2" />
              </div>
            ))}
          </div>
        : filtered.length === 0
          ? <div className="text-dust text-sm py-12 text-center">No communities found.</div>
          : <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map(community => {
                const rCount = reportCounts[community.id] || 0;
                const isVerifiable = tab === "normal"
                  && community.type !== "nexoraOfficial"
                  && (community.member_count || 0) >= VERIFY_MIN_MEMBERS
                  && (community.post_count || 0) >= VERIFY_MIN_POSTS;

                return (
                  <div key={community.id}
                    className={`bg-night-850 border rounded-xl p-5 space-y-3 ${community.is_suspended ? "border-red-900/60" : rCount >= SUSPEND_MIN ? "border-amber-900/60" : "border-line"}`}>

                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-star font-semibold text-sm truncate">{community.name}</h3>
                          {tab === "flash" && <FlashBadge community={community} />}
                          {tab === "normal" && community.type === "nexoraOfficial" && (
                            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-flare/20 text-flare-soft">
                              <FiStar className="text-xs" /> Official
                            </span>
                          )}
                          {tab === "normal" && community.is_suspended && (
                            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-red-500/20 text-red-400">
                              <FiSlash className="text-xs" /> Suspended
                            </span>
                          )}
                          {isVerifiable && !community.is_suspended && (
                            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-flare/20 text-flare-soft">
                              <FiCheckCircle className="text-xs" /> Verify eligible
                            </span>
                          )}
                        </div>

                        {/* Meta */}
                        <div className="text-dust text-xs mt-1 capitalize flex flex-wrap items-center gap-x-2 gap-y-0.5">
                          <span className="flex items-center gap-1">
                            <FiUsers className="text-xs" /> {(community.member_count || 0).toLocaleString()}
                          </span>
                          {tab === "normal" && community.post_count != null && (
                            <span>{community.post_count.toLocaleString()} posts</span>
                          )}
                          {tab === "flash" && community.expires_at && (
                            <span>Expires {new Date(community.expires_at).toLocaleDateString()}</span>
                          )}
                          <span className="capitalize">{community.category || "uncategorised"}</span>
                        </div>

                        {/* Report badge */}
                        {rCount > 0 && <div className="mt-1.5"><ReportBadge count={rCount} /></div>}
                      </div>
                    </div>

                    {community.description && (
                      <p className="text-mist text-xs line-clamp-2">{community.description}</p>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-1 flex-wrap">
                      {/* Verify / Unverify — normal only */}
                      {tab === "normal" && !community.is_suspended && (
                        community.type === "nexoraOfficial"
                          ? <button onClick={() => unverify(community.id)}
                              className="flex-1 text-xs py-1.5 rounded-lg bg-flare/20 text-flare-soft hover:bg-flare/30 transition-colors">
                              Remove Official
                            </button>
                          : <button onClick={() => verifyCommunity(community.id)}
                              className="flex-1 text-xs py-1.5 rounded-lg bg-flare/20 text-flare-soft hover:bg-flare/30 transition-colors flex items-center justify-center gap-1">
                              <FiStar className="text-xs" /> Make Official
                            </button>
                      )}

                      {/* Suspend / Unsuspend */}
                      {community.is_suspended
                        ? <button onClick={() => unsuspend(community.id)}
                            className="flex-1 text-xs py-1.5 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors flex items-center justify-center gap-1">
                            <FiCheckCircle className="text-xs" /> Unsuspend
                          </button>
                        : <button onClick={() => { setSuspendTarget(community); setSuspendReason(""); }}
                            className="flex-1 text-xs py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors flex items-center justify-center gap-1">
                            <FiSlash className="text-xs" /> Suspend
                          </button>
                      }

                      {/* Delete */}
                      <button onClick={() => setConfirmDelete(community)}
                        className="p-1.5 rounded-lg text-dust hover:text-red-400 hover:bg-red-500/10 transition-colors">
                        <FiTrash2 className="text-sm" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
      }

      {/* Pagination */}
      {!search && total > 0 && (
        <div className="flex items-center justify-between">
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

      {/* Suspend modal */}
      {suspendTarget && (
        <div className="fixed inset-0 z-50 bg-night-950/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-night-850 border border-line rounded-2xl p-6 max-w-sm w-full space-y-4">
            <div>
              <h3 className="text-star font-semibold">Suspend community?</h3>
              <p className="text-mist text-sm mt-1">
                <span className="text-star font-medium">"{suspendTarget.name}"</span> will be suspended and hidden from users.
              </p>
            </div>
            <div>
              <label className="text-mist text-xs block mb-1.5">Reason (optional)</label>
              <textarea value={suspendReason} onChange={e => setSuspendReason(e.target.value)}
                rows={3} placeholder="e.g. Repeated policy violations"
                className="w-full bg-night-800 border border-night-600 text-star text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-red-500 resize-none" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setSuspendTarget(null)}
                className="flex-1 py-2 text-sm bg-night-800 text-mist rounded-lg hover:bg-night-700 transition-colors">Cancel</button>
              <button onClick={confirmSuspend}
                className="flex-1 py-2 text-sm bg-red-600 text-star rounded-lg hover:bg-red-500 transition-colors">Suspend</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 bg-night-950/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-night-850 border border-line rounded-2xl p-6 max-w-sm w-full">
            <h3 className="text-star font-semibold mb-2">Delete community?</h3>
            <p className="text-mist text-sm mb-5">
              <span className="text-star font-medium">"{confirmDelete.name}"</span> and all its content will be permanently deleted.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)}
                className="flex-1 py-2 text-sm bg-night-800 text-mist rounded-lg hover:bg-night-700 transition-colors">Cancel</button>
              <button onClick={() => deleteCommunity(confirmDelete.id)}
                className="flex-1 py-2 text-sm bg-red-600 text-star rounded-lg hover:bg-red-500 transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
