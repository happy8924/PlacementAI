import React, { useState } from 'react';
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
import OnboardingModal from '../components/OnboardingModal';

export default function LandingPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  return (
    <div className="bg-primary text-primary min-h-screen transition-colors duration-300">
      <Navbar onGetStarted={handleOpenModal} />
      <main>
        <Hero onGetStarted={handleOpenModal} />
        <Problem />
        <Solution onGetStarted={handleOpenModal} />
        <HowItWorks />
        <Features />
        <AICore />
        <StudentDashboard />
        <CollegeSection />
        <Pricing onGetStarted={handleOpenModal} />
        <TrustSecurity />
        <FinalCTA onGetStarted={handleOpenModal} />
      </main>
      <Footer onGetStarted={handleOpenModal} />
      <OnboardingModal isOpen={isModalOpen} onClose={handleCloseModal} />
    </div>
  );
}
