import { useCallback, useEffect, useState } from "react";
import { FiToggleRight } from "react-icons/fi";
import { supabase } from "../../lib/supabase";

// Feature switches (app_flags, migration 20261018000005): turn a feature
// off in the app for everyone without a release. Apps pick the change up the
// next time they start. Every change goes into the activity log.
export default function FeatureSwitches() {
  const [flags, setFlags] = useState(null);
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const { data, error: e } = await supabase.from("app_flags").select("key, enabled, note, updated_at").order("key");
    if (e) setError(e.message);
    else setFlags(data || []);
  }, []);

  useEffect(() => {
    const t = setTimeout(load, 0);
    return () => clearTimeout(t);
  }, [load]);

  async function toggle(flag) {
    const next = !flag.enabled;
    if (!next && !window.confirm(`Turn off "${flag.note || flag.key}" for everyone? Apps stop showing it after their next start.`)) return;
    setBusy(flag.key);
    setError("");
    const { error: e } = await supabase.rpc("ops_set_flag", { p_key: flag.key, p_enabled: next });
    setBusy(null);
    if (e) return setError(`Couldn't change it: ${e.message}`);
    setFlags((prev) => prev.map((f) => (f.key === flag.key ? { ...f, enabled: next } : f)));
  }

  return (
    <div className="bg-night-850 border border-line rounded-xl p-6 space-y-4">
      <div>
        <h2 className="flex items-center gap-2 text-star font-semibold"><FiToggleRight /> Feature switches</h2>
        <p className="text-dust text-xs mt-1">Turn a feature off in the app without a release. Apps pick it up the next time they start.</p>
      </div>
      {error && <p role="alert" className="text-xs text-red-400">{error}</p>}
      {!flags ? <p className="text-sm text-dust">Loading…</p> : flags.length === 0 ? (
        <p className="text-sm text-dust">No switches yet.</p>
      ) : (
        <ul className="divide-y divide-line">
          {flags.map((f) => (
            <li key={f.key} className="flex items-center justify-between gap-4 py-3">
              <div className="min-w-0">
                <p className="text-sm text-star">{f.note || f.key}</p>
                <p className="text-xs text-dust"><code>{f.key}</code></p>
              </div>
              <button onClick={() => toggle(f)} disabled={busy === f.key} role="switch" aria-checked={f.enabled}
                aria-label={`${f.note || f.key}: ${f.enabled ? "on" : "off"}`}
                className={`rounded-full px-3 py-1 text-xs font-medium disabled:opacity-50 ${f.enabled ? "bg-green-500/15 text-green-400" : "bg-red-500/15 text-red-400"}`}>
                {f.enabled ? "On" : "Off"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
