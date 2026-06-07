import React from 'react';
import { BookOpen, Clock, Edit2, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tag } from '@/components/Tag';
import { ProgressBar, StatusBadge } from '@/components/ProgressBar';
import type { Resource, Note, Tag as TagType } from '@/types';
import { fromNow, formatDuration } from '@/utils/date';

interface ResourceCardProps {
  resource: Resource;
  tags: TagType[];
  totalStudyTime?: number;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  className?: string;
  highlight?: string;
}

export const ResourceCard: React.FC<ResourceCardProps> = ({
  resource,
  tags,
  totalStudyTime = 0,
  onClick,
  onEdit,
  onDelete,
  className,
  highlight,
}) => {
  const resourceTags = tags.filter((t) => resource.tags.includes(t.id));

  const progressColor =
    resource.progress >= 100
      ? 'green'
      : resource.progress >= 50
      ? 'orange'
      : 'blue';

  return (
    <div
      onClick={onClick}
      className={cn(
        'group bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-300 cursor-pointer relative overflow-hidden',
        className
      )}
    >
      <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <div className="flex gap-1 p-2">
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="p-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <Edit2 size={14} className="text-gray-600 dark:text-gray-400" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-2 bg-gray-100 dark:bg-gray-700 hover:bg-red-100 rounded-lg transition-colors"
            >
              <Trash2 size={14} className="text-gray-600 dark:text-gray-400 hover:text-red-600" />
            </button>
          )}
        </div>
      </div>

      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-lg truncate group-hover:text-blue-600 transition-colors">
            {resource.title}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{resource.category}</p>
        </div>
        <StatusBadge status={resource.status} className="ml-2 flex-shrink-0" />
      </div>

      {resourceTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {resourceTags.slice(0, 3).map((tag) => (
            <Tag key={tag.id} tag={tag} size="sm" />
          ))}
          {resourceTags.length > 3 && (
            <span className="px-2 py-0.5 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-full">
              +{resourceTags.length - 3}
            </span>
          )}
        </div>
      )}

      <div className="space-y-3">
        <ProgressBar
          value={resource.progress}
          color={progressColor as 'green' | 'orange' | 'blue'}
          showLabel
          label="学习进度"
          size="sm"
        />

        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <BookOpen size={14} />
            <span>
              已学习 {totalStudyTime > 0 ? formatDuration(totalStudyTime) : '0分钟'}
            </span>
          </div>
          {resource.lastStudiedAt && (
            <div className="flex items-center gap-1">
              <Clock size={14} />
              <span>{fromNow(resource.lastStudiedAt)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface NoteCardProps {
  note: Note;
  resources: Resource[];
  tags: TagType[];
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  className?: string;
}

export const NoteCard: React.FC<NoteCardProps> = ({
  note,
  resources,
  tags,
  onClick,
  onEdit,
  onDelete,
  className,
}) => {
  const noteTags = tags.filter((t) => note.tags.includes(t.id));
  const linkedResources = resources.filter((r) => note.resourceIds.includes(r.id));

  return (
    <div
      onClick={onClick}
      className={cn(
        'group bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-300 cursor-pointer',
        className
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-lg truncate group-hover:text-blue-600 transition-colors">
          {note.title}
        </h3>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors"
            >
              <Edit2 size={14} />
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      {noteTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {noteTags.slice(0, 3).map((tag) => (
            <Tag key={tag.id} tag={tag} size="sm" />
          ))}
          {noteTags.length > 3 && (
            <span className="px-2 py-0.5 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-full">
              +{noteTags.length - 3}
            </span>
          )}
        </div>
      )}

      {linkedResources.length > 0 && (
        <div className="mb-3">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5">关联资料</p>
          <div className="flex flex-wrap gap-1.5">
            {linkedResources.slice(0, 2).map((resource) => (
              <span
                key={resource.id}
                className="px-2 py-0.5 text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-700 rounded-md truncate max-w-[120px]"
              >
                {resource.title}
              </span>
            ))}
            {linkedResources.length > 2 && (
              <span className="px-2 py-0.5 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-md">
                +{linkedResources.length - 2} 更多
              </span>
            )}
          </div>
        </div>
      )}

      <div className="text-sm text-gray-500 dark:text-gray-400">
        <p className="truncate">{fromNow(note.updatedAt)}</p>
      </div>
    </div>
  );
};

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  iconColor?: string;
  trend?: 'up' | 'down';
  trendValue?: string;
  className?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  iconColor = 'bg-blue-500',
  trend,
  trendValue,
  className,
}) => {
  return (
    <div
      className={cn(
        'bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition-shadow',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">{value}</p>
          {subtitle && <p className="text-sm text-gray-400 mt-1">{subtitle}</p>}
          {trend && trendValue && (
            <p
              className={cn(
                'text-sm font-medium mt-2',
                trend === 'up' ? 'text-emerald-600' : 'text-red-600'
              )}
            >
              {trend === 'up' ? '↑' : '↓'} {trendValue}
            </p>
          )}
        </div>
        {icon && (
          <div className={cn('p-3 rounded-xl text-white', iconColor)}>{icon}</div>
        )}
      </div>
    </div>
  );
};
