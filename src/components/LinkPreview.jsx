import { useMemo } from "react";
import { FiHeart, FiMessageCircle, FiThumbsDown, FiTrendingUp, FiUsers, FiZap, FiRepeat } from "react-icons/fi";
import { MdVerified } from "react-icons/md";
import Avatar from "../app/components/Avatar";
import RichText from "../app/components/RichText";
import PostMedia from "../app/components/PostMedia";
import { parseMedia, safeUrl } from "../app/lib/media";
import { compact, timeAgo, fullDate } from "../app/lib/format";

// Read-only previews for shared links, drawn like the app's post and
// community cards (the web app's PostCard needs a signed-in session).

const TRUNCATE = 400;

function Stat({ icon: Icon, count, tone = "" }) {
  return (
    <span className={`flex items-center gap-1.5 rounded-[14px] px-3 py-2 text-[13px] font-bold text-star ${tone}`}>
      <Icon className="text-[18px]" />
      {compact(count || 0)}
    </span>
  );
}

export function PostPreview({ post }) {
  const media = useMemo(() => parseMedia(post.media_urls), [post.media_urls]);
  const anonymous = !!post.is_anonymous;
  const name = anonymous ? "Anonymous" : post.author_name || "Starstreak user";
  const username = anonymous ? null : post.author_username;
  const content = post.content || "";
  const long = content.length > TRUNCATE;
  const options = post.poll?.options || [];
  const totalVotes = post.poll?.totalVotes || options.reduce((n, o) => n + (o.votes || 0), 0);

  return (
    <article className="relative w-full overflow-hidden rounded-3xl bg-night-800 text-left shadow-[0_4px_15px_rgba(0,0,0,0.3)]">
      <span className="absolute inset-y-0 left-0 w-[3px] bg-flare-deep" aria-hidden />

      <header className="flex items-center gap-2.5 py-4 pl-5 pr-4">
        <Avatar glow verified={post.is_verified} size="glow" anonymous={anonymous} src={post.author_avatar_url} name={name} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1">
            <span className="truncate text-[15px] font-bold text-star">{name}</span>
            {post.is_verified && !anonymous && <MdVerified className="shrink-0 text-[14px] text-sky-500" aria-label="Verified" />}
          </div>
          <div className="mt-0.5 flex items-center gap-1 text-xs text-mist">
            {username && <><span className="truncate">@{username}</span><span>·</span></>}
            <time dateTime={post.created_at} title={fullDate(post.created_at)} className="shrink-0">
              {timeAgo(post.created_at)}
            </time>
          </div>
        </div>
      </header>

      {post.community_name && (
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
          <RichText text={long ? `${content.slice(0, TRUNCATE)}…` : content} className="text-[15px] leading-[1.6] text-star" />
        </div>
      )}

      {post.poll && options.length > 0 && (
        <div className="mx-5 mb-3 rounded-2xl border border-line bg-night-900/60 p-4">
          {post.poll.question && <p className="font-semibold text-star">{post.poll.question}</p>}
          <ul className="mt-3 space-y-2">
            {options.map((o) => {
              const pct = totalVotes ? Math.round(((o.votes || 0) / totalVotes) * 100) : 0;
              return (
                <li key={o.id || o.text} className="relative overflow-hidden rounded-xl border border-line px-3 py-2 text-sm text-star">
                  <span className="absolute inset-y-0 left-0 bg-flare/15" style={{ width: `${pct}%` }} aria-hidden />
                  <span className="relative flex justify-between gap-3">
                    <span className="truncate">{o.text}</span>
                    <span className="shrink-0 text-mist">{pct}%</span>
                  </span>
                </li>
              );
            })}
          </ul>
          <p className="mt-2 text-xs text-mist">{compact(totalVotes)} votes</p>
        </div>
      )}

      <PostMedia media={media} />

      <footer className="mx-4 mt-3 flex items-center border-t border-line py-2">
        <span className="flex items-center gap-1 pl-1 text-xs text-mist">
          <FiTrendingUp className="text-[15px]" />
          <b className="text-[13px] font-extrabold text-star">{compact(post.view_count || 0)}</b> views
        </span>
        <div className="ml-auto flex items-center gap-0.5">
          <Stat icon={FiHeart} count={(post.likes || []).length} />
          {(post.dislikes || []).length > 0 && <Stat icon={FiThumbsDown} count={post.dislikes.length} />}
          <Stat icon={FiMessageCircle} count={post.comment_count} />
        </div>
      </footer>
    </article>
  );
}

/** A community or Flash, like the app's community card. */
export function SpacePreview({ space, kind }) {
  const cover = safeUrl(space.cover_image_url || space.hero_image_url);
  const isFlash = kind === "flash";
  return (
    <article className="relative w-full overflow-hidden rounded-3xl bg-night-800 text-left shadow-[0_4px_15px_rgba(0,0,0,0.3)]">
      <div className="relative h-28 bg-flare-gradient">
        {cover && <img src={cover} alt="" className="h-full w-full object-cover" />}
        <div className="absolute inset-0 bg-gradient-to-t from-night-800 to-transparent" aria-hidden />
      </div>
      <div className="-mt-8 px-5 pb-5">
        <div className="relative w-fit">
          <Avatar glow size="lg" src={space.image_url} name={space.name} />
        </div>
        <div className="mt-3 flex items-center gap-2">
          <h2 className="truncate text-xl font-bold text-star">{space.name}</h2>
          {space.verification_status === "verified" && <MdVerified className="shrink-0 text-sky-500" aria-label="Verified" />}
        </div>
        <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-flare/20 bg-flare/10 px-2.5 py-1 font-semibold text-flare">
            {isFlash ? <FiZap /> : <FiUsers />} {isFlash ? "Flash" : space.category || "Community"}
          </span>
          <span className="text-mist">
            <b className="text-star">{compact(space.member_count || 0)}</b>{" "}
            {space.member_count === 1 ? "member" : "members"}
          </span>
        </div>
        {space.description && (
          <p className="mt-3 line-clamp-3 text-[15px] leading-[1.6] text-mist">{space.description}</p>
        )}
      </div>
    </article>
  );
}
