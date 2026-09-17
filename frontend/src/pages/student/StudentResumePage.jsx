import React, { useState } from 'react';
import StudentSidebar from '../../components/student/StudentSidebar';
import StudentHeader from '../../components/student/StudentHeader';
import { FileText, Upload, Sparkles, AlertCircle } from 'lucide-react';

export default function StudentResumePage() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-dashboard-bg flex">
      <StudentSidebar
        isOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <StudentHeader
          title="Resume Intelligence"
          subtitle="Manage your resume and view ATS analysis"
          onMenuToggle={() => setMobileSidebarOpen(true)}
        />

        <main className="flex-1 p-6 md:p-10 max-w-5xl w-full mx-auto space-y-8">
          
          <div className="bg-card-bg border border-theme rounded-2xl p-8 text-center space-y-6 shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center mx-auto shadow-sm">
              <FileText className="w-8 h-8" />
            </div>

            <div className="max-w-md mx-auto space-y-2">
              <h2 className="text-2xl font-extrabold text-primary tracking-tight">
                Resume Analyzer & ATS Optimizer
              </h2>
              <p className="text-xs text-secondary leading-relaxed">
                Upload your PDF resume to receive AI feedback, ATS score evaluation, detected skills, and role recommendations.
              </p>
            </div>

            {/* Drag & Drop Placeholder Box */}
            <div className="max-w-md mx-auto border-2 border-dashed border-theme rounded-2xl p-8 space-y-4 bg-secondary/50">
              <Upload className="w-8 h-8 text-secondary mx-auto" />
              <div className="space-y-1">
                <p className="text-xs font-bold text-primary">PDF Resume Upload</p>
                <p className="text-[10px] text-secondary font-mono">Maximum file size: 5MB</p>
              </div>
              <button
                disabled
                className="px-5 py-2.5 btn-brand-primary text-xs font-mono font-bold uppercase tracking-wider rounded-xl opacity-60 cursor-not-allowed"
              >
                Upload Resume PDF (Coming Soon)
              </button>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-600 text-xs font-mono">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Resume AI Analysis module will be enabled in the next phase.</span>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}
