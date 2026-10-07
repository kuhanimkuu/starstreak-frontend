import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiZap, FiUsers, FiMapPin, FiPlus } from "react-icons/fi";
import AppShell from "../AppShell";
import { Spinner } from "../components/Feed";
import { CommunityIcon } from "./CommunitiesPage";
import { fetchLiveFlashes, fetchMyFlashes } from "../lib/api";
import { compact } from "../lib/format";
import { useAppSession } from "../AppSession";

/** Time left, colour-coded like the app: red < 1h, orange < 6h, amber < 24h, green after. */
export function useCountdown(expiresAt) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(t);
  }, []);
  if (!expiresAt) return { label: "Live", tone: "bg-emerald-500/15 text-emerald-400", over: false };
  const ms = new Date(expiresAt).getTime() - now;
  if (ms <= 0) return { label: "Ended", tone: "bg-night-700 text-dust", over: true };
  const h = ms / 3600000;
  const label = h >= 24 ? `${Math.floor(h / 24)}d ${Math.floor(h % 24)}h left` : h >= 1 ? `${Math.floor(h)}h ${Math.floor((ms % 3600000) / 60000)}m left` : `${Math.max(1, Math.floor(ms / 60000))}m left`;
  const tone = h < 1 ? "bg-red-500/15 text-red-400" : h < 6 ? "bg-orange-500/15 text-orange-400" : h < 24 ? "bg-amber-500/15 text-amber-400" : "bg-emerald-500/15 text-emerald-400";
  return { label, tone, over: false };
}

function FlashRow({ f }) {
  const { label, tone } = useCountdown(f.expires_at);
  return (
    <Link to={`/flashes/${f.id}`} className="flex gap-3 rounded-2xl border border-line bg-night-800 p-3 transition-colors hover:border-flare/40 hover:bg-night-700/70">
      <CommunityIcon src={f.image_url} name={f.name} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="min-w-0 flex-1 truncate font-bold text-star">{f.name}</p>
          <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold ${tone}`}>{label}</span>
        </div>
        <p className="flex flex-wrap items-center gap-x-3 text-xs text-dust">
          <span className="flex items-center gap-1"><FiUsers /> {compact(f.member_count)}</span>
          {f.location_name && <span className="flex items-center gap-1"><FiMapPin /> {f.location_name}</span>}
          {f.category && <span>{f.category}</span>}
        </p>
        {f.description && <p className="mt-1 line-clamp-2 text-sm text-mist">{f.description}</p>}
      </div>
    </Link>
  );
}

export default function FlashesPage() {
  const { myId } = useAppSession();
  const [tab, setTab] = useState("live");
  const [live, setLive] = useState(null);
  const [mine, setMine] = useState(null);

  useEffect(() => {
    fetchLiveFlashes().then(setLive).catch(() => setLive([]));
    fetchMyFlashes(myId).then(setMine).catch(() => setMine([]));
  }, [myId]);

  const list = tab === "live" ? live : mine;

  return (
    <AppShell title="Flashes">
      <div className="sticky top-0 z-30 border-b border-line bg-night-900/85 backdrop-blur max-sm:top-[53px]">
        <div className="flex items-center justify-between px-4 pt-3">
          <h1 className="flex items-center gap-2 text-xl font-extrabold"><FiZap className="text-flare" /> Flashes</h1>
          <Link to="/flashes/new" className="btn-flare !px-4 !py-1.5 text-sm"><FiPlus /> Start one</Link>
        </div>
        <div className="flex">
          {[["live", "Live now"], ["mine", "Your Flashes"]].map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} aria-pressed={tab === id} className="flex flex-1 justify-center py-3.5 text-[15px] hover:bg-night-800">
              <span className={`relative ${tab === id ? "font-bold text-star" : "text-dust"}`}>
                {label}
                {tab === id && <span className="absolute -bottom-3.5 left-0 right-0 h-1 rounded-full bg-flare" />}
              </span>
            </button>
          ))}
        </div>
      </div>
      <p className="border-b border-line px-4 py-2.5 text-sm text-mist">
        Flashes are short-lived spaces that flare up around a moment — a match, a launch, a campus event — then fade.
      </p>
      {!list && <Spinner />}
      {list?.length === 0 && (
        <p className="px-8 py-16 text-center text-mist">{tab === "live" ? "No Flashes live right now. Check back soon." : "You haven't joined any Flashes."}</p>
      )}
      {list?.length > 0 && <div className="space-y-2.5 p-3 sm:p-4">{list.map((f) => <FlashRow key={f.id} f={f} />)}</div>}
    </AppShell>
  );
}
