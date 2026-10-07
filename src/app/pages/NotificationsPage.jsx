import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiHeart, FiMessageCircle, FiUserPlus, FiAtSign, FiMail, FiUsers, FiZap, FiBell, FiCheck, FiTrash2, FiBarChart2,
} from "react-icons/fi";
import AppShell from "../AppShell";
import Avatar from "../components/Avatar";
import { Spinner } from "../components/Feed";
import {
  deleteNotification, fetchNotifications, fetchUsersByIds, markAllNotificationsRead, markNotificationRead,
} from "../lib/api";
import { timeAgo, fullDate } from "../lib/format";
import { useAppSession } from "../AppSession";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function kindOf(type = "") {
  const t = type.toLowerCase();
  if (t.includes("like") || t.includes("reaction")) return { icon: FiHeart, color: "text-red-400 bg-red-500/10" };
  if (t.includes("follow")) return { icon: FiUserPlus, color: "text-sky-400 bg-sky-500/10" };
  if (t.includes("mention")) return { icon: FiAtSign, color: "text-accent bg-accent/10" };
  if (t.includes("message")) return { icon: FiMail, color: "text-emerald-400 bg-emerald-500/10" };
  if (t.includes("poll")) return { icon: FiBarChart2, color: "text-flare bg-flare/10" };
  if (t.includes("flash")) return { icon: FiZap, color: "text-gold bg-gold/10" };
  if (t.includes("community") || t.includes("club") || t.includes("forum")) return { icon: FiUsers, color: "text-flare bg-flare/10" };
  if (t.includes("comment") || t.includes("reply")) return { icon: FiMessageCircle, color: "text-accent bg-accent/10" };
  return { icon: FiBell, color: "text-mist bg-night-700" };
}

/** Where a notification should take you on the web (only ids that look valid). */
function targetOf(n, people) {
  const d = n.data || {};
  const pick = (...keys) => keys.map((k) => d[k]).find((v) => typeof v === "string" && v);
  const postId = pick("post_id", "postId", "discussionId", "discussion_id");
  const communityId = pick("communityId", "community_id");
  const flashId = pick("flashId", "flash_id", "flashCommunityId");
  const conversationId = pick("conversationId", "conversation_id");
  const userId = pick("otherUserId", "from_user_id", "userId") || n.from_user_id;
  const t = (n.type || "").toLowerCase();

  if (conversationId && UUID.test(conversationId)) return `/messages/${conversationId}`;
  if (flashId && UUID.test(flashId)) return `/flashes/${flashId}`;
  if (communityId && UUID.test(communityId)) {
    return postId && UUID.test(postId) ? `/communities/${communityId}/post/${postId}` : `/communities/${communityId}`;
  }
  if (postId && UUID.test(postId)) return `/post/${postId}`;
  if ((t.includes("follow") || d.screen === "profile") && people[userId]?.username) return `/profile/${people[userId].username}`;
  return null;
}

export default function NotificationsPage() {
  const { myId, notify, setUnread, refreshUnread, lastNotification } = useAppSession();
  const navigate = useNavigate();
  const [items, setItems] = useState(null);
  const [people, setPeople] = useState({});
  const [more, setMore] = useState(true);
  const busy = useRef(false);

  const withPeople = useCallback(async (list) => {
    const ids = list.flatMap((n) => [n.from_user_id, n.data?.otherUserId]);
    const found = await fetchUsersByIds(ids);
    setPeople((p) => ({ ...p, ...found }));
  }, []);

  const load = useCallback(async (before) => {
    if (busy.current) return;
    busy.current = true;
    try {
      const page = await fetchNotifications(myId, before);
      setItems((cur) => (before ? [...(cur || []), ...page] : page));
      setMore(page.length === 30);
      withPeople(page);
    } catch (e) {
      setItems((cur) => cur || []);
      notify(e.message, "error");
    } finally {
      busy.current = false;
    }
  }, [myId, notify, withPeople]);

  useEffect(() => { load(); }, [load]);

  // New ones arrive live.
  useEffect(() => {
    if (!lastNotification) return;
    setItems((cur) => (cur && !cur.some((n) => n.id === lastNotification.id) ? [lastNotification, ...cur] : cur));
    withPeople([lastNotification]);
  }, [lastNotification, withPeople]);

  async function open(n) {
    if (!n.is_read) {
      setItems((cur) => cur.map((x) => (x.id === n.id ? { ...x, is_read: true } : x)));
      setUnread((u) => Math.max(0, u - 1));
      markNotificationRead(myId, n.id);
    }
    const to = targetOf(n, people);
    if (to) navigate(to);
  }

  async function readAll() {
    try {
      await markAllNotificationsRead(myId);
      setItems((cur) => cur.map((x) => ({ ...x, is_read: true })));
      setUnread(0);
    } catch (e) {
      notify(e.message, "error");
    }
  }

  async function remove(e, n) {
    e.stopPropagation();
    setItems((cur) => cur.filter((x) => x.id !== n.id));
    await deleteNotification(myId, n.id);
    refreshUnread();
  }

  const anyUnread = items?.some((n) => !n.is_read);

  return (
    <AppShell title="Notifications">
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-night-900/85 px-4 py-3 backdrop-blur max-sm:top-[53px]">
        <h1 className="text-xl font-extrabold">Notifications</h1>
        {anyUnread && (
          <button onClick={readAll} className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold text-accent hover:bg-night-800">
            <FiCheck /> Mark all read
          </button>
        )}
      </div>

      {!items && <Spinner />}
      {items?.length === 0 && (
        <div className="px-8 py-16 text-center">
          <p className="text-2xl font-extrabold">Nothing yet</p>
          <p className="mt-2 text-mist">Likes, replies, follows and mentions will show up here.</p>
        </div>
      )}

      {items?.map((n) => {
        const { icon: Icon, color } = kindOf(n.type);
        const actor = people[n.from_user_id];
        const text = n.body || n.message;
        return (
          <div key={n.id} role="button" tabIndex={0} onClick={() => open(n)} onKeyDown={(e) => e.key === "Enter" && open(n)}
               className={`group flex cursor-pointer gap-3 border-b border-line px-4 py-3 transition-colors hover:bg-night-850 ${n.is_read ? "" : "bg-flare/[0.05]"}`}>
            <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${color}`}><Icon /></span>
            <div className="min-w-0 flex-1">
              {n.from_user_id && (
                <Avatar size="sm" src={n.from_user_avatar || actor?.avatar_url} name={n.from_user_name || actor?.display_name} className="mb-1.5" />
              )}
              <p className="text-[15px] font-bold text-star">{n.title}</p>
              {text && <p className="mt-0.5 line-clamp-3 text-[15px] text-mist">{text}</p>}
              <time dateTime={n.created_at} title={fullDate(n.created_at)} className="mt-1 block text-xs text-dust">{timeAgo(n.created_at)}</time>
            </div>
            <div className="flex flex-col items-end gap-2">
              {!n.is_read && <span className="mt-1 h-2.5 w-2.5 rounded-full bg-flare" aria-label="Unread" />}
              <button onClick={(e) => remove(e, n)} aria-label="Delete notification"
                      className="grid h-8 w-8 place-items-center rounded-full text-dust opacity-0 transition-opacity hover:bg-night-700 hover:text-red-400 group-hover:opacity-100 max-sm:opacity-100">
                <FiTrash2 />
              </button>
            </div>
          </div>
        );
      })}

      {items?.length > 0 && more && (
        <button onClick={() => load(items[items.length - 1].created_at)} className="block w-full py-6 text-sm font-semibold text-accent hover:underline">
          Load older
        </button>
      )}
    </AppShell>
  );
}
