import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { FiShield, FiUser, FiSearch } from "react-icons/fi";

export default function AdminSafety() {
  const [tab, setTab] = useState("suspended");
  const [users, setUsers] = useState([]);
  const [bannedMembers, setBannedMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (tab === "suspended") loadSuspendedUsers();
    else loadBannedMembers();
  }, [tab]);

  async function loadSuspendedUsers() {
    setLoading(true);
    const { data } = await supabase.from("users")
      .select("id, firebase_uid, display_name, username, avatar_url, suspended_at, suspension_reason")
      .eq("is_suspended", true).order("suspended_at", { ascending: false });
    setUsers(data || []);
    setLoading(false);
  }

  async function loadBannedMembers() {
    setLoading(true);
    const { data } = await supabase.from("community_members")
      .select("id, user_id, community_id, banned_at, ban_reason, communities(name)")
      .eq("is_banned", true).order("banned_at", { ascending: false }).limit(100);
    setBannedMembers(data || []);
    setLoading(false);
  }

  async function unsuspendUser(uid) {
    await supabase.from("users").update({ is_suspended: false, suspension_reason: null, suspended_at: null }).eq("firebase_uid", uid);
    setUsers(prev => prev.filter(u => u.firebase_uid !== uid));
  }

  async function unbanMember(id) {
    await supabase.from("community_members").update({ is_banned: false, ban_reason: null }).eq("id", id);
    setBannedMembers(prev => prev.filter(m => m.id !== id));
  }

  const filteredUsers = search
    ? users.filter(u => (u.username || "").toLowerCase().includes(search.toLowerCase()) || (u.display_name || "").toLowerCase().includes(search.toLowerCase()))
    : users;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-star">Safety</h1>
        <p className="text-mist text-sm mt-1">Suspended accounts and community bans</p>
      </div>
      <div className="flex gap-2">
        {[{ key: "suspended", label: `Suspended (${users.length})` }, { key: "banned", label: `Community Bans (${bannedMembers.length})` }].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t.key ? "bg-flare-deep text-star" : "bg-night-800 text-mist hover:text-star"}`}>
            {t.label}
          </button>
        ))}
      </div>
      {tab === "suspended" && (
        <>
          <div className="relative max-w-xs">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-dust text-sm" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search suspended users…"
              className="w-full bg-night-800 border border-night-600 text-star text-sm rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:border-flare" />
          </div>
          <div className="bg-night-850 border border-line rounded-xl overflow-hidden">
            {loading
              ? <div className="p-8 flex justify-center"><div className="w-6 h-6 border-2 border-flare border-t-transparent rounded-full animate-spin" /></div>
              : filteredUsers.length === 0
                ? <div className="p-8 text-center text-dust text-sm">No suspended accounts.</div>
                : <table className="w-full text-sm">
                    <thead><tr className="border-b border-line text-mist text-xs">
                      <th className="text-left px-4 py-3 font-medium">User</th>
                      <th className="text-left px-4 py-3 font-medium">Reason</th>
                      <th className="text-left px-4 py-3 font-medium">Date</th>
                      <th className="px-4 py-3" />
                    </tr></thead>
                    <tbody>
                      {filteredUsers.map(u => (
                        <tr key={u.id} className="border-b border-line/50 hover:bg-night-800/40 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-night-700 flex-shrink-0 flex items-center justify-center text-xs overflow-hidden">
                                {u.avatar_url ? <img src={u.avatar_url} alt="" className="w-full h-full object-cover" /> : <FiUser />}
                              </div>
                              <div>
                                <div className="text-star text-sm">{u.display_name || "—"}</div>
                                <div className="text-dust text-xs">@{u.username || "—"}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-mist text-xs">{u.suspension_reason || "—"}</td>
                          <td className="px-4 py-3 text-dust text-xs">{formatDate(u.suspended_at)}</td>
                          <td className="px-4 py-3">
                            <button onClick={() => unsuspendUser(u.firebase_uid)}
                              className="px-3 py-1 text-xs bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors">Unsuspend</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>}
          </div>
        </>
      )}
      {tab === "banned" && (
        <div className="bg-night-850 border border-line rounded-xl overflow-hidden">
          {loading
            ? <div className="p-8 flex justify-center"><div className="w-6 h-6 border-2 border-flare border-t-transparent rounded-full animate-spin" /></div>
            : bannedMembers.length === 0
              ? <div className="p-8 text-center text-dust text-sm">No community bans.</div>
              : <table className="w-full text-sm">
                  <thead><tr className="border-b border-line text-mist text-xs">
                    <th className="text-left px-4 py-3 font-medium">User ID</th>
                    <th className="text-left px-4 py-3 font-medium">Community</th>
                    <th className="text-left px-4 py-3 font-medium">Reason</th>
                    <th className="text-left px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3" />
                  </tr></thead>
                  <tbody>
                    {bannedMembers.map(m => (
                      <tr key={m.id} className="border-b border-line/50 hover:bg-night-800/40 transition-colors">
                        <td className="px-4 py-3 text-mist text-xs font-mono">{m.user_id?.slice(0, 12)}…</td>
                        <td className="px-4 py-3 text-star text-sm">{m.communities?.name || m.community_id?.slice(0, 8)}</td>
                        <td className="px-4 py-3 text-mist text-xs">{m.ban_reason || "—"}</td>
                        <td className="px-4 py-3 text-dust text-xs">{formatDate(m.banned_at)}</td>
                        <td className="px-4 py-3">
                          <button onClick={() => unbanMember(m.id)}
                            className="px-3 py-1 text-xs bg-flare/20 text-flare-soft rounded-lg hover:bg-flare/30 transition-colors flex items-center gap-1">
                            <FiShield className="text-xs" /> Unban
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>}
        </div>
      )}
    </div>
  );
}

function formatDate(ts) {
  if (!ts) return "—";
  return new Date(ts).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" });
}
