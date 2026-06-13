import React, { useState } from "react";
import { supabase } from "../../lib/supabase/client";
import { Mail, Phone, MapPin, Send, CheckCircle, MessageCircle, HelpCircle, ChevronDown, Building2, Users, Shield, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

const FAQ = [
  { q: "What is Starstreak?", a: "Starstreak Ltd is a Kenyan technology company and the parent company behind Nexora (communication & creator hub) and Trustia (upcoming commerce platform). We build modern, scalable digital products for African and global audiences." },
  { q: "How can I report a bug or issue?", a: "Please use the contact form below or email support@starstreak.org with details about the issue including the product name, steps to reproduce, and any screenshots if possible." },
  { q: "Do you offer partnerships or collaborations?", a: "Yes! We're open to strategic partnerships, content collaborations, and integration opportunities. Please reach out to partnerships@starstreak.org or use the form below." },
  { q: "How do I apply for a job at Starstreak?", a: "Visit our Careers page for open positions. If you don't see a matching role, you can still send your resume to careers@starstreak.org with a brief introduction." },
  { q: "Is Starstreak hiring interns or graduate trainees?", a: "We occasionally offer internship and graduate programs. Check our Careers page for updates or email careers@starstreak.org with your area of interest." },
];

const DEPARTMENTS = [
  { icon: Building2, name: 'General Inquiries', email: 'info@starstreak.org', desc: 'For general questions about Starstreak and our products.' },
  { icon: Users, name: 'Partnerships', email: 'partnerships@starstreak.org', desc: 'For collaboration, integration, and partnership opportunities.' },
  { icon: Shield, name: 'Privacy & Legal', email: 'legal@starstreak.org', desc: 'For privacy concerns, legal inquiries, or data requests.' },
  { icon: Mail, name: 'Press & Media', email: 'press@starstreak.org', desc: 'For press inquiries, media kits, and interview requests.' },
];

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [openFaq, setOpenFaq] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { error: sbError } = await supabase
        .from('contact_submissions')
        .insert([{ name: formData.name, email: formData.email, subject: formData.subject || 'General Inquiry', message: formData.message }]);
      if (sbError) throw sbError;
      setSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      console.error('Error submitting contact form:', err);
      setError('Something went wrong. Please try again or email us directly at support@starstreak.org.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-white via-gray-50 to-gray-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors duration-300">

      {/* ---- HERO ---- */}
      <section className="relative overflow-hidden pt-32 pb-16">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(16,185,129,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.3) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        
        <div className="container-custom relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-black/5 dark:bg-white/5 backdrop-blur-sm px-4 py-2 rounded-full border border-emerald-500/20 mb-8">
            <MessageCircle className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">Get in Touch</span>
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6">
            <span className="text-gray-900 dark:text-white">Contact </span>
            <span className="text-transparent bg-clip-text bg-linear-to-r from-emerald-500 via-teal-500 to-cyan-500 animate-gradient">Starstreak</span>
          </h1>

          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Have a question, feedback, or want to reach someone on the Starstreak team?
            Whether you're a creator, business, partner, or community member — we'd love to hear from you.
          </p>
        </div>
      </section>

      {/* ---- CONTACT INFO CARDS ---- */}
      <div className="container-custom pb-16">
        <div className="grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="p-6 rounded-2xl bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 text-center hover:border-emerald-300 dark:hover:border-white/20 transition-all duration-300">
            <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-linear-to-br from-emerald-600 to-teal-600 flex items-center justify-center">
              <Mail className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-2">Email</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">support@starstreak.org</p>
          </div>
          <div className="p-6 rounded-2xl bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 text-center hover:border-emerald-300 dark:hover:border-white/20 transition-all duration-300">
            <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-linear-to-br from-teal-600 to-cyan-600 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-2">Location</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Nairobi, Kenya</p>
          </div>
          <div className="p-6 rounded-2xl bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 text-center hover:border-emerald-300 dark:hover:border-white/20 transition-all duration-300">
            <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-linear-to-br from-cyan-600 to-sky-600 flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-2">Response Time</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Usually within 24 hours</p>
          </div>
        </div>
      </div>

      {/* ---- MAIN SECTION: FORM + DEPARTMENT CONTACTS ---- */}
      <div className="container-custom pb-20">
        <div className="grid lg:grid-cols-5 gap-12">
          
          {/* LEFT: Department contacts */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Contact by Department</h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm">For faster responses, reach out to the relevant team directly.</p>
            </div>

            <div className="space-y-4">
              {DEPARTMENTS.map((dept, i) => (
                <div key={i} className="p-5 rounded-xl bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 hover:border-emerald-300 dark:hover:border-white/20 transition-all duration-300">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center">
                      <dept.icon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{dept.name}</h3>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 ml-12">{dept.desc}</p>
                  <a href={`mailto:${dept.email}`} className="inline-flex items-center gap-1 text-sm text-emerald-600 dark:text-emerald-400 font-medium hover:underline ml-12">
                    {dept.email}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              ))}
            </div>

            <div className="p-5 rounded-xl bg-linear-to-br from-emerald-50/50 to-teal-50/50 dark:from-emerald-900/10 dark:to-teal-900/10 border border-emerald-200/50 dark:border-emerald-500/20">
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-2">Need help with a specific product?</h3>
              <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <li><strong className="text-gray-900 dark:text-white">Nexora support:</strong> nexora@starstreak.org</li>
                <li><strong className="text-gray-900 dark:text-white">Trustia (coming soon):</strong> trustia@starstreak.org</li>
              </ul>
            </div>
          </div>

          {/* RIGHT: Contact form */}
          <div className="lg:col-span-3">
            {submitted ? (
              <div className="p-10 rounded-2xl bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-emerald-300 dark:border-emerald-700 text-center min-h-[300px] flex flex-col items-center justify-center space-y-4">
                <CheckCircle className="w-16 h-16 text-emerald-500" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Message Sent!</h3>
                <p className="text-gray-600 dark:text-gray-400 max-w-md">Thanks for reaching out. Our team will review your message and get back to you as soon as possible.</p>
                <button onClick={() => setSubmitted(false)} className="mt-4 px-6 py-2 text-sm text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-600 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors">Send another message</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-8 rounded-2xl bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 space-y-5">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Send Us a Message</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Fill out the form and we'll get back to you within 24 hours.</p>

                {error && <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-4 py-3">{error}</p>}

                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block mb-1.5 text-sm text-gray-700 dark:text-gray-300 font-medium">Full Name</label>
                    <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-gray-100/50 dark:bg-[#1a2030] text-gray-900 dark:text-gray-200 outline-none focus:ring-2 focus:ring-emerald-500 border border-transparent focus:border-emerald-500/30 transition-all"
                      placeholder="Enter your name" />
                  </div>
                  <div>
                    <label className="block mb-1.5 text-sm text-gray-700 dark:text-gray-300 font-medium">Email Address</label>
                    <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-gray-100/50 dark:bg-[#1a2030] text-gray-900 dark:text-gray-200 outline-none focus:ring-2 focus:ring-emerald-500 border border-transparent focus:border-emerald-500/30 transition-all"
                      placeholder="you@example.com" />
                  </div>
                </div>

                <div>
                  <label className="block mb-1.5 text-sm text-gray-700 dark:text-gray-300 font-medium">Subject</label>
                  <input type="text" value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-gray-100/50 dark:bg-[#1a2030] text-gray-900 dark:text-gray-200 outline-none focus:ring-2 focus:ring-emerald-500 border border-transparent focus:border-emerald-500/30 transition-all"
                    placeholder="How can we help you?" />
                </div>

                <div>
                  <label className="block mb-1.5 text-sm text-gray-700 dark:text-gray-300 font-medium">Message</label>
                  <textarea rows="5" required value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-gray-100/50 dark:bg-[#1a2030] text-gray-900 dark:text-gray-200 outline-none resize-none focus:ring-2 focus:ring-emerald-500 border border-transparent focus:border-emerald-500/30 transition-all"
                    placeholder="Write your message in detail..." />
                </div>

                <button type="submit" disabled={loading}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-linear-to-r from-emerald-600 to-teal-600 text-white font-semibold hover:shadow-lg hover:shadow-emerald-500/30 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
                  <Send size={18} className={loading ? 'animate-spin' : ''} />
                  {loading ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* ---- FAQ ---- */}
      <section className="py-20 bg-gray-100/80 dark:bg-[#0d111a]">
        <div className="container-custom">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 bg-black/5 dark:bg-white/5 backdrop-blur-sm rounded-full border border-emerald-500/20">
              <HelpCircle className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">Help Center</span>
            </div>
            <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
              Frequently Asked <span className="text-transparent bg-clip-text bg-linear-to-r from-emerald-500 to-teal-500">Questions</span>
            </h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-3">
            {FAQ.map((faq, i) => (
              <div key={i} className="bg-white/80 dark:bg-white/5 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-white/10 overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                >
                  <span className="font-medium text-gray-900 dark:text-white pr-4">{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-gray-400 shrink-0 transition-transform duration-300 ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5">
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- CTA ---- */}
      <section className="container-custom py-20">
        <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-emerald-600 via-teal-600 to-cyan-600 p-12 text-center">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
          <div className="relative z-10">
            <h2 className="text-4xl font-extrabold text-white mb-4">Prefer to Reach Us Directly?</h2>
            <p className="text-lg text-white/80 max-w-2xl mx-auto mb-8">You can always email us directly at <strong>support@starstreak.org</strong> and we'll respond promptly.</p>
            <a href="mailto:support@starstreak.org" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-emerald-700 font-bold rounded-xl hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <Mail className="w-5 h-5" />
              Email Support
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
