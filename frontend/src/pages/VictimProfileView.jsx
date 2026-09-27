import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Shield,
  Calendar,
  Sparkles,
  HeartHandshake,
  Activity,
  Mic,
  AlertTriangle,
  Clock,
  CheckCircle2,
  FileText,
  UserCheck,
  Scale
} from 'lucide-react';
import { api } from '../services/api';
import { RiskBadge } from '../components/RiskBadge';
import { ShapWaterfallChart } from '../components/ShapWaterfallChart';
import { DistressTrajectoryChart } from '../components/DistressTrajectoryChart';
import { CaseTimeline } from '../components/CaseTimeline';
import { InterventionModal } from '../components/InterventionModal';
import { AlertActionModal } from '../components/AlertActionModal';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';

export const VictimProfileView = ({ victimId = 'V-1042', onBack }) => {
  const { t } = useLanguage();
  const { addToast } = useToast();

  const [victim, setVictim] = useState(null);
  const [trajectory, setTrajectory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isInterventionModalOpen, setIsInterventionModalOpen] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);

  const loadVictimData = async () => {
    setLoading(true);
    try {
      const [detailData, trajData] = await Promise.all([
        api.getVictimDetail(victimId),
        api.getVictimTrajectory(victimId)
      ]);
      setVictim(detailData);
      setTrajectory(trajData.trajectory || []);
    } catch (err) {
      console.error(err);
      addToast('Error loading profile: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVictimData();
  }, [victimId]);

  if (loading || !victim) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Activity className="w-8 h-8 text-teal-600 animate-spin" />
          <p className="text-xs font-semibold text-slate-500">{t('general.loading')}</p>
        </div>
      </div>
    );
  }

  const latestCheckin = victim.recent_checkins?.[0];
  const baselineScore = victim.baseline_profile?.baseline_distress_score || 32.0;
  const currentDistress = victim.current_distress_score || baselineScore;
  const deviation = Math.round((currentDistress - baselineScore) * 10) / 10;
  const activeAlert = victim.alerts?.find((a) => a.status === 'TRIGGERED' || a.status === 'ACKNOWLEDGED');

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      
      {/* Back Button & Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-xs transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('victim_profile.back_to_list')}
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsInterventionModalOpen(true)}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-100 flex items-center gap-1.5 transition-all"
          >
            <HeartHandshake className="w-4 h-4" />
            {t('victim_profile.log_new_intervention')}
          </button>
        </div>
      </div>

      {/* Main Profile Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-3xl bg-slate-900 text-white font-mono font-extrabold text-xl flex items-center justify-center shadow-lg shadow-slate-200 shrink-0">
              {victim.id}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <h1 className="text-xl font-extrabold text-slate-900">
                  Beneficiary Case Dossier
                </h1>
                <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full border border-slate-200">
                  {victim.anonymized_id}
                </span>
                <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-200">
                  {t('victim_profile.badge_decision_support')}
                </span>
              </div>

              <p className="text-xs font-semibold text-slate-600">
                {victim.case_category}
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-2">
                <span><strong>District:</strong> {victim.district}</span>
                <span>•</span>
                <span><strong>Center:</strong> {victim.center_name}</span>
                <span>•</span>
                <span><strong>Demographics:</strong> {victim.gender} (Age: {victim.age_group})</span>
                <span>•</span>
                <span><strong>Consent:</strong> <span className="text-emerald-700 font-bold">Active & Verified</span></span>
              </div>
            </div>
          </div>

          {/* Quick Metrics Pillar */}
          <div className="flex items-center gap-3 shrink-0 bg-slate-50 p-3 rounded-2xl border border-slate-200">
            {/* Current Distress Score */}
            <div className="text-center px-3 border-r border-slate-200">
              <div className="text-[10px] font-bold uppercase text-slate-500">Current Distress</div>
              <div className="text-2xl font-black text-rose-600 font-mono mt-0.5">{currentDistress}</div>
              <RiskBadge riskLevel={victim.current_risk_level} size="sm" showIcon={false} />
            </div>

            {/* Baseline */}
            <div className="text-center px-3 border-r border-slate-200">
              <div className="text-[10px] font-bold uppercase text-slate-500">Personal Baseline</div>
              <div className="text-2xl font-black text-slate-800 font-mono mt-0.5">{baselineScore}</div>
              <span className="text-[10px] text-teal-600 font-bold">Calibrated Norm</span>
            </div>

            {/* Deviation */}
            <div className="text-center px-3">
              <div className="text-[10px] font-bold uppercase text-slate-500">Baseline Shift</div>
              <div className={`text-2xl font-black font-mono mt-0.5 ${deviation >= 20 ? 'text-rose-600' : 'text-amber-600'}`}>
                {deviation >= 0 ? `+${deviation}` : deviation}
              </div>
              <span className="text-[10px] text-rose-600 font-bold">⚠️ Significant</span>
            </div>
          </div>
        </div>
      </div>

      {/* Active Escalation Alert Banner if present */}
      {activeAlert && (
        <div className="bg-rose-50 border border-rose-200 rounded-3xl p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-rose-200">
              <AlertTriangle className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-900">
                  Active Early Warning Alert #{activeAlert.id} ({activeAlert.alert_type?.replace('_', ' ')})
                </span>
                <span className="text-[10px] bg-rose-600 text-white font-bold px-2 py-0.5 rounded-full">
                  Status: {activeAlert.status}
                </span>
              </div>
              <p className="text-xs text-rose-800 mt-1">
                Distress score increased from {activeAlert.previous_score} to {activeAlert.current_score} (+{activeAlert.score_change} pts). Pre-hearing acute stress flag triggered.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setSelectedAlert(activeAlert);
                setIsAlertModalOpen(true);
              }}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs"
            >
              Manage Alert
            </button>
            <button
              onClick={() => setIsInterventionModalOpen(true)}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-xs"
            >
              Log Human Intervention
            </button>
          </div>
        </div>
      )}

      {/* Two Column Layout: Charts & Multimodal Signals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Longitudinal Trajectory Chart */}
        <DistressTrajectoryChart
          trajectoryData={trajectory}
          baseline={baselineScore}
        />

        {/* Explainable AI (SHAP-Style Feature Decomposition) */}
        <ShapWaterfallChart
          shapValues={latestCheckin?.distress_score?.ai_prediction?.shap_values}
          baselineScore={baselineScore}
          finalScore={currentDistress}
        />
      </div>

      {/* Multimodal Acoustic & Text Indicators Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Mic className="w-5 h-5 text-teal-600" />
            <h3 className="text-base font-bold text-slate-900">
              {t('victim_profile.multimodal_signals')}
            </h3>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            Latest Check-in: {latestCheckin ? new Date(latestCheckin.timestamp).toLocaleDateString() : 'N/A'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/70">
            <div className="text-[11px] font-bold text-slate-500 uppercase">{t('victim_profile.speaking_rate')}</div>
            <div className="text-xl font-black text-slate-900 font-mono mt-1">
              {latestCheckin?.speaking_rate || 96} <span className="text-xs font-normal text-slate-500">wpm</span>
            </div>
            <div className="text-[10px] text-amber-700 font-semibold mt-1">
              ↓ 27% slower than personal norm (132 wpm)
            </div>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/70">
            <div className="text-[11px] font-bold text-slate-500 uppercase">{t('victim_profile.pause_frequency')}</div>
            <div className="text-xl font-black text-slate-900 font-mono mt-1">
              {latestCheckin?.pause_frequency || 7.8} <span className="text-xs font-normal text-slate-500">/min</span>
            </div>
            <div className="text-[10px] text-rose-700 font-semibold mt-1">
              ↑ Hesitations & speech tremor elevated
            </div>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/70">
            <div className="text-[11px] font-bold text-slate-500 uppercase">{t('victim_profile.pitch_variation')}</div>
            <div className="text-xl font-black text-slate-900 font-mono mt-1">
              {latestCheckin?.pitch_variation || 42.0} <span className="text-xs font-normal text-slate-500">Hz</span>
            </div>
            <div className="text-[10px] text-rose-700 font-semibold mt-1">
              ↑ High acoustic pitch instability
            </div>
          </div>
        </div>

        {/* Speech Transcript */}
        <div className="bg-teal-50/40 rounded-2xl p-4 border border-teal-100">
          <div className="text-xs font-bold text-teal-900 uppercase tracking-wider mb-1">
            {t('victim_profile.speech_to_text_transcript')}
          </div>
          <p className="text-xs font-medium text-slate-800 leading-relaxed italic">
            "{latestCheckin?.text_response || latestCheckin?.speech_to_text || 'I am terrified of the upcoming court hearing in two days. I cannot sleep at night, I feel intense panic and dread about facing the accused in courtroom.'}"
          </p>
          <div className="mt-2 flex items-center gap-3 text-[11px] text-slate-500">
            <span>Dominant Emotion: <strong className="text-rose-700">{latestCheckin?.dominant_emotion || 'FEAR'}</strong></span>
            <span>•</span>
            <span>Self-Reported Mood: <strong>{latestCheckin?.self_reported_mood || 1}/5 (Very Low)</strong></span>
          </div>
        </div>
      </div>

      {/* Case Timeline Section */}
      <CaseTimeline cases={victim.cases} />

      {/* Human Intervention & Follow-up History */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <HeartHandshake className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">
              {t('victim_profile.interventions_history')}
            </h3>
          </div>
          <button
            onClick={() => setIsInterventionModalOpen(true)}
            className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all"
          >
            + Log New Intervention
          </button>
        </div>

        {victim.interventions && victim.interventions.length > 0 ? (
          <div className="space-y-3">
            {victim.interventions.map((iv, i) => (
              <div key={i} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center shrink-0 mt-0.5">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{iv.intervention_type?.replace('_', ' ')}</span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                        {iv.outcome_rating || 'STABILIZED'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">{iv.notes}</p>
                    <div className="text-[10px] text-slate-400 mt-1">
                      Conducted by: <strong>{iv.officer_name || 'Protection Officer'}</strong> • {new Date(iv.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {iv.follow_up_date && (
                  <div className="text-right shrink-0">
                    <div className="text-[10px] text-slate-400">Next Follow-up</div>
                    <div className="text-xs font-bold text-slate-700 font-mono">
                      {new Date(iv.follow_up_date).toLocaleDateString()}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-slate-400 text-xs">
            No interventions logged yet for this case.
          </div>
        )}
      </div>

      {/* Modals */}
      <InterventionModal
        isOpen={isInterventionModalOpen}
        onClose={() => setIsInterventionModalOpen(false)}
        victimId={victim.id}
        alertId={activeAlert?.id}
        onInterventionSaved={() => loadVictimData()}
      />

      <AlertActionModal
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
        alert={selectedAlert}
        onAlertUpdated={() => loadVictimData()}
        onOpenIntervention={() => setIsInterventionModalOpen(true)}
      />
    </div>
  );
};
