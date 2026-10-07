import { useCallback, useEffect, useRef, useState } from "react";
import PostCard from "./PostCard";
import { PAGE_SIZE } from "../lib/api";
import { useAppSession } from "../AppSession";

export function Spinner() {
  return (
    <div className="flex justify-center py-10">
      <span className="h-7 w-7 animate-spin rounded-full border-2 border-night-600 border-t-flare" />
    </div>
  );
}

/**
 * Infinite list of posts. `load(before)` returns the next page (created_at
 * cursor). Blocked / muted / hidden posts are filtered out. `prepend` puts a
 * just-created post on top.
 */
export default function Feed({ load, empty, prepend, adapter, showCommunity = true }) {
  const { isVisible } = useAppSession();
  const [posts, setPosts] = useState([]);
  const [state, setState] = useState("loading"); // loading | idle | more | done | error
  const cursor = useRef(null);
  const sentinel = useRef(null);
  const busy = useRef(false);

  const next = useCallback(async (reset = false) => {
    if (busy.current) return;
    busy.current = true;
    setState(reset ? "loading" : "more");
    try {
      const page = await load(reset ? null : cursor.current);
      if (page.length) cursor.current = page[page.length - 1].created_at;
      setPosts((cur) => {
        const base = reset ? [] : cur;
        const seen = new Set(base.map((p) => p.id));
        return [...base, ...page.filter((p) => !seen.has(p.id))];
      });
      setState(page.length < PAGE_SIZE ? "done" : "idle");
    } catch {
      setState("error");
    } finally {
      busy.current = false;
    }
  }, [load]);

  useEffect(() => {
    cursor.current = null;
    next(true);
  }, [next]);

  useEffect(() => {
    if (prepend) setPosts((cur) => (cur.some((p) => p.id === prepend.id) ? cur : [prepend, ...cur]));
  }, [prepend]);

  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && state === "idle") next();
    }, { rootMargin: "800px" });
    io.observe(el);
    return () => io.disconnect();
  }, [next, state]);

  const visible = posts.filter(isVisible);
  const remove = (id) => setPosts((cur) => cur.filter((p) => p.id !== id));

  if (state === "loading") return <Spinner />;
  if (state === "error" && !posts.length) {
    return (
      <div className="px-6 py-16 text-center">
        <p className="text-mist">Couldn't load posts.</p>
        <button onClick={() => next(true)} className="btn-ghost mt-4 !py-2 text-sm">Try again</button>
      </div>
    );
  }

  return (
    <div>
      {visible.length > 0 && (
        <div className="space-y-3 px-3 pt-3 sm:px-4">
          {visible.map((p) => <PostCard key={p.id} post={p} adapter={adapter} showCommunity={showCommunity} onRemoved={remove} />)}
        </div>
      )}
      {!visible.length && state === "done" && empty}
      <div ref={sentinel} />
      {state === "more" && <Spinner />}
      {state === "error" && posts.length > 0 && (
        <button onClick={() => next()} className="block w-full py-6 text-sm text-accent hover:underline">Couldn't load more — try again</button>
      )}
      {state === "done" && visible.length > 0 && <p className="py-10 text-center text-sm text-dust">You're all caught up ✨</p>}
    </div>
  );
}
