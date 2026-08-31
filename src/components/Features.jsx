import React from 'react';

export default function Features({ onGetStarted }) {
  return (
    <>
      {/* ================= SECTION 2: PLACEMENT PROBLEM ================= */}
      <section className="py-24 bg-secondary text-primary border-b border-theme transition-colors duration-300">
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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
            
            <div className="p-5 bg-card-bg border border-theme rounded-xl text-center space-y-2 hover:border-blue-500 transition-all shadow-sm">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-mono text-xs flex items-center justify-center rounded-lg mx-auto font-bold">01</div>
              <div className="font-bold text-sm text-primary">Resume Tools</div>
              <div className="text-[11px] text-secondary font-mono">Static Docs</div>
            </div>

            <div className="p-5 bg-card-bg border border-theme rounded-xl text-center space-y-2 hover:border-blue-500 transition-all shadow-sm">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-mono text-xs flex items-center justify-center rounded-lg mx-auto font-bold">02</div>
              <div className="font-bold text-sm text-primary">Learning</div>
              <div className="text-[11px] text-secondary font-mono">Unstructured</div>
            </div>

            <div className="p-5 bg-card-bg border border-theme rounded-xl text-center space-y-2 hover:border-blue-500 transition-all shadow-sm">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-mono text-xs flex items-center justify-center rounded-lg mx-auto font-bold">03</div>
              <div className="font-bold text-sm text-primary">Interview Prep</div>
              <div className="text-[11px] text-secondary font-mono">No Feedback</div>
            </div>

            <div className="p-5 bg-card-bg border border-theme rounded-xl text-center space-y-2 hover:border-blue-500 transition-all shadow-sm">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-mono text-xs flex items-center justify-center rounded-lg mx-auto font-bold">04</div>
              <div className="font-bold text-sm text-primary">Job Search</div>
              <div className="text-[11px] text-secondary font-mono">Blind Applies</div>
            </div>

            <div className="p-5 bg-card-bg border border-theme rounded-xl text-center space-y-2 hover:border-blue-500 transition-all shadow-sm">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-mono text-xs flex items-center justify-center rounded-lg mx-auto font-bold">05</div>
              <div className="font-bold text-sm text-primary">Applications</div>
              <div className="text-[11px] text-secondary font-mono">Spreadsheets</div>
            </div>

            <div className="p-5 bg-card-bg border border-theme rounded-xl text-center space-y-2 hover:border-blue-500 transition-all shadow-sm">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-mono text-xs flex items-center justify-center rounded-lg mx-auto font-bold">06</div>
              <div className="font-bold text-sm text-primary">Tracking</div>
              <div className="text-[11px] text-secondary font-mono">Uncertainty</div>
            </div>

          </div>

          {/* Unified PlacementAI Banner */}
          <div className="max-w-4xl mx-auto p-8 bg-primary border border-theme rounded-2xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center md:text-left">
              <div className="font-mono text-xs text-teal-600 dark:text-teal-400 uppercase tracking-widest font-semibold">// THE UNIFIED SOLUTION</div>
              <div className="text-2xl font-extrabold text-primary">One intelligent platform. <span className="text-gradient-brand">PlacementAI.</span></div>
              <p className="text-xs text-secondary">Everything synced into a single real-time candidate career graph.</p>
            </div>
            <button onClick={onGetStarted} className="px-6 py-3 btn-brand-primary font-bold text-xs uppercase tracking-wider rounded-xl whitespace-nowrap">
              Get Started Now →
            </button>
          </div>

        </div>
      </section>

      {/* ================= SECTION 3: CORE PLATFORM ================= */}
      <section id="features" className="py-24 bg-primary text-primary border-b border-theme transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="font-mono text-xs uppercase tracking-widest text-teal-500 font-semibold block">// Platform Capabilities</span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-primary tracking-tight">
              One platform. Every step of your placement journey.
            </h2>
          </div>

          {/* 6 Feature Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* Card 1 */}
            <div className="bg-card-bg border border-theme rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all space-y-6 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-mono font-bold text-sm flex items-center justify-center rounded-xl mb-4">01</div>
                <h3 className="text-xl font-bold text-primary mb-2">Resume Intelligence</h3>
                <p className="text-xs text-secondary leading-relaxed">
                  Analyze your resume to identify strengths, weak action verbs, ATS format issues, and critical skill gaps.
                </p>
              </div>

              <div className="p-4 bg-secondary border border-theme rounded-xl font-mono text-xs space-y-2">
                <div className="flex justify-between font-bold text-primary border-b border-theme pb-1">
                  <span>ATS PARSER SCORE</span>
                  <span className="text-blue-600 dark:text-blue-400">86 / 100</span>
                </div>
                <div className="text-[11px] text-teal-600 dark:text-teal-400 font-semibold">✓ 14 High-Impact Verbs Detected</div>
                <div className="text-[11px] text-slate-500">⚠ Missing: Docker, Microservices</div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-card-bg border border-theme rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all space-y-6 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-mono font-bold text-sm flex items-center justify-center rounded-xl mb-4">02</div>
                <h3 className="text-xl font-bold text-primary mb-2">Skill Gap Analysis</h3>
                <p className="text-xs text-secondary leading-relaxed">
                  Know which technical skills, libraries, and architectural concepts you need for your target job role.
                </p>
              </div>

              <div className="p-4 bg-secondary border border-theme rounded-xl font-mono text-xs space-y-2">
                <div className="text-secondary text-[10px] uppercase font-bold">Required vs Current</div>
                <div className="space-y-1 text-[11px]">
                  <div className="flex justify-between text-primary"><span>React & Redux</span><span className="font-bold text-teal-600 dark:text-teal-400">READY</span></div>
                  <div className="flex justify-between text-secondary"><span>System Design</span><span className="font-semibold text-blue-600 dark:text-blue-400">GAP (-30%)</span></div>
                </div>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-card-bg border border-theme rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all space-y-6 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-mono font-bold text-sm flex items-center justify-center rounded-xl mb-4">03</div>
                <h3 className="text-xl font-bold text-primary mb-2">AI Career Roadmap</h3>
                <p className="text-xs text-secondary leading-relaxed">
                  Get a personalized step-by-step preparation path adapting dynamically to your exam and interview dates.
                </p>
              </div>

              <div className="p-4 bg-secondary border border-theme rounded-xl font-mono text-xs space-y-1.5">
                <div className="text-teal-600 dark:text-teal-400 font-bold">● Week 1: Data Structures</div>
                <div className="text-teal-600 dark:text-teal-400 font-bold">● Week 2: REST APIs</div>
                <div className="text-secondary">○ Week 3: Mock Interview</div>
              </div>
            </div>

            {/* Card 4 */}
            <div className="bg-card-bg border border-theme rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all space-y-6 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-mono font-bold text-sm flex items-center justify-center rounded-xl mb-4">04</div>
                <h3 className="text-xl font-bold text-primary mb-2">AI Mock Interview</h3>
                <p className="text-xs text-secondary leading-relaxed">
                  Practice technical coding and behavioral interview questions with real-time feedback on confidence and accuracy.
                </p>
              </div>

              <div className="p-4 bg-secondary border border-theme rounded-xl font-mono text-xs space-y-2">
                <div className="text-secondary text-[10px] font-bold">AI INTERVIEW FEEDBACK</div>
                <div className="text-[11px] font-bold text-blue-600 dark:text-blue-400">Accuracy: 88% • Confidence: High</div>
              </div>
            </div>

            {/* Card 5 */}
            <div className="bg-card-bg border border-theme rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all space-y-6 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-mono font-bold text-sm flex items-center justify-center rounded-xl mb-4">05</div>
                <h3 className="text-xl font-bold text-primary mb-2">Smart Job Matching</h3>
                <p className="text-xs text-secondary leading-relaxed">
                  Discover verified opportunities that fit your verified skill readiness instead of blind applying.
                </p>
              </div>

              <div className="p-4 bg-secondary border border-theme rounded-xl font-mono text-xs space-y-1">
                <div className="font-bold text-primary">Frontend Architect</div>
                <div className="text-[11px] text-teal-600 dark:text-teal-400 font-semibold">Match Percentage: 94.2%</div>
              </div>
            </div>

            {/* Card 6 */}
            <div className="bg-card-bg border border-theme rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all space-y-6 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-mono font-bold text-sm flex items-center justify-center rounded-xl mb-4">06</div>
                <h3 className="text-xl font-bold text-primary mb-2">Placement Tracking</h3>
                <p className="text-xs text-secondary leading-relaxed">
                  Track active job applications, online assessments, interview schedules, and offer letters in one place.
                </p>
              </div>

              <div className="p-4 bg-secondary border border-theme rounded-xl font-mono text-xs flex justify-between items-center">
                <span className="text-secondary text-[11px]">PIPELINE STATUS</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">1 OFFER SECURED</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ================= SECTION 5: RESUME INTELLIGENCE ================= */}
      <section className="py-24 bg-primary text-primary border-b border-theme transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-5 space-y-6">
              <span className="font-mono text-xs uppercase tracking-widest text-teal-500 font-semibold block">// Feature Showcase 01</span>
              <h2 className="text-3xl sm:text-5xl font-extrabold text-primary tracking-tight leading-tight">
                Your resume becomes <span className="text-gradient-brand">career intelligence.</span>
              </h2>
              <p className="text-base text-secondary font-normal leading-relaxed">
                PlacementAI analyzes your resume to identify skills, gaps, ATS readiness, and action verb improvement opportunities.
              </p>

              <div className="space-y-3 font-mono text-xs pt-4">
                <div className="p-3 bg-secondary border border-theme rounded-lg flex items-center gap-3">
                  <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                  <span>Automated ATS Syntax & Format Audit</span>
                </div>
                <div className="p-3 bg-secondary border border-theme rounded-lg flex items-center gap-3">
                  <span className="w-2 h-2 bg-teal-500 rounded-full"></span>
                  <span>Skill Extraction & Missing Keyword Highlights</span>
                </div>
                <div className="p-3 bg-secondary border border-theme rounded-lg flex items-center gap-3">
                  <span className="w-2 h-2 bg-indigo-600 rounded-full"></span>
                  <span>1-Click Bullet Point Optimization</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 bg-secondary border border-theme rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
              
              <div className="flex items-center justify-between pb-4 border-b border-theme">
                <div>
                  <div className="text-xs font-mono text-secondary">TARGET DOCUMENT: Resume_SoftwareEngineer.pdf</div>
                  <div className="text-lg font-bold text-primary font-sans">ATS Readiness Score</div>
                </div>
                <div className="px-4 py-2 bg-blue-600 text-white font-mono text-xl font-bold rounded-xl shadow">
                  86 / 100
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
                <div className="p-4 bg-card-bg border border-theme rounded-xl space-y-2">
                  <div className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase">SKILLS DETECTED</div>
                  <div className="flex flex-wrap gap-1.5 text-[11px]">
                    <span className="px-2 py-1 bg-secondary text-primary rounded border border-theme font-semibold">React</span>
                    <span className="px-2 py-1 bg-secondary text-primary rounded border border-theme font-semibold">Node.js</span>
                    <span className="px-2 py-1 bg-secondary text-primary rounded border border-theme font-semibold">MongoDB</span>
                    <span className="px-2 py-1 bg-secondary text-primary rounded border border-theme font-semibold">SQL</span>
                  </div>
                </div>

                <div className="p-4 bg-card-bg border border-theme rounded-xl space-y-2">
                  <div className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase">MISSING SKILLS</div>
                  <div className="flex flex-wrap gap-1.5 text-[11px]">
                    <span className="px-2 py-1 bg-secondary text-secondary rounded border border-theme font-semibold">System Design</span>
                    <span className="px-2 py-1 bg-secondary text-secondary rounded border border-theme font-semibold">Testing (Jest)</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-card-bg border border-theme rounded-xl font-mono text-xs space-y-2">
                <div className="font-bold text-primary text-xs uppercase">AI RECOMMENDATIONS</div>
                <ul className="space-y-1 text-[11px] text-secondary list-disc list-inside">
                  <li>Improve project descriptions with quantifiable metrics (e.g. reduced latency by 25%).</li>
                  <li>Add measurable achievements in experience section.</li>
                </ul>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ================= SECTION 6: CAREER ROADMAP ================= */}
      <section className="py-24 bg-secondary text-primary border-b border-theme transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="font-mono text-xs uppercase tracking-widest text-teal-500 font-semibold block">// Feature Showcase 02</span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-primary tracking-tight">
              Know what to learn next.
            </h2>
            <p className="text-base text-secondary font-normal">
              A dynamic roadmap progressing from your current profile to full placement readiness.
            </p>
          </div>

          <div className="max-w-4xl mx-auto bg-card-bg border border-theme rounded-2xl p-6 sm:p-10 shadow-2xl space-y-6">
            
            <div className="flex justify-between items-center pb-4 border-b border-theme text-xs font-mono">
              <span className="text-secondary uppercase">TARGET PATHWAY: FULL STACK DEVELOPMENT</span>
              <span className="text-teal-600 dark:text-teal-400 bg-teal-500/10 px-3 py-1 rounded-full border border-teal-500/20 font-bold">ACTIVE PROGRESSION</span>
            </div>

            <div className="space-y-4 font-mono text-xs">
              
              <div className="p-4 bg-secondary border-l-4 border-teal-500 rounded-r-xl space-y-1 flex justify-between items-center">
                <div>
                  <div className="text-primary font-bold text-sm">01. CURRENT PROFILE AUDIT</div>
                  <div className="text-secondary text-[11px] font-sans">Verified skills: HTML, CSS, JavaScript basics.</div>
                </div>
                <span className="px-2.5 py-1 bg-teal-500/20 text-teal-600 dark:text-teal-400 font-bold text-[10px] rounded">COMPLETED</span>
              </div>

              <div className="p-4 bg-secondary border-l-4 border-teal-500 rounded-r-xl space-y-1 flex justify-between items-center">
                <div>
                  <div className="text-primary font-bold text-sm">02. SKILL GAP RESOLUTION</div>
                  <div className="text-secondary text-[11px] font-sans">Targeting missing concepts: React, State Management, Node APIs.</div>
                </div>
                <span className="px-2.5 py-1 bg-teal-500/20 text-teal-600 dark:text-teal-400 font-bold text-[10px] rounded">COMPLETED</span>
              </div>

              <div className="p-4 btn-brand-primary border-l-4 border-blue-400 rounded-r-xl space-y-1 flex justify-between items-center shadow-lg">
                <div>
                  <div className="font-extrabold text-sm text-white">03. ACTIVE LEARNING & PROJECTS</div>
                  <div className="opacity-90 text-[11px] font-sans text-white/90">Building microservices e-commerce API & Next.js dashboard.</div>
                </div>
                <span className="px-2.5 py-1 bg-white/20 text-white font-bold text-[10px] rounded">IN PROGRESS</span>
              </div>

              <div className="p-4 bg-secondary border-l-4 border-theme rounded-r-xl space-y-1 flex justify-between items-center opacity-70">
                <div>
                  <div className="text-primary font-bold text-sm">04. AI MOCK INTERVIEW DRILLS</div>
                  <div className="text-secondary text-[11px] font-sans">Simulating 4 rounds of technical coding & system design.</div>
                </div>
                <span className="text-secondary text-[10px]">UPCOMING</span>
              </div>

              <div className="p-4 bg-secondary border-l-4 border-theme rounded-r-xl space-y-1 flex justify-between items-center opacity-50">
                <div>
                  <div className="text-secondary font-bold text-sm">05. PLACEMENT READY</div>
                  <div className="text-secondary text-[11px] font-sans">95%+ Match Score unlocked for top tier hiring drives.</div>
                </div>
                <span className="text-secondary text-[10px]">LOCKED</span>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ================= SECTION 7: AI MOCK INTERVIEW ================= */}
      <section className="py-24 bg-primary text-primary border-b border-theme transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-5 space-y-6">
              <span className="font-mono text-xs uppercase tracking-widest text-teal-500 font-semibold block">// Feature Showcase 03</span>
              <h2 className="text-3xl sm:text-5xl font-extrabold text-primary tracking-tight leading-tight">
                Practice before the real interview.
              </h2>
              <p className="text-base text-secondary font-normal leading-relaxed">
                Execute real-time mock interviews with an AI interviewer evaluating your technical accuracy, communication fluency, and readiness.
              </p>

              <div className="grid grid-cols-2 gap-3 font-mono text-xs pt-4">
                <div className="p-3 bg-secondary border border-theme rounded-xl text-center">
                  <div className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">92%</div>
                  <div className="text-[10px] text-secondary uppercase mt-1">Technical Accuracy</div>
                </div>
                <div className="p-3 bg-secondary border border-theme rounded-xl text-center">
                  <div className="text-2xl font-extrabold text-teal-600 dark:text-teal-400">88%</div>
                  <div className="text-[10px] text-secondary uppercase mt-1">Communication</div>
                </div>
                <div className="p-3 bg-secondary border border-theme rounded-xl text-center">
                  <div className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">85%</div>
                  <div className="text-[10px] text-secondary uppercase mt-1">Confidence</div>
                </div>
                <div className="p-3 bg-secondary border border-theme rounded-xl text-center">
                  <div className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">89%</div>
                  <div className="text-[10px] text-secondary uppercase mt-1">Overall Readiness</div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 bg-card-bg text-primary border border-theme rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
              
              <div className="flex items-center justify-between pb-4 border-b border-theme text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-teal-500 rounded-full animate-pulse"></span>
                  <span className="text-teal-600 dark:text-teal-400 font-bold">AI MOCK INTERVIEW // SESSION #04</span>
                </div>
                <span className="text-secondary font-semibold">ROLE: FULL STACK</span>
              </div>

              <div className="space-y-4 text-xs font-mono">
                
                <div className="p-4 bg-secondary border border-theme rounded-xl space-y-1">
                  <div className="text-secondary text-[10px] font-bold uppercase">AI INTERVIEWER</div>
                  <p className="text-primary font-sans text-sm">"How do you handle indexing in PostgreSQL to optimize slow JOIN queries?"</p>
                </div>

                <div className="p-4 bg-primary text-primary border border-theme rounded-xl space-y-1 ml-4 sm:ml-8 shadow">
                  <div className="text-secondary text-[10px] font-bold uppercase">STUDENT ANSWER</div>
                  <p className="text-primary font-sans text-sm">"I create B-Tree indexes on foreign key columns and analyze execution plans using EXPLAIN ANALYZE..."</p>
                </div>

                <div className="p-4 bg-secondary border border-theme rounded-xl space-y-1">
                  <div className="text-teal-600 dark:text-teal-400 text-[10px] font-bold uppercase">AI FOLLOW-UP & FEEDBACK</div>
                  <p className="text-secondary font-sans text-xs">"Great answer! You correctly identified B-Tree indexes. Consider mentioning composite indexes for multi-column conditions."</p>
                </div>

              </div>

            </div>

          </div>

        </div>
      </section>
    </>
  );
}
