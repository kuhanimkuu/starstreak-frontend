import React, { useState } from "react";
import { supabase } from "../../lib/supabase/client";
import { Mail, Phone, MapPin, Send, CheckCircle } from "lucide-react";

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { error: sbError } = await supabase
        .from('contact_submissions')
        .insert([{ name: formData.name, email: formData.email, message: formData.message }]);
      if (sbError) throw sbError;
      setSubmitted(true);
      setFormData({ name: '', email: '', message: '' });
    } catch (err) {
      console.error('Error submitting contact form:', err);
      setError('Something went wrong. Please try again or email us directly at support@starstreak.org.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pb-20 pt-32 bg-white dark:bg-[#05060a] text-gray-900 dark:text-gray-200 transition-colors">
      <section className="text-center mb-16">
        <div className="container-custom">
          <h1 className="text-5xl font-extrabold gradient-text mb-4">Contact Us</h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
            Have a question, feedback, or want to reach someone on the Starstreak team?
            We're here to help and always open to hearing from our community.
          </p>
        </div>
      </section>

      <div className="container-custom grid md:grid-cols-2 gap-16">
        <div className="space-y-10">
          <div>
            <h2 className="text-3xl font-bold mb-6">Get in Touch</h2>
            <p className="text-gray-700 dark:text-gray-400 leading-relaxed">
              Starstreak builds consumer technology for Africa and beyond. Whether
              you're a creator, user, business, or simply curious about what we're
              building, you can reach us through any of the channels below.
            </p>
          </div>

          <div className="space-y-8">
            <div className="flex items-center gap-6 py-1">
              <div className="w-12 h-12 rounded-xl bg-linear-to-br from-emerald-600 to-teal-600 flex items-center justify-center">
                <Mail className="text-white" size={20} />
              </div>
              <div className="leading-tight">
                <p className="font-semibold">Email</p>
                <p className="text-gray-700 dark:text-gray-400">support@starstreak.org</p>
              </div>
            </div>

            <div className="flex items-center gap-6 py-1">
              <div className="w-12 h-12 rounded-xl bg-linear-to-br from-emerald-600 to-teal-600 flex items-center justify-center">
                <Phone className="text-white" size={20} />
              </div>
              <div className="leading-tight">
                <p className="font-semibold">Phone</p>
                <p className="text-gray-700 dark:text-gray-400">Phone support available on request</p>
              </div>
            </div>

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

        <div>
          {submitted ? (
            <div className="p-8 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/20 flex flex-col items-center justify-center text-center min-h-[300px] space-y-4">
              <CheckCircle className="w-16 h-16 text-emerald-500" />
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Message Sent!</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Thanks for reaching out. We'll get back to you as soon as possible.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-4 px-6 py-2 text-sm text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-600 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="p-8 rounded-xl border border-gray-300 dark:border-white/10 bg-white dark:bg-[#0f1522] space-y-6 transition-colors"
            >
              {error && (
                <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-4 py-3">
                  {error}
                </p>
              )}

              <div>
                <label className="block mb-1 text-gray-700 dark:text-gray-300">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-gray-100 dark:bg-[#1a2030] text-gray-900 dark:text-gray-200 outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Enter your name"
                />
              </div>

              <div>
                <label className="block mb-1 text-gray-700 dark:text-gray-300">Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-gray-100 dark:bg-[#1a2030] text-gray-900 dark:text-gray-200 outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="block mb-1 text-gray-700 dark:text-gray-300">Message</label>
                <textarea
                  rows="5"
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-gray-100 dark:bg-[#1a2030] text-gray-900 dark:text-gray-200 outline-none resize-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Write your message..."
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-linear-to-r from-emerald-600 to-teal-600 hover:shadow-lg hover:shadow-emerald-500/50 text-white font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={18} />
                {loading ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
