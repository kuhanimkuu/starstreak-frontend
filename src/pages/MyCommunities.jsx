import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { FiUsers, FiLogOut, FiAlertTriangle, FiShield, FiStar } from "react-icons/fi";

const TYPE_LABELS = {
  public:         { label: "Public",        color: "bg-flare/10 text-flare" },
  private:        { label: "Private",       color: "bg-night-700 text-mist" },
  local:          { label: "Local",         color: "bg-green-500/10 text-green-400" },
  regional:       { label: "Regional",      color: "bg-teal-50 text-teal-600" },
  nexoraOfficial: { label: "Official",      color: "bg-flare/10 text-flare" },
};

const ROLE_ICONS = {
  admin:     { icon: FiShield, color: "text-gold",  label: "Admin" },
  moderator: { icon: FiStar,   color: "text-flare",   label: "Mod" },
  member:    { icon: FiUsers,  color: "text-dust",   label: "Member" },
};

export default function MyCommunities() {
  const { user } = useAuth();

  const [communities, setCommunities] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [confirm, setConfirm]         = useState(null);
  const [leaving, setLeaving]         = useState(null);
  const [search, setSearch]           = useState("");

  useEffect(() => {
    if (!user) return;
    loadCommunities();
  }, [user]);

  async function loadCommunities() {
    setLoading(true);
    const { data } = await supabase.rpc("get_website_user_communities", { p_firebase_uid: user.id });
    setCommunities(data || []);
    setLoading(false);
  }

  async function handleLeave(community) {
    setLeaving(community.id);
    const { data: ok } = await supabase.rpc("leave_website_community", {
      p_firebase_uid: user.id,
      p_community_id: community.id,
    });
    if (ok) setCommunities(prev => prev.filter(c => c.id !== community.id));
    setLeaving(null);
    setConfirm(null);
  }

  const filtered = communities.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="h-display text-3xl md:text-4xl text-star">My Communities</h1>
          <p className="text-dust text-sm mt-1">
            {communities.length > 0
              ? `${communities.length} communit${communities.length !== 1 ? "ies" : "y"} joined`
              : "You haven't joined any communities yet"}
          </p>
        </div>
        {communities.length > 0 && (
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search communities…"
            className="px-4 py-2 border border-line rounded-xl text-sm focus:outline-none bg-night-900 text-star placeholder-dust focus:border-flare w-64"
          />
        )}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-night-800 rounded-2xl p-5 border border-line animate-pulse">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-night-600" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-night-600 rounded w-3/4" />
                  <div className="h-3 bg-night-700 rounded w-1/2" />
                </div>
              </div>
              <div className="h-3 bg-night-700 rounded w-full mb-1" />
              <div className="h-3 bg-night-700 rounded w-5/6" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-dust bg-night-800 rounded-2xl border border-line">
          <FiUsers className="text-4xl mx-auto mb-3 opacity-30" />
          {search ? (
            <p>No communities match "<strong>{search}</strong>"</p>
          ) : (
            <>
              <p className="font-medium">No communities yet</p>
              <p className="text-sm mt-1">Join communities on the Starstreak app to see them here.</p>
            </>
          )}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(community => {
            const typeConfig = TYPE_LABELS[community.type] || TYPE_LABELS.public;
            const roleConfig = ROLE_ICONS[community.role] || ROLE_ICONS.member;
            const RoleIcon = roleConfig.icon;
            const isAdmin = community.role === "admin";

            return (
              <div key={community.id} className="bg-night-800 rounded-2xl border border-line hover:border-night-500 transition-colors overflow-hidden group">

                {/* Card header */}
                <div className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-gradient-to-br from-flare/20 to-gold/20 flex items-center justify-center flex-shrink-0">
                      {community.avatar_url
                        ? <img src={community.avatar_url} alt="" className="w-full h-full object-cover" />
                        : <span className="text-flare font-extrabold text-lg">{community.name?.[0]?.toUpperCase()}</span>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-star text-sm truncate">{community.name}</div>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeConfig.color}`}>
                          {typeConfig.label}
                        </span>
                        <span className={`flex items-center gap-1 text-xs font-medium ${roleConfig.color}`}>
                          <RoleIcon className="text-xs" />
                          {roleConfig.label}
                        </span>
                      </div>
                    </div>
                  </div>

                  {community.description && (
                    <p className="text-xs text-dust mt-3 line-clamp-2 leading-relaxed">
                      {community.description}
                    </p>
                  )}
                </div>

                {/* Footer */}
                <div className="px-5 py-3 bg-night-850 border-t border-line flex items-center justify-between">
                  <span className="text-xs text-dust flex items-center gap-1">
                    <FiUsers className="text-xs" />
                    {(community.member_count ?? 0).toLocaleString()} members
                  </span>
                  {!isAdmin ? (
                    <button
                      onClick={() => setConfirm(community)}
                      className="flex items-center gap-1.5 text-xs text-dust hover:text-red-500 transition-colors font-medium opacity-0 group-hover:opacity-100"
                    >
                      <FiLogOut className="text-xs" /> Leave
                    </button>
                  ) : (
                    <span className="text-xs text-gold font-medium flex items-center gap-1">
                      <FiShield className="text-xs" /> Admin
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirm leave modal */}
      {confirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-night-950/70 backdrop-blur-sm px-4">
          <div className="bg-night-800 rounded-2xl p-6 max-w-md w-full shadow-night border border-line">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-flare/15 flex items-center justify-center flex-shrink-0">
                <FiAlertTriangle className="text-flare" />
              </div>
              <h3 className="text-lg font-bold text-star">Leave community?</h3>
            </div>
            <p className="text-mist text-sm mb-4">
              You'll leave <strong>{confirm.name}</strong>. You can rejoin later from the app unless it's a private or invite-only community.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirm(null)}
                className="px-4 py-2 border border-line rounded-xl text-sm font-medium hover:bg-night-850"
              >
                Cancel
              </button>
              <button
                onClick={() => handleLeave(confirm)}
                disabled={leaving === confirm.id}
                className="px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 disabled:opacity-50"
              >
                {leaving === confirm.id ? "Leaving…" : "Yes, leave"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
