import type { ReviewSchedule, ReviewResult, Settings } from '@/types';
import { addDays, dayjs } from '@/utils/date';
import { generateId } from '@/utils/markdown';

export type ReviewQuality = 0 | 1 | 2 | 3 | 4 | 5;

class SM2Algorithm {
  calculateNextReview(
    schedule: ReviewSchedule,
    quality: ReviewQuality,
    settings: Settings
  ): ReviewResult {
    const { reviewParams } = settings;
    let { interval, repetitions, easeFactor } = schedule;

    if (quality < 3) {
      repetitions = 0;
      interval = reviewParams.minimumInterval;
    } else {
      if (repetitions === 0) {
        interval = reviewParams.initialInterval;
      } else if (repetitions === 1) {
        interval = 6;
      } else {
        interval = Math.round(interval * easeFactor);
      }
      repetitions += 1;
    }

    easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    easeFactor = Math.max(1.3, easeFactor);

    const nextDueDate = addDays(dayjs().toISOString(), interval);

    const updatedSchedule: ReviewSchedule = {
      ...schedule,
      interval,
      repetitions,
      easeFactor,
      dueDate: nextDueDate,
      completed: false,
    };

    return {
      schedule: updatedSchedule,
      nextDueDate,
      newInterval: interval,
      newEaseFactor: easeFactor,
    };
  }

  createInitialSchedule(resourceId: string, settings: Settings): ReviewSchedule {
    return {
      id: generateId(),
      resourceId,
      dueDate: dayjs().toISOString(),
      interval: settings.reviewParams.initialInterval,
      repetitions: 0,
      easeFactor: settings.reviewParams.easeFactor,
      completed: false,
    };
  }

  getDueSchedules(
    schedules: ReviewSchedule[],
    date: string = dayjs().toISOString()
  ): ReviewSchedule[] {
    return schedules.filter(schedule => {
      return dayjs(schedule.dueDate).isSameOrBefore(date, 'day') && !schedule.completed;
    });
  }

  getOverdueSchedules(
    schedules: ReviewSchedule[],
    date: string = dayjs().toISOString()
  ): ReviewSchedule[] {
    return schedules.filter(schedule => {
      return dayjs(schedule.dueDate).isBefore(date, 'day') && !schedule.completed;
    });
  }

  getUpcomingSchedules(schedules: ReviewSchedule[], days: number = 7): ReviewSchedule[] {
    const endDate = addDays(dayjs().toISOString(), days);
    return schedules.filter(schedule => {
      return (
        dayjs(schedule.dueDate).isAfter(dayjs().toISOString(), 'day') &&
        dayjs(schedule.dueDate).isSameOrBefore(endDate, 'day') &&
        !schedule.completed
      );
    });
  }

  getSchedulesForDate(schedules: ReviewSchedule[], date: string): ReviewSchedule[] {
    return schedules.filter(schedule => {
      return dayjs(schedule.dueDate).isSame(date, 'day');
    });
  }

  completeReview(
    schedule: ReviewSchedule,
    quality: ReviewQuality,
    settings: Settings
  ): { updated: ReviewSchedule; next?: ReviewSchedule } {
    const result = this.calculateNextReview(schedule, quality, settings);

    const completedSchedule: ReviewSchedule = {
      ...schedule,
      completed: true,
    };

    return {
      updated: completedSchedule,
      next: result.schedule,
    };
  }

  getReviewStatistics(schedules: ReviewSchedule[]) {
    const today = dayjs().toISOString();
    const due = this.getDueSchedules(schedules, today);
    const overdue = this.getOverdueSchedules(schedules, today);
    const upcoming = this.getUpcomingSchedules(schedules, 7);
    const completed = schedules.filter(s => s.completed);

    return {
      dueCount: due.length,
      overdueCount: overdue.length,
      upcomingCount: upcoming.length,
      completedCount: completed.length,
      totalCount: schedules.length,
      completionRate:
        schedules.length > 0
          ? Math.round((completed.length / schedules.length) * 100)
          : 0,
    };
  }
}

export const sm2Algorithm = new SM2Algorithm();

export const getQualityLabel = (quality: ReviewQuality): string => {
  const labels: Record<ReviewQuality, string> = {
    0: '完全忘记',
    1: '几乎忘记',
    2: '想不起来',
    3: '勉强记得',
    4: '记得',
    5: '非常熟悉',
  };
  return labels[quality];
};

export const getQualityColor = (quality: ReviewQuality): string => {
  const colors: Record<ReviewQuality, string> = {
    0: '#ef4444',
    1: '#f97316',
    2: '#f59e0b',
    3: '#eab308',
    4: '#84cc16',
    5: '#10b981',
  };
  return colors[quality];
};
