import type { EntryDraft } from '../entryDraft';
import { defaultTagIcon } from '../tagIcons';
import { parseWeight } from '../format';
import { TagGlyph } from '../components/TagGlyph';
import { BackButton } from '../components/BackButton';

type Props = {
  draft: EntryDraft;
  isEditing: boolean;
  foodTags: string[];
  activityTags: string[];
  tagIcons: Record<string, string>;
  onToggleTag: (tag: string) => void;
  onBack: () => void;
  onSave: () => void;
};

export function EntryEditorPage({ draft, isEditing, foodTags, activityTags, tagIcons, onToggleTag, onBack, onSave }: Props) {
  const {
    entryDate, setEntryDate, entryTime, setEntryTime, entryFood, setEntryFood, entryCarbs, setEntryCarbs, entryComment, setEntryComment, showAllFields, setShowAllFields, showAllFoodTags, setShowAllFoodTags, showAllActivityTags, setShowAllActivityTags, selectedTags, hunger, setHunger, mood, setMood, entryWeight, setEntryWeight,
  } = draft;
  const weightInvalid = entryWeight.trim() !== '' && parseWeight(entryWeight) === null;
  return (
    <>
      <header className="editor-header">
        <BackButton onClick={onBack} />
        <h1>{isEditing ? 'Изменить запись' : 'Новая запись'}</h1>
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
          <label className="field-label editor-side-row">
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
                onClick={() => onToggleTag(tag)}
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

        <section className="editor-card editor-side-row">
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
                onClick={() => onToggleTag(tag)}
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
              <div className="editor-section-title">Комментарий</div>
              <label className="field-label">
                <textarea rows={3} value={entryComment} onChange={(event) => setEntryComment(event.target.value)} placeholder="Дополнительные заметки к записи" />
              </label>
            </section>

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

            <section className="editor-card editor-side-row">
              <div className="editor-section-title">Вес тела</div>
              <div className="field-with-unit">
                <input type="text" inputMode="decimal" placeholder="Например, 63,5" value={entryWeight} onChange={(event) => setEntryWeight(event.target.value)} aria-invalid={weightInvalid} />
                <span>кг</span>
              </div>
              {weightInvalid && <p className="field-error">Введи вес числом, например 63,5</p>}
            </section>
          </>
        )}

        <button className="save-button" onClick={onSave} disabled={!entryFood.trim() || weightInvalid}>
          {isEditing ? 'Сохранить изменения' : 'Сохранить запись'}
        </button>
      </main>
    </>
  );
}
