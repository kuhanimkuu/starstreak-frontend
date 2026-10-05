import { Link } from "react-router-dom";
import {
  FiUsers,
  FiZap,
  FiHome,
  FiMessageCircle,
  FiUser,
  FiCompass,
  FiShield,
  FiEyeOff,
  FiBell,
  FiBarChart2,
  FiArrowRight,
} from "react-icons/fi";
import { PageHero, Reveal } from "../components/ui/Section";
import PhoneMockup from "../components/ui/PhoneMockup";
import Mascot from "../components/ui/Mascot";

// Only features that exist in the app today.
const FEATURES = [
  {
    id: "communities",
    icon: FiUsers,
    title: "Communities",
    tag: "Your long-running hubs",
    body: "Topic-driven spaces where members post, comment, vote and organise. Public, private, local or regional — with sub-communities for focused rooms.",
    points: ["Admins & moderators with real tools", "Sub-communities and categories", "Notices, polls and pinned posts"],
    visual: { pose: "chat" },
  },
  {
    id: "flash",
    icon: FiZap,
    title: "Flashes",
    tag: "Here for the moment",
    body: "Time-limited spaces for live moments — a match, a launch, a campus event. A visible countdown keeps the energy up, and when time’s up the Flash archives cleanly or the crew decides to keep it.",
    points: ["Live countdown & urgency", "Sub-flashes for side conversations", "Keep-or-archive decision at the end"],
    visual: { phone: "flash" },
  },
  {
    id: "feed",
    icon: FiHome,
    title: "Global feed",
    tag: "What’s happening now",
    body: "Posts from your communities and the people you follow — with images, video, documents, links and polls, right in the feed.",
    points: ["Rich media & documents", "Polls with expiry & live results", "Live flashes surfaced at the top"],
    visual: { phone: "feed" },
  },
  {
    id: "messages",
    icon: FiMessageCircle,
    title: "Private messages",
    tag: "End-to-end encrypted",
    body: "Direct messages are encrypted end to end — only you and the person you’re talking to can read them. Typing indicators and online status make it feel alive.",
    points: ["End-to-end encryption", "Typing & online indicators", "Media, reactions and stickers"],
    visual: { phone: "chat" },
  },
  {
    id: "anonymous",
    icon: FiEyeOff,
    title: "Anonymous posting",
    tag: "Say it without your name",
    body: "Post anonymously when you need to. Your name, photo and username are never attached to anonymous posts — not in the app, and not in the data.",
    points: ["Anonymous name per user", "No avatar or username leaks", "Moderation still applies"],
    visual: { pose: "search" },
  },
  {
    id: "discovery",
    icon: FiCompass,
    title: "Discovery",
    tag: "Find your people",
    body: "Explore live flashes, trending communities and people worth following — with category filters and a peek at the hottest discussion in each community.",
    points: ["Live / Communities / People tabs", "Trending post previews", "Category chips"],
    visual: { pose: "wave" },
  },
];

const MORE = [
  { icon: FiUser, title: "Profiles", body: "Your posts, communities and a verified ring if you’ve earned it." },
  { icon: FiShield, title: "Moderation", body: "Reports, bans, role history and a moderation dashboard." },
  { icon: FiBell, title: "Notifications", body: "Mentions, replies and community updates — plus a daily digest." },
  { icon: FiBarChart2, title: "Community analytics", body: "See how your community is growing and what’s landing." },
];

function Visual({ visual }) {
  if (visual.phone) return <PhoneMockup screen={visual.phone} />;
  return (
    <div className="relative mx-auto grid aspect-square w-full max-w-sm place-items-center">
      <div className="glow-flare absolute inset-0" />
      <div className="absolute inset-8 rounded-full border border-line" />
      <div className="absolute inset-20 rounded-full border border-line/60" />
      <Mascot pose={visual.pose} className="relative w-56" />
    </div>
  );
}

export default function Features() {
  return (
    <>
      <PageHero
        eyebrow="Features"
        title={
          <>
            Everything you need to <span className="text-flare-gradient">belong.</span>
          </>
        }
        intro="Communities for the long run, flashes for the moment, and private messages for the people who matter."
        mascot={<Mascot pose="celebrate" className="w-64" />}
      >
        <nav className="mt-10 flex flex-wrap gap-2" aria-label="Jump to feature">
          {FEATURES.map((f) => (
            <a
              key={f.id}
              href={`#${f.id}`}
              className="rounded-full border border-line bg-night-800/70 px-4 py-2 text-sm text-mist transition-colors hover:border-flare/50 hover:text-star"
            >
              {f.title}
            </a>
          ))}
        </nav>
      </PageHero>

      <div className="container-ss">
        {FEATURES.map((f, i) => {
          const Icon = f.icon;
          return (
            <section
              key={f.id}
              id={f.id}
              className="grid scroll-mt-24 items-center gap-14 border-b border-line py-20 last:border-0 md:py-28 lg:grid-cols-2"
            >
              <Reveal className={i % 2 ? "lg:order-2" : ""}>
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-flare-gradient text-night-950">
                  <Icon size={22} />
                </span>
                <p className="mt-6 text-sm font-semibold text-accent">{f.tag}</p>
                <h2 className="h-display mt-2 text-4xl text-star md:text-5xl">{f.title}</h2>
                <p className="mt-5 text-lg leading-relaxed text-mist">{f.body}</p>
                <ul className="mt-8 space-y-3">
                  {f.points.map((p) => (
                    <li key={p} className="flex items-center gap-3 text-star">
                      <span className="text-gold">✦</span>
                      {p}
                    </li>
                  ))}
                </ul>
              </Reveal>
              <Reveal className={i % 2 ? "lg:order-1" : ""} delay={120}>
                <Visual visual={f.visual} />
              </Reveal>
            </section>
          );
        })}
      </div>

      <section className="border-t border-line bg-night-850 py-20 md:py-28">
        <div className="container-ss">
          <h2 className="h-display text-center text-4xl text-star md:text-5xl">And plenty more.</h2>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {MORE.map(({ icon: Icon, title, body }) => (
              <div key={title} className="card-night p-7">
                <Icon size={22} className="text-accent" />
                <h3 className="mt-5 text-lg font-bold text-star">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-mist">{body}</p>
              </div>
            ))}
          </div>
          <p className="mt-12 text-center text-mist">
            Curious what’s next?{" "}
            <Link to="/roadmap" className="inline-flex items-center gap-1 font-semibold text-accent hover:text-gold">
              See the roadmap <FiArrowRight />
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}
