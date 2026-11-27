import { useState } from 'react';
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
    includeTags, setIncludeTags, includeCarbs, setIncludeCarbs, includeHunger, setIncludeHunger, includeWeight, setIncludeWeight,
  } = settings;
  const [kindsOpen, setKindsOpen] = useState(false);

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
    if (includeWeight) headers.push('Вес тела (кг)');
    const rows = exportEntries.map((entry) => {
      const row: (string | number)[] = [entry.date, entry.time, entry.food];
      if (includeTags) row.push(entry.tags.join(', '), entry.activity.join(', '));
      if (includeCarbs) row.push(entry.carbs ?? '', entry.comment || '');
      if (includeHunger) row.push(entry.hunger ?? '', entry.mood || '');
      if (includeWeight) row.push(entry.weight ?? '');
      return row;
    });
    return [headers, ...rows];
  };

  const getExportFileDate = () => exportDateKey(new Date());

  const buildCsvBlob = () => {
    const escapeCell = (value: string | number) => {
      // Numbers use a decimal comma, as Russian Excel expects in CSV files.
      const cell = typeof value === 'number' ? String(value).replace('.', ',') : String(value);
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

  const dataKinds = [
    { label: 'Дата и время', hint: 'Обязательно для каждой записи', required: true },
    { label: 'Описание еды', hint: 'Текст и порция', required: true },
    { label: 'Теги и активность', hint: 'Категории и выбранные отметки', checked: includeTags, toggle: () => setIncludeTags(!includeTags) },
    { label: 'Углеводы и комментарии', hint: 'Количество углеводов и заметки', checked: includeCarbs, toggle: () => setIncludeCarbs(!includeCarbs) },
    { label: 'Голод и настроение', hint: 'Дополнительные поля записи', checked: includeHunger, toggle: () => setIncludeHunger(!includeHunger) },
    { label: 'Вес тела', hint: 'Если он указан в записи', checked: includeWeight, toggle: () => setIncludeWeight(!includeWeight) },
  ];
  const chosenKinds = dataKinds.filter((kind) => kind.required || kind.checked).length;

  return (
    <section className="settings-page export-page">
      <div className="export-section export-row">
        <h2>Формат файла</h2>
        <div className="export-segmented" role="group" aria-label="Формат файла">
          {(['Excel (.xlsx)', 'CSV (.csv)'] as const).map((format) => (
            <button key={format} className={exportFormat === format ? 'active' : ''} aria-pressed={exportFormat === format} onClick={() => setExportFormat(format)}>
              {format === 'CSV (.csv)' ? 'CSV' : 'Excel'}
            </button>
          ))}
        </div>
      </div>
      <div className="export-section">
        <div className="export-row">
          <h2>Период</h2>
          <select className="export-select" value={exportPeriod} onChange={(event) => setExportPeriod(event.target.value)} aria-label="Период">
            {['Все записи', 'Текущий месяц', 'Последние 7 дней', 'Произвольный период'].map((item) => <option key={item}>{item}</option>)}
          </select>
        </div>
        {exportPeriod === 'Произвольный период' && (
          <div className="date-range export-date-range">
            <label>С даты<input type="date" value={exportFrom} onChange={(event) => setExportFrom(event.target.value)} /></label>
            <label>По дату<input type="date" value={exportTo} onChange={(event) => setExportTo(event.target.value)} /></label>
          </div>
        )}
      </div>
      <div className="export-section">
        <div className="export-row">
          <h2>Какие данные включить</h2>
          <button type="button" className="export-dropdown" aria-expanded={kindsOpen} onClick={() => setKindsOpen((open) => !open)}>
            <span>Виды данных: {chosenKinds}/{dataKinds.length}</span><span aria-hidden="true">{kindsOpen ? '⌃' : '⌄'}</span>
          </button>
        </div>
        {kindsOpen && (
          <div className="export-includes">
            {dataKinds.map((kind) => kind.required ? (
              <div className="export-included required" key={kind.label}><span className="export-check">✓</span><span><strong>{kind.label}</strong><small>{kind.hint}</small></span><em>Обязательно</em></div>
            ) : (
              <button className="export-included" key={kind.label} onClick={kind.toggle}><span className={kind.checked ? 'export-check checked' : 'export-check'}>{kind.checked ? '✓' : ''}</span><span><strong>{kind.label}</strong><small>{kind.hint}</small></span></button>
            ))}
          </div>
        )}
      </div>
      <p className="export-summary">Записей для экспорта: <strong>{exportEntries.length}</strong></p>
      <div className={canShareExport ? 'export-buttons two' : 'export-buttons'}>
        <button className="export-button" onClick={exportFormat === 'CSV (.csv)' ? exportCsv : () => void exportExcel()} disabled={exportEntries.length === 0}>Экспортировать</button>
        {canShareExport && <button className="export-button secondary" onClick={() => void shareExport()} disabled={exportEntries.length === 0}>Поделиться</button>}
      </div>
      <p className="page-note">{exportEntries.length === 0 ? 'За выбранный период записей нет.' : exportFormat === 'CSV (.csv)' ? 'Файл CSV сохранится на устройство. Его можно открыть в Excel. Для Google Таблиц на телефоне лучше выбрать формат Excel.' : 'Файл Excel сохранится на устройство. Его можно открыть в Excel или Google Таблицах. Поделиться (например, отправить в Google Диск) можно файлом CSV.'}</p>
    </section>
  );
}
