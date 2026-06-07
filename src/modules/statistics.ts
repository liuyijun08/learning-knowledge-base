import type {
  Resource,
  Note,
  LearningRecord,
  ReviewSchedule,
  StatisticsData,
  DateRange,
} from '@/types';
import { dayjs, formatDate, calculateStreak, getDateRange } from '@/utils/date';

class StatisticsCalculator {
  getOverallStatistics(
    resources: Resource[],
    notes: Note[],
    learningRecords: LearningRecord[],
    reviewSchedules: ReviewSchedule[]
  ): StatisticsData {
    const totalResources = resources.length;
    const completedResources = resources.filter((r) => r.status === 'completed').length;
    const totalNotes = notes.length;
    const totalTags = new Set([
      ...resources.flatMap((r) => r.tags),
      ...notes.flatMap((n) => n.tags),
    ]).size;

    const totalStudyTime = learningRecords.reduce((sum, record) => sum + record.duration, 0);

    const uniqueDays = new Set(learningRecords.map((r) => formatDate(r.date)));
    const averageDailyTime =
      uniqueDays.size > 0 ? Math.round(totalStudyTime / uniqueDays.size) : 0;

    const streakDays = calculateStreak(learningRecords.map((r) => r.date));

    const completionRate =
      totalResources > 0 ? Math.round((completedResources / totalResources) * 100) : 0;

    const avgDailyStudyTime = averageDailyTime;
    const avgNotesPerResource = totalResources > 0 ? totalNotes / totalResources : 0;

    const oneWeekAgo = dayjs().subtract(7, 'day');
    const thisWeekTime = learningRecords
      .filter(r => dayjs(r.date).isSameOrAfter(oneWeekAgo))
      .reduce((sum, r) => sum + r.duration, 0);
    const lastWeekTime = learningRecords
      .filter(r => dayjs(r.date).isBefore(oneWeekAgo) && dayjs(r.date).isSameOrAfter(oneWeekAgo.subtract(7, 'day')))
      .reduce((sum, r) => sum + r.duration, 0);
    const weeklyComparison = lastWeekTime > 0 ? ((thisWeekTime - lastWeekTime) / lastWeekTime) * 100 : thisWeekTime > 0 ? 100 : 0;

    return {
      totalResources,
      completedResources,
      totalNotes,
      totalTags,
      totalStudyTime,
      averageDailyTime,
      avgDailyStudyTime,
      avgNotesPerResource,
      weeklyComparison,
      streakDays,
      completionRate,
    };
  }

  getStudyTimeByRange(
    learningRecords: LearningRecord[],
    range: DateRange
  ): Array<{ date: string; duration: number }> {
    const { start, end } = getDateRange(range);
    const recordsInRange = learningRecords.filter((record) => {
      const recordDate = dayjs(record.date);
      return recordDate.isSameOrAfter(start) && recordDate.isSameOrBefore(end);
    });

    const grouped: Record<string, number> = {};
    recordsInRange.forEach((record) => {
      const date = formatDate(record.date);
      grouped[date] = (grouped[date] || 0) + record.duration;
    });

    return Object.entries(grouped)
      .map(([date, duration]) => ({ date, duration }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  getStudyTimeByResource(
    learningRecords: LearningRecord[],
    resources: Resource[]
  ): Array<{ resource: Resource; duration: number }> {
    const grouped: Record<string, number> = {};
    learningRecords.forEach((record) => {
      grouped[record.resourceId] = (grouped[record.resourceId] || 0) + record.duration;
    });

    return resources
      .map((resource) => ({
        resource,
        duration: grouped[resource.id] || 0,
      }))
      .sort((a, b) => b.duration - a.duration);
  }

  getCategoryDistribution(
    resources: Resource[]
  ): Array<{ category: string; count: number }> {
    const grouped: Record<string, number> = {};
    resources.forEach((resource) => {
      grouped[resource.category] = (grouped[resource.category] || 0) + 1;
    });

    return Object.entries(grouped)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);
  }

  getTagDistribution(
    resources: Resource[],
    notes: Note[]
  ): Array<{ tagId: string; count: number }> {
    const grouped: Record<string, number> = {};

    resources.forEach((resource) => {
      resource.tags.forEach((tagId) => {
        grouped[tagId] = (grouped[tagId] || 0) + 1;
      });
    });

    notes.forEach((note) => {
      note.tags.forEach((tagId) => {
        grouped[tagId] = (grouped[tagId] || 0) + 1;
      });
    });

    return Object.entries(grouped)
      .map(([tagId, count]) => ({ tagId, count }))
      .sort((a, b) => b.count - a.count);
  }

  getLearningTrend(
    learningRecords: LearningRecord[],
    days: number = 30
  ): Array<{ date: string; duration: number }> {
    const result: Array<{ date: string; duration: number }> = [];
    const today = dayjs();

    for (let i = days - 1; i >= 0; i--) {
      const date = today.subtract(i, 'day');
      const dateStr = formatDate(date.toISOString());
      const duration = learningRecords
        .filter((r) => formatDate(r.date) === dateStr)
        .reduce((sum, r) => sum + r.duration, 0);
      result.push({ date: dateStr, duration });
    }

    return result;
  }

  getWeeklySummary(
    learningRecords: LearningRecord[]
  ): Array<{ week: string; duration: number }> {
    const grouped: Record<string, number> = {};

    learningRecords.forEach((record) => {
      const weekStart = dayjs(record.date).startOf('week');
      const weekKey = `${formatDate(weekStart.toISOString())} - ${formatDate(weekStart.endOf('week').toISOString())}`;
      grouped[weekKey] = (grouped[weekKey] || 0) + record.duration;
    });

    return Object.entries(grouped)
      .map(([week, duration]) => ({ week, duration }))
      .sort((a, b) => a.week.localeCompare(b.week));
  }

  getStatusDistribution(
    resources: Resource[]
  ): Array<{ status: string; count: number; label: string }> {
    const statusMap: Record<string, { count: number; label: string }> = {
      not_started: { count: 0, label: '未开始' },
      learning: { count: 0, label: '学习中' },
      completed: { count: 0, label: '已完成' },
    };

    resources.forEach((resource) => {
      statusMap[resource.status].count++;
    });

    return Object.entries(statusMap).map(([status, { count, label }]) => ({
      status,
      count,
      label,
    }));
  }

  getReviewCompletionRate(
    reviewSchedules: ReviewSchedule[],
    days: number = 30
  ): number {
    const cutoffDate = dayjs().subtract(days, 'day').toISOString();

    const recentSchedules = reviewSchedules.filter((s) =>
      dayjs(s.dueDate).isAfter(cutoffDate)
    );

    if (recentSchedules.length === 0) return 100;

    const completed = recentSchedules.filter((s) => s.completed).length;
    return Math.round((completed / recentSchedules.length) * 100);
  }

  getMostStudiedResources(
    learningRecords: LearningRecord[],
    resources: Resource[],
    limit: number = 5
  ): Array<{ title: string; duration: number }> {
    const durationMap: Record<string, { duration: number; sessions: number }> = {};

    learningRecords.forEach((record) => {
      if (!durationMap[record.resourceId]) {
        durationMap[record.resourceId] = { duration: 0, sessions: 0 };
      }
      durationMap[record.resourceId].duration += record.duration;
      durationMap[record.resourceId].sessions += 1;
    });

    return resources
      .map((resource) => ({
        title: resource.title,
        duration: durationMap[resource.id]?.duration || 0,
      }))
      .sort((a, b) => b.duration - a.duration)
      .slice(0, limit);
  }

  getHeatmapData(
    learningRecords: LearningRecord[],
    days: number = 30
  ): Array<{ date: string; value: number }> {
    const result: Array<{ date: string; value: number }> = [];
    const today = dayjs();

    const dailyTotals: Record<string, number> = {};
    learningRecords.forEach((record) => {
      const date = formatDate(record.date);
      dailyTotals[date] = (dailyTotals[date] || 0) + record.duration;
    });

    for (let i = days - 1; i >= 0; i--) {
      const date = today.subtract(i, 'day');
      const dateStr = formatDate(date.toISOString());
      const value = dailyTotals[dateStr] || 0;
      result.push({ date: dateStr, value });
    }

    return result;
  }
}

export const statisticsCalculator = new StatisticsCalculator();
