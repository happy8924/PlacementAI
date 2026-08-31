import React from 'react';

export default function HowItWorks() {
  return (
    <section id="how-it-works" class="py-24 bg-primary text-primary border-b border-theme transition-colors duration-300">
      <div class="max-w-7xl mx-auto px-6">
        
        <div class="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span class="font-mono text-xs uppercase tracking-widest text-teal-500 font-semibold block">// Simplified Execution</span>
          <h2 class="text-3xl sm:text-5xl font-extrabold text-primary tracking-tight">
            Four steps to placement success.
          </h2>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div class="p-6 bg-secondary border border-theme rounded-2xl space-y-4 flex flex-col justify-between hover:border-blue-500 transition-all">
            <div class="text-4xl font-extrabold text-blue-600 dark:text-blue-400 font-mono">01</div>
            <div>
              <h3 class="font-bold text-lg text-primary mb-1">Build Your Profile</h3>
              <p class="text-xs text-secondary leading-relaxed">Upload resume, connect GitHub, and specify target job roles.</p>
            </div>
          </div>

          <div class="p-6 bg-secondary border border-theme rounded-2xl space-y-4 flex flex-col justify-between hover:border-blue-500 transition-all">
            <div class="text-4xl font-extrabold text-indigo-600 dark:text-indigo-400 font-mono">02</div>
            <div>
              <h3 class="font-bold text-lg text-primary mb-1">Understand Your Gaps</h3>
              <p class="text-xs text-secondary leading-relaxed">Get an instant AI vector audit detailing missing skills & ATS fixes.</p>
            </div>
          </div>

          <div class="p-6 bg-secondary border border-theme rounded-2xl space-y-4 flex flex-col justify-between hover:border-blue-500 transition-all">
            <div class="text-4xl font-extrabold text-teal-600 dark:text-teal-400 font-mono">03</div>
            <div>
              <h3 class="font-bold text-lg text-primary mb-1">Prepare With AI</h3>
              <p class="text-xs text-secondary leading-relaxed">Execute tailored roadmaps and complete AI voice mock interviews.</p>
            </div>
          </div>

          <div class="p-6 btn-brand-primary text-white rounded-2xl space-y-4 flex flex-col justify-between shadow-xl">
            <div class="text-4xl font-extrabold font-mono text-white">04</div>
            <div>
              <h3 class="font-bold text-lg mb-1 text-white">Find Your Opportunity</h3>
              <p class="text-xs text-white/90 leading-relaxed">Match directly with top recruiters looking for verified readiness.</p>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
