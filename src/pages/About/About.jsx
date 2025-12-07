import React from "react";
import Mission from "./Mission";
import Vision from "./Vision";
import Values from "./Values";

export default function About() {
  return (
    <div className="pb-20">

      {/* Hero Section */}
      <section className="section-padding text-center">
        <div className="container-custom">
          <h1 className="text-5xl font-extrabold gradient-text mb-6">
            About Starstreak
          </h1>

          <p className="text-lg text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Starstreak is a Kenyan-born technology company building the next generation 
            of digital products for creators, businesses, and everyday users. Founded 
            by <span className="text-white font-medium">Rooney Sindani</span> 
            (<a href="mailto:rooneysindani@gmail.com" className="underline text-emerald-400">
            rooneysindani@gmail.com</a>) and 
            <span className="text-white font-medium"> David Murunga</span> 
            (<a href="mailto:davidmurunga27@gmail.com" className="underline text-emerald-400">
            davidmurunga27@gmail.com</a>), Starstreak represents a new wave of modern, 
            scalable African tech built with global standards and local insight.
          </p>

          <p className="text-lg text-gray-400 max-w-3xl mx-auto leading-relaxed mt-6">
            Our company was founded on a simple idea: technology should be fast, 
            intuitive, reliable, and deeply human-centered. What started as a shared 
            vision between two developers has evolved into a growing ecosystem of 
            high-performance platforms—beginning with Nexora, a next-generation 
            communication and creator hub, and expanding into Trustia, our upcoming 
            commerce solution designed to empower African sellers and global buyers.
          </p>

          <p className="text-lg text-gray-400 max-w-3xl mx-auto leading-relaxed mt-6">
            At Starstreak, we believe Africa’s digital future will be shaped not by 
            copying existing tools, but by boldly reimagining what technology can look 
            like when built for cultural relevance, true usability, and massive scale.
            Our platforms are engineered with modern cloud architecture, a commitment 
            to user privacy, and a relentless focus on experience design that elevates 
            how people learn, work, connect, and transact.
          </p>

          <p className="text-lg text-gray-400 max-w-3xl mx-auto leading-relaxed mt-6">
            We are more than a software company—we are a long-term ecosystem builder. 
            Everything we create is designed to interconnect seamlessly, allowing 
            users, creators, institutions, and businesses to move across Starstreak 
            products without friction. Our mission is to build technology that not only 
            solves problems, but accelerates opportunity across the entire continent.
          </p>
        </div>
      </section>

      <Mission />
      <Vision />
      <Values />
    </div>
  );
}
