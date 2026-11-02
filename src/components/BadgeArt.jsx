import { useId } from "react";
import FlarelyBadgeArt from "./FlarelyBadgeArt";
import { badgeSvgInner, WON_RULES } from "./badgeSvg";

// A badge's look, drawn the same way as the app (lib/features/badges/
// badge_art.dart): the Starstreak Badge System design for streak, crest and
// medal; Flarely keeps its original mascot drawing. Never any text on the art.
// `rule` decides the won laurel; `animate` sweeps the shine on epic badges.
export default function BadgeArt({ template = "medal", icon = "star", color = "flare", tier = "common", rule = null, size = 64, locked = false, animate = false, official = true }) {
  const id = `b${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  // Starstreak's own badges sit inside the orange ring light, which nobody
  // else's can have (host badges pass official={false}).
  const art = official ? Math.round(size * 0.8) : size;
  const badge = template === "flarely"
    ? <FlarelyBadgeArt template={template} icon={icon} color={color} tier={tier} size={art} locked={locked} />
    : (
      <svg viewBox="0 0 120 120" width={art} height={art} role="img" aria-label={`${tier} ${template} badge`}
        // Static markup built from our own constants (no user input).
        dangerouslySetInnerHTML={{ __html: badgeSvgInner({ id, template, icon, color, tier, locked, won: WON_RULES.includes(rule), animate }) }} />
    );
  if (!official) return badge;
  const ring = Math.max(1, Math.min(3.5, size * 0.035));
  return (
    <span className="inline-grid shrink-0 place-items-center rounded-full"
      style={{
        width: size, height: size,
        border: `${ring}px solid ${locked ? "#8A8A8A" : "#FF6D1F"}`,
        boxShadow: locked ? "none" : `0 0 ${Math.round(size * 0.12)}px rgba(255,109,31,0.55)`,
      }}>
      {badge}
    </span>
  );
}
