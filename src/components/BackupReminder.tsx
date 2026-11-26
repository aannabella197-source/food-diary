import { pluralDays } from '../format';

type Props = {
  // Days since the last backup, or null when there has never been one.
  daysSinceBackup: number | null;
  onCreate: () => void;
  onSnooze: () => void;
};

export function BackupReminder({ daysSinceBackup, onCreate, onSnooze }: Props) {
  return (
    <section className="backup-reminder">
      <p>{daysSinceBackup === null ? 'Резервная копия ещё не создавалась.' : `Последняя резервная копия — ${daysSinceBackup} ${pluralDays(daysSinceBackup)} назад.`} Записи хранятся только на этом устройстве.</p>
      <div>
        <button type="button" className="primary" onClick={onCreate}>Создать копию</button>
        <button type="button" onClick={onSnooze}>Позже</button>
      </div>
    </section>
  );
}
