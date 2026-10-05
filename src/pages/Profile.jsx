import { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { FiCamera, FiCheck, FiX, FiAlertCircle } from "react-icons/fi";

function sanitizeUsername(v) {
  return v.replace(/[^a-zA-Z0-9_]/g, "").toLowerCase().substring(0, 15);
}

export default function Profile() {
  const { user, profile, refreshProfile } = useAuth();

  const [displayName, setDisplayName] = useState("");
  const [bio, setBio]                 = useState("");
  const [avatarUrl, setAvatarUrl]     = useState("");
  const [username, setUsername]       = useState("");

  const [uploading, setUploading]           = useState(false);
  const [saving, setSaving]                 = useState(false);
  const [checkingUsername, setChecking]     = useState(false);
  const [usernameAvailable, setAvailable]   = useState(null);
  const [pwResetSent, setPwResetSent]       = useState(false);
  const [toast, setToast]                   = useState(null);
  const [confirmOpen, setConfirmOpen]       = useState(false);

  const debounceRef = useRef(null);
  const mountedRef  = useRef(true);

  // Populate fields from context profile
  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || "");
      setBio(profile.bio || "");
      setAvatarUrl(profile.avatar_url || "");
      setUsername(profile.username || "");
    } else if (user) {
      setDisplayName(user.displayName || "");
      setAvatarUrl(user.photoURL || "");
    }
  }, [profile, user]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      clearTimeout(debounceRef.current);
    };
  }, []);

  function showToast(type, message) {
    setToast({ type, message });
    setTimeout(() => { if (mountedRef.current) setToast(null); }, 3500);
  }

  function onUsernameChange(raw) {
    const clean = sanitizeUsername(raw);
    setUsername(clean);
    setAvailable(null);
    clearTimeout(debounceRef.current);
    if (!clean || clean === profile?.username) return;
    setChecking(true);
    debounceRef.current = setTimeout(async () => {
      const { data } = await supabase.rpc("check_username_available", {
        p_username: clean,
        p_firebase_uid: user.id,
      });
      if (mountedRef.current) { setAvailable(data === true); setChecking(false); }
    }, 600);
  }

  async function handleAvatarUpload(e) {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    try {
      const ext  = file.name.split(".").pop();
      const path = `${user.id}/avatar.${ext}`;
      const { error: upErr } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
      if (upErr) throw upErr;
      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
      setAvatarUrl(urlData.publicUrl);
      showToast("success", "Photo ready — click Save to apply.");
    } catch {
      showToast("error", "Upload failed. Try again.");
    } finally {
      setUploading(false);
    }
  }

  async function handleSave() {
    if (!user) return;
    if (username && usernameAvailable === false) {
      showToast("error", "Username is taken. Choose another.");
      return;
    }
    setSaving(true);
    try {
      const { data: ok } = await supabase.rpc("update_website_profile", {
        p_firebase_uid: user.id,
        p_display_name: displayName,
        p_bio:          bio,
        p_username:     username,
        p_avatar_url:   avatarUrl,
      });
      if (!ok) throw new Error("RPC returned false");
      await refreshProfile();
      setConfirmOpen(false);
      showToast("success", "Profile saved!");
    } catch {
      showToast("error", "Failed to save. Try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handlePasswordReset() {
    if (!user?.email) return;
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setPwResetSent(true);
      showToast("success", "Password reset email sent!");
    } catch {
      showToast("error", "Failed to send reset email.");
    }
  }

  if (!user) return null;

  return (
    <div className="space-y-6">

      <div>
        <h1 className="h-display text-3xl md:text-4xl text-star">Edit Profile</h1>
        <p className="text-dust text-sm mt-1">Update your display name, username, bio, and photo.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">

        {/* Avatar card */}
        <div className="bg-night-800 rounded-2xl border border-line p-6 flex flex-col items-center text-center">
          <div className="relative mb-4">
            <div className="w-28 h-28 rounded-full overflow-hidden bg-gradient-to-br from-flare/20 to-gold/20 border-4 border-night-700 ring-2 ring-flare/40">
              {avatarUrl
                ? <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                : <span className="w-full h-full flex items-center justify-center text-flare font-extrabold text-3xl">
                    {displayName?.[0]?.toUpperCase() || "?"}
                  </span>
              }
            </div>
            <label className={`absolute bottom-0 right-0 w-8 h-8 bg-flare text-night-950 rounded-full flex items-center justify-center cursor-pointer hover:opacity-90 shadow-md transition-opacity ${uploading ? "opacity-50 pointer-events-none" : ""}`}>
              <FiCamera className="text-sm" />
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
            </label>
          </div>

          <div className="font-bold text-star">{displayName || "Unnamed"}</div>
          {profile?.username && <div className="text-sm text-dust">@{profile.username}</div>}
          <div className="text-xs text-dust mt-1">{user.email}</div>

          <div className="mt-5 w-full space-y-2">
            <button
              onClick={() => setConfirmOpen(true)}
              className="w-full py-2.5 bg-flare-gradient text-night-950 font-semibold rounded-full text-sm hover:opacity-90 transition-opacity"
            >
              {saving ? "Saving…" : "Save Changes"}
            </button>
            <button
              onClick={handlePasswordReset}
              className="w-full py-2.5 border border-line text-mist font-medium rounded-xl text-sm hover:bg-night-850 transition-colors"
            >
              {pwResetSent ? "Reset Email Sent ✓" : "Change Password"}
            </button>
          </div>

          <p className="text-xs text-dust mt-4 leading-relaxed">
            Username: letters, numbers, underscore · max 15 chars
          </p>
        </div>

        {/* Form */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-night-800 rounded-2xl border border-line p-6 space-y-5">

            {/* Username */}
            <div>
              <label className="block text-sm font-semibold text-mist mb-1.5">Username</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-dust text-sm">@</span>
                <input
                  type="text"
                  value={username}
                  onChange={e => onUsernameChange(e.target.value)}
                  placeholder="yourname"
                  className="w-full pl-7 pr-10 py-2.5 border border-line rounded-xl text-sm focus:outline-none bg-night-900 text-star placeholder-dust focus:border-flare transition-colors"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm">
                  {checkingUsername && <span className="text-dust text-xs">checking…</span>}
                  {!checkingUsername && usernameAvailable === true  && <FiCheck className="text-green-500" />}
                  {!checkingUsername && usernameAvailable === false && <FiX    className="text-red-500" />}
                </span>
              </div>
              {usernameAvailable === false && (
                <p className="text-xs text-red-500 mt-1">This username is already taken.</p>
              )}
            </div>

            {/* Display name */}
            <div>
              <label className="block text-sm font-semibold text-mist mb-1.5">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                placeholder="How you appear to others"
                className="w-full px-3 py-2.5 border border-line rounded-xl text-sm focus:outline-none bg-night-900 text-star placeholder-dust focus:border-flare transition-colors"
              />
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-semibold text-mist mb-1.5">
                Bio
                <span className="ml-2 font-normal text-dust text-xs">({bio.trim().length} chars{bio.trim().length < 20 ? ", 20+ for completion bonus" : ""})</span>
              </label>
              <textarea
                rows={4}
                value={bio}
                onChange={e => setBio(e.target.value)}
                placeholder="Tell people a little about yourself…"
                className="w-full px-3 py-2.5 border border-line rounded-xl text-sm focus:outline-none bg-night-900 text-star placeholder-dust focus:border-flare transition-colors resize-none"
              />
            </div>
          </div>

          {/* Read-only info */}
          <div className="bg-night-800 rounded-2xl border border-line p-6">
            <h3 className="font-semibold text-star mb-4">Account Info</h3>
            <div className="space-y-3">
              {[
                { label: "Email",      value: user.email },
                { label: "Joined",     value: profile?.created_at ? new Date(profile.created_at).toLocaleDateString("en", { year: "numeric", month: "long", day: "numeric" }) : "—" },
                { label: "Verified",   value: user.emailVerified ? "Yes ✓" : "No — check your inbox" },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between py-2 border-b border-line last:border-0 text-sm">
                  <span className="font-medium text-mist">{label}</span>
                  <span className="text-star">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Confirm modal */}
      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-night-950/70 backdrop-blur-sm px-4">
          <div className="bg-night-800 rounded-2xl p-6 max-w-md w-full shadow-night border border-line">
            <h3 className="text-lg font-bold text-star mb-2">Save changes?</h3>
            <p className="text-mist text-sm mb-5">
              This will update your display name, username, bio, and avatar across your Starstreak account.
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setConfirmOpen(false)} className="px-4 py-2 border border-line rounded-xl text-sm font-medium hover:bg-night-850">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-flare text-night-950 rounded-xl text-sm font-medium disabled:opacity-50">
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed right-4 bottom-6 z-50 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium shadow-lg ${
          toast.type === "success" ? "bg-night-800 text-green-300 border border-green-500/40" : "bg-night-800 text-red-300 border border-red-500/40"
        }`}>
          {toast.type === "success" ? <FiCheck /> : <FiAlertCircle />}
          {toast.message}
        </div>
      )}
    </div>
  );
}
