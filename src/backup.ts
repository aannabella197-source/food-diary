import type { JournalEntry, Theme } from './types';

// Contents of a backup file (format version 1, app "food-diary").
export type BackupData = {
  journalEntries: JournalEntry[];
  foodTags: string[];
  activityTags: string[];
  disabledFoodTags: string[];
  disabledActivityTags: string[];
  tagIcons: Record<string, string>;
  theme: Theme;
};

// Builds the backup file and starts its download. Returns when it was created and its size.
export function downloadBackup(data: BackupData) {
  const createdAt = new Date().toISOString();
  const backup = {
    app: 'food-diary',
    version: 1,
    createdAt,
    data,
  };
  const content = JSON.stringify(backup, null, 2);
  const blob = new Blob([content], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const stamp = createdAt.replace(/[:.]/g, '-');
  link.href = url;
  link.download = `food-diary-backup-${stamp}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
  return { createdAt, size: blob.size };
}

// Reads and checks a backup file. Throws an Error with a message for the user
// when the file is not a food diary backup.
export function parseBackup(text: string): { data: BackupData; createdAt: string | null } {
  const parsed: unknown = JSON.parse(text);
  if (!parsed || typeof parsed !== 'object') throw new Error('Файл не распознан.');
  const backup = parsed as { app?: unknown; version?: unknown; data?: Record<string, unknown> };
  const data = backup.data;
  if (
    backup.app !== 'food-diary' ||
    backup.version !== 1 ||
    !data ||
    !Array.isArray(data.journalEntries) ||
    !data.journalEntries.every((entry) =>
      entry && typeof entry === 'object' &&
      typeof (entry as JournalEntry).id === 'number' &&
      typeof (entry as JournalEntry).date === 'string' &&
      typeof (entry as JournalEntry).time === 'string' &&
      typeof (entry as JournalEntry).food === 'string' &&
      Array.isArray((entry as JournalEntry).tags) &&
      Array.isArray((entry as JournalEntry).activity)
    ) ||
    !Array.isArray(data.foodTags) ||
    !Array.isArray(data.activityTags) ||
    !Array.isArray(data.disabledFoodTags) ||
    !Array.isArray(data.disabledActivityTags) ||
    !data.tagIcons ||
    typeof data.tagIcons !== 'object' ||
    Array.isArray(data.tagIcons) ||
    !['light', 'dark', 'system'].includes(String(data.theme))
  ) {
    throw new Error('Структура файла не подходит для восстановления дневника.');
  }
  const createdAt = typeof (backup as { createdAt?: unknown }).createdAt === 'string' ? (backup as { createdAt: string }).createdAt : null;
  return { data: data as unknown as BackupData, createdAt };
}
