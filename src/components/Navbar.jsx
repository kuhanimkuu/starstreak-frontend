import { Link, NavLink, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { FiMenu, FiX, FiChevronDown } from "react-icons/fi";
import { supabase } from "../lib/supabase";
import FlarelyMark from "./FlarelyMark";
import { WEB_APP_URL } from "../lib/storeLinks";

const LINKS = [
  { to: "/features", label: "Features" },
  { to: "/safety", label: "Safety" },
  { to: "/blog", label: "Updates" },
  { to: "/about", label: "About" },
  { to: "/support", label: "Support" },
];

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const accountRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user || null));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_e, session) => setUser(session?.user || null));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menus on navigation; close the account menu on outside click.
  useEffect(() => {
    setMobileOpen(false);
    setAccountOpen(false);
  }, [location.pathname]);
  useEffect(() => {
    const onDown = (e) => {
      if (accountRef.current && !accountRef.current.contains(e.target)) setAccountOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const avatar = user?.user_metadata?.avatar_url;
  const initial = (user?.user_metadata?.full_name || user?.email || "?")[0]?.toUpperCase();

  return (
    <>
    <nav
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled || mobileOpen ? "border-b border-line bg-night-900/85 backdrop-blur-xl" : "border-b border-transparent"
      }`}
    >
      <div className="container-ss flex h-[72px] items-center justify-between">
        <Link to="/" className="flex items-center gap-2" aria-label="Starstreak home">
          <FlarelyMark size={40} />
          <span className="text-flare-gradient text-2xl font-extrabold tracking-tight">Starstreak</span>
        </Link>

        <div className="hidden items-center gap-1 lg:flex">
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `rounded-full px-4 py-2 text-[0.95rem] font-medium transition-colors ${
                  isActive ? "bg-night-700 text-star" : "text-mist hover:text-star"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {!user ? (
            <Link to="/login" className="hidden px-3 py-2 font-medium text-mist transition-colors hover:text-star md:inline">
              Log in
            </Link>
          ) : (
            <div className="relative hidden md:block" ref={accountRef}>
              <button
                onClick={() => setAccountOpen((v) => !v)}
                className="flex items-center gap-2 rounded-full border border-night-600 bg-night-800 py-1 pl-1 pr-3 text-sm text-star"
                aria-expanded={accountOpen}
              >
                {avatar ? (
                  <img src={avatar} alt="" className="h-8 w-8 rounded-full object-cover" />
                ) : (
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-flare-gradient font-bold text-night-950">
                    {initial}
                  </span>
                )}
                <FiChevronDown className={`transition-transform ${accountOpen ? "rotate-180" : ""}`} />
              </button>
              <div
                className={`absolute right-0 mt-3 w-56 origin-top-right rounded-2xl border border-line bg-night-800 p-2 shadow-night transition-all duration-200 ${
                  accountOpen ? "scale-100 opacity-100" : "pointer-events-none scale-95 opacity-0"
                }`}
              >
                <p className="truncate px-3 py-2 text-xs text-dust">{user.email}</p>
                {[
                  ["/dashboard", "Dashboard"],
                  ["/profile", "My profile"],
                  ["/settings", "Settings"],
                ].map(([to, label]) => (
                  <Link key={to} to={to} className="block rounded-xl px-3 py-2 text-sm text-mist hover:bg-night-700 hover:text-star">
                    {label}
                  </Link>
                ))}
                <button
                  onClick={() => supabase.auth.signOut()}
                  className="mt-1 w-full rounded-xl px-3 py-2 text-left text-sm text-red-400 hover:bg-red-500/10"
                >
                  Log out
                </button>
              </div>
            </div>
          )}
          <Link to="/download" className="btn-flare hidden !px-5 !py-2.5 text-sm md:inline-flex">
            Get the app
          </Link>
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="grid h-10 w-10 place-items-center rounded-full text-star lg:hidden"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>
        </div>
      </div>

    </nav>

    {/* Outside <nav>: its backdrop blur would otherwise trap this fixed panel
        inside the 72px bar (backdrop-filter creates a containing block). */}
      {mobileOpen && (
        <div className="fixed inset-x-0 bottom-0 top-[72px] z-40 overflow-y-auto overscroll-contain bg-night-900 lg:hidden"
             role="dialog" aria-modal aria-label="Menu">
          <div className="container-ss flex min-h-full flex-col gap-2 py-6">
            {[{ to: "/", label: "Home" }, ...LINKS, { to: "/download", label: "Download" }].map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === "/"}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `rounded-2xl px-4 py-4 text-2xl font-bold ${isActive ? "bg-night-800 text-flare" : "text-star"}`
                }
              >
                {l.label}
              </NavLink>
            ))}
            <div className="mt-auto space-y-3 pt-8">
              {user ? (
                <>
                  {WEB_APP_URL && (
                    <Link to={WEB_APP_URL} onClick={() => setMobileOpen(false)} className="btn-flare w-full">
                      Open Starstreak
                    </Link>
                  )}
                  <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="btn-ghost w-full">
                    Dashboard
                  </Link>
                  <button onClick={() => { setMobileOpen(false); supabase.auth.signOut(); }} className="w-full py-3 text-red-400">
                    Log out
                  </button>
                </>
              ) : (
                <Link to="/login" onClick={() => setMobileOpen(false)} className="btn-ghost w-full">
                  Log in
                </Link>
              )}
              <Link to="/download" onClick={() => setMobileOpen(false)} className="btn-flare w-full">
                Get the app
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
