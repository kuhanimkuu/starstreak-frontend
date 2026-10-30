import { useCallback, useEffect, useMemo, useState } from "react";
import { FiAward, FiPlus, FiSave, FiSend, FiArchive, FiTrash2, FiEdit2, FiX } from "react-icons/fi";
import { supabase } from "../../lib/supabase";
import BadgeArt from "../../components/BadgeArt";
import { TEMPLATES, TIERS, COLORS, ICONS, FLARELY_POSES } from "../../components/badgeLook";

// Badges (migration 20261029000001_badge_catalogue.sql). Ops design a badge
// from a template, name it, choose who earns it, and release it: it goes live
// in the app and everyone who already qualifies gets it at once. Drafts are
// never awarded. Every write goes through an ops_* function that checks
// is_ops_admin() on the server.

const RULES = [
  { value: "signup", label: "Creates an account", counted: false },
  { value: "flash_join", label: "Joins Flashes", counted: true, unit: ["Flash", "Flashes"] },
  { value: "flash_create", label: "Starts Flashes", counted: true, unit: ["Flash", "Flashes"] },
  { value: "flash_interact", label: "Posts or reacts in Flashes", counted: true, unit: ["Flash", "different Flashes"] },
  { value: "flash_moment", label: "Is active during a Streak Moment", counted: false },
  { value: "community_join", label: "Joins communities", counted: true, unit: ["community", "communities"] },
  { value: "community_create", label: "Starts communities", counted: true, unit: ["community", "communities"] },
  { value: "community_post", label: "Posts in communities", counted: true, unit: ["community post", "community posts"] },
  { value: "post", label: "Shares feed posts", counted: true, unit: ["post", "posts"] },
  { value: "follow", label: "Follows people", counted: true, unit: ["person", "people"] },
  { value: "followers", label: "Gets followers", counted: true, unit: ["follower", "followers"] },
  { value: "days_active", label: "Opens Starstreak on different days", counted: true, unit: ["day", "different days"] },
  { value: "flash_streak", label: "Is active in Flashes days in a row", counted: true, unit: ["day in a row", "days in a row"] },
  { value: "reactions_received", label: "Gets likes on their posts", counted: true, unit: ["like", "likes in total"] },
  { value: "moment_top_post", label: "Writes the top post in a Streak Moment (won)", counted: false, event: true },
  { value: "flash_whole_event", label: "Stays in a Flash start to finish (won)", counted: false, event: true },
  { value: "prediction", label: "Calls a host's prediction right (won)", counted: false, event: true },
  { value: "", label: "Nobody automatically", counted: false },
];

const MOMENT_KINDS = [
  { value: "", label: "Any moment" },
  { value: "goal", label: "Goal" },
  { value: "penalty", label: "Penalty" },
  { value: "red_card", label: "Red card" },
  { value: "half_time", label: "Half-time" },
  { value: "stoppage_time", label: "Stoppage time" },
  { value: "custom", label: "A host's own named moment" },
];

const EMPTY = {
  id: null, name: "", description: "", template: "medal", icon: "star", color: "flare",
  tier: "common", rule: "post", threshold: 1, moment_kind: "", sort: 0, status: "draft",
};

function ruleSummary(b) {
  const r = RULES.find((x) => x.value === (b.rule ?? ""));
  if (!r) return "Unknown rule";
  if (b.rule === "signup") return "Everyone who creates an account";
  if (b.rule === "flash_moment") {
    const k = MOMENT_KINDS.find((x) => x.value === (b.moment_kind ?? ""));
    return `Active during ${k && k.value ? `a ${k.label.toLowerCase()} moment` : "any Streak Moment"} (once per moment)`;
  }
  if (!b.rule) return "Not awarded automatically";
  if (b.rule === "moment_top_post") return "The most-liked post written during a Streak Moment (once per moment, decided 5 minutes after it closes)";
  if (b.rule === "flash_whole_event") return "Active in the first and last quarter of a Flash's busy period, 20+ minutes (once per Flash, decided when it ends)";
  if (b.rule === "prediction") return "Picked the right answer in a host's prediction (once per prediction)";
  const n = Number(b.threshold) || 1;
  if (b.rule === "days_active") return `Opens Starstreak on ${n.toLocaleString()} different ${n === 1 ? "day" : "days"}`;
  if (b.rule === "flash_streak") return `Active in Flashes ${n.toLocaleString()} ${n === 1 ? "day" : "days in a row"}`;
  if (b.rule === "reactions_received") return `Gets ${n.toLocaleString()} ${n === 1 ? "like" : "likes"} in total on their posts`;
  const verb = r.label.split(" ")[0];
  return `${verb} ${n.toLocaleString()} ${n === 1 ? r.unit[0] : r.unit[1]}`;
}

const field = "w-full rounded-lg bg-night-900 border border-line px-3 py-2 text-sm text-star placeholder:text-dust focus:outline-none focus:border-flare";

function Editor({ initial, onClose, onSaved }) {
  const [b, setB] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const live = initial.status !== "draft";
  const rule = RULES.find((r) => r.value === (b.rule ?? "")) ?? RULES[0];
  const set = (k, v) => setB((x) => ({ ...x, [k]: v }));

  async function save() {
    setError("");
    if (!b.name.trim()) return setError("Give the badge a name.");
    const threshold = rule.counted ? Number(b.threshold) : 1;
    if (!Number.isInteger(threshold) || threshold < 1) return setError("The count is a whole number, 1 or more.");
    setBusy(true);
    const { error: e } = await supabase.rpc("ops_save_badge", {
      p_id: b.id, p_name: b.name.trim(), p_description: b.description.trim(),
      p_template: b.template, p_icon: b.icon, p_color: b.color, p_tier: b.tier,
      p_rule: b.rule || null, p_threshold: threshold,
      p_moment_kind: b.rule === "flash_moment" ? (b.moment_kind || null) : null,
      p_sort: Number(b.sort) || 0,
    });
    setBusy(false);
    if (e) return setError(e.message);
    onSaved();
  }

  function pickTemplate(t) {
    setB((x) => ({
      ...x,
      template: t,
      // Flarely shows the mascot; other templates show an icon.
      icon: t === "flarely" ? (x.icon.startsWith("flarely_") ? x.icon : "flarely_main")
        : (x.icon.startsWith("flarely_") ? "star" : x.icon),
    }));
  }

  return (
    <div className="bg-night-850 border border-line rounded-xl p-6 space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-star font-semibold">{b.id ? "Edit badge" : "New badge"}</h2>
          <p className="text-dust text-xs mt-1">
            {live ? "This badge is live. You can change how it looks and its text, but not who earns it."
              : "Saved as a draft. Nobody gets it until you release it."}
          </p>
        </div>
        <button onClick={onClose} className="text-dust hover:text-star" aria-label="Close editor"><FiX /></button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_220px]">
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-1 text-xs text-mist">
              <span>Name (shown under the badge)</span>
              <input id="badge-name" maxLength={40} value={b.name} onChange={(e) => set("name", e.target.value)}
                placeholder="e.g. First Flash" className={field} />
            </label>
            <label className="space-y-1 text-xs text-mist">
              <span>Order in lists (lower first)</span>
              <input id="badge-sort" type="number" value={b.sort} onChange={(e) => set("sort", e.target.value)} className={field} />
            </label>
            <label className="space-y-1 text-xs text-mist sm:col-span-2">
              <span>Description (how it was earned)</span>
              <input id="badge-description" maxLength={160} value={b.description} onChange={(e) => set("description", e.target.value)}
                placeholder="e.g. Joined your first Flash." className={field} />
            </label>
          </div>

          <div className="space-y-2">
            <div className="text-xs text-mist">Template</div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {TEMPLATES.map((t) => (
                <button key={t.value} type="button" onClick={() => pickTemplate(t.value)}
                  className={`flex flex-col items-center gap-2 rounded-lg border p-3 text-xs ${b.template === t.value ? "border-flare bg-flare/10 text-star" : "border-line text-mist hover:border-dust"}`}>
                  <BadgeArt template={t.value} icon={t.value === "flarely" ? "flarely_main" : b.icon.startsWith("flarely_") ? "star" : b.icon}
                    color={b.color} tier={b.tier} size={56} />
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-xs text-mist">{b.template === "flarely" ? "Flarely pose" : "Icon"}</div>
            <div className="flex flex-wrap gap-1.5">
              {b.template === "flarely"
                ? FLARELY_POSES.map((pose) => (
                  <button key={pose} type="button" onClick={() => set("icon", `flarely_${pose}`)} title={pose}
                    className={`rounded-lg border p-1.5 ${b.icon === `flarely_${pose}` ? "border-flare bg-flare/10" : "border-line hover:border-dust"}`}>
                    <img src={`/mascot/flarely_${pose}.png`} alt={pose} width={32} height={32} />
                  </button>
                ))
                : Object.keys(ICONS).map((key) => {
                  const Glyph = ICONS[key];
                  return (
                    <button key={key} type="button" onClick={() => set("icon", key)} title={key}
                      className={`rounded-lg border p-2 ${b.icon === key ? "border-flare bg-flare/10 text-star" : "border-line text-mist hover:border-dust"}`}>
                      <Glyph size={20} />
                    </button>
                  );
                })}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <div className="text-xs text-mist">Colour</div>
              <div className="flex flex-wrap gap-2">
                {Object.entries(COLORS).map(([key, c]) => (
                  <button key={key} type="button" onClick={() => set("color", key)} title={key} aria-label={key}
                    className={`h-8 w-8 rounded-full border-2 ${b.color === key ? "border-star" : "border-transparent"}`}
                    style={{ background: `linear-gradient(135deg, ${c.light}, ${c.base})` }} />
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-xs text-mist">Tier</div>
              <div className="flex gap-2">
                {TIERS.map((t) => (
                  <button key={t.value} type="button" onClick={() => set("tier", t.value)} title={t.hint}
                    className={`flex-1 rounded-lg border px-3 py-2 text-xs ${b.tier === t.value ? "border-flare bg-flare/10 text-star" : "border-line text-mist hover:border-dust"}`}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-xs text-mist">Who earns it</div>
            <div className="grid gap-3 sm:grid-cols-[1fr_140px]">
              <select id="badge-rule" value={b.rule ?? ""} disabled={live}
                onChange={(e) => set("rule", e.target.value)} className={`${field} disabled:opacity-60`}>
                {RULES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
              {rule.counted && (
                <input id="badge-threshold" type="number" min="1" disabled={live} value={b.threshold}
                  onChange={(e) => set("threshold", e.target.value)} className={`${field} disabled:opacity-60`} aria-label="How many" />
              )}
              {b.rule === "flash_moment" && (
                <select id="badge-moment" value={b.moment_kind ?? ""} disabled={live}
                  onChange={(e) => set("moment_kind", e.target.value)} className={`${field} disabled:opacity-60`}>
                  {MOMENT_KINDS.map((k) => <option key={k.value} value={k.value}>{k.label}</option>)}
                </select>
              )}
            </div>
            <p className="text-dust text-xs">{ruleSummary({ ...b, threshold: rule.counted ? b.threshold : 1 })}. Anonymous posts never count.</p>
          </div>
        </div>

        <div className="flex flex-col items-center gap-4 rounded-xl border border-line bg-night-900 p-4">
          <div className="text-xs text-dust self-start">Preview</div>
          <BadgeArt {...b} size={128} />
          <div className="text-center">
            <div className="text-star text-sm font-semibold">{b.name || "Badge name"}</div>
            <div className="text-dust text-xs mt-1">{b.description || "How it was earned"}</div>
          </div>
          <div className="flex items-end gap-3">
            <BadgeArt {...b} size={56} />
            <BadgeArt {...b} size={40} />
            <BadgeArt {...b} size={24} />
          </div>
          <div className="text-dust text-[11px]">Profile shelf · list · small</div>
        </div>
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}
      <div className="flex justify-end gap-2">
        <button onClick={onClose} className="rounded-lg border border-line px-4 py-2 text-sm text-mist hover:text-star">Cancel</button>
        <button onClick={save} disabled={busy} className="btn-flare inline-flex items-center gap-2 px-4 py-2 text-sm disabled:opacity-50">
          <FiSave /> {busy ? "Saving…" : live ? "Save changes" : "Save draft"}
        </button>
      </div>
    </div>
  );
}

function BadgeRow({ b, onEdit, onChanged }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function run(fn, args, confirmText) {
    if (confirmText && !window.confirm(confirmText)) return;
    setError("");
    setBusy(true);
    const { data, error: e } = await supabase.rpc(fn, args);
    setBusy(false);
    if (e) return setError(e.message);
    onChanged(fn === "ops_release_badge" ? data : null);
  }

  const release = () => run("ops_release_badge", { p_id: b.id },
    `Release "${b.name}"? It goes live in the app` +
    (b.would_award ? ` and ${b.would_award.toLocaleString()} ${b.would_award === 1 ? "person who already qualifies gets" : "people who already qualify get"} it now.` : "."));

  return (
    <li className="flex flex-wrap items-center gap-4 py-4">
      <BadgeArt {...b} size={56} locked={b.status === "retired"} />
      <div className="min-w-0 flex-1">
        <div className="text-star text-sm font-semibold">{b.name}</div>
        <div className="text-mist text-xs">{b.description}</div>
        <div className="text-dust text-xs mt-1">
          {ruleSummary(b)}
          {b.status === "draft" && b.rule && !RULES.find((r) => r.value === b.rule)?.event && b.rule !== "flash_moment" && ` · ${b.would_award ?? 0} would get it on release`}
          {b.status !== "draft" && ` · earned ${Number(b.earned).toLocaleString()} times`}
        </div>
        {error && <div className="text-xs text-red-400 mt-1">{error}</div>}
      </div>
      <div className="flex gap-2">
        <button onClick={() => onEdit(b)} disabled={busy} className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-xs text-mist hover:text-star">
          <FiEdit2 /> Edit
        </button>
        {b.status !== "released" && (
          <button onClick={release} disabled={busy} className="btn-flare inline-flex items-center gap-1.5 px-3 py-1.5 text-xs disabled:opacity-50">
            <FiSend /> Release
          </button>
        )}
        {b.status === "released" && (
          <button onClick={() => run("ops_retire_badge", { p_id: b.id },
            `Retire "${b.name}"? Nobody new gets it; people who have it keep it.`)}
            disabled={busy} className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-xs text-mist hover:text-star">
            <FiArchive /> Retire
          </button>
        )}
        {b.status === "draft" && (
          <button onClick={() => run("ops_delete_badge", { p_id: b.id }, `Delete the draft "${b.name}"?`)}
            disabled={busy} className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-xs text-red-400 hover:text-red-300">
            <FiTrash2 /> Delete
          </button>
        )}
      </div>
    </li>
  );
}

export default function AdminBadges() {
  const [badges, setBadges] = useState(null);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null);
  const [notice, setNotice] = useState("");

  const load = useCallback(() => supabase.rpc("ops_badges").then(({ data, error: e }) => {
    if (e) return setError(e.message);
    setError("");
    setBadges(data ?? []);
  }), []);

  useEffect(() => {
    supabase.rpc("ops_badges").then(({ data, error: e }) => {
      if (e) return setError(e.message);
      setBadges(data ?? []);
    });
  }, []);

  const groups = useMemo(() => {
    const all = badges ?? [];
    return [
      { key: "draft", title: "Drafts", hint: "Only you can see these. Nobody gets them until you release them.", items: all.filter((b) => b.status === "draft") },
      { key: "released", title: "Live in the app", hint: "Awarded automatically as people qualify.", items: all.filter((b) => b.status === "released") },
      { key: "retired", title: "Retired", hint: "Nobody new gets these; people keep the ones they earned.", items: all.filter((b) => b.status === "retired") },
    ];
  }, [badges]);

  function edit(b) {
    setNotice("");
    setEditing({
      ...EMPTY, ...b,
      rule: b.rule ?? "", moment_kind: b.moment_kind ?? "", description: b.description ?? "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="max-w-5xl space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-star"><FiAward className="text-flare-soft" /> Badges</h1>
          <p className="mt-1 text-sm text-mist max-w-2xl">
            Design a badge from a template, name it and choose who earns it. When you release it, it goes live in the app and
            everyone who already qualifies gets it straight away. Badges are free and can never be bought.
          </p>
        </div>
        {!editing && (
          <button onClick={() => { setNotice(""); setEditing(EMPTY); }} className="btn-flare inline-flex items-center gap-2 px-4 py-2 text-sm">
            <FiPlus /> New badge
          </button>
        )}
      </div>

      {editing && (
        <Editor initial={editing} onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); setNotice("Saved."); load(); }} />
      )}

      {notice && <p className="text-sm text-emerald-400">{notice}</p>}
      {error && <p className="text-sm text-red-400">{error}</p>}
      {!badges && !error && <p className="text-sm text-dust">Loading badges…</p>}

      {badges && groups.map((g) => g.items.length > 0 && (
        <section key={g.key} className="bg-night-850 border border-line rounded-xl px-6 py-4">
          <h2 className="text-star font-semibold text-sm">{g.title} <span className="text-dust font-normal">({g.items.length})</span></h2>
          <p className="text-dust text-xs mt-1">{g.hint}</p>
          <ul className="divide-y divide-line">
            {g.items.map((b) => (
              <BadgeRow key={b.id} b={b} onEdit={edit}
                onChanged={(awarded) => {
                  if (awarded != null) setNotice(`Released. ${awarded.toLocaleString()} ${awarded === 1 ? "person" : "people"} got it straight away.`);
                  load();
                }} />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
