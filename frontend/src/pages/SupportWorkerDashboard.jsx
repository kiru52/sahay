import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Users,
  Activity,
  AlertTriangle,
  Calendar,
  Search,
  Filter,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  Phone,
  Flame,
  ChevronRight,
  TrendingUp,
  RefreshCw
} from 'lucide-react';
import { api } from '../services/api';
import { RiskBadge } from '../components/RiskBadge';
import { AlertActionModal } from '../components/AlertActionModal';
import { InterventionModal } from '../components/InterventionModal';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';

export const SupportWorkerDashboard = ({ onSelectVictim }) => {
  const { t } = useLanguage();
  const { addToast } = useToast();

  const [victims, setVictims] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [interventionVictimId, setInterventionVictimId] = useState(null);
  const [interventionAlertId, setInterventionAlertId] = useState(null);
  const [isInterventionModalOpen, setIsInterventionModalOpen] = useState(false);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [victimsData, alertsData, overviewData] = await Promise.all([
        api.getVictims(),
        api.getAlerts({ status: 'TRIGGERED' }),
        api.getOverviewAnalytics()
      ]);
      setVictims(victimsData);
      setAlerts(alertsData);
      setOverview(overviewData);
    } catch (err) {
      console.error(err);
      addToast('Error loading dashboard data: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleOpenAlert = (alert) => {
    setSelectedAlert(alert);
    setIsAlertModalOpen(true);
  };

  const handleOpenIntervention = (victimId, alertId = null) => {
    setInterventionVictimId(victimId);
    setInterventionAlertId(alertId);
    setIsInterventionModalOpen(true);
  };

  // Filtered victims
  const filteredVictims = victims.filter((v) => {
    if (riskFilter === 'CRITICAL' && v.risk_level !== 'CRITICAL') return false;
    if (riskFilter === 'HIGH' && v.risk_level !== 'HIGH') return false;
    if (riskFilter === 'MODERATE' && v.risk_level !== 'MODERATE') return false;
    if (riskFilter === 'LOW' && v.risk_level !== 'LOW') return false;
    if (riskFilter === 'ALERTS' && !v.active_alert) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        v.id.toLowerCase().includes(q) ||
        v.anonymized_id.toLowerCase().includes(q) ||
        v.case_category.toLowerCase().includes(q) ||
        v.district.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              {t('support_worker_dashboard.title')}
            </h1>
            <span className="bg-teal-50 text-teal-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-teal-200">
              Live Monitoring
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            {t('support_worker_dashboard.subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadDashboardData}
            className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Metric Cards (Section 12 specification) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
        {/* Active Cases */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            {t('support_worker_dashboard.stat_active_cases')}
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-2 font-mono">
            {overview?.total_active_cases || 248}
          </div>
          <div className="text-[10px] text-teal-600 font-semibold mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> 100% Monitored
          </div>
        </div>

        {/* Low Risk */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
            {t('support_worker_dashboard.stat_low_risk')}
          </div>
          <div className="text-2xl font-extrabold text-emerald-700 mt-2 font-mono">
            {overview?.low_risk_count || 156}
          </div>
          <div className="text-[10px] text-slate-400 mt-1 font-medium">Score 0–30</div>
        </div>

        {/* Moderate */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-yellow-700">
            {t('support_worker_dashboard.stat_moderate_risk')}
          </div>
          <div className="text-2xl font-extrabold text-yellow-700 mt-2 font-mono">
            {overview?.moderate_risk_count || 61}
          </div>
          <div className="text-[10px] text-slate-400 mt-1 font-medium">Score 31–60</div>
        </div>

        {/* High */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-amber-700">
            {t('support_worker_dashboard.stat_high_risk')}
          </div>
          <div className="text-2xl font-extrabold text-amber-700 mt-2 font-mono">
            {overview?.high_risk_count || 24}
          </div>
          <div className="text-[10px] text-slate-400 mt-1 font-medium">Score 61–80</div>
        </div>

        {/* Critical */}
        <div className="bg-rose-50/70 p-4 rounded-2xl border border-rose-200 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-rose-800 flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
            {t('support_worker_dashboard.stat_critical_risk')}
          </div>
          <div className="text-2xl font-extrabold text-rose-700 mt-2 font-mono">
            {overview?.critical_risk_count || 7}
          </div>
          <div className="text-[10px] text-rose-600 font-bold mt-1">Score 81–100</div>
        </div>

        {/* Alerts Today */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-700">
            {t('support_worker_dashboard.stat_alerts_today')}
          </div>
          <div className="text-2xl font-extrabold text-indigo-700 mt-2 font-mono">
            {alerts.length || 12}
          </div>
          <div className="text-[10px] text-indigo-600 font-semibold mt-1">Early Warnings</div>
        </div>

        {/* Upcoming Stress Events */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
            {t('support_worker_dashboard.stat_upcoming_events')}
          </div>
          <div className="text-2xl font-extrabold text-slate-800 mt-2 font-mono">
            {overview?.upcoming_stress_events_count || 8}
          </div>
          <div className="text-[10px] text-slate-500 font-medium mt-1">Court Milestones</div>
        </div>
      </div>

      {/* Active Escalation Alerts Callout Banner */}
      {alerts.length > 0 && (
        <div className="bg-gradient-to-r from-rose-900 to-slate-900 rounded-3xl p-5 text-white shadow-xl border border-rose-700/50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold">🚨 Urgent Early Warning Escalations ({alerts.length})</h3>
                  <span className="text-[10px] bg-rose-500/30 text-rose-200 font-bold px-2 py-0.5 rounded-full border border-rose-400/30">
                    Immediate Triage Required
                  </span>
                </div>
                <p className="text-xs text-rose-100/80 mt-1">
                  Victim <strong>{alerts[0]?.victim_id}</strong> showed sudden distress surge (+{alerts[0]?.score_change} pts) coinciding with imminent court hearing.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleOpenAlert(alerts[0])}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-950/40 transition-all flex items-center gap-1.5"
              >
                Acknowledge Alert #{alerts[0]?.id}
              </button>
              <button
                onClick={() => onSelectVictim(alerts[0]?.victim_id)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition-all"
              >
                Open Case Profile →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Priority Queue Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Table Header Controls */}
        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {t('support_worker_dashboard.priority_queue')}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Ranked dynamically by severity of distress escalation and judicial event proximity.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('support_worker_dashboard.search_placeholder')}
                className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-teal-500 w-64"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              {['ALL', 'CRITICAL', 'HIGH', 'ALERTS'].map((f) => (
                <button
                  key={f}
                  onClick={() => setRiskFilter(f)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    riskFilter === f
                      ? 'bg-white text-slate-900 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {f === 'ALL' ? t('support_worker_dashboard.filter_all') : f === 'CRITICAL' ? t('support_worker_dashboard.filter_critical') : f === 'HIGH' ? t('support_worker_dashboard.filter_high') : t('support_worker_dashboard.filter_alerts')}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Priority Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50/80 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">{t('support_worker_dashboard.table_victim')}</th>
                <th className="py-3 px-4">{t('support_worker_dashboard.table_district')}</th>
                <th className="py-3 px-4">{t('support_worker_dashboard.table_category')}</th>
                <th className="py-3 px-4">{t('support_worker_dashboard.table_distress')}</th>
                <th className="py-3 px-4">{t('support_worker_dashboard.table_baseline')}</th>
                <th className="py-3 px-4">{t('support_worker_dashboard.table_trend')}</th>
                <th className="py-3 px-4">{t('support_worker_dashboard.table_upcoming')}</th>
                <th className="py-3 px-4 text-right">{t('support_worker_dashboard.table_actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredVictims.map((v) => {
                const isFlagship = v.id === 'V-1042';
                return (
                  <tr
                    key={v.id}
                    className={`hover:bg-slate-50/80 transition-colors cursor-pointer ${
                      isFlagship ? 'bg-amber-50/30 font-medium' : ''
                    }`}
                    onClick={() => onSelectVictim(v.id)}
                  >
                    {/* Victim ID */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md text-xs border border-slate-200">
                          {v.id}
                        </span>
                        {isFlagship && (
                          <span className="text-[9px] bg-amber-500 text-slate-950 font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider">
                            SIH Demo Case
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5 font-mono">{v.anonymized_id}</div>
                    </td>

                    {/* District */}
                    <td className="py-3 px-4">
                      <div className="text-slate-900 font-semibold">{v.district}</div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[140px]">{v.center_name}</div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4 max-w-[200px]">
                      <div className="text-slate-800 truncate font-medium">{v.case_category}</div>
                      <div className="text-[10px] text-slate-400">{v.gender || 'Female'} • Age {v.age_group || '25-34'}</div>
                    </td>

                    {/* Current Distress */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <RiskBadge riskLevel={v.risk_level} score={v.current_distress_score} />
                      </div>
                    </td>

                    {/* Personal Baseline */}
                    <td className="py-3 px-4">
                      <div className="font-mono text-slate-700 font-semibold">
                        {v.baseline_score}
                      </div>
                      <div className="text-[10px] text-slate-400">Calibrated</div>
                    </td>

                    {/* Trend */}
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center text-xs font-bold ${
                        v.trend === 'INCREASING'
                          ? 'text-rose-600'
                          : v.trend === 'IMPROVING'
                          ? 'text-emerald-600'
                          : 'text-slate-600'
                      }`}>
                        {v.trend === 'INCREASING' ? '↑ Increasing' : v.trend === 'IMPROVING' ? '↓ Improving' : '→ Stable'}
                      </span>
                    </td>

                    {/* Upcoming Event */}
                    <td className="py-3 px-4 max-w-[220px]">
                      {v.upcoming_event ? (
                        <div>
                          <div className="text-slate-900 font-semibold truncate">{v.upcoming_event}</div>
                          {v.upcoming_event_days !== null && (
                            <span className={`text-[10px] font-bold ${
                              v.upcoming_event_days <= 3 ? 'text-rose-600 font-extrabold' : 'text-slate-500'
                            }`}>
                              In {v.upcoming_event_days} days {v.upcoming_event_days <= 3 ? '⚠️' : ''}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400">No imminent event</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenIntervention(v.id)}
                          className="p-1.5 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-lg text-xs font-semibold transition-colors border border-teal-200"
                          title="Record Intervention"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onSelectVictim(v.id)}
                          className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                        >
                          Profile <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <AlertActionModal
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
        alert={selectedAlert}
        onAlertUpdated={() => loadDashboardData()}
        onOpenIntervention={() => {
          if (selectedAlert) {
            handleOpenIntervention(selectedAlert.victim_id, selectedAlert.id);
          }
        }}
      />

      <InterventionModal
        isOpen={isInterventionModalOpen}
        onClose={() => setIsInterventionModalOpen(false)}
        victimId={interventionVictimId}
        alertId={interventionAlertId}
        onInterventionSaved={() => loadDashboardData()}
      />
    </div>
  );
};
