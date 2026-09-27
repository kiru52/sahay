import React, { useState, useEffect } from 'react';
import {
  Heart,
  Mic,
  Calendar,
  Sparkles,
  Shield,
  PhoneCall,
  Activity,
  CheckCircle2,
  Lock,
  Clock,
  ChevronRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { api } from '../services/api';
import { VoiceCheckinModal } from '../components/VoiceCheckinModal';
import { DistressTrajectoryChart } from '../components/DistressTrajectoryChart';
import { CaseTimeline } from '../components/CaseTimeline';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

export const VictimDashboard = () => {
  const { t } = useLanguage();
  const { addToast } = useToast();
  const { activeVictimId } = useAuth();

  const [victim, setVictim] = useState(null);
  const [trajectory, setTrajectory] = useState([]);
  const [isCheckinModalOpen, setIsCheckinModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [detailData, trajData] = await Promise.all([
        api.getVictimDetail(activeVictimId || 'V-1042'),
        api.getVictimTrajectory(activeVictimId || 'V-1042')
      ]);
      setVictim(detailData);
      setTrajectory(trajData.trajectory || []);
    } catch (err) {
      console.error(err);
      addToast('Error loading your well-being dashboard.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeVictimId]);

  const handleSupportRequest = () => {
    addToast('Support request transmitted! Your assigned counselor (Radha Krishnan) will reach out to you within 30 minutes.', 'success', 6000);
  };

  if (loading || !victim) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Activity className="w-8 h-8 text-teal-600 animate-spin" />
      </div>
    );
  }

  const latestCheckin = victim.recent_checkins?.[0];
  const baselineScore = victim.baseline_profile?.baseline_distress_score || 32.0;
  const currentScore = victim.current_distress_score || baselineScore;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      
      {/* Welcome & Calm Subtext Banner */}
      <div className="bg-gradient-to-br from-teal-800 via-teal-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-300 bg-teal-950/60 px-3 py-1 rounded-full border border-teal-700/50">
            {t('victim_dashboard.welcome_back')}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-3">
            SAHAY Personal Safe Space
          </h1>
          <p className="text-xs sm:text-sm text-teal-100/90 leading-relaxed mt-2">
            {t('victim_dashboard.calm_subtext')}
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-6">
            <button
              onClick={() => setIsCheckinModalOpen(true)}
              className="px-5 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-xl text-xs font-bold shadow-lg shadow-teal-950/40 flex items-center gap-2 transition-all"
            >
              <Mic className="w-4 h-4" />
              {t('victim_dashboard.btn_start_checkin')}
            </button>

            <button
              onClick={handleSupportRequest}
              className="px-5 py-2.5 bg-slate-800/80 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold border border-slate-700 flex items-center gap-2 transition-all"
            >
              <PhoneCall className="w-4 h-4 text-rose-400" />
              {t('victim_dashboard.request_support')}
            </button>
          </div>
        </div>

        {/* Subtle decorative circles */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-teal-600/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Distress Status Overview Grid (Section 4 specifications) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Current Score Card */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="text-xs font-bold uppercase text-slate-500 tracking-wider">
            Current Well-Being Score
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-4xl font-extrabold text-slate-900 font-mono">{currentScore}</span>
            <span className="text-xs text-slate-400 font-semibold">/ 100</span>
          </div>
          <div className="text-xs font-semibold text-slate-500 mt-2">
            Status: <span className="font-bold text-slate-800">{victim.current_risk_level}</span>
          </div>
        </div>

        {/* Personal Baseline Reference */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="text-xs font-bold uppercase text-slate-500 tracking-wider">
            Calibrated Personal Baseline
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-4xl font-extrabold text-teal-700 font-mono">{baselineScore}</span>
            <span className="text-xs text-slate-400 font-semibold">/ 100</span>
          </div>
          <div className="text-xs font-semibold text-teal-600 mt-2">
            Your typical reference point
          </div>
        </div>

        {/* Trajectory Trend */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="text-xs font-bold uppercase text-slate-500 tracking-wider">
            Trajectory Trend
          </div>
          <div className="text-2xl font-extrabold text-rose-600 mt-2 flex items-center gap-1.5">
            <TrendingUp className="w-6 h-6" />
            <span>{victim.trend === 'INCREASING' ? '↑ Increasing' : victim.trend === 'IMPROVING' ? '↓ Improving' : '→ Stable'}</span>
          </div>
          <div className="text-xs text-slate-500 mt-2">
            Shift from baseline: <span className="font-bold text-rose-600">+{victim.baseline_deviation} pts</span>
          </div>
        </div>
      </div>

      {/* AI Decision-Support Insight Card (Non-Diagnostic) */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-indigo-600" />
          <h2 className="text-base font-bold text-slate-900">
            {t('victim_dashboard.ai_insight_title')}
          </h2>
        </div>
        
        <div className="bg-indigo-50/60 rounded-2xl p-4 border border-indigo-100">
          <p className="text-xs sm:text-sm text-indigo-950 font-medium leading-relaxed">
            "{latestCheckin?.distress_score?.ai_prediction?.ai_insight_summary || 'Your recent responses show a change from your personal baseline, particularly coinciding with the upcoming hearing in the case timeline.'}"
          </p>
        </div>

        <div className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-400">
          <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
          <span>{t('victim_dashboard.ai_insight_disclaimer')}</span>
        </div>
      </div>

      {/* Distress Trajectory Chart */}
      <DistressTrajectoryChart
        trajectoryData={trajectory}
        baseline={baselineScore}
      />

      {/* Case Timeline Section */}
      <CaseTimeline cases={victim.cases} />

      {/* Privacy and Monitored Data Transparency Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-teal-600" />
            <h3 className="text-base font-bold text-slate-900">
              {t('victim_dashboard.privacy_status_title')}
            </h3>
          </div>
          <span className="text-xs text-slate-400">Anonymized Protection Mode</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between">
            <div className="text-xs font-semibold text-slate-800">{t('victim_dashboard.data_sharing')}</div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">Enabled</span>
          </div>

          <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between">
            <div className="text-xs font-semibold text-slate-800">{t('victim_dashboard.voice_processing')}</div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">Enabled</span>
          </div>

          <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between">
            <div className="text-xs font-semibold text-slate-800">{t('victim_dashboard.sms_prompts')}</div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">Enabled</span>
          </div>
        </div>
      </div>

      {/* Voice Check-in Modal */}
      <VoiceCheckinModal
        isOpen={isCheckinModalOpen}
        onClose={() => setIsCheckinModalOpen(false)}
        victimId={victim.id}
        onCheckinSuccess={() => loadData()}
      />
    </div>
  );
};
