import { create } from 'zustand';
import type {
  Resource,
  Note,
  Tag,
  LearningRecord,
  ReviewSchedule,
  Settings,
  AppState,
} from '@/types';
import {
  defaultResources,
  defaultNotes,
  defaultTags,
  defaultLearningRecords,
  defaultReviewSchedules,
  defaultSettings,
} from '@/data/mockData';
import { saveToStorage, loadFromStorage, debounce } from '@/utils/storage';
import { sm2Algorithm, type ReviewQuality } from '@/modules/reviewAlgorithm';
import { backupManager } from '@/modules/backup';
import { generateId } from '@/utils/markdown';
import { dayjs } from '@/utils/date';

const STORAGE_KEY = 'app_state';

interface StoreActions {
  addResource: (resource: Omit<Resource, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateResource: (id: string, updates: Partial<Resource>) => void;
  deleteResource: (id: string) => void;

  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;

  addTag: (tag: Omit<Tag, 'id'>) => string;
  updateTag: (id: string, updates: Partial<Tag>) => void;
  deleteTag: (id: string) => void;

  addLearningRecord: (record: Omit<LearningRecord, 'id'>) => void;

  completeReview: (scheduleId: string, quality: ReviewQuality) => void;
  addReviewSchedule: (schedule: Omit<ReviewSchedule, 'id'>) => void;
  updateReviewSchedule: (id: string, updates: Partial<ReviewSchedule>) => void;

  updateSettings: (updates: Partial<Settings>) => void;

  importData: (data: { success: boolean; data?: AppState; error?: string }) => boolean;
  clearData: () => void;
  exportData: () => string;
  downloadBackup: () => void;

  startTracking: (resourceId: string) => void;
  stopTracking: () => void;
}

type Store = AppState & StoreActions;

const loadInitialState = (): AppState => {
  const saved = loadFromStorage<AppState | null>(STORAGE_KEY, null);
  if (saved) {
    return saved;
  }
  return {
    resources: defaultResources,
    notes: defaultNotes,
    tags: defaultTags,
    learningRecords: defaultLearningRecords,
    reviewSchedules: defaultReviewSchedules,
    settings: defaultSettings,
  };
};

let trackingTimer: ReturnType<typeof setInterval> | null = null;
let trackingResourceId: string | null = null;
let trackingStartTime: number = 0;

const persistState = debounce((state: AppState) => {
  saveToStorage(STORAGE_KEY, state);
}, 500);

export const useStore = create<Store>((set, get) => ({
  ...loadInitialState(),

  addResource: (resource) => {
    const now = dayjs().toISOString();
    const newResource: Resource = {
      ...resource,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    set((state) => {
      const newState = {
        ...state,
        resources: [...state.resources, newResource],
      };
      persistState(newState);
      return newState;
    });
    return newResource.id;
  },

  updateResource: (id, updates) => {
    const now = dayjs().toISOString();
    set((state) => {
      const resources = state.resources.map((r) =>
        r.id === id ? { ...r, ...updates, updatedAt: now } : r
      );
      const newState = { ...state, resources };
      persistState(newState);
      return newState;
    });
  },

  deleteResource: (id) => {
    set((state) => {
      const resources = state.resources.filter((r) => r.id !== id);
      const notes = state.notes.map((n) => ({
        ...n,
        resourceIds: n.resourceIds.filter((rid) => rid !== id),
      }));
      const learningRecords = state.learningRecords.filter((r) => r.resourceId !== id);
      const reviewSchedules = state.reviewSchedules.filter((r) => r.resourceId !== id);

      const newState = { ...state, resources, notes, learningRecords, reviewSchedules };
      persistState(newState);
      return newState;
    });
  },

  addNote: (note) => {
    const now = dayjs().toISOString();
    const newNote: Note = {
      ...note,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    set((state) => {
      const newState = { ...state, notes: [...state.notes, newNote] };
      persistState(newState);
      return newState;
    });
    return newNote.id;
  },

  updateNote: (id, updates) => {
    const now = dayjs().toISOString();
    set((state) => {
      const notes = state.notes.map((n) =>
        n.id === id ? { ...n, ...updates, updatedAt: now } : n
      );
      const newState = { ...state, notes };
      persistState(newState);
      return newState;
    });
  },

  deleteNote: (id) => {
    set((state) => {
      const notes = state.notes.filter((n) => n.id !== id);
      const newState = { ...state, notes };
      persistState(newState);
      return newState;
    });
  },

  addTag: (tag) => {
    const newTag: Tag = { ...tag, id: generateId() };
    set((state) => {
      const newState = { ...state, tags: [...state.tags, newTag] };
      persistState(newState);
      return newState;
    });
    return newTag.id;
  },

  addReviewSchedule: (schedule) => {
    const newSchedule: ReviewSchedule = { ...schedule, id: generateId() };
    set((state) => {
      const newState = { ...state, reviewSchedules: [...state.reviewSchedules, newSchedule] };
      persistState(newState);
      return newState;
    });
  },

  updateTag: (id, updates) => {
    set((state) => {
      const tags = state.tags.map((t) => (t.id === id ? { ...t, ...updates } : t));
      const newState = { ...state, tags };
      persistState(newState);
      return newState;
    });
  },

  deleteTag: (id) => {
    set((state) => {
      const tags = state.tags.filter((t) => t.id !== id);
      const resources = state.resources.map((r) => ({
        ...r,
        tags: r.tags.filter((tid) => tid !== id),
      }));
      const notes = state.notes.map((n) => ({
        ...n,
        tags: n.tags.filter((tid) => tid !== id),
      }));
      const newState = { ...state, tags, resources, notes };
      persistState(newState);
      return newState;
    });
  },

  addLearningRecord: (record) => {
    const newRecord: LearningRecord = { ...record, id: generateId() };
    set((state) => {
      const newState = {
        ...state,
        learningRecords: [...state.learningRecords, newRecord],
      };
      persistState(newState);
      return newState;
    });
  },

  completeReview: (scheduleId, quality) => {
    set((state) => {
      const schedule = state.reviewSchedules.find((s) => s.id === scheduleId);
      if (!schedule) return state;

      const result = sm2Algorithm.completeReview(schedule, quality, state.settings);
      let reviewSchedules = state.reviewSchedules.map((s) =>
        s.id === scheduleId ? result.updated : s
      );

      if (result.next) {
        reviewSchedules = [...reviewSchedules, result.next];
      }

      const newState = { ...state, reviewSchedules };
      persistState(newState);
      return newState;
    });
  },

  updateReviewSchedule: (id, updates) => {
    set((state) => {
      const reviewSchedules = state.reviewSchedules.map((s) =>
        s.id === id ? { ...s, ...updates } : s
      );
      const newState = { ...state, reviewSchedules };
      persistState(newState);
      return newState;
    });
  },

  updateSettings: (updates) => {
    set((state) => {
      const settings = { ...state.settings, ...updates };
      const newState = { ...state, settings };
      persistState(newState);
      return newState;
    });
  },

  importData: (data) => {
    if (data.success && data.data) {
      set(() => {
        persistState(data.data!);
        return data.data!;
      });
      return true;
    }
    return false;
  },

  clearData: () => {
    const emptyState: AppState = {
      resources: [],
      notes: [],
      tags: [],
      learningRecords: [],
      reviewSchedules: [],
      settings: defaultSettings,
    };
    set(() => {
      persistState(emptyState);
      return emptyState;
    });
  },

  exportData: () => {
    const state = get();
    return backupManager.exportData(state);
  },

  downloadBackup: () => {
    const state = get();
    backupManager.downloadBackup(state);
  },

  startTracking: (resourceId) => {
    if (trackingTimer) {
      clearInterval(trackingTimer);
    }
    trackingResourceId = resourceId;
    trackingStartTime = Date.now();

    trackingTimer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - trackingStartTime) / 60000);
      if (elapsed > 0 && trackingResourceId) {
        get().addLearningRecord({
          resourceId: trackingResourceId,
          duration: 1,
          date: dayjs().toISOString(),
        });
        trackingStartTime = Date.now();

        get().updateResource(trackingResourceId, {
          lastStudiedAt: dayjs().toISOString(),
        });
      }
    }, 60000);
  },

  stopTracking: () => {
    if (trackingTimer) {
      clearInterval(trackingTimer);
      trackingTimer = null;

      if (trackingResourceId) {
        const elapsed = Math.floor((Date.now() - trackingStartTime) / 60000);
        if (elapsed > 0) {
          get().addLearningRecord({
            resourceId: trackingResourceId,
            duration: elapsed,
            date: dayjs().toISOString(),
          });
        }
      }
    }
    trackingResourceId = null;
  },
}));
