import React from 'react';
import { Calendar, AlertCircle, CheckCircle2, Clock, Scale, Shield, FileText, HeartHandshake } from 'lucide-react';

export const CaseTimeline = ({ cases = [], timelineEvents = [] }) => {
  const currentCase = cases[0] || {
    case_number: 'FIR/2026/CHE/8842',
    current_stage: 'HEARING',
    police_station: 'Royapettah All-Women PS',
    filing_date: '2026-08-01',
    events: [
      {
        id: 1,
        event_title: 'Formal FIR Registration & Initial Statement',
        event_type: 'STATEMENT',
        event_date: '2026-08-03',
        description: 'First Information Report recorded under SC/ST (POA) Act.',
        stress_relevance: 'HIGH',
        is_completed: true
      },
      {
        id: 2,
        event_title: 'Principal Sessions Court Hearing & Witness Deposition',
        event_type: 'HEARING',
        event_date: '2026-09-04',
        description: 'Cross-examination milestone scheduled before Session Judge. Critical stress point.',
        stress_relevance: 'HIGH',
        is_completed: false
      }
    ]
  };

  const stages = [
    { key: 'CASE_FILED', label: 'Case Filed', icon: FileText },
    { key: 'INVESTIGATION', label: 'Investigation', icon: Shield },
    { key: 'STATEMENT', label: 'Statement (164)', icon: FileText },
    { key: 'HEARING', label: 'Court Hearing', icon: Scale },
    { key: 'JUDGEMENT', label: 'Judgement', icon: Scale },
    { key: 'REHABILITATION', label: 'Rehabilitation', icon: HeartHandshake }
  ];

  const currentStageIndex = stages.findIndex((s) => s.key === currentCase.current_stage);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-semibold text-slate-900">
              Case Journey & Upcoming Judicial Stress Milestones
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            "Existing systems track the CASE; SAHAY tracks the changing WELL-BEING of the victim throughout the case journey."
          </p>
        </div>
        <div className="text-xs font-mono font-semibold bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full border border-indigo-200">
          Case: {currentCase.case_number}
        </div>
      </div>

      {/* Case Stage Stepper */}
      <div className="py-3 px-2 overflow-x-auto">
        <div className="flex items-center min-w-[550px] justify-between relative">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-200 -translate-y-1/2 z-0" />
          {stages.map((stage, idx) => {
            const isCompleted = idx < currentStageIndex;
            const isCurrent = idx === currentStageIndex;
            const Icon = stage.icon;

            return (
              <div key={stage.key} className="relative z-10 flex flex-col items-center group">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all ${
                    isCurrent
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-200 scale-110'
                      : isCompleted
                      ? 'bg-emerald-600 border-emerald-600 text-white'
                      : 'bg-white border-slate-300 text-slate-400'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                </div>
                <span
                  className={`text-[11px] mt-2 font-medium text-center ${
                    isCurrent ? 'text-indigo-700 font-bold' : isCompleted ? 'text-slate-700' : 'text-slate-400'
                  }`}
                >
                  {stage.label}
                </span>
                {isCurrent && (
                  <span className="text-[9px] uppercase font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded mt-0.5">
                    Current Stage
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Specific Events List */}
      <div className="mt-5 space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Key Case Events & Stress Relevance
        </h4>
        <div className="space-y-2.5">
          {(currentCase.events || []).map((ev, i) => {
            const isHighStress = ev.stress_relevance === 'HIGH';
            return (
              <div
                key={i}
                className={`p-3.5 rounded-xl border flex items-start justify-between gap-3 ${
                  !ev.is_completed && isHighStress
                    ? 'bg-rose-50/70 border-rose-200'
                    : ev.is_completed
                    ? 'bg-slate-50 border-slate-200 opacity-80'
                    : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2 rounded-lg mt-0.5 ${
                      !ev.is_completed && isHighStress
                        ? 'bg-rose-100 text-rose-700'
                        : ev.is_completed
                        ? 'bg-slate-200 text-slate-600'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {ev.is_completed ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <Calendar className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-900">{ev.event_title}</span>
                      {isHighStress && !ev.is_completed && (
                        <span className="text-[10px] bg-rose-600 text-white font-bold px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse-subtle">
                          <AlertCircle className="w-3 h-3" /> Potential Stress Point
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mt-1">{ev.description}</p>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-2">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(ev.event_date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                      <span>•</span>
                      <span className="font-medium text-slate-700">Type: {ev.event_type}</span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  {ev.is_completed ? (
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-100/70 px-2.5 py-1 rounded-md">
                      Completed
                    </span>
                  ) : (
                    <span className="text-xs font-semibold text-amber-700 bg-amber-100/70 px-2.5 py-1 rounded-md">
                      Upcoming
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
