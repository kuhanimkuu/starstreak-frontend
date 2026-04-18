import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase/client';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { Save, Shield } from 'lucide-react';

const PAGES = [
  { key: 'privacy', label: 'Privacy Policy' },
  { key: 'terms', label: 'Terms of Service' },
  { key: 'cookies', label: 'Cookie Policy' },
];

const modules = {
  toolbar: [
    [{ header: [1, 2, 3, 4, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['link'],
    ['blockquote'],
    ['clean'],
  ],
};

export default function LegalPages() {
  const [activeTab, setActiveTab] = useState('privacy');
  const [contents, setContents] = useState({ privacy: '', terms: '', cookies: '' });
  const [updatedAts, setUpdatedAts] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const { data } = await supabase.from('legal_pages').select('type, content, updated_at');
        const contentMap = {};
        const atMap = {};
        (data ?? []).forEach(row => {
          contentMap[row.type] = row.content ?? '';
          atMap[row.type] = row.updated_at;
        });
        setContents(prev => ({ ...prev, ...contentMap }));
        setUpdatedAts(atMap);
      } catch (err) {
        console.error('Error fetching legal pages:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase.from('legal_pages').upsert(
        [{ type: activeTab, content: contents[activeTab], updated_at: new Date().toISOString() }],
        { onConflict: 'type' }
      );
      if (error) throw error;
      setUpdatedAts(prev => ({ ...prev, [activeTab]: new Date().toISOString() }));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Error saving legal page:', err);
      alert('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  const currentPage = PAGES.find(p => p.key === activeTab);
  const lastUpdated = updatedAts[activeTab]
    ? new Date(updatedAts[activeTab]).toLocaleString()
    : 'Not yet saved — showing site default';

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Legal Pages</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Edit Privacy Policy, Terms of Service, and Cookie Policy</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors font-medium"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving…' : saved ? 'Saved!' : `Save ${currentPage?.label}`}
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-gray-800">
        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-800">
          {PAGES.map(page => (
            <button
              key={page.key}
              onClick={() => { setActiveTab(page.key); setSaved(false); }}
              className={`px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === page.key
                  ? 'border-b-2 border-emerald-500 text-emerald-600 dark:text-emerald-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {page.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-4 h-4 text-gray-400" />
            <span className="text-xs text-gray-500 dark:text-gray-400">Last saved: {lastUpdated}</span>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600">
            <ReactQuill
              theme="snow"
              value={contents[activeTab]}
              onChange={(val) => setContents(prev => ({ ...prev, [activeTab]: val }))}
              modules={modules}
              className="min-h-[500px]"
            />
          </div>

          <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
            If this field is empty, the page will show built-in default content. Save custom content to override it.
          </p>
        </div>
      </div>
    </div>
  );
}
