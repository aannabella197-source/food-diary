import writeExcelFile from 'write-excel-file/browser';
import type { JournalEntry } from '../types';
import type { ExportSettings } from '../exportSettings';

type Props = {
  entries: JournalEntry[];
  settings: ExportSettings;
};

export function ExportPage({ entries, settings }: Props) {
  const {
    exportFormat, setExportFormat, exportPeriod, setExportPeriod, exportFrom, setExportFrom, exportTo, setExportTo,
    includeTags, setIncludeTags, includeCarbs, setIncludeCarbs, includeHunger, setIncludeHunger,
  } = settings;

  const exportDateKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  const exportEntries = entries
    .filter((entry) => {
      if (exportPeriod === 'Текущий месяц') {
        const now = new Date();
        const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
        return entry.date >= monthStart && entry.date <= exportDateKey(new Date());
      }
      if (exportPeriod === 'Последние 7 дней') {
        const end = new Date();
        end.setHours(0, 0, 0, 0);
        const start = new Date(end);
        start.setDate(start.getDate() - 6);
        return entry.date >= exportDateKey(start) && entry.date <= exportDateKey(end);
      }
      if (exportPeriod === 'Произвольный период') {
        if (exportFrom && entry.date < exportFrom) return false;
        if (exportTo && entry.date > exportTo) return false;
      }
      return true;
    })
    .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));

  const getExportRows = () => {
    const headers = ['Дата', 'Время', 'Еда'];
    if (includeTags) headers.push('Теги еды', 'Активность');
    if (includeCarbs) headers.push('Углеводы (г)', 'Комментарий');
    if (includeHunger) headers.push('Уровень голода', 'Настроение');
    const rows = exportEntries.map((entry) => {
      const row: (string | number)[] = [entry.date, entry.time, entry.food];
      if (includeTags) row.push(entry.tags.join(', '), entry.activity.join(', '));
      if (includeCarbs) row.push(entry.carbs ?? '', entry.comment || '');
      if (includeHunger) row.push(entry.hunger ?? '', entry.mood || '');
      return row;
    });
    return [headers, ...rows];
  };

  const getExportFileDate = () => exportDateKey(new Date());

  const buildCsvBlob = () => {
    const escapeCell = (value: string | number) => {
      const cell = String(value);
      return /[;"\r\n]/.test(cell) ? '"' + cell.replace(/"/g, '""') + '"' : cell;
    };
    const csv = getExportRows().map((row) => row.map(escapeCell).join(';')).join('\r\n');
    return new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8;' });
  };

  const exportCsv = () => {
    if (exportEntries.length === 0 || exportFormat !== 'CSV (.csv)') return;
    const blob = buildCsvBlob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'food-diary-export-' + getExportFileDate() + '.csv';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const exportExcel = async () => {
    if (exportEntries.length === 0 || exportFormat !== 'Excel (.xlsx)') return;
    const rows = getExportRows();
    try {
      await writeExcelFile(rows.map((row) => row.map((cell) => cell === '' ? null : cell)), {
        sheet: 'Дневник питания',
        columns: rows[0].map((header) => ({ width: Math.max(14, Math.min(36, String(header).length + 4)) })),
      }).toFile('food-diary-export-' + getExportFileDate() + '.xlsx');
    } catch {
      window.alert('Не удалось создать файл Excel. Попробуй ещё раз или выбери формат CSV.');
    }
  };

  // Sharing files through the Android share menu. Browsers decide which file
  // types may be shared, so support is checked for the chosen format.
  const XLSX_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
  const exportFileName = 'food-diary-export-' + getExportFileDate() + (exportFormat === 'CSV (.csv)' ? '.csv' : '.xlsx');
  const exportFileType = exportFormat === 'CSV (.csv)' ? 'text/csv' : XLSX_TYPE;
  const canShareExport = (() => {
    // Chrome on Android reports .xlsx as shareable but then refuses to share it,
    // so sharing is offered for CSV only.
    if (exportFormat !== 'CSV (.csv)') return false;
    try {
      return typeof navigator.canShare === 'function' &&
        navigator.canShare({ files: [new File([''], exportFileName, { type: exportFileType })] });
    } catch {
      return false;
    }
  })();
  const shareExport = async () => {
    if (exportEntries.length === 0 || exportFormat !== 'CSV (.csv)') return;
    const blob = buildCsvBlob();
    const file = new File([blob], exportFileName, { type: exportFileType });
    try {
      await navigator.share({ files: [file], title: 'Дневник питания' });
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      window.alert('Не удалось открыть меню «Поделиться». Можно скачать файл кнопкой «Экспортировать».');
    }
  };

  return (
    <section className="settings-page export-page">
      <div className="export-section">
        <h2>Формат файла</h2>
        <div className="export-choice-row">
          {(['Excel (.xlsx)', 'CSV (.csv)'] as const).map((format) => (
            <button key={format} className={exportFormat === format ? 'export-choice active' : 'export-choice'} onClick={() => setExportFormat(format)}>
              <span className="export-radio">{exportFormat === format ? '✓' : ''}</span>
              {format}
            </button>
          ))}
        </div>
      </div>
      <div className="export-section">
        <h2>Период</h2>
        <select className="export-select" value={exportPeriod} onChange={(event) => setExportPeriod(event.target.value)}>
          {['Все записи', 'Текущий месяц', 'Последние 7 дней', 'Произвольный период'].map((item) => <option key={item}>{item}</option>)}
        </select>
        {exportPeriod === 'Произвольный период' && (
          <div className="date-range export-date-range">
            <label>С даты<input type="date" value={exportFrom} onChange={(event) => setExportFrom(event.target.value)} /></label>
            <label>По дату<input type="date" value={exportTo} onChange={(event) => setExportTo(event.target.value)} /></label>
          </div>
        )}
      </div>
      <div className="export-section">
        <h2>Какие данные включить</h2>
        <div className="export-includes">
          <div className="export-included required"><span className="export-check">✓</span><span><strong>Дата и время</strong><small>Обязательно для каждой записи</small></span><em>Обязательно</em></div>
          <div className="export-included required"><span className="export-check">✓</span><span><strong>Описание еды</strong><small>Текст и порция</small></span><em>Обязательно</em></div>
          <button className="export-included" onClick={() => setIncludeTags(!includeTags)}><span className={includeTags ? 'export-check checked' : 'export-check'}>{includeTags ? '✓' : ''}</span><span><strong>Теги и активность</strong><small>Категории и выбранные отметки</small></span></button>
          <button className="export-included" onClick={() => setIncludeCarbs(!includeCarbs)}><span className={includeCarbs ? 'export-check checked' : 'export-check'}>{includeCarbs ? '✓' : ''}</span><span><strong>Углеводы и комментарии</strong><small>Количество углеводов и заметки</small></span></button>
          <button className="export-included" onClick={() => setIncludeHunger(!includeHunger)}><span className={includeHunger ? 'export-check checked' : 'export-check'}>{includeHunger ? '✓' : ''}</span><span><strong>Голод и настроение</strong><small>Дополнительные поля записи</small></span></button>
        </div>
      </div>
      <div className="export-preview">
        <h2>Предварительный просмотр</h2>
        <div><span>Формат</span><strong>{exportFormat}</strong></div>
        <div><span>Период</span><strong>{exportPeriod === 'Произвольный период' ? `${exportFrom} — ${exportTo}` : exportPeriod}</strong></div>
        <div><span>Записей для экспорта</span><strong>{exportEntries.length}</strong></div>
        <p>В файл попадут записи за выбранный период и только отмеченные дополнительные поля.</p>
      </div>
      <div className="export-buttons">
        <button className="export-button" onClick={exportFormat === 'CSV (.csv)' ? exportCsv : () => void exportExcel()} disabled={exportEntries.length === 0}>Экспортировать {exportFormat === 'CSV (.csv)' ? 'CSV' : 'Excel'}-файл</button>
        {canShareExport && <button className="export-button secondary" onClick={() => void shareExport()} disabled={exportEntries.length === 0}>Поделиться</button>}
      </div>
      <p className="export-note">{exportEntries.length === 0 ? 'За выбранный период записей нет.' : exportFormat === 'CSV (.csv)' ? 'Файл CSV сохранится на устройство. Его можно открыть в Excel. Для Google Таблиц на телефоне лучше выбрать формат Excel.' : 'Файл Excel сохранится на устройство. Его можно открыть в Excel или Google Таблицах. Поделиться (например, отправить в Google Диск) можно файлом CSV.'}</p>
    </section>
  );
}
