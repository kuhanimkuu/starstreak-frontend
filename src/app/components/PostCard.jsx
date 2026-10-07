import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiHeart, FiMessageCircle, FiShare2, FiMoreHorizontal, FiThumbsDown, FiTrendingUp,
  FiSlash, FiLink, FiTrash2, FiUserX, FiRepeat, FiUsers, FiBookmark, FiFlag,
} from "react-icons/fi";
import { MdVerified } from "react-icons/md";
import Avatar from "./Avatar";
import RichText from "./RichText";
import PostMedia from "./PostMedia";
import Poll from "./Poll";
import ReportDialog from "./ReportDialog";
import { parseMedia } from "../lib/media";
import { compact, timeAgo, fullDate } from "../lib/format";
import { hidePost, blockUser, recordView } from "../lib/api";
import { feedAdapter } from "../lib/adapters";
import { useAppSession } from "../AppSession";

const TRUNCATE = 400; // characters before "Read more" (as in the app)


function Menu({ items, onClose }) {
  const ref = useRef(null);
  useEffect(() => {
    const away = (e) => !ref.current?.contains(e.target) && onClose();
    const esc = (e) => e.key === "Escape" && onClose();
    document.addEventListener("mousedown", away);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", away);
      document.removeEventListener("keydown", esc);
    };
  }, [onClose]);
  return (
    <div ref={ref} role="menu" onClick={(e) => e.stopPropagation()}
         className="absolute right-0 top-8 z-30 w-60 overflow-hidden rounded-2xl border border-line bg-night-800 py-1 shadow-night">
      {items.map(({ icon: Icon, label, onClick, danger }) => (
        <button key={label} role="menuitem" onClick={() => { onClose(); onClick(); }}
                className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm hover:bg-night-700 ${danger ? "text-red-400" : "text-star"}`}>
          <Icon className="shrink-0" /> {label}
        </button>
      ))}
    </div>
  );
}

/** Engagement pill, as in the app (rounded 14, tinted when active). */
function Pill({ icon: Icon, count, active, tone, label, onClick, showZero = true }) {
  const tones = {
    like: "border-red-500/25 bg-red-500/10 text-red-400",
    dislike: "border-slate-400/25 bg-slate-400/10 text-slate-300",
  };
  return (
    <button onClick={(e) => { e.stopPropagation(); onClick?.(); }} aria-label={label} aria-pressed={active}
            className={`flex items-center gap-1.5 rounded-[14px] border px-3 py-2 text-[13px] font-bold transition-colors ${
              active ? tones[tone] : "border-transparent text-star hover:bg-night-700"}`}>
      <Icon className="text-[18px]" />
      {(showZero || count > 0) && count !== undefined && <span>{compact(count)}</span>}
    </button>
  );
}

/**
 * A post — feed, community or Flash, depending on `adapter` (lib/adapters).
 * `detail` shows the full timestamp and doesn't link to itself. Anonymous
 * posts show no profile link (the author fields arrive masked).
 */
export default function PostCard({ post, detail = false, onRemoved, adapter = feedAdapter, showCommunity = true }) {
  const { myId, notify, hidePostLocally, savedPostIds, toggleSaved } = useAppSession();
  const navigate = useNavigate();
  const media = useMemo(() => parseMedia(post.media_urls), [post.media_urls]);
  const [likes, setLikes] = useState(post.likes || []);
  const [dislikes, setDislikes] = useState(post.dislikes || []);
  const [expanded, setExpanded] = useState(false);
  const [shares, setShares] = useState(post.share_count || 0);
  const [menu, setMenu] = useState(false);
  const [reporting, setReporting] = useState(false);
  const cardRef = useRef(null);

  const liked = !!myId && likes.includes(myId);
  const disliked = !!myId && dislikes.includes(myId);
  const anonymous = !!post.is_anonymous;
  const mine = !!post.is_mine;
  const username = !anonymous ? post.author_username : null;
  // Anonymous posts always read "Anonymous" — even to their author (as in the app).
  const name = anonymous ? "Anonymous" : post.author_name || "Starstreak user";

  // Count an impression once the post is mostly on screen for a moment.
  useEffect(() => {
    const el = cardRef.current;
    if (!el || !myId || adapter.kind !== "feed") return;
    let t;
    const io = new IntersectionObserver(([e]) => {
      clearTimeout(t);
      if (e.isIntersecting) t = setTimeout(() => recordView(post.id, myId), 800);
    }, { threshold: 0.6 });
    io.observe(el);
    return () => { clearTimeout(t); io.disconnect(); };
  }, [post.id, myId, adapter.kind]);

  // Like and dislike are exclusive: setting one clears the other.
  async function react(kind) {
    const before = { likes, dislikes };
    const without = (list) => list.filter((l) => l !== myId);
    if (kind === "like") {
      setLikes(liked ? without(likes) : [...likes, myId]);
      setDislikes(without(dislikes));
    } else {
      setDislikes(disliked ? without(dislikes) : [...dislikes, myId]);
      setLikes(without(likes));
    }
    try {
      await (kind === "like" ? adapter.like(post, myId) : adapter.dislike(post, myId));
    } catch (e) {
      setLikes(before.likes);
      setDislikes(before.dislikes);
      notify(e.message, "error");
    }
  }

  async function share() {
    const url = adapter.shareUrl(post);
    try {
      if (navigator.share) await navigator.share({ title: "Starstreak", url });
      else {
        await navigator.clipboard.writeText(url);
        notify("Link copied");
      }
      setShares((s) => s + 1);
      adapter.share?.(post)?.catch(() => {});
    } catch {
      /* share sheet dismissed */
    }
  }

  const saved = savedPostIds.has(post.id);
  const menuItems = [
    ...(adapter.kind === "feed" ? [{
      icon: FiBookmark, label: saved ? "Remove from saved" : "Save post",
      onClick: () => toggleSaved(post.id).then((on) => notify(on ? "Saved" : "Removed from saved")).catch((e) => notify(e.message, "error")),
    }] : []),
    { icon: FiLink, label: "Copy link", onClick: () => navigator.clipboard.writeText(adapter.shareUrl(post)).then(() => notify("Link copied")) },
  ];
  if (mine) {
    menuItems.push({
      icon: FiTrash2, label: "Delete post", danger: true,
      onClick: async () => {
        if (!window.confirm("Delete this post? This can't be undone.")) return;
        try {
          await adapter.remove(post);
          notify("Post deleted");
          onRemoved?.(post.id);
          if (detail) navigate(-1);
        } catch (e) {
          notify(e.message, "error");
        }
      },
    });
  } else {
    menuItems.push({ icon: FiFlag, label: "Report post", danger: true, onClick: () => setReporting(true) });
    if (adapter.canHide) menuItems.push({
      icon: FiSlash, label: "Not interested in this post",
      onClick: async () => {
        try {
          await hidePost(post.id, myId);
          hidePostLocally(post.id);
          onRemoved?.(post.id);
          notify("You'll see less like this");
        } catch (e) {
          notify(e.message, "error");
        }
      },
    });
    if (!anonymous && post.author_id) {
      menuItems.push({
        icon: FiUserX, label: `Block ${username ? "@" + username : name}`, danger: true,
        onClick: async () => {
          if (!window.confirm(`Block ${name}? They won't be able to message you or see your activity, and you won't see their posts.`)) return;
          try {
            await blockUser(post.author_id);
            onRemoved?.(post.id);
            notify(`${name} blocked`);
          } catch (e) {
            notify(e.message, "error");
          }
        },
      });
    }
  }

  const authorLink = username ? `/profile/${username}` : null;
  const open = () => !detail && navigate(adapter.path(post));

  const content = post.content || "";
  const long = !detail && content.length > TRUNCATE;

  return (
    <article ref={cardRef} onClick={open}
             className={`relative overflow-hidden rounded-3xl bg-night-800 shadow-[0_4px_15px_rgba(0,0,0,0.3)] transition-colors ${
               detail ? "" : "cursor-pointer hover:bg-night-700/80"}`}>
      {/* Flare stripe down the left edge, as in the app. */}
      <span className="absolute inset-y-0 left-0 w-[3px] bg-flare-deep" aria-hidden />

      {/* Header: avatar · name · verified · more / @handle · time */}
      <header className="flex items-center gap-2.5 py-4 pl-5 pr-2">
        {authorLink ? (
          <Link to={authorLink} onClick={(e) => e.stopPropagation()} className="shrink-0">
            <Avatar glow verified={post.is_verified} size="glow" src={post.author_avatar_url} name={name} />
          </Link>
        ) : (
          <Avatar glow size="glow" anonymous={anonymous} src={post.author_avatar_url} name={name} />
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1">
            {authorLink ? (
              <Link to={authorLink} onClick={(e) => e.stopPropagation()} className="truncate text-[15px] font-bold text-star hover:underline">
                {name}
              </Link>
            ) : (
              <span className="truncate text-[15px] font-bold text-star">{name}</span>
            )}
            {post.is_verified && !anonymous && <MdVerified className="shrink-0 text-[14px] text-sky-500" aria-label="Verified" />}
            {anonymous && mine && <span className="ml-1 shrink-0 rounded-full bg-night-700 px-2 py-0.5 text-[11px] text-mist">You</span>}
          </div>
          <div className="mt-0.5 flex items-center gap-1 text-xs text-mist">
            {username && <><span className="truncate">@{username}</span><span>·</span></>}
            <time dateTime={post.created_at} title={fullDate(post.created_at)} className="shrink-0">
              {detail ? fullDate(post.created_at) : timeAgo(post.created_at)}
            </time>
          </div>
        </div>
        <div className="relative">
          <button onClick={(e) => { e.stopPropagation(); setMenu((v) => !v); }} aria-label="More"
                  className="grid h-8 w-8 place-items-center rounded-full text-mist hover:bg-night-700 hover:text-star">
            <FiMoreHorizontal size={20} />
          </button>
          {menu && <Menu items={menuItems} onClose={() => setMenu(false)} />}
        </div>
      </header>

      {showCommunity && post.community_name && (
        <div className="px-5 pb-2.5">
          <span className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-flare/20 bg-flare/10 px-2.5 py-1 text-xs font-semibold text-flare">
            <FiUsers className="shrink-0 text-[13px]" /> <span className="truncate">{post.community_name}</span>
          </span>
        </div>
      )}

      {media.repost && (
        <p className="flex items-center gap-1.5 px-5 pb-1.5 text-xs font-semibold text-flare/80">
          <FiRepeat /> Shared from {media.repost.username ? `@${media.repost.username}` : media.repost.name}
        </p>
      )}

      {content && (
        <div className="px-5 pb-4">
          <RichText text={long && !expanded ? `${content.slice(0, TRUNCATE)}…` : content}
                    className={`text-star ${detail ? "text-lg leading-8" : "text-[15px] leading-[1.6]"}`} />
          {long && (
            <button onClick={(e) => { e.stopPropagation(); setExpanded((v) => !v); }}
                    className="mt-1.5 text-sm font-semibold text-flare hover:underline">
              {expanded ? "Show less" : "Read more"}
            </button>
          )}
        </div>
      )}

      {post.poll && (
        <div className="px-5">
          <Poll key={post.id} poll={post.poll} vote={(optionId) => adapter.vote(post, optionId, myId)} />
        </div>
      )}
      <PostMedia media={media} />
      {post.is_edited && <p className="px-5 pt-2 text-xs text-dust">Edited</p>}

      {/* Engagement: views on the left, actions on the right. */}
      <footer className="mx-4 mt-3 flex items-center border-t border-line py-2">
        <span className="flex items-center gap-1 pl-1 text-xs text-mist">
          <FiTrendingUp className="text-[15px]" />
          <b className="text-[13px] font-extrabold text-star">{compact(post.view_count)}</b> views
        </span>
        <div className="ml-auto flex items-center gap-0.5">
          <Pill icon={FiHeart} tone="like" count={likes.length} active={liked} label={liked ? "Unlike" : "Like"} onClick={() => react("like")} />
          <Pill icon={FiThumbsDown} tone="dislike" count={dislikes.length} showZero={false} active={disliked} label={disliked ? "Remove dislike" : "Dislike"} onClick={() => react("dislike")} />
          <Pill icon={FiMessageCircle} count={post.comment_count || 0} label="Comments" onClick={open} />
          <Pill icon={FiShare2} label={`Share${shares ? ` (${shares})` : ""}`} onClick={share} />
        </div>
      </footer>
      {reporting && (
        <ReportDialog onClose={() => setReporting(false)}
                      target={{ type: "post", id: post.id, communityId: post.community_id, label: "post" }} />
      )}
    </article>
  );
}
