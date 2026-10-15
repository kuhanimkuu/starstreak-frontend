import { FiVolume2 } from "react-icons/fi";
import { MdVerified } from "react-icons/md";

// The look of posts published by the Starstreak team (matches the app's
// OfficialBadge / OfficialAvatar): gold ring, gold check, "Official" pill.

export const OFFICIAL_CARD = "ring-1 ring-[#F5B301]/70 shadow-[0_0_22px_rgba(245,179,1,0.22)]";
export const OFFICIAL_STRIPE = "bg-[linear-gradient(180deg,#FFD166,#FFAB3D,#FF6D1F)]";

export function OfficialBadge() {
  return (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-flare-gradient px-1.5 py-0.5 text-[11px] font-extrabold tracking-wide text-white">
      <FiVolume2 className="text-[11px]" /> Official
    </span>
  );
}

export function OfficialCheck({ className = "" }) {
  return <MdVerified className={`shrink-0 text-[#F5B301] ${className}`} aria-label="Official" />;
}

export function OfficialAvatar({ size = 42 }) {
  return (
    <div className="shrink-0 rounded-full bg-flare-gradient p-[2px] shadow-[0_0_12px_rgba(245,179,1,0.5)]"
         style={{ width: size, height: size }}>
      <img src="/starstreak_icon.png" alt="Starstreak" className="h-full w-full rounded-full object-cover" />
    </div>
  );
}
