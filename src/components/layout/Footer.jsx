import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Twitter, Github, Linkedin, Mail, Heart, ArrowUpRight, Sparkles } from 'lucide-react';
import { supabase } from '../../lib/supabase/client';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [socialUrls, setSocialUrls] = useState({ twitter: '', github: '', linkedin: '' });
  const [announcement, setAnnouncement] = useState({ text: '', active: false });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await supabase
          .from('site_settings')
          .select('key, value')
          .in('key', ['social_twitter', 'social_github', 'social_linkedin', 'announcement_text', 'announcement_active']);
        const map = {};
        (data ?? []).forEach(row => { map[row.key] = row.value; });
        setSocialUrls({
          twitter: map.social_twitter || '',
          github: map.social_github || '',
          linkedin: map.social_linkedin || '',
        });
        setAnnouncement({
          text: map.announcement_text || '',
          active: map.announcement_active === 'true',
        });
      } catch {
        // silently fall back to no social links
      }
    };
    fetchSettings();
  }, []);

  const footerLinks = {
    products: [
      { label: 'Nexora', to: '/products' },
      { label: 'Trustia', to: '/products' },
      { label: 'All Products', to: '/products' },
    ],
    company: [
      { label: 'About Us', to: '/about' },
      { label: 'Team', to: '/team' },
      { label: 'Blog', to: '/blog' },
      { label: 'Careers', to: '/careers' },
      { label: 'Contact', to: '/contact' },
    ],
    legal: [
      { label: 'Privacy Policy', to: '/privacy' },
      { label: 'Terms of Service', to: '/terms' },
      { label: 'Cookie Policy', to: '/cookie-policy' },
    ],
  };

  const socialLinks = [
    { icon: <Twitter className="w-4 h-4" />, url: socialUrls.twitter || '#', label: 'Twitter' },
    { icon: <Github className="w-4 h-4" />, url: socialUrls.github || '#', label: 'GitHub' },
    { icon: <Linkedin className="w-4 h-4" />, url: socialUrls.linkedin || '#', label: 'LinkedIn' },
    { icon: <Mail className="w-4 h-4" />, url: '/contact', label: 'Email' },
  ];

  return (
    <>
      {announcement.active && announcement.text && (
        <div className="bg-linear-to-r from-emerald-600 to-teal-600 text-white text-center text-sm py-3 px-4 font-medium relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
          <span className="relative z-10">{announcement.text}</span>
        </div>
      )}
    <footer className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-black border-t border-emerald-500/10">
      {/* Background glow orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-500/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="container-custom relative z-10 py-16">
        {/* Top Section */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-12">
          {/* Brand Column */}
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-3 group mb-5">
              <img
                src="/starstreak_logo.png"
                alt="Starstreak Logo"
                className="h-10 object-contain group-hover:scale-105 transition-all duration-500"
              />
            </Link>
            <p className="text-gray-500 mb-6 max-w-sm text-sm leading-relaxed">
              Building innovative digital solutions that connect communities, protect privacy, and empower growth worldwide.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.url}
                  aria-label={social.label}
                  className="w-9 h-9 rounded-xl bg-white/[0.03] hover:bg-linear-to-br hover:from-emerald-600 hover:to-teal-600 flex items-center justify-center transition-all duration-300 transform hover:scale-110 border border-emerald-500/10 hover:border-transparent text-gray-500 hover:text-white"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Products Links */}
          <div>
            <h3 className="font-bold text-white/70 text-xs uppercase tracking-widest mb-5">Products</h3>
            <ul className="space-y-3">
              {footerLinks.products.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.to}
                    className="group flex items-center gap-1 text-gray-500 hover:text-emerald-400 transition-colors text-sm"
                  >
                    {link.label}
                    <ArrowUpRight size={12} className="opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-bold text-white/70 text-xs uppercase tracking-widest mb-5">Company</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.to}
                    className="group flex items-center gap-1 text-gray-500 hover:text-emerald-400 transition-colors text-sm"
                  >
                    {link.label}
                    <ArrowUpRight size={12} className="opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="font-bold text-white/70 text-xs uppercase tracking-widest mb-5">Legal</h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.to}
                    className="group flex items-center gap-1 text-gray-500 hover:text-emerald-400 transition-colors text-sm"
                  >
                    {link.label}
                    <ArrowUpRight size={12} className="opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-emerald-500/10" />
          </div>
          <div className="relative flex justify-center">
            <div className="px-4 bg-gradient-to-b from-slate-950 to-black">
              <Sparkles size={16} className="text-emerald-500/30" />
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <p className="text-gray-600 text-xs">
              © {currentYear} Starstreak. All rights reserved.
            </p>
            <Link
              to="/admin/login"
              className="text-gray-600 hover:text-emerald-400 text-xs transition-colors border border-gray-800 hover:border-emerald-500/30 px-2 py-0.5 rounded-md"
            >
              Admin
            </Link>
          </div>
          <p className="text-gray-600 text-xs flex items-center gap-2">
            Made with <Heart className="w-3 h-3 text-emerald-500 fill-current animate-pulse" /> for innovators worldwide
          </p>
        </div>
      </div>
    </footer>
    </>
  );
}
