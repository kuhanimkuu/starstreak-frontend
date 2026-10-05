import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaApple, FaGooglePlay } from "react-icons/fa";
import { STORE_LINKS } from "../lib/storeLinks";
import Starfield from "./ui/Starfield";
import Mascot from "./ui/Mascot";

// App-internal identifiers — the app registers these, so they must not change with the rebrand.
const APP_SCHEME = "nexora:/";

const COPY = {
  post: { pose: "chat", title: "Someone shared a post with you", body: "Open it in Starstreak to read, react and join the conversation." },
  community: { pose: "wave", title: "You’re invited to a community", body: "Open Starstreak to see what’s happening and join in." },
  profile: { pose: "wave", title: "Check out this profile", body: "Open Starstreak to see their posts and connect." },
  invite: { pose: "celebrate", title: "You’ve been invited!", body: "Someone wants you in their group on Starstreak." },
  chat: { pose: "chat", title: "Continue the conversation", body: "Your chat is waiting in the Starstreak app." },
};
const FALLBACK = { pose: "main", title: "Open in Starstreak", body: "This link opens in the Starstreak app." };

function isMobileUA() {
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

export default function DeepLinkHandler({ type }) {
  const location = useLocation();
  const appUrl = `${APP_SCHEME}${location.pathname}`;
  const [mobile] = useState(isMobileUA);
  const [trying, setTrying] = useState(mobile);
  const copy = COPY[type] || FALLBACK;

  useEffect(() => {
    if (!isMobileUA()) return;
    window.location.href = appUrl;

    // If the app didn't take over, send people to the store — but only once a
    // real listing exists; until then they stay here and see "coming soon".
    const timeout = setTimeout(() => {
      setTrying(false);
      const store = /Android/i.test(navigator.userAgent) ? STORE_LINKS.android : STORE_LINKS.ios;
      if (store && document.visibilityState === "visible") window.location.href = store;
    }, 2000);
    return () => clearTimeout(timeout);
  }, [appUrl]);

  const anyStore = STORE_LINKS.android || STORE_LINKS.ios;

  return (
    <section className="relative overflow-hidden bg-night-gradient pt-32 pb-24 md:pt-40">
      <Starfield density={55} />
      <div className="glow-flare absolute -top-40 left-1/2 h-[480px] w-[780px] -translate-x-1/2 opacity-60" />
      <div className="container-ss relative flex max-w-xl flex-col items-center text-center">
        <Mascot pose={copy.pose} className="w-36" />
        <h1 className="h-display mt-6 text-4xl text-star md:text-5xl">{copy.title}</h1>
        <p className="mt-4 text-lg text-mist">{copy.body}</p>

        {trying ? (
          <div className="mt-10 flex items-center gap-3 text-mist">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-night-600 border-t-flare" />
            Opening Starstreak…
          </div>
        ) : (
          mobile && (
            <a href={appUrl} className="btn-flare mt-10">
              Open in the app
            </a>
          )
        )}

        <div className="card-night mt-12 w-full p-6">
          <p className="font-semibold text-star">Don’t have Starstreak yet?</p>
          {anyStore ? (
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              {STORE_LINKS.android && (
                <a href={STORE_LINKS.android} className="btn-ghost !py-2.5 text-sm">
                  <FaGooglePlay /> Google Play
                </a>
              )}
              {STORE_LINKS.ios && (
                <a href={STORE_LINKS.ios} className="btn-ghost !py-2.5 text-sm">
                  <FaApple /> App Store
                </a>
              )}
            </div>
          ) : (
            <p className="mt-2 text-sm text-mist">
              The app is landing on Android and iOS soon.{" "}
              <Link to="/download" className="font-semibold text-accent hover:text-gold">
                Find out more
              </Link>
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
