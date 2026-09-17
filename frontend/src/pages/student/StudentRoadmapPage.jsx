import React, { useState } from 'react';
import StudentSidebar from '../../components/student/StudentSidebar';
import StudentHeader from '../../components/student/StudentHeader';
import { Map, Sparkles, Compass } from 'lucide-react';

export default function StudentRoadmapPage() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-dashboard-bg flex">
      <StudentSidebar
        isOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <StudentHeader
          title="AI Learning Roadmap"
          subtitle="Personalized skill preparation steps tailored for your target role"
          onMenuToggle={() => setMobileSidebarOpen(true)}
        />

        <main className="flex-1 p-6 md:p-10 max-w-5xl w-full mx-auto space-y-8">
          
          <div className="bg-card-bg border border-theme rounded-2xl p-8 text-center space-y-6 shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-teal-500/10 text-teal-600 flex items-center justify-center mx-auto shadow-sm">
              <Map className="w-8 h-8" />
            </div>

            <div className="max-w-md mx-auto space-y-2">
              <h2 className="text-2xl font-extrabold text-primary tracking-tight">
                Personalized Career Roadmap
              </h2>
              <p className="text-xs text-secondary leading-relaxed">
                Our AI engine analyzes your resume skill gaps against placement requirements to generate a step-by-step learning path.
              </p>
            </div>

            <div className="max-w-md mx-auto p-6 bg-secondary/50 rounded-2xl border border-theme space-y-3">
              <Compass className="w-8 h-8 text-secondary mx-auto" />
              <p className="text-xs font-mono font-bold text-primary uppercase tracking-wider">
                Roadmap Generation Engine
              </p>
              <p className="text-xs text-secondary">
                Upload a resume to unlock your personalized target role roadmap.
              </p>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-teal-500/10 text-teal-600 text-xs font-mono">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Roadmap generation will be connected in the upcoming phase.</span>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}
