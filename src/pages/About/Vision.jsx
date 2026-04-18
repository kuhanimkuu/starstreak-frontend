import React from "react";
import { Eye } from "lucide-react";

export default function Vision() {
  return (
    <section className="py-20">
      <div className="container-custom grid md:grid-cols-2 gap-12 items-center">

        {/* Text */}
        <div>
          <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">Our Vision</h2>

          <p className="text-gray-700 dark:text-gray-400 text-lg leading-relaxed">
            Our vision is to shape a future where African-built technology stands
            boldly on the world stage — modern, intuitive, and rooted in the culture,
            creativity, and resilience of our people. We imagine a continent where 
            young innovators, creators, and everyday users have access to digital tools 
            that not only match global standards, but redefine them.
          </p>

          <p className="text-gray-700 dark:text-gray-400 text-lg leading-relaxed mt-4">
            Starstreak is building an interconnected ecosystem that empowers millions
            to learn, communicate, create, and transact without limitations. Through
            products like Nexora and Trustia, we aim to create a seamless digital flow
            across platforms — where identity, creativity, commerce, and community come
            together effortlessly.
          </p>

          <p className="text-gray-700 dark:text-gray-400 text-lg leading-relaxed mt-4">
            We envision a world where African consumer technology is not seen as an
            alternative, but as a leader in design, performance, and impact. A world
            where proudly African products inspire global audiences, and where our
            innovations become catalysts for connection, opportunity, and economic
            growth across the continent.
          </p>
        </div>

        {/* Icon */}
        <div className="flex justify-center md:justify-end">
          <div className="w-20 h-20 rounded-xl bg-linear-to-br from-emerald-600 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <Eye size={40} className="text-white" />
          </div>
        </div>

      </div>
    </section>
  );
}
