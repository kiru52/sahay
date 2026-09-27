import React, { useState } from 'react';
import { PlayCircle, ArrowRight, CheckCircle, Sparkles, ChevronRight, X, ShieldAlert } from 'lucide-react';
import { useAuth, ROLES } from '../context/AuthContext';

export const DemoWorkflowBar = ({ onSelectVictim, currentView, onViewChange }) => {
  const { switchRole, role } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isMinimized, setIsMinimized] = useState(false);

  const steps = [
    {
      id: 1,
      title: '1. Support Worker Overview',
      desc: 'View active case load (248 cases) across districts with most cases in stable state.',
      action: () => {
        switchRole(ROLES.SUPPORT_WORKER);
        if (onViewChange) onViewChange('SUPPORT_WORKER');
      }
    },
    {
      id: 2,
      title: '2. Spot Escalated Alert (V-1042)',
      desc: 'Identify flagged case V-1042 with sudden distress escalation (+31 pts) 2 days prior to hearing.',
      action: () => {
        switchRole(ROLES.SUPPORT_WORKER);
        if (onViewChange) onViewChange('SUPPORT_WORKER');
      }
    },
    {
      id: 3,
      title: '3. Deep Dive Case Profile',
      desc: 'Inspect personal baseline (32) vs current score (89), voice acoustic tremors, and upcoming hearing.',
      action: () => {
        switchRole(ROLES.SUPPORT_WORKER);
        if (onSelectVictim) onSelectVictim('V-1042');
        if (onViewChange) onViewChange('VICTIM_PROFILE');
      }
    },
    {
      id: 4,
      title: '4. Explainable AI (SHAP)',
      desc: 'Review transparent additive risk contributors (+18 Baseline, +12 Sentiment, +8 Voice, +6 Hearing).',
      action: () => {
        switchRole(ROLES.SUPPORT_WORKER);
        if (onSelectVictim) onSelectVictim('V-1042');
        if (onViewChange) onViewChange('VICTIM_PROFILE');
      }
    },
    {
      id: 5,
      title: '5. Human Intervention Flow',
      desc: 'Acknowledge early warning alert and log proactive counseling / court accompaniment.',
      action: () => {
        switchRole(ROLES.SUPPORT_WORKER);
        if (onSelectVictim) onSelectVictim('V-1042');
        if (onViewChange) onViewChange('VICTIM_PROFILE');
      }
    },
    {
      id: 6,
      title: '6. Beneficiary Safe Portal',
      desc: 'Experience victim perspective: non-diagnostic well-being check-in and voice recording.',
      action: () => {
        switchRole(ROLES.VICTIM, 'V-1042');
        if (onViewChange) onViewChange('VICTIM_DASHBOARD');
      }
    },
    {
      id: 7,
      title: '7. District Admin Analytics',
      desc: 'Review macro district risk distribution, model validation targets, and national scale roadmap.',
      action: () => {
        switchRole(ROLES.ADMIN);
        if (onViewChange) onViewChange('ADMIN_DASHBOARD');
      }
    }
  ];

  const handleStepClick = (step) => {
    setCurrentStep(step.id);
    step.action();
  };

  const handleNext = () => {
    const nextIdx = currentStep < steps.length ? currentStep : 0;
    const nextStep = steps[nextIdx];
    handleStepClick(nextStep);
  };

  if (isMinimized) {
    return (
      <div className="bg-slate-900 text-white px-4 py-2 flex items-center justify-between text-xs border-b border-slate-800 shadow-md">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span className="font-semibold text-slate-200">SIH 2026 Jury Demo Flow Mode</span>
          <span className="text-slate-400 font-mono">Step {currentStep} of {steps.length}</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleNext}
            className="px-3 py-1 bg-teal-600 hover:bg-teal-500 rounded-lg text-xs font-bold text-white flex items-center gap-1 transition-all"
          >
            Next Step <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setIsMinimized(false)}
            className="text-slate-400 hover:text-white underline text-[11px]"
          >
            Expand Guide
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white border-b border-slate-800/80 shadow-lg px-4 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">SIH 2026 Interactive Demo Flow</span>
              <span className="text-[10px] bg-indigo-500/30 text-indigo-200 px-2 py-0.5 rounded-full border border-indigo-400/20">
                Story: "SAHAY detected the change before crisis"
              </span>
            </div>
            <p className="text-xs text-slate-300 font-medium">
              {steps[currentStep - 1].desc}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 shrink-0">
          <div className="flex items-center gap-1">
            {steps.map((s) => (
              <button
                key={s.id}
                onClick={() => handleStepClick(s)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  currentStep === s.id
                    ? 'bg-teal-600 text-white shadow-md shadow-teal-900 border border-teal-400'
                    : currentStep > s.id
                    ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                    : 'bg-slate-900/60 text-slate-400 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                {currentStep > s.id && <CheckCircle className="w-3 h-3 text-emerald-400" />}
                <span>{s.id}. {s.title.split('. ')[1]}</span>
              </button>
            ))}
          </div>

          <button
            onClick={handleNext}
            className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg shadow-md flex items-center gap-1 shrink-0 transition-all"
          >
            Next Step <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setIsMinimized(true)}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 shrink-0"
            title="Minimize banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
