import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Edit2,
  Trash2,
  Play,
  Pause,
  Plus,
  BookOpen,
  Clock,
  Tag as TagIcon,
} from 'lucide-react';
import { Tag } from '@/components/Tag';
import { ProgressBar, StatusBadge } from '@/components/ProgressBar';
import { useStore } from '@/store';
import { renderMarkdown } from '@/utils/markdown';
import { formatDateTime, fromNow, formatDuration, dayjs } from '@/utils/date';

const ResourceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    resources,
    notes,
    tags,
    learningRecords,
    updateResource,
    deleteResource,
    startTracking,
    stopTracking,
  } = useStore();

  const [isTracking, setIsTracking] = useState(false);
  const [trackedTime, setTrackedTime] = useState(0);
  const [trackingTimer, setTrackingTimer] = useState<ReturnType<typeof setInterval> | null>(null);

  const resource = resources.find((r) => r.id === id);
  const resourceNotes = notes.filter((n) => n.resourceIds.includes(id!));
  const resourceTags = tags.filter((t) => resource?.tags.includes(t.id));
  const totalStudyTime = learningRecords
    .filter((r) => r.resourceId === id)
    .reduce((sum, r) => sum + r.duration, 0);

  useEffect(() => {
    return () => {
      if (trackingTimer) {
        clearInterval(trackingTimer);
      }
      stopTracking();
    };
  }, []);

  const toggleTracking = () => {
    if (isTracking) {
      if (trackingTimer) {
        clearInterval(trackingTimer);
        setTrackingTimer(null);
      }
      stopTracking();
      setIsTracking(false);
    } else {
      if (id) {
        startTracking(id);
        setIsTracking(true);
        setTrackedTime(0);
        const timer = setInterval(() => {
          setTrackedTime((prev) => prev + 1);
        }, 60000);
        setTrackingTimer(timer);
      }
    }
  };

  const handleProgressChange = (newProgress: number) => {
    if (id) {
      const status =
        newProgress >= 100
          ? 'completed'
          : newProgress > 0
          ? 'learning'
          : 'not_started';
      updateResource(id, { progress: newProgress, status });
    }
  };

  const handleDelete = () => {
    if (confirm('确定要删除这份资料吗？相关的学习记录也会被删除。')) {
      if (id) {
        deleteResource(id);
        navigate('/');
      }
    }
  };

  if (!resource) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400 mb-4">资料不存在</p>
        <button
          onClick={() => navigate('/')}
          className="text-blue-600 hover:text-blue-700"
        >
          返回列表
        </button>
      </div>
    );
  }

  const progressColor =
    resource.progress >= 100 ? 'green' : resource.progress >= 50 ? 'orange' : 'blue';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>返回</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTracking}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              isTracking
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-emerald-500 hover:bg-emerald-600 text-white'
            }`}
          >
            {isTracking ? <Pause size={18} /> : <Play size={18} />}
            {isTracking ? '停止计时' : '开始学习'}
          </button>
          <button
            onClick={() => navigate(`/resource/${id}/edit`)}
            className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
          >
            <Edit2 size={18} />
          </button>
          <button
            onClick={handleDelete}
            className="p-2 text-gray-500 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 rounded-lg transition-colors"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{resource.title}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{resource.category}</p>
          </div>
          <StatusBadge status={resource.status} />
        </div>

        {resourceTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {resourceTags.map((tag) => (
              <Tag key={tag.id} tag={tag} size="sm" />
            ))}
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-1">
              <BookOpen size={14} />
              <span>学习进度</span>
            </div>
            <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{resource.progress}%</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-1">
              <Clock size={14} />
              <span>累计学习</span>
            </div>
            <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{formatDuration(totalStudyTime)}</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-1">
              <TagIcon size={14} />
              <span>关联笔记</span>
            </div>
            <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{resourceNotes.length} 条</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-1">
              <Clock size={14} />
              <span>最近学习</span>
            </div>
            <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {resource.lastStudiedAt ? fromNow(resource.lastStudiedAt) : '从未'}
            </p>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">学习进度</label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0"
                max="100"
                value={resource.progress}
                onChange={(e) => handleProgressChange(Number(e.target.value))}
                className="w-32"
              />
              <span className="text-sm text-gray-500 dark:text-gray-400">{resource.progress}%</span>
            </div>
          </div>
          <ProgressBar
            value={resource.progress}
            color={progressColor as 'green' | 'orange' | 'blue'}
            size="lg"
          />
        </div>

        {isTracking && (
          <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
            <p className="text-emerald-700 font-medium">
              正在学习中... 本次已学习 {formatDuration(trackedTime)}
            </p>
          </div>
        )}

        <div className="prose prose-slate max-w-none">
          <div
            className="text-gray-700 dark:text-gray-300 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(resource.content) }}
          />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">关联笔记</h2>
          <Link
            to={`/notes/new?resourceId=${id}`}
            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
          >
            <Plus size={16} />
            添加笔记
          </Link>
        </div>

        {resourceNotes.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            暂无关联笔记，点击上方按钮添加第一条笔记
          </p>
        ) : (
          <div className="space-y-3">
            {resourceNotes.map((note) => (
              <div
                key={note.id}
                className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                onClick={() => navigate(`/notes/${note.id}/edit`)}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">{note.title}</h3>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDateTime(note.updatedAt)}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {note.tags.slice(0, 3).map((tagId) => {
                    const tag = tags.find((t) => t.id === tagId);
                    return tag ? <Tag key={tagId} tag={tag} size="sm" /> : null;
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="text-sm text-gray-400 flex flex-wrap gap-4">
        <span>创建于 {formatDateTime(resource.createdAt)}</span>
        <span>更新于 {formatDateTime(resource.updatedAt)}</span>
      </div>
    </div>
  );
};

export default ResourceDetail;
