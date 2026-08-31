import React, { useState } from 'react';

export default function OnboardingModal({ isOpen, onClose }) {
  const [role, setRole] = useState('Student / Job Seeker');
  const [targetRole, setTargetRole] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setTargetRole('');
      setEmail('');
      onClose();
    }, 2000);
  };

  return (
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md transition-opacity duration-300 p-4">
      <div class="bg-card-bg border border-theme text-primary max-w-lg w-full p-8 rounded-2xl relative shadow-2xl space-y-6">
        
        <button onClick={onClose} class="absolute top-4 right-4 text-secondary hover:text-primary text-xl font-mono">✕</button>

        {!isSubmitted ? (
          <>
            <div class="space-y-2">
              <div class="inline-block px-3 py-1 bg-blue-600 text-white font-mono text-[10px] uppercase font-bold rounded">PLACEMENTAI SETUP</div>
              <h3 class="text-2xl font-extrabold text-primary">Get Started with PlacementAI</h3>
              <p class="text-xs text-secondary">Select your role to initialize your career intelligence environment.</p>
            </div>

            <form onSubmit={handleSubmit} class="space-y-4 font-mono text-xs">
              
              <div>
                <label class="block text-primary uppercase font-bold mb-1">Select Profile Role</label>
                <select 
                  value={role} 
                  onChange={(e) => setRole(e.target.value)}
                  class="w-full p-3 border border-theme bg-secondary text-primary rounded-lg focus:outline-none focus:border-blue-500"
                >
                  <option>Student / Job Seeker</option>
                  <option>Recruiter / Hiring Manager</option>
                  <option>Placement Officer (TPO)</option>
                </select>
              </div>

              <div>
                <label class="block text-primary uppercase font-bold mb-1">Target Role</label>
                <input 
                  type="text" 
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g. Full Stack Developer, Data Scientist..." 
                  class="w-full p-3 border border-theme bg-secondary text-primary rounded-lg focus:outline-none focus:border-blue-500" 
                  required 
                />
              </div>

              <div>
                <label class="block text-primary uppercase font-bold mb-1">Email Address</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com" 
                  class="w-full p-3 border border-theme bg-secondary text-primary rounded-lg focus:outline-none focus:border-blue-500" 
                  required 
                />
              </div>

              <button type="submit" class="w-full py-4 btn-brand-primary font-bold font-mono text-xs uppercase tracking-wider rounded-lg shadow-lg">
                Initialize Environment →
              </button>

            </form>
          </>
        ) : (
          <div class="text-center py-6 space-y-3 font-mono">
            <div class="text-3xl text-teal-500">✓</div>
            <div class="font-bold text-primary text-lg uppercase">Environment Initialized!</div>
            <p class="text-xs text-secondary">Your PlacementAI workspace is ready. Redirecting to dashboard...</p>
          </div>
        )}

      </div>
    </div>
  );
}
