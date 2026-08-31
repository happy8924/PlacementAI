import React from 'react';

export default function Hero({ onGetStarted }) {
  return (
    <section className="relative pt-32 pb-24 md:pt-40 md:pb-32 bg-primary border-b border-theme overflow-hidden transition-colors duration-300">
      
      {/* Grid Overlay */}
      <div className="absolute inset-0 bg-grid-theme opacity-30 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Split 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Side: Copy & CTAs */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-teal-500/30 bg-teal-500/10 text-teal-600 dark:text-teal-400 font-mono text-[11px] uppercase tracking-wider font-semibold">
              <span className="w-2 h-2 bg-teal-500 rounded-full animate-pulse"></span>
              AI-POWERED CAREER & PLACEMENT PLATFORM
            </div>

            {/* Hero Heading with Selective Gradient on Powered by AI */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-primary tracking-tight leading-[1.1]">
              Your Career.<br/>
              Your Preparation.<br/>
              <span className="text-gradient-brand">Powered by AI.</span>
            </h1>

            <p className="text-base sm:text-lg text-secondary font-normal leading-relaxed">
              Turn your resume, skills and career goals into a personalized path to placement. One intelligent platform engineered for candidate readiness.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <button onClick={onGetStarted} className="px-8 py-4 btn-brand-primary font-bold text-xs uppercase tracking-wider rounded-xl shadow-xl flex items-center justify-center gap-2 group">
                Get Started
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </button>
              <a href="#core-platform" className="px-8 py-4 bg-secondary text-primary font-semibold text-xs uppercase tracking-wider hover:bg-slate-200 dark:hover:bg-slate-800 transition-all border border-theme rounded-xl text-center">
                Explore Platform
              </a>
            </div>

            {/* Hero Product Indicators with Teal & Blue Accents */}
            <div className="pt-8 border-t border-theme grid grid-cols-2 gap-3 text-xs font-mono text-secondary">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                <span>Resume Intelligence</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-teal-500 rounded-full"></span>
                <span>AI Roadmaps</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full"></span>
                <span>Mock Interviews</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                <span>Smart Job Matching</span>
              </div>
            </div>

          </div>

          {/* Right Side: SaaS Dashboard Mockup Visualization */}
          <div className="lg:col-span-7 bg-dashboard-bg border border-theme rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 relative transition-colors duration-300">
            
            {/* Top Window Bar */}
            <div className="flex items-center justify-between pb-4 border-b border-theme text-xs font-mono">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <span className="w-3 h-3 bg-red-400/80 rounded-full inline-block"></span>
                  <span class="w-3 h-3 bg-amber-400/80 rounded-full inline-block"></span>
                  <span className="w-3 h-3 bg-emerald-400/80 rounded-full inline-block"></span>
                </div>
                <span className="text-secondary font-semibold tracking-wider">PLACEMENTAI // WORKSPACE</span>
              </div>
              <span className="text-xs px-2.5 py-1 bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20 rounded-full font-mono font-semibold">LIVE ENGINE</span>
            </div>

            {/* Dashboard Grid Widgets */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Widget 1: Resume Intelligence */}
              <div className="bg-card-bg border border-theme rounded-xl p-4 space-y-3 shadow-sm">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="text-secondary">RESUME INTELLIGENCE</span>
                  <span className="text-blue-600 dark:text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded text-[11px] font-mono font-bold">ATS 86%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2">
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2 rounded-full w-[86%]"></div>
                </div>
                <p className="text-[11px] text-secondary font-mono">✓ 14 Impact Verbs • 3 Skills Missing</p>
              </div>

              {/* Widget 2: Skill Match */}
              <div className="bg-card-bg border border-theme rounded-xl p-4 space-y-3 shadow-sm">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="text-secondary">SKILL MATCH SCORE</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-mono font-bold">82% FIT</span>
                </div>
                <div className="space-y-1.5 text-[11px] font-mono">
                  <div className="flex justify-between text-primary"><span>React & Next.js</span><span className="font-bold text-blue-600 dark:text-blue-400">94%</span></div>
                  <div className="flex justify-between text-secondary"><span>System Architecture</span><span className="font-semibold text-slate-500">68%</span></div>
                </div>
              </div>

              {/* Widget 3: Career Roadmap */}
              <div className="bg-card-bg border border-theme rounded-xl p-4 space-y-2.5 sm:col-span-2 shadow-sm">
                <div className="flex justify-between items-center text-xs font-semibold border-b border-theme pb-2">
                  <span className="text-primary uppercase tracking-wider font-mono">CAREER ROADMAP // FULL STACK SDE</span>
                  <span className="text-xs text-teal-600 dark:text-teal-400 font-mono font-semibold">WEEK 3 OF 6</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[11px]">
                  <div className="p-2 bg-secondary border border-theme rounded text-center">
                    <div className="text-teal-600 dark:text-teal-400 font-bold">● COMPLETE</div>
                    <div className="text-primary text-[10px] truncate">DS & Algo</div>
                  </div>
                  <div className="p-2 bg-secondary border border-theme rounded text-center">
                    <div className="text-teal-600 dark:text-teal-400 font-bold">● COMPLETE</div>
                    <div className="text-primary text-[10px] truncate">Node.js API</div>
                  </div>
                  <div className="p-2 btn-brand-primary font-bold rounded text-center shadow">
                    <div>▶ ACTIVE</div>
                    <div className="text-[10px] truncate">SQL & Cache</div>
                  </div>
                  <div className="p-2 bg-secondary/50 border border-theme rounded text-center text-secondary">
                    <div>○ UPCOMING</div>
                    <div className="text-[10px] truncate">System Design</div>
                  </div>
                </div>
              </div>

              {/* Widget 4: Interview Readiness & Recommended Jobs */}
              <div className="bg-card-bg border border-theme rounded-xl p-4 space-y-2 sm:col-span-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm">
                <div>
                  <div className="text-xs text-secondary font-mono">INTERVIEW READINESS SCORE</div>
                  <div className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 font-mono">84 / 100</div>
                  <div className="text-[11px] text-secondary font-mono">Technical 88% • Communication 80%</div>
                </div>
                <div className="w-full sm:w-auto p-3 bg-secondary border border-theme rounded-lg space-y-1">
                  <div className="text-[10px] text-teal-600 dark:text-teal-400 font-mono font-bold">TOP MATCHED JOB</div>
                  <div className="text-xs font-bold text-primary">Full Stack Engineer @ FinTech</div>
                  <div className="text-[10px] text-secondary font-mono flex items-center justify-between gap-4">
                    <span>96% Candidate Fit</span>
                    <span onClick={onGetStarted} className="text-blue-600 dark:text-blue-400 underline font-bold cursor-pointer">Apply →</span>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
