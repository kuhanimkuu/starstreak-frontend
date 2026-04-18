import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase/client';
import { Calendar, User, ArrowLeft, Clock, Share2, Tag } from 'lucide-react';

export default function BlogDetail() {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedBlogs, setRelatedBlogs] = useState([]);

  useEffect(() => {
    fetchBlog();
  }, [slug]);

  const fetchBlog = async () => {
    try {
      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .eq('slug', slug)
        .eq('published', true)
        .single();
      if (error) throw error;
      if (data) {
        setBlog(data);
        if (data.category) fetchRelatedBlogs(data.category, data.id);
      }
    } catch (error) {
      console.error('Error fetching blog:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedBlogs = async (category, currentId) => {
    try {
      const { data } = await supabase
        .from('blogs')
        .select('id, title, slug, excerpt, featured_image')
        .eq('category', category)
        .eq('published', true)
        .neq('id', currentId)
        .limit(3);
      setRelatedBlogs(data ?? []);
    } catch (error) {
      console.error('Error fetching related blogs:', error);
    }
  };

  const estimateReadTime = (content) => {
    const words = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
    return Math.ceil(words / 200);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: blog.title, text: blog.excerpt || blog.title, url: window.location.href });
      } catch {}
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-b from-white via-gray-50 to-gray-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="container-custom pt-32 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-linear-to-b from-white via-gray-50 to-gray-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="container-custom pt-32 pb-20 text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Blog Post Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">The blog post you're looking for doesn't exist or has been removed.</p>
          <Link to="/blog" className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium">
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-white via-gray-50 to-gray-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors duration-300">
      <div className="container-custom pt-32 pb-6">
        <Link to="/blog" className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Blog
        </Link>
      </div>

      <article className="container-custom pb-20">
        <div className="max-w-4xl mx-auto">
          {blog.category && (
            <div className="mb-6">
              <span className="inline-flex items-center gap-1 px-4 py-2 text-sm font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/20 rounded-full">
                <Tag className="w-4 h-4" />
                {blog.category}
              </span>
            </div>
          )}

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white mb-6 leading-tight">
            {blog.title}
          </h1>

          {blog.excerpt && (
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">{blog.excerpt}</p>
          )}

          <div className="flex flex-wrap items-center gap-6 text-gray-600 dark:text-gray-400 mb-8 pb-8 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5" />
              <span className="font-medium">{blog.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              <span>{new Date(blog.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            </div>
            {blog.content && (
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <span>{estimateReadTime(blog.content)} min read</span>
              </div>
            )}
            <button
              onClick={handleShare}
              className="flex items-center gap-2 ml-auto text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
            >
              <Share2 className="w-5 h-5" />
              <span className="font-medium">Share</span>
            </button>
          </div>

          {blog.featured_image && (
            <div className="mb-12 rounded-2xl overflow-hidden shadow-2xl">
              <img src={blog.featured_image} alt={blog.title} className="w-full h-auto" />
            </div>
          )}

          <div
            className="prose prose-lg dark:prose-invert max-w-none
              prose-headings:font-bold prose-headings:text-gray-900 dark:prose-headings:text-white
              prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:leading-relaxed
              prose-a:text-emerald-600 dark:prose-a:text-emerald-400 prose-a:no-underline hover:prose-a:underline
              prose-strong:text-gray-900 dark:prose-strong:text-white
              prose-code:text-emerald-600 dark:prose-code:text-emerald-400 prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:px-1 prose-code:py-0.5 prose-code:rounded
              prose-pre:bg-gray-900 dark:prose-pre:bg-gray-950 prose-pre:text-gray-100
              prose-img:rounded-xl prose-img:shadow-lg
              prose-blockquote:border-emerald-500 prose-blockquote:bg-emerald-50 dark:prose-blockquote:bg-emerald-900/10 prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:rounded-lg
            "
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />
        </div>
      </article>

      {relatedBlogs.length > 0 && (
        <section className="container-custom pb-32">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Related Articles</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {relatedBlogs.map((related) => (
                <Link
                  key={related.id}
                  to={`/blog/${related.slug}`}
                  className="group bg-white/80 dark:bg-white/5 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-white/10 hover:border-emerald-300 dark:hover:border-white/20 transition-all duration-300 hover:scale-105 p-6"
                >
                  {related.featured_image && (
                    <div className="aspect-video overflow-hidden rounded-lg mb-4 bg-gray-200 dark:bg-gray-800">
                      <img src={related.featured_image} alt={related.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    </div>
                  )}
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {related.title}
                  </h3>
                  {related.excerpt && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{related.excerpt}</p>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
