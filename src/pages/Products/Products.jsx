import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase/client';
import { Smartphone, Shield, Sparkles, ExternalLink, Zap, Globe, Lock, Star } from 'lucide-react';

const GRADIENTS = [
  'from-blue-500 via-indigo-500 to-purple-500',
  'from-amber-500 via-orange-500 to-red-500',
  'from-emerald-500 via-teal-500 to-cyan-500',
  'from-pink-500 via-rose-500 to-red-500',
  'from-violet-500 via-purple-500 to-indigo-500',
  'from-sky-500 via-blue-500 to-indigo-500',
];

const FALLBACK_ICONS = [Smartphone, Shield, Zap, Globe, Lock, Star];

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('order', { ascending: true });
        if (error) throw error;
        setProducts(data ?? []);
      } catch (err) {
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen bg-linear-to-b from-white via-gray-50 to-gray-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors duration-300">
      <div className="container-custom pt-32 pb-20 text-center">
        <div className="inline-flex items-center gap-2 bg-black/5 dark:bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-emerald-500/20 mb-8">
          <Sparkles className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
          <span className="text-sm font-medium text-gray-800 dark:text-white">Our Product Ecosystem</span>
        </div>

        <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-white mb-6">
          Building the
          <span className="block mt-2 text-transparent bg-clip-text bg-linear-to-r from-emerald-500 via-teal-500 to-cyan-500 dark:from-emerald-400 dark:via-teal-400 dark:to-cyan-400">
            Future Together
          </span>
        </h1>

        <p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
          Starstreak creates innovative digital solutions that empower communities, protect privacy, and drive meaningful connections worldwide.
        </p>
      </div>

      <div className="container-custom pb-32">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 text-gray-500 dark:text-gray-400">
            <Sparkles className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-xl">Products coming soon.</p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
            {products.map((product, i) => {
              const gradient = GRADIENTS[i % GRADIENTS.length];
              const FallbackIcon = FALLBACK_ICONS[i % FALLBACK_ICONS.length];
              const isActive = product.status === 'active';

              return (
                <div
                  key={product.id}
                  className="group relative bg-white/80 dark:bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-gray-200 dark:border-white/10 hover:border-emerald-300 dark:hover:border-white/20 transition-all duration-500 hover:scale-[1.02] shadow-xl dark:shadow-none"
                >
                  <div className={`absolute inset-0 bg-linear-to-br ${gradient} opacity-0 group-hover:opacity-5 rounded-3xl transition-opacity duration-500`}></div>

                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-6">
                      <div className={`p-4 rounded-2xl bg-linear-to-br ${gradient} text-white shadow-lg flex items-center justify-center`}>
                        {product.logo_url ? (
                          <img src={product.logo_url} alt={product.name} className="w-12 h-12 object-contain" />
                        ) : (
                          <FallbackIcon className="w-12 h-12" />
                        )}
                      </div>
                      <span className={`${isActive ? 'bg-green-500' : 'bg-yellow-500'} text-white text-xs font-bold px-3 py-1 rounded-full`}>
                        {isActive ? 'Live Now' : 'Coming Soon'}
                      </span>
                    </div>

                    <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">{product.name}</h2>
                    <p className={`text-lg font-semibold mb-4 text-transparent bg-clip-text bg-linear-to-r ${gradient}`}>
                      {product.tagline}
                    </p>

                    {product.description && (
                      <div
                        className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6 prose prose-sm dark:prose-invert max-w-none"
                        dangerouslySetInnerHTML={{ __html: product.description }}
                      />
                    )}

                    {product.features && (
                      <div
                        className="mb-8 text-gray-600 dark:text-gray-400 prose prose-sm dark:prose-invert max-w-none [&_ul]:space-y-2 [&_li]:flex [&_li]:items-start [&_li]:gap-2"
                        dangerouslySetInnerHTML={{ __html: product.features }}
                      />
                    )}

                    {product.website_url ? (
                      <a
                        href={product.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center gap-2 px-6 py-3 bg-linear-to-r ${gradient} text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300`}
                      >
                        <span>Learn More</span>
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    ) : (
                      <button
                        disabled
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-500 font-bold rounded-xl border border-gray-300 dark:border-white/10 cursor-not-allowed"
                      >
                        <span>Coming Soon</span>
                      </button>
                    )}
                  </div>

                  <div className={`absolute top-0 right-0 w-32 h-32 bg-linear-to-br ${gradient} rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity`}></div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="container-custom pb-32">
        <div className="relative overflow-hidden bg-linear-to-br from-emerald-600 via-teal-600 to-cyan-600 rounded-3xl p-12 text-center">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
          <div className="relative z-10">
            <h2 className="text-4xl font-extrabold text-white mb-4">
              Ready to Transform Your Digital Experience?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Join thousands of users already exploring Starstreak products.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="/contact" className="px-8 py-4 bg-white text-emerald-600 font-bold rounded-xl shadow-2xl hover:shadow-white/20 transform hover:-translate-y-1 transition-all duration-300">
                Get in Touch
              </a>
              <a href="/about" className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-bold rounded-xl border-2 border-white/30 hover:bg-white/20 transition-all duration-300">
                Learn About Us
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
