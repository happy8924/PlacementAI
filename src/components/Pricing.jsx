import React from 'react';

export default function Pricing({ onGetStarted }) {
  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      desc: 'Essential analytics tools to audit and organize your job preparation.',
      features: [
        '1 Resume ATS Audit Scan',
        'Basic Skill Gap Identification',
        'Static Week-1 Career Roadmap',
        'Standard Application Tracking'
      ],
      isProminent: false,
      btnLabel: 'Get Started'
    },
    {
      name: 'Student Premium',
      price: '$15',
      period: 'per month',
      desc: 'Complete career intelligence to unlock unlimited roadmaps and AI mock interviews.',
      features: [
        'Unlimited Resume ATS Audit Scans',
        'Full Skill Gap & Keyword Insights',
        'Dynamic Adapting Career Roadmaps',
        'Unlimited Conversational AI Mock Drills',
        '95%+ Readiness Smart Job Matching',
        'Priority Recruiter Search Pipeline'
      ],
      isProminent: true,
      btnLabel: 'Unlock Premium'
    },
    {
      name: 'College / Institution',
      price: 'Custom',
      period: 'annually',
      desc: 'Batch-wide monitoring and placement analytics for training offices.',
      features: [
        'Everything in Student Premium',
        'TPO Student Monitoring Workspace',
        'Batch Skill Gap Diagnostics & Analytics',
        'Automated Campus Drive Approvals',
        'Recruiter Match Vectors Integration',
        'Dedicated Support & Analytics Export'
      ],
      isProminent: false,
      btnLabel: 'Contact Institution Support'
    }
  ];

  return (
    <section id="pricing" className="py-24 bg-secondary text-primary border-b border-theme transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="font-mono text-xs uppercase tracking-widest text-teal-500 font-semibold block">// Predictable Pricing</span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-primary tracking-tight">
            Plans for students and institutions.
          </h2>
          <p className="text-base text-secondary font-normal">
            Select the plan that fits your career preparation scale. No hidden fees.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto">
          {plans.map((plan, idx) => (
            <div 
              key={idx}
              className={`p-8 border rounded-2xl flex flex-col justify-between space-y-6 relative transition-all shadow-sm ${
                plan.isProminent 
                  ? 'bg-primary border-blue-500 shadow-2xl lg:scale-105 z-10' 
                  : 'bg-card-bg border-theme'
              }`}
            >
              {plan.isProminent && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-blue-600 text-white font-mono text-[9px] uppercase font-bold rounded-full tracking-wider">
                  MOST POPULAR PLAN
                </span>
              )}

              <div className="space-y-4">
                <div>
                  <h3 className="font-mono text-xs uppercase tracking-widest text-teal-500 font-bold">{plan.name}</h3>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-primary font-mono">{plan.price}</span>
                    <span className="text-xs text-secondary font-mono">/ {plan.period}</span>
                  </div>
                </div>
                
                <p className="text-xs text-secondary leading-relaxed font-sans">{plan.desc}</p>
                
                <ul className="space-y-2 text-xs font-mono border-t border-theme pt-4">
                  {plan.features.map((feat, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-2">
                      <span className="text-teal-500 font-bold shrink-0">✓</span>
                      <span className="text-secondary">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button 
                onClick={onGetStarted}
                className={`w-full py-3.5 font-bold font-mono text-xs uppercase tracking-wider rounded-xl transition-all ${
                  plan.isProminent
                    ? 'btn-brand-primary text-white shadow-lg'
                    : 'bg-secondary text-primary border border-theme hover:bg-slate-200 dark:hover:bg-slate-800'
                }`}
              >
                {plan.btnLabel}
              </button>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
