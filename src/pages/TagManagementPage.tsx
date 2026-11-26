import type { Dispatch, SetStateAction } from 'react';
import { GripVertical } from 'lucide-react';
import type { JournalEntry } from '../types';
import type { TagManagementState } from '../tagManagementState';
import { defaultTagIcon, tagIconOptions } from '../tagIcons';
import { TagGlyph } from '../components/TagGlyph';

type Setter<T> = Dispatch<SetStateAction<T>>;

type Props = {
  ui: TagManagementState;
  journalEntries: JournalEntry[];
  setJournalEntries: Setter<JournalEntry[]>;
  foodTags: string[];
  setFoodTags: Setter<string[]>;
  activityTags: string[];
  setActivityTags: Setter<string[]>;
  disabledFoodTags: string[];
  setDisabledFoodTags: Setter<string[]>;
  disabledActivityTags: string[];
  setDisabledActivityTags: Setter<string[]>;
  tagIcons: Record<string, string>;
  setTagIcons: Setter<Record<string, string>>;
  setFilterTags: Setter<string[]>;
};

export function TagManagementPage({
  ui, journalEntries, setJournalEntries, foodTags, setFoodTags, activityTags, setActivityTags,
  disabledFoodTags, setDisabledFoodTags, disabledActivityTags, setDisabledActivityTags, tagIcons, setTagIcons, setFilterTags,
}: Props) {
  const {
    tagCategory, setTagCategory, tagEditorOpen, setTagEditorOpen, editingTag, setEditingTag, tagDraft, setTagDraft, tagIcon, setTagIcon, deleteTag, setDeleteTag, tagHintOpen, setTagHintOpen, orphanTagsOpen, setOrphanTagsOpen, replacingOrphan, setReplacingOrphan, orphanTarget, setOrphanTarget, draggedTag, setDraggedTag, dragOverTag, setDragOverTag,
  } = ui;

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

  return (
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
  );
}
