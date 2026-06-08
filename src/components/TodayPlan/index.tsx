/**
 * ============================================================================
 * 今日学习计划组件 - 生成逻辑说明
 * ============================================================================
 * 
 * 一、数据来源
 * ----------------------------------------------------------------------------
 * 本组件从全局状态（useStore）中获取以下四类核心数据：
 * 
 * 1. reviewSchedules（复习计划）
 *    - 来源：SM-2间隔重复算法自动生成，存储于 store.reviewSchedules
 *    - 用途：生成"今日待复习"列表
 *    - 关键字段：dueDate（到期日期）、completed（是否完成）、interval（间隔天数）、
 *              repetitions（复习次数）、resourceId（关联资料ID）
 * 
 * 2. resources（学习资料）
 *    - 来源：用户创建/导入的所有资料，存储于 store.resources
 *    - 用途：生成"继续学习"列表，获取资料标题、进度、状态等信息
 *    - 关键字段：status（状态：not_started/learning/completed）、progress（学习进度%）、
 *              lastStudiedAt（上次学习时间）、updatedAt（更新时间）
 * 
 * 3. learningRecords（学习记录）
 *    - 来源：用户每次学习后自动记录，存储于 store.learningRecords
 *    - 用途：计算今日学习时长，生成每日目标进度
 *    - 关键字段：date（学习日期）、duration（学习时长，单位：分钟）、resourceId（关联资料ID）
 * 
 * 4. settings.dailyGoal（每日学习目标）
 *    - 来源：用户在设置中配置，存储于 store.settings.dailyGoal
 *    - 用途：作为每日学习时长的目标值，计算完成百分比
 *    - 默认值：60分钟
 * 
 * 二、推荐规则
 * ----------------------------------------------------------------------------
 * 
 * 【今日待复习】推荐规则：
 * 1. 筛选条件：复习计划的到期日期等于今天，且标记为未完成
 * 2. 推荐数量：最多显示5项（避免信息过载）
 * 3. 优先级：到期时间越早，优先级越高
 * 4. 显示内容：资料标题、间隔天数、复习次数
 * 
 * 【继续学习】推荐规则：
 * 1. 筛选条件：资料状态不等于"已完成"（包括学习中和未开始）
 * 2. 推荐数量：最多显示5项
 * 3. 优先级：最近学习/更新的资料优先（利用近因效应，保持学习连续性）
 * 4. 显示内容：资料标题、学习进度%、进度条、状态标签
 * 
 * 【每日目标】计算规则：
 * 1. 统计今日所有学习记录的时长总和
 * 2. 与每日目标进行对比，计算完成百分比
 * 3. 未达成时显示剩余需要学习的时间
 * 
 * 三、排序规则
 * ----------------------------------------------------------------------------
 * 
 * 【今日待复习】排序逻辑：
 *  - 按到期时间升序排列（dueDate 从小到大）
 *  - 原因：越早到期的复习任务越紧急，需要优先处理
 *  - 例如：上午到期的排在下午到期的前面
 * 
 * 【继续学习】排序逻辑：
 *  - 按 lastStudiedAt（上次学习时间）降序排列，如果为空则使用 updatedAt
 *  - 原因：基于艾宾浩斯遗忘曲线和学习连续性原则
 *    - 最近学习过的内容记忆还比较新鲜，继续学习效率更高
 *    - 保持学习惯性，避免资料长期搁置后重新捡起来的困难
 *  - 例如：昨天学习过的排在一周前学习过的前面
 * 
 * 四、生成流程
 * ----------------------------------------------------------------------------
 * 
 * 1. 确定今日日期 → 2. 从复习计划中筛选今日待复习项 → 按到期时间排序
 *                  → 3. 从资料中筛选未完成项 → 按最近学习时间排序
 *                  → 4. 从学习记录中统计今日学习时长
 *                  → 5. 结合每日目标计算进度
 *                  → 6. 渲染三个区块：待复习 / 继续学习 / 每日目标
 * 
 * 五、交互设计
 * ----------------------------------------------------------------------------
 * 
 * - 点击复习项：跳转到对应资料详情页，开始复习
 * - 点击"今日待复习"标题：跳转到复习日历页面查看完整复习计划
 * - 点击未完成资料：跳转到对应资料详情页，继续学习
 * - 点击"开始今天的学习"：一键跳转到优先级最高的未完成资料
 * 
 * ============================================================================
 */

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

  /**
   * 今日待复习列表生成逻辑
   * 
   * 数据来源：store.reviewSchedules（由SM-2间隔重复算法生成的复习计划）
   * 
   * 筛选规则：
   * - 到期日期(dueDate)等于今天
   * - 未完成(completed === false)
   * 
   * 排序规则：
   * - 按到期时间升序排列（越早到期越优先）
   * - 保证紧急的复习任务排在前面
   * 
   * 数量限制：最多5项，避免信息过载
   */
  const todayReviews = useMemo(() => {
    return reviewSchedules
      .filter((s) => dayjs(s.dueDate).format('YYYY-MM-DD') === today && !s.completed)
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, 5);
  }, [reviewSchedules, today]);

  /**
   * 未完成学习资料列表生成逻辑
   * 
   * 数据来源：store.resources（用户创建的所有学习资料）
   * 
   * 筛选规则：
   * - 状态不等于"已完成"(status !== 'completed')
   * - 包括"学习中"(learning)和"未开始"(not_started)
   * 
   * 排序规则：
   * - 按 lastStudiedAt（上次学习时间）降序排列
   * - 如果 lastStudiedAt 为空，使用 updatedAt（更新时间）作为后备
   * - 最近学习过的资料排在前面，利用近因效应保持学习连续性
   * 
   * 数量限制：最多5项，聚焦最重要的学习内容
   */
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

  /**
   * 今日学习时长统计
   * 
   * 数据来源：store.learningRecords（用户的学习记录）
   * 
   * 统计规则：
   * - 筛选日期等于今天的所有学习记录
   * - 累加所有记录的 duration（时长，单位：分钟）
   * - 用于计算每日目标完成进度
   */
  const todayStudyTime = useMemo(() => {
    return learningRecords
      .filter((r) => dayjs(r.date).format('YYYY-MM-DD') === today)
      .reduce((sum, r) => sum + r.duration, 0);
  }, [learningRecords, today]);

  /**
   * 每日目标进度计算
   * 
   * 数据来源：
   * - 目标值：settings.dailyGoal（用户设置的每日学习目标，单位：分钟）
   * - 实际值：todayStudyTime（今日已学习时长）
   * 
   * 计算规则：
   * - progressPercentage：完成百分比，最大100%（避免超额时显示超过100%）
   * - isGoalReached：是否达成目标（实际值 >= 目标值）
   * - remainingTime：剩余需要学习的时间，最小为0（避免显示负数）
   */
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
