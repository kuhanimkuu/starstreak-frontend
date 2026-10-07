import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiCheck, FiX, FiShield, FiSlash } from "react-icons/fi";
import Avatar from "./Avatar";
import { Spinner } from "./Feed";
import {
  approveJoinRequest, banFromCommunity, fetchCommunityMembers, fetchUsersByIds, rejectJoinRequest, setModerator, unbanFromCommunity,
} from "../lib/api";
import { timeAgo } from "../lib/format";
import { useAppSession } from "../AppSession";

function Person({ user, fallback, children, sub }) {
  const name = user?.display_name || fallback || "Starstreak user";
  const inner = (
    <>
      <Avatar size="sm" src={user?.avatar_url} name={name} />
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-star">{name}</p>
        <p className="truncate text-xs text-dust">{user?.username ? `@${user.username}` : ""}{sub ? ` · ${sub}` : ""}</p>
      </div>
    </>
  );
  return (
    <div className="flex items-center gap-3 px-4 py-2.5">
      {user?.username ? <Link to={`/profile/${user.username}`} className="flex min-w-0 flex-1 items-center gap-3">{inner}</Link> : <div className="flex min-w-0 flex-1 items-center gap-3">{inner}</div>}
      <div className="flex shrink-0 gap-1.5">{children}</div>
    </div>
  );
}

const btn = "flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors";

/** Admin tools for a community: join requests, members & roles, bans. */
export default function CommunityManage({ community: c, onChanged }) {
  const { myId, notify } = useAppSession();
  const [members, setMembers] = useState(null);
  const [requesters, setRequesters] = useState({});
  const [busy, setBusy] = useState(null);

  const requests = (c.pending_join_requests || []).filter((r) => r?.userId || r?.user_id);

  const load = useCallback(async () => {
    try {
      setMembers(await fetchCommunityMembers(c.id));
      setRequesters(await fetchUsersByIds(requests.map((r) => r.userId || r.user_id)));
    } catch (e) {
      setMembers([]);
      notify(e.message, "error");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [c.id, notify, c.pending_join_requests]);

  useEffect(() => { load(); }, [load]);

  async function run(key, fn, done) {
    if (busy) return;
    setBusy(key);
    try {
      await fn();
      notify(done);
      await onChanged();
      await load();
    } catch (e) {
      notify(e.message, "error");
    } finally {
      setBusy(null);
    }
  }

  if (!members) return <Spinner />;
  const mods = new Set(c.moderators || []);
  const admins = new Set([c.creator_id, ...(c.admins || [])]);
  const active = members.filter((m) => !m.is_banned);
  const banned = members.filter((m) => m.is_banned);

  return (
    <div className="pb-8">
      <h3 className="px-4 pb-1 pt-4 text-sm font-bold uppercase tracking-wide text-dust">Join requests ({requests.length})</h3>
      {!requests.length && <p className="px-4 py-2 text-sm text-dust">No pending requests.</p>}
      {requests.map((r) => {
        const uid = r.userId || r.user_id;
        return (
          <Person key={uid} user={requesters[uid]} fallback={r.displayName} sub={r.requestedAt ? `asked ${timeAgo(r.requestedAt)}` : null}>
            <button disabled={!!busy} onClick={() => run(`a${uid}`, () => approveJoinRequest(c, uid), "Approved")} className={`${btn} border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10`}><FiCheck /> Approve</button>
            <button disabled={!!busy} onClick={() => run(`r${uid}`, () => rejectJoinRequest(c, uid), "Declined")} className={`${btn} border-line text-mist hover:text-star`}><FiX /> Decline</button>
          </Person>
        );
      })}

      <h3 className="px-4 pb-1 pt-6 text-sm font-bold uppercase tracking-wide text-dust">Members ({active.length})</h3>
      {active.map((m) => {
        const isAdmin = admins.has(m.user_id);
        const isMod = mods.has(m.user_id);
        const self = m.user_id === myId;
        return (
          <Person key={m.user_id} user={m.user} sub={isAdmin ? (m.user_id === c.creator_id ? "Owner" : "Admin") : isMod ? "Moderator" : `joined ${timeAgo(m.joined_at)}`}>
            {!isAdmin && !self && (
              <>
                <button disabled={!!busy} onClick={() => run(`m${m.user_id}`, () => setModerator(c.id, m.user_id, !isMod), isMod ? "Moderator removed" : "Made moderator")}
                        className={`${btn} border-line text-mist hover:text-star`}><FiShield /> {isMod ? "Remove mod" : "Make mod"}</button>
                <button disabled={!!busy}
                        onClick={() => window.confirm(`Ban ${m.user?.display_name || "this member"}? They'll be removed and can't rejoin.`) && run(`b${m.user_id}`, () => banFromCommunity(c.id, m.user_id), "Banned")}
                        className={`${btn} border-red-500/40 text-red-400 hover:bg-red-500/10`}><FiSlash /> Ban</button>
              </>
            )}
          </Person>
        );
      })}

      {banned.length > 0 && (
        <>
          <h3 className="px-4 pb-1 pt-6 text-sm font-bold uppercase tracking-wide text-dust">Banned ({banned.length})</h3>
          {banned.map((m) => (
            <Person key={m.user_id} user={m.user}>
              <button disabled={!!busy} onClick={() => run(`u${m.user_id}`, () => unbanFromCommunity(c.id, m.user_id), "Unbanned")} className={`${btn} border-line text-mist hover:text-star`}>Unban</button>
            </Person>
          ))}
        </>
      )}
      <p className="px-4 pt-6 text-xs text-dust">Editing the name, images and rules is in the phone app for now.</p>
    </div>
  );
}
