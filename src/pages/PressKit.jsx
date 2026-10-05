import { FiDownload, FiMail } from "react-icons/fi";
import { PageHero, Reveal } from "../components/ui/Section";
import Mascot from "../components/ui/Mascot";
import PhoneMockup from "../components/ui/PhoneMockup";

const ASSETS = [
  { src: "/starstreak_logo.png", name: "Starstreak logo", file: "starstreak-logo.png" },
  { src: "/starstreak_icon.png", name: "App icon", file: "starstreak-icon.png" },
  { src: "/mascot/flarely_mark.png", name: "Flarely mark", file: "flarely-mark.png" },
];

const POSES = ["main", "wave", "celebrate", "chat", "search", "sleep"];

const PALETTE = [
  { name: "Flare", hex: "#FF6D1F", text: "text-night-950" },
  { name: "Flare deep", hex: "#E8590C", text: "text-night-950" },
  { name: "Amber", hex: "#FFAB3D", text: "text-night-950" },
  { name: "Gold", hex: "#FFD166", text: "text-night-950" },
  { name: "Night", hex: "#0A0B1E", text: "text-star" },
  { name: "Starlight", hex: "#F2F3FF", text: "text-night-950" },
];

function DownloadLink({ href, file, children }) {
  return (
    <a href={href} download={file} className="inline-flex items-center gap-2 text-sm font-semibold text-accent hover:text-gold">
      <FiDownload /> {children}
    </a>
  );
}

export default function PressKit() {
  return (
    <>
      <PageHero
        eyebrow="Press kit"
        title={
          <>
            Telling the <span className="text-flare-gradient">Starstreak</span> story?
          </>
        }
        intro="Official brand assets, product information and media resources for articles, videos, reviews and publications."
        mascot={<Mascot pose="wave" className="w-56" />}
      />

      <section className="py-16 md:py-24">
        <div className="container-ss grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <h2 className="h-display text-3xl text-star md:text-4xl">About Starstreak</h2>
            <p className="mt-5 text-lg leading-relaxed text-mist">
              Starstreak is a social platform built around communities, real-time conversation and creative
              expression. People join interest communities, drop into live <span className="text-star">Flashes</span>{" "}
              that exist for a limited time, explore what’s trending and talk privately through
              encrypted messaging.
            </p>
            <p className="mt-4 text-lg leading-relaxed text-mist">
              Starstreak is built by <span className="text-star">Hephix</span> in Nairobi, Kenya. Its mascot,{" "}
              <span className="text-star">Flarely</span>, is a living flame with a shooting star passing over its head.
            </p>
          </div>
          <div className="card-night p-8 lg:col-span-5">
            <h3 className="text-sm font-bold tracking-widest text-dust">FAST FACTS</h3>
            <dl className="mt-5 space-y-4">
              {[
                ["Product", "Starstreak"],
                ["Mascot", "Flarely"],
                ["Company", "Hephix"],
                ["Based in", "Nairobi, Kenya"],
                ["Platforms", "Android · iOS (coming soon)"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 border-b border-line pb-3 last:border-0 last:pb-0">
                  <dt className="text-mist">{k}</dt>
                  <dd className="font-semibold text-star">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <section className="border-t border-line bg-night-850 py-16 md:py-24">
        <div className="container-ss">
          <h2 className="h-display text-3xl text-star md:text-4xl">Logos</h2>
          <p className="mt-3 text-mist">Please don’t recolour, stretch or add effects to the logo.</p>
          <div className="mt-10 grid gap-5 sm:grid-cols-3">
            {ASSETS.map((a, i) => (
              <Reveal key={a.file} delay={i * 80} className="card-night overflow-hidden">
                <div className="bg-stars flex h-48 items-center justify-center bg-night-900 p-8">
                  <img src={a.src} alt={a.name} className="h-32 w-32 rounded-2xl object-contain" />
                </div>
                <div className="flex items-center justify-between border-t border-line px-6 py-4">
                  <span className="font-semibold text-star">{a.name}</span>
                  <DownloadLink href={a.src} file={a.file}>
                    PNG
                  </DownloadLink>
                </div>
              </Reveal>
            ))}
          </div>

          <h2 className="h-display mt-20 text-3xl text-star md:text-4xl">Meet Flarely</h2>
          <p className="mt-3 text-mist">Mascot poses with transparent backgrounds.</p>
          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {POSES.map((pose) => (
              <div key={pose} className="card-night flex flex-col items-center p-5">
                <Mascot pose={pose} float={false} alt={`Flarely ${pose}`} className="h-24 w-24 object-contain" />
                <span className="mt-3 text-sm capitalize text-mist">{pose}</span>
                <a
                  href={`/mascot/flarely_${pose}.png`}
                  download={`flarely-${pose}.png`}
                  className="mt-2 text-xs font-semibold text-accent hover:text-gold"
                >
                  Download
                </a>
              </div>
            ))}
          </div>

          <h2 className="h-display mt-20 text-3xl text-star md:text-4xl">Colour & type</h2>
          <p className="mt-3 text-mist">
            Headlines and UI are set in <span className="font-semibold text-star">Outfit</span>.
          </p>
          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {PALETTE.map((c) => (
              <div
                key={c.hex}
                className={`flex h-32 flex-col justify-end rounded-2xl border border-line p-4 ${c.text}`}
                style={{ background: c.hex }}
              >
                <span className="font-bold">{c.name}</span>
                <span className="font-mono text-xs opacity-80">{c.hex}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container-ss">
          <h2 className="h-display text-3xl text-star md:text-4xl">The app</h2>
          <p className="mt-3 text-mist">Product imagery. Email us for high-resolution screenshots.</p>
          <div className="mt-12 flex flex-wrap justify-center gap-8">
            <PhoneMockup screen="feed" className="w-64" />
            <PhoneMockup screen="flash" className="w-64" />
            <PhoneMockup screen="chat" className="w-64" />
          </div>
        </div>
      </section>

      <section className="border-t border-line bg-night-850 py-20">
        <div className="container-ss flex flex-col items-center text-center">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-flare/15 text-flare">
            <FiMail size={24} />
          </span>
          <h2 className="h-display mt-6 text-3xl text-star md:text-4xl">Press contact</h2>
          <p className="mt-3 max-w-xl text-mist">For interviews, enquiries or media coverage, reach our communications team.</p>
          <a href="mailto:press@starstreak.org" className="btn-flare mt-8">
            press@starstreak.org
          </a>
        </div>
      </section>
    </>
  );
}
