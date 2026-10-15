import { useCallback, useEffect, useMemo, useState } from "react";
import { FiImage, FiX, FiSend, FiTrash2, FiExternalLink, FiHeart, FiMessageCircle } from "react-icons/fi";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";
import { PostPreview } from "../../components/LinkPreview";
import { OfficialBadge } from "../../components/Official";
import { timeAgo } from "../../app/lib/format";

// Publish as Starstreak: an official post (gold card, "Official" badge) that
// goes to everyone's feed and/or the Starstreak community. Writes go through
// ops_publish_official_post, which checks is_ops_admin() on the server.

const MAX_TEXT = 5000;
const MAX_MEDIA = 4;
const MAX_BYTES = 50 * 1024 * 1024;
const VIDEO = /^video\//;

const WHERE = [
  { value: "feed", label: "Everyone's feed", hint: "Appears in every user's home feed." },
  { value: "community", label: "Starstreak community", hint: "A post inside the Starstreak community only." },
  { value: "both", label: "Both", hint: "Feed post plus a copy in the community." },
];

async function uploadMedia(file, myId, folder) {
  const ext = (file.name.split(".").pop() || (VIDEO.test(file.type) ? "mp4" : "jpg")).toLowerCase();
  const path = `${myId}/${folder}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("posts").upload(path, file, { contentType: file.type });
  if (error) throw new Error(`Couldn't upload ${file.name}: ${error.message}`);
  return supabase.storage.from("posts").getPublicUrl(path).data.publicUrl;
}

function Published({ items, onRemove, removing }) {
  if (!items.length) {
    return <p className="text-dust text-sm">Nothing published yet.</p>;
  }
  return (
    <ul className="divide-y divide-line">
      {items.map((it) => (
        <li key={`${it.kind}-${it.id}`} className="flex items-start gap-4 py-4">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 text-xs text-dust">
              <span className={`rounded-full px-2 py-0.5 ${it.kind === "feed" ? "bg-flare/15 text-flare" : "bg-sky-500/15 text-sky-400"}`}>
                {it.kind === "feed" ? "Feed" : "Community"}
              </span>
              <span>{timeAgo(it.created_at)}</span>
              <span className="flex items-center gap-1"><FiHeart /> {it.likes}</span>
              <span className="flex items-center gap-1"><FiMessageCircle /> {it.comments}</span>
            </div>
            <p className="mt-1.5 line-clamp-2 whitespace-pre-line text-sm text-star">{it.content || "(media only)"}</p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            {it.link && (
              <a href={it.link} target="_blank" rel="noreferrer" title="Open"
                 className="grid h-8 w-8 place-items-center rounded-lg text-mist hover:bg-night-700 hover:text-star">
                <FiExternalLink />
              </a>
            )}
            <button onClick={() => onRemove(it)} disabled={removing === it.id} title="Remove"
                    className="grid h-8 w-8 place-items-center rounded-lg text-red-400 hover:bg-red-500/10 disabled:opacity-40">
              <FiTrash2 />
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}

export default function AdminPublish() {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [files, setFiles] = useState([]);
  const [where, setWhere] = useState("feed");
  // TEMPORARY (testing): instant silent push via official-post-push.
  const [instantPush, setInstantPush] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [items, setItems] = useState([]);
  const [removing, setRemoving] = useState(null);

  const previews = useMemo(() => files.map((f) => ({ file: f, url: URL.createObjectURL(f) })), [files]);
  useEffect(() => () => previews.forEach((p) => URL.revokeObjectURL(p.url)), [previews]);

  const load = useCallback(async () => {
    const { data: cid } = await supabase.rpc("official_community_id");
    const [feed, comm] = await Promise.all([
      supabase.from("posts_public").select("id, content, created_at, likes, comment_count, short_id")
        .eq("is_official", true).eq("is_deleted", false).order("created_at", { ascending: false }).limit(20),
      cid
        ? supabase.from("community_discussions_public").select("id, content, created_at, liked_by, comment_count, short_id")
            .eq("community_id", cid).order("created_at", { ascending: false }).limit(20)
        : Promise.resolve({ data: [] }),
    ]);
    const origin = window.location.origin;
    setItems([
      ...(feed.data || []).map((p) => ({
        kind: "feed", id: p.id, content: p.content, created_at: p.created_at,
        likes: (p.likes || []).length, comments: p.comment_count || 0,
        link: p.short_id ? `${origin}/starstreak/post/${p.short_id}` : null,
      })),
      ...(comm.data || []).map((p) => ({
        kind: "community", id: p.id, content: p.content, created_at: p.created_at,
        likes: (p.liked_by || []).length, comments: p.comment_count || 0,
        link: p.short_id ? `${origin}/starstreak/community-post/${p.short_id}` : null,
      })),
    ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
  }, []);

  useEffect(() => { load(); }, [load]);

  function pick(e) {
    setError("");
    const chosen = Array.from(e.target.files || []);
    e.target.value = "";
    const tooBig = chosen.find((f) => f.size > MAX_BYTES);
    if (tooBig) return setError(`${tooBig.name} is over 50 MB.`);
    const next = [...files, ...chosen].slice(0, MAX_MEDIA);
    if (files.length + chosen.length > MAX_MEDIA) setError(`Up to ${MAX_MEDIA} photos or videos.`);
    setFiles(next);
  }

  async function publish() {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const folder = `official_${Date.now()}`;
      const urls = await Promise.all(files.map((f) => uploadMedia(f, user.id, folder)));
      const { data: published, error: rpcError } = await supabase.rpc("ops_publish_official_post", {
        p_content: content.trim(), p_media_urls: urls, p_where: where,
      });
      if (rpcError) throw new Error(rpcError.message);
      let pushNote = "";
      if (instantPush && published?.post_id) {
        const { data: push, error: pushError } = await supabase.functions.invoke("official-post-push", {
          body: { postId: published.post_id },
        });
        pushNote = pushError
          ? ` The instant push failed: ${pushError.message}`
          : ` Instant push sent to ${push?.people ?? 0} people (${push?.sent ?? 0} phones, ${push?.failed ?? 0} failed).`;
      }
      setContent("");
      setFiles([]);
      setConfirming(false);
      setNotice(`Published. It's live in the app now.${pushNote}`);
      load();
    } catch (e) {
      setError(e.message || "Couldn't publish.");
      setConfirming(false);
    } finally {
      setBusy(false);
    }
  }

  async function remove(it) {
    if (!window.confirm("Take this official post down? People won't see it any more.")) return;
    setRemoving(it.id);
    const { error: rpcError } = await supabase.rpc("ops_remove_official_post", { p_kind: it.kind, p_id: it.id });
    setRemoving(null);
    if (rpcError) setError(rpcError.message);
    else setItems((list) => list.filter((x) => !(x.kind === it.kind && x.id === it.id)));
  }

  const text = content.trim();
  const canPublish = !busy && (text.length > 0 || files.length > 0) && content.length <= MAX_TEXT;
  const previewPost = {
    is_official: true, posted_as_kind: "community", author_name: "Starstreak",
    content: text || "Your post will look like this.", media_urls: [], likes: [], dislikes: [],
    comment_count: 0, view_count: 0, created_at: new Date().toISOString(),
  };

  return (
    <div className="max-w-5xl space-y-8">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-star">Post as Starstreak</h1>
          <OfficialBadge />
        </div>
        <p className="mt-1 text-sm text-mist">
          Official posts show the Starstreak logo, a gold border and an "Official" badge, so people can tell them apart from everyone else's.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Composer */}
        <div className="space-y-4 rounded-xl border border-line bg-night-850 p-6">
          <div>
            <textarea value={content} onChange={(e) => { setContent(e.target.value); setConfirming(false); }}
                      rows={8} placeholder="What do you want to tell everyone?"
                      className="w-full resize-y rounded-lg border border-night-600 bg-night-800 px-4 py-3 text-sm text-star placeholder:text-dust focus:border-flare focus:outline-none" />
            <p className={`mt-1 text-right text-xs ${content.length > MAX_TEXT ? "text-red-400" : "text-dust"}`}>
              {content.length.toLocaleString()} / {MAX_TEXT.toLocaleString()}
            </p>
          </div>

          {previews.length > 0 && (
            <div className="grid grid-cols-4 gap-2">
              {previews.map(({ file, url }, i) => (
                <div key={url} className="relative aspect-square overflow-hidden rounded-lg bg-night-800">
                  {VIDEO.test(file.type)
                    ? <video src={url} className="h-full w-full object-cover" muted />
                    : <img src={url} alt="" className="h-full w-full object-cover" />}
                  <button onClick={() => setFiles((f) => f.filter((_, j) => j !== i))} aria-label="Remove"
                          className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-black/70 text-white">
                    <FiX size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <label className={`inline-flex cursor-pointer items-center gap-2 rounded-lg border border-night-600 px-3 py-2 text-sm text-mist hover:border-flare hover:text-star ${files.length >= MAX_MEDIA ? "pointer-events-none opacity-40" : ""}`}>
            <FiImage /> Add photos or videos
            <input type="file" accept="image/*,video/mp4,video/quicktime,video/webm" multiple onChange={pick} className="hidden" />
          </label>

          <fieldset className="space-y-2">
            <legend className="mb-1 text-xs font-semibold uppercase tracking-wide text-dust">Where</legend>
            {WHERE.map((w) => (
              <label key={w.value} className={`flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-2.5 ${where === w.value ? "border-flare bg-flare/5" : "border-night-600"}`}>
                <input type="radio" name="where" value={w.value} checked={where === w.value}
                       onChange={() => { setWhere(w.value); setConfirming(false); }} className="mt-1 accent-[#FF6D1F]" />
                <span>
                  <span className="block text-sm font-medium text-star">{w.label}</span>
                  <span className="block text-xs text-dust">{w.hint}</span>
                </span>
              </label>
            ))}
          </fieldset>

          {where !== "community" && (
            <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-dashed border-amber-500/40 px-3 py-2.5">
              <input type="checkbox" checked={instantPush} onChange={(e) => setInstantPush(e.target.checked)}
                     className="mt-1 accent-[#FF6D1F]" />
              <span>
                <span className="block text-sm font-medium text-star">Send instant push (test)</span>
                <span className="block text-xs text-dust">
                  Sends it to everyone's phone right now as a silent notification (no sound or vibration), including you. Temporary, for testing.
                </span>
              </span>
            </label>
          )}

          {error && <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400">{error}</p>}
          {notice && <p className="rounded-lg border border-green-500/20 bg-green-500/10 px-3 py-2 text-xs text-green-400">{notice}</p>}

          {confirming ? (
            <div className="flex flex-wrap items-center gap-3 rounded-lg border border-flare/30 bg-flare/5 p-3">
              <p className="flex-1 text-sm text-star">
                Publish to {WHERE.find((w) => w.value === where).label.toLowerCase()} as Starstreak?
              </p>
              <button onClick={() => setConfirming(false)} disabled={busy} className="px-3 py-2 text-sm text-mist hover:text-star">Cancel</button>
              <button onClick={publish} disabled={busy} className="btn-flare !px-4 !py-2 text-sm">
                {busy ? "Publishing…" : "Publish"}
              </button>
            </div>
          ) : (
            <button onClick={() => setConfirming(true)} disabled={!canPublish}
                    className="btn-flare !py-2.5 text-sm disabled:cursor-not-allowed disabled:opacity-40">
              <FiSend /> Publish
            </button>
          )}
        </div>

        {/* Preview */}
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-dust">Preview</p>
          <PostPreview post={previewPost} />
          {files.length > 0 && (
            <p className="mt-2 text-xs text-dust">
              + {files.length} {files.length === 1 ? "attachment" : "attachments"} (shown in the app under the text)
            </p>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-line bg-night-850 p-6">
        <h2 className="mb-2 text-sm font-semibold text-star">Published</h2>
        <Published items={items} onRemove={remove} removing={removing} />
      </div>
    </div>
  );
}
