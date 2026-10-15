import { useEffect, useState } from "react";
import { Link, Navigate, useLocation, useNavigate, useParams } from "react-router-dom";
import {
  FiHome, FiTrendingUp, FiBarChart2, FiUsers, FiCreditCard, FiSettings, FiLogOut, FiMenu, FiX, FiChevronDown,
} from "react-icons/fi";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import FlarelyMark from "../components/FlarelyMark";
import { OrgContext, STATUS_TEXT } from "../lib/business";

// Starstreak Business (starstreak.org/business): a verified organisation's
// own dashboard. Admins of the organisation's community manage it;
// moderators see it read-only. All data comes from org_* functions that
// check access on the server.

const NAV = [
  { label: "Overview", path: "overview", icon: FiHome },
  { label: "Promotions", path: "promotions", icon: FiTrendingUp },
  { label: "Analytics", path: "analytics", icon: FiBarChart2 },
  { label: "Team", path: "team", icon: FiUsers },
  { label: "Billing", path: "billing", icon: FiCreditCard },
  { label: "Settings", path: "settings", icon: FiSettings },
];


function Brand() {
  return (
    <div className="flex items-center gap-2.5">
      <FlarelyMark size={30} />
      <div className="leading-none">
        <span className="text-flare-gradient font-extrabold tracking-tight">Starstreak</span>
        <span className="mt-1 block text-[10px] font-bold tracking-[0.2em] text-dust">BUSINESS</span>
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-night-950">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-flare border-t-transparent" />
    </div>
  );
}

/** Signed in, else to /login and back here afterwards. */
export function BusinessRoute({ children }) {
  const { user, authLoading } = useAuth();
  const location = useLocation();
  if (authLoading) return <Spinner />;
  if (!user) return <Navigate to={`/login?next=${encodeURIComponent(location.pathname)}`} replace />;
  return children;
}

/** The organisations you can open; one → straight in. */
export function BusinessHome() {
  const [orgs, setOrgs] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    supabase.rpc("my_organisations").then(({ data, error: e }) => {
      if (e) setError(e.message);
      else setOrgs(data || []);
    });
  }, []);

  if (error) return <p className="p-8 text-sm text-red-400">{error}</p>;
  if (!orgs) return <Spinner />;
  if (orgs.length === 1) return <Navigate to={`/business/${orgs[0].community_id}/overview`} replace />;

  return (
    <div className="min-h-screen bg-night-950 px-4 py-16 text-star">
      <div className="mx-auto max-w-xl">
        <Brand />
        <h1 className="mt-8 text-2xl font-bold">Your organisations</h1>
        {orgs.length === 0 ? (
          <div className="mt-6 rounded-xl border border-line bg-night-850 p-6 text-sm text-mist">
            <p className="font-medium text-star">No verified organisation yet.</p>
            <p className="mt-2">
              In the Starstreak app, open your organisation's community, then <b>Settings → Verified organisation</b>.
              Most organisations are verified within minutes. You'll manage it here afterwards.
            </p>
          </div>
        ) : (
          <ul className="mt-6 space-y-2">
            {orgs.map((o) => (
              <li key={o.community_id}>
                <Link to={`/business/${o.community_id}/overview`}
                      className="flex items-center gap-3 rounded-xl border border-line bg-night-850 p-4 hover:border-flare">
                  {o.image_url
                    ? <img src={o.image_url} alt="" className="h-10 w-10 rounded-full object-cover" />
                    : <div className="grid h-10 w-10 place-items-center rounded-full bg-night-700">{o.name?.[0]}</div>}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{o.name}</p>
                    <p className="text-xs text-dust">{STATUS_TEXT[o.status] || o.status} · {o.role === "admin" ? "Admin" : "View only"}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default function BusinessLayout({ children }) {
  const { orgId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [orgs, setOrgs] = useState([]);
  const [overview, setOverview] = useState(null);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [switcher, setSwitcher] = useState(false);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let off = false;
    Promise.all([
      supabase.rpc("my_organisations"),
      supabase.rpc("org_overview", { p_community_id: orgId }),
    ]).then(([o, ov]) => {
      if (off) return;
      if (ov.error) return setError(ov.error.message);
      setOrgs(o.data || []);
      setOverview(ov.data);
    });
    return () => { off = true; };
  }, [orgId, version]);

  if (error) {
    return (
      <div className="min-h-screen bg-night-950 p-8 text-star">
        <p className="text-sm text-red-400">{error}</p>
        <Link to="/business" className="mt-4 inline-block text-sm text-flare">Back to your organisations</Link>
      </div>
    );
  }
  if (!overview) return <Spinner />;

  const ctx = {
    orgId,
    overview,
    role: overview.role,
    isAdmin: overview.role === "admin",
    refresh: () => setVersion((v) => v + 1),
  };
  const org = overview.organisation;

  return (
    <OrgContext.Provider value={ctx}>
      <div className="flex min-h-screen bg-night-950 text-star">
        <aside className={`fixed inset-y-0 left-0 z-50 flex w-64 transform flex-col border-r border-line bg-night-900 transition-transform duration-200 ${
          open ? "translate-x-0" : "-translate-x-full"} lg:sticky lg:top-0 lg:h-screen lg:translate-x-0`}>
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <Brand />
            <button className="text-mist lg:hidden" aria-label="Close menu" onClick={() => setOpen(false)}><FiX /></button>
          </div>

          <div className="relative border-b border-line px-3 py-3">
            <button onClick={() => setSwitcher((v) => !v)}
                    className="flex w-full items-center gap-2 rounded-xl px-2 py-2 text-left hover:bg-night-800">
              {overview.community.image_url
                ? <img src={overview.community.image_url} alt="" className="h-8 w-8 rounded-full object-cover" />
                : <div className="grid h-8 w-8 place-items-center rounded-full bg-night-700 text-sm">{org.legal_name?.[0]}</div>}
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold">{org.legal_name}</span>
                <span className="block truncate text-[11px] text-dust">{STATUS_TEXT[org.status] || org.status}</span>
              </span>
              {orgs.length > 1 && <FiChevronDown className="text-dust" />}
            </button>
            {switcher && orgs.length > 1 && (
              <ul className="absolute left-3 right-3 top-full z-10 mt-1 rounded-xl border border-line bg-night-800 py-1 shadow-night">
                {orgs.map((o) => (
                  <li key={o.community_id}>
                    <button onClick={() => { setSwitcher(false); navigate(`/business/${o.community_id}/overview`); }}
                            className="w-full truncate px-3 py-2 text-left text-sm hover:bg-night-700">{o.name}</button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
            {NAV.map(({ label, path, icon: Icon }) => {
              const to = `/business/${orgId}/${path}`;
              const active = location.pathname.startsWith(to);
              return (
                <Link key={path} to={to} onClick={() => setOpen(false)} aria-current={active ? "page" : undefined}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                        active ? "bg-flare/15 text-flare" : "text-mist hover:bg-night-800 hover:text-star"}`}>
                  <Icon className="text-base" /> {label}
                </Link>
              );
            })}
          </nav>
          {!ctx.isAdmin && <p className="px-5 pb-2 text-[11px] text-dust">View only (moderator)</p>}
          <div className="border-t border-line p-3">
            <button onClick={async () => { await supabase.auth.signOut(); navigate("/login"); }}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-mist hover:bg-night-800 hover:text-star">
              <FiLogOut className="text-base" /> Sign out
            </button>
          </div>
        </aside>
        {open && <div className="fixed inset-0 z-40 bg-night-950/70 backdrop-blur-sm lg:hidden" onClick={() => setOpen(false)} />}
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-center gap-4 border-b border-line bg-night-900 px-4 py-3 lg:hidden">
            <button onClick={() => setOpen(true)} aria-label="Open menu" className="text-mist"><FiMenu className="text-xl" /></button>
            <Brand />
          </header>
          <main className="flex-1 overflow-auto p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </OrgContext.Provider>
  );
}
