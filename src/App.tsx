
import { useState } from 'react';
import './App.css';

type Period = 'Неделя' | 'Месяц' | 'Год';
type Tab = 'Динамика' | 'Журнал' | 'Ещё';
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
};

const foodTags = [
  'Перекус', 'Завтрак', 'Обед', 'Ужин',
  'Десерт', 'Фрукты', 'Овощи', 'Мучное',
  'Без глютена', 'Молочное', 'Мясное', 'Крупы',
  'Ягоды', 'Орехи', 'Вода', 'Алкогольные напитки',
  'Безалкогольные напитки', 'Чай', 'Кофе', 'Смузи',
];

const activityTags = [
  'Прогулка', 'Домашние дела', 'Тренировка', 'Отдых', 'Работа',
];

const weekData = [
  { day: 'Пн', date: '18', count: 3 },
  { day: 'Вт', date: '19', count: 4 },
  { day: 'Ср', date: '20', count: 2 },
  { day: 'Чт', date: '21', count: 5 },
  { day: 'Пт', date: '22', count: 3 },
  { day: 'Сб', date: '23', count: 4 },
  { day: 'Вс', date: '24', count: 0 },
];

const entries = [
  { time: '08:30', tags: ['Завтрак', 'Молочное'] },
  { time: '12:45', tags: ['Обед', 'Мясное', 'Овощи'] },
  { time: '16:10', tags: ['Перекус', 'Фрукты'] },
  { time: '19:20', tags: ['Ужин', 'Крупы'] },
];

const journalEntries: JournalEntry[] = [
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
  const [tab, setTab] = useState<Tab>('Динамика');
  const [editorOpen, setEditorOpen] = useState(false);
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
    setSelectedTags([]);
    setShowAllFields(false);
    setShowAllFoodTags(false);
    setShowAllActivityTags(false);
    setHunger(3);
    setMood('');
    setEditorOpen(true);
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

  const formatDate = (date: string) => {
    return new Date(`${date}T12:00:00`).toLocaleDateString('ru-RU', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  };

  return (
    <div className="app">
      {editorOpen ? (
        <>
          <header className="editor-header">
            <button className="back-button" onClick={() => setEditorOpen(false)}>
              ←
            </button>
            <h1>Новая запись</h1>
          </header>

          <main className="editor-main">
            <section className="editor-card">
              <div className="date-time-row">
                <label className="field-label">
                  Дата
                  <input type="date" defaultValue="2026-11-24" />
                </label>
                <label className="field-label">
                  Время
                  <input type="time" defaultValue="08:30" />
                </label>
              </div>
            </section>

            <section className="editor-card">
              <label className="field-label">
                Еда
                <textarea
                  rows={3}
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
                <input type="number" placeholder="0" />
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

            <button className="save-button" onClick={() => setEditorOpen(false)}>
              Сохранить запись
            </button>
          </main>
        </>
      ) : (
        <>
          <header className="topbar">
            <div>
              <p className="eyebrow">МОЙ ДНЕВНИК</p>
              <h1>{tab}</h1>
            </div>
            <div className="profile-mark">Д</div>
          </header>

          <main>
            {tab === 'Динамика' && (
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
                      <h2>Эта неделя</h2>
                    </div>
                    <span className="total">21 запись</span>
                  </div>
                  <div className="chart">
                    {weekData.map((item) => (
                      <div className="chart-column" key={item.day}>
                        <span className="bar-count">{item.count}</span>
                        <div className="bar-area">
                          <div
                            className={`bar ${item.count === 0 ? 'empty' : ''}`}
                            style={{ height: `${item.count * 16 + 4}px` }}
                          />
                        </div>
                        <span className="bar-day">{item.day}</span>
                        <span className="bar-date">{item.date}</span>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="timeline">
                  <div className="timeline-heading">
                    <h2>Записи</h2>
                    <span className="muted">Сегодня · 24 ноября</span>
                  </div>
                  {entries.map((entry) => (
                    <article className="entry" key={entry.time}>
                      <span className="entry-time">{entry.time}</span>
                      <div className="entry-tags">
                        {entry.tags.map((tag) => (
                          <span className="tag" key={tag}>{tag}</span>
                        ))}
                      </div>
                      <span className="entry-arrow">›</span>
                    </article>
                  ))}
                </section>
              </>
            )}

            {tab === 'Журнал' && (
              <section className="journal">
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
                        {foodTags.map((tag) => (
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
                        {activityTags.map((tag) => (
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
                          <article className="journal-entry" key={entry.id}>
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
              </section>
            )}

            {tab === 'Ещё' && (
              <section className="settings-list">
                <h2>Настройки</h2>
                {['Управление тегами', 'Резервное копирование', 'Экспорт данных', 'Оформление', 'О приложении'].map((item) => (
                  <div className="setting-item" key={item}>
                    {item}<span>›</span>
                  </div>
                ))}
              </section>
            )}
          </main>

          <button className="add-button" aria-label="Добавить запись" onClick={openEditor}>+</button>

          <nav className="bottom-nav">
            {(['Динамика', 'Журнал', 'Ещё'] as Tab[]).map((item, index) => (
              <button
                key={item}
                className={tab === item ? 'nav-item selected' : 'nav-item'}
                onClick={() => setTab(item)}
              >
                <span className="nav-symbol">{['◷', '▤', '•••'][index]}</span>
                <span>{item}</span>
              </button>
            ))}
          </nav>
        </>
      )}
    </div>
  );
}

export default App;
