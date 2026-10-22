import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header id="navbar" className="fixed top-0 left-0 right-0 z-50 transition-colors duration-300 bg-navbar border-b border-theme">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <img
            src="/logo-icon.png"
            alt="PlacementAI"
            className="w-10 h-10 object-contain rounded-xl shadow-md transition-transform group-hover:scale-105"
          />
          <div className="flex flex-col">
            <span className="font-extrabold text-xl tracking-tight text-primary font-sans">PlacementAI</span>
            <span className="text-[9px] uppercase tracking-widest font-mono text-teal-500 font-semibold -mt-1">Intelligence Engine</span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold uppercase tracking-wider text-secondary">
          <a href="/#features" className="hover:text-primary transition-colors">Features</a>
          <a href="/#how-it-works" className="hover:text-primary transition-colors">How It Works</a>
          <a href="/#colleges" className="hover:text-primary transition-colors">For Colleges</a>
          <a href="/#pricing" className="hover:text-primary transition-colors">Pricing</a>
        </nav>

        {/* Right Actions (Theme Toggle + CTAs) */}
        <div className="hidden md:flex items-center gap-4">
          <ThemeToggle />

          <Link to="/login" className="px-4 py-2.5 text-xs font-semibold text-secondary hover:text-primary transition-colors">
            Login
          </Link>

          <Link to="/signup" className="px-6 py-2.5 text-xs font-bold uppercase tracking-wider btn-brand-primary rounded-xl shadow-lg flex items-center gap-2 group">
            Get Started
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>

        {/* Mobile Menu Toggle Button */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle id="mobile-theme-toggle" />

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 text-primary focus:outline-none"
            aria-label="Toggle Navigation Menu"
          >
            {isOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/>
              </svg>
            )}
          </button>
        </div>

      </div>

      {/* Mobile Drawer Menu */}
      {isOpen && (
        <div id="mobile-menu" className="md:hidden bg-secondary border-b border-theme px-6 py-6 space-y-4">
          <a href="/#features" onClick={() => setIsOpen(false)} className="block text-sm font-semibold uppercase text-secondary py-2 border-b border-theme">Features</a>
          <a href="/#how-it-works" onClick={() => setIsOpen(false)} className="block text-sm font-semibold uppercase text-secondary py-2 border-b border-theme">How It Works</a>
          <a href="/#colleges" onClick={() => setIsOpen(false)} className="block text-sm font-semibold uppercase text-secondary py-2 border-b border-theme">For Colleges</a>
          <a href="/#pricing" onClick={() => setIsOpen(false)} className="block text-sm font-semibold uppercase text-secondary py-2 border-b border-theme">Pricing</a>
          <div className="pt-4 flex flex-col gap-3">
            <Link to="/login" onClick={() => setIsOpen(false)} className="w-full py-3 text-xs font-semibold uppercase text-primary border border-theme rounded-lg text-center block bg-primary">Login</Link>
            <Link to="/signup" onClick={() => setIsOpen(false)} className="w-full py-3 text-xs font-bold uppercase btn-brand-primary rounded-lg text-center block">Get Started →</Link>
          </div>
        </div>
      )}
    </header>
  );
}
