import { GLYPHS } from "./badgeSvg";

// One of the badge design's 24 centre glyphs, for the icon picker.
export default function BadgeGlyph({ name, size = 20 }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" fill="currentColor" stroke="currentColor"
      strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"
      // Static markup from our own constants (no user input).
      dangerouslySetInnerHTML={{ __html: GLYPHS[name] ?? GLYPHS.star }} />
  );
}
