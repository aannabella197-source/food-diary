import { BackButton } from './BackButton';

const MENU_PAGES = ['Аналитика', 'Управление тегами', 'Резервное копирование', 'Экспорт данных', 'Оформление', 'О приложении'];

type Props = {
  settingsPage: string | null;
  menuOpen: boolean;
  onBack: () => void;
  onToggleMenu: () => void;
  onOpenPage: (page: string) => void;
};

// Title row with the back arrow on section pages and the "⋯" menu of sections.
export function TopBar({ settingsPage, menuOpen, onBack, onToggleMenu, onOpenPage }: Props) {
  return (
    <header className="topbar">
      <div>
        <div className={settingsPage ? "settings-title-row" : ""}>
          {settingsPage && (
            <BackButton className="settings-back" onClick={onBack} />
          )}
          <h1>{settingsPage || 'Дневник питания'}</h1>
        </div>
      </div>
      <div className="more-menu-wrap">
        <button className="profile-mark more-menu-button" type="button" aria-label="Открыть меню разделов" aria-expanded={menuOpen} onClick={onToggleMenu}>
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <circle cx="5" cy="12" r="1.7" />
            <circle cx="12" cy="12" r="1.7" />
            <circle cx="19" cy="12" r="1.7" />
          </svg>
        </button>
        {menuOpen && (
          <div className="more-menu">
            {MENU_PAGES.map((item) => (
              <button type="button" key={item} onClick={() => onOpenPage(item)}>{item}</button>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
