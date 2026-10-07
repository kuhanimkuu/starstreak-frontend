import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AppShell from "../AppShell";
import Composer from "../components/Composer";
import Feed from "../components/Feed";
import { fetchFeed } from "../lib/api";
import { useAppSession } from "../AppSession";

const TABS = [
  { id: "foryou", label: "For you" },
  { id: "following", label: "Following" },
];

export default function HomePage() {
  const { myId, following, ready } = useAppSession();
  const [tab, setTab] = useState("foryou");
  const [fresh, setFresh] = useState(null);

  // Posts made from the compose button / modal.
  useEffect(() => {
    const onPosted = (e) => e.detail && setFresh(e.detail);
    window.addEventListener("ss:posted", onPosted);
    return () => window.removeEventListener("ss:posted", onPosted);
  }, []);

  // The Following tab reloads when the set of people you follow changes.
  const followingKey = tab === "following" && ready ? [...following].sort().join(",") : "";
  const load = useCallback(
    (before) => fetchFeed({ tab, before, myId, following: followingKey ? followingKey.split(",") : [] }),
    [tab, myId, followingKey],
  );

  return (
    <AppShell title="Home">
      <div className="sticky top-0 z-30 border-b border-line bg-night-900/85 backdrop-blur max-sm:top-[53px]">
        <h1 className="hidden px-4 pt-3 text-xl font-extrabold sm:block">Home</h1>
        <div className="flex">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} aria-pressed={tab === t.id}
                    className="flex flex-1 justify-center py-3.5 text-[15px] transition-colors hover:bg-night-800">
              <span className={`relative ${tab === t.id ? "font-bold text-star" : "text-dust"}`}>
                {t.label}
                {tab === t.id && <span className="absolute -bottom-3.5 left-0 right-0 h-1 rounded-full bg-flare" />}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="hidden sm:block">
        <Composer onPosted={setFresh} />
      </div>

      <Feed
        key={tab}
        load={load}
        prepend={fresh}
        empty={
          tab === "following" ? (
            <div className="px-8 py-16 text-center">
              <p className="text-2xl font-extrabold">Nothing here yet</p>
              <p className="mt-2 text-mist">When you follow people, their posts show up here.</p>
              <Link to="/explore" className="btn-flare mt-6 !py-2.5 text-sm">Find people to follow</Link>
            </div>
          ) : (
            <p className="px-8 py-16 text-center text-mist">No posts yet — be the first to share something.</p>
          )
        }
      />
    </AppShell>
  );
}
