import React from 'react';
import {
  Layers,
  MapPin,
  Building,
  TrendingUp,
  Shield,
  HeartHandshake,
  CheckCircle2,
  Scale,
  Sparkles,
  Award,
  Users
} from 'lucide-react';

export const AboutSystemPage = () => {
  const roadmapStages = [
    {
      stage: 'Phase 1: MVP (Current)',
      scale: 'Smart India Hackathon Prototype',
      desc: 'Multimodal distress prediction, personalized baseline calibration, SHAP explainability, and multi-language support (EN, HI, TA).',
      badge: 'Active & Verified',
      color: 'bg-teal-50 border-teal-200 text-teal-800'
    },
    {
      stage: 'Phase 2: Pilot Deployment',
      scale: 'Selected 5 One Stop Centres (OSCs)',
      desc: 'Field testing with 500+ active atrocity case beneficiaries and 20 protection officers in Chennai & Madurai districts.',
      badge: 'Target: Q4 2026',
      color: 'bg-indigo-50 border-indigo-200 text-indigo-800'
    },
    {
      stage: 'Phase 3: District Scale',
      scale: 'District-wide Integration',
      desc: 'Full linkage with District Legal Services Authority (DLSA), Special Courts for Atrocities, and Sakhi Crisis Centres.',
      badge: 'Target: 2027',
      color: 'bg-amber-50 border-amber-200 text-amber-800'
    },
    {
      stage: 'Phase 4: State Department',
      scale: 'State Social Welfare Directorate',
      desc: 'Centralized state dashboard with cross-district resource allocation and proactive witness protection escort dispatching.',
      badge: 'Target: 2028',
      color: 'bg-blue-50 border-blue-200 text-blue-800'
    },
    {
      stage: 'Phase 5: National Deployment',
      scale: 'National Women & Child Safety Mission',
      desc: 'Pan-India multilingual cloud infrastructure supporting millions of case journeys with federated privacy-preserving models.',
      badge: 'National Vision',
      color: 'bg-emerald-50 border-emerald-200 text-emerald-800'
    }
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      
      {/* Product Vision & Mission */}
      <div className="bg-gradient-to-br from-slate-900 via-teal-950 to-indigo-950 text-white rounded-3xl p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-300 bg-teal-900/60 px-3 py-1 rounded-full border border-teal-700/60">
            Product Architecture & Sustainability
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-3">
            SAHAY Product Vision & Scalability
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mt-2 font-medium">
            "Existing systems track the CASE; SAHAY tracks the changing WELL-BEING of the victim throughout the case journey."
          </p>

          <div className="mt-6 flex items-center gap-3 text-xs font-bold text-teal-300">
            <span className="bg-teal-900/80 px-3 py-1.5 rounded-xl border border-teal-700/50">
              ⚡ Detect Change
            </span>
            <span>→</span>
            <span className="bg-indigo-900/80 px-3 py-1.5 rounded-xl border border-indigo-700/50">
              🔍 Understand Context
            </span>
            <span>→</span>
            <span className="bg-amber-900/80 px-3 py-1.5 rounded-xl border border-amber-700/50">
              🛡️ Act Early
            </span>
          </div>
        </div>
      </div>

      {/* Core Architectural Differentiator */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
        <h2 className="text-base font-bold text-slate-900 mb-2">
          The 6-Stage Multimodal Decision Loop
        </h2>
        <p className="text-xs text-slate-500 mb-6 max-w-2xl">
          How SAHAY transforms subtle multimodal signals into timely, life-saving human interventions.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-6 gap-2 text-center text-xs">
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="w-8 h-8 mx-auto rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold mb-2">1</div>
            <div className="font-bold text-slate-900">Personal Baseline</div>
            <p className="text-[10px] text-slate-500 mt-1">Calibrated reference state</p>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="w-8 h-8 mx-auto rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold mb-2">2</div>
            <div className="font-bold text-slate-900">Multimodal Signals</div>
            <p className="text-[10px] text-slate-500 mt-1">Text, voice & check-in cadence</p>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="w-8 h-8 mx-auto rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold mb-2">3</div>
            <div className="font-bold text-slate-900">Case Context</div>
            <p className="text-[10px] text-slate-500 mt-1">Imminent court milestones</p>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="w-8 h-8 mx-auto rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold mb-2">4</div>
            <div className="font-bold text-slate-900">AI Risk Analysis</div>
            <p className="text-[10px] text-slate-500 mt-1">Deviation calculation & SHAP</p>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="w-8 h-8 mx-auto rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold mb-2">5</div>
            <div className="font-bold text-slate-900">Early Warning</div>
            <p className="text-[10px] text-slate-500 mt-1">Threshold-triggered alert</p>
          </div>

          <div className="p-3 bg-teal-50 rounded-2xl border border-teal-200">
            <div className="w-8 h-8 mx-auto rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold mb-2">6</div>
            <div className="font-bold text-teal-900">Human Action</div>
            <p className="text-[10px] text-teal-700 mt-1">Counselor accompaniment</p>
          </div>
        </div>
      </div>

      {/* Scalability Roadmap (Section 15) */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
        <h2 className="text-base font-bold text-slate-900 mb-2">
          Deployment & Scalability Roadmap
        </h2>
        <p className="text-xs text-slate-500 mb-6">
          Architected for tiered expansion from initial One Stop Centre pilots to national-level infrastructure.
        </p>

        <div className="space-y-3">
          {roadmapStages.map((s, i) => (
            <div key={i} className={`p-4 rounded-2xl border ${s.color} flex flex-col md:flex-row md:items-center justify-between gap-3`}>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">{s.stage}</span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-white/80 border">
                    {s.scale}
                  </span>
                </div>
                <p className="text-xs mt-1 leading-relaxed">{s.desc}</p>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-white/90 shrink-0 self-start md:self-auto shadow-xs">
                {s.badge}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Sustainable Business Model (Section 16) */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
        <h2 className="text-base font-bold text-slate-900 mb-2">
          Sustainability & Operating Model (B2G / Institutional)
        </h2>
        <p className="text-xs text-slate-500 mb-6">
          Ethical, sustainable procurement and support structure.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
              🏛️ Who Pays (Procuring Entities)
            </div>
            <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
              <li>Ministry of Women & Child Development (Nirbhaya Fund allocations)</li>
              <li>State Social Welfare & Adi Dravidar / Tribal Welfare Departments</li>
              <li>District Legal Services Authorities (DLSA)</li>
              <li>Accredited Non-Governmental Atrocity Support Organizations</li>
            </ul>
          </div>

          <div className="p-5 rounded-2xl bg-teal-50/60 border border-teal-200">
            <div className="text-xs font-bold text-teal-950 uppercase tracking-wider mb-2">
              🛡️ Zero-Cost Access for Beneficiaries
            </div>
            <p className="text-xs text-teal-900 leading-relaxed">
              <strong>Victims and beneficiaries are NEVER charged.</strong> Access is 100% free, confidential, and provided as a statutory public support service through government-backed One Stop Centres.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
