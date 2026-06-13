import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase/client';
import { Smartphone, Shield, Sparkles, ExternalLink, Zap, Globe, Lock, Star, ArrowRight, Building2, Link2, Users, Layers, CheckCircle } from 'lucide-react';

const GRADIENTS = [
  'from-emerald-500 via-teal-500 to-cyan-500',
  'from-amber-500 via-orange-500 to-red-500',
  'from-blue-500 via-indigo-500 to-purple-500',
  'from-pink-500 via-rose-500 to-red-500',
  'from-violet-500 via-purple-500 to-indigo-500',
  'from-sky-500 via-blue-500 to-indigo-500',
];

const FALLBACK_ICONS = [Smartphone, Shield, Zap, Globe, Lock, Star];

const FLAGSHIP_PRODUCTS = [
  {
    name: 'Nexora',
    tagline: 'The Future of Communication & Creation',
    status: 'active',
    gradient: 'from-emerald-500 via-teal-500 to-cyan-500',
    description: 'Nexora is Starstreak\'s flagship platform — a next-generation communication and creator hub that combines messaging, content sharing, community spaces, and creative tools into one seamless experience. Built for speed, privacy, and cross-platform connectivity, Nexora empowers creators, communities, and everyday users to connect, collaborate, and express themselves like never before.',
    features: [
      'Rich messaging with voice, video, and media sharing',
      'Creator tools with built-in audience analytics',
      'Community spaces with moderation tools',
      'End-to-end encryption for private conversations',
      'Cross-platform sync across all devices',
      'Seamless integration with the Starstreak ecosystem',
    ],
    website_url: '#',
    logo_letter: 'N',
    stats: '50K+ Active Users',
  },
  {
    name: 'Trustia',
    tagline: 'Commerce for Africa, Connected to the World',
    status: 'coming_soon',
    gradient: 'from-amber-500 via-orange-500 to-red-500',
    description: 'Trustia is Starstreak\'s upcoming commerce platform designed to bridge African sellers with global buyers. With secure payments, integrated logistics, and a marketplace built on trust, transparency, and growth — Trustia will empower businesses across the continent to reach customers anywhere in the world.',
    features: [
      'Secure marketplace for African sellers',
      'Global buyer reach with localized experiences',
      'Integrated payment processing with local methods',
      'Logistics and shipping management',
      'Seller analytics and growth tools',
      'Trust and verification system',
    ],
    website_url: null,
    logo_letter: 'T',
    stats: 'Coming 2025',
  },
];

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

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

  const allProducts = [
    ...FLAGSHIP_PRODUCTS,
    ...products.filter(p => !['Nexora', 'Trustia'].includes(p.name)),
  ];

  const filteredProducts = activeTab === 'all'
    ? allProducts
    : activeTab === 'live'
      ? allProducts.filter(p => p.status === 'active')
      : allProducts.filter(p => p.status === 'coming_soon');

  return (
    <div className="min-h-screen bg-linear-to-b from-white via-gray-50 to-gray-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors duration-300">

      {/* ---- HERO ---- */}
      <section className="relative overflow-hidden pt-32 pb-20">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(16,185,129,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.3) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[150px]" />

        <div className="container-custom relative z-10">
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-black/5 dark:bg-white/5 backdrop-blur-sm rounded-full border border-emerald-500/20">
              <Sparkles className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">Product Ecosystem</span>
            </div>
          </div>

          <div className="text-center">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6">
              <span className="text-gray-900 dark:text-white">Products by </span>
              <span className="text-transparent bg-clip-text bg-linear-to-r from-emerald-500 via-teal-500 to-cyan-500 animate-gradient">Starstreak</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Starstreak Ltd builds innovative digital products that empower communities, protect privacy,
              and drive meaningful connections. Each product is part of a unified ecosystem designed to work together seamlessly.
            </p>
          </div>

          <div className="flex justify-center mt-10">
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10">
              <Building2 className="w-5 h-5 text-emerald-500" />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                <strong className="text-gray-900 dark:text-white">Starstreak Ltd</strong> — Parent company of Nexora, Trustia & more
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ---- FILTER TABS ---- */}
      <div className="container-custom pb-8">
        <div className="flex flex-wrap justify-center gap-3">
          {[
            { key: 'all', label: 'All Products' },
            { key: 'live', label: 'Live Now' },
            { key: 'coming_soon', label: 'Coming Soon' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-6 py-2.5 rounded-xl font-medium transition-all duration-300 ${
                activeTab === tab.key
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30'
                  : 'bg-white/70 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-white/10'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ---- PRODUCTS GRID ---- */}
      <div className="container-custom pb-20">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20 text-gray-500 dark:text-gray-400">
            <Sparkles className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-xl">No products in this category.</p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {filteredProducts.map((product, i) => {
              const gradient = product.gradient || GRADIENTS[i % GRADIENTS.length];
              const isActive = product.status === 'active';

              return (
                <div
                  key={i}
                  className="group relative bg-white/80 dark:bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-gray-200 dark:border-white/10 hover:border-emerald-300 dark:hover:border-white/20 transition-all duration-500 hover:scale-[1.02] shadow-xl dark:shadow-none"
                >
                  <div className={`absolute inset-0 bg-linear-to-br ${gradient} opacity-0 group-hover:opacity-5 rounded-3xl transition-opacity duration-500`} />

                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-6">
                      <div className={`p-4 rounded-2xl bg-linear-to-br ${gradient} text-white shadow-lg flex items-center justify-center`}>
                        {product.logo_url ? (
                          <img src={product.logo_url} alt={product.name} className="w-12 h-12 object-contain" />
                        ) : (
                          <span className="w-12 h-12 flex items-center justify-center text-2xl font-extrabold">
                            {product.logo_letter || product.name[0]}
                          </span>
                        )}
                      </div>
                      <span className={`${isActive ? 'bg-green-500' : 'bg-yellow-500'} text-white text-xs font-bold px-3 py-1 rounded-full`}>
                        {isActive ? 'Live Now' : 'Coming Soon'}
                      </span>
                    </div>

                    <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">{product.name}</h2>
                    <p className={`text-base font-semibold mb-4 text-transparent bg-clip-text bg-linear-to-r ${gradient}`}>
                      {product.tagline}
                    </p>

                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-6">
                      {product.description}
                    </p>

                    {product.features && product.features.length > 0 && (
                      <div className="mb-8">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-500 mb-3">Key Features</h4>
                        <ul className="space-y-2">
                          {product.features.map((feature, fi) => (
                            <li key={fi} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                              <span className="mt-1 w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
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
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 dark:bg-white/5 text-gray-500 font-bold rounded-xl border border-gray-300 dark:border-white/10 cursor-not-allowed"
                      >
                        <span>Coming Soon</span>
                      </button>
                    )}

                    {product.stats && (
                      <div className="mt-4 text-xs text-gray-500 dark:text-gray-500 font-medium">
                        {product.stats}
                      </div>
                    )}
                  </div>

                  <div className={`absolute top-0 right-0 w-32 h-32 bg-linear-to-br ${gradient} rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity`} />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ---- ECOSYSTEM SECTION ---- */}
      <section className="py-20 bg-gray-100/80 dark:bg-[#0d111a]">
        <div className="container-custom">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 bg-black/5 dark:bg-white/5 backdrop-blur-sm rounded-full border border-emerald-500/20">
              <Link2 className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">Connected Ecosystem</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
              Products That <span className="text-transparent bg-clip-text bg-linear-to-r from-emerald-500 to-teal-500">Work Together</span>
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Every product in the Starstreak ecosystem is built on shared infrastructure and unified design principles.
              A single account, a seamless experience, and powerful cross-platform features.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { icon: Users, title: 'Unified Identity', desc: 'One account across all Starstreak products. Your profile, preferences, and content follow you everywhere.' },
              { icon: Link2, title: 'Cross-Platform Flow', desc: 'Share content between Nexora and Trustia seamlessly. Post on Nexora, sell on Trustia — all connected.' },
              { icon: Shield, title: 'Shared Security', desc: 'Privacy and security standards are built at the ecosystem level, not per product. Consistent protection everywhere.' },
            ].map((item, i) => (
              <div key={i} className="p-8 rounded-2xl bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 hover:border-emerald-300 dark:hover:border-white/20 transition-all duration-500 hover:-translate-y-1">
                <div className="w-12 h-12 mb-5 rounded-xl bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center">
                  <item.icon className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">{item.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-16 max-w-4xl mx-auto">
            <div className="p-8 rounded-2xl bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-8 text-center">From Starstreak → To You</h3>
              <div className="grid sm:grid-cols-4 gap-6">
                {[
                  { step: '1', title: 'Starstreak Ltd', desc: 'Parent company — builds & maintains the ecosystem' },
                  { step: '2', title: 'Nexora', desc: 'Communication & creator hub' },
                  { step: '3', title: 'Trustia', desc: 'Commerce for African sellers' },
                  { step: '4', title: 'Future Products', desc: 'Expanding the ecosystem' },
                ].map((item, i) => (
                  <div key={i} className="text-center">
                    <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-linear-to-br from-emerald-500 to-teal-500 text-white flex items-center justify-center font-bold text-sm shadow-lg">
                      {item.step}
                    </div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-1">{item.title}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{item.desc}</p>
                  </div>
                ))}
              </div>
              <div className="hidden sm:flex justify-center gap-2 mt-4">
                {['→', '→', '→'].map((arrow, i) => (
                  <span key={i} className="text-emerald-500/50 text-2xl">{arrow}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---- CTA ---- */}
      <div className="container-custom py-20">
        <div className="relative overflow-hidden bg-linear-to-br from-emerald-600 via-teal-600 to-cyan-600 rounded-3xl p-12 text-center">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
          <div className="relative z-10">
            <h2 className="text-4xl font-extrabold text-white mb-4">
              Ready to Transform Your Digital Experience?
            </h2>
            <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
              Join thousands of users already exploring Starstreak products. Whether you're a creator, seller, or business — there's a place for you in our ecosystem.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="/contact" className="px-8 py-4 bg-white text-emerald-700 font-bold rounded-xl hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                Get in Touch
              </a>
              <a href="/about" className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-bold rounded-xl border-2 border-white/30 hover:bg-white/20 transition-all duration-300">
                About Starstreak
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
