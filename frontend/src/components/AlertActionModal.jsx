import React, { useState } from 'react';
import { AlertTriangle, X, CheckCircle2, Phone, ArrowUpRight, Clock, Shield } from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

export const AlertActionModal = ({ isOpen, onClose, alert, onAlertUpdated, onOpenIntervention }) => {
  const { addToast } = useToast();
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !alert) return null;

  const handleAcknowledge = async () => {
    setIsSubmitting(true);
    try {
      const result = await api.acknowledgeAlert(alert.id, {
        assigned_to: 'Radha Krishnan (Senior Protection Officer)',
        notes: notes || 'Acknowledged by support worker. Reviewing victim trajectory.'
      });
      addToast(`Early warning alert #${alert.id} acknowledged.`, 'success');
      if (onAlertUpdated) onAlertUpdated(result);
      onClose();
    } catch (err) {
      console.error(err);
      addToast('Error acknowledging alert: ' + err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

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
          <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">🚨 Early Warning Distress Alert</h2>
            <p className="text-xs text-slate-500">Alert ID: #{alert.id} • Target: <span className="font-mono font-bold text-slate-800">{alert.victim_id}</span></p>
          </div>
        </div>

        {/* Alert Details Card */}
        <div className="bg-rose-50/70 border border-rose-200 rounded-2xl p-4 mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-rose-900 uppercase tracking-wider">
              {alert.alert_type?.replace('_', ' ')}
            </span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-600 text-white font-mono">
              Score: {alert.current_score} (+{alert.score_change} pts)
            </span>
          </div>
          
          <div className="text-xs text-rose-800 space-y-1 mt-2">
            <div>• <span className="font-semibold">Previous Score:</span> {alert.previous_score} → <span className="font-semibold">Current Score:</span> {alert.current_score}</div>
            <div>• <span className="font-semibold">Potential Factors:</span> Marked deviation from personal baseline, elevated vocal tremor indicators, imminent court milestone.</div>
            <div>• <span className="font-semibold">Recommended Protocol:</span> Immediate human-in-the-loop psychological accompaniment check.</div>
          </div>
        </div>

        {/* Action Notes */}
        <div className="mb-4">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Acknowledgment / Triage Note
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="e.g., Acknowledged spike. Immediate phone contact initiated with victim..."
            className="w-full text-xs rounded-xl border border-slate-200 p-3 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-slate-50/50"
          />
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={handleAcknowledge}
            disabled={isSubmitting}
            className="py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-sm flex items-center justify-center gap-1.5 transition-all"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            {isSubmitting ? 'Acknowledging...' : 'Acknowledge Alert'}
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              if (onOpenIntervention) onOpenIntervention();
            }}
            className="py-2.5 px-3 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-sm shadow-teal-100 flex items-center justify-center gap-1.5 transition-all"
          >
            <Phone className="w-4 h-4" />
            Contact & Intervene
          </button>
        </div>
      </div>
    </div>
  );
};
