import React from "react";
import Mission from "./Mission";
import Vision from "./Vision";
import Values from "./Values";

const MILESTONES = [
  { year: '2023', title: 'Starstreak Founded', desc: 'Co-founders Rooney Sindani and David Murunga launch Starstreak Ltd in Nairobi, Kenya with a vision to build world-class African consumer technology.' },
  { year: '2024 Q1', title: 'Nexora Development Begins', desc: 'Work begins on Nexora — a next-generation communication and creator platform designed for African users and global audiences.' },
  { year: '2024 Q3', title: 'Nexora Beta Launch', desc: 'Nexora enters closed beta with early adopters across Kenya, gathering feedback to shape the platform for scale.' },
  { year: '2025', title: 'Nexora Public Launch & Trustia Announcement', desc: 'Nexora launches publicly. Starstreak announces Trustia, its upcoming commerce platform for African sellers and global buyers.' },
  { year: '2025+', title: 'Ecosystem Expansion', desc: 'Continued growth of the Starstreak ecosystem — more products, deeper integrations, and millions of users across the continent.' },
];

const ECOSYSTEM_PRODUCTS = [
  {
    name: 'Nexora',
    tagline: 'The communication & creator hub',
    status: 'Live',
    gradient: 'from-emerald-500 via-teal-500 to-cyan-500',
    description: 'Nexora is Starstreak\'s flagship platform — a next-generation communication and creator hub that combines messaging, content sharing, community building, and creative tools into one seamless experience. Built for speed, privacy, and cross-platform flow.',
    link: '/products',
  },
  {
    name: 'Trustia',
    tagline: 'Commerce for African sellers, global buyers',
    status: 'Coming Soon',
    gradient: 'from-amber-500 via-orange-500 to-red-500',
    description: 'Trustia is Starstreak\'s upcoming commerce platform designed to bridge African sellers with global buyers. Secure payments, logistics integration, and a marketplace built for trust, transparency, and growth.',
    link: '/products',
  },
];

export default function About() {
  return (
    <div className="pb-20 bg-linear-to-b from-white via-gray-50 to-gray-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors duration-300">

      {/* ---- HERO SECTION (expanded) ---- */}
      <section className="relative overflow-hidden pt-32 pb-20">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `linear-gradient(rgba(16,185,129,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.3) 1px, transparent 1px)`, backgroundSize: '60px 60px' }} />
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[150px]" />

        <div className="container-custom relative z-10">
          {/* Badge */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-black/5 dark:bg-white/5 backdrop-blur-sm rounded-full border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">Our Story</span>
            </div>
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-center mb-8">
            <span className="text-gray-900 dark:text-white">About </span>
            <span className="text-transparent bg-clip-text bg-linear-to-r from-emerald-500 via-teal-500 to-cyan-500 animate-gradient">Starstreak</span>
          </h1>

          {/* Intro cards — who we are */}
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-16">
            <div className="p-6 rounded-2xl bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10">
              <div className="text-3xl font-extrabold text-emerald-500 mb-2">🏢</div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">Parent Company</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Starstreak Ltd is the parent company behind Nexora, Trustia, and future platforms in our ecosystem.</p>
            </div>
            <div className="p-6 rounded-2xl bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10">
              <div className="text-3xl font-extrabold text-emerald-500 mb-2">🌍</div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">Kenyan-Born</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Founded and headquartered in Nairobi, Kenya — building African technology for the world.</p>
            </div>
            <div className="p-6 rounded-2xl bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10">
              <div className="text-3xl font-extrabold text-emerald-500 mb-2">🔗</div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">Ecosystem Builder</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Every product is designed to interconnect — identity, data, and experiences flow across the ecosystem.</p>
            </div>
          </div>

          {/* Full narrative */}
          <div className="max-w-4xl mx-auto space-y-6">
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
              Starstreak Ltd is a Kenyan technology company building the next generation
              of digital products for creators, businesses, and everyday users. Founded
              by <span className="text-gray-900 dark:text-white font-semibold">Rooney Sindani</span>
              and <span className="text-gray-900 dark:text-white font-semibold">David Murunga</span>,
              Starstreak Ltd represents a new wave of modern, scalable African technology
              built with global standards and local insight.
            </p>

            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
              Our company was founded on a simple idea: technology should be fast,
              intuitive, reliable, and deeply human-centered. What started as a shared
              vision between two developers has evolved into a growing ecosystem of
              high-performance platforms — beginning with <strong className="text-gray-900 dark:text-white">Nexora</strong>, a next-generation
              communication and creator hub, and expanding into <strong className="text-gray-900 dark:text-white">Trustia</strong>, our upcoming
              commerce solution designed to empower African sellers and global buyers.
            </p>

            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
              At Starstreak, we believe Africa's digital future will be shaped not by
              copying existing tools, but by boldly reimagining what technology can look
              like when built for cultural relevance, true usability, and massive scale.
            </p>

            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
              We are more than a software company — we are a long-term ecosystem builder.
              Everything we create is designed to interconnect seamlessly, allowing
              users, creators, institutions, and businesses to move across Starstreak
              products without friction.
            </p>
          </div>
        </div>
      </section>

      {/* ---- ECOSYSTEM SHOWCASE (New section highlighting Nexora + Trustia) ---- */}
      <section className="py-20 bg-gray-100/80 dark:bg-[#0d111a]">
        <div className="container-custom">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 bg-black/5 dark:bg-white/5 backdrop-blur-sm rounded-full border border-emerald-500/20">
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">Our Ecosystem</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
              Built Under the <span className="text-transparent bg-clip-text bg-linear-to-r from-emerald-500 to-teal-500">Starstreak</span> Umbrella
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Every Starstreak product is built on shared infrastructure, unified design principles, and a commitment to seamless cross-platform experiences.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-10 max-w-5xl mx-auto">
            {ECOSYSTEM_PRODUCTS.map((product, i) => (
              <div key={i} className="group relative p-8 rounded-2xl bg-white dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 hover:border-emerald-300 dark:hover:border-white/20 transition-all duration-500 hover:scale-[1.02]">
                <div className={`absolute inset-0 bg-linear-to-br ${product.gradient} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-500`} />
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white">{product.name}</h3>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${product.status === 'Live' ? 'bg-green-500 text-white' : 'bg-yellow-500 text-white'}`}>
                      {product.status}
                    </span>
                  </div>
                  <p className={`text-sm font-semibold mb-4 text-transparent bg-clip-text bg-linear-to-r ${product.gradient}`}>
                    {product.tagline}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-6">
                    {product.description}
                  </p>
                  <a href={product.link} className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:gap-3 transition-all">
                    Learn more <span className="text-lg">→</span>
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Ecosystem diagram text */}
          <div className="mt-16 max-w-4xl mx-auto">
            <div className="p-8 rounded-2xl bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 text-center">How the Ecosystem Works</h3>
              <div className="grid sm:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold text-lg">1</div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Shared Account</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">One identity across all Starstreak products</p>
                </div>
                <div>
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold text-lg">2</div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Unified Data</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Preferences and content flow seamlessly between platforms</p>
                </div>
                <div>
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold text-lg">3</div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Cross-Platform</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Move between Nexora, Trustia, and future products effortlessly</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---- FOUNDERS STORY (New section) ---- */}
      <section className="py-20">
        <div className="container-custom">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 bg-black/5 dark:bg-white/5 backdrop-blur-sm rounded-full border border-emerald-500/20">
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">Leadership</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
              Founded by Visionaries
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Starstreak was built by two developers who saw the need for world-class African technology that competes on a global stage.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-10 max-w-4xl mx-auto">
            <div className="p-8 rounded-2xl bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 hover:border-emerald-300 dark:hover:border-white/20 transition-all duration-500">
              <div className="w-16 h-16 mb-4 rounded-2xl bg-linear-to-br from-emerald-600 to-teal-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">RS</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Rooney Sindani</h3>
              <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium mb-4">Co-Founder, Starstreak Ltd</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Rooney brings deep experience in product design and software engineering. He drives the product vision, user experience strategy, and technical architecture behind the Starstreak ecosystem — ensuring every product is built with intention, performance, and cultural relevance.
              </p>
            </div>
            <div className="p-8 rounded-2xl bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 hover:border-emerald-300 dark:hover:border-white/20 transition-all duration-500">
              <div className="w-16 h-16 mb-4 rounded-2xl bg-linear-to-br from-teal-600 to-cyan-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">DM</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">David Murunga</h3>
              <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium mb-4">Co-Founder, Starstreak Ltd</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                David is a skilled software engineer specialising in backend systems, cloud infrastructure, and scalable architecture. He leads the engineering teams building the robust, secure, and high-performance foundations that power all Starstreak products.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ---- TIMELINE (New section) ---- */}
      <section className="py-20 bg-gray-100/80 dark:bg-[#0d111a]">
        <div className="container-custom">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 bg-black/5 dark:bg-white/5 backdrop-blur-sm rounded-full border border-emerald-500/20">
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">Our Journey</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
              The Starstreak Timeline
            </h2>
          </div>

          <div className="relative max-w-4xl mx-auto">
            {/* Vertical line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-linear-to-b from-emerald-500 via-teal-500 to-cyan-500 opacity-30" />

            <div className="space-y-12">
              {MILESTONES.map((milestone, i) => (
                <div key={i} className="relative pl-20">
                  {/* Dot */}
                  <div className="absolute left-5 top-1 w-6 h-6 rounded-full bg-emerald-500 border-4 border-white dark:border-slate-900 shadow-lg shadow-emerald-500/30" />
                  
                  <div className="p-6 rounded-2xl bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 hover:border-emerald-300 dark:hover:border-white/20 transition-all duration-500">
                    <span className="inline-block px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/20 rounded-full mb-2">
                      {milestone.year}
                    </span>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{milestone.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{milestone.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Mission />
      <Vision />
      <Values />

      {/* Final CTA */}
      <section className="container-custom py-20">
        <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-emerald-600 via-teal-600 to-cyan-600 p-12 text-center">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
          <div className="relative z-10">
            <h2 className="text-4xl font-extrabold text-white mb-4">Be Part of the Story</h2>
            <p className="text-lg text-white/80 max-w-2xl mx-auto mb-8">
              Whether you're a creator, developer, business, or investor — Starstreak is building the future of African technology, and you can be part of it.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="/contact" className="px-8 py-4 bg-white text-emerald-700 font-bold rounded-xl hover:shadow-xl hover:-translate-y-1 transition-all duration-300">Get in Touch</a>
              <a href="/careers" className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-bold rounded-xl border-2 border-white/30 hover:bg-white/20 transition-all duration-300">Join Our Team</a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
