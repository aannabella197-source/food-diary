
import { useEffect, useRef, useState } from 'react';
import './App.css';
import type { JournalEntry, JournalPeriod, Period, Theme } from './types';
import { applyIconUpdate, defaultTagIcon } from './tagIcons';
import { TagGlyph } from './components/TagGlyph';
import {
  damagedStorageKeys, defaultActivityTags, defaultFoodTags, isJournalEntryList, isStringArray, isTagIconMap, loadStored,
} from './storage';
import { AppearancePage } from './pages/AppearancePage';
import { AboutPage } from './pages/AboutPage';
import { BackupPage } from './pages/BackupPage';
import { ExportPage } from './pages/ExportPage';
import { useExportSettings } from './exportSettings';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { TagManagementPage } from './pages/TagManagementPage';
import { useTagManagementState } from './tagManagementState';
import { useAnalyticsSettings } from './analyticsSettings';
import { formatEntryDate } from './format';
import { BackButton } from './components/BackButton';
import { EntryDetailPage } from './pages/EntryDetailPage';
import { EntryEditorPage } from './pages/EntryEditorPage';
import { useEntryDraft } from './entryDraft';
import { formatEntryCount, journalPeriods, mealTagsFirst, monthStartKey, pluralDays, todayKey } from './format';

function App() {
  const [period, setPeriod] = useState<Period>('Месяц');
  const [chartOffset, setChartOffset] = useState(0);
  // A day (YYYY-MM-DD) or month (YYYY-MM) picked on the chart to narrow the list below.
  const [chartSelection, setChartSelection] = useState<string | null>(null);
  const toggleChartSelection = (key: string) => setChartSelection((current) => current === key ? null : key);
  // Analytics choices live here so they are kept while moving between screens.
  const analyticsSettings = useAnalyticsSettings();
  const chartScrollRef = useRef<HTMLDivElement>(null);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(() => loadStored('food-diary-entries', [], isJournalEntryList));
  // Fields of the entry being added or edited.
  const draft = useEntryDraft();
  const {
    entryDate, setEntryDate, entryTime, setEntryTime, entryFood, setEntryFood, entryCarbs, setEntryCarbs, entryComment, setEntryComment, setShowAllFields, setShowAllFoodTags, setShowAllActivityTags, selectedTags, setSelectedTags, hunger, setHunger, mood, setMood,
  } = draft;
  const [settingsPage, setSettingsPage] = useState<string | null>(null);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [aboutSections, setAboutSections] = useState({ storage: false, backup: false, export: false });
  const [foodTags, setFoodTags] = useState<string[]>(() => loadStored('food-diary-food-tags', defaultFoodTags, isStringArray));
  const [activityTags, setActivityTags] = useState<string[]>(() => loadStored('food-diary-activity-tags', defaultActivityTags, isStringArray));
  const [disabledFoodTags, setDisabledFoodTags] = useState<string[]>(() => loadStored('food-diary-disabled-food-tags', [], isStringArray));
  const [disabledActivityTags, setDisabledActivityTags] = useState<string[]>(() => loadStored('food-diary-disabled-activity-tags', [], isStringArray));
  const [tagIcons, setTagIcons] = useState<Record<string, string>>(() => applyIconUpdate(loadStored('food-diary-tag-icons', {}, isTagIconMap)));
  // Tag management screen state (kept while moving between screens).
  const tagUi = useTagManagementState();
  // Export choices live here so they are kept while moving between screens.
  const exportSettings = useExportSettings();
  const [backupInfo, setBackupInfo] = useState<{ createdAt: string; size: number } | null>(() =>
    loadStored('food-diary-last-backup', null, (value): value is { createdAt: string; size: number } | null =>
      value === null || (!!value && typeof value === 'object' &&
        typeof (value as { createdAt?: unknown }).createdAt === 'string' &&
        typeof (value as { size?: unknown }).size === 'number')));
  const [storageWarningVisible, setStorageWarningVisible] = useState(() =>
    ['food-diary-entries', 'food-diary-food-tags', 'food-diary-activity-tags', 'food-diary-disabled-food-tags', 'food-diary-disabled-activity-tags', 'food-diary-tag-icons']
      .some((key) => damagedStorageKeys.has(key)));

  useEffect(() => { localStorage.setItem('food-diary-entries', JSON.stringify(journalEntries)); }, [journalEntries]);

  useEffect(() => {
    localStorage.setItem('food-diary-food-tags', JSON.stringify(foodTags));
    localStorage.setItem('food-diary-activity-tags', JSON.stringify(activityTags));
    localStorage.setItem('food-diary-disabled-food-tags', JSON.stringify(disabledFoodTags));
    localStorage.setItem('food-diary-disabled-activity-tags', JSON.stringify(disabledActivityTags));
    localStorage.setItem('food-diary-tag-icons', JSON.stringify(tagIcons));
  }, [foodTags, activityTags, disabledFoodTags, disabledActivityTags, tagIcons]);


  const restoreBackup = async (file: File) => {
    try {
      const parsed: unknown = JSON.parse(await file.text());
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

      if (!window.confirm('Восстановить данные из выбранной копии? Текущие записи, теги и настройки будут заменены данными из файла.')) return;

      setJournalEntries(data.journalEntries as JournalEntry[]);
      setFoodTags(data.foodTags as string[]);
      setActivityTags(data.activityTags as string[]);
      setDisabledFoodTags(data.disabledFoodTags as string[]);
      setDisabledActivityTags(data.disabledActivityTags as string[]);
      setTagIcons(data.tagIcons as Record<string, string>);
      setTheme(data.theme as Theme);
      setSelectedEntry(null);
      setEditingEntryId(null);
      setEditorOpen(false);
      setSelectedTags([]);
      const info = {
        createdAt: typeof (backup as { createdAt?: unknown }).createdAt === 'string'
          ? (backup as { createdAt: string }).createdAt
          : new Date(file.lastModified).toISOString(),
        size: file.size,
      };
      setBackupInfo(info);
      localStorage.setItem('food-diary-last-backup', JSON.stringify(info));
      window.alert('Данные успешно восстановлены.');
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'Не удалось прочитать файл резервной копии.');
    }
  };

  const BACKUP_REMINDER_DAYS = 7;
  const [backupReminderSnoozedUntil, setBackupReminderSnoozedUntil] = useState(() => {
    try {
      return Number(localStorage.getItem('food-diary-backup-reminder-snoozed-until')) || 0;
    } catch {
      return 0;
    }
  });
  const [reminderNow] = useState(() => Date.now());
  const daysSinceBackup = backupInfo ? Math.floor((reminderNow - new Date(backupInfo.createdAt).getTime()) / 86400000) : null;
  const backupReminderVisible = journalEntries.length > 0 &&
    (daysSinceBackup === null || daysSinceBackup >= BACKUP_REMINDER_DAYS) &&
    reminderNow >= backupReminderSnoozedUntil;
  const snoozeBackupReminder = () => {
    const until = reminderNow + 3 * 86400000;
    setBackupReminderSnoozedUntil(until);
    try {
      localStorage.setItem('food-diary-backup-reminder-snoozed-until', String(until));
    } catch {
      // not critical: the reminder simply shows again next time
    }
  };

  const createBackup = () => {
    const createdAt = new Date().toISOString();
    const backup = {
      app: 'food-diary',
      version: 1,
      createdAt,
      data: {
        journalEntries,
        foodTags,
        activityTags,
        disabledFoodTags,
        disabledActivityTags,
        tagIcons,
        theme,
      },
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
    const info = { createdAt, size: blob.size };
    setBackupInfo(info);
    localStorage.setItem('food-diary-last-backup', JSON.stringify(info));
  };

  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('food-diary-theme');
    return savedTheme === 'light' || savedTheme === 'dark' ? savedTheme : 'system';
  });

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const applyTheme = () => {
      const isDark = theme === 'dark' || (theme === 'system' && media.matches);
      document.body.dataset.theme = isDark ? 'dark' : 'light';
    };

    applyTheme();
    localStorage.setItem('food-diary-theme', theme);

    if (theme === 'system') {
      media.addEventListener('change', applyTheme);
      return () => media.removeEventListener('change', applyTheme);
    }
  }, [theme]);
  const [editorOpen, setEditorOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [editingEntryId, setEditingEntryId] = useState<number | null>(null);
  const [confirmDeleteEntry, setConfirmDeleteEntry] = useState(false);

  const [searchText, setSearchText] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [journalPeriod, setJournalPeriod] =
    useState<JournalPeriod>('Все записи');
  const [filterTags, setFilterTags] = useState<string[]>([]);
  const [dateFrom, setDateFrom] = useState(monthStartKey);
  const [dateTo, setDateTo] = useState(todayKey);

  const toggleTag = (tag: string) => {
    setSelectedTags((current) =>
      current.includes(tag)
        ? current.filter((item) => item !== tag)
        : [...current, tag]
    );
  };

  const toggleFilterTag = (tag: string) => {
    setFilterTags((current) =>
      current.includes(tag)
        ? current.filter((item) => item !== tag)
        : [...current, tag]
    );
  };

  const resetFilters = () => {
    setSearchText('');
    setJournalPeriod('Все записи');
    setFilterTags([]);
    setDateFrom(monthStartKey());
    setDateTo(todayKey());
  };

  const openEditor = () => {
    setEditingEntryId(null);
    setConfirmDeleteEntry(false);
    const now = new Date();
    setEntryDate(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`);
    setEntryTime(now.toTimeString().slice(0, 5));
    setEntryFood(''); setEntryCarbs(''); setEntryComment('');
    setSelectedTags([]);
    setShowAllFields(false);
    setShowAllFoodTags(false);
    setShowAllActivityTags(false);
    setHunger(undefined);
    setMood('');
    setEditorOpen(true);
  };

  const startEditingEntry = (entry: JournalEntry) => {
    setEditingEntryId(entry.id);
    setEntryDate(entry.date);
    setEntryTime(entry.time);
    setEntryFood(entry.food);
    setEntryCarbs(entry.carbs === null ? '' : String(entry.carbs));
    setEntryComment(entry.comment || '');
    setSelectedTags([...entry.tags, ...entry.activity]);
    setShowAllFields(false);
    setShowAllFoodTags(true);
    setShowAllActivityTags(true);
    setHunger(entry.hunger);
    setMood(entry.mood ?? '');
    setConfirmDeleteEntry(false);
    setSelectedEntry(null);
    setEditorOpen(true);
  };

  const cancelEntryEditor = () => {
    setEditorOpen(false);
    if (editingEntryId !== null) {
      const original = journalEntries.find((entry) => entry.id === editingEntryId) || null;
      setSelectedEntry(original);
    }
    setEditingEntryId(null);
  };

  const saveEntry = () => {
    if (!entryFood.trim()) return;
    const nextEntry: JournalEntry = {
      id: editingEntryId ?? Date.now(), date: entryDate, time: entryTime, food: entryFood.trim(),
      tags: selectedTags.filter((tag) => foodTags.includes(tag)),
      activity: selectedTags.filter((tag) => activityTags.includes(tag)),
      carbs: entryCarbs.trim() ? Number(entryCarbs) : null,
      comment: entryComment.trim(),
      hunger,
      mood,
    };
    if (editingEntryId !== null) {
      setJournalEntries((current) => current.map((entry) => entry.id === editingEntryId ? nextEntry : entry));
      setSelectedEntry(nextEntry);
    } else {
      setJournalEntries((current) => [...current, nextEntry]);
    }
    setEditingEntryId(null);
    setEditorOpen(false);
  };

  // Disabled tags are not offered for new choices, but an entry being edited
  // keeps showing the disabled tags it already had.
  const editingOriginalEntry = editingEntryId !== null ? journalEntries.find((entry) => entry.id === editingEntryId) : undefined;
  const editorFoodTags = foodTags.filter((tag) => !disabledFoodTags.includes(tag) || !!editingOriginalEntry?.tags.includes(tag));
  const editorActivityTags = activityTags.filter((tag) => !disabledActivityTags.includes(tag) || !!editingOriginalEntry?.activity.includes(tag));

  const deleteSelectedEntry = () => {
    if (!selectedEntry) return;
    setJournalEntries((current) => current.filter((entry) => entry.id !== selectedEntry.id));
    setSelectedEntry(null);
    setConfirmDeleteEntry(false);
  };

  const fallbackBack = () => {
    if (moreMenuOpen) {
      setMoreMenuOpen(false);
    } else if (selectedEntry) {
      setSelectedEntry(null);
      setConfirmDeleteEntry(false);
    } else if (editorOpen) {
      cancelEntryEditor();
    } else if (settingsPage) {
      setSettingsPage(null);
    }
  };

  const currentScreenKey = moreMenuOpen
    ? `menu-${settingsPage ?? 'main'}`
    : selectedEntry
      ? `entry-${selectedEntry.id}`
      : editorOpen
        ? `editor-${editingEntryId ?? 'new'}`
        : settingsPage
          ? `settings-${settingsPage}`
          : 'main';
  // How many Back presses this screen is away from the main screen.
  // The browser history always holds exactly that many app entries above
  // the main one, so the Android Back button never has "empty" presses.
  const screenUnderMenuDepth = settingsPage ? 1 : 0;
  const currentScreenDepth = moreMenuOpen
    ? screenUnderMenuDepth + 1
    : selectedEntry
      ? 1
      : editorOpen
        ? (editingEntryId !== null ? 2 : 1)
        : screenUnderMenuDepth;
  const historyDepth = useRef(0);
  const ignoreNextPop = useRef(false);
  const fallbackBackRef = useRef(fallbackBack);
  useEffect(() => { fallbackBackRef.current = fallbackBack; });

  const handleInAppBack = () => {
    if (historyDepth.current > 0) {
      window.history.back();
    } else {
      fallbackBack();
    }
  };

  useEffect(() => {
    window.history.replaceState({ foodDiaryApp: true, depth: 0 }, '');
    historyDepth.current = 0;

    const handlePopState = (event: PopStateEvent) => {
      const depth = typeof event.state?.depth === 'number' ? event.state.depth : 0;
      historyDepth.current = depth;
      if (ignoreNextPop.current) {
        ignoreNextPop.current = false;
        return;
      }
      fallbackBackRef.current();
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    const current = historyDepth.current;
    if (currentScreenDepth > current) {
      for (let depth = current + 1; depth <= currentScreenDepth; depth += 1) {
        window.history.pushState({ foodDiaryApp: true, depth }, '');
      }
      historyDepth.current = currentScreenDepth;
    } else if (currentScreenDepth < current) {
      // The app went back by itself (saved, deleted, closed the menu):
      // drop the extra history entries without triggering another Back.
      ignoreNextPop.current = true;
      historyDepth.current = currentScreenDepth;
      window.history.go(currentScreenDepth - current);
    }
  }, [currentScreenKey, currentScreenDepth]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayString = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, '0'),
    String(today.getDate()).padStart(2, '0'),
  ].join('-');

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const yesterdayString = [
    yesterday.getFullYear(),
    String(yesterday.getMonth() + 1).padStart(2, '0'),
    String(yesterday.getDate()).padStart(2, '0'),
  ].join('-');

  const filteredEntries = journalEntries
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

  const groupedEntries = filteredEntries.reduce<
    { date: string; entries: JournalEntry[] }[]
  >((groups, entry) => {
    const existingGroup = groups.find((group) => group.date === entry.date);

    if (existingGroup) {
      existingGroup.entries.push(entry);
    } else {
      groups.push({ date: entry.date, entries: [entry] });
    }

    return groups;
  }, []);

  const toDateKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  const countForDate = (dateKey: string) => journalEntries.filter((entry) => entry.date === dateKey).length;
  // 0 = current month/year, -1 = previous one, and so on. Not saved between launches.
  const earliestEntryDate = journalEntries.reduce<string | null>((min, entry) => (!min || entry.date < min ? entry.date : min), null);
  const earliestYear = earliestEntryDate ? Number(earliestEntryDate.slice(0, 4)) : today.getFullYear();
  const earliestMonth = earliestEntryDate ? Number(earliestEntryDate.slice(5, 7)) - 1 : today.getMonth();
  const minChartOffset = period === 'Месяц'
    ? Math.min(0, (earliestYear - today.getFullYear()) * 12 + (earliestMonth - today.getMonth()))
    : Math.min(0, earliestYear - today.getFullYear());
  const safeChartOffset = Math.max(minChartOffset, Math.min(0, chartOffset));
  const chartMonthStart = new Date(today.getFullYear(), today.getMonth() + safeChartOffset, 1);
  const chartYear = today.getFullYear() + safeChartOffset;
  const chartData = period === 'Месяц'
    ? Array.from({ length: new Date(chartMonthStart.getFullYear(), chartMonthStart.getMonth() + 1, 0).getDate() }, (_, index) => {
        const date = new Date(chartMonthStart.getFullYear(), chartMonthStart.getMonth(), index + 1);
        return { key: toDateKey(date), label: String(index + 1), date: date.toLocaleDateString('ru-RU', { weekday: 'short' }).replace('.', ''), count: countForDate(toDateKey(date)) };
      })
    : Array.from({ length: 12 }, (_, index) => ({ key: `${chartYear}-${String(index + 1).padStart(2, '0')}`, label: new Date(chartYear, index, 1).toLocaleDateString('ru-RU', { month: 'short' }).replace('.', ''), date: '', count: journalEntries.filter((entry) => entry.date.startsWith(`${chartYear}-${String(index + 1).padStart(2, '0')}`)).length }));
  const chartTotal = chartData.reduce((sum, item) => sum + item.count, 0);
  const chartTitle = period === 'Месяц' ? chartMonthStart.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' }) : `${chartYear} год`;

  const chartVisible = !selectedEntry && !editorOpen && !settingsPage;
  const todayDayOfMonth = today.getDate();
  useEffect(() => {
    // Runs again whenever the chart reappears, so today's date is near the left edge.
    if (!chartVisible || period !== 'Месяц') return;
    const scrollToToday = () => {
      const chart = chartScrollRef.current;
      if (!chart) return;
      const dayWidth = 36;
      // Instant, not smooth: on phones a smooth scroll can be interrupted
      // while the screen is still being laid out after returning to it.
      // Current month: today near the left edge; past months: from day 1.
      const targetDay = safeChartOffset === 0 ? todayDayOfMonth : 1;
      chart.scrollTo({ left: Math.max(0, (targetDay - 1) * dayWidth), behavior: 'instant' });
    };
    scrollToToday();
    const frame = window.requestAnimationFrame(scrollToToday);
    const timer = window.setTimeout(scrollToToday, 200);
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timer);
    };
  }, [period, chartVisible, todayDayOfMonth, safeChartOffset]);

  const chartSelectionLabel = chartSelection
    ? chartSelection.length === 10
      ? new Date(`${chartSelection}T12:00:00`).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', ...(chartSelection.startsWith(String(today.getFullYear())) ? {} : { year: 'numeric' }) })
      : new Date(`${chartSelection}-01T12:00:00`).toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' }).replace(' г.', '')
    : '';

  return (
    <div className="app">
      {selectedEntry ? (
        <EntryDetailPage
          entry={selectedEntry}
          tagIcons={tagIcons}
          confirmDelete={confirmDeleteEntry}
          setConfirmDelete={setConfirmDeleteEntry}
          onBack={handleInAppBack}
          onEdit={() => startEditingEntry(selectedEntry)}
          onDelete={deleteSelectedEntry}
        />
      ) : editorOpen ? (
        <EntryEditorPage
          draft={draft}
          isEditing={editingEntryId !== null}
          foodTags={editorFoodTags}
          activityTags={editorActivityTags}
          tagIcons={tagIcons}
          onToggleTag={toggleTag}
          onBack={handleInAppBack}
          onSave={saveEntry}
        />
      ) : (
        <>
          <header className="topbar">
            <div>
              <div className={settingsPage ? "settings-title-row" : ""}>
                {settingsPage && (
                  <BackButton className="settings-back" onClick={handleInAppBack} />
                )}
                <h1>{settingsPage || 'Дневник питания'}</h1>
              </div>
            </div>
            <div className="more-menu-wrap">
              <button className="profile-mark more-menu-button" type="button" aria-label="Открыть меню разделов" aria-expanded={moreMenuOpen} onClick={() => setMoreMenuOpen((open) => !open)}>
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <circle cx="5" cy="12" r="1.7" />
                  <circle cx="12" cy="12" r="1.7" />
                  <circle cx="19" cy="12" r="1.7" />
                </svg>
              </button>
              {moreMenuOpen && (
                <div className="more-menu">
                  {['Аналитика', 'Управление тегами', 'Резервное копирование', 'Экспорт данных', 'Оформление', 'О приложении'].map((item) => (
                    <button type="button" key={item} onClick={() => {
                      setSettingsPage(item);
                      setMoreMenuOpen(false);
                    }}>{item}</button>
                  ))}
                </div>
              )}
            </div>
          </header>

          <main>
            {settingsPage === 'Аналитика' && (
              <AnalyticsPage entries={journalEntries} foodTags={foodTags} disabledFoodTags={disabledFoodTags} tagIcons={tagIcons} settings={analyticsSettings} />
            )}

            {settingsPage === 'Оформление' && <AppearancePage theme={theme} onChange={setTheme} />}

            {settingsPage === 'Управление тегами' && (
              <TagManagementPage
                ui={tagUi}
                journalEntries={journalEntries} setJournalEntries={setJournalEntries}
                foodTags={foodTags} setFoodTags={setFoodTags} activityTags={activityTags} setActivityTags={setActivityTags}
                disabledFoodTags={disabledFoodTags} setDisabledFoodTags={setDisabledFoodTags}
                disabledActivityTags={disabledActivityTags} setDisabledActivityTags={setDisabledActivityTags}
                tagIcons={tagIcons} setTagIcons={setTagIcons} setFilterTags={setFilterTags}
              />
            )}

            {settingsPage === 'Экспорт данных' && <ExportPage entries={journalEntries} settings={exportSettings} />}

            {settingsPage === 'О приложении' && (
              <AboutPage sections={aboutSections} onToggle={(section) => setAboutSections((current) => ({ ...current, [section]: !current[section] }))} />
            )}

            {settingsPage === 'Резервное копирование' && (
              <BackupPage backupInfo={backupInfo} onCreate={createBackup} onRestore={(file) => void restoreBackup(file)} />
            )}

            {settingsPage && settingsPage !== 'Аналитика' && settingsPage !== 'Оформление' && settingsPage !== 'Управление тегами' && settingsPage !== 'Экспорт данных' && settingsPage !== 'Резервное копирование' && settingsPage !== 'О приложении' && (
              <section className="settings-page">
                <p className="muted">Раздел настроек</p>
                <h2>{settingsPage}</h2>
                <p className="settings-placeholder">Этот экран открыт. Его содержимое и функции добавим на следующем этапе.</p>
              </section>
            )}

            {!settingsPage && (
              <>
                {backupReminderVisible && (
                  <section className="backup-reminder">
                    <p>{daysSinceBackup === null ? 'Резервная копия ещё не создавалась.' : `Последняя резервная копия — ${daysSinceBackup} ${pluralDays(daysSinceBackup)} назад.`} Записи хранятся только на этом устройстве.</p>
                    <div>
                      <button type="button" className="primary" onClick={createBackup}>Создать копию</button>
                      <button type="button" onClick={snoozeBackupReminder}>Позже</button>
                    </div>
                  </section>
                )}
                {storageWarningVisible && (
                  <section className="storage-warning" role="alert">
                    <p>Не удалось прочитать часть сохранённых данных. Повреждённые данные не удалены: их копия оставлена в браузере. Если у тебя есть резервная копия, её можно восстановить в разделе «Резервное копирование».</p>
                    <button type="button" onClick={() => setStorageWarningVisible(false)}>Понятно</button>
                  </section>
                )}
                <section className="period-switch">
                  {(['Месяц', 'Год'] as Period[]).map((item) => (
                    <button
                      key={item}
                      className={period === item ? 'period active' : 'period'}
                      onClick={() => { setPeriod(item); setChartOffset(0); setChartSelection(null); }}
                    >
                      {item}
                    </button>
                  ))}
                </section>

                <section className="chart-card">
                  <div className="section-heading">
                    <div>
                      <p className="muted chart-caption">
                        Количество записей
                        {safeChartOffset !== 0 && <button type="button" className="chart-today-button" onClick={() => setChartOffset(0)}>К текущему</button>}
                      </p>
                      <div className="chart-nav">
                        <button type="button" aria-label={period === 'Месяц' ? 'Предыдущий месяц' : 'Предыдущий год'} disabled={safeChartOffset <= minChartOffset} onClick={() => setChartOffset(safeChartOffset - 1)}>‹</button>
                        <h2>{chartTitle}</h2>
                        <button type="button" aria-label={period === 'Месяц' ? 'Следующий месяц' : 'Следующий год'} disabled={safeChartOffset >= 0} onClick={() => setChartOffset(safeChartOffset + 1)}>›</button>
                      </div>
                    </div>
                    <span className="total">{formatEntryCount(chartTotal)}</span>
                  </div>
                  <div ref={chartScrollRef} className={`chart ${period === 'Месяц' ? 'month-chart' : 'year-chart'}`}>
                    {chartData.map((item, index) => (
                      <div
                        className={`chart-column${chartSelection === item.key ? ' selected' : ''}`}
                        key={`${period}-${item.label}-${index}`}
                        role="button"
                        tabIndex={0}
                        aria-pressed={chartSelection === item.key}
                        aria-label={`Показать записи: ${item.key}`}
                        onClick={() => toggleChartSelection(item.key)}
                        onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); toggleChartSelection(item.key); } }}
                      >
                        <span className="bar-count">{item.count}</span>
                        <div className="bar-area">
                          <div
                            className={`bar ${item.count === 0 ? 'empty' : ''}`}
                            style={{ height: `${item.count === 0 ? 4 : item.count * (period === 'Год' ? 5 : 16) + 4}px` }}
                          />
                        </div>
                        <span className="bar-day">{item.label}</span>
                        {period === 'Месяц' && <span className="bar-date">{item.date}</span>}
                      </div>
                    ))}
                  </div>
                </section>

                <div className="journal-search">
                  <input
                    type="search"
                    placeholder="Поиск по еде, комментариям и тегам"
                    value={searchText}
                    onChange={(event) => setSearchText(event.target.value)}
                  />
                </div>

                <button
                  className="filter-toggle"
                  onClick={() => setFiltersOpen(!filtersOpen)}
                  aria-expanded={filtersOpen}
                >
                  <span>Фильтры</span>
                  <span>{filterTags.length + (journalPeriod !== 'Все записи' ? 1 : 0) > 0
                    ? `Выбрано: ${filterTags.length + (journalPeriod !== 'Все записи' ? 1 : 0)}`
                    : ''}
                  </span>
                  <span>{filtersOpen ? '⌃' : '⌄'}</span>
                </button>

                {filtersOpen && (
                  <section className="filter-panel">
                    <div className="filter-section">
                      <div className="filter-heading">Период</div>
                      <div className="period-options">
                        {journalPeriods.map((item) => (
                          <button
                            key={item}
                            className={journalPeriod === item ? 'filter-option active' : 'filter-option'}
                            onClick={() => setJournalPeriod(item)}
                          >
                            {item}
                          </button>
                        ))}
                      </div>

                      {journalPeriod === 'Произвольный период' && (
                        <div className="date-range">
                          <label>
                            С даты
                            <input
                              type="date"
                              value={dateFrom}
                              onChange={(event) => setDateFrom(event.target.value)}
                            />
                          </label>
                          <label>
                            По дату
                            <input
                              type="date"
                              value={dateTo}
                              onChange={(event) => setDateTo(event.target.value)}
                            />
                          </label>
                        </div>
                      )}
                    </div>

                    <div className="filter-section">
                      <div className="filter-heading">Тип еды</div>
                      <div className="filter-tags">
                        {foodTags.filter((tag) => !disabledFoodTags.includes(tag)).map((tag) => (
                          <button
                            key={tag}
                            className={filterTags.includes(tag) ? 'filter-tag selected' : 'filter-tag'}
                            onClick={() => toggleFilterTag(tag)}
                          >
                            <TagGlyph name={tagIcons[tag] || defaultTagIcon(tag)} size={13} />{tag}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="filter-section">
                      <div className="filter-heading">Активность</div>
                      <div className="filter-tags">
                        {activityTags.filter((tag) => !disabledActivityTags.includes(tag)).map((tag) => (
                          <button
                            key={tag}
                            className={filterTags.includes(tag) ? 'filter-tag selected' : 'filter-tag'}
                            onClick={() => toggleFilterTag(tag)}
                          >
                            <TagGlyph name={tagIcons[tag] || defaultTagIcon(tag)} size={13} />{tag}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button className="reset-filters" onClick={resetFilters}>
                      Сбросить фильтры
                    </button>
                  </section>
                )}

                <div className="journal-results">
                  {chartSelection && (
                    <button type="button" className="chart-selection-chip" onClick={() => setChartSelection(null)} aria-label="Снять отбор по графику">
                      <span>Записи за {chartSelectionLabel}</span><span aria-hidden="true">×</span>
                    </button>
                  )}
                  <div className="journal-results-heading">
                    <div>
                      <h2>Все записи</h2>
                      <span className="muted">{formatEntryCount(filteredEntries.length)}</span>
                    </div>
                    <button
                      className="delete-all-entries-button"
                      disabled={journalEntries.length === 0}
                      onClick={() => {
                        if (!window.confirm(`Удалить все записи дневника (${journalEntries.length})? Это действие нельзя отменить. Если понадобится, предварительно создай резервную копию.`)) return;
                        setJournalEntries([]);
                        setSelectedEntry(null);
                        setEditingEntryId(null);
                      }}
                    >
                      Удалить все
                    </button>
                  </div>

                  {groupedEntries.length > 0 ? (
                    groupedEntries.map((group) => (
                      <section className="journal-day" key={group.date}>
                        <h3>{formatEntryDate(group.date)}</h3>
                        {group.entries.map((entry) => (
                          <article className="journal-entry" key={entry.id} onClick={() => setSelectedEntry(entry)} role="button" tabIndex={0} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') setSelectedEntry(entry); }}>
                            <span className="journal-time">{entry.time}</span>
                            <div className="journal-entry-tags">
                              {mealTagsFirst(entry.tags).map((tag) => (
                                <span className="tag" key={tag}><TagGlyph name={tagIcons[tag] || defaultTagIcon(tag)} size={13} />{tag}</span>
                              ))}
                              {entry.activity.map((tag) => (
                                <span className="tag activity-tag" key={tag}><TagGlyph name={tagIcons[tag] || defaultTagIcon(tag)} size={13} />{tag}</span>
                              ))}
                            </div>
                            <span className="entry-arrow">›</span>
                          </article>
                        ))}
                      </section>
                    ))
                  ) : (
                    <div className="journal-empty">
                      <p>Записей не найдено</p>
                      <span>Попробуй изменить поиск или фильтры</span>
                    </div>
                  )}
                </div>
              </>
            )}

          </main>

          {!settingsPage && <button className="add-button" aria-label="Добавить запись" onClick={openEditor}>+</button>}


        </>
      )}
    </div>
  );
}

export default App;
