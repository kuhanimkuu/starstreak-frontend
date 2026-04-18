import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase/client';
import { Mail, Trash2, Eye, EyeOff, RefreshCw } from 'lucide-react';

export default function ContactSubmissions() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('contact_submissions')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setSubmissions(data ?? []);
    } catch (err) {
      console.error('Error fetching submissions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSubmissions(); }, []);

  const toggleRead = async (id, currentRead) => {
    await supabase.from('contact_submissions').update({ read: !currentRead }).eq('id', id);
    setSubmissions(prev => prev.map(s => s.id === id ? { ...s, read: !currentRead } : s));
  };

  const deleteSubmission = async (id) => {
    if (!confirm('Delete this submission?')) return;
    await supabase.from('contact_submissions').delete().eq('id', id);
    setSubmissions(prev => prev.filter(s => s.id !== id));
    if (expanded === id) setExpanded(null);
  };

  const unreadCount = submissions.filter(s => !s.read).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Contact Submissions</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {unreadCount > 0 ? `${unreadCount} unread message${unreadCount > 1 ? 's' : ''}` : 'All messages read'}
          </p>
        </div>
        <button
          onClick={fetchSubmissions}
          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
        </div>
      ) : submissions.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-gray-800">
          <Mail className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No submissions yet</h3>
          <p className="text-gray-500 dark:text-gray-400">Contact form submissions will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {submissions.map((s) => (
            <div
              key={s.id}
              className={`bg-white dark:bg-slate-900 rounded-xl border transition-all ${
                s.read
                  ? 'border-gray-200 dark:border-gray-800'
                  : 'border-emerald-300 dark:border-emerald-700 shadow-sm shadow-emerald-100 dark:shadow-none'
              }`}
            >
              <div
                className="flex items-center justify-between px-6 py-4 cursor-pointer"
                onClick={() => setExpanded(expanded === s.id ? null : s.id)}
              >
                <div className="flex items-center gap-4 min-w-0">
                  {!s.read && <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />}
                  <div className="min-w-0">
                    <p className={`font-semibold truncate ${s.read ? 'text-gray-700 dark:text-gray-300' : 'text-gray-900 dark:text-white'}`}>
                      {s.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{s.email}</p>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs hidden md:block">
                    {s.message?.substring(0, 80)}{s.message?.length > 80 ? '…' : ''}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-4">
                  <span className="text-xs text-gray-400 hidden sm:block">
                    {new Date(s.created_at).toLocaleDateString()}
                  </span>
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleRead(s.id, s.read); }}
                    className="p-2 text-gray-400 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors"
                    title={s.read ? 'Mark unread' : 'Mark read'}
                  >
                    {s.read ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteSubmission(s.id); }}
                    className="p-2 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {expanded === s.id && (
                <div className="px-6 pb-6 border-t border-gray-100 dark:border-gray-800 pt-4">
                  <div className="grid md:grid-cols-2 gap-4 mb-4 text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">From: </span>
                      <span className="text-gray-900 dark:text-white font-medium">{s.name}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Email: </span>
                      <a href={`mailto:${s.email}`} className="text-emerald-600 dark:text-emerald-400 hover:underline font-medium">{s.email}</a>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Received: </span>
                      <span className="text-gray-900 dark:text-white">{new Date(s.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Message</p>
                    <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">{s.message}</p>
                  </div>
                  <div className="mt-4 flex gap-3">
                    <a
                      href={`mailto:${s.email}?subject=Re: Your message to Starstreak`}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 transition-colors font-medium"
                    >
                      <Mail className="w-4 h-4" />
                      Reply via Email
                    </a>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
