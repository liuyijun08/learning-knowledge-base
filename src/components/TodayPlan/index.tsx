import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  BookOpen,
  Target,
  ChevronRight,
  Clock,
  Sparkles,
  CheckCircle2,
  Timer,
} from 'lucide-react';
import { useStore } from '@/store';
import { ProgressBar } from '@/components/ProgressBar';
import { dayjs, formatDuration } from '@/utils/date';
import type { Resource, ReviewSchedule } from '@/types';

interface TodayPlanProps {
  className?: string;
}

const TodayPlan: React.FC<TodayPlanProps> = ({ className }) => {
  const navigate = useNavigate();
  const { resources, reviewSchedules, learningRecords, settings } = useStore();

  const today = useMemo(() => dayjs().format('YYYY-MM-DD'), []);

  const todayReviews = useMemo(() => {
    return reviewSchedules
      .filter((s) => dayjs(s.dueDate).format('YYYY-MM-DD') === today && !s.completed)
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, 5);
  }, [reviewSchedules, today]);

  const incompleteResources = useMemo(() => {
    return resources
      .filter((r) => r.status !== 'completed')
      .sort((a, b) => {
        const dateA = a.lastStudiedAt || a.updatedAt;
        const dateB = b.lastStudiedAt || b.updatedAt;
        return new Date(dateB).getTime() - new Date(dateA).getTime();
      })
      .slice(0, 5);
  }, [resources]);

  const todayStudyTime = useMemo(() => {
    return learningRecords
      .filter((r) => dayjs(r.date).format('YYYY-MM-DD') === today)
      .reduce((sum, r) => sum + r.duration, 0);
  }, [learningRecords, today]);

  const dailyGoal = settings.dailyGoal;
  const progressPercentage = Math.min((todayStudyTime / dailyGoal) * 100, 100);
  const isGoalReached = todayStudyTime >= dailyGoal;
  const remainingTime = Math.max(dailyGoal - todayStudyTime, 0);

  const getResourceById = (id: string): Resource | undefined => {
    return resources.find((r) => r.id === id);
  };

  const handleReviewClick = (schedule: ReviewSchedule) => {
    const resource = getResourceById(schedule.resourceId);
    if (resource) {
      navigate(`/resource/${resource.id}`);
    }
  };

  const handleResourceClick = (resource: Resource) => {
    navigate(`/resource/${resource.id}`);
  };

  const handleViewAllReviews = () => {
    navigate('/review');
  };

  return (
    <div className={className}>
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 dark:from-blue-600 dark:to-indigo-700 rounded-2xl p-6 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles size={24} className="text-yellow-300" />
            <h2 className="text-xl font-bold">今日学习计划</h2>
            <span className="text-sm text-white/70 ml-auto">
              {dayjs().format('M月D日 dddd')}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-3">
              <button
                onClick={handleViewAllReviews}
                className="flex items-center gap-2 text-sm text-white/80 hover:text-white transition-colors w-full text-left"
              >
                <Calendar size={16} />
                <span className="font-medium">今日待复习</span>
                <span className="ml-auto flex items-center gap-1">
                  共 {todayReviews.length} 项
                  <ChevronRight size={14} />
                </span>
              </button>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {todayReviews.length === 0 ? (
                  <div className="bg-white/10 rounded-xl p-4 text-center">
                    <CheckCircle2 size={28} className="mx-auto mb-2 text-green-300" />
                    <p className="text-sm">今天没有待复习内容</p>
                    <p className="text-xs text-white/60 mt-1">继续学习新内容吧！</p>
                  </div>
                ) : (
                  todayReviews.map((schedule) => {
                    const resource = getResourceById(schedule.resourceId);
                    if (!resource) return null;
                    return (
                      <button
                        key={schedule.id}
                        onClick={() => handleReviewClick(schedule)}
                        className="w-full text-left bg-white/10 hover:bg-white/20 rounded-xl p-3 transition-all group"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                            <BookOpen size={18} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate group-hover:underline">
                              {resource.title}
                            </p>
                            <p className="text-xs text-white/60 mt-0.5">
                              间隔 {schedule.interval} 天 · 第 {schedule.repetitions} 次复习
                            </p>
                          </div>
                          <ChevronRight size={16} className="text-white/40 group-hover:text-white transition-colors" />
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-white/80">
                <BookOpen size={16} />
                <span className="font-medium">继续学习</span>
                <span className="ml-auto text-white/60">
                  共 {incompleteResources.length} 项未完成
                </span>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {incompleteResources.length === 0 ? (
                  <div className="bg-white/10 rounded-xl p-4 text-center">
                    <CheckCircle2 size={28} className="mx-auto mb-2 text-green-300" />
                    <p className="text-sm">太棒了！所有资料已完成</p>
                    <p className="text-xs text-white/60 mt-1">添加新资料继续学习</p>
                  </div>
                ) : (
                  incompleteResources.map((resource) => (
                    <button
                      key={resource.id}
                      onClick={() => handleResourceClick(resource)}
                      className="w-full text-left bg-white/10 hover:bg-white/20 rounded-xl p-3 transition-all group"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold">
                            {Math.round(resource.progress)}%
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate group-hover:underline">
                            {resource.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-yellow-300 rounded-full"
                                style={{ width: `${resource.progress}%` }}
                              />
                            </div>
                            <span className="text-xs text-white/60">
                              {resource.status === 'learning' ? '学习中' : '未开始'}
                            </span>
                          </div>
                        </div>
                        <ChevronRight size={16} className="text-white/40 group-hover:text-white transition-colors" />
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-white/80">
                <Target size={16} />
                <span className="font-medium">每日目标</span>
              </div>

              <div className="bg-white/10 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-2xl font-bold">
                      {formatDuration(todayStudyTime)}
                    </p>
                    <p className="text-xs text-white/60">
                      {isGoalReached ? '已达成目标 🎉' : `目标 ${formatDuration(dailyGoal)}`}
                    </p>
                  </div>
                  <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
                    {isGoalReached ? (
                      <CheckCircle2 size={28} className="text-green-300" />
                    ) : (
                      <Timer size={28} />
                    )}
                  </div>
                </div>

                <ProgressBar
                  value={todayStudyTime}
                  max={dailyGoal}
                  color={isGoalReached ? 'emerald' : 'yellow'}
                  showLabel={false}
                />

                {!isGoalReached && remainingTime > 0 && (
                  <div className="mt-3 flex items-center gap-2 text-xs text-white/70">
                    <Clock size={12} />
                    <span>还差 {formatDuration(remainingTime)} 达成今日目标</span>
                  </div>
                )}
              </div>

              {incompleteResources.length > 0 && todayReviews.length > 0 && (
                <button
                  onClick={() => handleResourceClick(incompleteResources[0])}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-white text-blue-600 dark:text-blue-600 hover:bg-white/90 rounded-xl font-medium text-sm transition-colors"
                >
                  <Sparkles size={16} />
                  开始今天的学习
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TodayPlan;
