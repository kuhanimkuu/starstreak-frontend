import React from "react";
import { Target } from "lucide-react";

export default function Mission() {
  return (
    <section className="section-padding bg-[#0d111a]">
      <div className="container-custom grid md:grid-cols-2 gap-12 items-center">

        {/* Icon */}
        <div className="flex justify-center md:justify-start">
          <div className="w-20 h-20 rounded-xl bg-linear-to-br from-emerald-600 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <Target size={40} className="text-white" />
          </div>
        </div>

        {/* Text */}
        <div>
          <h2 className="text-4xl font-extrabold mb-4">Our Mission</h2>

          <p className="text-gray-400 text-lg leading-relaxed">
            Our mission is to build technology that places African youth,
            creators, and communities at the center of innovation. We want to
            create digital products that feel modern, meaningful, and culturally
            grounded — tools that reflect the intelligence, energy, and ambition
            of the continent rather than treating African users as an
            afterthought.
          </p>

          <p className="text-gray-400 text-lg leading-relaxed mt-4">
            At Starstreak, we believe that Africa’s digital transformation will
            not be driven by imitation, but by originality. Our work is focused
            on designing technology that understands the realities of African
            life: fast-growing communities, youth-driven creativity, vibrant
            culture, and the desire for tools that are simple, elegant, and
            globally competitive.
          </p>

          <p className="text-gray-400 text-lg leading-relaxed mt-4">
            Through platforms like <span className="text-white font-medium">Nexora</span> and
            <span className="text-white font-medium"> Trustia</span>, we are building an
            interconnected ecosystem engineered for speed, privacy, and seamless 
            cross-platform flow. Our products are intentionally designed to scale,
            evolve, and grow with the people who use them — empowering millions to
            express themselves, learn, transact, and participate in a digital
            economy built with them in mind.
          </p>

          <p className="text-gray-400 text-lg leading-relaxed mt-4">
            Starstreak’s mission is not just to build software, but to redefine
            what African consumer technology can look and feel like. We aim to set
            a new standard: proudly African, fearlessly innovative, and globally
            ready. Every product, feature, and idea we create pushes us closer to
            a future where African technology leads the world, not follows it.
          </p>
        </div>

      </div>
    </section>
  );
}
