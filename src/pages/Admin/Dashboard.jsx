import { useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  FileText,
  Briefcase,
  Users,
  Package,
  LogOut,
  Menu,
  X,
  UserCircle,
  Shield,
  Mail,
  Bell,
  Settings,
  Scale,
} from 'lucide-react';

export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { currentUser, userRole, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/admin/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard, current: location.pathname === '/admin/dashboard' },
    { name: 'Blog Posts', href: '/admin/dashboard/blogs', icon: FileText, current: location.pathname.includes('/blogs') },
    { name: 'Careers', href: '/admin/dashboard/careers', icon: Briefcase, current: location.pathname.includes('/careers') },
    { name: 'Team Members', href: '/admin/dashboard/team', icon: Users, current: location.pathname.includes('/team'), adminOnly: true },
    { name: 'Products', href: '/admin/dashboard/products', icon: Package, current: location.pathname.includes('/products'), adminOnly: true },
    { name: 'Contact Inbox', href: '/admin/dashboard/contact', icon: Mail, current: location.pathname.includes('/contact') },
    { name: 'Newsletter', href: '/admin/dashboard/newsletter', icon: Bell, current: location.pathname.includes('/newsletter') },
    { name: 'Legal Pages', href: '/admin/dashboard/legal', icon: Scale, current: location.pathname.includes('/legal'), adminOnly: true },
    { name: 'Site Settings', href: '/admin/dashboard/settings', icon: Settings, current: location.pathname.includes('/settings'), adminOnly: true },
  ];

  const filteredNavigation = navigation.filter(item => !item.adminOnly || isAdmin());

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-gray-800
          transform transition-transform duration-300 ease-in-out lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between px-6 py-6 border-b border-gray-200 dark:border-gray-800">
            <img src="/starstreak_logo.png" alt="Starstreak" className="h-12 filter drop-shadow-lg" />
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* User Info */}
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center">
                <UserCircle className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {currentUser?.email}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  {isAdmin() && <Shield className="w-3 h-3 text-emerald-500" />}
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {userRole === 'super_admin' ? 'Super Admin' : 'Team Member'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {filteredNavigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors
                    ${item.current
                      ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Sign Out */}
          <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-800">
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Admin Dashboard
            </h1>
            <Link
              to="/"
              className="text-sm text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              View Site
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
