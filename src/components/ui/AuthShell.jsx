import { Link } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import Starfield from "./Starfield";
import FlarelyMark from "../FlarelyMark";

/** Standalone night-sky frame for login / signup / password reset. */
export default function AuthShell({ title, subtitle, back = "/", backLabel = "Starstreak home", children }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-night-gradient px-4 py-16">
      <Starfield density={70} />
      <div className="glow-flare absolute -top-48 left-1/2 h-[520px] w-[820px] -translate-x-1/2 opacity-70" />
      <div className="relative w-full max-w-md">
        <Link to={back} className="mb-6 inline-flex items-center gap-2 text-sm text-mist hover:text-star">
          <FiArrowLeft /> {backLabel}
        </Link>
        <div className="rounded-3xl border border-line bg-night-850/90 p-8 shadow-night backdrop-blur md:p-10">
          <div className="text-center">
            <FlarelyMark size={72} className="mx-auto block" />
            <h1 className="h-display mt-5 text-3xl text-star">{title}</h1>
            {subtitle && <p className="mt-2 text-sm text-mist">{subtitle}</p>}
          </div>
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}

export function AuthError({ children }) {
  if (!children) return null;
  return (
    <div role="alert" className="mb-5 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-300">
      {children}
    </div>
  );
}

export function OrDivider() {
  return (
    <div className="my-6 flex items-center gap-3">
      <div className="flex-1 border-t border-line" />
      <span className="text-xs text-dust">OR</span>
      <div className="flex-1 border-t border-line" />
    </div>
  );
}

export const googleBtn =
  "flex w-full items-center justify-center gap-3 rounded-full border border-night-600 bg-night-800 py-3 text-sm font-semibold text-star transition-colors hover:border-night-500 hover:bg-night-700 disabled:opacity-50";
