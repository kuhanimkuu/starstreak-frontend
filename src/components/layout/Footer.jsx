import React from "react";
import { Link } from "react-router-dom";
import { Twitter, Github, Linkedin, Mail, Heart } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    products: [
      { label: 'Nexora', to: '/products' },
      { label: 'Trustia', to: '/products' },
      { label: 'Roadmap', to: '/' },
    ],
    company: [
      { label: 'About Us', to: '/about' },
      { label: 'Careers', to: '/' },
      { label: 'Contact', to: '/contact' },
    ],
    legal: [
      { label: 'Privacy Policy', to: '/privacy' },
      { label: 'Terms of Service', to: '/terms' },
      { label: 'Cookies', to: '/' },
    ],
  };

  const socialLinks = [
    { icon: <Twitter className="w-5 h-5" />, url: '#', label: 'Twitter' },
    { icon: <Github className="w-5 h-5" />, url: '#', label: 'GitHub' },
    { icon: <Linkedin className="w-5 h-5" />, url: '#', label: 'LinkedIn' },
    { icon: <Mail className="w-5 h-5" />, url: '/contact', label: 'Email' },
  ];

  return (
    <footer className="bg-gradient-to-b from-slate-950 to-black border-t border-emerald-500/10">
      <div className="container-custom py-16">
        {/* Top Section */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand Column */}
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-3 group mb-4">
              <img
                src="/starstreak_logo.png"
                alt="Starstreak Logo"
                className="h-10 object-contain group-hover:scale-105 transition-transform"
              />
            </Link>
            <p className="text-gray-400 mb-6 max-w-sm text-sm">
              Building innovative digital solutions that connect communities, protect privacy, and empower growth worldwide.
            </p>
            <div className="flex gap-4">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.url}
                  aria-label={social.label}
                  className="w-10 h-10 rounded-full bg-white/5 hover:bg-gradient-to-br hover:from-emerald-600 hover:to-teal-600 flex items-center justify-center transition-all duration-300 transform hover:scale-110 border border-emerald-500/20"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Products Links */}
          <div>
            <h3 className="font-bold text-white text-sm mb-4">Products</h3>
            <ul className="space-y-2">
              {footerLinks.products.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.to}
                    className="text-gray-400 hover:text-emerald-400 transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-bold text-white text-sm mb-4">Company</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.to}
                    className="text-gray-400 hover:text-emerald-400 transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="font-bold text-white text-sm mb-4">Legal</h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.to}
                    className="text-gray-400 hover:text-emerald-400 transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-emerald-500/10 my-8"></div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">
            © {currentYear} Starstreak. All rights reserved.
          </p>
          <p className="text-gray-500 text-sm flex items-center gap-2">
            Made with <Heart className="w-4 h-4 text-emerald-500 fill-current animate-pulse" /> for innovators worldwide
          </p>
        </div>
      </div>
    </footer>
  );
}
