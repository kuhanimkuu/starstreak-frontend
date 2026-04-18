import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase/client';
import { Mail, Linkedin, Twitter, Github, Users as UsersIcon, Award, Heart } from 'lucide-react';

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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-white via-gray-50 to-gray-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors duration-300">
      <section className="relative overflow-hidden pt-32 pb-20">
        <div className="absolute inset-0 opacity-10 bg-[url('/grid.svg')]"></div>
        <div className="absolute top-0 left-0 w-96 h-96 rounded-full blur-3xl opacity-20 bg-emerald-300 dark:bg-emerald-500 mix-blend-multiply animate-float-slow"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full blur-3xl opacity-20 bg-teal-300 dark:bg-teal-500 mix-blend-multiply animate-float-slow"></div>

        <div className="container-custom relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-black/5 dark:bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-emerald-500/20 mb-8">
            <UsersIcon className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
            <span className="text-sm font-medium text-gray-800 dark:text-white">Meet the Team</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-white mb-6">
            The People Behind
            <span className="block mt-2 text-transparent bg-clip-text bg-linear-to-r from-emerald-500 via-teal-500 to-cyan-500 dark:from-emerald-400 dark:via-teal-400 dark:to-cyan-400 animate-gradient">
              Starstreak
            </span>
          </h1>
          <p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            A diverse team of innovators, engineers, and dreamers working together to build the future of digital platforms.
          </p>
        </div>
      </section>

      <section className="container-custom pb-20">
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {[
            { icon: Award, title: 'Excellence', description: 'We strive for the highest standards in everything we build' },
            { icon: Heart, title: 'Passion', description: 'We love what we do and it shows in our work' },
            { icon: UsersIcon, title: 'Collaboration', description: 'Together we achieve more than we could alone' },
          ].map((value, i) => (
            <div key={i} className="bg-white/80 dark:bg-white/5 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-white/10 p-6 text-center hover:border-emerald-300 dark:hover:border-white/20 transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100 dark:bg-emerald-900/20">
                <value.icon className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{value.title}</h3>
              <p className="text-gray-600 dark:text-gray-400">{value.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-custom pb-32">
        {teamMembers.length === 0 ? (
          <div className="text-center py-20 bg-white/80 dark:bg-white/5 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-white/10 max-w-2xl mx-auto">
            <UsersIcon className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Team Information Coming Soon</h3>
            <p className="text-gray-600 dark:text-gray-400">We're building something amazing. Stay tuned!</p>
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
                  {member.bio && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4">{member.bio}</p>
                  )}
                  <div className="flex items-center gap-3">
                    {member.email && (
                      <a href={`mailto:${member.email}`} className="flex items-center justify-center w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/20 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors" title="Email">
                        <Mail className="w-4 h-4" />
                      </a>
                    )}
                    {member.linked_in && (
                      <a href={member.linked_in} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/20 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors" title="LinkedIn">
                        <Linkedin className="w-4 h-4" />
                      </a>
                    )}
                    {member.twitter && (
                      <a href={member.twitter} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/20 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors" title="Twitter/X">
                        <Twitter className="w-4 h-4" />
                      </a>
                    )}
                    {member.github && (
                      <a href={member.github} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/20 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors" title="GitHub">
                        <Github className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="container-custom pb-32">
        <div className="relative overflow-hidden bg-linear-to-br from-emerald-600 via-teal-600 to-cyan-600 rounded-3xl p-12 text-center shadow-2xl">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
          <div className="relative z-10">
            <h2 className="text-4xl font-extrabold text-white mb-4">Want to Join Our Team?</h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              We're always looking for talented individuals who are passionate about building the future.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="/careers" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-emerald-600 font-bold rounded-xl shadow-2xl hover:shadow-white/20 transform hover:-translate-y-1 transition-all duration-300">
                View Open Positions
              </a>
              <a href="/contact" className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-bold rounded-xl border-2 border-white/30 hover:bg-white/20 transition-all duration-300">
                Get in Touch
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
