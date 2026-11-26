import type { JournalEntry, Period } from './types';
import { localDateKey as toDateKey } from './format';

export type ChartColumn = { key: string; label: string; date: string; count: number };

// Data for the "Динамика" chart. chartOffset: 0 = current month/year,
// -1 = previous one, and so on; it is limited to the earliest entry.
export function buildChart(entries: JournalEntry[], period: Period, chartOffset: number, today: Date) {
  const countForDate = (dateKey: string) => entries.filter((entry) => entry.date === dateKey).length;
  const earliestEntryDate = entries.reduce<string | null>((min, entry) => (!min || entry.date < min ? entry.date : min), null);
  const earliestYear = earliestEntryDate ? Number(earliestEntryDate.slice(0, 4)) : today.getFullYear();
  const earliestMonth = earliestEntryDate ? Number(earliestEntryDate.slice(5, 7)) - 1 : today.getMonth();
  const minChartOffset = period === 'Месяц'
    ? Math.min(0, (earliestYear - today.getFullYear()) * 12 + (earliestMonth - today.getMonth()))
    : Math.min(0, earliestYear - today.getFullYear());
  const safeChartOffset = Math.max(minChartOffset, Math.min(0, chartOffset));
  const chartMonthStart = new Date(today.getFullYear(), today.getMonth() + safeChartOffset, 1);
  const chartYear = today.getFullYear() + safeChartOffset;
  const chartData: ChartColumn[] = period === 'Месяц'
    ? Array.from({ length: new Date(chartMonthStart.getFullYear(), chartMonthStart.getMonth() + 1, 0).getDate() }, (_, index) => {
        const date = new Date(chartMonthStart.getFullYear(), chartMonthStart.getMonth(), index + 1);
        return { key: toDateKey(date), label: String(index + 1), date: date.toLocaleDateString('ru-RU', { weekday: 'short' }).replace('.', ''), count: countForDate(toDateKey(date)) };
      })
    : Array.from({ length: 12 }, (_, index) => ({ key: `${chartYear}-${String(index + 1).padStart(2, '0')}`, label: new Date(chartYear, index, 1).toLocaleDateString('ru-RU', { month: 'short' }).replace('.', ''), date: '', count: entries.filter((entry) => entry.date.startsWith(`${chartYear}-${String(index + 1).padStart(2, '0')}`)).length }));
  const chartTotal = chartData.reduce((sum, item) => sum + item.count, 0);
  const chartTitle = period === 'Месяц' ? chartMonthStart.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' }) : `${chartYear} год`;
  return { minChartOffset, safeChartOffset, chartData, chartTotal, chartTitle };
}

// "14 ноября", "14 ноября 2025 г." or "сентябрь 2026" for the selection chip.
export function formatChartSelection(chartSelection: string | null, today: Date) {
  return chartSelection
    ? chartSelection.length === 10
      ? new Date(`${chartSelection}T12:00:00`).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', ...(chartSelection.startsWith(String(today.getFullYear())) ? {} : { year: 'numeric' }) })
      : new Date(`${chartSelection}-01T12:00:00`).toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' }).replace(' г.', '')
    : '';
}
