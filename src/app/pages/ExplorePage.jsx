import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { FiSearch, FiX } from "react-icons/fi";
import { MdVerified } from "react-icons/md";
import AppShell from "../AppShell";
import Avatar from "../components/Avatar";
import Feed, { Spinner } from "../components/Feed";
import FollowButton from "../components/FollowButton";
import { fetchTrending, searchPosts, searchUsers } from "../lib/api";
import { compact } from "../lib/format";

function PersonRow({ u }) {
  return (
    <Link to={`/profile/${u.username}`} className="flex items-center gap-3 border-b border-line px-4 py-3 hover:bg-night-850">
      <Avatar src={u.avatar_url} name={u.display_name} />
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1 truncate font-bold text-star">
          {u.display_name || u.username} {u.is_verified && <MdVerified className="shrink-0 text-sky-500" />}
        </p>
        <p className="truncate text-sm text-dust">@{u.username} · {compact(u.follower_count)} followers</p>
        {u.bio && <p className="mt-0.5 line-clamp-2 text-sm text-mist">{u.bio}</p>}
      </div>
      <FollowButton userId={u.firebase_uid} size="sm" />
    </Link>
  );
}

function People({ q }) {
  const [people, setPeople] = useState(null);
  useEffect(() => {
    let live = true;
    searchUsers(q).then((r) => live && setPeople(r)).catch(() => live && setPeople([]));
    return () => { live = false; };
  }, [q]);
  if (!people) return <Spinner />;
  if (!people.length) return <p className="px-8 py-16 text-center text-mist">No people match “{q}”.</p>;
  return people.map((u) => <PersonRow key={u.firebase_uid} u={u} />);
}

export default function ExplorePage() {
  const [params, setParams] = useSearchParams();
  const q = (params.get("q") || "").slice(0, 100);
  const [input, setInput] = useState(q);
  const [tab, setTab] = useState("posts");

  useEffect(() => setInput(q), [q]);

  // Debounced: update ?q= as you type.
  useEffect(() => {
    const t = setTimeout(() => {
      if (input.trim() !== q) setParams(input.trim() ? { q: input.trim() } : {}, { replace: true });
    }, 350);
    return () => clearTimeout(t);
  }, [input, q, setParams]);

  // Trending is ranked by views, so it pages by offset: the Feed passes a
  // cursor for "next page", which we just count.
  const trendingPage = useRef(0);
  const trending = useCallback((before) => {
    trendingPage.current = before ? trendingPage.current + 1 : 0;
    return fetchTrending(trendingPage.current);
  }, []);
  const postSearch = useCallback((before) => searchPosts(q, before), [q]);

  const tabs = q ? [["posts", "Posts"], ["people", "People"]] : [["posts", "Trending"]];

  return (
    <AppShell title={q ? `${q} - Search` : "Explore"}>
      <div className="sticky top-0 z-30 border-b border-line bg-night-900/85 backdrop-blur max-sm:top-[53px]">
        <div className="px-4 pt-3">
          <label className="flex items-center gap-3 rounded-full border border-line bg-night-850 px-4 py-2.5 focus-within:border-flare">
            <FiSearch className="text-dust" />
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Search people and posts" autoFocus
                   maxLength={100} className="w-full bg-transparent text-star placeholder-dust focus:outline-none" />
            {input && (
              <button onClick={() => setInput("")} aria-label="Clear search" className="text-dust hover:text-star"><FiX /></button>
            )}
          </label>
        </div>
        <div className="mt-1 flex">
          {tabs.map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} aria-pressed={tab === id || tabs.length === 1}
                    className="flex flex-1 justify-center py-3.5 text-[15px] hover:bg-night-800">
              <span className={`relative ${tab === id || tabs.length === 1 ? "font-bold text-star" : "text-dust"}`}>
                {label}
                {(tab === id || tabs.length === 1) && <span className="absolute -bottom-3.5 left-0 right-0 h-1 rounded-full bg-flare" />}
              </span>
            </button>
          ))}
        </div>
      </div>

      {!q && (
        <Feed key="trending" load={trending}
              empty={<p className="px-8 py-16 text-center text-mist">Nothing trending this week yet.</p>} />
      )}
      {q && tab === "posts" && (
        <Feed key={`posts:${q}`} load={postSearch}
              empty={<p className="px-8 py-16 text-center text-mist">No posts match “{q}”.</p>} />
      )}
      {q && tab === "people" && <People q={q} />}
    </AppShell>
  );
}
