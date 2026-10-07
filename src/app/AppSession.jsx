import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { fetchMe, setSavedPosts, unreadNotificationCount } from "./lib/api";

const AppSessionContext = createContext(null);

/**
 * Your own account data for the web app: profile (from the `me` view), who you
 * follow, posts you've hidden, and your block / mute lists — used to filter
 * feeds the same way the phone app does.
 */
export function AppSessionProvider({ children }) {
  const { user } = useAuth();
  const [me, setMe] = useState(null);
  const [following, setFollowing] = useState(() => new Set());
  const [hiddenPostIds, setHiddenPostIds] = useState(() => new Set());
  const [ready, setReady] = useState(false);
  const [toast, setToast] = useState(null);
  const [unread, setUnread] = useState(0);
  const [lastNotification, setLastNotification] = useState(null);

  const reload = useCallback(async () => {
    if (!user) return;
    const data = await fetchMe();
    setMe(data.me);
    setFollowing(data.following);
    setHiddenPostIds(data.hiddenPostIds);
    setReady(true);
  }, [user]);

  useEffect(() => {
    reload().catch(() => setReady(true));
  }, [reload]);

  // Unread notification badge: live via Realtime, re-counted every minute as
  // a fallback (and whenever the tab comes back into view).
  const refreshUnread = useCallback(() => {
    if (user) unreadNotificationCount(user.id).then(setUnread).catch(() => {});
  }, [user]);

  useEffect(() => {
    if (!user) return;
    refreshUnread();
    const channel = supabase
      .channel(`web-notifications:${user.id}:${Date.now()}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
        (payload) => {
          setLastNotification(payload.new);
          setUnread((n) => n + 1);
        })
      .subscribe();
    const timer = setInterval(refreshUnread, 60000);
    const onVisible = () => document.visibilityState === "visible" && refreshUnread();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      supabase.removeChannel(channel);
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [user, refreshUnread]);

  const notify = useCallback((message, tone = "info") => {
    setToast({ message, tone, id: Date.now() });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  const value = useMemo(() => {
    const blocked = new Set(me?.blocked_users || []);
    const muted = new Set(me?.muted_users || []);
    return {
      myId: user?.id || null,
      me,
      ready,
      following,
      setFollowing,
      hiddenPostIds,
      savedPostIds: new Set(me?.saved_posts || []),
      /** Save / unsave a post (optimistic). */
      toggleSaved: async (postId) => {
        const current = me?.saved_posts || [];
        const next = current.includes(postId) ? current.filter((id) => id !== postId) : [...current, postId];
        setMe((m) => ({ ...m, saved_posts: next }));
        try {
          await setSavedPosts(user.id, next);
          return next.includes(postId);
        } catch (e) {
          setMe((m) => ({ ...m, saved_posts: current }));
          throw e;
        }
      },
      hidePostLocally: (id) => setHiddenPostIds((s) => new Set(s).add(id)),
      reload,
      notify,
      toast,
      unread,
      setUnread,
      refreshUnread,
      lastNotification,
      /** Feed filter: hidden posts, blocked authors, muted authors (not anonymous ones). */
      isVisible: (p) =>
        !hiddenPostIds.has(p.id) &&
        !(p.author_id && blocked.has(p.author_id)) &&
        (p.is_anonymous || !p.author_id || !muted.has(p.author_id)),
    };
  }, [user, me, ready, following, hiddenPostIds, reload, notify, toast, unread, refreshUnread, lastNotification]);

  return <AppSessionContext.Provider value={value}>{children}</AppSessionContext.Provider>;
}

export function useAppSession() {
  return useContext(AppSessionContext);
}
