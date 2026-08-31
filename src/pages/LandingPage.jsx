import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Features from '../components/Features';
import HowItWorks from '../components/HowItWorks';
import AICore from '../components/AICore';
import Ecosystem from '../components/Ecosystem';
import CTA from '../components/CTA';
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
        <Features onGetStarted={handleOpenModal} />
        <HowItWorks />
        <AICore />
        <Ecosystem />
        <CTA onGetStarted={handleOpenModal} />
      </main>
      <Footer onGetStarted={handleOpenModal} />
      <OnboardingModal isOpen={isModalOpen} onClose={handleCloseModal} />
    </div>
  );
}
