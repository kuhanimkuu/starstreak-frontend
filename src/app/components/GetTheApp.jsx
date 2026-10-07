import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaApple, FaGooglePlay } from "react-icons/fa";
import { FiX } from "react-icons/fi";
import Mascot from "../../components/ui/Mascot";
import { STORE_LINKS } from "../../lib/storeLinks";

/**
 * The web app is the lighter version of Starstreak. These point people to the
 * phone app for the full experience (messages, starting communities and
 * Flashes, running a community, polls…).
 */

export function StoreButtons({ small = false }) {
  const any = STORE_LINKS.android || STORE_LINKS.ios;
  const cls = `btn-ghost ${small ? "!px-4 !py-2 text-sm" : "!py-2.5 text-sm"}`;
  if (!any) {
    return (
      <Link to="/download" className={`btn-flare ${small ? "!px-4 !py-2 text-sm" : "!py-2.5 text-sm"}`}>
        Get the app
      </Link>
    );
  }
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {STORE_LINKS.android && <a href={STORE_LINKS.android} className={cls}><FaGooglePlay /> Google Play</a>}
      {STORE_LINKS.ios && <a href={STORE_LINKS.ios} className={cls}><FaApple /> App Store</a>}
    </div>
  );
}

const FEATURES = {
  messages: { pose: "chat", title: "Messages live in the app", body: "Chat privately with end-to-end encryption, share photos, react and reply — all in the Starstreak app." },
  community: { pose: "celebrate", title: "Start a community in the app", body: "Create your own community, set its rules and invite people from the Starstreak app." },
  flash: { pose: "stopwatch", title: "Start a Flash in the app", body: "Light up a Flash for a match, a launch or a campus event — straight from the Starstreak app." },
  manage: { pose: "main", title: "Run your community in the app", body: "Approve members, choose moderators and keep things friendly from the Starstreak app." },
  poll: { pose: "search", title: "Polls are made in the app", body: "Ask the crowd with a poll from the Starstreak app. You can still vote on polls here." },
  default: { pose: "wave", title: "Get the full Starstreak", body: "The web is the lighter version. Messages, Flashes, communities and more are waiting in the app." },
};

/** Full-page prompt for an app-only feature. */
export function AppOnly({ feature = "default", children }) {
  const f = FEATURES[feature] || FEATURES.default;
  return (
    <div className="flex flex-col items-center px-8 py-14 text-center">
      <Mascot pose={f.pose} className="w-32" />
      <h2 className="mt-6 text-2xl font-extrabold text-star">{f.title}</h2>
      <p className="mt-2 max-w-sm text-mist">{f.body}</p>
      <div className="mt-6"><StoreButtons /></div>
      {children}
    </div>
  );
}

/** Modal prompt (when someone taps an app-only button). */
export function AppOnlyModal({ feature, onClose }) {
  useEffect(() => {
    const esc = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4" onMouseDown={onClose} role="dialog" aria-modal>
      <div className="relative w-full max-w-sm rounded-3xl border border-line bg-night-900" onMouseDown={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full text-dust hover:bg-night-700 hover:text-star" aria-label="Close"><FiX /></button>
        <AppOnly feature={feature} />
      </div>
    </div>
  );
}

const DISMISS_KEY = "ss_get_app_dismissed_until";
function dismissedNow() {
  try {
    return Number(localStorage.getItem(DISMISS_KEY) || 0) > Date.now();
  } catch {
    return false;
  }
}

/** Gentle, dismissible nudge (hidden for 2 weeks after dismissing). */
export function GetAppNudge({ variant = "card" }) {
  const [hidden, setHidden] = useState(dismissedNow);
  if (hidden) return null;
  const dismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now() + 14 * 86400000));
    } catch { /* fine — just hides for now */ }
    setHidden(true);
  };
  if (variant === "banner") {
    return (
      <div className="flex items-center gap-3 border-b border-line bg-flare/10 px-4 py-2.5 sm:hidden">
        <Mascot pose="wave" float={false} className="h-9 w-9 shrink-0" />
        <p className="min-w-0 flex-1 text-sm text-star">Get the full Starstreak — messages, Flashes and more.</p>
        <StoreButtons small />
        <button onClick={dismiss} className="text-dust hover:text-star" aria-label="Dismiss"><FiX /></button>
      </div>
    );
  }
  return (
    <section className="relative rounded-2xl border border-flare/30 bg-night-850 p-4">
      <button onClick={dismiss} className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full text-dust hover:bg-night-700 hover:text-star" aria-label="Dismiss"><FiX /></button>
      <div className="flex items-center gap-3">
        <Mascot pose="wave" float={false} className="h-12 w-12 shrink-0" />
        <div>
          <p className="font-extrabold text-star">Get the full experience</p>
          <p className="text-sm text-mist">Messages, Flashes, polls and running communities are in the app.</p>
        </div>
      </div>
      <div className="mt-3"><StoreButtons small /></div>
    </section>
  );
}
