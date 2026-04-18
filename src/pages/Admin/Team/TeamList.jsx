import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../../lib/supabase/client';
import { Plus, Edit, Trash2, Mail, Shield, User } from 'lucide-react';

export default function TeamList() {
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('team')
        .select('*')
        .order('order', { ascending: true });
      if (error) throw error;
      setTeamMembers(data ?? []);
    } catch (error) {
      console.error('Error fetching team members:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to remove this team member?')) {
      try {
        const { error } = await supabase.from('team').delete().eq('id', id);
        if (error) throw error;
        setTeamMembers(teamMembers.filter(member => member.id !== id));
      } catch (error) {
        console.error('Error deleting team member:', error);
        alert('Error removing team member');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Team Members</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage team profiles and roles</p>
        </div>
        <Link
          to="/admin/dashboard/team/new"
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Team Member
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teamMembers.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-gray-800">
            <p className="text-gray-500 dark:text-gray-400">No team members yet. Add your first one!</p>
          </div>
        ) : (
          teamMembers.map((member) => (
            <div
              key={member.id}
              className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 hover:border-emerald-500 dark:hover:border-emerald-500 transition-all duration-300"
            >
              <div className="flex items-center gap-4 mb-4">
                {member.photo_url ? (
                  <img src={member.photo_url} alt={member.name} className="w-16 h-16 rounded-full object-cover" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center">
                    <User className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">{member.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{member.role}</p>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                {member.email && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Mail className="w-4 h-4" />
                    <span className="truncate">{member.email}</span>
                  </div>
                )}
                {member.admin_role && member.admin_role !== 'none' && (
                  <div className="flex items-center gap-2 text-sm">
                    <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                      {member.admin_role === 'super_admin' ? 'Super Admin' : 'Team Member'}
                    </span>
                  </div>
                )}
              </div>

              {member.bio && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">{member.bio}</p>
              )}

              <div className="flex items-center gap-2 pt-4 border-t border-gray-200 dark:border-gray-800">
                <Link
                  to={`/admin/dashboard/team/edit/${member.id}`}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(member.id)}
                  className="flex items-center justify-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 border border-red-300 dark:border-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Remove
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
