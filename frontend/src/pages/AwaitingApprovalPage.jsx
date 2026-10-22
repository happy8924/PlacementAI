import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, ShieldCheck, ArrowRight, ArrowLeft } from 'lucide-react';

export default function AwaitingApprovalPage() {
  return (
    <div className="min-h-screen bg-primary flex flex-col justify-center relative overflow-hidden px-6 py-12">
      <div className="absolute inset-0 bg-grid-theme opacity-20 pointer-events-none"></div>

      <div className="max-w-md w-full mx-auto relative z-10 space-y-6 text-center font-mono">
        {/* Animated Icon Card */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center mx-auto shadow-xl shadow-amber-500/20">
          <Clock className="w-8 h-8 animate-pulse" />
        </div>

        <div className="space-y-2">
          <div className="inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20">
            Registration Submitted
          </div>
          <h2 className="text-2xl font-extrabold text-primary font-sans">
            Awaiting Institutional Verification
          </h2>
          <p className="text-xs text-secondary leading-relaxed">
            Your registration request has been submitted to the Training & Placement Officer (TPO) for academic & credential verification.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-card-bg border border-theme text-left text-xs space-y-3 shadow-lg">
          <div className="flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-primary">Identity & Role Verification</p>
              <p className="text-[11px] text-secondary">
                To preserve campus placement integrity, student rolls and corporate recruiters are reviewed prior to accessing drives.
              </p>
            </div>
          </div>
          <div className="p-3 bg-secondary rounded-xl border border-theme text-[11px] text-secondary">
            Once approved, you will be notified via email and can sign in using your generated PlacementAI ID or email.
          </div>
        </div>

        <div className="pt-2">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-secondary hover:bg-card-bg border border-theme text-primary rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Return to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
