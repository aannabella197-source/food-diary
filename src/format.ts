// Dates, Russian plural forms and display order helpers.
import type { JournalPeriod } from './types';

export const localDateKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
export const todayKey = () => localDateKey(new Date());
export const monthStartKey = () => {
  const date = new Date();
  date.setDate(1);
  return localDateKey(date);
};

// "1 запись", "2 записи", "5 записей", "21 запись", "11 записей".
export const formatEntryCount = (count: number) => {
  const lastTwo = count % 100;
  const last = count % 10;
  const word = lastTwo >= 11 && lastTwo <= 14 ? 'записей' : last === 1 ? 'запись' : last >= 2 && last <= 4 ? 'записи' : 'записей';
  return `${count} ${word}`;
};

export const pluralDays = (count: number) => {
  const lastTwo = count % 100;
  const last = count % 10;
  return lastTwo >= 11 && lastTwo <= 14 ? 'дней' : last === 1 ? 'день' : last >= 2 && last <= 4 ? 'дня' : 'дней';
};

// When an entry is shown, meal tags go first in this order, then the rest as saved.
export const MEAL_TAG_ORDER = ['завтрак', 'обед', 'ужин', 'перекус'];
export const mealTagsFirst = (tags: string[]) => {
  const rank = (tag: string) => {
    const index = MEAL_TAG_ORDER.indexOf(tag.trim().toLocaleLowerCase('ru'));
    return index === -1 ? MEAL_TAG_ORDER.length : index;
  };
  return tags.map((tag, index) => ({ tag, index })).sort((a, b) => rank(a.tag) - rank(b.tag) || a.index - b.index).map((item) => item.tag);
};

export const journalPeriods: JournalPeriod[] = [
  'Все записи',
  'Сегодня',
  'Вчера',
  'Последние 7 дней',
  'Последние 30 дней',
  'Произвольный период',
];

// "суббота, 14 ноября" — heading for a day of entries.
export const formatEntryDate = (date: string) =>
  new Date(`${date}T12:00:00`).toLocaleDateString('ru-RU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

// Weight typed by the user ("63,5" or "63.5") -> number, or null when empty/invalid.
export const parseWeight = (text: string) => {
  const value = Number(text.trim().replace(',', '.'));
  return text.trim() && Number.isFinite(value) && value > 0 && value < 1000 ? Math.round(value * 10) / 10 : null;
};

// 63.5 -> "63,5"
export const formatWeight = (value: number) => String(Math.round(value * 10) / 10).replace('.', ',');
