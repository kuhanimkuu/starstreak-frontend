import { useId } from "react";
import FlarelyBadgeArt from "./FlarelyBadgeArt";
import { badgeSvgInner, WON_RULES } from "./badgeSvg";

// A badge's look, drawn the same way as the app (lib/features/badges/
// badge_art.dart): the Starstreak Badge System design for streak, crest and
// medal; Flarely keeps its original mascot drawing. Never any text on the art.
// `rule` decides the won laurel; `animate` sweeps the shine on epic badges.
export default function BadgeArt({ template = "medal", icon = "star", color = "flare", tier = "common", rule = null, size = 64, locked = false, animate = false }) {
  const id = `b${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  if (template === "flarely") {
    return <FlarelyBadgeArt template={template} icon={icon} color={color} tier={tier} size={size} locked={locked} />;
  }
  const inner = badgeSvgInner({ id, template, icon, color, tier, locked, won: WON_RULES.includes(rule), animate });
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} role="img" aria-label={`${tier} ${template} badge`}
      // Static markup built from our own constants (no user input).
      dangerouslySetInnerHTML={{ __html: inner }} />
  );
}
