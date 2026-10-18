import { useCallback, useEffect, useState } from "react";
import { FiSend } from "react-icons/fi";
import { supabase } from "../../lib/supabase";

// Reply by email from no-reply@starstreak.org (edge function ops-send-email);
// replies aren't read, the email points people to the contact form.
// The recipient is the address on the message/request, chosen by the server;
// every email sent is listed underneath from outbound_emails. An address that
// bounced or marked us as spam (email_suppressions) is refused until the team
// allows it again here.

const STATUS_LABEL = { sent: "Sent", sending: "Sending", failed: "Failed", bounced: "Bounced", complained: "Marked as spam" };

async function errorText(error) {
  try {
    const body = await error?.context?.json?.();
    if (body?.error) return body.error;
  } catch { /* not JSON */ }
  return error?.message || "Couldn't send the email.";
}

export default function ReplyBox({ kind, id, to, defaultSubject, greeting, statusAfter, statusLabel, onSent }) {
  const [subject, setSubject] = useState(defaultSubject);
  const [body, setBody] = useState(greeting);
  const [markStatus, setMarkStatus] = useState(Boolean(statusAfter));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [history, setHistory] = useState(null);
  const [blocked, setBlocked] = useState(null); // "bounced" | "complained" | null

  const loadHistory = useCallback(async () => {
    const { data } = await supabase.from("outbound_emails")
      .select("id, created_at, subject, body, status, error")
      .eq("related_id", id).order("created_at", { ascending: false });
    setHistory(data || []);
    const { data: s } = await supabase.from("email_suppressions")
      .select("reason").eq("email", (to || "").trim().toLowerCase()).maybeSingle();
    setBlocked(s?.reason || null);
  }, [id, to]);

  async function allowAgain() {
    if (!window.confirm(`Allow emails to ${to} again? Only do this if they've fixed their mailbox or asked to hear from us.`)) return;
    const { error: e } = await supabase.rpc("ops_unsuppress_email", { p_email: to });
    if (e) return setError(`Couldn't change it: ${e.message}`);
    setError("");
    setNotice(`Emails to ${to} are allowed again.`);
    loadHistory();
  }

  useEffect(() => {
    const t = setTimeout(loadHistory, 0);
    return () => clearTimeout(t);
  }, [loadHistory]);

  async function send() {
    if (busy) return;
    if (!subject.trim() || !body.trim()) return setError("Write a subject and a message.");
    if (!window.confirm(`Send this email to ${to}?`)) return;
    setBusy(true);
    setError("");
    setNotice("");
    const status = markStatus ? statusAfter : null;
    const { error: e } = await supabase.functions.invoke("ops-send-email", {
      body: { kind, id, subject: subject.trim(), body: body.trim(), status },
    });
    setBusy(false);
    loadHistory();
    if (e) return setError(await errorText(e));
    setNotice(`Sent to ${to}.`);
    setBody(greeting);
    if (status) onSent?.(status);
  }

  const field = "w-full bg-night-900 border border-night-600 text-star text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-flare";
  return (
    <div className="bg-night-800 border border-night-600 rounded-xl p-4 space-y-3">
      <div>
        <p className="text-mist text-xs font-medium">Reply by email</p>
        <p className="text-dust text-xs mt-0.5">To {to}, from no-reply@starstreak.org. They can't reply; the email links them to the contact form, which lands back here.</p>
      </div>
      <label className="block text-dust text-xs">Subject
        <input value={subject} onChange={(e) => setSubject(e.target.value)} maxLength={200} className={`mt-1 ${field}`} />
      </label>
      <label className="block text-dust text-xs">Message
        <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={8} maxLength={20000} className={`mt-1 resize-y ${field}`} />
      </label>
      {statusAfter && (
        <label className="flex items-center gap-2 text-xs text-mist">
          <input type="checkbox" checked={markStatus} onChange={(e) => setMarkStatus(e.target.checked)} className="accent-[#FF6D1F]" />
          Mark as {statusLabel} after sending
        </label>
      )}
      {blocked && (
        <div role="alert" className="text-xs text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-lg p-2 space-y-1">
          <p>{blocked === "bounced"
            ? "An earlier email to this address bounced, so it probably doesn't exist. Sending is blocked."
            : "This person marked an earlier Starstreak email as spam. Sending is blocked."}</p>
          <button onClick={allowAgain} className="underline hover:text-amber-200">Allow emails to this address again</button>
        </div>
      )}
      {error && <p role="alert" className="text-xs text-red-400">{error}</p>}
      {notice && <p role="status" className="text-xs text-green-400">{notice}</p>}
      <button onClick={send} disabled={busy || Boolean(blocked)}
        className="flex items-center justify-center gap-2 w-full py-2 text-sm bg-flare-deep hover:bg-flare text-star rounded-lg transition-colors disabled:opacity-50">
        <FiSend /> {busy ? "Sending…" : "Send"}
      </button>

      {history?.length > 0 && (
        <div className="pt-2 border-t border-night-600">
          <p className="text-dust text-xs mb-2">Sent</p>
          <ul className="space-y-2">
            {history.map((m) => (
              <li key={m.id} className="text-xs">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-star truncate">{m.subject}</span>
                  <span className={m.status === "sent" ? "text-green-400" : m.status === "sending" ? "text-dust" : "text-red-400"}>
                    {STATUS_LABEL[m.status] || m.status} · {new Date(m.created_at).toLocaleString()}
                  </span>
                </div>
                <p className="text-dust whitespace-pre-wrap line-clamp-3 mt-0.5">{m.body}</p>
                {m.status !== "sent" && m.error && <p className="text-red-400/80 mt-0.5">{m.error}</p>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
