import { FiEye, FiHeart, FiCheck, FiMail } from "react-icons/fi";
import { PageHero, Reveal } from "../components/ui/Section";
import Mascot from "../components/ui/Mascot";

const PILLARS = [
  {
    icon: FiEye,
    title: "Following global standards",
    body: "We aim to meet WCAG 2.1 AA so Starstreak is perceivable, operable, understandable and robust for everyone.",
  },
  {
    icon: FiHeart,
    title: "An inclusive experience",
    body: "We consider accessibility everywhere: design, navigation, contrast, captions, alt text and compatibility with assistive technology.",
  },
];

const COMPAT = [
  "Modern browsers (Chrome, Firefox, Safari, Edge)",
  "Screen readers and keyboard navigation",
  "High-contrast mode and system text-size adjustments",
  "Mobile accessibility features (TalkBack, VoiceOver)",
  "Reduced-motion preferences — animations calm down when you ask",
];

export default function Accessibility() {
  return (
    <>
      <PageHero
        eyebrow="Accessibility"
        title={
          <>
            Starstreak is <span className="text-flare-gradient">for everyone.</span>
          </>
        }
        intro="We’re committed to making Starstreak accessible, inclusive and usable for all people, whatever their ability or technology."
        mascot={<Mascot pose="wave" className="w-52" />}
      />

      <section className="py-16 md:py-24">
        <div className="container-ss max-w-5xl">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="h-display text-3xl text-star md:text-4xl">Our commitment</h2>
            <p className="mt-4 text-lg leading-relaxed text-mist">
              We’re continuously improving the accessibility of our website and app, following the Web Content
              Accessibility Guidelines (WCAG) 2.1 Level AA wherever possible.
            </p>
          </div>

          <div className="mt-14 grid gap-5 md:grid-cols-2">
            {PILLARS.map(({ icon: Icon, title, body }, i) => (
              <Reveal key={title} delay={i * 100} className="card-night p-8">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-flare/15 text-flare">
                  <Icon size={22} />
                </span>
                <h3 className="mt-6 text-xl font-bold text-star">{title}</h3>
                <p className="mt-3 leading-relaxed text-mist">{body}</p>
              </Reveal>
            ))}
          </div>

          <div className="card-night mt-5 p-8 md:p-10">
            <h2 className="text-xl font-bold text-star">Designed to work with</h2>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {COMPAT.map((c) => (
                <li key={c} className="flex items-start gap-3 text-mist">
                  <FiCheck className="mt-1 shrink-0 text-green-400" /> {c}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="border-t border-line bg-night-850 py-20">
        <div className="container-ss flex flex-col items-center text-center">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-flare/15 text-flare">
            <FiMail size={24} />
          </span>
          <h2 className="h-display mt-6 text-3xl text-star md:text-4xl">Hit a barrier? Tell us.</h2>
          <p className="mt-3 max-w-xl text-mist">
            Accessibility is a journey. If something on Starstreak gets in your way, or you have ideas to make it
            better, we want to hear from you.
          </p>
          <a href="mailto:accessibility@starstreak.org" className="btn-flare mt-8">
            accessibility@starstreak.org
          </a>
        </div>
      </section>
    </>
  );
}
