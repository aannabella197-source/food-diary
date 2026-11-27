import { useRef, useState } from 'react';

export type BackupInfo = { createdAt: string; size: number };

type Props = {
  backupInfo: BackupInfo | null;
  onCreate: () => void;
  onRestore: (file: File) => void;
};

export function BackupPage({ backupInfo, onCreate, onRestore }: Props) {
  const restoreFileInput = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState({ contents: false, location: false });
  const toggle = (section: keyof typeof open) => setOpen((current) => ({ ...current, [section]: !current[section] }));

  return (
    <section className="settings-page backup-page">
      <p className="page-intro">Резервная копия — это файл со всеми записями и настройками дневника. По нему можно восстановить данные, например на новом телефоне.</p>

      <div className="backup-card">
        <div className="backup-status">
          <div className="backup-status-icon" aria-hidden="true">☁</div>
          <div>
            <h2>{backupInfo ? 'Последняя копия' : 'Копий пока нет'}</h2>
            <p>{backupInfo
              ? `${new Date(backupInfo.createdAt).toLocaleString('ru-RU')} · ${(backupInfo.size / 1024).toFixed(1)} КБ`
              : 'После создания копии здесь появятся дата, время и размер файла.'}</p>
          </div>
        </div>
        <div className="backup-buttons">
          <button className="backup-button" onClick={onCreate}>Создать копию</button>
          <button className="backup-button secondary" onClick={() => restoreFileInput.current?.click()}>Восстановить</button>
        </div>
        <input
          ref={restoreFileInput}
          type="file"
          accept=".json,application/json"
          hidden
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) onRestore(file);
            event.target.value = '';
          }}
        />
      </div>

      <div className="backup-section">
        <button type="button" className="section-toggle" aria-expanded={open.contents} onClick={() => toggle('contents')}>
          <span>Что входит в копию</span><span className="section-toggle-chevron" aria-hidden="true">{open.contents ? '⌃' : '⌄'}</span>
        </button>
        {open.contents && (
          <ul className="backup-includes">
            <li>Все записи дневника: еда, дата и время, теги и дополнительные поля</li>
            <li>Теги, их иконки и настройки</li>
            <li>Тема оформления</li>
          </ul>
        )}
      </div>

      <div className="backup-section">
        <button type="button" className="section-toggle" aria-expanded={open.location} onClick={() => toggle('location')}>
          <span>Где найти копию на телефоне</span><span className="section-toggle-chevron" aria-hidden="true">{open.location ? '⌃' : '⌄'}</span>
        </button>
        {open.location && (
          <div className="backup-section-content">
            <p>Копия скачивается в Chrome. Обычно она лежит в приложении «Файлы» → «Загрузки» или в Chrome → меню ⋮ → «Скачанные файлы».</p>
            <p>Чтобы копия не потерялась вместе с телефоном, файл можно вручную загрузить на облачный диск.</p>
            <p>Для восстановления нажми «Восстановить» и выбери файл, название которого начинается с <b>food-diary-backup-</b>.</p>
          </div>
        )}
      </div>

      <p className="page-note">Восстановление заменяет текущие записи и настройки. Автоматической синхронизации между устройствами нет.</p>
    </section>
  );
}
