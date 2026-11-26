import { useState } from 'react';
import { monthStartKey, todayKey } from './format';

export type ExportFormat = 'Excel (.xlsx)' | 'CSV (.csv)';

// Choices on the export page. Kept in App so they survive leaving the page.
export function useExportSettings() {
  const [exportFormat, setExportFormat] = useState<'Excel (.xlsx)' | 'CSV (.csv)'>('CSV (.csv)');
  const [exportPeriod, setExportPeriod] = useState('Все записи');
  const [exportFrom, setExportFrom] = useState(monthStartKey);
  const [exportTo, setExportTo] = useState(todayKey);
  const [includeTags, setIncludeTags] = useState(true);
  const [includeCarbs, setIncludeCarbs] = useState(true);
  const [includeHunger, setIncludeHunger] = useState(true);
  return {
    exportFormat, setExportFormat, exportPeriod, setExportPeriod, exportFrom, setExportFrom, exportTo, setExportTo,
    includeTags, setIncludeTags, includeCarbs, setIncludeCarbs, includeHunger, setIncludeHunger,
  };
}

export type ExportSettings = ReturnType<typeof useExportSettings>;
