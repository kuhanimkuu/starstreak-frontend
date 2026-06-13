import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase/client';
import { Mail, Linkedin, Twitter, Github, Users as UsersIcon, Award, Heart, Sparkles, Shield, Zap, Lightbulb, Rocket, MapPin, Briefcase } from 'lucide-react';

// Hardcoded founders — always visible
const FOUNDERS = [
  {
    name: 'Rooney Sindani',
    role: 'Co-Founder & CEO',
    bio: 'Rooney is a product designer and software engineer driving the vision, user experience, and technical architecture behind the Starstreak ecosystem. He leads product strategy across Nexora, Trustia, and future platforms, ensuring every product is built with intention, performance, and cultural relevance.',
    initials: 'RS',
    gradient: 'from-emerald-600 to-teal-600',
  },
  {
    name: 'David Murunga',
    role: 'Co-Founder & CTO',
    bio: 'David is a skilled software engineer specialising in backend systems, cloud infrastructure, and scalable architecture. He leads engineering teams building the robust, secure, and high-performance foundations that power all Starstreak products — from Nexora\'s real-time messaging to Trustia\'s payment infrastructure.',
    initials: 'DM',
    gradient: 'from-teal-600 to-cyan-600',
  },
];

const CORE_VALUES = [
  { icon: Lightbulb, title: 'Innovation First', desc: 'We push boundaries and build technology that inspires. Every product we ship solves real problems for real people across Africa.' },
  { icon: UsersIcon, title: 'Community at Heart', desc: 'We grow with our users, creators, and partners. Our platforms are built to uplift, connect, and empower communities everywhere.' },
  { icon: Shield, title: 'Privacy by Design', desc: 'Security is not an afterthought — it is embedded in everything we build. User trust is our most valuable asset.' },
  { icon: Zap, title: 'Speed & Agility', desc: 'We move fast, iterate constantly, and build products that keep up with the energy and ambition of Africa\'s youth.' },
];

export default function Team() {
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('team')
        .select('*')
        .order('order', { ascending: true });
      if (error) throw error;
      setTeamMembers(data ?? []);
    } catch (error) {
      console.error('Error fetching team members:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-b from-white via-gray-50 to-gray-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="container-custom pt-32 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-white via-gray-50 to-gray-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors duration-300">
      
      {/* ---- HERO ---- */}
      <section className="relative overflow-hidden pt-32 pb-20">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(16,185,129,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.3) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[150px]" />

        <div className="container-custom relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-black/5 dark:bg-white/5 backdrop-blur-sm px-4 py-2 rounded-full border border-emerald-500/20 mb-8">
            <Sparkles className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">Meet the Team</span>
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6">
            <span className="text-gray-900 dark:text-white">The People Behind </span>
            <span className="text-transparent bg-clip-text bg-linear-to-r from-emerald-500 via-teal-500 to-cyan-500 animate-gradient">Starstreak</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
            A diverse team of innovators, engineers, and dreamers working together to build the future of digital platforms from Nairobi, Kenya.
          </p>
        </div>
      </section>

      {/* ---- FOUNDERS (always visible, not reliant on Supabase) ---- */}
      <section className="container-custom pb-20">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 bg-black/5 dark:bg-white/5 backdrop-blur-sm rounded-full border border-emerald-500/20">
            <Rocket className="w-4 h-4 text-emerald-500" />
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">Leadership</span>
          </div>
          <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
            Founded by <span className="text-transparent bg-clip-text bg-linear-to-r from-emerald-500 to-teal-500">Visionaries</span>
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Starstreak was founded by two developers who saw the need for world-class African consumer technology.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {FOUNDERS.map((founder, i) => (
            <div key={i} className="group p-8 rounded-2xl bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 hover:border-emerald-300 dark:hover:border-white/20 hover:shadow-xl hover:-translate-y-1 transition-all duration-500">
              <div className="flex items-center gap-5 mb-6">
                <div className={`w-16 h-16 rounded-2xl bg-linear-to-br ${founder.gradient} flex items-center justify-center text-white text-xl font-bold shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                  {founder.initials}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">{founder.name}</h3>
                  <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">{founder.role}</p>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{founder.bio}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---- CORE VALUES (more specific) ---- */}
      <section className="py-20 bg-gray-100/80 dark:bg-[#0d111a]">
        <div className="container-custom">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 bg-black/5 dark:bg-white/5 backdrop-blur-sm rounded-full border border-emerald-500/20">
              <Award className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">Our Culture</span>
            </div>
            <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
              What Drives <span className="text-transparent bg-clip-text bg-linear-to-r from-emerald-500 to-teal-500">Our Team</span>
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {CORE_VALUES.map(({ icon: Icon, title, desc }, i) => (
              <div key={i} className="p-6 rounded-xl bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 hover:border-emerald-300 dark:hover:border-white/20 hover:-translate-y-1 transition-all duration-500">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- TEAM MEMBERS (from Supabase, with fallback) ---- */}
      <section className="container-custom py-20">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 bg-black/5 dark:bg-white/5 backdrop-blur-sm rounded-full border border-emerald-500/20">
            <UsersIcon className="w-4 h-4 text-emerald-500" />
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">Our People</span>
          </div>
          <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
            Meet the <span className="text-transparent bg-clip-text bg-linear-to-r from-emerald-500 to-teal-500">Team</span>
          </h2>
        </div>

        {teamMembers.length === 0 ? (
          <div className="text-center py-16 bg-white/80 dark:bg-white/5 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-white/10 max-w-2xl mx-auto">
            <UsersIcon className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Team Roster Coming Soon</h3>
            <p className="text-gray-600 dark:text-gray-400">We're growing our team and will be introducing everyone soon. Stay tuned!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {teamMembers.map((member) => (
              <div key={member.id} className="group bg-white/80 dark:bg-white/5 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-white/10 hover:border-emerald-300 dark:hover:border-white/20 transition-all duration-500 hover:scale-105 overflow-hidden shadow-xl dark:shadow-none">
                <div className="aspect-square overflow-hidden bg-linear-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/20 dark:to-teal-900/20">
                  {member.photo_url ? (
                    <img src={member.photo_url} alt={member.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <UsersIcon className="w-20 h-20 text-emerald-600 dark:text-emerald-400" />
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{member.name}</h3>
                  <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400 mb-3">{member.role}</p>
                  {member.bio && <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4">{member.bio}</p>}
                  <div className="flex items-center gap-3">
                    {member.email && <a href={`mailto:${member.email}`} className="flex items-center justify-center w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/20 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors" title="Email"><Mail className="w-4 h-4" /></a>}
                    {member.linked_in && <a href={member.linked_in} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/20 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors" title="LinkedIn"><Linkedin className="w-4 h-4" /></a>}
                    {member.twitter && <a href={member.twitter} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/20 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors" title="Twitter/X"><Twitter className="w-4 h-4" /></a>}
                    {member.github && <a href={member.github} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/20 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors" title="GitHub"><Github className="w-4 h-4" /></a>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ---- CTA ---- */}
      <section className="container-custom pb-32">
        <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-emerald-600 via-teal-600 to-cyan-600 p-12 text-center shadow-2xl">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
          <div className="relative z-10">
            <h2 className="text-4xl font-extrabold text-white mb-4">Want to Join Our Team?</h2>
            <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
              We're always looking for talented individuals who are passionate about building the future of African technology.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/careers" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-emerald-700 font-bold rounded-xl hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <Briefcase className="w-5 h-5" />
                View Open Positions
              </Link>
              <Link to="/contact" className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-bold rounded-xl border-2 border-white/30 hover:bg-white/20 transition-all duration-300">
                Get in Touch
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
