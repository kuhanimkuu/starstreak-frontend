import { supabase } from "../../lib/supabase";
import {
  createComment, deleteComment, deletePost, fetchComments, fetchPost, sharePost,
  toggleCommentLike, toggleDislike, toggleLike, voteOnPoll, uploadPostImages,
} from "./api";

/**
 * Feed posts, community posts and Flash posts live in different tables with
 * different column names and actions. An adapter gives PostCard / Poll /
 * Comments / Composer one interface for each, and maps rows to the feed post
 * shape: { id, content, media_urls, likes, dislikes, poll, comment_count,
 *          view_count, author_*, is_anonymous, is_mine, created_at, … }.
 */

async function fail(error, fallback) {
  let msg = error?.message || fallback;
  try {
    const body = await error?.context?.json?.();
    if (body?.error) msg = body.error;
  } catch { /* not JSON */ }
  return new Error(msg || fallback);
}

async function rpc(fn, params, fallback) {
  const { data, error } = await supabase.rpc(fn, params);
  if (error) throw await fail(error, fallback);
  return data;
}

function pollFromInput(poll, myId, anonymous) {
  if (!poll) return null;
  const ts = Date.now();
  return {
    question: poll.question.trim(),
    options: poll.options.map((t, i) => ({ id: `${ts}_${i}`, text: t.trim(), votes: 0, voters: [] })),
    createdAt: ts,
    ...(anonymous ? {} : { createdBy: myId }),
    totalVotes: 0,
    votedUsers: [],
    allowMultipleVotes: false,
    showResultsBeforeVoting: false,
    ...(poll.expiresAt ? { expiresAt: poll.expiresAt.toISOString() } : {}),
  };
}

function authorFields(me, anonymous) {
  return anonymous
    ? { author_name: me?.anonymous_name || "Anonymous", author_avatar_url: null }
    : { author_name: me?.display_name || "Starstreak user", author_avatar_url: me?.avatar_url || null };
}

// ── Feed ─────────────────────────────────────────────────────────────────────
export const feedAdapter = {
  kind: "feed",
  path: (p) => `/post/${p.id}`,
  shareUrl: (p) => `${window.location.origin}/p/${p.id}`,
  toPost: (row) => row,
  like: (p) => toggleLike(p.id),
  dislike: (p) => toggleDislike(p.id),
  vote: (p, optionId) => voteOnPoll(p.id, optionId),
  remove: (p) => deletePost(p.id),
  share: (p) => sharePost(p.id),
  canHide: true,
  comments: {
    anonymous: true,
    fetch: (p) => fetchComments(p.id),
    create: (p, { content, parentId, anonymous }) => createComment({ postId: p.id, content, parentId, anonymous }),
    like: (c) => toggleCommentLike(c.id),
    remove: (c) => deleteComment(c.id),
  },
  fetchOne: (id) => fetchPost(id),
};

// ── Community posts (community_discussions) ──────────────────────────────────
function communityRowToPost(row) {
  const docs = (row.document_urls || []).map((u) => `doc::${decodeURIComponent(u.split("/").pop()?.split("?")[0] || "Document")}::${u}`);
  return {
    ...row,
    media_urls: [...(row.image_urls || []), ...(row.video_urls || []), ...docs],
    likes: row.liked_by || [],
    dislikes: row.disliked_by || [],
    poll: row.poll_data || null,
    is_deleted: false,
    share_count: 0,
  };
}

export function communityAdapter(community) {
  const cid = community?.id;
  return {
    kind: "community",
    path: (p) => `/communities/${p.community_id || cid}/post/${p.id}`,
    shareUrl: (p) => `${window.location.origin}/communities/${p.community_id || cid}/post/${p.id}`,
    toPost: communityRowToPost,
    like: (p, myId) => rpc("discussion_toggle_like", { p_post_id: p.id, p_user_id: myId }, "Couldn't update the like"),
    dislike: (p, myId) => rpc("discussion_toggle_dislike", { p_post_id: p.id, p_user_id: myId }, "Couldn't update the dislike"),
    async vote(p, optionId, myId) {
      await rpc("vote_on_post_poll", { p_post_id: p.id, p_option_id: optionId, p_user_id: myId }, "Couldn't record your vote");
      const { data } = await supabase.from("community_discussions_public").select("poll_data").eq("id", p.id).maybeSingle();
      return data?.poll_data || null;
    },
    async remove(p) {
      const { error } = await supabase.from("community_discussions").delete().eq("id", p.id);
      if (error) throw await fail(error, "Couldn't delete the post");
    },
    share: null,
    canHide: false,
    allowAnonymousPosts: community?.allow_anonymous !== false,
    comments: {
      anonymous: false, // the app posts community comments under your name
      async fetch(p) {
        const { data, error } = await supabase
          .from("community_discussion_comments_public")
          .select("*")
          .eq("post_id", p.id)
          .order("created_at", { ascending: true })
          .limit(500);
        if (error) throw await fail(error, "Couldn't load comments");
        return data || [];
      },
      async create(p, { content, parentId, parent, me, myId }) {
        const text = content.trim();
        if (!text) throw new Error("Write a comment first.");
        if (text.length > 2000) throw new Error("Comments can be up to 2,000 characters.");
        const { error } = await supabase.from("community_discussion_comments").insert({
          post_id: p.id,
          community_id: p.community_id || cid,
          content: text,
          author_id: myId,
          ...authorFields(me, false),
          is_anonymous: false,
          likes: [],
          parent_comment_id: parentId || null,
          reply_to_author_name: parent ? (parent.is_anonymous ? "Anonymous" : parent.author_name) : null,
          reply_to_content: parent ? (parent.content || "").slice(0, 200) : null,
        });
        if (error) throw await fail(error, "Couldn't post your comment");
        supabase.rpc("discussion_increment_comment_count", { p_post_id: p.id }).then(() => {});
      },
      like: (c) => rpc("toggle_discussion_comment_like", { p_comment_id: c.id }, "Couldn't update the like"),
      async remove(c) {
        const { error } = await supabase.from("community_discussion_comments").delete().eq("id", c.id);
        if (error) throw await fail(error, "Couldn't delete the comment");
      },
    },
    async fetchOne(id) {
      const { data, error } = await supabase.from("community_discussions_public").select("*").eq("id", id).maybeSingle();
      if (error) throw await fail(error, "Couldn't load this post");
      return data ? communityRowToPost(data) : null;
    },
    async fetchPage(before) {
      let q = supabase.from("community_discussions_public").select("*").eq("community_id", cid);
      if (before) q = q.lt("created_at", before);
      const { data, error } = await q.order("created_at", { ascending: false }).limit(20);
      if (error) throw await fail(error, "Couldn't load posts");
      return (data || []).map(communityRowToPost);
    },
    async create({ me, myId, content, images, poll, anonymous }) {
      const folder = anonymous ? `anon/${crypto.randomUUID()}` : `${myId}/discussion_${Date.now()}`;
      const imageUrls = await uploadPostImages(images, folder);
      const { data, error } = await supabase
        .from("community_discussions")
        .insert({
          community_id: cid,
          community_name: community?.name || null,
          author_id: myId,
          ...authorFields(me, anonymous),
          content: (content || "").trim(),
          image_urls: imageUrls,
          document_urls: [],
          video_urls: [],
          is_anonymous: !!anonymous,
          poll_data: pollFromInput(poll, myId, anonymous),
        })
        .select("id")
        .single();
      if (error) throw await fail(error, "Couldn't publish your post");
      return this.fetchOne(data.id);
    },
  };
}

// ── Flash posts (flash_discussions) ──────────────────────────────────────────
export function flashAdapter(flash) {
  const fid = flash?.id;
  const toPost = (row) => ({ ...row, poll: row.poll || null, share_count: row.share_count || 0 });
  return {
    kind: "flash",
    path: (p) => `/flashes/${p.community_id || fid}/post/${p.id}`,
    shareUrl: (p) => `${window.location.origin}/flashes/${p.community_id || fid}/post/${p.id}`,
    toPost,
    like: (p, myId) => rpc("toggle_flash_discussion_like", { p_post_id: p.id, p_user_id: myId }, "Couldn't update the like"),
    dislike: (p, myId) => rpc("toggle_flash_discussion_dislike", { p_post_id: p.id, p_user_id: myId }, "Couldn't update the dislike"),
    vote: (p, optionId) => voteOnPoll(p.id, optionId),
    async remove(p) {
      const { error } = await supabase.from("flash_discussions").delete().eq("id", p.id);
      if (error) throw await fail(error, "Couldn't delete the post");
    },
    share: null,
    canHide: false,
    allowAnonymousPosts: flash?.allow_anonymous !== false,
    comments: {
      anonymous: false,
      async fetch(p) {
        const { data, error } = await supabase
          .from("flash_discussion_comments")
          .select("id, discussion_id, parent_comment_id, author_id, author_name, author_avatar_url, content, likes, created_at, is_deleted")
          .eq("discussion_id", p.id)
          .eq("is_deleted", false)
          .order("created_at", { ascending: true })
          .limit(500);
        if (error) throw await fail(error, "Couldn't load comments");
        return (data || []).map((c) => ({ ...c, is_mine: undefined }));
      },
      async create(p, { content, parentId, me, myId }) {
        const text = content.trim();
        if (!text) throw new Error("Write a comment first.");
        if (text.length > 2000) throw new Error("Comments can be up to 2,000 characters.");
        const { error } = await supabase.from("flash_discussion_comments").insert({
          discussion_id: p.id,
          author_id: myId,
          ...authorFields(me, false),
          content: text,
          likes: [],
          parent_comment_id: parentId || null,
        });
        if (error) throw await fail(error, "Couldn't post your comment");
        supabase.rpc("increment_flash_discussion_comment_count", { p_post_id: p.id }).then(() => {});
      },
      like: null, // the app has no Flash comment likes
      async remove(c) {
        const { error } = await supabase.from("flash_discussion_comments").delete().eq("id", c.id);
        if (error) throw await fail(error, "Couldn't delete the comment");
      },
    },
    async fetchOne(id) {
      const { data, error } = await supabase.from("flash_discussions_public").select("*").eq("id", id).maybeSingle();
      if (error) throw await fail(error, "Couldn't load this post");
      return data && !data.is_deleted ? toPost(data) : null;
    },
    async fetchPage(before) {
      let q = supabase.from("flash_discussions_public").select("*").eq("community_id", fid).eq("is_deleted", false);
      if (before) q = q.lt("created_at", before);
      const { data, error } = await q.order("created_at", { ascending: false }).limit(20);
      if (error) throw await fail(error, "Couldn't load posts");
      return (data || []).map(toPost);
    },
    async create({ me, myId, content, images, poll, anonymous }) {
      const folder = anonymous ? `anon/${crypto.randomUUID()}` : `${myId}/flash_${Date.now()}`;
      const mediaUrls = await uploadPostImages(images, folder);
      const { data, error } = await supabase
        .from("flash_discussions")
        .insert({
          community_id: fid,
          author_id: myId,
          ...authorFields(me, anonymous),
          author_username: anonymous ? null : me?.username || null,
          content: (content || "").trim(),
          is_anonymous: !!anonymous,
          media_urls: mediaUrls,
          poll: pollFromInput(poll, myId, anonymous),
        })
        .select("id")
        .single();
      if (error) throw await fail(error, "Couldn't publish your post");
      return this.fetchOne(data.id);
    },
  };
}
