import React from 'react';
import { PriorityLevel } from '../types';

interface BadgeProps {
  priority?: PriorityLevel | string;
  severity?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Badge: React.FC<BadgeProps> = ({ priority, severity, size = 'md' }) => {
  const val = (priority || severity || '').toUpperCase();
  
  let bgClass = 'bg-[#F1F5F9] text-[#334155] border-[#E2E8F0]';
  let dotColor = 'bg-[#64748B]';

  if (val === 'IMMEDIATE' || val === 'CRITICAL' || val === 'VERY HIGH') {
    bgClass = 'bg-rose-50 text-rose-700 border-rose-200 font-semibold';
    dotColor = 'bg-rose-500 animate-pulse';
  } else if (val === 'SHORT_TERM' || val === 'SHORT-TERM' || val === 'HIGH') {
    bgClass = 'bg-amber-50 text-amber-700 border-amber-200 font-semibold';
    dotColor = 'bg-amber-500';
  } else if (val === 'MEDIUM_TERM' || val === 'MEDIUM-TERM' || val === 'MODERATE') {
    bgClass = 'bg-indigo-50 text-indigo-700 border-indigo-200 font-semibold';
    dotColor = 'bg-indigo-500';
  } else if (val === 'MONITOR' || val === 'LOW' || val === 'SAFE' || val === 'SUITABLE' || val === 'HIGHLY_SUITABLE') {
    bgClass = 'bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold';
    dotColor = 'bg-emerald-500';
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
