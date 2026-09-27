import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';
import { Sparkles, Info } from 'lucide-react';

export const ShapWaterfallChart = ({ shapValues, baselineScore = 32.0, finalScore = 89.0 }) => {
  const factorLabels = {
    baseline_deviation: 'Change from Personal Baseline',
    text_sentiment: 'Negative Text Sentiment & Distress Keywords',
    voice_stress: 'Voice Stress & Acoustic Hesitations',
    upcoming_case_event: 'Upcoming Court Hearing Proximity',
    upcoming_event: 'Upcoming Court Hearing Proximity',
    engagement_delay: 'Engagement Delay / Avoidance Pattern'
  };

  const rawValues = shapValues || {
    baseline_deviation: 18.2,
    text_sentiment: 14.0,
    voice_stress: 10.5,
    upcoming_case_event: 12.0,
    engagement_delay: 3.5
  };

  const data = Object.entries(rawValues).map(([key, value]) => ({
    name: factorLabels[key] || key.replace('_', ' ').toUpperCase(),
    impact: Math.round(value * 10) / 10,
    rawKey: key
  })).sort((a, b) => b.impact - a.impact);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-semibold text-slate-900">
              Explainable AI — Risk Contributor Decomposition (SHAP-Style)
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Additive feature attribution showing exactly why distress increased above calibrated baseline.
          </p>
        </div>
        <div className="text-right shrink-0">
          <div className="text-xs text-slate-500 font-medium">Calibrated Baseline: <span className="font-bold text-slate-800">{baselineScore}</span></div>
          <div className="text-sm font-bold text-rose-600">Final Score: {finalScore} / 100</div>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <XAxis type="number" domain={[0, 'dataMax + 5']} tick={{ fontSize: 11, fill: '#64748b' }} unit=" pts" />
            <YAxis
              dataKey="name"
              type="category"
              tick={{ fontSize: 11, fill: '#334155', fontWeight: 500 }}
              width={220}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload;
                  return (
                    <div className="bg-slate-900 text-white text-xs p-2.5 rounded-lg shadow-xl border border-slate-700">
                      <div className="font-semibold text-indigo-300">{item.name}</div>
                      <div className="text-white mt-1">
                        Contribution: <span className="font-bold text-rose-400">+{item.impact} points</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">SHAP Additive Factor Attribution</div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="impact" radius={[0, 6, 6, 0]}>
              {data.map((entry, index) => {
                const color =
                  entry.impact >= 15
                    ? '#e11d48' // Rose-600
                    : entry.impact >= 10
                    ? '#ea580c' // Orange-600
                    : entry.impact >= 5
                    ? '#d97706' // Amber-600
                    : '#0d9488'; // Teal-600
                return <Cell key={`cell-${index}`} fill={color} />;
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-slate-400" />
          <span>Transparent decision-support: Non-blackbox model explanation.</span>
        </div>
        <span className="text-slate-400 text-[11px]">Model: sahay-multimodal-v1.0 (SHAP Kernel)</span>
      </div>
    </div>
  );
};
