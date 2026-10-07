import { useEffect, useRef, useState } from "react";
import { FiImage, FiBarChart2, FiEyeOff, FiX, FiPlus } from "react-icons/fi";
import Avatar from "./Avatar";
import { createPost, IMAGE_TYPES, MAX_IMAGES } from "../lib/api";
import { AppOnlyModal } from "./GetTheApp";
import { useAppSession } from "../AppSession";

const LIMIT = 10000;
const DURATIONS = [
  { label: "No end", hours: 0 },
  { label: "1 day", hours: 24 },
  { label: "3 days", hours: 72 },
  { label: "7 days", hours: 168 },
];

/** Write a post: text, up to 4 images, an optional poll, optionally anonymous. */
/** `adapter` posts into a community / Flash instead of the feed (lib/adapters). */
export default function Composer({ onPosted, autoFocus = false, compact = false, adapter = null, placeholder }) {
  const { myId, me, notify } = useAppSession();
  const [text, setText] = useState("");
  const [images, setImages] = useState([]); // { file, url }
  const [poll, setPoll] = useState(null); // { question, options[], hours }
  const allowAnonymous = adapter ? adapter.allowAnonymousPosts : true;
  const [anonymous, setAnonymous] = useState(allowAnonymous && !!me?.default_anonymous_mode);
  const [busy, setBusy] = useState(false);
  const [pollPrompt, setPollPrompt] = useState(false);
  const [error, setError] = useState("");
  const area = useRef(null);
  const fileInput = useRef(null);

  // Free the image previews when the composer goes away.
  const previews = useRef(images);
  previews.current = images;
  useEffect(() => () => previews.current.forEach((i) => URL.revokeObjectURL(i.url)), []);

  useEffect(() => {
    const el = area.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [text]);

  function addImages(files) {
    setError("");
    const ok = [...files].filter((f) => IMAGE_TYPES.includes(f.type));
    if (ok.length < files.length) setError("Only JPEG, PNG, WebP or GIF images.");
    const room = MAX_IMAGES - images.length;
    if (ok.length > room) setError(`Up to ${MAX_IMAGES} images per post.`);
    setImages((cur) => [...cur, ...ok.slice(0, room).map((file) => ({ file, url: URL.createObjectURL(file) }))]);
    setPoll(null);
  }

  const pollValid =
    !poll || (poll.question.trim() && poll.options.filter((o) => o.trim()).length >= 2);
  const canPost =
    !busy && text.length <= LIMIT && pollValid && (text.trim() || images.length || poll);

  async function submit() {
    if (!canPost) return;
    setBusy(true);
    setError("");
    try {
      const input = {
        me,
        myId,
        content: text,
        images: images.map((i) => i.file),
        anonymous,
        poll: poll && {
          question: poll.question,
          options: poll.options.filter((o) => o.trim()),
          expiresAt: poll.hours ? new Date(Date.now() + poll.hours * 3600000) : null,
        },
      };
      const post = adapter ? await adapter.create(input) : await createPost(input);
      setText("");
      images.forEach((i) => URL.revokeObjectURL(i.url));
      setImages([]);
      setPoll(null);
      notify(anonymous ? "Posted anonymously" : "Posted");
      onPosted?.(post);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  const left = LIMIT - text.length;

  return (
    <div className={`flex gap-3 ${compact ? "" : "border-b border-line px-4 py-3"}`}>
      <Avatar anonymous={anonymous} src={me?.avatar_url} name={me?.display_name} />
      <div className="min-w-0 flex-1">
        {anonymous && (
          <p className="mb-1 text-xs font-semibold text-mist">
            Posting as <span className="text-star">{me?.anonymous_name || "Anonymous"}</span> — your name won't be shown
          </p>
        )}
        <textarea
          ref={area}
          value={text}
          autoFocus={autoFocus}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => (e.metaKey || e.ctrlKey) && e.key === "Enter" && submit()}
          placeholder={poll ? "Add some context (optional)" : placeholder || "What's happening?"}
          rows={compact ? 4 : 2}
          maxLength={LIMIT + 500}
          className="w-full resize-none bg-transparent py-2 text-lg text-star placeholder-dust focus:outline-none"
        />

        {images.length > 0 && (
          <div className={`mt-2 grid gap-2 ${images.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
            {images.map((img, i) => (
              <div key={img.url} className="relative overflow-hidden rounded-2xl border border-line">
                <img src={img.url} alt="" className="aspect-video w-full object-cover" />
                <button onClick={() => { URL.revokeObjectURL(img.url); setImages(images.filter((_, j) => j !== i)); }} aria-label="Remove image"
                        className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-black/70 text-white">
                  <FiX />
                </button>
              </div>
            ))}
          </div>
        )}

        {poll && (
          <div className="mt-2 space-y-2 rounded-2xl border border-line p-3">
            <input className="field" placeholder="Ask a question" maxLength={200} value={poll.question}
                   onChange={(e) => setPoll({ ...poll, question: e.target.value })} />
            {poll.options.map((o, i) => (
              <div key={i} className="flex gap-2">
                <input className="field" placeholder={`Choice ${i + 1}${i > 1 ? " (optional)" : ""}`} maxLength={80} value={o}
                       onChange={(e) => setPoll({ ...poll, options: poll.options.map((x, j) => (j === i ? e.target.value : x)) })} />
                {i > 1 && (
                  <button onClick={() => setPoll({ ...poll, options: poll.options.filter((_, j) => j !== i) })}
                          className="grid w-11 shrink-0 place-items-center rounded-xl text-dust hover:bg-night-700 hover:text-star" aria-label="Remove choice">
                    <FiX />
                  </button>
                )}
              </div>
            ))}
            <div className="flex flex-wrap items-center justify-between gap-2">
              {poll.options.length < 4 ? (
                <button onClick={() => setPoll({ ...poll, options: [...poll.options, ""] })}
                        className="flex items-center gap-1 text-sm font-semibold text-accent hover:text-gold">
                  <FiPlus /> Add a choice
                </button>
              ) : <span />}
              <label className="flex items-center gap-2 text-sm text-mist">
                Poll length
                <select value={poll.hours} onChange={(e) => setPoll({ ...poll, hours: Number(e.target.value) })}
                        className="rounded-lg border border-night-600 bg-night-850 px-2 py-1 text-star">
                  {DURATIONS.map((d) => <option key={d.hours} value={d.hours}>{d.label}</option>)}
                </select>
              </label>
            </div>
            <button onClick={() => setPoll(null)} className="text-sm font-semibold text-red-400 hover:text-red-300">Remove poll</button>
          </div>
        )}

        {error && <p className="mt-2 text-sm text-red-400">{error}</p>}

        <div className="mt-2 flex items-center gap-1 border-t border-line pt-2">
          <input ref={fileInput} type="file" accept={IMAGE_TYPES.join(",")} multiple hidden
                 onChange={(e) => { addImages(e.target.files); e.target.value = ""; }} />
          <button onClick={() => fileInput.current?.click()} disabled={!!poll || images.length >= MAX_IMAGES}
                  className="grid h-9 w-9 place-items-center rounded-full text-flare hover:bg-flare/10 disabled:opacity-40" aria-label="Add images" title="Images">
            <FiImage />
          </button>
          {/* Making polls is app-only on the web (voting still works here). */}
          <button onClick={() => setPollPrompt(true)} disabled={images.length > 0}
                  className={`grid h-9 w-9 place-items-center rounded-full hover:bg-flare/10 disabled:opacity-40 ${poll ? "bg-flare/15 text-flare" : "text-flare"}`}
                  aria-label="Add a poll" title="Poll">
            <FiBarChart2 />
          </button>
          {allowAnonymous && (
            <button onClick={() => setAnonymous((v) => !v)} aria-pressed={anonymous} title="Post anonymously"
                    className={`flex h-9 items-center gap-1.5 rounded-full px-3 text-sm font-semibold transition-colors ${anonymous ? "bg-flare/15 text-flare" : "text-mist hover:bg-night-700"}`}>
              <FiEyeOff /> <span className="hidden sm:inline">Anonymous</span>
            </button>
          )}
          <div className="ml-auto flex items-center gap-3">
            {text.length > LIMIT - 500 && (
              <span className={`text-sm ${left < 0 ? "text-red-400" : "text-dust"}`}>{left}</span>
            )}
            <button onClick={submit} disabled={!canPost} className="btn-flare !px-5 !py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0">
              {busy ? "Posting…" : "Post"}
            </button>
          </div>
        </div>
      </div>
      {pollPrompt && <AppOnlyModal feature="poll" onClose={() => setPollPrompt(false)} />}
    </div>
  );
}
