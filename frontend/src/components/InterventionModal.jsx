import React, { useState } from 'react';
import { HeartHandshake, X, CheckCircle2, ShieldAlert, Phone, Home, UserCheck, Calendar } from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import confetti from 'canvas-confetti';

export const InterventionModal = ({ isOpen, onClose, victimId, alertId, onInterventionSaved }) => {
  const { addToast } = useToast();
  const [interventionType, setInterventionType] = useState('COUNSELING_SESSION');
  const [notes, setNotes] = useState('');
  const [outcome, setOutcome] = useState('STABILIZED');
  const [followUpDate, setFollowUpDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!notes.trim()) {
      addToast('Please enter detailed intervention notes.', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        victim_id: victimId,
        alert_id: alertId || null,
        officer_name: 'Radha Krishnan (Senior Counselor)',
        intervention_type: interventionType,
        notes: notes,
        outcome_rating: outcome,
        follow_up_date: followUpDate ? new Date(followUpDate).toISOString() : null
      };

      const result = await api.recordIntervention(payload);
      addToast('Human intervention logged successfully! Early warning updated.', 'success');
      
      // Fire subtle celebratory confetti for proactive prevention
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 }
      });

      if (onInterventionSaved) onInterventionSaved(result);
      onClose();
    } catch (err) {
      console.error(err);
      addToast('Failed to record intervention: ' + err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const types = [
    { key: 'PHONE_CALL', label: 'Supportive Phone Wellness Check', icon: Phone },
    { key: 'COUNSELING_SESSION', label: 'Psychological First Aid / Counseling', icon: HeartHandshake },
    { key: 'HOME_VISIT', label: 'Field Welfare / Protection Officer Visit', icon: Home },
    { key: 'LEGAL_AID_COORDINATION', label: 'Court Hearing Prep & Legal Accompaniment', icon: UserCheck },
    { key: 'EMERGENCY_SUPPORT', label: 'Urgent Safety Shelter / Crisis Support', icon: ShieldAlert }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-2 rounded-full hover:bg-slate-100"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-100">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Record Human-in-the-Loop Intervention</h2>
            <p className="text-xs text-slate-500">Victim Target: <span className="font-mono font-bold text-slate-800">{victimId}</span></p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Intervention Type */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Action Protocol
            </label>
            <div className="grid grid-cols-1 gap-2">
              {types.map((t) => {
                const Icon = t.icon;
                const isSelected = interventionType === t.key;
                return (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setInterventionType(t.key)}
                    className={`flex items-center gap-3 p-3 rounded-xl border text-left text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-teal-50/80 border-teal-500 text-teal-900 shadow-sm'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Intervention Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Intervention Notes & Protective Measures
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="e.g., Contacted victim regarding high distress ahead of court hearing. Arranged for female advocate accompaniment and psychological de-escalation..."
              className="w-full text-xs rounded-xl border border-slate-200 p-3 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50/50"
              required
            />
          </div>

          {/* Outcome & Follow-up */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Outcome Status
              </label>
              <select
                value={outcome}
                onChange={(e) => setOutcome(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-200 p-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="STABILIZED">Stabilized & De-escalated</option>
                <option value="FOLLOW_UP_REQUIRED">Follow-up Required (24-48h)</option>
                <option value="ATTENDING_HEARING_ACCOMPANIED">Accompaniment Assigned</option>
                <option value="ESCALATED_LEGAL">Escalated to Special Public Prosecutor</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Next Follow-Up Date
              </label>
              <input
                type="date"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-200 p-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-md shadow-teal-100 transition-all flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              {isSubmitting ? 'Recording...' : 'Log Human Intervention'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
