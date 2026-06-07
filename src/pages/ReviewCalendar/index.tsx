import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  BookOpen,
  CheckCircle2,
  Circle,
  AlertCircle,
  Plus,
} from 'lucide-react';
import { StatusBadge } from '@/components/ProgressBar';
import { Tag } from '@/components/Tag';
import { useStore } from '@/store';
import { sm2Algorithm, type ReviewQuality } from '@/modules/reviewAlgorithm';
import { formatDate, dayjs } from '@/utils/date';
import type { ReviewSchedule, Resource } from '@/types';

const ReviewCalendar: React.FC = () => {
  const navigate = useNavigate();
  const { resources, tags, reviewSchedules, completeReview, addReviewSchedule, settings } = useStore();

  const [currentDate, setCurrentDate] = useState(dayjs());
  const [selectedDate, setSelectedDate] = useState<string>(dayjs().format('YYYY-MM-DD'));
  const [selectedQuality, setSelectedQuality] = useState<ReviewQuality | null>(null);
  const [completingSchedule, setCompletingSchedule] = useState<string | null>(null);

  const daysInMonth = useMemo(() => {
    const start = currentDate.startOf('month');
    const end = currentDate.endOf('month');
    const days: dayjs.Dayjs[] = [];

    const startPadding = start.day();
    for (let i = startPadding - 1; i >= 0; i--) {
      days.push(start.subtract(i + 1, 'day'));
    }

    for (let i = 0; i < start.daysInMonth(); i++) {
      days.push(start.add(i, 'day'));
    }

    const endPadding = 42 - days.length;
    for (let i = 0; i < endPadding; i++) {
      days.push(end.add(i + 1, 'day'));
    }

    return days;
  }, [currentDate]);

  const schedulesByDate = useMemo(() => {
    const map: Record<string, ReviewSchedule[]> = {};
    reviewSchedules.forEach((schedule) => {
      const date = dayjs(schedule.dueDate).format('YYYY-MM-DD');
      if (!map[date]) {
        map[date] = [];
      }
      map[date].push(schedule);
    });
    return map;
  }, [reviewSchedules]);

  const dueSchedules = useMemo(() => {
    return sm2Algorithm.getDueSchedules(reviewSchedules, selectedDate);
  }, [reviewSchedules, selectedDate]);

  const getResource = (resourceId: string): Resource | undefined => {
    return resources.find((r) => r.id === resourceId);
  };

  const getDayInfo = (day: dayjs.Dayjs) => {
    const dateStr = day.format('YYYY-MM-DD');
    const schedules = schedulesByDate[dateStr] || [];
    const isToday = day.isSame(dayjs(), 'day');
    const isCurrentMonth = day.isSame(currentDate, 'month');
    const isSelected = day.format('YYYY-MM-DD') === selectedDate;

    const dueCount = schedules.filter((s) => !s.completed).length;
    const completedCount = schedules.filter((s) => s.completed).length;

    return { schedules, isToday, isCurrentMonth, isSelected, dueCount, completedCount };
  };

  const handleCompleteReview = (scheduleId: string) => {
    if (selectedQuality === null) return;
    completeReview(scheduleId, selectedQuality);
    setCompletingSchedule(null);
    setSelectedQuality(null);
  };

  const handleQuickAddReview = () => {
    const dueResources = resources.filter(
      (r) =>
        !reviewSchedules.some(
          (s) => s.resourceId === r.id && !s.completed
        )
    );

    if (dueResources.length > 0) {
      const resource = dueResources[0];
      addReviewSchedule(
        sm2Algorithm.createInitialSchedule(
          resource.id,
          settings
        )
      );
    }
  };

  const prevMonth = () => setCurrentDate(currentDate.subtract(1, 'month'));
  const nextMonth = () => setCurrentDate(currentDate.add(1, 'month'));

  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
  const qualityLevels: { value: ReviewQuality; label: string; color: string }[] = [
    { value: 0, label: '完全忘记', color: 'bg-red-100 text-red-700 hover:bg-red-200' },
    { value: 2, label: '很困难', color: 'bg-orange-100 text-orange-700 hover:bg-orange-200' },
    { value: 3, label: '有点难', color: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' },
    { value: 4, label: '有点犹豫', color: 'bg-blue-100 text-blue-700 hover:bg-blue-200' },
    { value: 5, label: '完全记得', color: 'bg-green-100 text-green-700 hover:bg-green-200' },
  ];

  const todayStats = useMemo(() => {
    const today = dayjs().format('YYYY-MM-DD');
    const todaySchedules = schedulesByDate[today] || [];
    return {
      due: todaySchedules.filter((s) => !s.completed).length,
      completed: todaySchedules.filter((s) => s.completed).length,
      total: todaySchedules.length,
    };
  }, [schedulesByDate]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">复习日历</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            基于 SM-2 间隔重复算法，智能安排复习计划
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CalendarIcon size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{todayStats.total}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">今日计划</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle2 size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{todayStats.completed}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">已完成</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <AlertCircle size={20} className="text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{todayStats.due}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">待复习</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <BookOpen size={20} className="text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{reviewSchedules.length}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">总复习计划</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
              <h2 className="font-semibold text-gray-900 dark:text-gray-100">
                {currentDate.format('YYYY年 M月')}
              </h2>
              <div className="flex items-center gap-1">
                <button
                  onClick={prevMonth}
                  className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={() => setCurrentDate(dayjs())}
                  className="px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                >
                  今天
                </button>
                <button
                  onClick={nextMonth}
                  className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 border-b border-gray-100 dark:border-gray-700">
              {weekDays.map((day) => (
                <div
                  key={day}
                  className="py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400"
                >
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7">
              {daysInMonth.map((day, index) => {
                const info = getDayInfo(day);
                const dateStr = day.format('YYYY-MM-DD');

                return (
                  <button
                    key={index}
                    onClick={() => setSelectedDate(dateStr)}
                    className={`min-h-[90px] p-2 border-b border-r border-gray-50 dark:border-gray-700 text-left transition-colors ${
                      !info.isCurrentMonth ? 'bg-gray-50/50 dark:bg-gray-700/30' : ''
                    } ${info.isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'} ${
                      index % 7 === 6 ? 'border-r-0' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`text-sm font-medium ${
                          info.isToday
                            ? 'bg-blue-500 text-white w-7 h-7 flex items-center justify-center rounded-full'
                            : info.isCurrentMonth
                            ? 'text-gray-900 dark:text-gray-100'
                            : 'text-gray-400'
                        }`}
                      >
                        {day.date()}
                      </span>
                      {info.dueCount > 0 && info.completedCount === 0 && (
                        <span className="w-2 h-2 bg-red-500 rounded-full" />
                      )}
                      {info.completedCount > 0 && info.dueCount === 0 && (
                        <CheckCircle2 size={14} className="text-green-500" />
                      )}
                    </div>

                    {info.schedules.length > 0 && (
                      <div className="space-y-1">
                        {info.schedules.slice(0, 2).map((schedule) => {
                          const resource = getResource(schedule.resourceId);
                          if (!resource) return null;
                          return (
                            <div
                              key={schedule.id}
                              className={`text-xs px-1.5 py-0.5 rounded truncate ${
                                schedule.completed
                                  ? 'bg-green-100 text-green-700 line-through'
                                  : 'bg-amber-100 text-amber-700'
                              }`}
                            >
                              {resource.title}
                            </div>
                          );
                        })}
                        {info.schedules.length > 2 && (
                          <div className="text-xs text-gray-400">
                            +{info.schedules.length - 2} 更多
                          </div>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <aside className="lg:w-80 flex-shrink-0">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                {formatDate(selectedDate)} 待复习
              </h3>
              <button
                onClick={handleQuickAddReview}
                className="p-1.5 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
              >
                <Plus size={16} />
              </button>
            </div>

            {dueSchedules.length === 0 ? (
              <div className="text-center py-8">
                <Clock size={32} className="mx-auto text-gray-300 mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400">今天没有待复习的内容</p>
                <p className="text-xs text-gray-400 mt-1">选择其他日期查看</p>
              </div>
            ) : (
              <div className="space-y-3">
                {dueSchedules.map((schedule) => {
                  const resource = getResource(schedule.resourceId);
                  if (!resource) return null;

                  const isCompleting = completingSchedule === schedule.id;
                  const resourceTags = tags.filter((t) => resource.tags.includes(t.id));

                  return (
                    <div
                      key={schedule.id}
                      className={`p-3 rounded-lg border transition-all ${
                        schedule.completed
                          ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                          : isCompleting
                          ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-800'
                          : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {schedule.completed ? (
                          <CheckCircle2 size={18} className="text-green-500 mt-0.5 flex-shrink-0" />
                        ) : (
                          <Circle
                            size={18}
                            className="text-amber-500 mt-0.5 flex-shrink-0 cursor-pointer hover:text-amber-600"
                            onClick={() =>
                              setCompletingSchedule(
                                isCompleting ? null : schedule.id
                              )
                            }
                          />
                        )}

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4
                              className={`font-medium text-sm ${
                                schedule.completed ? 'text-gray-500 dark:text-gray-400 line-through' : 'text-gray-900 dark:text-gray-100'
                              }`}
                            >
                              {resource.title}
                            </h4>
                            <StatusBadge status={resource.status} size="sm" />
                          </div>

                          {resourceTags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-2">
                              {resourceTags.slice(0, 2).map((tag) => (
                                <Tag key={tag.id} tag={tag} size="xs" />
                              ))}
                            </div>
                          )}

                          {isCompleting && (
                            <div className="mt-3 space-y-2">
                              <p className="text-xs text-gray-600 dark:text-gray-300">
                                请评估你对内容的记忆程度：
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {qualityLevels.map((level) => (
                                  <button
                                    key={level.value}
                                    onClick={() => setSelectedQuality(level.value)}
                                    className={`px-2 py-1 text-xs rounded transition-colors ${
                                      selectedQuality === level.value
                                        ? 'ring-2 ring-blue-500 ring-offset-1'
                                        : ''
                                    } ${level.color}`}
                                  >
                                    {level.label}
                                  </button>
                                ))}
                              </div>
                              <div className="flex gap-2 pt-2">
                                <button
                                  onClick={() => {
                                    setCompletingSchedule(null);
                                    setSelectedQuality(null);
                                  }}
                                  className="flex-1 px-3 py-1.5 text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                                >
                                  取消
                                </button>
                                <button
                                  onClick={() => handleCompleteReview(schedule.id)}
                                  disabled={selectedQuality === null}
                                  className="flex-1 px-3 py-1.5 text-xs bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded transition-colors"
                                >
                                  确认完成
                                </button>
                              </div>
                            </div>
                          )}

                          {!isCompleting && !schedule.completed && (
                            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                              <Clock size={12} />
                              <span>间隔 {schedule.interval} 天 · EF: {schedule.easeFactor.toFixed(2)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 mt-4">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">复习算法说明</h3>
            <div className="text-xs text-gray-500 dark:text-gray-400 space-y-2">
              <p>本系统使用 <span className="font-mono bg-gray-100 dark:bg-gray-700 px-1 rounded">SM-2</span> 间隔重复算法，根据你的记忆评估自动安排下次复习时间。</p>
              <div className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg space-y-1">
                <p className="font-medium text-gray-700 dark:text-gray-300">质量等级说明：</p>
                <p>• 5分 - 完美回忆，下次间隔×2.5</p>
                <p>• 3分 - 有些犹豫，间隔基本不变</p>
                <p>• 0分 - 完全忘记，重新开始</p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default ReviewCalendar;
