import React from 'react';

export default function StudentDashboard() {
  const recommendedJobs = [
    { title: 'Full Stack Engineer', company: 'FinTech Corp', match: '96%', location: 'Hybrid' },
    { title: 'Frontend Developer', company: 'AI Solutions', match: '92%', location: 'Remote' },
    { title: 'Software Engineer SDE-1', company: 'DataStream', match: '88%', location: 'Onsite' }
  ];

  const applications = [
    { company: 'Google', status: 'Interview Scheduled', date: 'Sept 5', color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' },
    { company: 'Stripe', status: 'Offer Received', date: 'Immediate', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' },
    { company: 'Vercel', status: 'Resume Screened', date: 'Aug 28', color: 'text-blue-500 bg-blue-500/10 border-blue-500/20' }
  ];

  return (
    <section id="student-dashboard" className="py-24 bg-secondary text-primary border-b border-theme transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="font-mono text-xs uppercase tracking-widest text-teal-500 font-semibold block">// Candidate Workspace Preview</span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-primary tracking-tight">
            Comprehensive student workspace.
          </h2>
          <p className="text-base text-secondary font-normal">
            Track metrics and readiness indicators across the entire preparation lifecycle.
          </p>
        </div>

        {/* Dashboard Frame */}
        <div className="max-w-6xl mx-auto bg-primary border border-theme rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
          
          {/* Header Metric Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pb-6 border-b border-theme">
            
            <div className="bg-card-bg border border-theme p-4 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-mono text-secondary font-bold block">Placement Readiness</span>
                <span className="text-2xl font-extrabold text-primary font-mono">88%</span>
              </div>
              <div className="w-12 h-12 rounded-full border-4 border-teal-500/20 border-t-teal-500 flex items-center justify-center font-bold font-mono text-xs text-teal-500">
                88
              </div>
            </div>

            <div className="bg-card-bg border border-theme p-4 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-mono text-secondary font-bold block">Resume ATS Score</span>
                <span className="text-2xl font-extrabold text-primary font-mono">91/100</span>
              </div>
              <div className="px-2 py-1 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded font-mono font-bold text-[10px]">
                A Grade
              </div>
            </div>

            <div className="bg-card-bg border border-theme p-4 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-mono text-secondary font-bold block">Roadmap Progress</span>
                <span className="text-2xl font-extrabold text-primary font-mono">Week 4/6</span>
              </div>
              <div className="w-16 bg-slate-200 dark:bg-slate-800 rounded-full h-1.5">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 h-1.5 rounded-full w-[66%]"></div>
              </div>
            </div>

            <div className="bg-card-bg border border-theme p-4 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-mono text-secondary font-bold block">Interview Rating</span>
                <span className="text-2xl font-extrabold text-primary font-mono">Excellent</span>
              </div>
              <span className="text-xs text-teal-500 font-mono font-bold">★ 4.8 / 5.0</span>
            </div>

          </div>

          {/* Sub Grid splits */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Column 1: Skills & Gaps */}
            <div className="bg-card-bg border border-theme p-6 rounded-xl space-y-4 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-xs uppercase font-mono tracking-wider text-primary pb-2 border-b border-theme">Skills Profile & Gaps</h3>
                <div className="space-y-3 font-mono text-xs pt-3">
                  <div className="space-y-1">
                    <div className="flex justify-between text-secondary"><span>React & Redux</span><span className="text-teal-500 font-bold">96%</span></div>
                    <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1">
                      <div className="bg-teal-500 h-1 rounded-full w-[96%]"></div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-secondary"><span>Data Structures</span><span className="text-teal-500 font-bold">90%</span></div>
                    <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1">
                      <div className="bg-teal-500 h-1 rounded-full w-[90%]"></div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-secondary"><span>System Architecture</span><span className="text-blue-500 font-bold">64%</span></div>
                    <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1">
                      <div className="bg-blue-600 h-1 rounded-full w-[64%]"></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="pt-3 border-t border-theme text-[10px] font-mono text-secondary">
                ⚠ GAP HIGHLIGHTED: System Design needs additional mock practice.
              </div>
            </div>

            {/* Column 2: Recommended Jobs */}
            <div className="bg-card-bg border border-theme p-6 rounded-xl space-y-4 shadow-sm">
              <h3 className="font-bold text-xs uppercase font-mono tracking-wider text-primary pb-2 border-b border-theme">Recommended Job Matches</h3>
              <div className="space-y-3 pt-2">
                {recommendedJobs.map((job, idx) => (
                  <div key={idx} className="p-3 bg-secondary border border-theme rounded-lg flex items-center justify-between text-xs font-mono">
                    <div>
                      <div className="font-bold text-primary">{job.title}</div>
                      <div className="text-[10px] text-secondary">{job.company} • {job.location}</div>
                    </div>
                    <span className="px-2 py-0.5 bg-teal-500/10 border border-teal-500/20 text-teal-600 dark:text-teal-400 font-bold text-[10px] rounded">
                      {job.match} Match
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Column 3: Application Status */}
            <div className="bg-card-bg border border-theme p-6 rounded-xl space-y-4 shadow-sm">
              <h3 className="font-bold text-xs uppercase font-mono tracking-wider text-primary pb-2 border-b border-theme">Application Pipeline</h3>
              <div className="space-y-3 pt-2">
                {applications.map((app, idx) => (
                  <div key={idx} className="p-3 bg-secondary border border-theme rounded-lg flex items-center justify-between text-xs font-mono">
                    <div>
                      <div className="font-bold text-primary">{app.company}</div>
                      <div className="text-[10px] text-secondary">Deadline: {app.date}</div>
                    </div>
                    <span className={`px-2 py-0.5 border rounded font-bold text-[10px] ${app.color}`}>
                      {app.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
