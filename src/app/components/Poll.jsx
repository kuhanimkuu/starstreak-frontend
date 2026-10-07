import { useState } from "react";
import { FiCheckCircle } from "react-icons/fi";
import { useAppSession } from "../AppSession";

function timeLeft(expiresAt) {
  if (!expiresAt) return null;
  const ms = new Date(expiresAt).getTime() - Date.now();
  if (ms <= 0) return "Final results";
  const h = Math.floor(ms / 3600000);
  if (h >= 24) return `${Math.floor(h / 24)}d left`;
  if (h >= 1) return `${h}h left`;
  return `${Math.max(1, Math.floor(ms / 60000))}m left`;
}

/**
 * A poll. `vote(optionId)` records the vote server-side and resolves to the
 * updated poll; other people's votes come back blanked, so `voters` only ever
 * shows your own id.
 */
export default function Poll({ poll: initial, vote: submitVote }) {
  const { myId, notify } = useAppSession();
  const [poll, setPoll] = useState(initial);
  const [busy, setBusy] = useState(false);
  if (!poll?.options?.length) return null;

  const options = poll.options;
  const total = options.reduce((s, o) => s + (Number(o.votes) || 0), 0);
  const mine = options.find((o) => (o.voters || []).includes(myId))?.id;
  const expired = poll.expiresAt && new Date(poll.expiresAt).getTime() <= Date.now();
  const showResults = !!mine || expired || poll.showResultsBeforeVoting;

  async function vote(optionId) {
    if (busy || expired || !myId || optionId === mine) return;
    setBusy(true);
    const before = poll;
    // Optimistic: move my vote.
    setPoll({
      ...poll,
      options: options.map((o) => {
        const voters = (o.voters || []).filter((v) => v !== myId);
        if (o.id === optionId) voters.push(myId);
        return { ...o, voters, votes: voters.length };
      }),
    });
    try {
      const fresh = await submitVote(optionId);
      if (fresh) setPoll(fresh);
    } catch (e) {
      setPoll(before);
      notify(e.message, "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-3 space-y-2" onClick={(e) => e.stopPropagation()}>
      {poll.question && <p className="font-semibold text-star">{poll.question}</p>}
      {options.map((o) => {
        const votes = Number(o.votes) || 0;
        const pct = total ? Math.round((votes / total) * 100) : 0;
        const isMine = o.id === mine;
        return showResults ? (
          <button key={o.id} onClick={() => vote(o.id)} disabled={busy || expired}
                  className="relative block w-full overflow-hidden rounded-xl border border-line bg-night-850 text-left disabled:cursor-default">
            {/* Tinted bar so the text on top stays readable. */}
            <span className={`absolute inset-y-0 left-0 ${isMine ? "bg-flare/30" : "bg-night-600/60"} transition-[width] duration-500`}
                  style={{ width: `${pct}%` }} />
            <span className="relative flex items-center gap-2 px-4 py-2.5 text-sm">
              <span className={`min-w-0 flex-1 truncate ${isMine ? "font-semibold text-star" : "text-mist"}`}>{o.text}</span>
              {isMine && <FiCheckCircle className="shrink-0 text-flare" />}
              <span className="shrink-0 font-semibold text-star">{pct}%</span>
            </span>
          </button>
        ) : (
          <button key={o.id} onClick={() => vote(o.id)} disabled={busy}
                  className="block w-full rounded-xl border border-flare/50 px-4 py-2.5 text-left text-sm font-semibold text-flare transition-colors hover:bg-flare/10">
            {o.text}
          </button>
        );
      })}
      <p className="text-xs text-dust">
        {total} {total === 1 ? "vote" : "votes"}
        {poll.expiresAt && ` · ${timeLeft(poll.expiresAt)}`}
        {mine && !expired && " · tap another option to change your vote"}
      </p>
    </div>
  );
}
