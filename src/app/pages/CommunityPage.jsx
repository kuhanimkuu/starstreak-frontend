import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FiUsers, FiLock, FiCalendar, FiTag, FiShield } from "react-icons/fi";
import AppShell from "../AppShell";
import Composer from "../components/Composer";
import Feed, { Spinner } from "../components/Feed";
import { AppOnly } from "../components/GetTheApp";
import { CommunityIcon } from "./CommunitiesPage";
import { BackHeader, UUID } from "./PostPage";
import {
  communityStatus, fetchCommunity, fetchSubcommunities, joinCommunity, leaveCommunity, requestToJoinCommunity,
} from "../lib/api";
import { communityAdapter } from "../lib/adapters";
import { safeUrl } from "../lib/media";
import { compact } from "../lib/format";
import { useAppSession } from "../AppSession";

export default function CommunityPage() {
  const { communityId } = useParams();
  const { myId, me, notify } = useAppSession();
  const [c, setC] = useState(undefined);
  const [subs, setSubs] = useState([]);
  const [tab, setTab] = useState("posts");
  const [busy, setBusy] = useState(false);
  const [fresh, setFresh] = useState(null);

  const reload = useCallback(async () => {
    if (!UUID.test(communityId || "")) return setC(null);
    try {
      const data = await fetchCommunity(communityId);
      setC(data && !data.is_archived ? data : null);
      if (data) fetchSubcommunities(communityId).then(setSubs);
    } catch {
      setC(null);
    }
  }, [communityId]);

  useEffect(() => {
    setC(undefined);
    reload();
  }, [reload]);

  const adapter = useMemo(() => (c ? communityAdapter(c) : null), [c]);
  const load = useCallback((before) => adapter.fetchPage(before), [adapter]);
  const status = communityStatus(c, myId);

  async function act(kind) {
    if (busy) return;
    if (kind === "leave" && !window.confirm(`Leave ${c.name}?`)) return;
    setBusy(true);
    try {
      if (kind === "join") await joinCommunity(c.id);
      if (kind === "request") await requestToJoinCommunity(c.id, me?.display_name);
      if (kind === "leave") await leaveCommunity(c.id);
      notify(kind === "join" ? `Welcome to ${c.name}` : kind === "request" ? "Request sent — an admin will review it" : `You left ${c.name}`);
      await reload();
    } catch (e) {
      notify(e.message, "error");
    } finally {
      setBusy(false);
    }
  }

  if (c === undefined) return <AppShell title="Community"><BackHeader title="Community" /><Spinner /></AppShell>;
  if (c === null) {
    return (
      <AppShell title="Community">
        <BackHeader title="Community" />
        <div className="px-8 py-16 text-center">
          <p className="text-2xl font-extrabold">This community isn't available</p>
          <p className="mt-2 text-mist">It may be private, archived, or no longer exist.</p>
          <Link to="/communities" className="btn-ghost mt-6 !py-2.5 text-sm">Browse communities</Link>
        </div>
      </AppShell>
    );
  }

  const locked = c.type === "private" || c.visibility === "inviteOnly";
  const cover = safeUrl(c.cover_image_url);
  const canSeePosts = !locked || status.member;

  let action = null;
  if (status.role === "banned") action = <span className="rounded-full bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-400">Banned</span>;
  else if (status.role === "pending") action = <span className="rounded-full border border-line px-4 py-2 text-sm font-semibold text-mist">Request pending</span>;
  else if (status.member) {
    action = c.creator_id === myId ? (
      <span className="flex items-center gap-1.5 rounded-full border border-line px-4 py-2 text-sm font-semibold text-mist"><FiShield /> Owner</span>
    ) : (
      <button onClick={() => act("leave")} disabled={busy} className="rounded-full border border-night-600 px-5 py-2 text-sm font-semibold text-star hover:border-red-500/60 hover:text-red-400">Leave</button>
    );
  } else if (c.visibility === "inviteOnly") action = <span className="rounded-full border border-line px-4 py-2 text-sm text-mist">Invite only</span>;
  else if (c.requires_approval || c.type === "private") {
    action = <button onClick={() => act("request")} disabled={busy} className="btn-flare !px-5 !py-2 text-sm">Request to join</button>;
  } else {
    action = <button onClick={() => act("join")} disabled={busy} className="btn-flare !px-5 !py-2 text-sm">Join</button>;
  }

  return (
    <AppShell title={c.name}>
      <BackHeader title={c.name} subtitle={`${compact(c.member_count)} members`} />
      <div className="h-32 bg-night-gradient sm:h-44" style={cover ? { backgroundImage: `url("${cover}")`, backgroundSize: "cover", backgroundPosition: "center" } : { backgroundImage: "linear-gradient(135deg,#1A1D3D,#343868 60%,#E8590C33)" }} />
      <div className="px-4">
        <div className="-mt-10 flex items-end justify-between gap-3">
          <CommunityIcon src={c.image_url} name={c.name} className="h-20 w-20 border-4 border-night-900" />
          <div className="mb-1">{action}</div>
        </div>
        <h2 className="mt-3 flex items-center gap-2 text-xl font-extrabold">
          {c.name} {locked && <FiLock className="text-base text-dust" aria-label="Private" />}
        </h2>
        <p className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-dust">
          <span className="flex items-center gap-1.5"><FiUsers /> {compact(c.member_count)} members</span>
          {c.category && <span className="flex items-center gap-1.5"><FiTag /> {c.category}</span>}
        </p>
        {c.description && <p className="mt-3 whitespace-pre-wrap text-[15px] text-star">{c.description}</p>}
      </div>

      <div className="mt-4 flex border-b border-line">
        {[["posts", "Posts"], ["about", "About"], ...(status.staff ? [["manage", `Manage${c.pending_join_requests?.length ? ` (${c.pending_join_requests.length})` : ""}`]] : [])].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} aria-pressed={tab === id} className="flex flex-1 justify-center py-3.5 text-[15px] hover:bg-night-800">
            <span className={`relative ${tab === id ? "font-bold text-star" : "text-dust"}`}>
              {label}
              {tab === id && <span className="absolute -bottom-3.5 left-0 right-0 h-1 rounded-full bg-flare" />}
            </span>
          </button>
        ))}
      </div>

      {tab === "posts" && (
        !canSeePosts ? (
          <p className="px-8 py-16 text-center text-mist">This community is private. Join to see its posts.</p>
        ) : (
          <>
            {status.canPost && (
              <div className="border-b border-line">
                <Composer adapter={adapter} onPosted={setFresh} placeholder={`Post in ${c.name}`} />
              </div>
            )}
            {status.member && !status.canPost && (
              <p className="border-b border-line px-4 py-3 text-center text-sm text-dust">
                {c.posting_permission === "readOnly" ? "This community is read-only." : "Only admins and moderators can post here."}
              </p>
            )}
            <Feed key={c.id} load={load} adapter={adapter} prepend={fresh} showCommunity={false}
                  empty={<p className="px-8 py-16 text-center text-mist">No posts yet{status.canPost ? " — start the conversation." : "."}</p>} />
          </>
        )
      )}

      {/* Running a community is app-only (full web version: components/CommunityManage.jsx). */}
      {tab === "manage" && status.staff && <AppOnly feature="manage" />}

      {tab === "about" && (
        <div className="space-y-4 px-4 py-4 text-sm">
          <div className="rounded-2xl border border-line bg-night-800 p-4">
            <p className="font-bold text-star">About</p>
            <p className="mt-2 whitespace-pre-wrap text-mist">{c.description || "No description yet."}</p>
            <p className="mt-3 flex items-center gap-1.5 text-dust">
              <FiCalendar /> Created {new Date(c.created_at).toLocaleDateString(undefined, { month: "long", year: "numeric" })}
            </p>
          </div>
          <div className="rounded-2xl border border-line bg-night-800 p-4 text-mist">
            <p className="font-bold text-star">How it works</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>{locked ? "Private — only members see posts." : "Public — anyone can see posts."}</li>
              <li>{c.requires_approval || c.type === "private" ? "Joining needs an admin's approval." : "Anyone can join."}</li>
              <li>{c.posting_permission === "adminsOnly" ? "Only admins and moderators post." : c.posting_permission === "readOnly" ? "Read-only." : "Members can post."}</li>
              <li>{c.allow_anonymous === false ? "Anonymous posts are off." : "Anonymous posts are allowed."}</li>
            </ul>
          </div>
          {subs.length > 0 && (
            <div className="rounded-2xl border border-line bg-night-800 p-4">
              <p className="font-bold text-star">Sub-communities</p>
              <div className="mt-2 space-y-2">
                {subs.map((s) => (
                  <Link key={s.id} to={`/communities/${s.id}`} className="flex items-center gap-3 rounded-xl p-2 hover:bg-night-700">
                    <CommunityIcon src={s.image_url} name={s.name} className="h-9 w-9" />
                    <span className="min-w-0 flex-1 truncate font-semibold text-star">{s.name}</span>
                    <span className="text-xs text-dust">{compact(s.member_count)}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

        </div>
      )}
    </AppShell>
  );
}
