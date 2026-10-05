import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import {
  FiFileText, FiUsers, FiZap, FiHeart, FiEye,
  FiTrendingUp, FiDownload, FiArrowRight, FiCheckCircle, FiCircle, FiUser,
} from "react-icons/fi";
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, Tooltip, Legend, ArcElement, Filler,
} from "chart.js";
import { Line, Doughnut } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, ArcElement, Filler);
// Night-sky chart text: "mist" on navy
ChartJS.defaults.color = "#AEB2D1";
ChartJS.defaults.font.family = "Outfit, system-ui, sans-serif";

export default function Dashboard() {
  const { user, profile } = useAuth();

  const [stats, setStats]           = useState(null);
  const [recentPosts, setRecentPosts] = useState([]);
  const [activity, setActivity]     = useState([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    if (!user) return;
    loadAll();
  }, [user]);

  async function loadAll() {
    setLoading(true);
    const [statsRes, postsRes, activityRes] = await Promise.all([
      supabase.rpc("get_website_stats",        { p_firebase_uid: user.id }),
      supabase.rpc("get_user_recent_posts",    { p_firebase_uid: user.id, p_limit: 5 }),
      supabase.rpc("get_website_post_activity",{ p_firebase_uid: user.id }),
    ]);
    setStats(statsRes.data || {});
    setRecentPosts(postsRes.data || []);
    setActivity(activityRes.data || []);
    setLoading(false);
  }

  const completion = profile ? (() => {
    let s = 0;
    if (profile.avatar_url) s += 25;
    if (profile.username)   s += 25;
    if (profile.bio?.trim().length >= 20) s += 25;
    if (user?.email_confirmed_at) s += 25;
    return s;
  })() : 0;

  // Build chart data: fill gaps in last 30 days
  const chartData = (() => {
    const days = 30;
    const labels = [];
    const counts = [];
    const map = {};
    activity.forEach(r => { map[r.post_date] = Number(r.post_count); });
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0];
      labels.push(d.toLocaleDateString("en", { month: "short", day: "numeric" }));
      counts.push(map[key] || 0);
    }
    return { labels, counts };
  })();

  const s = stats || {};

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="h-display text-3xl md:text-4xl text-star">
            Welcome back{profile?.display_name ? `, ${profile.display_name}` : ""}
          </h1>
          <p className="text-dust text-sm mt-1">Here's an overview of your Starstreak account.</p>
        </div>
        <Link to="/profile" className="flex items-center gap-2 px-4 py-2 bg-night-800 border border-line rounded-xl text-sm font-medium text-mist hover:border-flare/50 hover:text-star transition-colors">
          <FiUser className="text-base" /> Edit Profile
        </Link>
      </div>

      {/* Stats row */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-night-800 rounded-2xl p-5 border border-line animate-pulse">
              <div className="h-8 bg-night-600 rounded w-1/2 mb-2" />
              <div className="h-4 bg-night-700 rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: "Posts",        value: s.posts       ?? 0, icon: FiFileText, color: "text-flare",   bg: "bg-flare/10" },
            { label: "Communities",  value: s.communities ?? 0, icon: FiUsers,    color: "text-accent", bg: "bg-amber/10" },
            { label: "Flashes", value: s.flash       ?? 0, icon: FiZap,      color: "text-gold",  bg: "bg-gold/10" },
            { label: "Likes",        value: s.likes       ?? 0, icon: FiHeart,    color: "text-red-400",    bg: "bg-red-500/10" },
            { label: "Post Views",   value: s.views       ?? 0, icon: FiEye,      color: "text-green-400",  bg: "bg-green-500/10" },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="bg-night-800 rounded-2xl p-5 border border-line hover:border-night-500 transition-colors">
              <div className={`inline-flex p-2 rounded-xl ${bg} mb-3`}>
                <Icon className={`text-lg ${color}`} />
              </div>
              <div className="text-2xl font-extrabold text-star">{value.toLocaleString()}</div>
              <div className="text-sm text-dust mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Charts row */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* Activity line chart */}
        <div className="lg:col-span-2 bg-night-800 rounded-2xl p-6 border border-line">
          <div className="flex items-center gap-2 mb-6">
            <FiTrendingUp className="text-brand" />
            <h2 className="font-bold text-star">Post Activity</h2>
            <span className="ml-auto text-xs text-dust">Last 30 days</span>
          </div>
          <Line
            data={{
              labels: chartData.labels,
              datasets: [{
                label: "Posts",
                data: chartData.counts,
                borderColor: "#FF6D1F",
                backgroundColor: "rgba(255,109,31,0.12)",
                borderWidth: 2,
                pointRadius: 3,
                pointBackgroundColor: "#FF6D1F",
                tension: 0.4,
                fill: true,
              }],
            }}
            options={{
              responsive: true,
              plugins: { legend: { display: false } },
              scales: {
                y: { beginAtZero: true, ticks: { stepSize: 1, precision: 0 }, grid: { color: "#22254A" } },
                x: { grid: { display: false }, ticks: { maxTicksLimit: 8, font: { size: 11 } } },
              },
            }}
          />
        </div>

        {/* Engagement doughnut */}
        <div className="bg-night-800 rounded-2xl p-6 border border-line">
          <div className="flex items-center gap-2 mb-6">
            <FiHeart className="text-flare" />
            <h2 className="font-bold text-star">Engagement</h2>
          </div>
          {(s.likes || s.views) ? (
            <>
              <Doughnut
                data={{
                  labels: ["Likes", "Views"],
                  datasets: [{
                    data: [s.likes ?? 0, s.views ?? 0],
                    backgroundColor: ["#FF6D1F", "#FFD166"],
                    borderWidth: 0,
                    hoverOffset: 6,
                  }],
                }}
                options={{
                  responsive: true,
                  cutout: "65%",
                  plugins: { legend: { position: "bottom", labels: { font: { size: 12 }, padding: 16 } } },
                }}
              />
              <div className="mt-4 grid grid-cols-2 gap-3 text-center">
                <div className="bg-flare/10 rounded-xl p-3">
                  <div className="text-xl font-bold text-flare">{(s.likes ?? 0).toLocaleString()}</div>
                  <div className="text-xs text-dust mt-0.5">Likes</div>
                </div>
                <div className="bg-gold/10 rounded-xl p-3">
                  <div className="text-xl font-bold text-gold">{(s.views ?? 0).toLocaleString()}</div>
                  <div className="text-xs text-dust mt-0.5">Views</div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-dust text-sm">
              <FiTrendingUp className="text-3xl mb-2 opacity-30" />
              No engagement data yet
            </div>
          )}
        </div>
      </div>

      {/* Bottom row: recent posts + account completion */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* Recent posts */}
        <div className="lg:col-span-2 bg-night-800 rounded-2xl p-6 border border-line">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-star">Recent Posts</h2>
            <Link to="/my-posts" className="text-xs text-accent hover:text-gold flex items-center gap-1">
              View all <FiArrowRight />
            </Link>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-night-700 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : recentPosts.length === 0 ? (
            <div className="text-center py-10 text-dust text-sm">
              <FiFileText className="text-3xl mx-auto mb-2 opacity-30" />
              No posts yet. Head to the app to start sharing!
            </div>
          ) : (
            <div className="space-y-3">
              {recentPosts.map(post => (
                <div key={post.id} className="flex items-start gap-4 p-3 rounded-xl hover:bg-night-850 transition-colors border border-transparent hover:border-line">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-star line-clamp-2">{post.content || "(media post)"}</p>
                    <div className="flex items-center gap-4 mt-1.5 text-xs text-dust">
                      <span>❤️ {(post.likes?.length ?? 0).toLocaleString()}</span>
                      <span>👁 {(post.view_count ?? 0).toLocaleString()}</span>
                      <span>{new Date(post.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Account completion + download CTA */}
        <div className="space-y-4">
          <div className="bg-night-800 rounded-2xl p-6 border border-line">
            <h2 className="font-bold text-star mb-1">Account completion</h2>
            <p className="text-xs text-dust mb-4">{completion}% complete</p>
            <div className="w-full bg-night-700 rounded-full h-2 mb-4 overflow-hidden">
              <div
                className="h-2 rounded-full bg-flare-gradient transition-all duration-700"
                style={{ width: `${completion}%` }}
              />
            </div>
            <div className="space-y-2">
              {[
                { label: "Profile photo",   done: !!profile?.avatar_url,           link: "/profile" },
                { label: "Username",        done: !!profile?.username,             link: "/profile" },
                { label: "Bio (20+ chars)", done: (profile?.bio?.trim().length ?? 0) >= 20, link: "/profile" },
                { label: "Email verified",  done: !!user?.email_confirmed_at,       link: null },
              ].map(({ label, done, link }) => (
                <div key={label} className="flex items-center gap-2 text-sm">
                  {done
                    ? <FiCheckCircle className="text-green-400 flex-shrink-0" />
                    : <FiCircle className="text-night-500 flex-shrink-0" />
                  }
                  {link && !done
                    ? <Link to={link} className="text-accent hover:text-gold">{label}</Link>
                    : <span className={done ? "text-dust line-through" : "text-mist"}>{label}</span>
                  }
                </div>
              ))}
            </div>
          </div>

          {/* Download CTA */}
          <div className="relative overflow-hidden rounded-2xl border border-flare/30 bg-night-850 p-5 text-star">
            <div className="glow-flare absolute -right-10 -top-10 h-40 w-40" />
            <FiDownload className="relative text-2xl mb-2 text-flare" />
            <h3 className="relative font-bold mb-1">Get the full experience</h3>
            <p className="relative text-xs text-mist mb-4">Post, chat, join communities and more in the Starstreak app.</p>
            <Link to="/download" className="btn-flare relative w-full !py-2 text-sm">
              Download App
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
