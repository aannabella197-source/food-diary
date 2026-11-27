export type AboutSections = { storage: boolean; backup: boolean; export: boolean };

type Props = {
  sections: AboutSections;
  onToggle: (section: keyof AboutSections) => void;
};

export function AboutPage({ sections, onToggle }: Props) {
  return (
    <section className="settings-page about-page">
      <div className="about-hero">
        <img className="about-app-icon" src={`${import.meta.env.BASE_URL}app-icon.svg`} alt="" />
        <h2>Дневник питания</h2>
        <p>Личный дневник для наблюдения за питанием и повседневными привычками.</p>
      </div>

      <div className="about-section">
        <button className="about-section-toggle" onClick={() => onToggle('storage')} aria-expanded={sections.storage}>
          <span>Как хранятся данные</span><span className="about-section-chevron">{sections.storage ? '⌃' : '⌄'}</span>
        </button>
        {sections.storage && <p className="about-section-content">Записи хранятся на устройстве. Дневник рассчитан на работу без постоянного подключения к интернету. Автоматической синхронизации между устройствами нет.</p>}
      </div>

      <div className="about-section">
        <button className="about-section-toggle" onClick={() => onToggle('backup')} aria-expanded={sections.backup}>
          <span>Резервное копирование</span><span className="about-section-chevron">{sections.backup ? '⌃' : '⌄'}</span>
        </button>
        {sections.backup && (
          <div className="about-section-content">
            <p>Чтобы перенести данные или защитить их от потери, периодически создавай резервную копию.</p>
            <ol>
              <li>Открой меню «⋯» → «Резервное копирование».</li>
              <li>Нажми «Создать копию». Файл скачается на телефон; его можно вручную загрузить на облачный диск.</li>
              <li>Для восстановления нажми «Восстановить» в этом же разделе и выбери файл копии.</li>
            </ol>
          </div>
        )}
      </div>

      <div className="about-section">
        <button className="about-section-toggle" onClick={() => onToggle('export')} aria-expanded={sections.export}>
          <span>Экспорт данных</span><span className="about-section-chevron">{sections.export ? '⌃' : '⌄'}</span>
        </button>
        {sections.export && <p className="about-section-content">В меню «⋯» → «Экспорт данных» можно выбрать период и состав данных, а затем скачать файл Excel (.xlsx) или CSV. Для Google Таблиц на телефоне удобнее формат Excel.</p>}
      </div>

      <p className="about-disclaimer">Дневник предназначен для личных записей и не является медицинским приложением.</p>
      <p className="about-version">Версия 1.0.0</p>
    </section>
  );
}
