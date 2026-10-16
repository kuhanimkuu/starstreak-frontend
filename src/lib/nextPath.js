/**
 * Where to go after signing in: the ?next= path when it's a page on this site
 * (never another site — "//evil.com" and "/\evil.com" are rejected), else the
 * web app's home.
 */
export function nextPath(search = window.location.search) {
  const next = new URLSearchParams(search).get("next") || "";
  // Browsers drop tabs and newlines from URLs ("/<tab>/evil.com" becomes
  // "//evil.com"), so any whitespace, control character or backslash is
  // rejected outright.
  // eslint-disable-next-line no-control-regex
  const unsafe = /[\s\\\u0000-\u001f]/;
  const onThisSite = next.startsWith("/") && !next.startsWith("//") && !unsafe.test(next);
  return onThisSite ? next : "/home";
}
