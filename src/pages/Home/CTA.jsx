export default function CTA() {
  return (
    <div
      className="
        text-center p-16 rounded-2xl transition-colors
        bg-white/70 border border-gray-200 
        dark:bg-white/3 dark:border-white/10 
        backdrop-blur-md
      "
    >
      <h2
        className="
          text-4xl font-bold mb-6
          text-gray-900 dark:text-white
          transition-colors
        "
      >
        Explore the Starstreak Ecosystem
      </h2>

      <p
        className="
          max-w-2xl mx-auto mb-10 leading-relaxed
          text-gray-700 dark:text-gray-400
          transition-colors
        "
      >
        From Nexora to upcoming platforms like Trustia, Starstreak is building 
        a unified suite of next-generation digital products designed for speed, 
        security, and seamless user experiences.
      </p>

      <a
        href="/products"
        className="
          px-10 py-4 rounded-xl font-semibold transition 
          bg-linear-to-r from-emerald-600 to-teal-600 
          text-white hover:shadow-lg hover:shadow-emerald-500/50
        "
      >
        View Our Products
      </a>
    </div>
  );
}
