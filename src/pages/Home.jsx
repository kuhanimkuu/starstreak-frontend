import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { FiArrowRight, FiUsers, FiZap, FiLock, FiCompass, FiShield, FiBarChart2, FiEyeOff, FiClock, FiArchive, FiLayers } from "react-icons/fi";
import { supabase } from "../lib/supabase";
import Starfield from "../components/ui/Starfield";
import PhoneMockup from "../components/ui/PhoneMockup";
import Mascot from "../components/ui/Mascot";
import Section, { Eyebrow, Reveal } from "../components/ui/Section";

const PILLARS = [
  {
    icon: FiUsers,
    pose: "chat",
    title: "Communities",
    body: "Spaces for the things you love — with sub-communities, roles, polls and real moderation tools.",
  },
  {
    icon: FiZap,
    pose: "stopwatch",
    title: "Flashes",
    body: "Live, time-limited spaces that flare up around a moment — a match, a launch, a campus event.",
  },
  {
    icon: FiLock,
    pose: "wave",
    title: "Private messages",
    body: "End-to-end encrypted DMs with typing indicators and online status. Only you and them.",
  },
];

const FEATURES = [
  { icon: FiCompass, title: "Discovery", body: "Live flashes, rising communities and people worth following." },
  { icon: FiBarChart2, title: "Polls", body: "Ask the room. Multiple options, expiry times and live results." },
  { icon: FiEyeOff, title: "Anonymous posts", body: "Say it without your name — your identity is never attached." },
  { icon: FiShield, title: "Real moderation", body: "Admins, moderators, bans and reports that actually work." },
  { icon: FiLayers, title: "Sub-communities", body: "Big communities split into focused rooms without losing the crowd." },
  { icon: FiArchive, title: "Clean endings", body: "When a flash ends it archives neatly — no dead group chats." },
];

const STEPS = [
  { n: "01", title: "Get the app", body: "Create your account in seconds and pick what you’re into." },
  { n: "02", title: "Find your people", body: "Join communities, follow creators and catch live flashes." },
  { n: "03", title: "Light it up", body: "Post, vote, chat and start flashes of your own." },
];

function Hero() {
  return (
    <section className="relative overflow-hidden bg-night-gradient pt-32 md:pt-40">
      <Starfield density={90} />
      <div className="glow-flare absolute -top-32 right-[-10%] h-[620px] w-[620px] opacity-70" />
      <div className="glow-indigo absolute top-1/3 left-[-15%] h-[520px] w-[520px]" />

      <div className="container-ss relative grid items-center gap-16 pb-20 lg:grid-cols-12 lg:pb-28">
        <div className="animate-fade-up lg:col-span-6">
          <Eyebrow>Communities that light up</Eyebrow>
          <h1 className="h-display mt-7 text-[3.3rem] text-star sm:text-7xl lg:text-[5.2rem]">
            Find your people.
            <br />
            <span className="text-flare-gradient">Light up the moment.</span>
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-relaxed text-mist md:text-xl">
            Starstreak is a social app built around real communities and live Flash moments — spaces that flare up
            when something’s happening, and archive cleanly when it’s over.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link to="/download" className="btn-flare text-lg">
              Get the app <FiArrowRight />
            </Link>
            <Link to="/features" className="btn-ghost text-lg">
              See what’s inside
            </Link>
          </div>
          <p className="mt-6 text-sm text-dust">Free to join · Android &amp; iOS · Made in Nairobi</p>
        </div>

        <div className="relative lg:col-span-6">
          <div className="relative mx-auto flex max-w-lg justify-center">
            <div className="absolute -left-2 top-16 hidden rotate-[-8deg] opacity-80 blur-[0.3px] sm:block">
              <PhoneMockup screen="flash" className="!w-[230px] scale-90" />
            </div>
            <div className="relative z-10 sm:translate-x-16">
              <PhoneMockup screen="feed" />
            </div>
            <Mascot pose="wave" className="absolute -bottom-6 -right-2 z-20 w-28 sm:w-36" />
          </div>
        </div>
      </div>
    </section>
  );
}

function Stats() {
  // Only shown when ops has published real numbers (platform_content.home_stats).
  const [stats, setStats] = useState(null);
  useEffect(() => {
    supabase
      .from("platform_content")
      .select("content")
      .eq("key", "home_stats")
      .single()
      .then(({ data }) => {
        if (!data?.content) return;
        try {
          const s = JSON.parse(data.content);
          const list = [
            [s.members, "Members"],
            [s.communities, "Communities"],
            [s.connections, "Connections made"],
            [s.support, "Support & safety"],
          ].filter(([v]) => v);
          if (list.length) setStats(list);
        } catch {
          // ignore malformed content
        }
      });
  }, []);
  if (!stats) return null;
  return (
    <div className="border-y border-line bg-night-850">
      <div className="container-ss grid grid-cols-2 gap-8 py-10 md:grid-cols-4">
        {stats.map(([v, label]) => (
          <div key={label} className="text-center">
            <p className="h-display text-flare-gradient text-4xl md:text-5xl">{v}</p>
            <p className="mt-1 text-sm text-mist">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function FlashSpotlight() {
  const points = [
    { icon: FiClock, title: "Live countdown", body: "Every flash has a timer — the clock is part of the fun." },
    { icon: FiZap, title: "Instant crowd", body: "Discover what’s live right now and jump straight in." },
    { icon: FiArchive, title: "Ends cleanly", body: "When time’s up it archives, or the crew decides to keep it." },
  ];
  return (
    <section className="relative overflow-hidden py-24 md:py-32">
      <div className="glow-flare absolute left-1/2 top-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 opacity-40" />
      <div className="container-ss relative grid items-center gap-16 lg:grid-cols-2">
        <Reveal className="order-2 lg:order-1">
          <PhoneMockup screen="flash" />
        </Reveal>
        <Reveal className="order-1 lg:order-2">
          <Eyebrow>Only on Starstreak</Eyebrow>
          <h2 className="h-display mt-6 text-4xl text-star md:text-6xl">
            Flashes.
            <br />
            <span className="text-flare-gradient">Here for the moment.</span>
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-mist">
            A big game, a campus event, breaking news. Start a Flash, the crowd shows up, and when it’s over it
            archives cleanly. No dead group chats.
          </p>
          <ul className="mt-10 space-y-6">
            {points.map(({ icon: Icon, title, body }) => (
              <li key={title} className="flex gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-flare/15 text-flare">
                  <Icon size={20} />
                </span>
                <div>
                  <p className="font-bold text-star">{title}</p>
                  <p className="text-mist">{body}</p>
                </div>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <>
      <Hero />
      <Stats />

      <Section
        eyebrow="Three ways to belong"
        title={
          <>
            Built for how people <span className="text-flare-gradient">actually</span> hang out.
          </>
        }
        intro="Long-running communities, live moments, and private conversations — all in one place."
      >
        <div className="grid gap-6 md:grid-cols-3">
          {PILLARS.map(({ icon: Icon, pose, title, body }, i) => (
            <Reveal key={title} delay={i * 100} className="card-night card-hover group relative overflow-hidden p-8">
              <Mascot
                pose={pose}
                float={false}
                className="absolute -right-6 -top-6 w-32 opacity-90 transition-transform duration-500 group-hover:-translate-y-1 group-hover:rotate-3"
              />
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-flare-gradient text-night-950">
                <Icon size={22} />
              </span>
              <h3 className="mt-16 text-2xl font-bold text-star">{title}</h3>
              <p className="mt-3 leading-relaxed text-mist">{body}</p>
            </Reveal>
          ))}
        </div>
      </Section>

      <FlashSpotlight />

      <Section
        className="border-t border-line bg-night-850"
        eyebrow="Everything you need"
        title="Small details, big difference."
      >
        <div className="grid gap-px overflow-hidden rounded-3xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, body }) => (
            <div key={title} className="bg-night-850 p-8 transition-colors hover:bg-night-800">
              <Icon className="text-accent" size={22} />
              <h3 className="mt-5 text-lg font-bold text-star">{title}</h3>
              <p className="mt-2 leading-relaxed text-mist">{body}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link to="/features" className="inline-flex items-center gap-2 font-semibold text-accent hover:text-gold">
            Explore all features <FiArrowRight />
          </Link>
        </div>
      </Section>

      <Section eyebrow="Getting started" title="Three steps to your first flash.">
        <div className="grid gap-6 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={i * 100} className="relative rounded-3xl border border-line p-8">
              <span className="text-flare-gradient text-5xl font-extrabold">{s.n}</span>
              <h3 className="mt-6 text-xl font-bold text-star">{s.title}</h3>
              <p className="mt-2 text-mist">{s.body}</p>
              {i < STEPS.length - 1 && (
                <span className="absolute -right-4 top-1/2 hidden h-px w-8 bg-gradient-to-r from-flare to-transparent md:block" />
              )}
            </Reveal>
          ))}
        </div>
      </Section>
    </>
  );
}
