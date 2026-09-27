import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { TrendingUp, AlertTriangle } from 'lucide-react';

export const DistressTrajectoryChart = ({ trajectoryData = [], baseline = 32.0 }) => {
  const data = trajectoryData.length > 0 ? trajectoryData : [
    { timestamp: '4 wks ago', date: '2026-08-05', score: 32, baseline: 32, risk_level: 'LOW' },
    { timestamp: '3 wks ago', date: '2026-08-12', score: 34, baseline: 32, risk_level: 'LOW' },
    { timestamp: '2 wks ago', date: '2026-08-19', score: 38, baseline: 32, risk_level: 'MODERATE' },
    { timestamp: '1 wk ago', date: '2026-08-26', score: 58, baseline: 32, risk_level: 'MODERATE' },
    { timestamp: 'Yesterday', date: '2026-09-01', score: 89, baseline: 32, risk_level: 'CRITICAL' }
  ];

  const latestScore = data[data.length - 1]?.score || baseline;
  const baselineDelta = Math.round((latestScore - baseline) * 10) / 10;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-teal-600" />
            <h3 className="text-base font-semibold text-slate-900">
              Longitudinal Distress Trajectory vs Personal Baseline
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Tracking deviation from the victim's calibrated personal baseline over the case journey.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            Baseline: <span className="font-bold">{baseline}</span>
          </span>
          <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-semibold border ${
            baselineDelta > 20
              ? 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse-subtle'
              : 'bg-teal-50 text-teal-700 border-teal-200'
          }`}>
            Deviation: <span className="font-bold">{baselineDelta >= 0 ? `+${baselineDelta}` : baselineDelta}</span>
          </span>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="distressGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#e11d48" stopOpacity={0.4} />
                <stop offset="60%" stopColor="#f59e0b" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="timestamp"
              tick={{ fontSize: 11, fill: '#64748b' }}
              axisLine={{ stroke: '#cbd5e1' }}
            />
            <YAxis
              domain={[0, 100]}
              ticks={[0, 30, 60, 80, 100]}
              tick={{ fontSize: 11, fill: '#64748b' }}
              axisLine={{ stroke: '#cbd5e1' }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload;
                  return (
                    <div className="bg-slate-900 text-white text-xs p-3 rounded-xl shadow-xl border border-slate-700">
                      <div className="text-slate-400 font-medium mb-1">{d.timestamp} ({d.date})</div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-slate-300">Distress Score:</span>
                        <span className="text-base font-bold text-rose-400">{d.score} / 100</span>
                      </div>
                      <div className="text-slate-400">
                        Personal Baseline: <span className="text-slate-200 font-semibold">{baseline}</span>
                      </div>
                      <div className="text-amber-400 font-semibold mt-1">
                        Deviation: +{Math.round((d.score - baseline) * 10) / 10} pts
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            {/* Calibrated Baseline Reference */}
            <ReferenceLine
              y={baseline}
              stroke="#0d9488"
              strokeDasharray="4 4"
              strokeWidth={2}
              label={{ value: `Baseline (${baseline})`, fill: '#0d9488', fontSize: 11, position: 'insideTopRight' }}
            />
            {/* Risk Thresholds */}
            <ReferenceLine y={60} stroke="#f59e0b" strokeDasharray="2 2" strokeWidth={1} label={{ value: 'High Risk (60)', fill: '#d97706', fontSize: 9 }} />
            <ReferenceLine y={80} stroke="#ef4444" strokeDasharray="2 2" strokeWidth={1} label={{ value: 'Critical (80)', fill: '#dc2626', fontSize: 9 }} />
            <Area
              type="monotone"
              dataKey="score"
              stroke="#e11d48"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#distressGradient)"
              dot={{ r: 4, fill: '#e11d48', strokeWidth: 2, stroke: '#ffffff' }}
              activeDot={{ r: 6, fill: '#be123c', stroke: '#ffffff', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-4 gap-2 text-center text-[11px]">
        <div className="bg-emerald-50 rounded-lg py-1.5 px-2 border border-emerald-100 text-emerald-800 font-medium">
          Low: 0–30
        </div>
        <div className="bg-yellow-50 rounded-lg py-1.5 px-2 border border-yellow-100 text-yellow-800 font-medium">
          Moderate: 31–60
        </div>
        <div className="bg-amber-50 rounded-lg py-1.5 px-2 border border-amber-100 text-amber-800 font-medium">
          High: 61–80
        </div>
        <div className="bg-rose-50 rounded-lg py-1.5 px-2 border border-rose-100 text-rose-800 font-medium">
          Critical: 81–100
        </div>
      </div>
    </div>
  );
};
