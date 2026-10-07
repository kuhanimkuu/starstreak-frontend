import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  FiArrowLeft, FiCheck, FiCornerUpLeft, FiEdit, FiImage, FiLock, FiMoreVertical, FiSearch, FiSend, FiSmile,
  FiTrash2, FiX, FiBellOff, FiStar, FiFileText, FiExternalLink,
} from "react-icons/fi";
import { BsCheckAll } from "react-icons/bs";
import AppShell from "../AppShell";
import Avatar from "../components/Avatar";
import RichText from "../components/RichText";
import { Spinner } from "../components/Feed";
import { supabase } from "../../lib/supabase";
import { searchUsers } from "../lib/api";
import { safeUrl } from "../lib/media";
import { timeAgo } from "../lib/format";
import { DECRYPT_FAILED } from "../lib/e2e";
import {
  decryptRows, deleteConversationForEveryone, deleteConversationForMe, deleteMessageForEveryone, deleteMessageForMe,
  fetchConversationInfo, fetchConversations, fetchMessages, fetchReactions, markRead, react,
  sendMessage, setConversationFlag, startConversation, unlockMessages,
} from "../lib/messaging";
import { useAppSession } from "../AppSession";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const QUICK_REACTIONS = ["❤️", "😂", "👍", "😮", "😢", "🙏"];

// One unlock per page load, shared by the list and every chat.
let unlockCache = { id: null, promise: null };
function useKeys(myId) {
  const [keys, setKeys] = useState({ state: "loading" });
  useEffect(() => {
    if (!myId) return;
    if (unlockCache.id !== myId) unlockCache = { id: myId, promise: unlockMessages(myId) };
    let live = true;
    unlockCache.promise.then((k) => live && setKeys(k));
    return () => { live = false; };
  }, [myId]);
  return keys;
}

const isOnline = (u) => u?.last_active && Date.now() - new Date(u.last_active).getTime() < 3 * 60000;

function KeyBanner({ keys }) {
  if (keys.state === "ready" || keys.state === "loading") return null;
  return (
    <div className="flex gap-3 border-b border-line bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
      <FiLock className="mt-0.5 shrink-0" />
      <p>
        {keys.state === "no-backup"
          ? "Open Starstreak on your phone once to unlock your encrypted messages here. You can still send messages."
          : `Encrypted messages couldn't be unlocked here (${keys.message}).`}
      </p>
    </div>
  );
}

// ── New chat ─────────────────────────────────────────────────────────────────
function NewChat({ onClose }) {
  const { me, notify } = useAppSession();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [people, setPeople] = useState([]);
  useEffect(() => {
    const t = setTimeout(() => searchUsers(q).then(setPeople).catch(() => setPeople([])), 250);
    return () => clearTimeout(t);
  }, [q]);
  async function open(u) {
    try {
      const id = await startConversation(me, u);
      onClose();
      navigate(`/messages/${id}`);
    } catch (e) {
      notify(e.message, "error");
    }
  }
  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center bg-black/60 sm:pt-20" onMouseDown={onClose} role="dialog" aria-modal aria-label="New message">
      <div className="h-full w-full overflow-hidden bg-night-900 sm:h-auto sm:max-h-[70vh] sm:max-w-md sm:rounded-3xl sm:border sm:border-line" onMouseDown={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 border-b border-line p-3">
          <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full hover:bg-night-700" aria-label="Close"><FiX /></button>
          <h2 className="text-lg font-extrabold">New message</h2>
        </div>
        <label className="m-3 flex items-center gap-3 rounded-full border border-line bg-night-850 px-4 py-2.5 focus-within:border-flare">
          <FiSearch className="text-dust" />
          <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search people" className="w-full bg-transparent text-sm text-star placeholder-dust focus:outline-none" />
        </label>
        <div className="max-h-[55vh] overflow-y-auto">
          {people.filter((u) => u.firebase_uid !== me?.firebase_uid).map((u) => (
            <button key={u.firebase_uid} onClick={() => open(u)} className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-night-800">
              <Avatar size="sm" src={u.avatar_url} name={u.display_name} />
              <div className="min-w-0">
                <p className="truncate font-bold text-star">{u.display_name || u.username}</p>
                <p className="truncate text-sm text-dust">@{u.username}</p>
              </div>
            </button>
          ))}
          {q && !people.length && <p className="px-4 py-8 text-center text-sm text-dust">No one found.</p>}
        </div>
      </div>
    </div>
  );
}

// ── Conversation list ────────────────────────────────────────────────────────
function ConversationList({ keys, activeId, onNew }) {
  const { myId, notify } = useAppSession();
  const [list, setList] = useState(null);
  const [q, setQ] = useState("");

  const load = useCallback(() => {
    if (keys.state === "loading") return;
    fetchConversations(myId, keys).then(setList).catch((e) => { setList((l) => l || []); notify(e.message, "error"); });
  }, [myId, keys, notify]);

  useEffect(() => { load(); }, [load, activeId]);

  // Any message you can see arriving (RLS limits Realtime to your chats) → refresh.
  useEffect(() => {
    let t;
    const channel = supabase
      .channel(`web-dm-list:${myId}:${Date.now()}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, () => {
        clearTimeout(t);
        t = setTimeout(load, 400);
      })
      .subscribe();
    const poll = setInterval(load, 30000);
    return () => { clearTimeout(t); clearInterval(poll); supabase.removeChannel(channel); };
  }, [myId, load]);

  const shown = (list || [])
    .filter((c) => !q || (c.is_group_chat ? c.group_name : c.other_user_display_name || "").toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => (b.is_pinned - a.is_pinned) || new Date(b.last_message_created_at || b.updated_at) - new Date(a.last_message_created_at || a.updated_at));

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-4 pb-2 pt-3">
        <h1 className="text-xl font-extrabold">Messages</h1>
        <button onClick={onNew} className="grid h-9 w-9 place-items-center rounded-full text-star hover:bg-night-700" aria-label="New message" title="New message">
          <FiEdit />
        </button>
      </div>
      <label className="mx-4 mb-2 flex items-center gap-3 rounded-full border border-line bg-night-850 px-4 py-2 focus-within:border-flare">
        <FiSearch className="text-dust" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search chats" className="w-full bg-transparent text-sm text-star placeholder-dust focus:outline-none" />
      </label>
      <KeyBanner keys={keys} />
      <div className="flex-1 overflow-y-auto">
        {!list && <Spinner />}
        {list?.length === 0 && (
          <div className="px-8 py-14 text-center">
            <p className="text-xl font-extrabold">No chats yet</p>
            <p className="mt-2 text-sm text-mist">Messages between two people are end-to-end encrypted.</p>
            <button onClick={onNew} className="btn-flare mt-5 !py-2.5 text-sm">Start a chat</button>
          </div>
        )}
        {shown.map((c) => {
          const name = c.is_group_chat ? c.group_name || "Group" : c.other_user_display_name || "Starstreak user";
          const avatar = c.is_group_chat ? c.group_avatar : c.other_user_avatar_url;
          const mine = c.last_message_sender_id === myId;
          const preview = c.preview === DECRYPT_FAILED ? "🔒 Encrypted message" : c.preview || "";
          return (
            <Link key={c.conversation_id} to={`/messages/${c.conversation_id}`}
                  className={`flex items-center gap-3 px-4 py-3 transition-colors hover:bg-night-850 ${activeId === c.conversation_id ? "bg-night-800" : ""}`}>
              <Avatar src={avatar} name={name} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="min-w-0 flex-1 truncate font-bold text-star">{name}</p>
                  {c.is_pinned && <FiStar className="shrink-0 text-xs text-gold" aria-label="Pinned" />}
                  {c.is_muted && <FiBellOff className="shrink-0 text-xs text-dust" aria-label="Muted" />}
                  <span className="shrink-0 text-xs text-dust">{timeAgo(c.last_message_created_at || c.updated_at)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <p className={`min-w-0 flex-1 truncate text-sm ${c.unread_count > 0 ? "font-semibold text-star" : "text-dust"}`}>
                    {mine && "You: "}{preview}
                  </p>
                  {c.unread_count > 0 && (
                    <span className="grid h-5 min-w-5 place-items-center rounded-full bg-flare px-1.5 text-[11px] font-bold text-night-950">{c.unread_count}</span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

// ── Chat ─────────────────────────────────────────────────────────────────────
function Ticks({ m }) {
  if (m.is_read) return <BsCheckAll className="text-[15px] text-sky-300" aria-label="Read" />;
  if (m.is_delivered) return <BsCheckAll className="text-[15px] text-white/70" aria-label="Delivered" />;
  return <FiCheck className="text-[13px] text-white/70" aria-label="Sent" />;
}

function MessageBody({ m }) {
  const media = safeUrl(m.media_url);
  const text = m.text === DECRYPT_FAILED ? "🔒 This message can't be decrypted on this device." : m.text;
  switch (m.message_type) {
    case "image":
      return (
        <>
          {media && <a href={media} target="_blank" rel="noopener noreferrer"><img src={media} alt="" className="max-h-80 rounded-xl object-cover" /></a>}
          {text && <RichText text={text} className="mt-1" />}
        </>
      );
    case "video":
      return media ? <video src={media} controls preload="metadata" className="max-h-80 rounded-xl" /> : null;
    case "audio":
    case "voice":
      return media ? <audio src={media} controls className="max-w-full" /> : null;
    case "document":
    case "file":
      return media ? (
        <a href={media} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 underline-offset-2 hover:underline">
          <FiFileText /> {m.file_name || "File"}
        </a>
      ) : null;
    case "gif":
    case "sticker": {
      const src = safeUrl(m.gif_url || m.sticker_url || m.media_url);
      return src ? <img src={src} alt={m.message_type} className="max-h-48 rounded-xl" /> : null;
    }
    case "sharedPost":
      return m.shared_post_id && UUID.test(m.shared_post_id) ? (
        <Link to={`/post/${m.shared_post_id}`} className="flex items-center gap-2 font-semibold underline-offset-2 hover:underline">
          <FiExternalLink /> {m.shared_post_data?.content ? String(m.shared_post_data.content).slice(0, 120) : "Shared a post"}
        </Link>
      ) : <span>📤 Shared a post</span>;
    case "externalContent": {
      const url = safeUrl(m.external_content_url);
      return url ? <a href={url} target="_blank" rel="noopener noreferrer nofollow" className="break-all underline">{url}</a> : <span>🔗 Shared a link</span>;
    }
    default:
      return <RichText text={text || ""} />;
  }
}

function Chat({ conversationId, keys }) {
  const { myId, me, notify } = useAppSession();
  const navigate = useNavigate();
  const [info, setInfo] = useState(undefined);
  const [messages, setMessages] = useState(null);
  const [reactions, setReactions] = useState({});
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const [replyTo, setReplyTo] = useState(null);
  const [sending, setSending] = useState(false);
  const [typing, setTyping] = useState(false);
  const [picker, setPicker] = useState(null);
  const [menu, setMenu] = useState(false);
  const [blocked, setBlocked] = useState("none");
  const scroller = useRef(null);
  const typingChannel = useRef(null);
  const typingSent = useRef(0);
  const fileInput = useRef(null);
  const keysRef = useRef(keys);
  keysRef.current = keys;

  const other = info?.is_group_chat ? null : info?.others?.[0];
  const title = info ? (info.is_group_chat ? info.group_name || "Group" : other?.display_name || "Chat") : "Chat";

  const scrollDown = useCallback((smooth) => {
    requestAnimationFrame(() => scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: smooth ? "smooth" : "auto" }));
  }, []);

  // Load the chat once the key state is known.
  useEffect(() => {
    if (keys.state === "loading") return;
    let live = true;
    setInfo(undefined);
    setMessages(null);
    (async () => {
      const i = await fetchConversationInfo(conversationId, myId);
      if (!live) return;
      setInfo(i);
      if (!i) return;
      const list = await fetchMessages(conversationId, myId, keys);
      if (!live) return;
      setMessages(list);
      setReactions(await fetchReactions(list.map((m) => m.id)));
      scrollDown(false);
      markRead(conversationId, myId).catch(() => {});
      if (!i.is_group_chat && i.others[0]) {
        supabase.rpc("users_block_status", { other_id: i.others[0].user_id }).then(({ data }) => live && setBlocked(data || "none"));
      }
    })().catch((e) => { if (live) { setInfo(null); notify(e.message, "error"); } });
    return () => { live = false; };
  }, [conversationId, myId, keys, notify, scrollDown]);

  // Live: new / changed messages, reactions, typing.
  useEffect(() => {
    if (!info) return;
    const stamp = Date.now();
    const msgs = supabase
      .channel(`web-dm:${conversationId}:${stamp}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${conversationId}` }, async ({ new: row }) => {
        const [m] = await decryptRows([row], keysRef.current, myId);
        if ((m.deleted_for || []).includes(myId)) return;
        setMessages((cur) => (cur && !cur.some((x) => x.id === m.id) ? [...cur, m] : cur));
        scrollDown(true);
        if (m.sender_id !== myId) {
          setTyping(false);
          if (document.visibilityState === "visible") markRead(conversationId, myId).catch(() => {});
        }
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "messages", filter: `conversation_id=eq.${conversationId}` }, async ({ new: row }) => {
        if ((row.deleted_for || []).includes(myId)) {
          setMessages((cur) => cur?.filter((x) => x.id !== row.id));
          return;
        }
        setMessages((cur) => cur?.map((x) => (x.id === row.id ? { ...x, is_read: row.is_read, is_delivered: row.is_delivered } : x)));
      })
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "messages" }, ({ old }) => {
        setMessages((cur) => cur?.filter((x) => x.id !== old.id));
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "message_reactions" }, () => {
        setMessages((cur) => {
          if (cur) fetchReactions(cur.map((m) => m.id)).then(setReactions);
          return cur;
        });
      })
      .subscribe();

    const t = supabase
      .channel(`typing:${conversationId}`)
      .on("broadcast", { event: "typing" }, ({ payload }) => {
        if (payload?.user_id && payload.user_id !== myId) setTyping(!!payload.is_typing);
      })
      .subscribe();
    typingChannel.current = t;
    return () => {
      supabase.removeChannel(msgs);
      supabase.removeChannel(t);
      typingChannel.current = null;
    };
  }, [info, conversationId, myId, scrollDown]);

  // Typing indicator auto-clears 4s after the last event (as in the app).
  useEffect(() => {
    if (!typing) return;
    const t = setTimeout(() => setTyping(false), 4000);
    return () => clearTimeout(t);
  }, [typing]);

  function onType(v) {
    setText(v);
    const now = Date.now();
    if (typingChannel.current && now - typingSent.current > 2000) {
      typingSent.current = now;
      typingChannel.current.send({ type: "broadcast", event: "typing", payload: { user_id: myId, is_typing: true } });
    }
  }

  async function send() {
    if (sending || (!text.trim() && !image)) return;
    setSending(true);
    try {
      await sendMessage({ conversation: info, me, myId, text, image, replyTo });
      setText("");
      setImage(null);
      setReplyTo(null);
      typingChannel.current?.send({ type: "broadcast", event: "typing", payload: { user_id: myId, is_typing: false } });
    } catch (e) {
      notify(e.message, "error");
    } finally {
      setSending(false);
    }
  }

  async function loadOlder() {
    if (!messages?.length) return;
    const older = await fetchMessages(conversationId, myId, keys, messages[0].created_at);
    setMessages((cur) => [...older, ...cur]);
    fetchReactions(older.map((m) => m.id)).then((r) => setReactions((cur) => ({ ...cur, ...r })));
  }

  async function onReact(m, emoji) {
    setPicker(null);
    const mineNow = Object.entries(reactions[m.id] || {}).find(([, users]) => users.includes(myId))?.[0];
    try {
      await react(m.id, myId, emoji, mineNow);
      setReactions(await fetchReactions(messages.map((x) => x.id)));
    } catch (e) {
      notify(e.message, "error");
    }
  }

  async function onDelete(m) {
    setPicker(null);
    const everyone = m.sender_id === myId && window.confirm("Delete for everyone?\n\nOK = delete for everyone · Cancel = just for you");
    if (!everyone && !window.confirm("Delete this message for you?")) return;
    try {
      await (everyone ? deleteMessageForEveryone(m) : deleteMessageForMe(m, myId));
      setMessages((cur) => cur.filter((x) => x.id !== m.id));
    } catch (e) {
      notify(e.message, "error");
    }
  }

  async function chatAction(kind) {
    setMenu(false);
    try {
      if (kind === "pin" || kind === "mute") {
        const flag = kind === "pin" ? "is_pinned" : "is_muted";
        await setConversationFlag(conversationId, myId, flag, !info.me?.[flag]);
        setInfo((i) => ({ ...i, me: { ...i.me, [flag]: !i.me?.[flag] } }));
      } else if (kind === "delete-me") {
        if (!window.confirm("Delete this chat for you? The other person keeps their copy.")) return;
        await deleteConversationForMe(conversationId);
        navigate("/messages");
      } else if (kind === "delete-all") {
        if (!window.confirm("Delete this chat for everyone? This can't be undone.")) return;
        await deleteConversationForEveryone(conversationId);
        navigate("/messages");
      }
    } catch (e) {
      notify(e.message || "Something went wrong", "error");
    }
  }

  if (info === undefined || (info && !messages)) return <div className="flex flex-1 items-center justify-center"><Spinner /></div>;
  if (info === null) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
        <p className="text-xl font-extrabold">Chat not available</p>
        <Link to="/messages" className="btn-ghost mt-5 !py-2 text-sm">Back to messages</Link>
      </div>
    );
  }

  let lastDay = "";
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-line px-3 py-2">
        <Link to="/messages" className="grid h-9 w-9 place-items-center rounded-full hover:bg-night-700 md:hidden" aria-label="Back"><FiArrowLeft size={20} /></Link>
        {other?.username ? (
          <Link to={`/profile/${other.username}`} className="flex min-w-0 flex-1 items-center gap-3">
            <Avatar size="sm" src={other.avatar_url} name={title} className={typing ? "ring-2 ring-purple-400/70" : ""} />
            <div className="min-w-0">
              <p className="truncate font-bold text-star">{title}</p>
              <p className={`text-xs ${typing ? "italic text-purple-300" : isOnline(other) ? "text-emerald-400" : "text-dust"}`}>
                {typing ? "typing…" : isOnline(other) ? "online" : "🔒 End-to-end encrypted"}
              </p>
            </div>
          </Link>
        ) : (
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <Avatar size="sm" src={info.group_avatar} name={title} />
            <div className="min-w-0">
              <p className="truncate font-bold text-star">{title}</p>
              <p className="truncate text-xs text-dust">{typing ? "someone is typing…" : `${info.others.length + 1} members`}</p>
            </div>
          </div>
        )}
        <div className="relative">
          <button onClick={() => setMenu((v) => !v)} className="grid h-9 w-9 place-items-center rounded-full hover:bg-night-700" aria-label="Chat options"><FiMoreVertical /></button>
          {menu && (
            <div className="absolute right-0 top-10 z-30 w-56 overflow-hidden rounded-2xl border border-line bg-night-800 py-1 shadow-night" onMouseLeave={() => setMenu(false)}>
              <button onClick={() => chatAction("pin")} className="block w-full px-4 py-2.5 text-left text-sm hover:bg-night-700">{info.me?.is_pinned ? "Unpin chat" : "Pin chat"}</button>
              <button onClick={() => chatAction("mute")} className="block w-full px-4 py-2.5 text-left text-sm hover:bg-night-700">{info.me?.is_muted ? "Unmute" : "Mute notifications"}</button>
              <button onClick={() => chatAction("delete-me")} className="block w-full px-4 py-2.5 text-left text-sm text-red-400 hover:bg-night-700">Delete chat for me</button>
              {!info.is_group_chat && <button onClick={() => chatAction("delete-all")} className="block w-full px-4 py-2.5 text-left text-sm text-red-400 hover:bg-night-700">Delete chat for everyone</button>}
            </div>
          )}
        </div>
      </div>
      <KeyBanner keys={keys} />

      {/* Messages */}
      <div ref={scroller} className="flex-1 space-y-1 overflow-y-auto px-3 py-3">
        {messages.length >= 50 && (
          <button onClick={loadOlder} className="mx-auto block rounded-full px-4 py-1.5 text-xs font-semibold text-accent hover:bg-night-800">Load older messages</button>
        )}
        {!messages.length && (
          <p className="py-10 text-center text-sm text-dust">
            {info.is_group_chat ? "Say hi to the group 👋" : "🔒 Messages here are end-to-end encrypted. Say hi 👋"}
          </p>
        )}
        {messages.map((m) => {
          const mine = m.sender_id === myId;
          const day = new Date(m.created_at).toDateString();
          const showDay = day !== lastDay;
          lastDay = day;
          const rx = reactions[m.id] || {};
          return (
            <div key={m.id}>
              {showDay && (
                <p className="my-3 text-center text-xs font-semibold text-dust">
                  {new Date(m.created_at).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
                </p>
              )}
              <div className={`group flex items-end gap-2 ${mine ? "justify-end" : "justify-start"}`}>
                {!mine && info.is_group_chat && <Avatar size="xs" src={m.sender_avatar_url} name={m.sender_name} />}
                <div className={`relative max-w-[78%] ${mine ? "order-2" : ""}`}>
                  <div className={`rounded-2xl px-3.5 py-2 text-[15px] ${mine ? "bg-flare-deep text-white" : "bg-night-700 text-star"}`}>
                    {!mine && info.is_group_chat && <p className="mb-0.5 text-xs font-bold text-accent">{m.sender_name}</p>}
                    {m.reply_to_message_id && m.reply_to_content && (
                      <div className={`mb-1.5 rounded-lg border-l-2 px-2 py-1 text-xs ${mine ? "border-white/60 bg-white/10" : "border-flare bg-night-800"}`}>
                        <p className="font-bold">{m.reply_to_sender_name}</p>
                        <p className="line-clamp-2 opacity-80">{m.reply_to_content}</p>
                      </div>
                    )}
                    <MessageBody m={m} />
                    <div className={`mt-0.5 flex items-center justify-end gap-1 text-[11px] ${mine ? "text-white/70" : "text-dust"}`}>
                      {new Date(m.created_at).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}
                      {mine && <Ticks m={m} />}
                    </div>
                  </div>
                  {Object.keys(rx).length > 0 && (
                    <div className={`-mt-1.5 flex gap-1 ${mine ? "justify-end" : "justify-start"}`}>
                      {Object.entries(rx).map(([emoji, users]) => (
                        <button key={emoji} onClick={() => onReact(m, emoji)}
                                className={`rounded-full border px-1.5 text-xs ${users.includes(myId) ? "border-flare/60 bg-flare/15" : "border-line bg-night-800"}`}>
                          {emoji}{users.length > 1 ? ` ${users.length}` : ""}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {/* Hover actions */}
                <div className={`relative flex opacity-0 transition-opacity group-hover:opacity-100 max-sm:opacity-100 ${mine ? "order-1" : ""}`}>
                  <button onClick={() => setPicker(picker === m.id ? null : m.id)} className="grid h-7 w-7 place-items-center rounded-full text-dust hover:bg-night-700 hover:text-star" aria-label="React"><FiSmile /></button>
                  <button onClick={() => setReplyTo(m)} className="grid h-7 w-7 place-items-center rounded-full text-dust hover:bg-night-700 hover:text-star" aria-label="Reply"><FiCornerUpLeft /></button>
                  <button onClick={() => onDelete(m)} className="grid h-7 w-7 place-items-center rounded-full text-dust hover:bg-night-700 hover:text-red-400" aria-label="Delete"><FiTrash2 /></button>
                  {picker === m.id && (
                    <div className={`absolute bottom-8 z-20 flex gap-1 rounded-full border border-line bg-night-800 p-1.5 shadow-night ${mine ? "right-0" : "left-0"}`}>
                      {QUICK_REACTIONS.map((e) => (
                        <button key={e} onClick={() => onReact(m, e)} className="grid h-8 w-8 place-items-center rounded-full text-lg hover:bg-night-700">{e}</button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Composer */}
      {blocked !== "none" ? (
        <p className="border-t border-line px-4 py-4 text-center text-sm text-dust">
          {blocked === "blocked_by_me" ? "You blocked this person. Unblock them from their profile to message them." : "You can't reply to this conversation."}
        </p>
      ) : (
        <div className="border-t border-line p-2.5">
          {replyTo && (
            <div className="mb-2 flex items-center gap-2 rounded-xl border-l-2 border-flare bg-night-800 px-3 py-1.5 text-xs">
              <div className="min-w-0 flex-1">
                <p className="font-bold text-star">Replying to {replyTo.sender_id === myId ? "yourself" : replyTo.sender_name}</p>
                <p className="truncate text-mist">{replyTo.text}</p>
              </div>
              <button onClick={() => setReplyTo(null)} aria-label="Cancel reply" className="text-dust hover:text-star"><FiX /></button>
            </div>
          )}
          {image && (
            <div className="mb-2 flex items-center gap-2 rounded-xl bg-night-800 px-3 py-1.5 text-xs text-mist">
              <FiImage /> <span className="min-w-0 flex-1 truncate">{image.name}</span>
              <button onClick={() => setImage(null)} aria-label="Remove image" className="text-dust hover:text-star"><FiX /></button>
            </div>
          )}
          <div className="flex items-end gap-2">
            <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp,image/gif" hidden onChange={(e) => { setImage(e.target.files?.[0] || null); e.target.value = ""; }} />
            <button onClick={() => fileInput.current?.click()} className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-flare hover:bg-flare/10" aria-label="Send a photo" title="Photo">
              <FiImage />
            </button>
            <textarea value={text} onChange={(e) => onType(e.target.value)} rows={1} maxLength={10000}
                      onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                      placeholder={info.is_group_chat ? "Message the group" : "Encrypted message"}
                      className="max-h-36 min-h-[40px] flex-1 resize-none rounded-2xl border border-night-600 bg-night-850 px-4 py-2.5 text-[15px] text-star placeholder-dust focus:border-flare focus:outline-none" />
            <button onClick={send} disabled={sending || (!text.trim() && !image)} aria-label="Send"
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-flare-gradient text-night-950 disabled:opacity-40">
              <FiSend />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MessagesPage() {
  const { conversationId } = useParams();
  const { myId } = useAppSession();
  const keys = useKeys(myId);
  const [newChat, setNewChat] = useState(false);
  const valid = conversationId && UUID.test(conversationId);

  return (
    <AppShell title="Messages" wide>
      <div className="flex h-[calc(100dvh-53px-56px)] sm:h-screen">
        <aside className={`w-full shrink-0 border-line md:w-[340px] md:border-r ${valid ? "hidden md:block" : ""}`}>
          <ConversationList keys={keys} activeId={valid ? conversationId : null} onNew={() => setNewChat(true)} />
        </aside>
        <section className={`min-w-0 flex-1 flex-col ${valid ? "flex" : "hidden md:flex"}`}>
          {valid ? (
            <Chat key={conversationId} conversationId={conversationId} keys={keys} />
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
              <FiLock className="text-3xl text-flare" />
              <p className="mt-3 text-xl font-extrabold">Your messages</p>
              <p className="mt-1 max-w-xs text-sm text-mist">Private chats between two people are end-to-end encrypted — only you and them can read them.</p>
              <button onClick={() => setNewChat(true)} className="btn-flare mt-5 !py-2.5 text-sm">New message</button>
            </div>
          )}
        </section>
      </div>
      {newChat && <NewChat onClose={() => setNewChat(false)} />}
    </AppShell>
  );
}
