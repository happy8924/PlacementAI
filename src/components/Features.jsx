import React from 'react';

export default function Features() {
  const coreFeatures = [
    {
      id: '01',
      title: 'Resume Intelligence',
      desc: 'Audit your resume formats against ATS industry criteria. Identify weak action verbs, syntax errors, and missing keywords in seconds.'
    },
    {
      id: '02',
      title: 'Skill Gap Analysis',
      desc: 'Analyze target job specs alongside your profile. Detect critical library gaps and theoretical architecture topics you need to master.'
    },
    {
      id: '03',
      title: 'AI Career Roadmap',
      desc: 'Acquire step-by-step learning pathways. The milestones adjust dynamically to match upcoming recruitment dates and batch exams.'
    },
    {
      id: '04',
      title: 'AI Mock Interview',
      desc: 'Simulate full conversational and technical interview sessions. Receive constructive assessments of logic depth, fluency, and timing.'
    },
    {
      id: '05',
      title: 'Smart Job Matching',
      desc: 'Skip generic boards. Receive matching recommendations that correspond directly to your pre-verified skill vectors and capabilities.'
    },
    {
      id: '06',
      title: 'Application Tracking',
      desc: 'Maintain absolute pipeline clarity. Sync all assessment deadlines, scheduled calls, and offer details inside a unified platform.'
    }
  ];

  return (
    <section id="features" className="py-24 bg-primary text-primary border-b border-theme transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="font-mono text-xs uppercase tracking-widest text-teal-500 font-semibold block">// Core Platform capabilities</span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-primary tracking-tight">
            One platform. Every step of your placement journey.
          </h2>
        </div>

        {/* 6 Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {coreFeatures.map((feat) => (
            <div 
              key={feat.id}
              className="bg-card-bg border border-theme rounded-2xl p-6 shadow-sm hover:shadow-xl hover:border-blue-500/50 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-mono font-bold text-sm flex items-center justify-center rounded-xl mb-4">
                  {feat.id}
                </div>
                <h3 className="text-xl font-bold text-primary mb-2">{feat.title}</h3>
                <p className="text-xs text-secondary leading-relaxed font-sans">
                  {feat.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
