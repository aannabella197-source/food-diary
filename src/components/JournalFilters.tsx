import type { Dispatch, SetStateAction } from 'react';
import type { JournalPeriod } from '../types';
import { journalPeriods } from '../format';
import { defaultTagIcon } from '../tagIcons';
import { TagGlyph } from './TagGlyph';

type Setter<T> = Dispatch<SetStateAction<T>>;

type Props = {
  searchText: string;
  setSearchText: Setter<string>;
  filtersOpen: boolean;
  setFiltersOpen: Setter<boolean>;
  journalPeriod: JournalPeriod;
  setJournalPeriod: Setter<JournalPeriod>;
  dateFrom: string;
  setDateFrom: Setter<string>;
  dateTo: string;
  setDateTo: Setter<string>;
  filterTags: string[];
  toggleFilterTag: (tag: string) => void;
  resetFilters: () => void;
  foodTags: string[];
  disabledFoodTags: string[];
  activityTags: string[];
  disabledActivityTags: string[];
  tagIcons: Record<string, string>;
};

// Search field and the "Фильтры" panel above the entry list.
export function JournalFilters({
  searchText, setSearchText, filtersOpen, setFiltersOpen, journalPeriod, setJournalPeriod, dateFrom, setDateFrom, dateTo, setDateTo,
  filterTags, toggleFilterTag, resetFilters, foodTags, disabledFoodTags, activityTags, disabledActivityTags, tagIcons,
}: Props) {
  return (
    <>
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
    </>
  );
}
