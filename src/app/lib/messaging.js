import { supabase } from "../../lib/supabase";
import { decryptBackup, decryptMessageRow, encryptForBoth, importPrivateKey, publicPemFor } from "./e2e";

/**
 * Direct messages, matching the phone app (supabase_messages_repository.dart):
 * 1-to-1 text is end-to-end encrypted for every device of both people;
 * group chats and media are not (same as the app).
 */

const MESSAGE_COLUMNS =
  "id, conversation_id, sender_id, sender_name, sender_avatar_url, receiver_id, content, message_type, " +
  "media_url, thumbnail_url, file_name, file_size, duration, mime_type, is_read, is_delivered, is_encrypted, " +
  "is_edited, encrypted_key, sender_encrypted_key, device_encrypted_keys, reply_to_message_id, " +
  "reply_to_sender_name, reply_to_content, reply_to_type, shared_post_id, shared_post_data, " +
  "external_content_type, external_content_url, gif_url, sticker_url, deleted_for, created_at";

async function fail(error, fallback) {
  let msg = error?.message || fallback;
  try {
    const body = await error?.context?.json?.();
    if (body?.error) msg = body.error;
  } catch { /* not JSON */ }
  return new Error(msg || fallback);
}

// ── Your encryption key on this browser ──────────────────────────────────────

const DEVICE_KEY = "ss_e2e_web_device";

/** A stable id for this browser, registered as one of your devices. */
export function webDeviceId() {
  try {
    let id = localStorage.getItem(DEVICE_KEY);
    if (!id) {
      const bytes = crypto.getRandomValues(new Uint8Array(16));
      id = `web-${[...bytes].map((b) => b.toString(16).padStart(2, "0")).join("")}`;
      localStorage.setItem(DEVICE_KEY, id);
    }
    return id;
  } catch {
    return "web-session"; // storage blocked: still works, just not remembered
  }
}

/**
 * Unlock encrypted messages in this browser: restore the private key from
 * your owner-only backup (the same one the phone app restores from) and
 * register this browser so new messages are encrypted for it too.
 * Returns { state: "ready", privateKey, deviceId } | { state: "no-backup" } | { state: "error", message }.
 */
export async function unlockMessages(myId) {
  try {
    const { data: row, error } = await supabase
      .from("user_key_backups")
      .select("encrypted_private_key, encrypted_private_key_salt")
      .eq("user_id", myId)
      .maybeSingle();
    if (error) throw error;
    if (!row?.encrypted_private_key) return { state: "no-backup" };

    const pem = await decryptBackup(myId, row.encrypted_private_key, row.encrypted_private_key_salt);
    const { key, modulus } = await importPrivateKey(pem);

    // Register this browser with the matching public key (never replace the
    // account's main key — that belongs to the phone).
    const { data: u } = await supabase.from("users").select("public_key").eq("firebase_uid", myId).maybeSingle();
    let publicPem = publicPemFor(modulus);
    try {
      if (u?.public_key && JSON.parse(atob(u.public_key)).modulus === String(modulus)) publicPem = u.public_key;
    } catch { /* keep the derived one */ }
    const deviceId = webDeviceId();
    await supabase.from("user_device_keys").upsert(
      { user_id: myId, device_id: deviceId, public_key: publicPem, last_seen_at: new Date().toISOString() },
      { onConflict: "user_id,device_id" },
    );
    return { state: "ready", privateKey: key, deviceId };
  } catch (e) {
    return { state: "error", message: e?.message || "Couldn't unlock encrypted messages" };
  }
}

async function deviceKeysFor(userId) {
  const { data } = await supabase.from("user_device_keys").select("device_id, public_key").eq("user_id", userId);
  const keys = Object.fromEntries((data || []).filter((r) => r.public_key).map((r) => [r.device_id, r.public_key]));
  if (Object.keys(keys).length) return keys;
  const { data: u } = await supabase.from("users").select("public_key").eq("firebase_uid", userId).maybeSingle();
  return u?.public_key ? { legacy: u.public_key } : {};
}

// ── Conversations ────────────────────────────────────────────────────────────

export async function fetchConversations(myId, keys) {
  const { data, error } = await supabase.rpc("get_user_conversations", { p_user_id: myId, p_limit: 50, p_offset: 0 });
  if (error) throw await fail(error, "Couldn't load your chats");
  return Promise.all((data || []).map(async (c) => {
    let preview = c.last_message_content || "";
    if (c.last_message_is_encrypted) {
      preview = await decryptMessageRow({
        is_encrypted: true, content: preview, sender_id: c.last_message_sender_id,
        encrypted_key: c.last_message_encrypted_key, sender_encrypted_key: c.last_message_sender_encrypted_key,
        device_encrypted_keys: c.last_message_device_encrypted_keys,
      }, { ...keys, myId }).catch(() => "🔒 Encrypted message");
    }
    return { ...c, preview };
  }));
}

export async function startConversation(me, other) {
  const { data, error } = await supabase.rpc("create_or_get_conversation", {
    p_current_user_id: me.firebase_uid,
    p_other_user_id: other.firebase_uid,
    p_current_display_name: me.display_name || "User",
    p_current_avatar_url: me.avatar_url || null,
    p_other_display_name: other.display_name || "User",
    p_other_avatar_url: other.avatar_url || null,
  });
  if (error) throw await fail(error, "Couldn't start the chat");
  return String(data);
}

export async function fetchConversationInfo(conversationId, myId) {
  const [{ data: conv }, { data: parts }] = await Promise.all([
    supabase.from("conversations").select("id, is_group_chat, group_name, group_avatar").eq("id", conversationId).maybeSingle(),
    supabase.from("conversation_participants").select("user_id, display_name, avatar_url, is_muted, is_pinned").eq("conversation_id", conversationId),
  ]);
  if (!conv || !(parts || []).some((p) => p.user_id === myId)) return null;
  const others = (parts || []).filter((p) => p.user_id !== myId);
  const ids = others.map((p) => p.user_id);
  const { data: users } = ids.length
    ? await supabase.from("users").select("firebase_uid, username, display_name, avatar_url, is_verified, last_active").in("firebase_uid", ids)
    : { data: [] };
  const byId = Object.fromEntries((users || []).map((u) => [u.firebase_uid, u]));
  return {
    ...conv,
    me: (parts || []).find((p) => p.user_id === myId),
    others: others.map((p) => ({ ...p, ...(byId[p.user_id] || {}) })),
  };
}

export const deleteConversationForMe = (id) =>
  supabase.rpc("delete_conversation_for_me", { p_conversation_id: id }).then(({ error }) => { if (error) throw error; });
export const deleteConversationForEveryone = (id) =>
  supabase.rpc("delete_conversation_for_everyone", { p_conversation_id: id }).then(({ error }) => { if (error) throw error; });

export async function setConversationFlag(conversationId, myId, flag, value) {
  const { error } = await supabase
    .from("conversation_participants")
    .update({ [flag]: value })
    .eq("conversation_id", conversationId)
    .eq("user_id", myId);
  if (error) throw await fail(error, "Couldn't update the chat");
}

// ── Messages ─────────────────────────────────────────────────────────────────

export async function decryptRows(rows, keys, myId) {
  return Promise.all(rows.map(async (r) => ({ ...r, text: await decryptMessageRow(r, { ...keys, myId }) })));
}

export async function fetchMessages(conversationId, myId, keys, before) {
  let q = supabase.from("messages").select(MESSAGE_COLUMNS).eq("conversation_id", conversationId);
  if (before) q = q.lt("created_at", before);
  const { data, error } = await q.order("created_at", { ascending: false }).limit(50);
  if (error) throw await fail(error, "Couldn't load messages");
  const visible = (data || []).filter((m) => !(m.deleted_for || []).includes(myId)).reverse();
  return decryptRows(visible, keys, myId);
}

export async function fetchMessage(id, myId, keys) {
  const { data } = await supabase.from("messages").select(MESSAGE_COLUMNS).eq("id", id).maybeSingle();
  if (!data || (data.deleted_for || []).includes(myId)) return null;
  return (await decryptRows([data], keys, myId))[0];
}

export async function fetchReactions(messageIds) {
  if (!messageIds.length) return {};
  const { data } = await supabase.from("message_reactions").select("message_id, user_id, emoji").in("message_id", messageIds);
  const out = {};
  for (const r of data || []) ((out[r.message_id] ||= {})[r.emoji] ||= []).push(r.user_id);
  return out;
}

/** One reaction per person per message (as in the app); same emoji again removes it. */
export async function react(messageId, myId, emoji, current) {
  await supabase.from("message_reactions").delete().eq("message_id", messageId).eq("user_id", myId);
  if (current !== emoji) {
    const { error } = await supabase.from("message_reactions").insert({ message_id: messageId, user_id: myId, emoji });
    if (error) throw await fail(error, "Couldn't react");
  }
}

export async function deleteMessageForMe(message, myId) {
  const deletedFor = [...new Set([...(message.deleted_for || []), myId])];
  const { error } = await supabase.from("messages").update({ deleted_for: deletedFor }).eq("id", message.id);
  if (error) throw await fail(error, "Couldn't delete");
}

export async function deleteMessageForEveryone(message) {
  await supabase.from("message_reactions").delete().eq("message_id", message.id);
  const { error } = await supabase.from("messages").delete().eq("id", message.id);
  if (error) throw await fail(error, "Couldn't delete");
}

export async function markRead(conversationId, myId) {
  await supabase.rpc("mark_messages_read", { conv_id: conversationId, reader_id: myId });
  await supabase.from("conversations").update({ last_message_is_read: true }).eq("id", conversationId).neq("last_message_sender_id", myId);
  await supabase.from("messages").update({ is_delivered: true }).eq("conversation_id", conversationId).neq("sender_id", myId).eq("is_delivered", false);
}

const PREVIEW = { image: "📷 Photo", video: "🎥 Video", audio: "🎵 Audio", voice: "🎤 Voice message", document: "📄 Document", file: "📎 File", gif: "🎬 GIF", sticker: "🎨 Sticker" };

async function uploadChatImage(file, myId, conversationId) {
  const types = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif" };
  if (!types[file.type]) throw new Error("Only JPEG, PNG, WebP or GIF images.");
  if (file.size > 25 * 1024 * 1024) throw new Error("Images must be under 25 MB.");
  const path = `${myId}/${conversationId}/images/${crypto.randomUUID()}.${types[file.type]}`;
  const { error } = await supabase.storage.from("messages").upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw await fail(error, "Couldn't upload the image");
  return supabase.storage.from("messages").getPublicUrl(path).data.publicUrl;
}

/**
 * Send a message. 1-to-1 text is encrypted (and refused if the other person
 * has no key yet — never sent in the clear, matching the app).
 */
export async function sendMessage({ conversation, me, myId, text = "", image = null, replyTo = null }) {
  const other = conversation.is_group_chat ? null : conversation.others[0];
  if (other) {
    const { data: status } = await supabase.rpc("users_block_status", { other_id: other.user_id });
    if (status && status !== "none") throw new Error("Messaging is unavailable between you and this person.");
  }

  let type = "text";
  let content = text.trim();
  let mediaUrl = null;
  if (image) {
    mediaUrl = await uploadChatImage(image, myId, conversation.id);
    type = "image";
    content = content || "";
  }
  if (!content && !mediaUrl) return;
  if (content.length > 10000) throw new Error("Messages can be up to 10,000 characters.");

  let sealed = null;
  if (type === "text" && other) {
    const [theirs, mine] = await Promise.all([deviceKeysFor(other.user_id), deviceKeysFor(myId)]);
    sealed = await encryptForBoth(content, theirs, mine);
    if (!sealed) throw new Error("Can't send an encrypted message to this person yet — they need to open Starstreak once first.");
  }

  const row = {
    conversation_id: conversation.id,
    sender_id: myId,
    sender_name: me?.display_name || "User",
    sender_avatar_url: me?.avatar_url || null,
    receiver_id: other?.user_id || "",
    content: sealed ? sealed.encryptedMessage : content,
    is_encrypted: !!sealed,
    encrypted_key: sealed?.encryptedKey || null,
    sender_encrypted_key: sealed?.senderEncryptedKey || null,
    ...(sealed ? { device_encrypted_keys: sealed.deviceEncryptedKeys } : {}),
    message_type: type,
    media_url: mediaUrl,
    is_read: false,
    is_delivered: false,
    reply_to_message_id: replyTo?.id || null,
    reply_to_sender_name: replyTo ? replyTo.sender_name : null,
    // Never copy the plaintext of an encrypted message into the reply preview.
    reply_to_content: replyTo ? (replyTo.is_encrypted ? "🔒 Encrypted message" : (replyTo.text || "").slice(0, 200)) : null,
    reply_to_type: replyTo?.message_type || null,
  };
  const { error } = await supabase.from("messages").insert(row);
  if (error) throw await fail(error, "Couldn't send");

  const preview = type !== "text" ? PREVIEW[type] : sealed ? "🔒 New message" : content.slice(0, 120);
  const now = new Date().toISOString();
  await supabase.from("conversations").update({
    last_message: preview, last_message_sender_id: myId, last_message_time: now,
    last_message_is_read: false, last_message_is_delivered: false, updated_at: now,
  }).eq("id", conversation.id);
  supabase.rpc("increment_unread_count", { p_conversation_id: conversation.id, p_exclude_user_id: myId }).then(() => {});

  for (const p of conversation.others) {
    if (p.is_muted) continue;
    supabase.rpc("create_notification", {
      p_user_id: p.user_id,
      p_type: "message",
      p_title: me?.display_name || "New message",
      p_body: preview,
      p_data: { conversationId: conversation.id, screen: "chat", otherUserId: myId },
      p_from_user_id: myId,
    }).then(() => {});
  }
}
