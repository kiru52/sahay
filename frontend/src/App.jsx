import React, { useState } from 'react';
import { AuthProvider, useAuth, ROLES } from './context/AuthContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { ToastProvider } from './context/ToastContext';
import { Navbar } from './components/Navbar';
import { DemoWorkflowBar } from './components/DemoWorkflowBar';
import { SupportWorkerDashboard } from './pages/SupportWorkerDashboard';
import { VictimProfileView } from './pages/VictimProfileView';
import { VictimDashboard } from './pages/VictimDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { PrivacyAndConsentPage } from './pages/PrivacyAndConsentPage';
import { AboutSystemPage } from './pages/AboutSystemPage';

function MainApp() {
  const { role, switchRole, activeVictimId, setActiveVictimId } = useAuth();
  const { t } = useLanguage();
  
  // Current view state: 'SUPPORT_WORKER', 'VICTIM_PROFILE', 'VICTIM_DASHBOARD', 'ADMIN_DASHBOARD', 'PRIVACY_CONSENT', 'ABOUT_SYSTEM'
  const [currentView, setCurrentView] = useState('SUPPORT_WORKER');
  const [selectedVictimId, setSelectedVictimId] = useState('V-1042');

  const handleSelectVictim = (victimId) => {
    setSelectedVictimId(victimId);
    setActiveVictimId(victimId);
    setCurrentView('VICTIM_PROFILE');
  };

  const handleViewChange = (view) => {
    setCurrentView(view);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-teal-500 selection:text-white">
      {/* SIH Interactive Demo Workflow Banner */}
      <DemoWorkflowBar
        onSelectVictim={handleSelectVictim}
        currentView={currentView}
        onViewChange={handleViewChange}
      />

      {/* Main Navigation Header */}
      <Navbar
        currentView={currentView}
        onViewChange={handleViewChange}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentView === 'SUPPORT_WORKER' && (
          <SupportWorkerDashboard
            onSelectVictim={handleSelectVictim}
          />
        )}

        {currentView === 'VICTIM_PROFILE' && (
          <VictimProfileView
            victimId={selectedVictimId}
            onBack={() => setCurrentView('SUPPORT_WORKER')}
          />
        )}

        {currentView === 'VICTIM_DASHBOARD' && (
          <VictimDashboard />
        )}

        {currentView === 'ADMIN_DASHBOARD' && (
          <AdminDashboard />
        )}

        {currentView === 'PRIVACY_CONSENT' && (
          <PrivacyAndConsentPage />
        )}

        {currentView === 'ABOUT_SYSTEM' && (
          <AboutSystemPage />
        )}
      </main>

      {/* Trustworthy Government-Ready Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-800">SAHAY</span>
            <span>•</span>
            <span>AI-Powered Dynamic Mental Health Monitoring System</span>
            <span className="hidden md:inline">• Smart India Hackathon 2026</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span className="text-teal-700 font-semibold">"Detect change. Understand context. Act early."</span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-400">Decision-support system, not clinical diagnosis</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <ToastProvider>
          <MainApp />
        </ToastProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
