import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  FiHome, FiSearch, FiBell, FiMail, FiUsers, FiZap, FiUser, FiFeather, FiLogOut, FiX, FiGrid, FiCheckCircle, FiAlertCircle, FiBookmark,
} from "react-icons/fi";
import FlarelyMark from "../components/FlarelyMark";
import Avatar from "./components/Avatar";
import Composer from "./components/Composer";
import FollowButton from "./components/FollowButton";
import { GetAppNudge } from "./components/GetTheApp";
import { supabase } from "../lib/supabase";
import { fetchSuggestions } from "./lib/api";
import { useAppSession } from "./AppSession";

const NAV = [
  { to: "/home", label: "Home", icon: FiHome },
  { to: "/explore", label: "Explore", icon: FiSearch },
  { to: "/notifications", label: "Notifications", icon: FiBell },
  { to: "/messages", label: "Messages", icon: FiMail },
  { to: "/communities", label: "Communities", icon: FiUsers },
  { to: "/flashes", label: "Flashes", icon: FiZap },
  { to: "/saved", label: "Saved", icon: FiBookmark },
];

function ComposeModal({ onClose, onPosted }) {
  useEffect(() => {
    const esc = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", esc);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", esc);
      document.body.style.overflow = "";
    };
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center bg-black/60 sm:pt-16" onMouseDown={onClose} role="dialog" aria-modal aria-label="New post">
      <div className="h-full w-full overflow-y-auto bg-night-900 p-4 sm:h-auto sm:max-h-[85vh] sm:max-w-xl sm:rounded-3xl sm:border sm:border-line"
           onMouseDown={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="mb-2 grid h-9 w-9 place-items-center rounded-full text-star hover:bg-night-700" aria-label="Close">
          <FiX size={20} />
        </button>
        <Composer compact autoFocus onPosted={(p) => { onPosted?.(p); onClose(); }} />
      </div>
    </div>
  );
}

function Toast() {
  const { toast } = useAppSession();
  if (!toast) return null;
  const err = toast.tone === "error";
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-20 z-[90] flex justify-center px-4 lg:bottom-8" role="status" aria-live="polite">
      <div key={toast.id} className={`flex animate-fade-up items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold shadow-night ${err ? "bg-red-500 text-white" : "bg-star text-night-950"}`}>
        {err ? <FiAlertCircle /> : <FiCheckCircle />} {toast.message}
      </div>
    </div>
  );
}

function WhoToFollow() {
  const { myId, following, ready } = useAppSession();
  const [people, setPeople] = useState(null);
  useEffect(() => {
    if (!ready || !myId) return;
    fetchSuggestions(myId, following).then(setPeople).catch(() => setPeople([]));
    // Only on load — not every time you follow someone.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, myId]);
  if (!people?.length) return null;
  return (
    <section className="rounded-2xl border border-line bg-night-850">
      <h2 className="px-4 pt-3 text-xl font-extrabold text-star">Who to follow</h2>
      {people.map((u) => (
        <Link key={u.firebase_uid} to={`/profile/${u.username}`} className="flex items-center gap-3 px-4 py-3 hover:bg-night-800">
          <Avatar size="sm" src={u.avatar_url} name={u.display_name} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-star">{u.display_name || u.username}</p>
            <p className="truncate text-sm text-dust">@{u.username}</p>
          </div>
          <FollowButton userId={u.firebase_uid} size="sm" />
        </Link>
      ))}
    </section>
  );
}

/**
 * Logged-in Starstreak on the web. Desktop: nav rail | content | sidebar.
 * Mobile: top bar, bottom tab bar and a floating compose button.
 */
function Badge({ count }) {
  if (!count) return null;
  return (
    <span className="absolute -right-1.5 -top-1.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-flare px-1 text-[10px] font-bold text-night-950">
      {count > 99 ? "99+" : count}
    </span>
  );
}

export default function AppShell({ children, title, wide = false }) {
  const { me, myId, unread } = useAppSession();
  const navigate = useNavigate();
  const location = useLocation();
  const [composing, setComposing] = useState(false);
  const [drawer, setDrawer] = useState(false);

  // Close the mobile menu whenever the page changes.
  useEffect(() => setDrawer(false), [location.pathname]);
  const [q, setQ] = useState("");
  const profilePath = me?.username ? `/profile/${me.username}` : "/profile";

  useEffect(() => {
    const prefix = unread ? `(${unread > 99 ? "99+" : unread}) ` : "";
    document.title = `${prefix}${title ? `${title} · Starstreak` : "Starstreak"}`;
  }, [title, unread]);

  async function logout() {
    await supabase.auth.signOut();
    navigate("/login");
  }

  function search(e) {
    e.preventDefault();
    if (q.trim()) navigate(`/explore?q=${encodeURIComponent(q.trim())}`);
  }

  const navItems = [...NAV, { to: profilePath, label: "Profile", icon: FiUser }];

  return (
    <div className="min-h-screen bg-night-900 text-star">
      <div className="mx-auto flex max-w-[1280px] justify-center">
        {/* Left rail */}
        <header className="sticky top-0 hidden h-screen shrink-0 flex-col justify-between px-2 py-3 sm:flex sm:w-[72px] xl:w-[260px] xl:px-4">
          <div className="flex flex-col items-center gap-1 xl:items-stretch">
            <Link to="/home" className="mb-2 grid h-12 w-12 place-items-center rounded-full hover:bg-night-800 xl:ml-1" aria-label="Starstreak home">
              <FlarelyMark size={34} />
            </Link>
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink key={label} to={to} title={label}
                       className={({ isActive }) =>
                         `flex items-center gap-4 rounded-full p-3 text-xl transition-colors hover:bg-night-800 xl:px-4 ${isActive ? "font-bold text-star" : "text-mist"}`}>
                {({ isActive }) => (
                  <>
                    <span className="relative">
                      <Icon className={isActive ? "text-flare" : ""} />
                      {to === "/notifications" && <Badge count={unread} />}
                    </span>
                    <span className="hidden text-[19px] xl:inline">{label}</span>
                  </>
                )}
              </NavLink>
            ))}
            <Link to="/dashboard" title="Account dashboard" className="flex items-center gap-4 rounded-full p-3 text-xl text-mist hover:bg-night-800 xl:px-4">
              <FiGrid /> <span className="hidden text-[19px] xl:inline">Dashboard</span>
            </Link>
            <button onClick={() => setComposing(true)}
                    className="btn-flare mt-3 !h-12 !w-12 !p-0 xl:!h-auto xl:!w-full xl:!py-3.5 text-lg" aria-label="Post">
              <FiFeather className="xl:hidden" /> <span className="hidden xl:inline">Post</span>
            </button>
          </div>
          <div className="group relative">
            <div className="flex items-center gap-3 rounded-full p-2 hover:bg-night-800">
              <Avatar size="sm" src={me?.avatar_url} name={me?.display_name} />
              <div className="hidden min-w-0 flex-1 xl:block">
                <p className="truncate text-sm font-bold">{me?.display_name || "You"}</p>
                {me?.username && <p className="truncate text-sm text-dust">@{me.username}</p>}
              </div>
              <button onClick={logout} title="Log out" className="hidden h-9 w-9 place-items-center rounded-full text-dust hover:bg-red-500/10 hover:text-red-400 xl:grid" aria-label="Log out">
                <FiLogOut />
              </button>
            </div>
          </div>
        </header>

        {/* Main column */}
        <main className={`min-h-screen w-full min-w-0 border-line pb-20 sm:border-x sm:pb-0 ${wide ? "max-w-[920px]" : "max-w-[600px]"}`}>
          {/* Mobile top bar */}
          <div className="sticky top-0 z-40 flex items-center justify-between border-b border-line bg-night-900/85 px-4 py-2 backdrop-blur sm:hidden">
            <button onClick={() => setDrawer(true)} aria-label="Open menu" aria-expanded={drawer}>
              <Avatar size="sm" src={me?.avatar_url} name={me?.display_name} />
            </button>
            <Link to="/home" aria-label="Starstreak home"><FlarelyMark size={30} /></Link>
            <span className="w-9" aria-hidden />
          </div>
          <GetAppNudge variant="banner" />
          {children}
        </main>

        {/* Right sidebar */}
        {!wide && (
          <aside className="sticky top-0 hidden h-screen w-[350px] shrink-0 space-y-4 overflow-y-auto py-3 pl-6 pr-2 lg:block">
            {location.pathname !== "/explore" && (
              <form onSubmit={search}>
                <label className="flex items-center gap-3 rounded-full border border-line bg-night-850 px-4 py-2.5 focus-within:border-flare">
                  <FiSearch className="text-dust" />
                  <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search Starstreak"
                         className="w-full bg-transparent text-sm text-star placeholder-dust focus:outline-none" />
                </label>
              </form>
            )}
            <GetAppNudge />
            {myId && <WhoToFollow />}
            <nav className="flex flex-wrap gap-x-3 gap-y-1 px-4 text-xs text-dust">
              {[["/terms", "Terms"], ["/privacy", "Privacy"], ["/guidelines", "Guidelines"], ["/safety", "Safety"], ["/download", "Get the app"], ["/", "About"]].map(([to, l]) => (
                <Link key={to} to={to} className="hover:underline">{l}</Link>
              ))}
              <span>© {new Date().getFullYear()} Hephix</span>
            </nav>
          </aside>
        )}
      </div>

      {/* Mobile bottom bar + compose */}
      <button onClick={() => setComposing(true)} aria-label="New post"
              className="fixed bottom-20 right-4 z-40 grid h-14 w-14 place-items-center rounded-full bg-flare-gradient text-night-950 shadow-flare sm:hidden">
        <FiFeather size={22} />
      </button>
      <nav className="fixed inset-x-0 bottom-0 z-40 flex justify-around border-t border-line bg-night-900/95 pb-[env(safe-area-inset-bottom)] backdrop-blur sm:hidden">
        {NAV.slice(0, 5).map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} aria-label={label}
                   className={({ isActive }) => `grid h-14 flex-1 place-items-center text-[22px] ${isActive ? "text-flare" : "text-mist"}`}>
            <span className="relative">
              <Icon />
              {to === "/notifications" && <Badge count={unread} />}
            </span>
          </NavLink>
        ))}
      </nav>

      {/* Mobile menu */}
      {drawer && (
        <div className="fixed inset-0 z-[75] sm:hidden" role="dialog" aria-modal aria-label="Menu">
          <div className="absolute inset-0 bg-black/60" onClick={() => setDrawer(false)} />
          <nav className="absolute inset-y-0 left-0 flex w-[80%] max-w-xs flex-col overflow-y-auto bg-night-900 p-4 shadow-night">
            <div className="flex items-center gap-3 pb-4">
              <Avatar src={me?.avatar_url} name={me?.display_name} />
              <div className="min-w-0">
                <p className="truncate font-bold">{me?.display_name || "You"}</p>
                {me?.username && <p className="truncate text-sm text-dust">@{me.username}</p>}
              </div>
            </div>
            {[...navItems, { to: "/dashboard", label: "Dashboard", icon: FiGrid }].map(({ to, label, icon: Icon }) => (
              <NavLink key={label} to={to}
                       className={({ isActive }) => `flex items-center gap-4 rounded-xl px-3 py-3 text-lg ${isActive ? "bg-night-800 font-bold text-flare" : "text-star"}`}>
                <Icon /> {label}
              </NavLink>
            ))}
            <button onClick={logout} className="mt-auto flex items-center gap-4 rounded-xl px-3 py-3 text-lg text-red-400">
              <FiLogOut /> Log out
            </button>
          </nav>
        </div>
      )}

      {composing && <ComposeModal onClose={() => setComposing(false)} onPosted={(p) => window.dispatchEvent(new CustomEvent("ss:posted", { detail: p }))} />}
      <Toast />
    </div>
  );
}
