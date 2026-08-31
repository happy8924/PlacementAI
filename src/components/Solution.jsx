import React from 'react';

export default function Solution({ onGetStarted }) {
  const steps = [
    { label: 'Profile', desc: 'Connect profile details' },
    { label: 'Resume', desc: 'Scan and optimize formatting' },
    { label: 'Skills', desc: 'Identify vector capabilities' },
    { label: 'Roadmap', desc: 'Generate customized progression' },
    { label: 'Interview', desc: 'Simulate technical drills' },
    { label: 'Jobs', desc: 'Match verified role fits' },
    { label: 'Applications', desc: 'Track lifecycle stats' }
  ];

  return (
    <section id="solution" className="py-24 bg-primary text-primary border-b border-theme transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="font-mono text-xs uppercase tracking-widest text-teal-500 font-semibold block">// Unified Architecture</span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-primary tracking-tight">
            One intelligent placement ecosystem.
          </h2>
          <p className="text-base text-secondary font-normal">
            Everything synced into a single real-time candidate career intelligence database.
          </p>
        </div>

        {/* Workflow Diagram */}
        <div className="max-w-5xl mx-auto p-8 bg-secondary border border-theme rounded-2xl shadow-xl space-y-8">
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-theme pb-6">
            <div className="space-y-1 text-center md:text-left">
              <div className="font-mono text-xs text-teal-600 dark:text-teal-400 uppercase tracking-widest font-semibold">// THE PLATFORM PIPELINE</div>
              <div className="text-xl font-bold text-primary">Interconnected candidate data flow</div>
            </div>
            <button onClick={onGetStarted} className="px-6 py-3 btn-brand-primary font-bold text-xs uppercase tracking-wider rounded-xl whitespace-nowrap">
              Initialize Account →
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4 text-center font-mono text-xs">
            {steps.map((step, idx) => (
              <div key={idx} className="p-4 bg-card-bg border border-theme rounded-xl space-y-2 flex flex-col justify-between items-center group hover:border-blue-500 transition-all">
                <div className="w-6 h-6 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-blue-400 text-[10px] font-bold">
                  {idx + 1}
                </div>
                <div className="space-y-0.5">
                  <div className="font-bold text-primary truncate">{step.label}</div>
                  <div className="text-[9px] text-secondary leading-tight">{step.desc}</div>
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
}
