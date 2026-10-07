import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FiBriefcase, FiBookOpen, FiCalendar, FiSlash, FiMail, FiFlag } from "react-icons/fi";
import ReportDialog from "../components/ReportDialog";
import { AppOnlyModal } from "../components/GetTheApp";
import { MdVerified } from "react-icons/md";
import AppShell from "../AppShell";
import Avatar from "../components/Avatar";
import Feed, { Spinner } from "../components/Feed";
import FollowButton from "../components/FollowButton";
import RichText from "../components/RichText";
import { BackHeader } from "./PostPage";
import { blockStatus, blockUser, fetchUserByUsername, fetchUserPosts, unblockUser } from "../lib/api";
import { compact } from "../lib/format";
import { useAppSession } from "../AppSession";

const USERNAME = /^[A-Za-z0-9_.]{1,30}$/;

export default function ProfilePage() {
  const { username } = useParams();
  const { myId, notify, reload } = useAppSession();
  const [user, setUser] = useState(undefined);
  const [block, setBlock] = useState("none");
  const [followers, setFollowers] = useState(0);
  const [messagePrompt, setMessagePrompt] = useState(false);
  const [reporting, setReporting] = useState(false);

  useEffect(() => {
    setUser(undefined);
    if (!USERNAME.test(username || "")) return setUser(null);
    fetchUserByUsername(username)
      .then(async (u) => {
        setUser(u && !u.is_deleted ? u : null);
        setFollowers(u?.follower_count || 0);
        if (u && u.firebase_uid !== myId) setBlock(await blockStatus(u.firebase_uid));
        else setBlock("none");
      })
      .catch(() => setUser(null));
  }, [username, myId]);

  const uid = user?.firebase_uid;
  const load = useCallback((before) => fetchUserPosts(uid, before), [uid]);
  const isMe = uid && uid === myId;

  async function toggleBlock() {
    const name = user.display_name || user.username;
    if (block === "blocked_by_me") {
      try {
        await unblockUser(uid);
        setBlock("none");
        reload();
        notify(`${name} unblocked`);
      } catch (e) {
        notify(e.message, "error");
      }
      return;
    }
    if (!window.confirm(`Block ${name}? They won't be able to message you, and you won't see each other's posts.`)) return;
    try {
      await blockUser(uid);
      setBlock("blocked_by_me");
      reload();
      notify(`${name} blocked`);
    } catch (e) {
      notify(e.message, "error");
    }
  }

  if (user === undefined) {
    return <AppShell title="Profile"><BackHeader title="Profile" /><Spinner /></AppShell>;
  }
  if (user === null) {
    return (
      <AppShell title="Profile">
        <BackHeader title="Profile" />
        <div className="px-8 py-16 text-center">
          <p className="text-2xl font-extrabold">This account doesn't exist</p>
          <p className="mt-2 text-mist">Try searching for someone else.</p>
        </div>
      </AppShell>
    );
  }

  const name = user.display_name || user.username;
  const work = [user.job_title, user.company].filter(Boolean).join(" at ");
  const study = [user.course, user.year ? `Year ${user.year}` : null].filter(Boolean).join(" · ");
  const blocked = block !== "none";

  return (
    <AppShell title={`${name} (@${user.username})`}>
      {messagePrompt && <AppOnlyModal feature="messages" onClose={() => setMessagePrompt(false)} />}
      {reporting && <ReportDialog onClose={() => setReporting(false)} target={{ type: "user", id: uid, label: `@${user.username}` }} />}
      <BackHeader title={name} subtitle={`${compact(user.total_post_count ?? user.post_count)} posts`} />
      <div className="h-36 bg-night-gradient sm:h-48" style={{ backgroundImage: "linear-gradient(135deg,#1A1D3D,#343868 60%,#E8590C33)" }} />
      <div className="px-4">
        <div className="-mt-12 flex items-end justify-between sm:-mt-16">
          <Avatar size="xl" src={user.avatar_url} name={name} className="border-4 border-night-900 max-sm:!h-24 max-sm:!w-24" />
          <div className="mb-2 flex gap-2">
            {isMe ? (
              <Link to="/profile" className="btn-ghost !px-5 !py-2 text-sm">Edit profile</Link>
            ) : (
              <>
                <button onClick={() => setReporting(true)} title="Report" aria-label={`Report @${user.username}`}
                        className="grid h-9 w-9 place-items-center rounded-full border border-night-600 text-mist hover:border-red-500/60 hover:text-red-400">
                  <FiFlag />
                </button>
                {block !== "blocked_me" && (
                  <button onClick={toggleBlock} title={block === "blocked_by_me" ? "Unblock" : "Block"}
                          className={`rounded-full border px-4 py-2 text-sm font-semibold ${block === "blocked_by_me" ? "border-red-500/60 bg-red-500/10 text-red-400" : "border-night-600 text-mist hover:text-star"}`}>
                    {block === "blocked_by_me" ? "Unblock" : <FiSlash />}
                  </button>
                )}
                {!blocked && (
                  <button
                    onClick={() => setMessagePrompt(true)}
                    title="Message" aria-label="Message"
                    className="grid h-9 w-9 place-items-center rounded-full border border-night-600 text-star hover:border-flare/60">
                    <FiMail />
                  </button>
                )}
                {!blocked && <FollowButton userId={uid} onChange={(d) => setFollowers((f) => Math.max(0, f + d))} />}
              </>
            )}
          </div>
        </div>

        <div className="mt-3">
          <h2 className="flex items-center gap-1.5 text-xl font-extrabold">
            {name} {user.is_verified && <MdVerified className="text-accent" aria-label="Verified" />}
          </h2>
          <p className="text-dust">@{user.username}</p>
        </div>

        {!blocked && user.bio && <RichText text={user.bio} className="mt-3 text-[15px] text-star" />}

        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-dust">
          {work && <span className="flex items-center gap-1.5"><FiBriefcase /> {work}</span>}
          {study && <span className="flex items-center gap-1.5"><FiBookOpen /> {study}</span>}
          {user.created_at && (
            <span className="flex items-center gap-1.5">
              <FiCalendar /> Joined {new Date(user.created_at).toLocaleDateString(undefined, { month: "long", year: "numeric" })}
            </span>
          )}
        </div>

        <div className="mt-3 flex gap-5 text-sm">
          <span><b className="text-star">{compact(user.following_count)}</b> <span className="text-dust">Following</span></span>
          <span><b className="text-star">{compact(followers)}</b> <span className="text-dust">Followers</span></span>
        </div>
      </div>

      <div className="mt-4 border-b border-line">
        <span className="ml-4 inline-block border-b-4 border-flare px-2 pb-3 font-bold">Posts</span>
      </div>

      {block === "blocked_by_me" ? (
        <p className="px-8 py-16 text-center text-mist">You blocked @{user.username}. Unblock them to see their posts.</p>
      ) : block === "blocked_me" ? (
        <p className="px-8 py-16 text-center text-mist">You can't see @{user.username}'s posts.</p>
      ) : user.account_privacy === "private" && !isMe ? (
        <p className="px-8 py-16 text-center text-mist">This account is private.</p>
      ) : (
        <Feed key={uid} load={load}
              empty={<p className="px-8 py-16 text-center text-mist">{isMe ? "You haven't posted yet." : `@${user.username} hasn't posted yet.`}</p>} />
      )}
    </AppShell>
  );
}
