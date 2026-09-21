import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopNavbar } from './TopNavbar';
import { Footer } from './Footer';
import { DisclaimerBanner } from '../common/DisclaimerBanner';

export const AppLayout: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900">
      {/* Disclaimer Notification Banner */}
      <DisclaimerBanner />

      <div className="flex flex-1 relative">
        {/* Sidebar */}
        <Sidebar
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
        />

        {/* Main Content Area */}
        <div
          className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${
            sidebarCollapsed ? 'pl-20' : 'pl-64'
          }`}
        >
          <TopNavbar
            collapsed={sidebarCollapsed}
            setCollapsed={setSidebarCollapsed}
          />

          <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-[1600px] w-full mx-auto space-y-6">
            <Outlet />
          </main>

          <Footer />
        </div>
      </div>
    </div>
  );
};
