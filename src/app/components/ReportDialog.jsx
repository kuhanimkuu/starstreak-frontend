import { useEffect, useState } from "react";
import { FiFlag, FiX } from "react-icons/fi";
import { REPORT_REASONS, report } from "../lib/api";
import { useAppSession } from "../AppSession";

/**
 * Report something to the Starstreak team. `target`: { type: "post" |
 * "comment" | "user", id, communityId?, label }.
 */
export default function ReportDialog({ target, onClose }) {
  const { myId, notify } = useAppSession();
  const [reason, setReason] = useState(null);
  const [details, setDetails] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const esc = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [onClose]);

  async function send() {
    if (!reason || busy) return;
    setBusy(true);
    try {
      await report({ myId, type: target.type, id: target.id, communityId: target.communityId, reason, details });
      notify("Thanks — our team will review it");
      onClose();
    } catch (e) {
      notify(e.message, "error");
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[85] flex items-end justify-center bg-black/60 sm:items-center sm:p-4" onMouseDown={onClose} role="dialog" aria-modal aria-label="Report">
      <div className="max-h-[90vh] w-full overflow-y-auto rounded-t-3xl border border-line bg-night-900 p-5 sm:max-w-md sm:rounded-3xl" onMouseDown={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-extrabold"><FiFlag className="text-red-400" /> Report {target.label}</h2>
          <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full text-dust hover:bg-night-700 hover:text-star" aria-label="Close"><FiX /></button>
        </div>
        <p className="mt-1 text-sm text-mist">Reports are private — the person won't know it was you.</p>
        <div className="mt-4 space-y-1.5" role="radiogroup">
          {REPORT_REASONS.map(([value, label]) => (
            <button key={value} role="radio" aria-checked={reason === value} onClick={() => setReason(value)}
                    className={`flex w-full items-center gap-3 rounded-xl border px-4 py-2.5 text-left text-sm transition-colors ${
                      reason === value ? "border-flare bg-flare/10 text-star" : "border-line text-mist hover:text-star"}`}>
              <span className={`h-4 w-4 shrink-0 rounded-full border-2 ${reason === value ? "border-flare bg-flare" : "border-night-600"}`} />
              {label}
            </button>
          ))}
        </div>
        <textarea value={details} onChange={(e) => setDetails(e.target.value)} maxLength={1000} rows={3}
                  placeholder="Anything else we should know? (optional)"
                  className="field mt-4 resize-none" />
        <p className="mt-2 text-xs text-dust">If someone is in immediate danger, contact local emergency services.</p>
        <button onClick={send} disabled={!reason || busy} className="mt-4 w-full rounded-full bg-red-500 py-3 font-semibold text-white transition-opacity disabled:opacity-40">
          {busy ? "Sending…" : "Send report"}
        </button>
      </div>
    </div>
  );
}
