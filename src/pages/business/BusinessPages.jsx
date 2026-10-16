import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiZap, FiUsers, FiTrendingUp, FiEdit3, FiPause, FiPlay, FiSquare, FiPlus, FiExternalLink, FiDownload } from "react-icons/fi";
import { supabase } from "../../lib/supabase";
import { useOrg, STATUS_TEXT, money, downloadCsv } from "../../lib/business";
import ActivityList from "../../components/ActivityList";
import { timeAgo } from "../../app/lib/format";

// Starstreak Business pages. Data: org_* RPCs (access checked on the server).
// Billing (Paystack) is integrated later: promotions wait for payment and the
// Billing page is a placeholder.

const num = (n) => Number(n || 0).toLocaleString();

function Page({ title, subtitle, children, action }) {
  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-mist">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

function Card({ children, className = "" }) {
  return <div className={`rounded-xl border border-line bg-night-850 p-5 ${className}`}>{children}</div>;
}

function Stat({ icon: Icon, label, value, hint }) {
  return (
    <Card>
      <div className="flex items-center gap-2 text-xs text-dust"><Icon /> {label}</div>
      <p className="mt-2 text-2xl font-bold">{value}</p>
      {hint && <p className="mt-1 text-xs text-mist">{hint}</p>}
    </Card>
  );
}

function ExportButton({ onClick, label = "Download CSV" }) {
  return (
    <button onClick={onClick} className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-2 text-sm text-mist hover:border-flare hover:text-star">
      <FiDownload aria-hidden="true" /> {label}
    </button>
  );
}

const day = (d) => new Date(`${d}T00:00:00`).toLocaleDateString(undefined, { day: "numeric", month: "short" });

function ErrorLine({ error }) {
  return error ? <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400">{error}</p> : null;
}

const PROMO_STYLE = {
  awaiting_payment: "bg-sky-500/15 text-sky-300",
  active: "bg-green-500/15 text-green-400",
  paused: "bg-night-700 text-mist",
  ended: "bg-night-700 text-dust",
  rejected: "bg-red-500/15 text-red-400",
};

// ── Overview ─────────────────────────────────────────────────────────────────
export function BusinessOverview() {
  const { overview, orgId } = useOrg();
  const o = overview.organisation;
  return (
    <Page title={overview.community.name} subtitle={`${o.legal_name} · ${STATUS_TEXT[o.status] || o.status}`}>
      {o.status === "approved_unpaid" && (
        <Card className="border-sky-500/30 bg-sky-500/5 text-sm text-mist">
          You're verified. Billing isn't connected yet, so promotions you create wait for payment; we'll reach out to set it up.
        </Card>
      )}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={FiUsers} label="Members" value={num(overview.members)} hint={`+${num(overview.joined_7d)} this week`} />
        <Stat icon={FiTrendingUp} label="New members, 30 days" value={num(overview.joined_30d)} />
        <Stat icon={FiEdit3} label="Posts, 30 days" value={num(overview.posts_30d)} />
        <Stat icon={FiZap} label="Active promotions" value={num(overview.promotions_active)} hint={`${money(overview.spent_minor, o.currency)} spent`} />
      </div>
      <Card>
        <h2 className="text-sm font-semibold">Live Flash</h2>
        {overview.live_flash ? (
          <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm"><b>{overview.live_flash.name}</b> · {num(overview.live_flash.members)} in · ends {new Date(overview.live_flash.expires_at).toLocaleString()}</p>
            <Link to={`/business/${orgId}/promotions`} className="btn-flare !px-4 !py-2 text-sm"><FiZap /> Promote it</Link>
          </div>
        ) : (
          <p className="mt-2 text-sm text-mist">No Flash running. Start a Quick Flash from your community in the Starstreak app.</p>
        )}
      </Card>
    </Page>
  );
}

// ── Promotions ───────────────────────────────────────────────────────────────
function NewPromotion({ onDone }) {
  const { orgId, overview } = useOrg();
  const [posts, setPosts] = useState([]);
  const [target, setTarget] = useState(overview.live_flash ? `flash:${overview.live_flash.id}` : "");
  const [budget, setBudget] = useState("1000");
  const [regions, setRegions] = useState("");
  const currency = overview.organisation.currency || "KES";
  const [interests, setInterests] = useState("");
  const [lookalikes, setLookalikes] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    supabase.from("posts_public").select("id, content, created_at").eq("posted_as_id", orgId)
      .eq("is_deleted", false).order("created_at", { ascending: false }).limit(10)
      .then(({ data }) => setPosts(data || []));
  }, [orgId]);

  const list = (s) => s.split(",").map((x) => x.trim()).filter(Boolean);

  async function submit() {
    const [kind, id] = target.split(":");
    const kesBudget = Number(budget);
    if (!kind || !id) return setError("Choose what to promote.");
    if (!(kesBudget > 0)) return setError("Enter a budget above zero.");
    if (kesBudget > 100000000) return setError("That budget is too large. Contact us for bigger campaigns.");
    setBusy(true);
    setError("");
    const { error: e } = await supabase.rpc("create_promotion", {
      p_community_id: orgId, p_kind: kind, p_target_id: id, p_budget_minor: Math.round(kesBudget * 100),
      p_regions: list(regions).map((r) => r.toUpperCase()), p_interests: list(interests).map((r) => r.toLowerCase()),
      p_lookalikes: lookalikes,
    });
    setBusy(false);
    if (e) setError(e.message);
    else onDone();
  }

  const input = "mt-1 w-full rounded-lg border border-night-600 bg-night-800 px-3 py-2 text-sm text-star focus:border-flare focus:outline-none";
  return (
    <Card className="space-y-4">
      <h2 className="text-sm font-semibold">New promotion</h2>
      <label className="block text-xs text-dust">What to promote
        <select value={target} onChange={(e) => setTarget(e.target.value)} className={input}>
          <option value="">Choose…</option>
          {overview.live_flash && <option value={`flash:${overview.live_flash.id}`}>Live Flash: {overview.live_flash.name}</option>}
          {posts.map((p) => <option key={p.id} value={`post:${p.id}`}>Post: {(p.content || "(media)").slice(0, 60)}</option>)}
        </select>
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-xs text-dust">Budget ({currency})
          <input value={budget} onChange={(e) => setBudget(e.target.value)} inputMode="numeric" className={input} />
        </label>
        <label className="block text-xs text-dust">Countries (optional; blank = everywhere)
          <input value={regions} onChange={(e) => setRegions(e.target.value)} placeholder="e.g. KE, NG, GB" className={input} />
        </label>
      </div>
      <label className="block text-xs text-dust">Interests (optional, e.g. football, music)
        <input value={interests} onChange={(e) => setInterests(e.target.value)} className={input} />
      </label>
      <label className="flex items-center gap-2 text-sm text-mist">
        <input type="checkbox" checked={lookalikes} onChange={(e) => setLookalikes(e.target.checked)} className="accent-[#FF6D1F]" />
        Also reach people with similar taste to your members
      </label>
      <p className="text-xs text-dust">Shown in the feed and Discover with a small "Promoted" label, never as notifications. Starts once billing is set up.</p>
      <ErrorLine error={error} />
      <button onClick={submit} disabled={busy} className="btn-flare !py-2 text-sm disabled:opacity-40">{busy ? "Creating…" : "Create promotion"}</button>
    </Card>
  );
}

export function BusinessPromotions() {
  const { orgId, isAdmin, overview } = useOrg();
  const [rows, setRows] = useState(null);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [changing, setChanging] = useState(null);
  const sponsored = ["active", "grace"].includes(overview.organisation.status);

  const load = useCallback(async () => {
    const { data, error: e } = await supabase.rpc("org_promotions", { p_community_id: orgId });
    if (e) setError(e.message);
    else setRows(data || []);
  }, [orgId]);

  useEffect(() => {
    const t = setTimeout(load, 0);
    return () => clearTimeout(t);
  }, [load]);

  async function setStatus(p, status) {
    if (changing) return;
    setChanging(p.id);
    setError("");
    const { error: e } = await supabase.rpc("org_set_promotion_status", { p_id: p.id, p_status: status });
    setChanging(null);
    if (e) setError(e.message);
    else load();
  }

  function exportCsv() {
    downloadCsv(`${overview.organisation.legal_name}-promotions.csv`, [
      ["Promoting", (p) => `${p.kind === "flash" ? "Flash" : "Post"}: ${p.target_name || ""}`],
      ["Status", (p) => p.status.replace(/_/g, " ")],
      ["Currency", (p) => p.currency],
      ["Budget", (p) => (Number(p.budget_minor) / 100).toFixed(2)],
      ["Spent", (p) => (Number(p.spent_minor) / 100).toFixed(2)],
      ["Shown", (p) => p.shown_count],
      ["Joined", (p) => p.joins_count],
      ["Hid it", (p) => p.hides_count],
      ["Countries", (p) => (p.regions || []).join(" ")],
      ["Created", (p) => p.created_at],
      ["Ends", (p) => p.ends_at],
    ], rows || []);
  }

  return (
    <Page title="Promotions" subtitle="Reach people outside your community, paid per result."
          action={
            <div className="flex flex-wrap gap-2">
              {rows?.length > 0 && <ExportButton onClick={exportCsv} />}
              {isAdmin && sponsored && !creating && (
                <button onClick={() => setCreating(true)} className="btn-flare !px-4 !py-2 text-sm"><FiPlus /> New promotion</button>)}
            </div>}>
      {!sponsored && (
        <Card className="text-sm text-mist">Promotions open once your plan is active. Status: {STATUS_TEXT[overview.organisation.status]}.</Card>
      )}
      {creating && <NewPromotion onDone={() => { setCreating(false); load(); }} />}
      <ErrorLine error={error} />
      <Card>
        {!rows ? <p className="text-sm text-dust">Loading…</p> : rows.length === 0 ? (
          <p className="text-sm text-dust">No promotions yet.</p>
        ) : (
          <ul className="divide-y divide-line">
            {rows.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="truncate text-sm">{p.kind === "flash" ? "Flash" : "Post"}: {p.target_name || "—"}</span>
                    <span className={`rounded-full px-2 py-0.5 text-xs ${PROMO_STYLE[p.status] || ""}`}>{p.status.replace(/_/g, " ")}</span>
                  </div>
                  <p className="mt-0.5 text-xs text-dust">
                    {money(p.spent_minor, p.currency)} of {money(p.budget_minor, p.currency)}
                    {p.regions?.length > 0 && <> · {p.regions.join(", ")}</>}
                    {p.lookalikes && <> · similar taste</>} · until {new Date(p.ends_at).toLocaleString()}
                  </p>
                  <p className="mt-0.5 text-xs text-mist">{num(p.shown_count)} shown · {num(p.joins_count)} joined · {num(p.hides_count)} hid it</p>
                </div>
                {isAdmin && (
                  <div className="flex items-center gap-1">
                    {p.status === "active" && <button title="Pause" aria-label="Pause promotion" disabled={!!changing} onClick={() => setStatus(p, "paused")} className="grid h-8 w-8 place-items-center rounded-lg text-mist hover:bg-night-700"><FiPause /></button>}
                    {p.status === "paused" && <button title="Resume" aria-label="Resume promotion" disabled={!!changing} onClick={() => setStatus(p, "active")} className="grid h-8 w-8 place-items-center rounded-lg text-green-400 hover:bg-night-700"><FiPlay /></button>}
                    {["awaiting_payment", "active", "paused"].includes(p.status) && (
                      <button title="End" aria-label="End promotion" disabled={!!changing} onClick={() => window.confirm("End this promotion? This can't be undone.") && setStatus(p, "ended")}
                              className="grid h-8 w-8 place-items-center rounded-lg text-red-400 hover:bg-red-500/10"><FiSquare /></button>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </Page>
  );
}

// ── Analytics ────────────────────────────────────────────────────────────────
export function BusinessAnalytics() {
  const { orgId, overview } = useOrg();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    supabase.rpc("org_analytics", { p_community_id: orgId }).then(({ data: d, error: e }) => {
      if (e) setError(e.message);
      else setData(d);
    });
  }, [orgId]);

  if (error) return <Page title="Analytics"><ErrorLine error={error} /></Page>;
  if (!data) return <Page title="Analytics"><p className="text-sm text-dust">Loading…</p></Page>;

  const days = data.joins_by_day || [];
  const max = Math.max(1, ...days.map((d) => d.joins));
  const regionTotal = (data.regions || []).reduce((s, r) => s + Number(r.members), 0) || 1;

  const exportCsv = () => {
    const name = overview.organisation.legal_name;
    downloadCsv(`${name}-new-members.csv`, [["Date", (d) => d.day], ["New members", (d) => d.joins]], days);
    downloadCsv(`${name}-regions.csv`, [["Region", (r) => r.region], ["Members", (r) => r.members]], data.regions || []);
    downloadCsv(`${name}-top-posts.csv`, [
      ["Post", (p) => p.snippet], ["Likes", (p) => p.likes], ["Comments", (p) => p.comments],
      ["Views", (p) => p.views], ["Posted", (p) => p.created_at],
    ], data.top_posts || []);
  };

  return (
    <Page title="Analytics" subtitle="Totals only. Regions with fewer than 5 members are grouped as Other, so nobody can be singled out."
          action={<ExportButton onClick={exportCsv} label="Download CSVs" />}>
      <Card>
        <h2 className="text-sm font-semibold">New members, last 30 days</h2>
        <div className="mt-4 flex h-32 items-end gap-1" role="img" aria-label="New members per day for the last 30 days">
          {days.map((d) => (
            <div key={d.day} title={`${day(d.day)}: ${d.joins}`} className="flex-1 rounded-t bg-flare/70"
                 style={{ height: `${Math.max(2, (d.joins / max) * 100)}%` }} />
          ))}
        </div>
        <div className="mt-1 flex justify-between text-[11px] text-dust"><span>{days[0] && day(days[0].day)}</span><span>{days.length > 0 && day(days[days.length - 1].day)}</span></div>
      </Card>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="text-sm font-semibold">Where your members are</h2>
          {(data.regions || []).length === 0 && <p className="mt-3 text-sm text-dust">No members yet.</p>}
          <ul className="mt-3 space-y-2">
            {(data.regions || []).map((r) => (
              <li key={r.region} className="text-sm">
                <div className="flex justify-between"><span>{r.region}</span><span className="text-mist">{num(r.members)}</span></div>
                <div className="mt-1 h-1.5 rounded bg-night-700"><div className="h-1.5 rounded bg-flare" style={{ width: `${(r.members / regionTotal) * 100}%` }} /></div>
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <h2 className="text-sm font-semibold">Flashes</h2>
          {(data.flashes || []).length === 0 ? <p className="mt-3 text-sm text-dust">No Flashes yet.</p> : (
            <ul className="mt-3 divide-y divide-line">
              {data.flashes.map((f) => (
                <li key={f.id} className="flex justify-between py-2 text-sm">
                  <span className="truncate">{f.live && <span className="mr-1 text-green-400">● </span>}{f.name}</span>
                  <span className="shrink-0 text-mist">{num(f.members)} in · {timeAgo(f.created_at)}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
      <Card>
        <h2 className="text-sm font-semibold">Top posts, last 30 days</h2>
        {(data.top_posts || []).length === 0 ? <p className="mt-3 text-sm text-dust">No posts in the last 30 days.</p> : (
          <ul className="mt-3 divide-y divide-line">
            {data.top_posts.map((p) => (
              <li key={p.id} className="flex flex-wrap justify-between gap-2 py-2 text-sm">
                <span className="min-w-0 flex-1 truncate">{p.snippet || "(media)"}</span>
                <span className="shrink-0 text-mist">{num(p.likes)} likes · {num(p.comments)} comments · {num(p.views)} views</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </Page>
  );
}

// ── Team ─────────────────────────────────────────────────────────────────────
export function BusinessTeam() {
  const { orgId, isAdmin } = useOrg();
  const loadActivity = useCallback(
    (before) => supabase.rpc("org_activity", { p_community_id: orgId, p_before: before }),
    [orgId],
  );
  const [team, setTeam] = useState(null);
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const { data, error: e } = await supabase.rpc("org_team", { p_community_id: orgId });
    if (e) setError(e.message);
    else setTeam(data || []);
  }, [orgId]);

  useEffect(() => {
    const t = setTimeout(load, 0);
    return () => clearTimeout(t);
  }, [load]);

  async function setModerator(name, on) {
    setBusy(true);
    setError("");
    const { error: e } = await supabase.rpc("org_set_moderator", { p_community_id: orgId, p_username: name, p_moderator: on });
    setBusy(false);
    if (e) setError(e.message);
    else { setUsername(""); load(); }
  }

  return (
    <Page title="Team" subtitle="Admins manage the organisation here; moderators can view it. Admin rights are changed in the app.">
      {isAdmin && (
        <Card className="flex flex-wrap items-end gap-3">
          <label className="min-w-0 flex-1 text-xs text-dust">Add a moderator (must be a member of your community)
            <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="@username"
                   className="mt-1 w-full rounded-lg border border-night-600 bg-night-800 px-3 py-2 text-sm text-star focus:border-flare focus:outline-none" />
          </label>
          <button onClick={() => setModerator(username, true)} disabled={busy || !username.trim()} className="btn-flare !py-2 text-sm disabled:opacity-40">Add</button>
        </Card>
      )}
      <ErrorLine error={error} />
      <Card>
        {!team ? <p className="text-sm text-dust">Loading…</p> : (
          <ul className="divide-y divide-line">
            {team.map((m) => (
              <li key={m.user_id} className="flex items-center gap-3 py-3">
                {m.avatar_url ? <img src={m.avatar_url} alt="" className="h-9 w-9 rounded-full object-cover" />
                  : <div className="grid h-9 w-9 place-items-center rounded-full bg-night-700 text-sm">{(m.display_name || "?")[0]}</div>}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm">{m.display_name || "Member"}</p>
                  {m.username && <p className="text-xs text-dust">@{m.username}</p>}
                </div>
                <span className={`rounded-full px-2 py-0.5 text-xs ${m.role === "admin" ? "bg-flare/15 text-flare" : "bg-sky-500/15 text-sky-300"}`}>
                  {m.role === "admin" ? "Admin" : "Moderator · view only"}
                </span>
                {isAdmin && m.role === "moderator" && m.username && (
                  <button onClick={() => window.confirm(`Remove @${m.username} as a moderator? They stay a member.`) && setModerator(m.username, false)}
                          disabled={busy} className="text-xs text-red-400 hover:underline">Remove</button>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>
      <Card>
        <h2 className="text-sm font-semibold">Activity</h2>
        <p className="mt-1 text-xs text-dust">Promotion, team and organisation changes: who made them and when.</p>
        <div className="mt-3"><ActivityList load={loadActivity} empty="No changes yet." /></div>
      </Card>
    </Page>
  );
}

// ── Billing (placeholder until Paystack) ─────────────────────────────────────
export function BusinessBilling() {
  const { overview } = useOrg();
  const o = overview.organisation;
  return (
    <Page title="Billing" subtitle="Plans, invoices and payment methods.">
      <Card className="space-y-2 text-sm">
        <p><span className="text-dust">Plan:</span> {o.plan}</p>
        <p><span className="text-dust">Status:</span> {STATUS_TEXT[o.status] || o.status}</p>
        {o.current_period_end && <p><span className="text-dust">Current period ends:</span> {new Date(o.current_period_end).toLocaleDateString()}</p>}
        <p><span className="text-dust">Promotion credit:</span> {money(o.promotion_credit_minor, o.currency)}</p>
      </Card>
      <Card className="text-sm text-mist">
        Card and M-Pesa payments are coming soon. Until then, the Starstreak team sets up billing with you directly.
      </Card>
    </Page>
  );
}

// ── Settings ─────────────────────────────────────────────────────────────────
export function BusinessSettings() {
  const { overview } = useOrg();
  const o = overview.organisation;
  return (
    <Page title="Settings" subtitle="Your verified organisation details.">
      <Card className="space-y-2 text-sm">
        <p><span className="text-dust">Legal name:</span> {o.legal_name}</p>
        <p><span className="text-dust">Website:</span> {o.website}</p>
        <p><span className="text-dust">Contact email:</span> {o.contact_email}</p>
        <p><span className="text-dust">Verified:</span> {o.auto_approved ? "automatically" : "by the Starstreak team"}</p>
      </Card>
      <Card className="text-sm text-mist">
        Changing these details means verifying again, so it's done from the app (community Settings → Verified organisation).
        Your community's name, picture and description are edited in the app too.
        {overview.community.short_id && (
          <a href={`/community/${overview.community.short_id}`} className="ml-1 inline-flex items-center gap-1 text-flare">
            View community <FiExternalLink />
          </a>
        )}
      </Card>
    </Page>
  );
}
