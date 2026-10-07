import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopNavbar } from './TopNavbar';
import { Footer } from './Footer';
import { DisclaimerBanner } from '../common/DisclaimerBanner';
import { EmergencySOSModal } from '../common/EmergencySOSModal';
import { useTranslation } from '../../i18n';
import { AlertOctagon } from 'lucide-react';

export const AppLayout: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [showGlobalSos, setShowGlobalSos] = useState(false);
  const { t } = useTranslation();
  const location = useLocation();

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileDrawerOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900 w-full max-w-full overflow-x-hidden">
      {/* Disclaimer Notification Banner */}
      <DisclaimerBanner />

      <div className="flex flex-1 relative w-full min-w-0">
        {/* Sidebar (Off-canvas drawer on mobile, collapsible on tablet/desktop) */}
        <Sidebar
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
          mobileOpen={mobileDrawerOpen}
          setMobileOpen={setMobileDrawerOpen}
        />

        {/* Main Content Area */}
        <div
          className={`flex-1 flex flex-col min-w-0 w-full transition-all duration-300 ease-in-out pl-0 ${
            sidebarCollapsed ? 'md:pl-20' : 'md:pl-20 lg:pl-64'
          }`}
        >
          <TopNavbar
            collapsed={sidebarCollapsed}
            setCollapsed={setSidebarCollapsed}
            mobileDrawerOpen={mobileDrawerOpen}
            setMobileDrawerOpen={setMobileDrawerOpen}
          />

          <main className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8 max-w-[1600px] w-full mx-auto min-w-0 box-border space-y-6">
            <Outlet />
          </main>

          <Footer />
        </div>
      </div>

      {/* Floating Quick SOS Access Trigger (Compact on mobile/tablet) */}
      <div className="fixed bottom-5 right-5 z-40 md:hidden">
        <button
          onClick={() => setShowGlobalSos(true)}
          className="group relative flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white font-black px-4 py-3 rounded-full shadow-2xl shadow-red-600/50 ring-4 ring-red-400/30 hover:ring-red-400/60 transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
          title={t('sos.title', 'Transmit Emergency Distress Signal')}
          aria-label={t('sos.trigger', 'Emergency SOS')}
        >
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-500"></span>
          </span>
          <AlertOctagon className="w-5 h-5 animate-pulse" />
          <span className="tracking-wider text-xs uppercase font-mono">{t('sos.trigger', 'EMERGENCY SOS')}</span>
        </button>
      </div>

      {/* Global Floating SOS Modal */}
      <EmergencySOSModal
        isOpen={showGlobalSos}
        onClose={() => setShowGlobalSos(false)}
      />
    </div>
  );
};


