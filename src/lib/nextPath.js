/**
 * Where to go after signing in: the ?next= path when it's a page on this site
 * (never another site — "//evil.com" and "/\evil.com" are rejected), else the
 * web app's home.
 */
export function nextPath(search = window.location.search) {
  const next = new URLSearchParams(search).get("next") || "";
  const onThisSite = next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/\\");
  return onThisSite ? next : "/home";
}
