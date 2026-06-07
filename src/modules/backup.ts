import type { AppState } from '@/types';

const BACKUP_VERSION = '1.0.0';

interface BackupData {
  version: string;
  createdAt: string;
  data: AppState;
}

class BackupManager {
  exportData(state: AppState): string {
    const backup: BackupData = {
      version: BACKUP_VERSION,
      createdAt: new Date().toISOString(),
      data: state,
    };
    return JSON.stringify(backup, null, 2);
  }

  importData(jsonString: string): { success: boolean; data?: AppState; error?: string } {
    try {
      const backup = JSON.parse(jsonString) as BackupData;

      if (!backup.version || !backup.data || !backup.createdAt) {
        return { success: false, error: '无效的备份文件格式' };
      }

      if (backup.version !== BACKUP_VERSION) {
        return { success: false, error: `不支持的备份版本: ${backup.version}` };
      }

      const requiredKeys: (keyof AppState)[] = [
        'resources',
        'notes',
        'tags',
        'learningRecords',
        'reviewSchedules',
        'settings',
      ];

      for (const key of requiredKeys) {
        if (!(key in backup.data)) {
          return { success: false, error: `备份数据缺少必要字段: ${key}` };
        }
      }

      return { success: true, data: backup.data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '解析备份文件失败',
      };
    }
  }

  downloadBackup(state: AppState, filename?: string): void {
    const data = this.exportData(state);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const defaultFilename = `knowledge-base-backup-${new Date().toISOString().split('T')[0]}.json`;

    const link = document.createElement('a');
    link.href = url;
    link.download = filename || defaultFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  async readBackupFile(
    file: File
  ): Promise<{ success: boolean; data?: AppState; error?: string }> {
    return new Promise((resolve) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        const content = e.target?.result as string;
        resolve(this.importData(content));
      };

      reader.onerror = () => {
        resolve({ success: false, error: '读取文件失败' });
      };

      reader.readAsText(file);
    });
  }

  getBackupInfo(
    jsonString: string
  ): { version: string; createdAt: string; size: number } | null {
    try {
      const backup = JSON.parse(jsonString) as BackupData;
      return {
        version: backup.version,
        createdAt: backup.createdAt,
        size: new Blob([jsonString]).size,
      };
    } catch {
      return null;
    }
  }

  validateBackup(jsonString: string): boolean {
    const result = this.importData(jsonString);
    return result.success;
  }

  getBackupVersion(): string {
    return BACKUP_VERSION;
  }

  getVersion(): string {
    return BACKUP_VERSION;
  }

  mergeData(
    currentState: AppState,
    importedState: AppState,
    strategy: 'replace' | 'merge' = 'replace'
  ): AppState {
    if (strategy === 'replace') {
      return importedState;
    }

    const mergeArray = <T extends { id: string }>(current: T[], imported: T[]): T[] => {
      const map = new Map<string, T>();
      current.forEach((item) => map.set(item.id, item));
      imported.forEach((item) => map.set(item.id, item));
      return Array.from(map.values());
    };

    return {
      resources: mergeArray(currentState.resources, importedState.resources),
      notes: mergeArray(currentState.notes, importedState.notes),
      tags: mergeArray(currentState.tags, importedState.tags),
      learningRecords: mergeArray(currentState.learningRecords, importedState.learningRecords),
      reviewSchedules: mergeArray(currentState.reviewSchedules, importedState.reviewSchedules),
      settings: importedState.settings,
    };
  }
}

export const backupManager = new BackupManager();

export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};
