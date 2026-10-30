// The Starstreak Badge System design (Figma Make, github.com/kuhanimkuu/
// StarstreakBadgeSystemDesign) as an SVG string on a 120 x 120 canvas, for
// the streak, crest and medal templates. Flarely keeps its original drawing
// (FlarelyBadgeArt). Same output as lib/features/badges/badge_art.dart in the
// app: keep the two in sync.
import { COLORS } from "./badgeLook";

const LOCKED = { base: "#636363", light: "#A3A3A3", dark: "#2F2F2F" };

// Won at an event (not reached by counting): drawn with a laurel.
export const WON_RULES = ["moment_top_post", "flash_whole_event", "prediction"];

export const SHAPES = {
  streak: "M74 5 62 25 43 16 46 38 14 34 35 55 8 73 42 72 36 108 59 83 72 111 76 80 104 91 87 65 112 49 80 47Z",
  crest: "M60 7 101 20v32c0 26-15 45-41 59C34 97 19 78 19 52V20Z",
  medal: "M42 4h15l4 28H42L30 5h14m20-1h15l12 1-15 27H57l5-28M60 25a42 42 0 1 1 0 84 42 42 0 0 1 0-84Z",
};

// The 24 centre glyphs (24 x 24, filled and stroked in one colour).
export const GLYPHS = {
  star: '<path d="m12 2.8 2.7 5.5 6.1.9-4.4 4.3 1 6-5.4-2.8-5.4 2.8 1-6-4.4-4.3 6.1-.9z"/>',
  bolt: '<path d="M13.7 1.8 5 13h5.4l-1 9.2L19 10.4h-5.8z"/>',
  flash: '<path d="m15.3 2-9 11.1h5.2l-1.8 8.8 8.6-11.3h-5z"/><path d="M4 5 2 7m19 9-2 2" fill="none"/>',
  fire: '<path d="M13 2c.6 4.1-2.2 4.7-2 7.7-1.3-1-1.9-2.2-1.5-4.1-3 2.4-5 5.4-4.2 9.5C6 19.4 9.2 22 12 22s6.2-2.3 6.7-6.8c.4-3.6-1.4-6.3-3.5-8.7.1 2.6-1 4-2.1 4.8.9-3.3 1.8-5.8-.1-9.3Z"/>',
  pin: '<path d="M12 22s7-7.1 7-13a7 7 0 1 0-14 0c0 5.9 7 13 7 13Zm0-10a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z" fill-rule="evenodd"/>',
  chat: '<path d="M3 4h18v13H9l-5.8 4 .9-4H3zM7 9h10v2H7z" fill-rule="evenodd"/>',
  groups: '<circle cx="8" cy="8" r="3"/><circle cx="16.5" cy="8.5" r="2.5"/><path d="M2 20c.2-5 2.2-7 6-7s5.8 2 6 7Zm11-6c4.9-.6 7.4 1.4 8 5h-5.7c-.3-2.2-1.1-3.8-2.3-5Z"/>',
  add: '<path d="M10 2h4v8h8v4h-8v8h-4v-8H2v-4h8z"/>',
  edit: '<path d="m4 16 12-12 4 4L8 20l-5 1zM14.6 5.4l4 4"/>',
  person_add: '<circle cx="9" cy="7" r="4"/><path d="M2 21c0-5 2.3-7.5 7-7.5s7 2.5 7 7.5Zm16-9V8h2v4h3v2h-3v3h-2v-3h-3v-2z"/>',
  people: '<circle cx="8" cy="8" r="3.5"/><circle cx="17" cy="9" r="3"/><path d="M1.5 21c0-5.3 2.2-8 6.5-8s6.5 2.7 6.5 8Zm12-6.7C19 13.5 22 15.8 22.5 21H16c-.1-2.9-.9-5.1-2.5-6.7Z"/>',
  heart: '<path d="M12 21S2.5 15.2 2.5 8.5A5.5 5.5 0 0 1 12 4.7a5.5 5.5 0 0 1 9.5 3.8C21.5 15.2 12 21 12 21Z"/>',
  trophy: '<path d="M7 3h10v3h4c0 5-1.7 7.3-5.2 7.5-.7 1.2-1.6 2-2.8 2.3V19h4v3H7v-3h4v-3.2c-1.2-.3-2.1-1.1-2.8-2.3C4.7 13.3 3 11 3 6h4zm0 5H5.3c.2 1.8.9 2.8 2.2 3.1A11 11 0 0 1 7 8Zm10 0c0 1.2-.2 2.2-.5 3.1 1.3-.3 2-1.3 2.2-3.1Z" fill-rule="evenodd"/>',
  crown: '<path d="m3 6 5 4 4-7 4 7 5-4-2 13H5zm2.4 15h13.2v2H5.4z"/>',
  celebration: '<path d="m4 21 3-12 8 8z"/><path d="m13 3 1 4m6-2-4 3m4 5-4-1M7 3l2 3" fill="none"/>',
  rocket: '<path d="M14 4c3-2 6-2 7-1 1 1 1 4-1 7l-5 5-6-6zM8 11l-4 1-2 4 7-1zm5 5-1 6 4-2 1-4zM5 18c-2 0-3 1-3 4 3 0 4-1 4-3z"/>',
  goal: '<path d="M2 5h20v15h-3V8H5v12H2zm5 5h10v10h-2v-7H9v7H7z" fill-rule="evenodd"/>',
  whistle: '<path d="M3 10h11a6 6 0 1 1-6 6H3zm12.5-5L22 2l-1 6zM8 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z" fill-rule="evenodd"/>',
  card: '<path d="M6 2h12a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Zm2 5h8v2H8z" fill-rule="evenodd"/>',
  timer: '<path d="M9 2h6v3H9zm3 4a8 8 0 1 1-8 8 8 8 0 0 1 8-8Zm0 3v5l4 2 .9-1.8-2.9-1.4V9z" fill-rule="evenodd"/>',
  music: '<path d="M9 4v12.5A4 4 0 1 1 6 15V7l14-3v10.5a4 4 0 1 1-3-1.5V1z"/>',
  mic: '<path d="M8 4a4 4 0 0 1 8 0v7a4 4 0 0 1-8 0zm-3 7h2c0 3.4 1.7 5 5 5s5-1.6 5-5h2c0 4-2 6.3-6 6.9V21h4v2H7v-2h4v-3.1C7 17.3 5 15 5 11Z"/>',
  calendar: '<path d="M4 4h3V2h2v2h6V2h2v2h3v18H4zm2 6v9h12v-9zm2 2h3v3H8z" fill-rule="evenodd"/>',
  target: '<path d="M12 2a10 10 0 1 0 10 10h-4a6 6 0 1 1-6-6zm0 7a3 3 0 1 0 3 3h-3zm3-5h4V1h2v5l-7 7-2-2z"/>',
};

/** Inner SVG markup for a badge; [id] keeps gradient ids unique on the page. */
export function badgeSvgInner({ id, template, icon, color, tier, locked = false, won = false, animate = false }) {
  const c = locked ? LOCKED : (COLORS[color] ?? COLORS.flare);
  const rare = tier === "rare";
  const epic = tier === "epic";
  const shape = SHAPES[template] ?? SHAPES.medal;
  const iconScale = template === "streak" ? 0.84 : 0.8;
  const glyph = GLYPHS[icon] ?? GLYPHS.star;
  const isWon = won && !locked;
  let s =
    `<defs><linearGradient id="${id}base" x1="20" y1="10" x2="98" y2="110" gradientUnits="userSpaceOnUse">` +
    `<stop offset="0" stop-color="${c.light}"/><stop offset=".47" stop-color="${c.base}"/><stop offset="1" stop-color="${c.dark}"/></linearGradient>` +
    `<linearGradient id="${id}rim" x1="20" y1="10" x2="95" y2="108" gradientUnits="userSpaceOnUse">` +
    `<stop offset="0" stop-color="${epic ? "#FFF6CE" : c.light}"/><stop offset=".32" stop-color="${c.base}"/>` +
    `<stop offset=".7" stop-color="${c.dark}"/><stop offset="1" stop-color="${epic ? "#FFD166" : c.light}"/></linearGradient>` +
    `<radialGradient id="${id}inner" cx=".42" cy=".32" r=".78">` +
    `<stop offset="0" stop-color="${c.light}"/><stop offset=".28" stop-color="${c.base}"/><stop offset="1" stop-color="${c.dark}"/></radialGradient>` +
    `<clipPath id="${id}clip"><path d="${shape}"/></clipPath></defs>`;
  if (epic) {
    s += `<g fill="${c.base}">`;
    for (let i = 0; i < 12; i++) s += `<path d="M58 1h4l-1 17h-2z" transform="rotate(${i * 30} 60 60)"/>`;
    s += "</g>";
  }
  s +=
    `<path d="${shape}" fill="url(#${id}base)" stroke="${epic || rare ? `url(#${id}rim)` : c.dark}" stroke-width="${epic ? 6 : rare ? 4 : 3}" stroke-linejoin="round"/>` +
    `<path d="${shape}" fill="none" stroke="${c.light}" stroke-opacity="${locked ? 0.15 : 0.65}" stroke-width="1.4" transform="translate(60 60) scale(.88) translate(-60 -60)"/>`;
  if (rare || epic) {
    s += `<path d="${shape}" fill="url(#${id}inner)" opacity=".28" transform="translate(60 60) scale(.72) translate(-60 -60)"/>`;
  }
  if (epic) {
    s += `<g fill="${c.light}" stroke="${c.dark}" stroke-width="1">`;
    for (const a of [0, 45, 90, 135, 180, 225, 270, 315]) s += `<circle cx="60" cy="9" r="2.7" transform="rotate(${a} 60 60)"/>`;
    s += "</g>";
  }
  if (locked) {
    // The lock replaces the symbol (drawn over it, the two blur together).
    s += '<g opacity=".9" fill="#1D1D1D"><path d="M51 57v-6a9 9 0 0 1 18 0v6h4v20H47V57zm5 0h8v-6a4 4 0 0 0-8 0z" fill-rule="evenodd"/></g>';
  } else {
    const ink = tier === "common" ? "#FFF7E8" : "#FFFFFF";
    s += `<g transform="translate(${60 - 12 * iconScale} ${58 - 12 * iconScale}) scale(${iconScale})" fill="${ink}" stroke="${ink}" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">${glyph}</g>`;
  }
  if ((rare || epic) && !locked) {
    s +=
      `<g fill="${c.light}"><path d="m20 23 1.5 3.5L25 28l-3.5 1.5L20 33l-1.5-3.5L15 28l3.5-1.5z"/>` +
      `<path d="m100 76 1.2 2.8 2.8 1.2-2.8 1.2L100 84l-1.2-2.8L96 80l2.8-1.2z"/>` +
      `${epic ? '<path d="m94 22 2 4.5 4.5 2-4.5 2-2 4.5-2-4.5-4.5-2 4.5-2z"/>' : ""}</g>`;
  }
  if (isWon) {
    s +=
      '<g fill="none" stroke="#FFF1C2" stroke-width="4" stroke-linecap="round">' +
      '<path d="M26 82C14 69 15 52 23 40m71 42c12-13 11-30 3-42"/>' +
      '<path d="m25 74-8-1m10 3-3 8m69-10 8-1m-10 3 3 8M28 62l-8-3m72 3 8-3M33 89c18 10 36 10 54 0"/>' +
      '<path d="m60 101 2.6 5.2 5.7.8-4.1 4 1 5.7-5.2-2.8-5.2 2.8 1-5.7-4.1-4 5.7-.8z" fill="#FFF1C2" stroke-width="1"/></g>';
  }
  if (epic && !locked) {
    s += `<g clip-path="url(#${id}clip)"><path class="${animate ? "badge-shine" : ""}" d="m-30 100 22 12L62-12 40-24z" fill="#fff" opacity=".52"/></g>`;
  }
  return s;
}
