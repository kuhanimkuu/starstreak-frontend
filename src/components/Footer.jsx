import { Link } from "react-router-dom";
import FlarelyMark from "./FlarelyMark";
import Starfield from "./ui/Starfield";
import Mascot from "./ui/Mascot";

const COLUMNS = [
  {
    title: "Product",
    links: [
      ["Features", "/features"],
      ["Download", "/download"],
      ["Roadmap", "/roadmap"],
      ["Updates", "/blog"],
    ],
  },
  {
    title: "Company",
    links: [
      ["About", "/about"],
      ["Press kit", "/press"],
      ["Careers", "/careers"],
      ["Contact", "/contact"],
    ],
  },
  {
    title: "Help",
    links: [
      ["Support", "/support"],
      ["Community guidelines", "/guidelines"],
      ["Safety centre", "/safety"],
      ["Accessibility", "/accessibility"],
      ["System status", "/status"],
    ],
  },
  {
    title: "Legal",
    links: [
      ["Privacy", "/privacy"],
      ["Terms", "/terms"],
      ["Cookies", "/cookies"],
      ["Licenses", "/licenses"],
      ["Data request", "/data-request"],
    ],
  },
];

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="relative overflow-hidden border-t border-line bg-night-950">
      <Starfield density={40} shooting={false} />

      {/* Download band */}
      <div className="container-ss relative pt-20">
        <div className="relative overflow-hidden rounded-[2rem] border border-flare/30 bg-gradient-to-br from-flare/25 via-night-800 to-night-800 px-8 py-12 md:px-14">
          <div className="glow-flare absolute -right-20 -top-20 h-80 w-80" />
          <div className="relative flex flex-col items-start gap-8 md:flex-row md:items-center md:justify-between">
            <div className="max-w-xl">
              <h2 className="h-display text-4xl text-star md:text-5xl">
                Your people are <span className="text-flare-gradient">out there.</span>
              </h2>
              <p className="mt-4 text-lg text-mist">Join Starstreak and light up the moments that matter.</p>
              <Link to="/download" className="btn-flare mt-8">
                Get the app
              </Link>
            </div>
            <Mascot pose="celebrate" className="hidden w-48 md:block lg:w-56" />
          </div>
        </div>
      </div>

      <div className="container-ss relative grid gap-12 pt-16 pb-10 md:grid-cols-12">
        <div className="md:col-span-4">
          <Link to="/" className="flex items-center gap-2">
            <FlarelyMark size={44} interactive={false} />
            <span className="text-flare-gradient text-2xl font-extrabold tracking-tight">Starstreak</span>
          </Link>
          <p className="mt-5 max-w-sm leading-relaxed text-mist">
            A social platform built around real communities and live Flash moments. Find your people and keep the
            conversation alive.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 md:col-span-8">
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="mb-4 text-sm font-bold text-star">{col.title}</h3>
              <ul className="space-y-2.5">
                {col.links.map(([label, to]) => (
                  <li key={label}>
                    <Link to={to} className="text-sm text-mist transition-colors hover:text-accent">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="container-ss relative flex flex-col gap-3 border-t border-line py-8 text-sm text-dust md:flex-row md:items-center md:justify-between">
        <p>© {year} Starstreak · a Hephix Ltd product</p>
        <p>Made with ✦ in Nairobi</p>
      </div>
    </footer>
  );
}
