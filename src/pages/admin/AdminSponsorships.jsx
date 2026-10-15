import { useCallback, useEffect, useState } from "react";
import { FiCheck, FiX, FiZap, FiPause, FiPlay, FiSquare } from "react-icons/fi";
import { supabase } from "../../lib/supabase";
import { timeAgo } from "../../app/lib/format";

// Organisation reviews (Starstreak team only) — strategy v3 16a/17.
// Verification is automatic (work-email code, website match, KRA PIN format,
// look-alike screen): clean applications approve themselves; only FLAGGED
// ones need a person here. Billing (Paystack) is integrated later, so an
// approved organisation waits for payment unless activated for a pilot.

const FLAG_LABEL = {
  email_not_at_website_domain: "Email isn't at the website's domain",
  no_registration_number: "No registration number",
  registration_not_kra_format: "Registration number isn't a KRA PIN",
  resembles_protected_brand: "Looks like a protected brand",
  resembles_existing_organisation: "Looks like an existing verified organisation",
  website_not_reachable: "Website didn't respond",
};
const COLUMNS = "community_id, status, plan, legal_name, registration_number, contact_email, website, applied_at, review_note, flags, auto_approved, email_verified_at, website_ok, communities(name)";

const STATUS_STYLE = {
  pending_email: "bg-night-700 text-mist",
  pending_review: "bg-amber-500/15 text-amber-300",
  approved_unpaid: "bg-sky-500/15 text-sky-300",
  active: "bg-green-500/15 text-green-400",
  grace: "bg-orange-500/15 text-orange-300",
  lapsed: "bg-night-700 text-mist",
  rejected: "bg-red-500/15 text-red-400",
  awaiting_payment: "bg-sky-500/15 text-sky-300",
  paused: "bg-night-700 text-mist",
  ended: "bg-night-700 text-mist",
};

function Pill({ value }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs ${STATUS_STYLE[value] || "bg-night-700 text-mist"}`}>
      {String(value).replace(/_/g, " ")}
    </span>
  );
}

const kes = (minor) => `KES ${(Number(minor || 0) / 100).toLocaleString()}`;

export default function AdminSponsorships() {
  const [apps, setApps] = useState([]);
  const [promos, setPromos] = useState([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(null);

  const load = useCallback(async () => {
    const [a, p] = await Promise.all([
      supabase.from("community_sponsorships").select(COLUMNS).order("applied_at", { ascending: false }),
      supabase.from("promotions").select("*, communities(name)").order("created_at", { ascending: false }).limit(100),
    ]);
    if (a.error) return setError(a.error.message);
    if (p.error) return setError(p.error.message);
    setApps(a.data || []);
    setPromos(p.data || []);
  }, []);

  useEffect(() => {
    const t = setTimeout(load, 0);
    return () => clearTimeout(t);
  }, [load]);

  async function review(app, approve, activate = false) {
    const note = approve ? null : window.prompt("Reason (shown to the organisation):", "");
    if (!approve && note === null) return;
    setBusy(app.community_id);
    const { error: e } = await supabase.rpc("ops_review_sponsorship", {
      p_community_id: app.community_id, p_approve: approve, p_note: note, p_activate: activate,
    });
    setBusy(null);
    if (e) setError(e.message);
    else load();
  }

  async function setPromo(promo, status) {
    setBusy(promo.id);
    const { error: e } = await supabase.rpc("ops_set_promotion_status", { p_id: promo.id, p_status: status });
    setBusy(null);
    if (e) setError(e.message);
    else load();
  }

  return (
    <div className="max-w-5xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-star">Organisation reviews</h1>
        <p className="mt-1 text-sm text-mist">
          Verification is automatic: organisations that pass every check are approved on their own. Only flagged applications
          need you. Billing isn't connected yet, so approved organisations wait for payment unless you activate them for a pilot.
        </p>
      </div>
      {error && <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400">{error}</p>}

      <section className="rounded-xl border border-line bg-night-850 p-6">
        <h2 className="mb-3 text-sm font-semibold text-star">
          Applications ({apps.length}) · <span className="text-amber-300">{apps.filter((a) => a.status === "pending_review").length} need you</span>
        </h2>
        {apps.length === 0 && <p className="text-sm text-dust">No applications yet.</p>}
        <ul className="divide-y divide-line">
          {apps.map((a) => (
            <li key={a.community_id} className="flex flex-wrap items-center gap-3 py-3">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-star">{a.legal_name}</span>
                  <Pill value={a.status} />
                  {a.auto_approved && <span className="text-xs text-green-400">approved automatically</span>}
                </div>
                {a.flags?.length > 0 && (
                  <ul className="mt-1 flex flex-wrap gap-1">
                    {a.flags.map((f) => (
                      <li key={f} className="rounded bg-amber-500/10 px-1.5 py-0.5 text-[11px] text-amber-300">{FLAG_LABEL[f] || f}</li>
                    ))}
                  </ul>
                )}
                <p className="mt-0.5 text-xs text-dust">
                  {a.communities?.name || "Community"} · {a.contact_email}
                  {a.registration_number && <> · Reg. {a.registration_number}</>}
                  {a.website && <> · {a.website}</>} · applied {timeAgo(a.applied_at)}
                </p>
                {a.review_note && <p className="mt-0.5 text-xs text-mist">Note: {a.review_note}</p>}
              </div>
              {a.status === "pending_review" && (
                <div className="flex items-center gap-1">
                  <button onClick={() => review(a, true)} disabled={busy === a.community_id}
                          className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-green-400 hover:bg-night-700"><FiCheck /> Approve</button>
                  <button onClick={() => review(a, true, true)} disabled={busy === a.community_id}
                          className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-sky-300 hover:bg-night-700"><FiZap /> Approve & activate (pilot)</button>
                  <button onClick={() => review(a, false)} disabled={busy === a.community_id}
                          className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-red-400 hover:bg-red-500/10"><FiX /> Reject</button>
                </div>
              )}
              {a.status === "approved_unpaid" && (
                <button onClick={() => review(a, true, true)} disabled={busy === a.community_id}
                        className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-sky-300 hover:bg-night-700"><FiZap /> Activate (pilot)</button>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-xl border border-line bg-night-850 p-6">
        <h2 className="mb-1 text-sm font-semibold text-star">Promotions ({promos.length})</h2>
        <p className="mb-3 text-xs text-dust">Showing promotions in the feed is integrated later; activating here only marks them active.</p>
        {promos.length === 0 && <p className="text-sm text-dust">No promotions yet.</p>}
        <ul className="divide-y divide-line">
          {promos.map((p) => (
            <li key={p.id} className="flex flex-wrap items-center gap-3 py-3">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm text-star">{p.communities?.name || "Community"} · {p.kind === "flash" ? "Flash" : "Post"}</span>
                  <Pill value={p.status} />
                </div>
                <p className="mt-0.5 text-xs text-dust">
                  Budget {kes(p.budget_minor)} · spent {kes(p.spent_minor)} · {p.pricing === "per_join" ? "per join" : "per 1,000 shown"}
                  {p.regions?.length > 0 && <> · regions {p.regions.join(", ")}</>}
                  {p.lookalikes && <> · lookalikes</>} · until {new Date(p.ends_at).toLocaleString()}
                </p>
                <p className="mt-0.5 text-xs text-mist">{p.shown_count} shown · {p.joins_count} joins · {p.hides_count} hides</p>
              </div>
              <div className="flex items-center gap-1">
                {p.status !== "active" && p.status !== "ended" && (
                  <button onClick={() => setPromo(p, "active")} disabled={busy === p.id} title="Activate (pilot)"
                          className="grid h-8 w-8 place-items-center rounded-lg text-green-400 hover:bg-night-700"><FiPlay /></button>
                )}
                {p.status === "active" && (
                  <button onClick={() => setPromo(p, "paused")} disabled={busy === p.id} title="Pause"
                          className="grid h-8 w-8 place-items-center rounded-lg text-mist hover:bg-night-700"><FiPause /></button>
                )}
                {p.status !== "ended" && (
                  <button onClick={() => setPromo(p, "ended")} disabled={busy === p.id} title="End"
                          className="grid h-8 w-8 place-items-center rounded-lg text-red-400 hover:bg-red-500/10"><FiSquare /></button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
