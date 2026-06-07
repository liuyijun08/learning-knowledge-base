import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import TodayPlan from '@/components/TodayPlan';
import { ResourceCard } from '@/components/Card';
import { useStore } from '@/store';
import { dayjs } from '@/utils/date';
import { BookOpen, FileText, Calendar, BarChart3, Plus, PenLine, Clock, TrendingUp, Award } from 'lucide-react';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { resources, notes, tags, learningRecords } = useStore();

  const recentResources = useMemo(() => {
    return [...resources]
      .sort((a, b) => {
        const dateA = a.lastStudiedAt || a.updatedAt;
        const dateB = b.lastStudiedAt || b.updatedAt;
        return new Date(dateB).getTime() - new Date(dateA).getTime();
      })
      .slice(0, 6);
  }, [resources]);

  const getStudyTime = (resourceId: string): number => {
    return learningRecords
      .filter((r) => r.resourceId === resourceId)
      .reduce((sum, r) => sum + r.duration, 0);
  };

  const today = dayjs().format('YYYY-MM-DD');
  const todayStudyTime = learningRecords
    .filter((r) => dayjs(r.date).format('YYYY-MM-DD') === today)
    .reduce((sum, r) => sum + r.duration, 0);

  const totalStudyTime = learningRecords.reduce((sum, r) => sum + r.duration, 0);
  const completedCount = resources.filter((r) => r.status === 'completed').length;

  const formatHours = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}分钟`;
    if (mins === 0) return `${hours}小时`;
    return `${hours}小时${mins}分钟`;
  };

  const quickActions = [
    {
      icon: <Plus size={20} />,
      label: '添加资料',
      onClick: () => navigate('/resource/new'),
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      textColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      icon: <PenLine size={20} />,
      label: '写笔记',
      onClick: () => navigate('/notes/new'),
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      textColor: 'text-purple-600 dark:text-purple-400',
    },
    {
      icon: <Calendar size={20} />,
      label: '复习日历',
      onClick: () => navigate('/review'),
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
      textColor: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      icon: <BarChart3 size={20} />,
      label: '学习统计',
      onClick: () => navigate('/statistics'),
      color: 'from-amber-500 to-amber-600',
      bgColor: 'bg-amber-50 dark:bg-amber-900/20',
      textColor: 'text-amber-600 dark:text-amber-400',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            你好，今天也要加油学习哦！
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {dayjs().format('YYYY年M月D日 dddd')}
          </p>
        </div>
      </div>

      <TodayPlan />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((action, index) => (
          <button
            key={index}
            onClick={action.onClick}
            className={`flex items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-md transition-all group`}
          >
            <div className={`w-10 h-10 rounded-lg ${action.bgColor} flex items-center justify-center ${action.textColor} group-hover:scale-110 transition-transform`}>
              {action.icon}
            </div>
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {action.label}
            </span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600">
              <Clock size={20} />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">今日学习</p>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {formatHours(todayStudyTime)}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            继续保持！
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600">
              <TrendingUp size={20} />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">累计学习</p>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {formatHours(totalStudyTime)}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            共 {resources.length} 份资料
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-600">
              <Award size={20} />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">已完成</p>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {completedCount} 份资料
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            {notes.length} 条笔记
          </p>
        </div>
      </div>

      {recentResources.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BookOpen size={20} className="text-gray-500" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                最近学习
              </h2>
            </div>
            <button
              onClick={() => navigate('/resources')}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              查看全部
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {recentResources.map((resource) => (
              <ResourceCard
                key={resource.id}
                resource={resource}
                tags={tags}
                totalStudyTime={getStudyTime(resource.id)}
                onClick={() => navigate(`/resource/${resource.id}`)}
                onDelete={() => {
                  if (confirm('确定要删除这份资料吗？')) {
                    useStore.getState().deleteResource(resource.id);
                  }
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;