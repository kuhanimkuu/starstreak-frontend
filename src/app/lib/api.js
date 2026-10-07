import { supabase } from "../../lib/supabase";

/**
 * Data access for the web app. Mirrors the phone app:
 *  - posts / comments are read through the *_public views (anonymous authors
 *    and other people's poll votes are masked there);
 *  - `users` is only ever read with PUBLIC_USER_COLUMNS, your own row via `me`;
 *  - likes, comments, deletes and shares go through the same edge functions.
 */

// Mirrors kPublicUserColumns in the app (lib/core/data/user_columns.dart).
export const PUBLIC_USER_COLUMNS =
  "id, firebase_uid, username, display_name, avatar_url, bio, course, year, " +
  "graduation_year, company, job_title, company_id, badge_visibility, badges, " +
  "post_count, follower_count, following_count, total_post_count, " +
  "is_email_verified, is_verified, is_suspended, is_deleted, deactivated_at, " +
  "account_privacy, created_at";

const ME_COLUMNS =
  "firebase_uid, display_name, username, avatar_url, anonymous_name, bio, " +
  "blocked_users, muted_users, saved_posts, is_verified, default_anonymous_mode, " +
  "follower_count, following_count";

export const PAGE_SIZE = 20;
const MAX_TEXT = 10000;
const MAX_COMMENT = 2000;
export const MAX_IMAGES = 4;
const MAX_IMAGE_BYTES = 15 * 1024 * 1024;
export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

/** Turn a Supabase / edge-function error into a sentence for the user. */
async function failure(error, fallback) {
  let msg = error?.message || fallback;
  try {
    const body = await error?.context?.json?.();
    if (body?.error) msg = body.error;
  } catch {
    /* not JSON */
  }
  return new Error(msg || fallback);
}

async function invoke(fn, body, fallback) {
  const { data, error } = await supabase.functions.invoke(fn, { body });
  if (error) throw await failure(error, fallback);
  return data;
}

// ── You ──────────────────────────────────────────────────────────────────────

export async function fetchMe() {
  const [{ data: me }, { data: hidden }, { data: follows }] = await Promise.all([
    supabase.from("me").select(ME_COLUMNS).maybeSingle(),
    supabase.from("user_hidden_posts").select("post_id").eq("kind", "not_interested"),
    supabase.auth.getUser().then(({ data: { user } }) =>
      user
        ? supabase.from("follows").select("following_id").eq("follower_id", user.id).limit(2000)
        : { data: [] },
    ),
  ]);
  return {
    me: me || null,
    hiddenPostIds: new Set((hidden || []).map((r) => r.post_id)),
    following: new Set((follows || []).map((r) => r.following_id)),
  };
}

// ── Posts ────────────────────────────────────────────────────────────────────

/** Feed page. `tab` is "foryou" or "following"; `before` is a created_at cursor. */
export async function fetchFeed({ tab, before, myId, following }) {
  let q = supabase
    .from("posts_public")
    .select("*")
    .eq("is_deleted", false)
    .eq("post_type", "feed");
  if (tab === "following") {
    const ids = [...(following || [])].slice(0, 500);
    if (myId) ids.push(myId);
    if (!ids.length) return [];
    q = q.in("author_id", ids);
  }
  if (before) q = q.lt("created_at", before);
  const { data, error } = await q.order("created_at", { ascending: false }).limit(PAGE_SIZE);
  if (error) throw await failure(error, "Couldn't load posts");
  return data || [];
}

export async function fetchPost(id) {
  const { data, error } = await supabase.from("posts_public").select("*").eq("id", id).maybeSingle();
  if (error) throw await failure(error, "Couldn't load this post");
  return data;
}

export async function fetchUserPosts(authorId, before) {
  let q = supabase
    .from("posts_public")
    .select("*")
    .eq("author_id", authorId)
    .eq("is_deleted", false)
    .is("community_id", null);
  if (before) q = q.lt("created_at", before);
  const { data, error } = await q.order("created_at", { ascending: false }).limit(PAGE_SIZE);
  if (error) throw await failure(error, "Couldn't load posts");
  return data || [];
}

export const toggleLike = (postId) =>
  invoke("post-toggle-like", { postId, action: "like" }, "Couldn't update the like");
export const toggleDislike = (postId) =>
  invoke("post-toggle-like", { postId, action: "dislike" }, "Couldn't update the dislike");
export const sharePost = (postId) => invoke("post-share", { postId }, "Couldn't share");
export const deletePost = (postId) => invoke("post-delete", { postId }, "Couldn't delete the post");

export async function voteOnPoll(postId, optionId) {
  const { data, error } = await supabase.rpc("vote_on_feed_poll", { p_post_id: postId, p_option_id: optionId });
  if (error) throw await failure(error, "Couldn't record your vote");
  return data;
}

export async function hidePost(postId, myId) {
  const { error } = await supabase
    .from("user_hidden_posts")
    .upsert({ user_id: myId, post_id: postId, kind: "not_interested" }, { onConflict: "user_id,post_id,kind" });
  if (error) throw await failure(error, "Couldn't hide the post");
}

const viewed = new Set();
/** One impression per post per page load (the app counts repeat views separately). */
export function recordView(postId, myId) {
  if (!myId || viewed.has(postId)) return;
  viewed.add(postId);
  supabase.from("post_views").insert({ post_id: postId, user_id: myId, source: "timeline" }).then(() => {});
}

async function uploadPostImage(file, folder) {
  if (!IMAGE_TYPES.includes(file.type)) throw new Error("Only JPEG, PNG, WebP or GIF images.");
  if (file.size > MAX_IMAGE_BYTES) throw new Error("Each image must be under 15 MB.");
  const ext = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif" }[file.type];
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("posts").upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw await failure(error, "Couldn't upload an image");
  return supabase.storage.from("posts").getPublicUrl(path).data.publicUrl;
}

/** Upload post images into one storage folder (validated first). */
export async function uploadPostImages(images = [], folder) {
  if (images.length > MAX_IMAGES) throw new Error(`Up to ${MAX_IMAGES} images.`);
  return Promise.all(images.map((f) => uploadPostImage(f, folder)));
}

/**
 * Create a feed post. Anonymous posts upload their images under anon/<random>
 * (a folder named after you would reveal you in the image link) and don't
 * record a poll creator.
 */
export async function createPost({ myId, content, images = [], poll, anonymous }) {
  const text = (content || "").trim();
  if (text.length > MAX_TEXT) throw new Error("Posts can be up to 10,000 characters.");
  if (images.length > MAX_IMAGES) throw new Error(`Up to ${MAX_IMAGES} images.`);
  if (!text && !images.length && !poll) throw new Error("Write something first.");

  const folder = anonymous ? `anon/${crypto.randomUUID()}` : `${myId}/post_${Date.now()}`;
  const mediaUrls = await uploadPostImages(images, folder);

  let pollData;
  if (poll) {
    const ts = Date.now();
    pollData = {
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

  const data = await invoke(
    "post-create",
    { content: text, isAnonymous: !!anonymous, ...(mediaUrls.length ? { mediaUrls } : {}), ...(pollData ? { poll: pollData } : {}) },
    "Couldn't publish your post",
  );
  const id = data?.post?.id || data?.postId;
  return id ? fetchPost(id) : null;
}

// ── Comments ─────────────────────────────────────────────────────────────────

export async function fetchComments(postId) {
  const { data, error } = await supabase
    .from("comments_public")
    .select("*")
    .eq("post_id", postId)
    .order("created_at", { ascending: true })
    .limit(500);
  if (error) throw await failure(error, "Couldn't load comments");
  return (data || []).filter((c) => !c.is_deleted);
}

export async function createComment({ postId, content, parentId, anonymous }) {
  const text = (content || "").trim();
  if (!text) throw new Error("Write a comment first.");
  if (text.length > MAX_COMMENT) throw new Error("Comments can be up to 2,000 characters.");
  const data = await invoke(
    "comment-create",
    { postId, content: text, isAnonymous: !!anonymous, ...(parentId ? { parentId } : {}) },
    "Couldn't post your comment",
  );
  return data?.comment || null;
}

export const toggleCommentLike = (commentId) => invoke("comment-toggle-like", { commentId }, "Couldn't update the like");
export const deleteComment = (commentId) => invoke("comment-delete", { commentId }, "Couldn't delete the comment");

// ── People ───────────────────────────────────────────────────────────────────

export async function fetchUserByUsername(username) {
  const { data, error } = await supabase
    .from("users")
    .select(PUBLIC_USER_COLUMNS)
    .ilike("username", username.replace(/[%_\\]/g, "\\$&"))
    .maybeSingle();
  if (error) throw await failure(error, "Couldn't load this profile");
  return data;
}

export async function fetchSuggestions(myId, exclude) {
  const { data } = await supabase
    .from("users")
    .select("firebase_uid, username, display_name, avatar_url, is_verified, follower_count")
    .eq("is_deleted", false)
    .not("username", "is", null)
    .order("follower_count", { ascending: false })
    .limit(15);
  return (data || []).filter((u) => u.firebase_uid !== myId && !exclude.has(u.firebase_uid)).slice(0, 4);
}

/** Follow (the follower counts are kept by a database trigger) + notify them. */
export async function follow(myId, theirId, myName) {
  const { error } = await supabase
    .from("follows")
    .upsert({ follower_id: myId, following_id: theirId }, { onConflict: "follower_id,following_id" });
  if (error) throw await failure(error, "Couldn't follow");
  supabase
    .rpc("create_notification", {
      p_user_id: theirId,
      p_type: "follow",
      p_title: "New Follower",
      p_body: `${myName || "Someone"} started following you`,
      p_data: { otherUserId: myId, screen: "profile" },
      p_from_user_id: myId,
    })
    .then(() => {});
}

export async function unfollow(myId, theirId) {
  const { error } = await supabase.from("follows").delete().eq("follower_id", myId).eq("following_id", theirId);
  if (error) throw await failure(error, "Couldn't unfollow");
}

export const blockUser = (userId) => invoke("user-block", { blockedUserId: userId }, "Couldn't block");
export const unblockUser = (userId) => invoke("user-unblock", { blockedUserId: userId }, "Couldn't unblock");

/** "blocked_by_me" | "blocked_me" | "none" */
export async function blockStatus(userId) {
  const { data } = await supabase.rpc("users_block_status", { other_id: userId });
  return data || "none";
}

// ── Explore / search ─────────────────────────────────────────────────────────

/** Escape LIKE wildcards so a search for "50%" means the text "50%". */
const likeTerm = (q) => `%${q.trim().replace(/[\%_]/g, "\$&")}%`;

export async function searchUsers(q) {
  if (!q.trim()) return [];
  const cols = "firebase_uid, username, display_name, avatar_url, bio, is_verified, follower_count";
  // Two plain queries rather than one .or() built from user input.
  const [byName, byHandle] = await Promise.all([
    supabase.from("users").select(cols).ilike("display_name", likeTerm(q)).eq("is_deleted", false).limit(20),
    supabase.from("users").select(cols).ilike("username", likeTerm(q)).eq("is_deleted", false).limit(20),
  ]);
  const seen = new Map();
  for (const u of [...(byHandle.data || []), ...(byName.data || [])]) {
    if (u.username && !seen.has(u.firebase_uid)) seen.set(u.firebase_uid, u);
  }
  return [...seen.values()].sort((a, b) => (b.follower_count || 0) - (a.follower_count || 0)).slice(0, 20);
}

export async function searchPosts(q, before) {
  if (!q.trim()) return [];
  let query = supabase
    .from("posts_public")
    .select("*")
    .eq("is_deleted", false)
    .eq("post_type", "feed")
    .ilike("content", likeTerm(q));
  if (before) query = query.lt("created_at", before);
  const { data, error } = await query.order("created_at", { ascending: false }).limit(PAGE_SIZE);
  if (error) throw await failure(error, "Search failed");
  return data || [];
}

/** Most-engaged feed posts of the last week, one page at a time. */
export async function fetchTrending(page = 0) {
  const since = new Date(Date.now() - 7 * 86400000).toISOString();
  const { data, error } = await supabase
    .from("posts_public")
    .select("*")
    .eq("is_deleted", false)
    .eq("post_type", "feed")
    .gte("created_at", since)
    .order("view_count", { ascending: false })
    .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);
  if (error) throw await failure(error, "Couldn't load trending posts");
  return data || [];
}

// ── Notifications ────────────────────────────────────────────────────────────

const NOTIF_COLUMNS = "id, type, title, body, message, data, action_url, from_user_id, from_user_name, from_user_avatar, is_read, created_at";

export async function fetchNotifications(myId, before) {
  let q = supabase.from("notifications").select(NOTIF_COLUMNS).eq("user_id", myId);
  if (before) q = q.lt("created_at", before);
  const { data, error } = await q.order("created_at", { ascending: false }).limit(30);
  if (error) throw await failure(error, "Couldn't load notifications");
  return data || [];
}

export async function unreadNotificationCount(myId) {
  const { count } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", myId)
    .eq("is_read", false);
  return count || 0;
}

export async function markNotificationRead(myId, id) {
  await supabase.from("notifications").update({ is_read: true, read_at: new Date().toISOString() }).eq("id", id).eq("user_id", myId);
}

export async function markAllNotificationsRead(myId) {
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq("user_id", myId)
    .eq("is_read", false);
  if (error) throw await failure(error, "Couldn't mark notifications read");
}

export async function deleteNotification(myId, id) {
  await supabase.from("notifications").delete().eq("id", id).eq("user_id", myId);
}

/** Public profile basics for a set of user ids (for links and avatars). */
export async function fetchUsersByIds(ids) {
  const list = [...new Set(ids.filter(Boolean))].slice(0, 200);
  if (!list.length) return {};
  const { data } = await supabase
    .from("users")
    .select("firebase_uid, username, display_name, avatar_url, is_verified")
    .in("firebase_uid", list);
  return Object.fromEntries((data || []).map((u) => [u.firebase_uid, u]));
}

// ── Communities ──────────────────────────────────────────────────────────────

const COMMUNITY_COLUMNS =
  "id, name, description, type, category, image_url, cover_image_url, member_count, members, admins, " +
  "moderators, banned_users, pending_join_requests, visibility, requires_approval, posting_permission, " +
  "allow_anonymous, allow_comments, is_archived, parent_community_id, created_at, creator_id, max_member_limit";

// Same list as the app (communities_list_screen.dart).
export const COMMUNITY_CATEGORIES = [
  "Technology", "Business", "Career & Professional", "Arts", "Sports",
  "Science", "Education", "Entertainment", "Lifestyle", "Other",
];

export async function fetchMyCommunities(myId) {
  const { data, error } = await supabase
    .from("communities")
    .select(COMMUNITY_COLUMNS)
    .contains("members", [myId])
    .eq("is_archived", false)
    .order("name")
    .limit(200);
  if (error) throw await failure(error, "Couldn't load your communities");
  return (data || []).filter((c) => !c.parent_community_id);
}

export async function discoverCommunities({ q = "", category = null } = {}) {
  let query = supabase
    .from("communities")
    .select(COMMUNITY_COLUMNS)
    .eq("is_archived", false)
    .is("parent_community_id", null);
  if (category) query = query.eq("category", category);
  if (q.trim()) query = query.ilike("name", likeTerm(q));
  const { data, error } = await query.order("member_count", { ascending: false }).limit(40);
  if (error) throw await failure(error, "Couldn't load communities");
  return data || [];
}

export async function fetchCommunity(id) {
  const { data, error } = await supabase.from("communities").select(COMMUNITY_COLUMNS).eq("id", id).maybeSingle();
  if (error) throw await failure(error, "Couldn't load this community");
  return data;
}

export async function fetchSubcommunities(id) {
  const { data } = await supabase
    .from("communities")
    .select("id, name, image_url, member_count")
    .eq("parent_community_id", id)
    .eq("is_archived", false)
    .order("member_count", { ascending: false })
    .limit(20);
  return data || [];
}

/** Your standing in a community, the way the app decides it (CommunityModel). */
export function communityStatus(c, myId) {
  if (!c || !myId) return { role: "none" };
  if ((c.banned_users || []).includes(myId)) return { role: "banned" };
  const staff = c.creator_id === myId || (c.admins || []).includes(myId);
  const mod = (c.moderators || []).includes(myId);
  const member = staff || mod || (c.members || []).includes(myId);
  const pending = (c.pending_join_requests || []).some((r) => (r?.userId || r?.user_id) === myId);
  const role = staff ? "staff" : mod ? "moderator" : member ? "member" : pending ? "pending" : "none";
  const perm = c.posting_permission || "everyone";
  const canPost = member && !c.is_archived && (perm === "adminsOnly" ? staff || mod : perm !== "readOnly");
  return { role, member, staff, canPost };
}

export const joinCommunity = (id) => invoke("community-join", { communityId: id }, "Couldn't join");
export const leaveCommunity = (id) => invoke("community-leave", { communityId: id }, "Couldn't leave");
export const requestToJoinCommunity = (id, displayName) =>
  invoke("community-request-join", { communityId: id, displayName }, "Couldn't send your request");

// ── Flashes ──────────────────────────────────────────────────────────────────

const FLASH_COLUMNS =
  "id, name, description, category, image_url, cover_image_url, member_count, members, admins, moderators, " +
  "banned_users, visibility, expires_at, flash_lifecycle_state, location_name, is_archived, parent_community_id, " +
  "created_at, creator_id, max_member_limit, allow_anonymous";

export async function fetchLiveFlashes() {
  const { data, error } = await supabase
    .from("flash_communities")
    .select(FLASH_COLUMNS)
    .eq("is_archived", false)
    .is("parent_community_id", null)
    .gt("expires_at", new Date().toISOString())
    .order("expires_at", { ascending: true })
    .limit(60);
  if (error) throw await failure(error, "Couldn't load Flashes");
  return data || [];
}

export async function fetchMyFlashes(myId) {
  const { data, error } = await supabase
    .from("flash_communities")
    .select(FLASH_COLUMNS)
    .contains("members", [myId])
    .eq("is_archived", false)
    .order("expires_at", { ascending: true })
    .limit(100);
  if (error) throw await failure(error, "Couldn't load your Flashes");
  return data || [];
}

export async function fetchFlash(id) {
  const { data, error } = await supabase.from("flash_communities").select(FLASH_COLUMNS).eq("id", id).maybeSingle();
  if (error) throw await failure(error, "Couldn't load this Flash");
  return data;
}

export function flashStatus(f, myId) {
  if (!f || !myId) return { role: "none" };
  if ((f.banned_users || []).includes(myId)) return { role: "banned" };
  const staff = f.creator_id === myId || (f.admins || []).includes(myId);
  const mod = (f.moderators || []).includes(myId);
  const member = staff || mod || (f.members || []).includes(myId);
  const live = !f.is_archived && (!f.expires_at || new Date(f.expires_at) > new Date());
  return { role: staff ? "staff" : mod ? "moderator" : member ? "member" : "none", member, staff, live, canPost: member && live };
}

export const joinFlash = (id) => invoke("flash-join", { communityId: id }, "Couldn't join");
export const leaveFlash = (id) => invoke("flash-leave", { communityId: id }, "Couldn't leave");

// ── Creating communities & Flashes ───────────────────────────────────────────

async function uploadCommunityImage(file, myId) {
  if (!file) return null;
  const types = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif" };
  if (!types[file.type]) throw new Error("Only JPEG, PNG, WebP or GIF images.");
  if (file.size > 10 * 1024 * 1024) throw new Error("Images must be under 10 MB.");
  const path = `${myId}/${crypto.randomUUID()}.${types[file.type]}`;
  const { error } = await supabase.storage.from("communities").upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw await failure(error, "Couldn't upload the image");
  return supabase.storage.from("communities").getPublicUrl(path).data.publicUrl;
}

export async function createCommunity(myId, f) {
  const name = f.name.trim();
  if (name.length < 3 || name.length > 100) throw new Error("Names are 3–100 characters.");
  if ((f.description || "").length > 2000) throw new Error("Descriptions are up to 2,000 characters.");
  const iconUrl = await uploadCommunityImage(f.icon, myId);
  const data = await invoke("community-create", {
    name,
    description: f.description?.trim() || null,
    // As the app: a private community is invite-only.
    type: f.isPrivate ? "private" : "public",
    visibility: f.isPrivate ? "inviteOnly" : "public",
    category: f.category || "Other",
    tags: [],
    ...(iconUrl ? { iconUrl } : {}),
    settings: {
      requiresApproval: !f.isPrivate && !!f.requiresApproval,
      postingPermission: f.postingPermission || "everyone",
      allowAnonymous: f.allowAnonymous !== false,
    },
  }, "Couldn't create the community");
  return data?.community?.id;
}

export const FLASH_DURATIONS = [
  { label: "1 hour", hours: 1 }, { label: "3 hours", hours: 3 }, { label: "6 hours", hours: 6 },
  { label: "12 hours", hours: 12 }, { label: "1 day", hours: 24 }, { label: "3 days", hours: 72 }, { label: "1 week", hours: 168 },
];

export async function createFlash(myId, f) {
  const name = f.name.trim();
  if (name.length < 3 || name.length > 100) throw new Error("Names are 3–100 characters.");
  const imageUrl = await uploadCommunityImage(f.icon, myId);
  const limit = f.maxMembers ? Number(f.maxMembers) : null;
  if (limit !== null && (!Number.isInteger(limit) || limit < 2 || limit > 100000)) throw new Error("Member limit must be between 2 and 100,000.");
  const data = await invoke("flash-create", {
    name,
    description: f.description?.trim() || null,
    type: "public",
    trigger: "event",
    durationSeconds: f.hours * 3600,
    ...(imageUrl ? { imageUrl } : {}),
    category: f.category || "General",
    tags: [],
    visibility: limit ? "limited" : "public",
    ...(f.locationName?.trim() ? { locationName: f.locationName.trim().slice(0, 100) } : {}),
    ...(limit ? { maxMemberLimit: limit } : {}),
  }, "Couldn't start the Flash");
  return data?.community?.id;
}

// ── Saved posts (users.saved_posts, your own row — as the app) ───────────────

export async function setSavedPosts(myId, ids) {
  const { error } = await supabase.from("users").update({ saved_posts: ids }).eq("firebase_uid", myId);
  if (error) throw await failure(error, "Couldn't update saved posts");
}

export async function fetchPostsByIds(ids) {
  if (!ids.length) return [];
  const { data, error } = await supabase.from("posts_public").select("*").in("id", ids.slice(-200)).eq("is_deleted", false);
  if (error) throw await failure(error, "Couldn't load saved posts");
  const order = new Map(ids.map((id, i) => [id, i]));
  return (data || []).sort((a, b) => order.get(b.id) - order.get(a.id)); // newest saved first
}

// ── Community management (admins) ────────────────────────────────────────────

export async function fetchCommunityMembers(communityId) {
  const { data, error } = await supabase
    .from("community_members")
    .select("user_id, role, joined_at, is_banned")
    .eq("community_id", communityId)
    .order("joined_at", { ascending: true })
    .limit(1000);
  if (error) throw await failure(error, "Couldn't load members");
  const people = await fetchUsersByIds((data || []).map((m) => m.user_id));
  return (data || []).map((m) => ({ ...m, user: people[m.user_id] || null }));
}

function notifyCommunity(userId, communityId, title, body, type) {
  supabase.rpc("create_notification", {
    p_user_id: userId, p_type: type, p_title: title, p_body: body,
    p_data: { communityId, screen: "community" },
  }).then(() => {});
}

/** Approve a join request (same steps as the app's approveJoinRequest). */
export async function approveJoinRequest(c, userId) {
  const { data: row, error } = await supabase
    .from("communities").select("pending_join_requests, members, member_count").eq("id", c.id).single();
  if (error) throw await failure(error, "Couldn't approve");
  const pending = (row.pending_join_requests || []).filter((r) => (r?.userId || r?.user_id) !== userId);
  const members = row.members || [];
  const already = members.includes(userId);
  const { error: e2 } = await supabase.from("communities").update({
    pending_join_requests: pending,
    members: already ? members : [...members, userId],
    member_count: already ? row.member_count : (row.member_count || 0) + 1,
  }).eq("id", c.id);
  if (e2) throw await failure(e2, "Couldn't approve");
  await supabase.from("community_members").upsert({ community_id: c.id, user_id: userId, role: "member" }, { onConflict: "community_id,user_id" });
  notifyCommunity(userId, c.id, `Approved: ${c.name}`, `Your request to join ${c.name} was approved`, "communityJoinApproved");
}

export async function rejectJoinRequest(c, userId) {
  const { data: row, error } = await supabase.from("communities").select("pending_join_requests").eq("id", c.id).single();
  if (error) throw await failure(error, "Couldn't decline");
  const pending = (row.pending_join_requests || []).filter((r) => (r?.userId || r?.user_id) !== userId);
  const { error: e2 } = await supabase.from("communities").update({ pending_join_requests: pending }).eq("id", c.id);
  if (e2) throw await failure(e2, "Couldn't decline");
  notifyCommunity(userId, c.id, "Request declined", "Your request to join the community was declined", "communityJoinRejected");
}

export const setModerator = (communityId, userId, on) =>
  invoke("community-update-role", { communityId, userId, action: on ? "add_moderator" : "remove_moderator" }, "Couldn't change the role");

export async function banFromCommunity(communityId, userId) {
  const { error } = await supabase.rpc("ban_community_member", { p_community_id: communityId, p_target_user_id: userId });
  if (error) throw await failure(error, "Couldn't ban");
}

export async function unbanFromCommunity(communityId, userId) {
  const { error } = await supabase.rpc("unban_community_member", { p_community_id: communityId, p_target_user_id: userId });
  if (error) throw await failure(error, "Couldn't unban");
}

// ── Reporting ────────────────────────────────────────────────────────────────

export const REPORT_REASONS = [
  ["spam", "Spam or scam"],
  ["harassment", "Harassment or bullying"],
  ["hate_speech", "Hate speech"],
  ["violence", "Violence or threats"],
  ["sexual_content", "Nudity or sexual content"],
  ["self_harm", "Self-harm or suicide"],
  ["misinformation", "False information"],
  ["impersonation", "Pretending to be someone else"],
  ["other", "Something else"],
];

/**
 * Report a post, comment or person. The database fills in who's being
 * reported from the item itself (so anonymous posts can be reported without
 * anyone seeing their author) and skips repeat reports.
 */
export async function report({ myId, type, id, communityId = null, reason, details = "" }) {
  const { error } = await supabase.from("content_reports").insert({
    community_id: communityId || "00000000-0000-0000-0000-000000000000",
    reporter_id: myId,
    content_type: type,
    content_id: id,
    content_author_id: "", // set by the database
    reason,
    detailed_description: details.trim().slice(0, 1000) || null,
  });
  if (error) throw await failure(error, "Couldn't send your report");
}
