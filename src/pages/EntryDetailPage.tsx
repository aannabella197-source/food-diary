import type { JournalEntry } from '../types';
import { formatEntryDate, mealTagsFirst } from '../format';
import { defaultTagIcon } from '../tagIcons';
import { TagGlyph } from '../components/TagGlyph';
import { BackButton } from '../components/BackButton';

type Props = {
  entry: JournalEntry;
  tagIcons: Record<string, string>;
  confirmDelete: boolean;
  setConfirmDelete: (value: boolean) => void;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

export function EntryDetailPage({ entry, tagIcons, confirmDelete, setConfirmDelete, onBack, onEdit, onDelete }: Props) {
  return (
    <>
      <header className="editor-header">
        <BackButton onClick={onBack} />
        <h1>Запись</h1>
      </header>
      <main className="editor-main">
        <section className="editor-card entry-detail-card">
          <p className="muted entry-detail-date">{formatEntryDate(entry.date)} · {entry.time}</p>
          <div className="entry-detail-row">
            <h2>Еда</h2>
            <p>{entry.food}</p>
          </div>
          {entry.tags.length > 0 && (
            <div className="entry-detail-row">
              <h2>Тип еды</h2>
              <div className="journal-entry-tags">{mealTagsFirst(entry.tags).map((tag) => <span className="tag" key={tag}><TagGlyph name={tagIcons[tag] || defaultTagIcon(tag)} size={13} />{tag}</span>)}</div>
            </div>
          )}
          {entry.carbs !== null && (
            <div className="entry-detail-row">
              <h2>Углеводы</h2>
              <p>{entry.carbs} г</p>
            </div>
          )}
          {entry.activity.length > 0 && (
            <div className="entry-detail-row">
              <h2>Активность</h2>
              <div className="journal-entry-tags">{entry.activity.map((tag) => <span className="tag activity-tag" key={tag}><TagGlyph name={tagIcons[tag] || defaultTagIcon(tag)} size={13} />{tag}</span>)}</div>
            </div>
          )}
          {entry.hunger !== undefined && (
            <div className="entry-detail-row">
              <h2>Уровень голода</h2>
              <p>{entry.hunger} из 5</p>
            </div>
          )}
          {entry.mood && (
            <div className="entry-detail-row">
              <h2>Настроение</h2>
              <p>{entry.mood}</p>
            </div>
          )}
          {entry.comment && (
            <div className="entry-detail-row">
              <h2>Комментарий</h2>
              <p>{entry.comment}</p>
            </div>
          )}
        </section>
        <div className="entry-actions">
          <button className="save-button" onClick={() => onEdit()}>Изменить запись</button>
          {!confirmDelete ? (
            <button className="delete-entry-button" onClick={() => setConfirmDelete(true)}>Удалить запись</button>
          ) : (
            <div className="delete-entry-confirm">
              <p>Удалить эту запись? Это действие нельзя отменить.</p>
              <div>
                <button className="delete-entry-button" onClick={onDelete}>Удалить</button>
                <button className="cancel-delete-button" onClick={() => setConfirmDelete(false)}>Отмена</button>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
