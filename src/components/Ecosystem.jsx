import React from 'react';

export default function Ecosystem() {
  return (
    <>
      {/* ================= SECTION 8: USER ECOSYSTEM ================= */}
      <section id="ecosystem" className="py-24 bg-secondary text-primary border-b border-theme transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="font-mono text-xs uppercase tracking-widest text-teal-500 font-semibold block">// Unified Platform Roles</span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-primary tracking-tight">
              Built for the entire placement ecosystem.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="bg-card-bg border border-theme rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all space-y-4 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-mono font-bold text-sm flex items-center justify-center rounded-xl mb-4">01</div>
                <h3 className="text-xl font-bold text-primary mb-2">Students</h3>
                <p className="text-xs text-secondary leading-relaxed">
                  Prepare, practice mock interviews, fix skill gaps, and discover verified high-fit placement opportunities.
                </p>
              </div>

              <div className="p-3 bg-secondary border border-theme rounded-xl font-mono text-[11px] text-secondary">
                ✓ Personal Readiness Index<br/>
                ✓ AI Resume Optimizer
              </div>
            </div>

            <div className="bg-card-bg border border-theme rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all space-y-4 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-mono font-bold text-sm flex items-center justify-center rounded-xl mb-4">02</div>
                <h3 className="text-xl font-bold text-primary mb-2">Recruiters</h3>
                <p className="text-xs text-secondary leading-relaxed">
                  Post roles, evaluate pre-verified candidate skill scores, and streamline shortlisting without manual filtering.
                </p>
              </div>

              <div className="p-3 bg-secondary border border-theme rounded-xl font-mono text-[11px] text-secondary">
                ✓ Candidate Match Vector<br/>
                ✓ 1-Click Shortlisting
              </div>
            </div>

            <div className="bg-card-bg border border-theme rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all space-y-4 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-mono font-bold text-sm flex items-center justify-center rounded-xl mb-4">03</div>
                <h3 className="text-xl font-bold text-primary mb-2">Placement Officers</h3>
                <p className="text-xs text-secondary leading-relaxed">
                  Manage student cohorts, campus recruitment drives, company approvals, and batch analytics.
                </p>
              </div>

              <div className="p-3 bg-secondary border border-theme rounded-xl font-mono text-[11px] text-secondary">
                ✓ Cohort Readiness Matrix<br/>
                ✓ Drive Approvals
              </div>
            </div>

            <div className="bg-card-bg border border-theme rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all space-y-4 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-mono font-bold text-sm flex items-center justify-center rounded-xl mb-4">04</div>
                <h3 className="text-xl font-bold text-primary mb-2">Administrators</h3>
                <p className="text-xs text-secondary leading-relaxed">
                  Monitor system health, AI reasoning engines, user permissions, and institutional reporting.
                </p>
              </div>

              <div className="p-3 bg-secondary border border-theme rounded-xl font-mono text-[11px] text-secondary">
                ✓ Global Telemetry<br/>
                ✓ System Governance
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ================= SECTION 10: PRODUCT ECOSYSTEM CONNECTIVITY ================= */}
      <section className="py-24 bg-secondary text-primary border-b border-theme transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="font-mono text-xs uppercase tracking-widest text-teal-500 font-semibold block">// Interconnected Data Flow</span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-primary tracking-tight">
              One connected PlacementAI ecosystem.
            </h2>
          </div>

          <div className="max-w-5xl mx-auto space-y-4 font-mono text-xs">
            
            <div className="p-5 bg-card-bg border border-theme rounded-xl shadow-sm space-y-2">
              <div className="font-bold text-primary text-xs uppercase flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                STUDENT FLOW
              </div>
              <div className="flex flex-wrap items-center gap-2 text-[11px] text-secondary">
                <span className="px-2.5 py-1 bg-secondary rounded border border-theme">Resume</span> →
                <span className="px-2.5 py-1 bg-secondary rounded border border-theme">Skills Audit</span> →
                <span className="px-2.5 py-1 bg-secondary rounded border border-theme">Roadmap</span> →
                <span className="px-2.5 py-1 bg-secondary rounded border border-theme">Mock Interview</span> →
                <span className="px-2.5 py-1 bg-secondary rounded border border-theme">Job Match</span> →
                <span className="px-2.5 py-1 btn-brand-primary text-white font-bold rounded">Selection</span>
              </div>
            </div>

            <div className="p-5 bg-card-bg border border-theme rounded-xl shadow-sm space-y-2">
              <div className="font-bold text-primary text-xs uppercase flex items-center gap-2">
                <span className="w-2 h-2 bg-teal-500 rounded-full"></span>
                RECRUITER FLOW
              </div>
              <div className="flex flex-wrap items-center gap-2 text-[11px] text-secondary">
                <span className="px-2.5 py-1 bg-secondary rounded border border-theme">Job Posting</span> →
                <span className="px-2.5 py-1 bg-secondary rounded border border-theme">Candidate Pool</span> →
                <span className="px-2.5 py-1 bg-secondary rounded border border-theme">Vector Matching</span> →
                <span className="px-2.5 py-1 bg-secondary rounded border border-theme">Shortlist</span> →
                <span className="px-2.5 py-1 btn-brand-primary text-white font-bold rounded">Verified Hire</span>
              </div>
            </div>

            <div className="p-5 bg-card-bg border border-theme rounded-xl shadow-sm space-y-2">
              <div className="font-bold text-primary text-xs uppercase flex items-center gap-2">
                <span className="w-2 h-2 bg-indigo-600 rounded-full"></span>
                PLACEMENT OFFICER (TPO) FLOW
              </div>
              <div className="flex flex-wrap items-center gap-2 text-[11px] text-secondary">
                <span className="px-2.5 py-1 bg-secondary rounded border border-theme">Companies</span> →
                <span className="px-2.5 py-1 bg-secondary rounded border border-theme">Cohort Readiness</span> →
                <span className="px-2.5 py-1 bg-secondary rounded border border-theme">Drive Approvals</span> →
                <span className="px-2.5 py-1 btn-brand-primary text-white font-bold rounded">Analytics</span>
              </div>
            </div>

          </div>

        </div>
      </section>
    </>
  );
}
