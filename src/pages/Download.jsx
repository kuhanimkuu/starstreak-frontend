import { Link } from "react-router-dom";
import { FaApple, FaGooglePlay } from "react-icons/fa";
import Starfield from "../components/ui/Starfield";
import PhoneMockup from "../components/ui/PhoneMockup";
import Mascot from "../components/ui/Mascot";
import { Eyebrow } from "../components/ui/Section";
import { STORE_LINKS } from "../lib/storeLinks";

const INCLUDED = [
  "Communities & sub-communities",
  "Live Flashes",
  "End-to-end encrypted messages",
  "Feed with posts, polls & media",
  "Anonymous posting",
  "Privacy & data controls",
];

function StoreBadge({ href, icon: Icon, small, big }) {
  const live = Boolean(href);
  const Tag = live ? "a" : "div";
  return (
    <Tag
      {...(live ? { href, target: "_blank", rel: "noreferrer" } : { "aria-disabled": true })}
      className={`flex items-center gap-3 rounded-2xl border px-6 py-3.5 transition-all ${
        live
          ? "border-night-500 bg-night-950 text-star hover:-translate-y-0.5 hover:border-flare/60"
          : "cursor-default border-dashed border-night-600 bg-night-900/60 text-mist"
      }`}
    >
      <Icon className="text-3xl" />
      <div className="text-left leading-tight">
        <div className="text-xs opacity-75">{live ? small : "Coming soon to"}</div>
        <div className="text-lg font-bold">{big}</div>
      </div>
    </Tag>
  );
}

export default function Download() {
  const anyLive = STORE_LINKS.android || STORE_LINKS.ios;
  return (
    <>
      <section className="relative overflow-hidden bg-night-gradient pt-36 pb-24 md:pt-44">
        <Starfield density={80} />
        <div className="glow-flare absolute -top-20 left-1/2 h-[600px] w-[900px] -translate-x-1/2 opacity-70" />
        <div className="container-ss relative grid items-center gap-16 lg:grid-cols-2">
          <div className="animate-fade-up">
            <Eyebrow>{anyLive ? "Free on Android & iOS" : "Launching soon"}</Eyebrow>
            <h1 className="h-display mt-7 text-5xl text-star md:text-7xl">
              Starstreak,
              <br />
              <span className="text-flare-gradient">in your pocket.</span>
            </h1>
            <p className="mt-6 max-w-lg text-lg text-mist md:text-xl">
              Communities, live flashes and private messages — the full Starstreak experience, free.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <StoreBadge href={STORE_LINKS.android} icon={FaGooglePlay} small="Get it on" big="Google Play" />
              <StoreBadge href={STORE_LINKS.ios} icon={FaApple} small="Download on the" big="App Store" />
            </div>
            {!anyLive && (
              <p className="mt-6 text-sm text-dust">
                We’re putting the finishing touches on the app. Follow{" "}
                <Link to="/blog" className="text-accent hover:text-gold">
                  our updates
                </Link>{" "}
                to hear the moment it lands.
              </p>
            )}
          </div>
          <div className="relative">
            <PhoneMockup screen="feed" />
            <Mascot pose="wave" className="absolute -left-4 bottom-10 w-32 md:-left-10 md:w-40" />
          </div>
        </div>
      </section>

      <section className="border-t border-line py-20 md:py-28">
        <div className="container-ss">
          <h2 className="h-display text-center text-4xl text-star md:text-5xl">Everything in the app</h2>
          <div className="mx-auto mt-12 grid max-w-4xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {INCLUDED.map((f) => (
              <div key={f} className="card-night flex items-center gap-3 p-5">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-flare/15 text-gold">✦</span>
                <span className="font-medium text-star">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
