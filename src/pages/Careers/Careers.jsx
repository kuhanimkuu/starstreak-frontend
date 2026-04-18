import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase/client';
import { Briefcase, MapPin, Clock, DollarSign, Building2, ChevronRight, Users, Rocket } from 'lucide-react';

export default function Careers() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [expandedJob, setExpandedJob] = useState(null);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('careers')
        .select('*')
        .eq('active', true)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setJobs(data ?? []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const departments = ['all', ...new Set(jobs.map(job => job.department).filter(Boolean))];
  const filteredJobs = selectedDepartment === 'all' ? jobs : jobs.filter(job => job.department === selectedDepartment);
  const toggleJob = (jobId) => setExpandedJob(expandedJob === jobId ? null : jobId);

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
            <Rocket className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
            <span className="text-sm font-medium text-gray-800 dark:text-white">Join Our Team</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-white mb-6">
            Build the Future
            <span className="block mt-2 text-transparent bg-clip-text bg-linear-to-r from-emerald-500 via-teal-500 to-cyan-500 dark:from-emerald-400 dark:via-teal-400 dark:to-cyan-400 animate-gradient">
              With Starstreak
            </span>
          </h1>
          <p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed mb-8">
            Join a team of talented individuals building the next generation of digital platforms.
          </p>
          <div className="flex flex-wrap justify-center gap-8 mt-12">
            {[
              { icon: Users, label: 'Growing Team', value: '50+' },
              { icon: Building2, label: 'Global Offices', value: '5+' },
              { icon: Briefcase, label: 'Open Positions', value: jobs.length },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="flex items-center justify-center w-12 h-12 mx-auto mb-2 rounded-full bg-emerald-100 dark:bg-emerald-900/20">
                  <stat.icon className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {departments.length > 1 && (
        <div className="container-custom pb-12">
          <div className="flex flex-wrap justify-center gap-3">
            {departments.map((department) => (
              <button
                key={department}
                onClick={() => setSelectedDepartment(department)}
                className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${
                  selectedDepartment === department
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30'
                    : 'bg-white/70 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-white/10'
                }`}
              >
                {department === 'all' ? 'All Departments' : department}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="container-custom pb-32">
        <div className="max-w-5xl mx-auto">
          {filteredJobs.length === 0 ? (
            <div className="text-center py-20 bg-white/80 dark:bg-white/5 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-white/10">
              <Briefcase className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No Open Positions</h3>
              <p className="text-gray-600 dark:text-gray-400">We don't have any openings at the moment, but check back soon!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredJobs.map((job) => (
                <div key={job.id} className="bg-white/80 dark:bg-white/5 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-white/10 hover:border-emerald-300 dark:hover:border-white/20 transition-all duration-300 overflow-hidden">
                  <button
                    onClick={() => toggleJob(job.id)}
                    className="w-full p-6 text-left hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{job.title}</h3>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center gap-1"><Building2 className="w-4 h-4" /><span>{job.department}</span></div>
                          <div className="flex items-center gap-1"><MapPin className="w-4 h-4" /><span>{job.location}</span></div>
                          <div className="flex items-center gap-1"><Clock className="w-4 h-4" /><span>{job.type}</span></div>
                          {job.salary && <div className="flex items-center gap-1"><DollarSign className="w-4 h-4" /><span>{job.salary}</span></div>}
                        </div>
                      </div>
                      <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${expandedJob === job.id ? 'rotate-90' : ''}`} />
                    </div>
                  </button>

                  {expandedJob === job.id && (
                    <div className="px-6 pb-6 space-y-6 border-t border-gray-200 dark:border-gray-800 pt-6">
                      {job.description && (
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">About the Role</h4>
                          <div className="prose prose-sm dark:prose-invert max-w-none prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-ul:text-gray-700 dark:prose-ul:text-gray-300" dangerouslySetInnerHTML={{ __html: job.description }} />
                        </div>
                      )}
                      {job.responsibilities && (
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Responsibilities</h4>
                          <div className="prose prose-sm dark:prose-invert max-w-none prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-ul:text-gray-700 dark:prose-ul:text-gray-300" dangerouslySetInnerHTML={{ __html: job.responsibilities }} />
                        </div>
                      )}
                      {job.requirements && (
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Requirements</h4>
                          <div className="prose prose-sm dark:prose-invert max-w-none prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-ul:text-gray-700 dark:prose-ul:text-gray-300" dangerouslySetInnerHTML={{ __html: job.requirements }} />
                        </div>
                      )}
                      {job.benefits && (
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Benefits</h4>
                          <div className="prose prose-sm dark:prose-invert max-w-none prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-ul:text-gray-700 dark:prose-ul:text-gray-300" dangerouslySetInnerHTML={{ __html: job.benefits }} />
                        </div>
                      )}
                      <div className="pt-4">
                        <a
                          href={`mailto:careers@starstreak.org?subject=Application for ${job.title}`}
                          className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium shadow-lg hover:shadow-emerald-500/30"
                        >
                          <Briefcase className="w-5 h-5" />
                          Apply for this Position
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <section className="container-custom pb-32">
        <div className="relative overflow-hidden bg-linear-to-br from-emerald-600 via-teal-600 to-cyan-600 rounded-3xl p-12 text-center shadow-2xl">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
          <div className="relative z-10">
            <h2 className="text-4xl font-extrabold text-white mb-4">Don't See a Perfect Match?</h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              We're always looking for exceptional talent. Send us your resume and tell us why you'd be a great fit.
            </p>
            <a
              href="mailto:careers@starstreak.org?subject=General Application"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-emerald-600 font-bold rounded-xl shadow-2xl hover:shadow-white/20 transform hover:-translate-y-1 transition-all duration-300"
            >
              Send General Application
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
