export interface Resource {
  id: string;
  title: string;
  content: string;
  category: string;
  cover?: string;
  tags: string[];
  progress: number;
  status: 'not_started' | 'learning' | 'completed';
  createdAt: string;
  updatedAt: string;
  lastStudiedAt?: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  resourceIds: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface LearningRecord {
  id: string;
  resourceId: string;
  duration: number;
  date: string;
}

export interface ReviewSchedule {
  id: string;
  resourceId: string;
  dueDate: string;
  interval: number;
  repetitions: number;
  easeFactor: number;
  completed: boolean;
}

export interface Settings {
  theme: 'light' | 'dark' | 'system';
  username: string;
  email: string;
  primaryColor: string;
  dailyGoal: number;
  autoStartReview: boolean;
  autoSave: boolean;
  reviewParams: {
    initialInterval: number;
    easeFactor: number;
    minimumInterval: number;
  };
}

export interface AppState {
  resources: Resource[];
  notes: Note[];
  tags: Tag[];
  learningRecords: LearningRecord[];
  reviewSchedules: ReviewSchedule[];
  settings: Settings;
}

export interface SearchResult<T> {
  item: T;
  score: number;
  matches: string[];
}

export interface ReviewResult {
  schedule: ReviewSchedule;
  nextDueDate: string;
  newInterval: number;
  newEaseFactor: number;
}

export type DateRange = 'day' | 'week' | 'month' | 'year';

export interface StatisticsData {
  totalResources: number;
  completedResources: number;
  totalNotes: number;
  totalTags: number;
  totalStudyTime: number;
  averageDailyTime: number;
  avgDailyStudyTime: number;
  avgNotesPerResource: number;
  weeklyComparison: number;
  streakDays: number;
  completionRate: number;
}
