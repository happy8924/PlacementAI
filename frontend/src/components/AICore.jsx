import React from 'react';

export default function AICore() {
  return (
    <section id="ai-core" className="py-28 bg-secondary text-primary border-b border-theme relative overflow-hidden transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-3">
          <span className="font-mono text-xs uppercase tracking-widest text-teal-500 font-semibold block">// Connected Intelligence</span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-primary tracking-tight">
            AI that understands your career journey.
          </h2>
          <p className="text-base text-secondary font-normal">
            One continuous reasoning loop connecting candidate input to verified hire placement.
          </p>
        </div>

        {/* Central Connected AI Diagram */}
        <div className="max-w-4xl mx-auto bg-card-bg border border-theme rounded-2xl p-8 sm:p-12 shadow-2xl relative">
          
          <div className="flex justify-center mb-10">
            <div className="px-5 py-2 btn-brand-primary font-mono text-xs font-bold rounded-lg uppercase tracking-wider shadow">
              PLACEMENTAI REASONING HUB
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-center font-mono text-xs">
            
            <div className="p-3 bg-secondary border border-theme rounded-lg space-y-1">
              <div className="text-[10px] text-secondary font-bold">STEP 01</div>
              <div className="font-bold text-primary">Resume</div>
            </div>

            <div className="p-3 bg-secondary border border-theme rounded-lg space-y-1">
              <div className="text-[10px] text-secondary font-bold">STEP 02</div>
              <div className="font-bold text-primary">Skills</div>
            </div>

            <div className="p-3 bg-secondary border border-theme rounded-lg space-y-1">
              <div className="text-[10px] text-secondary font-bold">STEP 03</div>
              <div className="font-bold text-primary">Career Goal</div>
            </div>

            <div className="p-3 bg-secondary border border-theme rounded-lg space-y-1">
              <div className="text-[10px] text-secondary font-bold">STEP 04</div>
              <div className="font-bold text-primary">Skill Gap</div>
            </div>

            <div className="p-3 bg-secondary border border-theme rounded-lg space-y-1">
              <div className="text-[10px] text-secondary font-bold">STEP 05</div>
              <div className="font-bold text-primary">Roadmap</div>
            </div>

            <div className="p-3 bg-secondary border border-theme rounded-lg space-y-1">
              <div className="text-[10px] text-secondary font-bold">STEP 06</div>
              <div className="font-bold text-primary">Interview</div>
            </div>

            <div className="p-3 bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/30 rounded-lg space-y-1 font-bold col-span-2 sm:col-span-1">
              <div className="text-[10px] opacity-80">GOAL</div>
              <div>Opportunity</div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
