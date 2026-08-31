import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Problem from '../components/Problem';
import Solution from '../components/Solution';
import HowItWorks from '../components/HowItWorks';
import Features from '../components/Features';
import AICore from '../components/AICore';
import StudentDashboard from '../components/StudentDashboard';
import CollegeSection from '../components/CollegeSection';
import Pricing from '../components/Pricing';
import TrustSecurity from '../components/TrustSecurity';
import FinalCTA from '../components/FinalCTA';
import Footer from '../components/Footer';

export default function LandingPage() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/signup');
  };

  return (
    <div className="bg-primary text-primary min-h-screen transition-colors duration-300">
      <Navbar />
      <main>
        <Hero onGetStarted={handleGetStarted} />
        <Problem />
        <Solution onGetStarted={handleGetStarted} />
        <HowItWorks />
        <Features />
        <AICore />
        <StudentDashboard />
        <CollegeSection />
        <Pricing onGetStarted={handleGetStarted} />
        <TrustSecurity />
        <FinalCTA onGetStarted={handleGetStarted} />
      </main>
      <Footer onGetStarted={handleGetStarted} />
    </div>
  );
}
