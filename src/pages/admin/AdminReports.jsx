import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { FiFilter, FiCheck, FiX } from "react-icons/fi";

const PAGE_SIZE = 20;

export default function AdminReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [typeFilter, setTypeFilter] = useState("all");
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState(null);

  useEffect(() => { loadReports(); }, [statusFilter, typeFilter, page]);

  async function loadReports() {
    setLoading(true);
    let q = supabase.from("content_reports").select("*", { count: "exact" });
    if (statusFilter !== "all") q = q.eq("status", statusFilter);
    if (typeFilter !== "all") q = q.eq("content_type", typeFilter);
    const { data, count } = await q.order("created_at", { ascending: false }).range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);
    setReports(data || []);
    setTotal(count || 0);
    setLoading(false);
  }

  async function resolveReport(id) {
    await supabase.from("content_reports").update({ status: "resolved", handled_at: new Date().toISOString() }).eq("id", id);
    setReports(prev => prev.map(r => r.id === id ? { ...r, status: "resolved" } : r));
    setSelected(null);
  }

  async function dismissReport(id) {
    await supabase.from("content_reports").update({ status: "dismissed", handled_at: new Date().toISOString() }).eq("id", id);
    setReports(prev => prev.map(r => r.id === id ? { ...r, status: "dismissed" } : r));
    setSelected(null);
  }

  const statusColor = s => ({ pending: "bg-amber-500/20 text-amber-400", resolved: "bg-green-500/20 text-green-400", dismissed: "bg-night-500/20 text-mist" }[s] || "bg-night-500/20 text-mist");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-star">Reports</h1>
        <p className="text-mist text-sm mt-1">{total.toLocaleString()} reports</p>
      </div>
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex gap-2">
          {["pending", "resolved", "dismissed", "all"].map(s => (
            <button key={s} onClick={() => { setStatusFilter(s); setPage(0); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${statusFilter === s ? "bg-flare-deep text-star" : "bg-night-800 text-mist hover:text-star"}`}>{s}</button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <FiFilter className="text-dust text-sm" />
          <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(0); }}
            className="bg-night-800 border border-night-600 text-mist text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-flare">
            <option value="all">All types</option>
            <option value="post">Post</option>
            <option value="comment">Comment</option>
            <option value="user">User</option>
            <option value="community">Community</option>
            <option value="message">Message</option>
          </select>
        </div>
      </div>
      <div className="bg-night-850 border border-line rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-mist text-xs">
                <th className="text-left px-4 py-3 font-medium">Reason</th>
                <th className="text-left px-4 py-3 font-medium">Type</th>
                <th className="text-left px-4 py-3 font-medium">Reporter</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i} className="border-b border-line/50">
                      {Array.from({ length: 5 }).map((_, j) => <td key={j} className="px-4 py-3"><div className="h-4 bg-night-800 rounded animate-pulse" /></td>)}
                      <td />
                    </tr>
                  ))
                : reports.length === 0
                  ? <tr><td colSpan={6} className="px-4 py-12 text-center text-dust">No reports found.</td></tr>
                  : reports.map(r => (
                      <tr key={r.id} className="border-b border-line/50 hover:bg-night-800/40 transition-colors">
                        <td className="px-4 py-3 text-star capitalize">{r.reason?.replace(/_/g, " ") || "—"}</td>
                        <td className="px-4 py-3 text-mist capitalize">{r.content_type || "—"}</td>
                        <td className="px-4 py-3 text-mist text-xs">{r.reporter_name || r.reporter_id?.slice(0, 8) || "—"}</td>
                        <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs capitalize ${statusColor(r.status)}`}>{r.status}</span></td>
                        <td className="px-4 py-3 text-dust text-xs">{formatDate(r.created_at)}</td>
                        <td className="px-4 py-3">
                          {r.status === "pending" && (
                            <button onClick={() => setSelected(r)}
                              className="px-3 py-1 text-xs bg-flare-deep/20 text-flare-soft rounded-lg hover:bg-flare-deep/40 transition-colors">Review</button>
                          )}
                        </td>
                      </tr>
                    ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-4 py-3 border-t border-line">
          <span className="text-dust text-xs">{Math.min(page * PAGE_SIZE + 1, total)}–{Math.min((page + 1) * PAGE_SIZE, total)} of {total.toLocaleString()}</span>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
              className="px-3 py-1 text-xs bg-night-800 text-mist rounded-lg disabled:opacity-40 hover:text-star">Prev</button>
            <button onClick={() => setPage(p => p + 1)} disabled={(page + 1) * PAGE_SIZE >= total}
              className="px-3 py-1 text-xs bg-night-800 text-mist rounded-lg disabled:opacity-40 hover:text-star">Next</button>
          </div>
        </div>
      </div>
      {selected && (
        <div className="fixed inset-0 z-50 bg-night-950/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-night-850 border border-line rounded-2xl p-6 max-w-md w-full space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-star font-semibold">Review Report</h3>
              <button onClick={() => setSelected(null)} className="text-dust hover:text-star"><FiX /></button>
            </div>
            <div className="space-y-2 text-sm">
              {[["Reason", selected.reason?.replace(/_/g, " ")],["Type", selected.content_type],["Content ID", selected.content_id],["Reporter", selected.reporter_name || selected.reporter_id]].map(([label, value]) => (
                <div key={label} className="flex gap-3">
                  <span className="text-dust text-xs w-24 flex-shrink-0 pt-0.5">{label}</span>
                  <span className="text-mist text-xs capitalize break-all">{value || "—"}</span>
                </div>
              ))}
              {selected.detailed_description && (
                <div>
                  <div className="text-dust text-xs mb-1">Details</div>
                  <p className="text-mist bg-night-800 rounded-lg p-3 text-xs">{selected.detailed_description}</p>
                </div>
              )}
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={() => dismissReport(selected.id)}
                className="flex-1 flex items-center justify-center gap-2 py-2 text-sm bg-night-800 text-mist rounded-lg hover:bg-night-700 transition-colors">
                <FiX className="text-sm" /> Dismiss
              </button>
              <button onClick={() => resolveReport(selected.id)}
                className="flex-1 flex items-center justify-center gap-2 py-2 text-sm bg-green-600 text-star rounded-lg hover:bg-green-500 transition-colors">
                <FiCheck className="text-sm" /> Resolve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function formatDate(ts) {
  if (!ts) return "—";
  return new Date(ts).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" });
}
