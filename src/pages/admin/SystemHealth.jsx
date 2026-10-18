import { useCallback, useEffect, useState } from "react";
import { FiActivity, FiRefreshCw } from "react-icons/fi";
import { supabase } from "../../lib/supabase";

// Background work at a glance (ops_system_health, migration 20261018000004):
// scheduled jobs, edge-function calls made by them, and push notifications.
// The hourly health-check job emails an alert when any of this goes wrong.

function when(ts) {
  if (!ts) return "never";
  const mins = Math.round((Date.now() - new Date(ts).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (mins < 48 * 60) return `${Math.round(mins / 60)}h ago`;
  return new Date(ts).toLocaleDateString();
}

export default function SystemHealth() {
  const [health, setHealth] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setBusy(true);
    const { data, error: e } = await supabase.rpc("ops_system_health");
    setBusy(false);
    if (e) setError(e.message);
    else { setError(""); setHealth(data); }
  }, []);

  useEffect(() => {
    const t = setTimeout(load, 0);
    return () => clearTimeout(t);
  }, [load]);

  const http = health?.edge_calls_6h || {};
  const ok = health && health.problems === 0;

  return (
    <div className="bg-night-850 border border-line rounded-xl p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-star">
          <FiActivity /> System health
          {health && (
            <span className={`rounded-full px-2 py-0.5 text-xs ${ok ? "bg-green-500/15 text-green-400" : "bg-red-500/15 text-red-400"}`}>
              {ok ? "All good" : `${health.problems} problem${health.problems === 1 ? "" : "s"}`}
            </span>
          )}
        </h2>
        <button onClick={load} disabled={busy} aria-label="Refresh system health"
          className="text-dust hover:text-star disabled:opacity-40"><FiRefreshCw className={busy ? "animate-spin" : ""} /></button>
      </div>

      {error && <p className="mt-3 text-xs text-red-400">{error}</p>}
      {!health && !error && <p className="mt-3 text-xs text-dust">Checking…</p>}

      {health && (
        <div className="mt-4 space-y-4 text-sm">
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <p className="text-xs text-dust">Edge calls, last 6 h</p>
              <p className={http.failed > 0 ? "text-red-400" : "text-star"}>{http.failed || 0} failed of {http.checked || 0}</p>
              {http.failed > 0 && <p className="text-xs text-dust">{(http.statuses || []).join(", ")}</p>}
            </div>
            <div>
              <p className="text-xs text-dust">Pushes waiting over 1 h</p>
              <p className={health.notifications_stuck > 0 ? "text-red-400" : "text-star"}>{health.notifications_stuck}</p>
            </div>
            <div>
              <p className="text-xs text-dust">Pushes given up (7 days)</p>
              <p className={health.notifications_failed_7d > 0 ? "text-red-400" : "text-star"}>{health.notifications_failed_7d}</p>
            </div>
          </div>
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-dust">
                <th className="pb-1 font-medium">Scheduled job</th>
                <th className="pb-1 font-medium">Last run</th>
                <th className="pb-1 font-medium">Failed (24 h)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {(health.jobs || []).map((j) => (
                <tr key={j.job} title={j.last_error || ""}>
                  <td className="py-1.5 text-star">{j.job}{!j.active && <span className="ml-1 text-dust">(off)</span>}</td>
                  <td className="py-1.5 text-mist">{when(j.last_run)}</td>
                  <td className={`py-1.5 ${j.failed_24h > 0 ? "text-red-400" : "text-mist"}`}>{j.failed_24h}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
