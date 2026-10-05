import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { FiTrendingUp, FiUsers, FiFileText, FiLayers } from "react-icons/fi";

export default function AdminAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadAnalytics(); }, []);

  async function loadAnalytics() {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const [
      { count: totalUsers }, { count: newUsersThisWeek },
      { count: totalPosts }, { count: newPostsThisWeek },
      { count: totalCommunities }, { count: activeLast30Days },
      { data: topCommunities }, { data: topPosts },
    ] = await Promise.all([
      supabase.from("users").select("*", { count: "exact", head: true }).neq("is_deleted", true),
      supabase.from("users").select("*", { count: "exact", head: true }).neq("is_deleted", true).gte("created_at", sevenDaysAgo),
      supabase.from("posts").select("*", { count: "exact", head: true }).neq("is_deleted", true),
      supabase.from("posts").select("*", { count: "exact", head: true }).neq("is_deleted", true).gte("created_at", sevenDaysAgo),
      supabase.from("communities").select("*", { count: "exact", head: true }).neq("is_archived", true),
      supabase.from("users").select("*", { count: "exact", head: true }).neq("is_deleted", true).gte("last_active", thirtyDaysAgo),
      supabase.from("communities").select("id, name, member_count, type").order("member_count", { ascending: false }).limit(10),
      supabase.from("posts").select("id, content, view_count, created_at").order("view_count", { ascending: false }).limit(10),
    ]);
    setData({ totalUsers, newUsersThisWeek, totalPosts, newPostsThisWeek, totalCommunities, activeLast30Days, topCommunities: topCommunities || [], topPosts: topPosts || [] });
    setLoading(false);
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-flare border-t-transparent rounded-full animate-spin" /></div>;

  const metrics = [
    { label: "Total Users",       value: data.totalUsers,        sub: `+${data.newUsersThisWeek} this week`,  icon: FiUsers,      color: "text-flare-soft" },
    { label: "Total Posts",       value: data.totalPosts,        sub: `+${data.newPostsThisWeek} this week`,  icon: FiFileText,   color: "text-green-400" },
    { label: "Total Communities", value: data.totalCommunities,  sub: "all time",                              icon: FiLayers,     color: "text-flare-soft" },
    { label: "Active (30 days)",  value: data.activeLast30Days,  sub: "unique active users",                   icon: FiTrendingUp, color: "text-amber-400" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-star">Analytics</h1>
        <p className="text-mist text-sm mt-1">Platform-wide metrics</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map(({ label, value, sub, icon: Icon, color }) => (
          <div key={label} className="bg-night-850 border border-line rounded-xl p-5">
            <Icon className={`text-xl ${color} mb-3`} />
            <div className="text-2xl font-bold text-star">{(value ?? 0).toLocaleString()}</div>
            <div className="text-mist text-xs mt-0.5">{label}</div>
            <div className="text-dust text-xs mt-1">{sub}</div>
          </div>
        ))}
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-night-850 border border-line rounded-xl p-5">
          <h2 className="text-star font-semibold text-sm mb-4">Top Communities by Members</h2>
          <div className="space-y-3">
            {data.topCommunities.length === 0
              ? <p className="text-dust text-sm">No communities yet.</p>
              : data.topCommunities.map((c, i) => (
                  <div key={c.id} className="flex items-center gap-3">
                    <span className="text-dust text-xs w-5 text-right">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-star text-sm truncate">{c.name}</span>
                        {c.type === "nexoraOfficial" && <span className="px-1.5 py-0.5 rounded text-xs bg-flare/20 text-flare-soft">Official</span>}
                      </div>
                      <div className="mt-1 h-1 bg-night-800 rounded-full overflow-hidden">
                        <div className="h-full bg-flare rounded-full" style={{ width: `${Math.min(100, ((c.member_count || 0) / (data.topCommunities[0]?.member_count || 1)) * 100)}%` }} />
                      </div>
                    </div>
                    <span className="text-mist text-xs w-12 text-right">{(c.member_count || 0).toLocaleString()}</span>
                  </div>
                ))}
          </div>
        </div>
        <div className="bg-night-850 border border-line rounded-xl p-5">
          <h2 className="text-star font-semibold text-sm mb-4">Top Posts by Views</h2>
          <div className="space-y-3">
            {data.topPosts.length === 0
              ? <p className="text-dust text-sm">No posts yet.</p>
              : data.topPosts.map((p, i) => (
                  <div key={p.id} className="flex items-center gap-3">
                    <span className="text-dust text-xs w-5 text-right">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-star text-xs truncate">{p.content?.substring(0, 60) || "[media post]"}</p>
                      <div className="mt-1 h-1 bg-night-800 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 rounded-full" style={{ width: `${Math.min(100, ((p.view_count || 0) / (data.topPosts[0]?.view_count || 1)) * 100)}%` }} />
                      </div>
                    </div>
                    <span className="text-mist text-xs w-16 text-right">{(p.view_count || 0).toLocaleString()} views</span>
                  </div>
                ))}
          </div>
        </div>
      </div>
    </div>
  );
}
