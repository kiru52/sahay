import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, Flame } from 'lucide-react';

export const RiskBadge = ({ riskLevel, score, showIcon = true, size = 'md' }) => {
  const level = (riskLevel || 'LOW').toUpperCase();
  
  const config = {
    CRITICAL: {
      bg: 'bg-rose-50 border-rose-200 text-rose-800',
      dot: 'bg-rose-600',
      icon: Flame,
      label: 'Critical',
      glow: 'shadow-sm shadow-rose-100'
    },
    HIGH: {
      bg: 'bg-amber-50 border-amber-200 text-amber-800',
      dot: 'bg-amber-600',
      icon: AlertTriangle,
      label: 'High Risk',
      glow: 'shadow-sm shadow-amber-100'
    },
    MODERATE: {
      bg: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      dot: 'bg-yellow-500',
      icon: AlertCircle,
      label: 'Moderate',
      glow: 'shadow-sm shadow-yellow-100'
    },
    LOW: {
      bg: 'bg-emerald-50 border-emerald-200 text-emerald-800',
      dot: 'bg-emerald-600',
      icon: CheckCircle2,
      label: 'Low / Stable',
      glow: 'shadow-sm shadow-emerald-100'
    }
  }[level] || {
    bg: 'bg-slate-50 border-slate-200 text-slate-700',
    dot: 'bg-slate-500',
    icon: CheckCircle2,
    label: level,
    glow: ''
  };

  const IconComponent = config.icon;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs font-semibold',
    md: 'px-2.5 py-1 text-xs font-semibold',
    lg: 'px-3.5 py-1.5 text-sm font-bold'
  }[size] || 'px-2.5 py-1 text-xs font-semibold';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border ${config.bg} ${config.glow} ${sizeClasses}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot} ${level === 'CRITICAL' ? 'animate-ping' : ''}`} />
      {showIcon && <IconComponent className="w-3.5 h-3.5 shrink-0" />}
      <span>{config.label}</span>
      {score !== undefined && (
        <span className="font-mono opacity-90">({score})</span>
      )}
    </span>
  );
};
