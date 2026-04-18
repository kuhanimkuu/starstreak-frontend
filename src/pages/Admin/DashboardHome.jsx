import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase/client';
import { FileText, Briefcase, Users, Package, TrendingUp, Mail, Bell } from 'lucide-react';

export default function DashboardHome() {
  const [stats, setStats] = useState({ blogs: 0, careers: 0, team: 0, products: 0, contacts: 0, newsletter: 0, unread: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [blogsRes, careersRes, teamRes, productsRes, contactsRes, newsletterRes, unreadRes] = await Promise.all([
          supabase.from('blogs').select('id', { count: 'exact', head: true }),
          supabase.from('careers').select('id', { count: 'exact', head: true }),
          supabase.from('team').select('id', { count: 'exact', head: true }),
          supabase.from('products').select('id', { count: 'exact', head: true }),
          supabase.from('contact_submissions').select('id', { count: 'exact', head: true }),
          supabase.from('newsletter_subscribers').select('id', { count: 'exact', head: true }),
          supabase.from('contact_submissions').select('id', { count: 'exact', head: true }).eq('read', false),
        ]);
        setStats({
          blogs: blogsRes.count ?? 0,
          careers: careersRes.count ?? 0,
          team: teamRes.count ?? 0,
          products: productsRes.count ?? 0,
          contacts: contactsRes.count ?? 0,
          newsletter: newsletterRes.count ?? 0,
          unread: unreadRes.count ?? 0,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    { name: 'Blog Posts', value: stats.blogs, icon: FileText, color: 'emerald', href: '/admin/dashboard/blogs' },
    { name: 'Career Openings', value: stats.careers, icon: Briefcase, color: 'blue', href: '/admin/dashboard/careers' },
    { name: 'Team Members', value: stats.team, icon: Users, color: 'purple', href: '/admin/dashboard/team' },
    { name: 'Products', value: stats.products, icon: Package, color: 'orange', href: '/admin/dashboard/products' },
    { name: 'Contact Messages', value: stats.contacts, icon: Mail, color: 'rose', href: '/admin/dashboard/contact', badge: stats.unread > 0 ? stats.unread : null },
    { name: 'Newsletter Subs', value: stats.newsletter, icon: Bell, color: 'teal', href: '/admin/dashboard/newsletter' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-linear-to-br from-emerald-500 to-teal-600 rounded-xl p-8 text-white">
        <div className="flex items-center gap-4 mb-4">
          <TrendingUp className="w-12 h-12" />
          <div>
            <h2 className="text-3xl font-bold">Welcome to Starstreak Admin</h2>
            <p className="text-emerald-100 mt-1">Manage your content and team from one place</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.name}
              to={stat.href}
              className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 hover:border-emerald-500 dark:hover:border-emerald-500 transition-all duration-300 hover:shadow-lg group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg bg-${stat.color}-50 dark:bg-${stat.color}-900/20 relative`}>
                  <Icon className={`w-6 h-6 text-${stat.color}-600 dark:text-${stat.color}-400`} />
                  {stat.badge && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {stat.badge}
                    </span>
                  )}
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white group-hover:text-emerald-500 transition-colors">
                  {stat.value}
                </div>
              </div>
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.name}</h3>
            </Link>
          );
        })}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link to="/admin/dashboard/blogs/new" className="px-4 py-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors text-center font-medium">
            + New Blog Post
          </Link>
          <Link to="/admin/dashboard/careers/new" className="px-4 py-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-center font-medium">
            + New Job Opening
          </Link>
          <Link to="/admin/dashboard/team/new" className="px-4 py-3 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors text-center font-medium">
            + Add Team Member
          </Link>
          <Link to="/admin/dashboard/products/new" className="px-4 py-3 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors text-center font-medium">
            + Add Product
          </Link>
        </div>
      </div>
    </div>
  );
}
