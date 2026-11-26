// Shared data types of the food diary.

export type Period = 'Месяц' | 'Год';
export type Theme = 'light' | 'dark' | 'system';
export type JournalPeriod =
  | 'Все записи'
  | 'Сегодня'
  | 'Вчера'
  | 'Последние 7 дней'
  | 'Последние 30 дней'
  | 'Произвольный период';

export type JournalEntry = {
  id: number;
  date: string;
  time: string;
  food: string;
  tags: string[];
  activity: string[];
  carbs: number | null;
  comment: string;
  hunger?: number;
  mood?: string;
};
