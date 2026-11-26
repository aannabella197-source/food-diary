import { useRef } from 'react';

export type BackupInfo = { createdAt: string; size: number };

type Props = {
  backupInfo: BackupInfo | null;
  onCreate: () => void;
  onRestore: (file: File) => void;
};

export function BackupPage({ backupInfo, onCreate, onRestore }: Props) {
  const restoreFileInput = useRef<HTMLInputElement>(null);
  return (
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
          <button className="backup-button" onClick={onCreate}>Создать копию</button>
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
              if (file) onRestore(file);
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
  );
}
