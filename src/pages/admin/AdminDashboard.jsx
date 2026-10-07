import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import {
  FiUsers, FiFileText, FiLayers, FiFlag, FiZap,
  FiTrendingUp, FiAlertCircle, FiMail
} from "react-icons/fi";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentReports, setRecentReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadDashboard(); }, []);

  async function loadDashboard() {
    const [
      { count: totalUsers },
      { count: totalPosts },
      { count: totalCommunities },
      { count: totalFlash },
      { count: pendingReports },
      { count: suspendedUsers },
      { count: newMessages },
      { data: users },
      { data: reports },
    ] = await Promise.all([
      supabase.from("users_admin").select("*", { count: "exact", head: true }).neq("is_deleted", true),
      supabase.from("posts_public").select("*", { count: "exact", head: true }).neq("is_deleted", true),
      supabase.from("communities").select("*", { count: "exact", head: true }).neq("is_archived", true),
      supabase.from("flash_communities").select("*", { count: "exact", head: true }).neq("is_archived", true),
      supabase.from("content_reports").select("*", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("users_admin").select("*", { count: "exact", head: true }).eq("is_suspended", true).neq("is_deleted", true),
      supabase.from("support_messages").select("*", { count: "exact", head: true }).eq("status", "new"),
      supabase.from("users_admin").select("id, display_name, username, avatar_url, created_at").neq("is_deleted", true).order("created_at", { ascending: false }).limit(5),
      supabase.from("content_reports").select("id, content_type, reason, status, created_at").order("created_at", { ascending: false }).limit(5),
    ]);

    setStats({ totalUsers, totalPosts, totalCommunities, totalFlash, pendingReports, suspendedUsers, newMessages });
    setRecentUsers(users || []);
    setRecentReports(reports || []);
    setLoading(false);
  }

  if (loading) return <Spinner />;

  const statCards = [
    { label: "Total Users",       value: stats.totalUsers,       icon: FiUsers,       color: "text-flare-soft",   bg: "bg-flare/10" },
    { label: "Total Posts",       value: stats.totalPosts,       icon: FiFileText,    color: "text-green-400",  bg: "bg-green-500/10" },
    { label: "Communities",       value: stats.totalCommunities, icon: FiLayers,      color: "text-flare-soft", bg: "bg-flare/10" },
    { label: "Flashes", value: stats.totalFlash,       icon: FiZap,         color: "text-amber-400",  bg: "bg-amber-500/10" },
    { label: "Pending Reports",   value: stats.pendingReports,   icon: FiFlag,        color: "text-red-400",    bg: "bg-red-500/10",    link: "/ops/reports" },
    { label: "Suspended Users",   value: stats.suspendedUsers,   icon: FiAlertCircle, color: "text-flare-soft", bg: "bg-flare/10", link: "/ops/safety" },
    { label: "New Messages",      value: stats.newMessages,      icon: FiMail,        color: "text-flare-soft",   bg: "bg-flare/10",   link: "/ops/messages" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-star">Dashboard</h1>
        <p className="text-mist text-sm mt-1">Platform overview</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map(({ label, value, icon: Icon, color, bg, link }) => {
          const inner = (
            <div className={`bg-night-850 border border-line rounded-xl p-5 hover:border-night-600 transition-colors ${link ? "cursor-pointer" : ""}`}>
              <div className={`inline-flex p-2 rounded-lg ${bg} mb-3`}><Icon className={`text-lg ${color}`} /></div>
              <div className="text-2xl font-bold text-star">{(value ?? 0).toLocaleString()}</div>
              <div className="text-mist text-sm mt-0.5">{label}</div>
            </div>
          );
          return link ? <Link key={label} to={link}>{inner}</Link> : <div key={label}>{inner}</div>;
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-night-850 border border-line rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-star font-semibold text-sm">Recent Signups</h2>
            <Link to="/ops/users" className="text-flare-soft text-xs hover:underline">View all</Link>
          </div>
          <div className="space-y-3">
            {recentUsers.map(user => (
              <div key={user.id} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-night-700 flex items-center justify-center text-xs text-mist font-medium overflow-hidden flex-shrink-0">
                  {user.avatar_url ? <img src={user.avatar_url} alt="" className="w-full h-full object-cover" /> : (user.display_name?.[0] || "?").toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-star text-sm font-medium truncate">{user.display_name || "Unnamed"}</div>
                  <div className="text-dust text-xs">@{user.username || "—"}</div>
                </div>
                <div className="text-dust text-xs">{timeAgo(user.created_at)}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-night-850 border border-line rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-star font-semibold text-sm">Recent Reports</h2>
            <Link to="/ops/reports" className="text-flare-soft text-xs hover:underline">View all</Link>
          </div>
          <div className="space-y-3">
            {recentReports.length === 0
              ? <p className="text-dust text-sm">No reports.</p>
              : recentReports.map(r => (
                  <div key={r.id} className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${r.status === "pending" ? "bg-red-400" : "bg-green-400"}`} />
                    <div className="flex-1 min-w-0">
                      <div className="text-star text-sm truncate capitalize">{r.reason?.replace(/_/g, " ")}</div>
                      <div className="text-dust text-xs capitalize">{r.content_type}</div>
                    </div>
                    <div className="text-dust text-xs">{timeAgo(r.created_at)}</div>
                  </div>
                ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function timeAgo(ts) {
  if (!ts) return "—";
  const diff = Date.now() - new Date(ts).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function Spinner() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-flare border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
