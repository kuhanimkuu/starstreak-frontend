import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import Section, { PageHero, Reveal } from "../components/ui/Section";
import Mascot from "../components/ui/Mascot";

const STORY = [
  {
    title: "A need for real connection",
    body: "Social platforms often put algorithms ahead of people. Starstreak began with a simple idea: what if communities, conversations and creativity were at the centre — not buried under noise?",
  },
  {
    title: "Built around communities",
    body: "Gaming, fashion, fitness, art, tech, culture or random midnight ideas — there’s a space for you. And if one doesn’t exist yet, you can start it.",
  },
  {
    title: "Made for the moment",
    body: "Some conversations shouldn’t last forever. Flashes flare up around a live moment and archive cleanly when it’s over.",
  },
  {
    title: "Conversations that matter",
    body: "End-to-end encrypted messages, polls and reactions make staying connected feel natural — built for real interaction, not empty scrolling.",
  },
];

const VALUES = [
  { pose: "chat", title: "Community first", body: "Every feature we build strengthens belonging, expression and real connection." },
  { pose: "celebrate", title: "Expression", body: "Starstreak celebrates individuality — share, create and say what you mean." },
  { pose: "search", title: "Safety & trust", body: "Privacy controls, real moderation and encryption keep the experience positive for everyone." },
];

export default function About() {
  return (
    <>
      <PageHero
        eyebrow="About Starstreak"
        title={
          <>
            Where communities <span className="text-flare-gradient">come alive.</span>
          </>
        }
        intro="A social platform built so people can connect, create and express themselves — through communities, live moments and conversations that matter."
        mascot={<Mascot pose="wave" className="w-60" />}
      />

      <Section align="left" eyebrow="Our mission" title="Bring people together — for real.">
        <div className="grid gap-10 text-lg leading-relaxed text-mist md:grid-cols-2">
          <p>
            In a world where social platforms feel crowded, noisy or distant, we’re building a space where communities
            thrive, conversations feel meaningful, and people can be who they are without filters or pressure.
          </p>
          <p>
            Whether you’re joining a community, catching a live flash, sharing a post or chatting privately, Starstreak
            helps you connect authentically — and find the people who get you.
          </p>
        </div>
      </Section>

      <Section className="border-t border-line bg-night-850" eyebrow="How it started" title="The Starstreak story.">
        <div className="grid gap-6 md:grid-cols-2">
          {STORY.map((s, i) => (
            <Reveal key={s.title} delay={(i % 2) * 100} className="card-night p-8">
              <span className="text-flare-gradient text-sm font-extrabold">0{i + 1}</span>
              <h3 className="mt-4 text-2xl font-bold text-star">{s.title}</h3>
              <p className="mt-3 leading-relaxed text-mist">{s.body}</p>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section eyebrow="What we stand for" title="Our values.">
        <div className="grid gap-6 md:grid-cols-3">
          {VALUES.map((v, i) => (
            <Reveal key={v.title} delay={i * 100} className="card-night p-8 text-center">
              <Mascot pose={v.pose} float={false} className="mx-auto w-28" />
              <h3 className="mt-6 text-xl font-bold text-star">{v.title}</h3>
              <p className="mt-2 text-mist">{v.body}</p>
            </Reveal>
          ))}
        </div>
      </Section>

      <section className="pb-24">
        <div className="container-ss">
          <Reveal className="card-night flex flex-col items-start gap-6 p-10 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="h-display text-3xl text-star md:text-4xl">This is just the beginning.</h2>
              <p className="mt-3 max-w-xl text-mist">
                Starstreak is built by Hephix in Nairobi and shaped by the communities that call it home.
              </p>
            </div>
            <Link to="/roadmap" className="btn-ghost shrink-0">
              See what’s next <FiArrowRight />
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
