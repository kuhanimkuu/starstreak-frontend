import { useEffect, useState, useRef } from "react";
import { supabase } from "../../lib/supabase";
import {
  FiBriefcase, FiFileText, FiActivity, FiHelpCircle,
  FiMap, FiBarChart2, FiPlus, FiEdit2, FiTrash2,
  FiX, FiEye, FiEyeOff, FiAlertCircle, FiCheck,
  FiChevronUp, FiChevronDown, FiUpload, FiLink, FiSearch, FiImage,
} from "react-icons/fi";

const TABS = [
  { key: "jobs",     label: "Careers",  icon: FiBriefcase },
  { key: "blog",     label: "Blog",     icon: FiFileText },
  { key: "status",   label: "Status",   icon: FiActivity },
  { key: "faqs",     label: "FAQs",     icon: FiHelpCircle },
  { key: "roadmap",  label: "Roadmap",  icon: FiMap },
  { key: "stats",    label: "Stats",    icon: FiBarChart2 },
];

export default function AdminContent() {
  const [tab, setTab] = useState("jobs");
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-star">Website Content</h1>
        <p className="text-mist text-sm mt-1">Manage all public-facing content on the Starstreak website.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === key ? "bg-flare-deep text-star" : "bg-night-800 text-mist hover:text-star"}`}>
            <Icon className="text-sm" />{label}
          </button>
        ))}
      </div>
      {tab === "jobs"    && <JobsTab />}
      {tab === "blog"    && <BlogTab />}
      {tab === "status"  && <StatusTab />}
      {tab === "faqs"    && <FaqsTab />}
      {tab === "roadmap" && <RoadmapTab />}
      {tab === "stats"   && <StatsTab />}
    </div>
  );
}

/* ─── STATUS TAB ────────────────────────────────────────────────────────── */

const STATUS_OPTIONS = ["operational", "degraded", "outage", "maintenance"];
const STATUS_COLORS  = { operational: "bg-green-500/20 text-green-400", degraded: "bg-yellow-500/20 text-yellow-400", outage: "bg-red-500/20 text-red-400", maintenance: "bg-flare/20 text-flare-soft" };
const SEVERITY_OPTIONS = ["minor", "major", "critical"];

function StatusTab() {
  const [services, setServices]     = useState([]);
  const [incidents, setIncidents]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [incForm, setIncForm]       = useState(null); // null | {} | incident
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [saving, setSaving]         = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const [{ data: s }, { data: i }] = await Promise.all([
      supabase.from("service_statuses").select("*").order("sort_order"),
      supabase.from("incidents").select("*").order("started_at", { ascending: false }),
    ]);
    setServices(s || []);
    setIncidents(i || []);
    setLoading(false);
  }

  async function updateServiceStatus(id, status) {
    await supabase.from("service_statuses").update({ status, updated_at: new Date().toISOString() }).eq("id", id);
    setServices(prev => prev.map(s => s.id === id ? { ...s, status } : s));
  }

  async function saveIncident(data) {
    setSaving(true);
    const session = (await supabase.auth.getSession()).data.session;
    const payload = { ...data, created_by: session?.user?.email };
    let result;
    if (data.id) {
      const { data: d, error } = await supabase.from("incidents").update(payload).eq("id", data.id).select().single();
      result = { data: d, error };
    } else {
      const { data: d, error } = await supabase.from("incidents").insert(payload).select().single();
      result = { data: d, error };
    }
    if (!result.error) {
      setIncidents(prev => {
        const exists = prev.find(i => i.id === result.data.id);
        return exists ? prev.map(i => i.id === result.data.id ? result.data : i) : [result.data, ...prev];
      });
      setIncForm(null);
    }
    setSaving(false);
  }

  async function resolveIncident(inc) {
    const update = { resolved: true, resolved_at: new Date().toISOString() };
    await supabase.from("incidents").update(update).eq("id", inc.id);
    setIncidents(prev => prev.map(i => i.id === inc.id ? { ...i, ...update } : i));
  }

  async function deleteIncident(id) {
    await supabase.from("incidents").delete().eq("id", id);
    setIncidents(prev => prev.filter(i => i.id !== id));
    setConfirmDelete(null);
  }

  const activeInc   = incidents.filter(i => !i.resolved);
  const resolvedInc = incidents.filter(i => i.resolved);

  return (
    <div className="space-y-8">
      {/* Services */}
      <div>
        <h2 className="text-star font-semibold text-sm mb-3">Service Statuses</h2>
        {loading
          ? <LoadingList n={6} />
          : <div className="space-y-2">
              {services.map(svc => (
                <div key={svc.id} className="bg-night-850 border border-line rounded-xl px-5 py-4 flex items-center gap-4">
                  <span className="text-star font-medium text-sm flex-1">{svc.name}</span>
                  <select value={svc.status} onChange={e => updateServiceStatus(svc.id, e.target.value)}
                    className={`text-xs font-medium rounded-full px-3 py-1 border-0 cursor-pointer focus:outline-none ${STATUS_COLORS[svc.status] || "bg-night-700 text-mist"}`}>
                    {STATUS_OPTIONS.map(s => <option key={s} value={s} className="bg-night-850 text-star">{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                  </select>
                </div>
              ))}
            </div>}
      </div>

      {/* Incidents */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-star font-semibold text-sm">Incidents</h2>
          <button onClick={() => setIncForm({ title: "", description: "", severity: "minor", resolved: false })}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-flare-deep hover:bg-flare text-star text-xs font-medium transition-colors">
            <FiPlus /> New incident
          </button>
        </div>
        {activeInc.length > 0 && (
          <div className="space-y-2 mb-4">
            <p className="text-red-400 text-xs font-medium">Active</p>
            {activeInc.map(inc => (
              <div key={inc.id} className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <FiAlertCircle className="text-red-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-star font-medium text-sm">{inc.title}</p>
                    <p className="text-red-300 text-xs mt-0.5">{inc.description}</p>
                    <p className="text-dust text-xs mt-1">{new Date(inc.started_at).toLocaleString()} · {inc.severity}</p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => resolveIncident(inc)} title="Mark resolved"
                      className="p-1.5 rounded text-dust hover:text-green-400 hover:bg-green-500/10 transition-colors"><FiCheck className="text-sm" /></button>
                    <button onClick={() => setIncForm(inc)}
                      className="p-1.5 rounded text-dust hover:text-star hover:bg-night-700 transition-colors"><FiEdit2 className="text-sm" /></button>
                    <button onClick={() => setConfirmDelete(inc)}
                      className="p-1.5 rounded text-dust hover:text-red-400 hover:bg-red-500/10 transition-colors"><FiTrash2 className="text-sm" /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {resolvedInc.length > 0 && (
          <div className="space-y-2">
            <p className="text-dust text-xs font-medium">Resolved</p>
            {resolvedInc.map(inc => (
              <div key={inc.id} className="bg-night-850 border border-line rounded-xl p-4 flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-star font-medium text-sm">{inc.title}</p>
                  <p className="text-dust text-xs mt-0.5">{inc.description}</p>
                  <p className="text-dust text-xs mt-1">{new Date(inc.started_at).toLocaleString()} · {inc.severity}</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => setIncForm(inc)}
                    className="p-1.5 rounded text-dust hover:text-star hover:bg-night-700 transition-colors"><FiEdit2 className="text-sm" /></button>
                  <button onClick={() => setConfirmDelete(inc)}
                    className="p-1.5 rounded text-dust hover:text-red-400 hover:bg-red-500/10 transition-colors"><FiTrash2 className="text-sm" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
        {incidents.length === 0 && !loading && <Empty text="No incidents recorded." />}
      </div>

      {incForm !== null && (
        <IncidentForm initial={incForm} onSave={saveIncident} onClose={() => setIncForm(null)} saving={saving} />
      )}
      {confirmDelete && (
        <ConfirmModal title="Delete incident?" message={`"${confirmDelete.title}" will be permanently deleted.`}
          onConfirm={() => deleteIncident(confirmDelete.id)} onCancel={() => setConfirmDelete(null)} />
      )}
    </div>
  );
}

function IncidentForm({ initial, onSave, onClose, saving }) {
  const [form, setForm] = useState({ title: "", description: "", severity: "minor", resolved: false, resolved_at: null, ...initial });
  function set(k, v) { setForm(p => ({ ...p, [k]: v })); }
  return (
    <Modal title={form.id ? "Edit incident" : "New incident"} onClose={onClose}>
      <div className="space-y-4">
        <Field label="Title"><input value={form.title} onChange={e => set("title", e.target.value)} className="input" placeholder="e.g. Notification delays" /></Field>
        <Field label="Description"><textarea value={form.description} onChange={e => set("description", e.target.value)} rows={3} className="input resize-none" placeholder="What happened and current status…" /></Field>
        <Field label="Severity">
          <select value={form.severity} onChange={e => set("severity", e.target.value)} className="input">
            {SEVERITY_OPTIONS.map(s => <option key={s}>{s}</option>)}
          </select>
        </Field>
        <label className="flex items-center gap-3 cursor-pointer">
          <div onClick={() => { set("resolved", !form.resolved); if (!form.resolved) set("resolved_at", new Date().toISOString()); }}
            className={`w-10 h-6 rounded-full flex items-center px-1 transition-colors ${form.resolved ? "bg-green-600" : "bg-night-700"}`}>
            <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${form.resolved ? "translate-x-4" : "translate-x-0"}`} />
          </div>
          <span className="text-sm text-mist">Resolved</span>
        </label>
        <div className="flex gap-3 pt-2">
          <button onClick={onClose} className="flex-1 py-2 text-sm bg-night-800 text-mist rounded-lg hover:bg-night-700 transition-colors">Cancel</button>
          <button onClick={() => onSave(form)} disabled={saving || !form.title.trim()}
            className="flex-1 py-2 text-sm bg-flare-deep text-star rounded-lg hover:bg-flare disabled:opacity-50 transition-colors">
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

/* ─── FAQS TAB ──────────────────────────────────────────────────────────── */

const FAQ_CATEGORIES = ["General", "Account", "Communities", "Messaging", "Privacy & Safety", "Posts & Feed", "Flash Communities"];

function FaqsTab() {
  const [faqs, setFaqs]           = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [editing, setEditing]     = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("faqs").select("*").order("sort_order");
    setFaqs(data || []);
    setLoading(false);
  }

  async function toggleVisible(faq) {
    await supabase.from("faqs").update({ is_visible: !faq.is_visible }).eq("id", faq.id);
    setFaqs(prev => prev.map(f => f.id === faq.id ? { ...f, is_visible: !f.is_visible } : f));
  }

  async function moveOrder(faq, dir) {
    const sorted = [...faqs].sort((a, b) => a.sort_order - b.sort_order);
    const idx = sorted.findIndex(f => f.id === faq.id);
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;
    const a = sorted[idx], b = sorted[swapIdx];
    await Promise.all([
      supabase.from("faqs").update({ sort_order: b.sort_order }).eq("id", a.id),
      supabase.from("faqs").update({ sort_order: a.sort_order }).eq("id", b.id),
    ]);
    setFaqs(prev => prev.map(f => f.id === a.id ? { ...f, sort_order: b.sort_order } : f.id === b.id ? { ...f, sort_order: a.sort_order } : f));
  }

  async function deleteFaq(id) {
    await supabase.from("faqs").delete().eq("id", id);
    setFaqs(prev => prev.filter(f => f.id !== id));
    setConfirmDelete(null);
  }

  function onSaved(faq) {
    setFaqs(prev => {
      const exists = prev.find(f => f.id === faq.id);
      return exists ? prev.map(f => f.id === faq.id ? faq : f) : [...prev, faq];
    });
    setShowForm(false);
  }

  const sorted = [...faqs].sort((a, b) => a.sort_order - b.sort_order);

  return (
    <>
      <div className="flex items-center justify-between">
        <p className="text-mist text-sm">{faqs.filter(f => f.is_visible).length} visible · {faqs.filter(f => !f.is_visible).length} hidden</p>
        <button onClick={() => { setEditing(null); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-flare-deep hover:bg-flare text-star text-sm font-medium transition-colors">
          <FiPlus /> New FAQ
        </button>
      </div>
      {loading ? <LoadingList n={4} /> : sorted.length === 0 ? <Empty text="No FAQs yet." /> : (
        <div className="space-y-2">
          {sorted.map((faq, i) => (
            <div key={faq.id} className={`bg-night-850 border border-line rounded-xl p-4 flex items-start gap-3 ${!faq.is_visible ? "opacity-50" : ""}`}>
              <div className="flex flex-col gap-0.5 mt-0.5">
                <button onClick={() => moveOrder(faq, -1)} disabled={i === 0} className="text-dust hover:text-star disabled:opacity-20"><FiChevronUp className="text-xs" /></button>
                <button onClick={() => moveOrder(faq, 1)} disabled={i === sorted.length - 1} className="text-dust hover:text-star disabled:opacity-20"><FiChevronDown className="text-xs" /></button>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-star font-medium text-sm">{faq.question}</p>
                <p className="text-dust text-xs mt-0.5 line-clamp-2">{faq.answer}</p>
                <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-xs bg-night-800 text-mist">{faq.category}</span>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <button onClick={() => toggleVisible(faq)} className="p-1.5 rounded text-dust hover:text-amber-400 hover:bg-amber-500/10 transition-colors">
                  {faq.is_visible ? <FiEyeOff className="text-sm" /> : <FiEye className="text-sm" />}
                </button>
                <button onClick={() => { setEditing(faq); setShowForm(true); }} className="p-1.5 rounded text-dust hover:text-star hover:bg-night-700 transition-colors"><FiEdit2 className="text-sm" /></button>
                <button onClick={() => setConfirmDelete(faq)} className="p-1.5 rounded text-dust hover:text-red-400 hover:bg-red-500/10 transition-colors"><FiTrash2 className="text-sm" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
      {showForm && <FaqForm faq={editing} onSaved={onSaved} onClose={() => setShowForm(false)} currentMax={Math.max(0, ...faqs.map(f => f.sort_order))} />}
      {confirmDelete && <ConfirmModal title="Delete FAQ?" message={`"${confirmDelete.question}" will be permanently deleted.`} onConfirm={() => deleteFaq(confirmDelete.id)} onCancel={() => setConfirmDelete(null)} />}
    </>
  );
}

function FaqForm({ faq, onSaved, onClose, currentMax }) {
  const [form, setForm] = useState({ question: faq?.question || "", answer: faq?.answer || "", category: faq?.category || "General", is_visible: faq?.is_visible ?? true });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState("");
  function set(k, v) { setForm(p => ({ ...p, [k]: v })); }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.question.trim() || !form.answer.trim()) { setError("Question and answer are required."); return; }
    setSaving(true);
    const session = (await supabase.auth.getSession()).data.session;
    const payload = { ...form, created_by: session?.user?.email, sort_order: faq?.sort_order ?? currentMax + 1 };
    let result;
    if (faq) {
      const { data, error: err } = await supabase.from("faqs").update(payload).eq("id", faq.id).select().single();
      result = { data, err };
    } else {
      const { data, error: err } = await supabase.from("faqs").insert(payload).select().single();
      result = { data, err };
    }
    if (result.err) { setError("Failed to save."); setSaving(false); return; }
    onSaved(result.data);
  }

  return (
    <Modal title={faq ? "Edit FAQ" : "New FAQ"} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Question"><input value={form.question} onChange={e => set("question", e.target.value)} required className="input" placeholder="How do I…?" /></Field>
        <Field label="Answer"><textarea value={form.answer} onChange={e => set("answer", e.target.value)} required rows={4} className="input resize-none" placeholder="The answer…" /></Field>
        <Field label="Category">
          <select value={form.category} onChange={e => set("category", e.target.value)} className="input">
            {FAQ_CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </Field>
        <label className="flex items-center gap-3 cursor-pointer">
          <div onClick={() => set("is_visible", !form.is_visible)} className={`w-10 h-6 rounded-full flex items-center px-1 transition-colors ${form.is_visible ? "bg-flare-deep" : "bg-night-700"}`}>
            <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${form.is_visible ? "translate-x-4" : "translate-x-0"}`} />
          </div>
          <span className="text-sm text-mist">Visible on support page</span>
        </label>
        {error && <p className="text-red-400 text-xs">{error}</p>}
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 py-2 text-sm bg-night-800 text-mist rounded-lg hover:bg-night-700 transition-colors">Cancel</button>
          <button type="submit" disabled={saving} className="flex-1 py-2 text-sm bg-flare-deep text-star rounded-lg hover:bg-flare disabled:opacity-50 transition-colors">{saving ? "Saving…" : faq ? "Save" : "Create"}</button>
        </div>
      </form>
    </Modal>
  );
}

/* ─── ROADMAP TAB ───────────────────────────────────────────────────────── */

const PHASES = ["now", "soon", "future"];
const PHASE_LABELS = { now: "Now Building", soon: "Coming Soon", future: "Future Ideas" };

function RoadmapTab() {
  const [items, setItems]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [editing, setEditing]     = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("roadmap_items").select("*").order("sort_order");
    setItems(data || []);
    setLoading(false);
  }

  async function toggleVisible(item) {
    await supabase.from("roadmap_items").update({ is_visible: !item.is_visible }).eq("id", item.id);
    setItems(prev => prev.map(r => r.id === item.id ? { ...r, is_visible: !r.is_visible } : r));
  }

  async function deleteItem(id) {
    await supabase.from("roadmap_items").delete().eq("id", id);
    setItems(prev => prev.filter(r => r.id !== id));
    setConfirmDelete(null);
  }

  function onSaved(item) {
    setItems(prev => {
      const exists = prev.find(r => r.id === item.id);
      return exists ? prev.map(r => r.id === item.id ? item : r) : [...prev, item];
    });
    setShowForm(false);
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <p className="text-mist text-sm">{items.length} items · {items.filter(i => i.is_visible).length} visible</p>
        <button onClick={() => { setEditing(null); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-flare-deep hover:bg-flare text-star text-sm font-medium transition-colors">
          <FiPlus /> New item
        </button>
      </div>
      {loading ? <LoadingList n={6} /> : (
        <div className="space-y-6">
          {PHASES.map(phase => {
            const phaseItems = items.filter(i => i.phase === phase);
            return (
              <div key={phase}>
                <h3 className="text-mist text-xs font-semibold uppercase tracking-wider mb-2">{PHASE_LABELS[phase]}</h3>
                {phaseItems.length === 0
                  ? <p className="text-dust text-xs italic">No items</p>
                  : <div className="space-y-2">
                      {phaseItems.map(item => (
                        <div key={item.id} className={`bg-night-850 border border-line rounded-xl p-4 flex items-start gap-3 ${!item.is_visible ? "opacity-50" : ""}`}>
                          <div className="flex-1 min-w-0">
                            <p className="text-star font-medium text-sm">{item.title}</p>
                            <p className="text-dust text-xs mt-0.5 line-clamp-2">{item.description}</p>
                          </div>
                          <div className="flex gap-1 flex-shrink-0">
                            <button onClick={() => toggleVisible(item)} className="p-1.5 rounded text-dust hover:text-amber-400 hover:bg-amber-500/10 transition-colors">
                              {item.is_visible ? <FiEyeOff className="text-sm" /> : <FiEye className="text-sm" />}
                            </button>
                            <button onClick={() => { setEditing(item); setShowForm(true); }} className="p-1.5 rounded text-dust hover:text-star hover:bg-night-700 transition-colors"><FiEdit2 className="text-sm" /></button>
                            <button onClick={() => setConfirmDelete(item)} className="p-1.5 rounded text-dust hover:text-red-400 hover:bg-red-500/10 transition-colors"><FiTrash2 className="text-sm" /></button>
                          </div>
                        </div>
                      ))}
                    </div>}
              </div>
            );
          })}
        </div>
      )}
      {showForm && <RoadmapForm item={editing} onSaved={onSaved} onClose={() => setShowForm(false)} currentMax={Math.max(0, ...items.map(i => i.sort_order))} />}
      {confirmDelete && <ConfirmModal title="Delete item?" message={`"${confirmDelete.title}" will be permanently deleted.`} onConfirm={() => deleteItem(confirmDelete.id)} onCancel={() => setConfirmDelete(null)} />}
    </>
  );
}

function RoadmapForm({ item, onSaved, onClose, currentMax }) {
  const [form, setForm] = useState({ title: item?.title || "", description: item?.description || "", phase: item?.phase || "soon", is_visible: item?.is_visible ?? true });
  const [saving, setSaving] = useState(false);
  function set(k, v) { setForm(p => ({ ...p, [k]: v })); }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    const session = (await supabase.auth.getSession()).data.session;
    const payload = { ...form, sort_order: item?.sort_order ?? currentMax + 1, created_by: session?.user?.email };
    let result;
    if (item) {
      const { data, error } = await supabase.from("roadmap_items").update(payload).eq("id", item.id).select().single();
      result = { data, error };
    } else {
      const { data, error } = await supabase.from("roadmap_items").insert(payload).select().single();
      result = { data, error };
    }
    if (!result.error) onSaved(result.data);
    setSaving(false);
  }

  return (
    <Modal title={item ? "Edit item" : "New roadmap item"} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Title"><input value={form.title} onChange={e => set("title", e.target.value)} required className="input" placeholder="Feature name" /></Field>
        <Field label="Description"><textarea value={form.description} onChange={e => set("description", e.target.value)} required rows={3} className="input resize-none" placeholder="Brief description…" /></Field>
        <Field label="Phase">
          <select value={form.phase} onChange={e => set("phase", e.target.value)} className="input">
            {PHASES.map(p => <option key={p} value={p}>{PHASE_LABELS[p]}</option>)}
          </select>
        </Field>
        <label className="flex items-center gap-3 cursor-pointer">
          <div onClick={() => set("is_visible", !form.is_visible)} className={`w-10 h-6 rounded-full flex items-center px-1 transition-colors ${form.is_visible ? "bg-flare-deep" : "bg-night-700"}`}>
            <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${form.is_visible ? "translate-x-4" : "translate-x-0"}`} />
          </div>
          <span className="text-sm text-mist">Visible on roadmap</span>
        </label>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 py-2 text-sm bg-night-800 text-mist rounded-lg hover:bg-night-700 transition-colors">Cancel</button>
          <button type="submit" disabled={saving} className="flex-1 py-2 text-sm bg-flare-deep text-star rounded-lg hover:bg-flare disabled:opacity-50 transition-colors">{saving ? "Saving…" : item ? "Save" : "Create"}</button>
        </div>
      </form>
    </Modal>
  );
}

/* ─── STATS TAB ─────────────────────────────────────────────────────────── */

function StatsTab() {
  const [form, setForm]   = useState({ members: "120K+", communities: "5K+", connections: "1M+", support: "24/7" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);

  useEffect(() => {
    supabase.from("platform_content").select("content").eq("key", "home_stats").single()
      .then(({ data }) => {
        if (data?.content) { try { setForm(JSON.parse(data.content)); } catch {} }
        setLoading(false);
      });
  }, []);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    await supabase.from("platform_content")
      .upsert({ key: "home_stats", content: JSON.stringify(form), version: 1 }, { onConflict: "key" });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (loading) return <LoadingList n={4} />;

  const FIELDS = [
    { key: "members",     label: "Active Members",     placeholder: "120K+" },
    { key: "communities", label: "Communities Created", placeholder: "5K+" },
    { key: "connections", label: "Connections Made",    placeholder: "1M+" },
    { key: "support",     label: "Support & Safety",    placeholder: "24/7" },
  ];

  return (
    <div className="max-w-lg">
      <p className="text-mist text-sm mb-6">These numbers appear in the stats row on the home page. Update them as the platform grows.</p>
      <form onSubmit={handleSave} className="space-y-4">
        {FIELDS.map(({ key, label, placeholder }) => (
          <Field key={key} label={label}>
            <input value={form[key] || ""} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
              placeholder={placeholder} className="input" />
          </Field>
        ))}
        <button type="submit" disabled={saving}
          className={`w-full py-2.5 text-sm font-medium rounded-lg transition-colors ${saved ? "bg-green-600 text-star" : "bg-flare-deep hover:bg-flare text-star disabled:opacity-50"}`}>
          {saving ? "Saving…" : saved ? "Saved!" : "Save stats"}
        </button>
      </form>
    </div>
  );
}

/* ─── JOBS TAB ─────────────────────────────────────────────────────────── */

const JOB_TYPES   = ["Full-time", "Part-time", "Contract", "Internship"];
const DEPARTMENTS = ["Engineering", "Design", "Product", "Marketing", "Operations", "Finance", "Legal", "Customer Support", "Other"];

function JobsTab() {
  const [jobs, setJobs]           = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [editing, setEditing]     = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("job_listings").select("*").order("created_at", { ascending: false });
    setJobs(data || []);
    setLoading(false);
  }

  async function toggleActive(job) {
    await supabase.from("job_listings").update({ is_active: !job.is_active }).eq("id", job.id);
    setJobs(prev => prev.map(j => j.id === job.id ? { ...j, is_active: !j.is_active } : j));
  }

  async function deleteJob(id) {
    await supabase.from("job_listings").delete().eq("id", id);
    setJobs(prev => prev.filter(j => j.id !== id));
    setConfirmDelete(null);
  }

  function onSaved(job) {
    setJobs(prev => {
      const exists = prev.find(j => j.id === job.id);
      return exists ? prev.map(j => j.id === job.id ? job : j) : [job, ...prev];
    });
    setShowForm(false);
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <p className="text-mist text-sm">{jobs.filter(j => j.is_active).length} active · {jobs.filter(j => !j.is_active).length} closed</p>
        <button onClick={() => { setEditing(null); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-flare-deep hover:bg-flare text-star text-sm font-medium transition-colors">
          <FiPlus /> New listing
        </button>
      </div>
      {loading ? <LoadingList n={3} /> : jobs.length === 0 ? <Empty text="No job listings yet." /> : (
        <div className="space-y-3">
          {jobs.map(job => (
            <div key={job.id} className={`bg-night-850 border border-line rounded-xl p-5 flex items-start gap-4 ${!job.is_active ? "opacity-60" : ""}`}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-star font-semibold text-sm">{job.title}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${job.is_active ? "bg-green-500/20 text-green-400" : "bg-night-700 text-dust"}`}>{job.is_active ? "Active" : "Closed"}</span>
                </div>
                <p className="text-mist text-xs mt-0.5">{job.department} · {job.location} · {job.type}</p>
                {job.description && <p className="text-dust text-xs mt-1 line-clamp-2">{job.description}</p>}
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <button onClick={() => toggleActive(job)} className="p-1.5 rounded text-dust hover:text-amber-400 hover:bg-amber-500/10 transition-colors">{job.is_active ? <FiEyeOff className="text-sm" /> : <FiEye className="text-sm" />}</button>
                <button onClick={() => { setEditing(job); setShowForm(true); }} className="p-1.5 rounded text-dust hover:text-star hover:bg-night-700 transition-colors"><FiEdit2 className="text-sm" /></button>
                <button onClick={() => setConfirmDelete(job)} className="p-1.5 rounded text-dust hover:text-red-400 hover:bg-red-500/10 transition-colors"><FiTrash2 className="text-sm" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
      {showForm && <JobForm job={editing} onSaved={onSaved} onClose={() => setShowForm(false)} />}
      {confirmDelete && <ConfirmModal title="Delete listing?" message={`"${confirmDelete.title}" will be permanently removed.`} onConfirm={() => deleteJob(confirmDelete.id)} onCancel={() => setConfirmDelete(null)} />}
    </>
  );
}

function JobForm({ job, onSaved, onClose }) {
  const [form, setForm] = useState({ title: job?.title || "", department: job?.department || DEPARTMENTS[0], location: job?.location || "Remote", type: job?.type || "Full-time", description: job?.description || "", requirements: job?.requirements || "", is_active: job?.is_active ?? true });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState("");
  function set(k, v) { setForm(p => ({ ...p, [k]: v })); }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) { setError("Title and description are required."); return; }
    setSaving(true); setError("");
    const session = (await supabase.auth.getSession()).data.session;
    const payload = { ...form, created_by: session?.user?.email };
    let result;
    if (job) {
      const { data, error: err } = await supabase.from("job_listings").update(payload).eq("id", job.id).select().single();
      result = { data, err };
    } else {
      const { data, error: err } = await supabase.from("job_listings").insert(payload).select().single();
      result = { data, err };
    }
    if (result.err) { setError("Failed to save."); setSaving(false); return; }
    onSaved(result.data);
  }

  return (
    <Modal title={job ? "Edit listing" : "New job listing"} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Job title"><input value={form.title} onChange={e => set("title", e.target.value)} required placeholder="e.g. Senior Flutter Engineer" className="input" /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Department"><select value={form.department} onChange={e => set("department", e.target.value)} className="input">{DEPARTMENTS.map(d => <option key={d}>{d}</option>)}</select></Field>
          <Field label="Type"><select value={form.type} onChange={e => set("type", e.target.value)} className="input">{JOB_TYPES.map(t => <option key={t}>{t}</option>)}</select></Field>
        </div>
        <Field label="Location"><input value={form.location} onChange={e => set("location", e.target.value)} placeholder="e.g. Remote, Nairobi" className="input" /></Field>
        <Field label="Description"><textarea value={form.description} onChange={e => set("description", e.target.value)} required rows={4} placeholder="Role overview, responsibilities…" className="input resize-none" /></Field>
        <Field label="Requirements (optional)"><textarea value={form.requirements} onChange={e => set("requirements", e.target.value)} rows={3} placeholder="Skills, experience, qualifications…" className="input resize-none" /></Field>
        <label className="flex items-center gap-3 cursor-pointer">
          <div onClick={() => set("is_active", !form.is_active)} className={`w-10 h-6 rounded-full flex items-center px-1 transition-colors ${form.is_active ? "bg-flare-deep" : "bg-night-700"}`}>
            <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${form.is_active ? "translate-x-4" : "translate-x-0"}`} />
          </div>
          <span className="text-sm text-mist">Listing is active</span>
        </label>
        {error && <p className="text-red-400 text-xs">{error}</p>}
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 py-2 text-sm bg-night-800 text-mist rounded-lg hover:bg-night-700 transition-colors">Cancel</button>
          <button type="submit" disabled={saving} className="flex-1 py-2 text-sm bg-flare-deep text-star rounded-lg hover:bg-flare disabled:opacity-50 transition-colors">{saving ? "Saving…" : job ? "Save changes" : "Create"}</button>
        </div>
      </form>
    </Modal>
  );
}

/* ─── BLOG TAB ─────────────────────────────────────────────────────────── */

function BlogTab() {
  const [posts, setPosts]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [editing, setEditing]     = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("blog_posts").select("id, title, slug, excerpt, author_name, tags, is_published, published_at, created_at").order("created_at", { ascending: false });
    setPosts(data || []);
    setLoading(false);
  }

  async function togglePublish(post) {
    const update = { is_published: !post.is_published, published_at: !post.is_published ? new Date().toISOString() : null };
    await supabase.from("blog_posts").update(update).eq("id", post.id);
    setPosts(prev => prev.map(p => p.id === post.id ? { ...p, ...update } : p));
  }

  async function deletePost(id) {
    await supabase.from("blog_posts").delete().eq("id", id);
    setPosts(prev => prev.filter(p => p.id !== id));
    setConfirmDelete(null);
  }

  function onSaved(post) {
    setPosts(prev => {
      const exists = prev.find(p => p.id === post.id);
      return exists ? prev.map(p => p.id === post.id ? post : p) : [post, ...prev];
    });
    setShowForm(false);
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <p className="text-mist text-sm">{posts.filter(p => p.is_published).length} published · {posts.filter(p => !p.is_published).length} drafts</p>
        <button onClick={() => { setEditing(null); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-flare-deep hover:bg-flare text-star text-sm font-medium transition-colors">
          <FiPlus /> New post
        </button>
      </div>
      {loading ? <LoadingList n={3} /> : posts.length === 0 ? <Empty text="No blog posts yet." /> : (
        <div className="space-y-3">
          {posts.map(post => (
            <div key={post.id} className={`bg-night-850 border border-line rounded-xl p-5 flex items-start gap-4 ${!post.is_published ? "opacity-60" : ""}`}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-star font-semibold text-sm">{post.title}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${post.is_published ? "bg-green-500/20 text-green-400" : "bg-night-700 text-dust"}`}>{post.is_published ? "Published" : "Draft"}</span>
                </div>
                <p className="text-mist text-xs mt-0.5">{post.author_name}{post.published_at && ` · ${new Date(post.published_at).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}`}</p>
                {post.excerpt && <p className="text-dust text-xs mt-1 line-clamp-2">{post.excerpt}</p>}
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <button onClick={() => togglePublish(post)} className="p-1.5 rounded text-dust hover:text-green-400 hover:bg-green-500/10 transition-colors">{post.is_published ? <FiEyeOff className="text-sm" /> : <FiEye className="text-sm" />}</button>
                <button onClick={() => { setEditing(post); setShowForm(true); }} className="p-1.5 rounded text-dust hover:text-star hover:bg-night-700 transition-colors"><FiEdit2 className="text-sm" /></button>
                <button onClick={() => setConfirmDelete(post)} className="p-1.5 rounded text-dust hover:text-red-400 hover:bg-red-500/10 transition-colors"><FiTrash2 className="text-sm" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
      {showForm && <BlogForm post={editing} onSaved={onSaved} onClose={() => setShowForm(false)} />}
      {confirmDelete && <ConfirmModal title="Delete post?" message={`"${confirmDelete.title}" will be permanently deleted.`} onConfirm={() => deletePost(confirmDelete.id)} onCancel={() => setConfirmDelete(null)} />}
    </>
  );
}

function BlogForm({ post, onSaved, onClose }) {
  const [form, setForm] = useState({ title: post?.title || "", slug: post?.slug || "", excerpt: post?.excerpt || "", content: post?.content || "", author_name: post?.author_name || "Starstreak Team", tags: post?.tags?.join(", ") || "", cover_image: post?.cover_image || "", is_published: post?.is_published ?? false });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState("");
  const slugEdited = useRef(!!post);
  function set(k, v) { setForm(p => ({ ...p, [k]: v })); }

  function handleTitleChange(e) {
    const val = e.target.value;
    set("title", val);
    if (!slugEdited.current) set("slug", val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) { setError("Title and content are required."); return; }
    setSaving(true); setError("");
    const session = (await supabase.auth.getSession()).data.session;
    const payload = { ...form, slug: form.slug || form.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"), tags: form.tags ? form.tags.split(",").map(t => t.trim()).filter(Boolean) : [], published_at: form.is_published ? (post?.published_at || new Date().toISOString()) : null, created_by: session?.user?.email };
    let result;
    if (post) {
      const { data, error: err } = await supabase.from("blog_posts").update(payload).eq("id", post.id).select().single();
      result = { data, err };
    } else {
      const { data, error: err } = await supabase.from("blog_posts").insert(payload).select().single();
      result = { data, err };
    }
    if (result.err) { setError(result.err.message || "Failed to save."); setSaving(false); return; }
    onSaved(result.data);
  }

  return (
    <Modal title={post ? "Edit post" : "New blog post"} onClose={onClose} wide>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Title"><input value={form.title} onChange={handleTitleChange} required placeholder="Post title" className="input" /></Field>
        <Field label="Slug"><input value={form.slug} onChange={e => { slugEdited.current = true; set("slug", e.target.value); }} placeholder="post-url-slug" className="input font-mono text-xs" /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Author"><input value={form.author_name} onChange={e => set("author_name", e.target.value)} placeholder="Starstreak Team" className="input" /></Field>
          <Field label="Tags (comma-separated)"><input value={form.tags} onChange={e => set("tags", e.target.value)} placeholder="product, engineering" className="input" /></Field>
        </div>
        <CoverImagePicker value={form.cover_image} onChange={v => set("cover_image", v)} />
        <Field label="Excerpt"><textarea value={form.excerpt} onChange={e => set("excerpt", e.target.value)} rows={2} placeholder="Short summary…" className="input resize-none" /></Field>
        <Field label="Content"><textarea value={form.content} onChange={e => set("content", e.target.value)} required rows={12} placeholder="Write your post here. Markdown is supported." className="input resize-y font-mono text-xs" /></Field>
        <label className="flex items-center gap-3 cursor-pointer">
          <div onClick={() => set("is_published", !form.is_published)} className={`w-10 h-6 rounded-full flex items-center px-1 transition-colors ${form.is_published ? "bg-flare-deep" : "bg-night-700"}`}>
            <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${form.is_published ? "translate-x-4" : "translate-x-0"}`} />
          </div>
          <span className="text-sm text-mist">Published</span>
        </label>
        {error && <p className="text-red-400 text-xs">{error}</p>}
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 py-2 text-sm bg-night-800 text-mist rounded-lg hover:bg-night-700 transition-colors">Cancel</button>
          <button type="submit" disabled={saving} className="flex-1 py-2 text-sm bg-flare-deep text-star rounded-lg hover:bg-flare disabled:opacity-50 transition-colors">{saving ? "Saving…" : post ? "Save changes" : "Create post"}</button>
        </div>
      </form>
    </Modal>
  );
}

/* ─── COVER IMAGE PICKER ────────────────────────────────────────────────── */

const UNSPLASH_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;

function CoverImagePicker({ value, onChange }) {
  const [tab, setTab] = useState("upload");
  const [urlInput, setUrlInput] = useState(value || "");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const fileRef = useRef();

  async function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setUploadError("");
    const ext = file.name.split(".").pop();
    const path = `blog/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from("posts").upload(path, file, { contentType: file.type });
    if (error) { setUploadError(error.message); setUploading(false); return; }
    const { data: { publicUrl } } = supabase.storage.from("posts").getPublicUrl(path);
    onChange(publicUrl);
    setUploading(false);
  }

  function handleDrop(e) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile({ target: { files: [file] } });
  }

  async function searchUnsplash() {
    if (!query.trim() || !UNSPLASH_KEY) return;
    setSearching(true);
    try {
      const res = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=12&orientation=landscape&client_id=${UNSPLASH_KEY}`);
      const data = await res.json();
      setResults(data.results || []);
    } catch { setResults([]); }
    setSearching(false);
  }

  const tabs = [
    { id: "upload", label: "Upload", icon: FiUpload },
    { id: "url",    label: "URL",    icon: FiLink },
    { id: "unsplash", label: "Unsplash", icon: FiSearch },
  ];

  return (
    <div>
      <label className="block text-xs font-medium text-mist mb-1.5">Cover Image</label>

      {/* Preview */}
      {value && (
        <div className="relative mb-3 rounded-lg overflow-hidden border border-night-600 h-40">
          <img src={value} alt="Cover" className="w-full h-full object-cover" />
          <button onClick={() => { onChange(""); setUrlInput(""); }}
            className="absolute top-2 right-2 p-1 bg-black/60 rounded-full text-star hover:bg-black/80 transition-colors">
            <FiX className="text-sm" />
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-3 bg-night-800 rounded-lg p-1">
        {tabs.map(t => (
          <button key={t.id} type="button" onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-md transition-colors ${tab === t.id ? "bg-night-700 text-star" : "text-mist hover:text-mist"}`}>
            <t.icon className="text-xs" />{t.label}
          </button>
        ))}
      </div>

      {/* Upload tab */}
      {tab === "upload" && (
        <div>
          <div onDrop={handleDrop} onDragOver={e => e.preventDefault()}
            onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed border-night-600 rounded-lg p-8 text-center cursor-pointer hover:border-flare transition-colors">
            {uploading ? (
              <div className="flex flex-col items-center gap-2 text-mist">
                <div className="w-5 h-5 border-2 border-flare border-t-transparent rounded-full animate-spin" />
                <span className="text-xs">Uploading…</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-dust">
                <FiImage className="text-2xl" />
                <p className="text-xs">Drag & drop or <span className="text-flare-soft">click to browse</span></p>
                <p className="text-xs text-dust">JPG, PNG, WebP — max 5MB</p>
              </div>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
          {uploadError && <p className="text-red-400 text-xs mt-2">{uploadError}</p>}
        </div>
      )}

      {/* URL tab */}
      {tab === "url" && (
        <div className="flex gap-2">
          <input value={urlInput} onChange={e => setUrlInput(e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="input flex-1 text-xs" />
          <button type="button" onClick={() => onChange(urlInput)}
            className="px-3 py-2 bg-flare-deep hover:bg-flare text-star text-xs rounded-lg transition-colors">
            Use
          </button>
        </div>
      )}

      {/* Unsplash tab */}
      {tab === "unsplash" && (
        <div className="space-y-3">
          {!UNSPLASH_KEY ? (
            <p className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
              Add <code className="font-mono">VITE_UNSPLASH_ACCESS_KEY</code> to your <code className="font-mono">.env.local</code> to enable Unsplash search.
            </p>
          ) : (
            <>
              <div className="flex gap-2">
                <input value={query} onChange={e => setQuery(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && (e.preventDefault(), searchUnsplash())}
                  placeholder="Search Unsplash…" className="input flex-1 text-xs" />
                <button type="button" onClick={searchUnsplash} disabled={searching}
                  className="px-3 py-2 bg-flare-deep hover:bg-flare text-star text-xs rounded-lg disabled:opacity-50 transition-colors">
                  {searching ? <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" /> : <FiSearch />}
                </button>
              </div>
              {results.length > 0 && (
                <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                  {results.map(img => (
                    <button key={img.id} type="button" onClick={() => onChange(img.urls.regular)}
                      className="relative rounded-lg overflow-hidden h-20 hover:ring-2 hover:ring-flare transition-all">
                      <img src={img.urls.thumb} alt={img.alt_description} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── SHARED COMPONENTS ─────────────────────────────────────────────────── */

function Modal({ title, onClose, children, wide }) {
  return (
    <div className="fixed inset-0 z-50 bg-night-950/75 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto">
      <div className={`bg-night-850 border border-line rounded-2xl w-full my-8 ${wide ? "max-w-2xl" : "max-w-lg"}`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-line">
          <h3 className="text-star font-semibold">{title}</h3>
          <button onClick={onClose} className="text-dust hover:text-star transition-colors"><FiX /></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-medium text-mist mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function ConfirmModal({ title, message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 bg-night-950/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-night-850 border border-line rounded-2xl p-6 max-w-sm w-full">
        <h3 className="text-star font-semibold mb-2">{title}</h3>
        <p className="text-mist text-sm mb-5">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2 text-sm bg-night-800 text-mist rounded-lg hover:bg-night-700 transition-colors">Cancel</button>
          <button onClick={onConfirm} className="flex-1 py-2 text-sm bg-red-600 text-star rounded-lg hover:bg-red-500 transition-colors">Delete</button>
        </div>
      </div>
    </div>
  );
}

function LoadingList({ n }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: n }).map((_, i) => (
        <div key={i} className="bg-night-850 border border-line rounded-xl p-4 animate-pulse">
          <div className="h-4 bg-night-800 rounded w-1/3 mb-2" />
          <div className="h-3 bg-night-800 rounded w-1/4" />
        </div>
      ))}
    </div>
  );
}

function Empty({ text }) {
  return (
    <div className="bg-night-850 border border-line rounded-xl p-10 text-center">
      <p className="text-dust text-sm">{text}</p>
    </div>
  );
}
