import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import {
  FiMail, FiSearch, FiX, FiChevronRight,
  FiAlertCircle, FiCheckCircle, FiClock, FiArchive, FiDatabase,
} from "react-icons/fi";

const PAGE_SIZE = 25;

const STATUS_OPTIONS = ["new", "in_progress", "resolved", "closed"];
const PRIORITY_OPTIONS = ["low", "normal", "high", "urgent"];
const CATEGORY_OPTIONS = ["all", "general", "bug", "safety", "feedback", "billing", "other"];

const STATUS_STYLES = {
  new:         { label: "New",         color: "bg-flare/20 text-flare-soft" },
  in_progress: { label: "In progress", color: "bg-amber-500/20 text-amber-400" },
  resolved:    { label: "Resolved",    color: "bg-green-500/20 text-green-400" },
  closed:      { label: "Closed",      color: "bg-night-700 text-dust" },
};

const PRIORITY_STYLES = {
  low:    "bg-night-700 text-mist",
  normal: "bg-night-700 text-mist",
  high:   "bg-flare/20 text-flare-soft",
  urgent: "bg-red-500/20 text-red-400",
};

const MAIN_TABS = [
  { key: "messages",     label: "Messages",      icon: FiMail },
  { key: "data_requests", label: "Data Requests", icon: FiDatabase },
];

export default function AdminMessages() {
  const [mainTab, setMainTab] = useState("messages");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-star">Inbox</h1>
        <p className="text-mist text-sm mt-1">Contact form submissions and data / privacy requests.</p>
      </div>
      <div className="flex gap-2">
        {MAIN_TABS.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setMainTab(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mainTab === key ? "bg-flare-deep text-star" : "bg-night-800 text-mist hover:text-star"}`}>
            <Icon className="text-sm" />{label}
          </button>
        ))}
      </div>
      {mainTab === "messages"      && <MessagesTab />}
      {mainTab === "data_requests" && <DataRequestsTab />}
    </div>
  );
}

function MessagesTab() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [statusFilter, setStatusFilter]   = useState("new");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [page, setPage]         = useState(0);
  const [total, setTotal]       = useState(0);
  const [selected, setSelected] = useState(null); // open message

  useEffect(() => { load(); }, [statusFilter, categoryFilter, page]);

  async function load() {
    setLoading(true);
    let q = supabase.from("support_messages")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false });

    if (statusFilter !== "all")   q = q.eq("status", statusFilter);
    if (categoryFilter !== "all") q = q.eq("category", categoryFilter);

    const { data, count } = await q.range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);
    setMessages(data || []);
    setTotal(count || 0);
    setLoading(false);
  }

  async function updateMessage(id, updates) {
    await supabase.from("support_messages").update(updates).eq("id", id);
    setMessages(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
    if (selected?.id === id) setSelected(prev => ({ ...prev, ...updates }));
  }

  const filtered = search.trim()
    ? messages.filter(m =>
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.email.toLowerCase().includes(search.toLowerCase()) ||
        m.subject.toLowerCase().includes(search.toLowerCase()) ||
        m.message.toLowerCase().includes(search.toLowerCase()))
    : messages;

  // Counts for tab badges
  const [counts, setCounts] = useState({});
  useEffect(() => {
    Promise.all(STATUS_OPTIONS.map(s =>
      supabase.from("support_messages").select("*", { count: "exact", head: true }).eq("status", s)
        .then(({ count }) => [s, count])
    )).then(pairs => setCounts(Object.fromEntries(pairs)));
  }, [messages]);

  return (
    <div className="space-y-6">
      {/* Status tabs */}
      <div className="flex flex-wrap gap-2">
        {[["all", "All"], ...STATUS_OPTIONS.map(s => [s, STATUS_STYLES[s].label])].map(([val, label]) => (
          <button key={val} onClick={() => { setStatusFilter(val); setPage(0); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${statusFilter === val ? "bg-flare-deep text-star" : "bg-night-800 text-mist hover:text-star"}`}>
            {label}
            {val !== "all" && counts[val] > 0 && (
              <span className={`px-1.5 py-0.5 rounded-full text-xs ${statusFilter === val ? "bg-white/20" : "bg-night-700"}`}>{counts[val]}</span>
            )}
          </button>
        ))}
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-dust text-sm" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search messages…"
            className="w-full bg-night-800 border border-night-600 text-star text-sm rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:border-flare" />
        </div>
        <select value={categoryFilter} onChange={e => { setCategoryFilter(e.target.value); setPage(0); }}
          className="bg-night-800 border border-night-600 text-mist text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-flare capitalize">
          {CATEGORY_OPTIONS.map(c => <option key={c} value={c} className="capitalize">{c === "all" ? "All categories" : c}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-night-850 border border-line rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-mist text-xs">
                <th className="text-left px-4 py-3 font-medium">From</th>
                <th className="text-left px-4 py-3 font-medium">Subject</th>
                <th className="text-left px-4 py-3 font-medium">Category</th>
                <th className="text-left px-4 py-3 font-medium">Priority</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium">Received</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i} className="border-b border-line/50">
                      {Array.from({ length: 6 }).map((_, j) => (
                        <td key={j} className="px-4 py-3"><div className="h-4 bg-night-800 rounded animate-pulse" /></td>
                      ))}
                      <td />
                    </tr>
                  ))
                : filtered.length === 0
                  ? <tr><td colSpan={7} className="px-4 py-12 text-center text-dust">No messages found.</td></tr>
                  : filtered.map(msg => (
                      <tr key={msg.id}
                        onClick={() => setSelected(msg)}
                        className={`border-b border-line/50 hover:bg-night-800/40 transition-colors cursor-pointer ${msg.status === "new" ? "font-medium" : ""}`}>
                        <td className="px-4 py-3">
                          <div className="text-star text-sm">{msg.name}</div>
                          <div className="text-dust text-xs">{msg.email}</div>
                        </td>
                        <td className="px-4 py-3 text-mist max-w-[200px] truncate">{msg.subject || msg.category}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded-full text-xs bg-night-800 text-mist capitalize">{msg.category}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs capitalize ${PRIORITY_STYLES[msg.priority]}`}>{msg.priority}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs ${STATUS_STYLES[msg.status]?.color}`}>{STATUS_STYLES[msg.status]?.label}</span>
                        </td>
                        <td className="px-4 py-3 text-dust text-xs">{formatDate(msg.created_at)}</td>
                        <td className="px-4 py-3">
                          <FiChevronRight className="text-dust" />
                        </td>
                      </tr>
                    ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!search && total > PAGE_SIZE && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-line">
            <span className="text-dust text-xs">{page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, total)} of {total.toLocaleString()}</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                className="px-3 py-1 text-xs bg-night-800 text-mist rounded-lg disabled:opacity-40 hover:text-star">Prev</button>
              <button onClick={() => setPage(p => p + 1)} disabled={(page + 1) * PAGE_SIZE >= total}
                className="px-3 py-1 text-xs bg-night-800 text-mist rounded-lg disabled:opacity-40 hover:text-star">Next</button>
            </div>
          </div>
        )}
      </div>

      {/* Message detail panel */}
      {selected && (
        <MessagePanel
          msg={selected}
          onClose={() => setSelected(null)}
          onUpdate={(updates) => updateMessage(selected.id, updates)}
        />
      )}
    </div>
  );
}

/* ─── MESSAGE DETAIL PANEL ──────────────────────────────────────────────── */

function MessagePanel({ msg, onClose, onUpdate }) {
  const [status, setStatus]     = useState(msg.status);
  const [priority, setPriority] = useState(msg.priority);
  const [notes, setNotes]       = useState(msg.admin_notes || "");
  const [saving, setSaving]     = useState(false);
  const [notesSaved, setNotesSaved] = useState(false);

  async function handleStatusChange(val) {
    setStatus(val);
    await onUpdate({ status: val });
  }

  async function handlePriorityChange(val) {
    setPriority(val);
    await onUpdate({ priority: val });
  }

  async function saveNotes() {
    setSaving(true);
    await onUpdate({ admin_notes: notes });
    setSaving(false);
    setNotesSaved(true);
    setTimeout(() => setNotesSaved(false), 2000);
  }

  return (
    <div className="fixed inset-0 z-50 bg-night-950/75 backdrop-blur-sm flex items-start justify-end">
      <div className="w-full max-w-xl h-full bg-night-850 border-l border-line flex flex-col overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-line flex-shrink-0">
          <h3 className="text-star font-semibold truncate pr-4">{msg.subject || msg.category}</h3>
          <button onClick={onClose} className="text-dust hover:text-star transition-colors flex-shrink-0"><FiX /></button>
        </div>

        <div className="flex-1 p-6 space-y-6">

          {/* Sender info */}
          <div className="bg-night-800 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-mist text-xs">From</span>
              <a href={`mailto:${msg.email}`} className="text-flare-soft text-xs hover:underline">{msg.email}</a>
            </div>
            <div className="text-star font-medium">{msg.name}</div>
            <div className="flex items-center gap-2 pt-1">
              <span className="px-2 py-0.5 rounded-full text-xs bg-night-700 text-mist capitalize">{msg.category}</span>
              <span className="px-2 py-0.5 rounded-full text-xs bg-night-700 text-mist capitalize">{msg.source}</span>
              <span className="text-dust text-xs ml-auto">{formatDate(msg.created_at)}</span>
            </div>
          </div>

          {/* Message */}
          <div>
            <p className="text-mist text-xs font-medium mb-2">Message</p>
            <div className="bg-night-800 rounded-xl p-4 text-star text-sm whitespace-pre-wrap leading-relaxed">
              {msg.message}
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-mist text-xs font-medium mb-1.5">Status</label>
              <select value={status} onChange={e => handleStatusChange(e.target.value)}
                className="w-full bg-night-800 border border-night-600 text-star text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-flare">
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{STATUS_STYLES[s].label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-mist text-xs font-medium mb-1.5">Priority</label>
              <select value={priority} onChange={e => handlePriorityChange(e.target.value)}
                className="w-full bg-night-800 border border-night-600 text-star text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-flare capitalize">
                {PRIORITY_OPTIONS.map(p => <option key={p} value={p} className="capitalize">{p}</option>)}
              </select>
            </div>
          </div>

          {/* Quick status buttons */}
          <div className="flex gap-2">
            <button onClick={() => handleStatusChange("in_progress")} disabled={status === "in_progress"}
              className="flex-1 flex items-center justify-center gap-2 py-2 text-xs rounded-lg bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 disabled:opacity-40 transition-colors">
              <FiClock /> In progress
            </button>
            <button onClick={() => handleStatusChange("resolved")} disabled={status === "resolved"}
              className="flex-1 flex items-center justify-center gap-2 py-2 text-xs rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 disabled:opacity-40 transition-colors">
              <FiCheckCircle /> Resolve
            </button>
            <button onClick={() => handleStatusChange("closed")} disabled={status === "closed"}
              className="flex-1 flex items-center justify-center gap-2 py-2 text-xs rounded-lg bg-night-700 text-mist hover:bg-night-600 disabled:opacity-40 transition-colors">
              <FiArchive /> Close
            </button>
          </div>

          {/* Reply via email shortcut */}
          <div className="bg-night-800 border border-night-600 rounded-xl p-4">
            <p className="text-mist text-xs mb-2">Reply to this message</p>
            <p className="text-dust text-xs mb-3">Opens your email client. Remember to mark the message as resolved when done.</p>
            <a href={`mailto:${msg.email}?subject=Re: ${encodeURIComponent(msg.subject || "Your message to Starstreak")}&body=%0A%0A----%0AOriginal message from ${encodeURIComponent(msg.name)}:%0A${encodeURIComponent(msg.message)}`}
              className="flex items-center justify-center gap-2 w-full py-2 text-sm bg-flare-deep hover:bg-flare text-star rounded-lg transition-colors">
              <FiMail /> Reply via email
            </a>
          </div>

          {/* Internal notes */}
          <div>
            <label className="block text-mist text-xs font-medium mb-1.5">Internal notes (not shown to user)</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={4}
              placeholder="Add notes for the team…"
              className="w-full bg-night-800 border border-night-600 text-star text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-flare resize-none" />
            <button onClick={saveNotes} disabled={saving}
              className={`mt-2 w-full py-2 text-sm rounded-lg transition-colors ${notesSaved ? "bg-green-600 text-star" : "bg-night-700 text-mist hover:bg-night-600 disabled:opacity-50"}`}>
              {saving ? "Saving…" : notesSaved ? "Saved!" : "Save notes"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

/* ─── DATA REQUESTS TAB ─────────────────────────────────────────────────── */

const DR_STATUS_OPTIONS = ["pending", "verifying", "processing", "completed", "rejected"];
const DR_STATUS_STYLES  = {
  pending:    { label: "Pending",    color: "bg-flare/20 text-flare-soft" },
  verifying:  { label: "Verifying", color: "bg-amber-500/20 text-amber-400" },
  processing: { label: "Processing", color: "bg-flare/20 text-flare-soft" },
  completed:  { label: "Completed", color: "bg-green-500/20 text-green-400" },
  rejected:   { label: "Rejected",  color: "bg-red-500/20 text-red-400" },
};

const DR_TYPE_LABELS = {
  export:      "Data export",
  deletion:    "Account deletion",
  correction:  "Data correction",
  restriction: "Restrict processing",
};

function DataRequestsTab() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [search, setSearch]     = useState("");
  const [selected, setSelected] = useState(null);
  const [page, setPage]         = useState(0);
  const [total, setTotal]       = useState(0);

  useEffect(() => { load(); }, [statusFilter, page]);

  async function load() {
    setLoading(true);
    let q = supabase.from("data_requests").select("*", { count: "exact" }).order("created_at", { ascending: false });
    if (statusFilter !== "all") q = q.eq("status", statusFilter);
    const { data, count } = await q.range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);
    setRequests(data || []);
    setTotal(count || 0);
    setLoading(false);
  }

  async function updateRequest(id, updates) {
    await supabase.from("data_requests").update(updates).eq("id", id);
    setRequests(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
    if (selected?.id === id) setSelected(prev => ({ ...prev, ...updates }));
  }

  const filtered = search.trim()
    ? requests.filter(r =>
        r.name.toLowerCase().includes(search.toLowerCase()) ||
        r.email.toLowerCase().includes(search.toLowerCase()))
    : requests;

  return (
    <div className="space-y-6">
      {/* Status tabs */}
      <div className="flex flex-wrap gap-2">
        {[["all", "All"], ...DR_STATUS_OPTIONS.map(s => [s, DR_STATUS_STYLES[s].label])].map(([val, label]) => (
          <button key={val} onClick={() => { setStatusFilter(val); setPage(0); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${statusFilter === val ? "bg-flare-deep text-star" : "bg-night-800 text-mist hover:text-star"}`}>
            {label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-xs">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-dust text-sm" />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or email…"
          className="w-full bg-night-800 border border-night-600 text-star text-sm rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:border-flare" />
      </div>

      {/* Table */}
      <div className="bg-night-850 border border-line rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-mist text-xs">
                <th className="text-left px-4 py-3 font-medium">From</th>
                <th className="text-left px-4 py-3 font-medium">Request type</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium">Submitted</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-line/50">
                      {[1,2,3,4].map(j => <td key={j} className="px-4 py-3"><div className="h-4 bg-night-800 rounded animate-pulse" /></td>)}
                      <td />
                    </tr>
                  ))
                : filtered.length === 0
                  ? <tr><td colSpan={5} className="px-4 py-12 text-center text-dust">No requests found.</td></tr>
                  : filtered.map(req => (
                      <tr key={req.id} onClick={() => setSelected(req)}
                        className="border-b border-line/50 hover:bg-night-800/40 transition-colors cursor-pointer">
                        <td className="px-4 py-3">
                          <div className="text-star text-sm font-medium">{req.name}</div>
                          <div className="text-dust text-xs">{req.email}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs ${req.request_type === "deletion" ? "bg-red-500/20 text-red-400" : "bg-night-800 text-mist"}`}>
                            {DR_TYPE_LABELS[req.request_type] || req.request_type}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs ${DR_STATUS_STYLES[req.status]?.color}`}>
                            {DR_STATUS_STYLES[req.status]?.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-dust text-xs">{formatDate(req.created_at)}</td>
                        <td className="px-4 py-3"><FiChevronRight className="text-dust" /></td>
                      </tr>
                    ))}
            </tbody>
          </table>
        </div>
        {!search && total > PAGE_SIZE && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-line">
            <span className="text-dust text-xs">{page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, total)} of {total.toLocaleString()}</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="px-3 py-1 text-xs bg-night-800 text-mist rounded-lg disabled:opacity-40 hover:text-star">Prev</button>
              <button onClick={() => setPage(p => p + 1)} disabled={(page + 1) * PAGE_SIZE >= total} className="px-3 py-1 text-xs bg-night-800 text-mist rounded-lg disabled:opacity-40 hover:text-star">Next</button>
            </div>
          </div>
        )}
      </div>

      {/* Detail panel */}
      {selected && <DataRequestPanel req={selected} onClose={() => setSelected(null)} onUpdate={updates => updateRequest(selected.id, updates)} />}
    </div>
  );
}

function DataRequestPanel({ req, onClose, onUpdate }) {
  const [status, setStatus] = useState(req.status);
  const [notes, setNotes]   = useState(req.admin_notes || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved]   = useState(false);

  async function handleStatus(val) {
    setStatus(val);
    const updates = { status: val };
    if (val === "completed") updates.completed_at = new Date().toISOString();
    await onUpdate(updates);
  }

  async function saveNotes() {
    setSaving(true);
    await onUpdate({ admin_notes: notes });
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const isDeletion = req.request_type === "deletion";

  return (
    <div className="fixed inset-0 z-50 bg-night-950/75 backdrop-blur-sm flex items-start justify-end">
      <div className="w-full max-w-xl h-full bg-night-850 border-l border-line flex flex-col overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-line flex-shrink-0">
          <h3 className="text-star font-semibold">{DR_TYPE_LABELS[req.request_type] || req.request_type} request</h3>
          <button onClick={onClose} className="text-dust hover:text-star"><FiX /></button>
        </div>

        <div className="flex-1 p-6 space-y-6">
          {/* Requester info */}
          <div className="bg-night-800 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-mist text-xs">Requester</span>
              <a href={`mailto:${req.email}`} className="text-flare-soft text-xs hover:underline">{req.email}</a>
            </div>
            <div className="text-star font-medium">{req.name}</div>
            <div className="flex items-center gap-2 pt-1">
              <span className={`px-2 py-0.5 rounded-full text-xs ${isDeletion ? "bg-red-500/20 text-red-400" : "bg-night-700 text-mist"}`}>
                {DR_TYPE_LABELS[req.request_type]}
              </span>
              <span className="text-dust text-xs ml-auto">Submitted {formatDate(req.created_at)}</span>
            </div>
          </div>

          {/* User's details */}
          {req.details && (
            <div>
              <p className="text-mist text-xs font-medium mb-2">Details from user</p>
              <div className="bg-night-800 rounded-xl p-4 text-star text-sm whitespace-pre-wrap leading-relaxed">{req.details}</div>
            </div>
          )}

          {/* Deletion warning */}
          {isDeletion && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-sm text-red-300">
              <p className="font-semibold mb-1">Account deletion request</p>
              <p>Before processing: verify identity via email, then manually delete the user's data from Supabase. Mark as Completed only after all data has been removed.</p>
            </div>
          )}

          {/* Status */}
          <div>
            <label className="block text-mist text-xs font-medium mb-1.5">Status</label>
            <select value={status} onChange={e => handleStatus(e.target.value)}
              className="w-full bg-night-800 border border-night-600 text-star text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-flare">
              {DR_STATUS_OPTIONS.map(s => <option key={s} value={s}>{DR_STATUS_STYLES[s].label}</option>)}
            </select>
          </div>

          {/* Quick actions */}
          <div className="grid grid-cols-3 gap-2">
            <button onClick={() => handleStatus("verifying")} disabled={status === "verifying"}
              className="py-2 text-xs rounded-lg bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 disabled:opacity-40 transition-colors">
              Verifying
            </button>
            <button onClick={() => handleStatus("processing")} disabled={status === "processing"}
              className="py-2 text-xs rounded-lg bg-flare/20 text-flare-soft hover:bg-flare/30 disabled:opacity-40 transition-colors">
              Processing
            </button>
            <button onClick={() => handleStatus("completed")} disabled={status === "completed"}
              className="py-2 text-xs rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 disabled:opacity-40 transition-colors">
              Completed
            </button>
          </div>

          {/* Email reply */}
          <div className="bg-night-800 border border-night-600 rounded-xl p-4">
            <p className="text-mist text-xs mb-3">Reply to requester</p>
            <a href={`mailto:${req.email}?subject=Re: Your ${DR_TYPE_LABELS[req.request_type]} Request&body=Dear ${encodeURIComponent(req.name)},%0A%0A`}
              className="flex items-center justify-center gap-2 w-full py-2 text-sm bg-flare-deep hover:bg-flare text-star rounded-lg transition-colors">
              <FiMail /> Reply via email
            </a>
          </div>

          {/* Internal notes */}
          <div>
            <label className="block text-mist text-xs font-medium mb-1.5">Internal notes</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={4}
              placeholder="e.g. Identity verified via email on 20 Mar. Data queued for deletion…"
              className="w-full bg-night-800 border border-night-600 text-star text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-flare resize-none" />
            <button onClick={saveNotes} disabled={saving}
              className={`mt-2 w-full py-2 text-sm rounded-lg transition-colors ${saved ? "bg-green-600 text-star" : "bg-night-700 text-mist hover:bg-night-600 disabled:opacity-50"}`}>
              {saving ? "Saving…" : saved ? "Saved!" : "Save notes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── HELPERS ───────────────────────────────────────────────────────────── */

function formatDate(ts) {
  if (!ts) return "—";
  const d = new Date(ts);
  const now = new Date();
  const diff = now - d;
  if (diff < 60000)    return "just now";
  if (diff < 3600000)  return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return d.toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" });
}
