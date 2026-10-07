import { FiEyeOff } from "react-icons/fi";
import { safeUrl } from "../lib/media";

const SIZES = {
  xs: "h-6 w-6 text-[10px]", sm: "h-9 w-9 text-sm", glow: "h-[42px] w-[42px] text-base",
  md: "h-11 w-11 text-base", lg: "h-20 w-20 text-2xl", xl: "h-28 w-28 text-4xl",
};

/**
 * Round avatar; anonymous authors get a mask instead of a picture.
 * `glow` matches the app's GlowingAvatar: a purple glow, or a gold ring and
 * glow for verified accounts.
 */
export default function Avatar({ src, name, anonymous = false, size = "md", glow = false, verified = false, className = "" }) {
  const dims = SIZES[size] || SIZES.md;
  const url = anonymous ? null : safeUrl(src);
  const inner = anonymous ? (
    <div className={`${dims} grid shrink-0 place-items-center rounded-full bg-night-700 text-mist`} aria-label="Anonymous">
      <FiEyeOff />
    </div>
  ) : url ? (
    <img src={url} alt="" loading="lazy" className={`${dims} shrink-0 rounded-full bg-night-700 object-cover`} />
  ) : (
    <div className={`${dims} grid shrink-0 place-items-center rounded-full bg-flare-gradient font-bold text-night-950`} aria-hidden>
      {(name || "?").trim()[0]?.toUpperCase() || "?"}
    </div>
  );

  if (!glow) return <div className={`shrink-0 overflow-hidden rounded-full ${className}`}>{inner}</div>;
  return (
    <div className={`shrink-0 rounded-full p-[2px] ${verified && !anonymous
            ? "bg-[conic-gradient(#FFD166,#FFAB3D,#FF6D1F,#FFAB3D,#FFD166)] shadow-[0_0_12px_rgba(255,209,102,0.55)]"
            : "bg-[#A855F7]/60 shadow-[0_0_10px_rgba(168,85,247,0.45)]"} ${className}`}>
      <div className="rounded-full bg-night-800 p-[1.5px]">{inner}</div>
    </div>
  );
}
