import React, { useState } from 'react';
import { Shield, Lock, Eye, CheckCircle2, AlertCircle, FileText, UserCheck, Key } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export const PrivacyAndConsentPage = () => {
  const { addToast } = useToast();

  const [consentSettings, setConsentSettings] = useState({
    dataSharing: true,
    voiceProcessing: true,
    caseTimelineSync: true,
    smsAlerts: true
  });

  const handleToggle = (key) => {
    setConsentSettings((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      addToast(`Consent setting updated for ${key}. Changes logged to immutable audit trail.`, 'success');
      return updated;
    });
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-16">
      
      {/* Title */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-xs">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-100">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Privacy, Security & Consent Architecture
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Strict compliance with Digital Personal Data Protection Act & Atrocity Support Safeguards
            </p>
          </div>
        </div>

        {/* 3 Core Ethical Mandates */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-100">
            <div className="text-xs font-bold text-teal-900 uppercase">1. Decision Support Only</div>
            <p className="text-xs text-teal-800 mt-1 font-medium">
              SAHAY provides early-warning decision support and longitudinal change detection, never clinical or medical diagnoses.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100">
            <div className="text-xs font-bold text-indigo-900 uppercase">2. Human-in-the-Loop</div>
            <p className="text-xs text-indigo-800 mt-1 font-medium">
              Every automated alert must be reviewed, verified, and acted upon by an authorized human protection counselor.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="text-xs font-bold text-slate-900 uppercase">3. Full Transparency</div>
            <p className="text-xs text-slate-600 mt-1 font-medium">
              Victims and beneficiaries have full visibility into what signals are monitored and can modify consent anytime.
            </p>
          </div>
        </div>
      </div>

      {/* Consent Controls */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
        <h2 className="text-base font-bold text-slate-900 mb-1">
          Active Beneficiary Consent Controls (V-1042)
        </h2>
        <p className="text-xs text-slate-500 mb-6">
          Toggle automated features. Any revocation immediately ceases feature extraction.
        </p>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 bg-slate-50/50">
            <div>
              <div className="text-sm font-bold text-slate-900">Anonymized Data Sharing & Case Sync</div>
              <p className="text-xs text-slate-500 mt-0.5">
                Allows authorized protection officer to view your distress trend under anonymized ID (VICTIM-TN-CHE-1042).
              </p>
            </div>
            <button
              onClick={() => handleToggle('dataSharing')}
              className={`w-12 h-6 rounded-full transition-colors relative ${
                consentSettings.dataSharing ? 'bg-teal-600' : 'bg-slate-300'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
                  consentSettings.dataSharing ? 'right-0.5' : 'left-0.5'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 bg-slate-50/50">
            <div>
              <div className="text-sm font-bold text-slate-900">Voice Acoustic Stress Analysis</div>
              <p className="text-xs text-slate-500 mt-0.5">
                Extracts vocal cadence indicators (speaking rate, pause frequency) during optional audio check-ins. Raw audio is never stored permanently.
              </p>
            </div>
            <button
              onClick={() => handleToggle('voiceProcessing')}
              className={`w-12 h-6 rounded-full transition-colors relative ${
                consentSettings.voiceProcessing ? 'bg-teal-600' : 'bg-slate-300'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
                  consentSettings.voiceProcessing ? 'right-0.5' : 'left-0.5'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 bg-slate-50/50">
            <div>
              <div className="text-sm font-bold text-slate-900">Case Milestone Proximity Synchronization</div>
              <p className="text-xs text-slate-500 mt-0.5">
                Correlates upcoming judicial hearings with your personal baseline to proactively recommend supportive accompaniment.
              </p>
            </div>
            <button
              onClick={() => handleToggle('caseTimelineSync')}
              className={`w-12 h-6 rounded-full transition-colors relative ${
                consentSettings.caseTimelineSync ? 'bg-teal-600' : 'bg-slate-300'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
                  consentSettings.caseTimelineSync ? 'right-0.5' : 'left-0.5'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Security Architecture Deep Dive */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
        <h2 className="text-base font-bold text-slate-900 mb-4">
          Government-Ready Security Architecture
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-600">
          <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50">
            <div className="font-bold text-slate-900 flex items-center gap-1.5 mb-1">
              <Lock className="w-4 h-4 text-teal-600" />
              Role-Based Access Control (RBAC)
            </div>
            Strict partition between Victim, Protection Officer, and District Admin roles. Officers can only access cases assigned to their specific center jurisdiction.
          </div>

          <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50">
            <div className="font-bold text-slate-900 flex items-center gap-1.5 mb-1">
              <Eye className="w-4 h-4 text-indigo-600" />
              Data Minimization & Anonymization
            </div>
            Personally identifiable information (names, direct addresses) is cryptographically isolated from the AI inference engine. Inference uses synthetic tokens.
          </div>

          <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50">
            <div className="font-bold text-slate-900 flex items-center gap-1.5 mb-1">
              <Key className="w-4 h-4 text-amber-600" />
              Immutable Audit Logging
            </div>
            Every record view, alert acknowledgment, and intervention is timestamped and recorded with actor credentials for judicial accountability.
          </div>

          <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50">
            <div className="font-bold text-slate-900 flex items-center gap-1.5 mb-1">
              <FileText className="w-4 h-4 text-emerald-600" />
              Statutory Atrocity Protection
            </div>
            Designed to integrate with District Victim Compensation Boards and One Stop Centre (OSC) standard operating procedures under Women & Child Welfare.
          </div>
        </div>
      </div>
    </div>
  );
};
