
import { useEffect, useRef, useState } from 'react';
import './App.css';

type Period = 'Неделя' | 'Месяц' | 'Год';
type Tab = 'Дневник' | 'Ещё';
type Theme = 'light' | 'dark' | 'system';
type JournalPeriod =
  | 'Все записи'
  | 'Сегодня'
  | 'Вчера'
  | 'Последние 7 дней'
  | 'Последние 30 дней'
  | 'Произвольный период';

type JournalEntry = {
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

const defaultFoodTags = [
  'Перекус', 'Завтрак', 'Обед', 'Ужин',
  'Десерт', 'Фрукты', 'Овощи', 'Мучное',
  'Без глютена', 'Молочное', 'Мясное', 'Крупы',
  'Ягоды', 'Орехи', 'Вода', 'Алкогольные напитки',
  'Безалкогольные напитки', 'Чай', 'Кофе', 'Смузи',
];

const defaultActivityTags = [
  'Прогулка', 'Домашние дела', 'Тренировка', 'Отдых', 'Работа',
];

const demoJournalEntries: JournalEntry[] = [
  {
    id: 1,
    date: '2026-11-24',
    time: '08:30',
    food: 'Овсяная каша, банан',
    tags: ['Завтрак', 'Крупы', 'Фрукты'],
    activity: ['Прогулка'],
    carbs: 45,
    comment: '',
  },
  {
    id: 2,
    date: '2026-11-24',
    time: '12:45',
    food: 'Рыба, рис, овощи',
    tags: ['Обед', 'Мясное', 'Овощи'],
    activity: ['Домашние дела'],
    carbs: 35,
    comment: '',
  },
  {
    id: 3,
    date: '2026-11-24',
    time: '16:10',
    food: 'Яблоко и орехи',
    tags: ['Перекус', 'Фрукты', 'Орехи'],
    activity: ['Отдых'],
    carbs: 20,
    comment: '',
  },
  {
    id: 4,
    date: '2026-11-23',
    time: '08:15',
    food: 'Яйца, хлеб, чай',
    tags: ['Завтрак', 'Мучное', 'Чай'],
    activity: [],
    carbs: 30,
    comment: '',
  },
  {
    id: 5,
    date: '2026-11-23',
    time: '13:00',
    food: 'Курица с картофелем',
    tags: ['Обед', 'Мясное', 'Овощи'],
    activity: ['Прогулка'],
    carbs: 40,
    comment: '',
  },
  {
    id: 6,
    date: '2026-11-23',
    time: '19:00',
    food: 'Гречка и овощи',
    tags: ['Ужин', 'Крупы', 'Овощи'],
    activity: [],
    carbs: 38,
    comment: '',
  },
];

const journalPeriods: JournalPeriod[] = [
  'Все записи',
  'Сегодня',
  'Вчера',
  'Последние 7 дней',
  'Последние 30 дней',
  'Произвольный период',
];

function App() {
  const [period, setPeriod] = useState<Period>('Неделя');
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(() => { const saved = localStorage.getItem('food-diary-entries'); return saved ? JSON.parse(saved) as JournalEntry[] : demoJournalEntries; });
  const [entryDate, setEntryDate] = useState(() => { const now = new Date(); return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`; });
  const [entryTime, setEntryTime] = useState(() => new Date().toTimeString().slice(0, 5));
  const [entryFood, setEntryFood] = useState('');
  const [entryCarbs, setEntryCarbs] = useState('');
  const [entryComment, setEntryComment] = useState('');
  const [tab, setTab] = useState<Tab>('Дневник');
  const [settingsPage, setSettingsPage] = useState<string | null>(null);
  const [aboutSections, setAboutSections] = useState({ storage: false, backup: false, export: false });
  const [foodTags, setFoodTags] = useState<string[]>(() => JSON.parse(localStorage.getItem('food-diary-food-tags') || 'null') || defaultFoodTags);
  const [activityTags, setActivityTags] = useState<string[]>(() => JSON.parse(localStorage.getItem('food-diary-activity-tags') || 'null') || defaultActivityTags);
  const [disabledFoodTags, setDisabledFoodTags] = useState<string[]>(() => JSON.parse(localStorage.getItem('food-diary-disabled-food-tags') || '[]'));
  const [disabledActivityTags, setDisabledActivityTags] = useState<string[]>(() => JSON.parse(localStorage.getItem('food-diary-disabled-activity-tags') || '[]'));
  const [tagCategory, setTagCategory] = useState<'food' | 'activity'>('food');
  const [tagEditorOpen, setTagEditorOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<string | null>(null);
  const [tagDraft, setTagDraft] = useState('');
  const [tagIcon, setTagIcon] = useState('◇');
  const [tagIcons, setTagIcons] = useState<Record<string, string>>(() => JSON.parse(localStorage.getItem('food-diary-tag-icons') || '{}'));
  const [deleteTag, setDeleteTag] = useState<string | null>(null);
  const [exportFormat, setExportFormat] = useState<'Excel (.xlsx)' | 'CSV (.csv)'>('CSV (.csv)');
  const [exportPeriod, setExportPeriod] = useState('Все записи');
  const [exportFrom, setExportFrom] = useState('2026-11-01');
  const [exportTo, setExportTo] = useState('2026-11-24');
  const [includeTags, setIncludeTags] = useState(true);
  const [includeCarbs, setIncludeCarbs] = useState(true);
  const [includeHunger, setIncludeHunger] = useState(true);
  const [backupInfo, setBackupInfo] = useState<{ createdAt: string; size: number } | null>(() => {
    const saved = localStorage.getItem('food-diary-last-backup');
    return saved ? JSON.parse(saved) as { createdAt: string; size: number } : null;
  });

  useEffect(() => { localStorage.setItem('food-diary-entries', JSON.stringify(journalEntries)); }, [journalEntries]);

  useEffect(() => {
    localStorage.setItem('food-diary-food-tags', JSON.stringify(foodTags));
    localStorage.setItem('food-diary-activity-tags', JSON.stringify(activityTags));
    localStorage.setItem('food-diary-disabled-food-tags', JSON.stringify(disabledFoodTags));
    localStorage.setItem('food-diary-disabled-activity-tags', JSON.stringify(disabledActivityTags));
    localStorage.setItem('food-diary-tag-icons', JSON.stringify(tagIcons));
  }, [foodTags, activityTags, disabledFoodTags, disabledActivityTags, tagIcons]);

  const restoreFileInput = useRef<HTMLInputElement>(null);

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
    URL.revokeObjectURL(url);
    const info = { createdAt, size: blob.size };
    setBackupInfo(info);
    localStorage.setItem('food-diary-last-backup', JSON.stringify(info));
  };

  const exportEntries = journalEntries
    .filter((entry) => {
      if (exportPeriod === 'Текущий месяц') {
        const now = new Date();
        const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
        return entry.date >= monthStart && entry.date <= toDateKey(new Date());
      }
      if (exportPeriod === 'Последние 7 дней') {
        const end = new Date();
        end.setHours(0, 0, 0, 0);
        const start = new Date(end);
        start.setDate(start.getDate() - 6);
        return entry.date >= toDateKey(start) && entry.date <= toDateKey(end);
      }
      if (exportPeriod === 'Произвольный период') {
        if (exportFrom && entry.date < exportFrom) return false;
        if (exportTo && entry.date > exportTo) return false;
      }
      return true;
    })
    .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));

  const exportCsv = () => {
    if (exportEntries.length === 0 || exportFormat !== 'CSV (.csv)') return;
    const headers = ['Дата', 'Время', 'Еда'];
    if (includeTags) headers.push('Теги еды', 'Активность');
    if (includeCarbs) headers.push('Углеводы (г)', 'Комментарий');
    if (includeHunger) headers.push('Уровень голода', 'Настроение');
    const rows = exportEntries.map((entry) => {
      const row: (string | number)[] = [entry.date, entry.time, entry.food];
      if (includeTags) row.push(entry.tags.join(', '), entry.activity.join(', '));
      if (includeCarbs) row.push(entry.carbs ?? '', entry.comment || '');
      if (includeHunger) row.push(entry.hunger ?? '', entry.mood || '');
      return row;
    });
    const escapeCell = (value: string | number) => {
      const cell = String(value);
      return /[;"\r\n]/.test(cell) ? '"' + cell.replace(/"/g, '""') + '"' : cell;
    };
    const csv = [headers, ...rows].map((row) => row.map(escapeCell).join(';')).join('\r\n');
    const blob = new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'food-diary-export-' + new Date().toISOString().slice(0, 10) + '.csv';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };
  const currentTags = tagCategory === 'food' ? foodTags : activityTags;
  const setCurrentTags = tagCategory === 'food' ? setFoodTags : setActivityTags;
  const currentDisabled = tagCategory === 'food' ? disabledFoodTags : disabledActivityTags;
  const setCurrentDisabled = tagCategory === 'food' ? setDisabledFoodTags : setDisabledActivityTags;
  const saveTag = () => {
    const name = tagDraft.trim();
    if (!name) return;
    if (currentTags.some((tag) => tag.toLowerCase() === name.toLowerCase() && tag !== editingTag)) return;
    if (!editingTag && currentTags.length >= 30) return;
    if (editingTag) {
      setCurrentTags((items) => items.map((tag) => tag === editingTag ? name : tag));
      setCurrentDisabled((items) => items.map((tag) => tag === editingTag ? name : tag));
      setTagIcons((items) => {
        const next = { ...items, [name]: tagIcon };
        if (editingTag !== name) delete next[editingTag];
        return next;
      });
    } else {
      setCurrentTags((items) => [...items, name]);
      setTagIcons((items) => ({ ...items, [name]: tagIcon }));
    }
    setTagEditorOpen(false);
    setEditingTag(null);
    setTagDraft('');
  };
  const moveTag = (tag: string, direction: -1 | 1) => {
    const index = currentTags.indexOf(tag);
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= currentTags.length) return;
    setCurrentTags((items) => {
      const next = [...items];
      [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
      return next;
    });
  };
  const removeTag = (tag: string) => {
    setCurrentTags((items) => items.filter((item) => item !== tag));
    setCurrentDisabled((items) => items.filter((item) => item !== tag));
    setTagIcons((items) => { const next = { ...items }; delete next[tag]; return next; });
    setDeleteTag(null);
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
  const [showAllFields, setShowAllFields] = useState(false);
  const [showAllFoodTags, setShowAllFoodTags] = useState(false);
  const [showAllActivityTags, setShowAllActivityTags] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [hunger, setHunger] = useState(3);
  const [mood, setMood] = useState('');

  const [searchText, setSearchText] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [journalPeriod, setJournalPeriod] =
    useState<JournalPeriod>('Все записи');
  const [filterTags, setFilterTags] = useState<string[]>([]);
  const [dateFrom, setDateFrom] = useState('2026-11-01');
  const [dateTo, setDateTo] = useState('2026-11-24');

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
    setDateFrom('2026-11-01');
    setDateTo('2026-11-24');
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
    setHunger(3);
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
    setHunger(entry.hunger ?? 3);
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

  const deleteSelectedEntry = () => {
    if (!selectedEntry) return;
    setJournalEntries((current) => current.filter((entry) => entry.id !== selectedEntry.id));
    setSelectedEntry(null);
    setConfirmDeleteEntry(false);
  };

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
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - ((today.getDay() + 6) % 7));
  const chartData = period === 'Неделя'
    ? Array.from({ length: 7 }, (_, index) => { const date = new Date(weekStart); date.setDate(weekStart.getDate() + index); return { label: date.toLocaleDateString('ru-RU', { weekday: 'short' }).replace('.', ''), date: String(date.getDate()), count: countForDate(toDateKey(date)) }; })
    : period === 'Месяц'
      ? Array.from({ length: new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate() }, (_, index) => { const date = new Date(today.getFullYear(), today.getMonth(), index + 1); return { label: String(index + 1), date: '', count: countForDate(toDateKey(date)) }; })
      : Array.from({ length: 12 }, (_, index) => ({ label: new Date(today.getFullYear(), index, 1).toLocaleDateString('en-US', { month: 'short' }), date: '', count: journalEntries.filter((entry) => entry.date.startsWith(`${today.getFullYear()}-${String(index + 1).padStart(2, '0')}`)).length }));
  const chartTotal = chartData.reduce((sum, item) => sum + item.count, 0);
  const chartTitle = period === 'Неделя' ? 'Эта неделя' : period === 'Месяц' ? today.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' }) : `${today.getFullYear()} год`;

  const formatDate = (date: string) => {
    return new Date(`${date}T12:00:00`).toLocaleDateString('ru-RU', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  };

  return (
    <div className="app">
      {selectedEntry ? (
        <>
          <header className="editor-header">
            <button className="back-button" onClick={() => { setSelectedEntry(null); setConfirmDeleteEntry(false); }} aria-label="Назад"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M19 12H5M5 12l7-7M5 12l7 7" /></svg></button>
            <h1>Запись</h1>
          </header>
          <main className="editor-main">
            <section className="editor-card entry-detail-card">
              <p className="muted entry-detail-date">{formatDate(selectedEntry.date)} · {selectedEntry.time}</p>
              <div className="entry-detail-row">
                <h2>Еда</h2>
                <p>{selectedEntry.food}</p>
              </div>
              {selectedEntry.tags.length > 0 && (
                <div className="entry-detail-row">
                  <h2>Тип еды</h2>
                  <div className="journal-entry-tags">{selectedEntry.tags.map((tag) => <span className="tag" key={tag}>{tag}</span>)}</div>
                </div>
              )}
              {selectedEntry.carbs !== null && (
                <div className="entry-detail-row">
                  <h2>Углеводы</h2>
                  <p>{selectedEntry.carbs} г</p>
                </div>
              )}
              {selectedEntry.activity.length > 0 && (
                <div className="entry-detail-row">
                  <h2>Активность</h2>
                  <div className="journal-entry-tags">{selectedEntry.activity.map((tag) => <span className="tag activity-tag" key={tag}>{tag}</span>)}</div>
                </div>
              )}
              {selectedEntry.hunger !== undefined && (
                <div className="entry-detail-row">
                  <h2>Уровень голода</h2>
                  <p>{selectedEntry.hunger} из 5</p>
                </div>
              )}
              {selectedEntry.mood && (
                <div className="entry-detail-row">
                  <h2>Настроение</h2>
                  <p>{selectedEntry.mood}</p>
                </div>
              )}
              {selectedEntry.comment && (
                <div className="entry-detail-row">
                  <h2>Комментарий</h2>
                  <p>{selectedEntry.comment}</p>
                </div>
              )}
            </section>
            <div className="entry-actions">
              <button className="save-button" onClick={() => startEditingEntry(selectedEntry)}>Изменить запись</button>
              {!confirmDeleteEntry ? (
                <button className="delete-entry-button" onClick={() => setConfirmDeleteEntry(true)}>Удалить запись</button>
              ) : (
                <div className="delete-entry-confirm">
                  <p>Удалить эту запись? Это действие нельзя отменить.</p>
                  <div>
                    <button className="delete-entry-button" onClick={deleteSelectedEntry}>Удалить</button>
                    <button className="cancel-delete-button" onClick={() => setConfirmDeleteEntry(false)}>Отмена</button>
                  </div>
                </div>
              )}
            </div>
          </main>
        </>
      ) : editorOpen ? (
        <>
          <header className="editor-header">
            <button className="back-button" onClick={cancelEntryEditor} aria-label="Назад"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M19 12H5M5 12l7-7M5 12l7 7" /></svg></button>
            <h1>{editingEntryId !== null ? 'Изменить запись' : 'Новая запись'}</h1>
          </header>

          <main className="editor-main">
            <section className="editor-card">
              <div className="date-time-row">
                <label className="field-label">
                  Дата
                  <input type="date" value={entryDate} onChange={(event) => setEntryDate(event.target.value)} />
                </label>
                <label className="field-label">
                  Время
                  <input type="time" value={entryTime} onChange={(event) => setEntryTime(event.target.value)} />
                </label>
              </div>
            </section>

            <section className="editor-card">
              <label className="field-label">
                Еда
                <textarea
                  rows={3}
                  value={entryFood}
                  onChange={(event) => setEntryFood(event.target.value)}
                  placeholder="Какая была еда и какая была порция? Например: 150 г, тарелка, 2 кусочка"
                />
              </label>
            </section>

            <section className="editor-card">
              <div className="editor-section-title">Тип еды</div>
              <div className="tag-gallery">
                {(showAllFoodTags ? foodTags : foodTags.slice(0, 4)).map((tag) => (
                  <button
                    key={tag}
                    className={`choice-tag ${selectedTags.includes(tag) ? 'chosen' : ''}`}
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                  </button>
                ))}
              </div>
              <button
                className="show-tags"
                onClick={() => setShowAllFoodTags(!showAllFoodTags)}
              >
                {showAllFoodTags ? 'Скрыть теги' : 'Показать все теги'}
              </button>
            </section>

            <section className="editor-card">
              <div className="editor-section-title">Углеводы</div>
              <div className="field-with-unit">
                <input type="number" min="0" placeholder="0" value={entryCarbs} onChange={(event) => setEntryCarbs(event.target.value)} />
                <span>г</span>
              </div>
            </section>

            <section className="editor-card">
              <div className="editor-section-title">Активность</div>
              <div className="tag-gallery">
                {(showAllActivityTags ? activityTags : activityTags.slice(0, 4)).map((tag) => (
                  <button
                    key={tag}
                    className={`choice-tag ${selectedTags.includes(tag) ? 'chosen' : ''}`}
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                  </button>
                ))}
              </div>
              <button
                className="show-tags"
                onClick={() => setShowAllActivityTags(!showAllActivityTags)}
              >
                {showAllActivityTags ? 'Скрыть теги' : 'Показать все теги'}
              </button>
            </section>

            <button
              className="expand-fields"
              onClick={() => setShowAllFields(!showAllFields)}
            >
              {showAllFields ? 'Скрыть дополнительные поля' : '＋ Показать все поля'}
            </button>

            {showAllFields && (
              <>
                <section className="editor-card">
                  <div className="editor-section-title">Уровень голода</div>
                  <p className="field-hint">
                    1 — не очень голоден, а 5 — очень голоден
                  </p>
                  <div className="hunger-scale">
                    <span>1</span>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      step="1"
                      value={hunger}
                      onChange={(event) => setHunger(Number(event.target.value))}
                    />
                    <span>5</span>
                  </div>
                  <div className="hunger-points">
                    {[1, 2, 3, 4, 5].map((number) => (
                      <span
                        key={number}
                        className={number <= hunger ? 'point active-point' : 'point'}
                      />
                    ))}
                  </div>
                </section>

                <section className="editor-card">
                  <div className="editor-section-title">Комментарий</div>
                  <label className="field-label">
                    <textarea rows={3} value={entryComment} onChange={(event) => setEntryComment(event.target.value)} placeholder="Дополнительные заметки к записи" />
                  </label>
                </section>
                <section className="editor-card">
                  <div className="editor-section-title">Настроение</div>
                  <div className="mood-gallery">
                    {['Отличное', 'Хорошее', 'Нейтральное', 'Грустное', 'Плохое'].map((item, index) => (
                      <button
                        key={item}
                        className={`mood-option ${mood === item ? 'chosen' : ''}`}
                        onClick={() => setMood(item)}
                      >
                        <span>{['☺', '🙂', '😐', '🙁', '☹'][index]}</span>
                        <small>{item}</small>
                      </button>
                    ))}
                  </div>
                </section>
              </>
            )}

            <button className="save-button" onClick={saveEntry} disabled={!entryFood.trim()}>
              {editingEntryId !== null ? 'Сохранить изменения' : 'Сохранить запись'}
            </button>
          </main>
        </>
      ) : (
        <>
          <header className="topbar">
            <div>
              <p className="eyebrow">МОЙ ДНЕВНИК</p>
              <div className={settingsPage ? "settings-title-row" : ""}>
                {settingsPage && (
                  <button className="back-button settings-back" onClick={() => setSettingsPage(null)} aria-label="Назад"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M19 12H5M5 12l7-7M5 12l7 7" /></svg></button>
                )}
                <h1>{settingsPage || tab}</h1>
              </div>
            </div>
            <div className="profile-mark">Д</div>
          </header>

          <main>
            {settingsPage === 'Оформление' && (
              <section className="settings-page">
                <p className="muted">Выбери, как будет выглядеть дневник</p>
                <div className="theme-options">
                  {([
                    { value: 'light', label: 'Светлая', description: 'Светлый фон и спокойные зелёные оттенки' },
                    { value: 'dark', label: 'Тёмная', description: 'Тёмный фон, комфортный при слабом освещении' },
                    { value: 'system', label: 'Системная', description: 'Как в настройках устройства' },
                  ] as { value: Theme; label: string; description: string }[]).map((option) => (
                    <button
                      key={option.value}
                      className={theme === option.value ? 'theme-option selected' : 'theme-option'}
                      onClick={() => setTheme(option.value)}
                    >
                      <span className="theme-radio" aria-hidden="true">{theme === option.value ? '✓' : ''}</span>
                      <span className="theme-option-copy">
                        <strong>{option.label}</strong>
                        <small>{option.description}</small>
                      </span>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {settingsPage === 'Управление тегами' && (
              <section className="settings-page tag-management">
                <p className="muted">Две категории тегов. До 30 тегов в каждой.</p>
                <div className="tag-category-switch">
                  <button className={tagCategory === 'food' ? 'active' : ''} onClick={() => { setTagCategory('food'); setTagEditorOpen(false); setDeleteTag(null); }}>Тип еды</button>
                  <button className={tagCategory === 'activity' ? 'active' : ''} onClick={() => { setTagCategory('activity'); setTagEditorOpen(false); setDeleteTag(null); }}>Активность</button>
                </div>
                <div className="tag-management-heading">
                  <span>{currentTags.length} из 30 тегов</span>
                  <button className="tag-add-button" disabled={currentTags.length >= 30} onClick={() => { setEditingTag(null); setTagDraft(''); setTagIcon('◇'); setTagEditorOpen(true); }}>+ Добавить тег</button>
                </div>
                {tagEditorOpen && (
                  <div className="tag-edit-panel">
                    <label>Название тега
                      <input value={tagDraft} maxLength={30} onChange={(event) => setTagDraft(event.target.value)} placeholder="Например, Салат" />
                    </label>
                    <span className="muted">Выбери значок</span>
                    <div className="tag-icon-picker">
                      {['◇', '○', '□', '△', '☆', '☼', '⌂', '♧', '≋', '▤', '◉', '⌁'].map((icon) => (
                        <button key={icon} className={tagIcon === icon ? 'selected' : ''} onClick={() => setTagIcon(icon)}>{icon}</button>
                      ))}
                    </div>
                    <div className="tag-edit-actions">
                      <button onClick={() => { setTagEditorOpen(false); setEditingTag(null); }}>Отмена</button>
                      <button className="primary" disabled={!tagDraft.trim() || (currentTags.some((tag) => tag.toLowerCase() === tagDraft.trim().toLowerCase() && tag !== editingTag))} onClick={saveTag}>Сохранить</button>
                    </div>
                  </div>
                )}
                <div className="managed-tag-list">
                  {currentTags.map((tag, index) => (
                    <div className={currentDisabled.includes(tag) ? 'managed-tag disabled' : 'managed-tag'} key={tag}>
                      <span className="managed-tag-icon">{tagIcons[tag] || '◇'}</span>
                      <span className="managed-tag-name">{tag}</span>
                      {currentDisabled.includes(tag) && <small>Отключён</small>}
                      <div className="managed-tag-actions">
                        <button aria-label="Выше" disabled={index === 0} onClick={() => moveTag(tag, -1)}>↑</button>
                        <button aria-label="Ниже" disabled={index === currentTags.length - 1} onClick={() => moveTag(tag, 1)}>↓</button>
                        <button aria-label="Изменить" onClick={() => { setEditingTag(tag); setTagDraft(tag); setTagIcon(tagIcons[tag] || '◇'); setTagEditorOpen(true); }}>✎</button>
                        <button aria-label={currentDisabled.includes(tag) ? 'Включить' : 'Отключить'} onClick={() => setCurrentDisabled((items) => items.includes(tag) ? items.filter((item) => item !== tag) : [...items, tag])}>{currentDisabled.includes(tag) ? '✓' : 'Ⅱ'}</button>
                        <button aria-label="Удалить" onClick={() => setDeleteTag(tag)}>×</button>
                      </div>
                      {deleteTag === tag && (
                        <div className="tag-delete-confirm">
                          <span>Удалить тег «{tag}»?</span>
                          <button onClick={() => setDeleteTag(null)}>Отмена</button>
                          <button className="danger" onClick={() => removeTag(tag)}>Удалить</button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {settingsPage === 'Экспорт данных' && (
              <section className="settings-page export-page">
                <div className="export-section">
                  <h2>Формат файла</h2>
                  <div className="export-choice-row">
                    {(['Excel (.xlsx)', 'CSV (.csv)'] as const).map((format) => (
                      <button key={format} disabled={format === 'Excel (.xlsx)'} className={exportFormat === format ? 'export-choice active' : 'export-choice'} onClick={() => setExportFormat(format)}>
                        <span className="export-radio">{exportFormat === format ? '✓' : ''}</span>
                        {format}{format === 'Excel (.xlsx)' ? ' — позже' : ''}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="export-section">
                  <h2>Период</h2>
                  <select className="export-select" value={exportPeriod} onChange={(event) => setExportPeriod(event.target.value)}>
                    {['Все записи', 'Текущий месяц', 'Последние 7 дней', 'Произвольный период'].map((item) => <option key={item}>{item}</option>)}
                  </select>
                  {exportPeriod === 'Произвольный период' && (
                    <div className="date-range export-date-range">
                      <label>С даты<input type="date" value={exportFrom} onChange={(event) => setExportFrom(event.target.value)} /></label>
                      <label>По дату<input type="date" value={exportTo} onChange={(event) => setExportTo(event.target.value)} /></label>
                    </div>
                  )}
                </div>
                <div className="export-section">
                  <h2>Какие данные включить</h2>
                  <div className="export-includes">
                    <div className="export-included required"><span className="export-check">✓</span><span><strong>Дата и время</strong><small>Обязательно для каждой записи</small></span><em>Обязательно</em></div>
                    <div className="export-included required"><span className="export-check">✓</span><span><strong>Описание еды</strong><small>Текст и порция</small></span><em>Обязательно</em></div>
                    <button className="export-included" onClick={() => setIncludeTags(!includeTags)}><span className={includeTags ? 'export-check checked' : 'export-check'}>{includeTags ? '✓' : ''}</span><span><strong>Теги и активность</strong><small>Категории и выбранные отметки</small></span></button>
                    <button className="export-included" onClick={() => setIncludeCarbs(!includeCarbs)}><span className={includeCarbs ? 'export-check checked' : 'export-check'}>{includeCarbs ? '✓' : ''}</span><span><strong>Углеводы и комментарии</strong><small>Количество углеводов и заметки</small></span></button>
                    <button className="export-included" onClick={() => setIncludeHunger(!includeHunger)}><span className={includeHunger ? 'export-check checked' : 'export-check'}>{includeHunger ? '✓' : ''}</span><span><strong>Голод и настроение</strong><small>Дополнительные поля записи</small></span></button>
                  </div>
                </div>
                <div className="export-preview">
                  <h2>Предварительный просмотр</h2>
                  <div><span>Формат</span><strong>{exportFormat}</strong></div>
                  <div><span>Период</span><strong>{exportPeriod === 'Произвольный период' ? `${exportFrom} — ${exportTo}` : exportPeriod}</strong></div>
                  <div><span>Записей для экспорта</span><strong>{exportEntries.length}</strong></div>
                  <p>В файл попадут записи за выбранный период и только отмеченные дополнительные поля.</p>
                </div>
                <button className="export-button" onClick={exportCsv} disabled={exportEntries.length === 0 || exportFormat !== 'CSV (.csv)'}>Экспортировать CSV-файл</button>
                <p className="export-note">{exportEntries.length === 0 ? 'За выбранный период записей нет.' : 'Файл CSV сохранится на устройство. Его можно открыть в Excel или Google Таблицах.'}</p>
              </section>
            )}

            {settingsPage === 'О приложении' && (
              <section className="settings-page about-page">
                <div className="about-hero">
                  <div className="about-app-icon">Д</div>
                  <h2>Дневник питания</h2>
                  <p>Личный дневник для наблюдения за питанием и повседневными привычками.</p>
                </div>

                <div className="about-section">
                  <button className="about-section-toggle" onClick={() => setAboutSections((current) => ({ ...current, storage: !current.storage }))} aria-expanded={aboutSections.storage}>
                    <span>Как хранятся данные</span><span className="about-section-chevron">{aboutSections.storage ? '⌃' : '⌄'}</span>
                  </button>
                  {aboutSections.storage && <p className="about-section-content">Записи хранятся на устройстве. Дневник рассчитан на работу без постоянного подключения к интернету. Автоматической синхронизации между устройствами нет.</p>}
                </div>

                <div className="about-section">
                  <button className="about-section-toggle" onClick={() => setAboutSections((current) => ({ ...current, backup: !current.backup }))} aria-expanded={aboutSections.backup}>
                    <span>Резервное копирование</span><span className="about-section-chevron">{aboutSections.backup ? '⌃' : '⌄'}</span>
                  </button>
                  {aboutSections.backup && (
                    <div className="about-section-content">
                      <p>Чтобы перенести данные или защитить их от потери, периодически создавай резервную копию в OneDrive.</p>
                      <ol>
                        <li>Открой раздел «Ещё» → «Резервное копирование».</li>
                        <li>Нажми «Создать копию» и сохрани файл в OneDrive.</li>
                        <li>Для восстановления выбери ранее созданную копию в этом же разделе.</li>
                      </ol>
                    </div>
                  )}
                </div>

                <div className="about-section">
                  <button className="about-section-toggle" onClick={() => setAboutSections((current) => ({ ...current, export: !current.export }))} aria-expanded={aboutSections.export}>
                    <span>Экспорт данных</span><span className="about-section-chevron">{aboutSections.export ? '⌃' : '⌄'}</span>
                  </button>
                  {aboutSections.export && <p className="about-section-content">В разделе «Ещё» → «Экспорт данных» можно выбрать период и состав данных, а затем скачать файл CSV для Excel или Google Таблиц.</p>}
                </div>

                <p className="about-disclaimer">Дневник предназначен для личных записей и не является медицинским приложением.</p>
                <p className="about-version">Версия 1.0.0</p>
              </section>
            )}

            {settingsPage === 'Резервное копирование' && (
              <section className="settings-page backup-page">
                <p className="muted">Сохраняй копию дневника в OneDrive, чтобы при необходимости восстановить свои данные.</p>

                <div className="backup-status-card">
                  <div className="backup-status-icon">☁</div>
                  <div>
                    <strong>{backupInfo ? 'Последняя копия создана' : 'Резервных копий пока нет'}</strong>
                    <p>{backupInfo
                      ? `${new Date(backupInfo.createdAt).toLocaleString('ru-RU')} · ${(backupInfo.size / 1024).toFixed(1)} КБ`
                      : 'После создания копии здесь появятся дата, время и размер файла.'}</p>
                  </div>
                </div>

                <div className="backup-actions">
                  <div className="backup-action-card">
                    <div className="backup-action-icon">＋</div>
                    <div className="backup-action-copy">
                      <strong>Создать резервную копию</strong>
                      <p>Скачать файл копии, который можно сохранить в OneDrive.</p>
                    </div>
                    <button className="backup-button" onClick={createBackup}>Создать копию</button>
                  </div>

                  <div className="backup-action-card">
                    <div className="backup-action-icon">↻</div>
                    <div className="backup-action-copy">
                      <strong>Восстановить данные</strong>
                      <p>Выбрать сохранённый файл резервной копии с устройства или из OneDrive.</p>
                    </div>
                    <button className="backup-button secondary" onClick={() => restoreFileInput.current?.click()}>Выбрать файл</button>
                    <input
                      ref={restoreFileInput}
                      type="file"
                      accept=".json,application/json"
                      hidden
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (file) void restoreBackup(file);
                        event.target.value = '';
                      }}
                    />
                  </div>
                </div>

                <div className="backup-section">
                  <h2>Что входит в копию</h2>
                  <ul className="backup-includes">
                    <li>Все записи дневника: еда, дата и время</li>
                    <li>Теги и их настройки</li>
                    <li>Настройки оформления и редактора</li>
                  </ul>
                </div>

                <p className="backup-note">Файл копии можно сохранить в папке OneDrive и выбрать здесь при восстановлении. Восстановление заменяет текущие записи и настройки. Автоматической синхронизации нет.</p>
              </section>
            )}

            {settingsPage && settingsPage !== 'Оформление' && settingsPage !== 'Управление тегами' && settingsPage !== 'Экспорт данных' && settingsPage !== 'Резервное копирование' && settingsPage !== 'О приложении' && (
              <section className="settings-page">
                <p className="muted">Раздел настроек</p>
                <h2>{settingsPage}</h2>
                <p className="settings-placeholder">Этот экран открыт. Его содержимое и функции добавим на следующем этапе.</p>
              </section>
            )}

            {!settingsPage && tab === 'Дневник' && (
              <>
                <section className="period-switch">
                  {(['Неделя', 'Месяц', 'Год'] as Period[]).map((item) => (
                    <button
                      key={item}
                      className={period === item ? 'period active' : 'period'}
                      onClick={() => setPeriod(item)}
                    >
                      {item}
                    </button>
                  ))}
                </section>

                <section className="chart-card">
                  <div className="section-heading">
                    <div>
                      <p className="muted">Количество записей</p>
                      <h2>{chartTitle}</h2>
                    </div>
                    <span className="total">{chartTotal} записей</span>
                  </div>
                  <div className={`chart ${period === 'Неделя' ? 'week-chart' : period === 'Месяц' ? 'month-chart' : period === 'Год' ? 'year-chart' : ''}`}>
                    {chartData.map((item, index) => (
                      <div className="chart-column" key={`${period}-${item.label}-${index}`}>
                        <span className="bar-count">{item.count}</span>
                        <div className="bar-area">
                          <div
                            className={`bar ${item.count === 0 ? 'empty' : ''}`}
                            style={{ height: `${item.count === 0 ? 4 : item.count * (period === 'Год' ? 5 : 16) + 4}px` }}
                          />
                        </div>
                        <span className="bar-day">{item.label}</span>
                        {item.date && <span className="bar-date">{item.date}</span>}
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
                            {tag}
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
                            {tag}
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
                  <div className="journal-results-heading">
                    <h2>Все записи</h2>
                    <span className="muted">{filteredEntries.length} записей</span>
                  </div>

                  {groupedEntries.length > 0 ? (
                    groupedEntries.map((group) => (
                      <section className="journal-day" key={group.date}>
                        <h3>{formatDate(group.date)}</h3>
                        {group.entries.map((entry) => (
                          <article className="journal-entry" key={entry.id} onClick={() => setSelectedEntry(entry)} role="button" tabIndex={0} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') setSelectedEntry(entry); }}>
                            <span className="journal-time">{entry.time}</span>
                            <div className="journal-entry-tags">
                              {entry.tags.map((tag) => (
                                <span className="tag" key={tag}>{tag}</span>
                              ))}
                              {entry.activity.map((tag) => (
                                <span className="tag activity-tag" key={tag}>{tag}</span>
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

            {!settingsPage && tab === 'Ещё' && (
              <section className="settings-list">
                <h2>Настройки</h2>
                {['Управление тегами', 'Резервное копирование', 'Экспорт данных', 'Оформление', 'О приложении'].map((item) => (
                  <button className="setting-item" key={item} onClick={() => setSettingsPage(item)}>
                    {item}<span>›</span>
                  </button>
                ))}
              </section>
            )}
          </main>

          {!settingsPage && <button className="add-button" aria-label="Добавить запись" onClick={openEditor}>+</button>}

          {!settingsPage && <nav className="bottom-nav">
            {(['Дневник', 'Ещё'] as Tab[]).map((item, index) => (
              <button
                key={item}
                className={tab === item ? 'nav-item selected' : 'nav-item'}
                onClick={() => { setSettingsPage(null); setTab(item); }}
              >
                <span className="nav-symbol">{['◷', '•••'][index]}</span>
                <span>{item}</span>
              </button>
            ))}
          </nav>}
        </>
      )}
    </div>
  );
}

export default App;
