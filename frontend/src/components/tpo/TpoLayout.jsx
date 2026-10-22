import React, { useState } from 'react';
import TpoSidebar from './TpoSidebar';
import TpoHeader from './TpoHeader';

export default function TpoLayout({ children, title = "TPO Administration" }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-primary flex transition-colors duration-300">
      {/* TPO Sidebar */}
      <TpoSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <TpoHeader onMenuClick={() => setIsSidebarOpen(true)} title={title} />
        
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}
