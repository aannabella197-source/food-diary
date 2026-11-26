
type Props = {
  onClose: () => void;
};

// Shown when saved data could not be read on this launch.
export function StorageWarning({ onClose }: Props) {
  return (
    <section className="storage-warning" role="alert">
      <p>Не удалось прочитать часть сохранённых данных. Повреждённые данные не удалены: их копия оставлена в браузере. Если у тебя есть резервная копия, её можно восстановить в разделе «Резервное копирование».</p>
      <button type="button" onClick={onClose}>Понятно</button>
    </section>
  );
}
