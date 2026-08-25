import React from 'react';
import { PriorityLevel } from '../types';

interface BadgeProps {
  priority?: PriorityLevel | string;
  severity?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Badge: React.FC<BadgeProps> = ({ priority, severity, size = 'md' }) => {
  const val = (priority || severity || '').toUpperCase();
  
  let bgClass = 'bg-slate-700 text-slate-200 border-slate-600';
  let dotColor = 'bg-slate-400';

  if (val === 'IMMEDIATE' || val === 'CRITICAL' || val === 'VERY HIGH') {
    bgClass = 'bg-accent-red/15 text-accent-red border-accent-red/40 shadow-sm shadow-accent-red/20';
    dotColor = 'bg-accent-red animate-pulse';
  } else if (val === 'SHORT_TERM' || val === 'SHORT-TERM' || val === 'HIGH') {
    bgClass = 'bg-accent-orange/15 text-accent-orange border-accent-orange/40';
    dotColor = 'bg-accent-orange';
  } else if (val === 'MEDIUM_TERM' || val === 'MEDIUM-TERM' || val === 'MODERATE') {
    bgClass = 'bg-accent-amber/15 text-accent-amber border-accent-amber/40';
    dotColor = 'bg-accent-amber';
  } else if (val === 'MONITOR' || val === 'LOW' || val === 'SAFE' || val === 'SUITABLE' || val === 'HIGHLY_SUITABLE') {
    bgClass = 'bg-accent-teal/15 text-accent-teal border-accent-teal/40';
    dotColor = 'bg-accent-teal';
  }

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs font-medium',
    md: 'px-2.5 py-1 text-xs font-semibold',
    lg: 'px-3 py-1.5 text-sm font-bold',
  }[size];

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border ${bgClass} ${sizeClasses}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      <span>{priority || severity}</span>
    </span>
  );
};
