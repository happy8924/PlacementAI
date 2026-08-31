import React from 'react';
import DashboardPreview from './DashboardPreview';

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
              <a href="#features" className="px-8 py-4 bg-secondary text-primary font-semibold text-xs uppercase tracking-wider hover:bg-slate-200 dark:hover:bg-slate-800 transition-all border border-theme rounded-xl text-center">
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
          <div className="lg:col-span-7">
            <DashboardPreview onGetStarted={onGetStarted} />
          </div>

        </div>

      </div>
    </section>
  );
}
