import { useState } from 'react';

// Choices on the analytics page. Kept in App so they survive leaving the page.
export function useAnalyticsSettings() {
  const [analyticsPeriod, setAnalyticsPeriod] = useState<'Месяц' | 'Произвольный период'>('Месяц');
  const [showAllAnalyticsCategories, setShowAllAnalyticsCategories] = useState(false);
  const [analyticsFrom, setAnalyticsFrom] = useState(() => { const d = new Date(); d.setDate(1); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-01`; });
  const [analyticsTo, setAnalyticsTo] = useState(() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; });
  return {
    analyticsPeriod, setAnalyticsPeriod, showAllAnalyticsCategories, setShowAllAnalyticsCategories,
    analyticsFrom, setAnalyticsFrom, analyticsTo, setAnalyticsTo,
  };
}

export type AnalyticsSettings = ReturnType<typeof useAnalyticsSettings>;
