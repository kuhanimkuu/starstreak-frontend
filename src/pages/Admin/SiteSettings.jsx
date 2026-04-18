import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase/client';
import { Save, Settings, Globe, Megaphone, RefreshCw } from 'lucide-react';

const DEFAULT_SETTINGS = {
  social_twitter: { label: 'Twitter / X URL', description: 'Full URL to your Twitter/X profile (e.g. https://x.com/starstreakhq)', group: 'social' },
  social_github: { label: 'GitHub URL', description: 'Full URL to your GitHub organization', group: 'social' },
  social_linkedin: { label: 'LinkedIn URL', description: 'Full URL to your LinkedIn company page', group: 'social' },
  announcement_text: { label: 'Announcement Text', description: 'Text shown in the announcement bar. Leave empty to hide it.', group: 'announcement' },
  announcement_active: { label: 'Show Announcement Bar', description: 'Set to "true" to show the bar, "false" to hide it.', group: 'announcement' },
};

export default function SiteSettings() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const { data } = await supabase.from('site_settings').select('key, value');
      const map = {};
      (data ?? []).forEach(row => { map[row.key] = row.value ?? ''; });
      // Fill defaults for any missing keys
      Object.keys(DEFAULT_SETTINGS).forEach(k => {
        if (!(k in map)) map[k] = '';
      });
      setSettings(map);
    } catch (err) {
      console.error('Error fetching settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSettings(); }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const upserts = Object.entries(settings).map(([key, value]) => ({ key, value }));
      const { error } = await supabase
        .from('site_settings')
        .upsert(upserts, { onConflict: 'key' });
      if (error) throw error;
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Error saving settings:', err);
      alert('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const groups = {
    social: { title: 'Social Media Links', icon: Globe, description: 'These links appear in the website footer.' },
    announcement: { title: 'Announcement Bar', icon: Megaphone, description: 'A banner shown at the top of every page.' },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Site Settings</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Configure sitewide appearance and content</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchSettings}
            className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors font-medium"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving…' : saved ? 'Saved!' : 'Save Changes'}
          </button>
        </div>
      </div>

      {Object.entries(groups).map(([groupKey, group]) => {
        const GroupIcon = group.icon;
        const groupSettings = Object.entries(DEFAULT_SETTINGS).filter(([, meta]) => meta.group === groupKey);
        return (
          <div key={groupKey} className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                <GroupIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">{group.title}</h3>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 ml-11">{group.description}</p>

            <div className="space-y-5">
              {groupSettings.map(([key, meta]) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{meta.label}</label>
                  <input
                    type="text"
                    value={settings[key] ?? ''}
                    onChange={(e) => setSettings(prev => ({ ...prev, [key]: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                    placeholder={meta.description}
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{meta.description}</p>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800 p-5">
        <div className="flex items-start gap-3">
          <Settings className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-blue-800 dark:text-blue-300">How to apply changes</p>
            <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
              Social media links update automatically in the footer once saved. The announcement bar appears on all pages when active is set to "true" and announcement text is not empty.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
