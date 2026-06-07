import React, { useState } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Tag as TagType } from '@/types';

interface TagProps {
  tag: TagType;
  onRemove?: () => void;
  onClick?: () => void;
  size?: 'xs' | 'sm' | 'md';
  className?: string;
}

export const Tag: React.FC<TagProps> = ({ tag, onRemove, onClick, size = 'md', className }) => {
  const sizeClasses = {
    xs: 'px-1.5 py-0.5 text-[10px]',
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  }[size];

  return (
    <span
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-medium transition-all',
        sizeClasses,
        onClick && 'cursor-pointer hover:opacity-80',
        className
      )}
      style={{
        backgroundColor: `${tag.color}15`,
        color: tag.color,
        border: `1px solid ${tag.color}30`,
      }}
    >
      {tag.name}
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-1 rounded-full p-0.5 hover:bg-black/10 transition-colors"
        >
          <X size={12} />
        </button>
      )}
    </span>
  );
};

interface TagInputProps {
  tags: TagType[];
  selectedTagIds: string[];
  onAddTag: (name: string) => void;
  onRemoveTag: (tagId: string) => void;
  placeholder?: string;
  className?: string;
}

export const TagInput: React.FC<TagInputProps> = ({
  tags,
  selectedTagIds,
  onAddTag,
  onRemoveTag,
  placeholder = '输入标签名，按回车添加',
  className,
}) => {
  const [value, setValue] = useState('');

  const selectedTags = tags.filter((t) => selectedTagIds.includes(t.id));

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && value.trim()) {
      e.preventDefault();
      onAddTag(value.trim());
      setValue('');
    }
  };

  return (
    <div className={cn('flex flex-wrap gap-2 p-3 border rounded-lg bg-white dark:bg-gray-800', className)}>
      {selectedTags.map((tag) => (
        <Tag key={tag.id} tag={tag} size="sm" onRemove={() => onRemoveTag(tag.id)} />
      ))}
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={selectedTags.length === 0 ? placeholder : ''}
        className="flex-1 min-w-[120px] bg-transparent border-none outline-none text-sm"
      />
    </div>
  );
};

interface TagCloudProps {
  tags: Array<{ tag: TagType; count: number }>;
  onTagClick?: (tag: TagType) => void;
  selectedTagIds?: string[];
  className?: string;
}

export const TagCloud: React.FC<TagCloudProps> = ({
  tags,
  onTagClick,
  selectedTagIds = [],
  className,
}) => {
  if (tags.length === 0) return null;

  const maxCount = Math.max(...tags.map((t) => t.count), 1);

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {tags.map(({ tag, count }) => {
        const isSelected = selectedTagIds.includes(tag.id);
        const scale = 0.85 + (count / maxCount) * 0.3;

        return (
          <button
            key={tag.id}
            onClick={() => onTagClick?.(tag)}
            className={cn(
              'px-3 py-1 rounded-full text-sm font-medium transition-all',
              isSelected ? 'ring-2 ring-offset-1' : 'hover:opacity-80'
            )}
            style={{
              backgroundColor: isSelected ? tag.color : `${tag.color}15`,
              color: isSelected ? 'white' : tag.color,
              border: `1px solid ${tag.color}30`,
              transform: `scale(${scale})`,
              ['--tw-ring-color' as any]: tag.color,
            }}
          >
            {tag.name}
            <span className="ml-1 opacity-70 text-xs">{count}</span>
          </button>
        );
      })}
    </div>
  );
};
