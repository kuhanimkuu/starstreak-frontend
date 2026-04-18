import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase/client';
import { Calendar, User, ArrowRight, Clock, BookOpen } from 'lucide-react';

export default function BlogList() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setBlogs(data ?? []);
    } catch (error) {
      console.error('Error fetching blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['all', ...new Set(blogs.map(blog => blog.category).filter(Boolean))];
  const filteredBlogs = selectedCategory === 'all' ? blogs : blogs.filter(blog => blog.category === selectedCategory);

  const estimateReadTime = (content) => {
    const words = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
    return Math.ceil(words / 200);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-b from-white via-gray-50 to-gray-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors duration-300">
        <div className="container-custom pt-32 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-white via-gray-50 to-gray-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors duration-300">
      <section className="relative overflow-hidden pt-32 pb-20">
        <div className="absolute inset-0 opacity-10 bg-[url('/grid.svg')]"></div>
        <div className="absolute top-0 left-0 w-96 h-96 rounded-full blur-3xl opacity-20 bg-emerald-300 dark:bg-emerald-500 mix-blend-multiply animate-float-slow"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full blur-3xl opacity-20 bg-teal-300 dark:bg-teal-500 mix-blend-multiply animate-float-slow"></div>

        <div className="container-custom relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-black/5 dark:bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-emerald-500/20 mb-8">
            <BookOpen className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
            <span className="text-sm font-medium text-gray-800 dark:text-white">Insights & Updates</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-white mb-6">
            Starstreak
            <span className="block mt-2 text-transparent bg-clip-text bg-linear-to-r from-emerald-500 via-teal-500 to-cyan-500 dark:from-emerald-400 dark:via-teal-400 dark:to-cyan-400 animate-gradient">
              Blog
            </span>
          </h1>
          <p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Stay updated with the latest news, insights, and innovations from the Starstreak ecosystem
          </p>
        </div>
      </section>

      {categories.length > 1 && (
        <div className="container-custom pb-12">
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${
                  selectedCategory === category
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30'
                    : 'bg-white/70 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-white/10'
                }`}
              >
                {category === 'all' ? 'All Posts' : category}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="container-custom pb-32">
        {filteredBlogs.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No Blog Posts Yet</h3>
            <p className="text-gray-600 dark:text-gray-400">Check back soon for updates and insights!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {filteredBlogs.map((blog) => (
              <Link
                key={blog.id}
                to={`/blog/${blog.slug}`}
                className="group bg-white/80 dark:bg-white/5 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-white/10 hover:border-emerald-300 dark:hover:border-white/20 transition-all duration-500 hover:scale-105 shadow-xl dark:shadow-none overflow-hidden"
              >
                {blog.featured_image && (
                  <div className="aspect-video overflow-hidden bg-gray-200 dark:bg-gray-800">
                    <img src={blog.featured_image} alt={blog.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                )}
                <div className="p-6">
                  {blog.category && (
                    <span className="inline-block px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/20 rounded-full mb-3">
                      {blog.category}
                    </span>
                  )}
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {blog.title}
                  </h3>
                  {blog.excerpt && (
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4 line-clamp-3">{blog.excerpt}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-500 mb-4">
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      <span>{blog.author}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(blog.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    {blog.content && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{estimateReadTime(blog.content)} min read</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-medium group-hover:gap-3 transition-all">
                    <span>Read More</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
