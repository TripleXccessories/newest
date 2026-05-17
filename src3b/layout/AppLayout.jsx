import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import PaperTradingBanner from './PaperTradingBanner';
import Footer from './Footer';
import { base44 } from '@/api/base44Client';
import TravelCompanion from '@/components/companion/TravelCompanion';
import BorderTracer from '@/components/effects/BorderTracer';
import AdBanner from '@/components/ads/AdBanner';

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [lightActive] = useState(true);
  const location = useLocation();

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
    }).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-[#050911] font-inter">
      <Header
        onToggleSidebar={() => setMobileOpen(true)}
        user={user}
      />
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <div className={`transition-all duration-300 pt-14 ${collapsed ? 'lg:ml-16' : 'lg:ml-60'}`}>
        <PaperTradingBanner />
        <main className="min-h-[calc(100vh-14rem)] p-4 md:p-6">
          <Outlet />
        </main>
        <AdBanner position="bottom" />
        <Footer />
      </div>
      <TravelCompanion currentPage={location.pathname} />
      <BorderTracer active={lightActive} />
    </div>
  );
}