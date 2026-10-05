import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { FiGrid, FiFileText, FiUsers, FiUser, FiSettings, FiLogOut, FiMenu, FiX, FiDownload, FiExternalLink } from "react-icons/fi";
import { WEB_APP_URL } from "../lib/storeLinks";
import { openWebApp } from "../lib/webApp";
import FlarelyMark from "../components/FlarelyMark";
import Mascot from "../components/ui/Mascot";

const NAV = [
  { label: "Dashboard", path: "/dashboard", icon: FiGrid },
  { label: "My posts", path: "/my-posts", icon: FiFileText },
  { label: "My communities", path: "/my-communities", icon: FiUsers },
  { label: "Profile", path: "/profile", icon: FiUser },
  { label: "Settings", path: "/settings", icon: FiSettings },
];

function Brand({ onClick }) {
  return (
    <Link to="/" onClick={onClick} className="flex items-center gap-2">
      <FlarelyMark size={32} />
      <span className="text-flare-gradient text-lg font-extrabold tracking-tight">Starstreak</span>
    </Link>
  );
}

function Avatar({ src, name, className = "" }) {
  return (
    <div className={`grid shrink-0 place-items-center overflow-hidden rounded-full bg-flare-gradient ${className}`}>
      {src ? (
        <img src={src} alt="" className="h-full w-full object-cover" />
      ) : (
        <span className="font-bold text-night-950">{name[0]?.toUpperCase()}</span>
      )}
    </div>
  );
}

export default function UserLayout({ children }) {
  const { user, profile, authLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate("/login");
  }

  const avatarSrc = profile?.avatar_url || user?.photoURL || null;
  const displayName = profile?.display_name || user?.displayName || "User";
  const username = profile?.username ? `@${profile.username}` : user?.email || "";
  const close = () => setMobileOpen(false);

  const sidebar = (
    <>
      <div className="mx-3 mb-4 flex items-center gap-3 rounded-2xl border border-line bg-night-800 p-3">
        <Avatar src={avatarSrc} name={displayName} className="h-11 w-11 ring-2 ring-flare/40" />
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-star">{displayName}</div>
          <div className="truncate text-xs text-dust">{username}</div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {NAV.map(({ label, path, icon: Icon }) => {
          const active = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              onClick={close}
              aria-current={active ? "page" : undefined}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                active ? "bg-flare/15 text-flare" : "text-mist hover:bg-night-800 hover:text-star"
              }`}
            >
              <Icon className="shrink-0 text-base" />
              {label}
              {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-flare" />}
            </Link>
          );
        })}
      </nav>

      <div className="mt-4 space-y-1 border-t border-line px-3 pt-4">
        {WEB_APP_URL && (
          <button
            onClick={openWebApp}
            className="flex w-full items-center gap-3 rounded-xl bg-flare/10 px-3 py-2.5 text-sm font-semibold text-flare transition-colors hover:bg-flare/20"
          >
            <FiExternalLink className="text-base" /> Open the web app
          </button>
        )}
        <Link
          to="/download"
          onClick={close}
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-mist transition-colors hover:bg-night-800 hover:text-star"
        >
          <FiDownload className="text-base" /> Get the app
        </Link>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/10"
        >
          <FiLogOut className="text-base" /> Log out
        </button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-night-900">
      {/* Sidebar — desktop */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-line bg-night-950 lg:flex">
        <div className="border-b border-line p-5">
          <Brand />
        </div>
        <div className="flex flex-1 flex-col overflow-y-auto py-4">{sidebar}</div>
      </aside>

      {/* Top bar — mobile */}
      <div className="fixed inset-x-0 top-0 z-40 flex items-center justify-between border-b border-line bg-night-950/90 px-4 py-3 backdrop-blur lg:hidden">
        <Brand />
        <div className="flex items-center gap-3">
          <Avatar src={avatarSrc} name={displayName} className="h-8 w-8 text-xs" />
          <button onClick={() => setMobileOpen(true)} aria-label="Open menu" className="rounded-lg p-2 text-mist hover:bg-night-800">
            <FiMenu className="text-xl" />
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="absolute inset-0 bg-night-950/70 backdrop-blur-sm" onClick={close} />
          <div className="relative flex h-full w-72 flex-col border-r border-line bg-night-950 shadow-night">
            <div className="flex items-center justify-between border-b border-line p-4">
              <Brand onClick={close} />
              <button onClick={close} aria-label="Close menu" className="rounded-lg p-1.5 text-mist hover:bg-night-800">
                <FiX className="text-xl" />
              </button>
            </div>
            <div className="flex flex-1 flex-col overflow-y-auto py-4">{sidebar}</div>
          </div>
        </div>
      )}

      <main className="min-h-screen min-w-0 flex-1 pt-16 lg:ml-64 lg:pt-0">
        <div className="mx-auto max-w-5xl p-5 lg:p-10">
          {authLoading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-night-600 border-t-flare" />
            </div>
          ) : !user ? (
            <div className="flex flex-col items-center py-20 text-center">
              <Mascot pose="wave" className="w-32" />
              <p className="mt-6 text-mist">Please log in to access your account.</p>
              <Link to="/login" className="btn-flare mt-6">
                Log in
              </Link>
            </div>
          ) : (
            children
          )}
        </div>
      </main>
    </div>
  );
}
