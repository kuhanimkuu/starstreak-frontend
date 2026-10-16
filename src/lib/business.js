import { createContext, useContext } from "react";

// Shared by the Starstreak Business layout and pages.

export const OrgContext = createContext(null);
export const useOrg = () => useContext(OrgContext);

export const STATUS_TEXT = {
  pending_email: "Waiting for your email code",
  pending_review: "Being checked by Starstreak",
  approved_unpaid: "Verified · billing not set up",
  active: "Active",
  grace: "Payment overdue",
  lapsed: "Lapsed",
  rejected: "Not approved",
};

/** "KES 1,000" / "$12.50": an amount in minor units (cents) in its currency. */
export function money(minor, currency = "KES") {
  const value = Number(minor || 0) / 100;
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(value);
  } catch {
    return `${currency} ${value.toLocaleString()}`;
  }
}

// A cell that starts with = + - @ (or a tab/CR) is run as a formula by
// spreadsheet apps; prefixing a quote keeps it as text (CSV injection).
const cell = (v) => {
  let s = v == null ? "" : String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

/** Downloads rows as a CSV file. columns: [[header, row => value], ...]. */
export function downloadCsv(filename, columns, rows) {
  const lines = [columns.map(([h]) => cell(h)).join(",")]
    .concat(rows.map((r) => columns.map(([, get]) => cell(get(r))).join(",")));
  // BOM so Excel reads accents and emoji correctly.
  const blob = new Blob(["\uFEFF" + lines.join("\r\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement("a"), { href: url, download: filename });
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
