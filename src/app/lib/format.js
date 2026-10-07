export function timeAgo(iso) {
  if (!iso) return "";
  const then = new Date(iso);
  const s = Math.max(0, (Date.now() - then.getTime()) / 1000);
  if (s < 60) return "now";
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  if (s < 604800) return `${Math.floor(s / 86400)}d`;
  const sameYear = then.getFullYear() === new Date().getFullYear();
  return then.toLocaleDateString(undefined, { month: "short", day: "numeric", ...(sameYear ? {} : { year: "numeric" }) });
}

export function fullDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleString(undefined, {
    hour: "numeric", minute: "2-digit", month: "short", day: "numeric", year: "numeric",
  });
}

export function compact(n) {
  const v = Number(n) || 0;
  if (v < 1000) return String(v);
  if (v < 1e6) return `${(v / 1000).toFixed(v < 10000 ? 1 : 0).replace(/\.0$/, "")}K`;
  return `${(v / 1e6).toFixed(1).replace(/\.0$/, "")}M`;
}
