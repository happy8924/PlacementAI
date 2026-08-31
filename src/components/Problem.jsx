import React from 'react';

export default function Problem() {
  const problems = [
    {
      id: '01',
      title: 'Static Resumes',
      desc: 'Standard ATS templates fail to present dynamic skill mastery, leading to automated recruiter rejections.'
    },
    {
      id: '02',
      title: 'Skill-Gap Blindness',
      desc: 'Candidates prepare blindly without mapping technical capabilities to the specific target role standard.'
    },
    {
      id: '03',
      title: 'Anxious Interviews',
      desc: 'Lack of real-time conversational and logic evaluation leaves candidates unprepared for live assessments.'
    },
    {
      id: '04',
      title: 'Fragmented Searches',
      desc: 'Spamming applications on public boards with no context on match accuracy, causing fatigue and silence.'
    },
    {
      id: '05',
      title: 'Broken Tracking',
      desc: 'Using static spreadsheets and disparate email templates to track progress, causing missed deadlines.'
    }
  ];

  return (
    <section id="problem" className="py-24 bg-secondary text-primary border-b border-theme transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="font-mono text-xs uppercase tracking-widest text-teal-500 font-semibold block">// Structural Disconnect</span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-primary tracking-tight">
            Placement preparation is fragmented.
          </h2>
          <p className="text-base text-secondary font-normal">
            Students currently jump between disconnected tools, creating chaos and uncertainty.
          </p>
        </div>

        {/* Fragmented Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {problems.map((prob) => (
            <div 
              key={prob.id}
              className="p-5 bg-card-bg border border-theme rounded-xl space-y-3 hover:border-blue-500 transition-all shadow-sm flex flex-col justify-between"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-mono text-xs flex items-center justify-center rounded-lg font-bold">
                {prob.id}
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-sm text-primary">{prob.title}</h3>
                <p className="text-xs text-secondary leading-relaxed font-sans">{prob.desc}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
