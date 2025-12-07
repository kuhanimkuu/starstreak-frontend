import React from "react";
import { Mail, Phone, MapPin, Send } from "lucide-react";

export default function Contact() {
  return (
    <div
      className="
        pb-20 pt-24 
        bg-white dark:bg-[#05060a] 
        text-gray-900 dark:text-gray-200
        transition-colors
      "
    >

      {/* Page Header */}
      <section className="text-center mb-16">
        <div className="container-custom">
          <h1 className="text-5xl font-extrabold gradient-text mb-4">
            Contact Us
          </h1>

          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
            Have a question, feedback, or want to reach someone on the Starstreak team?
            We're here to help and always open to hearing from our community.
          </p>
        </div>
      </section>

      <div className="container-custom grid md:grid-cols-2 gap-16">

        {/* Left: Contact Info */}
        <div className="space-y-10">

          <div>
            <h2 className="text-3xl font-bold mb-6">Get in Touch</h2>

            <p className="text-gray-700 dark:text-gray-400 leading-relaxed">
              Starstreak builds consumer technology for Africa and beyond. Whether
              you're a creator, user, business, or simply curious about what we're
              building, you can reach us through any of the channels below.
            </p>
          </div>

          {/* Contact Methods */}
          <div className="space-y-8">

            {/* EMAIL */}
            <div className="flex items-center gap-6 py-1">
              <div className="w-12 h-12 rounded-xl bg-linear-to-br from-emerald-600 to-teal-600 flex items-center justify-center">
                <Mail className="text-white" size={20} />
              </div>

              <div className="leading-tight">
                <p className="font-semibold">Email</p>
                <p className="text-gray-700 dark:text-gray-400">support@starstreak.com</p>
              </div>
            </div>

            {/* PHONE */}
            <div className="flex items-center gap-6 py-1">
              <div className="w-12 h-12 rounded-xl bg-linear-to-br from-emerald-600 to-teal-600 flex items-center justify-center">
                <Phone className="text-white" size={20} />
              </div>

              <div className="leading-tight">
                <p className="font-semibold">Phone</p>
                <p className="text-gray-700 dark:text-gray-400">+254 712 345 678</p>
              </div>
            </div>

            {/* OFFICE */}
            <div className="flex items-center gap-6 py-1">
              <div className="w-12 h-12 rounded-xl bg-linear-to-br from-emerald-600 to-teal-600 flex items-center justify-center">
                <MapPin className="text-white" size={20} />
              </div>

              <div className="leading-tight">
                <p className="font-semibold">Our Office</p>
                <p className="text-gray-700 dark:text-gray-400">Nairobi, Kenya</p>
              </div>
            </div>

          </div>

        </div>

        {/* Right: Form */}
        <div>
          <form
            className="
              p-8 rounded-xl 
              border border-gray-300 dark:border-white/10 
              bg-white dark:bg-[#0f1522] 
              space-y-6 
              transition-colors
            "
          >

            <div>
              <label className="block mb-1 text-gray-700 dark:text-gray-300">
                Full Name
              </label>
              <input
                type="text"
                className="
                  w-full px-4 py-3 rounded-lg 
                  bg-gray-100 dark:bg-[#1a2030] 
                  text-gray-900 dark:text-gray-200 
                  outline-none focus:ring-2 focus:ring-emerald-500
                "
                placeholder="Enter your name"
              />
            </div>

            <div>
              <label className="block mb-1 text-gray-700 dark:text-gray-300">
                Email Address
              </label>
              <input
                type="email"
                className="
                  w-full px-4 py-3 rounded-lg 
                  bg-gray-100 dark:bg-[#1a2030] 
                  text-gray-900 dark:text-gray-200 
                  outline-none focus:ring-2 focus:ring-emerald-500
                "
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block mb-1 text-gray-700 dark:text-gray-300">
                Message
              </label>
              <textarea
                rows="5"
                className="
                  w-full px-4 py-3 rounded-lg 
                  bg-gray-100 dark:bg-[#1a2030] 
                  text-gray-900 dark:text-gray-200 
                  outline-none resize-none 
                  focus:ring-2 focus:ring-emerald-500
                "
                placeholder="Write your message..."
              />
            </div>

            <button
              type="submit"
              className="
                w-full flex items-center justify-center gap-2 px-6 py-3 
                rounded-lg 
                bg-linear-to-r from-emerald-600 to-teal-600 
                hover:shadow-lg hover:shadow-emerald-500/50 
                text-white font-medium transition
              "
            >
              <Send size={18} />
              Send Message
            </button>

          </form>
        </div>

      </div>

    </div>
  );
}
