import React from 'react';

export default function CollegeSection() {
  const cohortMetrics = [
    { label: 'Batch Size', value: '420 Students' },
    { label: 'Overall Placed Rate', value: '82%' },
    { label: 'Active Companies', value: '14 Hiring' },
    { label: 'Average Package Lacks', value: '12.4 LPA' }
  ];

  const studentMonitoring = [
    { name: 'Aarav Sharma', score: '94%', gap: 'System Design', status: 'Vetted', action: 'Applied Stripe' },
    { name: 'Priya Patel', score: '88%', gap: 'None', status: 'Ready', action: 'Offer Vercel' },
    { name: 'Rohan Sen', score: '82%', gap: 'Testing / QA', status: 'Action Required', action: 'Schedule Mock' }
  ];

  return (
    <section id="colleges" className="py-24 bg-primary text-primary border-b border-theme transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="font-mono text-xs uppercase tracking-widest text-teal-500 font-semibold block">// Institution Dashboard Preview</span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-primary tracking-tight">
            Smarter placement management for colleges.
          </h2>
          <p className="text-base text-secondary font-normal">
            Empower your Training & Placement Office (TPO) with batch-wide metrics, skill gap analytics, and drive management.
          </p>
        </div>

        {/* Institution Dashboard Layout */}
        <div className="max-w-6xl mx-auto bg-secondary border border-theme rounded-2xl p-6 sm:p-8 shadow-2xl space-y-8">
          
          {/* Cohort metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {cohortMetrics.map((met, idx) => (
              <div key={idx} className="bg-card-bg border border-theme p-4 rounded-xl text-center">
                <span className="text-[10px] uppercase font-mono text-secondary font-bold block">{met.label}</span>
                <span className="text-xl font-extrabold text-primary font-mono block mt-1">{met.value}</span>
              </div>
            ))}
          </div>

          {/* Student monitoring workspace */}
          <div className="space-y-4">
            
            <div className="flex justify-between items-center pb-2 border-b border-theme">
              <span className="font-bold text-xs uppercase font-mono text-primary">TPO Cohort Monitoring</span>
              <span className="text-teal-600 dark:text-teal-400 font-mono text-[11px] font-bold">BATCH OF 2026 // ONLINE</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs border-collapse">
                <thead>
                  <tr className="text-secondary border-b border-theme bg-card-bg/50">
                    <th className="p-3">Student Name</th>
                    <th className="p-3">Readiness Index</th>
                    <th className="p-3">Identified Gap</th>
                    <th className="p-3">Compliance</th>
                    <th className="p-3">Recent Interaction</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-theme">
                  {studentMonitoring.map((stud, idx) => (
                    <tr key={idx} className="hover:bg-card-bg/40 transition-colors">
                      <td className="p-3 font-sans font-semibold text-primary">{stud.name}</td>
                      <td className="p-3 text-blue-600 dark:text-blue-400 font-bold">{stud.score}</td>
                      <td className="p-3 text-secondary">{stud.gap}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 border rounded text-[10px] font-bold ${
                          stud.status === 'Vetted' || stud.status === 'Ready'
                            ? 'text-teal-500 bg-teal-500/10 border-teal-500/20'
                            : 'text-amber-500 bg-amber-500/10 border-amber-500/20'
                        }`}>
                          {stud.status}
                        </span>
                      </td>
                      <td className="p-3 text-secondary">{stud.action}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>

          {/* Placement insights banner */}
          <div className="p-4 bg-card-bg border border-theme rounded-xl grid grid-cols-1 md:grid-cols-2 gap-4 items-center font-mono text-xs">
            <div>
              <div className="text-teal-600 dark:text-teal-400 font-bold uppercase">TPO Skill Gap Analytics</div>
              <p className="text-secondary text-[11px] mt-1 font-sans">
                Cohort analytics indicates that 32% of students show matching gaps in <strong>Docker & Kubernetes</strong> deployments. Consider recommending the containerization micro-learning module.
              </p>
            </div>
            <div className="flex md:justify-end gap-3">
              <button className="px-4 py-2 border border-theme rounded-lg bg-secondary text-primary font-bold hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors uppercase tracking-wider text-[10px]">
                Export Cohort Report
              </button>
              <button className="px-4 py-2 btn-brand-primary text-white font-bold rounded-lg shadow uppercase tracking-wider text-[10px]">
                Deploy Module
              </button>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
