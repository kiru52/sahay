import React from 'react';
import { Shield, Sparkles, Globe, HeartPulse, User, PhoneCall, FileText, Info, Lock } from 'lucide-react';
import { useAuth, ROLES } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export const Navbar = ({ currentView, onViewChange }) => {
  const { role, switchRole, user } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  const handleRoleChange = (e) => {
    switchRole(e.target.value);
    if (e.target.value === ROLES.SUPPORT_WORKER) {
      onViewChange('SUPPORT_WORKER');
    } else if (e.target.value === ROLES.VICTIM) {
      onViewChange('VICTIM_DASHBOARD');
    } else if (e.target.value === ROLES.ADMIN) {
      onViewChange('ADMIN_DASHBOARD');
    }
  };

  return (
    <header className="bg-white border-b border-slate-200/80 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Product Identity */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onViewChange('SUPPORT_WORKER')}>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-700 to-teal-500 text-white flex items-center justify-center shadow-md shadow-teal-100 font-black text-xl tracking-wider">
              S
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-extrabold tracking-tight text-slate-900 font-sans">SAHAY</span>
                <span className="text-[10px] bg-teal-50 text-teal-700 font-bold px-2 py-0.5 rounded-full border border-teal-200">
                  SIH 2026 Prototype
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                Dynamic Mental Health Monitoring & Early Distress Prediction
              </p>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => onViewChange('SUPPORT_WORKER')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                currentView === 'SUPPORT_WORKER' || currentView === 'VICTIM_PROFILE'
                  ? 'bg-teal-50 text-teal-800 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {t('nav.support_worker_view')}
            </button>

            <button
              onClick={() => {
                switchRole(ROLES.VICTIM, 'V-1042');
                onViewChange('VICTIM_DASHBOARD');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                currentView === 'VICTIM_DASHBOARD'
                  ? 'bg-teal-50 text-teal-800 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {t('nav.victim_portal')}
            </button>

            <button
              onClick={() => {
                switchRole(ROLES.ADMIN);
                onViewChange('ADMIN_DASHBOARD');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                currentView === 'ADMIN_DASHBOARD'
                  ? 'bg-teal-50 text-teal-800 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {t('nav.district_admin')}
            </button>

            <button
              onClick={() => onViewChange('PRIVACY_CONSENT')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                currentView === 'PRIVACY_CONSENT'
                  ? 'bg-teal-50 text-teal-800 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {t('nav.privacy_consent')}
            </button>

            <button
              onClick={() => onViewChange('ABOUT_SYSTEM')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                currentView === 'ABOUT_SYSTEM'
                  ? 'bg-teal-50 text-teal-800 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {t('nav.about_system')}
            </button>
          </nav>

          {/* Right Controls: Role, Language, SOS */}
          <div className="flex items-center gap-2.5">
            {/* Language Selector */}
            <div className="relative flex items-center">
              <Globe className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="pl-7 pr-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
              >
                <option value="en">English</option>
                <option value="ta">தமிழ்</option>
                <option value="hi">हिन्दी</option>
              </select>
            </div>

            {/* Active User / Role Badge */}
            <div className="hidden lg:flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-bold text-xs">
                <User className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[140px]">
                  {user.full_name}
                </div>
                <div className="text-[10px] text-slate-500 font-medium">
                  {role === ROLES.SUPPORT_WORKER ? 'Protection Officer' : role === ROLES.VICTIM ? 'Beneficiary (V-1042)' : 'District Admin'}
                </div>
              </div>
            </div>

            {/* Quick Emergency SOS button */}
            <button
              onClick={() => alert("SAHAY Emergency Helpline: 181 (Women Helpline) / 1098 (Childline) / 112 (National Emergency Dispatch). Auto-alerting designated district crisis cell.")}
              className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <PhoneCall className="w-3.5 h-3.5 text-rose-600" />
              <span className="hidden sm:inline">Emergency SOS (181)</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
