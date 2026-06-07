import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Clock,
  Target,
  Flame,
  TrendingUp,
  CalendarDays,
  Award,
  PieChart,
  BarChart3,
  Activity,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
} from 'recharts';
import { StatsCard } from '@/components/Card';
import { useStore } from '@/store';
import { statisticsCalculator } from '@/modules/statistics';
import { tagSystem } from '@/modules/tagSystem';
import { dayjs } from '@/utils/date';

const Statistics: React.FC = () => {
  const { resources, notes, tags, learningRecords, reviewSchedules } = useStore();
  const [timeRange, setTimeRange] = useState<'7' | '30' | '90'>('30');

  const overallStats = useMemo(
    () => statisticsCalculator.getOverallStatistics(resources, notes, learningRecords, reviewSchedules),
    [resources, notes, learningRecords, reviewSchedules]
  );

  const learningTrend = useMemo(
    () => statisticsCalculator.getLearningTrend(learningRecords, Number(timeRange)),
    [learningRecords, timeRange]
  );

  const heatmapData = useMemo(
    () => statisticsCalculator.getHeatmapData(learningRecords, Number(timeRange)),
    [learningRecords, timeRange]
  );

  const mostStudied = useMemo(
    () => statisticsCalculator.getMostStudiedResources(learningRecords, resources, 5),
    [learningRecords, resources]
  );

  const categoryStats = useMemo(() => {
    const categories = tagSystem.getAllCategories(resources);
    return categories.map((cat) => ({
      name: cat,
      value: resources.filter((r) => r.category === cat).length,
      duration: learningRecords
        .filter(
          (lr) => resources.find((r) => r.id === lr.resourceId)?.category === cat
        )
        .reduce((sum, lr) => sum + lr.duration, 0),
    }));
  }, [resources, learningRecords]);

  const streak = useMemo(() => {
    const studyDates = new Set(
      learningRecords.map((r) => dayjs(r.date).format('YYYY-MM-DD'))
    );
    let currentStreak = 0;
    let checkDate = dayjs();

    while (studyDates.has(checkDate.format('YYYY-MM-DD'))) {
      currentStreak++;
      checkDate = checkDate.subtract(1, 'day');
    }

    return currentStreak;
  }, [learningRecords]);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

  const formatDuration = (minutes: number): string => {
    if (minutes < 60) return `${minutes} 分钟`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours} 小时 ${mins} 分` : `${hours} 小时`;
  };

  const maxHeatmapValue = Math.max(...heatmapData.map((d) => d.value), 1);
  const getHeatmapColor = (value: number): string => {
    if (value === 0) return 'bg-gray-100 dark:bg-gray-700';
    const ratio = value / maxHeatmapValue;
    if (ratio < 0.25) return 'bg-blue-200';
    if (ratio < 0.5) return 'bg-blue-400';
    if (ratio < 0.75) return 'bg-blue-600';
    return 'bg-blue-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">学习统计</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            追踪你的学习进度，发现学习规律
          </p>
        </div>

        <div className="flex items-center gap-1 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-1">
          {[
            { value: '7', label: '7天' },
            { value: '30', label: '30天' },
            { value: '90', label: '90天' },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setTimeRange(option.value as typeof timeRange)}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                timeRange === option.value
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="总学习时长"
          value={formatDuration(overallStats.totalStudyTime)}
          subtitle={`日均 ${Math.round(overallStats.avgDailyStudyTime)} 分钟`}
          icon={<Clock size={24} />}
          iconColor="bg-blue-500"
          trend={overallStats.weeklyComparison > 0 ? 'up' : 'down'}
          trendValue={`${Math.abs(overallStats.weeklyComparison).toFixed(1)}% 较上周`}
        />
        <StatsCard
          title="已完成资料"
          value={`${overallStats.completedResources}/${overallStats.totalResources}`}
          subtitle={`完成率 ${overallStats.completionRate.toFixed(1)}%`}
          icon={<Target size={24} />}
          iconColor="bg-green-500"
        />
        <StatsCard
          title="笔记总数"
          value={overallStats.totalNotes.toString()}
          subtitle={`每资料平均 ${(overallStats.avgNotesPerResource || 0).toFixed(1)} 条`}
          icon={<BookOpen size={24} />}
          iconColor="bg-purple-500"
        />
        <StatsCard
          title="连续学习"
          value={`${streak} 天`}
          subtitle={streak >= 7 ? '太棒了，保持下去！' : streak > 0 ? '继续加油！' : '今天开始吧'}
          icon={<Flame size={24} />}
          iconColor={streak >= 7 ? 'bg-orange-500' : streak > 0 ? 'bg-amber-500' : 'bg-gray-400'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp size={20} className="text-blue-500" />
            <h2 className="font-semibold text-gray-900 dark:text-gray-100">学习趋势</h2>
          </div>

          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={learningTrend}>
                <defs>
                  <linearGradient id="colorDuration" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  tickLine={false}
                  axisLine={{ stroke: '#e5e7eb' }}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  tickLine={false}
                  axisLine={{ stroke: '#e5e7eb' }}
                  unit=" 分"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  formatter={(value: number) => [`${value} 分钟`, '学习时长']}
                />
                <Area
                  type="monotone"
                  dataKey="duration"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorDuration)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-2 mb-6">
            <PieChart size={20} className="text-purple-500" />
            <h2 className="font-semibold text-gray-900 dark:text-gray-100">分类分布</h2>
          </div>

          {categoryStats.length === 0 ? (
            <div className="h-[300px] flex items-center justify-center text-gray-400">
              暂无数据
            </div>
          ) : (
            <>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={categoryStats}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {categoryStats.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => [`${value} 份`, '资料数量']}
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-2 mt-4">
                {categoryStats.map((cat, index) => (
                  <div key={cat.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-gray-700 dark:text-gray-300">{cat.name}</span>
                    </div>
                    <span className="text-gray-500 dark:text-gray-400">
                      {cat.value} 份 · {formatDuration(cat.duration)}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-2 mb-6">
            <CalendarDays size={20} className="text-green-500" />
            <h2 className="font-semibold text-gray-900 dark:text-gray-100">学习热力图</h2>
          </div>

          <div className="overflow-x-auto">
            <div
              className="grid gap-1"
              style={{
                gridTemplateColumns: `repeat(${Math.ceil(heatmapData.length / 7)}, 1fr)`,
                gridAutoFlow: 'column',
              }}
            >
              {heatmapData.map((day, index) => (
                <div
                  key={index}
                  className={`w-4 h-4 rounded-sm ${getHeatmapColor(day.value)} transition-colors hover:ring-2 hover:ring-blue-400 cursor-pointer`}
                  title={`${day.date}: ${day.value} 分钟`}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 mt-4 text-xs text-gray-500 dark:text-gray-400">
            <span>少</span>
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
              <span
                key={i}
                className={`w-4 h-4 rounded-sm ${getHeatmapColor(Math.round(maxHeatmapValue * ratio))}`}
              />
            ))}
            <span>多</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 size={20} className="text-amber-500" />
            <h2 className="font-semibold text-gray-900 dark:text-gray-100">学习资料排行</h2>
          </div>

          {mostStudied.length === 0 ? (
            <div className="h-[250px] flex items-center justify-center text-gray-400">
              暂无学习记录
            </div>
          ) : (
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mostStudied} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    tickLine={false}
                    axisLine={{ stroke: '#e5e7eb' }}
                    unit=" 分"
                  />
                  <YAxis
                    type="category"
                    dataKey="title"
                    tick={{ fontSize: 12, fill: '#374151' }}
                    tickLine={false}
                    axisLine={false}
                    width={100}
                  />
                  <Tooltip
                    formatter={(value: number) => [`${value} 分钟`, '学习时长']}
                  />
                  <Bar
                    dataKey="duration"
                    fill="#f59e0b"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-2 mb-6">
          <Award size={20} className="text-rose-500" />
          <h2 className="font-semibold text-gray-900 dark:text-gray-100">学习成就</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
          {[
            {
              icon: <Activity size={28} />,
              title: '初学者',
              desc: '首次学习',
              achieved: learningRecords.length > 0,
              color: 'bg-blue-500',
            },
            {
              icon: <Flame size={28} />,
              title: '七天连更',
              desc: '连续学习7天',
              achieved: streak >= 7,
              color: 'bg-orange-500',
            },
            {
              icon: <BookOpen size={28} />,
              title: '笔记达人',
              desc: '创建10条笔记',
              achieved: notes.length >= 10,
              color: 'bg-purple-500',
            },
            {
              icon: <Target size={28} />,
              title: '完成者',
              desc: '完成5份资料',
              achieved: overallStats.completedResources >= 5,
              color: 'bg-green-500',
            },
            {
              icon: <Clock size={28} />,
              title: '学习狂',
              desc: '累计100小时',
              achieved: overallStats.totalStudyTime >= 6000,
              color: 'bg-rose-500',
            },
            {
              icon: <CalendarDays size={28} />,
              title: '月度学者',
              desc: '月学习30天',
              achieved: learningTrend.filter((d) => d.duration > 0).length >= 30,
              color: 'bg-cyan-500',
            },
          ].map((achievement, index) => (
            <div
              key={index}
              className={`p-4 rounded-xl text-center transition-all ${
                achievement.achieved
                  ? 'bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 shadow-sm'
                  : 'bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-100 dark:border-gray-700 opacity-50'
              }`}
            >
              <div
                className={`w-14 h-14 mx-auto mb-3 rounded-xl flex items-center justify-center text-white ${achievement.color} ${
                  !achievement.achieved && 'grayscale'
                }`}
              >
                {achievement.icon}
              </div>
              <h3 className={`font-medium text-sm ${achievement.achieved ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'}`}>
                {achievement.title}
              </h3>
              <p className="text-xs text-gray-400 mt-1">{achievement.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Statistics;
