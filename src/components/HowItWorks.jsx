import React from 'react';

export default function HowItWorks() {
  const steps = [
    { id: '01', title: 'Build Profile', desc: 'Specify targeted roles, key goals, and project links.' },
    { id: '02', title: 'Analyze Resume', desc: 'Scan against professional ATS systems to check impact scoring.' },
    { id: '03', title: 'Identify Gaps', desc: 'Highlight missing libraries, architectures, and design concepts.' },
    { id: '04', title: 'Generate Roadmap', desc: 'Acquire dynamically adapting milestones adjusted to interview dates.' },
    { id: '05', title: 'Practice Interviews', desc: 'Simulate coding and logic queries with responsive conversational feedback.' },
    { id: '06', title: 'Find Matching Jobs', desc: 'Review pre-vetted positions containing high candidate readiness match.' },
    { id: '07', title: 'Track Applications', desc: 'Organize assessment dates and interview slots in one dashboard.' }
  ];

  return (
    <section id="how-it-works" className="py-24 bg-secondary text-primary border-b border-theme transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="font-mono text-xs uppercase tracking-widest text-teal-500 font-semibold block">// Platform Flow</span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-primary tracking-tight">
            How it works.
          </h2>
          <p className="text-base text-secondary font-normal">
            A continuous execution cycle engineered to turn candidate data into placement success.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, idx) => (
            <div 
              key={step.id} 
              className={`p-6 border border-theme rounded-2xl space-y-4 flex flex-col justify-between hover:border-blue-500 transition-all ${
                idx === steps.length - 1 
                  ? 'btn-brand-primary text-white shadow-xl' 
                  : 'bg-card-bg text-primary'
              }`}
            >
              <div className={`text-4xl font-extrabold font-mono ${
                idx === steps.length - 1 ? 'text-white' : 'text-blue-600 dark:text-blue-400'
              }`}>
                {step.id}
              </div>
              <div>
                <h3 className={`font-bold text-lg mb-1 ${
                  idx === steps.length - 1 ? 'text-white' : 'text-primary'
                }`}>
                  {step.title}
                </h3>
                <p className={`text-xs leading-relaxed ${
                  idx === steps.length - 1 ? 'text-white/95' : 'text-secondary'
                }`}>
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
