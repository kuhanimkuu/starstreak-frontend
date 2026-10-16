import { useCallback, useEffect, useState } from "react";
import { FiSend } from "react-icons/fi";
import { supabase } from "../../lib/supabase";

// Reply by email from hello@starstreak.org (edge function ops-send-email).
// The recipient is the address on the message/request, chosen by the server;
// every email sent is listed underneath from outbound_emails.

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

  const loadHistory = useCallback(async () => {
    const { data } = await supabase.from("outbound_emails")
      .select("id, created_at, subject, body, status, error")
      .eq("related_id", id).order("created_at", { ascending: false });
    setHistory(data || []);
  }, [id]);

  useEffect(() => {
    const t = setTimeout(loadHistory, 0);
    return () => clearTimeout(t);
  }, [loadHistory]);

  async function send() {
    if (busy) return;
    if (!subject.trim() || !body.trim()) return setError("Write a subject and a message.");
    if (!window.confirm(`Send this email to ${to} from hello@starstreak.org?`)) return;
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
        <p className="text-dust text-xs mt-0.5">From hello@starstreak.org to {to}. Their reply comes back to hello@.</p>
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
      {error && <p role="alert" className="text-xs text-red-400">{error}</p>}
      {notice && <p role="status" className="text-xs text-green-400">{notice}</p>}
      <button onClick={send} disabled={busy}
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
                  <span className={m.status === "sent" ? "text-green-400" : m.status === "failed" ? "text-red-400" : "text-dust"}>
                    {m.status === "sent" ? "Sent" : m.status === "failed" ? "Failed" : "Sending"} · {new Date(m.created_at).toLocaleString()}
                  </span>
                </div>
                <p className="text-dust whitespace-pre-wrap line-clamp-3 mt-0.5">{m.body}</p>
                {m.status === "failed" && m.error && <p className="text-red-400/80 mt-0.5">{m.error}</p>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
