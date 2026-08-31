import React from 'react';

export default function Footer({ onGetStarted }) {
  return (
    <footer className="bg-primary text-secondary py-16 border-t border-theme font-sans text-xs transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 pb-12 border-b border-theme">
          
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm rounded-lg">P</div>
              <span className="font-bold text-lg text-primary">PlacementAI</span>
            </div>
            <p className="text-secondary text-xs max-w-sm leading-relaxed">
              AI-powered career intelligence for modern placement preparation. Unified readiness tracking for students, recruiters, and placement officers.
            </p>
            <div className="inline-flex items-center gap-2 text-[10px] text-secondary font-mono border border-teal-500/30 px-3 py-1 bg-teal-500/10 rounded-full">
              <span className="w-2 h-2 bg-teal-500 rounded-full animate-pulse"></span>
              SYSTEM OPERATIONAL // 2026
            </div>
          </div>

          <div className="space-y-3">
            <span className="font-bold text-primary uppercase font-mono tracking-wider block">Product</span>
            <ul className="space-y-2 font-mono uppercase text-[11px]">
              <li><a href="#features" className="hover:text-primary">Features</a></li>
              <li><a href="#how-it-works" className="hover:text-primary">How It Works</a></li>
              <li><a href="#ai-core" className="hover:text-primary">AI Core Engine</a></li>
            </ul>
          </div>

          <div className="space-y-3">
            <span className="font-bold text-primary uppercase font-mono tracking-wider block">For Users</span>
            <ul className="space-y-2 font-mono uppercase text-[11px]">
              <li><a href="#ecosystem" className="hover:text-primary">Students</a></li>
              <li><a href="#ecosystem" className="hover:text-primary">Recruiters</a></li>
              <li><a href="#ecosystem" className="hover:text-primary">Placement Officers</a></li>
            </ul>
          </div>

          <div className="space-y-3">
            <span className="font-bold text-primary uppercase font-mono tracking-wider block">Company</span>
            <ul className="space-y-2 font-mono uppercase text-[11px]">
              <li><span onClick={onGetStarted} className="hover:text-primary cursor-pointer">About</span></li>
              <li><span onClick={onGetStarted} className="hover:text-primary cursor-pointer">Contact Support</span></li>
              <li><span onClick={onGetStarted} className="hover:text-primary cursor-pointer">Privacy Policy</span></li>
            </ul>
          </div>

        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-secondary text-[11px] font-mono">
          <span>© 2026 PlacementAI Inc. All rights reserved.</span>
          <span className="mt-2 sm:mt-0 uppercase">Deep Navy • Blue / Indigo Gradient • Teal Accents</span>
        </div>

      </div>
    </footer>
  );
}
