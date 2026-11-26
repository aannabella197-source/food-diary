import type { JournalEntry } from '../types';
import { formatEntryCount, formatEntryDate, mealTagsFirst } from '../format';
import { defaultTagIcon } from '../tagIcons';
import { TagGlyph } from './TagGlyph';

type Props = {
  groupedEntries: { date: string; entries: JournalEntry[] }[];
  filteredCount: number;
  totalEntries: number;
  chartSelection: string | null;
  chartSelectionLabel: string;
  onClearChartSelection: () => void;
  onDeleteAll: () => void;
  onOpenEntry: (entry: JournalEntry) => void;
  tagIcons: Record<string, string>;
};

// "Все записи": entries grouped by day.
export function JournalList({
  groupedEntries, filteredCount, totalEntries, chartSelection, chartSelectionLabel, onClearChartSelection, onDeleteAll, onOpenEntry, tagIcons,
}: Props) {
  return (
    <div className="journal-results">
      {chartSelection && (
        <button type="button" className="chart-selection-chip" onClick={onClearChartSelection} aria-label="Снять отбор по графику">
          <span>Записи за {chartSelectionLabel}</span><span aria-hidden="true">×</span>
        </button>
      )}
      <div className="journal-results-heading">
        <div>
          <h2>Все записи</h2>
          <span className="muted">{formatEntryCount(filteredCount)}</span>
        </div>
        <button
          className="delete-all-entries-button"
          disabled={totalEntries === 0}
          onClick={onDeleteAll}
        >
          Удалить все
        </button>
      </div>

      {groupedEntries.length > 0 ? (
        groupedEntries.map((group) => (
          <section className="journal-day" key={group.date}>
            <h3>{formatEntryDate(group.date)}</h3>
            {group.entries.map((entry) => (
              <article className="journal-entry" key={entry.id} onClick={() => onOpenEntry(entry)} role="button" tabIndex={0} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') onOpenEntry(entry); }}>
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
  );
}
