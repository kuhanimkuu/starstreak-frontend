import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiHeart, FiCornerDownRight, FiTrash2, FiEyeOff, FiFlag } from "react-icons/fi";
import ReportDialog from "./ReportDialog";
import { MdVerified } from "react-icons/md";
import Avatar from "./Avatar";
import RichText from "./RichText";
import { supabase } from "../../lib/supabase";
import { feedAdapter } from "../lib/adapters";
import { timeAgo, fullDate } from "../lib/format";
import { useAppSession } from "../AppSession";

function CommentBox({ placeholder, onSubmit, autoFocus, onCancel, allowAnonymous = true }) {
  const { me } = useAppSession();
  const [text, setText] = useState("");
  const [anonymous, setAnonymous] = useState(allowAnonymous && !!me?.default_anonymous_mode);
  const [busy, setBusy] = useState(false);

  async function send() {
    if (!text.trim() || busy) return;
    setBusy(true);
    const ok = await onSubmit(text, anonymous);
    setBusy(false);
    if (ok) setText("");
  }

  return (
    <div className="flex gap-3">
      <Avatar size="sm" anonymous={anonymous} src={me?.avatar_url} name={me?.display_name} />
      <div className="min-w-0 flex-1">
        <textarea value={text} onChange={(e) => setText(e.target.value)} autoFocus={autoFocus} rows={2} maxLength={2000}
                  onKeyDown={(e) => (e.metaKey || e.ctrlKey) && e.key === "Enter" && send()}
                  placeholder={placeholder}
                  className="w-full resize-none rounded-xl border border-night-600 bg-night-850 px-3 py-2 text-sm text-star placeholder-dust focus:border-flare focus:outline-none" />
        <div className="mt-1.5 flex items-center gap-2">
          {allowAnonymous && (
            <button onClick={() => setAnonymous((v) => !v)} aria-pressed={anonymous}
                    className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${anonymous ? "bg-flare/15 text-flare" : "text-mist hover:bg-night-700"}`}>
              <FiEyeOff /> Anonymous
            </button>
          )}
          <div className="ml-auto flex gap-2">
            {onCancel && <button onClick={onCancel} className="px-3 py-1.5 text-sm text-mist hover:text-star">Cancel</button>}
            <button onClick={send} disabled={!text.trim() || busy} className="btn-flare !px-4 !py-1.5 text-sm disabled:opacity-50">
              {busy ? "Sending…" : "Reply"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Comment({ c, profile, onReply, onDeleted, isReply, api }) {
  const { myId, notify } = useAppSession();
  const [likes, setLikes] = useState(c.likes || []);
  const liked = !!myId && likes.includes(myId);
  const anonymous = !!c.is_anonymous;
  const mine = c.is_mine ?? (!!myId && c.author_id === myId);
  const [reporting, setReporting] = useState(false);
  const username = !anonymous ? profile?.username : null;

  async function like() {
    const before = likes;
    setLikes(liked ? likes.filter((l) => l !== myId) : [...likes, myId]);
    try {
      await api.like(c);
    } catch (e) {
      setLikes(before);
      notify(e.message, "error");
    }
  }

  async function remove() {
    if (!window.confirm("Delete this comment?")) return;
    try {
      await api.remove(c);
      onDeleted(c.id);
    } catch (e) {
      notify(e.message, "error");
    }
  }

  const nameEl = <span className="font-bold text-star">{anonymous ? "Anonymous" : c.author_name || "Starstreak user"}</span>;
  return (
    <div className={`flex gap-3 ${isReply ? "ml-12 mt-3" : ""}`}>
      {username ? (
        <Link to={`/profile/${username}`} className="shrink-0"><Avatar size="sm" src={c.author_avatar_url} name={c.author_name} /></Link>
      ) : (
        <Avatar size="sm" anonymous={anonymous} src={c.author_avatar_url} name={c.author_name} />
      )}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-1.5 text-sm">
          {username ? <Link to={`/profile/${username}`} className="hover:underline">{nameEl}</Link> : nameEl}
          {profile?.is_verified && !anonymous && <MdVerified className="text-accent" />}
          {username && <span className="text-dust">@{username}</span>}
          {anonymous && mine && <span className="rounded-full bg-night-700 px-2 py-0.5 text-[11px] text-mist">You · anonymous</span>}
          <span className="text-dust">·</span>
          <time dateTime={c.created_at} title={fullDate(c.created_at)} className="text-dust">{timeAgo(c.created_at)}</time>
        </div>
        <RichText text={c.content} className="mt-0.5 text-[15px] leading-6 text-star" />
        <div className="mt-1 flex items-center gap-4 text-xs text-dust">
          {api.like && (
            <button onClick={like} className={`flex items-center gap-1 ${liked ? "text-red-400" : "hover:text-star"}`} aria-pressed={liked}>
              <FiHeart className={liked ? "fill-current" : ""} /> {likes.length > 0 && likes.length}
            </button>
          )}
          {!isReply && (
            <button onClick={() => onReply(c)} className="flex items-center gap-1 hover:text-star">
              <FiCornerDownRight /> Reply
            </button>
          )}
          {!mine && (
            <button onClick={() => setReporting(true)} className="flex items-center gap-1 hover:text-red-400" aria-label="Report comment">
              <FiFlag /> Report
            </button>
          )}
          {reporting && <ReportDialog onClose={() => setReporting(false)} target={{ type: "comment", id: c.id, communityId: c.community_id, label: "comment" }} />}
          {mine && (
            <button onClick={remove} className="flex items-center gap-1 hover:text-red-400">
              <FiTrash2 /> Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/** Comments on a post: newest conversation at the bottom, one level of replies. */
export default function Comments({ post, adapter = feedAdapter, onCountChange }) {
  const { notify, me, myId } = useAppSession();
  const api = adapter.comments;
  const [comments, setComments] = useState(null);
  const [profiles, setProfiles] = useState({});
  const [replyTo, setReplyTo] = useState(null);

  const load = useCallback(async () => {
    try {
      const list = (await api.fetch(post)).filter((c) => !c.is_deleted);
      setComments(list);
      // Usernames for the profile links (anonymous comments have no author id).
      const ids = [...new Set(list.map((c) => c.author_id).filter(Boolean))];
      if (ids.length) {
        const { data } = await supabase.from("users").select("firebase_uid, username, is_verified").in("firebase_uid", ids);
        setProfiles(Object.fromEntries((data || []).map((u) => [u.firebase_uid, u])));
      }
    } catch (e) {
      setComments([]);
      notify(e.message, "error");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post.id, notify]);

  useEffect(() => { load(); }, [load]);

  async function submit(text, anonymous, parent) {
    try {
      await api.create(post, { content: text, parentId: parent?.id || null, parent, anonymous, me, myId });
      setReplyTo(null);
      onCountChange?.(1);
      await load();
      return true;
    } catch (e) {
      notify(e.message, "error");
      return false;
    }
  }

  function removed(id) {
    setComments((cs) => cs.filter((c) => c.id !== id && (c.parent_comment_id || c.parent_id) !== id));
    onCountChange?.(-1);
  }

  if (!comments) {
    return <div className="flex justify-center py-8"><span className="h-6 w-6 animate-spin rounded-full border-2 border-night-600 border-t-flare" /></div>;
  }

  const top = comments.filter((c) => !(c.parent_comment_id || c.parent_id));
  const repliesOf = (id) => comments.filter((c) => (c.parent_comment_id || c.parent_id) === id);

  return (
    <div>
      <div className="border-b border-line px-4 py-3">
        <CommentBox placeholder="Post your reply" allowAnonymous={api.anonymous} onSubmit={(t, a) => submit(t, a, null)} />
      </div>
      {top.length === 0 && <p className="px-4 py-10 text-center text-sm text-dust">No replies yet. Start the conversation.</p>}
      {top.map((c) => (
        <div key={c.id} className="border-b border-line px-4 py-3">
          <Comment c={c} api={api} profile={profiles[c.author_id]} onReply={setReplyTo} onDeleted={removed} />
          {repliesOf(c.id).map((r) => (
            <Comment key={r.id} c={r} api={api} isReply profile={profiles[r.author_id]} onDeleted={removed} />
          ))}
          {replyTo?.id === c.id && (
            <div className="ml-12 mt-3">
              <CommentBox autoFocus allowAnonymous={api.anonymous}
                          placeholder={`Reply to ${c.is_anonymous ? "Anonymous" : c.author_name || "this comment"}`}
                          onSubmit={(t, a) => submit(t, a, c)} onCancel={() => setReplyTo(null)} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
