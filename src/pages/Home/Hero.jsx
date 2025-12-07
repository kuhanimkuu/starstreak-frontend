import { Link } from 'react-router-dom';
import { Rocket, Zap, Users, Shield, TrendingUp } from 'lucide-react';

const PILL_FEATURES = [
  { icon: Users, label: "Ecosystem-Driven", color: "emerald" },
  { icon: Shield, label: "Secure by Design", color: "teal" },
  { icon: TrendingUp, label: "Built to Scale", color: "cyan" },
];

const STATS = [
  { number: "2+", label: "Core Products" },
  { number: "50K+", label: "Active Users" },
  { number: "200+", label: "Institutions Reached" },
  { number: "99.9%", label: "Platform Uptime" },
];

export default function Hero() {
  return (
    <section
      className="
        relative overflow-hidden min-h-screen flex items-center
        bg-linear-to-br from-white to-gray-100
        dark:from-slate-950 dark:via-emerald-950 dark:to-teal-950
        transition-colors duration-300
      "
    >

      {/* Background Grid */}
      <div
        className="
          absolute inset-0 opacity-10
          bg-[url('/grid.svg')]
          dark:opacity-10
        "
      ></div>

      {/* Gradient Orbs */}
      <div
        className="
          absolute top-0 left-0 w-96 h-96 rounded-full blur-3xl opacity-20
          bg-emerald-300 dark:bg-emerald-500
          mix-blend-multiply animate-float-slow
        "
      ></div>

      <div
        className="
          absolute bottom-0 right-0 w-96 h-96 rounded-full blur-3xl opacity-20
          bg-teal-300 dark:bg-teal-500
          mix-blend-multiply animate-float-slow animation-delay-2000
        "
      ></div>

      <div className="container-custom relative z-10 py-32">
        <div className="text-center space-y-8 max-w-5xl mx-auto">

          {/* Badge */}
          <div
            className="
              inline-flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-sm
              bg-black/10 dark:bg-white/10
              border border-emerald-500/30
              transition-colors
            "
          >
            <Zap className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
            <span
              className="
                text-sm font-medium 
                text-gray-700 dark:text-white
              "
            >
              Building the Future of Digital Ecosystems
            </span>
          </div>

          {/* Main Headline */}
          <h1
            className="
              text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight
              text-gray-900 dark:text-white transition-colors
            "
          >
            The Hub of Next-Gen Digital Innovation
            <span
              className="
                block mt-2 text-transparent bg-clip-text 
                bg-linear-to-r from-emerald-500 via-teal-500 to-cyan-500
                dark:from-emerald-400 dark:via-teal-400 dark:to-cyan-400
                animate-gradient
              "
            >
              STARSTREAK
            </span>
          </h1>

          {/* Subheadline */}
          <p
            className="
              text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed
              text-gray-700 dark:text-gray-300 transition-colors
            "
          >
            Starstreak powers platforms like Nexora and Trustia, bringing together secure,
            scalable, and human-centered digital experiences for users and communities worldwide.
          </p>

          {/* Feature Pills */}
          <div className="flex flex-wrap justify-center gap-4 pt-4">
            {PILL_FEATURES.map(({ icon: Icon, label, color }, i) => (
              <div
                key={i}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-sm
                  bg-black/5 dark:bg-white/5
                  border border-${color}-500/20
                  transition
                `}
              >
                <Icon className={`w-5 h-5 text-${color}-600 dark:text-${color}-400`} />
                <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-wrap justify-center gap-4 pt-8">
            <Link
              to="/products"
              className="
                group px-8 py-4 rounded-xl font-bold flex items-center gap-2
                bg-linear-to-r from-emerald-600 to-teal-600 text-white
                shadow-xl hover:shadow-emerald-500/50
                hover:-translate-y-1 transition-all duration-300
              "
            >
              <Rocket className="w-5 h-5 group-hover:animate-bounce" />
              Explore Our Platforms
            </Link>

            <Link
              to="/contact"
              className="
                px-8 py-4 rounded-xl font-bold border-2
                bg-black/5 dark:bg-white/10
                border-emerald-500/30
                text-gray-800 dark:text-white
                hover:bg-black/10 dark:hover:bg-white/20
                transition-all duration-300
              "
            >
              Contact Starstreak
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-16 max-w-4xl mx-auto">
            {STATS.map(({ number, label }, index) => (
              <div
                key={index}
                className="text-center transform hover:scale-110 transition-transform"
              >
                <div
                  className="
                    text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text
                    bg-linear-to-r from-emerald-500 to-teal-500
                    dark:from-emerald-400 dark:to-teal-400
                  "
                >
                  {number}
                </div>
                <div className="mt-1 text-sm text-gray-600 dark:text-gray-400 font-medium">
                  {label}
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
        <div
          className="
            w-6 h-10 rounded-full flex items-start justify-center p-2
            border-2 border-emerald-400 dark:border-emerald-500
          "
        >
          <div className="w-1 h-2 bg-emerald-500 rounded-full"></div>
        </div>
      </div>

    </section>
  );
}
