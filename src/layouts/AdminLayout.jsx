import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import {
  FiHome, FiUsers, FiLayers, FiFlag, FiTrendingUp,
  FiShield, FiSettings, FiLogOut, FiMenu, FiX, FiGlobe, FiMail,
} from "react-icons/fi";
import FlarelyMark from "../components/FlarelyMark";

const NAV = [
  { label: "Dashboard", path: "/ops", icon: FiHome },
  { label: "Users", path: "/ops/users", icon: FiUsers },
  { label: "Communities", path: "/ops/communities", icon: FiLayers },
  { label: "Messages", path: "/ops/messages", icon: FiMail },
  { label: "Reports", path: "/ops/reports", icon: FiFlag },
  { label: "Analytics", path: "/ops/analytics", icon: FiTrendingUp },
  { label: "Safety", path: "/ops/safety", icon: FiShield },
  { label: "Website", path: "/ops/content", icon: FiGlobe },
  { label: "Settings", path: "/ops/settings", icon: FiSettings },
];

function Brand() {
  return (
    <div className="flex items-center gap-2.5">
      <FlarelyMark size={30} />
      <div className="leading-none">
        <span className="text-flare-gradient font-extrabold tracking-tight">Starstreak</span>
        <span className="mt-1 block text-[10px] font-bold tracking-[0.2em] text-dust">OPS</span>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate("/ops/login");
  }

  return (
    <div className="flex min-h-screen bg-night-950 text-star">
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 transform flex-col border-r border-line bg-night-900 transition-transform duration-200 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:sticky lg:top-0 lg:h-screen lg:translate-x-0`}
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <Brand />
          <button className="text-mist hover:text-star lg:hidden" aria-label="Close menu" onClick={() => setSidebarOpen(false)}>
            <FiX />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {NAV.map(({ label, path, icon: Icon }) => {
            const active = path === "/ops" ? location.pathname === "/ops" : location.pathname.startsWith(path);
            return (
              <Link
                key={path}
                to={path}
                onClick={() => setSidebarOpen(false)}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  active ? "bg-flare/15 text-flare" : "text-mist hover:bg-night-800 hover:text-star"
                }`}
              >
                <Icon className="text-base" />
                {label}
                {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-flare" />}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-line p-3">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-mist transition-colors hover:bg-night-800 hover:text-star"
          >
            <FiLogOut className="text-base" />
            Sign out
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-night-950/70 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-4 border-b border-line bg-night-900 px-4 py-3 lg:hidden">
          <button onClick={() => setSidebarOpen(true)} aria-label="Open menu" className="text-mist hover:text-star">
            <FiMenu className="text-xl" />
          </button>
          <Brand />
        </header>

        <main className="flex-1 overflow-auto bg-night-950 p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
