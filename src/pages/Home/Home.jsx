import Hero from "./Hero";
import Features from "./Features";
import CTA from "./CTA";

export default function Home() {
  return (
    <div
      className="
        min-h-screen relative overflow-hidden
        bg-white dark:bg-[#0f1322]
        transition-colors duration-300
      "
    >

      {/* Background Grid Overlay */}
      <div
        className="
          absolute inset-0 pointer-events-none opacity-[0.06]
          bg-[linear-gradient(to_right,#00000020_1px,transparent_1px),
              linear-gradient(to_bottom,#00000020_1px,transparent_1px)]
          dark:bg-[linear-gradient(to_right,#ffffff20_1px,transparent_1px),
                   linear-gradient(to_bottom,#ffffff20_1px,transparent_1px)]
          bg-size-[40px_40px]
          transition-all duration-300
        "
      />

      {/* Accent Glow */}
      <div
        className="
          absolute top-48 left-1/2 -translate-x-1/2 w-[700px] h-[700px]
          bg-emerald-500/10 dark:bg-emerald-500/20
          blur-[200px] rounded-full pointer-events-none
          transition-all duration-300
        "
      />

      {/* Main Content */}
      <main className="relative z-10 space-y-32 pt-32">

        {/* Hero Section */}
        <Hero />

        {/* Features Section */}
        <section className="container-custom section-padding">
          <Features />
        </section>

        {/* Call To Action Section */}
        <section className="container-custom section-padding">
          <CTA />
        </section>

      </main>
    </div>
  );
}
