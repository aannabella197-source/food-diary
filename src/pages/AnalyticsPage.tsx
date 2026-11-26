import type { JournalEntry } from '../types';
import type { AnalyticsSettings } from '../analyticsSettings';
import { localDateKey as toDateKey } from '../format';
import { defaultTagIcon } from '../tagIcons';
import { TagGlyph } from '../components/TagGlyph';

type Props = {
  entries: JournalEntry[];
  foodTags: string[];
  disabledFoodTags: string[];
  tagIcons: Record<string, string>;
  settings: AnalyticsSettings;
};

export function AnalyticsPage({ entries, foodTags, disabledFoodTags, tagIcons, settings }: Props) {
  const {
    analyticsPeriod, setAnalyticsPeriod, showAllAnalyticsCategories, setShowAllAnalyticsCategories,
    analyticsFrom, setAnalyticsFrom, analyticsTo, setAnalyticsTo,
  } = settings;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const analyticsStart = analyticsPeriod === 'Месяц'
    ? new Date(today.getFullYear(), today.getMonth(), 1)
    : new Date(`${analyticsFrom}T00:00:00`);
  const analyticsEnd = analyticsPeriod === 'Месяц'
    ? new Date(today.getFullYear(), today.getMonth(), today.getDate())
    : new Date(`${analyticsTo}T00:00:00`);
  const analyticsStartKey = toDateKey(analyticsStart);
  const analyticsEndKey = toDateKey(analyticsEnd);
  const analyticsDays = Math.max(1, Math.floor((analyticsEnd.getTime() - analyticsStart.getTime()) / 86400000) + 1);
  const analyticsEntries = entries.filter((entry) => entry.date >= analyticsStartKey && entry.date <= analyticsEndKey);
  const loggedDays = new Set(analyticsEntries.map((entry) => entry.date));
  const averageEntries = loggedDays.size ? analyticsEntries.length / loggedDays.size : 0;
  const firstMeals = Array.from(analyticsEntries.reduce((map, entry) => {
    if (!map.has(entry.date) || entry.time < map.get(entry.date)!) map.set(entry.date, entry.time);
    return map;
  }, new Map<string, string>()).values());
  const averageFirstMeal = firstMeals.length
    ? Math.round(firstMeals.reduce((sum, time) => sum + Number(time.slice(0, 2)) * 60 + Number(time.slice(3, 5)), 0) / firstMeals.length)
    : null;
  const averageFirstMealLabel = averageFirstMeal === null ? '—' : `${String(Math.floor(averageFirstMeal / 60)).padStart(2, '0')}:${String(averageFirstMeal % 60).padStart(2, '0')}`;
  const dayParts = [
    { label: 'Утро', test: (time: string) => time >= '05:00' && time < '11:00' },
    { label: 'День', test: (time: string) => time >= '11:00' && time < '17:00' },
    { label: 'Вечер', test: (time: string) => time >= '17:00' && time < '22:00' },
    { label: 'Ночь', test: (time: string) => time < '05:00' || time >= '22:00' },
  ].map((part) => ({ ...part, count: analyticsEntries.filter((entry) => part.test(entry.time)).length }));
  const categoryCounts = foodTags.filter((tag) => !disabledFoodTags.includes(tag)).map((tag) => ({
    tag, count: analyticsEntries.filter((entry) => entry.tags.includes(tag)).length,
  })).filter((item) => item.count > 0).sort((a, b) => b.count - a.count);
  const visibleCategoryCounts = showAllAnalyticsCategories ? categoryCounts : categoryCounts.slice(0, 3);
  const previousStart = new Date(analyticsStart);
  previousStart.setDate(previousStart.getDate() - analyticsDays);
  const previousEnd = new Date(analyticsStart);
  previousEnd.setDate(previousEnd.getDate() - 1);
  const previousEntries = entries.filter((entry) => entry.date >= toDateKey(previousStart) && entry.date <= toDateKey(previousEnd));
  const previousLoggedDays = new Set(previousEntries.map((entry) => entry.date));
  const entryChange = analyticsEntries.length - previousEntries.length;
  const formatChange = (value: number) => value > 0 ? `+${value}` : String(value);
  const strongestPart = [...dayParts].sort((a, b) => b.count - a.count)[0];
  // Hunger used to be saved as 3 automatically; it is only reliable for entries
  // dated from 26 November 2026, when that stopped.
  const HUNGER_RELIABLE_FROM = '2026-11-26';
  const MIN_MARKED_ENTRIES = 3;
  const hungerEntries = analyticsEntries.filter((entry) => entry.date >= HUNGER_RELIABLE_FROM && typeof entry.hunger === 'number');
  const averageHunger = hungerEntries.length ? hungerEntries.reduce((sum, entry) => sum + (entry.hunger ?? 0), 0) / hungerEntries.length : 0;
  const moodEntries = analyticsEntries.filter((entry) => entry.mood);
  const topMood = moodEntries.length >= MIN_MARKED_ENTRIES
    ? Array.from(moodEntries.reduce((counts, entry) => counts.set(entry.mood!, (counts.get(entry.mood!) || 0) + 1), new Map<string, number>()))
        .sort((a, b) => b[1] - a[1])[0]
    : null;
  // "в 1 записи", "в 2 записях", "в 21 записи", "в 11 записях".
  const inEntriesWord = (count: number) => count % 10 === 1 && count % 100 !== 11 ? 'записи' : 'записях';

  // Observations are shown only when the period has enough entries to be meaningful.
  const MIN_ENTRIES_FOR_OBSERVATIONS = 5;
  const analyticsObservations = analyticsEntries.length < MIN_ENTRIES_FOR_OBSERVATIONS
    ? [`Пока недостаточно записей для наблюдений: нужно хотя бы ${MIN_ENTRIES_FOR_OBSERVATIONS} записей за выбранный период.`]
    : [
        `Больше всего записей приходится на время «${strongestPart.label.toLowerCase()}».`,
        `В дневнике есть записи за ${loggedDays.size} из ${analyticsDays} дней выбранного периода.`,
        `По сравнению с предыдущим равным периодом количество записей изменилось на ${formatChange(entryChange)}.`,
        ...(hungerEntries.length >= MIN_MARKED_ENTRIES
          ? [`Средний уровень голода — ${averageHunger.toFixed(1).replace('.', ',')} из 5 (указан в ${hungerEntries.length} ${inEntriesWord(hungerEntries.length)}).`]
          : []),
        ...(topMood
          ? [`Чаще всего отмечено настроение «${topMood[0]}» — в ${topMood[1]} ${inEntriesWord(topMood[1])} из ${moodEntries.length}, где оно указано.`]
          : []),
      ];

  return (
    <section className="settings-page analytics-page">
      <div className="analytics-period">
        <div className="period-options">
          {(['Месяц', 'Произвольный период'] as const).map((item) => (
            <button key={item} className={analyticsPeriod === item ? 'filter-option active' : 'filter-option'} onClick={() => setAnalyticsPeriod(item)}>{item}</button>
          ))}
        </div>
        {analyticsPeriod === 'Произвольный период' && (
          <div className="date-range">
            <label>С даты<input type="date" value={analyticsFrom} onChange={(event) => setAnalyticsFrom(event.target.value)} /></label>
            <label>По дату<input type="date" value={analyticsTo} onChange={(event) => setAnalyticsTo(event.target.value)} /></label>
          </div>
        )}
        <p className="muted analytics-range-caption">{analyticsStart.toLocaleDateString('ru-RU')} — {analyticsEnd.toLocaleDateString('ru-RU')}</p>
      </div>

      <section className="analytics-section">
        <h2>Общая картина</h2>
        <div className="analytics-metrics">
          <div><span>Приёмов пищи в день с записями</span><strong>{averageEntries ? averageEntries.toFixed(1).replace('.', ',') : '—'}</strong></div>
          <div><span>Первый приём пищи в среднем</span><strong>{averageFirstMealLabel}</strong></div>
          <div><span>Дней с записями</span><strong>{loggedDays.size} / {analyticsDays}</strong></div>
          <div><span>Всего приёмов пищи</span><strong>{analyticsEntries.length}</strong></div>
        </div>
      </section>

      <section className="analytics-section">
        <h2>Распределение по времени суток</h2>
        <div className="analytics-bars">
          {dayParts.map((part) => (
            <div className="analytics-bar-row" key={part.label}>
              <span>{part.label}</span>
              <div className="analytics-bar-track"><i style={{ width: `${analyticsEntries.length ? part.count / analyticsEntries.length * 100 : 0}%` }} /></div>
              <strong>{part.count}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="analytics-section">
        <h2>Категории еды</h2>
        {categoryCounts.length ? (
          <div className="analytics-categories">
            {visibleCategoryCounts.map((item) => (
              <div className="analytics-category" key={item.tag}>
                <span><TagGlyph name={tagIcons[item.tag] || defaultTagIcon(item.tag)} size={15} />{item.tag}</span>
                <strong>{item.count}</strong>
              </div>
            ))}
          </div>
        ) : <p className="muted analytics-empty">За этот период нет записей с тегами еды.</p>}
        {categoryCounts.length > 3 && (
          <button type="button" className="analytics-show-all" onClick={() => setShowAllAnalyticsCategories((shown) => !shown)}>
            {showAllAnalyticsCategories ? 'Свернуть' : 'Показать все'}
          </button>
        )}
        <p className="analytics-footnote">Частота считается по выбранным тегам. В одной записи может быть несколько категорий.</p>
      </section>

      <section className="analytics-section">
        <h2>Изменения привычек</h2>
        <div className="analytics-comparison">
          <span>Записей в предыдущем равном периоде</span><strong>{previousEntries.length}</strong>
          <span>Изменение количества записей</span><strong>{formatChange(entryChange)}</strong>
          <span>Дней с записями в предыдущем периоде</span><strong>{previousLoggedDays.size}</strong>
        </div>
        <div className="analytics-observations">
          <h3>Наблюдения</h3>
          {analyticsObservations.map((observation, index) => <p key={index}>{observation}</p>)}
        </div>
      </section>
      <p className="analytics-disclaimer">Аналитика описывает только внесённые записи. День без записей не означает, что в этот день не было еды.</p>
    </section>
  );
}
