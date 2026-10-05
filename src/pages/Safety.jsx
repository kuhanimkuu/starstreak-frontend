import { Link } from "react-router-dom";
import { FiFlag, FiSlash, FiLock, FiShield, FiHeart, FiBookOpen, FiEyeOff, FiPhone, FiArrowRight } from "react-icons/fi";
import Section, { PageHero, Reveal } from "../components/ui/Section";
import Mascot from "../components/ui/Mascot";

const TOOLS = [
  {
    icon: FiFlag,
    title: "Report anything",
    body: "Report harmful or inappropriate posts, comments, profiles, communities or chats right where you see them. Reports go to our moderation team.",
  },
  {
    icon: FiSlash,
    title: "Block & mute",
    body: "If someone is bothering you, block or mute them. Blocking stops them messaging you or interacting with your content.",
  },
  {
    icon: FiLock,
    title: "Encrypted messages",
    body: "Private messages are end-to-end encrypted — only you and the person you’re talking to can read them.",
  },
  {
    icon: FiEyeOff,
    title: "Anonymous, for real",
    body: "When you post anonymously, your name, photo and username are never attached to the post.",
  },
  {
    icon: FiShield,
    title: "Community moderation",
    body: "Community admins and moderators can remove posts, ban members and enforce rules — with role history for accountability.",
  },
  {
    icon: FiHeart,
    title: "Wellbeing first",
    body: "If you or someone you know is struggling, reach out to trusted people, professionals or the helplines below.",
  },
];

export default function Safety() {
  return (
    <>
      <PageHero
        eyebrow="Safety centre"
        title={
          <>
            Safe spaces, <span className="text-flare-gradient">by design.</span>
          </>
        }
        intro="How Starstreak protects you — and the tools you have to keep your communities positive and secure."
        mascot={<Mascot pose="search" className="w-60" />}
      />

      <Section>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {TOOLS.map(({ icon: Icon, title, body }, i) => (
            <Reveal key={title} delay={(i % 3) * 100} className="card-night p-8">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-flare/15 text-flare">
                <Icon size={22} />
              </span>
              <h2 className="mt-6 text-xl font-bold text-star">{title}</h2>
              <p className="mt-3 leading-relaxed text-mist">{body}</p>
            </Reveal>
          ))}
        </div>
      </Section>

      <section className="pb-20">
        <div className="container-ss grid gap-6 lg:grid-cols-5">
          <Reveal className="relative overflow-hidden rounded-3xl border border-red-500/30 bg-gradient-to-br from-red-500/15 to-night-800 p-8 md:p-10 lg:col-span-3">
            <div className="flex items-center gap-3 text-red-300">
              <FiPhone />
              <span className="text-sm font-bold tracking-wide">IF YOU’RE IN IMMEDIATE DANGER</span>
            </div>
            <h2 className="h-display mt-5 text-3xl text-star md:text-4xl">Please reach out now.</h2>
            <p className="mt-4 text-mist">
              If you feel at risk of harming yourself or others, contact your local emergency services immediately.
            </p>
            <ul className="mt-6 space-y-3 text-star">
              <li>
                Kenya emergency services: <strong>999</strong> or <strong>112</strong>
              </li>
              <li>
                Kenya suicide &amp; crisis line: <strong>0800 720 333</strong>
              </li>
              <li>
                Outside Kenya:{" "}
                <a
                  href="https://www.iasp.info/crisis-centres-helplines/"
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-accent hover:text-gold"
                >
                  find a helpline in your country ↗
                </a>
              </li>
            </ul>
          </Reveal>

          <Reveal delay={100} className="card-night flex flex-col justify-between p-8 md:p-10 lg:col-span-2">
            <div>
              <FiBookOpen className="text-accent" size={24} />
              <h2 className="mt-5 text-2xl font-bold text-star">Community guidelines</h2>
              <p className="mt-3 text-mist">What is and isn’t allowed on Starstreak — and how we keep spaces healthy.</p>
            </div>
            <Link to="/guidelines" className="mt-8 inline-flex items-center gap-2 font-semibold text-accent hover:text-gold">
              Read the guidelines <FiArrowRight />
            </Link>
          </Reveal>
        </div>
      </section>

      <section className="border-t border-line bg-night-850 py-20">
        <div className="container-ss flex flex-col items-center text-center">
          <h2 className="h-display text-3xl text-star md:text-4xl">Need more help?</h2>
          <p className="mt-3 max-w-xl text-mist">Our support team can help with reports, safety concerns and account issues.</p>
          <Link to="/contact" className="btn-flare mt-8">
            Contact support
          </Link>
        </div>
      </section>
    </>
  );
}
