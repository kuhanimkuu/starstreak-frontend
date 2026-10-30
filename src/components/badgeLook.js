// The parts of a badge's look that ops pick: shared by BadgeArt and the
// /ops/badges editor. Keep in sync with lib/features/badges/badge_art.dart.
import {
  MdCalendarMonth, MdGpsFixed,
  MdStar, MdBolt, MdFlashOn, MdLocalFireDepartment, MdWhereToVote, MdForum, MdGroups,
  MdAddCircle, MdEdit, MdPersonAddAlt1, MdPeopleAlt, MdFavorite, MdEmojiEvents,
  MdWorkspacePremium, MdCelebration, MdRocketLaunch, MdSportsSoccer, MdSports, MdStyle,
  MdTimelapse, MdMusicNote, MdMic, MdCode,
} from "react-icons/md";

export const TEMPLATES = [
  { value: "flarely", label: "Flarely" },
  { value: "streak", label: "Streak" },
  { value: "crest", label: "Crest" },
  { value: "medal", label: "Medal" },
];

export const TIERS = [
  { value: "common", label: "Common", hint: "Flat, one colour" },
  { value: "rare", label: "Rare", hint: "Gradient and shine" },
  { value: "epic", label: "Epic", hint: "Gold rim and sparkles" },
];

// No checkmark blue in any badge.
export const COLORS = {
  flare: { base: "#FF6D1F", light: "#FFD166", dark: "#C2410C" },
  amber: { base: "#FFAB3D", light: "#FFE3A8", dark: "#C77A12" },
  gold: { base: "#FFD166", light: "#FFF1C2", dark: "#B8860B" },
  purple: { base: "#A855F7", light: "#E2C6FF", dark: "#6B2FB3" },
  green: { base: "#22C55E", light: "#BBF7D0", dark: "#15803D" },
  red: { base: "#EF4444", light: "#FECACA", dark: "#B91C1C" },
  pink: { base: "#EC4899", light: "#FBCFE8", dark: "#BE185D" },
};

export const ICONS = {
  star: MdStar, calendar: MdCalendarMonth, target: MdGpsFixed, bolt: MdBolt, flash: MdFlashOn, fire: MdLocalFireDepartment, pin: MdWhereToVote,
  chat: MdForum, groups: MdGroups, add: MdAddCircle, edit: MdEdit, person_add: MdPersonAddAlt1,
  people: MdPeopleAlt, heart: MdFavorite, trophy: MdEmojiEvents, crown: MdWorkspacePremium,
  celebration: MdCelebration, rocket: MdRocketLaunch, goal: MdSportsSoccer, whistle: MdSports,
  card: MdStyle, timer: MdTimelapse, music: MdMusicNote, mic: MdMic, code: MdCode,
};

export const FLARELY_POSES = ["main", "wave", "celebrate", "chat", "search", "stopwatch", "sleep"];
