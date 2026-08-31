import React from 'react';

export default function TrustSecurity() {
  const trustPoints = [
    {
      title: 'Secure Data Transmission',
      desc: 'All profile and resume payloads are encrypted in transit and at rest using enterprise standard AES-256 protocols.'
    },
    {
      title: 'Privacy Focused AI Logic',
      desc: 'Your professional profile details and resumes are never used to train third-party AI models. Your content remains yours.'
    },
    {
      title: 'Protected Authentication',
      desc: 'Access your account securely via protected passwordless sign-ins and standardized OAuth protocol mechanisms.'
    },
    {
      title: 'Student Data Protection',
      desc: 'PlacementAI complies with institutional safety and FERPA guidelines, guaranteeing students absolute data ownership.'
    },
    {
      title: 'Reliable Infrastructure',
      desc: 'Built on a distributed cloud topology guaranteeing 99.9% uptime for core analytics and workspace processing.'
    }
  ];

  return (
    <section id="trust-security" className="py-24 bg-primary text-primary border-b border-theme transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="font-mono text-xs uppercase tracking-widest text-teal-500 font-semibold block">// Enterprise Standards</span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-primary tracking-tight">
            Trust & secure architecture.
          </h2>
          <p className="text-base text-secondary font-normal">
            Your career data is protected by industry-leading security structures and compliance policies.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto font-mono text-xs text-secondary">
          {trustPoints.map((point, idx) => (
            <div key={idx} className="p-6 bg-secondary border border-theme rounded-2xl space-y-2 hover:border-blue-500 transition-all flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2 font-bold text-primary font-sans text-sm">
                  <span className="w-2 h-2 bg-teal-500 rounded-full"></span>
                  {point.title}
                </div>
                <p className="text-[11px] leading-relaxed font-sans">{point.desc}</p>
              </div>
              <span className="text-[10px] text-teal-600 dark:text-teal-400 font-bold block pt-3 border-t border-theme mt-4 uppercase">// Compliance Verified</span>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
