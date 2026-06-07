import React from 'react';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  value: number;
  max?: number;
  showLabel?: boolean;
  label?: string;
  color?: 'blue' | 'green' | 'emerald' | 'yellow' | 'orange' | 'red' | 'purple';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const colorClasses = {
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  emerald: 'bg-emerald-500',
  yellow: 'bg-yellow-400',
  orange: 'bg-amber-500',
  red: 'bg-red-500',
  purple: 'bg-purple-500',
};

const progressSizeClasses = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
};

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  showLabel = false,
  label,
  color = 'blue',
  size = 'md',
  className,
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const displayLabel = label || `${Math.round(percentage)}%`;

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between mb-1">
          <span className="text-sm text-gray-600 dark:text-gray-400">{displayLabel}</span>
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{Math.round(percentage)}%</span>
        </div>
      )}
      <div className={cn('w-full bg-gray-200 rounded-full overflow-hidden', progressSizeClasses[size])}>
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500 ease-out',
            colorClasses[color]
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

interface StatusBadgeProps {
  status: 'not_started' | 'learning' | 'completed';
  size?: 'sm' | 'md';
  className?: string;
}

const statusConfig = {
  not_started: {
    label: '未开始',
    bgColor: 'bg-gray-100 dark:bg-gray-700',
    textColor: 'text-gray-600 dark:text-gray-400',
    dotColor: 'bg-gray-400',
  },
  learning: {
    label: '学习中',
    bgColor: 'bg-amber-50 dark:bg-amber-900/20',
    textColor: 'text-amber-700',
    dotColor: 'bg-amber-500',
  },
  completed: {
    label: '已完成',
    bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
    textColor: 'text-emerald-700',
    dotColor: 'bg-emerald-500',
  },
};

const badgeSizeClasses = {
  sm: 'px-2 py-0.5 text-[10px] gap-1',
  md: 'px-2.5 py-1 text-xs gap-1.5',
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md', className }) => {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        badgeSizeClasses[size],
        config.bgColor,
        config.textColor,
        className
      )}
    >
      <span className={cn('rounded-full', size === 'sm' ? 'w-1 h-1' : 'w-1.5 h-1.5', config.dotColor)} />
      {config.label}
    </span>
  );
};
