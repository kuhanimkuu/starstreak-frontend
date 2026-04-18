import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../../lib/supabase/client';
import { Save, ArrowLeft } from 'lucide-react';

export default function TeamEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    name: '',
    role: '',
    email: '',
    photo_url: '',
    bio: '',
    linked_in: '',
    twitter: '',
    github: '',
    order: 0,
    admin_role: 'none',
  });
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditMode);

  useEffect(() => {
    if (isEditMode) {
      fetchTeamMember();
    }
  }, [id]);

  const fetchTeamMember = async () => {
    try {
      const { data, error } = await supabase.from('team').select('*').eq('id', id).single();
      if (error) throw error;
      if (data) setFormData(data);
    } catch (error) {
      console.error('Error fetching team member:', error);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const memberData = { ...formData, order: parseInt(formData.order) || 0 };
      if (isEditMode) {
        const { error } = await supabase.from('team').update(memberData).eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('team').insert([memberData]);
        if (error) throw error;
      }
      navigate('/admin/dashboard/team');
    } catch (error) {
      console.error('Error saving team member:', error);
      alert('Error saving team member');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  const inputClass = "w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition";

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/admin/dashboard/team')}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isEditMode ? 'Edit Team Member' : 'Add Team Member'}
          </h2>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Name *</label>
              <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className={inputClass} placeholder="Jane Doe" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Job Title *</label>
              <input type="text" required value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className={inputClass} placeholder="Software Engineer" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
              <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className={inputClass} placeholder="jane@starstreak.org" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Photo URL</label>
              <input type="url" value={formData.photo_url} onChange={(e) => setFormData({ ...formData, photo_url: e.target.value })} className={inputClass} placeholder="https://example.com/photo.jpg" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Bio</label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              rows={3}
              className={inputClass}
              placeholder="Short bio..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">LinkedIn URL</label>
              <input type="url" value={formData.linked_in} onChange={(e) => setFormData({ ...formData, linked_in: e.target.value })} className={inputClass} placeholder="https://linkedin.com/in/..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Twitter/X URL</label>
              <input type="url" value={formData.twitter} onChange={(e) => setFormData({ ...formData, twitter: e.target.value })} className={inputClass} placeholder="https://twitter.com/..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">GitHub URL</label>
              <input type="url" value={formData.github} onChange={(e) => setFormData({ ...formData, github: e.target.value })} className={inputClass} placeholder="https://github.com/..." />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Display Order</label>
              <input type="number" value={formData.order} onChange={(e) => setFormData({ ...formData, order: e.target.value })} className={inputClass} placeholder="0" />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Lower numbers appear first</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Admin Role</label>
              <select value={formData.admin_role} onChange={(e) => setFormData({ ...formData, admin_role: e.target.value })} className={inputClass}>
                <option value="none">None</option>
                <option value="team_member">Team Member</option>
                <option value="super_admin">Super Admin</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button type="submit" disabled={loading} className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium">
            <Save className="w-5 h-5" />
            {loading ? 'Saving...' : (isEditMode ? 'Update Member' : 'Add Member')}
          </button>
          <button type="button" onClick={() => navigate('/admin/dashboard/team')} className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
