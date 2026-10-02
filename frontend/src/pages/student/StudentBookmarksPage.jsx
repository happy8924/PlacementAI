import React, { useState } from 'react';
import StudentSidebar from '../../components/student/StudentSidebar';
import StudentHeader from '../../components/student/StudentHeader';
import { Bookmark, Sparkles, FolderHeart } from 'lucide-react';

export default function StudentBookmarksPage() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-dashboard-bg flex">
      <StudentSidebar
        isOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <StudentHeader
          title="Saved Bookmarks"
          subtitle="Access your saved jobs, resources, and roadmap guides"
          onMenuToggle={() => setMobileSidebarOpen(true)}
        />

        <main className="flex-1 p-6 md:p-10 max-w-5xl w-full mx-auto space-y-8">
          <div className="bg-card-bg border border-theme rounded-2xl p-8 text-center space-y-6 shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto shadow-sm">
              <Bookmark className="w-8 h-8" />
            </div>

            <div className="max-w-md mx-auto space-y-2">
              <h2 className="text-2xl font-extrabold text-primary tracking-tight">
                Saved Bookmarks
              </h2>
              <p className="text-xs text-secondary leading-relaxed">
                Save interesting job opportunities, recommended roadmap modules, and interview preparation guides.
              </p>
            </div>

            <div className="max-w-md mx-auto p-6 bg-secondary/50 rounded-2xl border border-theme space-y-3">
              <FolderHeart className="w-8 h-8 text-secondary mx-auto" />
              <p className="text-xs font-mono font-bold text-primary uppercase tracking-wider">
                No Bookmarks Saved
              </p>
              <p className="text-xs text-secondary">
                You haven't bookmarked any jobs or roadmap modules yet. Click the bookmark icon on job listings to save them here.
              </p>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-600 text-xs font-mono">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Bookmark management module will be active soon.</span>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
