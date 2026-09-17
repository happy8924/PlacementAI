import React, { useState } from 'react';
import StudentSidebar from '../../components/student/StudentSidebar';
import StudentHeader from '../../components/student/StudentHeader';
import { Video, Sparkles, Bot } from 'lucide-react';

export default function StudentInterviewPage() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-dashboard-bg flex">
      <StudentSidebar
        isOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <StudentHeader
          title="AI Mock Interview"
          subtitle="Practice real-time technical & HR mock interviews"
          onMenuToggle={() => setMobileSidebarOpen(true)}
        />

        <main className="flex-1 p-6 md:p-10 max-w-5xl w-full mx-auto space-y-8">
          
          <div className="bg-card-bg border border-theme rounded-2xl p-8 text-center space-y-6 shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center mx-auto shadow-sm">
              <Video className="w-8 h-8" />
            </div>

            <div className="max-w-md mx-auto space-y-2">
              <h2 className="text-2xl font-extrabold text-primary tracking-tight">
                AI Placement Interview Simulator
              </h2>
              <p className="text-xs text-secondary leading-relaxed">
                Interactive AI interviewer evaluates your technical answers, problem-solving approach, and communication skills.
              </p>
            </div>

            <div className="max-w-md mx-auto p-6 bg-secondary/50 rounded-2xl border border-theme space-y-3">
              <Bot className="w-8 h-8 text-secondary mx-auto" />
              <p className="text-xs font-mono font-bold text-primary uppercase tracking-wider">
                Mock Interview Sessions
              </p>
              <p className="text-xs text-secondary">
                Select job role (e.g. Fullstack Engineer, Data Analyst) and difficulty level to start practicing.
              </p>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 text-xs font-mono">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Interactive AI Mock Interviewer will be integrated in the next module.</span>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}
