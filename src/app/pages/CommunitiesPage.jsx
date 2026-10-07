import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiSearch, FiUsers, FiLock, FiX, FiPlus } from "react-icons/fi";
import AppShell from "../AppShell";
import { Spinner } from "../components/Feed";
import { COMMUNITY_CATEGORIES, discoverCommunities, fetchMyCommunities } from "../lib/api";
import { safeUrl } from "../lib/media";
import { compact } from "../lib/format";
import { useAppSession } from "../AppSession";

export function CommunityIcon({ src, name, className = "h-12 w-12" }) {
  const url = safeUrl(src);
  return url ? (
    <img src={url} alt="" loading="lazy" className={`${className} shrink-0 rounded-2xl bg-night-700 object-cover`} />
  ) : (
    <div className={`${className} grid shrink-0 place-items-center rounded-2xl bg-flare-gradient text-lg font-extrabold text-night-950`}>
      {(name || "?").trim()[0]?.toUpperCase()}
    </div>
  );
}

function CommunityRow({ c }) {
  const locked = c.type === "private" || c.visibility === "inviteOnly";
  return (
    <Link to={`/communities/${c.id}`} className="flex gap-3 rounded-2xl border border-line bg-night-800 p-3 transition-colors hover:border-flare/40 hover:bg-night-700/70">
      <CommunityIcon src={c.image_url} name={c.name} />
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1.5 truncate font-bold text-star">
          {c.name} {locked && <FiLock className="shrink-0 text-xs text-dust" aria-label="Private" />}
        </p>
        <p className="flex items-center gap-1.5 text-xs text-dust">
          <FiUsers /> {compact(c.member_count)} members{c.category ? ` · ${c.category}` : ""}
        </p>
        {c.description && <p className="mt-1 line-clamp-2 text-sm text-mist">{c.description}</p>}
      </div>
    </Link>
  );
}

export default function CommunitiesPage() {
  const { myId } = useAppSession();
  const [tab, setTab] = useState("mine");
  const [mine, setMine] = useState(null);
  const [found, setFound] = useState(null);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState(null);

  useEffect(() => {
    fetchMyCommunities(myId)
      .then((list) => {
        setMine(list);
        if (!list.length) setTab("discover"); // nothing joined yet — show what's out there
      })
      .catch(() => setMine([]));
  }, [myId]);

  useEffect(() => {
    if (tab !== "discover") return;
    let live = true;
    setFound(null);
    const t = setTimeout(() => {
      discoverCommunities({ q, category }).then((r) => live && setFound(r)).catch(() => live && setFound([]));
    }, 300);
    return () => { live = false; clearTimeout(t); };
  }, [tab, q, category]);

  const list = tab === "mine" ? mine : found;

  return (
    <AppShell title="Communities">
      <div className="sticky top-0 z-30 border-b border-line bg-night-900/85 backdrop-blur max-sm:top-[53px]">
        <div className="flex items-center justify-between px-4 pt-3">
          <h1 className="text-xl font-extrabold">Communities</h1>
          <Link to="/communities/new" className="btn-flare !px-4 !py-1.5 text-sm"><FiPlus /> Create</Link>
        </div>
        <div className="flex">
          {[["mine", "Your communities"], ["discover", "Discover"]].map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} aria-pressed={tab === id} className="flex flex-1 justify-center py-3.5 text-[15px] hover:bg-night-800">
              <span className={`relative ${tab === id ? "font-bold text-star" : "text-dust"}`}>
                {label}
                {tab === id && <span className="absolute -bottom-3.5 left-0 right-0 h-1 rounded-full bg-flare" />}
              </span>
            </button>
          ))}
        </div>
      </div>

      {tab === "discover" && (
        <div className="space-y-3 border-b border-line px-4 py-3">
          <label className="flex items-center gap-3 rounded-full border border-line bg-night-850 px-4 py-2.5 focus-within:border-flare">
            <FiSearch className="text-dust" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search communities" maxLength={80}
                   className="w-full bg-transparent text-sm text-star placeholder-dust focus:outline-none" />
            {q && <button onClick={() => setQ("")} aria-label="Clear" className="text-dust hover:text-star"><FiX /></button>}
          </label>
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
            {[null, ...COMMUNITY_CATEGORIES].map((cat) => (
              <button key={cat || "all"} onClick={() => setCategory(cat)}
                      className={`shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-colors ${
                        category === cat ? "border-transparent bg-flare-gradient text-night-950" : "border-line text-mist hover:text-star"}`}>
                {cat || "All"}
              </button>
            ))}
          </div>
        </div>
      )}

      {!list && <Spinner />}
      {list?.length === 0 && (
        <div className="px-8 py-16 text-center">
          {tab === "mine" ? (
            <>
              <p className="text-2xl font-extrabold">No communities yet</p>
              <p className="mt-2 text-mist">Find spaces for the things you love.</p>
              <button onClick={() => setTab("discover")} className="btn-flare mt-6 !py-2.5 text-sm">Discover communities</button>
            </>
          ) : (
            <p className="text-mist">No communities found.</p>
          )}
        </div>
      )}
      {list?.length > 0 && (
        <div className="space-y-2.5 p-3 sm:p-4">
          {list.map((c) => <CommunityRow key={c.id} c={c} />)}
        </div>
      )}
    </AppShell>
  );
}
