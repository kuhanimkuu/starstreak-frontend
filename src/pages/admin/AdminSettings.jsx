import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { FiSave, FiFileText, FiLock, FiRadio, FiCheck } from "react-icons/fi";
import RichEditor from "../../components/RichEditor";

const CONTENT_KEYS = [
  {
    key: "terms",
    label: "Terms of Service",
    icon: FiFileText,
    desc: "Pulled by the Starstreak app at launch. Update here to push new terms without an app update.",
    rich: true,
  },
  {
    key: "privacy",
    label: "Privacy Policy",
    icon: FiLock,
    desc: "Pulled by the app. Update to reflect any changes in data handling.",
    rich: true,
  },
  {
    key: "guidelines",
    label: "Community Guidelines",
    icon: FiFileText,
    desc: "Pulled by the app. Update to reflect any changes in community standards.",
    rich: true,
  },
  {
    key: "announcement",
    label: "App Announcement",
    icon: FiRadio,
    desc: "Shown to all users as a platform-wide banner. Leave empty to hide the banner.",
    rich: false,
  },
];

export default function AdminSettings() {
  const [contents, setContents] = useState({});
  const [versions, setVersions] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState({});
  const [saved, setSaved] = useState({});
  const [errors, setErrors] = useState({});

  useEffect(() => { loadContent(); }, []);

  async function loadContent() {
    const { data, error } = await supabase
      .from("platform_content")
      .select("key, content, version");
    if (error) console.error("Failed to load platform_content:", error);
    const map = {}, verMap = {};
    (data || []).forEach(row => {
      map[row.key] = row.content;
      verMap[row.key] = row.version;
    });
    setContents(map);
    setVersions(verMap);
    setLoading(false);
  }

  async function saveContent(key) {
    setSaving(prev => ({ ...prev, [key]: true }));
    setErrors(prev => ({ ...prev, [key]: null }));
    const { data: { session } } = await supabase.auth.getSession();
    const newVersion = (versions[key] || 0) + 1;
    const { error } = await supabase.from("platform_content").upsert(
      {
        key,
        content: contents[key] || "",
        version: newVersion,
        updated_at: new Date().toISOString(),
        updated_by: session?.user?.id,
      },
      { onConflict: "key" }
    );
    setSaving(prev => ({ ...prev, [key]: false }));
    if (error) {
      console.error("Save failed:", error);
      setErrors(prev => ({ ...prev, [key]: error.message }));
      return;
    }
    setVersions(prev => ({ ...prev, [key]: newVersion }));
    setSaved(prev => ({ ...prev, [key]: true }));
    setTimeout(() => setSaved(prev => ({ ...prev, [key]: false })), 2500);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-flare border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-star">Settings</h1>
        <p className="text-mist text-sm mt-1">
          Manage platform content and app-facing documents
        </p>
      </div>

      {CONTENT_KEYS.map(({ key, label, icon: Icon, desc, rich }) => (
        <div key={key} className="bg-night-850 border border-line rounded-xl p-6 space-y-4">

          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Icon className="text-flare-soft text-sm" />
                <h2 className="text-star font-semibold text-sm">{label}</h2>
                {versions[key] > 0 && (
                  <span className="text-dust text-xs">v{versions[key]}</span>
                )}
              </div>
              <p className="text-dust text-xs">{desc}</p>
            </div>
          </div>

          {/* Editor — rich or plain */}
          {rich ? (
            <RichEditor
              value={contents[key] || ""}
              onChange={val => setContents(prev => ({ ...prev, [key]: val }))}
              placeholder={`Paste your ${label} here, or upload a .docx / .pdf file…`}
              minHeight={320}
            />
          ) : (
            <textarea
              value={contents[key] || ""}
              onChange={e => setContents(prev => ({ ...prev, [key]: e.target.value }))}
              rows={3}
              placeholder="Write a platform announcement, or leave empty to hide…"
              className="w-full bg-night-800 border border-night-600 text-mist text-xs rounded-lg px-4 py-3 focus:outline-none focus:border-flare resize-y font-mono leading-relaxed"
            />
          )}

          {/* Error */}
          {errors[key] && (
            <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              Save failed: {errors[key]}
            </p>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between">
            <p className="text-dust text-xs">
              {(contents[key] || "").length.toLocaleString()} characters
            </p>
            <button
              onClick={() => saveContent(key)}
              disabled={saving[key]}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 bg-flare-deep hover:bg-flare text-star"
            >
              {saved[key]
                ? <><FiCheck className="text-sm" /> Saved</>
                : saving[key]
                  ? <><div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" /> Saving…</>
                  : <><FiSave className="text-sm" /> Save &amp; Publish</>
              }
            </button>
          </div>
        </div>
      ))}

      {/* Info box */}
      <div className="bg-flare/10 border border-flare/20 rounded-xl p-5">
        <h3 className="text-flare-soft font-medium text-sm mb-2">
          How the app pulls this content
        </h3>
        <p className="text-mist text-xs leading-relaxed">
          The Starstreak app fetches Terms of Service, Privacy Policy, and Community Guidelines
          directly from Supabase at launch. Updates saved here are reflected immediately —
          no app update required. The version number increments on each save so the app
          knows when to prompt users to re-accept.
        </p>
        <p className="text-dust text-xs mt-2 leading-relaxed">
          Tip: paste from Microsoft Word or Google Docs to carry over headings, bold text,
          colour, and tables. Or upload a .docx or .pdf file directly.
        </p>
      </div>
    </div>
  );
}
