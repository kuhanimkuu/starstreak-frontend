import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import AppShell from "../AppShell";
import PostCard from "../components/PostCard";
import Comments from "../components/Comments";
import { Spinner } from "../components/Feed";
import { communityAdapter, feedAdapter, flashAdapter } from "../lib/adapters";

export const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function BackHeader({ title, subtitle, children }) {
  const navigate = useNavigate();
  return (
    <div className="sticky top-0 z-30 flex items-center gap-6 border-b border-line bg-night-900/85 px-4 py-2 backdrop-blur max-sm:top-[53px]">
      <button onClick={() => (window.history.length > 1 ? navigate(-1) : navigate("/home"))}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full hover:bg-night-700" aria-label="Back">
        <FiArrowLeft size={20} />
      </button>
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-xl font-extrabold">{title}</h1>
        {subtitle && <p className="truncate text-xs text-dust">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

/**
 * One post with its comments. `kind`: "feed" (/post/:id),
 * "community" (/communities/:communityId/post/:postId) or
 * "flash" (/flashes/:flashId/post/:postId).
 */
export default function PostPage({ kind = "feed" }) {
  const params = useParams();
  const id = kind === "feed" ? params.id : params.postId;
  const parentId = params.communityId || params.flashId;
  const adapter = useMemo(() => {
    if (kind === "community") return communityAdapter({ id: parentId });
    if (kind === "flash") return flashAdapter({ id: parentId });
    return feedAdapter;
  }, [kind, parentId]);
  const [post, setPost] = useState(undefined);

  useEffect(() => {
    let live = true;
    if (!UUID.test(id || "") || (kind !== "feed" && !UUID.test(parentId || ""))) {
      setPost(null);
      return;
    }
    setPost(undefined);
    adapter.fetchOne(id).then((p) => live && setPost(p)).catch(() => live && setPost(null));
    return () => { live = false; };
  }, [id, parentId, kind, adapter]);

  const back = kind === "community" ? `/communities/${parentId}` : kind === "flash" ? `/flashes/${parentId}` : "/home";

  return (
    <AppShell title="Post">
      <BackHeader title="Post" subtitle={kind === "feed" ? null : post?.community_name || null} />
      {post === undefined && <Spinner />}
      {post === null || post?.is_deleted ? (
        <div className="px-8 py-16 text-center">
          <p className="text-2xl font-extrabold">This post isn't available</p>
          <p className="mt-2 text-mist">It may have been deleted, or you don't have access to it.</p>
          <Link to={back} className="btn-ghost mt-6 !py-2.5 text-sm">Go back</Link>
        </div>
      ) : post && (
        <>
          <div className="px-3 py-3 sm:px-4">
            <PostCard post={post} detail adapter={adapter} showCommunity={kind === "feed"} />
          </div>
          <Comments post={post} adapter={adapter}
                    onCountChange={(d) => setPost((p) => ({ ...p, comment_count: Math.max(0, (p.comment_count || 0) + d) }))} />
        </>
      )}
    </AppShell>
  );
}
