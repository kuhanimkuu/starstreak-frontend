import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FiUsers, FiMapPin, FiLock } from "react-icons/fi";
import AppShell from "../AppShell";
import Composer from "../components/Composer";
import Feed, { Spinner } from "../components/Feed";
import { CommunityIcon } from "./CommunitiesPage";
import { useCountdown } from "./FlashesPage";
import { BackHeader, UUID } from "./PostPage";
import { fetchFlash, flashScheduleInfo, flashStatus, joinFlash, leaveFlash, toggleFlashReminder } from "../lib/api";
import { flashAdapter } from "../lib/adapters";
import { safeUrl } from "../lib/media";
import { compact } from "../lib/format";
import { useAppSession } from "../AppSession";

export default function FlashPage() {
  const { flashId } = useParams();
  const { myId, notify } = useAppSession();
  const [f, setF] = useState(undefined);
  const [busy, setBusy] = useState(false);
  const [fresh, setFresh] = useState(null);

  const reload = useCallback(async () => {
    if (!UUID.test(flashId || "")) return setF(null);
    try {
      setF((await fetchFlash(flashId)) || null);
    } catch {
      setF(null);
    }
  }, [flashId]);

  useEffect(() => {
    setF(undefined);
    reload();
  }, [reload]);

  const adapter = useMemo(() => (f ? flashAdapter(f) : null), [f]);
  const load = useCallback((before) => adapter.fetchPage(before), [adapter]);
  const status = flashStatus(f, myId);
  const countdown = useCountdown(f?.expires_at);

  async function act(kind) {
    if (busy) return;
    if (kind === "leave" && !window.confirm(`Leave ${f.name}?`)) return;
    setBusy(true);
    try {
      await (kind === "join" ? joinFlash(f.id) : leaveFlash(f.id));
      notify(kind === "join" ? `You're in ${f.name} ⚡` : `You left ${f.name}`);
      await reload();
    } catch (e) {
      notify(e.message, "error");
    } finally {
      setBusy(false);
    }
  }

  if (f === undefined) return <AppShell title="Flash"><BackHeader title="Flash" /><Spinner /></AppShell>;
  if (f === null) {
    return (
      <AppShell title="Flash">
        <BackHeader title="Flash" />
        <div className="px-8 py-16 text-center">
          <p className="text-2xl font-extrabold">This Flash isn't available</p>
          <p className="mt-2 text-mist">It may be private or no longer exist.</p>
          <Link to="/flashes" className="btn-ghost mt-6 !py-2.5 text-sm">See live Flashes</Link>
        </div>
      </AppShell>
    );
  }

  const cover = safeUrl(f.cover_image_url);
  const upcoming = f.starts_at && new Date(f.starts_at) > new Date();
  const locked = f.visibility && !["public", "limited"].includes(f.visibility);

  let action = null;
  if (status.role === "banned") action = <span className="rounded-full bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-400">Banned</span>;
  else if (status.member) {
    action = f.creator_id === myId ? null : (
      <button onClick={() => act("leave")} disabled={busy} className="rounded-full border border-night-600 px-5 py-2 text-sm font-semibold text-star hover:border-red-500/60 hover:text-red-400">Leave</button>
    );
  } else if (status.live) action = <button onClick={() => act("join")} disabled={busy} className="btn-flare !px-5 !py-2 text-sm">Join Flash</button>;

  return (
    <AppShell title={f.name}>
      <BackHeader title={f.name} subtitle={`${compact(f.member_count)} members`}>
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${countdown.tone}`}>{countdown.label}</span>
      </BackHeader>
      <div className="h-28 sm:h-36" style={cover ? { backgroundImage: `url("${cover}")`, backgroundSize: "cover", backgroundPosition: "center" } : { backgroundImage: "linear-gradient(135deg,#FF6D1F55,#1A1D3D 55%,#343868)" }} />
      <div className="px-4">
        <div className="-mt-10 flex items-end justify-between gap-3">
          <CommunityIcon src={f.image_url} name={f.name} className="h-20 w-20 border-4 border-night-900" />
          <div className="mb-1">{action}</div>
        </div>
        <h2 className="mt-3 flex items-center gap-2 text-xl font-extrabold">{f.name} {locked && <FiLock className="text-base text-dust" />}</h2>
        <p className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-dust">
          <span className="flex items-center gap-1.5"><FiUsers /> {compact(f.member_count)} members</span>
          {f.location_name && <span className="flex items-center gap-1.5"><FiMapPin /> {f.location_name}</span>}
        </p>
        {f.description && <p className="mt-3 whitespace-pre-wrap text-[15px] text-star">{f.description}</p>}
        {upcoming && <UpcomingBanner flashId={f.id} startsAt={f.starts_at} />}
      </div>

      <div className="mt-4 border-t border-line">
        {status.canPost && <div className="border-b border-line"><Composer adapter={adapter} onPosted={setFresh} placeholder={`Post in ${f.name}`} /></div>}
        {!status.live && <p className="border-b border-line px-4 py-3 text-center text-sm text-dust">This Flash has ended — posts are read-only.</p>}
        {status.live && !status.member && status.role !== "banned" && (
          <p className="border-b border-line px-4 py-3 text-center text-sm text-dust">Join the Flash to post.</p>
        )}
        <Feed key={f.id} load={load} adapter={adapter} prepend={fresh} showCommunity={false}
              empty={<p className="px-8 py-16 text-center text-mist">Nothing posted yet.</p>} />
      </div>
    </AppShell>
  );
}

/** Scheduled Flash before its start: when, and "Notify me" (the reminder
 *  is a push to the Starstreak app, 30 minutes before and at the start). */
function UpcomingBanner({ flashId, startsAt }) {
  const { notify } = useAppSession();
  const [info, setInfo] = useState(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    flashScheduleInfo(flashId).then(setInfo);
  }, [flashId]);
  const start = new Date(startsAt);
  const when = start.toLocaleString(undefined, { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  async function toggle() {
    setBusy(true);
    try {
      setInfo(await toggleFlashReminder(flashId));
    } catch (e) {
      notify(e.message, "error");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="mt-4 rounded-2xl border border-flare/60 bg-night-800 p-4">
      <p className="text-lg font-extrabold text-star">Starts {when}</p>
      <p className="mt-1 text-sm text-mist">
        Join now, post and make predictions. Moments unlock at the start.
        {info?.reminder_count ? ` ${info.reminder_count} waiting.` : ""}
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button onClick={toggle} disabled={busy} className={info?.reminded ? "btn-ghost !py-2 text-sm" : "btn-flare !py-2 text-sm"}>
          {info?.reminded ? "You'll be notified" : "Notify me"}
        </button>
        <span className="text-xs text-dust">Reminders arrive in the Starstreak app.</span>
      </div>
    </div>
  );
}
