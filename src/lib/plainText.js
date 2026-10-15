// Plain-text content (pasted, often with hard line breaks and stray indents)
// turned into headings, paragraphs and lists, so it reads like a page.

const escapeHtml = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const BULLET = /^([-*•–]|\d+[.)])\s+/;
const isBullet = (line) => BULLET.test(line);
// A title line: short, no sentence-ending punctuation.
// (Not a sign-off like "— The Starstreak Team".)
const isHeading = (line) =>
  line.length <= 60 && !/[.!?,;:]$/.test(line) && !isBullet(line) && !/^[—–]/.test(line);
const listItems = (lines) => lines.map((l) => `<li>${escapeHtml(l.replace(BULLET, ""))}</li>`).join("");

/**
 * Blank lines separate blocks. In a block: a lone short line is a heading;
 * a short first line followed by text is a subheading + paragraph; lines
 * starting with "- ", "* ", "• " or "1." are a list; everything else is one
 * paragraph with its hard line breaks joined.
 */
export function plainTextToHtml(text) {
  const blocks = String(text).replace(/\r\n?/g, "\n").split(/\n\s*\n/);
  const out = [];
  for (const block of blocks) {
    const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) continue;
    if (lines.every(isBullet)) {
      const ordered = lines.every((l) => /^\d+[.)]\s+/.test(l));
      out.push(ordered ? `<ol>${listItems(lines)}</ol>` : `<ul>${listItems(lines)}</ul>`);
      continue;
    }
    if (lines.length === 1 && isHeading(lines[0])) {
      out.push(`<h2>${escapeHtml(lines[0])}</h2>`);
      continue;
    }
    let rest = lines;
    if (lines.length > 1 && isHeading(lines[0]) && !isHeading(lines[1])) {
      out.push(`<h3>${escapeHtml(lines[0])}</h3>`);
      rest = lines.slice(1);
    }
    // A paragraph may end in a list: "...shipping:" then "- a", "- b".
    const firstBullet = rest.findIndex(isBullet);
    const para = firstBullet === -1 ? rest : rest.slice(0, firstBullet);
    if (para.length) out.push(`<p>${escapeHtml(para.join(" "))}</p>`);
    if (firstBullet !== -1) out.push(`<ul>${listItems(rest.slice(firstBullet).filter(isBullet))}</ul>`);
  }
  return out.join("\n");
}
