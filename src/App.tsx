
import { useEffect, useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import type { LucideProps } from 'lucide-react';
import {
  Apple, Beef, Bike, Briefcase, CakeSlice, Carrot, Cherry, Coffee, Cookie, Croissant, CupSoda,
  Dumbbell, Fish, Footprints, GlassWater, GripVertical, Heart, House, Milk, MoonStar, Nut,
  Pill, Salad, Soup, Sofa, Sunrise, Tag, Utensils, Wheat, WheatOff, Wine,
} from 'lucide-react';
import './App.css';

type Period = 'Месяц' | 'Год';
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
  { value: 'coffee', label: 'Чашка', Icon: Coffee },
  { value: 'coffee-bean', label: 'Кофе', Icon: CoffeeBeanIcon },
  { value: 'apple', label: 'Фрукты', Icon: Apple },
  { value: 'salad', label: 'Салат', Icon: Salad },
  { value: 'soup', label: 'Суп', Icon: Soup },
  { value: 'fish', label: 'Рыба', Icon: Fish },
  { value: 'glass-water', label: 'Вода', Icon: GlassWater },
  { value: 'cup-soda', label: 'Напиток', Icon: CupSoda },
  { value: 'smoothie', label: 'Смузи', Icon: SmoothieIcon },
  { value: 'wine', label: 'Вино', Icon: Wine },
  { value: 'cake-slice', label: 'Десерт', Icon: CakeSlice },
  { value: 'cookie', label: 'Печенье', Icon: Cookie },
  { value: 'croissant', label: 'Выпечка', Icon: Croissant },
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
  { value: 'broom', label: 'Метла', Icon: BroomIcon },
  { value: 'pill', label: 'Таблетка', Icon: Pill },
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

function CoffeeBeanIcon({ size = 16, strokeWidth = 1.8 }: LucideProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1" />
    <ellipse cx="10" cy="4.2" rx="1.7" ry="2.5" transform="rotate(25 10 4.2)" />
    <path d="M9.3 6c.1-1.2 1.4-2.3 1.5-3.6" />
  </svg>;
}

function SmoothieIcon({ size = 16, strokeWidth = 1.8 }: LucideProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 9h14l-1.5 11.2a1 1 0 0 1-1 .8h-9a1 1 0 0 1-1-.8z" />
    <path d="M14 9l1.5-6.5H18" />
    <path d="M12 12.6c-2.3 0-3.4 1.2-3.1 2.7.3 1.8 1.8 3.3 3.1 3.9 1.3-.6 2.8-2.1 3.1-3.9.3-1.5-.8-2.7-3.1-2.7z" />
    <path d="M10.4 12.7 12 11.4l1.6 1.3" />
    <path d="M11 14.9h.01M13 14.9h.01M12 16.6h.01" />
  </svg>;
}

function BroomIcon({ size = 16, strokeWidth = 1.8 }: LucideProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <g transform="rotate(35 12 12)">
      <path d="M12 1.5v8" />
      <path d="M9.5 9.5h5v2.5h-5z" />
      <path d="M9.5 12 6.5 21.5h11L14.5 12" />
      <path d="M10.6 15 9.5 21.5M12 15v6.5M13.4 15l1.1 6.5" />
    </g>
  </svg>;
}

// Icons used for tags that have no icon chosen by the user.
const defaultTagIcons: Record<string, string> = {
  'завтрак': 'breakfast',
  'обед': 'soup',
  'ужин': 'dinner',
  'перекус': 'cookie',
  'фрукты': 'apple',
  'десерт': 'cake-slice',
  'овощи': 'tomato',
  'мучное': 'croissant',
  'крупы': 'wheat',
  'без глютена': 'wheat-off',
  'молочное': 'milk',
  'мясное': 'beef',
  'рыба': 'fish',
  'ягоды': 'cherry',
  'вишни': 'cherry',
  'орехи': 'nut',
  'таблетки': 'pill',
  'вода': 'glass-water',
  'безалкогольные напитки': 'cup-soda',
  'чай': 'coffee',
  'кофе': 'coffee-bean',
  'смузи': 'smoothie',
  'алкогольные напитки': 'wine',
  'прогулка': 'footprints',
  'домашние дела': 'broom',
  'тренировка': 'dumbbell',
  'отдых': 'sofa',
  'работа': 'briefcase',
};

function defaultTagIcon(tag: string) {
  return defaultTagIcons[tag.trim().toLocaleLowerCase('ru')] || 'tag';
}

// One-time update (November 2026): give some existing tags their new icons,
// but only where the tag still has the old icon, so manual choices are kept.
const ICON_UPDATE_KEY = 'food-diary-icon-update-1';
const iconUpdates: { tag: string; from: string; to: string }[] = [
  { tag: 'перекус', from: 'utensils', to: 'cookie' },
  { tag: 'мучное', from: 'wheat', to: 'croissant' },
  { tag: 'безалкогольные напитки', from: 'glass-water', to: 'cup-soda' },
  { tag: 'смузи', from: 'glass-water', to: 'smoothie' },
  { tag: 'алкогольные напитки', from: 'glass-water', to: 'wine' },
  { tag: 'кофе', from: 'coffee', to: 'coffee-bean' },
  { tag: 'таблетки', from: 'heart', to: 'pill' },
];

function applyIconUpdate(icons: Record<string, string>) {
  try {
    if (localStorage.getItem(ICON_UPDATE_KEY)) return icons;
    localStorage.setItem(ICON_UPDATE_KEY, 'done');
  } catch {
    return icons;
  }
  const next = { ...icons };
  for (const [tag, icon] of Object.entries(icons)) {
    const update = iconUpdates.find((item) => item.tag === tag.trim().toLocaleLowerCase('ru'));
    if (update && icon === update.from) next[tag] = update.to;
  }
  return next;
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

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === 'string');

const isJournalEntryList = (value: unknown): value is JournalEntry[] =>
  Array.isArray(value) && value.every((entry) =>
    entry && typeof entry === 'object' &&
    typeof (entry as JournalEntry).id === 'number' &&
    typeof (entry as JournalEntry).date === 'string' &&
    typeof (entry as JournalEntry).time === 'string' &&
    typeof (entry as JournalEntry).food === 'string' &&
    Array.isArray((entry as JournalEntry).tags) &&
    Array.isArray((entry as JournalEntry).activity)
  );

const isTagIconMap = (value: unknown): value is Record<string, string> =>
  !!value && typeof value === 'object' && !Array.isArray(value);

// Version of the data format kept in localStorage. Any future change to how
// entries or settings are stored must migrate data from older versions.
const STORAGE_VERSION_KEY = 'food-diary-storage-version';
const STORAGE_VERSION = 1;
try {
  if (!localStorage.getItem(STORAGE_VERSION_KEY)) localStorage.setItem(STORAGE_VERSION_KEY, String(STORAGE_VERSION));
} catch {
  // storage unavailable; the app still works with defaults
}

// Keys whose saved data could not be read on this launch.
const damagedStorageKeys = new Set<string>();

// Reads saved data without crashing the app. If the saved value is damaged,
// a copy of it is kept under a separate key and the fallback is used instead.
function loadStored<T>(key: string, fallback: T, isValid: (value: unknown) => value is T): T {
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


const localDateKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
const todayKey = () => localDateKey(new Date());
const monthStartKey = () => {
  const date = new Date();
  date.setDate(1);
  return localDateKey(date);
};

// "1 запись", "2 записи", "5 записей", "21 запись", "11 записей".
const formatEntryCount = (count: number) => {
  const lastTwo = count % 100;
  const last = count % 10;
  const word = lastTwo >= 11 && lastTwo <= 14 ? 'записей' : last === 1 ? 'запись' : last >= 2 && last <= 4 ? 'записи' : 'записей';
  return `${count} ${word}`;
};

const pluralDays = (count: number) => {
  const lastTwo = count % 100;
  const last = count % 10;
  return lastTwo >= 11 && lastTwo <= 14 ? 'дней' : last === 1 ? 'день' : last >= 2 && last <= 4 ? 'дня' : 'дней';
};

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
  const [chartOffset, setChartOffset] = useState(0);
  // A day (YYYY-MM-DD) or month (YYYY-MM) picked on the chart to narrow the list below.
  const [chartSelection, setChartSelection] = useState<string | null>(null);
  const toggleChartSelection = (key: string) => setChartSelection((current) => current === key ? null : key);
  const [analyticsPeriod, setAnalyticsPeriod] = useState<'Месяц' | 'Произвольный период'>('Месяц');
  const [showAllAnalyticsCategories, setShowAllAnalyticsCategories] = useState(false);
  const [analyticsFrom, setAnalyticsFrom] = useState(() => { const d = new Date(); d.setDate(1); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-01`; });
  const [analyticsTo, setAnalyticsTo] = useState(() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; });
  const chartScrollRef = useRef<HTMLDivElement>(null);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(() => loadStored('food-diary-entries', [], isJournalEntryList));
  const [entryDate, setEntryDate] = useState(() => { const now = new Date(); return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`; });
  const [entryTime, setEntryTime] = useState(() => new Date().toTimeString().slice(0, 5));
  const [entryFood, setEntryFood] = useState('');
  const [entryCarbs, setEntryCarbs] = useState('');
  const [entryComment, setEntryComment] = useState('');
  const [settingsPage, setSettingsPage] = useState<string | null>(null);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [aboutSections, setAboutSections] = useState({ storage: false, backup: false, export: false });
  const [foodTags, setFoodTags] = useState<string[]>(() => loadStored('food-diary-food-tags', defaultFoodTags, isStringArray));
  const [activityTags, setActivityTags] = useState<string[]>(() => loadStored('food-diary-activity-tags', defaultActivityTags, isStringArray));
  const [disabledFoodTags, setDisabledFoodTags] = useState<string[]>(() => loadStored('food-diary-disabled-food-tags', [], isStringArray));
  const [disabledActivityTags, setDisabledActivityTags] = useState<string[]>(() => loadStored('food-diary-disabled-activity-tags', [], isStringArray));
  const [tagCategory, setTagCategory] = useState<'food' | 'activity'>('food');
  const [tagEditorOpen, setTagEditorOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<string | null>(null);
  const [tagDraft, setTagDraft] = useState('');
  const [tagIcon, setTagIcon] = useState('tag');
  const [tagIcons, setTagIcons] = useState<Record<string, string>>(() => applyIconUpdate(loadStored('food-diary-tag-icons', {}, isTagIconMap)));
  const [deleteTag, setDeleteTag] = useState<string | null>(null);
  const [tagHintOpen, setTagHintOpen] = useState(false);
  const [orphanTagsOpen, setOrphanTagsOpen] = useState(false);
  const [replacingOrphan, setReplacingOrphan] = useState<string | null>(null);
  const [orphanTarget, setOrphanTarget] = useState('');
  const [draggedTag, setDraggedTag] = useState<string | null>(null);
  const [dragOverTag, setDragOverTag] = useState<string | null>(null);
  const [exportFormat, setExportFormat] = useState<'Excel (.xlsx)' | 'CSV (.csv)'>('CSV (.csv)');
  const [exportPeriod, setExportPeriod] = useState('Все записи');
  const [exportFrom, setExportFrom] = useState(monthStartKey);
  const [exportTo, setExportTo] = useState(todayKey);
  const [includeTags, setIncludeTags] = useState(true);
  const [includeCarbs, setIncludeCarbs] = useState(true);
  const [includeHunger, setIncludeHunger] = useState(true);
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

  const buildCsvBlob = () => {
    const escapeCell = (value: string | number) => {
      const cell = String(value);
      return /[;"\r\n]/.test(cell) ? '"' + cell.replace(/"/g, '""') + '"' : cell;
    };
    const csv = getExportRows().map((row) => row.map(escapeCell).join(';')).join('\r\n');
    return new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8;' });
  };

  const exportCsv = () => {
    if (exportEntries.length === 0 || exportFormat !== 'CSV (.csv)') return;
    const blob = buildCsvBlob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'food-diary-export-' + getExportFileDate() + '.csv';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const buildExcelWorkbook = () => {
    const rows = getExportRows();
    const worksheet = XLSX.utils.aoa_to_sheet(rows);
    worksheet['!cols'] = rows[0].map((header) => ({
      wch: Math.max(14, Math.min(36, String(header).length + 4)),
    }));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Дневник питания');
    return workbook;
  };

  const exportExcel = () => {
    if (exportEntries.length === 0 || exportFormat !== 'Excel (.xlsx)') return;
    XLSX.writeFile(buildExcelWorkbook(), 'food-diary-export-' + getExportFileDate() + '.xlsx');
  };

  // Sharing files through the Android share menu. Browsers decide which file
  // types may be shared, so support is checked for the chosen format.
  const XLSX_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
  const exportFileName = 'food-diary-export-' + getExportFileDate() + (exportFormat === 'CSV (.csv)' ? '.csv' : '.xlsx');
  const exportFileType = exportFormat === 'CSV (.csv)' ? 'text/csv' : XLSX_TYPE;
  const canShareExport = (() => {
    try {
      return typeof navigator.canShare === 'function' &&
        navigator.canShare({ files: [new File([''], exportFileName, { type: exportFileType })] });
    } catch {
      return false;
    }
  })();
  const shareExport = async () => {
    if (exportEntries.length === 0) return;
    const blob = exportFormat === 'CSV (.csv)'
      ? buildCsvBlob()
      : new Blob([XLSX.write(buildExcelWorkbook(), { bookType: 'xlsx', type: 'array' })], { type: XLSX_TYPE });
    const file = new File([blob], exportFileName, { type: exportFileType });
    try {
      await navigator.share({ files: [file], title: 'Дневник питания' });
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      window.alert('Не удалось открыть меню «Поделиться». Можно скачать файл кнопкой «Экспортировать».');
    }
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
      if (editingTag !== name) {
        const oldName = editingTag;
        const field = tagCategory === 'food' ? 'tags' : 'activity';
        const rename = (items: string[]) => Array.from(new Set(items.map((tag) => tag === oldName ? name : tag)));
        setJournalEntries((entries) => entries.map((entry) =>
          entry[field].includes(oldName) ? { ...entry, [field]: rename(entry[field]) } : entry));
        setFilterTags(rename);
      }
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
  // Tags that are stored in entries of the current category but are no longer
  // in the tag list (deleted, renamed before renaming updated entries, or restored).
  const currentEntryField = tagCategory === 'food' ? 'tags' : 'activity';
  const tagEntryCount = (tag: string) => journalEntries.filter((entry) => entry[currentEntryField].includes(tag)).length;
  const orphanTags = Array.from(journalEntries.reduce((counts, entry) => {
    for (const tag of entry[currentEntryField]) {
      if (!currentTags.includes(tag)) counts.set(tag, (counts.get(tag) || 0) + 1);
    }
    return counts;
  }, new Map<string, number>()), ([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag, 'ru'));
  const restoreOrphanTag = (tag: string) => {
    if (currentTags.length >= 30 || currentTags.includes(tag)) return;
    setCurrentTags((items) => [...items, tag]);
  };
  const replaceOrphanTag = (oldTag: string, newTag: string, count: number) => {
    if (!newTag || !currentTags.includes(newTag)) return;
    if (!window.confirm(`Заменить «${oldTag}» на «${newTag}» в записях (${count})? Это действие нельзя отменить.`)) return;
    const field = currentEntryField;
    setJournalEntries((entries) => entries.map((entry) => entry[field].includes(oldTag)
      ? { ...entry, [field]: Array.from(new Set(entry[field].map((tag) => tag === oldTag ? newTag : tag))) }
      : entry));
    setFilterTags((items) => Array.from(new Set(items.map((tag) => tag === oldTag ? newTag : tag))));
    setReplacingOrphan(null);
    setOrphanTarget('');
  };
  const renameEntryCount = editingTag
    ? journalEntries.filter((entry) => (tagCategory === 'food' ? entry.tags : entry.activity).includes(editingTag)).length
    : 0;
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
  const [hunger, setHunger] = useState<number | undefined>(undefined);
  const [mood, setMood] = useState('');

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
  // Observations are shown only when the period has enough entries to be meaningful.
  const MIN_ENTRIES_FOR_OBSERVATIONS = 5;
  const analyticsObservations = analyticsEntries.length < MIN_ENTRIES_FOR_OBSERVATIONS
    ? [`Пока недостаточно записей для наблюдений: нужно хотя бы ${MIN_ENTRIES_FOR_OBSERVATIONS} записей за выбранный период.`]
    : [
        `Больше всего записей приходится на время «${strongestPart.label.toLowerCase()}».`,
        `В дневнике есть записи за ${loggedDays.size} из ${analyticsDays} дней выбранного периода.`,
        `По сравнению с предыдущим равным периодом количество записей изменилось на ${formatChange(entryChange)}.`,
      ];

  const chartSelectionLabel = chartSelection
    ? chartSelection.length === 10
      ? new Date(`${chartSelection}T12:00:00`).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', ...(chartSelection.startsWith(String(today.getFullYear())) ? {} : { year: 'numeric' }) })
      : new Date(`${chartSelection}-01T12:00:00`).toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' }).replace(' г.', '')
    : '';

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
                {(showAllFoodTags ? editorFoodTags : editorFoodTags.slice(0, 4)).map((tag) => (
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
                {(showAllActivityTags ? editorActivityTags : editorActivityTags.slice(0, 4)).map((tag) => (
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
                  <div className="hunger-options" role="group" aria-label="Уровень голода">
                    {[1, 2, 3, 4, 5].map((number) => (
                      <button
                        type="button"
                        key={number}
                        className={`hunger-option ${hunger === number ? 'chosen' : ''}`}
                        aria-pressed={hunger === number}
                        onClick={() => setHunger((current) => current === number ? undefined : number)}
                      >
                        {number}
                      </button>
                    ))}
                  </div>
                  <p className="hunger-status">
                    {hunger === undefined ? 'Не указан' : `Выбрано: ${hunger}. Нажми ещё раз, чтобы отменить.`}
                  </p>
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
                  <button className={tagCategory === 'food' ? 'active' : ''} onClick={() => { setTagCategory('food'); setTagEditorOpen(false); setDeleteTag(null); setReplacingOrphan(null); }}>Тип еды</button>
                  <button className={tagCategory === 'activity' ? 'active' : ''} onClick={() => { setTagCategory('activity'); setTagEditorOpen(false); setDeleteTag(null); setReplacingOrphan(null); }}>Активность</button>
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
                    {editingTag && tagDraft.trim() && tagDraft.trim() !== editingTag && renameEntryCount > 0 && (
                      <span className="tag-rename-note">Название изменится и в записях дневника: {renameEntryCount}</span>
                    )}
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
                <div className="tag-management-hint">
                  <button type="button" className="tag-hint-toggle" aria-expanded={tagHintOpen} onClick={() => setTagHintOpen((open) => !open)}>
                    <span>Подсказка</span><span aria-hidden="true">{tagHintOpen ? '⌃' : '⌄'}</span>
                  </button>
                  {tagHintOpen && (
                    <div className="tag-hint-content">
                      <p>На компьютере перетаскивай тег мышью. На телефоне удерживай значок с точками и перемещай тег.</p>
                      <p><b>✎</b> — изменить название и значок.</p>
                      <p><b>Ⅱ</b> — отключить тег: он не будет предлагаться в новых записях, фильтрах и аналитике, но останется в старых записях. Нажми <b>✓</b>, чтобы включить его снова.</p>
                      <p><b>×</b> — удалить тег.</p>
                    </div>
                  )}
                </div>
                <div className="managed-tag-list">
                  {currentTags.map((tag) => (
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
                        <button aria-label="Изменить" onClick={() => { setEditingTag(tag); setTagDraft(tag); setTagIcon(tagIcons[tag] || defaultTagIcon(tag)); setTagEditorOpen(true); }}>✎</button>
                        <button aria-label={currentDisabled.includes(tag) ? 'Включить' : 'Отключить'} onClick={() => setCurrentDisabled((items) => items.includes(tag) ? items.filter((item) => item !== tag) : [...items, tag])}>{currentDisabled.includes(tag) ? '✓' : 'Ⅱ'}</button>
                        <button aria-label="Удалить" onClick={() => setDeleteTag(tag)}>×</button>
                      </div>
                      {deleteTag === tag && (
                        <div className="tag-delete-confirm">
                          <span>Удалить тег «{tag}»?{tagEntryCount(tag) > 0 && ` Тег есть в записях: ${tagEntryCount(tag)}. В них он сохранится, но не будет учитываться в фильтрах и аналитике.`}</span>
                          <button onClick={() => setDeleteTag(null)}>Отмена</button>
                          <button className="danger" onClick={() => removeTag(tag)}>Удалить</button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {orphanTags.length > 0 && (
                  <div className="orphan-tags">
                    <button type="button" className="tag-hint-toggle" aria-expanded={orphanTagsOpen} onClick={() => setOrphanTagsOpen((open) => !open)}>
                      <span>Теги из старых записей ({orphanTags.length})</span><span aria-hidden="true">{orphanTagsOpen ? '⌃' : '⌄'}</span>
                    </button>
                    {orphanTagsOpen && (
                      <>
                        <p className="orphan-tags-note">Этих тегов нет в списке, но они остались в записях: например, после удаления или переименования тега. Перед заменой лучше сделать резервную копию.</p>
                        {orphanTags.map(({ tag, count }) => (
                          <div className="orphan-tag" key={tag}>
                            <div className="orphan-tag-title">
                              <span className="managed-tag-icon"><TagGlyph name={tagIcons[tag] || defaultTagIcon(tag)} size={18} /></span>
                              <strong>{tag}</strong>
                              <small>записей: {count}</small>
                            </div>
                            {replacingOrphan === tag ? (
                              <div className="orphan-tag-replace">
                                <select value={orphanTarget} onChange={(event) => setOrphanTarget(event.target.value)} aria-label="Заменить на тег">
                                  <option value="">Выбери тег…</option>
                                  {currentTags.map((item) => <option key={item} value={item}>{item}</option>)}
                                </select>
                                <div className="orphan-tag-actions">
                                  <button type="button" onClick={() => { setReplacingOrphan(null); setOrphanTarget(''); }}>Отмена</button>
                                  <button type="button" className="primary" disabled={!orphanTarget} onClick={() => replaceOrphanTag(tag, orphanTarget, count)}>Заменить</button>
                                </div>
                              </div>
                            ) : (
                              <div className="orphan-tag-actions">
                                <button type="button" disabled={currentTags.length >= 30} onClick={() => restoreOrphanTag(tag)}>Вернуть в список</button>
                                <button type="button" disabled={currentTags.length === 0} onClick={() => { setReplacingOrphan(tag); setOrphanTarget(''); }}>Заменить на…</button>
                              </div>
                            )}
                          </div>
                        ))}
                        {currentTags.length >= 30 && <p className="orphan-tags-note">В списке уже 30 тегов: чтобы вернуть тег, сначала удали какой-нибудь другой.</p>}
                      </>
                    )}
                  </div>
                )}
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
                <div className="export-buttons">
                  <button className="export-button" onClick={exportFormat === 'CSV (.csv)' ? exportCsv : exportExcel} disabled={exportEntries.length === 0}>Экспортировать {exportFormat === 'CSV (.csv)' ? 'CSV' : 'Excel'}-файл</button>
                  {canShareExport && <button className="export-button secondary" onClick={() => void shareExport()} disabled={exportEntries.length === 0}>Поделиться</button>}
                </div>
                <p className="export-note">{exportEntries.length === 0 ? 'За выбранный период записей нет.' : exportFormat === 'CSV (.csv)' ? 'Файл CSV сохранится на устройство. Его можно открыть в Excel. Для Google Таблиц на телефоне лучше выбрать формат Excel.' : 'Файл Excel сохранится на устройство. Его можно открыть в Excel или Google Таблицах.'}</p>
              </section>
            )}

            {settingsPage === 'О приложении' && (
              <section className="settings-page about-page">
                <div className="about-hero">
                  <img className="about-app-icon" src={`${import.meta.env.BASE_URL}app-icon.svg`} alt="" />
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
                  {aboutSections.export && <p className="about-section-content">В разделе «Ещё» → «Экспорт данных» можно выбрать период и состав данных, а затем скачать файл Excel (.xlsx) или CSV. Для Google Таблиц на телефоне удобнее формат Excel.</p>}
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
                    <li>Тема оформления</li>
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

          </main>

          {!settingsPage && <button className="add-button" aria-label="Добавить запись" onClick={openEditor}>+</button>}


        </>
      )}
    </div>
  );
}

export default App;
