import { useCallback, useEffect, useState } from "react";
import { FiImage, FiCheck, FiX, FiRotateCcw, FiTrash2 } from "react-icons/fi";
import { supabase } from "../../lib/supabase";

// Creator uploads review (migration 20261102000005): sticker packs, avatar
// pictures and host badges that asked to go public or were hidden by
// reports. Approve or reject public use, restore a hidden item, or remove
// it (a strike for the uploader; 3 in 90 days ends their uploads).
const TYPE_LABEL = { sticker_pack: "Sticker pack", avatar: "Avatar", badge: "Host badge" };

export default function AdminCreators() {
  const [items, setItems] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");

  const load = useCallback(() => {
    supabase.rpc("ops_creator_queue").then(({ data, error: err }) => {
      if (err) setError(err.message);
      setItems(data || []);
    });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function act(item, action) {
    let reason = null;
    if (action === "remove") {
      reason = window.prompt("Why is it being removed? (the uploader gets a strike)", "Breaks the content rules");
      if (reason === null) return;
    }
    setBusy(item.id + action);
    const { error: err } = await supabase.rpc("ops_moderate_creator_item", {
      p_type: item.type, p_id: item.id, p_action: action, p_reason: reason,
    });
    setBusy("");
    if (err) setError(err.message);
    else load();
  }

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-star"><FiImage className="text-flare-soft" /> Creator uploads</h1>
        <p className="mt-1 max-w-2xl text-sm text-mist">
          Stickers, avatars and host badges people made. New items work only in their creator's own space;
          going public needs your approval here. Three reports hide an item until you look. Removing gives the
          uploader a strike (three in 90 days ends their uploads). Automatic scanning isn't connected yet.
        </p>
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      {items === null ? (
        <p className="text-mist">Loading…</p>
      ) : items.length === 0 ? (
        <p className="rounded-xl border border-line p-8 text-center text-mist">Nothing to review.</p>
      ) : (
        <div className="space-y-3">
          {items.map((it) => (
            <div key={it.type + it.id} className="rounded-xl border border-line bg-night-800 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-semibold text-star">{it.name}</p>
                  <p className="text-xs text-dust">
                    {TYPE_LABEL[it.type]} · by {it.by || "unknown"} · for {it.owner_kind} ·{" "}
                    {it.status === "hidden" ? `hidden after ${it.reports} reports` : it.status === "retired" ? `off profiles after ${it.reports} reports` : it.public_status === "pending" ? "asks to go public" : `${it.reports} reports`}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {it.public_status === "pending" && (
                    <>
                      <button disabled={!!busy} onClick={() => act(it, "approve_public")} className="btn-flare inline-flex items-center gap-1.5 !px-3 !py-1.5 text-xs"><FiCheck /> Approve public</button>
                      <button disabled={!!busy} onClick={() => act(it, "reject_public")} className="btn-ghost inline-flex items-center gap-1.5 !px-3 !py-1.5 text-xs"><FiX /> Keep private</button>
                    </>
                  )}
                  {(it.status === "hidden" || it.status === "retired") && (
                    <button disabled={!!busy} onClick={() => act(it, "restore")} className="btn-ghost inline-flex items-center gap-1.5 !px-3 !py-1.5 text-xs"><FiRotateCcw /> Restore</button>
                  )}
                  <button disabled={!!busy} onClick={() => act(it, "remove")} className="inline-flex items-center gap-1.5 rounded-full border border-red-500/50 px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/10"><FiTrash2 /> Remove</button>
                </div>
              </div>
              {Array.isArray(it.images) && it.images.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {it.images.map((url) => (
                    <img key={url} src={url} alt="" className="h-16 w-16 rounded-lg bg-night-900 object-contain" loading="lazy" />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
