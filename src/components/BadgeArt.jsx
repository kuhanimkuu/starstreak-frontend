import { useId } from "react";
import { MdStar } from "react-icons/md";
import { COLORS, ICONS, FLARELY_POSES } from "./badgeLook";

// A badge's look, drawn the same way as the app (lib/features/badges/
// badge_art.dart): template + icon + colour + tier, never any text on the
// art. Keep the two in sync.

const ICON_SPOT = {
  streak: { x: 0.6, y: 0.44, size: 0.3 },
  crest: { x: 0.5, y: 0.5, size: 0.36 },
  flarely: { x: 0.5, y: 0.5, size: 0.6 },
  medal: { x: 0.5, y: 0.62, size: 0.3 },
};

function starPoints(cx, cy, ro, ri, n) {
  const pts = [];
  for (let i = 0; i < n * 2; i++) {
    const r = i % 2 === 0 ? ro : ri;
    const a = -Math.PI / 2 + (i * Math.PI) / n;
    pts.push(`${(cx + Math.cos(a) * r).toFixed(2)},${(cy + Math.sin(a) * r).toFixed(2)}`);
  }
  return pts.join(" ");
}

// The shield in a 100 x 100 box, shrunk by k around its middle.
function shieldPath(k = 1) {
  const q = (x, y) => `${(50 + (x - 50) * k).toFixed(2)} ${(52 + (y - 52) * k).toFixed(2)}`;
  return `M${q(50, 3)} L${q(90, 16)} L${q(90, 52)} C${q(90, 78)} ${q(72, 92)} ${q(50, 99)} ` +
    `C${q(28, 92)} ${q(10, 78)} ${q(10, 52)} L${q(10, 16)} Z`;
}

export default function BadgeArt({ template = "medal", icon = "star", color = "flare", tier = "common", size = 64, locked = false }) {
  const uid = useId().replace(/:/g, "");
  const p = COLORS[color] ?? COLORS.flare;
  const common = tier === "common";
  const face = common ? p.light : `url(#face${uid})`;
  const rim = common ? p.base : `url(#rim${uid})`;
  const spot = ICON_SPOT[template] ?? ICON_SPOT.medal;
  const Icon = ICONS[icon] ?? MdStar;
  const pose = icon.startsWith("flarely_") && FLARELY_POSES.includes(icon.slice(8)) ? icon.slice(8) : "main";

  const shine = (cx, cy, rx, ry) =>
    common ? null : <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={`url(#shine${uid})`} />;
  const spark = (cx, cy, r) => (
    <polygon points={starPoints(cx, cy, r, r * 0.28, 4)} fill="#FFFFFF" stroke={p.dark} strokeWidth="1.2" strokeLinejoin="round" />
  );

  let shape;
  if (template === "streak") {
    const cx = 60, cy = 44;
    const trail = common ? [p.base, p.base, p.base] : ["#A855F7", p.base, p.light];
    shape = (
      <>
        {[[-12, 6], [0, 9], [12, 6]].map(([off, w], i) => (
          <line key={i} x1={cx - 20} y1={cy + off * 0.6} x2={4} y2={90 + off * 0.5}
            stroke={trail[i]} strokeWidth={w} strokeLinecap="round" opacity={common && i !== 1 ? 0.55 : 1} />
        ))}
        <polygon points={starPoints(cx, cy, 38, 28, 8)} fill={rim} />
        <polygon points={starPoints(cx, cy, 32, 24, 8)} fill={face} />
        {shine(cx, cy - 13, 20, 8)}
      </>
    );
  } else if (template === "crest") {
    shape = (
      <>
        <path d={shieldPath()} fill={rim} />
        <path d={shieldPath(0.84)} fill={face} />
        {shine(50, 26, 26, 10)}
      </>
    );
  } else if (template === "flarely") {
    shape = (
      <>
        <circle cx="50" cy="50" r="48" fill={rim} />
        <circle cx="50" cy="50" r="41" fill={face} />
        {shine(50, 26, 24, 10)}
      </>
    );
  } else {
    shape = (
      <>
        <polygon points="22,0 42,0 56,36 36,36" fill={p.base} />
        <polygon points="78,0 58,0 44,36 64,36" fill={p.dark} />
        <circle cx="50" cy="62" r="36" fill={rim} />
        <circle cx="50" cy="62" r="30" fill={face} />
        {shine(50, 46, 20, 9)}
      </>
    );
  }

  const iconPx = size * spot.size;
  return (
    <span
      className="relative inline-block shrink-0"
      style={{ width: size, height: size, filter: locked ? "grayscale(1) opacity(0.35)" : undefined }}
      role="img"
      aria-label={`${template} badge`}
    >
      <svg viewBox="0 0 100 100" width={size} height={size} className="block">
        <defs>
          <linearGradient id={`face${uid}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={p.light} /><stop offset="1" stopColor={p.base} />
          </linearGradient>
          <linearGradient id={`rim${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={tier === "epic" ? "#FFE08A" : p.base} />
            <stop offset="1" stopColor={tier === "epic" ? "#B8860B" : p.dark} />
          </linearGradient>
          <linearGradient id={`shine${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.55" /><stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>
        </defs>
        {shape}
        {tier === "epic" && <>{spark(86, 12, 9)}{spark(13, 30, 5)}</>}
      </svg>
      <span
        className="absolute flex items-center justify-center"
        style={{ left: size * spot.x - iconPx / 2, top: size * spot.y - iconPx / 2, width: iconPx, height: iconPx }}
      >
        {template === "flarely"
          ? <img src={`/mascot/flarely_${pose}.png`} alt="" width={iconPx} height={iconPx} className="object-contain" />
          : <Icon size={iconPx} color={common ? p.dark : "#FFFFFF"} />}
      </span>
    </span>
  );
}
