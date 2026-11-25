
import { useEffect, useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import type { LucideProps } from 'lucide-react';
import {
  Apple, Beef, Bike, Brush, Briefcase, CakeSlice, Carrot, Cherry, Coffee, CupSoda,
  Dumbbell, Fish, Footprints, GlassWater, GripVertical, Heart, House, Milk, MoonStar, Nut,
  Salad, Soup, Sofa, Sunrise, Tag, Utensils, Wheat, WheatOff,
} from 'lucide-react';
import './App.css';

type Period = 'Месяц' | 'Год';
type Tab = 'Дневник' | 'Ещё';
type Theme = 'light' | 'dark' | 'system';
type JournalPeriod =
  | 'Все записи'
  | 'Сегодня'
  | 'Вчера'
  | 'Последние 7 дней'
  | 'Последние 30 дней'
  | 'Произвольный период';

const tagIconOptions = [
  { value: 'utensils', label: 'Еда', Icon: Utensils },
  { value: 'coffee', label: 'Кофе', Icon: Coffee },
  { value: 'apple', label: 'Фрукты', Icon: Apple },
  { value: 'salad', label: 'Салат', Icon: Salad },
  { value: 'soup', label: 'Суп', Icon: Soup },
  { value: 'fish', label: 'Рыба', Icon: Fish },
  { value: 'glass-water', label: 'Вода', Icon: GlassWater },
  { value: 'cup-soda', label: 'Напиток', Icon: CupSoda },
  { value: 'cake-slice', label: 'Десерт', Icon: CakeSlice },
  { value: 'wheat', label: 'Злаки', Icon: Wheat },
  { value: 'milk', label: 'Молочное', Icon: Milk },
  { value: 'carrot', label: 'Морковь', Icon: Carrot },
  { value: 'tomato', label: 'Помидор', Icon: TomatoIcon },
  { value: 'breakfast', label: 'Завтрак', Icon: Sunrise },
  { value: 'dinner', label: 'Ужин', Icon: MoonStar },
  { value: 'wheat-off', label: 'Без глютена', Icon: WheatOff },
  { value: 'beef', label: 'Мясное', Icon: Beef },
  { value: 'nut', label: 'Орехи', Icon: Nut },
  { value: 'cherry', label: 'Вишни', Icon: Cherry },
  { value: 'broom', label: 'Веник', Icon: Brush },
  { value: 'dumbbell', label: 'Тренировка', Icon: Dumbbell },
  { value: 'footprints', label: 'Прогулка', Icon: Footprints },
  { value: 'bike', label: 'Велосипед', Icon: Bike },
  { value: 'heart', label: 'Здоровье', Icon: Heart },
  { value: 'house', label: 'Дом', Icon: House },
  { value: 'briefcase', label: 'Работа', Icon: Briefcase },
  { value: 'sofa', label: 'Отдых', Icon: Sofa },
  { value: 'tag', label: 'Общее', Icon: Tag },
];

function TomatoIcon({ size = 16, strokeWidth = 1.8 }: LucideProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 7c-1.4-2.4-3.1-3.2-5-3 1.1 1.5 2.5 2.4 5 3Z" />
    <path d="M12 7c1.1-2.6 2.8-3.5 4.8-3.3-.8 1.6-2.2 2.7-4.8 3.3Z" />
    <path d="M12 7c-1.8-1.2-3.5-1.2-5-.5" />
    <path d="M12 7c1.8-1.2 3.5-1.2 5-.5" />
    <path d="M12 7c-4.5-1.2-8 1.8-8 6.2 0 4.2 3.3 7.3 8 7.3s8-3.1 8-7.3C20 8.8 16.5 5.8 12 7Z" />
  </svg>;
}

function defaultTagIcon(tag: string) {
  const normalized = tag.trim().toLocaleLowerCase('ru');
  if (normalized === 'завтрак') return 'breakfast';
  if (normalized === 'ужин') return 'dinner';
  if (normalized === 'овощи') return 'tomato';
  if (normalized === 'без глютена') return 'wheat-off';
  if (normalized === 'мясное') return 'beef';
  if (normalized === 'орехи') return 'nut';
  if (normalized === 'вишни') return 'cherry';
  if (normalized === 'домашние дела') return 'broom';
  return 'tag';
}

function TagGlyph({ name, size = 16 }: { name: string; size?: number }) {
  const Icon = tagIconOptions.find((option) => option.value === name)?.Icon || Tag;
  return <Icon size={size} strokeWidth={1.8} aria-hidden="true" />;
}

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
  const [period, setPeriod] = useState<Period>('Месяц');
  const [analyticsPeriod, setAnalyticsPeriod] = useState<'Месяц' | 'Произвольный период'>('Месяц');
  const [showAllAnalyticsCategories, setShowAllAnalyticsCategories] = useState(false);
  const [analyticsFrom, setAnalyticsFrom] = useState(() => { const d = new Date(); d.setDate(1); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-01`; });
  const [analyticsTo, setAnalyticsTo] = useState(() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; });
  const chartScrollRef = useRef<HTMLDivElement>(null);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(() => { const saved = localStorage.getItem('food-diary-entries'); return saved ? JSON.parse(saved) as JournalEntry[] : demoJournalEntries; });
  const [entryDate, setEntryDate] = useState(() => { const now = new Date(); return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`; });
  const [entryTime, setEntryTime] = useState(() => new Date().toTimeString().slice(0, 5));
  const [entryFood, setEntryFood] = useState('');
  const [entryCarbs, setEntryCarbs] = useState('');
  const [entryComment, setEntryComment] = useState('');
  const [tab, setTab] = useState<Tab>('Дневник');
  const [settingsPage, setSettingsPage] = useState<string | null>(null);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [aboutSections, setAboutSections] = useState({ storage: false, backup: false, export: false });
  const [foodTags, setFoodTags] = useState<string[]>(() => JSON.parse(localStorage.getItem('food-diary-food-tags') || 'null') || defaultFoodTags);
  const [activityTags, setActivityTags] = useState<string[]>(() => JSON.parse(localStorage.getItem('food-diary-activity-tags') || 'null') || defaultActivityTags);
  const [disabledFoodTags, setDisabledFoodTags] = useState<string[]>(() => JSON.parse(localStorage.getItem('food-diary-disabled-food-tags') || '[]'));
  const [disabledActivityTags, setDisabledActivityTags] = useState<string[]>(() => JSON.parse(localStorage.getItem('food-diary-disabled-activity-tags') || '[]'));
  const [tagCategory, setTagCategory] = useState<'food' | 'activity'>('food');
  const [tagEditorOpen, setTagEditorOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<string | null>(null);
  const [tagDraft, setTagDraft] = useState('');
  const [tagIcon, setTagIcon] = useState('tag');
  const [tagIcons, setTagIcons] = useState<Record<string, string>>(() => JSON.parse(localStorage.getItem('food-diary-tag-icons') || '{}'));
  const [deleteTag, setDeleteTag] = useState<string | null>(null);
  const [draggedTag, setDraggedTag] = useState<string | null>(null);
  const [dragOverTag, setDragOverTag] = useState<string | null>(null);
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
    window.setTimeout(() => URL.revokeObjectURL(url), 1500);
    const info = { createdAt, size: blob.size };
    setBackupInfo(info);
    localStorage.setItem('food-diary-last-backup', JSON.stringify(info));
  };

  const exportDateKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  const exportEntries = journalEntries
    .filter((entry) => {
      if (exportPeriod === 'Текущий месяц') {
        const now = new Date();
        const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
        return entry.date >= monthStart && entry.date <= exportDateKey(new Date());
      }
      if (exportPeriod === 'Последние 7 дней') {
        const end = new Date();
        end.setHours(0, 0, 0, 0);
        const start = new Date(end);
        start.setDate(start.getDate() - 6);
        return entry.date >= exportDateKey(start) && entry.date <= exportDateKey(end);
      }
      if (exportPeriod === 'Произвольный период') {
        if (exportFrom && entry.date < exportFrom) return false;
        if (exportTo && entry.date > exportTo) return false;
      }
      return true;
    })
    .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));

  const getExportRows = () => {
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
    return [headers, ...rows];
  };

  const getExportFileDate = () => exportDateKey(new Date());

  const exportCsv = () => {
    if (exportEntries.length === 0 || exportFormat !== 'CSV (.csv)') return;
    const escapeCell = (value: string | number) => {
      const cell = String(value);
      return /[;"\\r\\n]/.test(cell) ? '"' + cell.replace(/"/g, '""') + '"' : cell;
    };
    const csv = getExportRows().map((row) => row.map(escapeCell).join(';')).join('\\r\\n');
    const blob = new Blob(['\\uFEFF', csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'food-diary-export-' + getExportFileDate() + '.csv';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const exportExcel = () => {
    if (exportEntries.length === 0 || exportFormat !== 'Excel (.xlsx)') return;
    const rows = getExportRows();
    const worksheet = XLSX.utils.aoa_to_sheet(rows);
    worksheet['!cols'] = rows[0].map((header) => ({
      wch: Math.max(14, Math.min(36, String(header).length + 4)),
    }));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Дневник питания');
    XLSX.writeFile(workbook, 'food-diary-export-' + getExportFileDate() + '.xlsx');
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
  const reorderTag = (sourceTag: string, targetTag: string) => {
    if (sourceTag === targetTag) return;
    setCurrentTags((items) => {
      const from = items.indexOf(sourceTag);
      const to = items.indexOf(targetTag);
      if (from < 0 || to < 0) return items;
      const next = [...items];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
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
    } else if (tab === 'Ещё') {
      setTab('Дневник');
    }
  };

  const currentScreenKey = moreMenuOpen
    ? 'menu'
    : selectedEntry
      ? `entry-${selectedEntry.id}`
      : editorOpen
        ? `editor-${editingEntryId ?? 'new'}`
        : settingsPage
          ? `settings-${settingsPage}`
          : `tab-${tab}`;
  const previousScreenKey = useRef(currentScreenKey);
  const skipHistoryPush = useRef(false);

  const handleInAppBack = () => {
    if (window.history.state?.foodDiaryApp) {
      window.history.back();
    } else {
      fallbackBack();
    }
  };

  useEffect(() => {
    if (!window.history.state?.foodDiaryApp) {
      window.history.replaceState({ foodDiaryApp: true, screen: currentScreenKey }, '');
    }

    const handlePopState = () => {
      skipHistoryPush.current = true;
      fallbackBack();
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [currentScreenKey, moreMenuOpen, selectedEntry, editorOpen, settingsPage, tab]);

  useEffect(() => {
    if (previousScreenKey.current !== currentScreenKey) {
      previousScreenKey.current = currentScreenKey;
      if (skipHistoryPush.current) {
        skipHistoryPush.current = false;
        return;
      }
      window.history.pushState({ foodDiaryApp: true, screen: currentScreenKey }, '');
    }
  }, [currentScreenKey]);

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
  const chartData = period === 'Месяц'
    ? Array.from({ length: new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate() }, (_, index) => {
        const date = new Date(today.getFullYear(), today.getMonth(), index + 1);
        return { label: String(index + 1), date: date.toLocaleDateString('ru-RU', { weekday: 'short' }).replace('.', ''), count: countForDate(toDateKey(date)) };
      })
    : Array.from({ length: 12 }, (_, index) => ({ label: new Date(today.getFullYear(), index, 1).toLocaleDateString('ru-RU', { month: 'short' }).replace('.', ''), date: '', count: journalEntries.filter((entry) => entry.date.startsWith(`${today.getFullYear()}-${String(index + 1).padStart(2, '0')}`)).length }));
  const chartTotal = chartData.reduce((sum, item) => sum + item.count, 0);
  const chartTitle = period === 'Месяц' ? today.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' }) : `${today.getFullYear()} год`;

  useEffect(() => {
    if (period === 'Месяц' && chartScrollRef.current) {
      const dayWidth = 36;
      chartScrollRef.current.scrollLeft = Math.max(0, (today.getDate() - 1) * dayWidth);
    }
  }, [period]);

  const analyticsStart = analyticsPeriod === 'Месяц'
    ? new Date(today.getFullYear(), today.getMonth(), 1)
    : new Date(`${analyticsFrom}T00:00:00`);
  const analyticsEnd = analyticsPeriod === 'Месяц'
    ? new Date(today.getFullYear(), today.getMonth(), today.getDate())
    : new Date(`${analyticsTo}T00:00:00`);
  const analyticsStartKey = toDateKey(analyticsStart);
  const analyticsEndKey = toDateKey(analyticsEnd);
  const analyticsDays = Math.max(1, Math.floor((analyticsEnd.getTime() - analyticsStart.getTime()) / 86400000) + 1);
  const analyticsEntries = journalEntries.filter((entry) => entry.date >= analyticsStartKey && entry.date <= analyticsEndKey);
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
  const previousEntries = journalEntries.filter((entry) => entry.date >= toDateKey(previousStart) && entry.date <= toDateKey(previousEnd));
  const previousLoggedDays = new Set(previousEntries.map((entry) => entry.date));
  const entryChange = analyticsEntries.length - previousEntries.length;
  const formatChange = (value: number) => value > 0 ? `+${value}` : String(value);
  const strongestPart = [...dayParts].sort((a, b) => b.count - a.count)[0];
  const analyticsObservations = [
    analyticsEntries.length ? `Больше всего записей приходится на время «${strongestPart.label.toLowerCase()}».` : 'Пока недостаточно записей для наблюдений.',
    loggedDays.size ? `В дневнике есть записи за ${loggedDays.size} из ${analyticsDays} дней выбранного периода.` : 'В выбранном периоде пока нет записей.',
    `По сравнению с предыдущим равным периодом количество записей изменилось на ${formatChange(entryChange)}.`,
  ];

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
            <button className="back-button" onClick={handleInAppBack} aria-label="Назад"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M19 12H5M5 12l7-7M5 12l7 7" /></svg></button>
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
                  <div className="journal-entry-tags">{selectedEntry.tags.map((tag) => <span className="tag" key={tag}><TagGlyph name={tagIcons[tag] || defaultTagIcon(tag)} size={13} />{tag}</span>)}</div>
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
                  <div className="journal-entry-tags">{selectedEntry.activity.map((tag) => <span className="tag activity-tag" key={tag}><TagGlyph name={tagIcons[tag] || defaultTagIcon(tag)} size={13} />{tag}</span>)}</div>
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
            <button className="back-button" onClick={handleInAppBack} aria-label="Назад"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M19 12H5M5 12l7-7M5 12l7 7" /></svg></button>
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
                    <TagGlyph name={tagIcons[tag] || defaultTagIcon(tag)} size={15} />
                    <span>{tag}</span>
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
                    <TagGlyph name={tagIcons[tag] || defaultTagIcon(tag)} size={15} />
                    <span>{tag}</span>
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
              <div className={settingsPage ? "settings-title-row" : ""}>
                {settingsPage && (
                  <button className="back-button settings-back" onClick={handleInAppBack} aria-label="Назад"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M19 12H5M5 12l7-7M5 12l7 7" /></svg></button>
                )}
                <h1>{settingsPage || (tab === 'Дневник' ? 'Дневник питания' : tab)}</h1>
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
                      setTab('Дневник');
                      setMoreMenuOpen(false);
                    }}>{item}</button>
                  ))}
                </div>
              )}
            </div>
          </header>

          <main>
            {settingsPage === 'Аналитика' && (
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
            )}

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
                  <button className="tag-add-button" disabled={currentTags.length >= 30} onClick={() => { setEditingTag(null); setTagDraft(''); setTagIcon('tag'); setTagEditorOpen(true); }}>+ Добавить тег</button>
                </div>
                {tagEditorOpen && (
                  <div className="tag-edit-panel">
                    <label>Название тега
                      <input value={tagDraft} maxLength={30} onChange={(event) => setTagDraft(event.target.value)} placeholder="Например, Салат" />
                    </label>
                    <span className="muted">Выбери значок</span>
                    <div className="tag-icon-picker">
                      {tagIconOptions.map(({ value, label }) => (
                        <button
                          type="button"
                          key={value}
                          title={label}
                          aria-label={label}
                          aria-pressed={tagIcon === value}
                          className={tagIcon === value ? 'selected' : ''}
                          onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            setTagIcon(value);
                          }}
                        >
                          <TagGlyph name={value} size={18} />
                          <span className="tag-icon-label">{label}</span>
                        </button>
                      ))}
                    </div>
                    <div className="tag-edit-actions">
                      <button onClick={() => { setTagEditorOpen(false); setEditingTag(null); }}>Отмена</button>
                      <button className="primary" disabled={!tagDraft.trim() || (currentTags.some((tag) => tag.toLowerCase() === tagDraft.trim().toLowerCase() && tag !== editingTag))} onClick={saveTag}>Сохранить</button>
                    </div>
                  </div>
                )}
                <p className="tag-management-hint">На компьютере перетаскивай тег мышью. На телефоне удерживай значок с точками и перемещай тег. Стрелки тоже можно использовать.</p>
                <div className="managed-tag-list">
                  {currentTags.map((tag, index) => (
                    <div
                      className={`managed-tag${currentDisabled.includes(tag) ? ' disabled' : ''}${draggedTag === tag ? ' dragging' : ''}${dragOverTag === tag && draggedTag !== tag ? ' drag-over' : ''}`}
                      key={tag}
                      data-managed-tag={tag}
                      draggable
                      onDragStart={(event) => {
                        setDraggedTag(tag);
                        event.dataTransfer.effectAllowed = 'move';
                        event.dataTransfer.setData('text/plain', tag);
                      }}
                      onDragOver={(event) => { event.preventDefault(); event.dataTransfer.dropEffect = 'move'; setDragOverTag(tag); }}
                      onDrop={(event) => {
                        event.preventDefault();
                        const source = event.dataTransfer.getData('text/plain') || draggedTag;
                        if (source) reorderTag(source, tag);
                        setDraggedTag(null);
                        setDragOverTag(null);
                      }}
                      onDragEnd={() => { setDraggedTag(null); setDragOverTag(null); }}
                      onPointerUp={(event) => {
                        if (event.pointerType !== 'touch' || !draggedTag) return;
                        const target = document.elementFromPoint(event.clientX, event.clientY)?.closest<HTMLElement>('[data-managed-tag]')?.dataset.managedTag;
                        if (target) reorderTag(draggedTag, target);
                        setDraggedTag(null);
                        setDragOverTag(null);
                      }}
                      onPointerCancel={() => { setDraggedTag(null); setDragOverTag(null); }}
                    >
                      <span className="managed-tag-drag-handle" aria-label="Перетащить тег" onPointerDown={(event) => {
                        if (event.pointerType === 'touch') { event.preventDefault(); setDraggedTag(tag); setDragOverTag(tag); }
                      }} onPointerMove={(event) => {
                        if (event.pointerType !== 'touch' || !draggedTag) return;
                        const target = document.elementFromPoint(event.clientX, event.clientY)?.closest<HTMLElement>('[data-managed-tag]')?.dataset.managedTag;
                        if (target) setDragOverTag(target);
                      }}><GripVertical size={17} /></span>
                      <span className="managed-tag-icon"><TagGlyph name={tagIcons[tag] || defaultTagIcon(tag)} size={18} /></span>
                      <span className="managed-tag-name">{tag}</span>
                      {currentDisabled.includes(tag) && <small>Отключён</small>}
                      <div className="managed-tag-actions">
                        <button aria-label="Выше" disabled={index === 0} onClick={() => moveTag(tag, -1)}>↑</button>
                        <button aria-label="Ниже" disabled={index === currentTags.length - 1} onClick={() => moveTag(tag, 1)}>↓</button>
                        <button aria-label="Изменить" onClick={() => { setEditingTag(tag); setTagDraft(tag); setTagIcon(tagIcons[tag] || defaultTagIcon(tag)); setTagEditorOpen(true); }}>✎</button>
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
                      <button key={format} className={exportFormat === format ? 'export-choice active' : 'export-choice'} onClick={() => setExportFormat(format)}>
                        <span className="export-radio">{exportFormat === format ? '✓' : ''}</span>
                        {format}
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
                <button className="export-button" onClick={exportFormat === 'CSV (.csv)' ? exportCsv : exportExcel} disabled={exportEntries.length === 0}>Экспортировать {exportFormat === 'CSV (.csv)' ? 'CSV' : 'Excel'}-файл</button>
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

                <div className="backup-location-help">
                  <strong>Где найти скачанную копию на телефоне</strong>
                  <p>После нажатия «Создать копию» файл скачивается в Chrome. Обычно он находится в приложении «Файлы» → «Загрузки» или в Chrome → меню ⋮ → «Скачанные файлы».</p>
                  <p>Чтобы восстановить данные, нажми «Выбрать файл» и выбери файл с названием, начинающимся на <b>food-diary-backup-</b>. Если сохраняешь копию в OneDrive, сначала выбери её там.</p>
                </div>
                <p className="backup-note">Восстановление заменяет текущие записи и настройки. Автоматической синхронизации нет.</p>
              </section>
            )}

            {settingsPage && settingsPage !== 'Аналитика' && settingsPage !== 'Оформление' && settingsPage !== 'Управление тегами' && settingsPage !== 'Экспорт данных' && settingsPage !== 'Резервное копирование' && settingsPage !== 'О приложении' && (
              <section className="settings-page">
                <p className="muted">Раздел настроек</p>
                <h2>{settingsPage}</h2>
                <p className="settings-placeholder">Этот экран открыт. Его содержимое и функции добавим на следующем этапе.</p>
              </section>
            )}

            {!settingsPage && tab === 'Дневник' && (
              <>
                <section className="period-switch">
                  {(['Месяц', 'Год'] as Period[]).map((item) => (
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
                  <div ref={chartScrollRef} className={`chart ${period === 'Месяц' ? 'month-chart' : 'year-chart'}`}>
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
                    <div>
                      <h2>Все записи</h2>
                      <span className="muted">{filteredEntries.length} записей</span>
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
                        <h3>{formatDate(group.date)}</h3>
                        {group.entries.map((entry) => (
                          <article className="journal-entry" key={entry.id} onClick={() => setSelectedEntry(entry)} role="button" tabIndex={0} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') setSelectedEntry(entry); }}>
                            <span className="journal-time">{entry.time}</span>
                            <div className="journal-entry-tags">
                              {entry.tags.map((tag) => (
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


        </>
      )}
    </div>
  );
}

export default App;
