import { useCallback, useEffect, useState } from "react";
import { FiSearch, FiShield, FiUserX, FiSlash, FiRotateCcw, FiSave, FiImage } from "react-icons/fi";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";
import { OfficialAvatar, OfficialBadge } from "../../components/Official";
import { timeAgo } from "../../app/lib/format";

// The Starstreak community, run from here: settings and members. Its member
// list is private in the app (only the count shows); ops admins manage it
// through ops_community_members / ops_set_community_member.

const PAGE = 50;
const SETTINGS = ["name", "description", "image_url", "category", "posting_permission", "allow_comments",
  "allow_reactions", "allow_sharing", "allow_poll_voting", "discussion_layout"];

const ROLE_STYLE = {
  owner: "bg-amber-500/15 text-amber-300",
  admin: "bg-amber-500/15 text-amber-300",
  moderator: "bg-sky-500/15 text-sky-300",
  member: "bg-night-700 text-mist",
};

function Toggle({ label, hint, checked, onChange }) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 py-2">
      <span>
        <span className="block text-sm text-star">{label}</span>
        {hint && <span className="block text-xs text-dust">{hint}</span>}
      </span>
      <input type="checkbox" checked={!!checked} onChange={(e) => onChange(e.target.checked)}
             className="mt-1 h-4 w-4 accent-[#FF6D1F]" />
    </label>
  );
}

function Settings({ community, onSaved }) {
  const { user } = useAuth();
  const [form, setForm] = useState(() => Object.fromEntries(SETTINGS.map((k) => [k, community[k]])));
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const set = (k) => (v) => { setForm((f) => ({ ...f, [k]: v })); setNote(""); };

  async function uploadPicture(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return setNote("Pictures can be up to 5 MB.");
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
    const path = `${community.id}/profile/${user.id}_${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("communities").upload(path, file, { contentType: file.type });
    if (error) return setNote(`Upload failed: ${error.message}`);
    set("image_url")(supabase.storage.from("communities").getPublicUrl(path).data.publicUrl);
  }

  async function save() {
    setBusy(true);
    const { error } = await supabase.from("communities").update(form).eq("id", community.id);
    setBusy(false);
    if (error) setNote(`Couldn't save: ${error.message}`);
    else { setNote("Saved. It's live in the app."); onSaved(); }
  }

  return (
    <div className="space-y-4 rounded-xl border border-line bg-night-850 p-6">
      <h2 className="text-sm font-semibold text-star">Settings</h2>
      <div className="flex items-center gap-4">
        {form.image_url
          ? <img src={form.image_url} alt="" className="h-16 w-16 rounded-full object-cover ring-2 ring-[#F5B301]/60" />
          : <OfficialAvatar size={64} />}
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-night-600 px-3 py-2 text-sm text-mist hover:border-flare hover:text-star">
          <FiImage /> Change picture
          <input type="file" accept="image/*" onChange={uploadPicture} className="hidden" />
        </label>
      </div>
      <label className="block">
        <span className="text-xs text-dust">Name</span>
        <input value={form.name || ""} onChange={(e) => set("name")(e.target.value)} maxLength={100}
               className="mt-1 w-full rounded-lg border border-night-600 bg-night-800 px-3 py-2 text-sm text-star focus:border-flare focus:outline-none" />
      </label>
      <label className="block">
        <span className="text-xs text-dust">Description</span>
        <textarea value={form.description || ""} onChange={(e) => set("description")(e.target.value)} rows={3} maxLength={2000}
                  className="mt-1 w-full resize-y rounded-lg border border-night-600 bg-night-800 px-3 py-2 text-sm text-star focus:border-flare focus:outline-none" />
      </label>
      <label className="block">
        <span className="text-xs text-dust">Who can post</span>
        <select value={form.posting_permission || "adminsOnly"} onChange={(e) => set("posting_permission")(e.target.value)}
                className="mt-1 w-full rounded-lg border border-night-600 bg-night-800 px-3 py-2 text-sm text-star focus:border-flare focus:outline-none">
          <option value="adminsOnly">Starstreak team & moderators only</option>
          <option value="membersOnly">Members</option>
          <option value="everyone">Everyone</option>
        </select>
      </label>
      <div className="divide-y divide-line">
        <Toggle label="Comments" hint="Members can comment on posts" checked={form.allow_comments} onChange={set("allow_comments")} />
        <Toggle label="Reactions" hint="Likes and dislikes" checked={form.allow_reactions} onChange={set("allow_reactions")} />
        <Toggle label="Sharing" checked={form.allow_sharing} onChange={set("allow_sharing")} />
        <Toggle label="Poll voting" checked={form.allow_poll_voting} onChange={set("allow_poll_voting")} />
        <Toggle label="Thread mode" hint="Show discussions as a live thread, like Flashes"
                checked={form.discussion_layout === "thread"} onChange={(on) => set("discussion_layout")(on ? "thread" : "cards")} />
      </div>
      {note && <p className="text-xs text-mist">{note}</p>}
      <button onClick={save} disabled={busy} className="btn-flare !py-2 text-sm disabled:opacity-40">
        <FiSave /> {busy ? "Saving…" : "Save settings"}
      </button>
    </div>
  );
}

function Members({ communityId, opsIds }) {
  const [search, setSearch] = useState("");
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState("");

  const load = useCallback(async (q, p) => {
    const { data, error: e } = await supabase.rpc("ops_community_members", {
      p_community_id: communityId, p_search: q || null, p_limit: PAGE, p_offset: p * PAGE,
    });
    if (e) return setError(e.message);
    setRows(data || []);
    setTotal(data?.[0]?.total ?? 0);
  }, [communityId]);

  useEffect(() => {
    const t = setTimeout(() => load(search, page), 250);
    return () => clearTimeout(t);
  }, [search, page, load]);

  async function act(row, action, confirmText) {
    if (confirmText && !window.confirm(confirmText)) return;
    setBusy(row.user_id);
    setError("");
    const { error: e } = await supabase.rpc("ops_set_community_member", {
      p_community_id: communityId, p_user_id: row.user_id, p_action: action,
    });
    setBusy(null);
    if (e) setError(e.message);
    else load(search, page);
  }

  const name = (r) => r.display_name || r.username || "Unknown user";

  return (
    <div className="rounded-xl border border-line bg-night-850 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-star">Members <span className="text-dust">({total.toLocaleString()})</span></h2>
        <label className="flex items-center gap-2 rounded-lg border border-night-600 bg-night-800 px-3 py-1.5">
          <FiSearch className="text-dust" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }} placeholder="Search name or @username"
                 className="w-56 bg-transparent text-sm text-star placeholder:text-dust focus:outline-none" />
        </label>
      </div>
      <p className="mt-1 text-xs text-dust">Only the Starstreak team can see this list. In the app, people just see the member count.</p>
      {error && <p className="mt-3 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400">{error}</p>}

      <ul className="mt-4 divide-y divide-line">
        {rows.map((r) => {
          const team = opsIds.has(r.user_id);
          const role = r.is_banned ? "banned" : r.role;
          return (
            <li key={r.user_id} className="flex flex-wrap items-center gap-3 py-3">
              {r.avatar_url
                ? <img src={r.avatar_url} alt="" className="h-9 w-9 rounded-full object-cover" />
                : <div className="grid h-9 w-9 place-items-center rounded-full bg-night-700 text-sm text-mist">{name(r)[0]?.toUpperCase()}</div>}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate text-sm text-star">{name(r)}</span>
                  {team && <OfficialBadge />}
                </div>
                <div className="text-xs text-dust">
                  {r.username && <>@{r.username} · </>}joined {timeAgo(r.joined_at)}
                </div>
              </div>
              <span className={`rounded-full px-2 py-0.5 text-xs ${role === "banned" ? "bg-red-500/15 text-red-400" : ROLE_STYLE[role] || ROLE_STYLE.member}`}>
                {team ? "Starstreak team" : role}
              </span>
              {!team && (
                <div className="flex items-center gap-1">
                  {r.is_banned ? (
                    <button onClick={() => act(r, "unban")} disabled={busy === r.user_id} title="Unban"
                            className="grid h-8 w-8 place-items-center rounded-lg text-mist hover:bg-night-700 hover:text-star"><FiRotateCcw /></button>
                  ) : (
                    <>
                      {r.role === "moderator" ? (
                        <button onClick={() => act(r, "member")} disabled={busy === r.user_id}
                                className="rounded-lg px-2 py-1 text-xs text-sky-300 hover:bg-night-700">Remove moderator</button>
                      ) : (
                        <button onClick={() => act(r, "moderator")} disabled={busy === r.user_id}
                                className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-sky-300 hover:bg-night-700"><FiShield /> Make moderator</button>
                      )}
                      <button onClick={() => act(r, "remove", `Remove ${name(r)} from the community? They can join again.`)}
                              disabled={busy === r.user_id} title="Remove"
                              className="grid h-8 w-8 place-items-center rounded-lg text-mist hover:bg-night-700 hover:text-star"><FiUserX /></button>
                      <button onClick={() => act(r, "ban", `Ban ${name(r)}? They'll be removed and can't join again.`)}
                              disabled={busy === r.user_id} title="Ban"
                              className="grid h-8 w-8 place-items-center rounded-lg text-red-400 hover:bg-red-500/10"><FiSlash /></button>
                    </>
                  )}
                </div>
              )}
            </li>
          );
        })}
        {rows.length === 0 && <li className="py-6 text-center text-sm text-dust">No members found.</li>}
      </ul>

      {total > PAGE && (
        <div className="mt-4 flex items-center justify-between text-sm">
          <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0} className="text-mist hover:text-star disabled:opacity-30">← Previous</button>
          <span className="text-dust">Page {page + 1} of {Math.ceil(total / PAGE)}</span>
          <button onClick={() => setPage((p) => p + 1)} disabled={(page + 1) * PAGE >= total} className="text-mist hover:text-star disabled:opacity-30">Next →</button>
        </div>
      )}
    </div>
  );
}

export default function AdminOfficialCommunity() {
  const [community, setCommunity] = useState(null);
  const [opsIds, setOpsIds] = useState(new Set());
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const { data: cid, error: e1 } = await supabase.rpc("official_community_id");
    if (e1 || !cid) return setError(e1?.message || "The Starstreak community is missing.");
    const [{ data: c, error: e2 }, { data: ops }] = await Promise.all([
      supabase.from("communities").select("*").eq("id", cid).single(),
      supabase.from("users_admin").select("firebase_uid").eq("is_admin", true),
    ]);
    if (e2) return setError(e2.message);
    setCommunity(c);
    setOpsIds(new Set((ops || []).map((u) => u.firebase_uid)));
  }, []);

  useEffect(() => {
    const t = setTimeout(load, 0);
    return () => clearTimeout(t);
  }, [load]);

  if (error) return <p className="text-sm text-red-400">{error}</p>;
  if (!community) {
    return <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-flare border-t-transparent" /></div>;
  }

  return (
    <div className="max-w-5xl space-y-8">
      <div className="flex items-center gap-4">
        <OfficialAvatar size={56} />
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-star">{community.name}</h1>
            <OfficialBadge />
          </div>
          <p className="mt-1 text-sm text-mist">
            {Number(community.member_count || 0).toLocaleString()} members · {Number(community.post_count || 0).toLocaleString()} posts ·
            joining is optional and anyone can leave
          </p>
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <Settings key={community.updated_at} community={community} onSaved={load} />
        <Members communityId={community.id} opsIds={opsIds} />
      </div>
    </div>
  );
}
