import React, { useState } from 'react';
import StudentSidebar from '../../components/student/StudentSidebar';
import StudentHeader from '../../components/student/StudentHeader';
import { CheckSquare, Sparkles, Clock } from 'lucide-react';

export default function StudentApplicationsPage() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-dashboard-bg flex">
      <StudentSidebar
        isOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <StudentHeader
          title="My Applications"
          subtitle="Track the status of your submitted job applications"
          onMenuToggle={() => setMobileSidebarOpen(true)}
        />

        <main className="flex-1 p-6 md:p-10 max-w-5xl w-full mx-auto space-y-8">
          <div className="bg-card-bg border border-theme rounded-2xl p-8 text-center space-y-6 shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center mx-auto shadow-sm">
              <CheckSquare className="w-8 h-8" />
            </div>

            <div className="max-w-md mx-auto space-y-2">
              <h2 className="text-2xl font-extrabold text-primary tracking-tight">
                My Job Applications
              </h2>
              <p className="text-xs text-secondary leading-relaxed">
                Monitor application progress, interview schedules, and response updates from top companies.
              </p>
            </div>

            <div className="max-w-md mx-auto p-6 bg-secondary/50 rounded-2xl border border-theme space-y-3">
              <Clock className="w-8 h-8 text-secondary mx-auto" />
              <p className="text-xs font-mono font-bold text-primary uppercase tracking-wider">
                No Applications Submitted Yet
              </p>
              <p className="text-xs text-secondary">
                You haven't applied to any job postings yet. Explore open roles in the Jobs & Opportunities section.
              </p>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-600 text-xs font-mono">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Application tracking system will be fully configured soon.</span>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
