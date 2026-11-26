import type { JournalEntry, JournalPeriod } from './types';
import { localDateKey } from './format';

export type JournalFilter = {
  searchText: string;
  journalPeriod: JournalPeriod;
  dateFrom: string;
  dateTo: string;
  // A day (YYYY-MM-DD) or month (YYYY-MM) picked on the chart.
  chartSelection: string | null;
  filterTags: string[];
};

// Entries matching search, period, chart selection and tags, newest first.
export function filterJournalEntries(entries: JournalEntry[], filter: JournalFilter, today: Date) {
  const { searchText, journalPeriod, dateFrom, dateTo, chartSelection, filterTags } = filter;
  const todayString = localDateKey(today);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayString = localDateKey(yesterday);

  return entries
    .filter((entry) => {
      const query = searchText.trim().toLowerCase();

      const searchableText = [
        entry.food,
        entry.comment,
        ...entry.tags,
        ...entry.activity,
      ].join(' ').toLowerCase();

      if (query && !searchableText.includes(query)) {
        return false;
      }

      if (journalPeriod === 'Сегодня' && entry.date !== todayString) {
        return false;
      }

      if (journalPeriod === 'Вчера' && entry.date !== yesterdayString) {
        return false;
      }

      if (
        journalPeriod === 'Последние 7 дней' ||
        journalPeriod === 'Последние 30 дней'
      ) {
        const days = journalPeriod === 'Последние 7 дней' ? 7 : 30;
        const startDate = new Date(today);
        startDate.setDate(startDate.getDate() - (days - 1));

        const entryDate = new Date(`${entry.date}T12:00:00`);

        if (entryDate < startDate || entryDate > today) {
          return false;
        }
      }

      if (journalPeriod === 'Произвольный период') {
        if (dateFrom && entry.date < dateFrom) return false;
        if (dateTo && entry.date > dateTo) return false;
      }

      if (chartSelection && !entry.date.startsWith(chartSelection)) {
        return false;
      }

      if (filterTags.length > 0) {
        const allEntryTags = [...entry.tags, ...entry.activity];
        if (!filterTags.some((tag) => allEntryTags.includes(tag))) {
          return false;
        }
      }

      return true;
    })
    .sort((a, b) => {
      const dateComparison = b.date.localeCompare(a.date);
      return dateComparison || b.time.localeCompare(a.time);
    });
}

// Entries grouped by day, keeping their order.
export function groupEntriesByDate(entries: JournalEntry[]) {
  return entries.reduce<{ date: string; entries: JournalEntry[] }[]>((groups, entry) => {
    const existingGroup = groups.find((group) => group.date === entry.date);

    if (existingGroup) {
      existingGroup.entries.push(entry);
    } else {
      groups.push({ date: entry.date, entries: [entry] });
    }

    return groups;
  }, []);
}
