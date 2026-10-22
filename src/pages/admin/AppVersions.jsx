import { useEffect, useState } from "react";
import { FiSmartphone, FiSave, FiCheck } from "react-icons/fi";
import { supabase } from "../../lib/supabase";

// App versions (platform_content row "app_versions", read by the app at
// start-up, lib/core/services/app_version_check.dart). "Build" is the number
// after the + in the app's version (1.0.0+2 is build 2).
//   Minimum build: older builds see a full-screen "Update Starstreak".
//   Latest build:  older builds get a one-time "new version available".

const EMPTY = { min_build: "", latest_build: "", store_url: "", message: "" };

export default function AppVersions() {
  const [form, setForm] = useState(EMPTY);
  const [saved, setSaved] = useState(EMPTY);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    supabase.from("platform_content").select("content").eq("key", "app_versions").maybeSingle()
      .then(({ data }) => {
        try {
          const c = data?.content ? JSON.parse(data.content) : {};
          const next = {
            min_build: c.min_build ?? "",
            latest_build: c.latest_build ?? "",
            store_url: c.store_url ?? "",
            message: c.message ?? "",
          };
          setForm(next);
          setSaved(next);
        } catch {
          setError("The saved setting isn't valid; saving will replace it.");
        }
      });
  }, []);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function save() {
    setError("");
    const min = form.min_build === "" ? 0 : Number(form.min_build);
    const latest = form.latest_build === "" ? 0 : Number(form.latest_build);
    const url = String(form.store_url).trim();
    if (!Number.isInteger(min) || !Number.isInteger(latest) || min < 0 || latest < 0) {
      return setError("Builds are whole numbers (the number after the + in the app version).");
    }
    if (latest && min > latest) return setError("The minimum can't be higher than the latest build.");
    if (url && !url.startsWith("https://")) return setError("The store link must start with https://.");
    if (min > Number(saved.min_build || 0) &&
        !window.confirm(`Everyone on a build below ${min} will be blocked until they update. Continue?`)) return;

    setBusy(true);
    const { data: { session } } = await supabase.auth.getSession();
    const content = JSON.stringify({
      min_build: min, latest_build: latest,
      store_url: url || null, message: String(form.message).trim() || null,
    });
    const { error: e } = await supabase.from("platform_content").upsert(
      { key: "app_versions", content, updated_at: new Date().toISOString(), updated_by: session?.user?.id },
      { onConflict: "key" },
    );
    setBusy(false);
    if (e) return setError(e.message);
    setSaved(form);
    setDone(true);
    setTimeout(() => setDone(false), 2500);
  }

  const field = "w-full rounded-lg bg-night-900 border border-line px-3 py-2 text-sm text-star placeholder:text-dust focus:outline-none focus:border-flare";

  return (
    <div className="bg-night-850 border border-line rounded-xl p-6 space-y-4">
      <div>
        <h2 className="flex items-center gap-2 text-star font-semibold text-sm"><FiSmartphone className="text-flare-soft" /> App versions</h2>
        <p className="text-dust text-xs mt-1">
          The app checks this when it starts. A build is the number after the + in the app version (1.0.0+2 is build 2), so raise it with every release.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1 text-xs text-mist">
          <span>Minimum build: older builds must update</span>
          <input id="min-build" type="number" min="0" inputMode="numeric" value={form.min_build} onChange={set("min_build")} placeholder="e.g. 2" className={field} />
        </label>
        <label className="space-y-1 text-xs text-mist">
          <span>Latest build: older builds are told once</span>
          <input id="latest-build" type="number" min="0" inputMode="numeric" value={form.latest_build} onChange={set("latest_build")} placeholder="e.g. 3" className={field} />
        </label>
        <label className="space-y-1 text-xs text-mist sm:col-span-2">
          <span>Update link (Play Store or tester download), https only</span>
          <input id="store-url" type="url" value={form.store_url} onChange={set("store_url")} placeholder="https://play.google.com/store/apps/details?id=com.nexora.nexora_app" className={field} />
        </label>
        <label className="space-y-1 text-xs text-mist sm:col-span-2">
          <span>Message on the update screen (optional)</span>
          <input id="update-message" type="text" maxLength={200} value={form.message} onChange={set("message")} placeholder="This version is no longer supported. Update to keep using Starstreak." className={field} />
        </label>
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
      <div className="flex justify-end">
        <button onClick={save} disabled={busy}
          className="btn-flare inline-flex items-center gap-2 px-4 py-2 text-sm disabled:opacity-50">
          {done ? <><FiCheck /> Saved</> : <><FiSave /> {busy ? "Saving…" : "Save"}</>}
        </button>
      </div>
    </div>
  );
}
