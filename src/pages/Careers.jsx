import { FiCode, FiUsers, FiPenTool, FiSpeaker, FiArrowUpRight } from "react-icons/fi";
import { PageHero, Reveal } from "../components/ui/Section";
import Mascot from "../components/ui/Mascot";

const ROLES = [
  {
    icon: FiCode,
    title: "Frontend Engineer",
    body: "Work with React, TypeScript and modern UI tooling to build the smooth, fast interfaces that power Starstreak.",
    meta: "Remote · Full-time",
  },
  {
    icon: FiUsers,
    title: "Community Manager",
    body: "Guide creators, nurture communities, run programmes and strengthen the Starstreak experience.",
    meta: "Remote · Full-time",
  },
  {
    icon: FiPenTool,
    title: "UI/UX Designer",
    body: "Design beautiful, intuitive experiences across the app, working closely with engineering and product.",
    meta: "Remote · Contract or full-time",
  },
  {
    icon: FiSpeaker,
    title: "Marketing & Growth Lead",
    body: "Build awareness, launch campaigns and bring Starstreak to new communities and regions.",
    meta: "Remote · Part-time or full-time",
  },
];

export default function Careers() {
  return (
    <>
      <PageHero
        eyebrow="Careers"
        title={
          <>
            Help us light up <span className="text-flare-gradient">the internet.</span>
          </>
        }
        intro="We’re building the future of online communities. If you’re passionate, creative and driven, Starstreak might be where you belong."
        mascot={<Mascot pose="celebrate" className="w-56" />}
      />

      <section className="py-16 md:py-24">
        <div className="container-ss">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="h-display text-3xl text-star md:text-4xl">Our mission</h2>
            <p className="mt-4 text-lg leading-relaxed text-mist">
              Starstreak exists to redefine how people connect, share and belong online — a social platform that
              empowers creativity, fosters healthy communities and amplifies conversations that matter.
            </p>
          </div>

          <h2 className="mt-20 text-center text-sm font-bold tracking-widest text-dust">OPEN ROLES</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {ROLES.map(({ icon: Icon, title, body, meta }, i) => (
              <Reveal key={title} delay={(i % 2) * 100}>
                <a
                  href={`mailto:careers@starstreak.org?subject=${encodeURIComponent(`Application: ${title}`)}`}
                  className="card-night card-hover group flex h-full flex-col p-8"
                >
                  <div className="flex items-start justify-between">
                    <span className="grid h-12 w-12 place-items-center rounded-2xl bg-flare/15 text-flare">
                      <Icon size={22} />
                    </span>
                    <FiArrowUpRight className="text-dust transition-colors group-hover:text-accent" size={20} />
                  </div>
                  <h3 className="mt-6 text-2xl font-bold text-star">{title}</h3>
                  <p className="mt-3 flex-1 leading-relaxed text-mist">{body}</p>
                  <p className="mt-6 text-sm font-semibold text-accent">{meta}</p>
                </a>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-line bg-night-850 py-20">
        <div className="container-ss flex flex-col items-center text-center">
          <h2 className="h-display text-3xl text-star md:text-4xl">Don’t see a perfect fit?</h2>
          <p className="mt-3 max-w-xl text-mist">
            We’re always happy to meet talented people. If you can help build Starstreak, tell us how.
          </p>
          <a href="mailto:careers@starstreak.org" className="btn-flare mt-8">
            Send an open application
          </a>
        </div>
      </section>
    </>
  );
}
