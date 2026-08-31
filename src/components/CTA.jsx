import React from 'react';

export default function CTA({ onGetStarted }) {
  return (
    <section class="py-28 bg-primary text-primary border-b border-theme text-center relative overflow-hidden transition-colors duration-300">
      <div class="max-w-4xl mx-auto px-6 relative z-10 space-y-6">
        
        <span class="font-mono text-xs uppercase tracking-widest text-teal-500 font-semibold block">// Immediate Action</span>
        <h2 class="text-4xl sm:text-6xl font-extrabold text-primary tracking-tight leading-tight">
          Your placement journey starts here.
        </h2>
        <p class="text-lg text-secondary font-normal max-w-xl mx-auto">
          Stop guessing what to prepare. Start knowing what comes next with PlacementAI.
        </p>

        <div class="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button onClick={onGetStarted} class="px-10 py-5 btn-brand-primary font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-2xl flex items-center gap-2 group">
            Get Started
            <span class="group-hover:translate-x-1 transition-transform">→</span>
          </button>
          <a href="#features" class="px-10 py-5 bg-secondary text-primary font-semibold text-xs uppercase tracking-wider hover:bg-slate-200 dark:hover:bg-slate-800 border border-theme rounded-xl">
            Explore Platform
          </a>
        </div>

      </div>
    </section>
  );
}
