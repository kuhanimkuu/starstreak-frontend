import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { FiFileText, FiHeart, FiEye, FiShare2, FiTrash2, FiImage, FiAlertTriangle } from "react-icons/fi";

const PAGE_SIZE = 20;

export default function MyPosts() {
  const { user } = useAuth();

  const [posts, setPosts]       = useState([]);
  const [total, setTotal]       = useState(0);
  const [page, setPage]         = useState(0);
  const [loading, setLoading]   = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [confirm, setConfirm]   = useState(null); // post to confirm delete

  useEffect(() => {
    if (!user) return;
    loadPosts();
  }, [user, page]);

  async function loadPosts() {
    setLoading(true);
    const [postsRes, countRes] = await Promise.all([
      supabase.rpc("get_website_user_posts", {
        p_firebase_uid: user.id,
        p_limit: PAGE_SIZE,
        p_offset: page * PAGE_SIZE,
      }),
      supabase.rpc("get_website_post_count", { p_firebase_uid: user.id }),
    ]);
    setPosts(postsRes.data || []);
    setTotal(Number(countRes.data) || 0);
    setLoading(false);
  }

  async function handleDelete(post) {
    setDeleting(post.id);
    const { data: ok } = await supabase.rpc("delete_website_post", {
      p_firebase_uid: user.id,
      p_post_id: post.id,
    });
    if (ok) {
      setPosts(prev => prev.filter(p => p.id !== post.id));
      setTotal(prev => prev - 1);
    }
    setDeleting(null);
    setConfirm(null);
  }

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="h-display text-3xl md:text-4xl text-star">My Posts</h1>
        <p className="text-dust text-sm mt-1">
          {total > 0 ? `${total.toLocaleString()} post${total !== 1 ? "s" : ""}` : "No posts yet"}
        </p>
      </div>

      {/* Posts list */}
      <div className="bg-night-800 rounded-2xl border border-line overflow-hidden">
        {loading ? (
          <div className="divide-y divide-line">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="p-5 animate-pulse flex gap-4">
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-night-600 rounded w-3/4" />
                  <div className="h-4 bg-night-700 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 text-dust">
            <FiFileText className="text-4xl mx-auto mb-3 opacity-30" />
            <p className="font-medium">No posts yet</p>
            <p className="text-sm mt-1">Start sharing on the Starstreak app.</p>
          </div>
        ) : (
          <div className="divide-y divide-line">
            {posts.map(post => (
              <div key={post.id} className="p-5 flex items-start gap-4 hover:bg-night-850 transition-colors group">

                {/* Media indicator */}
                {post.media_urls?.length > 0 && (
                  <div className="w-12 h-12 rounded-xl bg-night-700 flex items-center justify-center flex-shrink-0">
                    <FiImage className="text-dust text-lg" />
                  </div>
                )}

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-star line-clamp-3">
                    {post.content || <span className="italic text-dust">Media post</span>}
                  </p>
                  <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-dust">
                    <span className="flex items-center gap-1">
                      <FiHeart /> {(post.likes?.length ?? 0).toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <FiEye /> {(post.view_count ?? 0).toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <FiShare2 /> {(post.share_count ?? 0).toLocaleString()}
                    </span>
                    <span>{new Date(post.created_at).toLocaleDateString("en", { year: "numeric", month: "short", day: "numeric" })}</span>
                    {post.media_urls?.length > 0 && (
                      <span className="px-2 py-0.5 bg-flare/10 text-flare rounded-full">
                        {post.media_urls.length} media
                      </span>
                    )}
                  </div>
                </div>

                {/* Delete */}
                <button
                  onClick={() => setConfirm(post)}
                  className="flex-shrink-0 p-2 rounded-lg text-dust hover:text-red-400 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
                  title="Delete post"
                >
                  <FiTrash2 />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-5 py-4 border-t border-line flex items-center justify-between">
            <span className="text-sm text-dust">
              Page {page + 1} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                disabled={page === 0}
                onClick={() => setPage(p => p - 1)}
                className="px-3 py-1.5 text-sm border border-line rounded-lg disabled:opacity-40 hover:border-flare/50 hover:text-star transition-colors"
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages - 1}
                onClick={() => setPage(p => p + 1)}
                className="px-3 py-1.5 text-sm border border-line rounded-lg disabled:opacity-40 hover:border-flare/50 hover:text-star transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Confirm delete modal */}
      {confirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-night-950/70 backdrop-blur-sm px-4">
          <div className="bg-night-800 rounded-2xl p-6 max-w-md w-full shadow-night border border-line">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-red-500/15 flex items-center justify-center flex-shrink-0">
                <FiAlertTriangle className="text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-star">Delete post?</h3>
            </div>
            <p className="text-mist text-sm mb-2">
              This will permanently remove this post from Starstreak. This cannot be undone.
            </p>
            {confirm.content && (
              <p className="text-xs text-dust bg-night-850 rounded-lg p-3 line-clamp-3 mb-4">
                "{confirm.content}"
              </p>
            )}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirm(null)}
                className="px-4 py-2 border border-line rounded-xl text-sm font-medium hover:bg-night-850"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirm)}
                disabled={deleting === confirm.id}
                className="px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 disabled:opacity-50"
              >
                {deleting === confirm.id ? "Deleting…" : "Yes, delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
