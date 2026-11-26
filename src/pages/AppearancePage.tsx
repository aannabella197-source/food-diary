import type { Theme } from '../types';

type Props = {
  theme: Theme;
  onChange: (theme: Theme) => void;
};

export function AppearancePage({ theme, onChange }: Props) {
  return (
    <section className="settings-page">
      <p className="muted">Выбери, как будет выглядеть дневник</p>
      <div className="theme-options">
        {([
          { value: 'light', label: 'Светлая', description: 'Светлый фон и спокойные зелёные оттенки' },
          { value: 'dark', label: 'Тёмная', description: 'Тёмный фон, комфортный при слабом освещении' },
          { value: 'system', label: 'Системная', description: 'Как в настройках устройства' },
        ] as { value: Theme; label: string; description: string }[]).map((option) => (
          <button
            key={option.value}
            className={theme === option.value ? 'theme-option selected' : 'theme-option'}
            onClick={() => onChange(option.value)}
          >
            <span className="theme-radio" aria-hidden="true">{theme === option.value ? '✓' : ''}</span>
            <span className="theme-option-copy">
              <strong>{option.label}</strong>
              <small>{option.description}</small>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
