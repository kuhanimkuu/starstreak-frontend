import useReveal from "../../hooks/useReveal";
import Starfield from "./Starfield";

/** "✦ LABEL" pill. */
export function Eyebrow({ children, className = "" }) {
  return (
    <span className={`eyebrow ${className}`}>
      <span className="text-gold">✦</span>
      {children}
    </span>
  );
}

/** Standard section: centred eyebrow, big headline, intro, then content. */
export default function Section({ eyebrow, title, intro, align = "center", className = "", children, id }) {
  const ref = useReveal();
  const centered = align === "center";
  return (
    <section id={id} className={`relative py-20 md:py-28 ${className}`}>
      <div className="container-ss">
        {(eyebrow || title || intro) && (
          <div
            ref={ref}
            className={`reveal mb-12 md:mb-16 ${centered ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}`}
          >
            {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
            {title && <h2 className="h-display mt-5 text-4xl text-star md:text-5xl">{title}</h2>}
            {intro && <p className="mt-5 text-lg leading-relaxed text-mist">{intro}</p>}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}

/** Inner-page hero with starfield, mascot slot and glow. */
export function PageHero({ eyebrow, title, intro, mascot, children }) {
  return (
    <header className="relative overflow-hidden border-b border-line bg-night-gradient pt-36 pb-20 md:pt-44 md:pb-24">
      <Starfield density={45} />
      <div className="glow-flare absolute -top-40 left-1/2 h-[480px] w-[780px] -translate-x-1/2 opacity-60" />
      <div className="container-ss relative grid items-center gap-10 md:grid-cols-12">
        <div className={mascot ? "md:col-span-8" : "md:col-span-10"}>
          {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
          <h1 className="h-display mt-6 text-5xl text-star md:text-7xl">{title}</h1>
          {intro && <p className="mt-6 max-w-2xl text-lg leading-relaxed text-mist md:text-xl">{intro}</p>}
          {children}
        </div>
        {mascot && <div className="hidden justify-center md:col-span-4 md:flex">{mascot}</div>}
      </div>
    </header>
  );
}

/** Fades its children in when scrolled into view. */
export function Reveal({ as: Tag = "div", className = "", delay = 0, children, ...rest }) {
  const ref = useReveal();
  return (
    <Tag ref={ref} className={`reveal ${className}`} style={{ transitionDelay: `${delay}ms` }} {...rest}>
      {children}
    </Tag>
  );
}

export function Spinner({ className = "" }) {
  return (
    <div className={`flex items-center justify-center py-24 ${className}`}>
      <div className="h-9 w-9 animate-spin rounded-full border-2 border-night-600 border-t-flare" />
    </div>
  );
}
