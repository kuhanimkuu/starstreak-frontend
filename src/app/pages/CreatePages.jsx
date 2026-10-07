import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiImage, FiZap, FiUsers } from "react-icons/fi";
import AppShell from "../AppShell";
import { BackHeader } from "./PostPage";
import { COMMUNITY_CATEGORIES, FLASH_DURATIONS, createCommunity, createFlash } from "../lib/api";
import { useAppSession } from "../AppSession";

function IconPicker({ file, onChange }) {
  const [url, setUrl] = useState(null);
  useEffect(() => {
    if (!file) return setUrl(null);
    const u = URL.createObjectURL(file);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [file]);
  return (
    <label className="flex cursor-pointer items-center gap-4">
      <span className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-2xl border border-dashed border-night-600 bg-night-850 text-dust">
        {url ? <img src={url} alt="" className="h-full w-full object-cover" /> : <FiImage size={24} />}
      </span>
      <span className="text-sm">
        <span className="font-semibold text-accent">{file ? "Change image" : "Add an image"}</span>
        <span className="block text-dust">Optional · JPEG, PNG, WebP or GIF</span>
      </span>
      <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" hidden onChange={(e) => onChange(e.target.files?.[0] || null)} />
    </label>
  );
}

function Toggle({ checked, onChange, label, hint }) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 rounded-2xl border border-line bg-night-800 p-4">
      <span>
        <span className="block font-semibold text-star">{label}</span>
        {hint && <span className="mt-0.5 block text-sm text-dust">{hint}</span>}
      </span>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-1 h-5 w-5 accent-[#FF6D1F]" />
    </label>
  );
}

export function CreateCommunityPage() {
  const { myId, notify } = useAppSession();
  const navigate = useNavigate();
  const [f, setF] = useState({ name: "", description: "", category: "Other", isPrivate: false, requiresApproval: false, allowAnonymous: true, postingPermission: "everyone", icon: null });
  const [busy, setBusy] = useState(false);
  const set = (k) => (v) => setF((x) => ({ ...x, [k]: v }));

  async function submit(e) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      const id = await createCommunity(myId, f);
      notify(`${f.name.trim()} is ready 🎉`);
      navigate(id ? `/communities/${id}` : "/communities", { replace: true });
    } catch (err) {
      notify(err.message, "error");
      setBusy(false);
    }
  }

  return (
    <AppShell title="New community">
      <BackHeader title="New community" />
      <form onSubmit={submit} className="space-y-5 px-4 py-5">
        <IconPicker file={f.icon} onChange={set("icon")} />
        <div>
          <label className="field-label" htmlFor="c-name">Name</label>
          <input id="c-name" className="field" value={f.name} onChange={(e) => set("name")(e.target.value)} maxLength={100} required placeholder="e.g. Nairobi Photographers" />
        </div>
        <div>
          <label className="field-label" htmlFor="c-desc">Description</label>
          <textarea id="c-desc" className="field min-h-[100px]" value={f.description} onChange={(e) => set("description")(e.target.value)} maxLength={2000} placeholder="What's this community about?" />
        </div>
        <div>
          <label className="field-label" htmlFor="c-cat">Category</label>
          <select id="c-cat" className="field" value={f.category} onChange={(e) => set("category")(e.target.value)}>
            {COMMUNITY_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <Toggle checked={f.isPrivate} onChange={set("isPrivate")} label="Private" hint="Invite-only — only members see posts." />
        {!f.isPrivate && <Toggle checked={f.requiresApproval} onChange={set("requiresApproval")} label="Approve new members" hint="People request to join and an admin approves them." />}
        <Toggle checked={f.allowAnonymous} onChange={set("allowAnonymous")} label="Allow anonymous posts" />
        <div>
          <label className="field-label" htmlFor="c-perm">Who can post</label>
          <select id="c-perm" className="field" value={f.postingPermission} onChange={(e) => set("postingPermission")(e.target.value)}>
            <option value="everyone">All members</option>
            <option value="adminsOnly">Only admins and moderators</option>
          </select>
        </div>
        <button disabled={busy || f.name.trim().length < 3} className="btn-flare w-full disabled:opacity-50">
          <FiUsers /> {busy ? "Creating…" : "Create community"}
        </button>
      </form>
    </AppShell>
  );
}

export function CreateFlashPage() {
  const { myId, notify } = useAppSession();
  const navigate = useNavigate();
  const [f, setF] = useState({ name: "", description: "", category: "General", hours: 6, locationName: "", maxMembers: "", icon: null });
  const [busy, setBusy] = useState(false);
  const set = (k) => (v) => setF((x) => ({ ...x, [k]: v }));

  async function submit(e) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      const id = await createFlash(myId, f);
      notify("Your Flash is live ⚡");
      navigate(id ? `/flashes/${id}` : "/flashes", { replace: true });
    } catch (err) {
      notify(err.message, "error");
      setBusy(false);
    }
  }

  return (
    <AppShell title="Start a Flash">
      <BackHeader title="Start a Flash" />
      <form onSubmit={submit} className="space-y-5 px-4 py-5">
        <p className="rounded-2xl border border-flare/30 bg-flare/10 p-4 text-sm text-mist">
          A Flash is a short-lived space for a moment — a match, a launch, a campus event. When time's up it ends, and members can decide whether to keep it as a community.
        </p>
        <IconPicker file={f.icon} onChange={set("icon")} />
        <div>
          <label className="field-label" htmlFor="f-name">Name</label>
          <input id="f-name" className="field" value={f.name} onChange={(e) => set("name")(e.target.value)} maxLength={100} required placeholder="e.g. Finals watch party" />
        </div>
        <div>
          <label className="field-label" htmlFor="f-desc">What's happening?</label>
          <textarea id="f-desc" className="field min-h-[90px]" value={f.description} onChange={(e) => set("description")(e.target.value)} maxLength={2000} />
        </div>
        <div>
          <span className="field-label">How long</span>
          <div className="flex flex-wrap gap-2">
            {FLASH_DURATIONS.map((d) => (
              <button type="button" key={d.hours} onClick={() => set("hours")(d.hours)}
                      className={`rounded-full border px-4 py-2 text-sm font-semibold ${f.hours === d.hours ? "border-transparent bg-flare-gradient text-night-950" : "border-line text-mist hover:text-star"}`}>
                {d.label}
              </button>
            ))}
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="field-label" htmlFor="f-loc">Where (optional)</label>
            <input id="f-loc" className="field" value={f.locationName} onChange={(e) => set("locationName")(e.target.value)} maxLength={100} placeholder="e.g. Main campus" />
          </div>
          <div>
            <label className="field-label" htmlFor="f-max">Member limit (optional)</label>
            <input id="f-max" className="field" type="number" min={2} max={100000} value={f.maxMembers} onChange={(e) => set("maxMembers")(e.target.value)} placeholder="No limit" />
          </div>
        </div>
        <button disabled={busy || f.name.trim().length < 3} className="btn-flare w-full disabled:opacity-50">
          <FiZap /> {busy ? "Starting…" : "Start Flash"}
        </button>
      </form>
    </AppShell>
  );
}
