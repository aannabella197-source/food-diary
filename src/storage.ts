// Reading data saved in localStorage, default tags and the data format version.
import type { JournalEntry } from './types';

export const defaultFoodTags = [
  'Перекус', 'Завтрак', 'Обед', 'Ужин',
  'Десерт', 'Фрукты', 'Овощи', 'Мучное',
  'Без глютена', 'Молочное', 'Мясное', 'Крупы',
  'Ягоды', 'Орехи', 'Вода', 'Алкогольные напитки',
  'Безалкогольные напитки', 'Чай', 'Кофе', 'Смузи',
];

export const defaultActivityTags = [
  'Прогулка', 'Домашние дела', 'Тренировка', 'Отдых', 'Работа',
];

export const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === 'string');

export const isJournalEntryList = (value: unknown): value is JournalEntry[] =>
  Array.isArray(value) && value.every((entry) =>
    entry && typeof entry === 'object' &&
    typeof (entry as JournalEntry).id === 'number' &&
    typeof (entry as JournalEntry).date === 'string' &&
    typeof (entry as JournalEntry).time === 'string' &&
    typeof (entry as JournalEntry).food === 'string' &&
    Array.isArray((entry as JournalEntry).tags) &&
    Array.isArray((entry as JournalEntry).activity)
  );

export const isTagIconMap = (value: unknown): value is Record<string, string> =>
  !!value && typeof value === 'object' && !Array.isArray(value);

// Version of the data format kept in localStorage. Any future change to how
// entries or settings are stored must migrate data from older versions.
export const STORAGE_VERSION_KEY = 'food-diary-storage-version';
export const STORAGE_VERSION = 1;
try {
  if (!localStorage.getItem(STORAGE_VERSION_KEY)) localStorage.setItem(STORAGE_VERSION_KEY, String(STORAGE_VERSION));
} catch {
  // storage unavailable; the app still works with defaults
}

// Keys whose saved data could not be read on this launch.
export const damagedStorageKeys = new Set<string>();

// Reads saved data without crashing the app. If the saved value is damaged,
// a copy of it is kept under a separate key and the fallback is used instead.
export function loadStored<T>(key: string, fallback: T, isValid: (value: unknown) => value is T): T {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    const parsed: unknown = JSON.parse(raw);
    if (isValid(parsed)) return parsed;
  } catch {
    // handled below
  }
  if (raw !== null) {
    try {
      localStorage.setItem(`food-diary-damaged-${key}-${new Date().toISOString()}`, raw);
    } catch {
      // storage may be full or unavailable; nothing more can be done here
    }
  }
  damagedStorageKeys.add(key);
  return fallback;
}
